import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100+
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const getBarColor = (val: number) => {
    if (val >= 100) return 'bg-emerald-500';
    if (val >= 60) return 'bg-indigo-600';
    if (val >= 30) return 'bg-sky-500';
    return 'bg-amber-500';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          <span className="text-slate-600">Funded</span>
          <span className="text-slate-900 font-semibold">{progress}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${getBarColor(
            clampedProgress
          )}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
