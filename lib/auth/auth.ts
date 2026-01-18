import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    }
  }),

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true, // Auto sign in after sign up
  },

  // Base URL configuration
  baseURL: process.env.BETTER_AUTH_URL || "https://www.pedagogistspte.com",
  secret: process.env.BETTER_AUTH_SECRET,

  // Trusted origins
  trustedOrigins: [
    "https://www.pedagogistspte.com",
    "https://pedagogistspte.com",
    "https://pedagogistspte-v-0-2-git-main-hellowhq67s-projects.vercel.app",
    ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
  ],

  // Session configuration with cookie caching
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache for 5 minutes
    },
  },

  // Social providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // Account configuration
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  // Advanced configuration for token storage
  advanced: {
    cookiePrefix: "pte_auth",
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  // Database hooks for user profile creation
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Ensure default values for new users
          return {
            data: {
              ...user,
              role: user.role || "user",
              subscriptionTier: "free",
              subscriptionStatus: "active",
              monthlyPracticeLimit: 10,
              practiceQuestionsThisMonth: 0,
              dailyAiCredits: 10,
              aiCreditsUsed: 0,
              dailyPracticeLimit: 3,
              practiceQuestionsUsed: 0,
            },
          };
        },
        after: async (user) => {
          // Log user creation for debugging
          console.log(`[Auth] New user created: ${user.id} (${user.email})`);
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          console.log(`[Auth] New session created for user: ${session.userId}`);
        },
      },
    },
  },

  plugins: [nextCookies()]
});

// Export auth types
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
