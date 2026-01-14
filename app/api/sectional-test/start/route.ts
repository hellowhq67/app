import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
    pteSectionalTests,
    pteSectionalAttempts,
    pteQuestions,
    pteQuestionTypes
} from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { SECTION_TEMPLATES, SectionalTemplate } from '@/lib/pte/sectional-templates';

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { section } = await req.json(); // 'speaking', 'writing', 'reading', 'listening'

        if (!['speaking', 'writing', 'reading', 'listening'].includes(section)) {
            return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
        }

        const template: SectionalTemplate = SECTION_TEMPLATES[section as keyof typeof SECTION_TEMPLATES];

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 400 });
        }

        const finalQuestions: string[] = [];

        // Helper to get type ID - use name field instead of code
        const getTypeId = async (typeStr: string) => {
            const type = await db.query.pteQuestionTypes.findFirst({
                where: sql`LOWER(${pteQuestionTypes.name}) = LOWER(${typeStr})`
            });
            return type?.id;
        };

        for (const config of template.questions) {
            const typeId = await getTypeId(config.type);
            if (!typeId) {
                console.warn(`Type ${config.type} not found`);
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

            questions.forEach(q => finalQuestions.push(q.id));
        }

        if (finalQuestions.length === 0) {
            return NextResponse.json({ error: 'Failed to generate test' }, { status: 500 });
        }

        // Create Sectional Test Record
        const [test] = await db.insert(pteSectionalTests).values({
            userId: session.user.id,
            section: section as 'speaking' | 'writing' | 'reading' | 'listening',
            status: 'in_progress',
        }).returning();

        // Create Attempt Placeholders
        const attemptEntries = finalQuestions.map((qId, idx) => ({
            sectionalTestId: test.id,
            questionId: qId,
            sequence: idx + 1,
        }));

        await db.insert(pteSectionalAttempts).values(attemptEntries);

        // Fetch first question details
        const firstQuestion = await db.query.pteQuestions.findFirst({
            where: eq(pteQuestions.id, finalQuestions[0]),
            with: {
                questionType: true,
                speaking: true,
                writing: true,
                reading: true,
                listening: true
            }
        });

        // Sanitize
        const sanitized = {
            ...firstQuestion,
            correctAnswer: undefined,
        };

        return NextResponse.json({ testId: test.id, question: sanitized, totalQuestions: finalQuestions.length });

    } catch (error) {
        console.error('Error starting sectional test:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
