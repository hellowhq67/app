import { getUserProgress, getUserAnalytics, calculateUserProgressFallback } from '@/lib/db/queries/users'
import {
  apiSuccess,
  handleApiError,
  requireAuth,
} from '@/lib/api'

interface ProgressData {
  overallScore: number
  speakingScore: number
  writingScore: number
  readingScore: number
  listeningScore: number
  testsCompleted: number
  questionsAnswered: number
  studyStreak: number
  totalStudyTime: number
}

export async function GET() {
  try {
    const { userId } = await requireAuth()

    // Try to get progress from userProgress table first
    const userProgress = await getUserProgress(userId)
    if (userProgress) {
      return apiSuccess({
        overallScore: userProgress.overallScore || 0,
        speakingScore: userProgress.speakingScore || 0,
        writingScore: userProgress.writingScore || 0,
        readingScore: userProgress.readingScore || 0,
        listeningScore: userProgress.listeningScore || 0,
        testsCompleted: userProgress.testsCompleted || 0,
        questionsAnswered: userProgress.questionsAnswered || 0,
        studyStreak: userProgress.studyStreak || 0,
        totalStudyTime: Math.floor((userProgress.totalStudyTime || 0) / 60), // Convert minutes to hours
      } satisfies ProgressData)
    }

    // Fallback: Calculate progress from attempts and analytics
    const [analytics, fallback] = await Promise.all([
      getUserAnalytics(userId),
      calculateUserProgressFallback(userId)
    ])

    const progressData: ProgressData = {
      overallScore: analytics?.averageScore?.overall || 0,
      speakingScore: analytics?.averageScore?.speaking || 0,
      writingScore: analytics?.averageScore?.writing || 0,
      readingScore: analytics?.averageScore?.reading || 0,
      listeningScore: analytics?.averageScore?.listening || 0,
      testsCompleted: analytics?.totalAttempts || 0,
      questionsAnswered: fallback.questionsAnswered,
      studyStreak: 0,
      totalStudyTime: fallback.totalStudyTimeHours,
    }

    return apiSuccess(progressData)
  } catch (error) {
    return handleApiError(error, 'GET /api/user/progress')
  }
}
