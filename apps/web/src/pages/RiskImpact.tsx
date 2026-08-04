import { useState } from 'react';
import { useRisks, useRiskImpact } from '../hooks/queries';
import { GraphViewer } from '../components/graph/GraphViewer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { AlertTriangle, Package, Calendar, Activity } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

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

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4 animate-in fade-in duration-500">
      
      {/* Risk Selector */}
      <div className="bg-card p-4 rounded-xl border border-card-hover shrink-0">
        <label className="block text-sm font-medium text-foreground/70 mb-2">Analyze Active Risk Event</label>
        <select 
          className="w-full max-w-md bg-background border border-card-hover rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none"
          value={selectedRiskId}
          onChange={(e) => setSelectedRiskId(e.target.value)}
          disabled={isLoadingRisks}
        >
          <option value="">-- Choose a risk event to analyze --</option>
          {risks?.map(r => (
            <option key={r.id} value={r.id}>{r.title} ({r.severity})</option>
          ))}
        </select>
      </div>

      {!selectedRiskId ? (
        <EmptyState 
          title="Select a risk event" 
          description="Choose a risk event from the dropdown to see its cascading impact on your supply chain."
          icon={<AlertTriangle className="w-10 h-10 text-warning" />}
        />
      ) : isLoadingImpact ? (
        <LoadingState message="Calculating network impact..." />
      ) : isImpactError ? (
        <ErrorState 
          message="Failed to analyze risk impact." 
          code={(impactError as any)?.code}
          onRetry={refetchImpact}
        />
      ) : (
        <div className="flex-1 flex flex-col xl:flex-row gap-6 min-h-0">
          
          {/* Left Column: Summary & Affected Products */}
          <div className="w-full xl:w-[450px] flex flex-col gap-6 shrink-0 overflow-y-auto pr-2">
            
            {/* Risk Details Card */}
            {selectedRisk && (
              <div className="bg-card p-5 rounded-xl border border-card-hover">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">{selectedRisk.title}</h3>
                  <StatusBadge status={selectedRisk.severity} />
                </div>
                <p className="text-sm text-foreground/70 mb-4">{selectedRisk.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-foreground/50 block text-xs mb-1"><Activity className="w-3 h-3 inline mr-1" /> Type</span>
                    <span className="font-medium">{selectedRisk.type}</span>
                  </div>
                  <div>
                    <span className="text-foreground/50 block text-xs mb-1"><Calendar className="w-3 h-3 inline mr-1" /> Expected End</span>
                    <span className="font-medium">{selectedRisk.expectedEndDate}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Affected Products List */}
            <div className="bg-card rounded-xl border border-card-hover overflow-hidden flex flex-col flex-1">
              <div className="p-4 border-b border-card-hover bg-card/50">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  Indirectly Affected Products ({impactData?.affectedProducts.length || 0})
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {impactData?.affectedProducts.length === 0 ? (
                  <p className="text-sm text-foreground/50 text-center py-4">No products are affected by this risk event.</p>
                ) : (
                  impactData?.affectedProducts.map(product => (
                    <div key={product.id} className="p-3 border border-card-hover rounded-lg bg-background">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-sm">{product.name}</div>
                        <StatusBadge status={product.criticality} />
                      </div>
                      <div className="text-xs text-foreground/60 mb-2">Category: {product.category}</div>
                      <div className="flex justify-between text-xs items-center bg-card p-2 rounded">
                        <span className="text-foreground/50">Revenue Exposure:</span>
                        <span className="font-semibold text-danger">
                          ${(product.annualRevenueImpact / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Graph */}
          <div className="flex-1 bg-card/20 rounded-xl border border-card-hover overflow-hidden min-h-[400px]">
            <GraphViewer data={impactData!.graph} />
          </div>

        </div>
      )}
    </div>
  );
}
