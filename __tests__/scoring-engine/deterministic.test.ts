import { describe, it, expect } from 'vitest'
import { scoreDeterministically } from '../../lib/pte/scoring-engine/deterministic'
import { QuestionType } from '../../lib/types'

// ─── Multiple Choice Single ────────────────────────────────────────────────

describe('scoreDeterministically — MULTIPLE_CHOICE_SINGLE', () => {
  it('scores 1 for correct answer', () => {
    const result = scoreDeterministically(
      QuestionType.MULTIPLE_CHOICE_SINGLE,
      'B',
      'B'
    )
    expect(result).not.toBeNull()
    expect(result!.overallScore).toBe(1)
    expect(result!.accuracy.score).toBe(1)
  })

  it('scores 0 for wrong answer', () => {
    const result = scoreDeterministically(
      QuestionType.MULTIPLE_CHOICE_SINGLE,
      'A',
      'B'
    )
    expect(result!.overallScore).toBe(0)
  })

  it('works with object submission (selectedOption)', () => {
    const result = scoreDeterministically(
      QuestionType.MULTIPLE_CHOICE_SINGLE,
      { selectedOption: 'C' },
      'C'
    )
    expect(result!.overallScore).toBe(1)
  })

  it('returns null when correctAnswer is missing', () => {
    const result = scoreDeterministically(
      QuestionType.MULTIPLE_CHOICE_SINGLE,
      'A',
      null
    )
    expect(result).toBeNull()
  })
})

// ─── Multiple Choice Multiple ───────────────────────────────────────────────

describe('scoreDeterministically — MULTIPLE_CHOICE_MULTIPLE', () => {
  it('gives full score for all correct selections', () => {
    const result = scoreDeterministically(
      QuestionType.MULTIPLE_CHOICE_MULTIPLE,
      ['A', 'C'],
      ['A', 'C']
    )
    expect(result!.overallScore).toBe(2) // 2 correct, 0 wrong → 2 - 0 = 2
  })

  it('deducts for incorrect selections (PTE rule: +1 correct, -1 wrong)', () => {
    const result = scoreDeterministically(
      QuestionType.MULTIPLE_CHOICE_MULTIPLE,
      ['A', 'B'], // B is wrong
      ['A', 'C']
    )
    // 1 correct, 1 wrong → 1 - 1 = 0
    expect(result!.overallScore).toBe(0)
  })

  it('never goes below 0', () => {
    const result = scoreDeterministically(
      QuestionType.MULTIPLE_CHOICE_MULTIPLE,
      ['B', 'D'], // both wrong
      ['A', 'C']
    )
    expect(result!.overallScore).toBe(0)
  })

  it('handles empty submission', () => {
    const result = scoreDeterministically(
      QuestionType.MULTIPLE_CHOICE_MULTIPLE,
      [],
      ['A', 'C']
    )
    expect(result!.overallScore).toBe(0)
  })

  it('reads correct answers from .options key', () => {
    const result = scoreDeterministically(
      QuestionType.MULTIPLE_CHOICE_MULTIPLE,
      ['A'],
      { options: ['A', 'C'] }
    )
    expect(result!.overallScore).toBe(1)
  })
})

// ─── Fill in the Blanks ─────────────────────────────────────────────────────

describe('scoreDeterministically — READING_BLANKS (fill in the blanks)', () => {
  it('scores one point per correct blank', () => {
    const result = scoreDeterministically(
      QuestionType.READING_BLANKS,
      { filledBlanks: { '0': 'hello', '1': 'world' } },
      { blanks: { '0': 'hello', '1': 'world' } }
    )
    expect(result!.overallScore).toBe(2)
  })

  it('is case-insensitive and trims whitespace', () => {
    const result = scoreDeterministically(
      QuestionType.READING_BLANKS,
      { filledBlanks: { '0': '  Hello ' } },
      { blanks: { '0': 'hello' } }
    )
    expect(result!.overallScore).toBe(1)
  })

  it('scores 0 for all incorrect blanks', () => {
    const result = scoreDeterministically(
      QuestionType.READING_BLANKS,
      { filledBlanks: { '0': 'wrong' } },
      { blanks: { '0': 'right' } }
    )
    expect(result!.overallScore).toBe(0)
  })

  it('handles array submission format', () => {
    const result = scoreDeterministically(
      QuestionType.READING_BLANKS,
      ['apple', 'banana'],
      ['apple', 'banana']
    )
    expect(result!.overallScore).toBe(2)
  })

  it('handles array answer key', () => {
    const result = scoreDeterministically(
      QuestionType.READING_BLANKS,
      ['apple'],
      ['apple']
    )
    expect(result!.overallScore).toBe(1)
  })
})

// ─── Re-order Paragraphs ────────────────────────────────────────────────────

