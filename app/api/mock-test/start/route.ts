import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
    pteMockTests,
    pteMockTestQuestions,
    pteQuestions,
    pteQuestionTypes
} from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { FULL_MOCK_TEST_TEMPLATE } from '@/lib/pte/mock-test-templates';

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 1. Prepare Question List
        const sections = [
            { key: 'speaking', sectionName: 'Part 1: Speaking & Writing', configs: FULL_MOCK_TEST_TEMPLATE.sections.speaking },
            { key: 'writing', sectionName: 'Part 1: Speaking & Writing', configs: FULL_MOCK_TEST_TEMPLATE.sections.writing },
            { key: 'reading', sectionName: 'Part 2: Reading', configs: FULL_MOCK_TEST_TEMPLATE.sections.reading },
            { key: 'listening', sectionName: 'Part 3: Listening', configs: FULL_MOCK_TEST_TEMPLATE.sections.listening },
        ];

        const finalQuestions: { id: string; sectionName: string }[] = [];

        // Helper to get type ID - use name field instead of code
        const getTypeId = async (typeStr: string) => {
            // Try finding by name first (which matches QuestionType enum values)
            const type = await db.query.pteQuestionTypes.findFirst({
                where: sql`LOWER(${pteQuestionTypes.name}) = LOWER(${typeStr})`
            });
            return type?.id;
        };

        for (const section of sections) {
            for (const config of section.configs) {
                const typeId = await getTypeId(config.type);
                if (!typeId) {
                    console.warn(`Type ${config.type} not found in database`);
                    continue;
                }

                const count = Math.floor(Math.random() * (config.maxCount - config.minCount + 1)) + config.minCount;

                const questions = await db.select({ id: pteQuestions.id })
                    .from(pteQuestions)
                    .where(and(
                        eq(pteQuestions.questionTypeId, typeId),
                        eq(pteQuestions.isActive, true)
                    ))
                    .orderBy(sql`RANDOM()`)
                    .limit(count);

                questions.forEach(q => {
                    finalQuestions.push({ id: q.id, sectionName: section.sectionName });
                });
            }
        }

        if (finalQuestions.length === 0) {
            return NextResponse.json({ error: 'Failed to generate test questions' }, { status: 500 });
        }

        // 2. Create Test
        const [test] = await db.insert(pteMockTests).values({
            userId: session.user.id,
            testName: FULL_MOCK_TEST_TEMPLATE.name,
            totalQuestions: finalQuestions.length,
            status: 'in_progress',
            currentSection: 'Part 1: Speaking & Writing',
            sectionStartedAt: new Date(),
            sectionTimeLeft: 5400
        }).returning();

        // 3. Insert Questions link
        const questionLinks = finalQuestions.map((q, idx) => ({
            mockTestId: test.id,
            questionId: q.id,
            questionOrder: idx + 1,
            sectionName: q.sectionName,
            maxScore: 10, // Placeholder max score
        }));

        await db.insert(pteMockTestQuestions).values(questionLinks);

        return NextResponse.json({ testId: test.id });

    } catch (error) {
        console.error('Error starting mock test:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
