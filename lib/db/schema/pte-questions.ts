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
import { speakingQuestions } from './speaking';
import { readingQuestions } from './reading';
import { writingQuestions } from './writing';
import { listeningQuestions } from './listening';

// Enums
export const speakingTypeEnum = pgEnum('speaking_type', [
  'read_aloud',
  'repeat_sentence',
  'describe_image',
  'retell_lecture',
  'answer_short_question',
  'summarize_group_discussion',
  'respond_to_a_situation',
]);

export const readingQuestionTypeEnum = pgEnum('reading_question_type', [
  'multiple_choice_single',
  'multiple_choice_multiple',
  'reorder_paragraphs',
  'fill_in_blanks',
  'reading_writing_fill_blanks',
]);

export const writingQuestionTypeEnum = pgEnum('writing_question_type', [
  'summarize_written_text',
  'write_essay',
]);

export const listeningQuestionTypeEnum = pgEnum('listening_question_type', [
  'summarize_spoken_text',
  'multiple_choice_single',
  'multiple_choice_multiple',
  'fill_in_blanks',
  'highlight_correct_summary',
  'select_missing_word',
  'highlight_incorrect_words',
  'write_from_dictation',
]);

// PTE Tests table
export const pteTests = pgTable('pte_tests', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  description: text('description'),
  testType: text('test_type').notNull(), // 'mock', 'practice', 'scored'
  section: text('section'), // 'speaking', 'writing', 'reading', 'listening'
  isPremium: text('is_premium').default('false'),
  duration: integer('duration'), // in minutes
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// PTE Questions table
export const pteQuestions = pgTable('pte_questions', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  testId: uuid('test_id').references(() => pteTests.id, {
    onDelete: 'cascade',
  }),
  // External source identity to support mirroring from external APIs
  externalId: text('external_id'),
  source: text('source').default('local'),
  question: text('question').notNull(),
  questionType: text('question_type').notNull(), // e.g., s_read_aloud, s_repeat_sentence, etc.
  section: text('section').notNull(), // speaking, writing, reading, listening
  questionData: jsonb('question_data'), // JSON for options, audio URLs, images, etc.
  tags: jsonb('tags'),
  correctAnswer: text('correct_answer'),
  points: integer('points').default(1),
  orderIndex: integer('order_index').default(0),
  difficulty: text('difficulty'), // 'easy', 'medium', 'hard'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

});

