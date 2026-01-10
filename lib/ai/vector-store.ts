import { Pinecone } from '@pinecone-database/pinecone';
import { embed } from 'ai';
import { embeddingModel } from '@/lib/ai/config';

let pineconeClient: Pinecone | null = null;

function getPinecone(): Pinecone {
    if (!pineconeClient) {
        if (!process.env.PINECONE_API_KEY) {
            throw new Error('PINECONE_API_KEY is not defined');
        }
        pineconeClient = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
    }
    return pineconeClient;
}

export const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'pte-practice';
// Dedicated index for benchmark responses (dense vectors)
export const BENCHMARK_INDEX_NAME = 'pte-benchmarks';

async function generateEmbedding(text: string): Promise<number[]> {
    const { embedding } = await embed({
        model: embeddingModel,
        value: text,
    });
    return embedding;
}

export async function upsertRecord(
    userId: string,
    recordId: string,
    text: string,
    metadata: Record<string, unknown>
) {
    try {
        const index = getPinecone().index(INDEX_NAME);
        const embedding = await generateEmbedding(text);

        await index.upsert([
            {
                id: recordId,
                values: embedding,
                metadata: {
                    userId,
                    text: text.substring(0, 1000),
                    ...metadata,
                    createdAt: new Date().toISOString(),
                },
            },
        ]);

        console.log(`[Pinecone] Upserted record ${recordId} for user ${userId}`);
        return true;
    } catch (error) {
        console.error('[Pinecone] Failed to upsert record:', error);
        return false;
    }
}

export async function queryRecords(
    query: string,
    options: {
        userId?: string;
        topK?: number;
        filter?: Record<string, unknown>;
    } = {}
) {
    try {
        const index = getPinecone().index(INDEX_NAME);
        const embedding = await generateEmbedding(query);

        const filter: Record<string, unknown> = { ...options.filter };
        if (options.userId) {
            filter.userId = options.userId;
        }

        const results = await index.query({
            vector: embedding,
            topK: options.topK || 10,
            includeMetadata: true,
            filter: Object.keys(filter).length > 0 ? filter : undefined,
        });

        return results.matches || [];
    } catch (error) {
        console.error('[Pinecone] Failed to query records:', error);
        return [];
    }
}

export async function deleteRecord(recordId: string) {
    try {
        const index = getPinecone().index(INDEX_NAME);
        await index.deleteOne(recordId);
        console.log(`[Pinecone] Deleted record ${recordId}`);
        return true;
    } catch (error) {
        console.error('[Pinecone] Failed to delete record:', error);
        return false;
    }
}

export async function deleteUserRecords(userId: string) {
    try {
        const index = getPinecone().index(INDEX_NAME);
        await index.deleteMany({ userId });
        console.log(`[Pinecone] Deleted all records for user ${userId}`);
        return true;
    } catch (error) {
        console.error('[Pinecone] Failed to delete user records:', error);
        return false;
    }
}

/**
 * Query benchmark responses for semantic similarity scoring.
 * Uses the dedicated benchmark index (pte-benchmarks) with dense vectors.
 * Returns the top K benchmark responses for a given question type.
 */
export async function queryBenchmarks(
    query: string,
    questionType: string,
    topK: number = 3
) {
    try {
        const index = getPinecone().index(BENCHMARK_INDEX_NAME);
        const embedding = await generateEmbedding(query);

        const results = await index.query({
            vector: embedding,
            topK,
            includeMetadata: true,
            filter: {
                isBenchmark: true,
                questionType,
            },
        });

        return results.matches || [];
    } catch (error) {
        console.error('[Pinecone] Failed to query benchmarks:', error);
        return [];
    }
}

/**
 * Calculate weighted semantic similarity score from benchmark matches.
 * Uses topK=3 with decreasing weights (1, 0.5, 0.33) for more robust scoring.
 */
export async function calculateBenchmarkSimilarity(
    text: string,
    questionType: string
): Promise<{ score: number; confidence: number; matches: Array<{ id: string; score: number }> }> {
    const matches = await queryBenchmarks(text, questionType, 3);

    if (!matches || matches.length === 0) {
        return { score: 0, confidence: 0, matches: [] };
    }

    // Weighted averaging: weights = [1, 0.5, 0.33]
    const weights = [1, 0.5, 0.33];
    let weightedSum = 0;
    let totalWeight = 0;

    const matchResults: Array<{ id: string; score: number }> = [];

    matches.forEach((match, i) => {
        const weight = weights[i] || 0.25;
        const matchScore = match.score ?? 0;
        weightedSum += matchScore * weight;
        totalWeight += weight;
        matchResults.push({
            id: match.id as string,
            score: matchScore,
        });
    });

    const score = totalWeight > 0 ? weightedSum / totalWeight : 0;

    // Calculate confidence based on score variance
    const scores = matches.map((m) => m.score ?? 0);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const confidence = Math.max(0, 1 - Math.sqrt(variance)); // Lower variance = higher confidence

    return { score, confidence, matches: matchResults };
}
