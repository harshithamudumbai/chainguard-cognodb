import { 
  useDashboardSummary, 
  useHighImpactSuppliers, 
  useRisks,
  useSinglePointsOfFailure
} from '../hooks/queries';
import { KPICard } from '../components/common/KPICard';
import { ErrorState } from '../components/common/ErrorState';
import { StatusBadge } from '../components/common/StatusBadge';
import { Package, Cpu, Building2, Factory, AlertTriangle, ArrowRight, ShieldCheck, Search, Activity, Network } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/format';

export function Dashboard() {
  const navigate = useNavigate();
  const { 
    data: summary, 
    isLoading: isSummaryLoading, 
    isError: isSummaryError,
    error: summaryError,
    refetch: refetchSummary
  } = useDashboardSummary();

  const { data: highImpact, isLoading: isHighImpactLoading } = useHighImpactSuppliers();
  const { data: singlePoints, isLoading: isSinglePointsLoading } = useSinglePointsOfFailure();
  const { data: risks, isLoading: isRisksLoading } = useRisks();

  if (isSummaryError) {
    return <ErrorState message="Failed to load dashboard summary." code={(summaryError as any)?.code} onRetry={refetchSummary} />;
  }

  const activeRisks = risks?.filter(r => r.status === 'ACTIVE') || [];
  const singleSourceCount = singlePoints?.length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Hero Summary */}
      <div className="bg-card p-8 rounded-2xl border border-card-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Network className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Supply Chain Risk Overview
          </h2>
          <p className="text-muted text-lg mb-6 leading-relaxed">
            Monitor hidden dependencies, active disruptions, and critical supplier exposure across your entire product network.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/risks')}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Activity className="w-5 h-5" />
              Analyze Active Risks
            </button>
            <button 
              onClick={() => navigate('/network')}
              className="bg-muted-light text-foreground hover:bg-muted-light/80 px-6 py-2.5 rounded-lg font-medium transition-colors border border-card-border flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Explore Network
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <KPICard 
          title="Products Monitored" 
          value={summary?.products ?? 0} 
          icon={<Package className="w-5 h-5" />} 
          isLoading={isSummaryLoading}
        />
        <KPICard 
          title="Suppliers" 
          value={summary?.suppliers ?? 0} 
          icon={<Building2 className="w-5 h-5" />} 
          isLoading={isSummaryLoading}
        />
        <KPICard 
          title="Facilities" 
          value={summary?.facilities ?? 0} 
          icon={<Factory className="w-5 h-5" />} 
          isLoading={isSummaryLoading}
        />
        <KPICard 
          title="Single-Source Components" 
          value={singleSourceCount} 
          icon={<Cpu className="w-5 h-5" />} 
          isLoading={isSinglePointsLoading}
          description="Potential supply continuity risk"
          status={singleSourceCount > 0 ? "warning" : "success"}
        />
        <KPICard 
          title="Active Risks" 
          value={summary?.activeRisks ?? 0} 
          icon={<AlertTriangle className="w-5 h-5" />} 
          isLoading={isSummaryLoading}
          description={(summary?.activeRisks ?? 0) > 0 ? "Events require attention" : "No active disruptions"}
          status={(summary?.activeRisks ?? 0) > 0 ? "danger" : "success"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Attention Panel (Left 2 columns) */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Active Risk Events
              </h3>
              <Link to="/risks" className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1">
                View All Risks <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid gap-4">
              {isRisksLoading ? (
                 <div className="h-32 bg-card animate-pulse rounded-xl" />
              ) : activeRisks.length === 0 ? (
                 <div className="p-8 text-center text-muted border-2 border-dashed border-card-border rounded-xl bg-card">
                   <ShieldCheck className="w-12 h-12 text-success mx-auto mb-3 opacity-80" />
                   <p className="font-medium text-foreground">All Clear</p>
                   <p className="text-sm">No active risk events currently reported.</p>
                 </div>
              ) : (
                activeRisks.slice(0, 3).map(risk => (
                  <div key={risk.id} className="bg-card p-5 rounded-xl border border-card-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-foreground">{risk.title}</h4>
                        <StatusBadge status={risk.severity} />
                      </div>
                      <p className="text-sm text-muted mb-3">{risk.description}</p>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-muted">
                        <span className="bg-muted-light px-2 py-1 rounded">Type: {risk.type}</span>
                        <span className="bg-muted-light px-2 py-1 rounded">Est. Resolution: {formatDate(risk.expectedEndDate)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/risks/${risk.id}`)}
                      className="shrink-0 text-primary bg-primary-light hover:bg-primary hover:text-white transition-colors px-4 py-2 rounded-lg text-sm font-medium self-start sm:self-center"
                    >
                      Analyze Impact
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Critical Dependencies */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Cpu className="w-5 h-5 text-danger" />
                Critical Dependencies (Single Points of Failure)
              </h3>
              <Link to="/critical-dependencies" className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="bg-card rounded-xl border border-card-border shadow-sm overflow-hidden">
              {isSinglePointsLoading ? (
                <div className="p-8 text-center text-muted">Loading dependencies...</div>
              ) : !singlePoints || singlePoints.length === 0 ? (
                <div className="p-8 text-center text-muted">No single points of failure detected.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted-light/50 border-b border-card-border">
                        <th className="py-3 px-4 text-xs font-semibold text-muted uppercase">Component</th>
                        <th className="py-3 px-4 text-xs font-semibold text-muted uppercase">Sole Supplier</th>
                        <th className="py-3 px-4 text-xs font-semibold text-muted uppercase text-right">Exposure</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border">
                      {singlePoints.slice(0, 5).map(point => (
                        <tr key={point.componentId} className="hover:bg-muted-light/30">
                          <td className="py-3 px-4 text-sm font-medium text-foreground">{point.componentName}</td>
                          <td className="py-3 px-4 text-sm text-muted">
                            <Link to={`/suppliers`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                              {point.supplierName}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-danger text-right">
                            {formatCurrency(point.aggregateRevenueImpact)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: High Impact Suppliers & Quick Actions */}
        <div className="col-span-1 space-y-6">
          
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                High-Impact Suppliers
              </h3>
            </div>

            <div className="bg-card rounded-xl border border-card-border shadow-sm overflow-hidden">
              {isHighImpactLoading ? (
                <div className="p-8 text-center text-muted">Loading suppliers...</div>
              ) : !highImpact || highImpact.length === 0 ? (
                <div className="p-8 text-center text-muted">No supplier data available</div>
              ) : (
                <div className="divide-y divide-card-border">
                  {highImpact.slice(0, 5).map((supplier, idx) => (
                    <Link 
                      key={supplier.id} 
                      to={`/suppliers/${supplier.id}`} 
                      className="flex flex-col p-4 hover:bg-muted-light/50 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {idx + 1}. {supplier.name}
                        </span>
                        <StatusBadge status={supplier.riskScore > 75 ? 'Critical' : supplier.riskScore > 50 ? 'High' : 'Medium'} className="scale-90 origin-right" />
                      </div>
                      <div className="flex justify-between text-xs text-muted">
                        <span>Affects {supplier.affectedProducts} products</span>
                        <span className="font-semibold text-danger">Risk: {supplier.riskScore}/100</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <div className="bg-muted-light/30 border-t border-card-border p-3 text-center">
                <Link to="/suppliers" className="text-sm font-medium text-primary hover:text-primary-hover">
                  View Full Directory
                </Link>
              </div>
            </div>
          </section>

          <section className="bg-primary-light/50 p-6 rounded-xl border border-primary-light">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Quick Analysis Actions</h3>
            <div className="space-y-3">
              <Link to="/compare" className="flex items-center justify-between p-3 bg-card hover:border-primary border border-card-border rounded-lg text-sm font-medium text-foreground transition-all shadow-sm">
                Compare Product Dependencies
                <ArrowRight className="w-4 h-4 text-muted" />
              </Link>
              <Link to="/network" className="flex items-center justify-between p-3 bg-card hover:border-primary border border-card-border rounded-lg text-sm font-medium text-foreground transition-all shadow-sm">
                Explore a Product Network
                <ArrowRight className="w-4 h-4 text-muted" />
              </Link>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
