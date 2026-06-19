'use client';

import * as React from 'react';
import { cn } from './utils';

type MenuContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const MenuContext = React.createContext<MenuContextValue | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <MenuContext.Provider value={{ open, setOpen }}>{children}</MenuContext.Provider>;
}

export function DropdownMenuTrigger({ children }: { children: React.ReactNode }) {
  const context = React.useContext(MenuContext);
  if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu');
  return <span onClick={() => context.setOpen(!context.open)}>{children}</span>;
}

export function DropdownMenuContent({ className, align = 'end', children }: { className?: string; align?: 'start' | 'end'; children: React.ReactNode }) {
  const context = React.useContext(MenuContext);
  if (!context || !context.open) return null;
  return (
    <div
      className={cn(
        'absolute z-50 mt-2 min-w-[12rem] rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-950',
        align === 'end' ? 'right-0' : 'left-0',
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ className, children, onClick }: React.HTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(MenuContext);
  if (!context) throw new Error('DropdownMenuItem must be used within DropdownMenu');
  return (
    <button
      type="button"
      onClick={(event) => {
        onClick?.(event as any);
        context.setOpen(false);
      }}
      className={cn(
        'flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50',
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-2 h-px bg-zinc-200 dark:bg-zinc-800" />;
}
