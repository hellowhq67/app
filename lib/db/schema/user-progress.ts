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

// User Progress table
export const userProgress = pgTable('user_progress', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  overallScore: integer('overall_score').default(0),
  speakingScore: integer('speaking_score').default(0),
  writingScore: integer('writing_score').default(0),
  readingScore: integer('reading_score').default(0),
  listeningScore: integer('listening_score').default(0),
  testsCompleted: integer('tests_completed').default(0),
  questionsAnswered: integer('questions_answered').default(0),
  studyStreak: integer('study_streak').default(0),
  totalStudyTime: integer('total_study_time').default(0), // in minutes
  lastActiveAt: timestamp('last_active_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User Profiles table
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  targetScore: integer('target_score'),
  examDate: timestamp('exam_date'),
  studyGoal: text('study_goal'),
  phoneNumber: text('phone_number'),
  country: text('country'),
  timezone: text('timezone'),
  // Practice test counts per section
  speakingPracticeCount: integer('speaking_practice_count').default(0),
  readingPracticeCount: integer('reading_practice_count').default(0),
  writingPracticeCount: integer('writing_practice_count').default(0),
  listeningPracticeCount: integer('listening_practice_count').default(0),
  mockTestCount: integer('mock_test_count').default(0),
  preferences: jsonb('preferences'), // JSON for user preferences
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User Scheduled Exam Dates table
export const userScheduledExamDates = pgTable(
  'user_scheduled_exam_dates',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    examDate: timestamp('exam_date').notNull(),
    examName: text('exam_name').default('PTE Academic').notNull(),
    isPrimary: boolean('is_primary').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_user_scheduled_exam_dates_user_id').on(table.userId),
    examDateIdx: index('idx_user_scheduled_exam_dates_exam_date').on(
      table.examDate
    ),
  })
);

// Relations
export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const userScheduledExamDatesRelations = relations(
  userScheduledExamDates,
  ({ one }) => ({
    user: one(users, {
      fields: [userScheduledExamDates.userId],
      references: [users.id],
    }),
  })
);

// Type exports
export type UserProgress = typeof userProgress.$inferSelect
export type NewUserProgress = typeof userProgress.$inferInsert
export type UserProfile = typeof userProfiles.$inferSelect
export type NewUserProfile = typeof userProfiles.$inferInsert
export type UserScheduledExamDate = typeof userScheduledExamDates.$inferSelect
export type NewUserScheduledExamDate = typeof userScheduledExamDates.$inferInsert