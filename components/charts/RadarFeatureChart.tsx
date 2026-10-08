'use client';

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { VesselObservation } from '@/lib/types';

interface RadarFeatureChartProps {
  vessel: VesselObservation;
}

export const RadarFeatureChart: React.FC<RadarFeatureChartProps> = ({ vessel }) => {
  const radarData = [
    {
      feature: 'Speed (SOG)',
      value: Math.min(100, (vessel.sog ?? 0) * 3), // scaled for visualization
      fullMark: 100,
    },
    {
      feature: 'Dimension Ratio',
      value: vessel.length && vessel.width ? Math.min(100, (vessel.length / vessel.width) * 10) : 50,
      fullMark: 100,
    },
    {
      feature: 'Direction Variance',
      value: Math.min(100, (vessel.headingCogDiff ?? 0) / 1.8),
      fullMark: 100,
    },
    {
      feature: 'Draught Factor',
      value: Math.min(100, (vessel.draught ?? 0) * 6),
      fullMark: 100,
    },
    {
      feature: 'ML Score',
      value: Math.round((vessel.mlScore ?? 0) * 100),
      fullMark: 100,
    },
    {
      feature: 'Math Score',
      value: Math.round((vessel.mathScore ?? 0) * 100),
      fullMark: 100,
    },
  ];

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
          <PolarGrid stroke="#1e293b" />
          <PolarAngleAxis dataKey="feature" stroke="#94a3b8" fontSize={10} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono">
                    <span className="text-cyan-400 font-bold">{item.feature}:</span>{' '}
                    <span className="text-white">{item.value}/100</span>
                  </div>
                );
              }
              return null;
            }}
          />
          <Radar
            name="Feature Profile"
            dataKey="value"
            stroke="#06b6d4"
            fill="#06b6d4"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
