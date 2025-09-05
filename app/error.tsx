'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="p-4 bg-red-400/20 rounded-2xl w-fit mx-auto">
          <AlertTriangle className="w-12 h-12 text-red-400" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text-primary">
            Something went wrong!
          </h1>
          <p className="text-text-secondary">
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            onClick={reset}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Go Home
          </Button>
        </div>

        {error.digest && (
          <p className="text-xs text-text-secondary font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
