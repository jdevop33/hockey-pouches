// app/lib/schema/wholesale.ts
import { pgTable, text, timestamp, varchar, integer, boolean, uuid, uniqueIndex, index, jsonb, pgEnum, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users'; // Import for relations

// Enum for application status (optional but good practice)
export const wholesaleApplicationStatusEnum = pgEnum('wholesale_application_status', ['Pending', 'Approved', 'Rejected']);

// --- Wholesale Applications Table ---
// Based primarily on code usage (applyForWholesale) and migration 0005_* where available
export const wholesaleApplications = pgTable('wholesale_applications', {
    id: uuid('id').primaryKey().defaultRandom(),
     // Using userId based on code usage
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // Applicant
    companyName: text('company_name').notNull(),
    taxId: text('tax_id').notNull(), // Consider encrypting this sensitive data
    businessType: text('business_type').notNull(),
    address: jsonb('address').notNull(), // Using JSONB for flexibility
    phone: text('phone').notNull(),
    website: text('website'),
    notes: text('notes'), // From applicant
    status: wholesaleApplicationStatusEnum('status').default('Pending').notNull(),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow(),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    reviewedBy: text('reviewed_by').references(() => users.id, { onDelete: 'set null' }), // Admin user ID
    reviewerNotes: text('reviewer_notes'), // Notes from admin reviewing
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(), // Tracks any update
}, (table) => ({
    userIdIdx: index('wholesale_applications_user_id_idx').on(table.userId),
    statusIdx: index('wholesale_applications_status_idx').on(table.status),
}));

export const wholesaleApplicationsRelations = relations(wholesaleApplications, ({ one }) => ({
    applicant: one(users, {
        fields: [wholesaleApplications.userId],
        references: [users.id],
        relationName: 'applicantApplication'
    }),
    reviewer: one(users, {
        fields: [wholesaleApplications.reviewedBy],
        references: [users.id],
        relationName: 'approverApplication'
    }),
}));

// --- Wholesale Requirements Table ---
// Based on migration add_wholesale_buyer_role_*
// May not be strictly needed if min quantity logic is in code, but defining as it exists
export const wholesaleRequirements = pgTable('wholesale_requirements', {
    id: serial('id').primaryKey(),
    minOrderQuantity: integer('min_order_quantity').notNull().default(100),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
