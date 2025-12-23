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
import { difficultyEnum } from './users'; // Using the difficulty enum from users.ts
import { speakingTypeEnum } from './pte-questions';

// Speaking Questions table
export const speakingQuestions = pgTable(
  'speaking_questions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    type: speakingTypeEnum('type').notNull(),
    title: text('title').notNull(),
    promptText: text('prompt_text'),
    promptMediaUrl: text('prompt_media_url'),
    // Reference audio/video URLs for native speaker pronunciation
    referenceAudioUrlUS: text('reference_audio_url_us'), // US English speaker
    referenceAudioUrlUK: text('reference_audio_url_uk'), // UK English speaker
    // Question metadata
    appearanceCount: integer('appearance_count').default(0), // Times appeared in real exams
    externalId: text('external_id'), // ID from external source
    metadata: jsonb('metadata'), // Additional data (timing, prep time, answer time, etc.)
    difficulty: difficultyEnum('difficulty').notNull().default('Medium'),
    tags: jsonb('tags').default(sql`'[]'::jsonb`),
    isActive: boolean('is_active').notNull().default(true),
    bookmarked: boolean('bookmarked').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    idxType: index('idx_speaking_questions_type').on(table.type),
    idxActive: index('idx_speaking_questions_is_active').on(table.isActive),
    idxTagsGin: index('idx_speaking_questions_tags_gin').using(
      'gin',
      table.tags
    ),
    idxExternalId: index('idx_speaking_questions_external_id').on(table.externalId),
    // NEW: Partial index for active questions only (most common query)
    idxActiveTypePartial: index('idx_speaking_questions_active_type').on(
      table.type,
      table.difficulty
    ).where(sql`${table.isActive} = true`),
  })
);

// Speaking Attempts table
export const speakingAttempts = pgTable(
  'speaking_attempts',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => speakingQuestions.id, { onDelete: 'cascade' }),
    type: speakingTypeEnum('type').notNull(),
    audioUrl: text('audio_url').notNull(),
    transcript: text('transcript'),
    scores: jsonb('scores')
      .notNull()
      .default(sql`'{}'::jsonb`),
    // Extracted score columns for efficient querying
    overallScore: integer('overall_score'),
    pronunciationScore: integer('pronunciation_score'),
    fluencyScore: integer('fluency_score'),
    contentScore: integer('content_score'),
    durationMs: integer('duration_ms').notNull(),
    wordsPerMinute: decimal('words_per_minute', { precision: 6, scale: 2 }),
    fillerRate: decimal('filler_rate', { precision: 6, scale: 3 }),
    timings: jsonb('timings').notNull(),
    isPublic: boolean('is_public').notNull().default(false), // For community sharing
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    idxQuestion: index('idx_speaking_attempts_question').on(table.questionId),
    idxUserType: index('idx_speaking_attempts_user_type').on(
      table.userId,
      table.type
    ),
    idxPublic: index('idx_speaking_attempts_public').on(table.isPublic),
    // NEW: Composite index for date-range queries
    idxUserCreated: index('idx_speaking_attempts_user_created').on(
      table.userId,
      table.createdAt.desc()
    ),
    // NEW: For leaderboard/public answers
    idxPublicScores: index('idx_speaking_attempts_public_scores').on(
      table.isPublic,
      table.questionId,
      table.createdAt.desc()
    ),
    // NEW: For analytics and leaderboards
    idxOverallScore: index('idx_speaking_attempts_overall_score').on(
      table.overallScore.desc()
    ),
    // NEW: For weak area identification
    idxUserScores: index('idx_speaking_attempts_user_scores').on(
      table.userId,
      table.overallScore.desc()
    ),
  })
);

// Speaking answer templates for high-scoring examples
export const speakingTemplates = pgTable(
  'speaking_templates',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    type: speakingTypeEnum('type').notNull(),
    title: text('title').notNull(),
    templateText: text('template_text').notNull(),
    audioUrl: text('audio_url'), // Audio example of the template
    scoreRange: text('score_range').notNull(), // e.g., "70-90", "80-90"
    difficulty: difficultyEnum('difficulty').notNull().default('Medium'),
    isRecommended: boolean('is_recommended').notNull().default(false),
    tags: jsonb('tags').default(sql`'[]'::jsonb`),
    usageCount: integer('usage_count').notNull().default(0), // Track popularity
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    idxType: index('idx_speaking_templates_type').on(table.type),
    idxRecommended: index('idx_speaking_templates_recommended').on(
      table.isRecommended
    ),
  })
);

// Relations
export const speakingQuestionsRelations = relations(
  speakingQuestions,
  ({ many }) => ({
    attempts: many(speakingAttempts),
  })
);

export const speakingAttemptsRelations = relations(
  speakingAttempts,
  ({ one }) => ({
    user: one(users, {
      fields: [speakingAttempts.userId],
      references: [users.id],
    }),
    question: one(speakingQuestions, {
      fields: [speakingAttempts.questionId],
      references: [speakingQuestions.id],
    }),
  })
);

// Type exports
export type SpeakingQuestion = typeof speakingQuestions.$inferSelect
export type NewSpeakingQuestion = typeof speakingQuestions.$inferInsert
export type SpeakingAttempt = typeof speakingAttempts.$inferSelect
export type NewSpeakingAttempt = typeof speakingAttempts.$inferInsert
export type SpeakingTemplate = typeof speakingTemplates.$inferSelect
export type NewSpeakingTemplate = typeof speakingTemplates.$inferInsert