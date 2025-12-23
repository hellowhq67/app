/**
 * Better Auth Secret Generator
 * 
 * This utility provides secure secret generation for Better Auth configuration.
 * Use this to generate strong, cryptographically secure secrets for production.
 */

import crypto from 'crypto'

/**
 * Generate a cryptographically secure random string for use as auth secret
 * @param length Length of the secret (default: 32)
 * @returns Base64 encoded secure random string
 */
export function generateSecureSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64')
}

/**
 * Generate a hex-encoded secure random string
 * @param length Length of the secret in bytes (default: 32)
 * @returns Hex encoded secure random string
 */
export function generateHexSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Validate if a secret is properly formatted and secure
 * @param secret The secret to validate
 * @returns Object with validation result and suggestions
 */
export function validateSecret(secret: string): {
  isValid: boolean
  isSecure: boolean
  suggestions: string[]
  issues: string[]
} {
  const issues: string[] = []
  const suggestions: string[] = []
  
  if (!secret || secret.trim().length === 0) {
    issues.push('Secret is empty')
    suggestions.push('Generate a new secure secret')
    return { isValid: false, isSecure: false, suggestions, issues }
  }
  
  if (secret.length < 16) {
    issues.push('Secret is too short (minimum 16 characters recommended)')
    suggestions.push('Use at least 32 characters for better security')
  }
  
  if (secret.length < 32) {
    suggestions.push('Consider using 32+ characters for production')
  }
  
  // Check if secret contains common weak patterns
  if (secret.includes('secret') || secret.includes('key') || secret.includes('password')) {
    issues.push('Secret contains common weak patterns')
    suggestions.push('Use a random, unpredictable secret')
  }
  
  // Check for repeated characters (weak pattern)
  const charCounts = new Map<string, number>()
  for (const char of secret) {
    charCounts.set(char, (charCounts.get(char) || 0) + 1)
  }
  
  const maxRepeats = Math.max(...Array.from(charCounts.values()))
  if (maxRepeats > secret.length * 0.3) {
    issues.push('Secret has too many repeated characters')
    suggestions.push('Use a more random secret')
  }
  
  return {
    isValid: secret.length >= 16,
    isSecure: secret.length >= 32 && maxRepeats < secret.length * 0.3,
    suggestions,
    issues
  }
}

/**
 * Command line interface for generating secrets
 */
if (require.main === module) {
  const args = process.argv.slice(2)
  const format = args[0] || 'base64'
  const length = parseInt(args[1] || '32')
  
  let secret: string
  
  switch (format.toLowerCase()) {
    case 'hex':
      secret = generateHexSecret(length)
      break
    case 'base64':
    default:
      secret = generateSecureSecret(length)
      break
  }
  
  console.log(`Generated ${format} secret (${length} bytes):`)
  console.log(secret)
  
  const validation = validateSecret(secret)
  console.log('\nValidation:')
  console.log(`Valid: ${validation.isValid}`)
  console.log(`Secure: ${validation.isSecure}`)
  
  if (validation.issues.length > 0) {
    console.log('\nIssues:')
    validation.issues.forEach(issue => console.log(`- ${issue}`))
  }
  
  if (validation.suggestions.length > 0) {
    console.log('\nSuggestions:')
    validation.suggestions.forEach(suggestion => console.log(`- ${suggestion}`))
  }
  
  console.log('\nUsage in .env.local:')
  console.log(`BETTER_AUTH_SECRET=${secret}`)
}