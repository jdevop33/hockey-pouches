# Database Schema Setup Tasks (Using Drizzle Kit)

**Goal:** Define, generate, and apply the necessary database schema changes to ensure all required tables exist in the Neon database, aligning with application code requirements. This addresses critical missing tables identified on April 28th, 2025.

**Workflow:** Drizzle Kit (Schema-First Approach)

**Tasks:**

1.  **[ ] Define Target Schema for Core Tables:**
    *   [ ] `users` (Review existing, confirm roles/status enum)
    *   [ ] `products` (Review existing)
    *   [ ] `product_variations` (Define based on migrations/code)
    *   [ ] `categories` (Define based on migrations/code, clarify usage vs `products.category`)
    *   [ ] `inventory` (Define based on migration `cart_items_*.sql`, using string `location`)
    *   [ ] `inventory_logs` (Define based on migration `cart_items_*.sql`)
    *   [ ] `orders` (Define based on docs/code/migrations, confirm ID type, status enum, payment status enum, order type enum)
    *   [ ] `order_items` (Define based on docs/code usage)
    *   [ ] `order_status_history` (Define, resolve naming conflict with `order_history`)
    *   [ ] `order_fulfillments` (Define based on code usage & blob/tracking info)
    *   [ ] `commissions` (Define based on migration `003_*` & code usage)
    *   [ ] `payments` (Define based on migration `create_payments_table_*`)
    *   [ ] `discount_codes` (Define based on migration `0007_*`)
    *   [ ] `wholesale_applications` (Define based on migration `0005_*` & code usage, clarify `user_id` vs `customer_id`)
    *   [ ] `notifications` (Define based on code usage)
    *   [ ] `tasks` (Define based on migration `payment_integration_*`)
    *   [ ] `custom_pricing` (Define if feature needed)
    *   [ ] `payouts` (Define if feature needed)
    *   [ ] *Identify & Define any other implicitly required tables.*

2.  **[ ] Create/Update Drizzle Schema Files:**
    *   [ ] Organize schema definitions (e.g., in `app/lib/schema/*.ts`).
    *   [ ] Write TypeScript schema code using Drizzle ORM syntax for all tables defined in Step 1.
    *   [ ] Ensure relationships (Foreign Keys) are correctly defined where applicable.
    *   [ ] Define appropriate Enums (e.g., `user_role`, `order_status`).

3.  **[ ] Configure Drizzle Kit:**
    *   [ ] Create or update `drizzle.config.ts`.
    *   [ ] Point `schema` property to the correct schema file(s).
    *   [ ] Point `out` property to a desired migrations folder (e.g., `./db/migrations/drizzle`).
    *   [ ] Ensure `dbCredentials.connectionString` correctly references the Neon `DATABASE_URL` environment variable.

4.  **[ ] Generate SQL Migration:**
    *   [ ] Run `npx drizzle-kit generate:pg`.
    *   [ ] This will compare the Drizzle schema (`*.ts`) with the live Neon DB state and create a `.sql` migration file in the `out` folder.

5.  **[ ] Review Generated Migration:**
    *   [ ] Carefully examine the generated `.sql` file.
    *   [ ] Ensure it accurately reflects the intended changes (creating tables, adding columns, etc.).

6.  **[ ] Apply Migration to Neon DB:**
    *   [ ] Use the Neon SQL Editor, `scripts/run-migrations.js` (adapted), or `npx drizzle-kit push:pg` (with caution) to apply the generated `.sql` migration file.

7.  **[ ] Verify Schema:**
    *   [ ] Use Neon SQL Editor (`\dt`, `\d+ table_name`) or Drizzle Kit introspection (`npx drizzle-kit introspect:pg`) to confirm the tables and columns now exist as expected.

---
*This task list helps track progress towards establishing the necessary database schema.*
