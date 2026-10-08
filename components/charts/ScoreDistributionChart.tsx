'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { ScoreDistributionBin } from '@/lib/types';
import { Sliders } from 'lucide-react';

interface ScoreDistributionChartProps {
  data: ScoreDistributionBin[];
  mathThreshold?: number;
}

export const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({
  data,
  mathThreshold = 0.7,
}) => {
  const [activeModel, setActiveModel] = useState<'math' | 'ml'>('math');

  const chartColor = activeModel === 'math' ? '#06b6d4' : '#f59e0b'; // cyan vs amber

  return (
    <div className="flex flex-col h-full">
      {/* Header controls & toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Anomaly Score Distribution
          </h3>
          <p className="text-xs text-slate-400">
            Observation density across calculated detection scores
          </p>
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
          <button
            onClick={() => setActiveModel('math')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeModel === 'math'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mathematical Score
          </button>
          <button
            onClick={() => setActiveModel('ml')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeModel === 'ml'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Isolation Forest Score
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 min-h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="mathGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="mlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="binRange"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value as number;
                  return (
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 shadow-xl text-xs">
                      <div className="font-semibold text-white mb-1">Score Range: {label}</div>
                      <div className="text-slate-300 flex items-center justify-between gap-4 font-mono">
                        <span>
                          {activeModel === 'math' ? 'Mathematical Count:' : 'Isolation Forest Count:'}
                        </span>
                        <span className="font-bold text-cyan-400">{val.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {activeModel === 'math' && (
              <ReferenceLine
                x="0.7 - 0.8"
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: `Threshold: ${mathThreshold}`,
                  fill: '#ef4444',
                  fontSize: 11,
                  position: 'top',
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey={activeModel === 'math' ? 'mathCount' : 'mlCount'}
              stroke={chartColor}
              strokeWidth={2}
              fillOpacity={1}
              fill={activeModel === 'math' ? 'url(#mathGradient)' : 'url(#mlGradient)'}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
        <span>X-Axis: Binned Anomaly Score [0.0 - 1.0]</span>
        <span>
          {activeModel === 'math'
            ? 'Score ≥ 0.7 flags 209 candidate observations'
            : 'Top 1% contamination flags 3,584 candidate observations'}
        </span>
      </div>
    </div>
  );
};
