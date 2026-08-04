import { Router, Request, Response, NextFunction } from "express";
import { getDriver } from "../database/neo4j";
import { normalizeGraph, normalizeProperties } from "../utils/graph";
import { AppError } from "../middleware/error";

const router = Router();

// GET /api/suppliers
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const driver = getDriver();
  const session = driver.session();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(`MATCH (s:Supplier) RETURN s ORDER BY s.name`)
    );
    const suppliers = result.records.map((r) => normalizeProperties(r.get("s").properties));
    res.json({ data: suppliers, error: null });
  } catch (error) {
    next(error);
  } finally {
    await session.close();
  }
});

// GET /api/suppliers/:supplierId
router.get("/:supplierId", async (req: Request, res: Response, next: NextFunction) => {
  const { supplierId } = req.params;
  const driver = getDriver();
  const session = driver.session();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(`MATCH (s:Supplier {id: $supplierId}) RETURN s`, { supplierId })
    );

    if (result.records.length === 0) {
      return next(new AppError("Supplier not found", 404, "NOT_FOUND"));
    }

    res.json({ data: normalizeProperties(result.records[0].get("s").properties), error: null });
  } catch (error) {
    next(error);
  } finally {
    await session.close();
  }
});

// GET /api/suppliers/:supplierId/impact
router.get("/:supplierId/impact", async (req: Request, res: Response, next: NextFunction) => {
  const { supplierId } = req.params;
  const driver = getDriver();
  const session = driver.session();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(`
        MATCH path = (s:Supplier {id: $supplierId})-[:SUPPLIES|DEPENDS_ON|REQUIRES*1..4]-(p:Product)
        RETURN path, p
        LIMIT 500
      `, { supplierId })
    );

    const affectedProducts = Array.from(new Set(
      result.records.map(r => normalizeProperties(r.get("p").properties))
    )).filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i);

    res.json({ 
      data: {
        affectedProducts,
        graph: normalizeGraph(result.records)
      }, 
      error: null 
    });
  } catch (error) {
    next(error);
  } finally {
    await session.close();
  }
});

// GET /api/suppliers/:supplierId/alternatives?componentId=...
router.get("/:supplierId/alternatives", async (req: Request, res: Response, next: NextFunction) => {
  const { supplierId } = req.params;
  const { componentId } = req.query;

  const driver = getDriver();
  const session = driver.session();
  try {
    let query = `
      MATCH (s:Supplier {id: $supplierId})-[:ALTERNATIVE_TO]->(alt:Supplier)
      RETURN alt, 100 AS score
    `;
    let params: any = { supplierId };

    if (componentId) {
      query = `
        MATCH (alt:Supplier)-[sup:SUPPLIES]->(c:Component {id: $componentId})
        WHERE alt.id <> $supplierId
        OPTIONAL MATCH (s:Supplier {id: $supplierId})-[altRel:ALTERNATIVE_TO]->(alt)
        
        WITH alt, sup, altRel,
             CASE WHEN altRel IS NOT NULL THEN altRel.compatibilityScore ELSE 50 END AS compScore,
             (100 - alt.riskScore) AS relScore
             
        RETURN alt, (compScore * 0.6 + relScore * 0.4) AS score
        ORDER BY score DESC
      `;
      params.componentId = componentId;
    }

    const result = await session.executeRead((tx) => tx.run(query, params));

    const alternatives = result.records.map((r) => ({
      ...normalizeProperties(r.get("alt").properties),
      recommendationScore: r.get("score")
    }));

    res.json({ data: alternatives, error: null });
  } catch (error) {
    next(error);
  } finally {
    await session.close();
  }
});

export default router;
