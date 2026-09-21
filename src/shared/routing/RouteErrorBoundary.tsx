import * as React from 'react';
import { useRouter } from '@tanstack/react-router';

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
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{errorInfo.title}</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">{errorInfo.description}</p>
      <div className="flex gap-3">
        <button
          onClick={handleGoBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Go Back
        </button>
        {errorInfo.showRetry && (
          <button
            onClick={handleRetry}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        )}
        <button
          onClick={handleGoHome}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Go Home
        </button>
      </div>
      {import.meta.env.DEV && (
        <pre className="mt-6 p-4 bg-gray-100 rounded text-xs text-gray-600 max-w-lg overflow-auto">
          {error.stack}
        </pre>
      )}
    </div>
  );
};
