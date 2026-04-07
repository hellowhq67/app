import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } from "./email";

export const auth = betterAuth({
  // Core configuration
  appName: "PTE Academic",
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "https://pedagogistsptev021.vercel.app/",

  // Database with Neon PostgreSQL
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  // Email & Password authentication
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

  // Email verification
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

  // Session management
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh daily
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
      strategy: "compact", // Most efficient
    },
    // Store sessions in database for better control
    storeSessionInDatabase: true,
  },

  // User configuration
  user: {
    // Enable additional features
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
      // Map custom fields from your users table
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

  // Account linking
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "linkedin"],
    },
  },

  // Social providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${process.env.BETTER_AUTH_URL || "https://www.pedagogistspte.com"}/api/auth/callback/google`,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      redirectURI: `${process.env.BETTER_AUTH_URL || "https://www.pedagogistspte.com"}/api/auth/callback/linkedin`,
    },
  },

  // Security & Advanced settings
  advanced: {
    // Use secure cookies in production
    useSecureCookies: process.env.NODE_ENV === 'production',

    // Cross-subdomain cookies for *.pedagogistspte.com
    crossSubDomainCookies: {
      enabled: false, // Enable if you have subdomains
    },

    // IP address detection (Vercel uses x-forwarded-for)
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
    },

    // CSRF protection enabled by default
    disableCSRFCheck: false,
  },

  // Rate limiting for security
  rateLimit: {
    enabled: true,
    window: 60, // 60 seconds
    max: 10, // 10 requests per window
    storage: "database", // Use Neon DB for rate limit storage
    customRules: {
      "/sign-in": {
        window: 60,
        max: 5, // More restrictive for login
      },
      "/sign-up": {
        window: 60,
        max: 3, // Most restrictive for registration
      },
      "/forgot-password": {
        window: 60,
        max: 3,
      },
    },
  },

  // CORS and trusted origins
  trustedOrigins: [
    "https://www.pedagogistspte.com",
    "https://pedagogistspte.com",
    "https://pedagogistspte-v-0-2.vercel.app",
    "https://pedagogistspte-v-0-2-git-main-hellowhq67s-projects.vercel.app",
    ...(process.env.NODE_ENV === "development"
      ? ["http://localhost:3000", "http://localhost:3001"]
      : []
    ),
  ],

  // Database hooks for user lifecycle
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Set defaults for new users
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
          // Log user creation for monitoring
          if (user.email && !user.emailVerified && process.env.NODE_ENV === 'production') {
            console.log(`User created: ${user.email}`);
          }
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          // Log session creation for security monitoring
          if (process.env.NODE_ENV === 'production') {
            console.log(`New session created for user: ${session.userId} from IP: ${session.ipAddress || 'unknown'}`);
          }
        },
      },
    },
  },

  // Plugins
  plugins: [
    nextCookies(),
    admin({
      defaultRole: "user",
    }),
  ],
});

// Type inference for client
export type Auth = typeof auth;
