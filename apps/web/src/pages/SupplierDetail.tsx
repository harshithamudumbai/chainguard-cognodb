import { useParams } from 'react-router-dom';
import { useSupplier, useSupplierImpact, useSupplierAlternatives } from '../hooks/queries';
import { GraphViewer } from '../components/graph/GraphViewer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { Building2, Package, Globe, ArrowRightLeft } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

export function SupplierDetail() {
  const { supplierId } = useParams<{ supplierId: string }>();

  const { data: supplier, isLoading, isError, error, refetch } = useSupplier(supplierId);
  const { data: impact } = useSupplierImpact(supplierId);
  const { data: alternatives, isLoading: isLoadingAlts } = useSupplierAlternatives(supplierId);

  if (isLoading) return <LoadingState message="Loading supplier details..." />;
  if (isError) return <ErrorState message="Failed to load supplier details" code={(error as any)?.code} onRetry={refetch} />;
  if (!supplier) return <ErrorState message="Supplier not found" />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl">
      
      {/* Header Profile */}
      <div className="bg-card p-6 rounded-2xl border border-card-hover flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-xl">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{supplier.name}</h2>
            <div className="text-foreground/50 flex items-center gap-4 mt-1">
              <span><Globe className="w-4 h-4 inline mr-1" /> {supplier.countryCode}</span>
              <span>Tier {supplier.tier} Supplier</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-background px-4 py-2 rounded-lg border border-card-hover text-center">
            <div className="text-xs text-foreground/50 mb-1">Reliability</div>
            <div className={`text-xl font-bold ${supplier.reliabilityScore >= 90 ? 'text-success' : 'text-warning'}`}>
              {supplier.reliabilityScore}%
            </div>
          </div>
          <div className="bg-background px-4 py-2 rounded-lg border border-card-hover text-center">
            <div className="text-xs text-foreground/50 mb-1">Risk Score</div>
            <div className={`text-xl font-bold ${supplier.riskScore > 30 ? 'text-danger' : supplier.riskScore > 15 ? 'text-warning' : 'text-success'}`}>
              {supplier.riskScore}/100
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Info & Alternatives */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-card rounded-xl border border-card-hover overflow-hidden">
            <div className="p-4 border-b border-card-hover bg-card/50">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Indirectly Dependent Products ({impact?.affectedProducts.length || 0})
              </h3>
            </div>
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              {impact?.affectedProducts.map(p => (
                <div key={p.id} className="flex justify-between items-center text-sm">
                  <span>{p.name}</span>
                  <StatusBadge status={p.criticality} />
                </div>
              ))}
              {impact?.affectedProducts.length === 0 && (
                <div className="text-sm text-foreground/50 text-center">No dependent products found.</div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-card-hover overflow-hidden">
            <div className="p-4 border-b border-card-hover bg-card/50">
              <h3 className="font-semibold flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-primary" />
                Alternative Suppliers
              </h3>
              <p className="text-xs text-foreground/50 mt-1">Recommendation scores are illustrative.</p>
            </div>
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              {isLoadingAlts ? (
                 <LoadingState />
              ) : alternatives?.length === 0 ? (
                 <div className="text-sm text-foreground/50 text-center">No alternatives found.</div>
              ) : (
                alternatives?.map(alt => (
                  <div key={alt.id} className="p-3 bg-background border border-card-hover rounded-lg">
                    <div className="font-medium text-sm flex justify-between items-center">
                      {alt.name}
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Score: {alt.recommendationScore.toFixed(0)}</span>
                    </div>
                    <div className="text-xs text-foreground/60 mt-1 flex justify-between">
                      <span>Risk: {alt.riskScore}/100</span>
                      <span>Reliability: {alt.reliabilityScore}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Network Graph */}
        <div className="lg:col-span-2 bg-card/20 rounded-xl border border-card-hover overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-4 border-b border-card-hover bg-card/50 shrink-0">
             <h3 className="font-semibold">Dependency Network</h3>
          </div>
          <div className="flex-1 relative">
            {impact?.graph ? (
              <GraphViewer data={impact.graph} />
            ) : (
              <LoadingState />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
