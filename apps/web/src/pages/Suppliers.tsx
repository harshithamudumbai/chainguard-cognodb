import { useSuppliers } from '../hooks/queries';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Suppliers() {
  const { data: suppliers, isLoading, isError, error, refetch } = useSuppliers();

  if (isLoading) return <LoadingState message="Loading suppliers..." />;
  if (isError) return <ErrorState message="Failed to load suppliers" code={(error as any)?.code} onRetry={refetch} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="text-primary w-6 h-6" />
          Supplier Directory
        </h2>
      </div>

      <div className="bg-card rounded-xl border border-card-hover overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-card-hover/50 text-foreground/70 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Supplier Name</th>
                <th className="px-6 py-4 font-medium">Tier</th>
                <th className="px-6 py-4 font-medium">Country</th>
                <th className="px-6 py-4 font-medium">Reliability Score</th>
                <th className="px-6 py-4 font-medium">Risk Score</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-hover">
              {suppliers?.map(supplier => (
                <tr key={supplier.id} className="hover:bg-card-hover/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{supplier.name}</td>
                  <td className="px-6 py-4">Tier {supplier.tier}</td>
                  <td className="px-6 py-4">{supplier.countryCode}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${supplier.reliabilityScore >= 90 ? 'text-success' : 'text-warning'}`}>
                      {supplier.reliabilityScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${supplier.riskScore > 30 ? 'text-danger' : supplier.riskScore > 15 ? 'text-warning' : 'text-success'}`}>
                      {supplier.riskScore}/100
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/suppliers/${supplier.id}`} className="text-primary hover:text-primary-hover inline-flex items-center gap-1">
                      Details <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
