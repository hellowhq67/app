import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Validate the request body
const requestBodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = requestBodySchema.parse(body);

    const result = streamText({
      model: google('gemini-1.5-pro'),
      system: `You are an AI tutor for PTE (Pearson Test of English) preparation.
      Provide helpful, educational responses to help students improve their English language skills.
      Be encouraging, clear, and focus on PTE-specific content.
      Keep responses concise but informative. Maintain a friendly and supportive tone.
      If asked about other topics, gently redirect to PTE-related subjects.`,
      messages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('AI Assistant API Error:', error);

    if (error instanceof z.ZodError) {
      return new Response('Invalid request body', { status: 400 });
    }

    return new Response('Internal Server Error', { status: 500 });
  }
}