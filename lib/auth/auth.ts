import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sendPasswordResetEmail, sendVerificationEmail } from "./email";

export const auth = betterAuth({
  appName: "PTE Academic",
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.NODE_ENV === 'production',
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendPasswordResetEmail(user.email, url, user.name);
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        throw new Error('Failed to send password reset email');
      }
    },
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendVerificationEmail(user.email, url, user.name);
      } catch (error) {
        console.error('Failed to send verification email:', error);
        throw new Error('Failed to send verification email');
      }
    },
    sendOnSignUp: process.env.NODE_ENV === 'production',
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24, // 24 hours
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh daily
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
      strategy: "compact",
    },
    storeSessionInDatabase: true,
  },

  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ newEmail, url }) => {
        await sendVerificationEmail(newEmail, url);
      },
    },
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      subscriptionTier: {
        type: "string",
        required: false,
        defaultValue: "free",
      },
      subscriptionStatus: {
        type: "string",
        required: false,
        defaultValue: "active",
      },
      dailyAiCredits: {
        type: "number",
        required: false,
        defaultValue: 10,
      },
      aiCreditsUsed: {
        type: "number",
        required: false,
        defaultValue: 0,
      },
      dailyPracticeLimit: {
        type: "number",
        required: false,
        defaultValue: 3,
      },
      practiceQuestionsUsed: {
        type: "number",
        required: false,
        defaultValue: 0,
      },
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "linkedin"],
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    },
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
    },
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
    storage: "memory",
    customRules: {
      "/sign-in": {
        window: 60,
        max: 5,
      },
      "/sign-up": {
        window: 60,
        max: 3,
      },
      "/forgot-password": {
        window: 60,
        max: 3,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              subscriptionTier: user.subscriptionTier || 'free',
              subscriptionStatus: user.subscriptionStatus || 'active',
              dailyAiCredits: user.dailyAiCredits ?? 10,
              aiCreditsUsed: user.aiCreditsUsed ?? 0,
              dailyPracticeLimit: user.dailyPracticeLimit ?? 3,
              practiceQuestionsUsed: user.practiceQuestionsUsed ?? 0,
              practiceQuestionsThisMonth: user.practiceQuestionsThisMonth ?? 0,
              monthlyPracticeLimit: user.monthlyPracticeLimit ?? 10,
            },
          };
        },
        after: async (user) => {
          if (user.email && process.env.NODE_ENV === 'production') {
            console.log(`User created: ${user.email}`);
          }
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          if (process.env.NODE_ENV === 'production') {
            console.log(`New session: ${session.userId} from ${session.ipAddress || 'unknown'}`);
          }
        },
      },
    },
  },

  plugins: [
    nextCookies(),
    admin({
      defaultRole: "user",
    }),
  ],
});

export type Auth = typeof auth;
