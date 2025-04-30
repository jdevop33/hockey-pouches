import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';

// Token blacklist table for tracking revoked tokens
export const tokenBlacklist = pgTable('token_blacklist', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  token: text('token').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  // Optional user ID reference if needed for auditing
  userId: text('user_id'),
  // Optional reason for blacklisting
  reason: text('reason'),
});
