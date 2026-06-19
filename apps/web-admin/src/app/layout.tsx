import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/Providers';
import { AdminLayout } from '../components/AdminLayout';

export const metadata: Metadata = {
  title: 'Admin — AI-SUCE',
  description: 'Super admin panel for AI-SUCE platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="m-0 font-sans bg-zinc-950 text-zinc-50">
        <Providers>
          <AdminLayout>{children}</AdminLayout>
        </Providers>
      </body>
    </html>
  );
}
