import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from './Card';
import { reportDiagnostic } from '../../utils/diagnostics';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback; receives the error and a reset function. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render errors so a single bad page never blanks the whole app.
 * Wrap route output with it and key it by pathname so navigation resets state.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    reportDiagnostic({
      type: 'render',
      message: error.message || 'Render error',
      source: info.componentStack,
      stack: error.stack,
      url: location.href,
    });
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <Card className="p-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-mcd-red shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-mcd-gray-900 dark:text-mcd-gray-50">
              Something went wrong
            </h2>
            <p className="mt-1 text-sm text-mcd-gray-600 dark:text-mcd-gray-300">
              This page hit an unexpected error. Your data is safe - navigate to another
              page or try again below.
            </p>
            {error.message && (
              <pre className="mt-3 p-3 rounded-lg bg-mcd-gray-100 dark:bg-mcd-gray-800 text-xs font-mono text-mcd-gray-700 dark:text-mcd-gray-200 overflow-auto">
                {error.message}
              </pre>
            )}
            <button onClick={this.reset} className="btn-secondary text-sm mt-4">
              <RefreshCw className="w-4 h-4 mr-1" /> Try again
            </button>
          </div>
        </div>
      </Card>
    );
  }
}
