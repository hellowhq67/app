import { relations, sql } from 'drizzle-orm';
import {
    boolean,
    index,
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { pteAttempts } from './pte-attempts';

export const pteSessions = pgTable('pte_sessions', {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    // Session Progress
    currentSection: text('current_section').default('speaking_writing'),
    currentQuestion: integer('current_question').default(0),
    responses: jsonb('responses').$type<any[]>(), // Storing simplified response list if needed

    // Timing
    timeRemaining: jsonb('time_remaining').$type<{
        speaking_writing: number;
        reading: number;
        listening: number;
    }>(),

    // Status
    isCompleted: boolean('is_completed').default(false),

    // System Check Status
    systemCheck: jsonb('system_check').$type<{
        microphone: boolean;
        speakers: boolean;
        camera: boolean;
        browserCompatible: boolean;
        networkStable: boolean;
    }>(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

export const pteResponses = pgTable('pte_responses', {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    sessionId: uuid('session_id').notNull().references(() => pteSessions.id, { onDelete: 'cascade' }),
    questionId: text('question_id').notNull(), // Might handle UUID or string ID
    questionType: text('question_type').notNull(),

    answer: jsonb('answer'), // Flexible answer storage
    timeSpent: integer('time_spent'),

    // AI Scoring
    aiScore: integer('ai_score'),
    aiFeedback: jsonb('ai_feedback'),

    timestamp: timestamp('timestamp').defaultNow(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const pteAudioFiles = pgTable('pte_audio_files', {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    sessionId: text('session_id').notNull(), // text or uuid depending on referenced table type flexibility, better match UUID if possible but keeping text for safety if mixed use
    questionId: text('question_id').notNull(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    filePath: text('file_path').notNull(),
    fileName: text('file_name').notNull(),
    fileSize: integer('file_size'),
    duration: integer('duration'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
});


export const pteScores = pgTable('pte_scores', {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    sessionId: uuid('session_id').notNull().references(() => pteSessions.id, { onDelete: 'cascade' }),

    overallScore: integer('overall_score'),
    speakingScore: integer('speaking_score'),
    writingScore: integer('writing_score'),
    readingScore: integer('reading_score'),
    listeningScore: integer('listening_score'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type exports
export type PteSession = typeof pteSessions.$inferSelect
export type NewPteSession = typeof pteSessions.$inferInsert

// Legacy exports for compatibility
export const pteTests = pteSessions
export const testAttempts = pteAttempts

// Relations
export const pteSessionsRelations = relations(pteSessions, ({ one, many }) => ({
    user: one(users, {
        fields: [pteSessions.userId],
        references: [users.id],
    }),
    responses: many(pteResponses),
    scores: one(pteScores, {
        fields: [pteSessions.id],
        references: [pteScores.sessionId]
    })
}));

export const pteResponsesRelations = relations(pteResponses, ({ one }) => ({
    session: one(pteSessions, {
        fields: [pteResponses.sessionId],
        references: [pteSessions.id],
    }),
}));

export const pteScoresRelations = relations(pteScores, ({ one }) => ({
    session: one(pteSessions, {
        fields: [pteScores.sessionId],
        references: [pteSessions.id],
    }),
}));
