import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

export const proModel = openai('gpt-4o');
export const fastModel = openai('gpt-4o-mini');
export const geminiModel = google('gemini-1.5-pro');
