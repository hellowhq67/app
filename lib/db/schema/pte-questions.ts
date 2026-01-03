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
import { difficultyEnum } from './users';
import { pteQuestionTypes } from './pte-categories';

// Main PTE Questions Table (Base table for all question types)
export const pteQuestions = pgTable(
    'pte_questions',
    {
        id: uuid('id')
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        questionTypeId: uuid('question_type_id')
            .notNull()
            .references(() => pteQuestionTypes.id, { onDelete: 'cascade' }),

        // Question content
        title: text('title').notNull(),
        content: text('content'), // Main text content (passage, prompt, etc.)
        audioUrl: text('audio_url'), // Vercel Blob URL for audio
        imageUrl: text('image_url'), // Vercel Blob URL for image

        // Difficulty and metadata
        difficulty: difficultyEnum('difficulty').notNull().default('Medium'),
        tags: jsonb('tags').$type<string[]>(),

        // Answer and scoring
        correctAnswer: jsonb('correct_answer').$type<{
            text?: string;
            options?: string[];
            order?: number[];
            blanks?: { [key: string]: string };
            [key: string]: any;
        }>(),
        sampleAnswer: text('sample_answer'), // For AI scoring reference
        scoringRubric: jsonb('scoring_rubric').$type<{
            pronunciation?: string;
            fluency?: string;
            content?: string;
            grammar?: string;
            vocabulary?: string;
            [key: string]: any;
        }>(),

        // Admin and status
        isActive: boolean('is_active').default(true).notNull(),
        isPremium: boolean('is_premium').default(false).notNull(),
        usageCount: integer('usage_count').default(0).notNull(),
        averageScore: integer('average_score'),

        // Metadata
        metadata: jsonb('metadata').$type<{
            source?: string;
            author?: string;
            lastReviewed?: string;
            [key: string]: any;
        }>(),

        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => ({
        questionTypeIdIdx: index('idx_pte_questions_question_type_id').on(
            table.questionTypeId
        ),
        difficultyIdx: index('idx_pte_questions_difficulty').on(table.difficulty),
        isActiveIdx: index('idx_pte_questions_is_active').on(table.isActive),
        isPremiumIdx: index('idx_pte_questions_is_premium').on(table.isPremium),
    })
);

// Speaking Questions Extended Table
export const pteSpeakingQuestions = pgTable('pte_speaking_questions', {
    id: uuid('id')
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    questionId: uuid('question_id')
        .notNull()
        .references(() => pteQuestions.id, { onDelete: 'cascade' })
        .unique(),

    // Speaking-specific fields
    audioPromptUrl: text('audio_prompt_url'), // For Repeat Sentence, Retell Lecture
    expectedDuration: integer('expected_duration'), // Expected response time in seconds
    sampleTranscript: text('sample_transcript'), // Sample answer transcript
    keyPoints: jsonb('key_points').$type<string[]>(), // For Retell Lecture

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

// Writing Questions Extended Table
export const pteWritingQuestions = pgTable('pte_writing_questions', {
    id: uuid('id')
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    questionId: uuid('question_id')
        .notNull()
        .references(() => pteQuestions.id, { onDelete: 'cascade' })
        .unique(),

    // Writing-specific fields
    promptText: text('prompt_text').notNull(),
    passageText: text('passage_text'), // For Summarize Written Text
    wordCountMin: integer('word_count_min').notNull(),
    wordCountMax: integer('word_count_max').notNull(),
    essayType: text('essay_type'), // 'argumentative', 'descriptive', 'narrative', etc.
    keyThemes: jsonb('key_themes').$type<string[]>(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

// Reading Questions Extended Table
export const pteReadingQuestions = pgTable('pte_reading_questions', {
    id: uuid('id')
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    questionId: uuid('question_id')
        .notNull()
        .references(() => pteQuestions.id, { onDelete: 'cascade' })
        .unique(),

    // Reading-specific fields
    passageText: text('passage_text').notNull(),
    questionText: text('question_text'),
    options: jsonb('options').$type<{
        choices?: string[];
        blanks?: { position: number; options: string[] }[];
        paragraphs?: string[];
        [key: string]: any;
    }>(),
    correctAnswerPositions: jsonb('correct_answer_positions').$type<number[]>(),
    explanation: text('explanation'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

// Listening Questions Extended Table
export const pteListeningQuestions = pgTable('pte_listening_questions', {
    id: uuid('id')
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    questionId: uuid('question_id')
        .notNull()
        .references(() => pteQuestions.id, { onDelete: 'cascade' })
        .unique(),

    // Listening-specific fields
    audioFileUrl: text('audio_file_url').notNull(), // Vercel Blob URL
    audioDuration: integer('audio_duration'), // in seconds
    transcript: text('transcript'), // For admin reference
    questionText: text('question_text'),
    options: jsonb('options').$type<{
        choices?: string[];
        blanks?: { position: number; answer: string }[];
        summaries?: string[];
        [key: string]: any;
    }>(),
    correctAnswerPositions: jsonb('correct_answer_positions').$type<number[]>(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

// Relations
export const pteQuestionsRelations = relations(pteQuestions, ({ one }) => ({
  questionType: one(pteQuestionTypes, {
    fields: [pteQuestions.questionTypeId],
    references: [pteQuestionTypes.id],
  }),
}));

// ============================================================
// TYPE EXPORTS
// ============================================================
export type PteQuestion = typeof pteQuestions.$inferSelect;
export type NewPteQuestion = typeof pteQuestions.$inferInsert;

// Listening question types
export type ListeningTestType =
  | 'highlight-correct-summary'
  | 'mc-single-listening'
  | 'mc-multiple-listening'
  | 'fill-blanks-listening'
  | 'highlight-incorrect-words'
  | 'write-from-dictation'
  | 'select-missing-word'
  | 'summarize-spoken-text';

// Speaking question types
export type SpeakingTestType =
  | 'read-aloud'
  | 'repeat-sentence'
  | 'describe-image'
  | 'retell-lecture'
  | 'answer-short-question'
  | 'summarize-spoken-text-speaking'
  | 'read-and-retell'
  | 'summarize-group-discussion'
  | 'respond-to-situation';

// Writing question types
export type WritingTestType =
  | 'summarize-written-text'
  | 'write-essay'
  | 'summarize-written-text-core'
  | 'write-email';

// Reading question types
export type ReadingTestType =
  | 'reading-fill-blanks-dropdown'
  | 'reading-mc-multiple'
  | 'reorder-paragraphs'
  | 'reading-fill-blanks-drag'
  | 'reading-mc-single';

export { pteQuestionTypeCodeEnum };
