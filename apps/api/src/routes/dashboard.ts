import { Router, Request, Response, NextFunction } from "express";
import { getDriver } from "../database/neo4j";

const router = Router();

// GET /api/dashboard/summary
router.get("/summary", async (req: Request, res: Response, next: NextFunction) => {
  const driver = getDriver();
  const session = driver.session();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(`
        MATCH (p:Product) WITH count(p) AS products
        MATCH (c:Component) WITH products, count(c) AS components
        MATCH (s:Supplier) WITH products, components, count(s) AS suppliers
        MATCH (f:Facility) WITH products, components, suppliers, count(f) AS facilities
        MATCH (r:RiskEvent {status: "ACTIVE"}) WITH products, components, suppliers, facilities, count(r) AS activeRisks
        RETURN products, components, suppliers, facilities, activeRisks
      `)
    );

    const record = result.records[0];
    res.json({
      data: {
        products: record.get("products").toNumber(),
        components: record.get("components").toNumber(),
        suppliers: record.get("suppliers").toNumber(),
        facilities: record.get("facilities").toNumber(),
        activeRisks: record.get("activeRisks").toNumber(),
      },
      error: null,
    });
  } catch (error) {
    next(error);
  } finally {
    await session.close();
  }
});

// GET /api/dashboard/high-impact-suppliers
router.get("/high-impact-suppliers", async (req: Request, res: Response, next: NextFunction) => {
  const driver = getDriver();
  const session = driver.session();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(`
        MATCH (s:Supplier)-[:SUPPLIES]->(c:Component)<-[:REQUIRES]-(p:Product)
        WITH s, count(DISTINCT p) AS affectedProducts, sum(p.annualRevenueImpact) AS totalRevenueExposure
        ORDER BY affectedProducts DESC, totalRevenueExposure DESC
        LIMIT 5
        RETURN s.id AS id, s.name AS name, s.riskScore AS riskScore, affectedProducts, totalRevenueExposure
      `)
    );

    const suppliers = result.records.map((r) => ({
      id: r.get("id"),
      name: r.get("name"),
      riskScore: r.get("riskScore").toNumber ? r.get("riskScore").toNumber() : Number(r.get("riskScore")),
      affectedProducts: r.get("affectedProducts").toNumber ? r.get("affectedProducts").toNumber() : Number(r.get("affectedProducts")),
      totalRevenueExposure: r.get("totalRevenueExposure").toNumber ? r.get("totalRevenueExposure").toNumber() : Number(r.get("totalRevenueExposure")),
    }));

    res.json({ data: suppliers, error: null });
  } catch (error) {
    next(error);
  } finally {
    await session.close();
  }
});

// GET /api/dashboard/single-points-of-failure
router.get("/single-points-of-failure", async (req: Request, res: Response, next: NextFunction) => {
  const driver = getDriver();
  const session = driver.session();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(`
        MATCH (c:Component)<-[:SUPPLIES]-(s:Supplier)
        WITH c, count(s) AS supplierCount, collect(s) AS suppliers
        WHERE supplierCount = 1
        WITH c, suppliers[0] AS soleSupplier
        MATCH (c)<-[:REQUIRES]-(p:Product)
        WITH c, soleSupplier, count(p) AS dependentProducts, collect(p.name) AS productNames, sum(p.annualRevenueImpact) AS aggregateRevenueImpact
        ORDER BY aggregateRevenueImpact DESC
        LIMIT 5
        RETURN 
          c.id AS componentId, c.name AS componentName, 
          soleSupplier.name AS supplierName, 
          dependentProducts, productNames, aggregateRevenueImpact
      `)
    );

    const data = result.records.map((r) => ({
      componentId: r.get("componentId"),
      componentName: r.get("componentName"),
      supplierName: r.get("supplierName"),
      dependentProducts: r.get("dependentProducts").toNumber ? r.get("dependentProducts").toNumber() : Number(r.get("dependentProducts")),
      productNames: r.get("productNames"),
      aggregateRevenueImpact: r.get("aggregateRevenueImpact").toNumber ? r.get("aggregateRevenueImpact").toNumber() : Number(r.get("aggregateRevenueImpact")),
    }));

    res.json({ data, error: null });
  } catch (error) {
    next(error);
  } finally {
    await session.close();
  }
});

export default router;
