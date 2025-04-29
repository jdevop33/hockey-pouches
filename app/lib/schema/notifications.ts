// app/lib/schema/notifications.ts
import { pgTable, text, timestamp, varchar, boolean, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users'; // Import for relations

// --- Notifications Table ---
// Basic structure, adapt as needed based on notification requirements
export const notifications = pgTable('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    // User receiving the notification
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 100 }).notNull(), // e.g., 'order_shipped', 'fulfillment_approved', 'fulfillment_rejected', 'low_stock'
    title: text('title').notNull(),
    message: text('message').notNull(),
    // Optional: Link to related entity (e.g., order_id, fulfillment_id)
    relatedEntityId: text('related_entity_id'), // Could be UUID or Serial depending on related table
    relatedEntityType: varchar('related_entity_type', { length: 50 }), // e.g., 'order', 'fulfillment'
    isRead: boolean('is_read').default(false).notNull(),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    userIdReadIdx: index('notifications_user_id_read_idx').on(table.userId, table.isRead), // For fetching unread notifications
    relatedEntityIdx: index('notifications_related_entity_idx').on(table.relatedEntityType, table.relatedEntityId), // For finding notifications about specific items
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, { fields: [notifications.userId], references: [users.id] }),
    // Add relations to related entities if needed, e.g.:
    // order: one(orders, { fields: [notifications.relatedEntityId], references: [orders.id] }), // Requires conditional join based on type
    // fulfillment: one(orderFulfillments, { fields: [notifications.relatedEntityId], references: [orderFulfillments.id] }), // Requires conditional join
}));
