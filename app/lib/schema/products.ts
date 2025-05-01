// app/lib/schema/products.ts
import { pgTable, text, timestamp, integer, decimal, boolean, varchar, serial, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { stockLevels, stockMovements } from './inventory'; // Import for relation
import { orderItems } from './orders'; // Forward declaration
import { cartItems } from './cart'; // Forward declaration

// --- Products ---
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  // Sticking with simple text category based on existing data structure
  category: text('category'),
  flavor: varchar('flavor', { length: 100 }),
  strength: integer('strength'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
  imageUrl: varchar('image_url', { length: 255 }),
  isActive: boolean('is_active').default(true).notNull(),
  // Assuming server default provides TZ, or adjust if needed
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  isActiveIdx: index('products_is_active_idx').on(table.isActive),
  priceIdx: index('products_price_idx').on(table.price),
}));

export const productsRelations = relations(products, ({ many }) => ({
  variations: many(productVariations),
  // Removed direct relation to inventory, now related via variations -> stockLevels
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  // Relations to stock tables are usually indirect via variations
}));


// --- Product Variations ---
export const productVariations = pgTable('product_variations', {
  id: serial('id').primaryKey(),
  productId: integer('product_id'.notNull().references(() => products.id), { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(), // e.g., "Cool mint (6mg)"
  flavor: varchar('flavor', { length: 100 }), // e.g., "Cool mint"
  strength: integer('strength'), // e.g., 6
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
  sku: varchar('sku', { length: 100 }),
  imageUrl: varchar('image_url', { length: 255 }),
  // NOTE: inventoryQuantity column exists but likely deprecated. Logic should use stock_levels.
  inventoryQuantity: integer('inventory_quantity').default(0),
  isActive: boolean('is_active').default(true).notNull(),
  // Timestamps confirmed WITHOUT timezone from \d+ output
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  productIdIdx: index('idx_product_variations_product_id').on(table.productId),
  isActiveIdx: index('idx_product_variations_is_active').on(table.isActive),
  uniqueFlavorStrength: uniqueIndex('product_variations_product_id_flavor_strength_key').on(table.productId, table.flavor, table.strength),
}));

export const productVariationsRelations = relations(productVariations, ({ one, many }) => ({
  product: one(products, { fields: [productVariations.productId], references: [products.id] }),
  stockLevels: many(stockLevels),
  stockMovements: many(stockMovements), // Added relation
}));
