# Pouches Wholesale

A Next.js website for selling nicotine pouches to wholesale customers.

## Project Structure

- `/app`: Next.js App Router structure
  - `/components`: Reusable components
    - `/layout`: Layout components including the main Layout component
  - `/data`: Data files including product data
  - Various page directories for each route

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Building

```bash
# Build for production
npm run build

# If you encounter ESLint errors during build, use:
npx next build --no-lint
```

## Deployment

```bash
# Deploy to production
npm run deploy
```

## Notes

- The project uses TypeScript for type safety
- ESLint is configured to warn about unused variables
- The main layout component is in `/app/components/layout/Layout.tsx`
- Product data is stored in `/app/data/products.ts`
