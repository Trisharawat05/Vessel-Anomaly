'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { getSystemHealth, setMockModeOverride, isMockMode } from '@/lib/api';
import { SystemStatus } from '@/lib/types';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  Calculator,
  Server,
  RefreshCw,
} from 'lucide-react';

export default function SystemStatusPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const mockMode = isMockMode();

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSystemHealth();
      setStatus(res);
    } catch (err: any) {
      setError(err.message || 'Unable to check system health.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  if (error) {
    return (
      <div className="py-12">
        <PageHeader
          title="System Status & Health"
          subtitle="Real-time operational monitoring for analytics models, API services, and dataset services."
        />
        <ErrorState message={error} onRetry={loadStatus} />
      </div>
    );
  }

  if (loading || !status) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="System Status & Health"
          subtitle="Real-time operational monitoring for analytics models, API services, and dataset services."
        />
        <LoadingSkeleton rows={4} height="h-32" />
      </div>
    );
  }

  const serviceCards = [
    {
      title: 'Frontend Platform',
      status: status.frontendStatus,
      icon: Activity,
      label: 'Operational',
      color: 'emerald',
    },
    {
      title: 'Analytics API Service',
      status: mockMode ? 'mocked' : status.apiStatus,
      icon: Server,
      label: mockMode ? 'Demo Mode (Mock API)' : status.apiStatus === 'connected' ? 'Connected' : 'Disconnected',
      color: mockMode ? 'amber' : status.apiStatus === 'connected' ? 'emerald' : 'rose',
    },
    {
      title: 'Dataset Service',
      status: status.datasetStatus,
      icon: Database,
      label: 'Loaded (358.3k Rows)',
      color: 'emerald',
    },
    {
      title: 'Feature Engineering Engine',
      status: status.featureEngineeringStatus,
      icon: Calculator,
      label: 'Available (33 Features)',
      color: 'emerald',
    },
    {
      title: 'Mathematical Model',
      status: status.mathModelStatus,
      icon: Calculator,
      label: 'Available (Threshold 0.7)',
      color: 'cyan',
    },
    {
      title: 'Isolation Forest ML',
      status: status.isolationForestStatus,
      icon: Cpu,
      label: 'Available (1% Contamination)',
      color: 'amber',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Status & Health"
        subtitle="Real-time operational monitoring for analytics models, API services, and dataset services."
        actions={
          <button
            onClick={loadStatus}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Refresh Health</span>
          </button>
        }
      />

      {/* 6 Main Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {serviceCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="p-5 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-md flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">{card.title}</h4>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">{card.label}</p>
                </div>
              </div>

              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Model Configuration Card */}
      <div className="rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Machine Learning Model Configuration
            </h3>
            <p className="text-xs text-slate-400">
              Isolation Forest hyperparameters and mathematical model thresholds
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
            Config Seed #42
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">Estimators (n_estimators)</span>
            <div className="text-2xl font-bold text-white">
              {status.modelConfig.estimators}
            </div>
            <div className="text-slate-400 text-[11px]">Trees in isolation forest</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">Contamination Rate</span>
            <div className="text-2xl font-bold text-amber-400">
              {(status.modelConfig.contamination * 100).toFixed(1)}%
            </div>
            <div className="text-slate-400 text-[11px]">3,584 anomaly candidates</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">Mathematical Threshold</span>
            <div className="text-2xl font-bold text-cyan-400">0.70</div>
            <div className="text-slate-400 text-[11px]">209 anomaly candidates</div>
          </div>
        </div>
      </div>

      {/* API Endpoint Monitoring List */}
      <div className="rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              API Endpoint Health Status
            </h3>
            <p className="text-xs text-slate-400">
              Centralized endpoints defined in <code className="text-cyan-400 font-mono">lib/api.ts</code>
            </p>
          </div>
          <button
            onClick={() => setMockModeOverride(!mockMode)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
          >
            Mode: {mockMode ? 'Demo Data (Mock)' : 'Live FastAPI'}
          </button>
        </div>

        <div className="divide-y divide-slate-800/60 border border-slate-800/80 rounded-xl overflow-hidden font-mono text-xs bg-slate-950/50">
          {status.endpoints.map((ep) => (
            <div key={ep.path} className="p-3.5 flex items-center justify-between hover:bg-slate-900/50">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">{ep.name}</span>
                  <span className="text-[11px] text-slate-400">{ep.path}</span>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded text-[11px] bg-slate-900 text-cyan-300 border border-slate-800">
                {ep.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
