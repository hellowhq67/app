import { describe, it, expect } from 'vitest'
import {
  SubscriptionTier,
  TIER_CONFIGS,
  getTierConfig,
  canAccessMockTest,
  canPracticeQuestionType,
  getRemainingPracticeAttempts,
  hasAiCreditsAvailable,
  getRemainingAiCredits,
} from '../../lib/subscription/tiers'

// ─── getTierConfig ──────────────────────────────────────────────────────────

describe('getTierConfig', () => {
  it('returns FREE config for "free"', () => {
    const config = getTierConfig('free')
    expect(config).toBe(TIER_CONFIGS[SubscriptionTier.FREE])
  })

  it('returns PRO config for SubscriptionTier.PRO', () => {
    const config = getTierConfig(SubscriptionTier.PRO)
    expect(config.dailyAiCredits).toBe(-1)
  })

  it('returns PREMIUM config for SubscriptionTier.PREMIUM', () => {
    const config = getTierConfig(SubscriptionTier.PREMIUM)
    expect(config.aiScoringPriority).toBe('high')
  })

  it('falls back to FREE for unknown tier', () => {
    const config = getTierConfig('unknown_tier')
    expect(config).toEqual(TIER_CONFIGS[SubscriptionTier.FREE])
  })

  it('is case-insensitive', () => {
    const config = getTierConfig('PRO')
    expect(config.dailyAiCredits).toBe(-1)
  })
})

// ─── canAccessMockTest ──────────────────────────────────────────────────────

describe('canAccessMockTest', () => {
  it('free tier: can access test #1', () => {
    expect(canAccessMockTest(SubscriptionTier.FREE, 1)).toBe(true)
  })

  it('free tier: cannot access test #2', () => {
    expect(canAccessMockTest(SubscriptionTier.FREE, 2)).toBe(false)
  })

  it('pro tier: can access any test from 1 to 200', () => {
    expect(canAccessMockTest(SubscriptionTier.PRO, 1)).toBe(true)
    expect(canAccessMockTest(SubscriptionTier.PRO, 100)).toBe(true)
    expect(canAccessMockTest(SubscriptionTier.PRO, 200)).toBe(true)
  })

  it('pro tier: cannot access test beyond 200', () => {
    expect(canAccessMockTest(SubscriptionTier.PRO, 201)).toBe(false)
  })

  it('premium tier: can access all 200 tests', () => {
    expect(canAccessMockTest(SubscriptionTier.PREMIUM, 50)).toBe(true)
    expect(canAccessMockTest(SubscriptionTier.PREMIUM, 200)).toBe(true)
  })
})

// ─── canPracticeQuestionType ────────────────────────────────────────────────

describe('canPracticeQuestionType', () => {
  it('free tier: allows practice when below limit', () => {
    // free.speaking.read_aloud = 3
    expect(
      canPracticeQuestionType(SubscriptionTier.FREE, 'speaking', 'read_aloud', 0)
    ).toBe(true)
    expect(
      canPracticeQuestionType(SubscriptionTier.FREE, 'speaking', 'read_aloud', 2)
    ).toBe(true)
  })

  it('free tier: blocks practice when at limit', () => {
    // free.speaking.read_aloud = 3, so 3 attempts = blocked
    expect(
      canPracticeQuestionType(SubscriptionTier.FREE, 'speaking', 'read_aloud', 3)
    ).toBe(false)
  })

  it('pro tier: always allows practice (unlimited = -1)', () => {
    expect(
      canPracticeQuestionType(SubscriptionTier.PRO, 'speaking', 'read_aloud', 999)
    ).toBe(true)
    expect(
      canPracticeQuestionType(SubscriptionTier.PRO, 'writing', 'write_essay', 500)
    ).toBe(true)
  })

  it('premium tier: always allows practice', () => {
    expect(
      canPracticeQuestionType(SubscriptionTier.PREMIUM, 'listening', 'write_from_dictation', 1000)
    ).toBe(true)
  })

  it('returns true for undefined question type limits', () => {
    expect(
      canPracticeQuestionType(SubscriptionTier.FREE, 'speaking', 'nonexistent_type', 5)
    ).toBe(true)
  })
})

// ─── getRemainingPracticeAttempts ───────────────────────────────────────────

