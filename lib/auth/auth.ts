import 'server-only'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { db } from '@/lib/db/drizzle'
import { users, sessions, accounts, verifications } from '@/lib/db/schema'
import { admin } from "better-auth/plugins"
import { resend } from "../email/resend"
import React from 'react'

export const auth = betterAuth({
  appName: "Pedagogist's PTE",
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      users,
      sessions,
      accounts,
      verifications,
    },
    usePlural: true,
  }),
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      const { ResetPasswordEmail } = await import("../email/templates/reset-password")
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "PTE Learning <onboarding@resend.dev>",
        to: user.email,
        subject: "Reset your password",
        react: React.createElement(ResetPasswordEmail, {
          username: user.name || user.email,
          resetLink: url,
        }),
      })

      if (error) {
        console.error("Error sending reset password email:", error)
      } else {
        console.log("Reset password email sent:", data?.id)
      }
    },
  },
  
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  
  rateLimit: {
    enabled: true,
    storage: 'secondary-storage',
    window: 60,
    max: 100,
  },
  
  secondaryStorage: {
    get: async (key) => {
      const { getCached } = await import('@/lib/redis')
      return await getCached(key)
    },
    set: async (key, value, ttl) => {
      const { setCached } = await import('@/lib/redis')
      await setCached(key, value, ttl || 60)
    },
    delete: async (key) => {
      const { delCached } = await import('@/lib/redis')
      await delCached(key)
    },
  },
  
  advanced: {
    overrideUserInfoOnSignIn: true,
    useSecureCookies: process.env.NODE_ENV === 'production',
    cookiePrefix: 'better-auth',
  },
  
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    },
  },
  
  trustedOrigins: [
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
  ],
  
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET,
  
  plugins: [
    nextCookies(),
    admin(),
  ],
  
  experimental: {
    joins: true,
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
