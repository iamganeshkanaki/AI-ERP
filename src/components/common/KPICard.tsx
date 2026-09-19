import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  id?: string;
  title: string;
  value: string | number;
  growth?: number;
  subtext?: string;
  actionText?: string;
  icon?: React.ReactNode;
  currency?: boolean;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  id,
  title,
  value,
  growth,
  subtext,
  actionText,
  icon,
  currency = false,
  onClick,
}) => {
  const formattedValue =
    typeof value === 'number' && currency
      ? `₹${value.toLocaleString('en-IN')}`
      : typeof value === 'number'
      ? value.toLocaleString('en-IN')
      : value;

  const isPositive = growth !== undefined && growth > 0;
  const isNegative = growth !== undefined && growth < 0;
  const isZero = growth !== undefined && growth === 0;

  return (
    <div
      id={id}
      onClick={onClick}
      className={`group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-all duration-150 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 ${
        onClick ? 'cursor-pointer hover:shadow-xs hover:border-indigo-400' : ''
      }`}
    >
      <div>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {title}
            </p>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {formattedValue}
            </h3>
          </div>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200 group-hover:scale-105 transition-transform">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          {growth !== undefined && (
            <div
              className={`inline-flex items-center gap-1 font-bold ${
                isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isNegative
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {isPositive && <TrendingUp className="h-3.5 w-3.5" />}
              {isNegative && <TrendingDown className="h-3.5 w-3.5" />}
              {isZero && <Minus className="h-3.5 w-3.5" />}
              <span>
                {isPositive ? '+' : ''}
                {growth}%
              </span>
            </div>
          )}
          {subtext && (
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {subtext}
            </span>
          )}
        </div>
      </div>

      {actionText && (
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
          <span>{actionText}</span>
          <span className="text-xs transition-transform group-hover:translate-x-0.5">→</span>
        </div>
      )}
    </div>
  );
};
