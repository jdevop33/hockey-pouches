// app/lib/schema/inventory.ts
import { pgTable, text, timestamp, integer, boolean, varchar, serial, uuid, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { products, productVariations } from './products'; // Import for relations

// --- Stock Locations ---
export const stockLocations = pgTable('stock_locations', {
    // Using uuid based on \d+ output
    id: uuid('id').primaryKey().defaultRandom(), // Use defaultRandom for uuid_generate_v4()
    name: varchar('name', { length: 255 }).notNull(),
    address: text('address'),
    type: varchar('type', { length: 50 }).notNull(), // e.g., 'Warehouse', 'Storefront'
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const stockLocationsRelations = relations(stockLocations, ({ many }) => ({
    stockLevels: many(stockLevels),
    stockMovements: many(stockMovements),
}));


// --- Stock Levels ---
export const stockLevels = pgTable('stock_levels', {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    // productVariationId can be nullable based on \d+ output (integer, no not null)
    productVariationId: integer('product_variation_id').references(() => productVariations.id, { onDelete: 'cascade' }),
    locationId: uuid('location_id').notNull().references(() => stockLocations.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(0),
    reservedQuantity: integer('reserved_quantity').notNull().default(0),
    reorderPoint: integer('reorder_point'),
    reorderQuantity: integer('reorder_quantity'),
    lastRecountDate: timestamp('last_recount_date', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    // product_id constraint removed from unique index as variation is the key level
    uniqueVariationLocation: uniqueIndex('stock_levels_product_id_product_variation_id_location_id_key').on(table.productVariationId, table.locationId), // Adapted: Removed product_id based on likely intent
}));

export const stockLevelsRelations = relations(stockLevels, ({ one }) => ({
    product: one(products, { fields: [stockLevels.productId], references: [products.id] }),
    productVariation: one(productVariations, { fields: [stockLevels.productVariationId], references: [productVariations.id] }),
    location: one(stockLocations, { fields: [stockLevels.locationId], references: [stockLocations.id] }),
}));


// --- Stock Movements (Ledger) ---
export const stockMovements = pgTable('stock_movements', {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
     // productVariationId can be nullable based on \d+ output
    productVariationId: integer('product_variation_id').references(() => productVariations.id, { onDelete: 'cascade' }),
    locationId: uuid('location_id').notNull().references(() => stockLocations.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(), // Represents the CHANGE in quantity (+ve or -ve)
    type: varchar('type', { length: 50 }).notNull(), // e.g., 'sale', 'restock', 'adjustment', 'transfer-out', 'transfer-in'
    referenceId: varchar('reference_id', { length: 255 }), // e.g., order ID, adjustment ID
    referenceType: varchar('reference_type', { length: 50 }), // e.g., 'order', 'adjustment'
    notes: text('notes'),
    // createdBy likely references users.id, assuming text/uuid
    createdBy: varchar('created_by', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
    product: one(products, { fields: [stockMovements.productId], references: [products.id] }),
    productVariation: one(productVariations, { fields: [stockMovements.productVariationId], references: [productVariations.id] }),
    location: one(stockLocations, { fields: [stockMovements.locationId], references: [stockLocations.id] }),
    // Relation to User for createdBy can be added if users schema is imported
    // createdByUser: one(users, { fields: [stockMovements.createdBy], references: [users.id] }) // Example
}));
