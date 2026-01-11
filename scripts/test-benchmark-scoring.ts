/**
 * Test Script: Benchmark Vector Embeddings for Speaking
 *
 * Tests the semantic similarity scoring pipeline against benchmark responses.
 * Verifies that the Pinecone index is populated and queries return relevant results.
 *
 * Usage: npx tsx scripts/test-benchmark-scoring.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { Pinecone } from '@pinecone-database/pinecone';
import { embed } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Initialize Google embedding model
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY,
});
const embeddingModel = google.embedding('text-embedding-004');

const BENCHMARK_INDEX_NAME = 'pte-benchmarks';

// Test responses at different quality levels
const testResponses = {
  read_aloud: {
    excellent: `Climate change represents one of the most significant challenges facing humanity today. Rising global temperatures have led to unprecedented weather patterns, melting ice caps, and rising sea levels. Scientists worldwide are working tirelessly to develop sustainable solutions.`,
    good: `Climate change is a big problem for the world. The temperatures are getting higher and ice is melting. Scientists are trying to find solutions to this issue.`,
    poor: `Climate change um is a problem. It's getting hot. Ice melting yeah. Scientists doing stuff.`,
  },
  describe_image: {
    excellent: `This bar chart illustrates the annual sales figures for five different product categories over a three-year period from 2020 to 2022. Electronics showed the highest growth, increasing from two million to three point five million dollars. Clothing and home goods remained relatively stable, while food and beverages experienced a moderate decline. The overall trend suggests a shift in consumer preferences toward technology products.`,
    good: `The bar chart shows sales for five product categories over three years. Electronics grew the most. Clothing stayed about the same. Food sales went down. People seem to prefer technology now.`,
    poor: `Um this is a chart. It shows like sales. Electronics is high. Other stuff is there too.`,
  },
  summarize_written_text: {
    excellent: `Climate change poses significant threats to global ecosystems and human societies through rising temperatures, extreme weather events, and sea level rise, requiring immediate international cooperation to implement sustainable solutions and reduce greenhouse gas emissions.`,
    good: `Climate change is causing problems like higher temperatures and extreme weather, and countries need to work together to find solutions.`,
    poor: `Climate bad. Hot. Weather crazy. Need fix.`,
  },
  write_essay: {
    excellent: `The debate over whether technology improves or diminishes human connection remains contentious. While digital communication tools enable us to maintain relationships across vast distances, critics argue they promote superficial interactions at the expense of meaningful face-to-face engagement. On one hand, technology has undeniably expanded our ability to connect. Video calls allow grandparents to watch their grandchildren grow up from thousands of miles away. Social media platforms help us rediscover old friends and maintain professional networks. However, legitimate concerns exist about technology overuse. Studies suggest excessive screen time correlates with increased loneliness and anxiety. Ultimately, technology is a tool whose impact depends on how we use it.`,
    good: `Technology has both positive and negative effects on human connection. It helps us stay in touch with people far away through video calls and social media. But it can also make people feel lonely if they use it too much. The key is to use technology in a balanced way.`,
    poor: `Technology good and bad. Some like it some don't. People use phones a lot. Maybe too much idk.`,
  },
};

async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  });
  return embedding;
}

async function queryBenchmarks(
  text: string,
  questionType: string,
  topK: number = 3
) {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pc.index(BENCHMARK_INDEX_NAME);
  const embedding = await generateEmbedding(text);

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
}

function calculateWeightedScore(matches: Array<{ score?: number | null }>) {
  if (!matches.length) return 0;

  const weights = [1, 0.5, 0.33];
  let weightedSum = 0;
  let totalWeight = 0;

  matches.forEach((match, i) => {
    const weight = weights[i] || 0.25;
    const score = match.score ?? 0;
    weightedSum += score * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

async function testQuestionType(questionType: string, responses: Record<string, string>) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${questionType.toUpperCase()}`);
  console.log('='.repeat(60));

  for (const [quality, text] of Object.entries(responses)) {
    console.log(`\n--- ${quality.toUpperCase()} Response ---`);
    console.log(`Text preview: "${text.substring(0, 100)}..."`);

    try {
      const matches = await queryBenchmarks(text, questionType);

      if (matches.length === 0) {
        console.log('⚠️  No benchmark matches found!');
        console.log('   Make sure you have run: npx tsx scripts/seed-pinecone-benchmarks.ts');
        continue;
      }

      const semanticScore = calculateWeightedScore(matches);
      const pteScore = Math.round(10 + semanticScore * 80);

      console.log(`\nResults:`);
      console.log(`  Semantic Score: ${semanticScore.toFixed(4)}`);
      console.log(`  PTE Score (10-90): ${pteScore}`);
      console.log(`  Top Matches:`);

      matches.forEach((match, i) => {
        console.log(`    ${i + 1}. ${match.id}`);
        console.log(`       Similarity: ${(match.score ?? 0).toFixed(4)}`);
        console.log(`       Benchmark Score: ${match.metadata?.score}`);
      });

      // Validate expected scoring direction
      const expectedRanges: Record<string, [number, number]> = {
        excellent: [0.75, 1.0],
        good: [0.55, 0.80],
        poor: [0.30, 0.60],
      };

      const [min, max] = expectedRanges[quality] || [0, 1];
      const inRange = semanticScore >= min && semanticScore <= max;

      console.log(`\n  Expected range for ${quality}: [${min}, ${max}]`);
      console.log(`  ${inRange ? '✅ PASS' : '⚠️  OUT OF RANGE'}: ${semanticScore.toFixed(4)}`);
    } catch (error) {
      console.error(`❌ Error testing ${questionType}/${quality}:`, error);
    }
  }
}

async function testIndexStats() {
  console.log('\n' + '='.repeat(60));
  console.log('PINECONE INDEX STATISTICS');
  console.log('='.repeat(60));

  try {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pc.index(BENCHMARK_INDEX_NAME);
    const stats = await index.describeIndexStats();

    console.log(`\nIndex: ${BENCHMARK_INDEX_NAME}`);
    console.log(`Total Vectors: ${stats.totalRecordCount}`);
    console.log(`Dimensions: ${stats.dimension}`);

    if (stats.totalRecordCount === 0) {
      console.log('\n⚠️  INDEX IS EMPTY!');
      console.log('Run: npx tsx scripts/seed-pinecone-benchmarks.ts');
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to get index stats:', error);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('PTE Benchmark Scoring Test');
  console.log('='.repeat(60));

  // Check environment
  if (!process.env.PINECONE_API_KEY) {
    console.error('❌ PINECONE_API_KEY is not set');
    process.exit(1);
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_GENERATIVE_AI_API_KEY or GOOGLE_API_KEY is not set');
    process.exit(1);
  }

  // Test index stats
  const indexReady = await testIndexStats();
  if (!indexReady) {
    process.exit(1);
  }

  // Test each question type
  for (const [questionType, responses] of Object.entries(testResponses)) {
    await testQuestionType(questionType, responses);
    // Small delay between types
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('TEST COMPLETE');
  console.log('='.repeat(60));

  console.log(`
Summary:
- Benchmark embeddings should return higher similarity scores for better responses
- Expected hierarchy: excellent > good > poor
- If scores are inverted or flat, the benchmark data may need refinement

Next Steps:
1. If index is empty, run: npx tsx scripts/seed-pinecone-benchmarks.ts
2. If scores don't differentiate well, consider:
   - Adding more diverse benchmark responses
   - Adjusting the scoring weights (currently 35% lexical + 45% semantic + 20% fluency)
   - Fine-tuning the benchmark score thresholds
`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
