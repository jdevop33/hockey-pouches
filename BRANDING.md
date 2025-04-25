# PUXX Branding Guide

This document explains how to switch between the different branding options for the PUXX application.

## Available Branding Options

The application supports two branding styles:

1. **New Branding (PUXX Premium)** - Luxury-oriented design using:
   - Anzac gold (primary)
   - Navy blue (secondary)
   - Forest green (accent)
   - Cream (background)
   - Rich black (dark mode)

2. **Original Branding (Hockey Pouches)** - Original design using:
   - Blue (primary)
   - Slate gray (secondary)
   - Sky blue (accent)

## How to Switch Between Branding Options

### Step 1: Update the Tailwind Configuration

Open `tailwind.config.js` and change the `BRANDING` constant at the top of the file:

```js
// Toggle between branding styles
// Set to 'new' for PUXX Premium luxury branding (anzac gold, navy, forest green, cream)
// Set to 'old' for original Hockey Pouches branding (blue, slate, sky)
const BRANDING = 'new'; // Change to 'old' for original branding
```

### Step 2: Update the CSS Variables (Optional)

If you want to fully switch the branding, you can also replace the CSS variables in `app/globals.css`:

1. For **New Branding (PUXX Premium)**:
   ```bash
   cp app/globals.css.new-branding app/globals.css
   ```

2. For **Original Branding (Hockey Pouches)**:
   ```bash
   cp app/globals.css.old-branding app/globals.css
   ```

### Step 3: Rebuild the Application

After making these changes, rebuild the application:

```bash
npm run build
```

## Component Usage

The components in the application are designed to work with both branding options. They use CSS variables and Tailwind classes that will automatically adapt to the selected branding.

### Button Component Example

The button component uses the primary, secondary, and accent colors from the selected branding:

```jsx
// Primary button (anzac gold in new branding, blue in old branding)
<Button variant="default">Click Me</Button>

// Secondary button (navy in new branding, slate in old branding)
<Button variant="secondary">Click Me</Button>

// Accent button (forest green in new branding, sky blue in old branding)
<Button variant="accent">Click Me</Button>
```

## Design System

### New Branding (PUXX Premium) Color Palette

| Color Name | Primary Use | Tailwind Class |
|------------|-------------|----------------|
| Anzac Gold | Primary actions, highlights | `bg-anzac-500`, `text-anzac-500` |
| Navy Blue | Secondary elements, headers | `bg-navy-600`, `text-navy-600` |
| Forest Green | Success states, accents | `bg-forest-600`, `text-forest-600` |
| Cream | Backgrounds, cards | `bg-cream-50`, `text-cream-900` |
| Rich Black | Dark mode backgrounds | `bg-rich-950`, `text-rich-50` |

### Original Branding (Hockey Pouches) Color Palette

| Color Name | Primary Use | Tailwind Class |
|------------|-------------|----------------|
| Blue | Primary actions, highlights | `bg-primary-500`, `text-primary-500` |
| Slate Gray | Secondary elements, text | `bg-secondary-500`, `text-secondary-500` |
| Sky Blue | Accents, links | `bg-accent-500`, `text-accent-500` |

## Notes

- The branding switch is designed to be as seamless as possible, but some custom components may need additional adjustments.
- Images and logos are not automatically switched - you'll need to update those manually if needed.
- The backup files (`globals.css.new-branding` and `globals.css.old-branding`) are provided for convenience and can be used to quickly switch between branding styles.
