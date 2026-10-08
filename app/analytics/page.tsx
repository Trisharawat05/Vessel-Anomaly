'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScoreDistributionChart } from '@/components/charts/ScoreDistributionChart';
import { VesselTypeChart } from '@/components/charts/VesselTypeChart';
import { ScoreScatterPlot } from '@/components/charts/ScoreScatterPlot';
import { NavigationStatusChart } from '@/components/charts/NavigationStatusChart';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { getAnalytics, getVessels } from '@/lib/api';
import {
  VesselTypeMetric,
  NavigationStatusMetric,
  ScoreDistributionBin,
  VesselObservation,
} from '@/lib/types';
import { ChartNoAxesCombined } from 'lucide-react';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [vesselTypes, setVesselTypes] = useState<VesselTypeMetric[]>([]);
  const [navStatuses, setNavStatuses] = useState<NavigationStatusMetric[]>([]);
  const [scoreBins, setScoreBins] = useState<ScoreDistributionBin[]>([]);
  const [sampleVessels, setSampleVessels] = useState<VesselObservation[]>([]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const [analyticsData, vesselsData] = await Promise.all([
        getAnalytics(),
        getVessels({ pageSize: 20 }),
      ]);

      setVesselTypes(analyticsData.vesselTypes);
      setNavStatuses(analyticsData.navStatuses);
      setScoreBins(analyticsData.scoreDistributions);
      setSampleVessels(vesselsData.data);
    } catch (err: any) {
      setError(err.message || 'Unable to load analytics workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (error) {
    return (
      <div className="py-12">
        <PageHeader
          title="Analytics Workspace"
          subtitle="Explore multi-dimensional distribution charts, behavioral signals, and navigational status breakdowns."
        />
        <ErrorState message={error} onRetry={loadAnalytics} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analytics Workspace"
          subtitle="Explore multi-dimensional distribution charts, behavioral signals, and navigational status breakdowns."
        />
        <LoadingSkeleton rows={4} height="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Workspace"
        subtitle="Explore multi-dimensional distribution charts, behavioral signals, and navigational status breakdowns."
      />

      {/* Grid of 6 Analytics Workspace Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 & 2: Anomaly Score Distribution (Math & ML) */}
        <div className="rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 shadow-lg">
          <ScoreDistributionChart data={scoreBins} />
        </div>

        {/* Chart 3 & 4: Candidate Distribution by Vessel Type */}
        <div className="rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 shadow-lg">
          <VesselTypeChart data={vesselTypes} />
        </div>

        {/* Chart 5: SOG vs ML Anomaly Score Scatter Plot */}
        <div className="rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 shadow-lg">
          <ScoreScatterPlot observations={sampleVessels} />
        </div>

        {/* Chart 6: Navigation Status Distribution */}
        <div className="rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 shadow-lg">
          <NavigationStatusChart data={navStatuses} />
        </div>
      </div>
    </div>
  );
}
