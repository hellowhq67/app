'use server'

import { scorePteAttempt } from '@/lib/ai/scoring'
import { QuestionType, AIFeedbackData, TestSection } from '@/lib/types'

/**
 * Get real AI feedback for speaking attempts
 */
export async function getAIFeedback(
  type: QuestionType,
  params: {
    originalText?: string
    userTranscript?: string
    promptText?: string
    questionText?: string
    options?: string[]
    paragraphs?: string[]
    wordBank?: string[]
    answerKey?: any
    userResponse?: any
    audioTranscript?: string
    promptTopic?: string
    userInput?: string
    wordCount?: number
  }
): Promise<AIFeedbackData> {
  try {
    const feedback = await scorePteAttempt(type, params)
    return feedback as AIFeedbackData
  } catch (error) {
    console.error('AI scoring error:', error)
    // Return minimal feedback structure on error
    return {
      overallScore: 0,
      suggestions: ['AI scoring temporarily unavailable. Please try again.'],
      strengths: [],
      areasForImprovement: ['Unable to analyze response at this time.'],
    }
  }
}

/**
 * Legacy mock function - now calls real AI
 * @deprecated Use getAIFeedback instead
 */
export function getMockAIFeedback(transcript: string): AIFeedbackData {
  // This is a fallback - should not be used in production
  // Real implementation should use getAIFeedback
  return {
    overallScore: 0,
    pronunciation: { score: 0, feedback: 'Mock feedback - use real AI scoring' },
    fluency: { score: 0, feedback: 'Mock feedback - use real AI scoring' },
    content: { score: 0, feedback: 'Mock feedback - use real AI scoring' },
    suggestions: ['Use real AI scoring'],
    strengths: [],
    areasForImprovement: ['Enable real AI scoring'],
  }
}

/**
 * Calculate weighted score from AI feedback
 */
export function getWeightedScore(
  feedback: AIFeedbackData,
  section: TestSection
): number {
  // Convert AI feedback scores (0-90 scale) to weighted total
  let total = 0
  let weightSum = 0

  if (feedback.pronunciation) {
    total += feedback.pronunciation.score * 0.3
    weightSum += 0.3
  }
  if (feedback.fluency) {
    total += feedback.fluency.score * 0.3
    weightSum += 0.3
  }
  if (feedback.content) {
    total += feedback.content.score * 0.4
    weightSum += 0.4
  }

  // If no subscores, use overallScore
  if (weightSum === 0) {
    return feedback.overallScore || 0
  }

  // Normalize to 0-90 scale
  return Math.round((total / weightSum) * 90) / 90 * 90
}

