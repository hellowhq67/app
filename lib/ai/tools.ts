import { z } from 'zod';
import { tool } from 'ai';
import { env } from '@/lib/env';

// Mock database of scoring criteria (RAG Knowledge Base)
const SCORING_CRITERIA: Record<string, string> = {
    'read_aloud': `
        **Read Aloud Scoring Criteria:**
        - **Content (5 points):** Does the speaker include all words from the text? Omissions or insertions differ.
        - **Oral Fluency (5 points):** Rhythm, phrasing, and stress. No hesitations or repetitions.
        - **Pronunciation (5 points):** Intelligibility and clarity. Vowels and consonants are produced correctly.
    `,
    'repeat_sentence': `
        **Repeat Sentence Scoring Criteria:**
        - **Content (3 points):** All words in sequence = 3. >50% words = 2. <50% = 1.
        - **Oral Fluency (5 points):** Smooth delivery.
        - **Pronunciation (5 points):** Clear and understandable.
    `,
    'default': `
        **General Scoring Criteria:**
        - Accuracy: Correctness of the answer.
        - Fluency: Smoothness of delivery (if speaking).
        - Grammar: Correct grammatical structures (if writing/speaking).
    `
};

export const retrieveScoringCriteria = tool({
    description: 'Retrieve scoring criteria and rubrics for a specific PTE question type.',
    parameters: z.object({
        questionType: z.string().describe('The type of PTE question (e.g., read_aloud, write_essay).'),
    }),
    execute: async ({ questionType }) => {
        // In a real RAG system, this would query a vector database (e.g., Pinecone/Milvus)
        // using embeddings of the question type or specific question content.
        console.log(`[RAG] Retrieving criteria for: ${questionType}`);
        const criteria = SCORING_CRITERIA[questionType] || SCORING_CRITERIA['default'];
        return { criteria };
    },
});

export const fetchAudioAsBase64 = tool({
    description: 'Fetch audio from a URL and convert it to a base64 string.',
    parameters: z.object({
        url: z.string().url().describe('The URL of the audio file.'),
    }),
    execute: async ({ url }) => {
        console.log(`[Tool] Fetching audio from: ${url}`);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch audio: ${response.statusText}`);
            const arrayBuffer = await response.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            return { base64, mimeType: response.headers.get('content-type') || 'audio/mp3' };
        } catch (error: any) {
            console.error('[Tool] Audio fetch error:', error);
            return { error: error.message };
        }
    },
});

export const transcribeAudio = tool({
    description: 'Transcribe audio using AssemblyAI.',
    parameters: z.object({
        audioUrl: z.string().url(),
    }),
    execute: async ({ audioUrl }) => {
        console.log(`[Tool] Transcribing audio: ${audioUrl}`);
        if (!env.ASSEMBLYAI_API_KEY) {
             return { error: 'AssemblyAI API Key missing' };
        }

        try {
            const response = await fetch('https://api.assemblyai.com/v2/transcript', {
                method: 'POST',
                headers: {
                    'authorization': env.ASSEMBLYAI_API_KEY,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    audio_url: audioUrl,
                    speaker_labels: false
                }),
            });

            const data = await response.json();
            
            if (data.error) throw new Error(data.error);
            
            // AssemblyAI is async, so we usually poll. 
            // For this specific tool, assuming we might want to wait or use a webhook.
            // But for a synchronous tool call, we must poll.
            
            const transcriptId = data.id;
            let status = data.status;
            let transcript = null;

            while (status === 'queued' || status === 'processing') {
                await new Promise(r => setTimeout(r, 1000));
                const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
                    headers: { 'authorization': env.ASSEMBLYAI_API_KEY }
                });
                const pollResult = await pollResponse.json();
                status = pollResult.status;
                if (status === 'completed') {
                    transcript = pollResult.text;
                } else if (status === 'error') {
                    throw new Error(pollResult.error);
                }
            }

            return { transcript };

        } catch (error: any) {
            console.error('[Tool] Transcription error:', error);
            return { error: error.message };
        }
    },
});
