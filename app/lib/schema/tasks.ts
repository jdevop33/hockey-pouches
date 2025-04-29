// app/lib/schema/tasks.ts
import { pgTable, text, timestamp, varchar, integer, serial, index, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users'; // Import for relations

// Optional Enums
export const taskStatusEnum = pgEnum('task_status', ['Pending', 'InProgress', 'Completed', 'Cancelled']);
export const taskPriorityEnum = pgEnum('task_priority', ['Low', 'Medium', 'High', 'Urgent']);
export const taskCategoryEnum = pgEnum('task_category', ['OrderReview', 'Fulfillment', 'Payout', 'UserManagement', 'Other']);
export const taskRelatedEntityEnum = pgEnum('task_related_entity', ['Order', 'User', 'Payment', 'Fulfillment', 'PayoutBatch', 'Commission']); // Added Commission

// --- Tasks Table ---
// Based on migration payment_integration_*
export const tasks = pgTable('tasks', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    status: taskStatusEnum('status').default('Pending').notNull(), // Use Enum
    priority: taskPriorityEnum('priority').default('Medium').notNull(), // Use Enum
    category: taskCategoryEnum('category').notNull(), // Use Enum
    relatedTo: taskRelatedEntityEnum('related_to'), // Use Enum
    // Use text for related_id assuming UUIDs for orders etc., or potentially Serial for commissions
    relatedId: text('related_id'),
    // User assigned the task
    assignedTo: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    statusIdx: index('idx_tasks_status').on(table.status),
    categoryIdx: index('idx_tasks_category').on(table.category),
    relatedEntityIdx: index('idx_tasks_related_to_id').on(table.relatedTo, table.relatedId),
    assignedToIdx: index('idx_tasks_assigned_to').on(table.assignedTo),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
    assignee: one(users, { fields: [tasks.assignedTo], references: [users.id] }),
    // Add conditional relations based on relatedTo/relatedId if needed in queries
    // Example: order: one(orders, { fields: [tasks.relatedId], references: [orders.id] })
}));
