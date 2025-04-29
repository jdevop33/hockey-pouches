// app/lib/schema/orders.ts
import { pgTable, text, timestamp, decimal, integer, primaryKey, pgEnum, varchar, jsonb, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users'; // Import users
import { productVariations } from './products'; // Import product variations
// Import discounts if needed for relation (adjust path if needed)
// import { discountCodes } from './discounts';

// Define Enums based on OrderService code
export const orderStatusEnum = pgEnum('order_status', [
    'Created', 'PendingPayment', 'PaymentReceived', 'Processing',
    'ReadyForFulfillment', 'Fulfilled', 'Shipped', 'Delivered',
    'Completed', 'Cancelled', 'Refunded'
]);

export const paymentMethodEnum = pgEnum('payment_method', [
    'CreditCard', 'ETransfer', 'Bitcoin', 'Manual'
]);

export const paymentStatusEnum = pgEnum('payment_status', [
    'Pending', 'Completed', 'Failed', 'Refunded'
]);

export const orderTypeEnum = pgEnum('order_type', ['Retail', 'Wholesale']);

// --- Orders Table ---
export const orders = pgTable('orders', {
    // Use UUID based on OrderService logic
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull().references(() => users.id), // Assuming users.id is text/uuid
    status: orderStatusEnum('status').notNull().default('PendingPayment'),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    distributorId: text('distributor_id').references(() => users.id, { onDelete: 'set null' }),
    commissionAmount: decimal('commission_amount', { precision: 10, scale: 2 }),
    paymentMethod: paymentMethodEnum('payment_method').notNull(),
    paymentStatus: paymentStatusEnum('payment_status').notNull().default('Pending'),
    type: orderTypeEnum('type').notNull(),
    // Store shipping address as JSONB based on OrderService
    shippingAddress: jsonb('shipping_address').notNull(),
    notes: text('notes'),
    // Standard discount code applied
    discountCode: varchar('discount_code', { length: 50 }),
    discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0.00'),
    // NEW: Store the referral code used for this order's discount
    appliedReferralCode: varchar('applied_referral_code', { length: 10 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    userIdIdx: index('orders_user_id_idx').on(table.userId),
    statusIdx: index('orders_status_idx').on(table.status),
    distributorIdIdx: index('orders_distributor_id_idx').on(table.distributorId),
    createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
    appliedReferralCodeIdx: index('orders_applied_referral_code_idx').on(table.appliedReferralCode),
}));

// --- Order Items Table ---
export const orderItems = pgTable('order_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
    productVariationId: integer('product_variation_id').notNull().references(() => productVariations.id),
    priceAtPurchase: decimal('price_at_purchase', { precision: 10, scale: 2 }).notNull(),
    quantity: integer('quantity').notNull(),
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    orderIdIdx: index('order_items_order_id_idx').on(table.orderId),
    productVariationIdIdx: index('order_items_product_variation_id_idx').on(table.productVariationId),
}));


// --- Order Status History Table ---
export const orderStatusHistory = pgTable('order_status_history', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
    status: orderStatusEnum('status').notNull(),
    notes: text('notes'),
    // changedByUserId: text('changed_by_user_id').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    orderIdIdx: index('order_status_history_order_id_idx').on(table.orderId),
    createdAtIdx: index('order_status_history_created_at_idx').on(table.createdAt),
}));


// --- Order Fulfillments Table ---
export const orderFulfillments = pgTable('order_fulfillments', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
    trackingNumber: varchar('tracking_number', { length: 255 }),
    carrier: varchar('carrier', { length: 100 }),
    fulfillmentNotes: text('notes'),
    fulfillmentProofUrl: jsonb('fulfillment_proof_url'),
    status: varchar('status', { length: 50 }).default('Pending Approval'),
    reviewedBy: text('reviewed_by').references(() => users.id),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    reviewNotes: text('review_notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    orderIdIdx: index('order_fulfillments_order_id_idx').on(table.orderId),
    statusIdx: index('order_fulfillments_status_idx').on(table.status),
}));


// --- Relations ---
export const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users, { fields: [orders.userId], references: [users.id] }),
    distributor: one(users, { fields: [orders.distributorId], references: [users.id] }),
    items: many(orderItems),
    statusHistory: many(orderStatusHistory),
    fulfillments: many(orderFulfillments),
    // referralCodeUser: one(users, { fields: [orders.appliedReferralCode], references: [users.referralCode] }) // Relation via referral code
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
    productVariation: one(productVariations, { fields: [orderItems.productVariationId], references: [productVariations.id] }),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
    order: one(orders, { fields: [orderStatusHistory.orderId], references: [orders.id] }),
}));

export const orderFulfillmentsRelations = relations(orderFulfillments, ({ one }) => ({
    order: one(orders, { fields: [orderFulfillments.orderId], references: [orders.id] }),
    reviewer: one(users, { fields: [orderFulfillments.reviewedBy], references: [users.id] }),
}));
