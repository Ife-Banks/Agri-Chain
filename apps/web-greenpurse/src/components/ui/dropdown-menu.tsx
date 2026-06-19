'use client';

import React from 'react';
import { cn } from './cn';

interface DropdownMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end';
}

const DropdownContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
}>({
  open: false,
  setOpen: () => undefined,
  triggerRef: { current: null },
  contentRef: { current: null },
});

export function DropdownMenu({ open, onOpenChange, children }: DropdownMenuProps) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target) || contentRef.current?.contains(target)) {
        return;
      }
      onOpenChange(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onOpenChange]);

  return (
    <DropdownContext.Provider value={{ open, setOpen: onOpenChange, triggerRef, contentRef }}>
      <div className="ui-dropdown">{children}</div>
    </DropdownContext.Provider>
  );
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function DropdownMenuTrigger({ children, className, ...props }: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef } = React.useContext(DropdownContext);

  return (
    <button
      ref={(node) => {
        triggerRef.current = node;
      }}
      type="button"
      aria-expanded={open}
      className={className}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({ className, align = 'end', style, children, ...props }: DropdownMenuContentProps) {
  const { open, triggerRef, contentRef } = React.useContext(DropdownContext);

  if (!open) return null;

  return (
    <div
      ref={(node) => {
        contentRef.current = node;
      }}
      role="menu"
      className={cn('ui-dropdown-content', className)}
      data-align={align}
      style={{
        left: align === 'start' ? 0 : undefined,
        right: align === 'end' ? 0 : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  description?: string;
}

export function DropdownMenuLabel({ children, description, className, ...props }: DropdownMenuLabelProps) {
  return (
    <div className={cn('ui-dropdown-label', className)} {...props}>
      <div className="ui-dropdown-title">{children}</div>
      {description && <div className="ui-dropdown-description">{description}</div>}
    </div>
  );
}

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  danger?: boolean;
}

export function DropdownMenuItem({ danger = false, className, children, ...props }: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      className={cn('ui-dropdown-item', danger && 'ui-dropdown-item--danger', className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px w-full bg-[var(--color-border-default)]" />;
}
