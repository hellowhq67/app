import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
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
  accuracy: z.object({ score: z.number(), feedback: z.string() }).optional(), // Added for Reading and Listening
  suggestions: z.array(z.string()),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
}) satisfies z.ZodType<AIFeedbackData>

// Zod schema for SpeakingFeedbackData - for now, identical to AIFeedbackDataSchema,
// but can be specialized later if needed.
const SpeakingFeedbackDataSchema = AIFeedbackDataSchema satisfies z.ZodType<SpeakingFeedbackData>

/**
 * Scores a user's response for a given PTE question type using an AI model.
 *
 * @param type The type of the question to score.
 * @param params Object containing parameters specific to the question type.
 * @returns A promise that resolves to the AI-generated feedback data.
 */
export async function scorePteAttempt(
  type: QuestionType,
  params: {
    promptTopic?: string // For writing
    originalText?: string // For speaking (read aloud)
    userInput?: string // For writing
    wordCount?: number // For writing, summarize spoken text
    userTranscript?: string // For speaking
    questionText?: string // For reading (common), listening (text-based)
    options?: string[] // For multiple choice
    paragraphs?: string[] // For reorder paragraphs
    wordBank?: string[] // For listening fill in blanks (word bank)
    answerKey?: any // Correct answers (string, string[], number[], Record<string, string>)
    userResponse?: any // User's response (string, string[], number[], Record<string, string>)
    audioTranscript?: string // For listening, the original transcript of the audio
  }
): Promise<AIFeedbackData | SpeakingFeedbackData> {
  const prompt = getPromptForQuestionType(type, params)
  let schema: z.ZodType<AIFeedbackData | SpeakingFeedbackData>

  // Determine which schema to use based on question type
  if (
    type === QuestionType.READ_ALOUD
  ) {
    schema = SpeakingFeedbackDataSchema
  } else {
    schema = AIFeedbackDataSchema
  }

  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: schema,
    prompt,
  })

  return object
}