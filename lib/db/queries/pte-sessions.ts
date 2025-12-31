import { db } from '@/lib/db/drizzle';
import {
    pteSessions,
    pteResponses,
    pteScores,
    pteAudioFiles
} from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// PTE Session Management function replacements for Supabase

export async function createPTESession(userId: string) {
    const [session] = await db.insert(pteSessions).values({
        userId,
        currentSection: 'speaking_writing',
        currentQuestion: 0,
        responses: [],
        timeRemaining: {
            speaking_writing: 93 * 60,
            reading: 41 * 60,
            listening: 57 * 60
        },
        isCompleted: false,
        systemCheck: {
            microphone: false,
            speakers: false,
            camera: false,
            browserCompatible: true,
            networkStable: true
        }
    }).returning();

    return session;
}

export async function updatePTESession(sessionId: string, updates: Partial<typeof pteSessions.$inferInsert>) {
    const [session] = await db.update(pteSessions)
        .set(updates)
        .where(eq(pteSessions.id, sessionId))
        .returning();
    return session;
}

export async function getPTESession(sessionId: string) {
    // Using query builder to include relations if needed, or simple select
    const session = await db.query.pteSessions.findFirst({
        where: eq(pteSessions.id, sessionId),
        with: {
            responses: true,
            scores: true
        }
    });

    return session;
}

export async function getUserSessions(userId: string) {
    const sessions = await db.query.pteSessions.findMany({
        where: eq(pteSessions.userId, userId),
        orderBy: [desc(pteSessions.createdAt)],
        with: {
            scores: true
        }
    });
    return sessions;
}

export async function completePTESession(sessionId: string) {
    const [session] = await db.update(pteSessions)
        .set({ isCompleted: true })
        .where(eq(pteSessions.id, sessionId))
        .returning();
    return session;
}

// PTE Response Management

export async function savePTEResponse(responseItem: typeof pteResponses.$inferInsert) {
    const [data] = await db.insert(pteResponses)
        .values(responseItem)
        .returning();
    return data;
}

export async function getPTEResponses(sessionId: string) {
    const data = await db.query.pteResponses.findMany({
        where: eq(pteResponses.sessionId, sessionId),
        orderBy: [desc(pteResponses.timestamp)]
    });
    return data;
}

export async function updatePTEResponse(responseId: string, updates: Partial<typeof pteResponses.$inferInsert>) {
    const [data] = await db.update(pteResponses)
        .set(updates)
        .where(eq(pteResponses.id, responseId))
        .returning();
    return data;
}

// PTE Score Management

export async function savePTEScores(scoresItem: typeof pteScores.$inferInsert) {
    const [data] = await db.insert(pteScores)
        .values(scoresItem)
        .returning();
    return data;
}

export async function getPTEScores(sessionId: string) {
    const data = await db.query.pteScores.findFirst({
        where: eq(pteScores.sessionId, sessionId)
    });
    return data;
}

// PTE File Management

export async function savePTEAudioFile(fileItem: typeof pteAudioFiles.$inferInsert) {
    const [data] = await db.insert(pteAudioFiles)
        .values(fileItem)
        .returning();
    return data;
}

