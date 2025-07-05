import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Generate unique error ID for tracking
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({ error, errorInfo, errorId });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // In production, you would send this to your error tracking service
    // Example: Sentry, LogRocket, etc.
    this.logErrorToService(error, errorInfo, errorId);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo, errorId: string) => {
    // Simulate sending error to external service
    const errorData = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // In a real app, you would send this to your error tracking service
    console.log('Error logged:', errorData);
    
    // Example: fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorData) });
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleGoBack = () => {
    window.history.back();
  };

  private handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorReport = `
Error Report (ID: ${errorId})

Error: ${error?.message}
Stack: ${error?.stack}

Component Stack: ${errorInfo?.componentStack}

URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `;

    // Copy to clipboard
    navigator.clipboard.writeText(errorReport).then(() => {
      alert('Error report copied to clipboard. Please send this to support.');
    }).catch(() => {
      // Fallback: open email client
      const subject = encodeURIComponent(`Error Report - ${errorId}`);
      const body = encodeURIComponent(errorReport);
      window.open(`mailto:support@sealkloud.com?subject=${subject}&body=${body}`);
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h2>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                We're sorry, but something unexpected happened. Our team has been notified.
              </p>

              {this.state.errorId && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 mb-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Error ID: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{this.state.errorId}</code>
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={this.handleGoBack}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                  </button>

                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </button>
                </div>

                <button
                  onClick={this.handleReportError}
                  className="w-full text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Report this error
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded text-xs font-mono text-red-800 dark:text-red-200 overflow-auto max-h-40">
                    <div className="mb-2 font-semibold">Error:</div>
                    <div className="mb-2">{this.state.error.message}</div>
                    <div className="mb-2 font-semibold">Stack:</div>
                    <div className="whitespace-pre-wrap">{this.state.error.stack}</div>
                    {this.state.errorInfo && (
                      <>
                        <div className="mb-2 font-semibold mt-2">Component Stack:</div>
                        <div className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</div>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 