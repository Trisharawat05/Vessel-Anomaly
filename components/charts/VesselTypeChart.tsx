'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { VesselTypeMetric } from '@/lib/types';

interface VesselTypeChartProps {
  data: VesselTypeMetric[];
}

export const VesselTypeChart: React.FC<VesselTypeChartProps> = ({ data }) => {
  const [metricType, setMetricType] = useState<'count' | 'rate'>('count');

  // Filter out 0 counts if needed or display all
  const sortedData = [...data].sort((a, b) => {
    return metricType === 'count' ? b.count - a.count : b.candidateRate - a.candidateRate;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Candidate Distribution by Vessel Type
          </h3>
          <p className="text-xs text-slate-400">
            Isolation Forest model flags grouped by vessel classification
          </p>
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
          <button
            onClick={() => setMetricType('count')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              metricType === 'count'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Count
          </button>
          <button
            onClick={() => setMetricType('rate')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              metricType === 'rate'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Candidate Rate (%)
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 min-h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={sortedData}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis
              type="number"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
              tickFormatter={(val) => (metricType === 'rate' ? `${val}%` : val)}
            />
            <YAxis
              type="category"
              dataKey="type"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={95}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as VesselTypeMetric;
                  return (
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 shadow-xl text-xs space-y-1">
                      <div className="font-bold text-white border-b border-slate-800 pb-1">
                        Vessel Type: {item.type}
                      </div>
                      <div className="flex justify-between gap-4 font-mono text-slate-300">
                        <span>ML Candidates:</span>
                        <span className="font-bold text-cyan-400">{item.count.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between gap-4 font-mono text-slate-300">
                        <span>Candidate Rate:</span>
                        <span className="font-bold text-teal-300">{item.candidateRate.toFixed(4)}%</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey={metricType === 'count' ? 'count' : 'candidateRate'}
              radius={[0, 4, 4, 0]}
              barSize={14}
            >
              {sortedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.count > 500
                      ? '#06b6d4'
                      : entry.count > 50
                      ? '#14b8a6'
                      : '#3b82f6'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
