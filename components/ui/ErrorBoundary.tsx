'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

export function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <Card className="text-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-error/20 rounded-full">
          <AlertTriangle className="w-8 h-8 text-error" />
        </div>
        <div className="space-y-2">
          <h3 className="text-heading-4 text-text-primary">Something went wrong</h3>
          <p className="text-body-small text-text-secondary max-w-md">
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </p>
          {error && process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-text-muted text-caption">
                Error details (development only)
              </summary>
              <pre className="mt-2 p-4 bg-surface rounded-lg text-caption text-text-muted overflow-auto">
                {error.message}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
        <Button onClick={resetError} variant="primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </Card>
  );
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    // You could also send this to an error reporting service
  };
}
