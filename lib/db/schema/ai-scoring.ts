import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { speakingAttempts } from './speaking';
import { writingAttempts } from './writing';
import { readingAttempts } from './reading';
import { listeningAttempts } from './listening';
import { conversationSessions } from './conversation';

// Enums for AI usage
export const aiUsageTypeEnum = pgEnum('ai_usage_type', [
  'transcription',
  'scoring',
  'feedback',
  'realtime_voice',
  'text_generation',
  'other',
]);

// AI Credit Usage Tracking
export const aiCreditUsage = pgTable(
  'ai_credit_usage',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    usageType: aiUsageTypeEnum('usage_type').notNull(),
    provider: text('provider').notNull(), // 'openai' | 'gemini' | 'vercel' | etc.
    model: text('model'), // e.g., 'gpt-4o', 'gemini-1.5-pro', etc.
    inputTokens: integer('input_tokens').default(0),
    outputTokens: integer('output_tokens').default(0),
    totalTokens: integer('total_tokens').default(0),
    audioSeconds: decimal('audio_seconds', { precision: 10, scale: 2 }), // For Realtime/Whisper
    cost: decimal('cost', { precision: 10, scale: 6 }), // Estimated cost in USD
    sessionId: uuid('session_id'), // Optional: link to conversation session
    attemptId: uuid('attempt_id'), // Optional: link to attempt (speaking/writing/etc.)
    attemptType: text('attempt_type'), // 'speaking' | 'writing' | 'reading' | 'listening'
    metadata: jsonb('metadata'), // Additional tracking data
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_ai_usage_user_id').on(table.userId),
    typeIdx: index('idx_ai_usage_type').on(table.usageType),
    providerIdx: index('idx_ai_usage_provider').on(table.provider),
    createdAtIdx: index('idx_ai_usage_created_at').on(table.createdAt),
    sessionIdIdx: index('idx_ai_usage_session_id').on(table.sessionId),
    attemptIdIdx: index('idx_ai_usage_attempt_id').on(table.attemptId),
    // NEW: Composite index for cost tracking by user and date
    idxUserCreated: index('idx_ai_usage_user_created').on(
      table.userId,
      table.createdAt.desc()
    ),
    // NEW: For provider cost analysis
    idxProviderCreated: index('idx_ai_usage_provider_created').on(
      table.provider,
      table.createdAt.desc()
    ),
  })
);

// Relations
export const aiCreditUsageRelations = relations(aiCreditUsage, ({ one }) => ({
  user: one(users, {
    fields: [aiCreditUsage.userId],
    references: [users.id],
  }),
  session: one(conversationSessions, {
    fields: [aiCreditUsage.sessionId],
    references: [conversationSessions.id],
  }),
}));

// Type exports
export type AICreditUsage = typeof aiCreditUsage.$inferSelect
export type NewAICreditUsage = typeof aiCreditUsage.$inferInsert