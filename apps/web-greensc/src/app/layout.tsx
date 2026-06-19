import type { Metadata } from 'next';
import '@aisuce/ui/src/tokens/colors.css';
import '@aisuce/ui/src/tokens/typography.css';
import '@aisuce/ui/src/tokens/spacing.css';

export const metadata: Metadata = {
  title: 'GreenSC — AI-SUCE',
  description: 'Commodities platform for agricultural supply chains',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'var(--font-sans)', backgroundColor: 'var(--color-bg-page)', color: 'var(--color-text-primary)' }}>
        {children}
      </body>
    </html>
  );
}
