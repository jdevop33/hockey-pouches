# Product Naming Conventions

This document outlines the standardized naming conventions for products and their associated assets in the Hockey Pouches system.

## Product Names

Products should follow this naming format in the database:

```
[Brand] [Flavor] ([Strength]mg)
```

Examples:

- `PUXX Mint (22mg)`
- `PUXX Watermelon (16mg)`
- `PUXX Apple Mint (12mg)`

## Image File Naming

All product images should follow kebab-case naming with this format:

```
brand-flavor-strength.png
```

Examples:

- `puxx-mint-22mg.png`
- `puxx-watermelon-16mg.png`
- `puxx-apple-mint-12mg.png`

For resized versions, add the dimensions after the main filename:

```
brand-flavor-strength-WIDTHxHEIGHT.png
```

Examples:

- `puxx-mint-22mg-300x300.png`
- `puxx-watermelon-16mg-768x768.png`

## Database Fields

When adding new products, follow these guidelines:

- `name`: Use the format `[Brand] [Flavor] ([Strength]mg)`
- `description`: Include flavor description and strength information
- `image_url`: Use the path `/images/products/brand-flavor-strength.png`
- `flavor`: Just the flavor name (e.g., "Mint", "Watermelon")
- `strength`: Numeric value only, without "mg" (e.g., 22, 16, 12)

## Implementation

Two files have been created to standardize existing product data:

1. `db/migrations/standardize_product_naming.sql` - Updates database records
2. `scripts/rename_product_images.js` - Renames image files

To run the image renaming script:

```bash
cd scripts
npm run rename-images
```

To run the database migration:

```
# In Neon console
RUN db/migrations/standardize_product_naming.sql
```
