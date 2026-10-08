'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { getDataQuality } from '@/lib/api';
import { DataQualityMetrics } from '@/lib/types';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import {
  Database,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Info,
  Sliders,
} from 'lucide-react';

export default function DataQualityPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<DataQualityMetrics | null>(null);

  const loadDataQuality = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDataQuality();
      setQuality(res);
    } catch (err: any) {
      setError(err.message || 'Unable to fetch data quality metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataQuality();
  }, []);

  if (error) {
    return (
      <div className="py-12">
        <PageHeader
          title="Data Quality & Integrity"
          subtitle="Comprehensive analysis of missing features, data completeness, and dataset limitations."
        />
        <ErrorState message={error} onRetry={loadDataQuality} />
      </div>
    );
  }

  if (loading || !quality) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Data Quality & Integrity"
          subtitle="Comprehensive analysis of missing features, data completeness, and dataset limitations."
        />
        <LoadingSkeleton rows={4} height="h-32" />
      </div>
    );
  }

  const missingItems = [
    { feature: 'Draught', count: quality.missingDraught, total: quality.totalObservations },
    { feature: 'Heading', count: quality.missingHeading, total: quality.totalObservations },
    { feature: 'Length', count: quality.missingLength, total: quality.totalObservations },
    { feature: 'Width', count: quality.missingWidth, total: quality.totalObservations },
    { feature: 'COG (Course Over Ground)', count: quality.missingCog, total: quality.totalObservations },
    { feature: 'SOG (Speed Over Ground)', count: quality.missingSog, total: quality.totalObservations },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Quality & Integrity"
        subtitle="Comprehensive analysis of missing features, data completeness, and dataset limitations."
      />

      {/* Trajectory Analysis Limitation Warning Card */}
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-5 shadow-lg flex items-start space-x-3.5 text-amber-200">
        <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-amber-300">Trajectory Analysis Limitation</h3>
          <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
            {quality.limitationWarning}
          </p>
        </div>
      </div>

      {/* Dataset Overview Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Dataset Observations</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {quality.totalObservations.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Full AIS dataset size</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Incomplete Observations</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">
            {quality.incompleteObservations.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {((quality.incompleteObservations / quality.totalObservations) * 100).toFixed(2)}% of dataset has missing features
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Invalid Heading Records</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400">
            {quality.invalidHeadingRecords}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">OutOfBounds values (&gt; 360° or &lt; 0°)</div>
        </div>
      </div>

      {/* Data Quality Overview — Progress Bars */}
      <div className="rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 shadow-lg space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Missing Value Breakdown by AIS Feature
          </h3>
          <p className="text-xs text-slate-400">
            Field-level completeness audit across 358,351 observations
          </p>
        </div>

        <div className="space-y-4 font-mono text-xs">
          {missingItems.map((item) => {
            const pct = ((item.count / item.total) * 100).toFixed(2);
            return (
              <div key={item.feature} className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-semibold text-slate-200">{item.feature}</span>
                  <span className="text-slate-400">
                    <strong className="text-cyan-400">{item.count.toLocaleString()}</strong> missing ({pct}%)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${Math.max(Number(pct), 0.5)}%` }}
                    className={`h-full rounded ${
                      Number(pct) > 5 ? 'bg-amber-500' : 'bg-cyan-500'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Features List Card */}
      <div className="rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 shadow-lg">
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-teal-400" />
          Available Engine Features (9 Relevant Original Features)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
          {quality.availableFeatures.map((feat) => (
            <div
              key={feat}
              className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center space-x-2 text-slate-300"
            >
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
