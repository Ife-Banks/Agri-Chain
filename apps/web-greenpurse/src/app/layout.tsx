import React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '../components/layout/AppShell';
import '@aisuce/ui/src/tokens/colors.css';
import '@aisuce/ui/src/tokens/typography.css';
import '@aisuce/ui/src/tokens/spacing.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'GreenPurse — Fresh Produce Delivered',
  description: 'Buy fresh produce directly from local farmers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          color: 'var(--color-text-primary, #2D3748)',
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}