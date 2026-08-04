import { useHighImpactSuppliers, useSinglePointsOfFailure } from '../hooks/queries';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { StatusBadge } from '../components/common/StatusBadge';
import { Building2, Cpu, AlertOctagon } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      
      <div className="bg-danger/10 p-6 rounded-2xl border border-danger/20 flex gap-4">
        <div className="p-3 bg-danger/20 rounded-xl shrink-0 h-fit">
          <AlertOctagon className="text-danger w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2 text-danger">Critical Dependencies</h2>
          <p className="text-foreground/70 max-w-3xl">
            Review vulnerabilities in the supply network. Address single points of failure 
            and monitor suppliers whose disruption would cause cascading product failures.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Single Points of Failure */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Cpu className="w-5 h-5 text-warning" />
            Single Source Components
          </h3>
          
          <div className="bg-card rounded-xl border border-card-hover overflow-hidden">
            {isLoadingSinglePoints ? (
               <LoadingState message="Analyzing..." />
            ) : isSinglePointsError ? (
               <ErrorState message="Failed to load single points of failure." />
            ) : singlePoints?.length === 0 ? (
               <div className="p-6 text-center text-foreground/50">No single points of failure detected.</div>
            ) : (
              <div className="divide-y divide-card-hover">
                {singlePoints?.map((item) => (
                  <div key={item.componentId} className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{item.componentName}</h4>
                      <StatusBadge status="CRITICAL" />
                    </div>
                    <div className="text-sm text-foreground/70 mb-4">
                      Sole Supplier: <span className="font-semibold text-primary">{item.supplierName}</span>
                    </div>
                    <div className="bg-background rounded-lg p-3 border border-card-hover">
                      <div className="text-xs text-foreground/50 mb-1">Impacts {item.dependentProducts} Products</div>
                      <div className="font-medium text-sm text-danger mb-2">
                        ${(item.aggregateRevenueImpact / 1000000).toFixed(1)}M Revenue at Risk
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.productNames.map(name => (
                          <span key={name} className="px-2 py-1 bg-card rounded text-xs border border-card-hover">
                            {name}
                          </span>
                        ))}
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
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            High Impact Suppliers
          </h3>
          
          <div className="bg-card rounded-xl border border-card-hover overflow-hidden">
             {isLoadingHighImpact ? (
               <LoadingState message="Analyzing..." />
            ) : isHighImpactError ? (
               <ErrorState message="Failed to load high impact suppliers." />
            ) : highImpact?.length === 0 ? (
               <div className="p-6 text-center text-foreground/50">No data available.</div>
            ) : (
              <div className="divide-y divide-card-hover">
                {highImpact?.map((supplier, idx) => (
                  <div key={supplier.id} className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <span className="text-foreground/40 text-sm">#{idx + 1}</span>
                        <Link to={`/suppliers/${supplier.id}`} className="hover:text-primary transition-colors">
                          {supplier.name}
                        </Link>
                      </h4>
                      <div className="text-right">
                        <div className="text-xs text-foreground/50 mb-1">Risk Score</div>
                        <span className={`font-bold ${supplier.riskScore > 30 ? 'text-danger' : supplier.riskScore > 15 ? 'text-warning' : 'text-success'}`}>
                          {supplier.riskScore}/100
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 bg-background p-3 rounded-lg border border-card-hover">
                      <div>
                        <div className="text-xs text-foreground/50">Affected Products</div>
                        <div className="font-medium">{supplier.affectedProducts}</div>
                      </div>
                      <div>
                         <div className="text-xs text-foreground/50">Revenue Exposure</div>
                        <div className="font-medium text-danger">${(supplier.totalRevenueExposure / 1000000).toFixed(1)}M</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
