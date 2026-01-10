#!/usr/bin/env tsx
/**
 * Pre-deployment checklist script
 * Validates environment and configuration before deploying to Vercel
 */

import { config } from 'dotenv'

config()

interface CheckResult {
  name: string
  passed: boolean
  message: string
  critical: boolean
}

const results: CheckResult[] = []

function check(
  name: string,
  condition: boolean,
  message: string,
  critical = true,
): void {
  results.push({ name, passed: condition, message, critical })
}

// Environment Variables Checks
console.log('🔍 Checking Environment Variables...\n')

check(
  'Database URL',
  !!process.env.DATABASE_URL,
  'DATABASE_URL is required for database connection',
)

check(
  'Auth Secret',
  !!process.env.BETTER_AUTH_SECRET,
  'BETTER_AUTH_SECRET is required for authentication',
)

check(
  'Google OAuth',
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
  'Google OAuth credentials are required for login',
)

check(
  'Gemini API',
  !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  'GOOGLE_GENERATIVE_AI_API_KEY is required for AI scoring',
)

check(
  'AssemblyAI API',
  !!process.env.ASSEMBLYAI_API_KEY,
  'ASSEMBLYAI_API_KEY is required for speech transcription',
)

check(
  'Sanity Project ID',
  !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'NEXT_PUBLIC_SANITY_PROJECT_ID is required for CMS',
)

check(
  'Sanity Dataset',
  !!process.env.NEXT_PUBLIC_SANITY_DATASET,
  'NEXT_PUBLIC_SANITY_DATASET is required for CMS',
)

check(
  'Blob Storage',
  !!process.env.BLOB_READ_WRITE_TOKEN,
  'BLOB_READ_WRITE_TOKEN recommended for file uploads',
  false,
)

check(
  'Redis/Upstash',
  !!process.env.UPSTASH_REDIS_REST_URL,
  'UPSTASH_REDIS_REST_URL recommended for rate limiting',
  false,
)

// Configuration Checks
console.log('\n📋 Checking Configuration Files...\n')

const fs = await import('fs')
const path = await import('path')

check(
  'package.json',
  fs.existsSync('package.json'),
  'package.json must exist',
)

check(
  'vercel.json',
  fs.existsSync('vercel.json'),
  'vercel.json configuration found',
  false,
)

check(
  'next.config.ts',
  fs.existsSync('next.config.ts') || fs.existsSync('next.config.js'),
  'Next.js configuration found',
)

check(
  'sanity.config.ts',
  fs.existsSync('sanity.config.ts'),
  'Sanity configuration found',
)

// Build Check
console.log('\n🔨 Checking Build Configuration...\n')

try {
  const packageJson = JSON.parse(
    fs.readFileSync('package.json', 'utf-8'),
  )

  check(
    'Build Script',
    !!packageJson.scripts?.build,
    'Build script is configured',
  )

  check(
    'Deploy Scripts',
    !!packageJson.scripts?.['deploy:vercel'],
    'Vercel deployment script is configured',
  )

  check(
    'Sanity Deploy',
    !!packageJson.scripts?.['sanity:schema:deploy'],
    'Sanity schema deployment script is configured',
  )
} catch {
  check('package.json Parse', false, 'Failed to parse package.json')
}

// Results Summary
console.log('\n' + '='.repeat(60))
console.log('📊 DEPLOYMENT CHECKLIST RESULTS')
console.log('='.repeat(60) + '\n')

const critical = results.filter((r) => r.critical)
const optional = results.filter((r) => !r.critical)

const criticalPassed = critical.filter((r) => r.passed).length
const optionalPassed = optional.filter((r) => r.passed).length

console.log(`Critical Checks: ${criticalPassed}/${critical.length} passed`)
console.log(`Optional Checks: ${optionalPassed}/${optional.length} passed\n`)

// Display failed checks
const failed = results.filter((r) => !r.passed)
if (failed.length > 0) {
  console.log('❌ FAILED CHECKS:\n')
  failed.forEach((r) => {
    const icon = r.critical ? '🔴' : '🟡'
    console.log(`${icon} ${r.name}`)
    console.log(`   ${r.message}\n`)
  })
}

// Display passed checks
const passed = results.filter((r) => r.passed)
if (passed.length > 0) {
  console.log('✅ PASSED CHECKS:\n')
  passed.forEach((r) => {
    console.log(`✓ ${r.name}`)
  })
}

console.log('\n' + '='.repeat(60))

// Exit code
const criticalFailed = critical.filter((r) => !r.passed).length
if (criticalFailed > 0) {
  console.log('\n❌ DEPLOYMENT BLOCKED: Fix critical issues before deploying\n')
  process.exit(1)
} else {
  console.log('\n✅ READY TO DEPLOY: All critical checks passed!\n')

  if (optional.filter((r) => !r.passed).length > 0) {
    console.log('⚠️  Some optional checks failed. Review before deploying.\n')
  }

  console.log('Next steps:')
  console.log('  1. pnpm sanity:schema:deploy')
  console.log('  2. pnpm build')
  console.log('  3. pnpm deploy:vercel\n')

  process.exit(0)
}
