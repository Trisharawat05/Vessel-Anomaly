'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { VesselDetailsDrawer } from '@/components/vessels/VesselDetailsDrawer';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { getVessels } from '@/lib/api';
import { VesselObservation, DetectionStatus, PaginatedVesselsResponse } from '@/lib/types';
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Ship,
} from 'lucide-react';

function VesselExplorerContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [mmsiQuery, setMmsiQuery] = useState(initialSearch);
  const [vesselTypeFilter, setVesselTypeFilter] = useState<string>('all');
  const [navStatusFilter, setNavStatusFilter] = useState<string>('all');
  const [detectionFilter, setDetectionFilter] = useState<DetectionStatus | 'all'>('all');

  // Pagination & Sorting
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('mlScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Data & Selection
  const [vesselsData, setVesselsData] = useState<PaginatedVesselsResponse | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<VesselObservation | null>(null);

  const fetchVessels = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getVessels({
        mmsi: mmsiQuery,
        vesselType: vesselTypeFilter,
        navStatus: navStatusFilter,
        detectionStatus: detectionFilter,
        page,
        pageSize,
        sortBy,
        sortOrder,
      });
      setVesselsData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vessels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVessels();
  }, [mmsiQuery, vesselTypeFilter, navStatusFilter, detectionFilter, page, sortBy, sortOrder]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleResetFilters = () => {
    setMmsiQuery('');
    setVesselTypeFilter('all');
    setNavStatusFilter('all');
    setDetectionFilter('all');
    setPage(1);
  };

  return (
    <>
      {/* Filter Controls Panel */}
      <div className="rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-4 shadow-lg space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* MMSI Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by MMSI..."
              value={mmsiQuery}
              onChange={(e) => {
                setMmsiQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
            />
          </div>

          {/* Vessel Type Select */}
          <select
            value={vesselTypeFilter}
            onChange={(e) => {
              setVesselTypeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500/50 focus:outline-none font-sans"
          >
            <option value="all">All Vessel Types</option>
            <option value="Fishing">Fishing</option>
            <option value="Pleasure">Pleasure</option>
            <option value="SAR">SAR (Search & Rescue)</option>
            <option value="Sailing">Sailing</option>
            <option value="Military">Military</option>
            <option value="Port tender">Port tender</option>
            <option value="Pilot">Pilot</option>
            <option value="Cargo">Cargo</option>
            <option value="Tanker">Tanker</option>
            <option value="Tug">Tug</option>
          </select>

          {/* Nav Status Select */}
          <select
            value={navStatusFilter}
            onChange={(e) => {
              setNavStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500/50 focus:outline-none font-sans"
          >
            <option value="all">All Navigational Statuses</option>
            <option value="Under way using engine">Under way using engine</option>
            <option value="Engaged in fishing">Engaged in fishing</option>
            <option value="Moored">Moored</option>
            <option value="At anchor">At anchor</option>
            <option value="Unknown">Unknown</option>
          </select>

          {/* Detection Status Filter */}
          <select
            value={detectionFilter}
            onChange={(e) => {
              setDetectionFilter(e.target.value as any);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500/50 focus:outline-none font-sans"
          >
            <option value="all">All Candidate Statuses</option>
            <option value="normal">Normal</option>
            <option value="ml_candidate">ML Candidate</option>
            <option value="math_candidate">Math Candidate</option>
            <option value="both_models">Both Models</option>
          </select>
        </div>

        {/* Filter Chips Bar */}
        {(mmsiQuery || vesselTypeFilter !== 'all' || navStatusFilter !== 'all' || detectionFilter !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-500 font-medium">Active Filters:</span>

            {mmsiQuery && (
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1 font-mono">
                <span>MMSI: {mmsiQuery}</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setMmsiQuery('')} />
              </span>
            )}

            {vesselTypeFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 flex items-center space-x-1 font-sans">
                <span>Type: {vesselTypeFilter}</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setVesselTypeFilter('all')} />
              </span>
            )}

            {detectionFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center space-x-1 font-sans">
                <span>Status: {detectionFilter}</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setDetectionFilter('all')} />
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2 ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Main Vessel Table */}
      <div className="rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-lg overflow-hidden">
        {error ? (
          <ErrorState message={error} onRetry={fetchVessels} />
        ) : loading || !vesselsData ? (
          <div className="p-6">
            <LoadingSkeleton rows={8} height="h-10" />
          </div>
        ) : vesselsData.data.length === 0 ? (
          <EmptyState onResetFilters={handleResetFilters} />
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
                  <th className="p-3.5">Type</th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-white"
                    onClick={() => handleSort('sog')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>SOG (kts)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3.5">COG (°)</th>
                  <th className="p-3.5">Heading (°)</th>
                  <th className="p-3.5">Len (m)</th>
                  <th className="p-3.5">Wid (m)</th>
                  <th className="p-3.5">Draught</th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-white"
                    onClick={() => handleSort('mlScore')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>ML Score</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-white"
                    onClick={() => handleSort('mathScore')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Math Score</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3.5">Candidate Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {vesselsData.data.map((vessel) => (
                  <tr
                    key={vessel.id || vessel.mmsi}
                    onClick={() => setSelectedVessel(vessel)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-bold text-white flex items-center space-x-2">
                      <Ship className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{vessel.mmsi}</span>
                    </td>
                    <td className="p-3.5 font-sans text-slate-200">{vessel.vesselType}</td>
                    <td className="p-3.5">
                      {vessel.sog !== null ? `${vessel.sog.toFixed(1)}` : <span className="text-slate-600">N/A</span>}
                    </td>
                    <td className="p-3.5">
                      {vessel.cog !== null ? `${vessel.cog.toFixed(1)}°` : <span className="text-slate-600">N/A</span>}
                    </td>
                    <td className="p-3.5">
                      {vessel.heading !== null ? `${vessel.heading.toFixed(1)}°` : <span className="text-slate-600">N/A</span>}
                    </td>
                    <td className="p-3.5">
                      {vessel.length !== null ? `${vessel.length}m` : <span className="text-slate-600">N/A</span>}
                    </td>
                    <td className="p-3.5">
                      {vessel.width !== null ? `${vessel.width}m` : <span className="text-slate-600">N/A</span>}
                    </td>
                    <td className="p-3.5">
                      {vessel.draught !== null ? `${vessel.draught}m` : <span className="text-slate-600">N/A</span>}
                    </td>
                    <td className="p-3.5 font-bold text-amber-400">
                      {vessel.mlScore !== null ? vessel.mlScore.toFixed(4) : <span className="text-slate-600">N/A</span>}
                    </td>
                    <td className="p-3.5 font-bold text-cyan-400">
                      {vessel.mathScore !== null ? vessel.mathScore.toFixed(2) : <span className="text-slate-600">N/A</span>}
                    </td>
                    <td className="p-3.5 font-sans">
                      <StatusBadge status={vessel.detectionStatus} size="sm" />
                    </td>
                    <td className="p-3.5 text-right font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVessel(vessel);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white transition-colors border border-slate-700/60"
                        title="Inspect Vessel Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {vesselsData && vesselsData.totalPages > 1 && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing Page <span className="font-mono font-bold text-white">{vesselsData.page}</span> of{' '}
              <span className="font-mono font-bold text-white">{vesselsData.totalPages}</span> ({vesselsData.total} items)
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= vesselsData.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <VesselDetailsDrawer
        vessel={selectedVessel}
        onClose={() => setSelectedVessel(null)}
      />
    </>
  );
}

export default function VesselExplorerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vessel Explorer"
        subtitle="Search, filter, and inspect individual vessel observation parameters and detection metrics across the dataset."
      />

      <Suspense fallback={<LoadingSkeleton rows={6} height="h-14" />}>
        <VesselExplorerContent />
      </Suspense>
    </div>
  );
}
