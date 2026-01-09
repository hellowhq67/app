import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/drizzle'
import { pteAttempts, pteQuestions, pteQuestionTypes, pteCategories } from '@/lib/db/schema'
import { eq, and, desc, sql, getTableColumns, inArray } from 'drizzle-orm'
import { z } from 'zod'

export const preferredRegion = 'auto'
export const maxDuration = 30

// Validation schemas
const getAttemptsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  questionId: z.string().uuid().optional(),
  section: z.enum(['speaking', 'writing', 'reading', 'listening']).optional(),
  status: z.enum(['in_progress', 'completed', 'abandoned', 'under_review']).optional(),
})

const createAttemptSchema = z.object({
  questionId: z.string().uuid(),
  responseText: z.string().optional(),
  responseAudioUrl: z.string().url().optional(),
  responseData: z.record(z.string(), z.any()).optional(),
  timeTaken: z.number().int().min(0).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

function error(status: number, message: string, code?: string) {
  return NextResponse.json(
    { success: false, error: message, ...(code ? { code } : {}) },
    { status }
  )
}

/**
 * GET /api/attempts
 * Retrieve paginated list of user's attempts with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return error(401, 'Unauthorized', 'UNAUTHORIZED')
    }
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const params = {
      page: searchParams.get('page') ?? '1',
      limit: searchParams.get('limit') ?? '20',
      questionId: searchParams.get('questionId') ?? undefined,
      section: searchParams.get('section') ?? undefined,
      status: searchParams.get('status') ?? undefined,
    }

    const parsed = getAttemptsSchema.safeParse(params)
    if (!parsed.success) {
      return error(400, 'Invalid query parameters', 'BAD_REQUEST')
    }

    const { page, limit, questionId, section, status } = parsed.data
    const offset = (page - 1) * limit

    // Build conditions
    const conditions: any[] = [eq(pteAttempts.userId, userId)]
    if (questionId) {
      conditions.push(eq(pteAttempts.questionId, questionId))
    }
    if (status) {
      conditions.push(eq(pteAttempts.status, status))
    }

    // Base query with question info
    let query = db
      .select({
        ...getTableColumns(pteAttempts),
        question: {
          id: pteQuestions.id,
          title: pteQuestions.title,
          difficulty: pteQuestions.difficulty,
          questionTypeId: pteQuestions.questionTypeId,
        },
        questionType: {
          id: pteQuestionTypes.id,
          name: pteQuestionTypes.name,
          section: pteCategories.code,
          slug: pteQuestionTypes.code,
        },
      })
      .from(pteAttempts)
      .innerJoin(pteQuestions, eq(pteAttempts.questionId, pteQuestions.id))
      .innerJoin(pteQuestionTypes, eq(pteQuestions.questionTypeId, pteQuestionTypes.id))
      .innerJoin(pteCategories, eq(pteQuestionTypes.categoryId, pteCategories.id))
      .where(and(...conditions))
      .orderBy(desc(pteAttempts.createdAt))
      .limit(limit)
      .offset(offset)

    // Filter by section if provided
    if (section) {
      conditions.push(eq(pteCategories.code, section))
      query = db
        .select({
          ...getTableColumns(pteAttempts),
          question: {
            id: pteQuestions.id,
            title: pteQuestions.title,
            difficulty: pteQuestions.difficulty,
            questionTypeId: pteQuestions.questionTypeId,
          },
          questionType: {
            id: pteQuestionTypes.id,
            name: pteQuestionTypes.name,
            section: pteCategories.code,
            slug: pteQuestionTypes.code,
          },
        })
        .from(pteAttempts)
        .innerJoin(pteQuestions, eq(pteAttempts.questionId, pteQuestions.id))
        .innerJoin(pteQuestionTypes, eq(pteQuestions.questionTypeId, pteQuestionTypes.id))
        .innerJoin(pteCategories, eq(pteQuestionTypes.categoryId, pteCategories.id))
        .where(and(...conditions))
        .orderBy(desc(pteAttempts.createdAt))
        .limit(limit)
        .offset(offset)
    }

    const attempts = await query

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pteAttempts)
      .innerJoin(pteQuestions, eq(pteAttempts.questionId, pteQuestions.id))
      .innerJoin(pteQuestionTypes, eq(pteQuestions.questionTypeId, pteQuestionTypes.id))
      .innerJoin(pteCategories, eq(pteQuestionTypes.categoryId, pteCategories.id))
      .where(and(...conditions))

    const total = countResult?.count ?? 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        attempts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    })
  } catch (e) {
    console.error('[GET /api/attempts]', e)
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

/**
 * POST /api/attempts
 * Create a new attempt record
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return error(401, 'Unauthorized', 'UNAUTHORIZED')
    }
    const userId = session.user.id

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return error(415, 'Content-Type must be application/json', 'UNSUPPORTED_MEDIA_TYPE')
    }

    const body = await request.json()
    const parsed = createAttemptSchema.safeParse(body)
    if (!parsed.success) {
      return error(400, `Invalid request body: ${parsed.error.message}`, 'BAD_REQUEST')
    }

    const { questionId, responseText, responseAudioUrl, responseData, timeTaken, metadata } = parsed.data

    // Verify question exists
    const question = await db.query.pteQuestions.findFirst({
      where: eq(pteQuestions.id, questionId),
    })

    if (!question) {
      return error(404, 'Question not found', 'NOT_FOUND')
    }

    // Get current attempt count for this user+question
    const [existingCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pteAttempts)
      .where(and(eq(pteAttempts.userId, userId), eq(pteAttempts.questionId, questionId)))

    const attemptNumber = (existingCount?.count ?? 0) + 1

    // Create the attempt
    const [attempt] = await db
      .insert(pteAttempts)
      .values({
        userId,
        questionId,
        responseText,
        responseAudioUrl,
        responseData,
        timeTaken,
        metadata,
        attemptNumber,
        status: responseText || responseAudioUrl || responseData ? 'completed' : 'in_progress',
        startedAt: new Date(),
        completedAt: responseText || responseAudioUrl || responseData ? new Date() : undefined,
      })
      .returning()

    // Update question usage count
    await db
      .update(pteQuestions)
      .set({ usageCount: sql`${pteQuestions.usageCount} + 1` })
      .where(eq(pteQuestions.id, questionId))

    return NextResponse.json(
      {
        success: true,
        data: {
          attempt,
          attemptNumber,
        },
      },
      { status: 201 }
    )
  } catch (e) {
    console.error('[POST /api/attempts]', e)
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}