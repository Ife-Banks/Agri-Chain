'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/auth';
import { Avatar } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  User,
  Menu,
  X,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Leaf,
  LogOut,
  ClipboardList,
  LayoutGrid,
  ChevronDown,
  Settings,
  Wallet,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/farmer', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'My Products', href: '/farmer/products', icon: <Package className="h-5 w-5" /> },
  { label: 'Orders', href: '/farmer/orders', icon: <ShoppingCart className="h-5 w-5" /> },
  { label: 'Wallet', href: '/wallet', icon: <Wallet className="h-5 w-5" /> },
  { label: 'Notifications', href: '/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" /> },
  { label: 'Profile', href: '/farmer/profile', icon: <User className="h-5 w-5" /> },
];

function Sidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapse,
}: {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/farmer') return pathname === '/farmer';
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex flex-col border-r border-gray-200 bg-white shadow-lg transition-all duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          {!collapsed ? (
            <Link href="/farmer" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-green-400 shadow-md">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">Farmer Portal</div>
                <div className="text-xs text-gray-500">GreenPurse</div>
              </div>
            </Link>
          ) : (
            <Link href="/farmer" className="mx-auto">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-green-400 shadow-md">
                <Leaf className="h-6 w-6 text-white" />
              </div>
            </Link>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {!collapsed && (
            <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Navigation
            </div>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
                  } ${collapsed ? 'justify-center px-3' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-gray-200 p-4">
          {!collapsed ? (
            <>
              <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                <Avatar size={40} className="ring-2 ring-green-200">
                  {user?.username?.charAt(0).toUpperCase() || 'F'}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-gray-900">
                    {user?.username || 'Farmer'}
                  </div>
                  <div className="truncate text-xs text-gray-500">
                    {user?.email || 'farmer@example.com'}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="absolute right-0 top-1/2 z-10 hidden h-8 w-6 translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-all hover:bg-gray-50 lg:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </aside>
    </>
  );
}

function UserDropdown() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const closeMenus = () => {
    setShowUserMenu(false);
  };

  return (
    <DropdownMenu open={showUserMenu} onOpenChange={setShowUserMenu}>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/75 px-2 py-1.5 shadow-[0_8px_20px_rgba(15,74,40,0.05)] transition hover:-translate-y-0.5 hover:border-green-300">
        <Avatar size={34} className="ring-2 ring-white">
          {user?.username?.charAt(0).toUpperCase() || 'F'}
        </Avatar>
        <span className="hidden max-w-[7rem] truncate text-sm font-semibold text-gray-900 sm:block">
          {user?.username || 'Farmer'}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[18rem]">
        <DropdownMenuLabel description={user?.email || 'farmer@example.com'}>
          {user?.username || 'Farmer'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { setShowUserMenu(false); router.push('/farmer'); }}>
          Farmer Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setShowUserMenu(false); router.push('/farmer/products'); }}>
          My Products
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setShowUserMenu(false); router.push('/farmer/orders'); }}>
          Farm Orders
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { setShowUserMenu(false); router.push('/orders'); }}>
          My Orders
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setShowUserMenu(false); router.push('/cart'); }}>
          Shopping Cart
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { handleLogout(); closeMenus(); }}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-1 bg-gradient-to-r from-green-600 via-green-400 to-amber-400" />

      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products, orders..."
                  className="w-full rounded-xl border-0 bg-gray-100 py-2 pl-10 pr-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button className="relative rounded-xl p-2 text-gray-500 hover:bg-gray-100">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
              </button>
              <UserDropdown />
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}