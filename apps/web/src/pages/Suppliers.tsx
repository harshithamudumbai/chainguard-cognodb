import { useSuppliers } from '../hooks/queries';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { Building2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../components/common/Table';
import { StatusBadge } from '../components/common/StatusBadge';

export function Suppliers() {
  const { data: suppliers, isLoading, isError, error, refetch } = useSuppliers();
  const navigate = useNavigate();

  if (isLoading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <LoadingState message="Loading supplier directory..." />
    </div>
  );
  
  if (isError) return (
    <div className="max-w-3xl mx-auto mt-10">
      <ErrorState message="Failed to load suppliers" code={(error as any)?.code} onRetry={refetch} />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <div className="p-2 bg-primary-light text-primary rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            Supplier Directory
          </h2>
          <p className="text-muted text-sm max-w-2xl">
            Browse all registered suppliers, their tier classification, country of origin, and associated reliability and risk scores.
          </p>
        </div>
        <div className="bg-muted-light/50 px-4 py-2 rounded-lg border border-card-border text-sm font-semibold text-muted">
          {suppliers?.length || 0} Total Suppliers
        </div>
      </div>

      <div className="bg-card rounded-xl border border-card-border shadow-sm overflow-hidden">
        <Table
          data={suppliers || []}
          keyExtractor={(s) => s.id}
          onRowClick={(s) => navigate(`/suppliers/${s.id}`)}
          columns={[
            {
              header: "Supplier Name",
              accessor: (s) => <span className="font-semibold text-foreground">{s.name}</span>
            },
            {
              header: "Tier",
              accessor: (s) => (
                <span className="bg-muted-light text-muted px-2 py-1 rounded text-xs font-semibold">
                  Tier {s.tier}
                </span>
              )
            },
            {
              header: "Country",
              accessor: (s) => s.countryCode
            },
            {
              header: "Reliability",
              align: "center",
              accessor: (s) => (
                <div className="flex flex-col items-center">
                  <span className={`font-semibold text-sm ${s.reliabilityScore >= 90 ? 'text-success' : 'text-warning'}`}>
                    {s.reliabilityScore}%
                  </span>
                </div>
              )
            },
            {
              header: "Risk Score",
              align: "center",
              accessor: (s) => (
                <div className="flex flex-col items-center">
                  <StatusBadge 
                    status={s.riskScore > 75 ? 'Critical' : s.riskScore > 50 ? 'High' : s.riskScore > 25 ? 'Medium' : 'Low'} 
                    className="mb-1 w-20"
                  />
                  <span className="text-xs font-semibold text-muted">{s.riskScore}/100</span>
                </div>
              )
            },
            {
              header: "Action",
              align: "right",
              accessor: () => (
                <div className="text-primary hover:text-primary-hover inline-flex items-center gap-1 font-medium text-sm transition-colors">
                  Details <ArrowRight className="w-4 h-4" />
                </div>
              )
            }
          ]}
        />
      </div>
    </div>
  );
}
