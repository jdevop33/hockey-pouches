import { pgTable, serial, text, integer, timestamp, boolean, json } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  order_id: text('order_id').notNull(),
  product_id: integer('product_id').notNull(),
  product_variation_id: integer('product_variation_id'),
  quantity: integer('quantity').notNull(),
  price: text('price').notNull(),
  name: text('name').notNull(),
  sku: text('sku'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  shipping_address: json('shipping_address').$type<Record<string, string>>(),
  is_fulfilled: boolean('is_fulfilled').default(false),
});

// Schemas for validation
export const insertOrderItemSchema = createInsertSchema(orderItems);
export const selectOrderItemSchema = createSelectSchema(orderItems);

// Types
export type OrderItem = z.infer<typeof selectOrderItemSchema>;
export type NewOrderItem = z.infer<typeof insertOrderItemSchema>;
