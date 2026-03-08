import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-zinc-50 flex flex-col items-center justify-center p-4 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">Что-то пошло не так</h1>
          <p className="text-zinc-400 mb-4 max-w-sm">
            В приложении произошла непредвиденная ошибка. Пожалуйста, попробуйте обновить страницу.
          </p>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 text-left w-full max-w-md overflow-auto max-h-48">
            <code className="text-xs text-rose-400 font-mono">
              {this.state.error?.toString()}
            </code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 rounded-lg transition-colors"
          >
            Обновить приложение
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
