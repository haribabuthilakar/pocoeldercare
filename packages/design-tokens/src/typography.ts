/**
 * Senior-friendly typography scale and contrast standards per D-83 and D-94.
 */
export const pocoTypography = {
  // Family & Senior Scale (Base 18px for readability)
  senior: {
    xs: { fontSize: '0.875rem', lineHeight: '1.25rem' }, // 14px
    sm: { fontSize: '1rem', lineHeight: '1.5rem' },       // 16px
    base: { fontSize: '1.125rem', lineHeight: '1.75rem' }, // 18px
    lg: { fontSize: '1.25rem', lineHeight: '1.75rem' },   // 20px
    xl: { fontSize: '1.5rem', lineHeight: '2rem' },       // 24px
    '2xl': { fontSize: '1.875rem', lineHeight: '2.25rem' }, // 30px
    '3xl': { fontSize: '2.25rem', lineHeight: '2.5rem' }   // 36px
  },

  // Admin Ops Data Table Scale (Base 14px for density)
  admin: {
    xs: { fontSize: '0.75rem', lineHeight: '1rem' },      // 12px
    sm: { fontSize: '0.875rem', lineHeight: '1.25rem' },  // 14px
    base: { fontSize: '1rem', lineHeight: '1.5rem' },     // 16px
    lg: { fontSize: '1.125rem', lineHeight: '1.75rem' },  // 18px
    xl: { fontSize: '1.25rem', lineHeight: '1.75rem' },   // 20px
    '2xl': { fontSize: '1.5rem', lineHeight: '2rem' }     // 24px
  },

  fontFamily: {
    sans: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif'
    ],
    mono: [
      '"JetBrains Mono"',
      'Menlo',
      'Monaco',
      'Consolas',
      'monospace'
    ]
  }
} as const;
