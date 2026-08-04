import { getDriver, closeDriver } from '../src/database/neo4j';
import { config } from '../src/config';

async function verifyDatabase() {
  console.log(`Verifying database against: ${config.COGNODB_URI}`);
  const driver = getDriver();
  const session = driver.session();

  try {
    const checks = [
      // 1. Node Labels
      { name: 'Node labels (Product)', query: `MATCH (n:Product) RETURN count(n) AS c`, expectGt: 0 },
      { name: 'Node labels (Component)', query: `MATCH (n:Component) RETURN count(n) AS c`, expectGt: 0 },
      { name: 'Node labels (Supplier)', query: `MATCH (n:Supplier) RETURN count(n) AS c`, expectGt: 0 },
      { name: 'Node labels (Facility)', query: `MATCH (n:Facility) RETURN count(n) AS c`, expectGt: 0 },
      { name: 'Node labels (Country)', query: `MATCH (n:Country) RETURN count(n) AS c`, expectGt: 0 },
      { name: 'Node labels (RiskEvent)', query: `MATCH (n:RiskEvent) RETURN count(n) AS c`, expectGt: 0 },

      // 2. Relationship Types
      { name: 'Relationship types (REQUIRES)', query: `MATCH ()-[r:REQUIRES]->() RETURN count(r) AS c`, expectGt: 0 },
      { name: 'Relationship types (SUPPLIES)', query: `MATCH ()-[r:SUPPLIES]->() RETURN count(r) AS c`, expectGt: 0 },
      { name: 'Relationship types (OPERATES)', query: `MATCH ()-[r:OPERATES]->() RETURN count(r) AS c`, expectGt: 0 },
      { name: 'Relationship types (LOCATED_IN)', query: `MATCH ()-[r:LOCATED_IN]->() RETURN count(r) AS c`, expectGt: 0 },
      { name: 'Relationship types (HEADQUARTERED_IN)', query: `MATCH ()-[r:HEADQUARTERED_IN]->() RETURN count(r) AS c`, expectGt: 0 },
      { name: 'Relationship types (AFFECTS)', query: `MATCH ()-[r:AFFECTS]->() RETURN count(r) AS c`, expectGt: 0 },
      { name: 'Relationship types (ALTERNATIVE_TO)', query: `MATCH ()-[r:ALTERNATIVE_TO]->() RETURN count(r) AS c`, expectGt: 0 },
      { name: 'Relationship types (DEPENDS_ON)', query: `MATCH ()-[r:DEPENDS_ON]->() RETURN count(r) AS c`, expectGt: 0 },

      // 3. Integrity
      { name: 'Integrity (No missing IDs)', query: `MATCH (n) WHERE n.id IS NULL AND NOT n:Country RETURN count(n) AS c`, expectEq: 0 },
      { name: 'Integrity (No duplicate IDs per label)', query: `MATCH (n) WHERE n.id IS NOT NULL WITH labels(n) AS lbl, n.id AS id, count(*) AS cnt WHERE cnt > 1 RETURN count(id) AS c`, expectEq: 0 },
      { name: 'Integrity (Every product requires a component)', query: `MATCH (p:Product) OPTIONAL MATCH (p)-[r:REQUIRES]->(:Component) WITH p, count(r) AS rc WHERE rc = 0 RETURN count(p) AS c`, expectEq: 0 },
      { name: 'Integrity (Every component has a supplier)', query: `MATCH (c:Component) OPTIONAL MATCH (:Supplier)-[r:SUPPLIES]->(c) WITH c, count(r) AS rc WHERE rc = 0 RETURN count(c) AS c`, expectEq: 0 },
      { name: 'Integrity (Every facility is located in a country)', query: `MATCH (f:Facility) OPTIONAL MATCH (f)-[r:LOCATED_IN]->(:Country) WITH f, count(r) AS rc WHERE rc = 0 RETURN count(f) AS c`, expectEq: 0 },
      { name: 'Integrity (Active risks exist)', query: `MATCH (r:RiskEvent {status: 'ACTIVE'}) RETURN count(r) AS c`, expectGt: 0 },
      
      // 4. Demonstration Scenarios
      { name: 'Demo (Single-source component)', query: `MATCH (c:Component)<-[:SUPPLIES]-(s:Supplier) WITH c, count(s) AS numSuppliers WHERE numSuppliers = 1 RETURN count(c) AS c`, expectGt: 0 },
      { name: 'Demo (Multi-source component)', query: `MATCH (c:Component)<-[:SUPPLIES]-(s:Supplier) WITH c, count(s) AS numSuppliers WHERE numSuppliers > 1 RETURN count(c) AS c`, expectGt: 0 },
      { name: 'Demo (Three-hop or deeper path)', query: `MATCH p=()-[*3..]->() RETURN count(p) AS c`, expectGt: 0 },
      { name: 'Demo (Supplier-to-supplier dependency)', query: `MATCH (s1:Supplier)-[:DEPENDS_ON]->(s2:Supplier) RETURN count(s1) AS c`, expectGt: 0 },
      { name: 'Demo (Affected supplier with alternative)', query: `MATCH (r:RiskEvent)-[:AFFECTS]->(:Facility)<-[:OPERATES]-(s:Supplier)-[:SUPPLIES]->(c:Component), (alt:Supplier)-[:SUPPLIES]->(c) WHERE s <> alt RETURN count(DISTINCT s) AS c`, expectGt: 0 },
      { name: 'Demo (Affected supplier without alternative)', query: `MATCH (r:RiskEvent)-[:AFFECTS]->(:Facility)<-[:OPERATES]-(s:Supplier)-[:SUPPLIES]->(c:Component) OPTIONAL MATCH (s2:Supplier)-[:SUPPLIES]->(c) WHERE s2 <> s WITH s, count(s2) AS alts WHERE alts = 0 RETURN count(DISTINCT s) AS c`, expectGt: 0 },
      { name: 'Demo (Two products with shared hidden dependency)', query: `MATCH (p1:Product)-[:REQUIRES]->(c:Component)<-[:REQUIRES]-(p2:Product) WHERE p1 <> p2 RETURN count(DISTINCT c) AS c`, expectGt: 0 },
      { name: 'Demo (Country- or facility-level risk propagation path)', query: `MATCH p=(r:RiskEvent)-[:AFFECTS]->(target)<-[:LOCATED_IN|OPERATES]-(s:Supplier)-[:SUPPLIES]->(:Component)<-[:REQUIRES]-(prod:Product) WHERE target:Country OR target:Facility RETURN count(p) AS c`, expectGt: 0 },
    ];

    let allPassed = true;

    for (const check of checks) {
      const result = await session.run(check.query);
      const actualCount = result.records[0].get('c').toNumber();
      
      let passed = false;
      let expectedCondition = '';
      if (check.expectEq !== undefined) {
        passed = actualCount === check.expectEq;
        expectedCondition = `count == ${check.expectEq}`;
      } else if (check.expectGt !== undefined) {
        passed = actualCount > check.expectGt;
        expectedCondition = `count > ${check.expectGt}`;
      }

      if (passed) {
        console.log(`PASS | ${check.name} | actual: ${actualCount} | expected: ${expectedCondition}`);
      } else {
        console.log(`FAIL | ${check.name} | actual: ${actualCount} | expected: ${expectedCondition}`);
        allPassed = false;
      }
    }

    if (!allPassed) {
      console.error('\n❌ Database verification failed.');
      process.exit(1);
    } else {
      console.log('\n✅ All database verification checks passed successfully!');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error during database verification:', error);
    process.exit(1);
  } finally {
    await session.close();
    await closeDriver();
  }
}

verifyDatabase();
