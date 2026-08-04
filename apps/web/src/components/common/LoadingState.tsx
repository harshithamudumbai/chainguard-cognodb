import { Loader2 } from 'lucide-react';

export function LoadingState({ message = "Loading data..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-foreground/60 h-full min-h-[200px]">
      <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-card p-6 rounded-xl border border-card-hover animate-pulse">
      <div className="h-4 bg-card-hover rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-card-hover rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-card-hover rounded w-1/4"></div>
    </div>
  );
}
