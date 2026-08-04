"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const neo4j_1 = require("../src/database/neo4j");
const config_1 = require("../src/config");
async function verifyDatabase() {
    console.log(`Verifying database against: ${config_1.env.NEO4J_URI}`);
    const driver = (0, neo4j_1.getDriver)();
    const session = driver.session();
    try {
        const checks = [
            {
                name: 'Node counts',
                query: `
          MATCH (p:Product)
          MATCH (c:Component)
          MATCH (s:Supplier)
          MATCH (f:Facility)
          MATCH (co:Country)
          OPTIONAL MATCH (r:RiskEvent)
          RETURN count(DISTINCT p) > 0 AS products_exist,
                 count(DISTINCT c) > 0 AS components_exist,
                 count(DISTINCT s) > 0 AS suppliers_exist,
                 count(DISTINCT f) > 0 AS facilities_exist,
                 count(DISTINCT co) > 0 AS countries_exist,
                 count(DISTINCT r) > 0 AS risks_exist
        `
            },
            {
                name: 'Data Quality - Missing IDs',
                query: `
          MATCH (n) WHERE n.id IS NULL AND NOT n:Country
          RETURN count(n) = 0 AS no_missing_ids
        `
            },
            {
                name: 'Data Quality - Product has Component',
                query: `
          MATCH (p:Product)
          WHERE NOT (p)-[:REQUIRES]->(:Component)
          RETURN count(p) = 0 AS all_products_have_components
        `
            },
            {
                name: 'Data Quality - Active Risk exists',
                query: `
          MATCH (r:RiskEvent {status: 'ACTIVE'})
          RETURN count(r) > 0 AS active_risk_exists
        `
            },
            {
                name: 'Data Quality - Shared Dependency',
                query: `
          MATCH (p1:Product)-[:REQUIRES]->(c:Component)<-[:REQUIRES]-(p2:Product)
          WHERE p1 <> p2
          RETURN count(DISTINCT c) > 0 AS shared_component_exists
        `
            },
            {
                name: 'Data Quality - Single Source Component',
                query: `
          MATCH (c:Component)-[:SUPPLIES]-(s:Supplier)
          WITH c, count(s) as supplierCount
          WHERE supplierCount = 1
          RETURN count(c) > 0 AS single_source_exists
        `
            }
        ];
        let allPassed = true;
        for (const check of checks) {
            console.log(`Running check: ${check.name}...`);
            const result = await session.run(check.query);
            const record = result.records[0];
            let checkPassed = true;
            if (record) {
                record.keys.forEach(key => {
                    const value = record.get(key);
                    if (!value) {
                        checkPassed = false;
                        console.error(`  ❌ Failed condition: ${key}`);
                    }
                });
            }
            else {
                checkPassed = false;
            }
            if (checkPassed) {
                console.log(`  ✅ Passed`);
            }
            else {
                allPassed = false;
            }
        }
        if (!allPassed) {
            console.error('\n❌ Database verification failed.');
            process.exit(1);
        }
        else {
            console.log('\n✅ All database verification checks passed successfully!');
        }
    }
    catch (error) {
        console.error('Error during database verification:', error);
        process.exit(1);
    }
    finally {
        await session.close();
        await (0, neo4j_1.closeDriver)();
    }
}
verifyDatabase();
