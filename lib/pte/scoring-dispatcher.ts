import { db } from '@/lib/db';
import { pteSectionalAttempts, pteAttempts, users } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { QuestionType } from '@/lib/types';
import { scorePteAttemptV2 } from '@/lib/ai/scoring-agent';
import { scoreDeterministic } from '@/lib/ai/deterministic-scoring';
import { savePteAttempt, trackAIUsage } from '@/lib/db/queries/pte-scoring';

export function buildDeterministicAnswer(
    type: QuestionType,
    answerKey: any,
    options?: any,
    paragraphs?: string[]
): any {
    if (typeof answerKey === 'object' && !Array.isArray(answerKey)) {
        return { correctBlanks: answerKey };
    }
    const opts = Array.isArray(options) ? options : options?.choices;

    if (Array.isArray(answerKey) && answerKey.length > 0) {
        switch (type) {
            case QuestionType.MULTIPLE_CHOICE_SINGLE:
            case QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE:
                return { correctOption: opts?.[answerKey[0]] || '' };

            case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
            case QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE:
                return { correctOptions: answerKey.map((idx: number) => opts?.[idx] || '').filter(Boolean) };

            case QuestionType.REORDER_PARAGRAPHS:
                return { correctOrder: answerKey.map((idx: number) => paragraphs?.[idx] || '').filter(Boolean) };

            default:
                return {};
        }
    }
    return {};
}

export async function scoreAndSaveAttempt(
    userId: string,
    question: any,
    answer: any,
    type: QuestionType
): Promise<{ attemptId: string; feedback: any }> {
    let attemptId: string = '';
    let feedback: any;

    // A. SPEAKING & WRITING (AI)
    if (type.includes('speaking') || type.includes('read_aloud') || type.includes('repeat') || type.includes('describe') || type.includes('retell') ||
        type.includes('writing') || type === QuestionType.WRITE_ESSAY || type === QuestionType.SUMMARIZE_WRITTEN_TEXT ||
        type === QuestionType.SUMMARIZE_SPOKEN_TEXT || type.includes('respond_to_situation') || type.includes('summarize_group_discussion')) {

        let content = question.content || '';
        if (question.writing?.promptText) content = question.writing.promptText;
        if (question.speaking?.sampleTranscript) content = question.speaking.sampleTranscript; // For reading aloud against text?

        // Special Listening case
        if (type === QuestionType.SUMMARIZE_SPOKEN_TEXT) {
            const transcript = question.listening?.transcript || '';
            content += '\n\nAudio Transcript:\n' + transcript;
        }

        const submission: any = {};
        if (answer.audioUrl) submission.audioUrl = answer.audioUrl;
        if (answer.text) submission.text = answer.text;

        feedback = await scorePteAttemptV2(type, {
            questionContent: content,
            submission,
            userId,
            questionId: question.id
        });

        const saved = await savePteAttempt({
            userId,
            questionId: question.id,
            questionType: type,
            responseAudioUrl: answer.audioUrl,
            responseText: answer.text,
            aiFeedback: feedback
        });
        attemptId = saved.id;

        // Track Usage
        await trackAIUsage({
            userId,
            attemptId: saved.id,
            provider: 'google',
            model: 'gemini-1.5-pro-latest', // or flash depending on type
            totalTokens: 0,
            cost: 0,
        });
    }
    // B. DETERMINISTIC (Reading & Listening others)
    else {
        let correctAnswer: any = {};
        let options: any = undefined;
        let paragraphs: any = undefined;

        if (question.reading) {
            options = question.reading.options || question.correctAnswer?.options;
            paragraphs = question.reading.options?.paragraphs;
            correctAnswer = buildDeterministicAnswer(
                type,
                question.reading.correctAnswerPositions || question.correctAnswer,
                options,
                paragraphs
            );
        } else if (question.listening) {
            options = question.listening.options;
            correctAnswer = buildDeterministicAnswer(
                type,
                question.listening.correctAnswerPositions || question.correctAnswer,
                options
            );
            if (question.correctAnswer?.correctText) correctAnswer['correctText'] = question.correctAnswer.correctText;
            if (question.correctAnswer?.incorrectWords) correctAnswer['incorrectWords'] = question.correctAnswer.incorrectWords;
        }

        feedback = scoreDeterministic(type, answer, correctAnswer);

        const saved = await savePteAttempt({
            userId,
            questionId: question.id,
            questionType: type,
            responseData: { userResponse: answer, answerKey: correctAnswer },
            aiFeedback: feedback || undefined
        });
        attemptId = saved.id;
    }

    return { attemptId, feedback };
}
