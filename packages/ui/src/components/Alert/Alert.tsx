import React from 'react';

type AlertType = 'success' | 'warning' | 'danger' | 'info';

interface AlertProps {
  type: AlertType;
  children: React.ReactNode;
}

const alertStyles: Record<AlertType, string> = {
  success: 'border-l-[3px] border-[var(--color-success)] bg-[var(--color-green-50)] text-[#14532D]',
  warning: 'border-l-[3px] border-[var(--color-warning)] bg-[#FFFBEB] text-[#78350F]',
  danger: 'border-l-[3px] border-[var(--color-danger)] bg-[#FEF2F2] text-[#7F1D1D]',
  info: 'border-l-[3px] border-[var(--color-info)] bg-[#EFF6FF] text-[#1E3A5F]',
};

export const Alert: React.FC<AlertProps> = ({ type, children }) => {
  return (
    <div className={`p-4 rounded text-sm ${alertStyles[type]}`} role="alert">
      {children}
    </div>
  );
};
