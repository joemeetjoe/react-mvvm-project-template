import * as React from 'react';
import { useRouter } from '@tanstack/react-router';

import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';

interface RouteErrorBoundaryProps {
  error: Error;
}

export const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({ error }) => {
  const router = useRouter();

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    router.navigate({ to: '/' });
  };

  const handleRetry = () => {
    router.invalidate();
  };

  const getErrorInfo = (error: Error) => {
    const message = error.message || 'An unexpected error occurred';

    if (message.includes('not found') || message.includes('404')) {
      return {
        title: 'Not Found',
        description: 'The page or resource you are looking for could not be found.',
        showRetry: false,
      };
    }

    if (message.includes('unauthorized') || message.includes('401') || message.includes('403')) {
      return {
        title: 'Access Denied',
        description: 'You do not have permission to view this resource.',
        showRetry: false,
      };
    }

    return {
      title: 'Something Went Wrong',
      description: message,
      showRetry: true,
    };
  };

  const errorInfo = getErrorInfo(error);

  return (
    <div className="flex min-h-96 items-center justify-center p-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle role="heading" aria-level={1}>
            {errorInfo.title}
          </CardTitle>
          <CardDescription>{errorInfo.description}</CardDescription>
        </CardHeader>
        {import.meta.env.DEV && (
          <CardContent>
            <pre className="overflow-auto">{error.stack}</pre>
          </CardContent>
        )}
        <CardFooter>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleGoBack}>
              Go Back
            </Button>
            {errorInfo.showRetry && <Button onClick={handleRetry}>Retry</Button>}
            <Button variant="outline" onClick={handleGoHome}>
              Go Home
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
