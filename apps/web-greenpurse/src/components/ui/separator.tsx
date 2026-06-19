import React from 'react';
import { cn } from './cn';

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

export function Separator({ orientation = 'horizontal', className, ...props }: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn('ui-separator', orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full', className)}
      {...props}
    />
  );
}
