import { pgTable, text, timestamp, varchar, boolean, primaryKey, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Import referenced tables
import { users } from './users';
import { orders } from './orders';

// Referral status enum (inline definition)
export const referralStatusEnum = ['Pending', 'Registered', 'Converted', 'Expired'];

// Referrals table for tracking user referrals
export const referrals = pgTable(
  'referrals',
  {
    id: text('id').primaryKey(),
    // The user who created the referral
    referrerId: text('referrer_id')
      .notNull()
      .references(() => users.id),
    // Email of the person being referred
    email: varchar('email', { length: 255 }).notNull(),
    // Optional name of the person being referred
    name: text('name'),
    // The referred user if/when they register
    referredUserId: text('referred_user_id').references(() => users.id),
    // Referral code used
    referralCode: varchar('referral_code', { length: 10 }).notNull(),
    // Tracking URL if applicable
    referralUrl: text('referral_url'),
    // Status of the referral
    status: varchar('status', { length: 20 }).notNull().default('Pending'),
    // Tracks if an invitation email was sent
    invitationSent: boolean('invitation_sent').default(false).notNull(),
    // Date the invitation was sent
    invitationSentAt: timestamp('invitation_sent_at', { withTimezone: true }),
    // Date the referral was registered
    registeredAt: timestamp('registered_at', { withTimezone: true }),
    // Date the referral made their first purchase
    convertedAt: timestamp('converted_at', { withTimezone: true }),
    // General timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
  },
  table => {
    return {
      referrerIdIdx: index('referrals_referrer_id_idx').on(table.referrerId),
      emailIdx: index('referrals_email_idx').on(table.email),
      referredUserIdIdx: index('referrals_referred_user_id_idx').on(table.referredUserId),
      statusIdx: index('referrals_status_idx').on(table.status),
      createdAtIdx: index('referrals_created_at_idx').on(table.createdAt),
    };
  }
);

// Define relations
export const referralsRelations = relations(referrals, ({ one, many }) => ({
  // Relation to the user who created the referral
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
  }),
  // Relation to the user who was referred (if registered)
  referredUser: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
  }),
  // Relation to orders created by the referred user
  relatedOrders: many(orders, {
    relationName: 'referralOrders',
  }),
}));
