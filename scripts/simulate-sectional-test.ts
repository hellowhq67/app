import { db } from '@/lib/db';
import { pteQuestions, pteQuestionTypes, pteSectionalTests, pteAttempts, users } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { config } from 'dotenv';
import { QuestionType } from '@/lib/types';
import { nanoid } from 'nanoid';

config({ path: '.env.local' });

async function simulateSectionalTest() {
    console.log('🚀 Starting Sectional Test Simulation...');

    // 1. Get Test User
    const testUser = await db.query.users.findFirst({
        where: eq(users.email, 'test@example.com')
    });

    if (!testUser) {
        console.error('❌ Test user not found. Run seed-test-user.ts first.');
        return;
    }

    // 2. Create a Sectional Test Instance
    console.log('📝 Creating Sectional Test Instance (Speaking)...');
    const [test] = await db.insert(pteSectionalTests).values({
        id: nanoid(),
        userId: testUser.id,
        section: 'speaking',
        status: 'in_progress',
        settings: { mode: 'practice' },
        startTime: new Date(),
    }).returning();

    // 3. Find a Speaking Question
    const speakingTypeId = await db.query.pteQuestionTypes.findFirst({
        where: eq(pteQuestionTypes.code, 'read_aloud')
    }).then(res => res?.id);

    if (!speakingTypeId) {
        console.error('❌ Read Aloud type not found');
        return;
    }

    const question = await db.query.pteQuestions.findFirst({
        where: eq(pteQuestions.questionTypeId, speakingTypeId)
    });

    if (!question) {
        console.error('❌ No Read Aloud questions found');
        return;
    }

    // 4. Simulate Submission
    console.log(`📤 Submitting Answer for Question: ${question.title}`);
    const mockAnswer = {
        audioUrl: 'https://placeholder.com/test.wav',
        transcript: 'This is a simulated Reading Aloud transcript.'
    };

    const [attempt] = await db.insert(pteAttempts).values({
        id: nanoid(),
        userId: testUser.id,
        questionId: question.id,
        answer: mockAnswer,
        score: 85,
        scoringDetails: { 
            pronunciation: 80, 
            fluency: 90, 
            content: 85 
        },
        timeSpentMs: 25000,
        metadata: { source: 'simulation', sectionalTestId: test.id }
    }).returning();

    console.log('✅ Attempt saved in DB:', attempt.id);

    // 5. Update Sectional Test Progress
    console.log('📈 Updating Sectional Test progress...');
    await db.update(pteSectionalTests)
        .set({
            questionsAttempted: 1,
            totalScore: 85,
            lastActivity: new Date()
        })
        .where(eq(pteSectionalTests.id, test.id));

    // 6. Verify Results Retrieval
    const updatedTest = await db.query.pteSectionalTests.findFirst({
        where: eq(pteSectionalTests.id, test.id)
    });

    console.log('📊 Simulation Result Snapshot:');
    console.log(`- Test ID: ${updatedTest?.id}`);
    console.log(`- Questions Attempted: ${updatedTest?.questionsAttempted}`);
    console.log(`- Current Score in DB: ${updatedTest?.totalScore}`);

    console.log('\n✨ Simulation completed successfully!');
}

simulateSectionalTest()
    .then(() => process.exit(0))
    .catch(e => {
        console.error('❌ Simulation failed:', e);
        process.exit(1);
    });
