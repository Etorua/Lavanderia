import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'wine' | 'emerald' | 'amber' | 'blue' | 'purple' | 'slate';
  tooltip?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon: Icon,
  change,
  trend = 'neutral',
  color = 'slate',
  tooltip,
}) => {
  const colorStyles = {
    wine: {
      bg: 'bg-pink-50',
      text: 'text-[#580f36]',
      border: 'border-pink-200/60',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200/60',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200/60',
    },
    blue: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200/60',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200/60',
    },
    slate: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
    },
  }[color];

  return (
    <div className="saas-kpi-card" title={tooltip}>
      <div className="flex-1 min-w-0">
        <p className="saas-kpi-label truncate">{label}</p>
        <p className="saas-kpi-value mt-0.5 truncate">{value}</p>
        {change && (
          <p
            className={`text-[11px] font-semibold mt-1 inline-flex items-center gap-1 ${
              trend === 'up'
                ? 'text-emerald-600'
                : trend === 'down'
                ? 'text-rose-600'
                : 'text-slate-500'
            }`}
          >
            <span>{change}</span>
          </p>
        )}
      </div>

      <div
        className={`saas-kpi-icon ${colorStyles.bg} ${colorStyles.text} border ${colorStyles.border}`}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};

