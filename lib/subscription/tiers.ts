/**
 * Subscription Tier System
 * Defines access levels and limits for different subscription plans
 */

export enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro',
  PREMIUM = 'premium',
}

export interface TierLimits {
  // Mock Tests
  mockTestsAllowed: number // -1 = unlimited
  mockTestsAvailable: number[] // Array of test numbers (1-200)

  // Practice Limits
  practiceLimits: {
    [section: string]: {
      [questionType: string]: number // -1 = unlimited
    }
  }

  // AI Scoring
  dailyAiCredits: number // -1 = unlimited
  aiScoringPriority: 'normal' | 'high'

  // Features
  features: {
    testHistory: boolean
    detailedAnalytics: boolean
    studyPlan: boolean
    teacherReview: boolean
    sectionTests: number // -1 = unlimited
    downloadReports: boolean
  }
}

export const TIER_CONFIGS: Record<SubscriptionTier, TierLimits> = {
  [SubscriptionTier.FREE]: {
    mockTestsAllowed: 1,
    mockTestsAvailable: [1], // Only test #1

    practiceLimits: {
      speaking: {
        read_aloud: 3,
        repeat_sentence: 3,
        describe_image: 2,
        retell_lecture: 2,
        answer_short_question: 3,
      },
      writing: {
        summarize_written_text: 2,
        write_essay: 1,
      },
      reading: {
        multiple_choice_single: 3,
        multiple_choice_multiple: 3,
        reorder_paragraphs: 2,
        fill_in_blanks: 3,
        reading_writing_fill_blanks: 3,
      },
      listening: {
        summarize_spoken_text: 2,
        multiple_choice_single: 3,
        multiple_choice_multiple: 3,
        fill_in_blanks: 3,
        highlight_correct_summary: 2,
        select_missing_word: 2,
        highlight_incorrect_words: 2,
        write_from_dictation: 3,
      },
    },

    dailyAiCredits: 10,
    aiScoringPriority: 'normal',

    features: {
      testHistory: true, // Limited to last 5 tests
      detailedAnalytics: false,
      studyPlan: false,
      teacherReview: false,
      sectionTests: 2, // 2 section tests per section
      downloadReports: false,
    },
  },

  [SubscriptionTier.PRO]: {
    mockTestsAllowed: -1, // Unlimited
    mockTestsAvailable: Array.from({ length: 200 }, (_, i) => i + 1), // All 200 tests

    practiceLimits: {
      speaking: {
        read_aloud: -1,
        repeat_sentence: -1,
        describe_image: -1,
        retell_lecture: -1,
        answer_short_question: -1,
      },
      writing: {
        summarize_written_text: -1,
        write_essay: -1,
      },
      reading: {
        multiple_choice_single: -1,
        multiple_choice_multiple: -1,
        reorder_paragraphs: -1,
        fill_in_blanks: -1,
        reading_writing_fill_blanks: -1,
      },
      listening: {
        summarize_spoken_text: -1,
        multiple_choice_single: -1,
        multiple_choice_multiple: -1,
        fill_in_blanks: -1,
        highlight_correct_summary: -1,
        select_missing_word: -1,
        highlight_incorrect_words: -1,
        write_from_dictation: -1,
      },
    },

    dailyAiCredits: -1, // Unlimited
    aiScoringPriority: 'normal',

    features: {
      testHistory: true, // Full history
      detailedAnalytics: true,
      studyPlan: false,
      teacherReview: false,
      sectionTests: -1, // Unlimited
      downloadReports: true,
    },
  },

  [SubscriptionTier.PREMIUM]: {
    mockTestsAllowed: -1,
    mockTestsAvailable: Array.from({ length: 200 }, (_, i) => i + 1),

    practiceLimits: {
      speaking: {
        read_aloud: -1,
        repeat_sentence: -1,
        describe_image: -1,
        retell_lecture: -1,
        answer_short_question: -1,
      },
      writing: {
        summarize_written_text: -1,
        write_essay: -1,
      },
      reading: {
        multiple_choice_single: -1,
        multiple_choice_multiple: -1,
        reorder_paragraphs: -1,
        fill_in_blanks: -1,
        reading_writing_fill_blanks: -1,
      },
      listening: {
        summarize_spoken_text: -1,
        multiple_choice_single: -1,
        multiple_choice_multiple: -1,
        fill_in_blanks: -1,
        highlight_correct_summary: -1,
        select_missing_word: -1,
        highlight_incorrect_words: -1,
        write_from_dictation: -1,
      },
    },

    dailyAiCredits: -1,
    aiScoringPriority: 'high', // Priority queue

    features: {
      testHistory: true,
      detailedAnalytics: true,
      studyPlan: true, // AI-generated study plans
      teacherReview: true, // If linked with teacher
      sectionTests: -1,
      downloadReports: true,
    },
  },
}

