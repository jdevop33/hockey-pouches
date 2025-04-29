// app/lib/schema/cart.ts
import { pgTable, text, timestamp, integer, uuid, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users'; // Import for relations
import { productVariations } from './products'; // Import for relations

// --- Cart Items Table ---
// Based on CartService logic and assumptions
export const cartItems = pgTable('cart_items', {
    // Using UUID based on code usage
    id: uuid('id').primaryKey().defaultRandom(),
    // Assuming user ID is text/uuid
    userId: text('user_id').notNull(), // Not adding FK to users here to potentially support anonymous carts identified by a session ID (text)
    // Linking to product variation is more specific
    productVariationId: integer('product_variation_id').notNull().references(() => productVariations.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    // Ensure user has only one cart item per variation
    userVariationUnique: uniqueIndex('cart_items_user_variation_idx').on(table.userId, table.productVariationId),
    userIdIdx: index('cart_items_user_id_idx').on(table.userId),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
    // We might not define a direct relation to users if userId can be an anonymous session ID
    // user: one(users, { fields: [cartItems.userId], references: [users.id] }),
    productVariation: one(productVariations, { fields: [cartItems.productVariationId], references: [productVariations.id] }),
}));
