import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from './users';

// User Subscriptions table
export const userSubscriptions = pgTable('user_subscriptions', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  planType: text('plan_type').notNull(), // 'free', 'basic', 'premium', 'enterprise'
  status: text('status').default('active'), // 'active', 'expired', 'cancelled'
  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date'),
  autoRenew: boolean('auto_renew').default(true),
  paymentMethod: text('payment_method'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const userSubscriptionsRelations = relations(
  userSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [userSubscriptions.userId],
      references: [users.id],
    }),
  })
);

// Type exports
export type UserSubscription = typeof userSubscriptions.$inferSelect
export type NewUserSubscription = typeof userSubscriptions.$inferInsert