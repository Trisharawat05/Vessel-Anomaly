'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/common/MetricCard';
import { ScoreDistributionChart } from '@/components/charts/ScoreDistributionChart';
import { VesselTypeChart } from '@/components/charts/VesselTypeChart';
import { ModelAgreementChart } from '@/components/charts/ModelAgreementChart';
import { ScoreScatterPlot } from '@/components/charts/ScoreScatterPlot';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import {
  getDashboardSummary,
  getAnalytics,
  getVessels,
} from '@/lib/api';
import {
  DashboardSummary,
  VesselTypeMetric,
  ScoreDistributionBin,
  VesselObservation,
} from '@/lib/types';
import {
  Database,
  Cpu,
  Calculator,
  Layers,
  Percent,
  CheckCircle,
} from 'lucide-react';

export default function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [vesselTypes, setVesselTypes] = useState<VesselTypeMetric[]>([]);
  const [scoreBins, setScoreBins] = useState<ScoreDistributionBin[]>([]);
  const [sampleObservations, setSampleObservations] = useState<VesselObservation[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, analyticsRes, vesselsRes] = await Promise.all([
        getDashboardSummary(),
        getAnalytics(),
        getVessels({ pageSize: 15 }),
      ]);

      setSummary(summaryRes);
      setVesselTypes(analyticsRes.vesselTypes);
      setScoreBins(analyticsRes.scoreDistributions);
      setSampleObservations(vesselsRes.data);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the analytics API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error) {
    return (
      <div className="py-12">
        <PageHeader
          title="Vessel Intelligence Overview"
          subtitle="Real-time analytical view of AIS vessel behavior and anomaly candidates."
          showRadarSweep
        />
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  if (loading || !summary) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Vessel Intelligence Overview"
          subtitle="Real-time analytical view of AIS vessel behavior and anomaly candidates."
          showRadarSweep
        />
        <LoadingSkeleton rows={5} height="h-28" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <PageHeader
        title="Vessel Intelligence Overview"
        subtitle="Real-time analytical view of AIS vessel behavior and anomaly candidates."
        showRadarSweep
      />

      {/* Top 5 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Observations"
          value={summary.totalObservations}
          subtitle="Current dataset"
          icon={<Database className="w-5 h-5" />}
          accentColor="cyan"
        />

        <MetricCard
          title="ML Candidates"
          value={summary.mlCandidates}
          subtitle="Isolation Forest"
          icon={<Cpu className="w-5 h-5" />}
          accentColor="amber"
        />

        <MetricCard
          title="Math Candidates"
          value={summary.mathCandidates}
          subtitle="Rule-based model"
          icon={<Calculator className="w-5 h-5" />}
          accentColor="teal"
        />

        <MetricCard
          title="Model Agreement"
          value={summary.modelAgreement}
          subtitle="Shared candidates"
          icon={<Layers className="w-5 h-5" />}
          accentColor="rose"
        />

        <MetricCard
          title="ML Candidate Rate"
          value={`${summary.mlCandidateRate.toFixed(2)}%`}
          subtitle="Isolation Forest"
          icon={<Percent className="w-5 h-5" />}
          accentColor="blue"
        />
      </div>

      {/* Main Grid Section 1: Score Distribution & Detection Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Anomaly Score Distribution */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 shadow-lg">
          <ScoreDistributionChart data={scoreBins} mathThreshold={summary.mathThreshold} />
        </div>

        {/* Right Col: Detection Summary Card */}
        <div className="rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">
              Detection Summary
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Breakdown of candidates flagged across detection pipelines
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Mathematical Model</span>
                <span className="font-bold text-cyan-400 text-sm">
                  {summary.mathCandidates.toLocaleString()} candidates
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Isolation Forest</span>
                <span className="font-bold text-amber-400 text-sm">
                  {summary.mlCandidates.toLocaleString()} candidates
                </span>
              </div>

              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                <span className="text-rose-300 font-semibold">Both Models</span>
                <span className="font-bold text-rose-400 text-sm">
                  {summary.modelAgreement.toLocaleString()} candidates
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
                  <span className="block text-[10px] text-slate-500">Mathematical Only</span>
                  <span className="text-cyan-300 font-bold text-xs">{summary.mathOnlyCandidates}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
                  <span className="block text-[10px] text-slate-500">ML Only</span>
                  <span className="text-amber-300 font-bold text-xs">{summary.mlOnlyCandidates.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Isolation Forest set to 1.0% contamination (3,584 candidates).</span>
          </div>
        </div>
      </div>

      {/* Main Grid Section 2: Candidate Distribution by Vessel Type & Agreement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Vessel Type Chart */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 shadow-lg">
          <VesselTypeChart data={vesselTypes} />
        </div>

        {/* Right Col: Detection Agreement Breakdown */}
        <div className="rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 shadow-lg">
          <ModelAgreementChart
            bothCount={summary.modelAgreement}
            mathOnlyCount={summary.mathOnlyCandidates}
            mlOnlyCount={summary.mlOnlyCandidates}
          />
        </div>
      </div>

      {/* Main Grid Section 3: Behavioral Signal Scatter Plot */}
      <div className="rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 shadow-lg">
        <ScoreScatterPlot observations={sampleObservations} />
      </div>
    </div>
  );
}
