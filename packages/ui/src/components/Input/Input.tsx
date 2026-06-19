import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  hint,
  error,
  iconLeft,
  iconRight,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {iconLeft && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
            {iconLeft}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full rounded-lg border px-3 py-2 text-sm bg-[var(--color-bg-surface)] transition-all duration-150
            ${error ? 'border-[var(--color-danger)] bg-[#FEF2F2]' : 'border-[var(--color-border-default)]'}
            ${iconLeft ? 'pl-10' : ''}
            ${iconRight ? 'pr-10' : ''}
            focus:border-[var(--color-green-600)] focus:ring-[3px] focus:ring-[rgba(26,107,58,0.2)] focus:outline-none
            disabled:bg-[var(--color-bg-page)] disabled:text-opacity-40
            ${className}`}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {iconRight && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
            {iconRight}
          </span>
        )}
      </div>
      {hint && !error && (
        <span id={`${inputId}-hint`} className="text-xs text-[var(--color-text-secondary)] mt-1">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${inputId}-error`} className="text-xs text-[var(--color-danger)] mt-1 flex items-center gap-1">
          {error}
        </span>
      )}
    </div>
  );
};
