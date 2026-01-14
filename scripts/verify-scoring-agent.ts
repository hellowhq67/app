
import { db } from '@/lib/db';
import { pteQuestions } from '@/lib/db/schema';
import { scoreAndSaveAttempt } from '@/lib/pte/scoring-dispatcher';
import { QuestionType } from '@/lib/types';
// Remove pipeline import to isolate the agent test first
// import { runMockTestScoringPipeline } from '@/lib/pte/scoring-engine/pipeline';
import { v4 as uuidv4 } from 'uuid';

async function verifyPart1Scoring() {
    console.log('[Verification] Starting Part 1 (Speaking & Writing) Verification...');

    // 1. Get a User
    const user = await db.query.users.findFirst();
    if (!user) {
        console.error('No users found. Please seed the database.');
        process.exit(1);
    }
    console.log(`[Verification] Using User: ${user.email} (${user.id})`);

    // 2. Get ANY Question (to ensure valid FK)
    const dbQuestion = await db.query.pteQuestions.findFirst();

    if (!dbQuestion) {
        console.error('No questions found in DB. Cannot verify FK constraints.');
        process.exit(1);
    }

    // Mock a Read Aloud Question using the valid ID
    const mockQuestion = {
        id: dbQuestion.id,
        content: 'The quick brown fox jumps over the lazy dog.',
        questionType: QuestionType.READ_ALOUD,
        speaking: { sampleTranscript: 'The quick brown fox jumps over the lazy dog.' }
    };

    console.log(`[Verification] Using Real Question ID: ${mockQuestion.id}`);
    console.log(`[Verification] Simulating Question Type: ${mockQuestion.questionType}`);

    // 3. Simulate Submission
    const mockSubmission = {
        text: 'The quick brown fox jumps over the lazy dog.', // Perfect response
        audioUrl: 'https://example.com/mock-audio.mp3'
    };

    console.log('[Verification] Submitting response...');

    // 4. Score and Save
    try {
        const result = await scoreAndSaveAttempt(
            user.id,
            mockQuestion,
            mockSubmission,
            QuestionType.READ_ALOUD
        );

        console.log('[Verification] Score & Save Result:', JSON.stringify(result, null, 2));

        if (result.feedback.overallScore > 80) {
            console.log('✅ PASS: Scoring Agent returned a high score for perfect response.');
        } else {
            console.log('⚠️ CHECK: Score might be low?', result.feedback.overallScore);
        }

    } catch (error) {
        console.error('[Verification] Failed:', error);
    }

    console.log('[Verification] Completed.');
    process.exit(0);
}

verifyPart1Scoring();
