import { db } from "@/lib/db/drizzle";
import { pteQuestions, pteQuestionTypes } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { getCached, setCached } from "@/lib/redis";

export async function getPteQuestionCounts(): Promise<Record<string, number>> {
    const cacheKey = "pte:metrics:question-counts";

    // Try to get from cache first
    const cached = await getCached<Record<string, number>>(cacheKey);
    if (cached) {
        return cached;
    }

    // If not in cache, fetch from DB
    try {
        const result = await db
            .select({
                code: pteQuestionTypes.code,
                count: count(pteQuestions.id),
            })
            .from(pteQuestionTypes)
            .leftJoin(pteQuestions, eq(pteQuestions.questionTypeId, pteQuestionTypes.id))
            .groupBy(pteQuestionTypes.code);

        const counts: Record<string, number> = {};
        result.forEach((r) => {
            if (r.code) {
                counts[r.code] = r.count;
            }
        });

        // Cache the result for 1 hour
        await setCached(cacheKey, counts, 3600);

        return counts;
    } catch {
        // DB unavailable (e.g. build environment) — return empty counts
        return {};
    }
}
