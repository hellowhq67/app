import 'dotenv/config'; // Load env vars
import { scorePteAttemptV2 } from '@/lib/ai/scoring-agent';
import { QuestionType } from '@/lib/types';

async function testMockScoring() {
    console.log('🧪 Testing Strict Mock Scoring Logic...');

    const audioUrl = 'https://apeuni-mb-sg.s3.ap-southeast-1.amazonaws.com/tmp/2026-01-08/audio/ios/answer/271e6ff3f6/read_alouds/1454/1767887787811_403085_0.0_24839.625.wav';

    // Test Case 1: Read Aloud (Strict error counting)
    console.log('\n--- Test 1: Read Aloud (Mock Mode) ---');
    const raResult = await scorePteAttemptV2(QuestionType.READ_ALOUD, {
        submission: { audioUrl },
        questionContent: 'The best time to visit Canada is typically between spring and fall particularly specifically the months of April and October.',
        idealAnswer: 'The best time to visit Canada is typically between spring and fall, particularly specifically the months of April and October.',
    });
    console.log('Result:', JSON.stringify(raResult, null, 2));

    // Test Case 2: Essay (Strict LLM evaluation)
    console.log('\n--- Test 2: Write Essay (Mock Mode) ---');
    const essayResult = await scorePteAttemptV2(QuestionType.WRITE_ESSAY, {
        submission: { text: "This is a very short essay. It definitely does not meet the word count requirements. However, it is grammatically correct." },
        questionContent: "Do you think technology has improved our lives?",
    });
    console.log('Result:', JSON.stringify(essayResult, null, 2));
}

testMockScoring().catch(console.error);
