/**
 * Seed Admin User
 * Creates a default admin user in the database using better-auth's credential provider format.
 * Run: pnpm db:seed:admin
 */
import 'dotenv/config'
import { db } from '../lib/db/drizzle'
import { users, accounts } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import bcryptjs from 'bcryptjs'
import { nanoid } from 'nanoid'

const ADMIN_EMAIL = 'admin@pedagogistspte.com'
const ADMIN_PASSWORD = 'Admin@PTE2024!'
const ADMIN_NAME = 'Admin User'

async function seedAdmin() {
  console.log('🌱 Seeding admin user...')

  // Check if admin already exists
  const existing = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL))
  if (existing.length > 0) {
    console.log(`✅ Admin user already exists: ${ADMIN_EMAIL}`)
    console.log(`   Role: ${existing[0].role}, Tier: ${existing[0].subscriptionTier}`)
    return
  }

  const userId = nanoid()
  const accountId = nanoid()

  // Hash password (bcryptjs format used by better-auth credential provider)
  const passwordHash = await bcryptjs.hash(ADMIN_PASSWORD, 10)

  // Insert user
  await db.insert(users).values({
    id: userId,
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    emailVerified: true,
    role: 'admin',
    banned: false,
    subscriptionTier: 'unlimited',
    subscriptionStatus: 'active',
    dailyAiCredits: 999,
    dailyPracticeLimit: 999,
    monthlyPracticeLimit: 9999,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // Insert account (credential provider for email/password login)
  await db.insert(accounts).values({
    id: accountId,
    accountId: userId,
    providerId: 'credential',
    userId: userId,
    password: passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  console.log('✅ Admin user created successfully!')
  console.log(`   Email:    ${ADMIN_EMAIL}`)
  console.log(`   Password: ${ADMIN_PASSWORD}`)
  console.log(`   Role:     admin`)
  console.log(`   Tier:     unlimited`)
  console.log()
  console.log('⚠️  IMPORTANT: Change the password after first login!')
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Failed to seed admin:', err)
    process.exit(1)
  })
