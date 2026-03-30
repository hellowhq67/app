import { describe, it, expect } from 'vitest'
import {
  normalizeScore,
  applyLogisticMapping,
  calculateConfidenceRange,
  SCORING_CONSTANTS,
  MEASUREMENT_ERROR,
} from '../../lib/pte/scoring-engine/math'

describe('normalizeScore', () => {
  it('returns 0 when maxPossibleScore is 0', () => {
    expect(normalizeScore(5, 0)).toBe(0)
  })

  it('returns 1 for perfect score', () => {
    expect(normalizeScore(10, 10)).toBe(1)
  })

  it('returns 0.5 for half score', () => {
    expect(normalizeScore(5, 10)).toBe(0.5)
  })

  it('clamps above 1 when rawScore exceeds max', () => {
    expect(normalizeScore(15, 10)).toBe(1)
  })

  it('clamps below 0 for negative rawScore', () => {
    expect(normalizeScore(-3, 10)).toBe(0)
  })

  it('handles decimal scores', () => {
    expect(normalizeScore(7, 14)).toBeCloseTo(0.5)
  })
})

describe('applyLogisticMapping', () => {
  it('maps 0.0 normalized to near MIN_SCORE (10)', () => {
    const score = applyLogisticMapping(0)
    expect(score).toBeGreaterThanOrEqual(SCORING_CONSTANTS.MIN_SCORE)
    expect(score).toBeLessThan(30)
  })

  it('maps 1.0 normalized to near MAX_SCORE (90)', () => {
    const score = applyLogisticMapping(1)
    expect(score).toBeLessThanOrEqual(SCORING_CONSTANTS.MAX_SCORE)
    expect(score).toBeGreaterThan(70)
  })

  it('maps 0.58 (midpoint) to approximately center of range', () => {
    const score = applyLogisticMapping(SCORING_CONSTANTS.LOGISTIC_M)
    // At x = m, logistic = 0.5, so score = 10 + 80 * 0.5 = 50
    expect(score).toBe(50)
  })

  it('is monotonically increasing', () => {
    const scores = [0, 0.2, 0.4, 0.6, 0.8, 1.0].map(applyLogisticMapping)
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i - 1])
    }
  })

  it('always returns a rounded integer', () => {
    const score = applyLogisticMapping(0.5)
    expect(Number.isInteger(score)).toBe(true)
  })

  it('stays within 10-90 range for all valid inputs', () => {
    const inputs = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0]
    inputs.forEach(x => {
      const score = applyLogisticMapping(x)
      expect(score).toBeGreaterThanOrEqual(10)
      expect(score).toBeLessThanOrEqual(90)
    })
  })
})

describe('calculateConfidenceRange', () => {
  it('applies A2 error margin for scores below 43', () => {
    const [min, max] = calculateConfidenceRange(40)
    expect(max - min).toBeCloseTo(MEASUREMENT_ERROR.A2 * 2, 0)
    expect(min).toBe(Math.max(10, Math.round(40 - MEASUREMENT_ERROR.A2)))
    expect(max).toBe(Math.min(90, Math.round(40 + MEASUREMENT_ERROR.A2)))
  })

  it('applies B1 error margin for scores 43-58', () => {
    const [min, max] = calculateConfidenceRange(50)
    expect(min).toBe(Math.max(10, Math.round(50 - MEASUREMENT_ERROR.B1)))
    expect(max).toBe(Math.min(90, Math.round(50 + MEASUREMENT_ERROR.B1)))
  })

  it('applies B2 error margin for scores 59-75', () => {
    const [min, max] = calculateConfidenceRange(65)
    expect(min).toBe(Math.max(10, Math.round(65 - MEASUREMENT_ERROR.B2)))
    expect(max).toBe(Math.min(90, Math.round(65 + MEASUREMENT_ERROR.B2)))
  })

  it('applies C1 error margin for scores 76-84', () => {
    const [min, max] = calculateConfidenceRange(80)
    expect(min).toBe(Math.max(10, Math.round(80 - MEASUREMENT_ERROR.C1)))
    expect(max).toBe(Math.min(90, Math.round(80 + MEASUREMENT_ERROR.C1)))
  })

  it('applies C2 error margin for scores above 84', () => {
    const [min, max] = calculateConfidenceRange(88)
    expect(min).toBe(Math.max(10, Math.round(88 - MEASUREMENT_ERROR.C2)))
    expect(max).toBe(Math.min(90, Math.round(88 + MEASUREMENT_ERROR.C2)))
  })

  it('never goes below 10', () => {
    const [min] = calculateConfidenceRange(10)
    expect(min).toBeGreaterThanOrEqual(10)
  })

  it('never goes above 90', () => {
    const [, max] = calculateConfidenceRange(90)
    expect(max).toBeLessThanOrEqual(90)
  })

  it('returns min <= max', () => {
    const scores = [10, 30, 50, 70, 90]
    scores.forEach(s => {
      const [min, max] = calculateConfidenceRange(s)
      expect(min).toBeLessThanOrEqual(max)
    })
  })
})
