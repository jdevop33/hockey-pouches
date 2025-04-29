// app/lib/schema/payments.ts
import { pgTable, text, timestamp, decimal, integer, varchar, serial, uuid, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { orders, paymentMethodEnum, paymentStatusEnum } from './orders'; // Import orders and enums

// --- Payments Table ---
// Based on migration create_payments_table_* and payment_integration_*
export const payments = pgTable('payments', {
    id: serial('id').primaryKey(), // Based on migration
    orderId: uuid('order_id').notNull().references(() => orders.id), // Assuming orders.id is uuid
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    paymentMethod: paymentMethodEnum('payment_method').notNull(), // Use enum from orders
    status: paymentStatusEnum('status').notNull().default('Pending'), // Use enum from orders
    transactionId: varchar('transaction_id', { length: 255 }), // e.g., Stripe charge ID
    referenceNumber: varchar('reference_number', { length: 255 }), // e.g., E-transfer confirmation
    // Store raw details/metadata from payment provider
    paymentDetails: jsonb('payment_details'),
    notes: text('notes'), // Internal notes
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    orderIdIdx: index('idx_payments_order_id').on(table.orderId),
    statusIdx: index('idx_payments_status').on(table.status),
    transactionIdIdx: index('idx_payments_transaction_id').on(table.transactionId), // Index common lookup
    referenceNumberIdx: index('idx_payments_reference_number').on(table.referenceNumber),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
    order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));
