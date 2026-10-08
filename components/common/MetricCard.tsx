import React, { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  accentColor?: 'cyan' | 'amber' | 'rose' | 'teal' | 'blue';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = 'cyan',
  className = '',
}) => {
  const accentGlow = {
    cyan: 'from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-400',
    amber: 'from-amber-500/10 to-transparent border-amber-500/20 text-amber-400',
    rose: 'from-rose-500/10 to-transparent border-rose-500/20 text-rose-400',
    teal: 'from-teal-500/10 to-transparent border-teal-500/20 text-teal-400',
    blue: 'from-blue-500/10 to-transparent border-blue-500/20 text-blue-400',
  }[accentColor];

  const iconBg = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  }[accentColor];

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 shadow-lg transition-all duration-200 hover:border-slate-700/90 hover:translate-y-[-1px] ${className}`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${accentGlow} rounded-full blur-2xl pointer-events-none opacity-50`} />

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg border ${iconBg}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-3xl font-extrabold tracking-tight text-white font-mono">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="mt-1 flex items-center text-xs text-slate-400 font-medium">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-500 mr-2" />
          <span>{subtitle}</span>
        </div>
      </div>
    </div>
  );
};
