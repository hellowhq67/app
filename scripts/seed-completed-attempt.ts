import 'dotenv/config';
import { db } from '@/lib/db';
import { mockTests, testAttempts, testAnswers, pteQuestions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

async function seedCompletedAttempt() {
    console.log('🌱 Seeding Completed Attempt for Visualization...');

    // 1. Get Template
    const template = await db.query.mockTests.findFirst();
    if (!template) throw new Error("No template found. Run seed-mock-template.ts first.");

    // 2. Get Valid User
    const user = await db.query.users.findFirst();
    if (!user) throw new Error("No users found in DB. Run seed-users or check DB.");
    const userId = user.id;
    const attemptId = uuidv4();

    // 2. Create Attempt
    await db.insert(testAttempts).values({
        id: attemptId,
        userId,
        mockTestId: template.id,
        status: 'completed', // DONE
        currentQuestionIndex: (template.questions as any[]).length,
        startedAt: new Date(Date.now() - 3600000), // 1 hour ago
        completedAt: new Date(),
    });

    // 3. Insert Answers (Mocking a good performance)
    const questions = template.questions as any[];

    for (const qItem of questions) {
        // Fetch type to know what to insert
        const qDb = await db.query.pteQuestions.findFirst({
            where: eq(pteQuestions.id, qItem.questionId),
            with: { questionType: true }

        });

        if (!qDb) continue;

        const typeName = qDb.questionType.name;

        // Mock Score Data
        let aiScore = { total: 15, maxScore: 15, feedback: "Great job" }; // Generic

        if (typeName.includes('Read Aloud')) aiScore = { total: 14, maxScore: 15, feedback: "Good fluency" };
        else if (typeName.includes('Essay')) aiScore = { total: 12, maxScore: 15, feedback: "Strong argument but watch grammar" };
        else if (typeName.includes('Repeat')) aiScore = { total: 13, maxScore: 13, feedback: "Perfect" };

        await db.insert(testAnswers).values({
            attemptId,
            questionId: qItem.questionId,
            questionType: typeName,
            answer: { text: "Simulated answer" },
            aiScore: aiScore as any,
            timeSpentMs: 30000
        });
    }

    console.log(`✅ Seeded Completed Attempt: ${attemptId}`);
    console.log(`👉 Visit: http://localhost:3000/mock-test/${attemptId}/result`);
}

seedCompletedAttempt().catch(console.error);
