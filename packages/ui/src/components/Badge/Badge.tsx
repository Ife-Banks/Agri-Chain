import React from 'react';

type BadgeStatus = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  status: BadgeStatus;
  children: React.ReactNode;
}

const statusStyles: Record<BadgeStatus, string> = {
  success: 'bg-[var(--color-green-50)] text-[var(--color-green-600)]',
  warning: 'bg-[#FFFBEB] text-[var(--color-warning)]',
  danger: 'bg-[#FEF2F2] text-[var(--color-danger)]',
  info: 'bg-[#EFF6FF] text-[var(--color-info)]',
  neutral: 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]',
};

export const Badge: React.FC<BadgeProps> = ({ status, children }) => {
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
      {children}
    </span>
  );
};
