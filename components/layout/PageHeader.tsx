import React, { ReactNode } from 'react';
import { Radar } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  showRadarSweep?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  showRadarSweep = false,
}) => {
  return (
    <div className="relative mb-6 pb-4 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-start space-x-3">
        {showRadarSweep && (
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 shrink-0 mt-0.5">
            <Radar className="w-5 h-5 text-cyan-400 animate-radar-sweep" />
          </div>
        )}
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{title}</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {actions && <div className="flex items-center space-x-2 shrink-0">{actions}</div>}
    </div>
  );
};
