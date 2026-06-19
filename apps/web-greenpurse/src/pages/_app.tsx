import type { AppProps } from 'next/app';
import '../app/globals.css';
import '@aisuce/ui/src/tokens/colors.css';
import '@aisuce/ui/src/tokens/typography.css';
import '@aisuce/ui/src/tokens/spacing.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
