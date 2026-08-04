import { getDriver, closeDriver } from "../src/database/neo4j";
import pino from "pino";

const logger = pino({ name: "seed" });

const runSeed = async () => {
  const driver = getDriver();
  const session = driver.session();

  try {
    logger.info("Running database seed...");

    // Create constraints
    await session.executeWrite((tx) =>
      tx.run(`CREATE CONSTRAINT product_id_unique IF NOT EXISTS FOR (p:Product) REQUIRE p.id IS UNIQUE;`)
    );
    await session.executeWrite((tx) =>
      tx.run(`CREATE CONSTRAINT component_id_unique IF NOT EXISTS FOR (c:Component) REQUIRE c.id IS UNIQUE;`)
    );
    await session.executeWrite((tx) =>
      tx.run(`CREATE CONSTRAINT supplier_id_unique IF NOT EXISTS FOR (s:Supplier) REQUIRE s.id IS UNIQUE;`)
    );
    await session.executeWrite((tx) =>
      tx.run(`CREATE CONSTRAINT facility_id_unique IF NOT EXISTS FOR (f:Facility) REQUIRE f.id IS UNIQUE;`)
    );
    await session.executeWrite((tx) =>
      tx.run(`CREATE CONSTRAINT country_code_unique IF NOT EXISTS FOR (c:Country) REQUIRE c.code IS UNIQUE;`)
    );
    await session.executeWrite((tx) =>
      tx.run(`CREATE CONSTRAINT risk_event_id_unique IF NOT EXISTS FOR (r:RiskEvent) REQUIRE r.id IS UNIQUE;`)
    );

    logger.info("Constraints created.");

    // Clear existing application data (only nodes with our labels to avoid destroying everything)
    await session.executeWrite((tx) =>
      tx.run(`MATCH (n) WHERE n:Product OR n:Component OR n:Supplier OR n:Facility OR n:Country OR n:RiskEvent DETACH DELETE n;`)
    );
    logger.info("Cleared old seed data.");

    // Define seed data sets
    const products = [
      { id: "p1", name: "Smartphone X", category: "Consumer Electronics", criticality: "HIGH", annualRevenueImpact: 85000000 },
      { id: "p2", name: "Tablet Y", category: "Consumer Electronics", criticality: "MEDIUM", annualRevenueImpact: 45000000 },
      { id: "p3", name: "Smartwatch Z", category: "Wearables", criticality: "LOW", annualRevenueImpact: 15000000 },
      { id: "p4", name: "Laptop Pro", category: "Computing", criticality: "HIGH", annualRevenueImpact: 120000000 },
      { id: "p5", name: "Home Router", category: "Networking", criticality: "MEDIUM", annualRevenueImpact: 20000000 },
      { id: "p6", name: "Server Rack Alpha", category: "Enterprise", criticality: "HIGH", annualRevenueImpact: 200000000 },
      { id: "p7", name: "Smart TV 4K", category: "Home Entertainment", criticality: "MEDIUM", annualRevenueImpact: 60000000 },
      { id: "p8", name: "Wireless Earbuds", category: "Wearables", criticality: "LOW", annualRevenueImpact: 35000000 },
    ];

    const components = [
      { id: "c1", name: "OLED Display 6in", category: "Display", criticality: "HIGH", leadTimeDays: 45 },
      { id: "c2", name: "OLED Display 11in", category: "Display", criticality: "HIGH", leadTimeDays: 45 },
      { id: "c3", name: "Lithium Battery 4000mAh", category: "Power", criticality: "HIGH", leadTimeDays: 30 },
      { id: "c4", name: "Camera Sensor 12MP", category: "Optics", criticality: "MEDIUM", leadTimeDays: 60 },
      { id: "c5", name: "Control Chip A1", category: "Silicon", criticality: "HIGH", leadTimeDays: 90 },
      { id: "c6", name: "Memory Module 8GB", category: "Silicon", criticality: "MEDIUM", leadTimeDays: 20 },
      { id: "c7", name: "Charging Controller", category: "Power", criticality: "MEDIUM", leadTimeDays: 15 },
      { id: "c8", name: "Network Interface Card", category: "Networking", criticality: "HIGH", leadTimeDays: 35 },
      { id: "c9", name: "Cooling Fan Assembly", category: "Cooling", criticality: "LOW", leadTimeDays: 10 },
      { id: "c10", name: "Power Supply 1000W", category: "Power", criticality: "HIGH", leadTimeDays: 40 },
    ];

    const suppliers = [
      { id: "s1", name: "Global Display Corp", tier: 1, reliabilityScore: 92, riskScore: 15, countryCode: "KR" },
      { id: "s2", name: "Advanced Silicon Fab", tier: 1, reliabilityScore: 98, riskScore: 5, countryCode: "TW" },
      { id: "s3", name: "EnergyCell Industries", tier: 2, reliabilityScore: 85, riskScore: 40, countryCode: "CN" },
      { id: "s4", name: "OpticLens Tech", tier: 1, reliabilityScore: 90, riskScore: 20, countryCode: "JP" },
      { id: "s5", name: "FastMem Semiconductor", tier: 2, reliabilityScore: 88, riskScore: 25, countryCode: "US" },
      { id: "s6", name: "NetConnect Solutions", tier: 1, reliabilityScore: 95, riskScore: 10, countryCode: "SG" },
      { id: "s7", name: "ThermoCool Systems", tier: 3, reliabilityScore: 91, riskScore: 30, countryCode: "MY" },
      { id: "s8", name: "VoltPower Corp", tier: 1, reliabilityScore: 89, riskScore: 35, countryCode: "DE" },
    ];

    const facilities = [
      { id: "f1", name: "Seoul Fab 1", facilityType: "Manufacturing", capacity: 100000, status: "OPERATIONAL", latitude: 37.5665, longitude: 126.9780 },
      { id: "f2", name: "Hsinchu Fab 3", facilityType: "Manufacturing", capacity: 200000, status: "OPERATIONAL", latitude: 24.8138, longitude: 120.9675 },
      { id: "f3", name: "Shenzhen Assembly Plant", facilityType: "Assembly", capacity: 500000, status: "DEGRADED", latitude: 22.5431, longitude: 114.0579 },
      { id: "f4", name: "Tokyo Optic Plant", facilityType: "Manufacturing", capacity: 80000, status: "OPERATIONAL", latitude: 35.6762, longitude: 139.6503 },
      { id: "f5", name: "Austin Memory Fab", facilityType: "Manufacturing", capacity: 150000, status: "OPERATIONAL", latitude: 30.2672, longitude: -97.7431 },
      { id: "f6", name: "Singapore Network Hub", facilityType: "Assembly", capacity: 120000, status: "OPERATIONAL", latitude: 1.3521, longitude: 103.8198 },
      { id: "f7", name: "Penang Cooling Plant", facilityType: "Manufacturing", capacity: 300000, status: "OPERATIONAL", latitude: 5.4141, longitude: 100.3288 },
      { id: "f8", name: "Munich Power Assembly", facilityType: "Assembly", capacity: 90000, status: "OPERATIONAL", latitude: 48.1351, longitude: 11.5820 },
    ];

    const countries = [
      { code: "KR", name: "South Korea", region: "East Asia", riskScore: 12 },
      { code: "TW", name: "Taiwan", region: "East Asia", riskScore: 22 },
      { code: "CN", name: "China", region: "East Asia", riskScore: 35 },
      { code: "JP", name: "Japan", region: "East Asia", riskScore: 15 },
      { code: "US", name: "United States", region: "North America", riskScore: 10 },
      { code: "SG", name: "Singapore", region: "Southeast Asia", riskScore: 8 },
      { code: "MY", name: "Malaysia", region: "Southeast Asia", riskScore: 25 },
      { code: "DE", name: "Germany", region: "Europe", riskScore: 5 },
    ];

    const riskEvents = [
      { id: "r1", title: "Shenzhen Port Congestion", type: "Port closure", severity: "HIGH", status: "ACTIVE", description: "Severe delays at major shipping ports due to labor strikes.", startDate: "2026-08-01", expectedEndDate: "2026-08-15" },
      { id: "r2", title: "Typhoon Approaching Taiwan", type: "Flood", severity: "CRITICAL", status: "ACTIVE", description: "Category 5 typhoon threatening major semiconductor fabs.", startDate: "2026-08-04", expectedEndDate: "2026-08-10" },
      { id: "r3", title: "European Logistics Strike", type: "Transportation strike", severity: "MEDIUM", status: "ACTIVE", description: "Truck drivers on strike affecting cross-border transport.", startDate: "2026-07-28", expectedEndDate: "2026-08-07" },
    ];

    // Write Nodes
    await session.executeWrite((tx) => tx.run(`UNWIND $data AS row CREATE (n:Product) SET n = row`, { data: products }));
    await session.executeWrite((tx) => tx.run(`UNWIND $data AS row CREATE (n:Component) SET n = row`, { data: components }));
    await session.executeWrite((tx) => tx.run(`UNWIND $data AS row CREATE (n:Supplier) SET n = row`, { data: suppliers }));
    await session.executeWrite((tx) => tx.run(`UNWIND $data AS row CREATE (n:Facility) SET n = row`, { data: facilities }));
    await session.executeWrite((tx) => tx.run(`UNWIND $data AS row CREATE (n:Country) SET n = row`, { data: countries }));
    await session.executeWrite((tx) => tx.run(`UNWIND $data AS row CREATE (n:RiskEvent) SET n = row`, { data: riskEvents }));

    logger.info("Nodes created.");

    // Define and Write Relationships
    const productRequiresComponent = [
      { p: "p1", c: "c1", quantity: 1, criticality: "HIGH", substitutionDifficulty: "HIGH" },
      { p: "p1", c: "c3", quantity: 1, criticality: "HIGH", substitutionDifficulty: "MEDIUM" },
      { p: "p1", c: "c4", quantity: 2, criticality: "MEDIUM", substitutionDifficulty: "LOW" },
      { p: "p1", c: "c5", quantity: 1, criticality: "HIGH", substitutionDifficulty: "CRITICAL" },
      { p: "p1", c: "c6", quantity: 1, criticality: "MEDIUM", substitutionDifficulty: "LOW" },
      
      { p: "p2", c: "c2", quantity: 1, criticality: "HIGH", substitutionDifficulty: "HIGH" },
      { p: "p2", c: "c3", quantity: 1, criticality: "HIGH", substitutionDifficulty: "MEDIUM" },
      { p: "p2", c: "c5", quantity: 1, criticality: "HIGH", substitutionDifficulty: "CRITICAL" },
      { p: "p2", c: "c6", quantity: 1, criticality: "MEDIUM", substitutionDifficulty: "LOW" },

      { p: "p4", c: "c2", quantity: 1, criticality: "HIGH", substitutionDifficulty: "HIGH" }, // Shared component (OLED 11in)
      { p: "p4", c: "c5", quantity: 1, criticality: "HIGH", substitutionDifficulty: "CRITICAL" }, // Single point of failure (Control Chip)
      { p: "p4", c: "c6", quantity: 2, criticality: "LOW", substitutionDifficulty: "LOW" },
      { p: "p4", c: "c9", quantity: 2, criticality: "LOW", substitutionDifficulty: "LOW" },
      
      { p: "p6", c: "c8", quantity: 4, criticality: "HIGH", substitutionDifficulty: "HIGH" },
      { p: "p6", c: "c9", quantity: 8, criticality: "MEDIUM", substitutionDifficulty: "LOW" },
      { p: "p6", c: "c10", quantity: 2, criticality: "HIGH", substitutionDifficulty: "HIGH" },
      
      { p: "p3", c: "c3", quantity: 1, criticality: "HIGH", substitutionDifficulty: "MEDIUM" },
      { p: "p3", c: "c6", quantity: 1, criticality: "MEDIUM", substitutionDifficulty: "LOW" },
      
      { p: "p5", c: "c8", quantity: 1, criticality: "HIGH", substitutionDifficulty: "HIGH" },
      { p: "p5", c: "c10", quantity: 1, criticality: "MEDIUM", substitutionDifficulty: "LOW" },
      
      { p: "p7", c: "c2", quantity: 1, criticality: "HIGH", substitutionDifficulty: "HIGH" },
      { p: "p7", c: "c6", quantity: 2, criticality: "MEDIUM", substitutionDifficulty: "LOW" },
      
      { p: "p8", c: "c3", quantity: 1, criticality: "HIGH", substitutionDifficulty: "MEDIUM" },
      { p: "p8", c: "c7", quantity: 1, criticality: "MEDIUM", substitutionDifficulty: "LOW" },
    ];
    await session.executeWrite((tx) => tx.run(`
      UNWIND $data AS row 
      MATCH (p:Product {id: row.p}), (c:Component {id: row.c})
      CREATE (p)-[:REQUIRES {quantity: row.quantity, criticality: row.criticality, substitutionDifficulty: row.substitutionDifficulty}]->(c)
    `, { data: productRequiresComponent }));

    const supplierSuppliesComponent = [
      { s: "s1", c: "c1", unitCost: 45, leadTimeDays: 45, allocationPercentage: 100, contractStatus: "ACTIVE" },
      { s: "s1", c: "c2", unitCost: 85, leadTimeDays: 45, allocationPercentage: 100, contractStatus: "ACTIVE" },
      { s: "s3", c: "c3", unitCost: 12, leadTimeDays: 30, allocationPercentage: 100, contractStatus: "ACTIVE" },
      { s: "s4", c: "c4", unitCost: 25, leadTimeDays: 60, allocationPercentage: 100, contractStatus: "ACTIVE" },
      { s: "s2", c: "c5", unitCost: 120, leadTimeDays: 90, allocationPercentage: 100, contractStatus: "ACTIVE" }, // Sole supplier of Control Chip
      { s: "s5", c: "c6", unitCost: 35, leadTimeDays: 20, allocationPercentage: 60, contractStatus: "ACTIVE" },
      { s: "s2", c: "c6", unitCost: 38, leadTimeDays: 25, allocationPercentage: 40, contractStatus: "ACTIVE" }, // Multi-sourced component
      { s: "s6", c: "c8", unitCost: 75, leadTimeDays: 35, allocationPercentage: 100, contractStatus: "ACTIVE" },
      { s: "s7", c: "c9", unitCost: 5, leadTimeDays: 10, allocationPercentage: 100, contractStatus: "ACTIVE" },
      { s: "s8", c: "c7", unitCost: 15, leadTimeDays: 15, allocationPercentage: 100, contractStatus: "ACTIVE" },
      { s: "s8", c: "c10", unitCost: 150, leadTimeDays: 40, allocationPercentage: 100, contractStatus: "ACTIVE" },
    ];
    await session.executeWrite((tx) => tx.run(`
      UNWIND $data AS row 
      MATCH (s:Supplier {id: row.s}), (c:Component {id: row.c})
      CREATE (s)-[:SUPPLIES {unitCost: row.unitCost, leadTimeDays: row.leadTimeDays, allocationPercentage: row.allocationPercentage, contractStatus: row.contractStatus}]->(c)
    `, { data: supplierSuppliesComponent }));

    const supplierOperatesFacility = [
      { s: "s1", f: "f1" },
      { s: "s2", f: "f2" },
      { s: "s3", f: "f3" },
      { s: "s4", f: "f4" },
      { s: "s5", f: "f5" },
      { s: "s6", f: "f6" },
      { s: "s7", f: "f7" },
      { s: "s8", f: "f8" },
    ];
    await session.executeWrite((tx) => tx.run(`
      UNWIND $data AS row 
      MATCH (s:Supplier {id: row.s}), (f:Facility {id: row.f})
      CREATE (s)-[:OPERATES]->(f)
    `, { data: supplierOperatesFacility }));

    const facilityLocatedIn = [
      { f: "f1", c: "KR" }, { f: "f2", c: "TW" }, { f: "f3", c: "CN" }, { f: "f4", c: "JP" },
      { f: "f5", c: "US" }, { f: "f6", c: "SG" }, { f: "f7", c: "MY" }, { f: "f8", c: "DE" },
    ];
    await session.executeWrite((tx) => tx.run(`
      UNWIND $data AS row 
      MATCH (f:Facility {id: row.f}), (c:Country {code: row.c})
      CREATE (f)-[:LOCATED_IN]->(c)
    `, { data: facilityLocatedIn }));

    const supplierHeadquarteredIn = [
      { s: "s1", c: "KR" }, { s: "s2", c: "TW" }, { s: "s3", c: "CN" }, { s: "s4", c: "JP" },
      { s: "s5", c: "US" }, { s: "s6", c: "SG" }, { s: "s7", c: "MY" }, { s: "s8", c: "DE" },
    ];
    await session.executeWrite((tx) => tx.run(`
      UNWIND $data AS row 
      MATCH (s:Supplier {id: row.s}), (c:Country {code: row.c})
      CREATE (s)-[:HEADQUARTERED_IN]->(c)
    `, { data: supplierHeadquarteredIn }));

    const riskAffects = [
      { r: "r1", targetLabel: "Facility", targetId: "f3", impactLevel: "HIGH", estimatedDelayDays: 14 },
      { r: "r1", targetLabel: "Country", targetId: "CN", impactLevel: "MEDIUM", estimatedDelayDays: 7 },
      { r: "r2", targetLabel: "Facility", targetId: "f2", impactLevel: "CRITICAL", estimatedDelayDays: 21 }, // Affects Advanced Silicon Fab
      { r: "r3", targetLabel: "Facility", targetId: "f8", impactLevel: "MEDIUM", estimatedDelayDays: 10 },
    ];
    await session.executeWrite((tx) => tx.run(`
        UNWIND $data AS row
        MATCH (r:RiskEvent {id: row.r}), (f:Facility {id: row.targetId})
        WHERE row.targetLabel = 'Facility'
        CREATE (r)-[:AFFECTS {impactLevel: row.impactLevel, estimatedDelayDays: row.estimatedDelayDays}]->(f)
      `, { data: riskAffects }));
    await session.executeWrite((tx) => tx.run(`
        UNWIND $data AS row
        MATCH (r:RiskEvent {id: row.r}), (c:Country {code: row.targetId})
        WHERE row.targetLabel = 'Country'
        CREATE (r)-[:AFFECTS {impactLevel: row.impactLevel, estimatedDelayDays: row.estimatedDelayDays}]->(c)
      `, { data: riskAffects }));

    const supplierDependsOn = [
      { s: "s1", us: "s4", dependencyType: "Raw Materials", criticality: "MEDIUM" }, // Global Display depends on OpticLens
      { s: "s6", us: "s2", dependencyType: "IC Chips", criticality: "HIGH" }, // NetConnect depends on Advanced Silicon
    ];
    await session.executeWrite((tx) => tx.run(`
      UNWIND $data AS row 
      MATCH (s:Supplier {id: row.s}), (us:Supplier {id: row.us})
      CREATE (s)-[:DEPENDS_ON {dependencyType: row.dependencyType, criticality: row.criticality}]->(us)
    `, { data: supplierDependsOn }));

    const alternativeTo = [
      { s: "s5", as: "s2", compatibilityScore: 85, switchingCost: 50000, estimatedOnboardingDays: 15 }, // FastMem is an alternative to Advanced Silicon (for memory)
    ];
    await session.executeWrite((tx) => tx.run(`
      UNWIND $data AS row 
      MATCH (s:Supplier {id: row.s}), (alt:Supplier {id: row.as})
      CREATE (s)-[:ALTERNATIVE_TO {compatibilityScore: row.compatibilityScore, switchingCost: row.switchingCost, estimatedOnboardingDays: row.estimatedOnboardingDays}]->(alt)
    `, { data: alternativeTo }));

    logger.info("Relationships created.");

    // Final checks
    const counts = await session.executeRead((tx) => tx.run(`
      MATCH (n) RETURN count(n) AS nodeCount
    `));
    logger.info(`Seeding complete. Total nodes: ${counts.records[0].get("nodeCount")}`);

  } catch (error) {
    logger.error(error, "Seeding failed");
    process.exit(1);
  } finally {
    await session.close();
    await closeDriver();
  }
};

runSeed();
