// app/lib/schema/inventory.ts
import { pgTable, text, timestamp, integer, boolean, varchar, serial, uuid, index, uniqueIndex, pgEnum } from 'drizzle-orm/pg-core'; // Added pgEnum
import { relations } from 'drizzle-orm';
import { products, productVariations } from './products'; // Import for relations

// Define Enums
export const stockLocationTypeEnum = pgEnum('stock_location_type', ['Warehouse', 'DistributionCenter', 'RetailStore']); // Added Enum
export const stockMovementTypeEnum = pgEnum('stock_movement_type', ['Sale', 'Return', 'Restock', 'Adjustment', 'TransferOut', 'TransferIn', 'Initial']); // Added Enum

// --- Stock Locations ---
export const stockLocations = pgTable('stock_locations', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    address: text('address'),
    type: stockLocationTypeEnum('type').notNull(), // Use Enum
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
    productId: integer('product_id'.notNull().references(() => products.id), { onDelete: 'cascade' }),
    productVariationId: integer('product_variation_id'.references(() => productVariations.id), { onDelete: 'cascade' }),
    locationId: uuid('location_id'.notNull().references(() => stockLocations.id), { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(0),
    reservedQuantity: integer('reserved_quantity').notNull().default(0),
    reorderPoint: integer('reorder_point'),
    reorderQuantity: integer('reorder_quantity'),
    lastRecountDate: timestamp('last_recount_date', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    uniqueVariationLocation: uniqueIndex('stock_levels_product_variation_id_location_id_key').on(table.productVariationId, table.locationId),
}));

export const stockLevelsRelations = relations(stockLevels, ({ one }) => ({
    product: one(products, { fields: [stockLevels.productId], references: [products.id] }),
    productVariation: one(productVariations, { fields: [stockLevels.productVariationId], references: [productVariations.id] }),
    location: one(stockLocations, { fields: [stockLevels.locationId], references: [stockLocations.id] }),
}));


// --- Stock Movements (Ledger) ---
export const stockMovements = pgTable('stock_movements', {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: integer('product_id'.notNull().references(() => products.id), { onDelete: 'cascade' }),
    productVariationId: integer('product_variation_id'.references(() => productVariations.id), { onDelete: 'cascade' }),
    locationId: uuid('location_id'.notNull().references(() => stockLocations.id), { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(), // Represents the CHANGE in quantity (+ve or -ve)
    type: stockMovementTypeEnum('type').notNull(), // Use Enum
    referenceId: varchar('reference_id', { length: 255 }), 
    referenceType: varchar('reference_type', { length: 50 }),
    notes: text('notes'),
    createdBy: varchar('created_by', { length: 255 }).notNull(), // Assuming this is User ID (text/uuid)
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
    product: one(products, { fields: [stockMovements.productId], references: [products.id] }),
    productVariation: one(productVariations, { fields: [stockMovements.productVariationId], references: [productVariations.id] }),
    location: one(stockLocations, { fields: [stockMovements.locationId], references: [stockLocations.id] }),
    // createdByUser: one(users, { fields: [stockMovements.createdBy], references: [users.id] }) // Example
}));
