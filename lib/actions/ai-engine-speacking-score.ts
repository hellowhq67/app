import { generateObject } from 'ai';
import { proModel } from '@/lib/ai/config';
import { speakingScoreSchema } from '@/lib/pte/schemas';
import { db } from '@/lib/db/drizzle'
import { speakingAttempts } from '@/lib/db/schema/speaking';
import { getTranscriber } from '@/lib/pte/transcription'

export async function submitSpeakingAttempt({
    userId,
    questionId,
    questionType,
    audioUrl,
    durationMs,
}: {
    userId: string;
    questionId: string;
    questionType: any;
    audioUrl: string;
    durationMs: number;
}) {
    // 1. Transcribe via AssemblyAI (streamlined for NLP/detection)
    const transcriber = await getTranscriber();
    const transcriptionResult = await transcriber.transcribe({ audioUrl });

    // 2. Score via Vercel AI SDK + AI Gateway
    const { object: scoring } = await generateObject({
        model: proModel,
        schema: speakingScoreSchema,
        system: `You are a PTE Academic speaking examiner. 
    Score the following speaking response transcript based on PTE standards. 
    Analyze the transcript for fluency and content accuracy.`,
        prompt: `Transcript: ${transcriptionResult.text}`,
    });

    // 3. Persist to Database with linked Blob URL
    const [attempt] = await db.insert(speakingAttempts).values({
        userId,
        questionId,
        type: questionType,
        audioUrl,
        transcript: transcriptionResult.text,
        overallScore: scoring.overallScore,
        pronunciationScore: scoring.pronunciationScore,
        fluencyScore: scoring.fluencyScore,
        contentScore: scoring.contentScore,
        durationMs,
        timings: transcriptionResult.words || [],
        scores: scoring,
    }).returning();

    return attempt;
}
