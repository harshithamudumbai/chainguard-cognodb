import { useParams, Link } from 'react-router-dom';
import { useSupplier, useSupplierImpact, useSupplierAlternatives } from '../hooks/queries';
import { GraphViewer } from '../components/graph/GraphViewer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { Building2, Package, Globe, ArrowRightLeft, ShieldCheck, ShieldAlert, ArrowLeft } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { Table } from '../components/common/Table';


export function SupplierDetail() {
  const { supplierId } = useParams<{ supplierId: string }>();

  const { data: supplier, isLoading, isError, error, refetch } = useSupplier(supplierId);
  const { data: impact } = useSupplierImpact(supplierId);
  const { data: alternatives, isLoading: isLoadingAlts } = useSupplierAlternatives(supplierId);

  if (isLoading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <LoadingState message="Loading supplier details..." />
    </div>
  );
  if (isError) return (
    <div className="max-w-3xl mx-auto mt-10">
      <ErrorState message="Failed to load supplier details" code={(error as any)?.code} onRetry={refetch} />
    </div>
  );
  if (!supplier) return (
    <div className="max-w-3xl mx-auto mt-10">
      <ErrorState message="Supplier not found" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Breadcrumb / Back Navigation */}
      <div>
        <Link to="/suppliers" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>
      </div>

      {/* Header Profile */}
      <div className="bg-card p-8 rounded-2xl border border-card-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5 z-10">
          <div className="p-4 bg-primary-light text-primary rounded-xl shadow-sm border border-primary/20">
            <Building2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-1">{supplier.name}</h2>
            <div className="text-muted flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm font-medium">
              <span className="flex items-center gap-1.5 bg-muted-light px-2 py-1 rounded-md">
                <Globe className="w-4 h-4" /> {supplier.countryCode}
              </span>
              <span className="bg-muted-light px-2 py-1 rounded-md">Tier {supplier.tier} Supplier</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 z-10">
          <div className="bg-background px-6 py-4 rounded-xl border border-card-border shadow-sm min-w-[140px] text-center">
            <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Reliability
            </div>
            <div className={`text-2xl font-bold ${supplier.reliabilityScore >= 90 ? 'text-success' : 'text-warning'}`}>
              {supplier.reliabilityScore}%
            </div>
          </div>
          <div className="bg-background px-6 py-4 rounded-xl border border-card-border shadow-sm min-w-[140px] text-center">
            <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
              <ShieldAlert className="w-4 h-4" /> Risk Score
            </div>
            <div className="flex flex-col items-center">
              <span className={`text-2xl font-bold ${supplier.riskScore > 75 ? 'text-danger' : supplier.riskScore > 50 ? 'text-warning' : 'text-success'}`}>
                {supplier.riskScore}/100
              </span>
              <StatusBadge 
                status={supplier.riskScore > 75 ? 'Critical' : supplier.riskScore > 50 ? 'High' : supplier.riskScore > 25 ? 'Medium' : 'Low'} 
                className="mt-1 scale-90"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Info & Alternatives */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          
          <div className="bg-card rounded-xl border border-card-border shadow-sm overflow-hidden flex flex-col max-h-[400px]">
            <div className="p-5 border-b border-card-border bg-muted-light/30">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Indirectly Dependent Products ({impact?.affectedProducts.length || 0})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Table
                data={impact?.affectedProducts || []}
                keyExtractor={(p) => p.id}
                emptyMessage="No dependent products found."
                columns={[
                  {
                    header: "Product",
                    accessor: (p) => (
                      <div className="font-medium text-foreground text-sm">{p.name}</div>
                    )
                  },
                  {
                    header: "Criticality",
                    align: "right",
                    accessor: (p) => <StatusBadge status={p.criticality} />
                  }
                ]}
              />
            </div>
          </div>

          <div className="bg-card rounded-xl border border-card-border shadow-sm overflow-hidden flex flex-col max-h-[500px]">
            <div className="p-5 border-b border-card-border bg-muted-light/30">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-primary" />
                Alternative Suppliers
              </h3>
              <p className="text-xs text-muted mt-1 font-medium">Recommendation scores are illustrative.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoadingAlts ? (
                <div className="p-4 text-center"><LoadingState /></div>
              ) : alternatives?.length === 0 ? (
                <div className="text-sm text-muted text-center p-4">No alternatives found.</div>
              ) : (
                alternatives?.map(alt => (
                  <div key={alt.id} className="p-4 bg-background border border-card-border rounded-xl hover:border-primary/40 transition-colors shadow-sm">
                    <div className="font-bold text-foreground mb-3 flex justify-between items-start gap-2">
                      <span className="break-words">{alt.name}</span>
                      <span className="text-[10px] bg-primary-light text-primary px-2 py-1 rounded font-bold uppercase tracking-wider shrink-0 border border-primary/20">
                        Score: {alt.recommendationScore.toFixed(0)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-muted-light p-2 rounded-lg text-center border border-card-border">
                        <div className="text-muted font-semibold uppercase tracking-wider mb-0.5">Risk</div>
                        <div className={`font-bold ${alt.riskScore > 50 ? 'text-danger' : 'text-success'}`}>{alt.riskScore}/100</div>
                      </div>
                      <div className="bg-muted-light p-2 rounded-lg text-center border border-card-border">
                        <div className="text-muted font-semibold uppercase tracking-wider mb-0.5">Reliability</div>
                        <div className={`font-bold ${alt.reliabilityScore >= 90 ? 'text-success' : 'text-warning'}`}>{alt.reliabilityScore}%</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Network Graph */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-card-border shadow-sm overflow-hidden min-h-[500px] flex flex-col relative">
          <div className="p-5 border-b border-card-border bg-card/90 backdrop-blur-sm z-10 shrink-0 absolute top-0 w-full flex items-center justify-between">
             <h3 className="font-bold text-foreground flex items-center gap-2">Dependency Network</h3>
          </div>
          <div className="flex-1 relative pt-16 bg-background" style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            {impact?.graph ? (
              <GraphViewer data={impact.graph} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingState message="Mapping dependency network..." />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
