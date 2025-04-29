/**
 * Design System Constants based on Refactoring UI principles
 *
 * Provides a system of constants for creating consistent:
 * - Spacing
 * - Typography
 * - Colors
 * - Elevation/Shadows
 * - Layout
 * - Breakpoints
 * - Overlays
 */

// Breakpoints - Mobile First
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Media Queries
export const media = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,

  // Special cases
  hover: '@media (hover: hover)',
  dark: '@media (prefers-color-scheme: dark)',
  light: '@media (prefers-color-scheme: light)',
  reduce: '@media (prefers-reduced-motion: reduce)',
} as const;

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

// Layout Constants
export const layout = {
  maxWidth: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    prose: '65ch', // Optimal reading width
  },
  aspectRatio: {
    square: '1/1',
    portrait: '3/4',
    landscape: '4/3',
    video: '16/9',
    ultrawide: '21/9',
  },
  container: {
    padding: {
      xs: spacing[4],
      sm: spacing[6],
      md: spacing[8],
      lg: spacing[12],
    },
    margin: {
      xs: spacing[4],
      sm: spacing[6],
      md: spacing[8],
      lg: spacing[12],
    },
  },
  zIndex: {
    hide: -1,
    base: 0,
    raised: 1,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    toast: 1600,
    tooltip: 1700,
  },
} as const;

// Enhanced Typography Scale
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
    // New specific line heights for different contexts
    heading: {
      sm: '1.2',
      md: '1.3',
      lg: '1.4',
    },
    body: {
      sm: '1.5',
      md: '1.6',
      lg: '1.8',
    },
  },
  tracking: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
    // New specific letter spacing
    heading: '-0.025em',
    allCaps: '0.05em',
    button: '0.025em',
  },
  measure: {
    none: 'none',
    short: '40ch',
    base: '65ch',
    wide: '80ch',
  },
  font: {
    sans: 'var(--font-sans)',
    serif: 'var(--font-serif)',
    mono: 'var(--font-mono)',
  },
} as const;

// Colors with semantic meaning
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
  // New semantic colors
  semantic: {
    primary: 'var(--color-primary)',
    secondary: 'var(--color-secondary)',
    accent: 'var(--color-accent)',
    background: {
      page: 'var(--color-background)',
      subtle: 'var(--color-background-subtle)',
      inverse: 'var(--color-background-inverse)',
    },
    text: {
      primary: 'var(--color-text-primary)',
      secondary: 'var(--color-text-secondary)',
      tertiary: 'var(--color-text-tertiary)',
      inverse: 'var(--color-text-inverse)',
    },
    border: {
      default: 'var(--color-border)',
      subtle: 'var(--color-border-subtle)',
      strong: 'var(--color-border-strong)',
    },
  },
};

// Overlay system
export const overlays = {
  dark: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.3)',
    heavy: 'rgba(0, 0, 0, 0.5)',
    opaque: 'rgba(0, 0, 0, 0.9)',
  },
  light: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.3)',
    heavy: 'rgba(255, 255, 255, 0.5)',
    opaque: 'rgba(255, 255, 255, 0.9)',
  },
  blur: {
    light: 'blur(4px)',
    medium: 'blur(8px)',
    heavy: 'blur(16px)',
  },
} as const;

// Base shadows
const baseShadows = {
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
} as const;

// Enhanced shadow system
export const shadows = {
  ...baseShadows,
  // Layered shadows
  layered: {
    sm: `${baseShadows.sm}, 0 1px 2px -1px rgba(0, 0, 0, 0.1)`,
    md: `${baseShadows.md}, 0 2px 4px -2px rgba(0, 0, 0, 0.1)`,
    lg: `${baseShadows.lg}, 0 4px 6px -4px rgba(0, 0, 0, 0.1)`,
  },
  // Inner shadows
  inner: {
    sm: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
    lg: 'inset 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
} as const;

// Animation tokens
export const animation = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '450ms',
    slower: '600ms',
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  keyframes: {
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    fadeOut: {
      from: { opacity: '1' },
      to: { opacity: '0' },
    },
    slideIn: {
      from: { transform: 'translateY(10px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    slideOut: {
      from: { transform: 'translateY(0)', opacity: '1' },
      to: { transform: 'translateY(10px)', opacity: '0' },
    },
  },
} as const;

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

// Focus styles
export const focus = {
  default: {
    outline: 'none',
    ring: '2px',
    ringOffset: '2px',
    ringColor: 'var(--color-focus-ring)',
  },
  within: {
    outline: 'none',
    ring: '2px',
    ringOffset: '1px',
    ringColor: 'var(--color-focus-ring-within)',
  },
} as const;

// Grid system
export const grid = {
  columns: {
    1: 'repeat(1, minmax(0, 1fr))',
    2: 'repeat(2, minmax(0, 1fr))',
    3: 'repeat(3, minmax(0, 1fr))',
    4: 'repeat(4, minmax(0, 1fr))',
    5: 'repeat(5, minmax(0, 1fr))',
    6: 'repeat(6, minmax(0, 1fr))',
    12: 'repeat(12, minmax(0, 1fr))',
    auto: 'auto-fill',
    'auto-fit': 'auto-fit',
  },
  gap: spacing,
} as const;

// Export types for better TypeScript support
export type Breakpoint = keyof typeof breakpoints;
export type Spacing = keyof typeof spacing;
export type Color = keyof typeof colors;
export type Shadow = keyof typeof shadows;
export type Typography = keyof typeof typography;
export type BorderRadius = keyof typeof borderRadius;
export type ZIndex = keyof typeof layout.zIndex;
export type Animation = keyof typeof animation;
