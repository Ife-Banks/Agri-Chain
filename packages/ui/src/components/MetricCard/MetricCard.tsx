import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, change, trend }) => {
  return (
    <div className="bg-[var(--color-bg-subtle)] rounded-lg p-4">
      <p className="text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">{label}</p>
      <p className="text-2xl font-medium text-[var(--color-text-primary)] mt-1">{value}</p>
      {change && (
        <p className={`text-sm mt-1 ${trend === 'up' ? 'text-[var(--color-green-600)]' : 'text-[var(--color-danger)]'}`}>
          {change}
        </p>
      )}
    </div>
  );
};
