import React, { Component, ErrorInfo, ReactNode } from 'react';
import logger from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ERROR_BOUNDARY', 'Error caught by ErrorBoundary', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
    }, 'ErrorBoundary', 'CATCH_ERROR');

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center h-screen p-6">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-bold text-destructive">
              Что-то пошло не так
            </h2>
            <p className="text-muted-foreground">
              An error occurred while loading the component. Please refresh the page.
            </p>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm font-medium">
                  Детали ошибки
                </summary>
                <pre className="mt-2 text-xs bg-muted p-4 rounded overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => {
                logger.info('ERROR_BOUNDARY', 'Retry attempt after error', undefined, 'ErrorBoundary', 'RETRY');
                window.location.reload();
              }}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
