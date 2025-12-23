'use server'

import { scorePteAttempt } from '@/lib/ai/scoring'
import { AIFeedbackData, QuestionType, SpeakingFeedbackData } from '@/lib/types'
import { upload } from '@vercel/blob'
import { countWords } from '@/lib/utils'

/**
 * Server action to score a "Write Essay" attempt.
 *
 * @param promptTopic The topic of the essay prompt.
 * @param essayText The user's written essay.
 * @param wordCount The word count of the essay.
 * @returns The AI-generated feedback and score.
 */
export async function scoreWritingAttempt(
  promptTopic: string,
  essayText: string,
  wordCount: number
): Promise<{ success: boolean; feedback?: AIFeedbackData; error?: string }> {
  try {
    const feedback = await scorePteAttempt(QuestionType.WRITE_ESSAY, {
      promptTopic,
      userInput: essayText,
      wordCount,
    })
    return { success: true, feedback: feedback as AIFeedbackData }
  } catch (error) {
    console.error('Error scoring writing attempt:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred.',
    }
  }
}

/**
 * Server action to score a "Read Aloud" speaking attempt.
 *
 * @param audioFile The user's recorded audio as a File object.
 * @param originalText The original text the user was supposed to read.
 * @param questionId The ID of the question.
 * @returns The AI-generated feedback and score.
 */
export async function scoreReadAloudAttempt(
  audioFile: File,
  originalText: string,
  questionId: string
): Promise<{ success: boolean; feedback?: SpeakingFeedbackData; audioUrl?: string; error?: string }> {
  try {
    // 1. Upload audio to Vercel Blob storage
    const blob = await upload(
      `pte/speaking/${questionId}/${audioFile.name}`,
      audioFile,
      {
        access: 'public',
      }
    )

    // 2. Transcribe audio using real transcription service
    let userTranscript = ''
    try {
      const { getTranscriber } = await import('@/lib/pte/transcription')
      const transcriber = await getTranscriber()
      const transcriptionResult = await transcriber.transcribe({ audioUrl: blob.url })
      userTranscript = transcriptionResult.transcript || ''
    } catch (error) {
      console.error('Transcription error:', error)
      // Continue with empty transcript - AI will still score based on audio analysis
    }

    // 3. Score the attempt using AI
    const feedback = await scorePteAttempt(QuestionType.READ_ALOUD, {
      originalText,
      userTranscript,
    })

    return { success: true, feedback: feedback as SpeakingFeedbackData, audioUrl: blob.url }
  } catch (error) {
    console.error('Error scoring Read Aloud attempt:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred.',
    }
  }
}

/**
 * Server action to score a Reading attempt.
 *
 * @param type The specific type of the reading question.
 * @param questionText The text of the question.
 * @param options Options for multiple choice questions.
 * @param paragraphs Paragraphs for reorder paragraphs question.
 * @param answerKey The correct answer(s) for the question.
 * @param userResponse The user's response to the question.
 * @returns The AI-generated feedback and score.
 */
export async function scoreReadingAttempt(
  type:
    | QuestionType.MULTIPLE_CHOICE_SINGLE
    | QuestionType.MULTIPLE_CHOICE_MULTIPLE
    | QuestionType.REORDER_PARAGRAPHS
    | QuestionType.READING_BLANKS
    | QuestionType.READING_WRITING_BLANKS,
  questionText: string,
  options: string[] | undefined,
  paragraphs: string[] | undefined,
  answerKey: any,
  userResponse: any
): Promise<{ success: boolean; feedback?: AIFeedbackData; error?: string }> {
  try {
    const feedback = await scorePteAttempt(type, {
      questionText,
      options,
      paragraphs,
      answerKey,
      userResponse,
    })
    return { success: true, feedback: feedback as AIFeedbackData }
  } catch (error) {
    console.error('Error scoring reading attempt:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred.',
    }
  }
}

/**
 * Server action to score a Listening attempt.
 *
 * @param type The specific type of the listening question.
 * @param questionText The text of the question (if applicable).
 * @param options Options for multiple choice questions.
 * @param wordBank Word bank for fill in the blanks questions.
 * @param audioTranscript The original transcript of the audio played.
 * @param answerKey The correct answer(s) for the question.
 * @param userResponse The user's response to the question.
 * @returns The AI-generated feedback and score.
 */
export async function scoreListeningAttempt(
  type:
    | QuestionType.SUMMARIZE_SPOKEN_TEXT
    | QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE
    | QuestionType.LISTENING_BLANKS
    | QuestionType.HIGHLIGHT_CORRECT_SUMMARY
    | QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE
    | QuestionType.SELECT_MISSING_WORD
    | QuestionType.HIGHLIGHT_INCORRECT_WORDS
    | QuestionType.WRITE_FROM_DICTATION,
  questionText: string | undefined,
  options: string[] | undefined,
  wordBank: string[] | undefined,
  audioTranscript: string | undefined, // Essential for most listening types
  answerKey: any,
  userResponse: any
): Promise<{ success: boolean; feedback?: AIFeedbackData; error?: string }> {
  try {
    let wordCount: number | undefined
    if (type === QuestionType.SUMMARIZE_SPOKEN_TEXT) {
      wordCount = countWords(userResponse as string)
    }

    const feedback = await scorePteAttempt(type, {
      questionText,
      options,
      wordBank,
      audioTranscript,
      answerKey,
      userResponse,
      wordCount,
    })
    return { success: true, feedback: feedback as AIFeedbackData }
  } catch (error) {
    console.error('Error scoring listening attempt:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred.',
    }
  }
}