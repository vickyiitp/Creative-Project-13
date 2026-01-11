import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4 text-center font-mono">
          <div className="bg-red-900/20 p-8 rounded-xl border border-red-500/50 max-w-lg">
            <h1 className="text-3xl font-bold text-red-500 mb-4">CRITICAL SYSTEM FAILURE</h1>
            <p className="text-slate-300 mb-6">The physics engine encountered an unrecoverable error.</p>
            <pre className="bg-slate-950 p-4 rounded text-left text-xs text-red-300 overflow-auto mb-6 max-h-32">
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              REBOOT SYSTEM
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;