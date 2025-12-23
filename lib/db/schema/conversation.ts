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

// Enums for conversation
export const conversationSessionTypeEnum = pgEnum('conversation_session_type', [
  'speaking_practice',
  'mock_interview',
  'pronunciation_coach',
  'fluency_training',
  'customer_support',
]);

export const conversationStatusEnum = pgEnum('conversation_status', [
  'active',
  'completed',
  'abandoned',
  'error',
]);

export const conversationRoleEnum = pgEnum('conversation_role', [
  'user',
  'assistant',
  'system',
]);

// Conversation Sessions Table
export const conversationSessions = pgTable(
  'conversation_sessions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionType: conversationSessionTypeEnum('session_type')
      .notNull()
      .default('speaking_practice'),
    status: conversationStatusEnum('status').notNull().default('active'),
    startedAt: timestamp('started_at').defaultNow().notNull(),
    endedAt: timestamp('ended_at'),
    totalTurns: integer('total_turns').default(0).notNull(),
    totalDurationMs: integer('total_duration_ms').default(0),
    aiProvider: text('ai_provider').default('openai'),
    modelUsed: text('model_used').default('gpt-4o-realtime-preview'),
    tokenUsage: jsonb('token_usage').$type<{
      promptTokens?: number
      completionTokens?: number
      totalTokens?: number
    }>(),
    metadata: jsonb('metadata').$type<{
      averageResponseTimeMs?: number
      interruptionCount?: number
      conversationScore?: number
      topics?: string[]
      [key: string]: any
    }>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_conversation_sessions_user_id').on(table.userId),
    statusIdx: index('idx_conversation_sessions_status').on(table.status),
    sessionTypeIdx: index('idx_conversation_sessions_type').on(
      table.sessionType
    ),
    createdAtIdx: index('idx_conversation_sessions_created_at').on(
      table.createdAt
    ),
  })
);

// Conversation Turns Table (individual messages)
export const conversationTurns = pgTable(
  'conversation_turns',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => conversationSessions.id, { onDelete: 'cascade' }),
    turnIndex: integer('turn_index').notNull(),
    role: conversationRoleEnum('role').notNull(),
    audioUrl: text('audio_url'),
    transcript: text('transcript'),
    scores: jsonb('scores').$type<{
      pronunciation?: number
      fluency?: number
      content?: number
      grammarScore?: number
      vocabularyScore?: number
      total?: number
      feedback?: string
      [key: string]: any
    }>(),
    durationMs: integer('duration_ms'),
    silenceDurationMs: integer('silence_duration_ms'),
    wordsPerMinute: decimal('words_per_minute', { precision: 6, scale: 2 }),
    pauseCount: integer('pause_count'),
    fillerWordCount: integer('filler_word_count'),
    metadata: jsonb('metadata').$type<{
      audioFormat?: string
      sampleRate?: number
      interrupted?: boolean
      responseTimeMs?: number
      [key: string]: any
    }>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    sessionIdIdx: index('idx_conversation_turns_session_id').on(
      table.sessionId
    ),
    turnIndexIdx: index('idx_conversation_turns_turn_index').on(
      table.turnIndex
    ),
    roleIdx: index('idx_conversation_turns_role').on(table.role),
    createdAtIdx: index('idx_conversation_turns_created_at').on(
      table.createdAt
    ),
  })
);

// Link conversation sessions to speaking/writing attempts for scoring
export const conversationAttemptLinks = pgTable(
  'conversation_attempt_links',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => conversationSessions.id, { onDelete: 'cascade' }),
    attemptId: uuid('attempt_id').notNull(), // Can reference speakingAttempts or writingAttempts
    attemptType: text('attempt_type').notNull(), // 'speaking' | 'writing'
    linkType: text('link_type').default('generated_from'), // 'generated_from' | 'scored_as' | 'related_to'
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    sessionIdIdx: index('idx_conversation_links_session_id').on(
      table.sessionId
    ),
    attemptIdIdx: index('idx_conversation_links_attempt_id').on(
      table.attemptId
    ),
    attemptTypeIdx: index('idx_conversation_links_attempt_type').on(
      table.attemptType
    ),
  })
);

// Relations
export const conversationSessionsRelations = relations(
  conversationSessions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [conversationSessions.userId],
      references: [users.id],
    }),
    turns: many(conversationTurns),
    attemptLinks: many(conversationAttemptLinks),
  })
);

export const conversationTurnsRelations = relations(
  conversationTurns,
  ({ one }) => ({
    session: one(conversationSessions, {
      fields: [conversationTurns.sessionId],
      references: [conversationSessions.id],
    }),
  })
);

export const conversationAttemptLinksRelations = relations(
  conversationAttemptLinks,
  ({ one }) => ({
    session: one(conversationSessions, {
      fields: [conversationAttemptLinks.sessionId],
      references: [conversationSessions.id],
    }),
  })
);

// Type exports
export type ConversationSession = typeof conversationSessions.$inferSelect
export type NewConversationSession = typeof conversationSessions.$inferInsert
export type ConversationTurn = typeof conversationTurns.$inferSelect
export type NewConversationTurn = typeof conversationTurns.$inferInsert
export type ConversationAttemptLink = typeof conversationAttemptLinks.$inferSelect
export type NewConversationAttemptLink = typeof conversationAttemptLinks.$inferInsert