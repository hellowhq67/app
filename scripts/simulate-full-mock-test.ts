
import { db } from '@/lib/db';
import { pteMockTests, pteMockTestQuestions, pteQuestions, pteQuestionTypes, users } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { FULL_MOCK_TEST_TEMPLATE } from '@/lib/pte/mock-test-templates';
import { scoreAndSaveAttempt } from '@/lib/pte/scoring-dispatcher';
import { runMockTestScoringPipeline } from '@/lib/pte/scoring-engine/pipeline';
import { QuestionType } from '@/lib/types';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
    console.log("🚀 Starting Full Mock Test Simulation...");

    // 1. Get/Create User
    let user = await db.query.users.findFirst({
        where: eq(users.email, 'simulation@example.com')
    });

    if (!user) {
        const { randomUUID } = await import('crypto');
        console.log("Creating simulation user...");
        [user] = await db.insert(users).values({
            id: randomUUID(),
            email: 'simulation@example.com',
            name: 'Simulation Bot',
            role: 'user',
            emailVerified: true,
        }).returning();
    } else {
        console.log(`Using user: ${user.email} (${user.id})`);
    }

    // 2. Create Mock Test
    console.log("Generating Test Structure...");

    // Prepare sections
    const sections = [
        { key: 'speaking', sectionName: 'Part 1: Speaking & Writing', configs: FULL_MOCK_TEST_TEMPLATE.sections.speaking },
        { key: 'writing', sectionName: 'Part 1: Speaking & Writing', configs: FULL_MOCK_TEST_TEMPLATE.sections.writing },
        { key: 'reading', sectionName: 'Part 2: Reading', configs: FULL_MOCK_TEST_TEMPLATE.sections.reading },
        { key: 'listening', sectionName: 'Part 3: Listening', configs: FULL_MOCK_TEST_TEMPLATE.sections.listening },
    ];

    const finalQuestions: { id: string; sectionName: string; type: string }[] = [];

    for (const section of sections) {
        for (const config of section.configs) {
            // Find type ID by CODE specifically (config.type is a code like 'read_aloud')
            let typeRecord = await db.query.pteQuestionTypes.findFirst({
                where: eq(pteQuestionTypes.code, config.type as any)
            });

            // Should be seeded by seed-pte-data, but if not found, we can't proceed easily without creating the type.
            // Assumption: Types exist (from seed), questions might not.
            if (!typeRecord) {
                console.warn(`⚠️ Type CODE ${config.type} not found in DB. Searching by name...`);
                typeRecord = await db.query.pteQuestionTypes.findFirst({
                    where: sql`LOWER(${pteQuestionTypes.name}) = LOWER(${config.type.replace(/_/g, ' ')})`
                });
            }

            if (!typeRecord) {
                console.warn(`❌ Type ${config.type} absolutely not found. Skipping.`);
                continue;
            }

            const neededCount = Math.floor(Math.random() * (config.maxCount - config.minCount + 1)) + config.minCount;

            let questions = await db.select({ id: pteQuestions.id })
                .from(pteQuestions)
                .where(and(
                    eq(pteQuestions.questionTypeId, typeRecord.id),
                    eq(pteQuestions.isActive, true)
                ))
                .orderBy(sql`RANDOM()`)
                .limit(neededCount);

            if (questions.length < neededCount) {
                console.log(`⚠️ Found ${questions.length}/${neededCount} for ${config.type}. Auto-seeding...`);
                const toSeed = neededCount - questions.length;
                const newIds: string[] = [];

                for (let i = 0; i < toSeed; i++) {
                    const [newQ] = await db.insert(pteQuestions).values({
                        questionTypeId: typeRecord.id,
                        title: `Auto-Seeded ${config.type} ${i + 1}`,
                        content: `This is an auto-generated content for ${config.type} simulation.`,
                        isActive: true,
                        difficulty: 'Medium',
                        metadata: { source: 'Simulation' }
                    }).returning({ id: pteQuestions.id });
                    newIds.push(newQ.id);
                }
                questions = [...questions, ...newIds.map(id => ({ id }))];
            }

            questions.forEach(q => {
                finalQuestions.push({ id: q.id, sectionName: section.sectionName, type: config.type });
            });
        }
    }

    if (finalQuestions.length === 0) {
        console.error("❌ No questions generated. Aborting.");
        return;
    }

    // Create Test Record
    const [test] = await db.insert(pteMockTests).values({
        userId: user.id,
        testName: `Simulation ${new Date().toISOString()}`,
        totalQuestions: finalQuestions.length,
        status: 'in_progress',
        currentSection: 'Part 1: Speaking & Writing',
        sectionStartedAt: new Date(),
        sectionTimeLeft: 5400
    }).returning();

    console.log(`✅ Test Created: ${test.id} with ${finalQuestions.length} questions`);

    // Link Questions
    const questionLinks = finalQuestions.map((q, idx) => ({
        mockTestId: test.id,
        questionId: q.id,
        questionOrder: idx + 1,
        sectionName: q.sectionName,
        maxScore: 10,
        type: q.type // Store type in the link object logic for local iteration usage (not DB)
    }));

    // Insert into DB (excluding 'type' which isn't in schema)
    const dbLinks = questionLinks.map(({ type, ...rest }) => rest);
    await db.insert(pteMockTestQuestions).values(dbLinks);


    // 3. Simulate Execution
    console.log("\n🎬 Running Test Simulation...");

    for (const [idx, link] of questionLinks.entries()) {
        const qRecord = await db.query.pteQuestions.findFirst({
            where: eq(pteQuestions.id, link.questionId),
            with: { questionType: true, speaking: true, reading: true, listening: true }
        });

        if (!qRecord) {
            console.error(`Question record not found for ${link.questionId}`);
            continue;
        }

        const typeName = link.type; // Now defined!
        console.log(`[${idx + 1}/${finalQuestions.length}] ${typeName} - ${qRecord.title}`);

        // Generate Mock Answer
        let answerPayload: any = { text: "Simulated answer" };

        // Smart Answering for Validation
        if (typeName.toLowerCase().includes('read_aloud') || typeName.toLowerCase().includes('repeat_sentence') || typeName.toLowerCase().includes('describe_image') || typeName.includes('retell') || typeName.includes('answer_short')) {
            // For speaking, we can't easily simulate audio without files
            // We'll skip or sending placeholder
            answerPayload = {
                text: "Simulated speech transcript",
                audioUrl: "https://example.com/simulated.webm" // Dummy URL
            };
        } else if (typeName.toLowerCase().includes('multiple_choice_multiple') || typeName.toLowerCase().includes('listening_mc_multiple') || typeName.toLowerCase().includes('highlight_incorrect_words')) {
            answerPayload = { selectedOptions: ["Option A"] };
        } else if (typeName.toLowerCase().includes('multiple_choice_single') || typeName.toLowerCase().includes('listening_mc_single') || typeName.toLowerCase().includes('highlight_correct_summary') || typeName.toLowerCase().includes('select_missing_word')) {
            answerPayload = { selectedOption: "Option A" };
        } else if (typeName.toLowerCase().includes('multiple_choice') || typeName.includes('mc')) {
            // Pick first option if valid
            // Assume options is JSON
            try {
                // Check reading.options or listening.options if available but simpler to just send dummy
                answerPayload = { selectedOptions: ["Option A"] };
            } catch (e) { answerPayload = { text: "Error parsing options" }; }
        } else if (typeName.toLowerCase().includes('fill_blanks')) {
            // Use passage text? Hard to guess correct implementation without more logic
            answerPayload = { filledBlanks: { "0": "test" } };
        } else if (typeName.includes('essay') || typeName.includes('summarize')) {
            answerPayload = { text: "This is a simulated essay response that is sufficiently long to trigger the scoring engine. In this essay, we will discuss the importance of automated testing systems. Automated testing is crucial for maintaining high software quality and ensuring that new features do not introduce regressions. Furthermore, simulating user behavior allows us to verify complex workflows like this mock test system." };
        }

        // Submit (Call Service Directly)
        try {
            const { feedback } = await scoreAndSaveAttempt(
                user.id,
                qRecord,
                answerPayload,
                qRecord.questionType?.name as QuestionType
            );

            console.log(`   -> Score: ${feedback?.overallScore || 0}`);

            // Mark as done
            await db.update(pteMockTestQuestions).set({
                attemptId: feedback?.id, // ID of the attempt record
                isCompleted: true,
                completedAt: new Date(),
                score: feedback?.overallScore || 0
            }).where(and(eq(pteMockTestQuestions.mockTestId, test.id), eq(pteMockTestQuestions.questionOrder, idx + 1)));

            // Update progress in test
            await db.update(pteMockTests).set({
                completedQuestions: sql`completed_questions + 1`
            }).where(eq(pteMockTests.id, test.id));

        } catch (e) {
            console.error(`   ❌ Error scoring: ${e}`);
        }
    }

    // 4. Finalize
    console.log("\n🏁 Finalizing Test...");
    await runMockTestScoringPipeline(test.id);

    // 5. Fetch Final Report Data
    const finalTest = await db.query.pteMockTests.findFirst({
        where: eq(pteMockTests.id, test.id)
    });

    console.log("\n==================================");
    console.log("       TEST SIMULATION REPORT       ");
    console.log("==================================");
    console.log(`Overall Score: ${finalTest?.overallScore}`);
    console.log(`Speaking:      ${finalTest?.speakingScore}`);
    console.log(`Writing:       ${finalTest?.writingScore}`);
    console.log(`Reading:       ${finalTest?.readingScore}`);
    console.log(`Listening:     ${finalTest?.listeningScore}`);
    console.log("==================================");
    console.log(`View Report at: /academic/mock-tests/${test.id}/result/report`);

    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
