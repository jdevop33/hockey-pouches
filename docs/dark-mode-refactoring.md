# Dark Mode Refactoring Plan

This document outlines the plan for refactoring the Hockey Pouches application to use a consistent dark mode theme throughout the entire application.

## Current State

The application currently has a mix of light and dark mode components. The Tailwind configuration already includes a dark color palette with dark mode colors and gold accents, which should be used consistently across the application.

## Color Palette

We'll standardize on the following color palette from our Tailwind configuration:

### Background Colors

- Primary Background: `bg-dark-500` (#12121a)
- Secondary Background: `bg-dark-600` (#0d0d12)
- Tertiary Background: `bg-dark-700` (#08080a)
- Card/Element Background: `bg-dark-600` (#0d0d12) or `bg-dark-700` (#08080a)

### Text Colors

- Primary Text: `text-white`
- Secondary Text: `text-gray-300` or `text-gray-400`
- Accent Text: `text-gold-500` (#d4af37)
- Success Text: `text-green-400`
- Warning Text: `text-yellow-400`
- Error Text: `text-red-300` or `alert-red` (#FF3B30)

### Border Colors

- Primary Border: `border-gold-500/10` or `border-gold-500/20`
- Secondary Border: `border-gray-700`
- Focus Border: `border-gold-500`

### Button Colors

- Primary Button: `bg-gold-500 text-dark-900`
- Secondary Button: `bg-transparent border border-gold-500 text-gold-500`
- Hover States: `hover:bg-gold-400` (for primary), `hover:bg-gold-500 hover:text-dark-900` (for secondary)

## Implementation Plan

### 1. Global Components & Layouts

- [ ] Review and update `Layout.tsx` and any other global layout components
- [ ] Check global styling in `globals.css` or similar files
- [ ] Review and update commonly used UI components like buttons, inputs, cards, etc.
- [ ] Update loading spinners and loading states to match dark theme

### 2. Page-specific Refactoring

We'll update these page sections in priority order:

#### High Priority

- [ ] Homepage and product pages
- [ ] Cart and checkout flow
- [ ] Login and registration pages
- [ ] User dashboard and account settings
- [ ] Admin dashboard

#### Medium Priority

- [ ] Static content pages (About, FAQ, Terms, Privacy)
- [ ] Contact forms
- [ ] Distributor views
- [ ] Reports and detailed views

#### Low Priority

- [ ] Error pages
- [ ] Email templates
- [ ] PDF outputs if applicable

### 3. Images and Media

- [x] Update OpenGraph images to use dark theme with gold accents
- [ ] Review and update any light-themed illustrations or icons
- [ ] Ensure product images have proper contrast against dark backgrounds
- [ ] Consider adding subtle drop shadows to images for better separation

### 4. Forms and Interactive Elements

- [ ] Update form styling (inputs, selects, checkboxes, etc.)
- [ ] Review form validation styles and error states
- [ ] Update interactive components (dropdowns, modals, tooltips, etc.)
- [ ] Ensure focus states are visible and accessible

### 5. Accessibility Considerations

- [ ] Ensure sufficient contrast ratios between text and backgrounds
- [ ] Add focus indicators that are visible in dark mode
- [ ] Test with screen readers and keyboard navigation
- [ ] Verify that interactive elements have appropriate hover/focus states

### 6. Testing

- [ ] Test all pages on desktop and mobile viewports
- [ ] Verify consistency across different browsers
- [ ] Check for any light mode "leaks" (unexpected light backgrounds or elements)
- [ ] Validate all interactive elements work correctly with updated styling

## Implementation Guidelines

1. Use existing Tailwind classes from our config wherever possible
2. Prefer semantic color variables (e.g., `text-error` over `text-red-500`)
3. Use opacity modifiers for subtle variations (e.g., `bg-dark-700/50`)
4. Add transitions for hover/focus states (`transition-colors duration-200`)
5. Maintain consistent spacing and sizing throughout the application

## Project Timeline

1. **Week 1**: Global components, layouts, and high-priority pages
2. **Week 2**: Medium-priority pages and components
3. **Week 3**: Low-priority items, testing, and refinement

## Conclusion

This dark mode refactoring will create a more cohesive, modern user experience while reducing eye strain for users. The consistent use of the gold accent color will reinforce our brand identity throughout the application.
