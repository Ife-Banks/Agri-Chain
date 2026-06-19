'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from './utils';

type DialogContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

export function Dialog({ open, onOpenChange, children }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return <DialogContext.Provider value={{ open, setOpen: onOpenChange }}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ children }: { children: React.ReactNode }) {
  const context = React.useContext(DialogContext);
  if (!context) throw new Error('DialogTrigger must be used within Dialog');
  return <span onClick={() => context.setOpen(true)}>{children}</span>;
}

export function DialogContent({
  className,
  children,
  title,
}: {
  className?: string;
  children: React.ReactNode;
  title?: React.ReactNode;
}) {
  const context = React.useContext(DialogContext);
  if (!context || !context.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
        onClick={() => context.setOpen(false)}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950',
          className
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{title}</div>
          <button
            type="button"
            onClick={() => context.setOpen(false)}
            className="rounded-md p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
