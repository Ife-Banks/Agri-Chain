'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  ChevronRight,
  LayoutDashboard,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShieldCheck,
  Sprout,
  Users,
  BarChart3,
  ShoppingCart,
} from 'lucide-react';
import { authApi } from '../lib/api';
import { useAdminStore } from '../store/adminStore';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { cn } from './ui/utils';
import { Sidebar, navItems } from './Sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const authRoutes = new Set(['/login', '/register']);

function pathLabel(pathname: string) {
  const current = navItems.find((item) => item.href === pathname);
  if (current) return current.label;
  if (pathname.startsWith('/users')) return 'Users';
  if (pathname.startsWith('/products')) return 'Products';
  if (pathname.startsWith('/stores')) return 'Stores';
  if (pathname.startsWith('/orders')) return 'Orders';
  if (pathname.startsWith('/analytics')) return 'Analytics';
  if (pathname.startsWith('/settings')) return 'Settings';
  return 'Dashboard';
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [{ label: 'Dashboard', href: '/' }];

  if (segments.length === 0) return null;

  if (segments[0] !== 'login' && segments[0] !== 'register') {
    crumbs.push({ label: pathLabel(`/${segments[0]}`), href: `/${segments[0]}` });
  }

  return (
    <div className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
      {crumbs.map((crumb, index) => (
        <React.Fragment key={crumb.href}>
          {index > 0 ? <ChevronRight className="h-4 w-4" /> : null}
          {index === crumbs.length - 1 ? (
            <span className="font-medium text-zinc-950 dark:text-zinc-50">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="transition hover:text-zinc-950 dark:hover:text-zinc-50">
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function AuthShell({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_28%),linear-gradient(to_bottom,_#09090b,_#18181b)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-30" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="hidden lg:flex"
          >
            <Card className="relative flex min-h-[680px] w-full flex-col justify-between overflow-hidden border-white/10 bg-white/5 p-8 text-white shadow-soft backdrop-blur-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-sky-500/10" />
              <div className="relative flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-300 ring-1 ring-inset ring-white/10">
                  <Sprout className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-white/55">AI-SUCE</p>
                  <h1 className="text-xl font-semibold">Admin Control Center</h1>
                </div>
              </div>
              <div className="relative space-y-6">
                <Badge variant="success" className="border-0 bg-emerald-400/10 text-emerald-200">
                  {pathname === '/register' ? 'Create your admin account' : 'Secure access required'}
                </Badge>
                <div className="space-y-4">
                  <h2 className="max-w-xl text-5xl font-semibold tracking-tight text-balance">
                    Run inventory, orders, users, and analytics from one calm workspace.
                  </h2>
                  <p className="max-w-xl text-base leading-7 text-white/70">
                    This refreshed interface is designed for speed, clarity, and confidence. Every screen now shares the same polished visual language and motion rhythm.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Live Orders', value: '128', hint: '+18% this week' },
                    { label: 'Catalog Health', value: '94%', hint: 'Low-stock items under control' },
                    { label: 'Admin Roles', value: '6', hint: 'Permission groups active' },
                    { label: 'Conversion', value: '3.8%', hint: 'Steady upward trend' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                      <p className="text-sm text-white/55">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                      <p className="mt-1 text-sm text-white/65">{item.hint}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium text-white">Security-first access</p>
                  <p className="text-sm text-white/65">Session-aware, responsive, and built for daily admin operations.</p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
            className="flex items-center justify-center"
          >
            <div className="w-full max-w-lg">{children}</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function AppShell({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  const router = useRouter();
  const { currentUser, setCurrentUser } = useAdminStore();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem('access_token');
    if (token && !currentUser) {
      authApi.me()
        .then(({ data }) => {
          setCurrentUser({
            id: data.id,
            name: data.username || data.email,
            email: data.email,
            role: data.isAdmin ? 'Admin' : data.isFarmer ? 'Farmer' : 'User',
            status: 'Active',
            createdAt: data.createdAt ? new Date(data.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            lastLogin: data.lastLogin || new Date().toISOString().slice(0, 10),
          });
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          router.push('/login');
        });
    }
  }, [currentUser, setCurrentUser, router]);

  const onLogout = async () => {
    try {
      await authApi.logout();
    } catch {
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setCurrentUser(null);
      router.push('/login');
    }
  };

  const userInitial = currentUser?.name?.charAt(0) ?? 'A';

  return (
    <div className="h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.08),_transparent_28%),linear-gradient(to_bottom,_#09090b,_#111113)] text-zinc-50 overflow-hidden">
      <div className="mx-auto flex h-screen w-full max-w-[1680px]">
        <Sidebar pathname={pathname} />

        <div className="flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
          <header className="sticky top-0 z-30 border-b border-white/5 bg-zinc-950/75 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 lg:hidden">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger>
                    <Button variant="ghost" size="icon" className="border border-white/5 bg-white/5 text-zinc-200 hover:bg-white/10">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="border-r border-white/5 bg-zinc-950 text-zinc-50">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/20">
                        <Sprout className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">AI-SUCE</p>
                        <p className="text-sm font-semibold">Admin Console</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition',
                              active ? 'bg-emerald-500/12 text-emerald-200' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-50'
                            )}
                            onClick={() => setMobileOpen(false)}
                          >
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="hidden md:block">
                  <Breadcrumbs pathname={pathname} />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-semibold text-zinc-50">{pathLabel(pathname)}</h1>
                  <p className="hidden text-sm text-zinc-500 md:block">
                    Manage your storefront, operations, and reporting from one place.
                  </p>
                </div>
              </div>

              <div className="hidden max-w-sm flex-1 lg:block">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search orders, users, products..."
                    className="h-11 border-white/5 bg-white/5 pl-9 text-zinc-100 placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="icon" className="border border-white/5 bg-white/5 text-zinc-200 hover:bg-white/10">
                  <Bell className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <div className="relative">
                    <DropdownMenuTrigger>
                      <button className="flex items-center gap-3 rounded-full border border-white/5 bg-white/5 px-2 py-1.5 text-left transition hover:bg-white/10">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt="" />
                          <AvatarFallback className="bg-emerald-500/15 text-emerald-200 text-xs">{userInitial}</AvatarFallback>
                        </Avatar>
                        <div className="hidden text-left sm:block">
                          <p className="text-sm font-medium text-zinc-50">{currentUser?.name ?? 'Admin User'}</p>
                          <p className="text-xs text-zinc-500">{currentUser?.role ?? 'Admin'}</p>
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="right-0 top-full mt-3 w-60">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{currentUser?.name ?? 'Admin User'}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{currentUser?.email ?? 'admin@aisuce.com'}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/settings')}>Profile settings</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/analytics')}>Open analytics</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onLogout} className="text-red-600 dark:text-red-400">
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </div>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  if (authRoutes.has(pathname)) {
    return <AuthShell pathname={pathname}>{children}</AuthShell>;
  }
  return <AppShell pathname={pathname}>{children}</AppShell>;
};
