import { sql } from 'drizzle-orm';
import {
    index,
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const pteAttempts = pgTable(
    'pte_attempts',
    {
        id: uuid('id')
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        userId: text('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        skillType: text('skill_type').notNull(), // 'speaking', 'writing', 'reading', 'listening'
        sourceAttemptId: uuid('source_attempt_id').notNull(), // Reference to speaking_attempts.id, etc.
        sourceTable: text('source_table').notNull(), // 'speaking_attempts', etc.
        questionId: uuid('question_id').notNull(),
        questionType: text('question_type').notNull(), // e.g., 'read_aloud'
        section: text('section').notNull(),
        userResponse: jsonb('user_response').notNull(), // Consolidated response data
        scores: jsonb('scores').notNull(), // Consolidated score data
        overallScore: integer('overall_score'),
        accuracy: integer('accuracy'),
        wordCount: integer('word_count'),
        durationMs: integer('duration_ms'),
        timeTaken: integer('time_taken'), // in seconds
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => ({
        idxUserCreated: index('idx_pte_attempts_user_created').on(
            table.userId,
            table.createdAt.desc()
        ),
        idxSkillType: index('idx_pte_attempts_skill_type').on(table.skillType),
        idxQuestion: index('idx_pte_attempts_question').on(table.questionId),
    })
);

export type PteAttempt = typeof pteAttempts.$inferSelect;
export type NewPteAttempt = typeof pteAttempts.$inferInsert;
