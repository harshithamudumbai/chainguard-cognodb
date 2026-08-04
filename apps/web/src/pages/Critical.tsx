import { useHighImpactSuppliers, useSinglePointsOfFailure } from '../hooks/queries';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { StatusBadge } from '../components/common/StatusBadge';
import { Building2, Cpu, AlertOctagon, Package, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/format';
import { Table } from '../components/common/Table';

export function Critical() {
  const { 
    data: highImpact, 
    isLoading: isLoadingHighImpact, 
    isError: isHighImpactError 
  } = useHighImpactSuppliers();

  const { 
    data: singlePoints, 
    isLoading: isLoadingSinglePoints, 
    isError: isSinglePointsError 
  } = useSinglePointsOfFailure();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="bg-danger-light/30 p-8 rounded-2xl border border-danger/20 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <AlertOctagon className="w-48 h-48" />
        </div>
        <div className="p-4 bg-danger/10 rounded-xl shrink-0 z-10">
          <AlertOctagon className="text-danger w-10 h-10" />
        </div>
        <div className="z-10">
          <h2 className="text-2xl font-bold mb-2 text-danger flex items-center gap-2">
            Critical Dependencies
          </h2>
          <p className="text-muted text-lg max-w-3xl leading-relaxed">
            Review critical vulnerabilities in your supply network. Address single points of failure (sole-sourced components) 
            and monitor suppliers whose disruption would cause severe cascading product failures.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Single Points of Failure */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Cpu className="w-5 h-5 text-warning" />
              Single-Source Components
            </h3>
            <span className="bg-warning-light text-warning text-xs font-bold px-2.5 py-1 rounded-full border border-warning/20">
              {singlePoints?.length || 0} Found
            </span>
          </div>
          
          <div className="bg-card rounded-xl border border-card-border shadow-sm overflow-hidden min-h-[400px]">
            {isLoadingSinglePoints ? (
               <div className="p-12"><LoadingState message="Analyzing components..." /></div>
            ) : isSinglePointsError ? (
               <div className="p-6"><ErrorState message="Failed to load single points of failure." /></div>
            ) : !singlePoints || singlePoints.length === 0 ? (
               <div className="p-12 text-center text-muted">No single points of failure detected.</div>
            ) : (
              <div className="divide-y divide-card-border">
                {singlePoints.map((item) => (
                  <div key={item.componentId} className="p-6 hover:bg-muted-light/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-lg text-foreground">{item.componentName}</h4>
                        <div className="text-sm text-muted mt-1 flex items-center gap-1">
                          Sole Supplier: 
                          <span className="font-semibold text-primary flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {item.supplierName}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status="Single Source" />
                    </div>
                    
                    <div className="bg-background rounded-xl p-4 border border-card-border grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-1 flex items-center gap-1">
                          <Package className="w-3 h-3" /> Dependent Products
                        </div>
                        <div className="text-lg font-bold text-foreground mb-2">{item.productNames.length}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {item.productNames.map(name => (
                            <span key={name} className="px-2 py-1 bg-muted-light rounded-md text-[10px] font-medium text-foreground">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-1 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> Revenue at Risk
                        </div>
                        <div className="text-lg font-bold text-danger">
                          {formatCurrency(item.aggregateRevenueImpact)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* High Impact Suppliers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              High-Impact Suppliers
            </h3>
            <span className="bg-primary-light/50 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20">
              Top {highImpact?.length || 0}
            </span>
          </div>
          
          <div className="bg-card rounded-xl border border-card-border shadow-sm overflow-hidden min-h-[400px] flex flex-col">
             {isLoadingHighImpact ? (
               <div className="p-12 flex-1"><LoadingState message="Ranking suppliers..." /></div>
            ) : isHighImpactError ? (
               <div className="p-6 flex-1"><ErrorState message="Failed to load high impact suppliers." /></div>
            ) : !highImpact || highImpact.length === 0 ? (
               <div className="p-12 text-center text-muted flex-1">No data available.</div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <Table
                  data={highImpact || []}
                  keyExtractor={(s) => s.id}
                  columns={[
                    {
                      header: "Rank & Supplier",
                      accessor: (s, idx) => (
                        <div className="flex items-center gap-3">
                          <span className="text-muted font-bold w-4">{idx + 1}.</span>
                          <Link to={`/suppliers/${s.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                            {s.name}
                          </Link>
                        </div>
                      )
                    },
                    {
                      header: "Affected Products",
                      align: "center",
                      accessor: (s) => (
                        <span className="font-medium text-foreground bg-muted-light px-2 py-1 rounded-md">
                          {s.affectedProducts}
                        </span>
                      )
                    },
                    {
                      header: "Risk Score",
                      align: "center",
                      accessor: (s) => (
                        <div className="flex flex-col items-center">
                          <span className={`font-bold text-lg ${s.riskScore > 75 ? 'text-danger' : s.riskScore > 50 ? 'text-warning' : 'text-success'}`}>
                            {s.riskScore}
                          </span>
                          <div className="w-16 h-1.5 bg-muted-light rounded-full overflow-hidden mt-1">
                            <div 
                              className={`h-full ${s.riskScore > 75 ? 'bg-danger' : s.riskScore > 50 ? 'bg-warning' : 'bg-success'}`}
                              style={{ width: `${s.riskScore}%` }}
                            />
                          </div>
                        </div>
                      )
                    }
                  ]}
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
