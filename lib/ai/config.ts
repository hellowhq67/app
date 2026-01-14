import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY,
});

// Using Gemini for all AI operations for cost efficiency and multi-modal capabilities
// API key is automatically picked up from GOOGLE_GENERATIVE_AI_API_KEY environment variable
export const proModel = google('gemini-2.5-flash');
export const fastModel = google('gemini-2.5-flash');
export const geminiModel = google('gemini-2.5-flash');
export const embeddingModel = google.embedding('text-embedding-004');

import { createAssemblyAI } from '@ai-sdk/assemblyai';

export const assemblyAI = createAssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY,
});
