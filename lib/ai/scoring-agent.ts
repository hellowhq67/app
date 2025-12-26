import { generateText, tool, Output } from 'ai';
import { geminiModel, fastModel } from './config';
import { QuestionType, AIFeedbackData } from '@/lib/types';
import { z } from 'zod';
import { retrieveScoringCriteria, transcribeAudio } from './tools';
import { env } from '@/lib/env';

// Define the schema for the feedback data
const AIFeedbackDataSchema = z.object({
    overallScore: z.number().describe('Overall score from 0-90'),
    pronunciation: z.object({ score: z.number(), feedback: z.string() }).optional(),
    fluency: z.object({ score: z.number(), feedback: z.string() }).optional(),
    grammar: z.object({ score: z.number(), feedback: z.string() }).optional(),
    vocabulary: z.object({ score: z.number(), feedback: z.string() }).optional(),
    content: z.object({ score: z.number(), feedback: z.string() }).optional(),
    spelling: z.object({ score: z.number(), feedback: z.string() }).optional(),
    structure: z.object({ score: z.number(), feedback: z.string() }).optional(),
    accuracy: z.object({ score: z.number(), feedback: z.string() }).optional(),
    suggestions: z.array(z.string()).describe('List of actionable suggestions for improvement'),
    strengths: z.array(z.string()).describe('List of strengths identified in the response'),
    areasForImprovement: z.array(z.string()).describe('List of specific areas to improve')
});

/**
 * Fetches audio from a URL and converts it to a base64 string.
 * This is a helper function, not a tool for the model.
 */
async function fetchAudioBase64(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer).toString('base64');
    } catch (error) {
        console.error('Audio fetch error:', error);
        return null;
    }
}

/**
 * Orchestration Agent for PTE Scoring
 * Uses Gemini 1.5 Pro with native audio capabilities, RAG for criteria, and AssemblyAI for transcription verification.
 */
export async function scorePteAttemptV2(
    type: QuestionType,
    params: {
        questionContent: string;
        submission: {
            text?: string;
            audioUrl?: string;
        };
    }
): Promise<AIFeedbackData> {
    console.log(`[Scoring Agent] Starting scoring for ${type}`);
    
    // Prepare the user content
    const userContent: any[] = [ 
        { type: 'text', text: `Question Prompt: ${params.questionContent}` } 
    ];

    // Handle Audio
    if (params.submission.audioUrl) {
        console.log(`[Scoring Agent] Processing audio: ${params.submission.audioUrl}`);
        
        // 1. Fetch Base64 for Gemini Native Audio
        const audioBase64 = await fetchAudioBase64(params.submission.audioUrl);
        if (audioBase64) {
            userContent.push({
                type: 'file',
                data: audioBase64,
                mimeType: 'audio/mp3' // Assumption, or detect from fetch
            });
            userContent.push({ type: 'text', text: 'This is the user\'s audio response.' });
        } else {
            console.warn('[Scoring Agent] Failed to fetch audio base64. Proceeding with transcription only if available.');
        }

        // 2. Add transcription instruction (Agent will call the tool)
        userContent.push({ 
            type: 'text', 
            text: `The user submitted an audio file at: ${params.submission.audioUrl}. \n` + 
                  `Please transcribe it using the transcription tool to verify the content accuracy against the native audio understanding.` 
        });
    } else if (params.submission.text) {
        userContent.push({ type: 'text', text: `User Text Response: ${params.submission.text}` });
    }

    // Agent Orchestration
    const { output } = await generateText({
        model: geminiModel, // Gemini 1.5 Pro
        tools: {
            retrieveScoringCriteria,
            transcribeAudio
        },
        maxSteps: 5, // Allow multi-step reasoning (RAG -> Transcribe -> Score)
        system: `You are an expert PTE Academic examiner. Your goal is to provide a detailed, accurate score and feedback for the user's response.
        
        Follow this process:
        1. Retrieve the scoring criteria for the question type: "${type}".
        2. If audio is provided:
           - Listen to the audio (provided natively).
           - Transcribe it using the 'transcribeAudio' tool to ensure you catch every word for content scoring.
           - Compare your native listening understanding with the transcript.
        3. Evaluate the response against the criteria (Content, Fluency, Pronunciation, etc.).
        4. Generate a detailed JSON report.`,
        messages: [
            {
                role: 'user',
                content: userContent
            }
        ],
        output: Output.object({
            schema: AIFeedbackDataSchema
        })
    });

    console.log('[Scoring Agent] Scoring complete.');
    return output;
}
