import 'dotenv/config';
import { scorePteAttemptV2 } from '@/lib/ai/scoring-agent';
import { QuestionType } from '@/lib/types';

async function verifyStrictScoring() {
    console.log('🧪 VERIFYING STRICT SCORING ENGINE (OFFICIAL RUBRIC)');

    // 1. READ ALOUD: Strict Word Matching
    console.log('\n--- 1. READ ALOUD Strict Test ---');
    const raText = "The best time to visit Canada is typically between spring and fall particularly specifically the months of April and October.";

    // Case A: Perfect
    console.log('Case A: Perfect Answer');
    const raPerfect = await scorePteAttemptV2(QuestionType.READ_ALOUD, {
        submission: { text: raText }, // Simulating perfect ASR
        questionContent: raText,
    });
    console.log(`> Expected 90/90 Content. Got: ${raPerfect.content?.score}`);
    console.log(`> Features: ${JSON.stringify(raPerfect.scoringMetrics)}`);

    // Case B: Missing Words (Penalty)
    console.log('Case B: Missing "particularly specifically"');
    const raMissing = await scorePteAttemptV2(QuestionType.READ_ALOUD, {
        submission: { text: "The best time to visit Canada is typically between spring and fall the months of April and October." },
        questionContent: raText,
    });
    console.log(`> Content Score should drop. Got: ${raMissing.content?.score}`);

    // 2. ESSAY: Form & Content
    console.log('\n--- 2. ESSAY Strict Test ---');
    const prompt = "Do you think technology has improved our lives?";

    // Case A: Too Short (Form Penalty)
    console.log('Case A: Short Essay (<200 words)');
    const essayShort = await scorePteAttemptV2(QuestionType.WRITE_ESSAY, {
        submission: { text: "Technology is good. It helps us work faster." },
        questionContent: prompt,
    });
    console.log(`> Form Score (Length): ${essayShort.structure?.score} (Expected Low/0)`);
    console.log(`> Overall: ${essayShort.overallScore}`);

    console.log('\n✅ Verification Complete.');
}

verifyStrictScoring().catch(console.error);
