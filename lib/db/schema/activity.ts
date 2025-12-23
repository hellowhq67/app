import { relations, sql } from 'drizzle-orm';
import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
} from 'drizzle-orm/pg-core';
import { users } from './users';

// Activity Logs table
export const activityLogs = pgTable(
  'activity_logs',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    action: text('action').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    // NEW: Composite index for user activity history
    idxUserCreated: index('idx_activity_logs_user_created').on(
      table.userId,
      table.createdAt.desc()
    ),
    // NEW: For action-based analytics
    idxAction: index('idx_activity_logs_action').on(table.action),
  })
);

// Relations
export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Type exports
export type ActivityLog = typeof activityLogs.$inferSelect
export type NewActivityLog = typeof activityLogs.$inferInsert