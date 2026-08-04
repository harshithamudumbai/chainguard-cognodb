import { useState, useMemo } from 'react';
import { useRisks, useRiskImpact } from '../hooks/queries';
import { GraphViewer } from '../components/graph/GraphViewer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { Table } from '../components/common/Table';
import { AlertTriangle, Package, Calendar, Activity, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../utils/format';

export function RiskImpact() {
  const [selectedRiskId, setSelectedRiskId] = useState<string>('');
  
  const { data: risks, isLoading: isLoadingRisks } = useRisks();
  
  const { 
    data: impactData, 
    isLoading: isLoadingImpact, 
    isError: isImpactError,
    error: impactError,
    refetch: refetchImpact
  } = useRiskImpact(selectedRiskId);

  const selectedRisk = risks?.find(r => r.id === selectedRiskId);

  // Derive counts from graph
  const graphStats = useMemo(() => {
    if (!impactData?.graph) return { components: 0, suppliers: 0, facilities: 0 };
    return {
      components: impactData.graph.nodes.filter(n => n.label === 'Component').length,
      suppliers: impactData.graph.nodes.filter(n => n.label === 'Supplier').length,
      facilities: impactData.graph.nodes.filter(n => n.label === 'Facility').length,
    };
  }, [impactData]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-6 animate-in fade-in duration-500">
      
      {/* Header section with description */}
      <div>
        <p className="text-muted text-sm max-w-4xl">
          Trace how a disruption propagates through connected suppliers and facilities to affected products. 
          This analysis follows supplier, facility, country, and upstream dependency links to identify indirect product exposure.
        </p>
      </div>

      {/* Risk Selector */}
      <div className="bg-card p-5 rounded-xl border border-card-border shadow-sm shrink-0 flex flex-col sm:flex-row sm:items-end gap-6 relative z-10">
        <div className="flex-1 max-w-xl">
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Analyze Active Risk Event</label>
          <div className="relative">
            <select 
              className="w-full bg-background border border-card-border rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none appearance-none transition-colors"
              value={selectedRiskId}
              onChange={(e) => setSelectedRiskId(e.target.value)}
              disabled={isLoadingRisks}
            >
              <option value="">-- Choose a risk event to analyze --</option>
              {risks?.map(r => (
                <option key={r.id} value={r.id}>{r.title} ({r.severity})</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {!selectedRiskId ? (
        <div className="flex-1 bg-card rounded-xl border border-card-border shadow-inner">
          <EmptyState 
            title="Risk Impact Analysis" 
            description="Choose a risk event from the dropdown to see how disruption propagates through the supply chain."
            icon={<AlertTriangle className="w-10 h-10 text-warning" />}
          />
        </div>
      ) : isLoadingImpact ? (
        <div className="flex-1 bg-card rounded-xl border border-card-border shadow-inner flex items-center justify-center">
          <LoadingState message="Calculating network impact..." />
        </div>
      ) : isImpactError ? (
        <div className="flex-1 bg-card rounded-xl border border-card-border shadow-inner">
          <ErrorState 
            message="Failed to analyze risk impact." 
            code={(impactError as any)?.code}
            onRetry={refetchImpact}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6 min-h-0 overflow-y-auto pr-2 pb-4">
          
          {/* Header Section for Risk Details */}
          {selectedRisk && (
            <div className="bg-card p-6 rounded-xl border border-card-border shadow-sm flex flex-col md:flex-row justify-between gap-6 shrink-0">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-foreground">{selectedRisk.title}</h3>
                  <StatusBadge status={selectedRisk.severity} />
                  <StatusBadge status={selectedRisk.status} />
                </div>
                <p className="text-sm text-muted max-w-3xl mb-4">{selectedRisk.description}</p>
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-muted-light rounded-md text-muted"><Activity className="w-4 h-4" /></div>
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-muted tracking-wider">Type</div>
                      <div className="font-medium text-foreground">{selectedRisk.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-muted-light rounded-md text-muted"><Calendar className="w-4 h-4" /></div>
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-muted tracking-wider">Expected Resolution</div>
                      <div className="font-medium text-foreground">{formatDate(selectedRisk.expectedEndDate)}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Impact Summary Cards */}
              <div className="flex gap-4 self-start md:self-center shrink-0">
                <div className="bg-danger-light/30 border border-danger/20 p-4 rounded-xl flex flex-col items-center justify-center min-w-[120px]">
                  <span className="text-3xl font-bold text-danger mb-1">{impactData?.affectedProducts.length || 0}</span>
                  <span className="text-xs font-semibold text-danger uppercase tracking-wider text-center">Affected<br/>Products</span>
                </div>
                <div className="bg-warning-light/30 border border-warning/20 p-4 rounded-xl flex flex-col items-center justify-center min-w-[120px]">
                  <span className="text-3xl font-bold text-warning mb-1">{graphStats.suppliers}</span>
                  <span className="text-xs font-semibold text-warning uppercase tracking-wider text-center">Affected<br/>Suppliers</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Content: Table & Graph side by side */}
          <div className="flex flex-col xl:flex-row gap-6 min-h-[500px] flex-1 shrink-0">
            
            {/* Affected Product Table */}
            <div className="w-full xl:w-[500px] flex flex-col bg-card rounded-xl border border-card-border shadow-sm overflow-hidden shrink-0">
              <div className="p-5 border-b border-card-border bg-muted-light/30">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Indirectly Affected Products
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Table
                  data={impactData?.affectedProducts || []}
                  keyExtractor={(p) => p.id}
                  emptyMessage="No products are affected by this risk event."
                  columns={[
                    {
                      header: "Product",
                      accessor: (p) => (
                        <div>
                          <div className="font-semibold text-foreground">{p.name}</div>
                          <div className="text-xs text-muted mt-0.5">{p.category}</div>
                        </div>
                      )
                    },
                    {
                      header: "Criticality",
                      accessor: (p) => <StatusBadge status={p.criticality} />
                    },
                    {
                      header: "Exposure",
                      align: "right",
                      accessor: (p) => (
                        <span className="font-medium text-danger">
                          {formatCurrency(p.annualRevenueImpact)}
                        </span>
                      )
                    }
                  ]}
                />
              </div>
            </div>

            {/* Impact Graph */}
            <div className="flex-1 bg-background rounded-xl border border-card-border shadow-inner overflow-hidden relative min-h-[400px]"
                 style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
              <div className="absolute top-4 left-4 z-10 bg-card/90 backdrop-blur-sm p-3 border border-card-border rounded-lg shadow-sm max-w-xs">
                <div className="flex gap-2 items-start text-xs text-foreground">
                  <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>Graph displays the direct propagation path from the risk event to the affected products.</p>
                </div>
              </div>
              <GraphViewer data={impactData!.graph} direction="TB" />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
