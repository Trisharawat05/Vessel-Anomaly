'use client';

import React, { useState } from 'react';
import { VesselObservation } from '@/lib/types';
import { StatusBadge } from '../common/StatusBadge';
import {
  X,
  TriangleAlert,
  ChevronDown,
  ChevronUp,
  Cpu,
  Calculator,
  Compass,
  Gauge,
  Ruler,
  HelpCircle,
  Database,
  Info,
} from 'lucide-react';

interface AnomalyInvestigationDrawerProps {
  observation: VesselObservation | null;
  onClose: () => void;
}

export const AnomalyInvestigationDrawer: React.FC<AnomalyInvestigationDrawerProps> = ({
  observation,
  onClose,
}) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  if (!observation) return null;

  const speedComp = observation.speedComponent ?? 0.25;
  const dirComp = observation.directionComponent ?? 0.35;
  const dimComp = observation.dimensionComponent ?? 0.12;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-[#090e1c] border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <TriangleAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-white font-mono">
                    Candidate Observation
                  </h2>
                  <StatusBadge status={observation.detectionStatus} size="sm" />
                </div>
                <p className="text-xs text-slate-400">
                  MMSI {observation.mmsi} • {observation.vesselType}
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

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Observation Overview Card */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                  Observation Record Overview
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono text-[11px]">
                  {observation.vesselObservationCount ?? 1} Observation(s) in Dataset
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block">MMSI Identifier:</span>
                  <span className="text-white font-bold text-sm">{observation.mmsi}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Vessel Type:</span>
                  <span className="text-cyan-300 font-bold text-sm">{observation.vesselType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Navigational Status:</span>
                  <span className="text-slate-200">{observation.navStatus}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Detection Method:</span>
                  <span className="text-slate-200">
                    {observation.detectionStatus === 'both_models'
                      ? 'Dual Model Agreement'
                      : observation.detectionStatus === 'math_candidate'
                      ? 'Rule-Based Model'
                      : 'Isolation Forest'}
                  </span>
                </div>
              </div>
            </div>

            {/* Model Score Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/20">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Math Score</span>
                  <Calculator className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-cyan-400">
                  {observation.mathScore !== null ? observation.mathScore.toFixed(4) : 'N/A'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Threshold: 0.70</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/20">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>ML Score</span>
                  <Cpu className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-amber-400">
                  {observation.mlScore !== null ? observation.mlScore.toFixed(6) : 'N/A'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Top 1.0% Contamination</div>
              </div>
            </div>

            {/* Mathematical Score Breakdown */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-cyan-400" />
                  <span>Mathematical Score Breakdown</span>
                </span>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  Total: {observation.mathScore ? observation.mathScore.toFixed(2) : '0.00'}
                </span>
              </div>

              {/* Progress bars for 3 score components */}
              <div className="space-y-2.5 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                      Speed Component
                    </span>
                    <span className="text-slate-200">{speedComp.toFixed(2)}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${Math.min(100, speedComp * 100)}%` }}
                      className="h-full bg-cyan-500 rounded"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-teal-400" />
                      Direction Component
                    </span>
                    <span className="text-slate-200">{dirComp.toFixed(2)}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${Math.min(100, dirComp * 100)}%` }}
                      className="h-full bg-teal-500 rounded"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-blue-400" />
                      Dimension Component
                    </span>
                    <span className="text-slate-200">{dimComp.toFixed(2)}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${Math.min(100, dimComp * 100)}%` }}
                      className="h-full bg-blue-500 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Expandable "How this score was calculated" */}
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                  className="w-full flex items-center justify-between text-xs text-cyan-400 hover:text-cyan-300 transition-colors py-1"
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <HelpCircle className="w-3.5 h-3.5" />
                    How this score was calculated
                  </span>
                  {showFormulaDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showFormulaDetails && (
                  <div className="mt-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                    <p>
                      The mathematical anomaly score combines three weighted rule-based components:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                      <li>
                        <strong className="text-slate-200">Speed Component:</strong> Evaluates abnormal Speed Over Ground relative to vessel type limits.
                      </li>
                      <li>
                        <strong className="text-slate-200">Direction Component:</strong> Assesses discrepancies between Course Over Ground (COG) and Heading.
                      </li>
                      <li>
                        <strong className="text-slate-200">Dimension Component:</strong> Identifies unusual physical length-to-width ratios or draught anomalies.
                      </li>
                    </ul>
                    <div className="text-[11px] text-cyan-400 font-mono pt-1">
                      Formula: Score = w1(Speed) + w2(Direction) + w3(Dimension)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Behavioral Features Summary */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 font-mono text-xs">
              <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px] block">
                Extracted Feature Profile
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>SOG: <span className="text-white font-bold">{observation.sog ?? 'N/A'} kts</span></div>
                <div>COG: <span className="text-white font-bold">{observation.cog ?? 'N/A'}°</span></div>
                <div>Heading: <span className="text-white font-bold">{observation.heading ?? 'N/A'}°</span></div>
                <div>Diff: <span className="text-cyan-400 font-bold">{observation.headingCogDiff ?? 'N/A'}°</span></div>
              </div>
            </div>

            {/* Observation-Level Disclaimer */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/20 text-xs text-slate-300 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Observation Record Scope:</strong> Flags apply to this single AIS observation. Flagging one observation does not characterize the overall vessel history or MMSI identity.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400 text-center">
            Categorized as potential anomaly candidate observation for review.
          </div>
        </div>
      </div>
    </div>
  );
};
