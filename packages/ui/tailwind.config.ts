import type { Config } from 'tailwindcss';
import { tailwindPreset } from '@aisuce/config';

const config: Config = {
  presets: [tailwindPreset],
  content: ['./src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'],
};

export default config;
