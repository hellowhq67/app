import { relations } from 'drizzle-orm';
import {
    boolean,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core';

// --- ENUMS ---
export const difficultyEnum = pgEnum('difficulty_level', ['Easy', 'Medium', 'Hard']);
export const userRoleEnum = pgEnum('user_role', ['admin', 'teacher', 'user', 'student']);
export const subscriptionPlanEnum = pgEnum('subscription_plan', ['free', 'pro', 'premium']);
export const questionTypeEnum = pgEnum('question_type', [
    'read_aloud', 'repeat_sentence', 'describe_image', 'retell_lecture', 'answer_short_question',
    'summarize_written_text', 'write_essay',
    'multiple_choice_single', 'multiple_choice_multiple', 'reorder_paragraphs', 'fill_in_blanks', 'reading_writing_fill_blanks',
    'summarize_spoken_text', 'select_missing_word', 'highlight_correct_summary', 'highlight_incorrect_words', 'write_from_dictation'
]);
export const conversationRoleEnum = pgEnum('conversation_role', ['user', 'assistant', 'system']);
export const aiUsageTypeEnum = pgEnum('ai_usage_type', ['transcription', 'scoring', 'feedback', 'realtime_voice', 'text_generation', 'other']);

// --- AUTH & USER TABLES ---

export const users = pgTable('users', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    role: userRoleEnum('role').default('user').notNull(),
    plan: subscriptionPlanEnum('plan').default('free').notNull(),
    dailyAiCredits: integer('daily_ai_credits').default(10).notNull(),
    aiCreditsUsed: integer('ai_credits_used').default(0).notNull(),
    lastCreditReset: timestamp('last_credit_reset').defaultNow(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const accounts = pgTable('accounts', {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').notNull(),
});

export const sessions = pgTable('sessions', {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
});

export const verifications = pgTable('verifications', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userProfiles = pgTable('user_profiles', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
    targetScore: integer('target_score'),
    examDate: timestamp('exam_date'),
    studyGoal: text('study_goal'),
    preferences: jsonb('preferences'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- APP DATA TABLES ---

export const questions = pgTable('questions', {
    id: uuid('id').defaultRandom().primaryKey(),
    type: questionTypeEnum('type').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(), // Main prompt text
    contentData: jsonb('content_data'), // Structured content (options, etc.)
    mediaUrl: text('media_url'), // Audio/Image URL
    transcript: text('transcript'),
    correctAnswer: jsonb('correct_answer'),
    difficulty: difficultyEnum('difficulty').default('Medium'),
    tags: jsonb('tags').default([]),
    isActive: boolean('is_active').default(true).notNull(),
    metadata: jsonb('metadata'), // Timers, specific params
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    typeIdx: index('idx_questions_type').on(table.type),
    difficultyIdx: index('idx_questions_difficulty').on(table.difficulty),
}));

export const attempts = pgTable('attempts', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
    response: jsonb('response'), // User answer
    isCorrect: boolean('is_correct'),
    score: integer('score').default(0),
    aiFeedback: jsonb('ai_feedback'), // Detailed feedback
    metadata: jsonb('metadata'), // Duration, pronunciation scores, etc.
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('idx_attempts_user').on(table.userId),
    questionIdIdx: index('idx_attempts_question').on(table.questionId),
}));

export const tests = pgTable('tests', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    type: text('type').default('mock'), // mock, diagnostic
    isPremium: boolean('is_premium').default(false),
    structure: jsonb('structure'), // Section order, question counts
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const testAttempts = pgTable('test_attempts', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    testId: uuid('test_id').notNull().references(() => tests.id, { onDelete: 'cascade' }),
    status: text('status').default('in_progress'), // in_progress, completed
    startedAt: timestamp('started_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
    scores: jsonb('scores'), // Overall and section scores
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const testAnswers = pgTable('test_answers', {
    id: uuid('id').defaultRandom().primaryKey(),
    testAttemptId: uuid('test_attempt_id').notNull().references(() => testAttempts.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
    answer: jsonb('answer'),
    score: integer('score'),
    feedback: jsonb('feedback'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const aiCreditUsage = pgTable('ai_credit_usage', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    usageType: aiUsageTypeEnum('usage_type').notNull(),
    amount: integer('amount').default(1),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- RELATIONS ---

export const usersRelations = relations(users, ({ one, many }) => ({
    accounts: many(accounts),
    sessions: many(sessions),
    profile: one(userProfiles, {
        fields: [users.id],
        references: [userProfiles.userId],
    }),
    attempts: many(attempts),
    testAttempts: many(testAttempts),
    creditUsage: many(aiCreditUsage),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, {
        fields: [accounts.userId],
        references: [users.id],
    }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
    user: one(users, {
        fields: [userProfiles.userId],
        references: [users.id],
    }),
}));

export const questionsRelations = relations(questions, ({ many }) => ({
    attempts: many(attempts),
    testAnswers: many(testAnswers),
}));

export const attemptsRelations = relations(attempts, ({ one }) => ({
    user: one(users, {
        fields: [attempts.userId],
        references: [users.id],
    }),
    question: one(questions, {
        fields: [attempts.questionId],
        references: [questions.id],
    }),
}));

export const testsRelations = relations(tests, ({ many }) => ({
    testAttempts: many(testAttempts),
}));

export const testAttemptsRelations = relations(testAttempts, ({ one, many }) => ({
    user: one(users, {
        fields: [testAttempts.userId],
        references: [users.id],
    }),
    test: one(tests, {
        fields: [testAttempts.testId],
        references: [tests.id],
    }),
    answers: many(testAnswers),
}));

export const testAnswersRelations = relations(testAnswers, ({ one }) => ({
    testAttempt: one(testAttempts, {
        fields: [testAnswers.testAttemptId],
        references: [testAttempts.id],
    }),
    question: one(questions, {
        fields: [testAnswers.questionId],
        references: [questions.id],
    }),
}));

export const aiCreditUsageRelations = relations(aiCreditUsage, ({ one }) => ({
    user: one(users, {
        fields: [aiCreditUsage.userId],
        references: [users.id],
    }),
}));
