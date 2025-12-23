import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from './users';

// Forums table
export const forums = pgTable('forums', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'),
  isActive: boolean('is_active').default(true),
  orderIndex: integer('order_index').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Posts table
export const posts = pgTable('posts', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  forumId: uuid('forum_id')
    .notNull()
    .references(() => forums.id, { onDelete: 'cascade' }),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  isPinned: boolean('is_pinned').default(false),
  viewCount: integer('view_count').default(0),
  likeCount: integer('like_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Comments table
export const comments = pgTable('comments', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  likeCount: integer('like_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const forumsRelations = relations(forums, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  forum: one(forums, {
    fields: [posts.forumId],
    references: [forums.id],
  }),
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

// Type exports
export type Forum = typeof forums.$inferSelect
export type NewForum = typeof forums.$inferInsert
export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert