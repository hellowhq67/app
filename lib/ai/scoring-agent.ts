import { generateObject, embed, cosineSimilarity, experimental_transcribe as transcribe } from 'ai';
import { proModel, fastModel, assemblyAI, embeddingModel } from './config';
import { QuestionType, AIFeedbackData } from '@/lib/types';
import { AIFeedbackDataSchema } from './schemas';
import { getPromptForQuestionType } from './prompts';

/**
 * Calculates semantic similarity between user text and ideal text using embeddings.
 * Returns a score between 0 and 1.
 */
async function calculateContentSimilarity(userInput: string, idealText: string): Promise<number> {
    try {
        const [{ embedding: userEmbedding }, { embedding: idealEmbedding }] = await Promise.all([
            embed({ model: embeddingModel, value: userInput }),
            embed({ model: embeddingModel, value: idealText }),
        ]);
        return cosineSimilarity(userEmbedding, idealEmbedding);
    } catch (error) {
        console.warn('[Scoring Agent] Embedding calculation failed:', error);
        return 0;
    }
}

/**
 * Universal Scoring Agent V2
 * Supports Speaking, Writing, Reading, and Listening tasks.
 * Combines ASR (Transcription), Semantic Similarity (Embeddings), and LLM Evaluation.
 */
export async function scorePteAttemptV2(
    type: QuestionType,
    params: {
        questionContent: string;
        submission: {
            text?: string;
            audioUrl?: string;
        };
        idealAnswer?: any;
        userId?: string;
        questionId?: string;
    }
): Promise<AIFeedbackData> {
    console.log(`[Scoring Agent] Starting universal scoring for ${type}`);

    // 0. Deterministic Logic for Objective types
    const { scoreDeterministically } = await import('@/lib/pte/scoring-engine/deterministic');

    // We assume params.idealAnswer can be the complex object/JSON or string
    // In `savePteAttempt` (which calls this), we pass `question.correctAnswer`
    // However, `savePteAttempt` usually reads from DB.
    // If we passed `idealAnswer` as string into params, we might miss the complex object.
    // We should ensure params.idealAnswer can be any.

    // TEMPORARY: If we don't have the full object, deterministic might fail for some types.
    // But assuming idealAnswer IS the `correctAnswer` field from DB (which is JSONB).

    const deterministicResult = scoreDeterministically(type, params.submission.text || params.submission, params.idealAnswer);
    if (deterministicResult) {
        console.log(`[Scoring Agent] Used Deterministic Scorer for ${type}`);
        return deterministicResult;
    }


    let userText = params.submission.text;
    let transcript: string | undefined;

    // 1. Handle Audio Transcription for Speaking/Listening tasks
    if (params.submission.audioUrl) {
        console.log(`[Scoring Agent] Transcribing audio: ${params.submission.audioUrl}`);
        try {
            const response = await fetch(params.submission.audioUrl);
            const audioBuffer = await response.arrayBuffer();

            const { text } = await transcribe({
                model: assemblyAI.transcription('best'),
                audio: audioBuffer,
            });
            transcript = text;
            userText = text; // The transcript becomes the text used for semantic analysis
            console.log(`[Scoring Agent] Transcription successful.`);
        } catch (error) {
            console.warn('[Scoring Agent] Transcription failed:', error);
        }
    }

    // 2. Calculate Semantic Similarity (if ideal answer provided)
    let similarityScore = 0;
    if (userText && params.idealAnswer) {
        console.log(`[Scoring Agent] Calculating semantic similarity...`);
        similarityScore = await calculateContentSimilarity(userText, params.idealAnswer);
        console.log(`[Scoring Agent] Similarity score: ${similarityScore.toFixed(4)}`);
    }

    // 3. Prepare Prompt using the dynamic prompt system
    const promptParams: any = {
        userInput: userText,
        userTranscript: transcript,
        originalText: params.questionContent,
        promptTopic: params.questionContent,
        wordCount: userText?.split(/\s+/).length || 0,
        audioTranscript: params.idealAnswer,
        answerKey: params.idealAnswer,
        userResponse: userText,
    };

    let prompt: string;
    try {
        prompt = getPromptForQuestionType(type, promptParams);
    } catch (e) {
        console.warn(`[Scoring Agent] Specific prompt not found, using default: ${e}`);
        prompt = `Examine the user response: "${userText}" based on the prompt: "${params.questionContent}"`;
    }

    // Inject the similarity score as an extra guidance for the LLM
    const finalPrompt = `
        ${prompt}
        
        **Additional Scoring Signal (Semantic Similarity)**: 
        The calculated cosine similarity between the user's response and the ideal answer is ${similarityScore.toFixed(4)} (where 1.0 is a perfect match).
        Please use this value to inform your "Content" score and feedback. Use it to verify if the user stayed on topic and included key points.
    `;

    // 4. Generate Structured Feedback using Gemini
    const isFreeMode = process.env.NEXT_PUBLIC_FREE_MODE === 'true';
    const model = isFreeMode ? fastModel : proModel;

    console.log(`[Scoring Agent] Generating structured feedback with ${model.modelId}...`);

    try {
        const { object } = await generateObject({
            model,
            schema: AIFeedbackDataSchema,
            prompt: finalPrompt,

            temperature: 0.1,
            experimental_telemetry: {
                isEnabled: true,
                recordInputs: true,
                recordOutputs: true,
            },
        });

        // Recalculate overallScore strictly as sum of traits to avoid LLM hallucinations on math
        let rawSum = 0;
        // All possible traits in schema
        if (object.pronunciation?.score) rawSum += object.pronunciation.score;
        if (object.fluency?.score) rawSum += object.fluency.score;
        if (object.content?.score) rawSum += object.content.score;
        if (object.form?.score) rawSum += object.form.score;
        if (object.grammar?.score) rawSum += object.grammar.score;
        if (object.vocabulary?.score) rawSum += object.vocabulary.score;
        if (object.spelling?.score) rawSum += object.spelling.score;
        if (object.structure?.score) rawSum += object.structure.score;
        if (object.accuracy?.score) rawSum += object.accuracy.score;

        // Override
        object.overallScore = rawSum;

        console.log(`[Scoring Agent] Scoring complete. Raw Sum: ${rawSum}`);
        return object;
    } catch (error) {
        console.error('[Scoring Agent] LLM generation/parsing failed:', error);
        return {
            overallScore: 0,
            suggestions: ['Unable to generate feedback. Please try again.'],
            strengths: [],
            areasForImprovement: ['System error occurred during scoring. Check logs.'],
        };
    }
}