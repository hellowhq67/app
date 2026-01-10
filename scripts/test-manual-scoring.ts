import * as dotenv from 'dotenv';
import * as path from 'path';
// Load environment variables from .env.local (Next.js convention)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { scorePteAttemptV2 } from '@/lib/ai/scoring-agent';
import { QuestionType } from '@/lib/types';

// Hardcoded test URLs (placeholder for now, will replace or use args)
const TEST_CASES = [
    {
        name: "User Provided 1",
        url: process.argv[2] // Accept from command line
    },
    {
        name: "User Provided 2",
        url: process.argv[3]
    }
];

async function testManualAudioScoring() {
    const targetUrl = process.argv[2];

    if (!targetUrl) {
        console.log("Usage: npx tsx scripts/test-manual-scoring.ts <AUDIO_URL> [QUESTION_TYPE]");
        console.log("Example: npx tsx scripts/test-manual-scoring.ts https://example.com/audio.mp3 read-aloud");
        return;
    }

    const typeArg = process.argv[3] || 'describe-image';
    // Map string to enum if needed, or cast
    const qType = typeArg as QuestionType;

    console.log(`\n🎙️  Testing Scoring for: ${targetUrl}`);
    console.log(`📝 Question Type: ${qType}`);
    console.log('-------------------------------------------');

    // Hardcoded Check for TayyabaAnwer2's specific audio to inject the correct context
    let qContent = "Test audio submission for evaluation.";
    let iAnswer = "The chart shows a significant increase in sales over the last three quarters.";

    if (targetUrl.includes('271e6ff3f6')) {
        qContent = "The best time to visit Canada is during fall months, when mild temperatures and vibrant fall foliage make scenic drives, hiking, and outdoor exploration especially enjoyable. Travel guides often highlight autumn, especially from late September through October, as a peak season for color changes in Ontario, Quebec, and other regions of the country.";
        iAnswer = qContent;
    }

    try {
        const startTime = performance.now();
        const feedback = await scorePteAttemptV2(qType, {
            questionContent: qContent,
            submission: {
                audioUrl: targetUrl
            },
            // Optional: Provide an ideal answer if known for better comparison
            idealAnswer: iAnswer
        });

        const duration = (performance.now() - startTime).toFixed(2);

        console.log('\n✅ Scoring Complete (' + duration + 'ms)');
        console.log('-------------------------------------------');

        if (feedback.transcript) {
            console.log(`🗣️  Transcript: "${feedback.transcript}"`);
        } else {
            console.log(`❌ No transcript generated.`);
        }

        console.log('\n📊 Scores:');
        console.log(`   Overall (PTE): ${feedback.overallScore}/90`);

        if (feedback.scoringMetrics) {
            console.log(`   - Fluency: ${feedback.scoringMetrics.fluencyScore}%`);
            console.log(`   - Pronunciation/Auto: ${feedback.scoringMetrics.confidence}% (Confidence)`); // Using confidence as a proxy for acoustic match in this output
            console.log(`   - Content/Semantic: ${feedback.scoringMetrics.semanticScore}%`);
            console.log(`   - Lexical: ${feedback.scoringMetrics.lexicalScore}%`);
        }

        console.log('\n💡 Feedback:');
        console.log('   Strengths:', feedback.strengths?.join(', '));
        console.log('   Improvements:', feedback.areasForImprovement?.join(', '));

        console.log('\n-------------------------------------------');

    } catch (error) {
        console.error('❌ Scoring Failed:', error);
    }
}

testManualAudioScoring();
