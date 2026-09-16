import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({
  message = 'Loading...',
  size = 'md',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {message && <span className="text-sm">{message}</span>}
    </div>
  );
}
