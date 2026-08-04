export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  annualRevenueImpact: number;
  criticality: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
}

export interface Component {
  id: string;
  name: string;
  category: string;
  criticality: string;
  leadTimeDays: number;
}

export interface Supplier {
  id: string;
  name: string;
  tier: number;
  reliabilityScore: number;
  riskScore: number;
  countryCode: string;
}

export interface Facility {
  id: string;
  name: string;
  facilityType: string;
  capacity: number;
  status: string;
  latitude: number;
  longitude: number;
}

export interface Country {
  code: string;
  name: string;
  region: string;
  riskScore: number;
}

export interface RiskEvent {
  id: string;
  title: string;
  type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  status: 'ACTIVE' | 'RESOLVED';
  description: string;
  startDate: string;
  expectedEndDate: string;
}

// Graph Types
export type GraphNode = {
  id: string;
  label: string;
  title: string;
  properties: Record<string, any>;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type: string;
  properties: Record<string, any>;
};

export type GraphResponse = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

// API Endpoint Response Types
export interface DashboardSummary {
  products: number;
  components: number;
  suppliers: number;
  facilities: number;
  activeRisks: number;
}

export interface HighImpactSupplier {
  id: string;
  name: string;
  riskScore: number;
  affectedProducts: number;
  totalRevenueExposure: number;
}

export interface SinglePointOfFailure {
  componentId: string;
  componentName: string;
  supplierName: string;
  dependentProducts: number;
  productNames: string[];
  aggregateRevenueImpact: number;
}

export interface RiskImpactData {
  affectedProducts: Product[];
  graph: GraphResponse;
}

export interface SharedDependency {
  id: string;
  label: string;
  name: string;
}

export interface ComparisonData {
  sharedEntities: SharedDependency[];
  graph: GraphResponse;
}

export interface AlternativeSupplier extends Supplier {
  recommendationScore: number;
}
