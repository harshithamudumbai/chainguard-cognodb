// Example 1: Overview
MATCH (p:Product)
WITH count(p) AS productCount
MATCH (c:Component)
WITH productCount, count(c) AS componentCount
MATCH (s:Supplier)
WITH productCount, componentCount, count(s) AS supplierCount
MATCH (f:Facility)
WITH productCount, componentCount, supplierCount, count(f) AS facilityCount
MATCH (r:RiskEvent {status: "ACTIVE"})
WITH productCount, componentCount, supplierCount, facilityCount, count(r) AS activeRiskCount
RETURN productCount, componentCount, supplierCount, facilityCount, activeRiskCount

// Example 2: Multi-hop risk impact
MATCH path = (r:RiskEvent {id: "risk-1"})-[:AFFECTS*1..2]-(affected)-[:OPERATES|HEADQUARTERED_IN|SUPPLIES|DEPENDS_ON|REQUIRES*1..4]-(p:Product)
RETURN path
LIMIT 50

// Example 3: Shared dependencies
MATCH (p1:Product {id: "prod-1"})-[:REQUIRES|SUPPLIES|OPERATES|LOCATED_IN*1..4]-(shared)-[:REQUIRES|SUPPLIES|OPERATES|LOCATED_IN*1..4]-(p2:Product {id: "prod-2"})
WHERE p1 <> p2
RETURN shared, labels(shared) AS type
