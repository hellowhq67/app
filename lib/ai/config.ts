import { createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { env } from '@/lib/env';

// Vercel AI Gateway configuration
const gateway = createOpenAI({
    apiKey: env.AI_GATEWAY_API_KEY,
    baseURL: env.AI_GATEWAY_URL || '', // Fallback to provided structure if URL is empty but key exists
});

export const proModel = gateway('gpt-4o');
export const fastModel = gateway('gpt-4o-mini');
export const geminiModel = google('gemini-1.5-pro');
