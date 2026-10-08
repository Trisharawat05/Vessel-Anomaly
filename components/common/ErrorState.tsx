import React from 'react';
import { AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { setMockModeOverride } from '@/lib/api';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  showSwitchToDemo?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Unable to connect to the analytics API.',
  onRetry,
  showSwitchToDemo = true,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-slate-900/80 border border-amber-500/30 backdrop-blur-md max-w-lg mx-auto my-8 shadow-xl">
      <div className="p-3.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-white mb-2">API Connection Failed</h3>
      <p className="text-sm text-slate-300 mb-6 leading-relaxed">
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-medium text-sm hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        )}

        {showSwitchToDemo && (
          <button
            onClick={() => setMockModeOverride(true)}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-medium text-sm hover:bg-slate-700 transition-colors"
          >
            <Database className="w-4 h-4 mr-2 text-cyan-400" />
            Use Demo Data
          </button>
        )}
      </div>
    </div>
  );
};
