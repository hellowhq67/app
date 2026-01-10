'use server'

import { scorePteAttemptV2 } from '@/lib/ai/scoring-agent';
import { scoreDeterministic } from '@/lib/ai/deterministic-scoring';
import { AIFeedbackData, QuestionType, SpeakingFeedbackData } from '@/lib/types';
import { put } from '@vercel/blob';
import { countWords } from '@/lib/utils';
import { savePteAttempt, trackAIUsage } from '@/lib/db/queries/pte-scoring';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db/drizzle';
import { eq, sql } from 'drizzle-orm';
import { users } from '@/lib/db/schema';

/**
 * Check and decrement user credits
 */
async function checkAndUseCredits(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if user has AI credits
  const isFreeMode = process.env.NEXT_PUBLIC_FREE_MODE === 'true';
  if (isFreeMode) {
    console.log('[Free Mode] Bypassing credit check');
    return user;
  }

  if (user.aiCreditsUsed >= user.dailyAiCredits) {
    throw new Error('Daily AI credits exhausted. Upgrade to VIP for unlimited scoring.');
  }

  // Update user AI credits
  await db
    .update(users)
    .set({
      aiCreditsUsed: sql`${users.aiCreditsUsed} + 1`,
    })
    .where(eq(users.id, userId));

  return user;
}

/**
 * Server action to score a "Write Essay" attempt.
 */
export async function scoreWritingAttempt(
  promptTopic: string,
  essayText: string,
  wordCount: number,
  questionId: string
): Promise<{ success: boolean; feedback?: AIFeedbackData; error?: string; attemptId?: string }> {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check credits
    await checkAndUseCredits(session.user.id);

    // Score using Gemini
    const feedback = await scorePteAttemptV2(QuestionType.WRITE_ESSAY, {
      questionContent: promptTopic,
      submission: { text: essayText },
      userId: session.user.id,
      questionId,
    });

    // Save to database
    const attempt = await savePteAttempt({
      userId: session.user.id,
      questionId,
      questionType: QuestionType.WRITE_ESSAY,
      responseText: essayText,
      aiFeedback: feedback,
    });

    // Track AI usage
    await trackAIUsage({
      userId: session.user.id,
      attemptId: attempt.id,
      provider: 'google',
      model: 'gemini-1.5-pro-latest',
      totalTokens: 0,
      cost: 0,
    });

    return { success: true, feedback, attemptId: attempt.id };
  } catch (error) {
    console.error('Error scoring writing attempt:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred.',
    };
  }
}

/**
 * Server action to score a "Read Aloud" speaking attempt.
 */
export async function scoreReadAloudAttempt(
  audioFile: File,
  originalText: string,
  questionId: string
): Promise<{ success: boolean; feedback?: SpeakingFeedbackData; audioUrl?: string; error?: string; attemptId?: string }> {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check credits
    await checkAndUseCredits(session.user.id);

    // 1. Upload audio to Vercel Blob storage
    const blob = await put(
      `pte/speaking/${questionId}/${Date.now()}-${audioFile.name}`,
      audioFile,
      {
        access: 'public',
      }
    );

    // 2. Score using Gemini with audio transcription
    const feedback = await scorePteAttemptV2(QuestionType.READ_ALOUD, {
      questionContent: originalText,
      submission: { audioUrl: blob.url },
      userId: session.user.id,
      questionId,
    });

    // 3. Save to database
    const attempt = await savePteAttempt({
      userId: session.user.id,
      questionId,
      questionType: QuestionType.READ_ALOUD,
      responseAudioUrl: blob.url,
      aiFeedback: feedback,
    });

    // 4. Track AI usage
    await trackAIUsage({
      userId: session.user.id,
      attemptId: attempt.id,
      provider: 'google',
      model: 'gemini-1.5-pro-latest',
      totalTokens: 0,
      cost: 0,
    });

    return { success: true, feedback: feedback as SpeakingFeedbackData, audioUrl: blob.url, attemptId: attempt.id };
  } catch (error) {
    console.error('Error scoring Read Aloud attempt:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred.',
    };
  }
}

/**
 * Server action to score any Speaking question type (Repeat Sentence, Describe Image, etc.)
 */
