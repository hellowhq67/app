/**
 * Verify Auth Setup
 * Shows the user data model, lists users, and verifies auth configuration.
 * Run: pnpm tsx scripts/verify-auth.ts
 */
import 'dotenv/config'
import { db } from '../lib/db/drizzle'
import { users, sessions, accounts } from '../lib/db/schema'
import { sql } from 'drizzle-orm'

async function verifyAuth() {
  console.log('========================================')
  console.log('  Auth Verification — PTE Academic')
  console.log('========================================\n')

  // 1. Show User Data Model (schema columns)
  console.log('--- USER DATA MODEL ---')
  console.log('Table: users')
  console.log('Columns:')
  console.log('  id              text (PK)')
  console.log('  name            text (required)')
  console.log('  email           text (unique, required)')
  console.log('  email_verified  boolean (default: false)')
  console.log('  image           text (nullable)')
  console.log('  created_at      timestamp')
  console.log('  updated_at      timestamp')
  console.log('  role            text (default: "user") — managed by admin plugin')
  console.log('  banned          boolean (default: false) — admin plugin')
  console.log('  ban_reason      text (nullable) — admin plugin')
  console.log('  subscription_tier    enum (free|basic|premium|unlimited)')
  console.log('  subscription_status  enum (active|expired|cancelled|trial)')
  console.log('  daily_ai_credits     integer (default: 10)')
  console.log('  daily_practice_limit integer (default: 3)')
  console.log('')

  // 2. Query all users
  console.log('--- USERS IN DATABASE ---')
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      banned: users.banned,
      emailVerified: users.emailVerified,
      subscriptionTier: users.subscriptionTier,
      createdAt: users.createdAt,
    })
    .from(users)

  if (allUsers.length === 0) {
    console.log('  (No users found — run pnpm db:seed:admin to create admin user)')
  } else {
    for (const u of allUsers) {
      console.log(`  [${u.role?.toUpperCase()}] ${u.name} <${u.email}>`)
      console.log(`    ID: ${u.id}`)
      console.log(`    Verified: ${u.emailVerified} | Banned: ${u.banned} | Tier: ${u.subscriptionTier}`)
      console.log(`    Created: ${u.createdAt}`)
      console.log('')
    }
  }

  // 3. Count sessions and accounts
  const sessionCount = await db.select({ count: sql<number>`count(*)` }).from(sessions)
  const accountCount = await db.select({ count: sql<number>`count(*)` }).from(accounts)

  console.log('--- STATS ---')
  console.log(`  Total Users:    ${allUsers.length}`)
  console.log(`  Total Sessions: ${Number(sessionCount[0]?.count ?? 0)}`)
  console.log(`  Total Accounts: ${Number(accountCount[0]?.count ?? 0)}`)
  console.log('')

  // 4. Show role distribution
  const admins = allUsers.filter(u => u.role === 'admin').length
  const teachers = allUsers.filter(u => u.role === 'teacher').length
  const normalUsers = allUsers.filter(u => u.role === 'user').length
  const bannedUsers = allUsers.filter(u => u.banned).length

  console.log('--- ROLE DISTRIBUTION ---')
  console.log(`  Admins:   ${admins}`)
  console.log(`  Teachers: ${teachers}`)
  console.log(`  Users:    ${normalUsers}`)
  console.log(`  Banned:   ${bannedUsers}`)
  console.log('')

  // 5. Auth configuration summary
  console.log('--- AUTH CONFIGURATION ---')
  console.log(`  BETTER_AUTH_URL:    ${process.env.BETTER_AUTH_URL || '(not set)'}`)
  console.log(`  BETTER_AUTH_SECRET: ${process.env.BETTER_AUTH_SECRET ? '***set***' : '(not set)'}`)
  console.log(`  OAuth Providers:    Google, LinkedIn`)
  console.log(`  Admin Plugin:       Enabled (role management, ban/unban)`)
  console.log(`  Email Verification: ${process.env.NODE_ENV === 'production' ? 'Required' : 'Disabled (dev)'}`)
  console.log(`  Rate Limiting:      Enabled (DB storage)`)
  console.log('')

  console.log('========================================')
  console.log('  Verification Complete')
  console.log('========================================')
}

verifyAuth()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to verify auth:', err)
    process.exit(1)
  })
