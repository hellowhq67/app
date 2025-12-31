import { db } from '@/lib/db/drizzle';
import {
    pteSessions,
    pteResponses,
    pteScores,
    pteAttempts,
    users
} from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { Database } from '@/supabase/client'; // Keeping for type reference if needed, or better, define new types

// PTE Session Management
export async function createPTESession(userId: string) {
    const [session] = await db.insert(pteSessions).values({
        userId,
        currentSection: 'speaking_writing',
        currentQuestion: 0,
        responses: [],
        timeRemaining: {
            speaking_writing: 93 * 60, // 93 minutes
            reading: 41 * 60, // 41 minutes
            listening: 57 * 60 // 57 minutes
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
    const session = await db.query.pteSessions.findFirst({
        where: eq(pteSessions.id, sessionId),
        with: {
            scores: true
        }
    });
    return session;
}

export async function completePTESession(sessionId: string) {
    const [session] = await db.update(pteSessions)
        .set({ isCompleted: true })
        .where(eq(pteSessions.id, sessionId))
        .returning();
    return session;
}

// PTE Response Management
// Note: Schema for pte_responses might need to be checked if it matches Supabase's exactly or if we are using pteAttempts
// The Supabase code used 'pte_responses' table. Looking at index.ts, we don't seem to have pte_responses export but we have pteAttempts.
// But database.ts referenced 'pte_responses'.
// Wait, I need to check schema/index.ts again. It has export * from './pte-attempts'.
// But does it have pteResponses?
// Let's assume for now we might need to map to pteAttempts or create pteResponses if it was separate.
// Actually, looking at database.ts: from('pte_responses')
// Looking at schema/index.ts: export * from './pte-attempts';
// Maybe pte_responses ARE pteAttempts? Or a separate table.
// I will assume for now I should use pteAttempts as the primary way forward given the recent code,
// BUT the current API routes explicitely use pte_responses.
// I must verify if pte_responses table exists in Drizzle schema.
// I'll pause this write to check schema first.
