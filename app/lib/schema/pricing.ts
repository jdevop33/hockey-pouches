// app/lib/schema/pricing.ts
import { pgTable, text, timestamp, decimal, integer, primaryKey, uuid, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users'; // Import for relations
import { productVariations } from './products'; // Import for relations
// --- Custom Pricing Table ---
// Allows admins to set specific prices for users on specific product variations
export const customPricing = pgTable('custom_pricing', {
    // Using UUID for PK consistency
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    // Pricing is per variation
    productVariationId: integer('product_variation_id').notNull().references(() => productVariations.id, { onDelete: 'cascade' }),
    // Store the specific custom price
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    // Optional: Add start/end dates if pricing is temporary
    // startDate: timestamp('start_date', { withTimezone: true }),
    // endDate: timestamp('end_date', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    // Optional: Track which admin set the price
    // createdBy: text('created_by').references(() => users.id), // Example FK to users
}, (table) => ({
    // Ensure a user can only have one custom price per variation
    userVariationUnique: uniqueIndex('custom_pricing_user_variation_idx').on(table.userId, table.productVariationId),
}));
export const customPricingRelations = relations(customPricing, ({ one }) => ({
    user: one(users, { fields: [customPricing.userId], references: [users.id] }),
    productVariation: one(productVariations, { fields: [customPricing.productVariationId], references: [productVariations.id] }),
}));
// --- Volume Discount Tiers (Not creating table, logic in code) ---
// Keep this commented out unless requirements change
/*
export const volumeDiscountTiers = pgTable('volume_discount_tiers', {
    id: serial('id').primaryKey(),
    minQuantity: integer('min_quantity').notNull(),
    maxQuantity: integer('max_quantity'), // Nullable for the highest tier
    // Define only ONE of the following discount types
    // discountPercentage: decimal('discount_percentage', { precision: 5, scale: 2 }),
    // OR
    fixedPricePerUnit: decimal('fixed_price_per_unit', { precision: 10, scale: 2 }),
    appliesToRole: userRoleEnum('applies_to_role').default('Wholesale Buyer'),
    isActive: boolean('is_active').default(true),
});
*/
