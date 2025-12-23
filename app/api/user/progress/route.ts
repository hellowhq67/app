import { getUserProgress, getUserAnalytics, calculateUserProgressFallback } from '@/lib/db/queries'
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
    const userProgress = await getUserProgress()
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
      getUserAnalytics(),
      calculateUserProgressFallback(userId)
    ])

    const progressData: ProgressData = {
      overallScore: analytics?.averageScores?.overall || 0,
      speakingScore: analytics?.averageScores?.speaking || 0,
      writingScore: analytics?.averageScores?.writing || 0,
      readingScore: analytics?.averageScores?.reading || 0,
      listeningScore: analytics?.averageScores?.listening || 0,
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
