import { cn } from '../../utils/cn';

type StatusType = 'Active' | 'Resolved' | 'High' | 'Medium' | 'Low' | 'Critical' | 'Connected' | 'Unavailable' | string;

export function StatusBadge({ status }: { status: StatusType }) {
  const s = status.toUpperCase();
  
  let colors = "bg-card text-foreground border-card-hover"; // default
  
  if (s === 'ACTIVE' || s === 'HIGH' || s === 'DEGRADED') {
    colors = "bg-warning/20 text-warning border-warning/30";
  } else if (s === 'CRITICAL' || s === 'UNAVAILABLE') {
    colors = "bg-danger/20 text-danger border-danger/30";
  } else if (s === 'RESOLVED' || s === 'CONNECTED' || s === 'OPERATIONAL' || s === 'LOW') {
    colors = "bg-success/20 text-success border-success/30";
  } else if (s === 'MEDIUM') {
    colors = "bg-primary/20 text-primary border-primary/30";
  }

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", colors)}>
      {status}
    </span>
  );
}
