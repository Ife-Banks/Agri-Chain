import React from 'react';
import { cn } from './cn';

type BadgeVariant = 'default' | 'secondary' | 'warning' | 'destructive';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClass: Record<BadgeVariant, string> = {
  default: 'ui-badge--default',
  secondary: 'ui-badge--secondary',
  warning: 'ui-badge--warning',
  destructive: 'ui-badge--destructive',
};

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return <span className={cn('ui-badge', variantClass[variant], className)} {...props} />;
}
