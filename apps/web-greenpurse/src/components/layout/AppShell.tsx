'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFarmerRoute = pathname?.startsWith('/farmer');

  return (
    <>
      {!isFarmerRoute && <Header />}
      <main style={{ flex: 1 }}>{children}</main>
      {!isFarmerRoute && <Footer />}
    </>
  );
}