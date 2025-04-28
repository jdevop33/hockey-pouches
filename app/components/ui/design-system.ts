/**
 * Design System Constants based on Refactoring UI principles
 *
 * Provides a system of constants for creating consistent:
 * - Spacing
 * - Typography
 * - Colors
 * - Elevation/Shadows
 *
 * Use these values throughout the application instead of arbitrary values.
 */

// Spacing Scale - Based on 4px base unit - non-linear progression for visual distinction
export const spacing = {
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  56: '14rem', // 224px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
};

// Typography Scale - Limited set of sizes with clear visual distinction
export const typography = {
  size: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
  },
  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  leading: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  tracking: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// Color System - Multiple shades for each color
export const colors = {
  // Primary brand color
  gold: {
    50: 'hsl(45, 100%, 96%)',
    100: 'hsl(45, 95%, 90%)',
    200: 'hsl(45, 90%, 84%)',
    300: 'hsl(45, 85%, 76%)',
    400: 'hsl(45, 80%, 68%)',
    500: 'hsl(45, 90%, 58%)', // Base
    600: 'hsl(40, 95%, 48%)',
    700: 'hsl(36, 100%, 38%)',
    800: 'hsl(32, 100%, 32%)',
    900: 'hsl(28, 100%, 26%)',
    950: 'hsl(26, 100%, 16%)',
  },
  // Dark background variations
  dark: {
    50: 'hsl(220, 20%, 94%)',
    100: 'hsl(220, 15%, 85%)',
    200: 'hsl(220, 15%, 74%)',
    300: 'hsl(220, 15%, 62%)',
    400: 'hsl(220, 15%, 45%)',
    500: 'hsl(220, 15%, 30%)',
    600: 'hsl(220, 18%, 25%)',
    700: 'hsl(220, 20%, 20%)',
    800: 'hsl(220, 22%, 15%)',
    900: 'hsl(220, 24%, 10%)',
    950: 'hsl(220, 25%, 5%)',
  },
  // Grayscale for text and borders
  gray: {
    50: 'hsl(0, 0%, 98%)',
    100: 'hsl(0, 0%, 94%)',
    200: 'hsl(0, 0%, 88%)',
    300: 'hsl(0, 0%, 74%)',
    400: 'hsl(0, 0%, 60%)',
    500: 'hsl(0, 0%, 49%)',
    600: 'hsl(0, 0%, 38%)',
    700: 'hsl(0, 0%, 28%)',
    800: 'hsl(0, 0%, 18%)',
    900: 'hsl(0, 0%, 10%)',
    950: 'hsl(0, 0%, 5%)',
  },
  // State colors
  state: {
    error: {
      light: 'hsl(0, 90%, 68%)',
      base: 'hsl(0, 90%, 60%)',
      dark: 'hsl(0, 90%, 45%)',
    },
    success: {
      light: 'hsl(145, 80%, 55%)',
      base: 'hsl(145, 80%, 42%)',
      dark: 'hsl(145, 80%, 35%)',
    },
    warning: {
      light: 'hsl(45, 90%, 65%)',
      base: 'hsl(45, 90%, 50%)',
      dark: 'hsl(40, 90%, 45%)',
    },
    info: {
      light: 'hsl(210, 90%, 65%)',
      base: 'hsl(210, 90%, 50%)',
      dark: 'hsl(210, 90%, 40%)',
    },
  },
};

// Shadow system for elevation
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  gold: {
    sm: '0 1px 2px 0 rgba(250, 204, 21, 0.05)',
    md: '0 4px 6px -1px rgba(250, 204, 21, 0.1), 0 2px 4px -1px rgba(250, 204, 21, 0.06)',
    lg: '0 10px 15px -3px rgba(250, 204, 21, 0.1), 0 4px 6px -2px rgba(250, 204, 21, 0.05)',
  },
};

// Border radius system
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  md: '0.25rem',
  lg: '0.375rem',
  xl: '0.5rem',
  '2xl': '0.75rem',
  '3xl': '1rem',
  full: '9999px',
};
