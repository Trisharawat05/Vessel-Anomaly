import React from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onResetFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Vessel Observations Found',
  description = 'No observations match your selected filter criteria. Try expanding your search parameters or clearing filters.',
  onResetFilters,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-xl bg-slate-900/40 border border-slate-800/80 my-6">
      <div className="p-3 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 mb-3">
        <SearchX className="w-6 h-6 text-slate-400" />
      </div>

      <h4 className="text-base font-semibold text-slate-200 mb-1">{title}</h4>
      <p className="text-xs text-slate-400 max-w-md mb-4">{description}</p>

      {onResetFilters && (
        <button
          onClick={onResetFilters}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700 hover:bg-slate-700 text-xs font-medium transition-colors"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
};
