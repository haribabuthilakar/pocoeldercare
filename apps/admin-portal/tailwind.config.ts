import type { Config } from 'tailwindcss';
import { pocoPreset } from '@poco/design-tokens/tailwind';

const config: Config = {
  presets: [pocoPreset as any],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
