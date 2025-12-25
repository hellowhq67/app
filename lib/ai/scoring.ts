import { generateObject } from 'ai'
import { proModel, fastModel } from './config'
import { getPromptForQuestionType } from './prompts'
import { QuestionType, AIFeedbackData, SpeakingFeedbackData } from '@/lib/types'
import { z } from 'zod'

// Define the Zod schema for the feedback data based on the type definition
const AIFeedbackDataSchema = z.object({
  overallScore: z.number(),
  pronunciation: z
    .object({ score: z.number(), feedback: z.string() })
    .optional(),
  fluency: z.object({ score: z.number(), feedback: z.string() }).optional(),
  grammar: z.object({ score: z.number(), feedback: z.string() }).optional(),
  vocabulary: z.object({ score: z.number(), feedback: z.string() }).optional(),
  content: z.object({ score: z.number(), feedback: z.string() }).optional(),
  spelling: z.object({ score: z.number(), feedback: z.string() }).optional(),
  structure: z.object({ score: z.number(), feedback: z.string() }).optional(),
  accuracy: z.object({ score: z.number(), feedback: z.string() }).optional(),
  suggestions: z.array(z.string()),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
}) satisfies z.ZodType<AIFeedbackData>

const SpeakingFeedbackDataSchema = AIFeedbackDataSchema satisfies z.ZodType<SpeakingFeedbackData>

/**
 * Scores a user's response for a given PTE question type using an AI model.
 */
export async function scorePteAttempt(
  type: QuestionType,
  params: {
    promptTopic?: string
    originalText?: string
    userInput?: string
    wordCount?: number
    userTranscript?: string
    questionText?: string
    options?: string[]
    paragraphs?: string[]
    wordBank?: string[]
    answerKey?: any
    userResponse?: any
    audioTranscript?: string
  }
): Promise<AIFeedbackData | SpeakingFeedbackData> {
  const prompt = getPromptForQuestionType(type, params)

  // Use pro model for complex tasks, fast model for simple ones
  const model = [
    QuestionType.WRITE_ESSAY,
    QuestionType.SUMMARIZE_SPOKEN_TEXT,
    QuestionType.READ_ALOUD
  ].includes(type) ? proModel : fastModel;

  let schema: z.ZodType<AIFeedbackData | SpeakingFeedbackData>

  if (type === QuestionType.READ_ALOUD) {
    schema = SpeakingFeedbackDataSchema
  } else {
    schema = AIFeedbackDataSchema
  }

  const { object } = await generateObject({
    model,
    schema,
    prompt,
    temperature: 0.1, // Keep it consistent for scoring
  })

  return object
}