describe('scoreDeterministically — REORDER_PARAGRAPHS', () => {
  it('scores max for perfect order', () => {
    // Correct: A→B→C→D = 3 pairs
    const result = scoreDeterministically(
      QuestionType.REORDER_PARAGRAPHS,
      ['A', 'B', 'C', 'D'],
      ['A', 'B', 'C', 'D']
    )
    expect(result!.overallScore).toBe(3) // 3 adjacent pairs
  })

  it('scores 0 for completely wrong order', () => {
    // Correct: A→B→C→D, User: D→C→B→A (no correct adjacent pairs)
    const result = scoreDeterministically(
      QuestionType.REORDER_PARAGRAPHS,
      ['D', 'C', 'B', 'A'],
      ['A', 'B', 'C', 'D']
    )
    expect(result!.overallScore).toBe(0)
  })

  it('scores partial for partially correct order', () => {
    // Correct: A→B→C→D, User: A→B→D→C (AB is correct pair, BD/DC not)
    const result = scoreDeterministically(
      QuestionType.REORDER_PARAGRAPHS,
      ['A', 'B', 'D', 'C'],
      ['A', 'B', 'C', 'D']
    )
    expect(result!.overallScore).toBe(1)
  })

  it('returns 0 for single paragraph', () => {
    const result = scoreDeterministically(
      QuestionType.REORDER_PARAGRAPHS,
      ['A'],
      ['A']
    )
    expect(result!.overallScore).toBe(0) // maxScore = N-1 = 0
  })

  it('handles object format with .order key', () => {
    const result = scoreDeterministically(
      QuestionType.REORDER_PARAGRAPHS,
      { orderedParagraphs: ['A', 'B'] },
      { order: ['A', 'B'] }
    )
    expect(result!.overallScore).toBe(1)
  })
})

// ─── Write from Dictation ───────────────────────────────────────────────────

describe('scoreDeterministically — WRITE_FROM_DICTATION', () => {
  it('scores 1 point per correct word', () => {
    const result = scoreDeterministically(
      QuestionType.WRITE_FROM_DICTATION,
      'the quick brown fox',
      'the quick brown fox'
    )
    expect(result!.overallScore).toBe(4)
  })

  it('is case-insensitive', () => {
    const result = scoreDeterministically(
      QuestionType.WRITE_FROM_DICTATION,
      'THE QUICK',
      'the quick'
    )
    expect(result!.overallScore).toBe(2)
  })

  it('handles punctuation differences', () => {
    const result = scoreDeterministically(
      QuestionType.WRITE_FROM_DICTATION,
      'hello, world.',
      'hello world'
    )
    expect(result!.overallScore).toBe(2)
  })

  it('deducts for missing words', () => {
    const result = scoreDeterministically(
      QuestionType.WRITE_FROM_DICTATION,
      'the fox',
      'the quick brown fox'
    )
    expect(result!.overallScore).toBe(2)
  })

  it('does not double-count repeated words', () => {
    // Correct has "the" once; user writes "the the" → only 1 match
    const result = scoreDeterministically(
      QuestionType.WRITE_FROM_DICTATION,
      'the the fox',
      'the fox'
    )
    expect(result!.overallScore).toBe(2)
  })

  it('handles text wrapped in object', () => {
    const result = scoreDeterministically(
      QuestionType.WRITE_FROM_DICTATION,
      { text: 'hello world' },
      { text: 'hello world' }
    )
    expect(result!.overallScore).toBe(2)
  })
})

// ─── Highlight Correct Summary ──────────────────────────────────────────────

describe('scoreDeterministically — HIGHLIGHT_CORRECT_SUMMARY', () => {
  it('scores 1 for correct selection', () => {
    const result = scoreDeterministically(
      QuestionType.HIGHLIGHT_CORRECT_SUMMARY,
      'summary_b',
      'summary_b'
    )
    expect(result!.overallScore).toBe(1)
  })

  it('scores 0 for wrong selection', () => {
    const result = scoreDeterministically(
      QuestionType.HIGHLIGHT_CORRECT_SUMMARY,
      'summary_a',
      'summary_b'
    )
    expect(result!.overallScore).toBe(0)
  })
})

// ─── Default / Unknown type ─────────────────────────────────────────────────

describe('scoreDeterministically — unknown types', () => {
  it('returns null for subjective types like WRITE_ESSAY', () => {
    const result = scoreDeterministically(
      QuestionType.WRITE_ESSAY,
      'some text',
      'some reference'
    )
    expect(result).toBeNull()
  })

  it('returns null for DESCRIBE_IMAGE', () => {
    const result = scoreDeterministically(
      QuestionType.DESCRIBE_IMAGE,
      'audio_blob',
      null
    )
    expect(result).toBeNull()
  })
})
