import { SearchX } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ 
  title, 
  description, 
  icon = <SearchX className="w-10 h-10" />, 
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-card rounded-xl bg-card/20 h-full min-h-[300px]">
      <div className="text-foreground/40 mb-4 bg-card/50 p-4 rounded-full">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-foreground/60 max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
