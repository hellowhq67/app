import { describe, it, expect, vi } from 'vitest'

// Mock DB so module-level drizzle init doesn't throw without DATABASE_URL
vi.mock('../../lib/db/drizzle', () => ({ db: {} }))
vi.mock('../../lib/db/schema', () => ({ users: {} }))

import {
  getCreditsNeeded,
  getCreditStatusMessage,
  type CreditStatus,
} from '../../lib/subscription/credits'

describe('getCreditsNeeded', () => {
  it('returns 0 for auto-scored reading types', () => {
    expect(getCreditsNeeded('multiple_choice_single')).toBe(0)
    expect(getCreditsNeeded('multiple_choice_multiple')).toBe(0)
    expect(getCreditsNeeded('reorder_paragraphs')).toBe(0)
    expect(getCreditsNeeded('fill_in_blanks')).toBe(0)
    expect(getCreditsNeeded('reading_writing_fill_blanks')).toBe(0)
  })

  it('returns 0 for auto-scored listening MCQ types', () => {
    expect(getCreditsNeeded('highlight_correct_summary')).toBe(0)
    expect(getCreditsNeeded('select_missing_word')).toBe(0)
  })

  it('returns 1 for speaking types (require AI)', () => {
    expect(getCreditsNeeded('read_aloud')).toBe(1)
    expect(getCreditsNeeded('describe_image')).toBe(1)
    expect(getCreditsNeeded('repeat_sentence')).toBe(1)
    expect(getCreditsNeeded('retell_lecture')).toBe(1)
    expect(getCreditsNeeded('answer_short_question')).toBe(1)
  })

  it('returns 1 for writing types (require AI)', () => {
    expect(getCreditsNeeded('write_essay')).toBe(1)
    expect(getCreditsNeeded('summarize_written_text')).toBe(1)
  })

  it('returns 1 for unknown question types', () => {
    expect(getCreditsNeeded('unknown_type')).toBe(1)
  })
})

describe('getCreditStatusMessage', () => {
  it('returns unlimited message when total is -1', () => {
    const status: CreditStatus = {
      total: -1,
      used: 0,
      remaining: -1,
      resetsAt: null,
    }
    const msg = getCreditStatusMessage(status)
    expect(msg).toContain('Unlimited')
  })

  it('returns no credits message when remaining is 0', () => {
    const resetTime = new Date('2026-01-01T08:00:00')
    const status: CreditStatus = {
      total: 10,
      used: 10,
      remaining: 0,
      resetsAt: resetTime,
    }
    const msg = getCreditStatusMessage(status)
    expect(msg).toContain('No AI credits remaining')
  })

  it('returns remaining credits message with correct counts', () => {
    const status: CreditStatus = {
      total: 10,
      used: 3,
      remaining: 7,
      resetsAt: new Date(),
    }
    const msg = getCreditStatusMessage(status)
    expect(msg).toContain('7')
    expect(msg).toContain('10')
  })

  it('handles null resetsAt gracefully', () => {
    const status: CreditStatus = {
      total: 10,
      used: 10,
      remaining: 0,
      resetsAt: null,
    }
    const msg = getCreditStatusMessage(status)
    expect(msg).toContain('tomorrow')
  })
})
