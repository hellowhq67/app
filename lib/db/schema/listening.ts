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
import { listeningQuestionTypeEnum } from './pte-questions';

// Listening Questions table
export const listeningQuestions = pgTable(
  'listening_questions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    type: listeningQuestionTypeEnum('type').notNull(),
    title: text('title').notNull(),
    promptText: text('prompt_text'),
    promptMediaUrl: text('prompt_media_url'),
    correctAnswers: jsonb('correct_answers').notNull(),
    options: jsonb('options'),
    transcript: text('transcript'),
    difficulty: difficultyEnum('difficulty').notNull().default('Medium'),
    tags: jsonb('tags').default(sql`'[]'::jsonb`),
    isActive: boolean('is_active').notNull().default(true),
    bookmarked: boolean('bookmarked').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    typeIdx: index('listening_questions_type_idx').on(table.type),
    difficultyIdx: index('listening_questions_difficulty_idx').on(
      table.difficulty
    ),
    createdAtIdx: index('listening_questions_created_at_idx').on(
      table.createdAt
    ),
    // NEW: Index for active status
    idxActive: index('idx_listening_questions_is_active').on(table.isActive),
    // NEW: Partial index for active questions only (most common query)
    idxActiveTypePartial: index('idx_listening_questions_active_type').on(
      table.type,
      table.difficulty
    ).where(sql`${table.isActive} = true`),
  })
);

// Listening Attempts table
export const listeningAttempts = pgTable(
  'listening_attempts',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => listeningQuestions.id, { onDelete: 'cascade' }),
    userResponse: jsonb('user_response').notNull(),
    scores: jsonb('scores'),
    // Extracted score columns for efficient querying
    accuracy: decimal('accuracy', { precision: 5, scale: 2 }), // Percentage 0-100
    correctAnswers: integer('correct_answers'),
    totalAnswers: integer('total_answers'),
    timeTaken: integer('time_taken'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('listening_attempts_user_id_idx').on(table.userId),
    questionIdIdx: index('listening_attempts_question_id_idx').on(
      table.questionId
    ),
    createdAtIdx: index('listening_attempts_created_at_idx').on(
      table.createdAt
    ),
    // NEW: Composite index for user history queries
    idxUserCreated: index('idx_listening_attempts_user_created').on(
      table.userId,
      table.createdAt.desc()
    ),
    // NEW: For analytics and leaderboards
    idxAccuracy: index('idx_listening_attempts_accuracy').on(
      table.accuracy.desc()
    ),
  })
);

// Relations
export const listeningQuestionsRelations = relations(
  listeningQuestions,
  ({ many }) => ({
    attempts: many(listeningAttempts),
  })
);

export const listeningAttemptsRelations = relations(
  listeningAttempts,
  ({ one }) => ({
    user: one(users, {
      fields: [listeningAttempts.userId],
      references: [users.id],
    }),
    question: one(listeningQuestions, {
      fields: [listeningAttempts.questionId],
      references: [listeningQuestions.id],
    }),
  })
);

// Type exports
export type ListeningQuestion = typeof listeningQuestions.$inferSelect
export type NewListeningQuestion = typeof listeningQuestions.$inferInsert
export type ListeningAttempt = typeof listeningAttempts.$inferSelect
export type NewListeningAttempt = typeof listeningAttempts.$inferInsert