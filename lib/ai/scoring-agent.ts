import { generateText } from 'ai';
import { proModel, fastModel } from './config';
import { QuestionType, AIFeedbackData } from '@/lib/types';
import { z } from 'zod';

import { AIFeedbackDataSchema } from './schemas'

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
    'describe_image': `
        **Describe Image Scoring Criteria:**
        - **Content (5 points):** Describe all main features of the image, relationships, and conclusion.
        - **Oral Fluency (5 points):** Smooth delivery, natural rhythm.
        - **Pronunciation (5 points):** Clear and understandable.
    `,
    'retell_lecture': `
        **Retell Lecture Scoring Criteria:**
        - **Content (5 points):** Captures all key points and relationships from the lecture.
        - **Oral Fluency (5 points):** Smooth delivery.
        - **Pronunciation (5 points):** Clear and understandable.
    `,
    'answer_short_question': `
        **Answer Short Question Scoring Criteria:**
        - **Content (1 point):** Correct answer is 1, incorrect is 0.
        - **Vocabulary (1 point):** Use of correct terms.
    `,
    'write_essay': `
        **Essay Scoring Criteria:**
        - **Content (3 points):** Addresses the prompt fully.
        - **Form (2 points):** 200-300 words.
        - **Grammar (2 points):** Range of grammatical structures.
        - **Vocabulary (2 points):** Precise academic vocabulary.
        - **Structure/Coherence (2 points):** Logical flow and organization.
    `,
    'default': `
        **General Scoring Criteria:**
        - Accuracy: Correctness of the answer.
        - Fluency: Smoothness of delivery (if speaking).
        - Grammar: Correct grammatical structures (if writing/speaking).
    `
};

/**
 * Transcribe audio using AssemblyAI
 */
async function transcribeAudio(audioUrl: string): Promise<{ transcript?: string; error?: string }> {
    console.log(`[Tool] Transcribing audio: ${audioUrl}`);

    const assemblyAIKey = process.env.ASSEMBLYAI_API_KEY;
    if (!assemblyAIKey) {
        return { error: 'AssemblyAI API Key missing' };
    }

    try {
        const response = await fetch('https://api.assemblyai.com/v2/transcript', {
            method: 'POST',
            headers: {
                'authorization': assemblyAIKey,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                audio_url: audioUrl,
                speaker_labels: false
            }),
        });

        const data = await response.json();

        if (data.error) throw new Error(data.error);

        const transcriptId = data.id;
        let status = data.status;
        let transcript = null;

        // Poll for completion
        while (status === 'queued' || status === 'processing') {
            await new Promise(r => setTimeout(r, 1000));
            const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
                headers: { 'authorization': assemblyAIKey }
            });
            const pollResult = await pollResponse.json();
            status = pollResult.status;
            if (status === 'completed') {
                transcript = pollResult.text;
            } else if (status === 'error') {
                throw new Error(pollResult.error);
            }
        }

        return { transcript: transcript || undefined };

    } catch (error: any) {
        console.error('[Tool] Transcription error:', error);
        return { error: error.message };
    }
}

