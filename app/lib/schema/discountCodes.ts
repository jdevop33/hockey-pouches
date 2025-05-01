import { pgTable, serial, text, integer, timestamp, boolean, date } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const discountCodes = pgTable('discount_codes', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  description: text('description'),
  discount_type: text('discount_type').notNull(), // percentage, fixed_amount
  discount_value: text('discount_value').notNull(),
  min_purchase_amount: text('min_purchase_amount'),
  max_discount_amount: text('max_discount_amount'),
  start_date: date('start_date'),
  end_date: date('end_date'),
  usage_limit: integer('usage_limit'),
  usage_count: integer('usage_count').default(0),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  created_by: text('created_by'),
});

// Schemas for validation
export const insertDiscountCodeSchema = createInsertSchema(discountCodes);
export const selectDiscountCodeSchema = createSelectSchema(discountCodes);

// Types
export type DiscountCode = z.infer<typeof selectDiscountCodeSchema>;
export type NewDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
