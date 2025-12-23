
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { scoreAttempt } from '../lib/pte/speaking-score';
import { SpeakingType } from '../lib/pte/types';

async function main() {
  console.log("🚀 Testing AI Scoring (Real vs Fallback)...");

  const mockInput = {
    type: 'read_aloud' as SpeakingType,
    question: {
      id: 'test-1',
      title: 'Test Read Aloud',
      content: 'The quick brown fox jumps over the lazy dog.',
      promptText: 'The quick brown fox jumps over the lazy dog.',
      type: 'read_aloud',
      isActive: true,
      difficulty: 'Medium',
    } as any, // Cast to any to avoid full schema requirement for test
    transcript: 'The quick brown fox jumps over the lazy dog.', // Perfect match
    audioUrl: 'http://example.com/audio.mp3', // Dummy URL
    durationMs: 5000,
  };

  try {
    const result = await scoreAttempt(mockInput);
    console.log("\n📊 Scoring Result:");
    console.log(JSON.stringify(result, null, 2));

    if (result.feedback.includes("AI scoring unavailable")) {
        console.log("\n⚠️  Result indicates FALLBACK mode (Mock).");
        console.log("   Reason: Likely missing GOOGLE_GENERATIVE_AI_API_KEY.");
    } else {
        console.log("\n✅ Result indicates REAL AI scoring.");
    }

  } catch (error) {
    console.error("Error running scoreAttempt:", error);
  }
}

main();
