import { db } from '@/lib/db/drizzle';
import { pteQuestions } from '@/lib/db/schema/pte-questions';
import { pteQuestionTypes } from '@/lib/db/schema/pte-categories';
import { apiSuccess, handleApiError } from '@/lib/api';
import { eq, and } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const typeCode = searchParams.get('type');
        const id = searchParams.get('id');
        const difficulty = searchParams.get('difficulty');

        let whereClause = undefined;

        if (id) {
            whereClause = eq(pteQuestions.id, id);
        } else if (typeCode) {
            const type = await db.query.pteQuestionTypes.findFirst({
                where: eq(pteQuestionTypes.code, typeCode as any),
            });

            if (type) {
                whereClause = eq(pteQuestions.questionTypeId, type.id);
            }
        }

        const questions = await db.query.pteQuestions.findMany({
            where: whereClause,
            with: {
                questionType: true,
            },
            limit: 50,
        });

        return apiSuccess(questions);
    } catch (error) {
        return handleApiError(error, 'GET /api/pte/questions');
    }
}
