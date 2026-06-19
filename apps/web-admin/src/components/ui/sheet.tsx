'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from './utils';

type SheetContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const SheetContext = React.createContext<SheetContextValue | null>(null);

export function Sheet({ open, onOpenChange, children }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return <SheetContext.Provider value={{ open, setOpen: onOpenChange }}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({ children }: { children: React.ReactNode }) {
  const context = React.useContext(SheetContext);
  if (!context) throw new Error('SheetTrigger must be used within Sheet');
  return <span onClick={() => context.setOpen(true)}>{children}</span>;
}

export function SheetContent({ className, children, side = 'right' }: { className?: string; children: React.ReactNode; side?: 'right' | 'left' }) {
  const context = React.useContext(SheetContext);
  if (!context || !context.open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close sheet" className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => context.setOpen(false)} />
      <div
        className={cn(
          'absolute top-0 h-full w-full max-w-sm border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
          className
        )}
      >
        <button
          type="button"
          onClick={() => context.setOpen(false)}
          className="mb-6 rounded-md p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
