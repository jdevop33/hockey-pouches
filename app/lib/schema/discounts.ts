// app/lib/schema/discounts.ts
import {
  pgTable,
  text,
  timestamp,
  decimal,
  integer,
  varchar,
  serial,
  boolean,
  index,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { orders } from './orders'; // Import for relations

// Enum for discount type
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed_amount']);

// --- Discount Codes Table ---
// Based on migration 0007_*
export const discountCodes = pgTable(
  'discount_codes',
  {
    id: serial('id').primaryKey(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    description: text('description'),
    discountType: discountTypeEnum('discount_type').notNull(),
    discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
    minOrderAmount: decimal('min_order_amount', { precision: 10, scale: 2 }).default('0.00'),
    maxDiscountAmount: decimal('max_discount_amount', { precision: 10, scale: 2 }),
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }),
    usageLimit: integer('usage_limit'), // Nullable means unlimited
    timesUsed: integer('times_used').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    // Removed userId - Referral discounts handled by logic checking orders.appliedReferralCode
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    codeIdx: uniqueIndex('discount_codes_code_idx').on(table.code),
    isActiveStartDateIdx: index('discount_codes_active_start_date_idx').on(
      table.isActive,
      table.startDate
    ),
  })
);

// Relation back to orders (One code can be used on many orders)
// This relation assumes orders.discountCode stores the code string and links back here.
// Note: This isn't a true foreign key, linking is based on the code value.
export const discountCodesRelations = relations(discountCodes, ({ many }) => ({
  orders: many(orders, { relationName: 'OrderDiscountCode' }),
}));
