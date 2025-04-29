// app/lib/schema/users.ts
import { pgTable, text, timestamp, varchar, boolean, decimal, integer, primaryKey, pgEnum, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define the user role enum based on the migration and standardizing names
export const userRoleEnum = pgEnum('user_role', ['Admin', 'Customer', 'Distributor', 'Wholesale Buyer', 'Retail Referrer']);

// Define the user status enum (Recommended)
export const userStatusEnum = pgEnum('user_status', ['Active', 'Inactive', 'Suspended', 'Pending']);

// --- Users Table ---
export const users = pgTable('users', {
  // Assuming UUID stored as text, matching JSON data
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('Customer'),
  // Recommend changing DB column to use userStatusEnum eventually
  status: varchar('status', { length: 50 }).default('Active').notNull(),
  referralCode: varchar('referral_code', { length: 10 }).unique(),
  // Assuming referredBy links to the ID of the referring user
  referredBy: text('referred_by').references(() => users.id, { onDelete: 'set null' }),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }),
  commissionBalance: decimal('commission_balance', { precision: 10, scale: 2 }).default('0.00').notNull(),
  isConsignmentAllowed: boolean('is_consignment_allowed').default(false).notNull(),
  outstandingDebt: decimal('outstanding_debt', { precision: 10, scale: 2 }).default('0.00').notNull(),
  wholesaleEligibility: boolean('wholesale_eligibility').default(false).notNull(),
  wholesaleApprovedAt: timestamp('wholesale_approved_at', { withTimezone: true }),
  wholesaleApprovedBy: text('wholesale_approved_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
    roleIdx: index('users_role_idx').on(table.role),
    statusIdx: index('users_status_idx').on(table.status),
    referralCodeIdx: index('users_referral_code_idx').on(table.referralCode),
    referredByIdx: index('users_referred_by_idx').on(table.referredBy),
    wholesaleApprovedByIdx: index('users_wholesale_approved_by_idx').on(table.wholesaleApprovedBy),
  };
});

// --- User Relations --- (Add more as other schemas are defined)
// Forward declare relations
import { orders } from './orders';
import { commissions } from './commissions';
import { wholesaleApplications } from './wholesale';
import { customPricing } from './pricing';

export const usersRelations = relations(users, ({ many, one }) => ({
  orders: many(orders), // User placing orders
  commissions: many(commissions), // Commissions earned by user
  wholesaleApplications: many(wholesaleApplications, { relationName: 'applicantApplication' }), // Applications submitted by user
  approvedWholesaleApplications: many(wholesaleApplications, { relationName: 'approverApplication' }), // Applications approved by this admin user
  customPricings: many(customPricing), // Custom prices set for this user
  // referredUsers: many(users, { relationName: 'referrerRelation' }), // Requires fixing FK if needed
  referrer: one(users, { // The user who referred this user
      fields: [users.referredBy],
      references: [users.id], // Assumed link to users.id
      relationName: 'referrerRelation',
  }),
}));
