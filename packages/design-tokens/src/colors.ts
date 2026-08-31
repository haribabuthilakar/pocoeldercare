/**
 * Poco Elder Care core brand palette constants.
 * Anchored by #12C395 (Primary Mint), #FE1D8F (Alert Magenta), and #6BAAD0 (Info Cerulean).
 */
export const pocoColors = {
  // Brand Primary (Vibrant Mint / Emerald)
  primary: {
    50: '#E8FAF4',
    100: '#C5F4E4',
    200: '#90EBD0',
    300: '#56DFB9',
    400: '#2BD2A5',
    500: '#12C395', // Primary brand anchor
    600: '#0FA37C',
    700: '#0E8164',
    800: '#106650',
    900: '#0F5443',
    DEFAULT: '#12C395',
    foreground: '#FFFFFF'
  },

  // Brand Accent / Emergency / Alert (Vibrant Magenta / Rose)
  accent: {
    50: '#FFE5F2',
    100: '#FFB8DF',
    200: '#FF80C6',
    300: '#FE47AC',
    400: '#FE2B9C',
    500: '#FE1D8F', // Accent anchor
    600: '#D90B75',
    700: '#AD005A',
    800: '#8A0348',
    900: '#6E083B',
    DEFAULT: '#FE1D8F',
    foreground: '#FFFFFF'
  },

  // Brand Secondary / Healthcare Info (Soft Sky / Cerulean Blue)
  secondary: {
    50: '#F0F7FB',
    100: '#DBEDF6',
    200: '#BCE0F0',
    300: '#94CDE6',
    400: '#7BBADC',
    500: '#6BAAD0', // Secondary anchor
    600: '#5290B5',
    700: '#407596',
    800: '#38617B',
    900: '#325267',
    DEFAULT: '#6BAAD0',
    foreground: '#FFFFFF'
  },

  // Neutral Warm Slates
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617'
  },

  // Status Colors
  status: {
    success: '#12C395',
    warning: '#F59E0B',
    danger: '#FE1D8F',
    info: '#6BAAD0',
    neutral: '#64748B'
  },

  // Vital Chart Line Palette
  vitals: {
    bpSystolic: '#FE1D8F',
    bpDiastolic: '#6BAAD0',
    pulse: '#12C395',
    spo2: '#10B981',
    glucose: '#F59E0B',
    temperature: '#EF4444'
  }
} as const;
