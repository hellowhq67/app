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

// Enums for PTE Categories
export const pteCategoryEnum = pgEnum('pte_category', [
    'speaking',
    'writing',
    'reading',
    'listening',
]);

export const pteQuestionTypeCodeEnum = pgEnum('pte_question_type_code', [
    // Speaking (7 types)
    'read_aloud',
    'repeat_sentence',
    'describe_image',
    'retell_lecture',
    'answer_short_question',
    'respond_to_situation',
    'summarize_group_discussion',
    // Writing (2 types)
    'summarize_written_text',
    'essay',
    // Reading (5 types)
    'reading_fill_blanks_dropdown',
    'reading_mc_multiple',
    'reorder_paragraphs',
    'reading_fill_blanks_drag',
    'reading_mc_single',
    // Listening (8 types)
    'summarize_spoken_text',
    'listening_mc_multiple',
    'listening_fill_blanks',
    'highlight_correct_summary',
    'listening_mc_single',
    'select_missing_word',
    'highlight_incorrect_words',
    'write_from_dictation',
]);

// PTE Categories Table
export const pteCategories = pgTable('pte_categories', {
    id: uuid('id')
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    code: pteCategoryEnum('code').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    displayOrder: integer('display_order').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

// PTE Question Types Table
export const pteQuestionTypes = pgTable(
    'pte_question_types',
    {
        id: uuid('id')
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        code: pteQuestionTypeCodeEnum('code').notNull().unique(),
        name: text('name').notNull(),
        categoryId: uuid('category_id')
            .notNull()
            .references(() => pteCategories.id, { onDelete: 'cascade' }),
        description: text('description'),

        // Scoring information
        hasAiScoring: boolean('has_ai_scoring').default(false).notNull(),
        maxScore: integer('max_score').notNull(),
        scoringCriteria: jsonb('scoring_criteria').$type<{
            pronunciation?: { weight: number; maxScore: number };
            fluency?: { weight: number; maxScore: number };
            content?: { weight: number; maxScore: number };
            grammar?: { weight: number; maxScore: number };
            vocabulary?: { weight: number; maxScore: number };
            spelling?: { weight: number; maxScore: number };
            form?: { weight: number; maxScore: number };
            development?: { weight: number; maxScore: number };
            coherence?: { weight: number; maxScore: number };
            [key: string]: any;
        }>(),

        // Question format details
        timeLimit: integer('time_limit'), // in seconds
        preparationTime: integer('preparation_time'), // in seconds
        wordCountMin: integer('word_count_min'),
        wordCountMax: integer('word_count_max'),

        // Display and metadata
        displayOrder: integer('display_order').notNull(),
        instructions: text('instructions'),
        sampleQuestionUrl: text('sample_question_url'),
        isActive: boolean('is_active').default(true).notNull(),
        metadata: jsonb('metadata').$type<{
            difficulty?: string;
            tips?: string[];
            commonMistakes?: string[];
            [key: string]: any;
        }>(),

        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => ({
        categoryIdIdx: index('idx_pte_question_types_category_id').on(
            table.categoryId
        ),
        codeIdx: index('idx_pte_question_types_code').on(table.code),
        isActiveIdx: index('idx_pte_question_types_is_active').on(table.isActive),
    })
);

// Relations
export const pteCategoriesRelations = relations(pteCategories, ({ many }) => ({
    questionTypes: many(pteQuestionTypes),
}));

export const pteQuestionTypesRelations = relations(
    pteQuestionTypes,
    ({ one }) => ({
        category: one(pteCategories, {
            fields: [pteQuestionTypes.categoryId],
            references: [pteCategories.id],
        }),
    })
);

// Type exports
export type PteCategory = typeof pteCategories.$inferSelect;
export type NewPteCategory = typeof pteCategories.$inferInsert;
export type PteQuestionType = typeof pteQuestionTypes.$inferSelect;
export type NewPteQuestionType = typeof pteQuestionTypes.$inferInsert;
