
import 'dotenv/config';
import { scorePteAttemptV2 } from '@/lib/ai/scoring-agent';
import { QuestionType } from '@/lib/types';

async function testAiScoring() {
    console.log('Testing AI Scoring...');

    const mockEssay = `
    The rise of technology has transformed the way we communicate.
    While some argue it isolates us, others believe it brings us closer.
    In my opinion, technology facilitates global connection but can reduce face-to-face intimacy.
    Platforms like Zoom and WhatsApp allow instant communication across borders, fostering business and personal relationships.
    However, reliance on screens may erode social skills and emotional depth in physical interactions.
    Therefore, a balanced approach is essential to harness benefits without losing human touch.
  `;

    const prompt = "Discuss the impact of technology on communication.";

    try {
        console.log('Sending request to AI...');
        const feedback = await scorePteAttemptV2(QuestionType.WRITE_ESSAY, {
            questionContent: prompt,
            submission: { text: mockEssay },
            userId: 'test-user',
            questionId: 'test-question-id'
        });

        console.log('\n--- AI Feedback (Essay) ---');
        console.log(JSON.stringify(feedback, null, 2));

        // Test 2: Audio Transcription (Describe Image)
        console.log('\n[Test 2] Testing Audio Transcription (Describe Image)...');
        const audioUrl = 'https://sgp1.digitaloceanspaces.com/liilab/quizbit/media/0q708i1sfeb.m4a '

        const audioFeedback = await scorePteAttemptV2(QuestionType.DESCRIBE_IMAGE, {
            questionContent: 'Describe the audio/image provided.',
            submission: {
                audioUrl: audioUrl
            },
            userId: 'test-user-audio',
            questionId: 'test-question-audio'
        });

        console.log('\n--- AI Feedback (Audio) ---');
        console.log(JSON.stringify(audioFeedback, null, 2));

        console.log('\nTest Completed Successfully.');
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testAiScoring();