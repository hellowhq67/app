import { z } from 'zod'
import { AIFeedbackData, SpeakingFeedbackData } from '@/lib/types'

// Define the Zod schema for the feedback data based on the type definition
export const AIFeedbackDataSchema = z.object({
    overallScore: z.number().describe('Sum of raw trait points (e.g., 12/15)'),
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
    form: z.object({ score: z.number(), feedback: z.string() }).optional(),
    wordMarking: z.array(z.object({
        word: z.string(),
        classification: z.enum(['good', 'average', 'poor', 'pause', 'omitted', 'inserted', 'filler']),
        feedback: z.string().optional()
    })).optional(),
    suggestions: z.array(z.string()).describe('List of actionable suggestions for improvement'),
    strengths: z.array(z.string()).describe('List of strengths identified in the response'),
    areasForImprovement: z.array(z.string()).describe('List of specific areas to improve'),
    transcript: z.string().optional().describe('Transcribed text from audio'),
}) satisfies z.ZodType<AIFeedbackData>


export const SpeakingFeedbackDataSchema = AIFeedbackDataSchema satisfies z.ZodType<SpeakingFeedbackData>
