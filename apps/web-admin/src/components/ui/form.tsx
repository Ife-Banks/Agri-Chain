'use client';

import * as React from 'react';
import { cn } from './utils';

export const Form = ({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>) => (
  <form {...props}>{children}</form>
);

export function FormField({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('space-y-2', className)}>{children}</div>;
}

export function FormLabel({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('text-sm font-medium text-zinc-900 dark:text-zinc-100', className)} {...props}>
      {children}
    </label>
  );
}

export function FormDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-sm text-zinc-500 dark:text-zinc-400', className)}>{children}</p>;
}

export function FormMessage({ children, className }: { children?: React.ReactNode; className?: string }) {
  if (!children) return null;
  return <p className={cn('text-sm text-red-600 dark:text-red-400', className)}>{children}</p>;
}
