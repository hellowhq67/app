import { describe, it, expect } from 'vitest'
import {
  paginationParsers,
  difficultyParser,
  searchParser,
  isActiveParser,
  pteCategoryParser,
  examTypeParser,
  practiceFiltersParsers,
  pteCategories,
  examTypes,
  type PTECategory,
  type ExamType,
} from '../lib/parsers'

// nuqs parsers expose .defaultValue, .parseServerSide, and .serialize
// We test the exported types and default values (no DOM/nuqs runtime needed).

describe('paginationParsers', () => {
  it('page defaults to 1', () => {
    expect(paginationParsers.page.defaultValue).toBe(1)
  })

  it('pageSize defaults to 20', () => {
    expect(paginationParsers.pageSize.defaultValue).toBe(20)
  })
})

describe('difficultyParser', () => {
  it('defaults to "All"', () => {
    expect(difficultyParser.defaultValue).toBe('All')
  })
})

describe('searchParser', () => {
  it('defaults to empty string', () => {
    expect(searchParser.defaultValue).toBe('')
  })
})

describe('isActiveParser', () => {
  it('defaults to true', () => {
    expect(isActiveParser.defaultValue).toBe(true)
  })
})

describe('pteCategoryParser', () => {
  it('defaults to "reading"', () => {
    expect(pteCategoryParser.defaultValue).toBe('reading')
  })
})

describe('examTypeParser', () => {
  it('defaults to "academic"', () => {
    expect(examTypeParser.defaultValue).toBe('academic')
  })
})

describe('pteCategories', () => {
  it('includes all four PTE sections', () => {
    const sections: PTECategory[] = ['speaking', 'writing', 'reading', 'listening']
    sections.forEach(section => {
      expect(pteCategories).toContain(section)
    })
  })

  it('has exactly 4 categories', () => {
    expect(pteCategories.length).toBe(4)
  })
})

describe('examTypes', () => {
  it('includes academic and core', () => {
    const types: ExamType[] = ['academic', 'core']
    types.forEach(t => {
      expect(examTypes).toContain(t)
    })
  })

  it('has exactly 2 types', () => {
    expect(examTypes.length).toBe(2)
  })
})

describe('practiceFiltersParsers', () => {
  it('includes category, type, difficulty, page, pageSize', () => {
    expect(practiceFiltersParsers).toHaveProperty('category')
    expect(practiceFiltersParsers).toHaveProperty('type')
    expect(practiceFiltersParsers).toHaveProperty('difficulty')
    expect(practiceFiltersParsers).toHaveProperty('page')
    expect(practiceFiltersParsers).toHaveProperty('pageSize')
  })
})
