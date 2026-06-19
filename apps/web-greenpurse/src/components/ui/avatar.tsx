import React from 'react';
import { cn } from './cn';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export function Avatar({ className, size = 36, style, children, ...props }: AvatarProps) {
  return (
    <div
      className={cn('ui-avatar', className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
