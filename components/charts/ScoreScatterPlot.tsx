'use client';

import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Cell,
} from 'recharts';
import { VesselObservation } from '@/lib/types';
import { StatusBadge } from '../common/StatusBadge';

interface ScoreScatterPlotProps {
  observations: VesselObservation[];
  title?: string;
}

export const ScoreScatterPlot: React.FC<ScoreScatterPlotProps> = ({
  observations,
  title = 'Behavioral Signal (SOG vs Isolation Forest Score)',
}) => {
  const chartData = observations
    .filter((o) => o.sog !== null && o.mlScore !== null)
    .map((o) => ({
      mmsi: o.mmsi,
      vesselType: o.vesselType,
      sog: o.sog ?? 0,
      mlScore: o.mlScore ?? 0,
      mathScore: o.mathScore ?? 0,
      status: o.detectionStatus,
      isDemo: o.isDemoData ?? false,
    }));

  const getColor = (status: string) => {
    switch (status) {
      case 'both_models':
        return '#f43f5e'; // rose red
      case 'ml_candidate':
        return '#f59e0b'; // amber
      case 'math_candidate':
        return '#06b6d4'; // cyan
      default:
        return '#475569'; // slate
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
          <p className="text-xs text-slate-400">
            Speed Over Ground (knots) mapped against Isolation Forest detection score
          </p>
        </div>
        <StatusBadge status="demo" />
      </div>

      <div className="flex-1 min-h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 15, right: 20, bottom: 15, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              type="number"
              dataKey="sog"
              name="SOG"
              unit=" kts"
              stroke="#64748b"
              fontSize={11}
              axisLine={{ stroke: '#1e293b' }}
            />
            <YAxis
              type="number"
              dataKey="mlScore"
              name="ML Anomaly Score"
              domain={[0, 1]}
              stroke="#64748b"
              fontSize={11}
              axisLine={false}
            />
            <ZAxis type="number" range={[50, 120]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 shadow-xl text-xs space-y-1">
                      <div className="font-mono font-bold text-cyan-400">
                        MMSI: {data.mmsi}
                      </div>
                      <div className="text-slate-300">Type: {data.vesselType}</div>
                      <div className="text-slate-300 font-mono">
                        SOG: {data.sog} knots
                      </div>
                      <div className="text-slate-300 font-mono">
                        ML Score: {data.mlScore}
                      </div>
                      <div className="pt-1">
                        <StatusBadge status={data.status} size="sm" />
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter data={chartData}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.status)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Both Models</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>ML Candidate</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
          <span>Math Candidate</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
          <span>Normal</span>
        </span>
      </div>
    </div>
  );
};
