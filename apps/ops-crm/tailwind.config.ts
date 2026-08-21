import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#edfaf5',
          100: '#d4f4ea',
          200: '#aee8d7',
          300: '#77d7be',
          400: '#3ec0a2',
          500: '#12C395', // Primary Color
          600: '#0ba17a',
          700: '#0c8063',
          800: '#0e6651',
          900: '#0e5443',
        },
        secondary: {
          50: '#fef1f8',
          100: '#fee5f2',
          200: '#fecee6',
          300: '#fda6d2',
          400: '#fb6eb6',
          500: '#FE1D8F', // Secondary Color
          600: '#e40974',
          700: '#bf035b',
          800: '#9e064c',
          900: '#830a43',
        },
        navy: {
          800: '#151b28',
          900: '#0b0f19',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
