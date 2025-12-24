import { z } from 'zod';

export const writingScoreSchema = z.object({
    overallScore: z.number(),
    grammarScore: z.number(),
    vocabularyScore: z.number(),
    coherenceScore: z.number(),
    contentScore: z.number(),
    feedback: z.string(),
    suggestions: z.array(z.string()),
});

export const speakingScoreSchema = z.object({
    overallScore: z.number(),
    pronunciationScore: z.number(),
    fluencyScore: z.number(),
    contentScore: z.number(),
    feedback: z.string(),
    suggestions: z.array(z.string()),
});
