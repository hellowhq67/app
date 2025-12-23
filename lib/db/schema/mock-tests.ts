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

// Mock Tests table - This can be part of the pteTests table structure
// We'll extend the existing pteTests with mock-specific fields if needed

// Mock Test Categories table
export const mockTestCategories = pgTable('mock_test_categories', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  icon: text('icon'),
  code: text('code').notNull(),
  scoring_type: text('scoring_type'),
  short_name: text('short_name'),
  first_question_id: integer('first_question_id'),
  color: text('color'),
  parent: integer('parent'),
  practice_count: integer('practice_count').default(0),
  question_count: integer('question_count').default(0),
  video_link: text('video_link'),
});

// Relations for mock tests
export const mockTestCategoriesRelations = relations(mockTestCategories, () => ({}));

// Type exports
export type MockTestCategory = typeof mockTestCategories.$inferSelect
export type NewMockTestCategory = typeof mockTestCategories.$inferInsert