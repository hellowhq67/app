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
import { readingQuestionTypeEnum } from './pte-questions';

// Reading Questions table
export const readingQuestions = pgTable(
  'reading_questions',
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
    idxType: index('idx_reading_questions_type').on(table.type),
    idxActive: index('idx_reading_questions_is_active').on(table.isActive),
    // NEW: Partial index for active questions only (most common query)
    idxActiveTypePartial: index('idx_reading_questions_active_type').on(
      table.type,
      table.difficulty
    ).where(sql`${table.isActive} = true`),
  })
);

// Reading Attempts table
export const readingAttempts = pgTable(
  'reading_attempts',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => readingQuestions.id, { onDelete: 'cascade' }),
    userResponse: jsonb('user_response').notNull(), // Store answers, selections, etc.
    scores: jsonb('scores'), // { accuracy: number, correctAnswers: number, totalAnswers: number }
    // Extracted score columns for efficient querying
    accuracy: decimal('accuracy', { precision: 5, scale: 2 }), // Percentage 0-100
    correctAnswers: integer('correct_answers'),
    totalAnswers: integer('total_answers'),
    timeTaken: integer('time_taken'), // in seconds
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('reading_attempts_user_id_idx').on(table.userId),
    questionIdIdx: index('reading_attempts_question_id_idx').on(
      table.questionId
    ),
    createdAtIdx: index('reading_attempts_created_at_idx').on(table.createdAt),
    // NEW: Composite index for user history queries
    idxUserCreated: index('idx_reading_attempts_user_created').on(
      table.userId,
      table.createdAt.desc()
    ),
    // NEW: For analytics and leaderboards
    idxAccuracy: index('idx_reading_attempts_accuracy').on(
      table.accuracy.desc()
    ),
  })
);

// Relations
export const readingAttemptsRelations = relations(
  readingAttempts,
  ({ one }) => ({
    user: one(users, {
      fields: [readingAttempts.userId],
      references: [users.id],
    }),
    question: one(readingQuestions, {
      fields: [readingAttempts.questionId],
      references: [readingQuestions.id],
    }),
  })
);

// Type exports
export type ReadingAttempt = typeof readingAttempts.$inferSelect
export type NewReadingAttempt = typeof readingAttempts.$inferInsert
export type ReadingQuestion = typeof readingQuestions.$inferSelect
export type NewReadingQuestion = typeof readingQuestions.$inferInsert