// PTE Question Types (Configuration)
export const pteQuestionTypes = pgTable('pte_question_types', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  code: text('code').notNull().unique(), // e.g. 's_read_aloud'
  title: text('title').notNull(),
  description: text('description'),
  icon: text('icon'),
  color: text('color'),
  shortName: text('short_name'),
  scoringType: text('scoring_type'), // 'ai' | 'auto'
  videoLink: text('video_link'),

  // Timers
  timerPrepMs: integer('timer_prep_ms').default(0),
  timerRecordMs: integer('timer_record_ms').default(0),

  // Organization
  section: text('section'), // 'speaking', 'reading', etc.
  parentCode: text('parent_code'), // Code of the parent category, e.g. 'speaking'

  // Metadata
  firstQuestionId: integer('first_question_id'), // Legacy ID ref
  questionCount: integer('question_count').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Test Attempts table
export const testAttempts = pgTable('test_attempts', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  testId: uuid('test_id')
    .notNull()
    .references(() => pteTests.id, { onDelete: 'cascade' }),
  status: text('status').default('in_progress'), // 'in_progress', 'completed', 'abandoned'
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  totalScore: text('total_score'),
  speakingScore: text('speaking_score'),
  writingScore: text('writing_score'),
  readingScore: text('reading_score'),
  listeningScore: text('listening_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Test Answers table
export const testAnswers = pgTable('test_answers', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  attemptId: uuid('attempt_id')
    .notNull()
    .references(() => testAttempts.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id')
    .notNull()
    .references(() => pteQuestions.id, { onDelete: 'cascade' }),
  userAnswer: text('user_answer'),
  isCorrect: boolean('is_correct'),
  pointsEarned: integer('points_earned').default(0),
  aiFeedback: text('ai_feedback'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Practice Sessions table
export const practiceSessions = pgTable('practice_sessions', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id')
    .notNull()
    .references(() => pteQuestions.id, { onDelete: 'cascade' }),
  score: integer('score'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Media linked to questions (audio, image, video)
export const pteQuestionMedia = pgTable('pte_question_media', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  questionId: uuid('question_id')
    .notNull()
    .references(() => pteQuestions.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(), // 'audio' | 'image' | 'video'
  url: text('url').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Sync job tracking for external imports
export const pteSyncJobs = pgTable('pte_sync_jobs', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  jobType: text('job_type').notNull(), // 'speaking' | 'writing' | 'reading' | 'listening'
  questionType: text('question_type'),
  status: text('status').notNull().default('pending'), // 'pending' | 'running' | 'success' | 'error'
  startedAt: timestamp('started_at').defaultNow().notNull(),
  finishedAt: timestamp('finished_at'),
  stats: jsonb('stats'),
  error: text('error'),
});

// User exam settings that influence question selection
export const pteUserExamSettings = pgTable('pte_user_exam_settings', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  examDate: timestamp('exam_date'),
  targetScore: integer('target_score'),
  preferences: jsonb('preferences'), // e.g., preferred difficulty, time per session, module toggles
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const pteTestsRelations = relations(pteTests, ({ many }) => ({
  questions: many(pteQuestions),
  attempts: many(testAttempts),
}));

export const pteQuestionsRelations = relations(
  pteQuestions,
  ({ one, many }) => ({
    test: one(pteTests, {
      fields: [pteQuestions.testId],
      references: [pteTests.id],
    }),
    answers: many(testAnswers),
    practiceSessions: many(practiceSessions),
  })
);

// Relations for question media
export const pteQuestionMediaRelations = relations(
  pteQuestionMedia,
  ({ one }) => ({
    question: one(pteQuestions, {
      fields: [pteQuestionMedia.questionId],
      references: [pteQuestions.id],
    }),
  })
);

export const pteQuestionTypesRelations = relations(
  pteQuestionTypes,
  ({ one, many }) => ({
    parent: one(pteQuestionTypes, {
      fields: [pteQuestionTypes.parentCode],
      references: [pteQuestionTypes.code],
      relationName: 'category_hierarchy',
    }),
    children: many(pteQuestionTypes, { relationName: 'category_hierarchy' }),
  })
);

export const pteUserExamSettingsRelations = relations(
  pteUserExamSettings,
  ({ one }) => ({
    user: one(users, {
      fields: [pteUserExamSettings.userId],
      references: [users.id],
    }),
  })
);

export const testAttemptsRelations = relations(
  testAttempts,
  ({ one, many }) => ({
    user: one(users, {
      fields: [testAttempts.userId],
      references: [users.id],
    }),
    test: one(pteTests, {
      fields: [testAttempts.testId],
      references: [pteTests.id],
    }),
    answers: many(testAnswers),
  })
);

export const testAnswersRelations = relations(testAnswers, ({ one }) => ({
  attempt: one(testAttempts, {
    fields: [testAnswers.attemptId],
    references: [testAttempts.id],
  }),
  question: one(pteQuestions, {
    fields: [testAnswers.questionId],
    references: [pteQuestions.id],
  }),
}));

export const practiceSessionsRelations = relations(
  practiceSessions,
  ({ one }) => ({
    user: one(users, {
      fields: [practiceSessions.userId],
      references: [users.id],
    }),
    question: one(pteQuestions, {
      fields: [practiceSessions.questionId],
      references: [pteQuestions.id],
    }),
  })
);

// Type exports
export type PteTest = typeof pteTests.$inferSelect
export type NewPteTest = typeof pteTests.$inferInsert
export type PteQuestion = typeof pteQuestions.$inferSelect
export type NewPteQuestion = typeof pteQuestions.$inferInsert
export type PteQuestionType = typeof pteQuestionTypes.$inferSelect
export type NewPteQuestionType = typeof pteQuestionTypes.$inferInsert
export type TestAttempt = typeof testAttempts.$inferSelect
export type NewTestAttempt = typeof testAttempts.$inferInsert
export type TestAnswer = typeof testAnswers.$inferSelect
export type NewTestAnswer = typeof testAnswers.$inferInsert
export type PracticeSession = typeof practiceSessions.$inferSelect
export type NewPracticeSession = typeof practiceSessions.$inferInsert
export type PteQuestionMedia = typeof pteQuestionMedia.$inferSelect
export type NewPteQuestionMedia = typeof pteQuestionMedia.$inferInsert
export type PteSyncJob = typeof pteSyncJobs.$inferSelect
export type NewPteSyncJob = typeof pteSyncJobs.$inferInsert
export type PteUserExamSettings = typeof pteUserExamSettings.$inferSelect
export type NewPteUserExamSettings = typeof pteUserExamSettings.$inferInsert