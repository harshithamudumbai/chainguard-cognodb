import type { ReactNode } from 'react';
import { SkeletonCard } from './LoadingState';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  isLoading?: boolean;
}

export function KPICard({ label, value, icon, trend, isLoading }: KPICardProps) {
  if (isLoading) return <SkeletonCard />;

  return (
    <div className="bg-card p-6 rounded-xl border border-card-hover flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-foreground/60">{label}</h3>
        <div className="text-primary/80 bg-primary/10 p-2 rounded-lg">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
      {trend && (
        <p className="text-xs text-foreground/50">{trend}</p>
      )}
    </div>
  );
}
