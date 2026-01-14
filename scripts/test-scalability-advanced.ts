import 'dotenv/config';
import * as path from 'path';
import * as dotenv from 'dotenv';
// Manually load envs
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { neon } from '@neondatabase/serverless';
import { Redis } from '@upstash/redis';
import { Pinecone } from '@pinecone-database/pinecone';

// --- Configuration ---
const CONFIG = {
    db: {
        concurrency: 50,
        requests: 200,
    },
    redis: {
        concurrency: 50,
        requests: 1000,
    },
    pinecone: {
        concurrency: 5,
        requests: 10,
    },
};

// --- Clients ---
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

// Initialize Redis explicitly with env vars if available
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = (redisUrl && redisToken)
    ? new Redis({ url: redisUrl, token: redisToken })
    : null;

const pineconeApiKey = process.env.PINECONE_API_KEY;
const pinecone = pineconeApiKey
    ? new Pinecone({ apiKey: pineconeApiKey })
    : null;

// --- Helpers ---
async function benchmark(
    name: string,
    concurrency: number,
    totalRequests: number,
    fn: (id: number) => Promise<void>
) {
    console.log(`\n🚀 Starting ${name} Benchmark`);
    console.log(`   Concurrency: ${concurrency} | Total Requests: ${totalRequests}`);
    console.log('   ' + '-'.repeat(40));

    const results: number[] = [];
    const errors: any[] = [];
    const startTime = performance.now();

    let completed = 0;

    async function worker() {
        while (completed < totalRequests) {
            if (completed >= totalRequests) break;
            const id = completed++;

            const start = performance.now();
            try {
                await fn(id);
                results.push(performance.now() - start);
            } catch (err: any) {
                errors.push(err.message || err);
            }

            if (completed % Math.max(1, Math.floor(totalRequests / 10)) === 0) {
                process.stdout.write('.');
            }
        }
    }

    const workers = Array(concurrency).fill(null).map(() => worker());
    await Promise.all(workers);

    const totalTime = performance.now() - startTime;
    process.stdout.write('\n');

    // Stats
    const sorted = results.sort((a, b) => a - b);
    const avg = sorted.reduce((a, b) => a + b, 0) / (sorted.length || 1);
    const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
    const rps = (results.length / (totalTime / 1000)); // request per millisecond * 1000

    console.log(`✅ Completed in ${totalTime.toFixed(2)}ms`);
    console.log(`   Success: ${results.length} | Failed: ${errors.length}`);
    console.log(`   Throughput: ${rps.toFixed(2)} req/sec`);
    console.log(`   Latency: Avg=${avg.toFixed(2)}ms | P95=${p95.toFixed(2)}ms | P99=${p99.toFixed(2)}ms`);

    if (errors.length > 0) {
        console.log(`   ⚠️ Sample Error: ${JSON.stringify(errors[0])}`);
    }
}

// --- Tests ---

async function runRedisTest() {
    if (!redis) {
        console.log('⚠️ Skipping Redis test: Credentials not found (UPSTASH_REDIS_REST_URL/TOKEN)');
        return;
    }

    await benchmark('Redis (Upstash - READ ONLY)', CONFIG.redis.concurrency, CONFIG.redis.requests, async (id) => {
        // We only test GET to avoid permission issues if token is scoped.
        // Also tests network latency effectively.
        await redis!.get(`bench-dummy:${id}`);
    });
}

async function runDbTest() {
    if (!sql) {
        console.log('⚠️ Skipping DB test: DATABASE_URL not found');
        return;
    }

    await benchmark('Postgres (Neon)', CONFIG.db.concurrency, CONFIG.db.requests, async () => {
        await sql`SELECT 1`;
    });
}

async function runPineconeTest() {
    if (!pinecone) {
        console.log('⚠️ Skipping Pinecone test: PINECONE_API_KEY not found');
        return;
    }

    const indexName = 'pte-benchmarks';
    const index = pinecone.index(indexName);

    await benchmark('Pinecone (Vector DB)', CONFIG.pinecone.concurrency, CONFIG.pinecone.requests, async () => {
        // describeIndexStats is a lightweight management plane operation.
        // Ideally we'd do a query, but that requires generating an embedding which might cost money/quota.
        // Stats check confirms connectivity and basic responsiveness.
        await index.describeIndexStats();
    });
}

async function main() {
    console.log('=============================================');
    console.log('     Pedagogists PTE Scalability Suite       ');
    console.log('=============================================');

    await runRedisTest();
    await runDbTest();
    await runPineconeTest();

    console.log('\n=============================================');
    console.log('🎉 Suite Completed');
}

main().catch(console.error);
