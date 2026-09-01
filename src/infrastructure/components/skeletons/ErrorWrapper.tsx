// components/common/ErrorWrapper.tsx
import React, { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/infrastructure/components/ui/alert';
import { Button } from '@/infrastructure/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorWrapperProps {
  error: Error | null;
  children: ReactNode;
  onRetry?: () => void;
  title?: string;
  showDetails?: boolean; // Show error stack in dev mode
  fallback?: ReactNode; // Custom error UI
}

export const ErrorWrapper: React.FC<ErrorWrapperProps> = ({
  error,
  children,
  onRetry,
  title = 'Error',
  showDetails = false,
  fallback,
}) => {
  if (!error) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          <div className="space-y-3">
            <p>{error.message || 'Something went wrong. Please try again.'}</p>

            {showDetails && error.stack && (
              <details className="text-xs">
                <summary className="cursor-pointer font-medium">
                  Error Details
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                  {error.stack}
                </pre>
              </details>
            )}

            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
