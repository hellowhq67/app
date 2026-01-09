import { pgTable, text, timestamp, uuid, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * MOCK TEST TEMPLATES
 * Defines the structure of a full mock test (e.g., "PTE Academic - Set A")
 */
export const mockTests = pgTable("mock_tests", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(), // e.g., "PTE Academic Mock Test 1"
    description: text("description"),
    type: text("type").notNull(), // 'ACADEMIC' | 'CORE'

    // JSON array of question IDs in order. 
    // Structure: { section: 'SPEAKING', part: 1, questionId: string, timeLimit?: number }[]
    questions: jsonb("questions").notNull(),

    price: integer("price").default(0), // In cents, if we charge
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

/**
 * USER TEST ATTEMPTS
 * Tracks a user's session in a mock test.
 */
export const testAttempts = pgTable("test_attempts", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    mockTestId: uuid("mock_test_id").notNull().references(() => mockTests.id, { onDelete: 'cascade' }),

    status: text("status").notNull().default('in_progress'), // 'in_progress', 'completed', 'abandoned'
    currentQuestionIndex: integer("current_question_index").default(0),

    // JSON blob to store temporary state or answers if needed before final submission
    // Though individual answers should go to 'test_answers' (below) or existing 'practice_sessions' if reused.
    // We'll create a dedicated table for strict mock answers to separate from casual practice.
    answersState: jsonb("answers_state"),

    startedAt: timestamp("started_at").defaultNow(),
    completedAt: timestamp("completed_at"),

    // Scored results
    totalScore: integer("total_score"),
    communicativeSkills: jsonb("communicative_skills"), // { speaking: 90, ... }
});

/**
 * MOCK TEST ANSWERS
 * Stores specific answers for a mock attempt.
 */
export const testAnswers = pgTable("test_answers", {
    id: uuid("id").defaultRandom().primaryKey(),
    attemptId: uuid("attempt_id").notNull().references(() => testAttempts.id, { onDelete: 'cascade' }),
    questionId: text("question_id").notNull(), // ID reference to the question bank (which might be in another table or JSON)
    questionType: text("question_type").notNull(),

    answer: jsonb("answer").notNull(), // { text: "...", audioUrl: "..." }

    // AI Scoring Result for this specific item
    aiScore: jsonb("ai_score"),

    timeSpentMs: integer("time_spent_ms"),
    createdAt: timestamp("created_at").defaultNow(),
});
