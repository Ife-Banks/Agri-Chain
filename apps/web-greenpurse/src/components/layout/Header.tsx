'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/cart';
import { useAuthStore } from '../../store/auth';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';

const navLinks = [
  { href: '/products', label: 'Browse' },
  { href: '/products?sort=trending', label: 'Trending' },
  { href: '/orders', label: 'Orders' },
];

const farmerNavLinks = [
  { href: '/farmer', label: 'Dashboard' },
  { href: '/farmer/products', label: 'My Products' },
  { href: '/farmer/orders', label: 'Orders' },
];

function CartIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function MenuIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h18" />
      <path d="M3 6h18" />
      <path d="M3 18h18" />
    </svg>
  );
}

function CloseIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function LeafLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 2C8 6 4 16 2 26l2.5 1.5C6 22 8 17 16 16v4l8-9-8-8v4z" fill="var(--color-green-600)" />
      <path d="M16 2C8 6 4 16 2 26l2.5 1.5C6 22 8 17 16 16" fill="var(--color-green-400)" />
    </svg>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-green-600),var(--color-green-400))] shadow-[0_10px_24px_rgba(26,107,58,0.2)]">
        <LeafLogo />
      </div>
      <div>
        <div className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-secondary)]">
          GreenPurse
        </div>
        <div className="text-sm font-medium text-[var(--color-text-secondary)]">
          Fresh produce, fast delivery
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [cartBump, setCartBump] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const prevTotalRef = React.useRef(0);

  const totalItems = useCartStore((s) => s.totalItems());
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  React.useEffect(() => {
    if (totalItems > prevTotalRef.current) {
      setCartBump(true);
      window.setTimeout(() => setCartBump(false), 260);
    }
    prevTotalRef.current = totalItems;
  }, [totalItems]);

  React.useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = search.trim();
    if (query) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
      setMobileMenuOpen(false);
    }
  };

  const closeMenus = () => {
    setShowUserMenu(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(203,213,224,0.72)] bg-[rgba(255,255,255,0.85)] backdrop-blur-xl transition-all duration-300">
      <div className="h-1 bg-[linear-gradient(90deg,var(--color-green-600),var(--color-green-400),#f59e0b)]" />
      <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="shrink-0 rounded-2xl px-1 py-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(15,74,40,0.1)]">
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-[rgba(203,213,224,0.6)] bg-white/80 p-1 shadow-[0_4px_16px_rgba(15,23,42,0.04)] lg:flex">
          {(user?.roles.includes('farmer') ? farmerNavLinks : navLinks).map((link) => (
            <Button 
              key={link.href} 
              asChild 
              variant="ghost" 
              size="sm" 
              className="rounded-full px-4 text-[0.88rem] font-semibold text-[var(--color-text-secondary)] transition-all duration-200 hover:bg-green-50 hover:text-green-700 data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="relative hidden flex-1 md:block">
          <div className="group relative">
            <Input
              ref={searchInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fresh produce, farms, or deals"
              
              className="pr-24 border-[rgba(203,213,224,0.6)] bg-white/80 shadow-[0_8px_24px_rgba(15,74,40,0.04)] transition-all duration-300 focus:border-green-400 focus:shadow-[0_12px_32px_rgba(15,74,40,0.12)] focus:bg-white"
            />
            <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 text-[0.68rem] font-medium text-[var(--color-text-secondary)] lg:flex">
              <kbd className="rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] px-1.5 py-0.5 transition-colors group-focus-within:border-green-300 group-focus-within:bg-green-50">Ctrl</kbd>
              <kbd className="rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] px-1.5 py-0.5 transition-colors group-focus-within:border-green-300 group-focus-within:bg-green-50">K</kbd>
            </div>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <Button asChild variant="ghost" size="icon" className="relative hidden md:inline-flex transition-all duration-200 hover:bg-green-50 hover:scale-105">
            <Link href="/cart" aria-label="Cart">
              <span className={cartBump ? 'animate-[ui-bump_260ms_ease]' : ''}>
                <CartIcon className="h-5 w-5 text-[var(--color-text-secondary)] transition-colors group-hover:text-green-700" />
              </span>
              {totalItems > 0 && (
                <Badge className="absolute -right-1 -top-1 min-w-5 justify-center rounded-full px-1.5 py-0.5 text-[0.65rem] normal-case tracking-normal text-white shadow-md transition-transform duration-200 group-hover:scale-110" variant="destructive">
                  {totalItems > 9 ? '9+' : totalItems}
                </Badge>
              )}
            </Link>
          </Button>

          {user ? (
            <DropdownMenu open={showUserMenu} onOpenChange={setShowUserMenu}>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-[var(--color-border-default)] bg-white/75 px-2 py-1.5 shadow-[0_8px_20px_rgba(15,74,40,0.05)] transition hover:-translate-y-0.5 hover:border-[rgba(26,107,58,0.22)]">
                <Avatar size={34} className="ring-2 ring-white">
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
                <span className="hidden max-w-[7rem] truncate text-sm font-semibold text-[var(--color-text-primary)] sm:block">
                  {user.username}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-[var(--color-text-secondary)]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[18rem]">
                <DropdownMenuLabel description={user.email}>{user.username}</DropdownMenuLabel>
                {user.roles.includes('farmer') && (
                  <>
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
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setShowUserMenu(false); router.push('/orders'); }}>
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setShowUserMenu(false); router.push('/cart'); }}>
                  Shopping Cart
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem danger onClick={() => { logout(); closeMenus(); }}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm" className="rounded-full px-4 font-semibold">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full px-4 font-semibold">
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="flex flex-col gap-6 p-5">
          <SheetHeader>
            <div>
              <SheetTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-green-400">
                  <LeafLogo />
                </div>
                GreenPurse
              </SheetTitle>
              <SheetDescription>Quick actions, navigation, and account controls.</SheetDescription>
            </div>
            <SheetClose aria-label="Close menu" className="rounded-full hover:bg-gray-100">
              <CloseIcon className="h-5 w-5" />
            </SheetClose>
          </SheetHeader>

          <form onSubmit={handleSearch} className="relative">
            <div className="group">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search produce..."
                iconLeft={<SearchIcon className="h-4 w-4 text-[var(--color-text-secondary)] group-focus-within:text-green-600 transition-colors duration-200" />}
                className="border-[rgba(203,213,224,0.6)] bg-white/80 transition-all duration-300 focus:border-green-400 focus:shadow-[0_8px_24px_rgba(15,74,40,0.12)] focus:bg-white"
              />
            </div>
          </form>

          <div className="space-y-2">
            <div className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
              Explore
            </div>
            {navLinks.map((link) => (
              <Button
                key={link.href}
                asChild
                variant="secondary"
                className="w-full justify-start rounded-2xl px-4 py-3 font-semibold transition-all duration-200 hover:bg-green-50 hover:text-green-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
              Account
            </div>
            {user ? (
              <>
                {user.roles.includes('farmer') && (
                  <>
                    <div className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-green-600)]">
                      Farmer Portal
                    </div>
                    {farmerNavLinks.map((link) => (
                      <Button
                        key={link.href}
                        asChild
                        variant="secondary"
                        className="w-full justify-start rounded-2xl px-4 py-3 font-semibold transition-all duration-200 hover:bg-green-50 hover:text-green-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href={link.href}>{link.label}</Link>
                      </Button>
                    ))}
                    <Separator />
                  </>
                )}
                <div className="rounded-2xl border border-[rgba(203,213,224,0.6)] bg-gradient-to-br from-white to-green-50/30 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Avatar size={40} className="ring-2 ring-green-100">{user.username.charAt(0).toUpperCase()}</Avatar>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-[var(--color-text-primary)]">{user.username}</div>
                      <div className="truncate text-sm text-[var(--color-text-secondary)]">{user.email}</div>
                    </div>
                  </div>
                </div>
                <Button asChild variant="secondary" className="w-full justify-start rounded-2xl px-4 py-3 transition-all duration-200 hover:bg-green-50 hover:text-green-700" onClick={() => setMobileMenuOpen(false)}>
                  <Link href="/orders">My Orders</Link>
                </Button>
                <Button asChild variant="secondary" className="w-full justify-start rounded-2xl px-4 py-3 transition-all duration-200 hover:bg-green-50 hover:text-green-700" onClick={() => setMobileMenuOpen(false)}>
                  <Link href="/cart">Shopping Cart</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-2xl px-4 py-3 text-[var(--color-danger)] transition-all duration-200 hover:bg-red-50 hover:border-red-300"
                  onClick={() => {
                    logout();
                    closeMenus();
                  }}
                >
                  Log out
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Button asChild variant="secondary" className="w-full rounded-2xl px-4 py-3 font-semibold transition-all duration-200 hover:bg-green-50 hover:text-green-700" onClick={() => setMobileMenuOpen(false)}>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild className="w-full rounded-2xl px-4 py-3 font-semibold bg-gradient-to-r from-green-600 to-green-700 shadow-md transition-all duration-300 hover:from-green-700 hover:to-green-800 hover:shadow-lg" onClick={() => setMobileMenuOpen(false)}>
                  <Link href="/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>

          <Separator />

          <div className="mt-auto flex items-center justify-between rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 p-4 shadow-sm border border-green-200">
            <div>
              <div className="text-sm font-semibold text-[var(--color-green-800)]">Cart</div>
              <div className="text-sm text-[var(--color-green-600)]">{totalItems} item{totalItems === 1 ? '' : 's'} ready</div>
            </div>
            <Button asChild size="sm" className="rounded-full bg-green-600 px-4 shadow-md transition-all duration-300 hover:bg-green-700 hover:shadow-lg" onClick={() => setMobileMenuOpen(false)}>
              <Link href="/cart">Open</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <style>{`
        @keyframes ui-bump {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.18); }
        }
      `}</style>
    </header>
  );
}
