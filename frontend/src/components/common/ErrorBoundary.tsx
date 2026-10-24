import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Urjaa ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-warm-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 text-center space-y-4 border-rose-200 dark:border-rose-900/60 shadow-soft">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-serif font-bold text-plum-950 dark:text-white">
                Something unexpected occurred
              </h2>
              <p className="text-xs text-plum-600 dark:text-slate-400 leading-relaxed">
                {this.state.error?.message ||
                  'The application encountered a display issue. Your saved wellness logs are safe.'}
              </p>
            </div>
            <Button
              variant="rose"
              size="md"
              leftIcon={<RotateCcw className="w-4 h-4" />}
              onClick={this.handleReset}
              className="w-full"
            >
              Refresh Application
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
