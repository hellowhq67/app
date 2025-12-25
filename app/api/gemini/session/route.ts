import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function POST() {
    const session = await getSession();

    if (!session?.user?.id) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Provide the Gemini API key and session configuration to the client
    // In a production app, you might use a more secure way to handle this,
    // but for this implementation, we'll provide the configuration needed for the WebSocket.
    return NextResponse.json({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
        config: {
            model: 'models/gemini-2.0-flash-exp', // Using the latest multimodal live model
            generationConfig: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: 'Puck', // or Aoide, Charon, Fenrir, Kore
                        },
                    },
                },
            },
            systemInstruction: {
                parts: [{
                    text: `You are a helpful PTE Academic assistant. 
          You can help students with their preparation, check their stats, and find practice questions.
          Use the provided tools to interact with the database.
          Keep your responses concise and focused on the student's needs.
          Speak naturally and encouragingly.`
                }]
            }
        }
    });
}
