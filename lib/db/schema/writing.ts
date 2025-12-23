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
import { writingQuestionTypeEnum } from './pte-questions';

// Writing Questions table
export const writingQuestions = pgTable(
  'writing_questions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    type: text('type').notNull(),
    title: text('title').notNull(),
    promptText: text('prompt_text').notNull(),
    options: jsonb('options'),
    answerKey: jsonb('answer_key'),
    difficulty: difficultyEnum('difficulty').notNull().default('Medium'),
    tags: jsonb('tags').default(sql`'[]'::jsonb`),
    isActive: boolean('is_active').notNull().default(true),
    bookmarked: boolean('bookmarked').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    idxType: index('idx_writing_questions_type').on(table.type),
    idxActive: index('idx_writing_questions_is_active').on(table.isActive),
    // NEW: Partial index for active questions only (most common query)
    idxActiveTypePartial: index('idx_writing_questions_active_type').on(
      table.type,
      table.difficulty
    ).where(sql`${table.isActive} = true`),
  })
);

// Writing Attempts table
export const writingAttempts = pgTable(
  'writing_attempts',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => writingQuestions.id, { onDelete: 'cascade' }),
    userResponse: text('user_response').notNull(), // Store essay/summary text
    scores: jsonb('scores'), // { grammar, vocabulary, coherence, taskResponse, wordCount, etc. }
    // Extracted score columns for efficient querying
    overallScore: integer('overall_score'),
    grammarScore: integer('grammar_score'),
    vocabularyScore: integer('vocabulary_score'),
    coherenceScore: integer('coherence_score'),
    contentScore: integer('content_score'),
    wordCount: integer('word_count'),
    timeTaken: integer('time_taken'), // in seconds
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('writing_attempts_user_id_idx').on(table.userId),
    questionIdIdx: index('writing_attempts_question_id_idx').on(
      table.questionId
    ),
    createdAtIdx: index('writing_attempts_created_at_idx').on(table.createdAt),
    // NEW: Composite index for user history queries
    idxUserCreated: index('idx_writing_attempts_user_created').on(
      table.userId,
      table.createdAt.desc()
    ),
    // NEW: For analytics and leaderboards
    idxOverallScore: index('idx_writing_attempts_overall_score').on(
      table.overallScore.desc()
    ),
  })
);

// Relations
export const writingAttemptsRelations = relations(
  writingAttempts,
  ({ one }) => ({
    user: one(users, {
      fields: [writingAttempts.userId],
      references: [users.id],
    }),
    question: one(writingQuestions, {
      fields: [writingAttempts.questionId],
      references: [writingQuestions.id],
    }),
  })
);

// Type exports
export type WritingQuestion = typeof writingQuestions.$inferSelect
export type NewWritingQuestion = typeof writingQuestions.$inferInsert
export type WritingAttempt = typeof writingAttempts.$inferSelect
export type NewWritingAttempt = typeof writingAttempts.$inferInsert