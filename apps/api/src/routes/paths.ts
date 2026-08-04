import { Router, Request, Response, NextFunction } from "express";
import { getDriver } from "../database/neo4j";
import { normalizeGraph } from "../utils/graph";
import { AppError } from "../middleware/error";

const router = Router();

// GET /api/paths/product-to-risk?productId=...&riskId=...
router.get("/product-to-risk", async (req: Request, res: Response, next: NextFunction) => {
  const { productId, riskId } = req.query;
  
  if (!productId || !riskId || typeof productId !== 'string' || typeof riskId !== 'string') {
    return next(new AppError("productId and riskId are required", 400, "VALIDATION_ERROR"));
  }

  const driver = getDriver();
  const session = driver.session();
  try {
    // We use shortestPath bounded by 6 hops to avoid uncontrolled traversal
    const result = await session.executeRead((tx) =>
      tx.run(`
        MATCH path = shortestPath((p:Product {id: $productId})-[:REQUIRES|SUPPLIES|OPERATES|LOCATED_IN|HEADQUARTERED_IN|AFFECTS|DEPENDS_ON*1..6]-(r:RiskEvent {id: $riskId}))
        RETURN path
      `, { productId, riskId })
    );

    if (result.records.length === 0) {
      res.json({ data: { nodes: [], edges: [] }, error: null });
    } else {
      res.json({ data: normalizeGraph(result.records), error: null });
    }
  } catch (error) {
    next(error);
  } finally {
    await session.close();
  }
});

export default router;
