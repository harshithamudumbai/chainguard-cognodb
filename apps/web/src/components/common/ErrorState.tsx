import { AlertOctagon, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  code?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, code, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-danger/30 rounded-xl bg-danger/5 h-full min-h-[300px]">
      <AlertOctagon className="w-12 h-12 text-danger mb-4" />
      <h3 className="text-lg font-semibold text-danger mb-2">Something went wrong</h3>
      <p className="text-sm text-foreground/80 max-w-md mb-4">{message}</p>
      
      {code && (
        <span className="text-xs font-mono bg-danger/10 text-danger px-2 py-1 rounded mb-6">
          Error Code: {code}
        </span>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-card-hover border border-card text-foreground rounded-lg transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
