import { 
  useDashboardSummary, 
  useHighImpactSuppliers, 
  useRisks
} from '../hooks/queries';
import { KPICard } from '../components/common/KPICard';
import { ErrorState } from '../components/common/ErrorState';
import { StatusBadge } from '../components/common/StatusBadge';
import { Package, Cpu, Building2, Factory, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { 
    data: summary, 
    isLoading: isSummaryLoading, 
    isError: isSummaryError,
    error: summaryError,
    refetch: refetchSummary
  } = useDashboardSummary();

  const { data: highImpact, isLoading: isHighImpactLoading } = useHighImpactSuppliers();
  const { data: risks, isLoading: isRisksLoading } = useRisks();

  if (isSummaryError) {
    return <ErrorState message="Failed to load dashboard summary." code={(summaryError as any)?.code} onRetry={refetchSummary} />;
  }

  const activeRisks = risks?.filter(r => r.status === 'ACTIVE') || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header section with description */}
      <div className="bg-card/30 p-6 rounded-2xl border border-primary/20">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <ShieldAlert className="text-primary w-6 h-6" />
          Welcome to ChainGuard
        </h2>
        <p className="text-foreground/70 max-w-3xl">
          ChainGuard helps you visualize and analyze hidden supply-chain risks. 
          Monitor active disruptions, identify single points of failure, and explore multi-hop dependencies to protect your product network.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard 
          label="Total Products" 
          value={summary?.products ?? 0} 
          icon={<Package className="w-5 h-5" />} 
          isLoading={isSummaryLoading}
        />
        <KPICard 
          label="Components" 
          value={summary?.components ?? 0} 
          icon={<Cpu className="w-5 h-5" />} 
          isLoading={isSummaryLoading}
        />
        <KPICard 
          label="Suppliers" 
          value={summary?.suppliers ?? 0} 
          icon={<Building2 className="w-5 h-5" />} 
          isLoading={isSummaryLoading}
        />
        <KPICard 
          label="Facilities" 
          value={summary?.facilities ?? 0} 
          icon={<Factory className="w-5 h-5" />} 
          isLoading={isSummaryLoading}
        />
        <KPICard 
          label="Active Risks" 
          value={summary?.activeRisks ?? 0} 
          icon={<AlertTriangle className="w-5 h-5 text-danger" />} 
          isLoading={isSummaryLoading}
          trend="Needs attention"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Risks */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Active Risk Events
            </h3>
            <Link to="/risks" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {isRisksLoading ? (
               <div className="h-32 bg-card animate-pulse rounded-xl" />
            ) : activeRisks.length === 0 ? (
               <div className="p-6 text-center text-foreground/50 border border-dashed border-card-hover rounded-xl">
                 No active risk events currently reported.
               </div>
            ) : (
              activeRisks.map(risk => (
                <Link 
                  key={risk.id} 
                  to={`/risks/${risk.id}`}
                  className="block bg-card p-4 rounded-xl border border-card-hover hover:border-primary/50 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold group-hover:text-primary transition-colors">{risk.title}</h4>
                    <StatusBadge status={risk.severity} />
                  </div>
                  <p className="text-sm text-foreground/70 mb-3">{risk.description}</p>
                  <div className="text-xs text-foreground/50 flex items-center gap-4">
                    <span>Type: {risk.type}</span>
                    <span>Expected End: {risk.expectedEndDate}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* High Impact Suppliers */}
        <div className="col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              High Impact Suppliers
            </h3>
            <Link to="/suppliers" className="text-sm text-primary hover:underline flex items-center gap-1">
              All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-card rounded-xl border border-card-hover overflow-hidden">
            {isHighImpactLoading ? (
              <div className="p-6 text-center">Loading...</div>
            ) : highImpact?.length === 0 ? (
              <div className="p-6 text-center text-sm text-foreground/50">No data available</div>
            ) : (
              <div className="divide-y divide-card-hover">
                {highImpact?.map((supplier, idx) => (
                  <Link key={supplier.id} to={`/suppliers/${supplier.id}`} className="flex items-center justify-between p-4 hover:bg-card-hover transition-colors">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {idx + 1}. {supplier.name}
                      </div>
                      <div className="text-xs text-foreground/50 mt-1">
                        Affects {supplier.affectedProducts} products
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-danger font-semibold">Risk: {supplier.riskScore}/100</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
