import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--color-green-600)] text-white border-none',
  secondary: 'bg-transparent text-[var(--color-green-600)] border border-[var(--color-green-600)]',
  ghost: 'bg-transparent text-[var(--color-text-secondary)] border border-[var(--color-border-default)]',
  danger: 'bg-[var(--color-danger)] text-white border-none',
  link: 'bg-none text-[var(--color-green-600)] underline border-none',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base min-w-[80px]',
  lg: 'px-7 py-3 text-lg min-w-[120px]',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 
        ${variantStyles[variant]} ${sizeStyles[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${(disabled || loading) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:brightness-110 active:scale-[0.98]'}
        ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {children}
    </button>
  );
};
