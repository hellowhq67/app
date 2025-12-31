'use server'

import { scorePteAttemptV2 } from '@/lib/ai/scoring-agent';
import { AIFeedbackData, QuestionType, SpeakingFeedbackData } from '@/lib/types';
import { upload } from '@vercel/blob';
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
    const blob = await upload(
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
    const blob = await upload(
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
 * Server action to score a Reading attempt.
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

    // Check credits
    await checkAndUseCredits(session.user.id);

    // Build question content
    let questionContent = questionText;
    if (paragraphs) {
      questionContent += '\n\nParagraphs:\n' + paragraphs.map((p, i) => `${i + 1}. ${p}`).join('\n');
    }
    if (options) {
      questionContent += '\n\nOptions:\n' + options.map((o, i) => `${i + 1}. ${o}`).join('\n');
    }

    // Score using Gemini
    const feedback = await scorePteAttemptV2(type, {
      questionContent,
      submission: { text: JSON.stringify(userResponse) },
      userId: session.user.id,
      questionId,
    });

    // Save to database
    const attempt = await savePteAttempt({
      userId: session.user.id,
      questionId,
      questionType: type,
      responseData: { userResponse, answerKey },
      aiFeedback: feedback,
    });

    // Track AI usage
    await trackAIUsage({
      userId: session.user.id,
      attemptId: attempt.id,
      provider: 'google',
      model: 'gemini-1.5-flash-latest',
      totalTokens: 0,
      cost: 0,
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

    let wordCount: number | undefined;
    if (type === QuestionType.SUMMARIZE_SPOKEN_TEXT) {
      wordCount = countWords(userResponse as string);
    }

    // Build question content
    let questionContent = questionText || '';
    if (audioTranscript) {
      questionContent += '\n\nAudio Transcript:\n' + audioTranscript;
    }
    if (options) {
      questionContent += '\n\nOptions:\n' + options.map((o, i) => `${i + 1}. ${o}`).join('\n');
    }
    if (wordBank) {
      questionContent += '\n\nWord Bank:\n' + wordBank.join(', ');
    }

    // Score using Gemini
    const feedback = await scorePteAttemptV2(type, {
      questionContent,
      submission: { text: typeof userResponse === 'string' ? userResponse : JSON.stringify(userResponse) },
      userId: session.user.id,
      questionId,
    });

    // Save to database
    const attempt = await savePteAttempt({
      userId: session.user.id,
      questionId,
      questionType: type,
      responseText: typeof userResponse === 'string' ? userResponse : undefined,
      responseData: typeof userResponse === 'string' ? undefined : { userResponse, answerKey },
      aiFeedback: feedback,
    });

    // Track AI usage
    await trackAIUsage({
      userId: session.user.id,
      attemptId: attempt.id,
      provider: 'google',
      model: 'gemini-1.5-flash-latest',
      totalTokens: 0,
      cost: 0,
    });

    return { success: true, feedback, attemptId: attempt.id };
  } catch (error) {
    console.error('Error scoring listening attempt:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred.',
    };
  }
}