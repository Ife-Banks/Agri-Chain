'use client';

import * as React from 'react';
import { cn } from './utils';

export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'info';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const badgeStyles: Record<BadgeVariant, string> = {
  default: 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950',
  secondary: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100',
  outline: 'border border-zinc-200 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300',
  success: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/20 dark:text-amber-400',
  destructive: 'bg-red-500/10 text-red-700 ring-1 ring-inset ring-red-500/20 dark:text-red-400',
  info: 'bg-sky-500/10 text-sky-700 ring-1 ring-inset ring-sky-500/20 dark:text-sky-400',
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, variant = 'secondary', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
        badgeStyles[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';
