'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from './utils';

export function NavigationMenu({ children, className }: { children: React.ReactNode; className?: string }) {
  return <nav className={cn('flex items-center', className)}>{children}</nav>;
}

export function NavigationMenuList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center gap-1', className)}>{children}</div>;
}

export function NavigationMenuItem({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>;
}

export function NavigationMenuLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-900 dark:hover:text-zinc-50',
        active ? 'bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50' : 'text-zinc-600 dark:text-zinc-300'
      )}
    >
      {children}
    </Link>
  );
}
