import { cn } from '../../utils/cn';

type StatusType = 'Active' | 'Resolved' | 'High' | 'Medium' | 'Low' | 'Critical' | 'Connected' | 'Unavailable' | string;

export function StatusBadge({ status, className }: { status: StatusType; className?: string }) {
  const s = status.toUpperCase();
  
  let colors = "bg-muted-light text-muted border-card-border"; // default
  
  if (s === 'ACTIVE' || s === 'HIGH' || s === 'DEGRADED') {
    colors = "bg-warning-light text-warning border-warning/20";
  } else if (s === 'CRITICAL' || s === 'UNAVAILABLE' || s === 'AT RISK' || s === 'SINGLE SOURCE') {
    colors = "bg-danger-light text-danger border-danger/20";
  } else if (s === 'RESOLVED' || s === 'CONNECTED' || s === 'OPERATIONAL' || s === 'LOW' || s === 'STABLE' || s === 'MULTI SOURCE') {
    colors = "bg-success-light text-success border-success/20";
  } else if (s === 'MEDIUM') {
    colors = "bg-info-light text-info border-info/20";
  }

  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border inline-flex items-center justify-center whitespace-nowrap", colors, className)}>
      {status}
    </span>
  );
}
