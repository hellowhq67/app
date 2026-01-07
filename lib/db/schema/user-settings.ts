import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// User Preferences table
export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),

  // Notification preferences
  emailNotifications: boolean("email_notifications").notNull().default(true),
  practiceReminders: boolean("practice_reminders").notNull().default(true),
  testResults: boolean("test_results").notNull().default(true),
  marketingEmails: boolean("marketing_emails").notNull().default(false),

  // Theme preference
  theme: text("theme").notNull().default("dark"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Device Sessions table for tracking active devices
export const deviceSessions = pgTable("device_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),

  // Device info
  device: text("device").notNull(), // e.g., "Chrome on Windows"
  location: text("location").notNull().default("Unknown Location"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),

  // Session state
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports
export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
export type DeviceSession = typeof deviceSessions.$inferSelect;
export type NewDeviceSession = typeof deviceSessions.$inferInsert;
