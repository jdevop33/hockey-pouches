// app/lib/schema/users.ts
import { pgTable, text, timestamp, varchar, boolean, decimal, integer, primaryKey, pgEnum, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define Enums FIRST
export const userRoleEnum = pgEnum('user_role', ['Admin', 'Customer', 'Distributor', 'Wholesale Buyer', 'Retail Referrer']);
export const userStatusEnum = pgEnum('user_status', ['Active', 'Inactive', 'Suspended', 'Pending']);

// --- Users Table Definition ---
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('Customer'),
  status: varchar('status', { length: 50 }).default('Active').notNull(), // Consider using userStatusEnum
  referralCode: varchar('referral_code', { length: 10 }).unique(),
  // Define FKs WITHOUT the self-reference initially if causing issues, add in relations
  referredBy: text('referred_by'), 
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }),
  commissionBalance: decimal('commission_balance', { precision: 10, scale: 2 }).default('0.00').notNull(),
  isConsignmentAllowed: boolean('is_consignment_allowed').default(false).notNull(),
  outstandingDebt: decimal('outstanding_debt', { precision: 10, scale: 2 }).default('0.00').notNull(),
  wholesaleEligibility: boolean('wholesale_eligibility').default(false).notNull(),
  wholesaleApprovedAt: timestamp('wholesale_approved_at', { withTimezone: true }),
  wholesaleApprovedBy: text('wholesale_approved_by'),
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

// --- User Relations (Defined separately) ---
// Forward declare related schemas
import { orders } from './orders';
import { commissions } from './commissions';
import { wholesaleApplications } from './wholesale';
import { customPricing } from './pricing';
import { notifications } from './notifications';
import { tasks } from './tasks';

export const usersRelations = relations(users, ({ many, one }) => ({
  orders: many(orders), // Orders placed by this user
  commissions: many(commissions), // Commissions earned by this user
  wholesaleApplications: many(wholesaleApplications, { relationName: 'applicantApplication' }), // Applications submitted by this user
  approvedWholesaleApplications: many(wholesaleApplications, { relationName: 'approverApplication' }), // Applications approved by this admin
  customPricings: many(customPricing), // Custom prices set for this user
  notifications: many(notifications), // Notifications for this user
  assignedTasks: many(tasks, { relationName: 'assigneeRelation' }), // Tasks assigned to this user
  approvedFulfillments: many(schema.orderFulfillments, { relationName: 'reviewerRelation'}), // Fulfillments reviewed by this admin
  
  // Self-referencing relations
  referredUsers: many(users, { relationName: 'ReferralRelation' }), // Users referred BY this user
  referrer: one(users, { // The user who referred THIS user
      fields: [users.referredBy], // Column on THIS table
      references: [users.id], // Column on the OTHER table (itself)
      relationName: 'ReferralRelation',
  }),
  wholesaleApprover: one(users, { // The admin who approved this user's wholesale status
      fields: [users.wholesaleApprovedBy], // Column on THIS table
      references: [users.id], // Column on the OTHER table (itself)
      // relationName: 'WholesaleApproverRelation' // Optional distinct name
  }),
}));
