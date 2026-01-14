
import { db } from "@/lib/db";
import { pteMockTests } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const getUserMockTests = async (userId: string) => {
    return await db.query.pteMockTests.findMany({
        where: eq(pteMockTests.userId, userId),
        orderBy: [desc(pteMockTests.completedAt), desc(pteMockTests.createdAt)],
    });
};
