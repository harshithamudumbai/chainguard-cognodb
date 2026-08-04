import { Router, Request, Response, NextFunction } from "express";
import { getDriver } from "../database/neo4j";
import { normalizeGraph, normalizeProperties } from "../utils/graph";
import { AppError } from "../middleware/error";

const router = Router();

// GET /api/risks
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const driver = getDriver();
  const session = driver.session();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(`MATCH (r:RiskEvent) RETURN r ORDER BY r.status, r.severity DESC`)
    );
    const risks = result.records.map((r) => normalizeProperties(r.get("r").properties));
    res.json({ data: risks, error: null });
  } catch (error) {
    next(error);
  } finally {
    await session.close();
  }
});

// GET /api/risks/:riskId
router.get("/:riskId", async (req: Request, res: Response, next: NextFunction) => {
  const { riskId } = req.params;
  const driver = getDriver();
  const session = driver.session();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(`MATCH (r:RiskEvent {id: $riskId}) RETURN r`, { riskId })
    );

    if (result.records.length === 0) {
      return next(new AppError("Risk not found", 404, "NOT_FOUND"));
    }

    res.json({ data: normalizeProperties(result.records[0].get("r").properties), error: null });
  } catch (error) {
    next(error);
  } finally {
    await session.close();
  }
});

// GET /api/risks/:riskId/impact
router.get("/:riskId/impact", async (req: Request, res: Response, next: NextFunction) => {
  const { riskId } = req.params;
  const driver = getDriver();
  const session = driver.session();
  try {
    // Multi-hop path finding to products
    const result = await session.executeRead((tx) =>
      tx.run(`
        MATCH path = (r:RiskEvent {id: $riskId})-[:AFFECTS]->(affected)-[:OPERATES|HEADQUARTERED_IN|LOCATED_IN|SUPPLIES|DEPENDS_ON|REQUIRES*1..5]-(p:Product)
        RETURN path, p
        LIMIT 500
      `, { riskId })
    );
    
    const affectedProducts = Array.from(new Set(
      result.records.map(r => normalizeProperties(r.get("p").properties))
    )).filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i); // Unique products

    const graph = normalizeGraph(result.records);

    res.json({ 
      data: {
        affectedProducts,
        graph
      }, 
      error: null 
    });
  } catch (error) {
    next(error);
  } finally {
    await session.close();
  }
});

export default router;
