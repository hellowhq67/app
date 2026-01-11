import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

// Configuration
const CONCURRENT_REQUESTS = 100;
const TOTAL_REQUESTS = 500;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL is not defined');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function runBenchmark() {
    console.log(`🚀 Starting Scalability Test`);
    console.log(`Target: Neon Database (Serverless HTTP)`);
    console.log(`Concurrency: ${CONCURRENT_REQUESTS}`);
    console.log(`Total Requests: ${TOTAL_REQUESTS}`);
    console.log('----------------------------------------');

    const results: number[] = [];
    const errors: any[] = [];
    const startTime = performance.now();

    // Helper to run a single query and measure duration
    const runQuery = async () => {
        const start = performance.now();
        try {
            await sql`SELECT 1`;
            const duration = performance.now() - start;
            results.push(duration);
        } catch (err) {
            errors.push(err);
        }
    };

    // Batch execution
    let completed = 0;
    async function worker() {
        while (completed < TOTAL_REQUESTS) {
            if (completed >= TOTAL_REQUESTS) break;
            completed++;
            await runQuery();
            if (completed % 50 === 0) {
                process.stdout.write('.');
            }
        }
    }

    const workers = Array(CONCURRENT_REQUESTS).fill(null).map(() => worker());
    await Promise.all(workers);

    const totalTime = performance.now() - startTime;
    console.log('\n----------------------------------------');

    // Analysis
    const sorted = results.sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    const rps = (results.length / (totalTime / 1000)).toFixed(2);

    console.log(`✅ Completed in ${totalTime.toFixed(2)}ms`);
    console.log(`Successful Requests: ${results.length}`);
    console.log(`Failed Requests:     ${errors.length}`);
    console.log(`RPS (Throughput):    ${rps} req/sec`);
    console.log(`Latency (Min):       ${min?.toFixed(2)}ms`);
    console.log(`Latency (Avg):       ${avg?.toFixed(2)}ms`);
    console.log(`Latency (P50):       ${p50?.toFixed(2)}ms`);
    console.log(`Latency (P95):       ${p95?.toFixed(2)}ms`);
    console.log(`Latency (P99):       ${p99?.toFixed(2)}ms`);
    console.log(`Latency (Max):       ${max?.toFixed(2)}ms`);

    if (errors.length > 0) {
        console.log('\n❌ Errors Sample:');
        console.error(errors.slice(0, 5));
    }
}

runBenchmark().catch(console.error);