export async function scoreSpeakingAttempt(
  type: QuestionType,
  audioFile: File,
  questionContent: string,
  questionId: string
): Promise<{ success: boolean; feedback?: SpeakingFeedbackData; audioUrl?: string; error?: string; attemptId?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check credits
    await checkAndUseCredits(session.user.id);

    // 1. Upload audio to Vercel Blob
    const blob = await put(
      `pte/speaking/${type.toLowerCase().replace(/\s+/g, '-')}/${questionId}/${Date.now()}-${audioFile.name}`,
      audioFile,
      {
        access: 'public',
      }
    );

    // 2. Score using Gemini V2
    const feedback = await scorePteAttemptV2(type, {
      questionContent,
      submission: { audioUrl: blob.url },
      userId: session.user.id,
      questionId,
    });

    // 3. Save to database
    const attempt = await savePteAttempt({
      userId: session.user.id,
      questionId,
      questionType: type,
      responseAudioUrl: blob.url,
      aiFeedback: feedback,
    });

    // 4. Track usage
    await trackAIUsage({
      userId: session.user.id,
      attemptId: attempt.id,
      provider: 'google',
      model: 'gemini-1.5-pro-latest',
      totalTokens: 0,
      cost: 0,
    });

    return { success: true, feedback, audioUrl: blob.url, attemptId: attempt.id };
  } catch (error) {
    console.error(`Error scoring ${type} attempt:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred.',
    };
  }
}

/**
 * Helper function to build deterministic answer structure from position indices
 */
function buildDeterministicAnswer(
  type: QuestionType,
  answerKey: any,
  options?: string[],
  paragraphs?: string[]
): {
  correctOption?: string;
  correctOptions?: string[];
  correctOrder?: string[];
  correctBlanks?: Record<string, string>;
} {
  // If answerKey is already an object (for fill blanks), return it directly
  if (typeof answerKey === 'object' && !Array.isArray(answerKey)) {
    return { correctBlanks: answerKey };
  }

  // If answerKey is an array of positions
  if (Array.isArray(answerKey) && answerKey.length > 0) {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE_SINGLE:
        return {
          correctOption: options?.[answerKey[0]] || ''
        };

      case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
        return {
          correctOptions: answerKey.map((idx: number) => options?.[idx] || '').filter(Boolean)
        };

      case QuestionType.REORDER_PARAGRAPHS:
        return {
          correctOrder: answerKey.map((idx: number) => paragraphs?.[idx] || '').filter(Boolean)
        };

      default:
        return {};
    }
  }

  return {};
}

/**
 * Server action to score a Reading attempt.
 * Uses deterministic (rule-based) scoring for all reading types.
 */
export async function scoreReadingAttempt(
  type:
    | QuestionType.MULTIPLE_CHOICE_SINGLE
    | QuestionType.MULTIPLE_CHOICE_MULTIPLE
    | QuestionType.REORDER_PARAGRAPHS
    | QuestionType.READING_BLANKS
    | QuestionType.READING_WRITING_BLANKS,
  questionText: string,
  questionId: string,
  options: string[] | undefined,
  paragraphs: string[] | undefined,
  answerKey: any,
  userResponse: any
): Promise<{ success: boolean; feedback?: AIFeedbackData; error?: string; attemptId?: string }> {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check credits (for deterministic scoring, we could skip this, but keeping for consistency)
    await checkAndUseCredits(session.user.id);

    // Build correct answer structure from answerKey
    const correctAnswer = buildDeterministicAnswer(type, answerKey, options, paragraphs);

    // Build user submission structure
    const userSubmission = {
      selectedOption: userResponse?.selectedOption,
      selectedOptions: userResponse?.selectedOptions,
      orderedParagraphs: userResponse?.orderedParagraphs,
      filledBlanks: userResponse?.filledBlanks,
    };

    // Score using deterministic scoring
    const feedback = scoreDeterministic(type, userSubmission, correctAnswer);

    if (!feedback) {
      return {
        success: false,
        error: 'Unable to score this question type deterministically. Please contact support.',
      };
    }

    // Save to database
    const attempt = await savePteAttempt({
      userId: session.user.id,
      questionId,
      questionType: type,
      responseData: { userResponse, answerKey },
      aiFeedback: feedback,
    });

    return { success: true, feedback, attemptId: attempt.id };
  } catch (error) {
    console.error('Error scoring reading attempt:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred.',
    };
  }
}

/**
 * Server action to score a Listening attempt.
 * Uses AI scoring ONLY for SUMMARIZE_SPOKEN_TEXT.
 * Uses deterministic (rule-based) scoring for all other listening types.
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
  questionId: string,
  options: string[] | undefined,
  wordBank: string[] | undefined,
  audioTranscript: string | undefined,
  answerKey: any,
  userResponse: any
): Promise<{ success: boolean; feedback?: AIFeedbackData; error?: string; attemptId?: string }> {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check credits
    await checkAndUseCredits(session.user.id);

    let feedback: AIFeedbackData | null = null;

    // CONDITIONAL SCORING: AI only for SUMMARIZE_SPOKEN_TEXT
    if (type === QuestionType.SUMMARIZE_SPOKEN_TEXT) {
      // AI Scoring for Summarize Spoken Text
      let questionContent = questionText || '';
      if (audioTranscript) {
        questionContent += '\n\nAudio Transcript:\n' + audioTranscript;
      }

      feedback = await scorePteAttemptV2(type, {
        questionContent,
        submission: { text: userResponse as string },
        userId: session.user.id,
        questionId,
      });

      // Save to database
      const attempt = await savePteAttempt({
        userId: session.user.id,
        questionId,
        questionType: type,
        responseText: userResponse as string,
        aiFeedback: feedback,
      });

      // Track AI usage for AI-scored question
      await trackAIUsage({
        userId: session.user.id,
        attemptId: attempt.id,
        provider: 'google',
        model: 'gemini-1.5-flash-latest',
        totalTokens: 0,
        cost: 0,
      });

      return { success: true, feedback, attemptId: attempt.id };
    } else {
      // Deterministic Scoring for all other listening types
      const correctAnswer = buildDeterministicAnswer(type, answerKey, options);

      // Build user submission structure
      const userSubmission = {
        selectedOption: userResponse?.selectedOption,
        selectedOptions: userResponse?.selectedOptions,
        filledBlanks: userResponse?.filledBlanks,
        highlightedWords: userResponse?.highlightedWords,
        textAnswer: typeof userResponse === 'string' ? userResponse : userResponse?.textAnswer,
      };

      // Score using deterministic scoring
      feedback = scoreDeterministic(type, userSubmission, {
        ...correctAnswer,
        correctText: answerKey?.correctText,
        incorrectWords: answerKey?.incorrectWords,
      });

      if (!feedback) {
        return {
          success: false,
          error: 'Unable to score this question type deterministically. Please contact support.',
        };
      }

      // Save to database
      const attempt = await savePteAttempt({
        userId: session.user.id,
        questionId,
        questionType: type,
        responseData: { userResponse, answerKey },
        aiFeedback: feedback,
      });

      return { success: true, feedback, attemptId: attempt.id };
    }
  } catch (error) {
    console.error('Error scoring listening attempt:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred.',
    };
  }
}