import { describe, it, expect, vi } from 'vitest'

// Mock DB so module-level drizzle init doesn't throw without DATABASE_URL
vi.mock('../../lib/db/drizzle', () => ({ db: {} }))
vi.mock('../../lib/db/schema/billing', () => ({
  creditPurchases: {},
  transactions: {},
}))
vi.mock('../../lib/db/schema/users', () => ({ users: {} }))
vi.mock('../../lib/db/queries/billing', () => ({}))

import { calculateCreditsForAmount, CREDIT_PACKAGES } from '../../lib/billing/credits'

describe('calculateCreditsForAmount', () => {
  it('returns 1:1 for amounts below $25', () => {
    expect(calculateCreditsForAmount(10)).toBe(10)
    expect(calculateCreditsForAmount(1)).toBe(1)
    expect(calculateCreditsForAmount(24)).toBe(24)
  })

  it('applies 10% bonus for amounts $25 to $49', () => {
    expect(calculateCreditsForAmount(25)).toBeCloseTo(27.5)
    expect(calculateCreditsForAmount(30)).toBeCloseTo(33)
    expect(calculateCreditsForAmount(49)).toBeCloseTo(53.9)
  })

  it('applies 20% bonus for amounts $50 to $99', () => {
    expect(calculateCreditsForAmount(50)).toBe(60)
    expect(calculateCreditsForAmount(75)).toBe(90)
    expect(calculateCreditsForAmount(99)).toBeCloseTo(118.8)
  })

  it('applies 30% bonus for amounts $100 and above', () => {
    expect(calculateCreditsForAmount(100)).toBe(130)
    expect(calculateCreditsForAmount(200)).toBe(260)
    expect(calculateCreditsForAmount(500)).toBe(650)
  })

  it('boundary: exactly $25 gets 10% bonus', () => {
    expect(calculateCreditsForAmount(25)).toBeCloseTo(27.5)
  })

  it('boundary: exactly $50 gets 20% bonus', () => {
    expect(calculateCreditsForAmount(50)).toBe(60)
  })

  it('boundary: exactly $100 gets 30% bonus', () => {
    expect(calculateCreditsForAmount(100)).toBe(130)
  })

  it('returns 0 for 0 amount', () => {
    expect(calculateCreditsForAmount(0)).toBe(0)
  })
})

describe('CREDIT_PACKAGES', () => {
  it('small package gives 1:1 credits for $10', () => {
    expect(CREDIT_PACKAGES.small.amount).toBe(10)
    expect(CREDIT_PACKAGES.small.credits).toBe(10)
  })

  it('medium package gives ~10% bonus for $25', () => {
    const { amount, credits } = CREDIT_PACKAGES.medium
    expect(credits).toBeGreaterThan(amount)
    expect(credits / amount).toBeCloseTo(1.1, 1)
  })

  it('large package gives ~20% bonus for $50', () => {
    const { amount, credits } = CREDIT_PACKAGES.large
    expect(credits / amount).toBeCloseTo(1.2, 1)
  })

  it('xlarge package gives ~30% bonus for $100', () => {
    const { amount, credits } = CREDIT_PACKAGES.xlarge
    expect(credits / amount).toBeCloseTo(1.3, 1)
  })

  it('credit packages match calculateCreditsForAmount logic', () => {
    // Validate packages are consistent with the calculation function
    Object.values(CREDIT_PACKAGES).forEach(pkg => {
      const calculated = calculateCreditsForAmount(pkg.amount)
      expect(pkg.credits).toBeCloseTo(calculated, 5)
    })
  })

  it('each package has a non-empty label', () => {
    Object.values(CREDIT_PACKAGES).forEach(pkg => {
      expect(pkg.label).toBeTruthy()
      expect(typeof pkg.label).toBe('string')
    })
  })
})
