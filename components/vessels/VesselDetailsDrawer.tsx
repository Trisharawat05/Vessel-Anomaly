'use client';

import React from 'react';
import { VesselObservation } from '@/lib/types';
import { StatusBadge } from '../common/StatusBadge';
import { RadarFeatureChart } from '../charts/RadarFeatureChart';
import { X, Ship, Gauge, Ruler, Layers, AlertCircle, Info, Database } from 'lucide-react';

interface VesselDetailsDrawerProps {
  vessel: VesselObservation | null;
  onClose: () => void;
}

export const VesselDetailsDrawer: React.FC<VesselDetailsDrawerProps> = ({
  vessel,
  onClose,
}) => {
  if (!vessel) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#090e1c] border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Ship className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-white font-mono">
                    MMSI {vessel.mmsi}
                  </h2>
                  {vessel.isDemoData ? (
                    <StatusBadge status="demo" />
                  ) : (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                      Verified Dataset
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Vessel Type: <span className="text-cyan-300 font-semibold">{vessel.vesselType}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Observation Count & Identity Badge */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300">Vessel Observations in Dataset:</span>
              </div>
              <span className="font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                {vessel.vesselObservationCount ?? 1} Observation(s)
              </span>
            </div>

            {/* Observation-Level Candidate Status */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Observation Candidate Status</span>
                <div className="mt-1">
                  <StatusBadge status={vessel.detectionStatus} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Detection Scope</span>
                <span className="text-xs font-semibold text-cyan-300 font-mono">
                  Single Observation Record
                </span>
              </div>
            </div>

            {/* Behavioral Signals Grid */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>Observation Behavioral Signals</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Speed Over Ground (SOG)</span>
                  <span className="text-sm font-bold text-white">
                    {vessel.sog !== null ? `${vessel.sog} knots` : 'Not available'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Course Over Ground (COG)</span>
                  <span className="text-sm font-bold text-white">
                    {vessel.cog !== null ? `${vessel.cog}°` : 'Not available'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Heading</span>
                  <span className="text-sm font-bold text-white">
                    {vessel.heading !== null ? `${vessel.heading}°` : 'Not available'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Heading/COG Difference</span>
                  <span className="text-sm font-bold text-cyan-300">
                    {vessel.headingCogDiff !== undefined && vessel.headingCogDiff !== null
                      ? `${vessel.headingCogDiff}°`
                      : 'Not available'}
                  </span>
                </div>
              </div>
            </div>

            {/* Physical Vessel Dimensions */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Ruler className="w-4 h-4 text-teal-400" />
                <span>Physical Vessel Features</span>
              </h3>

              <div className="grid grid-cols-3 gap-2.5 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[10px]">Length</span>
                  <span className="font-semibold text-slate-200">
                    {vessel.length !== null ? `${vessel.length} m` : 'Not available'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[10px]">Width</span>
                  <span className="font-semibold text-slate-200">
                    {vessel.width !== null ? `${vessel.width} m` : 'Not available'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[10px]">Draught</span>
                  <span className="font-semibold text-slate-200">
                    {vessel.draught !== null ? `${vessel.draught} m` : 'Not available'}
                  </span>
                </div>
              </div>
            </div>

            {/* Observation Model Scores */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Observation Model Scores</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Isolation Forest Score</span>
                  <span className="text-xl font-bold font-mono text-amber-400">
                    {vessel.mlScore !== null ? vessel.mlScore.toFixed(6) : 'Not available'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Mathematical Score</span>
                  <span className="text-xl font-bold font-mono text-cyan-400">
                    {vessel.mathScore !== null ? vessel.mathScore.toFixed(4) : 'Not available'}
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Profile Radar Visualization */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Multivariate Feature Profile
              </h3>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <RadarFeatureChart vessel={vessel} />
              </div>
            </div>

            {/* Explicit Observation Distinction Banner */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/20 text-xs text-slate-300 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Observation-Level Assessment:</strong> Model flags apply strictly to this individual observation record. Flagging an observation does not imply that the entire vessel identity (MMSI) is anomalous or fraudulent.
              </p>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-center">
            <p className="text-[11px] text-slate-500 italic">
              Note: Potential anomaly candidates require domain analyst review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
