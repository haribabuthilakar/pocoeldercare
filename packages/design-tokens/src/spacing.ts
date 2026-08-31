/**
 * Dual density spacing modes per D-86.
 * - Comfortable: >= 48px touch targets and generous padding for Senior/Family portal.
 * - Compact: High-density 8px cell padding and compact controls for Admin ops dashboard.
 */
export const pocoSpacing = {
  comfortable: {
    minTouchTarget: '3rem', // 48px
    buttonPaddingX: '1.5rem', // 24px
    buttonPaddingY: '0.875rem', // 14px
    cardPadding: '1.5rem', // 24px
    tableCellPaddingY: '1rem', // 16px
    inputHeight: '3rem' // 48px
  },

  compact: {
    minTouchTarget: '2rem', // 32px
    buttonPaddingX: '0.875rem', // 14px
    buttonPaddingY: '0.375rem', // 6px
    cardPadding: '1rem', // 16px
    tableCellPaddingY: '0.5rem', // 8px
    inputHeight: '2.25rem' // 36px
  },

  radius: {
    sm: '0.375rem', // 6px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px (Admin default)
    xl: '1rem',     // 16px
    '2xl': '1.25rem', // 20px (Family default)
    full: '9999px'
  }
} as const;
