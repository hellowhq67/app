import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/api/auth'
import { handleApiError } from '@/lib/api/errors'
import { apiSuccess } from '@/lib/api/response'
import { desc, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))
    const offset = (page - 1) * pageSize

    const [usersList, countResult] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
          image: users.image,
          role: users.role,
          banned: users.banned,
          banReason: users.banReason,
          subscriptionTier: users.subscriptionTier,
          subscriptionStatus: users.subscriptionStatus,
          subscriptionExpiresAt: users.subscriptionExpiresAt,
          dailyAiCredits: users.dailyAiCredits,
          aiCreditsUsed: users.aiCreditsUsed,
          dailyPracticeLimit: users.dailyPracticeLimit,
          practiceQuestionsUsed: users.practiceQuestionsUsed,
          examDate: users.examDate,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(users),
    ])

    const total = Number(countResult[0]?.count ?? 0)

    return apiSuccess({
      items: usersList,
      total,
      page,
      pageSize,
    })
  } catch (error) {
    return handleApiError(error, 'admin/users:GET')
  }
}
