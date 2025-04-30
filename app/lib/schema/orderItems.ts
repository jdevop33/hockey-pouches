// app/lib/schema/orderItems.ts
import {
  pgTable,
  text,
  timestamp,
  integer,
  decimal,
  varchar,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Import related tables
import { orders } from './orders';
import { products } from './products';

// Order Items table
export const orderItems = pgTable(
  'order_items',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id),
    productId: text('product_id')
      .notNull()
      .references(() => products.id),
    variationId: text('variation_id').references(() => products.id),
    quantity: integer('quantity').notNull().default(1),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
    discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0.00'),
    taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0.00'),
    total: decimal('total', { precision: 10, scale: 2 }).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => {
    return {
      orderIdIdx: index('order_items_order_id_idx').on(table.orderId),
      productIdIdx: index('order_items_product_id_idx').on(table.productId),
      variationIdIdx: index('order_items_variation_id_idx').on(table.variationId),
    };
  }
);

// Define relations
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  // Relation to the order this item belongs to
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  // Relation to the product this item represents
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  // Relation to the product variation if applicable
  variation: one(products, {
    fields: [orderItems.variationId],
    references: [products.id],
    relationName: 'orderItemVariation',
  }),
}));
