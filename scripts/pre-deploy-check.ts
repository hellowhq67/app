#!/usr/bin/env tsx

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const checks = [
  {
    name: 'Environment variables',
    check: () => {
      const required = ['DATABASE_URL', 'NEXTAUTH_SECRET']
      const missing = required.filter(env => !process.env[env])
      return missing.length === 0 ? { success: true } : { success: false, error: `Missing env vars: ${missing.join(', ')}` }
    }
  },
  {
    name: 'Database schema',
    check: () => {
      const schemaPath = join(process.cwd(), 'lib/db/schema/index.ts')
      return existsSync(schemaPath) ? { success: true } : { success: false, error: 'Database schema not found' }
    }
  },
  {
    name: 'Build files',
    check: () => {
      const packageJsonPath = join(process.cwd(), 'package.json')
      return existsSync(packageJsonPath) ? { success: true } : { success: false, error: 'package.json not found' }
    }
  }
]

console.log('🚀 Running pre-deployment checks...\n')

let allPassed = true

for (const check of checks) {
  try {
    const result = check.check()
    if (result.success) {
      console.log(`✅ ${check.name}`)
    } else {
      console.log(`❌ ${check.name}: ${result.error}`)
      allPassed = false
    }
  } catch (error) {
    console.log(`❌ ${check.name}: ${error}`)
    allPassed = false
  }
}

console.log('\n' + '='.repeat(50))

if (allPassed) {
  console.log('🎉 All checks passed! Ready for deployment.')
  process.exit(0)
} else {
  console.log('💥 Some checks failed. Please fix the issues above.')
  process.exit(1)
}
