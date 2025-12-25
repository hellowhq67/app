import { relations, sql } from 'drizzle-orm';
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
import { users } from './users';
import { pteQuestions } from './pte-questions';

// Enums for attempts
export const pteAttemptStatusEnum = pgEnum('pte_attempt_status', [
    'in_progress',
    'completed',
    'abandoned',
    'under_review',
]);

export const pteMockTestStatusEnum = pgEnum('pte_mock_test_status', [
    'not_started',
    'in_progress',
    'completed',
    'expired',
]);

// PTE Attempts Table (User responses to questions)
export const pteAttempts = pgTable(
    'pte_attempts',
    {
        id: uuid('id')
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        userId: text('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        questionId: uuid('question_id')
            .notNull()
            .references(() => pteQuestions.id, { onDelete: 'cascade' }),

        // Attempt details
        status: pteAttemptStatusEnum('status').notNull().default('in_progress'),
        attemptNumber: integer('attempt_number').notNull().default(1),

        // User response
        responseText: text('response_text'), // For text-based responses
        responseAudioUrl: text('response_audio_url'), // Vercel Blob URL for audio responses
        responseData: jsonb('response_data').$type<{
            selectedOptions?: number[];
            blanks?: { [key: string]: string };
            paragraphOrder?: number[];
            [key: string]: any;
        }>(), // For structured responses (MCQ, fill blanks, etc.)

        // Timing
        timeTaken: integer('time_taken'), // in seconds
        startedAt: timestamp('started_at').defaultNow().notNull(),
        completedAt: timestamp('completed_at'),

        // AI Scoring results
        aiScore: integer('ai_score'),
        aiScores: jsonb('ai_scores').$type<{
            pronunciation?: number;
            fluency?: number;
            content?: number;
            grammar?: number;
            vocabulary?: number;
            spelling?: number;
            form?: number;
            total?: number;
            [key: string]: any;
        }>(),
        aiFeedback: text('ai_feedback'),
        aiScoredAt: timestamp('ai_scored_at'),

        // Manual review (if needed)
        manualScore: integer('manual_score'),
        manualFeedback: text('manual_feedback'),
        reviewedBy: text('reviewed_by'),
        reviewedAt: timestamp('reviewed_at'),

        // Final score (AI or manual)
        finalScore: integer('final_score'),

        // Metadata
        metadata: jsonb('metadata').$type<{
            deviceType?: string;
            browserInfo?: string;
            networkQuality?: string;
            [key: string]: any;
        }>(),

        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => ({
        userIdIdx: index('idx_pte_attempts_user_id').on(table.userId),
        questionIdIdx: index('idx_pte_attempts_question_id').on(table.questionId),
        statusIdx: index('idx_pte_attempts_status').on(table.status),
        createdAtIdx: index('idx_pte_attempts_created_at').on(table.createdAt),
        // Composite index for user's question history
        userQuestionIdx: index('idx_pte_attempts_user_question').on(
            table.userId,
            table.questionId
        ),
    })
);

// PTE Mock Tests Table
export const pteMockTests = pgTable(
    'pte_mock_tests',
    {
        id: uuid('id')
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        userId: text('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),

        // Test details
        testName: text('test_name').notNull(),
        status: pteMockTestStatusEnum('status').notNull().default('not_started'),

        // Timing
        scheduledAt: timestamp('scheduled_at'),
        startedAt: timestamp('started_at'),
        completedAt: timestamp('completed_at'),
        totalDuration: integer('total_duration'), // in seconds

        // Scores by category
        overallScore: integer('overall_score'),
        speakingScore: integer('speaking_score'),
        writingScore: integer('writing_score'),
        readingScore: integer('reading_score'),
        listeningScore: integer('listening_score'),

        // Detailed scores
        scores: jsonb('scores').$type<{
            enabling_skills?: {
                grammar?: number;
                oral_fluency?: number;
                pronunciation?: number;
                spelling?: number;
                vocabulary?: number;
                written_discourse?: number;
            };
            communicative_skills?: {
                listening?: number;
                reading?: number;
                speaking?: number;
                writing?: number;
            };
            [key: string]: any;
        }>(),

        // Progress tracking
        totalQuestions: integer('total_questions').notNull(),
        completedQuestions: integer('completed_questions').default(0).notNull(),

        // Metadata
        metadata: jsonb('metadata').$type<{
            testType?: 'full' | 'section' | 'custom';
            difficulty?: string;
            [key: string]: any;
        }>(),

        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => ({
        userIdIdx: index('idx_pte_mock_tests_user_id').on(table.userId),
        statusIdx: index('idx_pte_mock_tests_status').on(table.status),
        scheduledAtIdx: index('idx_pte_mock_tests_scheduled_at').on(
            table.scheduledAt
        ),
        createdAtIdx: index('idx_pte_mock_tests_created_at').on(table.createdAt),
    })
);

// PTE Mock Test Questions (Links questions to mock tests)
export const pteMockTestQuestions = pgTable(
    'pte_mock_test_questions',
    {
        id: uuid('id')
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        mockTestId: uuid('mock_test_id')
            .notNull()
            .references(() => pteMockTests.id, { onDelete: 'cascade' }),
        questionId: uuid('question_id')
            .notNull()
            .references(() => pteQuestions.id, { onDelete: 'cascade' }),
        attemptId: uuid('attempt_id').references(() => pteAttempts.id, {
            onDelete: 'set null',
        }),

        // Question order in test
        questionOrder: integer('question_order').notNull(),
        sectionName: text('section_name'), // 'Speaking & Writing', 'Reading', 'Listening'

        // Scoring
        score: integer('score'),
        maxScore: integer('max_score').notNull(),

        // Status
        isCompleted: boolean('is_completed').default(false).notNull(),
        completedAt: timestamp('completed_at'),

        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => ({
        mockTestIdIdx: index('idx_pte_mock_test_questions_mock_test_id').on(
            table.mockTestId
        ),
        questionIdIdx: index('idx_pte_mock_test_questions_question_id').on(
            table.questionId
        ),
        attemptIdIdx: index('idx_pte_mock_test_questions_attempt_id').on(
            table.attemptId
        ),
    })
);

// Relations
export const pteAttemptsRelations = relations(pteAttempts, ({ one }) => ({
    user: one(users, {
        fields: [pteAttempts.userId],
        references: [users.id],
    }),
    question: one(pteQuestions, {
        fields: [pteAttempts.questionId],
        references: [pteQuestions.id],
    }),
}));

export const pteMockTestsRelations = relations(
    pteMockTests,
    ({ one, many }) => ({
        user: one(users, {
            fields: [pteMockTests.userId],
            references: [users.id],
        }),
        questions: many(pteMockTestQuestions),
    })
);

export const pteMockTestQuestionsRelations = relations(
    pteMockTestQuestions,
    ({ one }) => ({
        mockTest: one(pteMockTests, {
            fields: [pteMockTestQuestions.mockTestId],
            references: [pteMockTests.id],
        }),
        question: one(pteQuestions, {
            fields: [pteMockTestQuestions.questionId],
            references: [pteQuestions.id],
        }),
        attempt: one(pteAttempts, {
            fields: [pteMockTestQuestions.attemptId],
            references: [pteAttempts.id],
        }),
    })
);

// Type exports
export type PteAttempt = typeof pteAttempts.$inferSelect;
export type NewPteAttempt = typeof pteAttempts.$inferInsert;
export type PteMockTest = typeof pteMockTests.$inferSelect;
export type NewPteMockTest = typeof pteMockTests.$inferInsert;
export type PteMockTestQuestion = typeof pteMockTestQuestions.$inferSelect;
export type NewPteMockTestQuestion = typeof pteMockTestQuestions.$inferInsert;
