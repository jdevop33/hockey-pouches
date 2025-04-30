# Schema Import Best Practices

## Overview

This document outlines best practices for importing Drizzle schema objects in our Next.js application. Following these guidelines helps prevent build errors and ensures consistent database access patterns.

## Key Principles

1. **Prefer specific imports over namespace imports**

   - Import specific tables directly from their individual schema files
   - Only use namespace imports when you need multiple schema objects

2. **Never import unused schema objects**

   - Always remove unused imports
   - The deployment build will fail if you have unused imports

3. **Follow the table-specific import pattern**
   - Import from the specific table file in `@/lib/schema/{table}`
   - This promotes tree-shaking and better type inference

## Correct Import Patterns

### ✅ Best: Import specific tables from their modules

```typescript
// Importing a single table
import { users } from '@/lib/schema/users';

// Importing multiple tables
import { orders } from '@/lib/schema/orders';
import { orderItems } from '@/lib/schema/orderItems';
```

### ⚠️ Acceptable: Import all schema when needed

```typescript
// When you need access to multiple schema objects or types
import * as schema from '@/lib/schema';

// When accessing tables through schema namespace
const result = await db.select().from(schema.users);
```

### ❌ Incorrect: Unused imports

```typescript
// DO NOT import schema if you're not using it
import * as schema from '@/lib/schema'; // This will cause build errors if unused

// DO NOT import specific tables you aren't using
import { users } from '@/lib/schema/users'; // Remove if unused
```

## Using the Schema Import Fixer

We have an automated tool to help maintain proper schema imports:

```bash
# Run manually to fix schema imports
node scripts/fix-schema-imports.mjs

# This also runs automatically on pre-commit and pre-deploy
```

The script:

1. Removes unused schema imports
2. Converts namespace imports to specific imports when possible
3. Identifies which tables are actually being used

## Type Imports

When you only need type information, use type imports:

```typescript
// For type imports only
import type { User } from '@/lib/schema/users';
import type { Order } from '@/lib/schema/orders';
```

## ESLint Rules

We've added ESLint rules to enforce these practices:

```
'drizzle/enforce-schema-imports': ['error', {
  preferIndividualImports: true,
  disallowNamespaceImports: true,
}]
```

This rule will flag issues during development so they can be fixed before deployment.

## Background

We recently encountered a critical build failure due to a schema import issue. This document outlines best practices to avoid similar issues in the future.

## Problem

The error occurred with:

```
ReferenceError: schema is not defined
```

This happened because:

1. We had imports like `import * as schema from '@/lib/schema'` in files
2. The schema wasn't actually used in the file
3. During the Next.js build process, tree-shaking removed the import
4. This caused references to fail at runtime

## Best Practices

### 1. Only import what you need

**Do:**

```typescript
import { commissions, users } from '@/lib/schema';
```

**Don't:**

```typescript
import * as schema from '@/lib/schema'; // Avoid if you only need specific tables
```

### 2. Use namespace imports only when needed

Use namespace imports only when you need multiple tables or enums:

```typescript
// Good - when you need multiple tables, enums, etc.
import * as schema from '@/lib/schema';

// Usage
const products = await db.select().from(schema.products);
if (order.status === schema.orderStatusEnum.Completed) {
  // ...
}
```

### 3. Prefer direct imports from specific schema files

For better tree-shaking and code organization:

```typescript
// Better - import directly from specific schema files
import { commissions } from '@/lib/schema/commissions';
import { users } from '@/lib/schema/users';
```

### 4. For type-only imports, use the `type` keyword

```typescript
// For types only
import type { CommissionStatus } from '@/lib/constants/commission-status';
// or
import type * as schema from '@/lib/schema';
```

### 5. Follow consistent patterns in services

- In service files: Use both namespace and specific imports as shown in `commission-service.ts`
- In API routes: Use specific imports for tables you query directly
- For enum usage: Import enums directly when possible

## Implementation Tips

1. Use ESLint to detect unused imports
2. Run the provided `fix-schema-imports.mjs` script to find and fix unused schema imports
3. Consider changing raw SQL queries to use Drizzle ORM when possible

## Deployment Checks

Before deployment:

1. Run `npm run build` locally to catch potential issues
2. Verify that schema imports are properly used in API routes

## Further Reading

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Next.js Tree Shaking](https://nextjs.org/docs/advanced-features/compiler#tree-shaking)
