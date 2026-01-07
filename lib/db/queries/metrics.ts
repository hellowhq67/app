import { db } from "@/lib/db/drizzle";
import { pteQuestions, pteQuestionTypes } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";

export async function getPteQuestionCounts() {
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

    return counts;
}
