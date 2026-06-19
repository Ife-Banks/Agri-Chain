'use client';

import React from 'react';
import { cn } from './cn';

type ButtonVariant = 'default' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  default: 'ui-button--default',
  secondary: 'ui-button--secondary',
  ghost: 'ui-button--ghost',
  outline: 'ui-button--outline',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'ui-button--sm',
  md: 'ui-button--md',
  lg: 'ui-button--lg',
  icon: 'ui-button--icon',
};

export function Button({
  variant = 'default',
  size = 'md',
  asChild = false,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = cn('ui-button', variantClass[variant], sizeClass[size], className);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(classes, (children.props as { className?: string }).className),
      ...props,
    });
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
