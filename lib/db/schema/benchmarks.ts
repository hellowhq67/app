import { pgTable, text, integer, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";

export const benchmarks = pgTable("pte_benchmarks", {
    id: text("id").primaryKey(), // Using text ID from benchmarks (e.g., 'benchmark-ra-001')
    questionType: text("question_type").notNull(),
    responseText: text("response_text").notNull(),
    overallScore: integer("overall_score").notNull(),

    // Detailed feature scores
    fluencyScore: integer("fluency_score"),
    pronunciationScore: integer("pronunciation_score"),
    contentScore: integer("content_score"),
    vocabularyScore: integer("vocabulary_score"),
    grammarScore: integer("grammar_score"),

    // Storing the original full features object just in case
    features: jsonb("features").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
