import type { Config } from 'tailwindcss';
import { pocoColors } from '../colors';
import { pocoTypography } from '../typography';
import { pocoSpacing } from '../spacing';

/**
 * Tailwind CSS Preset Plugin for Poco Elder Care applications.
 * Imported via presets: [require('@poco/design-tokens/tailwind')] per D-81 and D-84.
 */
export const pocoPreset: Partial<Config> = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        poco: pocoColors,
        primary: {
          ...pocoColors.primary,
          DEFAULT: pocoColors.primary[500],
          foreground: '#FFFFFF'
        },
        accent: {
          ...pocoColors.accent,
          DEFAULT: pocoColors.accent[500],
          foreground: '#FFFFFF'
        },
        secondary: {
          ...pocoColors.secondary,
          DEFAULT: pocoColors.secondary[500],
          foreground: '#FFFFFF'
        }
      },
      fontFamily: {
        sans: pocoTypography.fontFamily.sans as unknown as string[],
        mono: pocoTypography.fontFamily.mono as unknown as string[]
      },
      borderRadius: {
        'poco-family': pocoSpacing.radius['2xl'],
        'poco-admin': pocoSpacing.radius.lg
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        },
        'fade-in-warm': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'shake-error': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' }
        }
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-warm': 'fade-in-warm 0.25s ease-out',
        'shake-error': 'shake-error 0.3s ease-in-out'
      }
    }
  }
};