export async function scorePteAttemptV2(
    type: QuestionType,
    params: {
        questionContent: string;
        submission: {
            text?: string;
            audioUrl?: string;
        };
        userId?: string; // Added for personalization/weak area tracking
        questionId?: string;
    }
): Promise<AIFeedbackData> {
    console.log(`[Scoring Agent] Starting scoring for ${type}`);

    let transcript: string | undefined;

    // Handle Audio Transcription First (if applicable)
    if (params.submission.audioUrl) {
        console.log(`[Scoring Agent] Processing audio: ${params.submission.audioUrl}`);
        const transcriptionResult = await transcribeAudio(params.submission.audioUrl);
        if (transcriptionResult.transcript) {
            transcript = transcriptionResult.transcript;
        } else {
            console.warn('[Scoring Agent] Transcription failed:', transcriptionResult.error);
        }
    }

    // Check for Supabase Edge Function Configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const useEdgeFunction = !!supabaseUrl && !!supabaseAnonKey;

    if (useEdgeFunction) {
        console.log('[Scoring Agent] Delegating strict scoring to Supabase Edge Function (ai-scoring)');
        try {
            // Call Edge Function
            const response = await fetch(`${supabaseUrl}/functions/v1/ai-scoring`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                },
                body: JSON.stringify({
                    questionType: type,
                    questionContent: params.questionContent,
                    submission: {
                        text: params.submission.text,
                        audioUrl: params.submission.audioUrl,
                        transcript: transcript // Pass transcript to Edge Function
                    },
                    userId: params.userId,
                    questionId: params.questionId
                })
            });

            if (!response.ok) {
                throw new Error(`Edge Function error: ${response.statusText}`);
            }

            const feedbackData = await response.json();
            // Validate usage schema
            const validatedData = AIFeedbackDataSchema.parse(feedbackData);
            return validatedData;

        } catch (error) {
            console.error('[Scoring Agent] Edge Function call failed, falling back to local scoring:', error);
            // Fall through to local logic below
        }
    }

    // --- Local Fallback Logic (Existing Implementation) ---

    // Step 1: Retrieve scoring criteria
    const questionTypeKey = type.toLowerCase().replace(/\s+/g, '_');
    const criteria = SCORING_CRITERIA[questionTypeKey] || SCORING_CRITERIA['default'];

    // Prepare the user content
    let userContent = `Question Prompt: ${params.questionContent}\n\n`;
    userContent += `Scoring Criteria:\n${criteria}\n\n`;

    // Handle Audio or Text
    if (transcript) {
        userContent += `User's Audio Transcript: ${transcript}\n\n`;
    } else if (params.submission.audioUrl) {
        userContent += `User submitted an audio file, but transcription failed.\n\n`;
    } else if (params.submission.text) {
        userContent += `User Text Response: ${params.submission.text}\n\n`;
    }

    userContent += `Please evaluate this response according to the PTE Academic scoring criteria provided above. Return a detailed JSON report with scores and feedback.`;

    // Generate scoring using Gemini
    const isFreeMode = process.env.NEXT_PUBLIC_FREE_MODE === 'true';
    const { text } = await generateText({
        model: isFreeMode ? fastModel : proModel,
        system: `You are an expert PTE Academic examiner. Your goal is to provide a detailed, accurate score and feedback for the user's response.
        
        Evaluate the response against the criteria provided. Generate a detailed JSON report following this exact structure:
        {
            "overallScore": <number 0-90>,
            "pronunciation": { "score": <number>, "feedback": "<string>" },
            "fluency": { "score": <number>, "feedback": "<string>" },
            "grammar": { "score": <number>, "feedback": "<string>" },
            "vocabulary": { "score": <number>, "feedback": "<string>" },
            "content": { "score": <number>, "feedback": "<string>" },
            "spelling": { "score": <number>, "feedback": "<string>" },
            "structure": { "score": <number>, "feedback": "<string>" },
            "accuracy": { "score": <number>, "feedback": "<string>" },
            "suggestions": ["<string>", ...],
            "strengths": ["<string>", ...],
            "areasForImprovement": ["<string>", ...]
        }
        
        Only include the criteria that are relevant to this question type. Return ONLY valid JSON, no other text.`,
        prompt: userContent,
        temperature: 0.1,
    });

    console.log('[Scoring Agent] Raw response:', text);

    // Parse the JSON response
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }

        const parsedData = JSON.parse(jsonMatch[0]);
        const validatedData = AIFeedbackDataSchema.parse(parsedData);

        console.log('[Scoring Agent] Scoring complete.');
        return validatedData;
    } catch (error) {
        console.error('[Scoring Agent] Failed to parse response:', error);
        return {
            overallScore: 0,
            suggestions: ['Unable to generate feedback. Please try again.'],
            strengths: [],
            areasForImprovement: ['System error occurred during scoring'],
        };
    }
}
