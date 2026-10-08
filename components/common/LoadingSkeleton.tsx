import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; height?: string }> = ({
  rows = 4,
  height = 'h-12',
}) => {
  return (
    <div className="w-full space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className={`w-full rounded-lg bg-slate-800/60 border border-slate-700/40 ${height}`}
        />
      ))}
    </div>
  );
};
