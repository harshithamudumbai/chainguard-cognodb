import type { ReactNode } from 'react';
import { SkeletonCard } from './LoadingState';
import { cn } from '../../utils/cn';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  status?: 'success' | 'warning' | 'danger' | 'info';
  action?: ReactNode;
  isLoading?: boolean;
}

export function KPICard({ title, value, icon, description, status, action, isLoading }: KPICardProps) {
  if (isLoading) return <SkeletonCard />;

  return (
    <div className="bg-card p-6 rounded-xl border border-card-border shadow-card flex flex-col relative overflow-hidden transition-shadow hover:shadow-elevated">
      {status && (
        <div className={cn(
          "absolute top-0 left-0 w-1 h-full",
          status === 'danger' && "bg-danger",
          status === 'warning' && "bg-warning",
          status === 'success' && "bg-success",
          status === 'info' && "bg-info"
        )} />
      )}
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-muted">{title}</h3>
        <div className="text-primary bg-primary-light p-2 rounded-lg">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
      {description && (
        <p className="text-sm text-muted mb-4">{description}</p>
      )}
      <div className="mt-auto">
        {action}
      </div>
    </div>
  );
}
