import { users, sessions, accounts, verifications } from '@/lib/db/schema/users';

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;

export type DifficultyEnum = 'Easy' | 'Medium' | 'Hard';
export type SubscriptionTierEnum = 'free' | 'basic' | 'premium' | 'unlimited';
export type SubscriptionStatusEnum = 'active' | 'expired' | 'cancelled' | 'trial';
