import { Router, Request, Response, NextFunction } from "express";
import { getDriver } from "../database/neo4j";
import { normalizeGraph, normalizeProperties } from "../utils/graph";
import { AppError } from "../middleware/error";

const router = Router();

// GET /api/products
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const driver = getDriver();
  const session = driver.session();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(`
        MATCH (p:Product)
        RETURN p
        ORDER BY p.name
      `)
    );

    const products = result.records.map((r) => normalizeProperties(r.get("p").properties));
    res.json({ data: products, error: null });
  } catch (error) {
    next(error);
  } finally {
    await session.close();
  }
});

// GET /api/products/compare?firstProductId=...&secondProductId=...
router.get("/compare", async (req: Request, res: Response, next: NextFunction) => {
  const { firstProductId, secondProductId } = req.query;
  if (!firstProductId || !secondProductId || typeof firstProductId !== 'string' || typeof secondProductId !== 'string') {
    return next(new AppError("firstProductId and secondProductId are required", 400, "VALIDATION_ERROR"));
  }

  const driver = getDriver();
  const session = driver.session();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(`
        MATCH (p1:Product {id: $firstProductId})-[:REQUIRES|SUPPLIES|OPERATES|LOCATED_IN*1..4]-(shared)-[:REQUIRES|SUPPLIES|OPERATES|LOCATED_IN*1..4]-(p2:Product {id: $secondProductId})
        WHERE p1 <> p2 AND NOT shared:Product
        RETURN DISTINCT shared
      `, { firstProductId, secondProductId })
    );

    const sharedEntities = result.records.map((r) => {
      const node = r.get("shared");
      return {
        id: node.properties.id || node.properties.code,
        label: node.labels[0],
        name: node.properties.name,
      }
    });
    
    // Also return the graph of these shared dependencies
    const graphResult = await session.executeRead((tx) =>
      tx.run(`
        MATCH path = (p1:Product {id: $firstProductId})-[:REQUIRES|SUPPLIES|OPERATES|LOCATED_IN*1..4]-(shared)-[:REQUIRES|SUPPLIES|OPERATES|LOCATED_IN*1..4]-(p2:Product {id: $secondProductId})
        WHERE p1 <> p2 AND NOT shared:Product
        RETURN path
      `, { firstProductId, secondProductId })
    );

    res.json({ data: { sharedEntities, graph: normalizeGraph(graphResult.records) }, error: null });
  } catch (error) {
    next(error);
  } finally {
    await session.close();
  }
});

// GET /api/products/:productId
router.get("/:productId", async (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  const driver = getDriver();
  const session = driver.session();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(`
        MATCH (p:Product {id: $productId})
        RETURN p
      `, { productId })
    );

    if (result.records.length === 0) {
      return next(new AppError("Product not found", 404, "NOT_FOUND"));
    }

    res.json({ data: normalizeProperties(result.records[0].get("p").properties), error: null });
  } catch (error) {
    next(error);
  } finally {
    await session.close();
  }
});

// GET /api/products/:productId/network
router.get("/:productId/network", async (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  const hops = parseInt(req.query.hops as string) || 3;
  const maxHops = Math.min(Math.max(hops, 1), 4); // Bound to 1-4

  const driver = getDriver();
  const session = driver.session();
  try {
    // Parameterized dynamic relationship matching is tricky in vanilla Cypher without APOC,
    // so we construct the variable length path string safely.
    const result = await session.executeRead((tx) =>
      tx.run(`
        MATCH path = (p:Product {id: $productId})-[:REQUIRES|SUPPLIES|OPERATES|LOCATED_IN|HEADQUARTERED_IN|DEPENDS_ON*1..${maxHops}]-(connected)
        RETURN path
        LIMIT 500
      `, { productId })
    );

    res.json({ data: normalizeGraph(result.records), error: null });
  } catch (error) {
    next(error);
  } finally {
    await session.close();
  }
});

export default router;
