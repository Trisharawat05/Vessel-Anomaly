'use client';

import React from 'react';
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
import { NavigationStatusMetric } from '@/lib/types';

interface NavigationStatusChartProps {
  data: NavigationStatusMetric[];
}

export const NavigationStatusChart: React.FC<NavigationStatusChartProps> = ({ data }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-200">
          Navigation Status Distribution
        </h3>
        <p className="text-xs text-slate-400">
          ML candidate observations categorized by declared navigational status
        </p>
      </div>

      <div className="flex-1 min-h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="status"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              interval={0}
              angle={-25}
              textAnchor="end"
              axisLine={{ stroke: '#1e293b' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as NavigationStatusMetric;
                  return (
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 shadow-xl text-xs font-mono">
                      <div className="font-bold text-white mb-1">{item.status}</div>
                      <div className="text-cyan-400">
                        ML Candidates: <span className="font-extrabold">{item.count.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? '#f59e0b' : '#06b6d4'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
