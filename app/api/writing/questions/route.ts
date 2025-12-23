import {
  apiSuccess,
  apiError,
  handleApiError,
  requireAdmin,
  WritingListQuerySchema,
  WritingQuestionTypeSchema,
  normalizeDifficulty,
  parseQueryParams,
  paginatedResponse,
} from '@/lib/api'
import { getQuestions, createQuestion, logActivity } from '@/lib/db/queries'
import { z } from 'zod/v3';

// Define specific schemas for options and answerKey
const SummarizeWrittenTextOptionsSchema = z.object({
  wordLimit: z.number().min(1).max(100).optional(),
}).optional()

const WriteEssayOptionsSchema = z.object({
  wordLimit: z.number().min(100).max(500).optional(),
  timeLimit: z.number().min(1).max(60).optional(), // minutes
}).optional()

const SummarizeWrittenTextAnswerKeySchema = z.object({
  sampleAnswer: z.string().min(1).max(1000).optional(),
  keyPoints: z.array(z.string()).optional(),
}).optional()

const WriteEssayAnswerKeySchema = z.object({
  sampleAnswer: z.string().min(1).max(5000).optional(),
  gradingCriteria: z.object({
    content: z.number().min(0).max(5),
    form: z.number().min(0).max(5),
    grammar: z.number().min(0).max(5),
    vocabulary: z.number().min(0).max(5),
  }).optional(),
}).optional()

// POST body schema
const CreateWritingQuestionSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  type: WritingQuestionTypeSchema,
  promptText: z.string().min(1).max(5000).trim(),
  options: z.union([SummarizeWrittenTextOptionsSchema, WriteEssayOptionsSchema]).optional().nullable(),
  answerKey: z.union([SummarizeWrittenTextAnswerKeySchema, WriteEssayAnswerKeySchema]).optional().nullable(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium').optional(),
  tags: z.array(z.string().max(50).trim()).max(10).optional(),
  isActive: z.boolean().optional(),
}).refine((data) => {
  if (data.type === 'summarize_written_text' && data.options) {
    return SummarizeWrittenTextOptionsSchema.safeParse(data.options).success
  }
  if (data.type === 'write_essay' && data.options) {
    return WriteEssayOptionsSchema.safeParse(data.options).success
  }
  return true
}, {
  message: "Options must match the question type",
  path: ["options"]
}).refine((data) => {
  if (data.type === 'summarize_written_text' && data.answerKey) {
    return SummarizeWrittenTextAnswerKeySchema.safeParse(data.answerKey).success
  }
  if (data.type === 'write_essay' && data.answerKey) {
    return WriteEssayAnswerKeySchema.safeParse(data.answerKey).success
  }
  return true
}, {
  message: "Answer key must match the question type",
  path: ["answerKey"]
})

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const parsed = parseQueryParams(url, WritingListQuerySchema)

    if ('error' in parsed) {
      return apiError(400, parsed.error, 'VALIDATION_ERROR')
    }

    const { type, page, pageSize, search, sortBy, sortOrder } = parsed
    const difficulty = normalizeDifficulty(parsed.difficulty)

    const result = await getQuestions({
      category: 'writing',
      type,
      page,
      limit: pageSize,
      difficulty,
      search,
      sortBy,
      sortOrder,
    })

    return paginatedResponse(result.data, result.total, page, pageSize)
  } catch (e) {
    return handleApiError(e, 'GET /api/writing/questions')
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return apiError(415, 'Content-Type must be application/json', 'UNSUPPORTED_MEDIA_TYPE')
    }

    const rawJson = await request.json()

    // Sanitize
    const sanitizeString = (str: string) => str.replace(/[<>\"'&]/g, '').trim()
    const sanitizeTags = (tags: string[]) => tags.map(tag => tag.replace(/[<>\"'&]/g, '').trim()).filter(Boolean)

    const sanitizedJson = {
      ...rawJson,
      title: rawJson.title ? sanitizeString(rawJson.title) : rawJson.title,
      promptText: rawJson.promptText ? sanitizeString(rawJson.promptText) : rawJson.promptText,
      tags: rawJson.tags ? sanitizeTags(rawJson.tags) : rawJson.tags,
    }

    const parsed = CreateWritingQuestionSchema.safeParse(sanitizedJson)
    if (!parsed.success) {
      return apiError(400, parsed.error.issues.map((i) => i.message).join('; '), 'VALIDATION_ERROR')
    }

    const data = parsed.data
    const result = await createQuestion({
      category: 'writing',
      data,
    })

    await logActivity(`Created writing question: ${data.title}`, request.headers.get('x-forwarded-for') || undefined)

    return apiSuccess(result, result.created ? 201 : 200)

  } catch (e) {
    return handleApiError(e, 'POST /api/writing/questions')
  }
}
