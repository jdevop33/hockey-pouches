/** @type {import('tailwindcss').Config} */

// Toggle between branding styles
// Set to 'new' for PUXX Premium luxury branding (anzac gold, navy, forest green, cream)
// Set to 'old' for original Hockey Pouches branding (blue, slate, sky)
const BRANDING = 'new';

// Color palettes
const newBranding = {
  // Anzac gold (luxury accent)
  anzac: {
    50: '#faf9ec',
    100: '#f4f0cd',
    200: '#ebdf9d',
    300: '#dfc865',
    400: '#d4af37',
    500: '#c59b2d',
    600: '#aa7a24',
    700: '#885920',
    800: '#724921',
    900: '#623e21',
    950: '#382010',
  },
  // Navy blue (yachting vibes)
  navy: {
    50: '#f0f5fa',
    100: '#dce8f5',
    200: '#bfd7ed',
    300: '#93bde0',
    400: '#619cd0',
    500: '#3f7fc0',
    600: '#2f65a5',
    700: '#275187',
    800: '#244571',
    900: '#223c60',
    950: '#0f1e36',
  },
  // Forest green (golf course elegance)
  forest: {
    50: '#f0faf3',
    100: '#dbf2e3',
    200: '#b9e4ca',
    300: '#8acfaa',
    400: '#5bb486',
    500: '#3a9969',
    600: '#2a7b52',
    700: '#246344',
    800: '#1f4f38',
    900: '#1b422f',
    950: '#0c261b',
  },
  // Cream (tennis courts, clean aesthetic)
  cream: {
    50: '#fefdf9',
    100: '#faf8ed',
    200: '#f5efda',
    300: '#ede0ba',
    400: '#e2ca91',
    500: '#d7b46f',
    600: '#c99a51',
    700: '#b37f3e',
    800: '#946735',
    900: '#79552f',
    950: '#412c17',
  },
  // Rich black for dark mode
  rich: {
    50: '#f6f6f6',
    100: '#e7e7e7',
    200: '#d1d1d1',
    300: '#b0b0b0',
    400: '#888888',
    500: '#6d6d6d',
    600: '#5d5d5d',
    700: '#4f4f4f',
    800: '#454545',
    900: '#3d3d3d',
    950: '#121212', // Main dark background
  },
};

const oldBranding = {
  // Original Hockey Pouches blue
  primary: {
    50: '#eff7ff',
    100: '#dbebfe',
    200: '#b9dafd',
    300: '#94c9fc',
    400: '#62abf8',
    500: '#3d8af4', // Tropical Blue
    600: '#286ce8',
    700: '#1f56d6',
    800: '#2047ad',
    900: '#1f3f89',
    950: '#182753',
  },
  // Slate gray
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  // Sky blue accent
  accent: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Sky Blue
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
};

// Merge the selected branding with the base configuration
const colors = {
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
  },
  secondary: {
    DEFAULT: 'hsl(var(--secondary))',
    foreground: 'hsl(var(--secondary-foreground))',
  },
  destructive: {
    DEFAULT: 'hsl(var(--destructive))',
    foreground: 'hsl(var(--destructive-foreground))',
  },
  muted: {
    DEFAULT: 'hsl(var(--muted))',
    foreground: 'hsl(var(--muted-foreground))',
  },
  accent: {
    DEFAULT: 'hsl(var(--accent))',
    foreground: 'hsl(var(--accent-foreground))',
  },
  popover: {
    DEFAULT: 'hsl(var(--popover))',
    foreground: 'hsl(var(--popover-foreground))',
  },
  card: {
    DEFAULT: 'hsl(var(--card))',
    foreground: 'hsl(var(--card-foreground))',
  },
  ...(BRANDING === 'new' ? newBranding : oldBranding),
};

// If using old branding, add the color values to the primary/secondary/accent objects
if (BRANDING === 'old') {
  Object.keys(oldBranding.primary).forEach(key => {
    colors.primary[key] = oldBranding.primary[key];
  });
  Object.keys(oldBranding.secondary).forEach(key => {
    colors.secondary[key] = oldBranding.secondary[key];
  });
  Object.keys(oldBranding.accent).forEach(key => {
    colors.accent[key] = oldBranding.accent[key];
  });
}

module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animate'),
  ],
};
