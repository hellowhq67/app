import { z } from 'zod/v3';

/**
 * Shared API schemas - consolidated from individual route schemas
 */

// ============ Difficulty ============

export const DifficultyFilterSchema = z
  .enum(['All', 'Easy', 'Medium', 'Hard'])
  .default('All')

export type DifficultyFilter = z.infer<typeof DifficultyFilterSchema>

export function normalizeDifficulty(
  d: string | undefined | null
): 'All' | 'Easy' | 'Medium' | 'Hard' {
  if (!d) return 'All'
  const v = d.toLowerCase()
  if (v === 'all') return 'All'
  if (v === 'easy') return 'Easy'
  if (v === 'medium') return 'Medium'
  if (v === 'hard') return 'Hard'
  return 'All'
}

// ============ Question Types ============

export const SPEAKING_TYPES = [
  'read_aloud',
  'repeat_sentence',
  'describe_image',
  'retell_lecture',
  'answer_short_question',
] as const

export const READING_TYPES = [
  'multiple_choice_single',
  'multiple_choice_multiple',
  'reorder_paragraphs',
  'fill_in_blanks',
  'reading_writing_fill_blanks',
] as const

export const WRITING_TYPES = ['summarize_written_text', 'write_essay'] as const

export const LISTENING_TYPES = [
  'summarize_spoken_text',
  'multiple_choice_single',
  'multiple_choice_multiple',
  'fill_in_blanks',
  'highlight_correct_summary',
  'select_missing_word',
  'highlight_incorrect_words',
  'write_from_dictation',
] as const

export const SpeakingQuestionTypeSchema = z.enum(SPEAKING_TYPES)
export const ReadingQuestionTypeSchema = z.enum(READING_TYPES)
export const WritingQuestionTypeSchema = z.enum(WRITING_TYPES)
export const ListeningQuestionTypeSchema = z.enum(LISTENING_TYPES)

export type SpeakingQuestionType = z.infer<typeof SpeakingQuestionTypeSchema>
export type ReadingQuestionType = z.infer<typeof ReadingQuestionTypeSchema>
export type WritingQuestionType = z.infer<typeof WritingQuestionTypeSchema>
export type ListeningQuestionType = z.infer<typeof ListeningQuestionTypeSchema>

// ============ List Query Schema Factory ============

export function createListQuerySchema<T extends readonly string[]>(
  typeSchema: z.ZodEnum<[T[number], ...T[number][]]>
) {
  return z.object({
    type: typeSchema,
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().optional().default(''),
    difficulty: DifficultyFilterSchema,
    isActive: z.coerce.boolean().default(true),
    sortBy: z.enum(['difficulty', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
}

// Pre-built list query schemas for each section
export const SpeakingListQuerySchema = createListQuerySchema(SpeakingQuestionTypeSchema)
export const ReadingListQuerySchema = createListQuerySchema(ReadingQuestionTypeSchema)
export const WritingListQuerySchema = createListQuerySchema(WritingQuestionTypeSchema)
export const ListeningListQuerySchema = createListQuerySchema(ListeningQuestionTypeSchema)

// ============ ID Params ============

export const IdParamsSchema = z.object({
  id: z.string().min(1),
})

export type IdParams = z.infer<typeof IdParamsSchema>

// ============ Helper Functions ============

export function parseQueryParams<T extends z.ZodType>(
  url: URL,
  schema: T
): z.infer<T> | { error: string } {
  const raw = Object.fromEntries(url.searchParams.entries())
  const result = schema.safeParse(raw)

  if (!result.success) {
    return { error: result.error.issues.map((i) => i.message).join('; ') }
  }

  return result.data
}

export function countWords(text: string): number {
  if (!text) return 0
  return text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
}

export function textLengthValidation(type: string, text: string) {
  const wc = countWords(text)
  
  if (type === 'summarize_spoken_text') {
    // PTE Listen: Summarize Spoken Text -> 50-70 words
    return {
      wordCount: wc,
      min: 50,
      max: 70,
      withinRange: wc >= 50 && wc <= 70,
    }
  }

  // Generic fallback
  return {
    wordCount: wc,
    min: 0,
    max: 1000,
    withinRange: true,
  }
}

// ============ Attempt Schemas ============

export const SpeakingAttemptBodySchema = z.object({
  questionId: z.string().min(1),
  type: SpeakingQuestionTypeSchema,
  audioUrl: z.string().url(),
  durationMs: z.number().int().positive(),
  timings: z.any().optional(),
})


// ============ Reading Attempt Schemas ============

export const MultipleChoiceSingleResponseSchema = z.object({
  selectedOption: z.string().min(1),
})

export const MultipleChoiceMultipleResponseSchema = z.object({
  selectedOptions: z.array(z.string()).min(1),
})

export const ReorderParagraphsResponseSchema = z.object({
  order: z.array(z.number().int().min(1)),
})

export const FillInBlanksResponseSchema = z.object({
  answers: z.record(z.string(), z.string()),
})

export const ReadingWritingFillBlanksResponseSchema = z.object({
  answers: z.record(z.string(), z.string()),
})

export const ReadingAttemptResponseSchema = z.union([
  MultipleChoiceSingleResponseSchema,
  MultipleChoiceMultipleResponseSchema,
  ReorderParagraphsResponseSchema,
  FillInBlanksResponseSchema,
  ReadingWritingFillBlanksResponseSchema,
])

export const ReadingAttemptBodySchema = z.object({
  questionId: z.string().min(1),
  type: ReadingQuestionTypeSchema,
  userResponse: ReadingAttemptResponseSchema,
  timeTaken: z.coerce.number().int().positive().max(3600), // max 1 hour
})

// ============ Writing Attempt Schemas ============

export const WritingAttemptBodySchema = z.object({
  questionId: z.string().min(1),
  type: WritingQuestionTypeSchema,
  textAnswer: z.string().min(1).max(10000), // allow long essays, still bounded
  timeTaken: z.coerce.number().int().positive().max(7200).optional(), // up to 2h
  timings: z.record(z.string(), z.any()).optional(),
})

export type WritingAttemptBody = z.infer<typeof WritingAttemptBodySchema>

export function basicLengthValidation(type: string, text: string) {
  const wc = countWords(text)
  if (type === 'summarize_written_text') {
    // Typical PTE range is ~ 5 to 75 words (one-sentence summary)
    return {
      wordCount: wc,
      min: 5,
      max: 75,
      withinRange: wc >= 5 && wc <= 75,
    }
  }
  // write_essay
  // Common practice: 200-300 words; allow broader range for practice
  return {
    wordCount: wc,
    min: 150,
    max: 450,
    withinRange: wc >= 150 && wc <= 450,
  }
}

// ============ Listening Attempt Schemas ============

export const ListeningAttemptBodySchema = z.object({
  questionId: z.string().min(1),
  type: ListeningQuestionTypeSchema,
  userResponse: z.any(), // Flexible to handle various response structures
  timeTaken: z.coerce.number().int().positive().max(3600).optional(),
  timings: z.record(z.string(), z.any()).optional(),
})

export type ListeningAttemptBody = z.infer<typeof ListeningAttemptBodySchema>
