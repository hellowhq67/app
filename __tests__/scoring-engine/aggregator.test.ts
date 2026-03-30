import { describe, it, expect } from 'vitest'
import { aggregateSkillScores } from '../../lib/pte/scoring-engine/aggregator'
import { QuestionType } from '../../lib/types'

describe('aggregateSkillScores', () => {
  it('returns zero scores for empty attempts', () => {
    const result = aggregateSkillScores([], {} as any)
    expect(result.communicativeSkills.speaking).toBeGreaterThanOrEqual(0)
    expect(result.communicativeSkills.writing).toBeGreaterThanOrEqual(0)
    expect(result.communicativeSkills.reading).toBeGreaterThanOrEqual(0)
    expect(result.communicativeSkills.listening).toBeGreaterThanOrEqual(0)
  })

  it('produces higher speaking score when speaking questions are answered well', () => {
    const perfectSpeaking = [
      {
        questionType: QuestionType.DESCRIBE_IMAGE, // 100% speaking weight
        aiFeedback: { overallScore: 15 },
      },
    ]
    const maxScores = { [QuestionType.DESCRIBE_IMAGE]: 15 } as any
    const result = aggregateSkillScores(perfectSpeaking, maxScores)

    expect(result.communicativeSkills.speaking).toBeGreaterThan(50)
    expect(result.communicativeSkills.writing).toBeLessThan(result.communicativeSkills.speaking)
  })

  it('produces higher reading score when reading questions are answered well', () => {
    const perfectReading = [
      {
        questionType: QuestionType.MULTIPLE_CHOICE_SINGLE, // 100% reading weight
        aiFeedback: { overallScore: 1 },
      },
    ]
    const maxScores = { [QuestionType.MULTIPLE_CHOICE_SINGLE]: 1 } as any
    const result = aggregateSkillScores(perfectReading, maxScores)

    expect(result.communicativeSkills.reading).toBeGreaterThan(50)
  })

  it('distributes score across skills for READ_ALOUD (50% speaking, 50% reading)', () => {
    const attempts = [
      {
        questionType: QuestionType.READ_ALOUD,
        aiFeedback: { overallScore: 15 },
      },
    ]
    const maxScores = { [QuestionType.READ_ALOUD]: 15 } as any
    const result = aggregateSkillScores(attempts, maxScores)

    // Both speaking and reading should be non-trivial
    expect(result.communicativeSkills.speaking).toBeGreaterThan(40)
    expect(result.communicativeSkills.reading).toBeGreaterThan(40)
    // Writing and listening have zero contribution, so they map to logistic(0) ≈ 12
    expect(result.communicativeSkills.writing).toBeLessThan(20)
    expect(result.communicativeSkills.listening).toBeLessThan(20)
  })

  it('handles zero earned points gracefully', () => {
    const attempts = [
      {
        questionType: QuestionType.MULTIPLE_CHOICE_SINGLE,
        aiFeedback: { overallScore: 0 },
      },
    ]
    const maxScores = { [QuestionType.MULTIPLE_CHOICE_SINGLE]: 1 } as any
    const result = aggregateSkillScores(attempts, maxScores)

    // Score should be near the logistic floor (≤20) for zero earned points
    expect(result.communicativeSkills.reading).toBeLessThanOrEqual(20)
  })

  it('returns a rounded integer for overallScore', () => {
    const attempts = [
      {
        questionType: QuestionType.READ_ALOUD,
        aiFeedback: { overallScore: 10 },
      },
      {
        questionType: QuestionType.WRITE_ESSAY,
        aiFeedback: { overallScore: 12 },
      },
    ]
    const maxScores = {
      [QuestionType.READ_ALOUD]: 15,
      [QuestionType.WRITE_ESSAY]: 15,
    } as any
    const result = aggregateSkillScores(attempts, maxScores)

    expect(Number.isInteger(result.overallScore)).toBe(true)
  })

  it('skips attempts with unknown question types gracefully', () => {
    const attempts = [
      {
        questionType: 'unknown_type' as QuestionType,
        aiFeedback: { overallScore: 10 },
      },
    ]
    const maxScores = {} as any
    // Should not throw
    expect(() => aggregateSkillScores(attempts, maxScores)).not.toThrow()
  })

  it('overallScore reflects weighted section importance', () => {
    // Perfect listening score only
    const attempts = [
      {
        questionType: QuestionType.WRITE_FROM_DICTATION, // 50% listening, 50% writing
        aiFeedback: { overallScore: 10 },
      },
    ]
    const maxScores = { [QuestionType.WRITE_FROM_DICTATION]: 10 } as any
    const result = aggregateSkillScores(attempts, maxScores)

    // With partial skills active, overall should be between 10 and 90
    expect(result.overallScore).toBeGreaterThanOrEqual(10)
    expect(result.overallScore).toBeLessThanOrEqual(90)
  })
})
