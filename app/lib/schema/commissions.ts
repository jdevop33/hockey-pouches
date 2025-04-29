// app/lib/schema/commissions.ts
import { pgTable, text, timestamp, decimal, integer, varchar, serial, uuid, index, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users'; // Import for relations
import { orders } from './orders'; // Import for relations

// Define Enums
export const commissionStatusEnum = pgEnum('commission_status', ['Pending', 'Payable', 'Paid', 'Cancelled']);
export const commissionTypeEnum = pgEnum('commission_type', ['OrderReferral', 'Fulfillment']); // Added Enum
export const commissionRelatedEntityEnum = pgEnum('commission_related_entity', ['Order']); // Added Enum

// --- Commissions Table ---
// Based on migration 003_*
export const commissions = pgTable('commissions', {
    // Use Serial based on migration
    id: serial('id').primaryKey(),
    // User earning the commission (Distributor)
    userId: text('user_id').notNull().references(() => users.id), // Assuming users.id is text/uuid
    // Order that generated the commission
    orderId: uuid('order_id').notNull().references(() => orders.id), // Assuming orders.id is uuid
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    rate: decimal('rate', { precision: 5, scale: 2 }).notNull(), // Commission rate at time of calculation
    // Use enum for status
    status: commissionStatusEnum('status').notNull().default('Pending'),
    type: commissionTypeEnum('type').notNull().default('OrderReferral'), // Added type field using enum
    relatedTo: commissionRelatedEntityEnum('related_to'), // Added relatedTo field using enum
    relatedId: text('related_id'), // Added relatedId field
    // Payout details (nullable until paid)
    paymentDate: timestamp('payment_date', { withTimezone: true }),
    paymentReference: varchar('payment_reference', { length: 255 }), // e.g., transaction ID of payout
    // Optional: Link to a payout batch
    // payoutBatchId: uuid('payout_batch_id').references(() => payoutBatches.id), // Requires payoutBatches table
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    userIdIdx: index('commissions_user_id_idx').on(table.userId),
    orderIdIdx: index('commissions_order_id_idx').on(table.orderId),
    statusIdx: index('commissions_status_idx').on(table.status),
    typeIdx: index('commissions_type_idx').on(table.type), // Added index
    relatedEntityIdx: index('commissions_related_entity_idx').on(table.relatedTo, table.relatedId), // Added index
}));

export const commissionsRelations = relations(commissions, ({ one }) => ({
    user: one(users, { fields: [commissions.userId], references: [users.id] }),
    order: one(orders, { fields: [commissions.orderId], references: [orders.id] }),
    // payoutBatch: one(payoutBatches, { fields: [commissions.payoutBatchId], references: [payoutBatches.id] }), // If using batches
}));


// --- (Optional) Payout Batches ---
/*
import { payoutBatches } from './payouts'; // Assuming payout schema file

export const payoutBatches = pgTable('payout_batches', {
    id: uuid('id').primaryKey().defaultRandom(),
    status: varchar('status', { length: 50 }).default('Pending'), // Pending, Processing, Completed, Failed
    totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
    payoutMethod: varchar('payout_method', { length: 50 }), // e.g., 'PayPal', 'Bank Transfer'
    reference: text('reference'), // e.g., Batch ID from payment processor
    processedAt: timestamp('processed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    createdBy: text('created_by').references(() => users.id), // Admin who initiated
});

export const payoutBatchesRelations = relations(payoutBatches, ({ many, one }) => ({
    commissions: many(commissions),
    processedByUser: one(users, { fields: [payoutBatches.createdBy], references: [users.id] }),
}));
*/
