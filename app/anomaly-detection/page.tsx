'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AnomalyInvestigationDrawer } from '@/components/anomalies/AnomalyInvestigationDrawer';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { getAnomalies } from '@/lib/api';
import { VesselObservation, DetectionStatus, PaginatedVesselsResponse } from '@/lib/types';
import {
  TriangleAlert,
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function AnomalyDetectionPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'all' | 'math' | 'ml' | 'both'>('all');

  // Filters & Sorting
  const [searchMmsi, setSearchMmsi] = useState('');
  const [vesselTypeFilter, setVesselTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('mlScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [candidatesData, setCandidatesData] = useState<PaginatedVesselsResponse | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<VesselObservation | null>(null);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      let statusParam: DetectionStatus | 'all' = 'all';
      if (activeTab === 'math') statusParam = 'math_candidate';
      if (activeTab === 'ml') statusParam = 'ml_candidate';
      if (activeTab === 'both') statusParam = 'both_models';

      const res = await getAnomalies({
        mmsi: searchMmsi,
        vesselType: vesselTypeFilter,
        detectionStatus: statusParam,
        page,
        pageSize: 10,
        sortBy,
        sortOrder,
      });

      setCandidatesData(res);
    } catch (err: any) {
      setError(err.message || 'Unable to load candidate observations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [activeTab, searchMmsi, vesselTypeFilter, page, sortBy, sortOrder]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Anomaly Detection"
        subtitle="Review observations identified as potential anomalies by the detection models."
      />

      {/* Primary Investigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => {
              setActiveTab('all');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Candidates
          </button>
          <button
            onClick={() => {
              setActiveTab('math');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'math'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mathematical Model (209)
          </button>
          <button
            onClick={() => {
              setActiveTab('ml');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ml'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Isolation Forest (3,584)
          </button>
          <button
            onClick={() => {
              setActiveTab('both');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'both'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Both Models (19)
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex items-center space-x-3">
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search MMSI..."
              value={searchMmsi}
              onChange={(e) => {
                setSearchMmsi(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 font-mono"
            />
          </div>

          <select
            value={vesselTypeFilter}
            onChange={(e) => {
              setVesselTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="Fishing">Fishing</option>
            <option value="Pleasure">Pleasure</option>
            <option value="SAR">SAR</option>
            <option value="Military">Military</option>
            <option value="Port tender">Port tender</option>
            <option value="Pilot">Pilot</option>
          </select>
        </div>
      </div>

      {/* Main Investigation Table */}
      <div className="rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-lg overflow-hidden">
        {error ? (
          <ErrorState message={error} onRetry={fetchCandidates} />
        ) : loading || !candidatesData ? (
          <div className="p-6">
            <LoadingSkeleton rows={6} height="h-12" />
          </div>
        ) : candidatesData.data.length === 0 ? (
          <EmptyState
            title="No Candidate Observations Found"
            description="No candidate observations match the current filter selection."
            onResetFilters={() => {
              setActiveTab('all');
              setSearchMmsi('');
              setVesselTypeFilter('all');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th
                    className="p-3.5 cursor-pointer hover:text-white"
                    onClick={() => handleSort('mmsi')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>MMSI</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-white"
                    onClick={() => handleSort('vesselType')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Type</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-white"
                    onClick={() => handleSort('sog')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>SOG (kts)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3.5">COG / Heading</th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-white"
                    onClick={() => handleSort('mathScore')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Math Score</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-white"
                    onClick={() => handleSort('mlScore')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>ML Score</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3.5">Candidate Badge</th>
                  <th className="p-3.5 text-right">Investigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {candidatesData.data.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-3.5 font-bold text-white flex items-center space-x-2">
                      <TriangleAlert className="w-3.5 h-3.5 text-amber-400" />
                      <span>{candidate.mmsi}</span>
                    </td>
                    <td className="p-3.5 font-sans text-slate-200">{candidate.vesselType}</td>
                    <td className="p-3.5">
                      {candidate.sog !== null ? `${candidate.sog.toFixed(1)} kts` : 'N/A'}
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {candidate.cog !== null ? `${candidate.cog.toFixed(0)}°` : 'N/A'} /{' '}
                      {candidate.heading !== null ? `${candidate.heading.toFixed(0)}°` : 'N/A'}
                    </td>
                    <td className="p-3.5 font-bold text-cyan-400">
                      {candidate.mathScore !== null ? candidate.mathScore.toFixed(4) : 'N/A'}
                    </td>
                    <td className="p-3.5 font-bold text-amber-400">
                      {candidate.mlScore !== null ? candidate.mlScore.toFixed(4) : 'N/A'}
                    </td>
                    <td className="p-3.5 font-sans">
                      <StatusBadge status={candidate.detectionStatus} size="sm" />
                    </td>
                    <td className="p-3.5 text-right font-sans">
                      <button
                        onClick={() => setSelectedCandidate(candidate)}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 font-medium text-xs transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {candidatesData && candidatesData.totalPages > 1 && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Page <span className="font-mono font-bold text-white">{candidatesData.page}</span> of{' '}
              <span className="font-mono font-bold text-white">{candidatesData.totalPages}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= candidatesData.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Investigation Drawer */}
      <AnomalyInvestigationDrawer
        observation={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
}
