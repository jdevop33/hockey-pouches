/** @type {import('tailwindcss').Config} */
import tailwindForms from '@tailwindcss/forms';
import tailwindTypography from '@tailwindcss/typography';
import tailwindAspectRatio from '@tailwindcss/aspect-ratio';
import tailwindTextShadow from 'tailwindcss-textshadow';

const tailwindConfig = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Add common opacity variants for gold color
    'border-gold-500/10',
    'border-gold-500/20',
    'border-gold-500/30',
    'border-gold-500/40',
    'border-gold-500/50',
    'border-gold-500/60',
    'focus:border-gold-500',
    'focus:ring-gold-500/20',
    'hover:border-gold-500',
    'hover:border-gold-500/60',
    'text-gold-500',
    'hover:shadow-gold',
  ],
  darkMode: 'class', // Using class for manual toggling with next-themes
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf7e8',
          100: '#f5efd1',
          200: '#ece1a3',
          300: '#e2ce75',
          400: '#d9bc47',
          500: '#d4af37', // Classic gold
          600: '#b8860b', // Dark goldenrod
          700: '#a17808',
          800: '#7a5b06',
          900: '#644a05',
          950: '#3d2e03',
        },
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
          900: '#0f172a', // Dark blue/slate
          950: '#05050f', // Near black with blue tint
        },
        accent: {
          50: '#fefde8',
          100: '#fffcbf',
          200: '#fff782',
          300: '#ffec44',
          400: '#fedf15',
          500: '#ffd700', // Gold
          600: '#e6c000',
          700: '#c49000',
          800: '#9c7000',
          900: '#7f5a00',
          950: '#473200',
        },
        // Add custom background and text colors
        dark: {
          100: '#2d2d3d',
          200: '#25252f',
          300: '#1f1f28',
          400: '#18181f',
          500: '#12121a', // Main dark background
          600: '#0d0d12',
          700: '#08080a',
          800: '#050507',
          900: '#020203',
        },
        gold: {
          50: '#faf7e8',
          100: '#f5efd1',
          200: '#ece1a3',
          300: '#e2ce75',
          400: '#d9bc47',
          500: '#d4af37', // Classic gold
          600: '#c9a633', // Slightly darker classic gold
          700: '#b8860b', // Dark goldenrod
          800: '#9c7000',
          900: '#7f5a00',
          950: '#473200',
        },
        'brand-black': '#101014',
        'brand-gold': '#FFD700',
        'brand-cream': '#F5F5F4',
        'brand-blue': '#3B82F6',
        'brand-surface': '#18181b',
        'brand-gray': '#23232a',
        // PUXX Brand Colors
        'puxx-black': '#101010',
        'puxx-gold': '#D4AF37',
        // Status
        'success-green': '#05CE91',
        'warning-amber': '#FF9900',
        'alert-red': '#FF3B30',
      },
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
        heading: ['Montserrat', 'Sora', 'ui-sans-serif', 'system-ui'],
        body: ['Lato', 'Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        h1: ['3rem', { lineHeight: '3.375rem', letterSpacing: '-0.5px', fontWeight: '700' }],
        h2: ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.3px', fontWeight: '600' }],
        h3: ['1.75rem', { lineHeight: '2.25rem', letterSpacing: '-0.2px', fontWeight: '500' }],
        h4: ['1.3125rem', { lineHeight: '1.75rem', fontWeight: '500' }],
        subtitle: [
          '1.125rem',
          { lineHeight: '1.625rem', fontWeight: '400', letterSpacing: '0.2px' },
        ],
        body: ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        caption: ['0.875rem', { lineHeight: '1.25rem', fontWeight: '300', letterSpacing: '0.1px' }],
        legal: ['0.75rem', { lineHeight: '1rem', fontWeight: '300' }],
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
        pulse: 'pulse 0.5s ease-in-out',
        goldPulse: 'goldPulse 2s infinite',
        goldShift: 'goldShift 5s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        pulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        goldPulse: {
          '0%': { boxShadow: '0 0 5px rgba(255, 215, 0, 0.2)' },
          '50%': { boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)' },
          '100%': { boxShadow: '0 0 5px rgba(255, 215, 0, 0.2)' },
        },
        goldShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      textShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
        xs: '0 1px 1px rgba(0, 0, 0, 0.05)',
        gold: '0 0 8px rgba(255, 215, 0, 0.5)',
      },
      boxShadow: {
        gold: '0 0 10px rgba(212, 175, 55, 0.3)',
        'gold-sm': '0 0 5px rgba(212, 175, 55, 0.2)',
        'gold-lg': '0 0 15px rgba(212, 175, 55, 0.4)',
        'gold-inner': 'inset 0 0 5px rgba(212, 175, 55, 0.2)',
        'gold-glow': '0 0 20px rgba(255, 215, 0, 0.4)',
        card: '0 4px 24px 0 rgba(16,16,16,0.12)',
        glass: '0 8px 32px 0 rgba(16,16,16,0.24)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(45deg, #D4AF37, #FFD700, #B8860B)',
        'gradient-gold-subtle':
          'linear-gradient(45deg, rgba(212, 175, 55, 0.1), rgba(255, 215, 0, 0.1))',
        'gradient-dark': 'linear-gradient(to bottom, rgba(5, 5, 15, 0.9), rgba(15, 23, 42, 0.9))',
        'gradient-navy': 'linear-gradient(45deg, #1A2B40, #23232a)',
        'gradient-green': 'linear-gradient(45deg, #2C5545, #23232a)',
        'gradient-blue': 'linear-gradient(45deg, #7CB7CB, #23232a)',
      },
      borderWidth: {
        0.5: '0.5px',
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
      },
      // Glassmorphism utility
      backdropBlur: {
        glass: '10px',
      },
    },
  },
  plugins: [
    tailwindForms,
    tailwindTypography,
    tailwindAspectRatio,
    tailwindTextShadow,
    // Add custom gold border utilities
    function ({ addUtilities }) {
      const newUtilities = {
        '.border-gold-glow': {
          'border-color': '#d4af37',
          'box-shadow': '0 0 5px rgba(212, 175, 55, 0.5)',
        },
        '.border-gradient-gold': {
          'border-image': 'linear-gradient(45deg, #d4af37, #ffd700, #b8860b) 1',
          'border-image-slice': '1',
        },
      };
      addUtilities(newUtilities);
    },
    // Glass effect utilities
    function ({ addUtilities }) {
      const newUtilities = {
        '.bg-glass': {
          background: 'rgba(16,16,16,0.6)',
          'backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(212, 175, 55, 0.1)',
        },
        '.bg-glass-dark': {
          background: 'rgba(16,16,16,0.8)',
          'backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(212, 175, 55, 0.1)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
};

export default tailwindConfig;