/**
 * Get tier configuration for a user's subscription
 */
export function getTierConfig(tier: SubscriptionTier | string): TierLimits {
  const tierKey = tier.toLowerCase() as SubscriptionTier
  return TIER_CONFIGS[tierKey] || TIER_CONFIGS[SubscriptionTier.FREE]
}

/**
 * Check if user can access a specific mock test
 */
export function canAccessMockTest(
  tier: SubscriptionTier | string,
  testNumber: number
): boolean {
  const config = getTierConfig(tier)
  return config.mockTestsAvailable.includes(testNumber)
}

/**
 * Check if user can practice a specific question type
 */
export function canPracticeQuestionType(
  tier: SubscriptionTier | string,
  section: string,
  questionType: string,
  attemptsToday: number
): boolean {
  const config = getTierConfig(tier)
  const limit = config.practiceLimits[section]?.[questionType]

  if (limit === undefined) return true // No limit defined
  if (limit === -1) return true // Unlimited

  return attemptsToday < limit
}

/**
 * Get remaining practice attempts for a question type
 */
export function getRemainingPracticeAttempts(
  tier: SubscriptionTier | string,
  section: string,
  questionType: string,
  attemptsToday: number
): number {
  const config = getTierConfig(tier)
  const limit = config.practiceLimits[section]?.[questionType]

  if (limit === undefined || limit === -1) return -1 // Unlimited

  return Math.max(0, limit - attemptsToday)
}

/**
 * Check if user has AI credits available
 */
export function hasAiCreditsAvailable(
  tier: SubscriptionTier | string,
  creditsUsedToday: number
): boolean {
  const config = getTierConfig(tier)

  if (config.dailyAiCredits === -1) return true // Unlimited

  return creditsUsedToday < config.dailyAiCredits
}

/**
 * Get remaining AI credits for today
 */
export function getRemainingAiCredits(
  tier: SubscriptionTier | string,
  creditsUsedToday: number
): number {
  const config = getTierConfig(tier)

  if (config.dailyAiCredits === -1) return -1 // Unlimited

  return Math.max(0, config.dailyAiCredits - creditsUsedToday)
}

/**
 * Tier pricing (for display)
 */
export const TIER_PRICING = {
  [SubscriptionTier.FREE]: {
    price: 0,
    period: 'forever',
    displayPrice: 'Free',
  },
  [SubscriptionTier.PRO]: {
    price: 29,
    period: 'month',
    displayPrice: '$29/month',
  },
  [SubscriptionTier.PREMIUM]: {
    price: 49,
    period: 'month',
    displayPrice: '$49/month',
  },
}

/**
 * Tier features for marketing/comparison
 */
export const TIER_FEATURES_DISPLAY = {
  [SubscriptionTier.FREE]: [
    '1 Free Mock Test',
    'Limited Practice Questions',
    '10 AI Scoring Credits/Day',
    'Basic Test History',
    '2 Section Tests per Type',
  ],
  [SubscriptionTier.PRO]: [
    'All 200 Mock Tests',
    'Unlimited Practice',
    'Unlimited AI Scoring',
    'Full Test History',
    'Detailed Analytics',
    'Unlimited Section Tests',
    'Download Reports',
  ],
  [SubscriptionTier.PREMIUM]: [
    'Everything in Pro',
    'Priority AI Scoring',
    'Personalized Study Plans',
    'Teacher Review Access',
    'Advanced Analytics',
    'Priority Support',
  ],
}
