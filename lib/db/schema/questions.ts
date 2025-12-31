import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { pteQuestions } from './pte-questions';

// Question Bookmarks table
export const questionBookmarks = pgTable('question_bookmarks', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id')
    .notNull()
    .references(() => pteQuestions.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_question_bookmarks_user_id').on(table.userId),
  questionIdIdx: index('idx_question_bookmarks_question_id').on(table.questionId),
  userQuestionIdx: index('idx_question_bookmarks_user_question').on(
    table.userId,
    table.questionId
  ),
}));

// Relations
export const questionBookmarksRelations = relations(questionBookmarks, ({ one }) => ({
  user: one(users, {
    fields: [questionBookmarks.userId],
    references: [users.id],
  }),
  question: one(pteQuestions, {
    fields: [questionBookmarks.questionId],
    references: [pteQuestions.id],
  }),
}));

// Type exports
export type QuestionBookmark = typeof questionBookmarks.$inferSelect;
export type NewQuestionBookmark = typeof questionBookmarks.$inferInsert;
