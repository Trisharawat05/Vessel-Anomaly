import React from 'react';
import { DetectionStatus } from '@/lib/types';
import { ShieldCheck, AlertTriangle, Cpu, Layers } from 'lucide-react';

interface StatusBadgeProps {
  status: DetectionStatus | 'api_connected' | 'api_disconnected' | 'demo';
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs font-medium space-x-1'
      : 'px-2.5 py-1 text-xs font-semibold space-x-1.5';

  switch (status) {
    case 'normal':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60 ${sizeClasses} ${className}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Normal</span>
        </span>
      );

    case 'ml_candidate':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 ${sizeClasses} ${className}`}
        >
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span>ML Candidate</span>
        </span>
      );

    case 'math_candidate':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 ${sizeClasses} ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Math Candidate</span>
        </span>
      );

    case 'both_models':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse ${sizeClasses} ${className}`}
        >
          <Layers className="w-3.5 h-3.5 text-rose-400" />
          <span>Both Models</span>
        </span>
      );

    case 'api_connected':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${sizeClasses} ${className}`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>API Connected</span>
        </span>
      );

    case 'api_disconnected':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 ${sizeClasses} ${className}`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Demo Mode (Mock API)</span>
        </span>
      );

    case 'demo':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-800 text-slate-400 border border-slate-700/80 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ${className}`}
        >
          Demo data
        </span>
      );

    default:
      return null;
  }
};
