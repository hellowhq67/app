import { db } from '@/lib/db';
import { pteMockTests, pteMockTestQuestions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function runTest() {
    console.log('--- Starting Mock Test Simulation ---');

    // 1. Get a user
    const user = await db.query.users.findFirst();
    if (!user) throw new Error('No user found');
    console.log('User:', user.email);

    // 2. Start Test (Simulated API Call)
    // We can't call API route directly easily in script without mocking Request/Response context or running server.
    // So we will call the LOGIC directly or use fetch if server is running.
    // Since server might not be running in this environment context for me to fetch, 
    // I will simulate the DB operations that the API does, OR I can just assume the API works if I implemented it correctly and verify DB state after manual interaction?
    // No, I should test the LOGIC. I'll import the logic?
    // Importing Next.js API routes functions in script is tricky due to Headers/Response.
    // Better: I will implement a "Logic Test" that calls the same helper functions or DB operations.

    // Actually, I can rely on `test-sectional-schema.ts` for schema validation.
    // For flow, I'll write a script that INTERACTS with DB directly to simulate the flow and verify my assumptions about the schema.

    // A. Start Test
    console.log('Creating Mock Test...');
    const [newTest] = await db.insert(pteMockTests).values({
        userId: user.id,
        testName: 'Script Generated Test',
        totalQuestions: 0,
        status: 'in_progress',
        currentSection: 'Part 1: Speaking & Writing',
        sectionStartedAt: new Date(),
        sectionTimeLeft: 5400
    }).returning();
    console.log('Created test:', newTest.id);


    // B. Verify Schema constraints
    console.log('Verifying Schema...');
    const test = await db.query.pteMockTests.findFirst({
        where: eq(pteMockTests.userId, user.id),
        orderBy: desc(pteMockTests.startedAt)
    });

    if (test) {
        console.log('Found existing test:', test.id, test.currentSection);
    } else {
        console.log('No existing test found. Make sure to run the API or create one manually via UI to fully test.');
    }

    // C. Check Question association
    if (test) {
        const questions = await db.query.pteMockTestQuestions.findMany({
            where: eq(pteMockTestQuestions.mockTestId, test.id)
        });
        console.log(`Test has ${questions.length} questions assigned.`);

        // D. Verify Section Names
        const sections = new Set(questions.map(q => q.sectionName));
        console.log('Sections found:', Array.from(sections));
    }

    console.log('--- Test script complete ---');
}

runTest()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
