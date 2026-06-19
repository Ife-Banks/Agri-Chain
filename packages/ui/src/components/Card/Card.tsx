import React from 'react';

type CardVariant = 'raised' | 'metric' | 'flat' | 'wallet' | 'product';

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  raised: 'bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm',
  metric: 'bg-[var(--color-bg-subtle)] border-none',
  flat: 'bg-transparent border border-[var(--color-border-default)]',
  wallet: 'bg-gradient-to-br from-[var(--color-green-600)] to-[var(--color-green-800)] border-none text-white shadow-md',
  product: 'bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm',
};

const paddingStyles: Record<CardVariant, string> = {
  raised: 'p-5',
  metric: 'p-4',
  flat: 'p-5',
  wallet: 'p-5',
  product: 'p-0',
};

export const Card: React.FC<CardProps> = ({ variant = 'raised', className = '', children }) => {
  return (
    <div className={`rounded-xl ${variantStyles[variant]} ${paddingStyles[variant]} ${className}`}>
      {children}
    </div>
  );
};
