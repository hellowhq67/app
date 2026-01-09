/**
 * Seed Pinecone with Benchmark Responses
 *
 * This script embeds and upserts benchmark responses to Pinecone
 * for use in semantic similarity scoring.
 *
 * Usage: npx tsx scripts/seed-pinecone-benchmarks.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local (Next.js convention)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
// Also try .env as fallback
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { Pinecone } from '@pinecone-database/pinecone';
import { embed } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {
  benchmarkResponses,
  benchmarkStats,
  type BenchmarkResponse,
} from '../data/benchmark-responses';

// Initialize Google embedding model (same as lib/ai/config.ts)
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY,
});
const embeddingModel = google.embedding('text-embedding-004');

// Pinecone config
// Use a dedicated index for benchmarks - must support dense vectors
const INDEX_NAME = 'pte-benchmarks';
const EMBEDDING_DIMENSIONS = 768; // Google text-embedding-004 dimensions

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

async function ensureIndexExists(): Promise<boolean> {
  try {
    const pc = getPinecone();
    const indexes = await pc.listIndexes();

    const indexExists = indexes.indexes?.some((idx) => idx.name === INDEX_NAME);

    if (!indexExists) {
      console.log(`Creating new index '${INDEX_NAME}'...`);
      await pc.createIndex({
        name: INDEX_NAME,
        dimension: EMBEDDING_DIMENSIONS,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      });

      // Wait for index to be ready
      console.log('Waiting for index to be ready...');
      let ready = false;
      let attempts = 0;
      while (!ready && attempts < 30) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const indexDesc = await pc.describeIndex(INDEX_NAME);
        ready = indexDesc.status?.ready === true;
        attempts++;
        if (!ready) {
          console.log(`  Waiting... (attempt ${attempts}/30)`);
        }
      }

      if (!ready) {
        throw new Error('Index creation timed out');
      }

      console.log(`Index '${INDEX_NAME}' is ready!`);
    } else {
      console.log(`Index '${INDEX_NAME}' already exists.`);
    }

    return true;
  } catch (error) {
    console.error('Failed to ensure index exists:', error);
    return false;
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  });
  return embedding;
}

async function seedBenchmark(
  benchmark: BenchmarkResponse,
  index: number,
  total: number
): Promise<boolean> {
  try {
    const pineconeIndex = getPinecone().index(INDEX_NAME);
    const embedding = await generateEmbedding(benchmark.response);

    await pineconeIndex.upsert([
      {
        id: benchmark.id,
        values: embedding,
        metadata: {
          isBenchmark: true, // KEY FILTER for benchmark queries
          questionType: benchmark.questionType,
          score: benchmark.score,
          text: benchmark.response.substring(0, 1000),
          fluency: benchmark.features.fluency,
          pronunciation: benchmark.features.pronunciation || 0,
          content: benchmark.features.content,
          vocabulary: benchmark.features.vocabulary,
          grammar: benchmark.features.grammar,
          createdAt: new Date().toISOString(),
        },
      },
    ]);

    console.log(
      `[Benchmark] Seeded ${index + 1}/${total} - ${benchmark.id} (${benchmark.questionType})`
    );
    return true;
  } catch (error) {
    console.error(`[Benchmark] Failed to seed ${benchmark.id}:`, error);
    return false;
  }
}

async function testQuery() {
  console.log('\n--- Testing Benchmark Query ---\n');

  const pineconeIndex = getPinecone().index(INDEX_NAME);

  // Test query: Find benchmarks for read_aloud
  const testText =
    'Climate change represents one of the most significant challenges facing humanity today.';
  const embedding = await generateEmbedding(testText);

  const results = await pineconeIndex.query({
    vector: embedding,
    topK: 3,
    includeMetadata: true,
    filter: { isBenchmark: true },
  });

  console.log('Query: "Climate change..." (looking for benchmarks)');
  console.log('Results:');

  if (results.matches && results.matches.length > 0) {
    results.matches.forEach((match, i) => {
      console.log(`  ${i + 1}. ${match.id}`);
      console.log(`     Score: ${match.score?.toFixed(4)}`);
      console.log(`     Type: ${match.metadata?.questionType}`);
      console.log(`     Benchmark Score: ${match.metadata?.score}`);
    });
  } else {
    console.log('  No matches found!');
  }

  // Test filtered query for specific question type
  console.log('\n--- Testing Filtered Query (read_aloud only) ---\n');

  const filteredResults = await pineconeIndex.query({
    vector: embedding,
    topK: 3,
    includeMetadata: true,
    filter: {
      isBenchmark: true,
      questionType: 'read_aloud',
    },
  });

  console.log('Results for read_aloud:');
  if (filteredResults.matches && filteredResults.matches.length > 0) {
    filteredResults.matches.forEach((match, i) => {
      console.log(`  ${i + 1}. ${match.id} (score: ${match.score?.toFixed(4)})`);
    });
  } else {
    console.log('  No matches found!');
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('PTE Benchmark Seeding Script');
  console.log('='.repeat(60));
  console.log(`\nIndex: ${INDEX_NAME}`);
  console.log(`Total benchmarks to seed: ${benchmarkStats.total}`);
  console.log(`Average score: ${benchmarkStats.averageScore.toFixed(1)}`);
  console.log('\nBreakdown by type:');
  Object.entries(benchmarkStats.byType).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`);
  });
  console.log('\n' + '-'.repeat(60) + '\n');

  // Check for API keys
  if (!process.env.PINECONE_API_KEY) {
    console.error('ERROR: PINECONE_API_KEY environment variable is not set');
    process.exit(1);
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GOOGLE_API_KEY) {
    console.error(
      'ERROR: GOOGLE_GENERATIVE_AI_API_KEY or GOOGLE_API_KEY environment variable is not set'
    );
    process.exit(1);
  }

  // Ensure index exists (creates if needed)
  console.log('\nChecking Pinecone index...');
  const indexReady = await ensureIndexExists();
  if (!indexReady) {
    console.error('ERROR: Failed to ensure Pinecone index exists');
    process.exit(1);
  }

  // Seed all benchmarks
  let successCount = 0;
  let failCount = 0;
  const total = benchmarkResponses.length;

  console.log('Starting benchmark seeding...\n');

  for (let i = 0; i < benchmarkResponses.length; i++) {
    const benchmark = benchmarkResponses[i];
    const success = await seedBenchmark(benchmark, i, total);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Add small delay to avoid rate limiting
    if ((i + 1) % 10 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log('\n' + '-'.repeat(60));
  console.log('\nSeeding complete!');
  console.log(`  Successful: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`  Total: ${total}`);

  // Run test query
  if (successCount > 0) {
    await testQuery();
  }

  console.log('\n' + '='.repeat(60));
  console.log('Done!');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
