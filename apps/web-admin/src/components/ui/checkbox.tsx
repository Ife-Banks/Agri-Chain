'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from './utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, ...props }, ref) => {
  return (
    <label className="inline-flex cursor-pointer items-center">
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          'peer sr-only',
          className
        )}
        {...props}
      />
      <span className="flex h-5 w-5 items-center justify-center rounded border border-zinc-300 bg-white text-transparent transition-colors peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:text-white dark:border-zinc-700 dark:bg-zinc-950">
        <Check className="h-3.5 w-3.5" />
      </span>
    </label>
  );
});
Checkbox.displayName = 'Checkbox';
