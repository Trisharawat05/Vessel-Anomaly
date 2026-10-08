import React from 'react';
import { Layers, AlertTriangle, Cpu, Info } from 'lucide-react';

interface ModelAgreementChartProps {
  bothCount?: number;
  mathOnlyCount?: number;
  mlOnlyCount?: number;
}

export const ModelAgreementChart: React.FC<ModelAgreementChartProps> = ({
  bothCount = 19,
  mathOnlyCount = 190,
  mlOnlyCount = 3565,
}) => {
  const totalCandidates = bothCount + mathOnlyCount + mlOnlyCount; // 3774 total distinct candidate observations

  const bothPct = ((bothCount / totalCandidates) * 100).toFixed(1);
  const mathPct = ((mathOnlyCount / totalCandidates) * 100).toFixed(1);
  const mlPct = ((mlOnlyCount / totalCandidates) * 100).toFixed(1);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200">Detection Agreement</h3>
        <p className="text-xs text-slate-400">
          Overlap and divergence between mathematical and machine learning models
        </p>
      </div>

      {/* Visual Stacked Progress Indicator */}
      <div className="space-y-1.5">
        <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
          <div
            style={{ width: `${Math.max(Number(bothPct), 1.5)}%` }}
            className="h-full bg-rose-500 rounded-l transition-all duration-300"
            title={`Both Models: ${bothCount}`}
          />
          <div
            style={{ width: `${mathPct}%` }}
            className="h-full bg-cyan-500 transition-all duration-300"
            title={`Mathematical Only: ${mathOnlyCount}`}
          />
          <div
            style={{ width: `${mlPct}%` }}
            className="h-full bg-amber-500 rounded-r transition-all duration-300"
            title={`ML Only: ${mlOnlyCount}`}
          />
        </div>

        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>Shared: {bothPct}%</span>
          <span>Math Only: {mathPct}%</span>
          <span>ML Only: {mlPct}%</span>
        </div>
      </div>

      {/* 3 Metric Cards Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Both Models */}
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-400 mb-1">
            <span className="text-xs font-semibold">Both Models</span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {bothCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-rose-300/80 font-mono mt-0.5">
            High Priority Flag
          </div>
        </div>

        {/* Mathematical Only */}
        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-400 mb-1">
            <span className="text-xs font-semibold">Math Only</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {mathOnlyCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-cyan-300/80 font-mono mt-0.5">
            Rule-Based Flag
          </div>
        </div>

        {/* ML Only */}
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-xs font-semibold">ML Only</span>
            <Cpu className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {mlOnlyCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-amber-300/80 font-mono mt-0.5">
            Isolation Forest
          </div>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Agreement between independent detection approaches can help prioritize observations for further review.
        </p>
      </div>
    </div>
  );
};
