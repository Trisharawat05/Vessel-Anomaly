'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ModelAgreementChart } from '@/components/charts/ModelAgreementChart';
import { getDashboardSummary } from '@/lib/api';
import { DashboardSummary } from '@/lib/types';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import {
  Calculator,
  Cpu,
  Layers,
  HelpCircle,
  CheckCircle2,
  GitCompare,
} from 'lucide-react';

export default function ModelComparisonPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardSummary();
      setSummary(res);
    } catch (err: any) {
      setError(err.message || 'Unable to load model comparison data.');
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
          title="Model Comparison"
          subtitle="Comparative evaluation between rule-based mathematical scoring and unsupervised Isolation Forest."
        />
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  if (loading || !summary) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Model Comparison"
          subtitle="Comparative evaluation between rule-based mathematical scoring and unsupervised Isolation Forest."
        />
        <LoadingSkeleton rows={4} height="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Model Comparison"
        subtitle="Comparative evaluation between rule-based mathematical scoring and unsupervised Isolation Forest."
      />

      {/* Two Large Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mathematical Model Card */}
        <div className="rounded-xl bg-slate-900/60 backdrop-blur-md border border-cyan-500/30 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Mathematical Model
            </span>
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              Threshold: {summary.mathThreshold}
            </span>
          </div>

          <div className="my-4">
            <div className="text-4xl font-extrabold font-mono text-white">
              {summary.mathCandidates.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">Rule-based anomaly candidates flagged</p>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Detection Paradigm:</span>
              <span className="font-semibold text-slate-200">Explicit Domain Rules</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Primary Vectors:</span>
              <span className="font-semibold text-slate-200">Speed, Direction, Dimensions</span>
            </div>
          </div>
        </div>

        {/* Isolation Forest Card */}
        <div className="rounded-xl bg-slate-900/60 backdrop-blur-md border border-amber-500/30 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Isolation Forest ML
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
              Contamination: 1.0%
            </span>
          </div>

          <div className="my-4">
            <div className="text-4xl font-extrabold font-mono text-white">
              {summary.mlCandidates.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">Multivariate ML candidate observations</p>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Detection Paradigm:</span>
              <span className="font-semibold text-slate-200">Unsupervised Tree Isolation</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Hyperparameters:</span>
              <span className="font-semibold text-slate-200">200 Trees • Seed 42</span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Agreement Visualizer */}
      <div className="rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 shadow-lg">
        <ModelAgreementChart
          bothCount={summary.modelAgreement}
          mathOnlyCount={summary.mathOnlyCandidates}
          mlOnlyCount={summary.mlOnlyCandidates}
        />
      </div>

      {/* Detailed Overlap Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/30 space-y-1">
          <span className="text-rose-400 font-bold block text-sm">
            Where the Models Agree ({summary.modelAgreement})
          </span>
          <p className="text-slate-400 font-sans leading-relaxed">
            19 observations were independently flagged by both the mathematical score threshold and Isolation Forest.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/30 space-y-1">
          <span className="text-cyan-400 font-bold block text-sm">
            Mathematical Only ({summary.mathOnlyCandidates})
          </span>
          <p className="text-slate-400 font-sans leading-relaxed">
            190 observations triggered explicit rule thresholds (e.g. high COG/Heading discrepancy) but remained un-isolated in global space.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/30 space-y-1">
          <span className="text-amber-400 font-bold block text-sm">
            ML Only ({summary.mlOnlyCandidates.toLocaleString()})
          </span>
          <p className="text-slate-400 font-sans leading-relaxed">
            3,565 observations were isolated as multivariate outliers across combined features despite lower individual rule scores.
          </p>
        </div>
      </div>

      {/* Explanatory Card — "Why do the models differ?" */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg flex items-start space-x-4">
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-bold text-white">Why do the models differ?</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            The mathematical model uses explicitly defined behavioral and dimensional rules, while Isolation Forest identifies observations that are relatively isolated in the multivariate feature space.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            Both methodologies provide complementary intelligence: rule-based models catch known physical domain violations, whereas Isolation Forest detects subtle non-linear multi-attribute anomalies without rigid threshold assumptions.
          </p>
        </div>
      </div>
    </div>
  );
}
