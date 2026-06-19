'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Sprout,
  PanelLeftClose,
  PanelLeftOpen,
  Store,
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from './ui/utils';

export type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Stores', href: '/stores', icon: Store },
  { label: 'Orders', href: '/orders', icon: ShoppingCart, badge: 5 },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  pathname: string;
}

export function Sidebar({ pathname }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar, currentUser } = useAdminStore();
  const userInitial = currentUser?.name?.charAt(0) ?? 'A';

  return (
    <aside
      className={cn(
        'hidden border-r border-white/5 bg-zinc-950/80 backdrop-blur-xl lg:flex lg:flex-col h-screen',
        sidebarCollapsed ? 'w-[92px]' : 'w-[280px]'
      )}
    >
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/20">
          <Sprout className="h-5 w-5" />
        </div>
        {!sidebarCollapsed ? (
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">AI-SUCE</p>
            <p className="text-sm font-semibold">Admin Console</p>
          </div>
        ) : null}
      </div>
      <div className="px-4">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 w-full justify-between border border-white/5 bg-white/5 px-3 text-zinc-200 hover:bg-white/10"
          onClick={toggleSidebar}
        >
          {!sidebarCollapsed ? 'Collapse menu' : 'Expand'}
          {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-emerald-500/12 text-emerald-200 ring-1 ring-inset ring-emerald-500/20'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-50'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed ? (
                <span className="flex flex-1 items-center justify-between gap-3">
                  {item.label}
                  {item.badge ? <Badge variant="info" className="bg-sky-500/10 text-sky-300">{item.badge}</Badge> : null}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="p-4">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Active user</p>
          <div className="mt-3 flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt="" />
              <AvatarFallback className="bg-emerald-500/15 text-emerald-200">{userInitial}</AvatarFallback>
            </Avatar>
            {!sidebarCollapsed ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-50">{currentUser?.name ?? 'Admin User'}</p>
                <p className="truncate text-xs text-zinc-500">{currentUser?.email ?? 'admin@aisuce.com'}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
