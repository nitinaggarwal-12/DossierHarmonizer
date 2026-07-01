import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an exception:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans">
          {/* Background blurred radial glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="bg-slate-900/90 border border-slate-800 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-6">
            {/* Warning Icon Container */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-red-500/20">
              <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono font-bold tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/25 px-3 py-1 rounded-full uppercase">
                Platform Runtime Exception
              </span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight pt-1">
                Dossier Workspace Crashed
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans font-normal px-2">
                A client-side rendering exception has occurred in the eCTD navigator. The error has been captured locally.
              </p>
            </div>

            {/* Technical logs panel */}
            <div className="w-full p-4 bg-slate-950 border border-slate-850 rounded-2xl text-[10px] text-left text-slate-400 font-mono overflow-x-auto max-h-[120px] select-text">
              <span className="text-rose-500 font-bold block mb-1">Exception Payload:</span>
              {this.state.error?.message || 'Unknown runtime error'}
              {this.state.error?.stack && (
                <span className="text-slate-600 block mt-2 text-[9px] leading-tight">
                  {this.state.error.stack.split('\n').slice(0, 3).join('\n')}
                </span>
              )}
            </div>

            {/* Action controls */}
            <button
              onClick={this.handleReload}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/15 uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Platform Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
