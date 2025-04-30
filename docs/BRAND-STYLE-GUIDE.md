# PUXX Brand Style Guide

## Color Palette

### Primary Colors

- **Gold**: `#d4af37` (--primary-gold: 212, 175, 55)
  - Accent Gold: `#ffd700` (--accent-gold: 255, 215, 0)
  - Luxury Gold: `#b8860b` (--luxury-gold: 184, 134, 11)

### Dark Theme Colors

- **Background**: `#05050f` (--background-rgb: 5, 5, 15)
- **Dark Surface**: `#18181b` (--brand-surface)
- **Dark Variants**:
  - Dark-500: `#12121a` (Main dark background)
  - Dark-600: `#0d0d12`
  - Dark-700: `#08080a`
  - Dark-800: `#050507`
  - Dark-900: `#020203`

### Status Colors

- **Success**: `#05CE91` (success-green)
- **Warning**: `#FF9900` (warning-amber)
- **Alert**: `#FF3B30` (alert-red)

## Typography

### Font Families

- **Main/Sans**: 'Inter', system-ui, sans-serif
- **Headings**: 'Montserrat', 'Sora', system-ui
- **Body**: 'Lato', 'Inter', system-ui
- **Monospace**: 'JetBrains Mono', monospace

### Type Scale

- **H1**: 3rem, line-height: 3.375rem, letter-spacing: -0.5px, font-weight: 700
- **H2**: 2.25rem, line-height: 2.75rem, letter-spacing: -0.3px, font-weight: 600
- **H3**: 1.75rem, line-height: 2.25rem, letter-spacing: -0.2px, font-weight: 500
- **H4**: 1.3125rem, line-height: 1.75rem, font-weight: 500
- **Subtitle**: 1.125rem, line-height: 1.625rem, font-weight: 400, letter-spacing: 0.2px
- **Body**: 1rem, line-height: 1.5rem, font-weight: 400
- **Caption**: 0.875rem, line-height: 1.25rem, font-weight: 300, letter-spacing: 0.1px
- **Legal**: 0.75rem, line-height: 1rem, font-weight: 300

## Components

### Buttons

#### Primary Button (High Contrast Gold)

```html
<button class="btn-gold-contrast rounded-md px-4 py-2 text-base font-extrabold">Button Text</button>
```

#### Standard Button Variants

- **Primary/Default**: `bg-gold-500 text-black font-semibold hover:bg-gold-600 shadow-gold-sm hover:shadow-gold btn-gold-contrast`
- **Secondary**: `bg-secondary-200 text-secondary-900 hover:bg-secondary-300 dark:bg-secondary-800 dark:text-secondary-50 dark:hover:bg-secondary-700`
- **Outline**: `border border-gold-500/50 bg-transparent hover:bg-gold-500/10 text-gold-500`
- **Ghost**: `hover:bg-gold-500/10 text-gold-500 hover:text-gold-600`
- **Link**: `text-gold-500 underline-offset-4 hover:underline`
- **Gold**: `bg-gold-500 text-black font-bold hover:bg-gold-600 border border-gold-600 hover:shadow-gold btn-gold-contrast`

#### Button Sizes

- **Default**: `h-10 px-4 py-2`
- **Small**: `h-9 rounded-md px-3`
- **Large**: `h-11 rounded-md px-8`
- **Icon**: `h-10 w-10`

### Cards

#### Standard Card

```html
<div
  class="rounded-lg border border-gold-500/10 bg-dark-800/70 p-6 shadow-md transition-all hover:-translate-y-1 hover:border-gold-500/30 hover:shadow-gold"
>
  <!-- Card content -->
</div>
```

#### Premium Container

```html
<div class="luxury-container">
  <!-- Content -->
</div>
```

#### Glass Effect

```html
<div class="rounded-lg p-4 bg-glass">
  <!-- Content -->
</div>
```

### Text Styling

#### Gold Text Effect

```html
<span class="text-gold-500">Gold Text</span>
<span class="gold-text">Gold Text Alternative</span>
<span class="accent-gold-text">Brighter Gold</span>
<span class="gold-gradient-text">Gradient Gold Text</span>
```

#### Text Shadow

```html
<span class="text-shadow-sm">Subtle shadow</span>
<span class="text-shadow-xs">Extra subtle shadow</span>
<span class="text-shadow-gold">Gold glow shadow</span>
```

## Animation Classes

- **Fade In**: `animate-fadeIn`
- **Pulse**: `animate-pulse`
- **Gold Pulse**: `animate-goldPulse`
- **Gold Shift**: `animate-goldShift`

## Accessibility

- High contrast mode: `.high-contrast`
- Reduced motion: `.reduced-motion`
- Dyslexic-friendly: `.dyslexic-font`

## Box Shadows

- **Gold**: `shadow-gold` - `0 0 10px rgba(212, 175, 55, 0.3)`
- **Gold Small**: `shadow-gold-sm` - `0 0 5px rgba(212, 175, 55, 0.2)`
- **Gold Large**: `shadow-gold-lg` - `0 0 15px rgba(212, 175, 55, 0.4)`
- **Gold Inner**: `shadow-gold-inner` - `inset 0 0 5px rgba(212, 175, 55, 0.2)`
- **Gold Glow**: `shadow-gold-glow` - `0 0 20px rgba(255, 215, 0, 0.4)`

## Design Principles

1. **Luxury First**: Use gold accents sparingly to convey premium quality
2. **Dark Theme**: Primary background should be dark to make products and gold accents stand out
3. **High Contrast**: Ensure text is always readable against its background
4. **Visual Hierarchy**: Use size, weight, color, and spacing to guide users' attention
5. **Consistent Motion**: Use subtle animations consistently to enhance the premium feel
