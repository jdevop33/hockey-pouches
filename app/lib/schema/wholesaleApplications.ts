import { pgTable, serial, text, integer, timestamp, boolean, json } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const wholesaleApplications = pgTable('wholesale_applications', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull(),
  business_name: text('business_name').notNull(),
  business_address: text('business_address').notNull(),
  business_phone: text('business_phone').notNull(),
  business_email: text('business_email').notNull(),
  tax_id: text('tax_id'),
  website: text('website'),
  years_in_business: integer('years_in_business'),
  estimated_monthly_order: text('estimated_monthly_order'),
  additional_info: text('additional_info'),
  status: text('status').notNull().default('pending'), // pending, approved, rejected
  reviewed_by: text('reviewed_by'),
  reviewed_at: timestamp('reviewed_at'),
  rejection_reason: text('rejection_reason'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Schemas for validation
export const insertWholesaleApplicationSchema = createInsertSchema(wholesaleApplications);
export const selectWholesaleApplicationSchema = createSelectSchema(wholesaleApplications);

// Types
export type WholesaleApplication = z.infer<typeof selectWholesaleApplicationSchema>;
export type NewWholesaleApplication = z.infer<typeof insertWholesaleApplicationSchema>;
