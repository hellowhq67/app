export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'unlimited'
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'trial'
export type UserRole = 'user' | 'admin' | 'teacher'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type QuestionSection = 'Speaking' | 'Writing' | 'Reading' | 'Listening'
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned' | 'under_review'
export type MockTestStatus = 'not_started' | 'in_progress' | 'completed' | 'expired'
export type HealthStatus = 'healthy' | 'degraded' | 'down'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  subscriptionTier: SubscriptionTier
  subscriptionStatus: SubscriptionStatus
  subscriptionExpiresAt: string | null
  dailyAiCredits: number
  aiCreditsUsed: number
  dailyPracticeLimit: number
  practiceQuestionsUsed: number
  emailVerified: boolean
  banned: boolean
  banReason: string | null
  examDate: string | null
  createdAt: string
  image: string | null
  // computed
  totalAttempts: number
  avgScore: number
  mockTestsTaken: number
}

export interface AdminQuestion {
  id: string
  title: string
  section: QuestionSection
  questionType: string
  difficulty: Difficulty
  isPremium: boolean
  content: string
  totalAttempts: number
  avgScore: number
  passRate: number // % with score >= 60
  createdAt: string
}

export interface AdminAttempt {
  id: string
  userId: string
  userName: string
  questionId: string
  questionTitle: string
  questionType: string
  section: QuestionSection
  score: number
  timeTaken: number // seconds
  status: AttemptStatus
  createdAt: string
}

export interface AdminMockTest {
  id: string
  testName: string
  userId: string
  userName: string
  status: MockTestStatus
  overallScore: number | null
  speakingScore: number | null
  writingScore: number | null
  readingScore: number | null
  listeningScore: number | null
  totalQuestions: number
  completedQuestions: number
  totalDuration: number | null // seconds
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  enablingSkills: {
    grammar: number
    oralFluency: number
    pronunciation: number
    spelling: number
    vocabulary: number
    writtenDiscourse: number
  } | null
}

export interface HealthService {
  id: string
  name: string
  description: string
  status: HealthStatus
  responseMs: number
  uptimePercent: number
  lastChecked: string
  icon: string
}

export interface DashboardStats {
  totalUsers: number
  activeThisMonth: number
  totalQuestions: number
  mockTestsTaken: number
  newUsersThisWeek: number
  avgScore: number
  questionsBreakdown: { section: QuestionSection; count: number }[]
}

export interface ChartDataPoint {
  date: string
  value: number
}

export interface SectionAttemptData {
  section: QuestionSection
  attempts: number
  avgScore: number
}
