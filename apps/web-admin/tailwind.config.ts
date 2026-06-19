import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 60px rgba(0, 0, 0, 0.18)',
      },
      backgroundImage: {
        'dashboard-gradient':
          'radial-gradient(circle at top left, rgba(16, 185, 129, 0.16), transparent 34%), radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 28%), linear-gradient(to bottom, rgba(255,255,255,1), rgba(244,244,245,1))',
        'dashboard-gradient-dark':
          'radial-gradient(circle at top left, rgba(16, 185, 129, 0.16), transparent 34%), radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 28%), linear-gradient(to bottom, rgba(9,9,11,1), rgba(24,24,27,1))',
      },
    },
  },
  plugins: [],
};

export default config;
