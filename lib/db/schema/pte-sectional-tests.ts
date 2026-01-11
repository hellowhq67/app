import { relations, sql } from 'drizzle-orm';
import {
    index,
    integer,
    pgEnum,
    pgTable,
    timestamp,
    uuid,
    text
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { pteQuestions } from './pte-questions';
import { pteAttempts } from './pte-attempts';
import { pteCategoryEnum } from './pte-categories';

export const pteSectionalTestStatusEnum = pgEnum('pte_sectional_test_status', [
    'in_progress',
    'completed',
    'abandoned'
]);

export const pteSectionalTests = pgTable('pte_sectional_tests', {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    section: pteCategoryEnum('section').notNull(),
    status: pteSectionalTestStatusEnum('status').notNull().default('in_progress'),
    
    startedAt: timestamp('started_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
    
    totalScore: integer('total_score'),
    timeSpent: integer('time_spent'), // in seconds
    
    questionsAttempted: integer('questions_attempted').default(0).notNull(),
    questionsCorrect: integer('questions_correct').default(0).notNull(),
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => ({
    userIdIdx: index('idx_pte_sectional_tests_user_id').on(table.userId),
    sectionIdx: index('idx_pte_sectional_tests_section').on(table.section),
    statusIdx: index('idx_pte_sectional_tests_status').on(table.status),
}));

export const pteSectionalAttempts = pgTable('pte_sectional_attempts', {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    sectionalTestId: uuid('sectional_test_id').notNull().references(() => pteSectionalTests.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id').notNull().references(() => pteQuestions.id, { onDelete: 'cascade' }),
    attemptId: uuid('attempt_id').references(() => pteAttempts.id, { onDelete: 'set null' }),
    
    sequence: integer('sequence').notNull(),
    timeSpent: integer('time_spent'), // in seconds
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    sectionalTestIdIdx: index('idx_pte_sectional_attempts_test_id').on(table.sectionalTestId),
    questionIdIdx: index('idx_pte_sectional_attempts_question_id').on(table.questionId),
}));

export const pteSectionalTestsRelations = relations(pteSectionalTests, ({ one, many }) => ({
    user: one(users, {
        fields: [pteSectionalTests.userId],
        references: [users.id],
    }),
    attempts: many(pteSectionalAttempts),
}));

export const pteSectionalAttemptsRelations = relations(pteSectionalAttempts, ({ one }) => ({
    sectionalTest: one(pteSectionalTests, {
        fields: [pteSectionalAttempts.sectionalTestId],
        references: [pteSectionalTests.id],
    }),
    question: one(pteQuestions, {
        fields: [pteSectionalAttempts.questionId],
        references: [pteQuestions.id],
    }),
    originalAttempt: one(pteAttempts, {
        fields: [pteSectionalAttempts.attemptId],
        references: [pteAttempts.id],
    }),
}));

export type PteSectionalTest = typeof pteSectionalTests.$inferSelect;
export type NewPteSectionalTest = typeof pteSectionalTests.$inferInsert;
export type PteSectionalAttempt = typeof pteSectionalAttempts.$inferSelect;
export type NewPteSectionalAttempt = typeof pteSectionalAttempts.$inferInsert;