describe('getRemainingPracticeAttempts', () => {
  it('returns remaining count for free tier', () => {
    // free.speaking.read_aloud = 3, used 1 → 2 remaining
    const remaining = getRemainingPracticeAttempts(
      SubscriptionTier.FREE, 'speaking', 'read_aloud', 1
    )
    expect(remaining).toBe(2)
  })

  it('never returns negative', () => {
    // Used 10 but limit is 3
    const remaining = getRemainingPracticeAttempts(
      SubscriptionTier.FREE, 'speaking', 'read_aloud', 10
    )
    expect(remaining).toBe(0)
  })

  it('returns -1 (unlimited) for pro tier', () => {
    const remaining = getRemainingPracticeAttempts(
      SubscriptionTier.PRO, 'speaking', 'read_aloud', 5
    )
    expect(remaining).toBe(-1)
  })

  it('returns -1 for unknown question type', () => {
    const remaining = getRemainingPracticeAttempts(
      SubscriptionTier.FREE, 'speaking', 'unknown_type', 5
    )
    expect(remaining).toBe(-1)
  })
})

// ─── hasAiCreditsAvailable ──────────────────────────────────────────────────

describe('hasAiCreditsAvailable', () => {
  it('free tier: has credits when used < 10', () => {
    expect(hasAiCreditsAvailable(SubscriptionTier.FREE, 5)).toBe(true)
    expect(hasAiCreditsAvailable(SubscriptionTier.FREE, 0)).toBe(true)
    expect(hasAiCreditsAvailable(SubscriptionTier.FREE, 9)).toBe(true)
  })

  it('free tier: no credits when used >= 10', () => {
    expect(hasAiCreditsAvailable(SubscriptionTier.FREE, 10)).toBe(false)
    expect(hasAiCreditsAvailable(SubscriptionTier.FREE, 15)).toBe(false)
  })

  it('pro tier: always has credits (unlimited)', () => {
    expect(hasAiCreditsAvailable(SubscriptionTier.PRO, 999)).toBe(true)
  })

  it('premium tier: always has credits (unlimited)', () => {
    expect(hasAiCreditsAvailable(SubscriptionTier.PREMIUM, 999)).toBe(true)
  })
})

// ─── getRemainingAiCredits ──────────────────────────────────────────────────

describe('getRemainingAiCredits', () => {
  it('free tier: returns correct remaining credits', () => {
    expect(getRemainingAiCredits(SubscriptionTier.FREE, 3)).toBe(7)
    expect(getRemainingAiCredits(SubscriptionTier.FREE, 0)).toBe(10)
  })

  it('free tier: never returns below 0', () => {
    expect(getRemainingAiCredits(SubscriptionTier.FREE, 15)).toBe(0)
  })

  it('pro tier: returns -1 (unlimited)', () => {
    expect(getRemainingAiCredits(SubscriptionTier.PRO, 100)).toBe(-1)
  })

  it('premium tier: returns -1 (unlimited)', () => {
    expect(getRemainingAiCredits(SubscriptionTier.PREMIUM, 100)).toBe(-1)
  })
})

// ─── TIER_CONFIGS structural integrity ──────────────────────────────────────

describe('TIER_CONFIGS structural integrity', () => {
  it('all tiers have required fields', () => {
    Object.values(SubscriptionTier).forEach(tier => {
      const config = TIER_CONFIGS[tier]
      expect(config).toBeDefined()
      expect(typeof config.mockTestsAllowed).toBe('number')
      expect(Array.isArray(config.mockTestsAvailable)).toBe(true)
      expect(typeof config.dailyAiCredits).toBe('number')
      expect(['normal', 'high']).toContain(config.aiScoringPriority)
      expect(typeof config.features.testHistory).toBe('boolean')
      expect(typeof config.features.detailedAnalytics).toBe('boolean')
      expect(typeof config.features.downloadReports).toBe('boolean')
    })
  })

  it('premium has more features than free', () => {
    const free = TIER_CONFIGS[SubscriptionTier.FREE]
    const premium = TIER_CONFIGS[SubscriptionTier.PREMIUM]
    expect(premium.features.detailedAnalytics).toBe(true)
    expect(free.features.detailedAnalytics).toBe(false)
    expect(premium.features.studyPlan).toBe(true)
    expect(free.features.studyPlan).toBe(false)
  })

  it('pro and premium have unlimited mock tests (200)', () => {
    expect(TIER_CONFIGS[SubscriptionTier.PRO].mockTestsAvailable.length).toBe(200)
    expect(TIER_CONFIGS[SubscriptionTier.PREMIUM].mockTestsAvailable.length).toBe(200)
  })

  it('premium has high AI scoring priority', () => {
    expect(TIER_CONFIGS[SubscriptionTier.PREMIUM].aiScoringPriority).toBe('high')
  })

  it('pro has normal AI scoring priority', () => {
    expect(TIER_CONFIGS[SubscriptionTier.PRO].aiScoringPriority).toBe('normal')
  })
})
