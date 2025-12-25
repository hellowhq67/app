import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import * as aiQueries from '@/lib/db/queries/ai-assistant';

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session?.user?.id) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { toolName, args } = await req.json();
    const userId = session.user.id;

    try {
        let result;
        switch (toolName) {
            case 'getUserStudyStats':
                result = await aiQueries.getUserStudyStats(userId);
                break;
            case 'searchPracticeQuestions':
                result = await aiQueries.searchPracticeQuestions(args);
                break;
            case 'updateStudyGoals':
                result = await aiQueries.updateStudyGoals(userId, args);
                break;
            case 'getUserWeakAreas':
                result = await aiQueries.getUserWeakAreas(userId);
                break;
            default:
                return NextResponse.json({ error: 'Unknown tool' }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Tool execution error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
