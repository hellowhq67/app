# Vercel AI SDK

The Vercel AI SDK is a comprehensive TypeScript toolkit for building AI-powered applications with language models. It provides a unified interface for interacting with multiple AI providers (OpenAI, Anthropic, Google, and 40+ others) and offers framework-agnostic hooks for React, Vue, Svelte, and Angular. The SDK handles streaming, tool calling, structured output generation, and agentic workflows with built-in support for multi-step reasoning and complex interactions.

The SDK consists of three main layers: the Core AI module (`ai`) for server-side model interactions, framework-specific UI modules (`@ai-sdk/react`, `@ai-sdk/vue`, etc.) for building chat interfaces, and provider packages (`@ai-sdk/openai`, `@ai-sdk/anthropic`, etc.) for model access. It supports both streaming and non-streaming generation, automatic tool execution with approval workflows, structured data extraction using Zod schemas, stateful agent systems that can execute multi-step tasks autonomously, Model Context Protocol (MCP) integration for connecting to external tools and services, and multimedia capabilities including image generation, text-to-speech, audio transcription, and document reranking.

## generateText - Generate text with tool calls

Generate text responses from language models with automatic tool calling and multi-step execution. Returns complete response after all tool calls are executed.

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = await generateText({
  model: openai('gpt-4-turbo'),
  prompt: 'What is the weather in San Francisco and what should I wear?',
  tools: {
    getWeather: {
      description: 'Get the weather for a location',
      parameters: z.object({
        city: z.string().describe('The city name')
      }),
      execute: async ({ city }) => {
        // API call to weather service
        return { temperature: 72, condition: 'sunny' };
      }
    }
  },
  maxRetries: 2,
  temperature: 0.7
});

console.log(result.text); // Final text after tool execution
console.log(result.toolCalls); // All tool calls made
console.log(result.usage); // Token usage statistics
console.log(result.steps); // All generation steps
```

## streamText - Stream text with real-time tool execution

Stream text generation with real-time tool calling and event callbacks. Returns stream result with multiple consumption methods.

```typescript
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const result = streamText({
  model: anthropic('claude-3-5-sonnet-20241022'),
  system: 'You are a helpful assistant with access to real-time data.',
  prompt: 'Search for recent news about AI and summarize the top 3 articles.',
  tools: {
    searchWeb: {
      description: 'Search the web for information',
      parameters: z.object({
        query: z.string()
      }),
      execute: async ({ query }) => {
        // Perform web search
        return { results: ['Article 1...', 'Article 2...', 'Article 3...'] };
      }
    }
  },
  onChunk: async ({ chunk }) => {
    if (chunk.type === 'text-delta') {
      process.stdout.write(chunk.text);
    }
  },
  onFinish: async ({ text, toolCalls, usage, steps }) => {
    console.log('\n\nGeneration complete');
    console.log('Total steps:', steps.length);
    console.log('Total tokens:', usage.totalTokens);
  }
});

// Multiple ways to consume the stream
for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}

// Or get the full result
const { text, toolResults } = await result;
```

## generateObject - Extract structured data

Generate type-safe structured objects from language models using Zod schemas. Automatically validates and parses model output.

```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = await generateObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.object({
        name: z.string(),
        amount: z.string(),
        unit: z.string()
      })),
      steps: z.array(z.string()),
      prepTime: z.number().describe('Preparation time in minutes'),
      cookTime: z.number().describe('Cooking time in minutes')
    })
  }),
  prompt: 'Generate a vegetarian lasagna recipe for 4 people.',
  mode: 'json', // 'auto', 'json', or 'tool'
  temperature: 0.3
});

console.log(result.object.recipe.name);
console.log(result.object.recipe.ingredients);
console.log(result.usage);
```

## streamObject - Stream structured data

Stream partial structured objects as they're generated. Enables progressive UI updates while maintaining type safety.

```typescript
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = streamObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    characters: z.array(z.object({
      name: z.string(),
      class: z.string(),
      bio: z.string()
    }))
  }),
  prompt: 'Generate 3 fantasy RPG characters with detailed backgrounds.'
});

// Stream partial objects
for await (const partialObject of result.partialObjectStream) {
  console.clear();
  console.log('Current progress:', JSON.stringify(partialObject, null, 2));
}

// Get final validated object
const { object } = await result;
console.log('Final result:', object);
```

## ToolLoopAgent - Autonomous multi-step agents

Create reusable agents that can execute multi-step workflows with tools. ToolLoopAgent automatically handles tool calling loops and can be used across your application.

```typescript
import { ToolLoopAgent } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const researchAgent = new ToolLoopAgent({
  model: openai('gpt-4-turbo'),
  id: 'research-agent',
  instructions: 'You are a research assistant that can search the web and analyze data.',
  tools: {
    searchWeb: {
      description: 'Search the web for information',
      parameters: z.object({
        query: z.string()
      }),
      execute: async ({ query }) => {
        // Perform search
        return { results: ['...'] };
      }
    },
    analyzeData: {
      description: 'Analyze data and provide insights',
      parameters: z.object({
        data: z.array(z.string())
      }),
      execute: async ({ data }) => {
        // Perform analysis
        return { insights: '...' };
      }
    }
  },
  stopWhen: async ({ steps }) => steps.length >= 10 || steps.at(-1)?.finishReason === 'stop',
  maxOutputTokens: 4096
});

// Use the agent (non-streaming)
const result = await researchAgent.generate({
  prompt: 'Research the latest developments in quantum computing and summarize key breakthroughs.'
});

console.log(result.content);
console.log(result.steps.length, 'steps executed');

// Or stream responses
const stream = researchAgent.stream({
  prompt: 'What are the current applications of quantum computing in cryptography?'
});

for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}
```

## useChat - React chat interface

React hook for building chat UIs with streaming responses and tool invocations. Manages message state and handles user interactions.

```typescript
'use client';

import { useChat } from '@ai-sdk/react';

export default function ChatComponent() {
  const { messages, status, sendMessage, stop, addToolOutput } = useChat({
    api: '/api/chat',
    initialMessages: [
      { id: '1', role: 'system', content: 'You are a helpful assistant.' }
    ],
    onFinish: (message) => {
      console.log('Message complete:', message);
    },
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const input = formData.get('message') as string;

    sendMessage({ text: input });
    e.currentTarget.reset();
  };

  return (
    <div>
      <div className="messages">
        {messages.map(message => (
          <div key={message.id} className={`message message-${message.role}`}>
            {message.parts.map((part, i) => {
              switch (part.type) {
                case 'text':
                  return <p key={i}>{part.text}</p>;
                case 'tool-image_generation':
                  if (part.state === 'output-available') {
                    return <img key={i} src={`data:image/png;base64,${part.output.result}`} />;
                  }
                  return <p key={i}>Generating image...</p>;
                default:
                  return null;
              }
            })}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          name="message"
          placeholder="Type a message..."
          disabled={status !== 'ready'}
        />
        <button type="submit" disabled={status !== 'ready'}>
          Send
        </button>
        {status === 'in-progress' && (
          <button type="button" onClick={stop}>Stop</button>
        )}
      </form>
    </div>
  );
}
```

## Chat API Route - Next.js App Router

Server-side chat endpoint that streams responses to the client. Uses agents with tool calling for complex interactions.

```typescript
// app/api/chat/route.ts
import { ToolLoopAgent, createAgentUIStreamResponse } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const chatAgent = new ToolLoopAgent({
  model: openai('gpt-4-turbo'),
  instructions: 'You are a helpful assistant that can search the web and perform calculations.',
  tools: {
    search: {
      description: 'Search for information',
      parameters: z.object({ query: z.string() }),
      execute: async ({ query }) => {
        // Implement search
        return { results: ['...'] };
      }
    },
    calculate: {
      description: 'Perform a calculation',
      parameters: z.object({ expression: z.string() }),
      execute: async ({ expression }) => {
        // Implement calculator
        return { result: eval(expression) };
      }
    }
  }
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createAgentUIStreamResponse({
    agent: chatAgent,
    messages,
  });
}
```

## Tool Approval Workflow - User-controlled tool execution

Implement approval flows for sensitive tool operations. User can approve or deny each tool call before execution.

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = streamText({
  model: openai('gpt-4-turbo'),
  prompt: 'Delete the file named old-data.txt',
  tools: {
    deleteFile: {
      description: 'Delete a file from the filesystem',
      parameters: z.object({
        filename: z.string()
      }),
      requiresApproval: async ({ input }) => {
        // Require approval for deletions
        return true;
      },
      execute: async ({ filename }) => {
        // Delete file
        return { success: true };
      }
    }
  }
});

// Handle tool approval requests
for await (const chunk of result.fullStream) {
  if (chunk.type === 'tool-approval-request') {
    const userApproved = await askUser(
      `Approve deletion of ${chunk.toolCall.input.filename}?`
    );

    if (userApproved) {
      await result.addToolApprovalResponse({
        approvalId: chunk.approvalId,
        approved: true
      });
    } else {
      await result.addToolApprovalResponse({
        approvalId: chunk.approvalId,
        approved: false,
        reason: 'User denied permission'
      });
    }
  }
}
```

## MCP Integration - Model Context Protocol

Connect to MCP servers to access external tools and services. Supports stdio, HTTP, and SSE transports with OAuth authentication.

```typescript
import { createMCPClient } from '@ai-sdk/mcp';
import { Experimental_StdioMCPTransport } from '@ai-sdk/mcp/mcp-stdio';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Create MCP client with stdio transport
const mcpClient = createMCPClient({
  transport: new Experimental_StdioMCPTransport({
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
  }),
  capabilities: {
    tools: true,
    prompts: true,
  }
});

// Get tools from MCP server
const tools = await mcpClient.getTools();

// Use MCP tools with generateText
const result = await generateText({
  model: openai('gpt-4-turbo'),
  prompt: 'List files in the current directory',
  tools: tools,
});

console.log(result.text);

// Clean up
await mcpClient.close();
```

## embed - Generate text embeddings

Generate vector embeddings for text using various embedding models. Useful for semantic search and similarity matching.

```typescript
import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: 'The quick brown fox jumps over the lazy dog.',
  dimensions: 512 // Optional: reduce dimensionality
});

console.log(result.embedding); // Float array of embedding values
console.log(result.usage); // Token usage
```

## embedMany - Batch embedding generation

Generate embeddings for multiple texts efficiently with automatic batching and retry handling.

```typescript
import { embedMany, cosineSimilarity } from 'ai';
import { openai } from '@ai-sdk/openai';

const texts = [
  'Artificial intelligence is transforming technology.',
  'Machine learning models require large datasets.',
  'Natural language processing enables human-computer interaction.'
];

const result = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: texts,
  maxRetries: 2
});

console.log(result.embeddings); // Array of embedding arrays
console.log(result.usage); // Total token usage

// Calculate cosine similarity between embeddings
const similarity = cosineSimilarity(result.embeddings[0], result.embeddings[1]);
console.log('Similarity:', similarity);
```

## generateImage - Generate images from text

Generate images using image generation models like DALL-E, Stable Diffusion, and others. Supports multiple providers and advanced configuration.

```typescript
import { generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateImage({
  model: openai.image('dall-e-3'),
  prompt: 'A serene mountain landscape at sunset with a lake in the foreground',
  n: 1, // Number of images
  size: '1024x1024',
  aspectRatio: '16:9', // Alternative to size
  seed: 12345, // For reproducibility
  providerOptions: {
    openai: {
      style: 'vivid',
      quality: 'hd'
    }
  }
});

console.log(result.images); // Array of generated images
console.log(result.images[0].base64); // Base64-encoded image data
console.log(result.images[0].uint8Array); // Raw image bytes

// Save image to file
import fs from 'fs';
fs.writeFileSync('output.png', result.images[0].uint8Array);
```

## generateSpeech - Convert text to speech

Generate speech audio from text using text-to-speech models. Supports multiple voices, languages, and audio formats.

```typescript
import { generateSpeech } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateSpeech({
  model: openai.speech('tts-1'),
  text: 'Hello, welcome to the AI SDK. This is a demonstration of text-to-speech capabilities.',
  voice: 'alloy', // Voice selection
  outputFormat: 'mp3', // 'mp3' | 'wav' | 'opus' | 'aac' | 'flac'
  speed: 1.0, // Speech speed (0.25 to 4.0)
  language: 'en', // ISO 639-1 language code
  instructions: 'Speak in a friendly and enthusiastic tone'
});

console.log(result.audio); // Audio file object
console.log(result.audio.uint8Array); // Raw audio bytes
console.log(result.warnings); // Any warnings from generation

// Save audio to file
import fs from 'fs';
fs.writeFileSync('output.mp3', result.audio.uint8Array);
```

## experimental_transcribe - Transcribe audio to text

Transcribe audio files to text using speech recognition models like Whisper. Supports various audio formats and returns detailed transcription data.

```typescript
import { experimental_transcribe } from 'ai';
import { openai } from '@ai-sdk/openai';
import fs from 'fs';

// Transcribe from file
const audioData = fs.readFileSync('recording.mp3');

const result = await experimental_transcribe({
  model: openai.transcription('whisper-1'),
  audio: audioData,
  language: 'en', // Optional: specify source language
  prompt: 'This is a technical discussion about AI.' // Optional: context hint
});

console.log(result.text); // Full transcription
console.log(result.segments); // Timestamped segments
console.log(result.language); // Detected language
console.log(result.duration); // Audio duration in seconds

// Access timestamped segments
result.segments?.forEach(segment => {
  console.log(`[${segment.start}s - ${segment.end}s]: ${segment.text}`);
});
```

## rerank - Rerank documents by relevance

Rerank a list of documents based on their relevance to a query using specialized reranking models. More accurate than simple embedding similarity for search and retrieval.

```typescript
import { rerank } from 'ai';
import { cohere } from '@ai-sdk/cohere';

const documents = [
  { id: '1', text: 'Machine learning is a subset of artificial intelligence.' },
  { id: '2', text: 'Paris is the capital city of France.' },
  { id: '3', text: 'Neural networks are inspired by the human brain.' },
  { id: '4', text: 'The Eiffel Tower is located in Paris.' },
  { id: '5', text: 'Deep learning uses multiple layers of neural networks.' }
];

const result = await rerank({
  model: cohere.reranker('rerank-english-v3.0'),
  query: 'What is artificial intelligence and machine learning?',
  documents: documents.map(doc => doc.text),
  topN: 3 // Return top 3 most relevant documents
});

console.log(result.ranking); // Ranked results with relevance scores
result.ranking.forEach(ranked => {
  console.log(`Original Index ${ranked.originalIndex}: Score ${ranked.score}`);
  console.log(`Document: ${ranked.document}\n`);
});

// Access reranked documents directly
console.log(result.rerankedDocuments);
```

## Provider Configuration - Multiple AI providers

Configure and use multiple AI providers in the same application. The SDK provides unified interfaces across all providers.

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai-compatible';

// OpenAI
const openaiResult = await generateText({
  model: openai('gpt-4-turbo', {
    apiKey: process.env.OPENAI_API_KEY
  }),
  prompt: 'Explain quantum computing.'
});

// Anthropic
const anthropicResult = await generateText({
  model: anthropic('claude-3-5-sonnet-20241022', {
    apiKey: process.env.ANTHROPIC_API_KEY
  }),
  prompt: 'Explain quantum computing.'
});

// Google Gemini
const googleResult = await generateText({
  model: google('gemini-1.5-pro', {
    apiKey: process.env.GOOGLE_API_KEY
  }),
  prompt: 'Explain quantum computing.'
});

// OpenAI-compatible providers (Groq, Together, etc.)
const groq = createOpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

const groqResult = await generateText({
  model: groq('llama-3.1-70b-versatile'),
  prompt: 'Explain quantum computing.'
});

// Or use Vercel AI Gateway for unified access
const gatewayResult = await generateText({
  model: 'openai/gpt-4-turbo', // Gateway handles routing
  prompt: 'Explain quantum computing.'
});
```

## Multi-step Reasoning with Callbacks

Track and control multi-step generation processes with detailed callbacks for each step. Useful for debugging and monitoring agent behavior.

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = await generateText({
  model: openai('gpt-4-turbo'),
  prompt: 'Research the history of the internet and create a timeline.',
  tools: {
    search: {
      description: 'Search for information',
      parameters: z.object({ query: z.string() }),
      execute: async ({ query }) => ({ results: ['...'] })
    }
  },
  stopWhen: ({ steps }) => steps.length >= 5,
  onStepFinish: async (stepResult) => {
    console.log(`\n--- Step ${stepResult.response.messages.length} ---`);
    console.log('Finish reason:', stepResult.finishReason);
    console.log('Tool calls:', stepResult.toolCalls?.length || 0);
    console.log('Tokens used:', stepResult.usage.totalTokens);

    if (stepResult.toolCalls) {
      stepResult.toolCalls.forEach(call => {
        console.log(`Tool: ${call.toolName}`, call.input);
      });
    }
  },
  onFinish: async ({ steps, totalUsage, text }) => {
    console.log('\n=== Generation Complete ===');
    console.log('Total steps:', steps.length);
    console.log('Total tokens:', totalUsage.totalTokens);
    console.log('Final output length:', text.length);
  }
});

console.log('\nFinal result:', result.text);
```

## Structured Output with Output Helpers

Generate structured outputs with helper functions for arrays, choices, and unstructured JSON. Simplifies schema definition and provides better type safety.

```typescript
import { generateText, Output, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Generate an array of objects
const arrayResult = await generateText({
  model: openai('gpt-4o-mini'),
  output: Output.array({
    element: z.object({
      name: z.string(),
      email: z.string().email(),
      role: z.enum(['admin', 'user', 'guest'])
    })
  }),
  stopWhen: stepCountIs(5),
  prompt: 'Generate 5 sample user profiles.'
});

console.log(arrayResult.output); // Array of user objects

// Generate an enum/choice
const choiceResult = await generateText({
  model: openai('gpt-4o-mini'),
  output: Output.choice({
    options: ['positive', 'negative', 'neutral']
  }),
  prompt: 'Analyze the sentiment of: "This product is amazing!"'
});

console.log(choiceResult.output); // 'positive' | 'negative' | 'neutral'

// Generate unstructured JSON (no schema required)
const jsonResult = await generateText({
  model: openai('gpt-4o-mini'),
  output: Output.json(),
  system: 'Return JSON only, no other text.',
  prompt: 'Generate a flexible JSON object with user data and metadata.'
});

console.log(jsonResult.output); // Any JSON value

// Or use Output.object() with generateText for type-safe objects
const objectResult = await generateText({
  model: openai('gpt-4o-mini'),
  output: Output.object({
    schema: z.object({
      users: z.array(z.object({
        name: z.string(),
        email: z.string().email(),
        age: z.number().min(0).max(120)
      }))
    })
  }),
  prompt: 'Generate 3 user profiles.'
});

console.log(objectResult.output.users);
```

## The Vercel AI SDK provides comprehensive tools for building production-ready AI applications with type safety, streaming support, and multi-provider compatibility. The core `generateText` and `streamText` functions handle text generation with automatic tool calling and multi-step reasoning, enabling complex agentic workflows. For structured data extraction, `generateObject` and `streamObject` parse LLM outputs into type-safe objects using Zod schemas with validation, while `generateText` can also produce structured outputs using the `output` parameter with helpers like `Output.object()`, `Output.array()`, `Output.choice()`, and `Output.json()`. The `ToolLoopAgent` class encapsulates reusable AI behaviors with tools and instructions, making it easy to create specialized assistants that can execute multi-step workflows autonomously and be integrated into chat interfaces via `createAgentUIStreamResponse`.

Framework integration is seamless through UI hooks like `useChat` for React from `@ai-sdk/react`, plus similar hooks for `@ai-sdk/vue` and `@ai-sdk/svelte` that manage message state with parts-based message structure, handle streaming, and provide loading indicators. The SDK supports 40+ AI providers through a unified interface, including OpenAI, Anthropic, Google, Azure, AWS Bedrock, xAI, Deepgram, AssemblyAI, ElevenLabs, and open-source models via OpenAI-compatible endpoints. Advanced features include Model Context Protocol (MCP) integration via `@ai-sdk/mcp` for connecting to external tool servers with stdio, HTTP, and SSE transports plus OAuth support, tool approval workflows with `requiresApproval` for sensitive operations, embedding generation for semantic search with `embed` and `embedMany` plus `cosineSimilarity` for similarity calculations, document reranking with the `rerank` function for improved search relevance, and multimedia capabilities with `generateImage` for DALL-E and Stable Diffusion models, `generateSpeech` for text-to-speech audio generation with providers like OpenAI and Deepgram, and `transcribe` for audio-to-text conversion with timestamped segments. The SDK offers reasoning output tracking for advanced models, `stopWhen` conditions for controlling multi-step execution, `onStepFinish` callbacks for monitoring agent progress, custom retry logic with exponential backoff, telemetry integration with OpenTelemetry, and comprehensive error handling with typed exceptions. Every function returns detailed usage statistics including token counts, finish reasons, and provider metadata for observability and cost tracking.
# Next.js Framework Documentation

## Introduction

Next.js is a powerful React framework for building full-stack web applications developed by Vercel. This documentation covers Next.js version 16.1.1, which extends React's capabilities with features like server-side rendering (SSR), static site generation (SSG), and hybrid approaches, all optimized through Rust-based JavaScript tooling for high-performance builds. Next.js enables developers to create production-ready applications with automatic code splitting, built-in routing, API routes, and seamless integration between frontend and backend code. The framework supports both the modern App Router (introduced in Next.js 13 and continuously refined through version 16) and the traditional Pages Router, offering flexibility for different project needs. Version 16 introduces stable support for the Form component, enhanced caching with cacheLife() and cacheTag() APIs, new revalidation methods including updateTag() and refresh(), and improved developer experience with better TypeScript integration and performance optimizations.

Next.js addresses common challenges in modern web development by providing solutions for routing, data fetching, image optimization, internationalization, and SEO out of the box. It supports React Server Components for efficient server-side rendering, Client Components for interactive UI, and Server Actions for server-side mutations without needing separate API endpoints. The framework's architecture is designed to enable optimal performance with automatic optimizations like lazy loading, prefetching, and intelligent caching strategies while maintaining developer productivity through conventions and best practices. Version 16 brings significant improvements including the stable Form component for progressive enhancement, cacheLife() for declarative cache control with predefined profiles (seconds, minutes, hours, days, weeks, max), cacheTag() for granular cache invalidation, enhanced metadata API for comprehensive SEO control, and improved support for React 19 features. Whether building marketing sites, e-commerce platforms, dashboards, or content-heavy applications, Next.js 16 provides the APIs and patterns to build performant, scalable applications.

## Core APIs and Functions

### App Router - Basic Page Structure

The App Router uses a file-system based routing where folders define routes and special files (page.tsx, layout.tsx) define UI components.

```typescript
// app/page.tsx
export default function Page() {
  return <h1>Hello, Next.js!</h1>;
}

// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Form Component - Progressive Enhancement

Next.js 16 introduces a built-in Form component that provides progressive enhancement for forms with Server Actions.

```typescript
// app/users/new/page.tsx
import Form from "next/form";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default function NewUser() {
  async function createUser(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    await prisma.user.create({
      data: { name, email },
    });

    redirect("/");
  }

  return (
    <div>
      <h1>Create New User</h1>
      <Form action={createUser}>
        <label htmlFor="name">Name</label>
        <input type="text" id="name" name="name" required />

        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" required />

        <button type="submit">Create User</button>
      </Form>
    </div>
  );
}

// With revalidation
// app/posts/new/page.tsx
import Form from "next/form";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default function NewPost() {
  async function createPost(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    await db.posts.create({
      data: { title, content },
    });

    revalidatePath("/posts");
    redirect("/posts");
  }

  return (
    <Form action={createPost}>
      <input type="text" name="title" required />
      <textarea name="content" rows={6} />
      <button type="submit">Create Post</button>
    </Form>
  );
}
```

### Cache Management with cacheLife() and cacheTag()

Next.js 16 introduces cacheLife() for declarative cache control and cacheTag() for granular cache invalidation.

```typescript
// lib/data.ts
"use cache";

import { cacheLife, cacheTag } from "next/cache";

// Use predefined cache profiles
export async function getProducts() {
  "use cache";
  cacheLife("hours"); // Cache for 1 hour with 5 min stale time
  cacheTag("products");

  const response = await fetch("https://api.example.com/products");
  return response.json();
}

// Custom cache configuration
export async function getUserData(userId: string) {
  "use cache";
  cacheLife({
    stale: 60,      // 1 minute stale
    revalidate: 300, // 5 minutes revalidate
    expire: 3600,   // 1 hour expire
  });
  cacheTag("user", `user-${userId}`);

  const response = await fetch(`https://api.example.com/users/${userId}`);
  return response.json();
}

// Different cache profiles available:
// - "seconds": stale: 30s, revalidate: 1s, expire: 1m
// - "minutes": stale: 5m, revalidate: 1m, expire: 1h
// - "hours": stale: 5m, revalidate: 1h, expire: 1d
// - "days": stale: 5m, revalidate: 1d, expire: 1w
// - "weeks": stale: 5m, revalidate: 1w, expire: 30d
// - "max": stale: 5m, revalidate: 30d, expire: never
// - "default": stale: 5m, revalidate: 15m, expire: never

// Server Action using new cache APIs
// app/actions.ts
"use server";

import { revalidateTag, updateTag, refresh } from "next/cache";

export async function updateProduct(productId: string, data: any) {
  await db.products.update(productId, data);

  // Revalidate all caches with this tag
  revalidateTag("products");
  revalidateTag(`product-${productId}`);

  // Or use updateTag for more granular control
  updateTag(`product-${productId}`);

  return { success: true };
}

export async function refreshData() {
  // Refresh all data on the current page
  refresh();
}
```

### Request APIs - headers(), cookies(), and draftMode()

Access request information in Server Components and Route Handlers using synchronous APIs.

```typescript
// app/dashboard/page.tsx
import { cookies, headers } from 'next/headers';

export default function DashboardPage() {
  // Access cookies
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token');

  // Access headers
  const headersList = headers();
  const userAgent = headersList.get('user-agent');

  return (
    <div>
      <h1>Dashboard</h1>
      <p>User Agent: {userAgent}</p>
      <p>Token: {token?.value}</p>
    </div>
  );
}

// Route Handler with request APIs
// app/api/user/route.ts
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();
  const session = cookieStore.get('session');

  const headersList = headers();
  const authorization = headersList.get('authorization');

  return NextResponse.json({
    session: session?.value,
    auth: authorization
  });
}

// Draft Mode for CMS preview
// app/api/draft/route.ts
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  // Enable draft mode
  draftMode().enable();

  // Redirect to the preview page
  redirect(`/posts/${slug}`);
}

// Check draft mode in page
// app/posts/[slug]/page.tsx
import { draftMode } from 'next/headers';

export default async function PostPage({ params }: { params: { slug: string } }) {
  const { isEnabled } = draftMode();

  const post = await getPost(params.slug, isEnabled);

  return (
    <article>
      {isEnabled && <p>Draft mode is enabled</p>}
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}
```

### Dynamic Routes with generateStaticParams

Create dynamic routes and pre-render pages at build time using generateStaticParams for static site generation.

```typescript
// app/posts/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/api";

export default async function Post({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const content = await markdownToHtml(post.content || "");

  return (
    <main>
      <article className="mb-32">
        <PostHeader
          title={post.title}
          coverImage={post.coverImage}
          date={post.date}
          author={post.author}
        />
        <PostBody content={content} />
      </article>
    </main>
  );
}

export async function generateMetadata({ params }: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const title = `${post.title} | Next.js Blog Example`;

  return {
    title,
    openGraph: {
      title,
      images: [post.ogImage.url],
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
```

### Cache Management and Revalidation

Next.js 16 provides enhanced APIs for controlling cache behavior and revalidating data at runtime.

```typescript
// lib/data.ts
import { unstable_cache } from 'next/cache';

// Cache function results with tags
export const getProducts = unstable_cache(
  async () => {
    const response = await fetch('https://api.example.com/products');
    return response.json();
  },
  ['products'], // cache key
  {
    tags: ['products-list'],
    revalidate: 3600, // revalidate every hour
  }
);

// Opt out of caching for dynamic data
import { unstable_noStore } from 'next/cache';

export async function getUserData(userId: string) {
  unstable_noStore(); // This data should never be cached
  const response = await fetch(`https://api.example.com/users/${userId}`);
  return response.json();
}

// Server Action to revalidate cache
// app/actions.ts
'use server';

import { revalidatePath, revalidateTag, updateTag, refresh } from 'next/cache';

export async function updateProduct(formData: FormData) {
  const productId = formData.get('productId') as string;

  // Update product in database
  await db.products.update(productId, {
    name: formData.get('name') as string,
    price: parseFloat(formData.get('price') as string),
  });

  // Revalidate specific path
  revalidatePath('/products');
  revalidatePath(`/products/${productId}`);

  // Or revalidate by tag
  revalidateTag('products-list');

  // Or use updateTag for more granular control
  updateTag('products-list');

  // Or refresh the current page
  refresh();

  return { success: true };
}
```

### Internationalization with Dynamic Routes

Implement i18n by using dynamic route segments and generateStaticParams to create localized pages.

```typescript
// app/[lang]/layout.tsx
import { i18n, type Locale } from "@/i18n-config";

export const metadata = {
  title: "i18n within app router - Vercel Examples",
  description: "How to do i18n in Next.js 16 within app router",
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default function Root({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  return (
    <html lang={params.lang}>
      <body>{children}</body>
    </html>
  );
}

// app/[lang]/page.tsx
import { getDictionary } from './dictionaries';

export default async function Page({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);

  return (
    <div>
      <h1>{dict.home.title}</h1>
      <p>{dict.home.description}</p>
    </div>
  );
}

// i18n-config.ts
export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'de', 'fr', 'es'],
} as const;

export type Locale = (typeof i18n)['locales'][number];

// dictionaries.ts
const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  de: () => import('./dictionaries/de.json').then((module) => module.default),
  fr: () => import('./dictionaries/fr.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]();
```

### API Routes - App Router Style

Create API endpoints using Route Handlers with route.ts/route.js files supporting HTTP methods.

```typescript
// app/api/set-token/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = cookies();
  const res = NextResponse.json({ message: 'successful' });
  res.cookies.set('token', 'this is a token');
  return res;
}

// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  const headersList = headers();
  const secret = headersList.get("x-vercel-reval-key");

  if (secret !== process.env.CONTENTFUL_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  revalidateTag("posts");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}

// Dynamic route handler
// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await getPost(params.id);

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const post = await updatePost(params.id, body);

  return NextResponse.json(post);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await deletePost(params.id);

  return NextResponse.json({ success: true });
}
```

### API Routes - Pages Router Style

Traditional API routes in the pages/api directory supporting various HTTP methods.

```typescript
// pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from "next";
import type { User } from "../../interfaces";

const users: User[] = [{ id: 1 }, { id: 2 }, { id: 3 }];

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<User[]>,
) {
  res.status(200).json(users);
}

// pages/api/user/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import type { User } from "../../../interfaces";

export default function userHandler(
  req: NextApiRequest,
  res: NextApiResponse<User>,
) {
  const { query, method } = req;
  const id = parseInt(query.id as string, 10);
  const name = query.name as string;

  switch (method) {
    case "GET":
      res.status(200).json({ id, name: `User ${id}` });
      break;
    case "PUT":
      res.status(200).json({ id, name: name || `User ${id}` });
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
```

### Server Actions and Form Handling

Server Actions allow you to define server-side functions that can be called from Client Components, perfect for form submissions and data mutations.

```typescript
// app/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import postgres from "postgres";
import { z } from "zod";

let sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL!, {
  ssl: "allow",
});

export async function createTodo(
  prevState: {
    message: string;
  },
  formData: FormData,
) {
  const schema = z.object({
    todo: z.string().min(1),
  });
  const parse = schema.safeParse({
    todo: formData.get("todo"),
  });

  if (!parse.success) {
    return { message: "Failed to create todo" };
  }

  const data = parse.data;

  try {
    await sql`
      INSERT INTO todos (text)
      VALUES (${data.todo})
    `;

    revalidatePath("/");
    return { message: `Added todo ${data.todo}` };
  } catch (e) {
    return { message: "Failed to create todo" };
  }
}

export async function deleteTodo(
  prevState: {
    message: string;
  },
  formData: FormData,
) {
  const schema = z.object({
    id: z.string().min(1),
    todo: z.string().min(1),
  });
  const data = schema.parse({
    id: formData.get("id"),
    todo: formData.get("todo"),
  });

  try {
    await sql`
      DELETE FROM todos
      WHERE id = ${data.id};
    `;

    revalidatePath("/");
    return { message: `Deleted todo ${data.todo}` };
  } catch (e) {
    return { message: "Failed to delete todo" };
  }
}

// Server Action with file upload
// app/upload/actions.ts
"use server";

import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File;

  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Save to public directory
  const path = join(process.cwd(), 'public', 'uploads', file.name);
  await writeFile(path, buffer);

  return { success: true, name: file.name };
}

// app/add-form.tsx
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createTodo } from "@/app/actions";

const initialState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Adding...' : 'Add'}
    </button>
  );
}

export function AddForm() {
  const [state, formAction] = useFormState(createTodo, initialState);

  return (
    <form action={formAction}>
      <label htmlFor="todo">Enter Task</label>
      <input type="text" id="todo" name="todo" required />
      <SubmitButton />
      <p aria-live="polite" role="status">
        {state?.message}
      </p>
    </form>
  );
}

// app/page.tsx
import postgres from "postgres";
import { AddForm } from "@/app/add-form";
import { DeleteForm } from "@/app/delete-form";

let sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL!, {
  ssl: "allow",
});

export default async function Home() {
  let todos = await sql`SELECT * FROM todos`;

  return (
    <main>
      <h1>Todos</h1>
      <AddForm />
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.text}
            <DeleteForm id={todo.id} todo={todo.text} />
          </li>
        ))}
      </ul>
    </main>
  );
}
```

### Navigation Hooks - useRouter, usePathname, useSearchParams

Client-side navigation hooks for reading and manipulating the current URL in Client Components.

```typescript
// app/components/locale-switcher.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { i18n, type Locale } from "@/i18n-config";

export default function LocaleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectedPathname = (locale: Locale) => {
    if (!pathname) return "/";
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  return (
    <div>
      <p>Locale switcher:</p>
      <ul>
        {i18n.locales.map((locale) => {
          return (
            <li key={locale}>
              <Link href={redirectedPathname(locale)}>{locale}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Search component with useSearchParams
// app/search/search-bar.tsx
"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <input
      type="text"
      placeholder="Search..."
      onChange={(e) => handleSearch(e.target.value)}
      defaultValue={searchParams.get('query') || ''}
    />
  );
}

// Page that reads search params
// app/search/page.tsx
export default async function SearchPage({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  const query = searchParams.query;
  const results = query ? await searchProducts(query) : [];

  return (
    <div>
      <h1>Search Results</h1>
      {query && <p>Showing results for: {query}</p>}
      <SearchBar />
      <ul>
        {results.map((result) => (
          <li key={result.id}>{result.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Pages Router - getStaticProps and getStaticPaths

Pages Router data fetching methods for static site generation with dynamic routes.

```typescript
// pages/gsp/[slug].tsx
import type {
  GetStaticProps,
  GetStaticPaths,
  InferGetStaticPropsType,
} from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import LocaleSwitcher from "../../components/locale-switcher";

type GspPageProps = InferGetStaticPropsType<typeof getStaticProps>;

export default function GspPage(props: GspPageProps) {
  const router = useRouter();
  const { defaultLocale, isFallback, query } = router;

  if (isFallback) {
    return "Loading...";
  }

  return (
    <div>
      <h1>getStaticProps page</h1>
      <p>Current slug: {query.slug}</p>
      <p>Current locale: {props.locale}</p>
      <p>Default locale: {defaultLocale}</p>
      <p>Configured locales: {JSON.stringify(props.locales)}</p>

      <LocaleSwitcher />

      <Link href="/gsp">To getStaticProps page</Link>
      <br />

      <Link href="/gssp">To getServerSideProps page</Link>
      <br />

      <Link href="/">To index page</Link>
      <br />
    </div>
  );
}

type Props = {
  locale?: string;
  locales?: string[];
};

export const getStaticProps: GetStaticProps<Props> = async ({
  locale,
  locales,
}) => {
  return {
    props: {
      locale,
      locales,
    },
  };
};

export const getStaticPaths: GetStaticPaths = ({ locales = [] }) => {
  const paths = [];

  for (const locale of locales) {
    paths.push({ params: { slug: "first" }, locale });
    paths.push({ params: { slug: "second" }, locale });
  }

  return {
    paths,
    fallback: true,
  };
};

// pages/posts/[id].tsx - getServerSideProps
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

type Post = {
  id: string;
  title: string;
  content: string;
};

export const getServerSideProps: GetServerSideProps<{ post: Post }> = async (context) => {
  const { id } = context.params!;
  const post = await getPost(id as string);

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
  };
};

export default function PostPage({ post }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}
```

### Image Optimization

Next.js Image component provides automatic image optimization with lazy loading, responsive images, and modern formats.

```typescript
// app/page.tsx
import Image from "next/image";
import Link from "next/link";
import vercel from "../public/vercel.png";

const Index = () => (
  <div>
    <h2 id="internal">Internal Image</h2>
    <p>The following is an example of a reference to an internal image from the public directory.</p>

    <Image
      alt="Vercel logo"
      src={vercel}
      width={1000}
      height={1000}
      style={{
        maxWidth: "100%",
        height: "auto",
      }}
    />

    <h2 id="external">External Image</h2>
    <p>External images must be configured in next.config.js using the remotePatterns property.</p>

    <Image
      alt="Next.js logo"
      src="https://assets.vercel.com/image/upload/v1538361091/repositories/next-js/next-js-bg.png"
      width={1200}
      height={400}
      style={{
        maxWidth: "100%",
        height: "auto",
      }}
    />

    <h2 id="responsive">Responsive Image</h2>
    <Image
      alt="Responsive image"
      src="/hero.jpg"
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      style={{
        objectFit: "cover",
      }}
    />
  </div>
);

export default Index;

// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.vercel.com",
        port: "",
        pathname: "/image/upload/**",
      },
    ],
    // Optional: Configure image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Optional: Configure formats
    formats: ['image/webp'],
  },
};
```

### Middleware

Middleware runs before a request is completed, allowing you to modify the response, rewrite, redirect, or add headers.

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl

  // Authentication check
  const token = request.cookies.get('token')
  if (!token && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Add custom header
  const response = NextResponse.next()
  response.headers.set('x-custom-header', 'my-value')

  return response
}

// Middleware with rewrite
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl

  // Rewrite root to a different page
  if (url.pathname === '/') {
    url.pathname = '/home'
    return NextResponse.rewrite(url)
  }

  // Redirect example
  if (url.pathname === '/old-path') {
    return NextResponse.redirect(new URL('/new-path', request.url))
  }

  // A/B testing
  const bucket = request.cookies.get('bucket')
  if (url.pathname === '/experiment' && bucket?.value === 'b') {
    url.pathname = '/experiment-b'
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

// Internationalization middleware
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const locales = ['en', 'fr', 'de']
const defaultLocale = 'en'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // Redirect if there is no locale
  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

function getLocale(request: NextRequest): string {
  // Get locale from cookie or accept-language header
  return request.cookies.get('locale')?.value || defaultLocale
}
```

### Data Fetching with Caching

Fetch API with built-in caching options for optimized data fetching in Server Components.

```typescript
// app/cases/fetch_cached/page.tsx
export default async function Page() {
  return (
    <>
      <p>This page renders two components each performing cached fetches.</p>
      <ComponentOne />
      <ComponentTwo />
    </>
  )
}

async function ComponentOne() {
  return <div>message 1: {await fetchRandomCached('a')}</div>
}

async function ComponentTwo() {
  return (
    <>
      <div>message 2: {await fetchRandomCached('b')}</div>
      <div>message 3: {await fetchRandomCached('c')}</div>
    </>
  )
}

const fetchRandomCached = async (entropy: string) => {
  const response = await fetch(
    'https://next-data-api-endpoint.vercel.app/api/random?b=' + entropy,
    { cache: 'force-cache' }
  )
  return response.text()
}

// Different caching strategies
// app/lib/data.ts

// Force cache (default for fetch in Server Components)
export async function getCachedData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'force-cache',
  })
  return res.json()
}

// No store - always fetch fresh data
export async function getDynamicData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'no-store',
  })
  return res.json()
}

// Revalidate - cache for a specific time
export async function getRevalidatedData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 }, // revalidate every hour
  })
  return res.json()
}

// Tag-based revalidation
export async function getTaggedData() {
  const res = await fetch('https://api.example.com/data', {
    next: { tags: ['products'] },
  })
  return res.json()
}
```

### Metadata Configuration

Define page metadata for SEO using the Metadata API in App Router.

```typescript
// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `Next.js Blog Example`,
  description: `A statically generated blog example using Next.js.`,
  openGraph: {
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="theme-color" content="#000" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}

// Dynamic metadata
// app/posts/[slug]/page.tsx
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
        },
      ],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  }
}

// File-based metadata
// app/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Hello World!
      </div>
    ),
    {
      ...size,
    }
  )
}
```

### Dynamic Import and Code Splitting

Dynamically import components to optimize bundle size and loading performance.

```typescript
// app/page.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const DynamicComponent1 = dynamic(() => import("./_components/hello1"));

const DynamicComponent2WithCustomLoading = dynamic(
  () => import("./_components/hello2"),
  { loading: () => <p>Loading caused by client page transition ...</p> },
);

const DynamicComponent3WithNoSSR = dynamic(
  () => import("./_components/hello3"),
  { loading: () => <p>Loading ...</p>, ssr: false },
);

const names = ["Tim", "Joe", "Bel", "Max", "Lee"];

export default function IndexPage() {
  const [showMore, setShowMore] = useState(false);
  const [results, setResults] = useState();

  return (
    <div>
      {/* Load immediately, but in a separate bundle */}
      <DynamicComponent1 />

      {/* Show a progress indicator while loading */}
      <DynamicComponent2WithCustomLoading />

      {/* Load only on the client side */}
      <DynamicComponent3WithNoSSR />

      {/* Load on demand */}
      {showMore && <DynamicComponent4 />}
      <button onClick={() => setShowMore(!showMore)}>Toggle Show More</button>

      {/* Load library on demand */}
      <div style={{ marginTop: "1rem" }}>
        <input
          type="text"
          placeholder="Search"
          onChange={async (e) => {
            const { value } = e.currentTarget;
            // Dynamically load fuse.js
            const Fuse = (await import("fuse.js")).default;
            const fuse = new Fuse(names);
            setResults(fuse.search(value));
          }}
        />
        <pre>Results: {JSON.stringify(results, null, 2)}</pre>
      </div>
    </div>
  );
}

// Server Component with dynamic imports
// app/dashboard/page.tsx
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('@/components/chart'), {
  ssr: false,
  loading: () => <p>Loading chart...</p>,
})

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Chart />
    </div>
  )
}
```

### Next.js Configuration

Configure Next.js behavior through next.config.js including image domains, redirects, rewrites, experimental features.

```typescript
// next.config.ts - Basic configuration
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// next.config.js - Advanced configuration with experimental features
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic options
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  trailingSlash: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/images/**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ]
  },

  // Rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.example.com/:path*',
      },
    ]
  },

  // Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ]
  },

  // Environment variables
  env: {
    CUSTOM_KEY: 'my-value',
  },

  // Experimental features
  experimental: {
    // Partial Prerendering
    ppr: false,

    // Server Actions
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['example.com'],
    },

    // Typed routes
    typedRoutes: false,

    // Optimize package imports
    optimizePackageImports: ['lodash', 'date-fns'],

    // MDX Rust compiler
    mdxRs: false,

    // Server minification and source maps
    serverMinification: true,
    serverSourceMaps: false,

    // Instrumentation
    instrumentationHook: false,

    // External packages for Server Components
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  // Webpack customization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
}

module.exports = nextConfig;
```

### Loading and Error UI

Special files for handling loading states and errors in App Router with automatic integration.

```typescript
// app/loading.tsx
import React from 'react'

export default function Loading() {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  )
}

// app/error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}

// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">Return Home</Link>
    </div>
  )
}

// app/global-error.tsx
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}

// Trigger not-found in a page
// app/posts/[id]/page.tsx
import { notFound } from 'next/navigation'

export default async function Post({ params }: { params: { id: string } }) {
  const post = await getPost(params.id)

  if (!post) {
    notFound()
  }

  return <article>{post.content}</article>
}
```

### Link Component for Client-Side Navigation

Next.js Link component enables client-side navigation between routes with automatic prefetching.

```typescript
// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/blog">Blog</Link>
        </li>
        <li>
          {/* Dynamic route */}
          <Link href="/posts/123">Post 123</Link>
        </li>
        <li>
          {/* External link */}
          <Link href="https://example.com" target="_blank" rel="noopener noreferrer">
            External Link
          </Link>
        </li>
        <li>
          {/* Link with query params */}
          <Link href={{ pathname: '/search', query: { q: 'next.js' } }}>
            Search Next.js
          </Link>
        </li>
        <li>
          {/* Disable prefetch */}
          <Link href="/heavy-page" prefetch={false}>
            Heavy Page (no prefetch)
          </Link>
        </li>
      </ul>
    </nav>
  );
}

// Pages Router example with dynamic routing
// pages/index.tsx
import type { User } from "../interfaces";
import useSwr from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Index() {
  const { data, error, isLoading } = useSwr<User[]>("/api/users", fetcher);

  if (error) return <div>Failed to load users</div>;
  if (isLoading) return <div>Loading...</div>;
  if (!data) return null;

  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>
          <Link href={`/user/${user.id}`}>
            {user.name ?? `User ${user.id}`}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

### Pages Router - Custom App Component

The _app.tsx file allows you to override the default App component to control page initialization and add global layouts.

```typescript
// pages/_app.tsx
import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="preload"
          href="/fonts/Inter-roman.latin.var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

### Redirects and Navigation

Programmatic navigation and redirects in App Router.

```typescript
// Server Component redirect
// app/profile/page.tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function ProfilePage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return <div>Profile: {session.user.name}</div>
}

// Client Component navigation
// app/components/login-button.tsx
'use client'

import { useRouter } from 'next/navigation'

export function LoginButton() {
  const router = useRouter()

  return (
    <button onClick={() => router.push('/login')}>
      Login
    </button>
  )
}

// Navigation with search params
// app/components/pagination.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function Pagination({ totalPages }: { totalPages: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`?${params.toString()}`)
  }

  return (
    <div>
      <button
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
      >
        Previous
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
      >
        Next
      </button>
    </div>
  )
}

// Permanent redirect
// app/old-page/page.tsx
import { permanentRedirect } from 'next/navigation'

export default function OldPage() {
  permanentRedirect('/new-page')
}
```

## Summary

Next.js 16 has evolved into a comprehensive framework that addresses the full spectrum of web development needs, from simple static sites to complex, data-driven applications. The framework's dual router support (App Router and Pages Router) provides flexibility for both greenfield projects and gradual migrations, while the App Router's innovative features like React Server Components, Server Actions, and streaming represent the cutting edge of React development patterns. Version 16.1.0 introduces significant enhancements including the stable Form component for progressive enhancement and improved user experience, cacheLife() API with predefined profiles (seconds, minutes, hours, days, weeks, max) for declarative cache control, cacheTag() for granular cache invalidation with tag-based strategies, new revalidation methods updateTag() and refresh() for more flexible cache management, and enhanced React 19 compatibility with improved Server Actions and form handling. The framework provides synchronous request APIs (cookies(), headers(), draftMode()) that work seamlessly in Server Components and Route Handlers, enabling developers to access request information without additional complexity.

The framework excels at solving common web development challenges through conventions and built-in optimizations. Image optimization with the next/image component, automatic code splitting with dynamic imports, intelligent prefetching with the Link component, and flexible caching strategies through the fetch API and new cacheLife() function are all handled by Next.js out of the box. The new Form component from next/form simplifies form handling with progressive enhancement, automatic loading states, and seamless Server Action integration. Server Actions eliminate the need for separate API endpoints for many use cases, reducing boilerplate and simplifying full-stack development through direct server function calls from Client Components using useFormState and useFormStatus hooks. The Middleware system provides powerful request-time capabilities for authentication, localization, A/B testing, and routing logic at the edge, while the rich ecosystem of configuration options allows fine-tuning for specific deployment scenarios. With Next.js 16, the framework provides stable support for advanced caching strategies with cacheLife() profiles and custom configurations, improved developer experience with better error messages and TypeScript integration, enhanced performance through optimized bundling and tree-shaking, flexible revalidation with updateTag() for targeted cache updates and refresh() for page-level data refreshing, and comprehensive support for modern React patterns including React Server Components and concurrent features. Whether building marketing sites, e-commerce platforms with the Form component, dashboards with real-time data using refresh(), or content-heavy applications with CMS integration through draft mode and cacheTag(), Next.js 16 provides the APIs and patterns to build performant, scalable applications that deliver excellent user experiences while maintaining developer productivity and code quality.
# Better Auth

Better Auth is a comprehensive, framework-agnostic authentication and authorization library for TypeScript that provides enterprise-grade features through a flexible plugin architecture. It handles everything from basic email/password authentication to advanced features like multi-tenancy, two-factor authentication, passkeys, WebAuthn, phone authentication, username authentication, anonymous sessions, API keys, JWT tokens, Sign-In with Ethereum (SIWE), OAuth proxy, SSO/SAML, SCIM (System for Cross-domain Identity Management), Stripe integration, OpenID Connect (OIDC) provider capabilities, captcha verification, Google One Tap authentication, OpenAPI documentation generation, and last login method tracking. The library supports multiple database adapters (Prisma, Drizzle, MongoDB, Memory), integrates seamlessly with popular frameworks (Next.js, SvelteKit, Solid Start, React Start (TanStack Start), Expo/React Native), and provides type-safe client libraries for React, Vue, Svelte, Solid, and Lynx.

The architecture centers around a server-side `betterAuth()` instance that handles authentication logic and exposes REST API endpoints, paired with framework-specific client libraries that provide type-safe methods and hooks for managing authentication state. Plugins extend functionality by adding endpoints, database schemas, hooks, and middleware, enabling complex features like organizations, two-factor authentication, passkey support, phone number authentication, username authentication, anonymous sessions, bearer tokens, API keys, access control, multi-session support, device authorization, OpenID Connect provider capabilities for building OAuth 2.0 authorization servers, OAuth proxy for development environments, Stripe payment and subscription management, SSO/SAML integration, SCIM user provisioning for enterprise identity management, captcha protection, Google One Tap, automatic OpenAPI documentation, last login method tracking, custom session handling, and additional user/session fields with minimal configuration. The system is designed for production use with built-in rate limiting, CSRF protection, secure cookie handling, password breach checking via HaveIBeenPwned integration, and comprehensive error handling.

## Initialize Server Authentication

Creates a Better Auth server instance with database, social providers, and plugins.

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization, twoFactor } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { db } from "./db";

export const auth = betterAuth({
  appName: "My Application",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    async sendResetPassword({ user, url, token }) {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: `Click <a href="${url}">here</a> to reset your password`,
      });
    },
  },

  emailVerification: {
    async sendVerificationEmail({ user, url, token }) {
      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        html: `Click <a href="${url}">here</a> to verify`,
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      accessType: "offline",
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    freshAge: 60 * 10, // 10 minutes
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
  },

  plugins: [
    organization(),
    twoFactor({
      issuer: "My App",
    }),
    passkey(),
  ],
});

export type Session = typeof auth.$Infer.Session;
```

## Create Authentication API Routes

Exposes Better Auth REST endpoints in your application framework.

```typescript
// Next.js App Router: app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);

// SvelteKit: src/routes/api/auth/[...all]/+server.ts
import { auth } from "$lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";

export const { GET, POST } = svelteKitHandler(auth);

// Solid Start: src/routes/api/auth/[...all].ts
import { auth } from "~/lib/auth";
import { solidStartHandler } from "better-auth/solid-start";

export const { GET, POST } = solidStartHandler(auth);

// React Start (TanStack Start)
import { auth } from "~/lib/auth";
import { reactStartHandler } from "better-auth/react-start";

export const { GET, POST } = reactStartHandler(auth);

// Express.js
import express from "express";
import { auth } from "./auth";

const app = express();

app.all("/api/auth/*", async (req, res) => {
  return auth.handler(new Request(
    `${req.protocol}://${req.get("host")}${req.originalUrl}`,
    {
      method: req.method,
      headers: req.headers as HeadersInit,
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    }
  )).then(response => {
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    return response.text().then(body => res.send(body));
  });
});
```

## Initialize Client SDK

Creates a type-safe client for authentication operations with framework-specific hooks.

```typescript
// React Client
import { createAuthClient } from "better-auth/react";
import {
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,

  plugins: [
    organizationClient(),
    twoFactorClient({
      twoFactorPage: "/two-factor",
      onTwoFactorRedirect() {
        window.location.href = "/two-factor";
      },
    }),
    passkeyClient(),
  ],

  fetchOptions: {
    onError(error) {
      if (error.error.status === 429) {
        toast.error("Too many requests. Please try again later.");
      } else if (error.error.status === 401) {
        console.error("Unauthorized");
      }
    },
    onSuccess(data) {
      console.log("Auth action successful:", data);
    },
  },
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  organization,
  twoFactor,
  passkey,
} = authClient;

// Vue Client
import { createAuthClient } from "better-auth/vue";
export const authClient = createAuthClient({ /* config */ });

// Svelte Client
import { createAuthClient } from "better-auth/svelte";
export const authClient = createAuthClient({ /* config */ });

// Solid Client
import { createAuthClient } from "better-auth/solid";
export const authClient = createAuthClient({ /* config */ });

// Lynx Client
import { createAuthClient } from "better-auth/lynx";
export const authClient = createAuthClient({ /* config */ });
```

## User Registration and Sign In

Handles email/password authentication with validation and session management.

```typescript
import { authClient } from "./auth-client";

// Email/Password Sign Up
try {
  const { data, error } = await authClient.signUp.email({
    name: "John Doe",
    email: "john@example.com",
    password: "SecurePassword123!",
    image: "https://example.com/avatar.jpg", // optional
    callbackURL: "/dashboard", // redirect after sign up
  });

  if (error) {
    console.error("Sign up failed:", error.message);
    return;
  }

  console.log("User created:", data.user);
  console.log("Session created:", data.session);
} catch (err) {
  console.error("Unexpected error:", err);
}

// Email/Password Sign In
const { data, error } = await authClient.signIn.email({
  email: "john@example.com",
  password: "SecurePassword123!",
  rememberMe: true, // extends session duration
  callbackURL: "/dashboard",
});

// Sign Out
await authClient.signOut({
  fetchOptions: {
    onSuccess() {
      window.location.href = "/";
    },
  },
});

// Sign Out from All Devices
await authClient.signOut({
  revokeAllSessions: true,
});
```

## Social OAuth Authentication

Initiates OAuth flows with third-party providers for passwordless sign-in.

```typescript
import { authClient } from "./auth-client";

// GitHub OAuth Sign In
await authClient.signIn.social({
  provider: "github",
  callbackURL: "/dashboard",
});

// Google OAuth Sign In
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
});

// Discord, Microsoft, Apple, etc.
await authClient.signIn.social({
  provider: "discord",
  callbackURL: "/dashboard",
});

// Link Additional Social Account
await authClient.linkSocial({
  provider: "github",
  callbackURL: "/settings/accounts",
});

// Unlink Social Account
await authClient.unlinkAccount({
  accountId: "acc_123456",
});

// List All Linked Accounts
const { data } = await authClient.listAccounts();
data?.forEach(account => {
  console.log(`${account.provider}: ${account.providerId}`);
});
```

## Session Management with Hooks

Retrieves and monitors authentication state in React components.

```typescript
"use client";

import { useSession } from "./auth-client";
import { Loader } from "./components/loader";

export function ProfilePage() {
  const { data: session, isPending, error } = useSession();

  if (isPending) {
    return <Loader />;
  }

  if (error) {
    return <div>Error loading session: {error.message}</div>;
  }

  if (!session) {
    return <div>Not authenticated. Please sign in.</div>;
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
      <p>Email: {session.user.email}</p>
      <p>Email verified: {session.user.emailVerified ? "Yes" : "No"}</p>
      <img src={session.user.image} alt="Profile" />

      <div>
        <h2>Session Info</h2>
        <p>Session ID: {session.session.id}</p>
        <p>Expires: {new Date(session.session.expiresAt).toLocaleString()}</p>
        <p>IP Address: {session.session.ipAddress}</p>
        <p>User Agent: {session.session.userAgent}</p>
      </div>
    </div>
  );
}

// Update User Profile
import { authClient } from "./auth-client";

async function updateProfile() {
  const { data, error } = await authClient.updateUser({
    name: "John Smith",
    image: "https://example.com/new-avatar.jpg",
  });

  if (!error) {
    console.log("Profile updated:", data);
  }
}

// Change Email
await authClient.changeEmail({
  newEmail: "newemail@example.com",
  callbackURL: "/verify-new-email",
});

// Change Password
await authClient.changePassword({
  currentPassword: "OldPassword123!",
  newPassword: "NewPassword456!",
  revokeOtherSessions: true,
});
```

## Server-Side Session Access

Validates sessions in server components, API routes, and middleware.

```typescript
// Next.js App Router Server Component
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>Welcome, {session.user.name}!</p>
    </div>
  );
}

// Next.js API Route
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Perform authenticated operation
  const data = await fetchUserData(session.user.id);

  return Response.json({ data });
}

// SvelteKit Load Function
import { auth } from "$lib/auth";

export async function load({ request }) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw redirect(302, "/sign-in");
  }

  return { session };
}

// Middleware for Route Protection
import { auth } from "@/lib/auth";

export async function middleware(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isProtectedRoute = request.url.includes("/dashboard");

  if (isProtectedRoute && !session) {
    return Response.redirect(new URL("/sign-in", request.url));
  }
}
```

## Database Adapter Configuration

Connects Better Auth to your database using various ORMs and drivers.

```typescript
// Drizzle ORM Adapter (PostgreSQL, MySQL, SQLite)
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // "pg" | "mysql" | "sqlite"
    schema: schema,
    usePlural: false, // Use singular table names
    camelCase: false, // Use snake_case column names
  }),
});

// Prisma Adapter
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    usePlural: false,
  }),
});

// MongoDB Adapter
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(process.env.MONGODB_URL!);
await mongoClient.connect();

export const auth = betterAuth({
  database: mongodbAdapter(mongoClient.db("auth")),
});

// Memory Adapter (Testing Only)
import { memoryAdapter } from "better-auth/adapters/memory";

export const auth = betterAuth({
  database: memoryAdapter(),
});
```

## Organization Plugin for Multi-Tenancy

Enables team/workspace management with roles, permissions, and invitations.

```typescript
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    organization({
      async sendInvitationEmail({ email, organization, inviter, url }) {
        await sendEmail({
          to: email,
          subject: `Join ${organization.name}`,
          html: `${inviter.user.name} invited you to join ${organization.name}. <a href="${url}">Accept invitation</a>`,
        });
      },

      allowUserToCreateOrganization: true,
      organizationLimit: 10,

      roles: {
        owner: ["create", "read", "update", "delete", "invite", "remove"],
        admin: ["read", "update", "invite"],
        member: ["read"],
      },
    }),
  ],
});

// Client Usage
import { organizationClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [organizationClient()],
});

// Create Organization
const { data } = await authClient.organization.create({
  name: "Acme Corporation",
  slug: "acme-corp",
  logo: "https://example.com/logo.png",
  metadata: { industry: "Technology" },
});

// Invite Member
await authClient.organization.inviteMember({
  email: "member@example.com",
  role: "admin",
  organizationId: data.id,
});

// List Members
const { data: members } = await authClient.organization.listMembers({
  organizationId: "org_123",
});

// Update Member Role
await authClient.organization.updateMemberRole({
  memberId: "mem_456",
  role: "owner",
  organizationId: "org_123",
});

// Remove Member
await authClient.organization.removeMember({
  memberId: "mem_456",
  organizationId: "org_123",
});

// Set Active Organization
await authClient.organization.setActive({
  organizationId: "org_123",
});

// Check Permissions
const hasPermission = await authClient.organization.hasPermission({
  permissions: {
    post: ["create", "delete"],
    user: ["invite"],
  },
});
```

## Two-Factor Authentication Plugin

Adds TOTP authenticator apps, backup codes, and OTP support for enhanced security.

```typescript
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    twoFactor({
      issuer: "My Application",

      otpOptions: {
        async sendOTP({ user, otp }) {
          await sendEmail({
            to: user.email,
            subject: "Your verification code",
            html: `Your code is: ${otp}`,
          });
        },

        period: 300, // 5 minutes
        length: 6,
      },

      backupCodeLength: 10,
      backupCodeCount: 10,
    }),
  ],
});

// Client Usage
import { twoFactorClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      twoFactorPage: "/two-factor",
      onTwoFactorRedirect() {
        router.push("/two-factor");
      },
    }),
  ],
});

// Enable 2FA
const { data } = await authClient.twoFactor.enable({
  password: "userPassword123",
});

console.log("TOTP URI:", data.totpURI); // For QR code generation
console.log("Backup codes:", data.backupCodes);

// Verify TOTP Setup
await authClient.twoFactor.verifyTotp({
  code: "123456",
});

// Send OTP via Email
await authClient.twoFactor.sendOtp();

// Verify OTP
await authClient.twoFactor.verifyOtp({
  code: "123456",
});

// Use Backup Code
await authClient.twoFactor.useBackupCode({
  code: "ABCD-1234-EFGH",
});

// Generate New Backup Codes
const { data: newCodes } = await authClient.twoFactor.regenerateBackupCodes({
  password: "userPassword123",
});

// Disable 2FA
await authClient.twoFactor.disable({
  password: "userPassword123",
});
```

## Passkey/WebAuthn Plugin (Separate Package)

Implements passwordless authentication using biometric or hardware security keys.

```typescript
// Install the passkey package
// npm install @better-auth/passkey

import { betterAuth } from "better-auth";
import { passkey } from "@better-auth/passkey";

export const auth = betterAuth({
  plugins: [
    passkey({
      rpName: "My Application",
      rpID: "example.com",
      origin: "https://example.com",
    }),
  ],
});

// Client Usage
import { passkeyClient } from "@better-auth/passkey/client";

const authClient = createAuthClient({
  plugins: [passkeyClient()],
});

// Register Passkey (must be signed in)
try {
  const { data } = await authClient.passkey.addPasskey({
    name: "MacBook Pro Touch ID",
  });

  console.log("Passkey registered:", data.id);
} catch (error) {
  console.error("Passkey registration failed:", error);
}

// Sign In with Passkey
await authClient.passkey.signIn({
  callbackURL: "/dashboard",
});

// List User Passkeys
const { data: passkeys } = await authClient.passkey.listPasskeys();

passkeys?.forEach(key => {
  console.log(`${key.name}: ${key.createdAt}`);
});

// Delete Passkey
await authClient.passkey.deletePasskey({
  id: "passkey_123",
});

// Check Passkey Support
if (authClient.passkey.isSupported()) {
  console.log("Passkeys are supported in this browser");
}
```

## Magic Link Authentication Plugin

Sends one-time sign-in links via email for passwordless authentication.

```typescript
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    magicLink({
      async sendMagicLink({ email, url, token }) {
        await sendEmail({
          to: email,
          subject: "Sign in to your account",
          html: `
            <h1>Sign in to My Application</h1>
            <p>Click the link below to sign in:</p>
            <a href="${url}">Sign in</a>
            <p>This link expires in 5 minutes.</p>
          `,
        });
      },

      expiresIn: 300, // 5 minutes
      disableSignUp: false,
    }),
  ],
});

// Client Usage
import { magicLinkClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [magicLinkClient()],
});

// Send Magic Link
const { data, error } = await authClient.magicLink.sendMagicLink({
  email: "user@example.com",
  callbackURL: "/dashboard",
});

if (!error) {
  console.log("Magic link sent! Check your email.");
}

// The verification happens automatically when user clicks the link
// The URL will be: /api/auth/magic-link/verify?token=xxx
```

## Email OTP Plugin

Sends one-time password codes via email for verification and sign-in.

```typescript
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await sendEmail({
          to: email,
          subject: type === "sign-in" ? "Sign in code" : "Verification code",
          html: `Your verification code is: <strong>${otp}</strong>`,
        });
      },

      otpLength: 6,
      expiresIn: 300, // 5 minutes
      sendOnSignUp: true,
      disableSignUp: false,
    }),
  ],
});

// Client Usage
import { emailOTPClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [emailOTPClient()],
});

// Send OTP
await authClient.emailOTP.sendVerificationOtp({
  email: "user@example.com",
  type: "sign-in",
});

// Verify OTP
const { data, error } = await authClient.emailOTP.verifyEmail({
  email: "user@example.com",
  otp: "123456",
});

if (!error) {
  console.log("Signed in successfully:", data.user);
}
```

## Phone Number Authentication Plugin

Enables phone number registration and SMS-based OTP verification.

```typescript
import { betterAuth } from "better-auth";
import { phoneNumber } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    phoneNumber({
      async sendOTP({ phoneNumber, otp }) {
        await sendSMS({
          to: phoneNumber,
          message: `Your verification code is: ${otp}`,
        });
      },

      otpLength: 6,
      expiresIn: 300, // 5 minutes
    }),
  ],
});

// Client Usage
import { phoneNumberClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [phoneNumberClient()],
});

// Send Phone OTP
await authClient.phoneNumber.sendOtp({
  phoneNumber: "+1234567890",
});

// Verify Phone OTP and Sign In
const { data, error } = await authClient.phoneNumber.verifyOtp({
  phoneNumber: "+1234567890",
  otp: "123456",
});

if (!error) {
  console.log("Signed in with phone:", data.user);
}
```

## Username Authentication Plugin

Adds username-based authentication alongside email/password.

```typescript
import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    username({
      minLength: 3,
      maxLength: 20,
      allowedCharacters: /^[a-zA-Z0-9_-]+$/,
    }),
  ],
});

// Client Usage
import { usernameClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [usernameClient()],
});

// Sign Up with Username
await authClient.signUp.username({
  username: "johndoe",
  password: "SecurePassword123!",
  name: "John Doe",
  email: "john@example.com", // optional
});

// Sign In with Username
await authClient.signIn.username({
  username: "johndoe",
  password: "SecurePassword123!",
});
```

## Anonymous Authentication Plugin

Allows users to create temporary anonymous sessions without credentials.

```typescript
import { betterAuth } from "better-auth";
import { anonymous } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    anonymous({
      sessionDuration: 60 * 60 * 24 * 30, // 30 days
    }),
  ],
});

// Client Usage
import { anonymousClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [anonymousClient()],
});

// Create Anonymous Session
const { data } = await authClient.anonymous.signIn();

console.log("Anonymous session:", data.session);

// Link Anonymous Account to Email
await authClient.anonymous.linkEmail({
  email: "user@example.com",
  password: "SecurePassword123!",
});
```

## Admin Plugin for User Management

Provides administrative endpoints for managing users, sessions, and system operations.

```typescript
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    admin({
      // Optional: customize admin role check
      async isAdmin(user) {
        return user.role === "admin" || user.email.endsWith("@company.com");
      },
    }),
  ],
});

// Client Usage
import { adminClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [adminClient()],
});

// List All Users
const { data: users } = await authClient.admin.listUsers({
  limit: 50,
  offset: 0,
  sortBy: "createdAt",
  sortDirection: "desc",
  filterBy: "email",
  filterValue: "@company.com",
});

// Create User (Admin)
await authClient.admin.createUser({
  email: "newuser@example.com",
  password: "TempPassword123!",
  name: "New User",
  role: "user",
  emailVerified: true,
});

// Update User
await authClient.admin.updateUser({
  userId: "user_123",
  data: {
    name: "Updated Name",
    role: "admin",
    emailVerified: true,
  },
});

// Ban User
await authClient.admin.banUser({
  userId: "user_123",
  reason: "Violation of terms",
  banUntil: new Date("2025-12-31"),
});

// Unban User
await authClient.admin.unbanUser({
  userId: "user_123",
});

// Impersonate User
await authClient.admin.impersonateUser({
  userId: "user_123",
});

// List User Sessions
const { data: sessions } = await authClient.admin.listUserSessions({
  userId: "user_123",
});

// Revoke User Session
await authClient.admin.revokeUserSession({
  sessionId: "session_456",
});

// Delete User
await authClient.admin.deleteUser({
  userId: "user_123",
});
```

## Bearer Token Plugin

Enables stateless authentication using bearer tokens for API access.

```typescript
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    bearer({
      expiresIn: 60 * 60 * 24 * 7, // 7 days
    }),
  ],
});

// Client Usage
import { bearerClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [bearerClient()],
});

// Generate Bearer Token
const { data } = await authClient.bearer.generate();

console.log("Access token:", data.accessToken);

// Use Bearer Token in API Calls
fetch("/api/protected", {
  headers: {
    Authorization: `Bearer ${data.accessToken}`,
  },
});

// Server-side Bearer Token Validation
const session = await auth.api.getSession({
  headers: {
    authorization: `Bearer ${token}`,
  },
});
```

## API Key Plugin

Provides long-lived API keys for server-to-server authentication.

```typescript
import { betterAuth } from "better-auth";
import { apiKey } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    apiKey({
      // Optional: API key headers to check (default: "x-api-key")
      apiKeyHeaders: "x-api-key", // or ["x-api-key", "authorization"]

      // Optional: default key length (default: 64)
      defaultKeyLength: 64,

      // Optional: key expiration settings
      keyExpiration: {
        defaultExpiresIn: 365, // days
        minExpiresIn: 1,
        maxExpiresIn: 365,
        disableCustomExpiresTime: false,
      },

      // Optional: enable metadata
      enableMetadata: true,

      // Optional: disable key hashing (not recommended)
      disableKeyHashing: false,

      // Optional: require name for API keys
      requireName: true,

      // Optional: enable sessions for API keys
      enableSessionForAPIKeys: true,

      // Optional: rate limiting
      rateLimit: {
        enabled: true,
        timeWindow: 60 * 60 * 24 * 1000, // 24 hours
        maxRequests: 10,
      },
    }),
  ],
});

// Client Usage
import { apiKeyClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [apiKeyClient()],
});

// Create API Key
const { data } = await authClient.apiKey.create({
  name: "Production API Key",
  expiresIn: 60 * 60 * 24 * 365, // 1 year (in seconds)
  metadata: { environment: "production" }, // optional
});

console.log("API Key:", data.key);
console.log("Starts with:", data.startsWith); // First 6 characters

// Get API Key
const { data: apiKey } = await authClient.apiKey.get({
  id: "key_123",
});

// Update API Key
await authClient.apiKey.update({
  id: "key_123",
  name: "Updated API Key Name",
  enabled: false, // disable the key
  metadata: { updated: true },
});

// List API Keys
const { data: keys } = await authClient.apiKey.list();

keys?.forEach(key => {
  console.log(`${key.name}: ${key.startsWith}... (expires: ${key.expiresAt})`);
});

// Delete API Key
await authClient.apiKey.delete({
  id: "key_123",
});

// Server-side: Delete All Expired API Keys
await auth.api.deleteAllExpiredApiKeys();

// Server-side API Key Validation
const session = await auth.api.getSession({
  headers: {
    "x-api-key": apiKey,
  },
});

// Server-side: Verify API Key
const { data: verified } = await auth.api.verifyApiKey({
  key: apiKey,
});

if (verified) {
  console.log("Valid API key for user:", verified.userId);
}
```

## JWT Plugin

Generates and validates JSON Web Tokens for session management.

```typescript
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    jwt({
      algorithm: "HS256",
      expiresIn: "7d",
      issuer: "https://example.com",
      audience: ["https://api.example.com"],
    }),
  ],
});

// Client Usage
import { jwtClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [jwtClient()],
});

// Generate JWT
const { data } = await authClient.jwt.generate();

console.log("JWT:", data.token);

// Decode JWT
const decoded = await authClient.jwt.decode({
  token: data.token,
});

console.log("JWT payload:", decoded);
```

## Multi-Session Plugin

Allows users to maintain multiple concurrent sessions across devices.

```typescript
import { betterAuth } from "better-auth";
import { multiSession } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    multiSession({
      maximumSessions: 5, // Max sessions per user
    }),
  ],
});

// Client Usage
import { multiSessionClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [multiSessionClient()],
});

// List Active Sessions
const { data: sessions } = await authClient.multiSession.listSessions();

sessions?.forEach(session => {
  console.log(`Device: ${session.userAgent}, Last active: ${session.updatedAt}`);
});

// Revoke Specific Session
await authClient.multiSession.revokeSession({
  sessionId: "session_456",
});

// Revoke All Other Sessions
await authClient.multiSession.revokeOtherSessions();
```

## HaveIBeenPwned Plugin

Checks passwords against known data breaches for enhanced security.

```typescript
import { betterAuth } from "better-auth";
import { haveibeenpwned } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    haveibeenpwned({
      // Automatically check on sign-up and password change
      checkOnSignUp: true,
      checkOnPasswordChange: true,

      // Optional: warn users instead of blocking
      blockCompromisedPasswords: true,
    }),
  ],
});

// The plugin automatically checks passwords against the HIBP database
// and rejects compromised passwords during sign-up and password changes
```

## Sign-In with Ethereum (SIWE) Plugin

Enables Web3 authentication using Ethereum wallet signatures.

```typescript
import { betterAuth } from "better-auth";
import { siwe } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    siwe({
      domain: "example.com",
      uri: "https://example.com",
      statement: "Sign in with your Ethereum account",
    }),
  ],
});

// Client Usage
import { siweClient } from "better-auth/client/plugins";
import { ethers } from "ethers";

const authClient = createAuthClient({
  plugins: [siweClient()],
});

// Get Nonce
const { data: nonce } = await authClient.siwe.getNonce();

// Create and Sign Message
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const address = await signer.getAddress();

const message = await authClient.siwe.prepareMessage({
  address,
  nonce: nonce.nonce,
});

const signature = await signer.signMessage(message);

// Verify and Sign In
await authClient.siwe.signIn({
  message,
  signature,
});
```

## OIDC Provider Plugin

Turns Better Auth into a full OpenID Connect (OIDC) provider, allowing your application to act as an OAuth 2.0 authorization server for other applications.

```typescript
import { betterAuth } from "better-auth";
import { oidcProvider } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    oidcProvider({
      // OIDC configuration
      codeExpiresIn: 600, // 10 minutes
      accessTokenExpiresIn: 3600, // 1 hour
      refreshTokenExpiresIn: 604800, // 7 days

      // Supported scopes
      scopes: ["openid", "profile", "email", "offline_access"],

      // Optional: use JWT plugin for signing tokens
      useJWTPlugin: true,

      // Optional: trusted clients (no consent screen)
      trustedClients: [
        {
          clientId: "my-trusted-app",
          clientSecret: "secret",
          name: "My Trusted App",
          redirectUrls: ["https://app.example.com/callback"],
          type: "web",
        },
      ],

      // Optional: allow dynamic client registration
      allowDynamicClientRegistration: true,

      // Optional: require PKCE for all clients
      requirePKCE: true,

      // Optional: add custom claims to tokens
      async getAdditionalUserInfoClaim(user, scopes, client) {
        return {
          organization: user.metadata?.organization,
          role: user.role,
        };
      },
    }),
  ],
});

// The plugin exposes the following endpoints:
// - GET /.well-known/openid-configuration (OIDC discovery)
// - GET /oauth2/authorize (authorization endpoint)
// - POST /oauth2/consent (consent handling)
// - POST /oauth2/token (token exchange)
// - GET /oauth2/userinfo (user info endpoint)
// - POST /oauth2/register (dynamic client registration)
// - GET /oauth2/client/:id (get client info)
// - GET/POST /oauth2/endsession (logout endpoint)

// Client Registration Example
const response = await fetch("/api/auth/oauth2/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    redirect_uris: ["https://client.example.com/callback"],
    client_name: "My OAuth Client",
    token_endpoint_auth_method: "client_secret_post",
    grant_types: ["authorization_code", "refresh_token"],
  }),
});

const { client_id, client_secret } = await response.json();

// Authorization Code Flow Example
// 1. Redirect user to authorization endpoint
const authURL = new URL("/api/auth/oauth2/authorize", "https://auth.example.com");
authURL.searchParams.set("client_id", client_id);
authURL.searchParams.set("redirect_uri", "https://client.example.com/callback");
authURL.searchParams.set("response_type", "code");
authURL.searchParams.set("scope", "openid profile email");
authURL.searchParams.set("state", "random-state");
window.location.href = authURL.toString();

// 2. Exchange code for tokens
const tokenResponse = await fetch("/api/auth/oauth2/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code: authorizationCode,
    redirect_uri: "https://client.example.com/callback",
    client_id: client_id,
    client_secret: client_secret,
  }),
});

const { access_token, refresh_token, id_token } = await tokenResponse.json();

// 3. Get user info
const userInfo = await fetch("/api/auth/oauth2/userinfo", {
  headers: { Authorization: `Bearer ${access_token}` },
}).then(res => res.json());

console.log("User info:", userInfo);
```

## OAuth Proxy Plugin

Enables OAuth authentication in development environments by proxying OAuth callbacks through your production server, solving redirect URI mismatch issues.

```typescript
import { betterAuth } from "better-auth";
import { oAuthProxy } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    oAuthProxy({
      // Optional: specify current URL (auto-detected by default)
      currentURL: process.env.CURRENT_URL,

      // Optional: production URL (defaults to BETTER_AUTH_URL)
      productionURL: process.env.BETTER_AUTH_URL,
    }),
  ],
});

// How it works:
// 1. In development (localhost:3000), initiate OAuth sign-in
// 2. Plugin detects non-production environment
// 3. Modifies callback URL to point to production server
// 4. Production server receives OAuth callback
// 5. Production server encrypts session cookies
// 6. Redirects back to development with encrypted cookies
// 7. Development server decrypts and sets cookies locally

// No client-side changes needed - plugin handles everything automatically
await authClient.signIn.social({
  provider: "github",
  callbackURL: "/dashboard",
});

// The plugin exposes: /oauth-proxy-callback endpoint
// This endpoint handles the proxy callback and cookie forwarding
```

## Device Authorization Plugin

Implements OAuth 2.0 device authorization flow for limited-input devices.

```typescript
import { betterAuth } from "better-auth";
import { deviceAuthorization } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    deviceAuthorization({
      deviceCodeExpiresIn: 600, // 10 minutes
      userCodeLength: 8,
      pollingInterval: 5, // seconds
    }),
  ],
});

// Client Usage (Device)
import { deviceAuthorizationClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [deviceAuthorizationClient()],
});

// Request Device Code
const { data } = await authClient.deviceAuthorization.requestCode();

console.log("User code:", data.userCode);
console.log("Verification URL:", data.verificationUri);

// Poll for Authorization
const result = await authClient.deviceAuthorization.pollForAuthorization({
  deviceCode: data.deviceCode,
});

// User visits verification URL and enters user code to authorize
```

## Access Control Plugin

Provides fine-grained permission and role-based access control.

```typescript
import { betterAuth } from "better-auth";
import { access } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    access({
      permissions: {
        post: ["create", "read", "update", "delete"],
        comment: ["create", "read", "delete"],
        user: ["read", "update"],
      },

      roles: {
        admin: {
          post: ["create", "read", "update", "delete"],
          comment: ["create", "read", "delete"],
          user: ["read", "update"],
        },
        editor: {
          post: ["create", "read", "update"],
          comment: ["create", "read"],
        },
        viewer: {
          post: ["read"],
          comment: ["read"],
        },
      },
    }),
  ],
});

// Client Usage
import { accessClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [accessClient()],
});

// Check Permission
const canEdit = await authClient.access.hasPermission({
  resource: "post",
  action: "update",
});

// Get User Permissions
const { data: permissions } = await authClient.access.getPermissions();

console.log("User permissions:", permissions);
```

## One-Time Token Plugin

Generates single-use tokens for secure one-time operations.

```typescript
import { betterAuth } from "better-auth";
import { oneTimeToken } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    oneTimeToken({
      expiresIn: 60 * 15, // 15 minutes
    }),
  ],
});

// Client Usage
import { oneTimeTokenClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [oneTimeTokenClient()],
});

// Generate One-Time Token
const { data } = await authClient.oneTimeToken.generate({
  action: "download-report",
  metadata: { reportId: "123" },
});

console.log("Token:", data.token);

// Verify and Consume Token (server-side)
const result = await auth.api.oneTimeToken.verify({
  token: data.token,
});

if (result.valid) {
  console.log("Token metadata:", result.metadata);
  // Perform action and token is automatically consumed
}
```

## Generic OAuth Plugin

Adds support for custom OAuth 2.0 providers not built into Better Auth.

```typescript
import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "custom-provider",
          clientId: process.env.CUSTOM_CLIENT_ID!,
          clientSecret: process.env.CUSTOM_CLIENT_SECRET!,
          authorizationUrl: "https://oauth.example.com/authorize",
          tokenUrl: "https://oauth.example.com/token",
          userInfoUrl: "https://oauth.example.com/userinfo",
          scopes: ["openid", "profile", "email"],
        },
      ],
    }),
  ],
});

// Client Usage - Same as other OAuth providers
await authClient.signIn.social({
  provider: "custom-provider",
  callbackURL: "/dashboard",
});
```

## Custom Plugin Development

Creates reusable plugins with endpoints, schemas, hooks, and middleware.

```typescript
import { createAuthEndpoint, sessionMiddleware } from "better-auth";
import type { BetterAuthPlugin } from "better-auth";
import { z } from "zod";

export const customSubscriptionPlugin = (options?: {
  plans?: string[];
}) => {
  return {
    id: "subscription",

    // Add database schema
    schema: {
      subscription: {
        fields: {
          userId: {
            type: "string",
            required: true,
            references: { model: "user", field: "id" },
          },
          plan: { type: "string", required: true },
          status: { type: "string", required: true },
          currentPeriodEnd: { type: "date", required: true },
          cancelAtPeriodEnd: { type: "boolean", required: true },
        },
      },
    },

    // Add custom endpoints
    endpoints: {
      getSubscription: createAuthEndpoint(
        "/subscription/get",
        {
          method: "GET",
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const subscription = await ctx.context.adapter.findOne({
            model: "subscription",
            where: [{ field: "userId", value: ctx.context.session.user.id }],
          });

          return { subscription };
        }
      ),

      updateSubscription: createAuthEndpoint(
        "/subscription/update",
        {
          method: "POST",
          body: z.object({
            plan: z.enum(["free", "pro", "enterprise"]),
          }),
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const updated = await ctx.context.adapter.update({
            model: "subscription",
            where: [{ field: "userId", value: ctx.context.session.user.id }],
            update: { plan: ctx.body.plan },
          });

          return { subscription: updated };
        }
      ),
    },

    // Add hooks
    hooks: {
      after: [
        {
          matcher: (context) => context.path === "/sign-up/email",
          handler: async (ctx) => {
            // Create free subscription on sign up
            await ctx.context.adapter.create({
              model: "subscription",
              data: {
                userId: ctx.context.session.user.id,
                plan: "free",
                status: "active",
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                cancelAtPeriodEnd: false,
              },
            });
          },
        },
      ],
    },

    // Add rate limiting
    rateLimit: [
      {
        pathMatcher: (path) => path.startsWith("/subscription/"),
        window: 60,
        max: 10,
      },
    ],

    // Type inference for client
    $Infer: {
      Subscription: {} as {
        plan: string;
        status: string;
        currentPeriodEnd: Date;
      },
    },
  } satisfies BetterAuthPlugin;
};

// Usage
export const auth = betterAuth({
  plugins: [
    customSubscriptionPlugin({
      plans: ["free", "pro", "enterprise"],
    }),
  ],
});
```


## SSO/SAML Plugin (Separate Package)

Enables enterprise Single Sign-On with SAML 2.0 and OIDC support for corporate authentication.

```typescript
// Install the SSO package
// npm install @better-auth/sso

import { betterAuth } from "better-auth";
import { sso } from "@better-auth/sso";

export const auth = betterAuth({
  plugins: [
    sso({
      // SAML Configuration
      saml: {
        providers: [
          {
            providerId: "okta",
            entityId: "https://your-app.com",
            assertionConsumerServiceURL: "https://your-app.com/api/auth/saml/acs",
            singleSignOnServiceURL: process.env.OKTA_SSO_URL!,
            x509Certificate: process.env.OKTA_CERT!,
          },
        ],
      },

      // OIDC Configuration
      oidc: {
        providers: [
          {
            providerId: "azure-ad",
            clientId: process.env.AZURE_CLIENT_ID!,
            clientSecret: process.env.AZURE_CLIENT_SECRET!,
            issuer: "https://login.microsoftonline.com/tenant-id/v2.0",
          },
        ],
      },
    }),
  ],
});

// Client Usage
import { ssoClient } from "@better-auth/sso/client";

const authClient = createAuthClient({
  plugins: [ssoClient()],
});

// Initiate SAML SSO
await authClient.sso.signIn({
  providerId: "okta",
  callbackURL: "/dashboard",
});

// Initiate OIDC SSO
await authClient.sso.signIn({
  providerId: "azure-ad",
  callbackURL: "/dashboard",
});
```

## SCIM Plugin (Separate Package)

Enables enterprise user provisioning through SCIM 2.0 (System for Cross-domain Identity Management) for automated user lifecycle management with identity providers like Okta, Azure AD, and OneLogin.

```typescript
// Install the SCIM package
// npm install @better-auth/scim

import { betterAuth } from "better-auth";
import { scim } from "@better-auth/scim";

export const auth = betterAuth({
  plugins: [
    scim({
      // Optional: customize token storage (default: "plain")
      storeSCIMToken: "hashed", // "plain" | "hashed"

      // Optional: hook before token generation
      async beforeSCIMTokenGenerated({ user, member, scimToken }) {
        console.log("Generating SCIM token for:", user.email);
      },

      // Optional: hook after token generation
      async afterSCIMTokenGenerated({ user, member, scimToken, scimProvider }) {
        // Send notification or log the event
        await notifyAdmin(`SCIM token created for ${scimProvider.providerId}`);
      },
    }),
  ],
});

// The plugin automatically exposes SCIM 2.0 endpoints:
// - POST /api/auth/scim/generate-token (Generate SCIM token)
// - GET /api/auth/scim/v2/ServiceProviderConfig (SCIM metadata)
// - GET /api/auth/scim/v2/Schemas (Supported schemas)
// - GET /api/auth/scim/v2/ResourceTypes (Supported resource types)
// - POST /api/auth/scim/v2/Users (Create user)
// - GET /api/auth/scim/v2/Users (List users)
// - GET /api/auth/scim/v2/Users/:userId (Get user)
// - PUT /api/auth/scim/v2/Users/:userId (Update user)
// - PATCH /api/auth/scim/v2/Users/:userId (Patch user)
// - DELETE /api/auth/scim/v2/Users/:userId (Delete user)

// Client Usage
import { scimClient } from "@better-auth/scim/client";

const authClient = createAuthClient({
  plugins: [scimClient()],
});

// Generate SCIM Token (requires authenticated user)
const { data } = await authClient.scim.generateToken({
  providerId: "okta",
  organizationId: "org_123", // Optional: restrict to organization
});

console.log("SCIM Token:", data.scimToken);
// Share this token with your identity provider

// Configure in your identity provider (e.g., Okta):
// - SCIM Base URL: https://your-app.com/api/auth/scim/v2
// - Authentication: Bearer Token
// - Bearer Token: [scimToken from above]

// Identity provider can now:
// 1. Create users automatically when assigned to the app
// 2. Update user information when changed in the IdP
// 3. Deactivate/delete users when unassigned from the app
// 4. Sync user attributes (name, email, etc.)

// Example: Okta creates a user via SCIM
// POST /api/auth/scim/v2/Users
// Authorization: Bearer [scimToken]
// {
//   "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
//   "userName": "user@example.com",
//   "name": {
//     "givenName": "John",
//     "familyName": "Doe"
//   },
//   "emails": [
//     { "primary": true, "value": "user@example.com" }
//   ],
//   "active": true
// }

// Server-side: Query SCIM-provisioned users
const scimUsers = await auth.api.listUsers({
  headers: request.headers,
  query: {
    filter: 'emails[type eq "work" and value co "@example.com"]'
  },
});

// SCIM supports filtering with standard operators:
// - eq (equal): userName eq "john@example.com"
// - co (contains): name.givenName co "John"
// - sw (starts with): userName sw "john"
// - pr (present): emails pr
// - and/or: emails pr and userName eq "john@example.com"
```

## Expo/React Native Integration (Separate Package)

Provides native mobile authentication for Expo and React Native applications.

```typescript
// Install the Expo package
// npm install @better-auth/expo expo-web-browser expo-secure-store expo-constants expo-linking expo-crypto

// Server setup (same as web)
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  // ... your config
});

// Expo API Route: app/api/auth/[...route]+api.ts
import { auth } from "~/lib/auth";

export async function GET(request: Request) {
  return auth.handler(request);
}

export async function POST(request: Request) {
  return auth.handler(request);
}

// Client Setup
import { createAuthClient } from "@better-auth/expo/client";

export const authClient = createAuthClient({
  baseURL: "https://your-api.com",
  plugins: [
    // Add your plugins
  ],
});

// Usage in React Native
import { useSession } from "@better-auth/expo/client";

function App() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      {session ? (
        <Text>Welcome, {session.user.name}!</Text>
      ) : (
        <Button
          title="Sign In"
          onPress={async () => {
            await authClient.signIn.email({
              email: "user@example.com",
              password: "password",
            });
          }}
        />
      )}
    </View>
  );
}

// OAuth with Expo
await authClient.signIn.social({
  provider: "google",
  callbackURL: "myapp://auth/callback",
});
```

## Stripe Plugin (Separate Package)

Integrates Stripe for subscription and payment management with automatic user-to-customer linking.

```typescript
// Install the Stripe package
// npm install @better-auth/stripe stripe

import { betterAuth } from "better-auth";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const auth = betterAuth({
  plugins: [
    stripe({
      stripe: stripeClient,

      // Optional: customize customer creation
      async createCustomer(user) {
        return {
          email: user.email,
          name: user.name,
          metadata: {
            userId: user.id,
          },
        };
      },

      // Optional: handle webhook events
      async onWebhook(event) {
        if (event.type === "customer.subscription.created") {
          const subscription = event.data.object;
          console.log("New subscription:", subscription.id);
        }
      },
    }),
  ],
});

// Client Usage
import { stripeClient } from "@better-auth/stripe/client";

const authClient = createAuthClient({
  plugins: [stripeClient()],
});

// Get or Create Stripe Customer
const { data: customer } = await authClient.stripe.getCustomer();

console.log("Stripe customer ID:", customer.id);

// Create Checkout Session
const { data: session } = await authClient.stripe.createCheckoutSession({
  priceId: "price_1234567890",
  successUrl: "https://example.com/success",
  cancelUrl: "https://example.com/cancel",
});

// Redirect to Stripe checkout
window.location.href = session.url;

// Create Customer Portal Session
const { data: portal } = await authClient.stripe.createPortalSession({
  returnUrl: "https://example.com/account",
});

// Redirect to customer portal
window.location.href = portal.url;

// Get Customer Subscriptions
const { data: subscriptions } = await authClient.stripe.getSubscriptions();

subscriptions?.forEach(sub => {
  console.log(`Subscription: ${sub.id}, Status: ${sub.status}`);
});

// Server-side: Handle Stripe webhooks
// app/api/stripe/webhook/route.ts
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  // Better Auth automatically handles webhook verification
  // and calls the onWebhook handler configured in the plugin
  return auth.handler(req);
}
```

## Custom Session Plugin

Allows extending session data with custom fields and logic for application-specific needs.

```typescript
import { betterAuth } from "better-auth";
import { customSession } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    customSession({
      // Extend session schema
      schema: {
        session: {
          fields: {
            ipAddress: {
              type: "string",
              required: false,
            },
            userAgent: {
              type: "string",
              required: false,
            },
            metadata: {
              type: "json",
              required: false,
            },
          },
        },
      },

      // Customize session creation
      async onSessionCreate(session, context) {
        return {
          ...session,
          ipAddress: context.request.headers.get("x-forwarded-for"),
          userAgent: context.request.headers.get("user-agent"),
          metadata: { loginMethod: "email" },
        };
      },

      // Customize session retrieval
      async onSessionGet(session, context) {
        // Add runtime data to session
        return {
          ...session,
          activeDevices: await getActiveDevices(session.userId),
        };
      },
    }),
  ],
});

// Type-safe access to custom session data
const session = await auth.api.getSession({ headers });
console.log("IP Address:", session?.ipAddress);
console.log("Metadata:", session?.metadata);
```

## Additional Fields Plugin

Extends user and session objects with custom fields for application-specific data.

```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
      bio: {
        type: "string",
        required: false,
      },
      dateOfBirth: {
        type: "date",
        required: false,
      },
      isVerified: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },
  session: {
    additionalFields: {
      deviceName: {
        type: "string",
        required: false,
      },
    },
  },
});

// Client Usage
import { inferAdditionalFields } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: false,
        },
        bio: {
          type: "string",
          required: false,
        },
        dateOfBirth: {
          type: "date",
          required: false,
        },
        isVerified: {
          type: "boolean",
          required: false,
        },
      },
      session: {
        deviceName: {
          type: "string",
          required: false,
        },
      },
    }),
  ],
});

// Access additional fields in session
const { data: session } = useSession();
console.log("User role:", session?.user.role);
console.log("User bio:", session?.user.bio);
console.log("Device name:", session?.session.deviceName);

// Update user with additional fields
await authClient.updateUser({
  role: "admin",
  bio: "Software developer",
  isVerified: true,
});
```

## Captcha Plugin

Adds bot protection to authentication endpoints using Google reCAPTCHA or Cloudflare Turnstile.

```typescript
import { betterAuth } from "better-auth";
import { captcha } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    captcha({
      // Use Google reCAPTCHA v2 or v3
      provider: "recaptcha", // "recaptcha" | "turnstile"
      secretKey: process.env.RECAPTCHA_SECRET_KEY!,

      // Optional: override site verify URL
      siteVerifyURLOverride: "https://custom-verify-url.com",

      // Optional: specify which endpoints to protect (defaults to common auth endpoints)
      endpoints: [
        "/sign-in/email",
        "/sign-up/email",
        "/reset-password",
      ],
    }),

    // Or use Cloudflare Turnstile
    captcha({
      provider: "turnstile",
      secretKey: process.env.TURNSTILE_SECRET_KEY!,
    }),
  ],
});

// Client Usage - Add captcha response header
// For Google reCAPTCHA
const recaptchaToken = await grecaptcha.execute();

await authClient.signIn.email({
  email: "user@example.com",
  password: "password",
  fetchOptions: {
    headers: {
      "x-captcha-response": recaptchaToken,
    },
  },
});

// For Cloudflare Turnstile
const turnstileToken = await turnstile.getResponse();

await authClient.signUp.email({
  email: "user@example.com",
  password: "password",
  name: "User",
  fetchOptions: {
    headers: {
      "x-captcha-response": turnstileToken,
    },
  },
});

// The plugin automatically verifies the captcha token before processing the request
// If verification fails, the request is rejected with a 400 error
```

## Google One Tap Plugin

Enables passwordless authentication using Google One Tap for seamless sign-in.

```typescript
import { betterAuth } from "better-auth";
import { oneTap } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    oneTap({
      // Optional: disable signup via One Tap
      disableSignup: false,

      // Optional: specify Google Client ID (uses socialProviders.google.clientId if not provided)
      clientId: process.env.GOOGLE_CLIENT_ID,
    }),
  ],
});

// Client Usage
import { oneTapClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [oneTapClient()],
});

// Initialize Google One Tap on your page
google.accounts.id.initialize({
  client_id: "YOUR_GOOGLE_CLIENT_ID",
  callback: async (response) => {
    // Send the ID token to Better Auth
    const { data, error } = await authClient.oneTap.signIn({
      idToken: response.credential,
    });

    if (!error) {
      console.log("Signed in with Google One Tap:", data.user);
    }
  },
});

// Display the One Tap prompt
google.accounts.id.prompt();

// Or render the One Tap button
google.accounts.id.renderButton(
  document.getElementById("oneTapButton"),
  {
    theme: "outline",
    size: "large",
  }
);
```

## Last Login Method Plugin

Tracks the last authentication method used by each user for analytics and UX improvements.

```typescript
import { betterAuth } from "better-auth";
import { lastLoginMethod } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    lastLoginMethod({
      // Optional: custom cookie name
      cookieName: "better-auth.last_used_login_method",

      // Optional: cookie expiration (default: 30 days)
      maxAge: 60 * 60 * 24 * 30,

      // Optional: store in database instead of cookie only
      storeInDatabase: true,

      // Optional: custom method to resolve login method
      customResolveMethod(ctx) {
        // Extract login method from context
        if (ctx.path.includes("/sign-in/social")) {
          return "oauth";
        }
        if (ctx.path.includes("/passkey/")) {
          return "passkey";
        }
        return "email";
      },
    }),
  ],
});

// When storeInDatabase is enabled, the plugin adds a lastLoginMethod field to the user table

// Access last login method on the client
const { data: session } = useSession();
if (session) {
  console.log("Last login method:", session.user.lastLoginMethod);
}

// Server-side access
const session = await auth.api.getSession({ headers });
if (session) {
  console.log("User's last login method:", session.user.lastLoginMethod);
}

// The plugin automatically tracks:
// - "email" for email/password authentication
// - "oauth" for social authentication
// - "passkey" for passkey authentication
// - "magic-link" for magic link authentication
// - "phone" for phone number authentication
// - Custom values from customResolveMethod
```

## OpenAPI Plugin

Automatically generates OpenAPI 3.0 documentation for all Better Auth endpoints with interactive API explorer.

```typescript
import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    openAPI({
      // Optional: customize the path (default: "/reference")
      path: "/api-docs",

      // Optional: customize Scalar theme
      theme: "purple", // "default" | "alternate" | "moon" | "purple" | "solarized" | etc.

      // Optional: add custom security nonce for CSP
      nonce: process.env.CSP_NONCE,
    }),
  ],
});

// The plugin automatically exposes an interactive API reference at:
// http://localhost:3000/api/auth/api-docs

// Access OpenAPI specification JSON:
// http://localhost:3000/api/auth/api-docs/openapi.json

// The documentation includes:
// - All authentication endpoints with request/response schemas
// - Security schemes and authentication requirements
// - Interactive try-it-out functionality
// - Example requests and responses
// - Type definitions and validation rules
// - Rate limiting information

// You can also use the OpenAPI spec with other tools:
// - Import into Postman, Insomnia, or other API clients
// - Generate client SDKs in multiple languages
// - Set up API testing and monitoring
// - Create custom documentation sites
```

## Rate Limiting Configuration

Controls request frequency to prevent abuse and protect endpoints from attacks.

```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  // Global rate limiting
  rateLimit: {
    enabled: true,
    window: 60, // seconds
    max: 10, // requests per window
    storage: "memory", // "memory" | "database"

    // Custom rate limit rules
    customRules: [
      {
        pathMatcher: (path) => path === "/sign-in/email",
        window: 60,
        max: 5, // More restrictive for sign-in
      },
      {
        pathMatcher: (path) => path === "/sign-up/email",
        window: 60,
        max: 3, // Even more restrictive for sign-up
      },
      {
        pathMatcher: (path) => path.startsWith("/reset-password"),
        window: 300, // 5 minutes
        max: 3,
      },
    ],
  },
});

// Plugin-specific rate limiting
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    twoFactor({
      // Plugin adds its own rate limits
      rateLimit: {
        window: 60,
        max: 3, // Only 3 2FA attempts per minute
      },
    }),
  ],
});
```

## Better Auth provides a production-ready authentication system that scales from simple email/password flows to complex multi-tenant applications with enterprise SSO/SAML, SCIM user provisioning, Web3 authentication, device authorization, OpenID Connect provider capabilities for building OAuth 2.0 authorization servers, OAuth proxy for seamless development workflows, Stripe payment integration, captcha verification for bot protection, Google One Tap authentication, automatic OpenAPI documentation generation, last login method tracking, and native mobile support via Expo/React Native. The plugin architecture enables rapid feature development while maintaining type safety across the entire stack, supporting advanced features like phone number authentication, username login, anonymous sessions, bearer tokens, API keys, JWT tokens, password breach checking via HaveIBeenPwned, custom session handling, additional user/session fields, OIDC provider, OAuth proxy, Stripe subscriptions, SCIM enterprise provisioning, captcha protection, Google One Tap, OpenAPI docs, last login tracking, and fine-grained access control. Database adapters abstract away ORM-specific details, allowing seamless switching between Prisma, Drizzle, MongoDB, or in-memory storage. Framework integrations handle the nuances of Next.js App Router, SvelteKit, Solid Start, React Start (TanStack Start), Expo, and other modern frameworks, ensuring cookies, headers, and redirects work correctly in server components, API routes, edge runtimes, and native mobile apps.

The client libraries provide a unified API across React, Vue, Svelte, Solid, Lynx, and React Native with framework-specific primitives like hooks, stores, and signals for reactive session management. Plugins like organization, two-factor, passkey, magic link, email OTP, phone number, username, anonymous, bearer, API key, JWT, multi-session, SIWE, device authorization, access control, custom session, OIDC provider, OAuth proxy, Stripe, SCIM, SSO/SAML, captcha, Google One Tap, OpenAPI documentation, and last login method tracking add complete features with minimal configuration, including database schemas, API endpoints, hooks, rate limiting, and client methods. Additional features can be added through the user/session additionalFields configuration for custom data requirements. Separate packages like @better-auth/passkey, @better-auth/sso, @better-auth/scim, @better-auth/expo, and @better-auth/stripe provide specialized functionality with their own dependencies. The system's security defaults include automatic CSRF protection, secure cookie handling with httpOnly and sameSite flags, bcrypt password hashing, rate limiting, captcha verification support, password breach checking via HaveIBeenPwned integration, and session validation on every request, making it suitable for production use without extensive security hardening.
### Quick Registry Configuration Setup

Source: https://ui.shadcn.com/docs/registry/namespace

Minimal configuration example for setting up two namespaced registries (v0 and acme) in components.json. This provides a foundation for multi-source resource installation.

```json
{
  "registries": {
    "@v0": "https://v0.dev/chat/b/{name}",
    "@acme": "https://registry.acme.com/resources/{name}.json"
  }
}
```

--------------------------------

### Install Switch Component via CLI

Source: https://ui.shadcn.com/docs/components/switch

Installs the Switch component and its dependencies using the shadcn CLI tool. This is the recommended installation method for quick setup in shadcn projects.

```bash
npx shadcn@latest add switch
```

--------------------------------

### Serve shadcn Registry with Next.js Development Server

Source: https://ui.shadcn.com/docs/registry/getting-started

This command starts the Next.js development server, which will serve your shadcn registry files if your project is configured with Next.js. The registry items will be accessible via specific URLs under `/r/` after the build process.

```bash
npm run dev
```

--------------------------------

### Install Radix UI Select dependency manually with npm

Source: https://ui.shadcn.com/docs/components/select

For manual Shadcn UI Select setup, use this `npm` command to install the foundational `@radix-ui/react-select` package. This step is crucial before copying the component source code.

```bash
npm install @radix-ui/react-select
```

--------------------------------

### Install Shadcn UI Progress Component

Source: https://ui.shadcn.com/docs/components/progress

This section provides two methods for installing the Shadcn UI `Progress` component. The CLI method uses `npx shadcn@latest add progress` for quick setup, while the manual method involves installing the core `@radix-ui/react-progress` dependency via `npm`. Both approaches integrate the progress bar functionality into your project.

```bash
npx shadcn@latest add progress
```

```bash
npm install @radix-ui/react-progress
```

--------------------------------

### Install shadcn CLI via npm

Source: https://ui.shadcn.com/docs/registry/getting-started

This command installs the latest version of the shadcn command-line interface (CLI) globally or as a dev dependency in your project. The CLI is essential for building and managing shadcn component registries and components.

```bash
npm install shadcn@latest
```

--------------------------------

### Install Shadcn UI Label component

Source: https://ui.shadcn.com/docs/components/label

This section provides instructions for installing the Shadcn UI Label component using both the command-line interface (CLI) and a manual approach. The CLI command offers a quick setup, while manual installation involves adding the core Radix UI dependency and copying the component source.

```bash
npx shadcn@latest add label
```

```bash
npm install @radix-ui/react-label
```

--------------------------------

### Initialize TanStack Start Project with shadcn/ui and Tailwind

Source: https://ui.shadcn.com/docs/installation/tanstack

This command initializes a new TanStack Start project, automatically configuring it with Tailwind CSS and the necessary integrations for shadcn/ui components. It sets up the foundational structure for a web application using these technologies, streamlining the setup process.

```bash
npm create @tanstack/start@latest --tailwind --add-ons shadcn
```

--------------------------------

### Create New Laravel Project with React

Source: https://ui.shadcn.com/docs/installation/laravel

Initialize a new Laravel project with Inertia and React using the Laravel installer. This command creates a fresh Laravel application with React pre-configured for use with Inertia.js.

```bash
laravel new my-app --react
```

--------------------------------

### Install Input OTP Dependency with npm (Bash)

Source: https://ui.shadcn.com/docs/components/input-otp

Instructs on how to manually install the core `input-otp` dependency using npm. This is a prerequisite for manual setup before copying the component source code into your project.

```bash
npm install input-otp
```

--------------------------------

### Install shadcn components from various sources

Source: https://ui.shadcn.com/docs/registry/namespace

Demonstrates how to install shadcn components using the 'add' command. This includes installing from a specific registry, installing multiple resources, installing directly from a URL, and installing from a local file path.

```bash
npx shadcn@latest add @v0/dashboard
```

```bash
npx shadcn@latest add @acme/button @lib/utils @ai/prompt
```

```bash
npx shadcn@latest add https://registry.example.com/button.json
```

```bash
npx shadcn@latest add ./local-registry/button.json
```

--------------------------------

### Example Interactive Prompts for `shadcn@latest init` Command

Source: https://ui.shadcn.com/docs/changelog

This text snippet illustrates the questions asked when running the `npx shadcn@latest init` command, guiding the user through configuring their `components.json` file. It covers choices for styling, color, CSS location, CSS variables, Tailwind config, import aliases, and React Server Components.

```txt
Which style would you like to use? › Default
Which color would you like to use as base color? › Slate
Where is your global CSS file? › › app/globals.css
Do you want to use CSS variables for colors? › no / yes
Where is your tailwind.config.js located? › tailwind.config.js
Configure the import alias for components: › @/components
Configure the import alias for utils: › @/lib/utils
Are you using React Server Components? › no / yes
```

--------------------------------

### Define Universal Registry Item for Multi-File Template (shadcn/ui)

Source: https://ui.shadcn.com/docs/registry/examples

This JSON configuration defines a shadcn/ui registry item named 'my-custom-start-template' that installs multiple files. It includes two files, each with an explicit target path, demonstrating how to create a universal starter template that can be installed without framework detection or components.json.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "my-custom-start-template",
  "type": "registry:item",
  "dependencies": ["better-auth"],
  "files": [
    {
      "path": "/path/to/file-01.json",
      "type": "registry:file",
      "target": "~/file-01.json",
      "content": "..."
    },
    {
      "path": "/path/to/file-02.vue",
      "type": "registry:file",
      "target": "~/pages/file-02.vue",
      "content": "..."
    }
  ]
}
```

--------------------------------

### Install Form Component via Shadcn CLI

Source: https://ui.shadcn.com/docs/components/form

This command provides the recommended method for installing the Shadcn UI form component using its command-line interface. Executing this command automates the addition of the form component and its dependencies to your project, simplifying the setup process.

```bash
npx shadcn@latest add form
```

--------------------------------

### Multiple Registry Setup with Mixed Authentication

Source: https://ui.shadcn.com/docs/components-json

Complete example showing how to configure multiple registries with different authentication methods and parameters. Demonstrates public registries, private registries with bearer tokens, and team registries with versioning and environment variables.

```json
{
  "registries": {
    "@shadcn": "https://ui.shadcn.com/r/{name}.json",
    "@company-ui": {
      "url": "https://registry.company.com/ui/{name}.json",
      "headers": {
        "Authorization": "Bearer ${COMPANY_TOKEN}"
      }
    },
    "@team": {
      "url": "https://team.company.com/{name}.json",
      "params": {
        "team": "frontend",
        "version": "${REGISTRY_VERSION}"
      }
    }
  }
}
```

--------------------------------

### Install Project Dependencies using npm

Source: https://ui.shadcn.com/docs/installation/manual

This bash command installs a set of essential npm packages for the project. These dependencies include utilities for styling (`class-variance-authority`, `clsx`, `tailwind-merge`), icon library (`lucide-react`), and animation effects (`tw-animate-css`).

```bash
npm install class-variance-authority clsx tailwind-merge lucide-react tw-animate-css
```

--------------------------------

### Install Alert component using Shadcn CLI (Bash)

Source: https://ui.shadcn.com/docs/components/alert

Provides the command-line interface command to add the 'Alert' component to a project using the 'shadcn' CLI tool. This simplifies the setup process by automating component file creation and dependencies.

```bash
npx shadcn@latest add alert
```

--------------------------------

### Add Component Definition to shadcn registry.json

Source: https://ui.shadcn.com/docs/registry/getting-started

This JSON snippet shows how to register a component, like `hello-world`, within the `registry.json` file. It includes metadata such as name, type, title, description, and defines the component's file path and type, ensuring it conforms to the registry item schema.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "acme",
  "homepage": "https://acme.com",
  "items": [
    {
      "name": "hello-world",
      "type": "registry:block",
      "title": "Hello World",
      "description": "A simple hello world component.",
      "files": [
        {
          "path": "registry/new-york/hello-world/hello-world.tsx",
          "type": "registry:component"
        }
      ]
    }
  ]
}
```

--------------------------------

### Install Dependencies with pnpm

Source: https://ui.shadcn.com/docs/blocks

Installs project dependencies using pnpm package manager. Required before starting development on the block.

```bash
pnpm install
```

--------------------------------

### Install Context Menu component using Shadcn CLI (Bash)

Source: https://ui.shadcn.com/docs/components/context-menu

This `npx` command leverages the Shadcn UI command-line interface to quickly add the `context-menu` component to your project. It automates the process of copying component files and installing necessary dependencies, streamlining setup.

```bash
npx shadcn@latest add context-menu
```

--------------------------------

### Install Kbd component via CLI

Source: https://ui.shadcn.com/docs/components/kbd

Install the Kbd component using the shadcn/ui CLI tool. This command downloads and sets up the component in your project's components directory.

```bash
npx shadcn@latest add kbd
```

--------------------------------

### Install Shadcn UI Separator via CLI

Source: https://ui.shadcn.com/docs/components/separator

This command installs the Shadcn UI Separator component using the Shadcn CLI. It adds the necessary component files to your project setup. Ensure you have the Shadcn CLI installed globally.

```bash
npx shadcn@latest add separator
```

--------------------------------

### View Registry Item Before Installation

Source: https://ui.shadcn.com/docs/changelog

Preview a component from a registry before installing it. This command displays the component code, configuration, and all dependencies, allowing users to verify the component matches their requirements.

```bash
npx shadcn view @acme/auth-system
```

--------------------------------

### Create Remix Project with create-remix

Source: https://ui.shadcn.com/docs/installation/remix

Initialize a new Remix project using the create-remix command-line tool. This sets up the basic Remix application structure and dependencies.

```bash
npx create-remix@latest my-app
```

--------------------------------

### Install Shadcn UI Accordion via CLI in Bash

Source: https://ui.shadcn.com/docs/components/accordion

This Bash command installs the Shadcn UI Accordion component into your project using the `npx shadcn` command-line interface. It simplifies the setup process by adding the component and its dependencies.

```bash
npx shadcn@latest add accordion
```

--------------------------------

### Install Shadcn UI Command Component via CLI (Bash)

Source: https://ui.shadcn.com/docs/components/command

This command facilitates the automated installation of the Shadcn UI `Command` component using the provided CLI utility. It streamlines the process of adding the component files and their required dependencies directly into your project. This method is recommended for a quick and integrated setup.

```bash
npx shadcn@latest add command
```

--------------------------------

### Install Vaul Dependency for Manual Setup

Source: https://ui.shadcn.com/docs/components/drawer

Manually install the Vaul package as a dependency when setting up the Drawer component without the CLI. Vaul is the underlying library that powers the Drawer functionality.

```bash
npm install vaul
```

--------------------------------

### Install Block and Override Primitives in shadcn/ui

Source: https://ui.shadcn.com/docs/registry/examples

Configure a registry item to install a block from shadcn/ui and override default primitives with custom implementations from remote registries. This enables centralized dependency management for component hierarchies.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "custom-login",
  "type": "registry:block",
  "registryDependencies": [
    "login-01",
    "https://example.com/r/button.json",
    "https://example.com/r/input.json",
    "https://example.com/r/label.json"
  ]
}
```

--------------------------------

### Install shadcn/ui Chart Component using CLI (Bash)

Source: https://ui.shadcn.com/docs/components/chart

This command installs the `chart` component into your shadcn/ui project using the `npx shadcn` CLI tool. It automatically adds the necessary files and dependencies for the chart component, simplifying the setup process. This is the recommended method for quick integration.

```bash
npx shadcn@latest add chart
```

--------------------------------

### Install ScrollArea Component via CLI - Bash

Source: https://ui.shadcn.com/docs/components/scroll-area

Installs the ScrollArea component and its dependencies using the shadcn-ui CLI tool. This is the quickest setup method that automatically handles component installation and configuration.

```bash
npx shadcn@latest add scroll-area
```

--------------------------------

### Install Badge Component via CLI

Source: https://ui.shadcn.com/docs/components/badge

Command to install the Badge component using shadcn CLI. This is the quickest method to add the Badge component to a shadcn project with automatic setup.

```bash
npx shadcn@latest add badge
```

--------------------------------

### Define Initial shadcn registry.json Structure

Source: https://ui.shadcn.com/docs/registry/getting-started

This JSON snippet illustrates the basic structure for a `registry.json` file, which serves as the entry point for a shadcn component registry. It includes the schema reference, registry name, homepage URL, and an empty array for registry items, conforming to the specified registry schema.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "acme",
  "homepage": "https://acme.com",
  "items": [
    // ...
  ]
}
```

--------------------------------

### Execute shadcn Registry Build Script

Source: https://ui.shadcn.com/docs/registry/getting-started

This command runs the `registry:build` script defined in `package.json`. Executing this script triggers the shadcn CLI to generate the registry JSON files, typically placed in a `public/r` directory by default.

```bash
npm run registry:build
```

--------------------------------

### Example Secure Custom Registry Configuration (JSON)

Source: https://ui.shadcn.com/docs/registry/namespace

This snippet provides an example of a comprehensive secure custom registry setup in `components.json`. It includes a URL, authorization using an environment variable, and a custom header, adhering to best practices for registry operators.

```json
{
  "@company": {
    "url": "https://registry.company.com/v1/{name}.json",
    "headers": {
      "Authorization": "Bearer ${COMPANY_TOKEN}",
      "X-Registry-Version": "1.0"
    }
  }
}
```

--------------------------------

### Install Radix UI Accordion dependency using npm in Bash

Source: https://ui.shadcn.com/docs/components/accordion

This Bash command installs the `@radix-ui/react-accordion` package, which is the underlying dependency for the Shadcn UI Accordion component. It's a prerequisite for manual installation setups.

```bash
npm install @radix-ui/react-accordion
```

--------------------------------

### Configure shadcn Build Script in package.json

Source: https://ui.shadcn.com/docs/registry/getting-started

This JSON snippet updates the `package.json` file by adding a `registry:build` script. This script executes the `shadcn build` command, which is used to generate the necessary JSON files for the component registry.

```json
{
  "scripts": {
    "registry:build": "shadcn build"
  }
}
```

--------------------------------

### Install Radix UI Slider dependency manually (npm)

Source: https://ui.shadcn.com/docs/components/slider

Manually install the core `@radix-ui/react-slider` package, which provides the primitive functionality for the shadcn/ui Slider component. This step is required for manual setup.

```bash
npm install @radix-ui/react-slider
```

--------------------------------

### Install Shadcn Input Component via CLI

Source: https://ui.shadcn.com/docs/components/input

Provides the command-line interface instruction to add the Shadcn UI Input component to a project. This command uses `npx` to execute the `shadcn` CLI tool and install the `input` component.

```bash
npx shadcn@latest add input
```

--------------------------------

### Install Components from Namespaced Registries

Source: https://ui.shadcn.com/docs/changelog

Install components from multiple namespaced registries using the command line. Components are specified with their namespace prefix and installed automatically with all dependencies resolved from their respective registries.

```bash
npx shadcn add @acme/button @internal/auth-system
```

--------------------------------

### Add Components to Monorepo Workspace

Source: https://ui.shadcn.com/docs/monorepo

Add shadcn/ui components to your monorepo application by navigating to the app directory and running the add command. The CLI automatically determines component type and installs files to correct paths with proper import handling.

```bash
cd apps/web
npx shadcn@latest add [COMPONENT]
```

--------------------------------

### Install Resources from Namespaced Registries

Source: https://ui.shadcn.com/docs/components-json

Install components and resources using the namespace syntax after configuring registries. Supports installing from public registries, private authenticated registries, and multiple resources in a single command.

```bash
# Install from a configured registry
npx shadcn@latest add @v0/dashboard

# Install from private registry
npx shadcn@latest add @private/button

# Install multiple resources
npx shadcn@latest add @acme/header @internal/auth-utils
```

--------------------------------

### Install CMD K Dependency for Command Menu (Bash)

Source: https://ui.shadcn.com/docs/components/command

This command installs the core `cmdk` package, which serves as the foundational dependency for the Shadcn UI `Command` component. This step is crucial for the manual installation process, ensuring that the underlying command menu functionality is available. Make sure this dependency is installed before proceeding with copying the component's source code.

```bash
npm install cmdk
```

--------------------------------

### Install Shadcn UI Spinner Component via CLI (Bash)

Source: https://ui.shadcn.com/docs/components/spinner

Provides the command-line interface (CLI) instruction to add the Shadcn UI Spinner component to your project. This command automates the setup, including creating the component file and configuring necessary dependencies. Ensure you have the Shadcn UI CLI installed globally or locally before running this command.

```bash
npx shadcn@latest add spinner
```

--------------------------------

### Install Resizable Component via CLI

Source: https://ui.shadcn.com/docs/components/resizable

Installs the Resizable component and its dependencies using the shadcn CLI tool. This automated approach sets up the component in your project with proper configuration.

```bash
npx shadcn@latest add resizable
```

--------------------------------

### Install Radio Group Component using Shadcn CLI

Source: https://ui.shadcn.com/docs/components/radio-group

This command demonstrates how to install the Shadcn UI Radio Group component using its command-line interface. It simplifies the setup process by automatically adding the necessary files to your project.

```bash
npx shadcn@latest add radio-group
```

--------------------------------

### Handle `shadcn/ui` Initialization with React 19 Peer Dependency Prompt (npm)

Source: https://ui.shadcn.com/docs/react-19

This `bash` snippet illustrates the interactive prompt from the `shadcn/ui` CLI when initializing a project (`npx shadcn@latest init -d`) while using React 19 with `npm`. It guides users to select a resolution strategy, either `--force` or `--legacy-peer-deps`, to address potential peer dependency conflicts during the shadcn/ui installation process.

```bash
It looks like you are using React 19.
Some packages may fail to install due to peer dependency issues (see https://ui.shadcn.com/react-19).

? How would you like to proceed? › - Use arrow-keys. Return to submit.
❯   Use --force
    Use --legacy-peer-deps
```

--------------------------------

### Install Drawer Component via CLI

Source: https://ui.shadcn.com/docs/components/drawer

Install the shadcn Drawer component using the CLI tool. This is the recommended installation method that automatically sets up all dependencies and copies necessary files to your project.

```bash
npx shadcn@latest add drawer
```

--------------------------------

### Manually Install Radix UI Hover Card Dependency

Source: https://ui.shadcn.com/docs/components/hover-card

This command manually installs the core @radix-ui/react-hover-card primitive package, which is a foundational dependency for the shadcn/ui Hover Card component. This step is required for manual setup.

```bash
npm install @radix-ui/react-hover-card
```

--------------------------------

### Define reusable registry block with components

Source: https://ui.shadcn.com/docs/registry/examples

Create a registry block item that bundles multiple related files (pages and components) with their dependencies. This block specifies registry dependencies on other components and defines file paths with content references for installation into target locations in the project structure.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "login-01",
  "type": "registry:block",
  "description": "A simple login form.",
  "registryDependencies": ["button", "card", "input", "label"],
  "files": [
    {
      "path": "blocks/login-01/page.tsx",
      "content": "import { LoginForm } ...",
      "type": "registry:page",
      "target": "app/login/page.tsx"
    },
    {
      "path": "blocks/login-01/components/login-form.tsx",
      "content": "...",
      "type": "registry:component"
    }
  ]
}
```

--------------------------------

### Install Carousel Component via CLI

Source: https://ui.shadcn.com/docs/components/carousel

shadcn/ui CLI command to automatically install and configure the carousel component with all dependencies and file setup. Simplest method for adding the carousel to your project.

```bash
npx shadcn@latest add carousel
```

--------------------------------

### View shadcn component details

Source: https://ui.shadcn.com/docs/registry/namespace

Explains how to inspect registry items before installation using the 'view' command. This allows users to see resource metadata, dependencies, file contents, and configuration details for single or multiple resources, or from a URL.

```bash
npx shadcn@latest view @acme/button
```

```bash
npx shadcn@latest view @v0/dashboard @shadcn/card
```

```bash
npx shadcn@latest view https://registry.example.com/button.json
```

--------------------------------

### Install Native Select component via CLI

Source: https://ui.shadcn.com/docs/components/native-select

Use the shadcn CLI to easily add the Native Select component to your project. This command will scaffold the necessary files and update dependencies automatically, streamlining the setup process.

```bash
npx shadcn@latest add native-select
```

--------------------------------

### Install Input OTP Component using Shadcn CLI (Bash)

Source: https://ui.shadcn.com/docs/components/input-otp

Provides the command to add the Input OTP component to your project using the shadcn/ui CLI. This automates the installation and configuration of the component and its dependencies.

```bash
npx shadcn@latest add input-otp
```

--------------------------------

### Add All shadcn/ui Components to Project

Source: https://ui.shadcn.com/docs/installation/tanstack

This command utilizes the shadcn/ui CLI to add all available components to the current project. It's a convenient way to integrate the entire shadcn/ui library at once, providing access to a full suite of pre-built UI components for comprehensive application development.

```bash
npx shadcn@latest add --all
```

--------------------------------

### Install Shadcn UI Aspect Ratio Component via CLI (Bash)

Source: https://ui.shadcn.com/docs/components/aspect-ratio

This command utilizes the `shadcn` CLI tool to automatically add the `aspect-ratio` component to your project. It streamlines the installation process, fetching and configuring the component with minimal manual intervention.

```bash
npx shadcn@latest add aspect-ratio
```

--------------------------------

### Install Menubar Component via CLI

Source: https://ui.shadcn.com/docs/components/menubar

Installs the Menubar component and its dependencies using the shadcn CLI tool. This is the quickest way to add the component to an existing project.

```bash
npx shadcn@latest add menubar
```

--------------------------------

### Install Empty Component via CLI

Source: https://ui.shadcn.com/docs/components/empty

Command to install the Empty component using the shadcn package manager. Automatically adds the component and its dependencies to the project.

```bash
npx shadcn@latest add empty
```

--------------------------------

### Start Development Server with pnpm

Source: https://ui.shadcn.com/docs/blocks

Starts the development server for the www application at http://localhost:3333. Enables live preview of blocks during development.

```bash
pnpm www:dev
```

--------------------------------

### Install Sonner via CLI

Source: https://ui.shadcn.com/docs/components/sonner

Command-line installation method for adding Sonner to a shadcn/ui project. This is the quickest way to set up the toast component with all dependencies.

```bash
npx shadcn@latest add sonner
```

--------------------------------

### Item Component Installation - Bash

Source: https://ui.shadcn.com/docs/components/item

CLI command to install the Item component from shadcn. Requires Node.js and npm/pnpm package manager.

```bash
npx shadcn@latest add item
```

--------------------------------

### Install Radix UI Context Menu dependency manually (Bash)

Source: https://ui.shadcn.com/docs/components/context-menu

This command installs the foundational `@radix-ui/react-context-menu` package via npm. It is a prerequisite for manual installation of the Shadcn UI `context-menu` component, providing the core unstyled primitive functionality.

```bash
npm install @radix-ui/react-context-menu
```

--------------------------------

### Install NavigationMenu Component via CLI

Source: https://ui.shadcn.com/docs/components/navigation-menu

Quick installation method using shadcn CLI to add the NavigationMenu component to your project. Requires Node.js and npm to be installed.

```bash
npx shadcn@latest add navigation-menu
```

--------------------------------

### CLI npx shadcn@latest add

Source: https://ui.shadcn.com/docs/registry/namespace

Installs components or resources from a specified registry, URL, or local file path into your project. It supports installing single or multiple items simultaneously.

```APIDOC
## CLI npx shadcn@latest add

### Description
Installs components or resources from a specified registry, URL, or local file path into your project. It supports installing single or multiple items simultaneously.

### Method
CLI

### Endpoint
`npx shadcn@latest add [resource_identifier...]`

### Parameters
#### Path Parameters
- **resource_identifier** (string) - Required - One or more identifiers for the resource(s) to install. This can be a registry-prefixed name (e.g., `@v0/dashboard`), a direct URL to a `.json` file, or a local file path.

#### Query Parameters
(None)

#### Request Body
(Not applicable for CLI command)

### Request Example
```bash
npx shadcn@latest add @v0/dashboard
npx shadcn@latest add @acme/button @lib/utils @ai/prompt
npx shadcn@latest add https://registry.example.com/button.json
npx shadcn@latest add ./local-registry/button.json
```

### Response
#### Success Response (CLI Output)
The command typically outputs success messages indicating that the components have been added and any necessary configurations updated.

#### Response Example
```txt
✔ Files generated.
```
```

--------------------------------

### Install Tailwind CSS and Autoprefixer

Source: https://ui.shadcn.com/docs/installation/remix

Install Tailwind CSS and Autoprefixer as development dependencies to enable styling support for shadcn/ui components in your Remix project.

```bash
npm install -D tailwindcss@latest autoprefixer@latest
```

--------------------------------

### Install Tooltip Dependencies via npm

Source: https://ui.shadcn.com/docs/components/tooltip

Manual installation of the Radix UI tooltip dependency. Required when not using the shadcn CLI installation method. Install this package before copying the tooltip component source.

```bash
npm install @radix-ui/react-tooltip
```

--------------------------------

### Install Shadcn UI Dialog component using CLI or npm

Source: https://ui.shadcn.com/docs/components/dialog

Instructions for installing the Shadcn UI Dialog component. Provides options for using the Shadcn CLI to add the component or manually installing the underlying Radix UI dependency.

```bash
npx shadcn@latest add dialog
```

```bash
npm install @radix-ui/react-dialog
```

--------------------------------

### Inspect Registry Item Payload Before Installation (Bash)

Source: https://ui.shadcn.com/docs/registry/namespace

This command demonstrates how to use the `shadcn` CLI to view the raw payload of a registry item (e.g., `@acme/button`) before installing it. This feature provides transparency, allowing developers to inspect the content being installed.

```bash
npx shadcn@latest view @acme/button
```

--------------------------------

### Install Sheet Component via CLI

Source: https://ui.shadcn.com/docs/components/sheet

Command to install the Sheet component and its dependencies using the shadcn CLI. This is the recommended installation method for projects using shadcn/ui.

```bash
npx shadcn@latest add sheet
```

--------------------------------

### Initialize shadcn/ui Project with Next.js

Source: https://ui.shadcn.com/docs/installation/next

Run the init command to create a new Next.js project or configure an existing one with shadcn/ui. This command sets up the necessary configuration and dependencies for using shadcn/ui components.

```bash
npx shadcn@latest init
```

--------------------------------

### Initialize shadcn Project with init Command

Source: https://ui.shadcn.com/docs/cli

The init command sets up a new shadcn project by installing dependencies, adding the cn utility, and configuring CSS variables. It supports template selection, base color configuration, and directory structure options.

```bash
npx shadcn@latest init
```

```bash
Usage: shadcn init [options] [components...]

initialize your project and install dependencies

Arguments:
  components         name, url or local path to component

Options:
  -t, --template <template>      the template to use. (next, next-monorepo)
  -b, --base-color <base-color>  the base color to use. (neutral, gray, zinc, stone, slate)
  -y, --yes                      skip confirmation prompt. (default: true)
  -f, --force                    force overwrite of existing configuration. (default: false)
  -c, --cwd <cwd>                the working directory. defaults to the current directory.
  -s, --silent                   mute output. (default: false)
  --src-dir                      use the src directory when creating a new project. (default: false)
  --no-src-dir                   do not use the src directory when creating a new project.
  --css-variables                use css variables for theming. (default: true)
  --no-css-variables             do not use css variables for theming.
  --no-base-style                do not install the base shadcn style
  -h, --help                     display help for command
```

--------------------------------

### Install Table Component via CLI

Source: https://ui.shadcn.com/docs/components/table

CLI command to install the shadcn/ui Table component using npx. This automatically adds the component to your project.

```bash
npx shadcn@latest add table
```

--------------------------------

### Create components.json Configuration File for shadcn/ui

Source: https://ui.shadcn.com/docs/installation/manual

This JSON configuration file sets up the shadcn/ui component library with New York style, TypeScript/TSX support, Tailwind CSS styling with CSS variables, and path aliases for easier imports. Place this file in the root of your project directory to enable component scaffolding and configuration.

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

--------------------------------

### Install Radix UI Switch Dependency

Source: https://ui.shadcn.com/docs/components/switch

Installs the core Radix UI switch primitive dependency using npm. Required when manually setting up the Switch component without using the CLI installation method.

```bash
npm install @radix-ui/react-switch
```

--------------------------------

### Install Shadcn Pagination component via CLI (Bash)

Source: https://ui.shadcn.com/docs/components/pagination

This command demonstrates how to install the Shadcn UI pagination component using its command-line interface. Running this command adds the necessary component files and dependencies to your project, preparing it for use.

```bash
npx shadcn@latest add pagination
```

--------------------------------

### Install Single Resource via Namespace

Source: https://ui.shadcn.com/docs/registry/namespace

Install a single resource from a namespaced registry using the CLI. The command references the namespace prefix and resource name, which are resolved to the configured registry URL.

```bash
npx shadcn@latest add @v0/dashboard
```

--------------------------------

### Import and Use Button Component in Route

Source: https://ui.shadcn.com/docs/installation/tanstack-router

Demonstrates how to import the shadcn/ui Button component in a TanStack Router route file and render it within the App component. The example shows the file-router pattern with component export and route configuration.

```tsx
import { createFileRoute } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/")({ 
  component: App,
})

function App() {
  return (
    <div>
      <Button>Click me</Button>
    </div>
  )
}
```

--------------------------------

### Install Tooltip via shadcn CLI

Source: https://ui.shadcn.com/docs/components/tooltip

Command-line installation method for adding the Tooltip component to a shadcn/ui project. This is the recommended approach for quickly adding pre-configured component files.

```bash
npx shadcn@latest add tooltip
```

--------------------------------

### Install Shadcn UI Select component using CLI

Source: https://ui.shadcn.com/docs/components/select

This `bash` command provides the quickest way to add the Shadcn UI Select component to your project using the `shadcn@latest` CLI tool. It handles component files and dependencies automatically.

```bash
npx shadcn@latest add select
```

--------------------------------

### Install Popover Dependencies via npm

Source: https://ui.shadcn.com/docs/components/popover

npm command to install the required Radix UI popover dependency for manual installation. Use this when manually setting up the component without the CLI.

```bash
npm install @radix-ui/react-popover
```

--------------------------------

### Environment Variables Setup

Source: https://ui.shadcn.com/docs/registry/authentication

Set registry authentication token in .env.local file. This stores the secret token that will be used for Bearer authentication when accessing private component registries.

```bash
REGISTRY_TOKEN=your_secret_token_here
```

--------------------------------

### Basic Empty State Demo with Project Icon

Source: https://ui.shadcn.com/docs/components/empty

Complete example demonstrating a basic empty state with header containing icon media, title, and description, plus action buttons in the content area. Uses Tabler and Lucide icons for visual elements.

```tsx
import { IconFolderCode } from "@tabler/icons-react"
import { ArrowUpRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function EmptyDemo() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconFolderCode />
        </EmptyMedia>
        <EmptyTitle>No Projects Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any projects yet. Get started by creating
          your first project.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button>Create Project</Button>
          <Button variant="outline">Import Project</Button>
        </div>
      </EmptyContent>
      <Button
        variant="link"
        asChild
        className="text-muted-foreground"
        size="sm"
      >
        <a href="#">
          Learn More <ArrowUpRightIcon />
        </a>
      </Button>
    </Empty>
  )
}
```

--------------------------------

### Create TanStack Router Project with shadcn/ui

Source: https://ui.shadcn.com/docs/installation/tanstack-router

Initialize a new TanStack Router project with file-based routing, Tailwind CSS, and shadcn/ui add-ons pre-configured. This command sets up the complete project structure with necessary dependencies and configurations.

```bash
npx create-tsrouter-app@latest my-app --template file-router --tailwind --add-ons shadcn
```

--------------------------------

### Install Radix UI React Aspect Ratio Dependency (NPM)

Source: https://ui.shadcn.com/docs/components/aspect-ratio

This `npm` command installs the core `@radix-ui/react-aspect-ratio` package, which is a foundational dependency for the Shadcn UI Aspect Ratio component. It's a crucial step during manual installation to bring in the primitive component logic.

```bash
npm install @radix-ui/react-aspect-ratio
```

--------------------------------

### Create a Basic shadcn Component in TSX

Source: https://ui.shadcn.com/docs/registry/getting-started

This TypeScript React (TSX) code defines a simple `HelloWorld` component that renders a button with 'Hello World' text. It imports the `Button` component from a local UI library, demonstrating how to structure a component intended for the shadcn registry.

```tsx
import { Button } from "@/components/ui/button"

export function HelloWorld() {
  return <Button>Hello World</Button>
}
```

--------------------------------

### Install Dropdown Menu via CLI

Source: https://ui.shadcn.com/docs/components/dropdown-menu

Installs the dropdown menu component using the shadcn CLI tool. This command downloads and configures the dropdown menu component with all its dependencies automatically.

```bash
npx shadcn@latest add dropdown-menu
```

--------------------------------

### Create custom style extending shadcn/ui

Source: https://ui.shadcn.com/docs/registry/examples

Define a custom registry style that extends shadcn/ui by installing dependencies, adding registry dependencies (components and remote blocks), and configuring CSS variables for fonts and brand colors in light and dark modes. This configuration is applied when running `npx shadcn init`.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "example-style",
  "type": "registry:style",
  "dependencies": ["@tabler/icons-react"],
  "registryDependencies": [
    "login-01",
    "calendar",
    "https://example.com/r/editor.json"
  ],
  "cssVars": {
    "theme": {
      "font-sans": "Inter, sans-serif"
    },
    "light": {
      "brand": "20 14.3% 4.1%"
    },
    "dark": {
      "brand": "20 14.3% 4.1%"
    }
  }
}
```

--------------------------------

### Example Shadcn UI Registry Configuration (JSON)

Source: https://ui.shadcn.com/docs/registry/registry-index

This JSON configuration demonstrates a valid structure for a Shadcn UI registry. It includes a schema reference, the registry's name and homepage, and an array of items, each representing a component or example with its type, title, description, and associated file paths. This structure adheres to the specified registry schema requirements.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "acme",
  "homepage": "https://acme.com",
  "items": [
    {
      "name": "login-form",
      "type": "registry:component",
      "title": "Login Form",
      "description": "A login form component.",
      "files": [
        {
          "path": "registry/new-york/auth/login-form.tsx",
          "type": "registry:component"
        }
      ]
    },
    {
      "name": "example-login-form",
      "type": "registry:component",
      "title": "Example Login Form",
      "description": "An example showing how to use the login form component.",
      "files": [
        {
          "path": "registry/new-york/examples/example-login-form.tsx",
          "type": "registry:component"
        }
      ]
    }
  ]
}
```

--------------------------------

### Install Shadcn Button Component (CLI)

Source: https://ui.shadcn.com/docs/components/button

Provides instructions for installing the Shadcn UI button component using the command-line interface. This command automatically adds the component files and dependencies to your project.

```bash
npx shadcn@latest add button
```

--------------------------------

### Install Radix UI Toggle Dependency (npm)

Source: https://ui.shadcn.com/docs/components/toggle

Installs the core `@radix-ui/react-toggle` dependency required for the Shadcn UI Toggle component using npm. This is part of the manual installation process.

```bash
npm install @radix-ui/react-toggle
```

--------------------------------

### Install shadcn/ui Calendar via CLI

Source: https://ui.shadcn.com/docs/components/calendar

Installs the shadcn/ui Calendar component and its dependencies into your project using the shadcn CLI command. This is the recommended and easiest way to add the component.

```bash
npx shadcn@latest add calendar
```

--------------------------------

### Configure Plugin with NPM Dependencies in shadcn UI

Source: https://ui.shadcn.com/docs/registry/examples

Shows how to include external npm packages as dependencies when using Tailwind CSS plugins. The `dependencies` array declares required packages, while the `css` object configures both the plugin and custom CSS layers. This pattern ensures all required packages are installed before the component is used.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "typography-component",
  "type": "registry:item",
  "dependencies": ["@tailwindcss/typography"],
  "css": {
    "@plugin \"@tailwindcss/typography\"": {},
    "@layer components": {
      ".prose": {
        "max-width": "65ch"
      }
    }
  }
}
```

--------------------------------

### Define Universal Registry Item for ESLint Configuration (shadcn/ui)

Source: https://ui.shadcn.com/docs/registry/examples

This JSON configuration defines a shadcn/ui registry item named 'my-eslint-config' for a custom ESLint configuration. It specifies a single file with an explicit target path (~/.eslintrc.json), enabling universal installation of the ESLint config file without framework dependencies.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "my-eslint-config",
  "type": "registry:item",
  "files": [
    {
      "path": "/path/to/your/registry/default/custom-eslint.json",
      "type": "registry:file",
      "target": "~/.eslintrc.json",
      "content": "..."
    }
  ]
}
```

--------------------------------

### Install Sonner Dependencies Manually

Source: https://ui.shadcn.com/docs/components/sonner

Manual npm installation of Sonner and next-themes dependencies. Use this method when you prefer to manually configure the component instead of using the CLI installation.

```bash
npm install sonner next-themes
```

--------------------------------

### Install React Resizable Panels Dependency

Source: https://ui.shadcn.com/docs/components/resizable

Manually installs the react-resizable-panels npm package, which is the underlying library that powers the Resizable component. Required when manually setting up the component.

```bash
npm install react-resizable-panels
```

--------------------------------

### Install Shadcn UI Toggle Component via CLI (Bash)

Source: https://ui.shadcn.com/docs/components/toggle

Installs the Shadcn UI Toggle component into your project using the Shadcn CLI. This command automatically adds the component's files and dependencies.

```bash
npx shadcn@latest add toggle
```

--------------------------------

### Complete registry.json Schema Structure

Source: https://ui.shadcn.com/docs/registry/registry-json

Full example of a registry.json file showing all main properties including schema reference, registry metadata, and component items with dependencies and file definitions. This demonstrates the complete structure needed to set up a custom component registry.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "shadcn",
  "homepage": "https://ui.shadcn.com",
  "items": [
    {
      "name": "hello-world",
      "type": "registry:block",
      "title": "Hello World",
      "description": "A simple hello world component.",
      "registryDependencies": [
        "button",
        "@acme/input-form",
        "https://example.com/r/foo"
      ],
      "dependencies": ["is-even@3.0.0", "motion"],
      "files": [
        {
          "path": "registry/new-york/hello-world/hello-world.tsx",
          "type": "registry:component"
        }
      ]
    }
  ]
}
```

--------------------------------

### Install next-themes dependency

Source: https://ui.shadcn.com/docs/dark-mode/next

Installs the `next-themes` library, a dependency required for implementing dark mode functionality in Next.js applications.

```bash
npm install next-themes
```

--------------------------------

### Install Menubar Dependencies Manually

Source: https://ui.shadcn.com/docs/components/menubar

Installs the Radix UI menubar primitive dependency required for the menubar component to function. Use this when manually setting up the component instead of using the CLI.

```bash
npm install @radix-ui/react-menubar
```

--------------------------------

### Install Shadcn UI Textarea component using CLI (Bash)

Source: https://ui.shadcn.com/docs/components/textarea

Installs the Shadcn UI Textarea component into your project using the `npx shadcn@latest add` command. This command automatically fetches and configures the necessary component files and dependencies.

```bash
npx shadcn@latest add textarea
```

--------------------------------

### Install Radix UI Separator dependency manually

Source: https://ui.shadcn.com/docs/components/separator

This command installs the `@radix-ui/react-separator` package, which is a dependency for the Shadcn UI Separator component during manual installation. It ensures the core primitive is available for use. This step is crucial before copying the component source.

```bash
npm install @radix-ui/react-separator
```

--------------------------------

### shadcn CLI: Initialize and Add Components from Local Files

Source: https://ui.shadcn.com/docs/changelog

The shadcn CLI now supports initializing projects and adding components, themes, hooks, or utils directly from local JSON files. This enables zero-setup workflows, faster local testing, and enhanced capabilities for agents and private components.

```bash
npx shadcn init ./template.json
```

```bash
npx shadcn add ./block.json
```

--------------------------------

### Create new React project with Vite

Source: https://ui.shadcn.com/docs/installation/vite

Initializes a new React project using Vite. This command uses the latest version of Vite and allows selecting the 'React + TypeScript' template during the interactive setup process.

```bash
npm create vite@latest
```

--------------------------------

### Add Components with add Command

Source: https://ui.shadcn.com/docs/cli

The add command installs specific components and their dependencies into your project. It supports single or multiple component installation, file overwriting, and path customization.

```bash
npx shadcn@latest add [component]
```

```bash
Usage: shadcn add [options] [components...]

add a component to your project

Arguments:
  components         name, url or local path to component

Options:
  -y, --yes           skip confirmation prompt. (default: false)
  -o, --overwrite     overwrite existing files. (default: false)
  -c, --cwd <cwd>     the working directory. defaults to the current directory.
  -a, --all           add all available components (default: false)
  -p, --path <path>   the path to add the component to.
  -s, --silent        mute output. (default: false)
  --src-dir           use the src directory when creating a new project. (default: false)
  --no-src-dir        do not use the src directory when creating a new project.
  --css-variables     use css variables for theming. (default: true)
  --no-css-variables  do not use css variables for theming.
  -h, --help          display help for command
```

--------------------------------

### Add Environment Variables to Registry Item JSON

Source: https://ui.shadcn.com/docs/registry/registry-item-json

This JSON configuration specifies environment variables to be added to a project's `.env.local` or `.env` file upon installation. It's intended for development or example variables, and existing variables are not overwritten. Users are cautioned against using this for production environment variables.

```json
{
  "envVars": {
    "NEXT_PUBLIC_APP_URL": "http://localhost:4000",
    "DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/postgres",
    "OPENAI_API_KEY": ""
  }
}
```

--------------------------------

### Import and Use shadcn/ui Switch Component in React

Source: https://ui.shadcn.com/docs/installation/laravel

Import and render the Switch component in a React page component within a Laravel Inertia application. The component is imported from the generated ui directory and can be used like any other React component.

```typescript
import { Switch } from "@/components/ui/switch"

const MyPage = () => {
  return (
    <div>
      <Switch />
    </div>
  )
}

export default MyPage
```

--------------------------------

### Configure components.json for shadcn/ui Project Setup

Source: https://ui.shadcn.com/docs/changelog

Configuration file for shadcn/ui project setup that defines styling preferences, Tailwind CSS configuration paths, and component/utility aliases. This file should be placed at the project root and customized to match your specific project structure and paths.

```json
{
  "style": "default",
  "rsc": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

--------------------------------

### Install Shadcn Button Component Dependencies Manually (NPM)

Source: https://ui.shadcn.com/docs/components/button

Installs the required `@radix-ui/react-slot` dependency for the Shadcn button component manually. This is the initial step when performing a manual installation, followed by copying the component's source code.

```bash
npm install @radix-ui/react-slot
```

--------------------------------

### Install Multiple Resources from Different Namespaces

Source: https://ui.shadcn.com/docs/registry/namespace

Install multiple resources from different namespaced registries in a single command. This allows combining resources from various sources (v0, acme, lib, ai) in one operation.

```bash
npx shadcn@latest add @acme/header @lib/auth-utils @ai/chatbot-rules
```

--------------------------------

### Install NavigationMenu Dependencies Manually

Source: https://ui.shadcn.com/docs/components/navigation-menu

Manual installation of the Radix UI navigation menu dependency. Use this approach if you prefer not to use the CLI or need to manage dependencies explicitly.

```bash
npm install @radix-ui/react-navigation-menu
```

--------------------------------

### Create New Astro Project with TailwindCSS

Source: https://ui.shadcn.com/docs/installation/astro

Creates a new Astro project with TailwindCSS, React support, and Git initialization. This command scaffolds the base project structure needed for shadcn/ui integration.

```bash
npx create-astro@latest astro-app  --template with-tailwindcss --install --add react --git
```

--------------------------------

### Install Toggle Group Dependencies

Source: https://ui.shadcn.com/docs/components/toggle-group

NPM installation command for the Radix UI toggle group primitive. Required as a dependency when manually installing the toggle group component instead of using the CLI method.

```bash
npm install @radix-ui/react-toggle-group
```

--------------------------------

### Define Universal Registry Item for Python Cursor Rules (shadcn/ui)

Source: https://ui.shadcn.com/docs/registry/examples

This JSON configuration defines a shadcn/ui registry item named 'python-rules' for custom Cursor rules. It specifies a single file with an explicit target path (~/.cursor/rules/custom-python.mdc), allowing the rule file to be installed universally without framework detection.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "python-rules",
  "type": "registry:item",
  "files": [
    {
      "path": "/path/to/your/registry/default/custom-python.mdc",
      "type": "registry:file",
      "target": "~/.cursor/rules/custom-python.mdc",
      "content": "..."
    }
  ]
}
```

--------------------------------

### Install Breadcrumb Component via CLI

Source: https://ui.shadcn.com/docs/components/breadcrumb

Command to install the breadcrumb component and its dependencies using the shadcn/ui CLI tool. This is the recommended installation method.

```bash
npx shadcn@latest add breadcrumb
```

--------------------------------

### Install Checkbox Component - CLI

Source: https://ui.shadcn.com/docs/components/checkbox

Command-line interface installation of the checkbox component using shadcn/ui CLI tool. Automatically adds the component and its dependencies to the project.

```bash
npx shadcn@latest add checkbox
```

--------------------------------

### Install Latest input-otp Package - Bash

Source: https://ui.shadcn.com/docs/components/input-otp

Updates the input-otp package to the latest version to support the new composition pattern and additional features. Run this command in your project directory.

```bash
npm install input-otp@latest
```

--------------------------------

### Example Output for `npx shadcn diff` Listing Available Updates

Source: https://ui.shadcn.com/docs/changelog

This text output shows the result of running the `npx shadcn diff` command, indicating which components have updates pending. It lists the component name and the paths to its associated files, such as `button` and `toast` components.

```txt
The following components have updates available:
- button
  - /path/to/my-app/components/ui/button.tsx
- toast
  - /path/to/my-app/components/ui/use-toast.ts
  - /path/to/my-app/components/ui/toaster.tsx
```

--------------------------------

### Install Popover Component via CLI

Source: https://ui.shadcn.com/docs/components/popover

Command to install the Popover component using the shadcn CLI tool. This is the quickest way to add the component to a shadcn/ui project.

```bash
npx shadcn@latest add popover
```

--------------------------------

### Install Toggle Group via CLI

Source: https://ui.shadcn.com/docs/components/toggle-group

Command-line installation method for adding the toggle group component to a shadcn project. This is the quickest way to set up the component with all necessary dependencies.

```bash
npx shadcn@latest add toggle-group
```

--------------------------------

### Install Alert Dialog Dependency - Bash

Source: https://ui.shadcn.com/docs/components/alert-dialog

Install the @radix-ui/react-alert-dialog package manually. Use this approach when setting up the component without the shadcn CLI tool.

```bash
npm install @radix-ui/react-alert-dialog
```

--------------------------------

### Install Alert Dialog via CLI - Bash

Source: https://ui.shadcn.com/docs/components/alert-dialog

Install the Alert Dialog component using the shadcn CLI tool. This command downloads and sets up the component with all dependencies automatically configured for your project.

```bash
npx shadcn@latest add alert-dialog
```

--------------------------------

### Install shadcn/ui Slider component via CLI (Bash)

Source: https://ui.shadcn.com/docs/components/slider

Use the shadcn/ui command-line interface to quickly add the Slider component and its dependencies to your project. This command streamlines the installation process by fetching the component files.

```bash
npx shadcn@latest add slider
```

--------------------------------

### CLI npx shadcn@latest view

Source: https://ui.shadcn.com/docs/registry/namespace

Inspects the details of registry items before installation. This command provides comprehensive information including metadata, dependencies, file contents, CSS variables, Tailwind configuration, and required environment variables.

```APIDOC
## CLI npx shadcn@latest view

### Description
Inspects the details of registry items before installation. This command provides comprehensive information including metadata, dependencies, file contents, CSS variables, Tailwind configuration, and required environment variables.

### Method
CLI

### Endpoint
`npx shadcn@latest view [resource_identifier...]`

### Parameters
#### Path Parameters
- **resource_identifier** (string) - Required - One or more identifiers for the resource(s) to view. This can be a registry-prefixed name (e.g., `@acme/button`), or a direct URL to a `.json` file.

#### Query Parameters
(None)

#### Request Body
(Not applicable for CLI command)

### Request Example
```bash
npx shadcn@latest view @acme/button
npx shadcn@latest view @v0/dashboard @shadcn/card
npx shadcn@latest view https://registry.example.com/button.json
```

### Response
#### Success Response (CLI Output)
The command outputs detailed information about the requested resource(s) to the console.

#### Response Example
```txt
--- Resource Metadata ---
Name: button
Type: registry:ui
Description: A customizable button component.

--- Dependencies ---
- @shadcn/ui/utils

--- File Contents ---
// components/ui/button.tsx
// ... (file content)

--- Tailwind Configuration ---
// tailwind.config.js
// ... (tailwind config)

--- Environment Variables ---
(None)
```
```

--------------------------------

### Install Radix UI Dialog Dependency

Source: https://ui.shadcn.com/docs/components/sheet

NPM installation command for the @radix-ui/react-dialog package, which is the underlying dependency for the Sheet component.

```bash
npm install @radix-ui/react-dialog
```

--------------------------------

### List All Items from a Registry

Source: https://ui.shadcn.com/docs/changelog

Display all available components from a specified registry. This command provides a complete inventory of components available in a particular namespace, helping users discover all options.

```bash
npx shadcn list @acme
```

--------------------------------

### Install Shadcn Collapsible Component via CLI

Source: https://ui.shadcn.com/docs/components/collapsible

This command-line interface instruction shows how to quickly add the Shadcn UI Collapsible component to your project using the `shadcn` CLI tool. It streamlines the installation process by fetching and configuring the component automatically, including its dependencies and boilerplate code.

```bash
npx shadcn@latest add collapsible
```

--------------------------------

### Manually install Radix UI Tabs dependency for Shadcn

Source: https://ui.shadcn.com/docs/components/tabs

For manual integration of Shadcn UI Tabs, this command installs the foundational `@radix-ui/react-tabs` package. This dependency provides the core unstyled primitive functionality that Shadcn UI builds upon.

```bash
npm install @radix-ui/react-tabs
```

--------------------------------

### Adding Custom Tailwind Colors

Source: https://ui.shadcn.com/docs/registry/faq

JSON configuration showing how to add custom Tailwind color variables for both light and dark themes using the cssVars property.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "hello-world",
  "title": "Hello World",
  "type": "registry:block",
  "description": "A complex hello world component",
  "files": [
    // ...
  ],
  "cssVars": {
    "light": {
      "brand-background": "20 14.3% 4.1%",
      "brand-accent": "20 14.3% 4.1%"
    },
    "dark": {
      "brand-background": "20 14.3% 4.1%",
      "brand-accent": "20 14.3% 4.1%"
    }
  }
}
```

--------------------------------

### Install Shadcn UI Field Component via CLI

Source: https://ui.shadcn.com/docs/components/field

Installs the Shadcn UI Field component using the command-line interface. This command automatically adds the necessary files and dependencies to your project.

```bash
npx shadcn@latest add field
```

--------------------------------

### Get Carousel API Instance and Track State

Source: https://ui.shadcn.com/docs/components/carousel

Initialize carousel state management using setApi prop to obtain a CarouselApi instance. This allows tracking the current slide position and total slide count through React state and useEffect hooks. The example renders a carousel with numbered items and displays the current slide information.

```tsx
"use client"

import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

export function CarouselDApiDemo() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <div className="mx-auto max-w-xs">
      <Carousel setApi={setApi} className="w-full max-w-xs">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index}>
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-4xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="text-muted-foreground py-2 text-center text-sm">
        Slide {current} of {count}
      </div>
    </div>
  )
}
```

--------------------------------

### Basic Usage of Shadcn UI Progress Component

Source: https://ui.shadcn.com/docs/components/progress

These snippets demonstrate the fundamental steps to use the `Progress` component in a React/TypeScript application. The first example shows how to import the `Progress` component from its module, making it available for use. The second example illustrates rendering the component with a hardcoded `value` prop, displaying a static progress indicator.

```tsx
import { Progress } from "@/components/ui/progress"
```

```tsx
<Progress value={33} />
```

--------------------------------

### Install Radix UI Collapsible Dependency Manually

Source: https://ui.shadcn.com/docs/components/collapsible

This command installs the core `@radix-ui/react-collapsible` package, which is a prerequisite for manually setting up the Collapsible component in a React project. It ensures that the fundamental primitive is available for use, allowing for custom implementation.

```bash
npm install @radix-ui/react-collapsible
```

--------------------------------

### Install ScrollArea Dependencies - Bash

Source: https://ui.shadcn.com/docs/components/scroll-area

Manually installs the required Radix UI scroll area package via npm. Used as part of the manual installation process when the CLI method is not available or preferred.

```bash
npm install @radix-ui/react-scroll-area
```

--------------------------------

### Install Calendar Dependencies Manually

Source: https://ui.shadcn.com/docs/components/calendar

Manually installs the core third-party dependencies required for the shadcn/ui Calendar component, specifically react-day-picker and date-fns, using npm.

```bash
npm install react-day-picker date-fns
```

--------------------------------

### shadcn: radix-ui Migration Import Change Example

Source: https://ui.shadcn.com/docs/changelog

This `diff` example illustrates the effect of the `radix-ui` migration command on component imports. It shows how `@radix-ui/react-dialog` is replaced with an import from `radix-ui`, specifically aliasing `AlertDialog` as `AlertDialogPrimitive`.

```diff
- import * as AlertDialogPrimitive from "@radix-ui/react-dialog"
+ import { AlertDialog as AlertDialogPrimitive } from "radix-ui"
```

--------------------------------

### Install Radix UI Avatar Dependency - Bash npm

Source: https://ui.shadcn.com/docs/components/avatar

Installs the @radix-ui/react-avatar package, which is the underlying primitive dependency for the shadcn/ui Avatar component. Required when manually installing the component.

```bash
npm install @radix-ui/react-avatar
```

--------------------------------

### Install Input Group - CLI (bash)

Source: https://ui.shadcn.com/docs/components/input-group

Command to scaffold the input-group component using the shadcn CLI. Dependencies: Node.js and network access to install and run the npx package; Input: runs in project root; Output: adds component files to your project. Limitation: requires shadcn CLI and may need manual path adjustments after scaffolding.

```bash
npx shadcn@latest add input-group

```

--------------------------------

### Scoped and File-Based Plugin Configuration

Source: https://ui.shadcn.com/docs/registry/examples

Demonstrates how to configure scoped npm packages, Tailwind plugin utilities, and local file-based plugins in a single registry item. Supports npm scoped packages like `@headlessui/tailwindcss`, core Tailwind plugin utilities, and relative file paths for custom plugins.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "scoped-plugins",
  "type": "registry:component",
  "css": {
    "@plugin \"@headlessui/tailwindcss\"": {},
    "@plugin \"tailwindcss/plugin\"": {},
    "@plugin \"./custom-plugin.js\"": {}
  }
}
```

--------------------------------

### Install Radix UI Radio Group Dependency with npm

Source: https://ui.shadcn.com/docs/components/radio-group

This command illustrates the manual installation of the `@radix-ui/react-radio-group` dependency using npm. This is a prerequisite for integrating the Radix UI Radio Group primitive into your project.

```bash
npm install @radix-ui/react-radio-group
```

--------------------------------

### Import and Render shadcn/ui Button in TanStack Start (TSX)

Source: https://ui.shadcn.com/docs/installation/tanstack

This TypeScript React (TSX) code demonstrates how to import and render the `Button` component, previously added via the shadcn/ui CLI, within a TanStack Start application. It showcases basic component usage in a functional React component, integrating UI elements into the application's view.

```tsx
import { Button } from "@/components/ui/button"

function App() {
  return (
    <div>
      <Button>Click me</Button>
    </div>
  )
}
```

--------------------------------

### Install Custom Button Component via shadcn CLI

Source: https://ui.shadcn.com/docs/registry/namespace

Command to install a custom component version from a namespaced registry using the shadcn CLI. This overrides the original vendor version with custom configurations.

```bash
npx shadcn@latest add @my-company/custom-button
```

--------------------------------

### Basic Table Structure Usage

Source: https://ui.shadcn.com/docs/components/table

Minimal example showing how to structure a Table with header, body, and a single row of data. Demonstrates the basic layout without data mapping.

```tsx
<Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>Credit Card</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

--------------------------------

### Configure Initial CSS Variables with @theme Directive

Source: https://ui.shadcn.com/docs/tailwind-v4

This CSS snippet demonstrates the initial setup of CSS variables within a `@layer base` block, and their referencing under the `@theme` directive. It shows how `hsl` wrappers are directly applied to the theme variables.

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
  }
}

@theme {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
}
```

--------------------------------

### Complete Collapsible Sidebar Example with Inset Header (TypeScript/React)

Source: https://ui.shadcn.com/docs/components/sidebar

This comprehensive example presents a fully functional collapsible sidebar, integrating `SidebarProvider`, `Sidebar`, `SidebarContent`, and navigation menus. It also includes `SidebarInset` to define a distinct header area within the layout, which houses the `SidebarTrigger` for toggling the sidebar's visibility.

```tsx
"use client"

import {
  CalendarIcon,
  HomeIcon,
  InboxIcon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: HomeIcon,
  },
  {
    title: "Inbox",
    url: "#",
    icon: InboxIcon,
  },
  {
    title: "Calendar",
    url: "#",
    icon: CalendarIcon,
  },
  {
    title: "Search",
    url: "#",
    icon: SearchIcon,
  },
  {
    title: "Settings",
    url: "#",
    icon: SettingsIcon,
  },
]

export function AppSidebar() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center justify-between px-4">
          <SidebarTrigger />
        </header>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

--------------------------------

### Install Shadcn UI Skeleton Component via CLI (Bash)

Source: https://ui.shadcn.com/docs/components/skeleton

This `bash` command facilitates the quick integration of the Shadcn UI Skeleton component into your project. Execute this command in your terminal to automatically add the necessary files and configurations.

```bash
npx shadcn@latest add skeleton
```

--------------------------------

### Configure PostCSS for Remix

Source: https://ui.shadcn.com/docs/installation/remix

Create a postcss.config.js file that configures Tailwind CSS and Autoprefixer plugins for processing CSS in your Remix application.

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

--------------------------------

### Add Component from Shadcn Registry CLI

Source: https://ui.shadcn.com/docs/changelog

This command demonstrates how to use the Shadcn CLI to add a component from a registered registry. It automatically installs the specified component, `@ai-elements/prompt-input`, and updates the project's `components.json` file, simplifying component integration.

```bash
npx shadcn add @ai-elements/prompt-input
```

--------------------------------

### Add Complex Utility with Pseudo-selectors in shadcn/ui

Source: https://ui.shadcn.com/docs/registry/examples

Create advanced utility classes with pseudo-selectors and nested rules to handle complex styling patterns like custom scrollbar hiding across different browsers.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "custom-component",
  "type": "registry:component",
  "css": {
    "@utility scrollbar-hidden": {
      "scrollbar-hidden": {
        "&::-webkit-scrollbar": {
          "display": "none"
        }
      }
    }
  }
}
```

--------------------------------

### Install Radix UI Dropdown Menu Dependency

Source: https://ui.shadcn.com/docs/components/dropdown-menu

Installs the @radix-ui/react-dropdown-menu package via npm. This is the underlying Radix UI primitive that provides the accessible dropdown menu functionality.

```bash
npm install @radix-ui/react-dropdown-menu
```

--------------------------------

### Add shadcn/ui Button Component to Next.js

Source: https://ui.shadcn.com/docs/installation/next

Install the Button component from shadcn/ui into your project using the add command. This generates the component files in your project structure, making them available for import and use.

```bash
npx shadcn@latest add button
```

--------------------------------

### Install shadcn/ui Hover Card Component via CLI

Source: https://ui.shadcn.com/docs/components/hover-card

This command uses the shadcn/ui CLI to automatically add the Hover Card component and its dependencies to your project. It simplifies the installation process by handling file generation and configuration.

```bash
npx shadcn@latest add hover-card
```

--------------------------------

### Add Media Query CSS Imports in shadcn/ui

Source: https://ui.shadcn.com/docs/registry/examples

Conditionally import stylesheets using media query syntax to load styles based on device type and screen dimensions, enabling responsive stylesheet management.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "responsive-import",
  "type": "registry:item",
  "css": {
    "@import \"print-styles.css\" print": {},
    "@import url(\"mobile.css\") screen and (max-width: 768px)": {}
  }
}
```

--------------------------------

### Import UI Components from Monorepo Package

Source: https://ui.shadcn.com/docs/monorepo

Import shadcn/ui components from the @workspace/ui package using the configured aliases. Components are accessed through the ui alias pointing to the shared components directory.

```typescript
import { Button } from "@workspace/ui/components/button"
```

--------------------------------

### Manually Install Form Dependencies

Source: https://ui.shadcn.com/docs/components/form

This command lists the essential npm packages required for manually installing the form component. These dependencies include `@radix-ui/react-label`, `@radix-ui/react-slot`, `react-hook-form`, `@hookform/resolvers`, and `zod`, which are crucial for the component's functionality and validation capabilities.

```bash
npm install @radix-ui/react-label @radix-ui/react-slot react-hook-form @hookform/resolvers zod
```

--------------------------------

### Install TanStack Table and shadcn Table Component

Source: https://ui.shadcn.com/docs/components/data-table

Installation commands to add the shadcn Table component and TanStack React Table dependency to your project. These commands set up the necessary libraries for building data tables.

```bash
npx shadcn@latest add table
```

```bash
npm install @tanstack/react-table
```

--------------------------------

### Install Shadcn UI Calendar Blocks with `shadcn@latest` CLI

Source: https://ui.shadcn.com/docs/components/calendar

After updating the main Calendar component, use this `npx` command to install specific new or updated calendar blocks, such as `calendar-02`. This command utilizes the `shadcn@latest` CLI to add additional UI components or features related to the calendar to your project. Ensure the core Calendar component is up-to-date before running this.

```bash
npx shadcn@latest add calendar-02
```

--------------------------------

### CLI Installation for Button Group

Source: https://ui.shadcn.com/docs/components/button-group

Provides the command-line interface (CLI) instruction to add the Button Group component to a project using shadcn/ui. This simplifies component integration by automating dependency management.

```bash
npx shadcn@latest add button-group
```

--------------------------------

### Provide Documentation Message for Registry Item in JSON

Source: https://ui.shadcn.com/docs/registry/registry-item-json

This JSON snippet allows for a custom documentation message to be displayed when a registry item is installed via the CLI. It's useful for providing specific instructions or important notes to the user, enhancing the installation experience.

```json
{
  "docs": "To get an OPENAI_API_KEY, sign up for an account at https://platform.openai.com."
}
```

--------------------------------

### Basic Popover Usage

Source: https://ui.shadcn.com/docs/components/popover

Minimal example showing how to create a popover with a trigger element and content. The PopoverTrigger opens the popover and PopoverContent displays the content in a portal.

```tsx
<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>Place content for the popover here.</PopoverContent>
</Popover>
```

--------------------------------

### Install Radix UI Checkbox Dependency - npm

Source: https://ui.shadcn.com/docs/components/checkbox

Manual installation of the Radix UI React checkbox primitive dependency. Required when manually setting up the checkbox component instead of using the CLI.

```bash
npm install @radix-ui/react-checkbox
```

--------------------------------

### Create Gatsby Project

Source: https://ui.shadcn.com/docs/installation/gatsby

Initialize a new Gatsby project using the create-gatsby command. This sets up the basic project structure and dependencies required for a Gatsby application.

```bash
npm init gatsby
```

--------------------------------

### Wrap React Application Root with Theme Provider in Vite

Source: https://ui.shadcn.com/docs/dark-mode/vite

This example demonstrates how to integrate the `ThemeProvider` component into the root of a React application. By wrapping the main application content, `children`, with `ThemeProvider`, all nested components gain access to the theme context. It allows for setting an initial `defaultTheme` and a `storageKey` for persisting theme preferences in local storage.

```tsx
import { ThemeProvider } from "@/components/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {children}
    </ThemeProvider>
  )
}

export default App
```

--------------------------------

### Render Dynamic SidebarMenu with Projects in TSX

Source: https://ui.shadcn.com/docs/components/sidebar

This example demonstrates how to construct a complete sidebar menu using `SidebarProvider`, `Sidebar`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, and `SidebarMenuButton`. It dynamically renders a list of project items with icons and links, showcasing a full implementation of the sidebar structure.

```tsx
"use client"\n\nimport {\n  FrameIcon,\n  LifeBuoyIcon,\n  MapIcon,\n  PieChartIcon,\n  SendIcon,\n} from "lucide-react"\n\nimport {\n  Sidebar,\n  SidebarContent,\n  SidebarGroup,\n  SidebarGroupContent,\n  SidebarGroupLabel,\n  SidebarMenu,\n  SidebarMenuButton,\n  SidebarMenuItem,\n  SidebarProvider,\n} from "@/components/ui/sidebar"\n\nconst projects = [\n  {\n    name: "Design Engineering",\n    url: "#",\n    icon: FrameIcon,\n  },\n  {\n    name: "Sales & Marketing",\n    url: "#",\n    icon: PieChartIcon,\n  },\n  {\n    name: "Travel",\n    url: "#",\n    icon: MapIcon,\n  },\n  {\n    name: "Support",\n    url: "#",\n    icon: LifeBuoyIcon,\n  },\n  {\n    name: "Feedback",\n    url: "#",\n    icon: SendIcon,\n  },\n]\n\nexport function AppSidebar() {\n  return (\n    <SidebarProvider>\n      <Sidebar>\n        <SidebarContent>\n          <SidebarGroup>\n            <SidebarGroupLabel>Projects</SidebarGroupLabel>\n            <SidebarGroupContent>\n              <SidebarMenu>\n                {projects.map((project) => (\n                  <SidebarMenuItem key={project.name}>\n                    <SidebarMenuButton asChild>\n                      <a href={project.url}>\n                        <project.icon />\n                        <span>{project.name}</span>\n                      </a>\n                    </SidebarMenuButton>\n                  </SidebarMenuItem>\n                ))}\n              </SidebarMenu>\n            </SidebarGroupContent>\n          </SidebarGroup>\n        </SidebarContent>\n      </Sidebar>\n    </SidebarProvider>\n  )\n}\n
```

--------------------------------

### Overriding Tailwind Theme Variables

Source: https://ui.shadcn.com/docs/registry/faq

JSON configuration demonstrating how to add or override Tailwind theme variables including text size, easing functions, and font families.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "hello-world",
  "title": "Hello World",
  "type": "registry:block",
  "description": "A complex hello world component",
  "files": [
    // ...
  ],
  "cssVars": {
    "theme": {
      "text-base": "3rem",
      "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
      "font-heading": "Poppins, sans-serif"
    }
  }
}
```

--------------------------------

### Define Registry URL with Style Placeholder (JSON)

Source: https://ui.shadcn.com/docs/registry/namespace

This example demonstrates the optional `{style}` placeholder in a registry URL. This placeholder is replaced with the currently configured style, enabling the registry to serve different versions of resources based on the user's styling preferences. It's useful for providing style-specific component variations.

```json
{
  "@themes": "https://registry.example.com/{style}/{name}.json"
}
```

--------------------------------

### Install Tailwind CSS dependencies

Source: https://ui.shadcn.com/docs/installation/vite

Installs Tailwind CSS and its Vite plugin as project dependencies. This step is necessary to integrate Tailwind CSS into the Vite build process, enabling utility-first styling.

```bash
npm install tailwindcss @tailwindcss/vite
```

--------------------------------

### Install Avatar Component - Bash CLI

Source: https://ui.shadcn.com/docs/components/avatar

Installs the Avatar component from shadcn/ui using the CLI tool. This command automatically downloads and adds the component to the project's component library.

```bash
npx shadcn@latest add avatar
```

--------------------------------

### Implement a minimal Context Menu structure with Shadcn UI (TSX)

Source: https://ui.shadcn.com/docs/components/context-menu

This example provides a concise illustration of how to construct a basic context menu. It uses `ContextMenuTrigger` to define the interactive area and `ContextMenuContent` to display a list of `ContextMenuItem`s, demonstrating the core structure for displaying actions on right-click.

```tsx
<ContextMenu>
  <ContextMenuTrigger>Right click</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Profile</ContextMenuItem>
    <ContextMenuItem>Billing</ContextMenuItem>
    <ContextMenuItem>Team</ContextMenuItem>
    <ContextMenuItem>Subscription</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

--------------------------------

### Basic Sheet Usage Example in TSX

Source: https://ui.shadcn.com/docs/components/sheet

Minimal Sheet implementation with trigger button, content area, header with title and description. Demonstrates the basic structure for creating a confirmation dialog.

```tsx
<Sheet>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Are you absolutely sure?</SheetTitle>
      <SheetDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>
```

--------------------------------

### Define Custom Primary CSS Variables

Source: https://ui.shadcn.com/docs/theming

Provides an example of defining `--primary` and `--primary-foreground` CSS variables using the Oklch color format, adhering to the convention for background and foreground colors.

```css
--primary: oklch(0.205 0 0);
--primary-foreground: oklch(0.985 0 0);
```

--------------------------------

### Import and Use Button Component in Astro Page

Source: https://ui.shadcn.com/docs/installation/astro

Demonstrates importing the Button component from '@/components/ui/button' in an Astro page and rendering it within the page layout. Shows the integration of shadcn/ui components in Astro's component syntax.

```astro
---
import { Button } from "@/components/ui/button"
---

<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width" />
		<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
		<meta name="generator" content={Astro.generator} />
		<title>Astro + TailwindCSS</title>
	</head>

	<body>
		<div className="grid place-items-center h-screen content-center">
			<Button>Button</Button>
		</div>
	</body>
</html>
```

--------------------------------

### View Registry Items with view Command

Source: https://ui.shadcn.com/docs/cli

The view command allows you to preview components and items from the registry before installation. Supports viewing single or multiple items, including namespaced registry items.

```bash
npx shadcn@latest view [item]
```

```bash
npx shadcn@latest view button card dialog
```

```bash
npx shadcn@latest view @acme/auth @v0/dashboard
```

```bash
Usage: shadcn view [options] <items...>

view items from the registry

Arguments:
  items            the item names or URLs to view

Options:
  -c, --cwd <cwd>  the working directory. defaults to the current directory.
  -h, --help       display help for command
```

--------------------------------

### Import Hooks and Utilities from Monorepo

Source: https://ui.shadcn.com/docs/monorepo

Import custom hooks and utility functions from the @workspace/ui package using configured aliases. Provides access to theme hooks and utility functions like cn for className composition.

```typescript
import { useTheme } from "@workspace/ui/hooks/use-theme"
import { cn } from "@workspace/ui/lib/utils"
```

--------------------------------

### Configure components.json for Web App Workspace

Source: https://ui.shadcn.com/docs/monorepo

Configure the components.json file for the web app workspace with shadcn/ui schema, style settings, Tailwind CSS configuration, and path aliases for component imports. Maps local paths and external @workspace/ui package paths for seamless component resolution.

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "../../packages/ui/src/styles/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "hooks": "@/hooks",
    "lib": "@/lib",
    "utils": "@workspace/ui/lib/utils",
    "ui": "@workspace/ui/components"
  }
}
```

--------------------------------

### Create Menubar with Multiple Menus and Submenus - TypeScript/React

Source: https://ui.shadcn.com/docs/components/menubar

Demonstrates a complete menubar implementation with File, Edit, View, and Profiles menus featuring submenus, separators, checkbox items, radio groups, and keyboard shortcuts. This example shows how to structure nested menu items and use disabled states for unavailable options.

```typescript
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"

export function MenubarDemo() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New Window <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>New Incognito Window</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Email link</MenubarItem>
              <MenubarItem>Messages</MenubarItem>
              <MenubarItem>Notes</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Print... <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Find</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Search the web</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Find...</MenubarItem>
              <MenubarItem>Find Next</MenubarItem>
              <MenubarItem>Find Previous</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>Cut</MenubarItem>
          <MenubarItem>Copy</MenubarItem>
          <MenubarItem>Paste</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem>Always Show Bookmarks Bar</MenubarCheckboxItem>
          <MenubarCheckboxItem checked>
            Always Show Full URLs
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarItem inset>
            Reload <MenubarShortcut>⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled inset>
            Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset>Toggle Fullscreen</MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset>Hide Sidebar</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Profiles</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value="benoit">
            <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
            <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
            <MenubarRadioItem value="Luis">Luis</MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarItem inset>Edit...</MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset>Add Profile...</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
```

--------------------------------

### Add Shadcn UI Card Component via CLI (Bash)

Source: https://ui.shadcn.com/docs/components/card

This command line interface (CLI) instruction demonstrates how to add the Shadcn UI Card component to a project using the `npx shadcn@latest add card` command. This is the recommended and easiest way to install Shadcn UI components.

```bash
npx shadcn@latest add card
```

--------------------------------

### Install Node.js types for Vite configuration

Source: https://ui.shadcn.com/docs/installation/vite

Installs type definitions for Node.js as a development dependency. This is required for TypeScript to correctly type Node.js-specific modules like `path` which are often used in configuration files like `vite.config.ts`.

```bash
npm install -D @types/node
```

--------------------------------

### shadcn Build Command Usage and Options

Source: https://ui.shadcn.com/docs/cli

Complete usage documentation showing all available command-line options for the build command, including arguments for registry path and options for output directory, working directory, and help.

```bash
Usage: shadcn build [options] [registry]

build components for a shadcn registry

Arguments:
  registry             path to registry.json file (default: "./registry.json")

Options:
  -o, --output <path>  destination directory for json files (default: "./public/r")
  -c, --cwd <cwd>      the working directory. defaults to the current directory.
  -h, --help           display help for command
```

--------------------------------

### Construct a basic Shadcn Pagination UI structure (TSX)

Source: https://ui.shadcn.com/docs/components/pagination

This example outlines the fundamental JSX structure for building a Shadcn UI pagination component. It shows how to combine `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationPrevious`, `PaginationLink`, `PaginationEllipsis`, and `PaginationNext` to form a complete pagination UI.

```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

--------------------------------

### Install Embla Carousel Dependencies

Source: https://ui.shadcn.com/docs/components/carousel

NPM installation command for the Embla Carousel React library, required for the carousel component functionality. Run this command to add the necessary dependencies to your project.

```bash
npm install embla-carousel-react
```

--------------------------------

### Import and Use Button Component in Remix Route

Source: https://ui.shadcn.com/docs/installation/remix

Import the Button component from the ui folder and use it in a Remix route component. Demonstrates basic component usage in a Remix application.

```typescript
import { Button } from "~/components/ui/button"

export default function Home() {
  return (
    <div>
      <Button>Click me</Button>
    </div>
  )
}
```

--------------------------------

### Basic Usage of Shadcn UI Card Component (TypeScript/React)

Source: https://ui.shadcn.com/docs/components/card

This example illustrates the basic structure and usage of the Shadcn UI Card component. It demonstrates how to combine `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, and `CardFooter` to construct a complete card layout.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
    <CardAction>Card Action</CardAction>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>
```

--------------------------------

### Install Recharts Dependency Manually (npm)

Source: https://ui.shadcn.com/docs/components/chart

This command installs the `recharts` library, which is a required peer dependency for the `shadcn/ui` chart components. It should be run in your project's terminal to add `recharts` to your `node_modules` and `package.json`, enabling chart functionality.

```bash
npm install recharts
```

--------------------------------

### Basic Registry Configuration with URL Templates

Source: https://ui.shadcn.com/docs/components-json

Configure multiple registries with simple URL template syntax. The {name} placeholder is automatically replaced with the resource name during installation. Supports multiple registry namespaces (@v0, @acme, @internal) for organizing component sources.

```json
{
  "registries": {
    "@v0": "https://v0.dev/chat/b/{name}",
    "@acme": "https://registry.acme.com/{name}.json",
    "@internal": "https://internal.company.com/{name}.json"
  }
}
```

--------------------------------

### GET /chat/api/open

Source: https://ui.shadcn.com/docs/registry/open-in-v0

Integrate your registry with Open in v0. This endpoint allows you to open a publicly accessible registry item in v0 by providing its URL.

```APIDOC
## GET /chat/api/open

### Description
This endpoint allows you to open a publicly accessible registry item in v0 by providing its URL. It redirects to or initiates an action within the v0 application.

### Method
GET

### Endpoint
/chat/api/open

### Parameters
#### Path Parameters
(None)

#### Query Parameters
- **url** (string) - Required - The publicly accessible URL of the registry item to open in v0.

#### Request Body
(None)

### Request Example
(N/A for GET request with query parameters)

### Response
#### Success Response (302 Redirect)
This endpoint typically performs a redirect or initiates an action within the v0 application, rather than returning a direct JSON response.

#### Response Example
(N/A)
```

--------------------------------

### Add Functional Utilities with Variants in shadcn/ui

Source: https://ui.shadcn.com/docs/registry/examples

Define functional utility classes with wildcard variants that accept dynamic values, enabling flexible utilities like tab-size that adapt to theme variables.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "custom-component",
  "type": "registry:component",
  "css": {
    "@utility tab-*": {
      "tab-size": "var(--tab-size-*)"
    }
  }
}
```

--------------------------------

### Configure components.json for UI Package Workspace

Source: https://ui.shadcn.com/docs/monorepo

Configure the components.json file for the shared ui package workspace with shadcn/ui schema and @workspace/ui aliases. Defines how components, utilities, hooks, and libraries are resolved within the ui package.

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@workspace/ui/components",
    "utils": "@workspace/ui/lib/utils",
    "hooks": "@workspace/ui/hooks",
    "lib": "@workspace/ui/lib",
    "ui": "@workspace/ui/components"
  }
}
```

--------------------------------

### Configure import alias for UI components

Source: https://ui.shadcn.com/docs/components-json

Sets the import path alias specifically for UI components, allowing customization of the installation directory. Overrides the default location if needed.

```json
{
  "aliases": {
    "ui": "@/app/ui"
  }
}
```

--------------------------------

### Configure Global CSS Variables with Tailwind Theme

Source: https://ui.shadcn.com/docs/installation/manual

Set up root and dark mode CSS variables using oklch color model for light and dark themes. Imports Tailwind CSS and custom animations, defines custom dark variant, and establishes theme configuration including colors for UI elements, charts, and sidebar components. Uses @theme inline to map CSS variables to Tailwind color utilities.

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.145 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.269 0 0);
  --sidebar-ring: oklch(0.439 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

--------------------------------

### Add Environment Variables to shadcn UI Registry Item

Source: https://ui.shadcn.com/docs/registry/examples

Shows how to declare environment variables using the `envVars` field in a registry item. Variables are added to `.env.local` or `.env` files without overwriting existing values. Best practice is to use this for development and example variables only, never production secrets.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "custom-item",
  "type": "registry:item",
  "envVars": {
    "NEXT_PUBLIC_APP_URL": "http://localhost:4000",
    "DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/postgres",
    "OPENAI_API_KEY": ""
  }
}
```

--------------------------------

### Add URL-based CSS Imports in shadcn/ui

Source: https://ui.shadcn.com/docs/registry/examples

Import external stylesheets and web fonts using url() syntax for CDN resources and local files, enabling integration of Google Fonts and remote style libraries.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "font-import",
  "type": "registry:item",
  "css": {
    "@import url(\"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap\")": {},
    "@import url('./local-styles.css')": {}
  }
}
```

--------------------------------

### Initialize shadcn MCP Server for AI Development Clients

Source: https://ui.shadcn.com/docs/registry/mcp

These `npx` commands initialize the shadcn Multi-Client Protocol (MCP) server, integrating it with specific AI development environments. Execute the relevant command in your project's root to enable your chosen AI client (e.g., Claude Code, Cursor, VS Code) to interact with your shadcn registry. Each command targets a different client via the `--client` flag, streamlining registry access for AI-driven component generation.

```bash
npx shadcn@latest mcp init --client claude
```

```bash
npx shadcn@latest mcp init --client cursor
```

```bash
npx shadcn@latest mcp init --client vscode
```

--------------------------------

### Force Install `npm` Packages to Resolve Peer Dependency Conflicts

Source: https://ui.shadcn.com/docs/react-19

These `npm` commands provide two methods to bypass strict peer dependency checks when installing packages. `--force` ignores and overrides any dependency conflicts, while `--legacy-peer-deps` skips strict peer dependency checks, allowing installation of packages with unmet dependencies. Use these when packages haven't updated their peer dependency declarations for React 19.

```bash
npm i <package> --force

npm i <package> --legacy-peer-deps
```

--------------------------------

### React Button Group Usage Example

Source: https://ui.shadcn.com/docs/components/button-group

Demonstrates the basic usage of ButtonGroup component and its associated components for layout and styling buttons together.  It showcases ButtonGroupSeparator and ButtonGroupText usage.

```tsx
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group"

```

```tsx
<ButtonGroup>
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</ButtonGroup>

```

--------------------------------

### Empty State with Gradient Background

Source: https://ui.shadcn.com/docs/components/empty

Advanced empty state example using gradient background utilities (bg-gradient-to-b) and muted colors for a polished appearance. Includes notification bell icon and refresh button for notification context.

```tsx
import { IconBell } from "@tabler/icons-react"
import { RefreshCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function EmptyMuted() {
  return (
    <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconBell />
        </EmptyMedia>
        <EmptyTitle>No Notifications</EmptyTitle>
        <EmptyDescription>
          You&apos;re all caught up. New notifications will appear here.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm">
          <RefreshCcwIcon />
          Refresh
        </Button>
      </EmptyContent>
    </Empty>
  )
}
```

--------------------------------

### Dropdown Menu with Items

Source: https://ui.shadcn.com/docs/components/item

Complete example demonstrating how to integrate Item components within a DropdownMenu. Shows rendering a list of people with avatars, usernames, and emails.

```APIDOC
## Dropdown Menu Integration Example

### Description
Complete example showing how to use Item components within a DropdownMenu to display a list of selectable people with avatars and details.

### Implementation
```tsx
"use client"

import { ChevronDownIcon } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

const people = [
  {
    username: "shadcn",
    avatar: "https://github.com/shadcn.png",
    email: "shadcn@vercel.com",
  },
  {
    username: "maxleiter",
    avatar: "https://github.com/maxleiter.png",
    email: "maxleiter@vercel.com",
  },
  {
    username: "evilrabbit",
    avatar: "https://github.com/evilrabbit.png",
    email: "evilrabbit@vercel.com",
  },
]

export function ItemDropdown() {
  return (
    <div className="flex min-h-64 w-full max-w-md flex-col items-center gap-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-fit">
            Select <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72 [--radius:0.65rem]" align="end">
          {people.map((person) => (
            <DropdownMenuItem key={person.username} className="p-0">
              <Item size="sm" className="w-full p-2">
                <ItemMedia>
                  <Avatar className="size-8">
                    <AvatarImage src={person.avatar} className="grayscale" />
                    <AvatarFallback>{person.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent className="gap-0.5">
                  <ItemTitle>{person.username}</ItemTitle>
                  <ItemDescription>{person.email}</ItemDescription>
                </ItemContent>
              </Item>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
```
```

--------------------------------

### Menu Action Active State Styling

Source: https://ui.shadcn.com/docs/components/sidebar

TSX example showing how to make a menu action visible when its associated menu button is in an active state using peer data attributes.

```tsx
<SidebarMenuItem>
  <SidebarMenuButton />
  <SidebarMenuAction className="peer-data-[active=true]/menu-button:opacity-100" />
</SidebarMenuItem>
```

--------------------------------

### Implement a basic Shadcn UI Dialog in React

Source: https://ui.shadcn.com/docs/components/dialog

Shows the fundamental structure for a Shadcn UI Dialog, including a trigger button and content with a header, title, and description. This basic setup allows users to open a dialog to display information or ask for confirmation.

```tsx
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

--------------------------------

### Define Custom Animations with Keyframes and CSS Variables

Source: https://ui.shadcn.com/docs/registry/examples

Demonstrates how to create custom animations by defining both `@keyframes` in the css object and corresponding theme variables in `cssVars`. This pattern requires matching keyframe definitions and theme configuration to properly use animations in Tailwind classes.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "custom-component",
  "type": "registry:component",
  "cssVars": {
    "theme": {
      "--animate-wiggle": "wiggle 1s ease-in-out infinite"
    }
  },
  "css": {
    "@keyframes wiggle": {
      "0%, 100%": {
        "transform": "rotate(-3deg)"
      },
      "50%": {
        "transform": "rotate(3deg)"
      }
    }
  }
}
```

--------------------------------

### Install Shadcn UI Sidebar Component via CLI

Source: https://ui.shadcn.com/docs/components/sidebar

This command uses npx to add the Shadcn UI Sidebar component to your project. It fetches the latest version and integrates `sidebar.tsx` into your components directory. Run this command in your project's terminal.

```bash
npx shadcn@latest add sidebar
```

--------------------------------

### Basic Dropdown Menu Usage

Source: https://ui.shadcn.com/docs/components/dropdown-menu

A minimal dropdown menu implementation with trigger button, account label, menu items, and separators. This example demonstrates the fundamental structure for displaying a simple list of menu options.

```tsx
<DropdownMenu>
  <DropdownMenuTrigger>Open</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Billing</DropdownMenuItem>
    <DropdownMenuItem>Team</DropdownMenuItem>
    <DropdownMenuItem>Subscription</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

--------------------------------

### Create Basic AppSidebar Component in TSX

Source: https://ui.shadcn.com/docs/components/sidebar

This snippet demonstrates a simple React component, `AppSidebar`, that wraps the `Sidebar` component. It serves as an example of how to integrate the main `Sidebar` component into an application.

```tsx
import { Sidebar } from "@/components/ui/sidebar"

export function AppSidebar() {
  return <Sidebar />
}
```

--------------------------------

### Create custom style from scratch without shadcn/ui

Source: https://ui.shadcn.com/docs/registry/examples

Define a standalone registry style that does not extend shadcn/ui (using `extends: none`) by specifying npm dependencies, registry dependencies for components, and custom CSS variables for theme colors. This enables creating entirely custom component systems independent of shadcn/ui defaults.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "extends": "none",
  "name": "new-style",
  "type": "registry:style",
  "dependencies": ["tailwind-merge", "clsx"],
  "registryDependencies": [
    "utils",
    "https://example.com/r/button.json",
    "https://example.com/r/input.json",
    "https://example.com/r/label.json",
    "https://example.com/r/select.json"
  ],
  "cssVars": {
    "theme": {
      "font-sans": "Inter, sans-serif"
    },
    "light": {
      "main": "#88aaee",
      "bg": "#dfe5f2",
      "border": "#000",
      "text": "#000",
      "ring": "#000"
    },
    "dark": {
      "main": "#88aaee",
      "bg": "#272933",
      "border": "#000",
      "text": "#e6e6e6",
      "ring": "#fff"
    }
  }
}
```

--------------------------------

### Basic Horizontal Resizable Layout in React

Source: https://ui.shadcn.com/docs/components/resizable

Provides a minimal example of a horizontal resizable panel layout with two panels separated by a handle. This basic pattern can be extended with additional panels and nested ResizablePanelGroups for more complex layouts.

```tsx
<ResizablePanelGroup direction="horizontal">
  <ResizablePanel>One</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel>Two</ResizablePanel>
</ResizablePanelGroup>
```

--------------------------------

### Create a functional Shadcn UI Select component in React

Source: https://ui.shadcn.com/docs/components/select

This TypeScript React example demonstrates how to build a complete Select component using Shadcn UI, allowing users to pick from a list of fruits. It integrates `SelectGroup`, `SelectLabel`, and `SelectItem` for structured options.

```tsx
import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SelectDemo() {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
```

--------------------------------

### Configure Tailwind CSS import path

Source: https://ui.shadcn.com/docs/components-json

Defines the path to the CSS file that imports Tailwind CSS into the project. This helps the CLI locate and understand the Tailwind setup.

```json
{
  "tailwind": {
    "css": "styles/global.css"
  }
}
```

--------------------------------

### Basic NavigationMenu Structure

Source: https://ui.shadcn.com/docs/components/navigation-menu

Fundamental NavigationMenu setup with a single menu item containing a trigger and content area. This pattern serves as the foundation for more complex menu configurations.

```typescript
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink>Link</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

--------------------------------

### Configure custom shadcn registry in components.json

Source: https://ui.shadcn.com/docs/registry/namespace

Provides an example of how to configure a custom registry in the `components.json` file. This allows the shadcn CLI to resolve components from a specified URL pattern using a custom namespace.

```json
{
  "registries": {
    "@your-registry": "https://your-domain.com/r/{name}.json"
  }
}
```

--------------------------------

### Configure Tailwind and PostCSS in remix.config.js

Source: https://ui.shadcn.com/docs/installation/remix

Update the remix.config.js file to enable Tailwind CSS and PostCSS processing. This allows Remix to handle CSS compilation during development and build.

```javascript
/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ...
  tailwind: true,
  postcss: true,
  ...
};
```

--------------------------------

### Empty State with Dashed Border Outline

Source: https://ui.shadcn.com/docs/components/empty

Example demonstrating an outlined empty state using the border utility class with dashed style. Includes cloud icon and upload files action button for file storage context.

```tsx
import { IconCloud } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function EmptyOutline() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconCloud />
        </EmptyMedia>
        <EmptyTitle>Cloud Storage Empty</EmptyTitle>
        <EmptyDescription>
          Upload files to your cloud storage to access them anywhere.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm">
          Upload Files
        </Button>
      </EmptyContent>
    </Empty>
  )
}
```

--------------------------------

### Complex Component Registry Configuration

Source: https://ui.shadcn.com/docs/registry/faq

A complete JSON schema defining a complex shadcn/ui registry item that includes a page, multiple components, a hook, utilities, and a config file with specified targets.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "hello-world",
  "title": "Hello World",
  "type": "registry:block",
  "description": "A complex hello world component",
  "files": [
    {
      "path": "registry/new-york/hello-world/page.tsx",
      "type": "registry:page",
      "target": "app/hello/page.tsx"
    },
    {
      "path": "registry/new-york/hello-world/components/hello-world.tsx",
      "type": "registry:component"
    },
    {
      "path": "registry/new-york/hello-world/components/formatted-message.tsx",
      "type": "registry:component"
    },
    {
      "path": "registry/new-york/hello-world/hooks/use-hello.ts",
      "type": "registry:hook"
    },
    {
      "path": "registry/new-york/hello-world/lib/format-date.ts",
      "type": "registry:utils"
    },
    {
      "path": "registry/new-york/hello-world/hello.config.ts",
      "type": "registry:file",
      "target": "~/hello.config.ts"
    }
  ]
}
```

--------------------------------

### Query Parameter Authentication Configuration

Source: https://ui.shadcn.com/docs/registry/authentication

Configure query parameter-based authentication for simpler registry setups. Appends authentication token as query parameter to the registry URL, resulting in URLs like https://registry.company.com/button.json?token=your_token.

```json
{
  "registries": {
    "@internal": {
      "url": "https://registry.company.com/{name}.json",
      "params": {
        "token": "${ACCESS_TOKEN}"
      }
    }
  }
}
```

--------------------------------

### Add Simple Utility Class in shadcn/ui

Source: https://ui.shadcn.com/docs/registry/examples

Create a simple custom utility class using @utility directive to add single CSS property utilities to Tailwind's utility layer for common styling needs.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "custom-component",
  "type": "registry:component",
  "css": {
    "@utility content-auto": {
      "content-visibility": "auto"
    }
  }
}
```

--------------------------------

### shadcn CLI: Custom Error for Unknown Registry

Source: https://ui.shadcn.com/docs/changelog

The shadcn CLI now provides helpful error messages for unknown registries, instructing users to define them in their `components.json` file. This guides both users and LLMs on how to resolve configuration issues.

```txt
Unknown registry "@acme". Make sure it is defined in components.json as follows:
{
  "registries": {
    "@acme": "[URL_TO_REGISTRY]"
  }
}
```

--------------------------------

### Configure TypeScript Path Aliases in tsconfig.json

Source: https://ui.shadcn.com/docs/installation/manual

This JSON configuration snippet updates the `tsconfig.json` file to define a base URL and path aliases for easier module imports. It maps the `@/*` alias to the project's root directory (`./*`), allowing for absolute imports.

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

--------------------------------

### Multiple Plugins with Automatic Deduplication

Source: https://ui.shadcn.com/docs/registry/examples

Illustrates how to declare multiple Tailwind CSS plugins with npm dependencies. The system automatically groups plugins together and removes duplicates. Multiple dependencies are declared in an array and corresponding plugins are referenced in the css object.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "multiple-plugins",
  "type": "registry:item",
  "dependencies": [
    "@tailwindcss/typography",
    "@tailwindcss/forms",
    "tw-animate-css"
  ],
  "css": {
    "@plugin \"@tailwindcss/typography\"": {},
    "@plugin \"@tailwindcss/forms\"": {},
    "@plugin \"tw-animate-css\"": {}
  }
}
```

--------------------------------

### Render a basic Shadcn Pagination component (TSX)

Source: https://ui.shadcn.com/docs/components/pagination

This example demonstrates how to render a basic pagination component using Shadcn UI. It includes previous/next links, page numbers, and an ellipsis for omitted pages, all wrapped within `PaginationContent`.

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function PaginationDemo() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
```

--------------------------------

### NavigationMenuLink with Next.js Link Component

Source: https://ui.shadcn.com/docs/components/navigation-menu

Example demonstrating how to integrate Next.js Link component with NavigationMenuLink using the asChild prop. This enables semantic HTML while maintaining NavigationMenu styling and behavior.

```typescript
import Link from "next/link"

export function NavigationMenuDemo() {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild>
        <Link href="/docs">Documentation</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}
```

--------------------------------

### Basic usage of Shadcn UI Accordion component in React/TypeScript

Source: https://ui.shadcn.com/docs/components/accordion

This React/TypeScript example demonstrates the fundamental structure of a Shadcn UI Accordion. It sets up a single collapsible item with a trigger and content, illustrating how to initialize and use the component.

```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

--------------------------------

### Comprehensive Form Example with shadcn UI Field Components in TypeScript React

Source: https://ui.shadcn.com/docs/changelog

This extensive example presents a payment method form demonstrating the versatility of shadcn UI's `Field` component and its sub-components. It showcases a structured layout using `FieldLegend`, `FieldDescription`, and `FieldGroup`, integrating various UI controls like `Input` and `Select` for collecting payment details.

```tsx
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function FieldDemo() {
  return (
    <div className="w-full max-w-md">
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Payment Method</FieldLegend>
            <FieldDescription>
              All transactions are secure and encrypted
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-name-43j">
                  Name on Card
                </FieldLabel>
                <Input
                  id="checkout-7j9-card-name-43j"
                  placeholder="Evil Rabbit"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-number-uw1">
                  Card Number
                </FieldLabel>
                <Input
                  id="checkout-7j9-card-number-uw1"
                  placeholder="1234 5678 9012 3456"
                  required
                />
                <FieldDescription>
                  Enter your 16-digit card number
                </FieldDescription>
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="checkout-exp-month-ts6">
                    Month
                  </FieldLabel>
                  <Select defaultValue="">
                    <SelectTrigger id="checkout-exp-month-ts6">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01">01</SelectItem>
                      <SelectItem value="02">02</SelectItem>
                      <SelectItem value="03">03</SelectItem>
                      <SelectItem value="04">04</SelectItem>
                      <SelectItem value="05">05</SelectItem>
                      <SelectItem value="06">06</SelectItem>
                      <SelectItem value="07">07</SelectItem>
                      <SelectItem value="08">08</SelectItem>
                      <SelectItem value="09">09</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="11">11</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="checkout-7j9-exp-year-f59">
                    Year
                  </FieldLabel>
                  <Select defaultValue="">
                    <SelectTrigger id="checkout-7j9-exp-year-f59">
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                    <SelectContent>

```

--------------------------------

### Import Tailwind CSS in Remix Root Component

Source: https://ui.shadcn.com/docs/installation/remix

Import the tailwind.css stylesheet in your app/root.tsx file and add it to the links function to ensure global styles are applied throughout the application.

```typescript
import styles from "./tailwind.css?url"

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
]
```

--------------------------------

### Render Basic SidebarGroup Structure with Labels and Actions (TypeScript)

Source: https://ui.shadcn.com/docs/components/sidebar

This example demonstrates creating a fundamental `SidebarGroup` in a Shadcn UI sidebar. It showcases how to use `SidebarGroupLabel` for titles and `SidebarGroupContent` for nested menu items, along with an optional `SidebarGroupAction` to add interactive elements to the group header.

```tsx
"use client"

import { LifeBuoyIcon, SendIcon } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Help</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <LifeBuoyIcon />
                    Support
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <SendIcon />
                    Feedback
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}
```

```tsx
import { Sidebar, SidebarContent, SidebarGroup } from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus /> <span className="sr-only">Add Project</span>
          </SidebarGroupAction>
          <SidebarGroupContent></SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
```

--------------------------------

### Displaying a default Textarea component (TypeScript/React)

Source: https://ui.shadcn.com/docs/components/textarea

Demonstrates how to render a basic Shadcn UI Textarea component with a placeholder. This example includes the necessary import statement and wraps the component in an exported function for use within a React application.

```tsx
import { Textarea } from "@/components/ui/textarea"

export function TextareaDemo() {
  return <Textarea placeholder="Type your message here." />
}
```

--------------------------------

### Add Shadcn UI Tabs component using CLI

Source: https://ui.shadcn.com/docs/components/tabs

This command utilizes the Shadcn CLI to quickly add the Tabs component to your project. It automates the setup, including necessary dependencies and boilerplate code for the component.

```bash
npx shadcn@latest add tabs
```

--------------------------------

### Handle unknown shadcn registry errors

Source: https://ui.shadcn.com/docs/registry/namespace

Shows the error message encountered when attempting to install a component from a registry that is not configured in `components.json`. It also provides the JSON snippet for defining a new registry to resolve this error.

```bash
npx shadcn@latest add @non-existent/component
```

```txt
Unknown registry "@non-existent". Make sure it is defined in components.json as follows:
{
  "registries": {
    "@non-existent": "[URL_TO_REGISTRY]"
  }
}
```

--------------------------------

### Migrate React Component from `forwardRef` to Props

Source: https://ui.shadcn.com/docs/tailwind-v4

This example demonstrates how to refactor a React component to remove `React.forwardRef`. It shows the transformation from using `forwardRef` and `displayName` to a simpler named functional component that accepts props directly and includes a `data-slot` attribute.

```tsx
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b last:border-b-0", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"
```

```tsx
function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  )
}
```

--------------------------------

### Badge Component Demo with Variants

Source: https://ui.shadcn.com/docs/components/badge

Demonstrates all Badge variants including default, secondary, destructive, and outline. Shows usage with icons from lucide-react and custom styling for verified badges and numbered badges. Includes examples of circular badges with custom dimensions and font properties.

```tsx
import { AlertCircleIcon, BadgeCheckIcon, CheckIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export function BadgeDemo() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex w-full flex-wrap gap-2">
        <Badge>Badge</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
      <div className="flex w-full flex-wrap gap-2">
        <Badge
          variant="secondary"
          className="bg-blue-500 text-white dark:bg-blue-600"
        >
          <BadgeCheckIcon />
          Verified
        </Badge>
        <Badge className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums">
          8
        </Badge>
        <Badge
          className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
          variant="destructive"
        >
          99
        </Badge>
        <Badge
          className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
          variant="outline"
        >
          20+
        </Badge>
      </div>
    </div>
  )
}
```

--------------------------------

### Add Basic CSS Imports in shadcn/ui Registry

Source: https://ui.shadcn.com/docs/registry/examples

Include CSS imports in registry items using @import directives to load external stylesheets and frameworks. Imports are automatically placed at the top of generated CSS files.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "custom-import",
  "type": "registry:component",
  "css": {
    "@import \"tailwindcss\"": {},
    "@import \"./styles/base.css\"": {}
  }
}
```

--------------------------------

### Basic usage of Shadcn UI Tabs component in React

Source: https://ui.shadcn.com/docs/components/tabs

This example illustrates the fundamental JSX structure for implementing Shadcn UI Tabs. It defines a tab container, a list of triggers, and corresponding content panels, demonstrating how to switch between different sections of information.

```tsx
<Tabs defaultValue="account" className="w-[400px]">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Make changes to your account here.</TabsContent>
  <TabsContent value="password">Change your password here.</TabsContent>
</Tabs>
```

--------------------------------

### EmptyMedia Component with Avatar

Source: https://ui.shadcn.com/docs/components/empty

Display an avatar in the empty state using EmptyMedia with default variant. This example demonstrates nesting AvatarImage and AvatarFallback components within EmptyMedia for a complete avatar display in empty state UI.

```tsx
<EmptyMedia>
  <Avatar>
    <AvatarImage src="..." />
    <AvatarFallback>CN</AvatarFallback>
  </Avatar>
</EmptyMedia>
```

--------------------------------

### Render a basic shadcn/ui Slider component (TSX)

Source: https://ui.shadcn.com/docs/components/slider

This example demonstrates how to render the Slider component with essential properties. It sets a `defaultValue`, `max` range, and `step` increment for user interaction.

```tsx
<Slider defaultValue={[33]} max={100} step={1} />
```

--------------------------------

### Combined Imports and Plugins with Ordered CSS Processing

Source: https://ui.shadcn.com/docs/registry/examples

Shows the proper ordering of CSS directives in shadcn UI: imports first, then plugins, followed by layer and utility declarations. This pattern ensures correct CSS cascade and specificity when using both `@import` and `@plugin` directives with custom layers and utilities.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "combined-example",
  "type": "registry:item",
  "dependencies": ["@tailwindcss/typography", "tw-animate-css"],
  "css": {
    "@import \"tailwindcss\"": {},
    "@import url(\"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap\")": {},
    "@plugin \"@tailwindcss/typography\"": {},
    "@plugin \"tw-animate-css\"": {},
    "@layer base": {
      "body": {
        "font-family": "Inter, sans-serif"
      }
    },
    "@utility content-auto": {
      "content-visibility": "auto"
    }
  }
}
```

--------------------------------

### Example `components.json` Configuration File

Source: https://ui.shadcn.com/docs/changelog

This JSON configuration file defines the structure and styling preferences for shadcn/ui components within a project. It specifies the default style, Tailwind CSS configuration (config path, CSS file, base color, CSS variable usage), React Server Components (RSC) setting, and import aliases for utilities and components.

```json
{
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "rsc": false,
  "aliases": {
    "utils": "~/lib/utils",
    "components": "~/components"
  }
}
```

--------------------------------

### Basic Breadcrumb Usage

Source: https://ui.shadcn.com/docs/components/breadcrumb

A simple breadcrumb navigation example showing home, components, and current breadcrumb page. Demonstrates the standard structure with items, separators, and the current page indicator.

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/components">Components</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

--------------------------------

### Implement a Nested Sidebar Menu with `SidebarMenuSub` in TypeScript/React

Source: https://ui.shadcn.com/docs/components/sidebar

This example demonstrates how to integrate `SidebarMenuSub` components to create a multi-level sidebar navigation. It uses a predefined `items` array to dynamically render main menu items with nested sub-items, utilizing `SidebarProvider`, `Sidebar`, and other related components for a complete menu structure.

```tsx
"use client"\n\nimport {\n  Sidebar,\n  SidebarContent,\n  SidebarGroup,\n  SidebarGroupContent,\n  SidebarMenu,\n  SidebarMenuButton,\n  SidebarMenuItem,\n  SidebarMenuSub,\n  SidebarMenuSubButton,\n  SidebarMenuSubItem,\n  SidebarProvider,\n} from \"@/components/ui/sidebar\"\n\nconst items = [\n  {\n    title: \"Getting Started\",\n    url: \"#\",\n    items: [\n      {\n        title: \"Installation\",\n        url: \"#\",\n      },\n      {\n        title: \"Project Structure\",\n        url: \"#\",\n      },\n    ],\n  },\n  {\n    title: \"Building Your Application\",\n    url: \"#\",\n    items: [\n      {\n        title: \"Routing\",\n        url: \"#\",\n      },\n      {\n        title: \"Data Fetching\",\n        url: \"#\",\n        isActive: true,\n      },\n      {\n        title: \"Rendering\",\n        url: \"#\",\n      },\n      {\n        title: \"Caching\",\n        url: \"#\",\n      },\n      {\n        title: \"Styling\",\n        url: \"#\",\n      },\n      {\n        title: \"Optimizing\",\n        url: \"#\",\n      },\n      {\n        title: \"Configuring\",\n        url: \"#\",\n      },\n      {\n        title: \"Testing\",\n        url: \"#\",\n      },\n      {\n        title: \"Authentication\",\n        url: \"#\",\n      },\n      {\n        title: \"Deploying\",\n        url: \"#\",\n      },\n      {\n        title: \"Upgrading\",\n        url: \"#\",\n      },\n      {\n        title: \"Examples\",\n        url: \"#\",\n      },\n    ],\n  },\n  {\n    title: \"API Reference\",\n    url: \"#\",\n    items: [\n      {\n        title: \"Components\",\n        url: \"#\",\n      },\n      {\n        title: \"File Conventions\",\n        url: \"#\",\n      },\n      {\n        title: \"Functions\",\n        url: \"#\",\n      },\n      {\n        title: \"next.config.js Options\",\n        url: \"#\",\n      },\n      {\n        title: \"CLI\",\n        url: \"#\",\n      },\n      {\n        title: \"Edge Runtime\",\n        url: \"#\",\n      },\n    ],\n  },\n  {\n    title: \"Architecture\",\n    url: \"#\",\n    items: [\n      {\n        title: \"Accessibility\",\n        url: \"#\",\n      },\n      {\n        title: \"Fast Refresh\",\n        url: \"#\",\n      },\n      {\n        title: \"Next.js Compiler\",\n        url: \"#\",\n      },\n      {\n        title: \"Supported Browsers\",\n        url: \"#\",\n      },\n      {\n        title: \"Turbopack\",\n        url: \"#\",\n      },\n    ],\n  },\n]\n\nexport function AppSidebar() {\n  return (\n    <SidebarProvider>\n      <Sidebar>\n        <SidebarContent>\n          <SidebarGroup>\n            <SidebarGroupContent>\n              <SidebarMenu>\n                {items.map((item, index) => (\n                  <SidebarMenuItem key={index}>\n                    <SidebarMenuButton asChild>\n                      <a href={item.url}>\n                        <span>{item.title}</span>\n                      </a>\n                    </SidebarMenuButton>\n                    <SidebarMenuSub>\n                      {item.items.map((subItem, subIndex) => (\n                        <SidebarMenuSubItem key={subIndex}>\n                          <SidebarMenuSubButton asChild>\n                            <a href={subItem.url}>\n                              <span>{subItem.title}</span>\n                            </a>\n                          </SidebarMenuSubButton>\n                        </SidebarMenuSubItem>\n                      ))}\n                    </SidebarMenuSub>\n                  </SidebarMenuItem>\n                ))}\n              </SidebarMenu>\n            </SidebarGroupContent>\n          </SidebarGroup>\n        </SidebarContent>\n      </Sidebar>\n    </SidebarProvider>\n  )\n}
```

--------------------------------

### Add Custom Theme Variables to shadcn/ui

Source: https://ui.shadcn.com/docs/registry/examples

Define custom CSS variables in the theme object to extend shadcn/ui's design system with project-specific values for typography, shadows, and other design tokens.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "custom-theme",
  "type": "registry:theme",
  "cssVars": {
    "theme": {
      "font-heading": "Inter, sans-serif",
      "shadow-card": "0 0 0 1px rgba(0, 0, 0, 0.1)"
    }
  }
}
```

--------------------------------

### EmptyContent Component with Button Action

Source: https://ui.shadcn.com/docs/components/empty

Display interactive content like buttons, inputs, or links in an empty state using EmptyContent component. This example shows a button for user action and supports className prop for styling customization.

```tsx
<EmptyContent>
  <Button>Add Project</Button>
</EmptyContent>
```

--------------------------------

### Generate Tokens with Expiration

Source: https://ui.shadcn.com/docs/registry/authentication

Create secure authentication tokens with automatic expiration dates for enhanced security. Tokens expire after a specified period (30 days in this example) to limit exposure from compromised credentials.

```typescript
function generateToken() {
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  return { token, expiresAt }
}
```

--------------------------------

### InputGroupTextarea with Button

Source: https://ui.shadcn.com/docs/components/input-group

Example of using InputGroupTextarea with a block-end aligned button addon for message inputs.

```tsx
<InputGroup>
  <InputGroupTextarea placeholder="Enter message..." />
  <InputGroupAddon align="block-end">
    <InputGroupButton>Send</InputGroupButton>
  </InputGroupAddon>
</InputGroup>
```

--------------------------------

### Integrate Select with ButtonGroup (Shadcn UI, React)

Source: https://ui.shadcn.com/docs/components/button-group

This example demonstrates how to combine a `Select` component with a `ButtonGroup` to create an interactive currency selection input. It showcases state management using `useState` for the selected currency and maps through a predefined list of currencies to populate the select options.

```tsx
"use client"\n\nimport * as React from \"react\"\nimport { ArrowRightIcon } from \"lucide-react\"\n\nimport { Button } from \"@/components/ui/button\"\nimport { ButtonGroup } from \"@/components/ui/button-group\"\nimport { Input } from \"@/components/ui/input\"\nimport {\n  Select,\n  SelectContent,\n  SelectItem,\n  SelectTrigger,\n} from \"@/components/ui/select\"\n\nconst CURRENCIES = [\n  {\n    value: \"$\",\n    label: \"US Dollar\",\n  },\n  {\n    value: \"€\",\n    label: \"Euro\",\n  },\n  {\n    value: \"£\",\n    label: \"British Pound\",\n  },\n]\n\nexport function ButtonGroupSelect() {\n  const [currency, setCurrency] = React.useState("$")\n\n  return (\n    <ButtonGroup>\n      <ButtonGroup>\n        <Select value={currency} onValueChange={setCurrency}>\n          <SelectTrigger className=\"font-mono\">{currency}</SelectTrigger>\n          <SelectContent className=\"min-w-24\">\n            {CURRENCIES.map((currency) => (\n              <SelectItem key={currency.value} value={currency.value}>\n                {currency.value}{\" \"}\n                <span className=\"text-muted-foreground\">{currency.label}</span>\n              </SelectItem>\n            ))}\n          </SelectContent>\n        </Select>\n        <Input placeholder=\"10.00\" pattern=\"[0-9]*\" />\n      </ButtonGroup>\n      <ButtonGroup>\n        <Button aria-label=\"Send\" size=\"icon\" variant=\"outline\">\n          <ArrowRightIcon />\n        </Button>\n      </ButtonGroup>\n    </ButtonGroup>\n  )\n}
```

--------------------------------

### Add Component CSS Layer in shadcn/ui

Source: https://ui.shadcn.com/docs/registry/examples

Define component-level styles using Tailwind's @layer components directive to create reusable styled components like cards with consistent design properties.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "custom-card",
  "type": "registry:component",
  "css": {
    "@layer components": {
      "card": {
        "background-color": "var(--color-white)",
        "border-radius": "var(--rounded-lg)",
        "padding": "var(--spacing-6)",
        "box-shadow": "var(--shadow-xl)"
      }
    }
  }
}
```

--------------------------------

### Example JSX with CSS Variables for Theming

Source: https://ui.shadcn.com/docs/changelog

This JSX snippet demonstrates applying styling using CSS variables like `bg-background` and `text-foreground`. These variables abstract color values, allowing for easier theme switching and consistency across components when CSS variables are enabled in the configuration.

```tsx
<div className="bg-background text-foreground" />
```

--------------------------------

### Popover Demo with Form Inputs

Source: https://ui.shadcn.com/docs/components/popover

Complete example demonstrating a popover component with a trigger button and form content displaying dimension input fields. The popover contains labels and input fields for width, max-width, height, and max-height properties with default values.

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Dimensions</h4>
            <p className="text-muted-foreground text-sm">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxWidth">Max. width</Label>
              <Input
                id="maxWidth"
                defaultValue="300px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxHeight">Max. height</Label>
              <Input
                id="maxHeight"
                defaultValue="none"
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

--------------------------------

### Registry Authentication for Open in v0

Source: https://ui.shadcn.com/docs/registry/open-in-v0

This section describes the recommended authentication mechanism for registry servers to integrate with Open in v0. Registry items can be accessed with a `token` query parameter for authentication.

```APIDOC
## GET /r/{item}.json (Registry Server Authentication)

### Description
This describes how a registry server should implement authentication for its items when accessed by `Open in v0`. It uses a `token` query parameter for authentication.

### Method
GET

### Endpoint
/r/{item}.json

### Parameters
#### Path Parameters
- **item** (string) - Required - The path to the specific registry item, typically ending with `.json`.

#### Query Parameters
- **token** (string) - Optional - A secure token used to authenticate access to the registry item. If provided, the server should validate it.

#### Request Body
(None)

### Request Example
(N/A for GET request with query parameters)

### Response
#### Success Response (200)
- Returns the content of the registry item (e.g., JSON).

#### Response Example
```json
{
  "name": "login-01",
  "description": "A login form with email and password fields.",
  "component": "<Login01 />"
}
```

#### Error Response (401 Unauthorized)
- **error** (string) - The error type, typically "Unauthorized".
- **message** (string) - A descriptive message about the authorization failure.

#### Response Example
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing token"
}
```
```

--------------------------------

### Create a feature-rich Context Menu component with Shadcn UI (TSX)

Source: https://ui.shadcn.com/docs/components/context-menu

This example showcases a complete `ContextMenuDemo` component, utilizing various Shadcn UI `ContextMenu` sub-components like `ContextMenuCheckboxItem`, `ContextMenuRadioGroup`, and `ContextMenuSub`. It demonstrates how to assemble a complex context menu with shortcuts, disabled items, submenus, and different interactive elements. The component is self-contained and renders a right-clickable area.

```tsx
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export function ContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem inset>
          Back
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset disabled>
          Forward
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset>
          Reload
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            <ContextMenuItem>Save Page...</ContextMenuItem>
            <ContextMenuItem>Create Shortcut...</ContextMenuItem>
            <ContextMenuItem>Name Window...</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Developer Tools</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked>
          Show Bookmarks
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>
          Show Full URLs
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value="pedro">
          <ContextMenuLabel inset>People</ContextMenuLabel>
          <ContextMenuRadioItem value="pedro">
            Pedro Duarte
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}
```

--------------------------------

### Full App Sidebar Implementation with SidebarGroupAction (TSX)

Source: https://ui.shadcn.com/docs/components/sidebar

This comprehensive example demonstrates how to construct an `AppSidebar` component using Shadcn UI. It showcases the integration of `SidebarGroupAction` within a `SidebarGroup` to add an 'Add Project' button, utilizing `lucide-react` icons and `sonner` toasts for interactive feedback. The component provides a structured navigation for various project categories.

```tsx
"use client"

import { FrameIcon, MapIcon, PieChartIcon, PlusIcon } from "lucide-react"
import { toast, Toaster } from "sonner"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <SidebarProvider>
      <Toaster
        position="bottom-left"
        toastOptions={{
          className: "ml-[160px]",
        }}
      />
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupAction
              title="Add Project"
              onClick={() => toast("You clicked the group action!")}
            >
              <PlusIcon /> <span className="sr-only">Add Project</span>
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <FrameIcon />
                      <span>Design Engineering</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <PieChartIcon />
                      <span>Sales & Marketing</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <MapIcon />
                      <span>Travel</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}
```

--------------------------------

### Configure shadcn MCP Server for VS Code

Source: https://ui.shadcn.com/docs/mcp

This snippet illustrates how to configure the shadcn MCP server for VS Code and GitHub Copilot by adding a 'shadcn' server definition to the '.vscode/mcp.json' file. The configuration uses 'npx shadcn@latest mcp' to start the server, enabling component interaction within VS Code.

```json
{
  "servers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

--------------------------------

### Configure TypeScript Path Resolution in tsconfig.json

Source: https://ui.shadcn.com/docs/installation/astro

Adds baseUrl and path aliases to tsconfig.json to enable absolute imports using the '@/*' alias. This configuration allows cleaner imports for shadcn/ui components located in the src directory.

```typescript
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  }
}
```

--------------------------------

### Render Alert Component with various configurations (React/TypeScript)

Source: https://ui.shadcn.com/docs/components/alert

Demonstrates how to use the Shadcn UI Alert component in a React application. It showcases examples of alerts with success, general information, and destructive variants, including icons, titles, and descriptions, and how to structure multiple alerts.

```tsx
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export function AlertDemo() {
  return (
    <div className="grid w-full max-w-xl items-start gap-4">
      <Alert>
        <CheckCircle2Icon />
        <AlertTitle>Success! Your changes have been saved</AlertTitle>
        <AlertDescription>
          This is an alert with icon, title and description.
        </AlertDescription>
      </Alert>
      <Alert>
        <PopcornIcon />
        <AlertTitle>
          This Alert has a title and an icon. No description.
        </AlertTitle>
      </Alert>
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Unable to process your payment.</AlertTitle>
        <AlertDescription>
          <p>Please verify your billing information and try again.</p>
          <ul className="list-inside list-disc text-sm">
            <li>Check your card details</li>
            <li>Ensure sufficient funds</li>
            <li>Verify billing address</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
```

--------------------------------

### Initialize shadcn MCP Server for AI Clients

Source: https://ui.shadcn.com/docs/mcp

These commands initialize the shadcn MCP server for integration with various AI development environments. Each command specifies a target client (Claude Code, Cursor, VS Code, Codex), setting up the necessary configuration to enable AI assistants to browse, search, and install components. For Codex, an additional TOML configuration is required.

```bash
npx shadcn@latest mcp init --client claude
```

```bash
npx shadcn@latest mcp init --client cursor
```

```bash
npx shadcn@latest mcp init --client vscode
```

```bash
npx shadcn@latest mcp init --client codex
```

```toml
[mcp_servers.shadcn]
command = "npx"
args = ["shadcn@latest", "mcp"]
```

--------------------------------

### Define Registry Dependencies in Registry Item (JSON)

Source: https://ui.shadcn.com/docs/registry/namespace

This JSON snippet from a `registry-item.json` shows how components declare their `registryDependencies`. It illustrates how dependencies from various registries are listed, enabling the CLI to automatically resolve and install them.

```json
{
  "name": "dashboard",
  "type": "registry:block",
  "registryDependencies": [
    "@shadcn/card",
    "@v0/chart",
    "@acme/data-table",
    "@lib/data-fetcher",
    "@ai/analytics-prompt"
  ]
}
```

--------------------------------

### Configure TypeScript Path Resolution in tsconfig.json

Source: https://ui.shadcn.com/docs/installation/gatsby

Configure the TypeScript compiler to resolve path aliases starting with '@/' to the './src/' directory. This enables cleaner import statements throughout your project.

```typescript
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  }
}
```

--------------------------------

### Spinner Component Basic Usage - React/TypeScript

Source: https://ui.shadcn.com/docs/changelog

Shows how to implement a basic Spinner component within a flex container. This example wraps the Spinner in a centered layout using Tailwind CSS classes for demonstration purposes.

```tsx
import { Spinner } from "@/components/ui/spinner"

export function SpinnerBasic() {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <Spinner />
    </div>
  )
}
```

--------------------------------

### Render a Simple Shadcn UI Skeleton Element (TypeScript/React)

Source: https://ui.shadcn.com/docs/components/skeleton

This `tsx` example demonstrates rendering a basic `Skeleton` element. It can be customized with Tailwind CSS classes to control its height, width, and border-radius, effectively mimicking the shape of future content.

```tsx
<Skeleton className="h-[20px] w-[100px] rounded-full" />
```

--------------------------------

### Authenticate registry requests - Next.js (TypeScript)

Source: https://ui.shadcn.com/docs/registry/open-in-v0

Example Next.js API route that validates a `token` query parameter and returns a 401 JSON error for invalid or missing tokens. Dependencies: NextRequest, NextResponse, and an `isValidToken` function plus a `registryItem` to return on success. Limitation: `isValidToken` and `registryItem` are placeholders and must be implemented according to your auth and data models.

```typescript
// Next.js API route example
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")

  if (!isValidToken(token)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Invalid or missing token",
      },
      { status: 401 }
    )
  }

  // Return the registry item
  return NextResponse.json(registryItem)
}

```

--------------------------------

### shadcn CLI: Migrate Imports to New radix-ui Package

Source: https://ui.shadcn.com/docs/changelog

The shadcn CLI introduces a new command to migrate existing projects from `@radix-ui/react-*` imports to the new `radix-ui` package. This command automatically updates imports in `ui` components and installs the necessary dependency, streamlining the upgrade process.

```bash
npx shadcn@latest migrate radix
```

--------------------------------

### Empty State with Header and Multiple Actions in Shadcn UI

Source: https://ui.shadcn.com/docs/changelog

This snippet showcases a more complex `Empty` component setup using `EmptyHeader` to group the media, title, and description. It includes multiple action buttons and a link, demonstrating how to provide richer user interactions for empty states, such as creating or importing projects.

```tsx
import { IconFolderCode } from "@tabler/icons-react"
import { ArrowUpRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"

export function EmptyDemo() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconFolderCode />
        </EmptyMedia>
        <EmptyTitle>No Projects Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any projects yet. Get started by creating
          your first project.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button>Create Project</Button>
          <Button variant="outline">Import Project</Button>
        </div>
      </EmptyContent>
      <Button
        variant="link"
        asChild
        className="text-muted-foreground"
        size="sm"
      >
        <a href="#">
          Learn More <ArrowUpRightIcon />
        </a>
      </Button>
    </Empty>
  )
}
```

--------------------------------

### Basic Collapsible Component Usage in TypeScript React

Source: https://ui.shadcn.com/docs/components/collapsible

This example illustrates the fundamental structure for implementing a collapsible component using Shadcn UI. It shows how to wrap content with `Collapsible`, define a `CollapsibleTrigger` to toggle visibility, and place the expandable content within `CollapsibleContent` to create a basic interactive section.

```tsx
<Collapsible>
  <CollapsibleTrigger>Can I use this in my project?</CollapsibleTrigger>
  <CollapsibleContent>
    Yes. Free to use for personal and commercial projects. No attribution
    required.
  </CollapsibleContent>
</Collapsible>
```

--------------------------------

### Define custom theme with OKLCH color values

Source: https://ui.shadcn.com/docs/registry/examples

Create a custom registry theme using OKLCH color space for light and dark modes, defining colors for background, foreground, primary, ring, and sidebar-specific variables. OKLCH provides perceptually uniform color values for better color consistency across themes.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "custom-theme",
  "type": "registry:theme",
  "cssVars": {
    "light": {
      "background": "oklch(1 0 0)",
      "foreground": "oklch(0.141 0.005 285.823)",
      "primary": "oklch(0.546 0.245 262.881)",
      "primary-foreground": "oklch(0.97 0.014 254.604)",
      "ring": "oklch(0.746 0.16 232.661)",
      "sidebar-primary": "oklch(0.546 0.245 262.881)",
      "sidebar-primary-foreground": "oklch(0.97 0.014 254.604)",
      "sidebar-ring": "oklch(0.746 0.16 232.661)"
    },
    "dark": {
      "background": "oklch(1 0 0)",
      "foreground": "oklch(0.141 0.005 285.823)",
      "primary": "oklch(0.707 0.165 254.624)",
      "primary-foreground": "oklch(0.97 0.014 254.604)",
      "ring": "oklch(0.707 0.165 254.624)",
      "sidebar-primary": "oklch(0.707 0.165 254.624)",
      "sidebar-primary-foreground": "oklch(0.97 0.014 254.604)",
      "sidebar-ring": "oklch(0.707 0.165 254.624)"
    }
  }
}
```

--------------------------------

### Build Next.js Form with Field Component

Source: https://ui.shadcn.com/docs/forms/next

This example demonstrates the basic structure of a form in Next.js using the `<Form />` and `<Field />` components, integrated with `useActionState` for managing form state and errors. It shows how to bind form elements, display errors, and handle disabled states to create an accessible form.

```tsx
<Form action={formAction}>
  <FieldGroup>
    <Field data-invalid={!!formState.errors?.title?.length}>
      <FieldLabel htmlFor="title">Bug Title</FieldLabel>
      <Input
        id="title"
        name="title"
        defaultValue={formState.values.title}
        disabled={pending}
        aria-invalid={!!formState.errors?.title?.length}
        placeholder="Login button not working on mobile"
        autoComplete="off"
      />
      <FieldDescription>
        Provide a concise title for your bug report.
      </FieldDescription>
      {formState.errors?.title && (
        <FieldError>{formState.errors.title[0]}</FieldError>
      )}
    </Field>
  </FieldGroup>
  <Button type="submit">Submit</Button>
</Form>
```

--------------------------------

### Configure Namespaced Registries in components.json

Source: https://ui.shadcn.com/docs/changelog

Configure multiple namespaced registries with URLs and optional authentication headers. This enables component installation from different sources using the @registry/name format. Registries can be public URLs or include Bearer token authentication via environment variables.

```json
{
  "registries": {
    "@acme": "https://acme.com/r/{name}.json",
    "@internal": {
      "url": "https://registry.company.com/{name}",
      "headers": {
        "Authorization": "Bearer ${REGISTRY_TOKEN}"
      }
    }
  }
}
```

--------------------------------

### Basic HoverCard Usage Example in TypeScript/React

Source: https://ui.shadcn.com/docs/components/hover-card

This TypeScript/React snippet demonstrates the fundamental structure and usage of the HoverCard component. It illustrates how to define a trigger element and display content within the HoverCardContent when the trigger is hovered, providing a basic interactive experience.

```tsx
<HoverCard>
  <HoverCardTrigger>Hover</HoverCardTrigger>
  <HoverCardContent>
    The React Framework – created and maintained by @vercel.
  </HoverCardContent>
</HoverCard>
```

--------------------------------

### Configure TypeScript path aliases in tsconfig.json

Source: https://ui.shadcn.com/docs/installation/vite

Adds `baseUrl` and `paths` properties to the `compilerOptions` section of `tsconfig.json`. This configuration helps resolve module imports starting with `@/` to the `./src` directory, improving code organization and developer experience.

```typescript
{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.node.json"
    }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

--------------------------------

### Add custom brand color to shadcn/ui style

Source: https://ui.shadcn.com/docs/registry/examples

Extend the default shadcn/ui style by adding a custom `brand` color variable with OKLCH values for both light and dark modes. This approach maintains shadcn/ui defaults while introducing brand-specific color customization.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "custom-style",
  "type": "registry:style",
  "cssVars": {
    "light": {
      "brand": "oklch(0.99 0.00 0)"
    },
    "dark": {
      "brand": "oklch(0.14 0.00 286)"
    }
  }
}
```

--------------------------------

### Basic Empty State Usage Pattern

Source: https://ui.shadcn.com/docs/components/empty

Minimal implementation pattern showing the structure of an Empty component with header, media icon, title, description, and content with an action button.

```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <Icon />
    </EmptyMedia>
    <EmptyTitle>No data</EmptyTitle>
    <EmptyDescription>No data found</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button>Add data</Button>
  </EmptyContent>
</Empty>
```

--------------------------------

### Configure Shadcn Registries with URL Templates (JSON)

Source: https://ui.shadcn.com/docs/registry/namespace

This configuration demonstrates how to define multiple namespaced registries using simple URL template strings in the `components.json` file. Each registry maps a namespace (e.g., `@v0`, `@acme`) to a base URL where resources can be fetched. The `{name}` placeholder in the URL is automatically replaced with the requested resource name during installation.

```json
{
  "registries": {
    "@v0": "https://v0.dev/chat/b/{name}",
    "@acme": "https://registry.acme.com/resources/{name}.json",
    "@lib": "https://lib.company.com/utilities/{name}",
    "@ai": "https://ai-resources.com/r/{name}.json"
  }
}
```

--------------------------------

### Search shadcn registries for resources

Source: https://ui.shadcn.com/docs/registry/namespace

Illustrates how to search for available resources across different registries using the 'search' command. This includes searching specific registries, querying results, searching multiple registries, limiting results, and listing all items.

```bash
npx shadcn@latest search @v0
```

```bash
npx shadcn@latest search @acme --query "auth"
```

```bash
npx shadcn@latest search @v0 @acme @lib
```

```bash
npx shadcn@latest search @v0 --limit 10 --offset 20
```

```bash
npx shadcn@latest list @acme
```

--------------------------------

### Add Base Styles Layer in shadcn/ui CSS

Source: https://ui.shadcn.com/docs/registry/examples

Define global base styles using Tailwind's @layer directive to style HTML elements like headings with theme variables, ensuring consistent typography across the application.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "custom-style",
  "type": "registry:style",
  "css": {
    "@layer base": {
      "h1": {
        "font-size": "var(--text-2xl)"
      },
      "h2": {
        "font-size": "var(--text-xl)"
      }
    }
  }
}
```

--------------------------------

### Breadcrumb with Custom Separator Icon

Source: https://ui.shadcn.com/docs/components/breadcrumb

Demonstrates how to replace the default breadcrumb separator with a custom icon component from lucide-react. Shows both the full component example and the specific code for implementing custom separators.

```tsx
import Link from "next/link"
import { SlashIcon } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function BreadcrumbWithCustomSeparator() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <SlashIcon />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/components">Components</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <SlashIcon />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
```

--------------------------------

### Render a simple Shadcn UI Select dropdown in React

Source: https://ui.shadcn.com/docs/components/select

This TypeScript React example illustrates the basic JSX structure for implementing a Shadcn UI Select component. It creates a functional dropdown with predefined 'Light', 'Dark', and 'System' options for theme selection.

```tsx
<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Theme" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="light">Light</SelectItem>
    <SelectItem value="dark">Dark</SelectItem>
    <SelectItem value="system">System</SelectItem>
  </SelectContent>
</Select>
```

--------------------------------

### Item Component Variants Example - TSX

Source: https://ui.shadcn.com/docs/components/item

Demonstrates three Item variants: default (subtle styling), outline (clear borders), and muted (subdued colors). Each includes content with title, description, and action button.

```tsx
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"

export function ItemVariant() {
  return (
    <div className="flex flex-col gap-6">
      <Item>
        <ItemContent>
          <ItemTitle>Default Variant</ItemTitle>
          <ItemDescription>
            Standard styling with subtle background and borders.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Open
          </Button>
        </ItemActions>
      </Item>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Outline Variant</ItemTitle>
          <ItemDescription>
            Outlined style with clear borders and transparent background.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Open
          </Button>
        </ItemActions>
      </Item>
      <Item variant="muted">
        <ItemContent>
          <ItemTitle>Muted Variant</ItemTitle>
          <ItemDescription>
            Subdued appearance with muted colors for secondary content.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Open
          </Button>
        </ItemActions>
      </Item>
    </div>
  )
}
```

--------------------------------

### Implement Sidebar Footer with Dropdown Menu (Shadcn UI, TSX)

Source: https://ui.shadcn.com/docs/components/sidebar

This TypeScript React example demonstrates how to integrate a `DropdownMenu` component into the `SidebarFooter`. It uses several Shadcn UI components including `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarMenu`, `SidebarMenuItem`, and `SidebarMenuButton` to create a functional sidebar with an interactive footer for user actions.

```tsx
"use client"

import { ChevronUpIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader />
        <SidebarContent />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                    Username
                    <ChevronUpIcon className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-(--radix-popper-anchor-width)"
                >
                  <DropdownMenuItem>
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center justify-between px-4">
          <SidebarTrigger />
        </header>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

```tsx
export function AppSidebar() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader />
        <SidebarContent />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 /> Username
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}
```

--------------------------------

### Define Registry URL with Name Placeholder (JSON)

Source: https://ui.shadcn.com/docs/registry/namespace

This configuration snippet illustrates the use of the required `{name}` placeholder in a registry URL. The placeholder is dynamically replaced with the resource's name when a component is installed, allowing a single URL pattern to fetch various resources from a namespace.

```json
{
  "@acme": "https://registry.acme.com/{name}.json"
}
```

--------------------------------

### Create Nested ButtonGroups for Complex Layouts (Shadcn UI, React)

Source: https://ui.shadcn.com/docs/components/button-group

This example shows how to achieve more intricate layouts and manage spacing by nesting multiple `ButtonGroup` components. It illustrates a common pattern for organizing related sets of buttons or components within a larger group.

```tsx
<ButtonGroup>\n  <ButtonGroup />\n  <ButtonGroup />\n</ButtonGroup>
```

--------------------------------

### Create React Router Project

Source: https://ui.shadcn.com/docs/installation/react-router

Initialize a new React Router project using the create-react-router CLI. This command scaffolds a new project with React Router configured and ready for development.

```bash
npx create-react-router@latest my-app
```

--------------------------------

### Integrate ChartTooltip with Default Content Component

Source: https://ui.shadcn.com/docs/components/chart

This example illustrates how to utilize the `ChartTooltip` component in a React application by passing `ChartTooltipContent` as its `content` prop. This configuration creates a basic, functional chart tooltip that displays default information, providing a quick way to add tooltip interactivity to charts.

```tsx
<ChartTooltip content={<ChartTooltipContent />} />
```

--------------------------------

### Display DropdownMenu for SidebarMenuItem Action in TypeScript/React

Source: https://ui.shadcn.com/docs/components/sidebar

This concise TypeScript/React example focuses on embedding a Shadcn `DropdownMenu` directly within a `SidebarMenuItem`'s `SidebarMenuAction`. It shows the minimal structure required to display contextual options, such as 'Edit Project' and 'Delete Project', when an action icon is clicked. This snippet assumes the necessary Shadcn `DropdownMenu` and `Sidebar` components are imported and available.

```tsx
<SidebarMenuItem>
  <SidebarMenuButton asChild>
    <a href="#">
      <Home />
      <span>Home</span>
    </a>
  </SidebarMenuButton>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <SidebarMenuAction>
        <MoreHorizontal />
      </SidebarMenuAction>
    </DropdownMenuTrigger>
    <DropdownMenuContent side="right" align="start">
      <DropdownMenuItem>
        <span>Edit Project</span>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <span>Delete Project</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</SidebarMenuItem>
```

--------------------------------

### Add Labels and Tooltips to Input Groups (Shadcn UI, TSX)

Source: https://ui.shadcn.com/docs/components/input-group

This example demonstrates how to incorporate `Label` components within `InputGroupAddon` for improved accessibility and clarity of input fields. It also shows the integration of a `Tooltip` with an `InfoIcon` to provide additional context or help information, enhancing the user's understanding of the input's purpose.

```tsx
import { InfoIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function InputGroupLabel() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <InputGroup>
        <InputGroupInput id="email" placeholder="shadcn" />
        <InputGroupAddon>
          <Label htmlFor="email">@</Label>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput id="email-2" placeholder="shadcn@vercel.com" />
        <InputGroupAddon align="block-start">
          <Label htmlFor="email-2" className="text-foreground">
            Email
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                variant="ghost"
                aria-label="Help"
                className="ml-auto rounded-full"
                size="icon-xs"
              >
                <InfoIcon />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>We&apos;ll use this to send you notifications</p>
            </TooltipContent>
          </Tooltip>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
```

--------------------------------

### Basic ButtonGroup structure with a DropdownMenu in TypeScript React

Source: https://ui.shadcn.com/docs/components/button

This snippet illustrates the basic structure of a `ButtonGroup` component, showing how to group `Button` components and include a `DropdownMenu` trigger. It provides a simple layout example without fully populating the `DropdownMenuContent`.

```tsx
<ButtonGroup>\n  <ButtonGroup>\n    <Button variant=\"outline\" size=\"icon\" aria-label=\"Go Back\">\n      <ArrowLeftIcon />\n    </Button>\n  </ButtonGroup>\n  <ButtonGroup>\n    <Button variant=\"outline\">Archive</Button>\n    <Button variant=\"outline\">Report</Button>\n  </ButtonGroup>\n  <ButtonGroup>\n    <Button variant=\"outline\">Snooze</Button>\n    <DropdownMenu>\n      <DropdownMenuTrigger asChild>\n        <Button variant=\"outline\" size=\"icon\" aria-label=\"More Options\">\n          <MoreHorizontalIcon />\n        </Button>\n      </DropdownMenuTrigger>\n      <DropdownMenuContent />\n    </DropdownMenu>\n  </ButtonGroup>\n</ButtonGroup>
```

--------------------------------

### Define NativeSelectOption Components (tsx)

Source: https://ui.shadcn.com/docs/components/native-select

This example demonstrates how to use the `NativeSelectOption` component to define individual selectable items within a `NativeSelect`. It also includes an instance of a disabled option, showing how to prevent user selection for specific choices. These options map directly to HTML `<option>` elements.

```tsx
<NativeSelectOption value="apple">Apple</NativeSelectOption>
<NativeSelectOption value="banana" disabled>
  Banana
</NativeSelectOption>
```

--------------------------------

### React Button Group Demo

Source: https://ui.shadcn.com/docs/components/button-group

Demonstrates the usage of ButtonGroup component, including different button styles and dropdown menu integration. It utilizes various icons and components for a practical example.  The component handles state for dropdown menus and labels.

```tsx
"use client"

import * as React from "react"
import {
  ArchiveIcon,
  ArrowLeftIcon,
  CalendarPlusIcon,
  ClockIcon,
  ListFilterIcon,
  MailCheckIcon,
  MoreHorizontalIcon,
  TagIcon,
  Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ButtonGroupDemo() {
  const [label, setLabel] = React.useState("personal")

  return (
    <ButtonGroup>
      <ButtonGroup className="hidden sm:flex">
        <Button variant="outline" size="icon" aria-label="Go Back">
          <ArrowLeftIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Archive</Button>
        <Button variant="outline">Report</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Snooze</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="More Options">
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <MailCheckIcon />
                Mark as Read
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ArchiveIcon />
                Archive
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <ClockIcon />
                Snooze
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CalendarPlusIcon />
                Add to Calendar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ListFilterIcon />
                Add to List
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <TagIcon />
                  Label As...
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={label}
                    onValueChange={setLabel}
                  >
                    <DropdownMenuRadioItem value="personal">
                      Personal
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="work">
                      Work
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="other">
                      Other
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive">
                <Trash2Icon />
                Trash
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </ButtonGroup>
  )
}

```

--------------------------------

### Empty State with Avatar Media in Shadcn UI

Source: https://ui.shadcn.com/docs/changelog

This example illustrates how to integrate an `Avatar` component within the `EmptyMedia` section of a Shadcn UI `Empty` component. It's suitable for scenarios like displaying an 'User Offline' state, offering a personalized visual cue along with a message and an action button.

```tsx
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"

export function EmptyAvatar() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="default">
          <Avatar className="size-12">
            <AvatarImage
              src="https://github.com/shadcn.png"
              className="grayscale"
            />
            <AvatarFallback>LR</AvatarFallback>
          </Avatar>
        </EmptyMedia>
        <EmptyTitle>User Offline</EmptyTitle>
        <EmptyDescription>
          This user is currently offline. You can leave a message to notify them
          or try again later.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">Leave Message</Button>
      </EmptyContent>
    </Empty>
  )
}
```

--------------------------------

### Initialize Form with React Hook Form and Zod Resolver

Source: https://ui.shadcn.com/docs/components/form

This code demonstrates the complete setup of a form using the `useForm` hook from `react-hook-form`, integrating `zodResolver` for robust validation based on a predefined Zod `formSchema`. It includes defining a submit handler (`onSubmit`) for processing form values, ensuring both type-safety and validation before submission, and setting default values for form fields.

```tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})

export function ProfileForm() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }
}
```

--------------------------------

### Input Group with Multiple Icons in TypeScript React

Source: https://ui.shadcn.com/docs/changelog

Demonstrates a complete example component showing multiple input groups with various icon addons from lucide-react. Includes email input with mail icon, credit card input with card and check icons, and a favorite/info icon combination, all organized in a responsive grid layout.

```typescript
import {
  CheckIcon,
  CreditCardIcon,
  InfoIcon,
  MailIcon,
  SearchIcon,
  StarIcon,
} from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

export function InputGroupIcon() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup>
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput type="email" placeholder="Enter your email" />
        <InputGroupAddon>
          <MailIcon />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Card number" />
        <InputGroupAddon>
          <CreditCardIcon />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <CheckIcon />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Card number" />
        <InputGroupAddon align="inline-end">
          <StarIcon />
          <InfoIcon />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
```

--------------------------------

### Shadcn UI Field with Textarea Component

Source: https://ui.shadcn.com/docs/components/field

Presents an example of using the Shadcn UI Field component with a Textarea for collecting user feedback. Includes FieldSet, FieldGroup, FieldLabel, Textarea, and FieldDescription for a well-structured input area.

```tsx
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

export function FieldTextarea() {
  return (
    <div className="w-full max-w-md">
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="feedback">Feedback</FieldLabel>
            <Textarea
              id="feedback"
              placeholder="Your feedback helps us improve..."
              rows={4}
            />
            <FieldDescription>
              Share your thoughts about our service.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  )
}
```

--------------------------------

### Example Shadcn UI Form Section with Comments and Buttons

Source: https://ui.shadcn.com/docs/components/field

A partial JSX snippet demonstrating a form section with a `Textarea` for comments and `Button` components for submission and cancellation. Utilizes `FieldLabel` and `Field` components for accessibility and structure within a `FieldGroup`.

```tsx
                <FieldLabel htmlFor="checkout-7j9-optional-comments">
                  Comments
                </FieldLabel>
                <Textarea
                  id="checkout-7j9-optional-comments"
                  placeholder="Add any additional comments"
                  className="resize-none"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
```

--------------------------------

### Use Environment Variables for Dynamic Version Selection

Source: https://ui.shadcn.com/docs/registry/namespace

Implements version control through environment variables, enabling different versions across environments (dev, staging, production). Allows centralized version management without hardcoding values.

```json
{
  "@stable": {
    "url": "https://registry.company.com/{name}",
    "params": {
      "version": "${REGISTRY_VERSION}"
    }
  }
}
```

--------------------------------

### Refactor CSS Variables for @theme inline and HSL Wrappers

Source: https://ui.shadcn.com/docs/tailwind-v4

This CSS example refactors variable definitions for improved usability. It moves `hsl` wrappers to `:root` and `.dark` selectors and utilizes `@theme inline` to simplify variable access by directly referencing `--background` and `--foreground`.

```css
:root {
  --background: hsl(0 0% 100%); // <-- Wrap in hsl
  --foreground: hsl(0 0% 3.9%);
}

.dark {
  --background: hsl(0 0% 3.9%); // <-- Wrap in hsl
  --foreground: hsl(0 0% 98%);
}

@theme inline {
  --color-background: var(--background); // <-- Remove hsl
  --color-foreground: var(--foreground);
}
```

--------------------------------

### Example Shadcn UI FieldSet with Multiple Fields

Source: https://ui.shadcn.com/docs/components/field

Demonstrates the usage of a FieldSet to group related input fields like full name, username, and a newsletter switch. Includes FieldLegend, FieldDescription, FieldLabel, Input, and Switch components for a structured form section.

```tsx
<FieldSet>
  <FieldLegend>Profile</FieldLegend>
  <FieldDescription>This appears on invoices and emails.</FieldDescription>
  <FieldGroup>
    <Field>
      <FieldLabel htmlFor="name">Full name</FieldLabel>
      <Input id="name" autoComplete="off" placeholder="Evil Rabbit" />
      <FieldDescription>This appears on invoices and emails.</FieldDescription>
    </Field>
    <Field>
      <FieldLabel htmlFor="username">Username</FieldLabel>
      <Input id="username" autoComplete="off" aria-invalid />
      <FieldError>Choose another username.</FieldError>
    </Field>
    <Field orientation="horizontal">
      <Switch id="newsletter" />
      <FieldLabel htmlFor="newsletter">Subscribe to the newsletter</FieldLabel>
    </Field>
  </FieldGroup>
</FieldSet>
```

--------------------------------

### SidebarMenuBadge Basic Usage - React TSX

Source: https://ui.shadcn.com/docs/components/sidebar

Minimal example showing how to add a badge to a sidebar menu item. The badge component is placed as a sibling to SidebarMenuButton within a SidebarMenuItem, displaying a numeric value.

```typescript
<SidebarMenuItem>
  <SidebarMenuButton />
  <SidebarMenuBadge>24</SidebarMenuBadge>
</SidebarMenuItem>
```

--------------------------------

### Example JSX with Tailwind Utility Classes for Theming

Source: https://ui.shadcn.com/docs/changelog

This JSX snippet demonstrates how to apply styling using Tailwind CSS utility classes directly within components for theming. It shows classes like `bg-zinc-950` and `dark:bg-white` to handle light and dark mode backgrounds respectively.

```tsx
<div className="bg-zinc-950 dark:bg-white" />
```

--------------------------------

### Declare npm package dependencies for registry item

Source: https://ui.shadcn.com/docs/registry/registry-item-json

The `dependencies` property lists external npm packages that the registry item relies on for its functionality. It supports specifying exact versions using the `@version` syntax, ensuring compatibility and proper installation.

```json
{
  "dependencies": [
    "@radix-ui/react-accordion",
    "zod",
    "lucide-react",
    "name@1.0.2"
  ]
}
```

--------------------------------

### Basic Plugin Usage in shadcn UI Registry

Source: https://ui.shadcn.com/docs/registry/examples

Demonstrates how to declare Tailwind CSS plugins in a shadcn UI registry item configuration. The `css` object contains plugin directives that reference Tailwind CSS packages and custom plugins. This is the foundational pattern for extending Tailwind functionality in shadcn components.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "custom-plugin",
  "type": "registry:item",
  "css": {
    "@plugin \"@tailwindcss/typography\"": {},
    "@plugin \"foo\"": {}
  }
}
```

--------------------------------

### Set Sidebar Position with `side` Prop in TSX

Source: https://ui.shadcn.com/docs/components/sidebar

This example shows how to use the `side` prop to control whether the sidebar appears on the `left` or `right` side of the screen. This prop modifies the visual placement of the sidebar.

```tsx
import { Sidebar } from "@/components/ui/sidebar"

export function AppSidebar() {
  return <Sidebar side="left | right" />
}
```

--------------------------------

### Update Tooltip Color Styling

Source: https://ui.shadcn.com/docs/components/tooltip

Migration guide for updating tooltip color scheme. Replace the old color classes (bg-primary text-primary-foreground) with new foreground/background colors for both TooltipContent and TooltipArrow components to match the 2025-09-22 update.

```tsx
bg-foreground text-background
```

--------------------------------

### Implement Input OTP with Custom Pattern (TypeScript React)

Source: https://ui.shadcn.com/docs/components/input-otp

Demonstrates how to apply a custom validation pattern to the Input OTP component using `REGEXP_ONLY_DIGITS_AND_CHARS` from `input-otp`. This example ensures the input accepts only digits and characters, providing enhanced input validation.

```tsx
"use client"

import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function InputOTPPattern() {
  return (
    <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}
```

--------------------------------

### Implement Shadcn UI Tabs with form elements in React

Source: https://ui.shadcn.com/docs/components/tabs

This comprehensive React example showcases the integration of Shadcn UI Tabs with Card, Input, Label, and Button components. It creates a functional tabbed interface for managing user account and password settings, demonstrating a complete UI pattern for structured content.

```tsx
import { AppWindowIcon, CodeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export function TabsDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Make changes to your account here. Click save when you&apos;re
                done.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-name">Name</Label>
                <Input id="tabs-demo-name" defaultValue="Pedro Duarte" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-username">Username</Label>
                <Input id="tabs-demo-username" defaultValue="@peduarte" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password here. After saving, you&apos;ll be logged
                out.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-current">Current password</Label>
                <Input id="tabs-demo-current" type="password" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-new">New password</Label>
                <Input id="tabs-demo-new" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

--------------------------------

### Utilize Shadcn UI useSidebar Hook for Control (TypeScript/React)

Source: https://ui.shadcn.com/docs/components/sidebar

This example illustrates how to use the `useSidebar` hook to programmatically control the state and behavior of the Shadcn UI sidebar. It destructures various properties and functions for managing sidebar visibility and responsiveness, such as `state`, `open`, `setOpen`, and `toggleSidebar`.

```tsx
import { useSidebar } from "@/components/ui/sidebar"

export function AppSidebar() {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar()
}
```

--------------------------------

### Implement Responsive Dialog and Drawer with React and Shadcn UI

Source: https://ui.shadcn.com/docs/components/drawer

This TypeScript React component demonstrates how to create a responsive modal experience. It uses `useState` to manage the open state and `useMediaQuery` to determine if the user is on a desktop or mobile device. Based on the screen size, it conditionally renders either a Shadcn UI `Dialog` (for desktop) or a `Drawer` (for mobile) to display a profile editing form. Dependencies include `@/lib/utils` for `cn`, `@/hooks/use-media-query`, and various Shadcn UI components.

```tsx
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DrawerDialogDemo() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Edit Profile</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <ProfileForm />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <ProfileForm className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ProfileForm({ className }: React.ComponentProps<"form">) {
  return (
    <form className={cn("grid items-start gap-6", className)}>
      <div className="grid gap-3">
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" defaultValue="shadcn@example.com" />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="username">Username</Label>
        <Input id="username" defaultValue="@shadcn" />
      </div>
      <Button type="submit">Save changes</Button>
    </form>
  )
}
```

--------------------------------

### Override Tailwind CSS Variables in shadcn/ui Theme

Source: https://ui.shadcn.com/docs/registry/examples

Override Tailwind CSS variables including spacing and breakpoints within shadcn/ui theme configuration to customize responsive design behavior across the component library.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "custom-theme",
  "type": "registry:theme",
  "cssVars": {
    "theme": {
      "spacing": "0.2rem",
      "breakpoint-sm": "640px",
      "breakpoint-md": "768px",
      "breakpoint-lg": "1024px",
      "breakpoint-xl": "1280px",
      "breakpoint-2xl": "1536px"
    }
  }
}
```

--------------------------------

### Create Resizable Panel Groups - React TypeScript

Source: https://ui.shadcn.com/docs/changelog

Build resizable horizontal and vertical panel layouts using ResizablePanel, ResizableHandle, and ResizablePanelGroup components. This example demonstrates nesting panels with custom sizes and keyboard/touch support via the underlying react-resizable-panels library.

```typescript
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export function ResizableDemo() {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="max-w-md rounded-lg border md:min-w-[450px]"
    >
      <ResizablePanel defaultSize={50}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold">One</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={25}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Two</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Three</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
```

--------------------------------

### Configure Registry URLs for HTTPS Enforcement (JSON)

Source: https://ui.shadcn.com/docs/registry/namespace

This configuration snippet illustrates the importance of using HTTPS for registry URLs in `components.json`. It shows a recommended secure HTTPS URL and an example of an insecure HTTP URL to avoid, emphasizing encrypted transport and credential protection.

```json
{
  "registries": {
    "@secure": "https://registry.example.com/{name}.json",
    "@insecure": "http://registry.example.com/{name}.json"
  }
}
```

--------------------------------

### Configure Vite for path aliases and Tailwind CSS

Source: https://ui.shadcn.com/docs/installation/vite

Updates `vite.config.ts` to include path aliases and the Tailwind CSS plugin. This configuration allows resolving imports starting with `@/` to `./src` and integrates Tailwind CSS into the build process, ensuring all modules are correctly bundled.

```typescript
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

--------------------------------

### Render a Basic Shadcn Button with Icon (React/TypeScript)

Source: https://ui.shadcn.com/docs/components/button

Demonstrates how to render a basic button and an icon button using the Shadcn UI `Button` component in a React application. It uses `variant="outline"` and `size="icon"` for the icon button, requiring `lucide-react` for the icon. This example shows both the full component and a simplified JSX snippet.

```tsx
import { ArrowUpIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2 md:flex-row">
      <Button variant="outline">Button</Button>
      <Button variant="outline" size="icon" aria-label="Submit">
        <ArrowUpIcon />
      </Button>
    </div>
  )
}
```

```tsx
<Button variant="outline">Button</Button>
<Button variant="outline" size="icon" aria-label="Submit">
  <ArrowUpIcon />
</Button>
```

--------------------------------

### Input Group with Text Addons in TypeScript React

Source: https://ui.shadcn.com/docs/changelog

Demonstrates using InputGroupText component to add text labels or currency symbols around input fields. Includes examples with currency formatting ($ and USD) and URL prefix (https://), showing how to combine text addons with input fields for better contextual information.

```typescript
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"

export function InputGroupTextExample() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="0.00" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>USD</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
```

--------------------------------

### Downgrade React to Version 18 with `npm`

Source: https://ui.shadcn.com/docs/react-19

This `npm` command allows users to explicitly install `react` and `react-dom` at version 18. This can serve as a temporary solution to resolve peer dependency issues with third-party packages not yet compatible with React 19, ensuring project stability until updates are available.

```bash
npm i react@18 react-dom@18
```

--------------------------------

### Render a Bar Chart with shadcn/ui Chart Components (TypeScript/React)

Source: https://ui.shadcn.com/docs/components/chart

This example demonstrates how to create a bar chart using the `shadcn/ui` `ChartContainer` and `ChartTooltip` components in conjunction with `Recharts` `BarChart` and `Bar`. It shows the basic structure for composing a chart, where `data` is expected to be provided. The chart uses custom tooltip content provided by `ChartTooltipContent`.

```tsx
import { Bar, BarChart } from "recharts"

import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

export function MyChart() {
  return (
    <ChartContainer>
      <BarChart data={data}>
        <Bar dataKey="value" />
        <ChartTooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  )
}
```

--------------------------------

### Specify type of registry item

Source: https://ui.shadcn.com/docs/registry/registry-item-json

The `type` property categorizes the registry item, influencing how it's handled and resolved within a project. Examples include `registry:block` for complex components, `registry:component` for simple ones, or `registry:hook` for custom hooks.

```json
{
  "type": "registry:block"
}
```

--------------------------------

### Use Popover with ButtonGroup for AI Assistant (Shadcn UI, React)

Source: https://ui.shadcn.com/docs/components/button-group

This example illustrates how to integrate a `Popover` component within a `ButtonGroup` to create an interactive element, such as an AI assistant interface. It includes a trigger button that opens a popover containing a `Textarea` for user input and descriptive text, all styled within the Shadcn UI system.

```tsx
import { BotIcon, ChevronDownIcon } from \"lucide-react\"\n\nimport { Button } from \"@/components/ui/button\"\nimport { ButtonGroup } from \"@/components/ui/button-group\"\nimport {\n  Popover,\n  PopoverContent,\n  PopoverTrigger,\n} from \"@/components/ui/popover\"\nimport { Separator } from \"@/components/ui/separator\"\nimport { Textarea } from \"@/components/ui/textarea\"\n\nexport function ButtonGroupPopover() {\n  return (\n    <ButtonGroup>\n      <Button variant=\"outline\">\n        <BotIcon /> Copilot\n      </Button>\n      <Popover>\n        <PopoverTrigger asChild>\n          <Button variant=\"outline\" size=\"icon\" aria-label=\"Open Popover\">\n            <ChevronDownIcon />\n          </Button>\n        </PopoverTrigger>\n        <PopoverContent align=\"end\" className=\"rounded-xl p-0 text-sm\">\n          <div className=\"px-4 py-3\">\n            <div className=\"text-sm font-medium\">Agent Tasks</div>\n          </div>\n          <Separator />\n          <div className=\"p-4 text-sm *:[p:not(:last-child)]:mb-2\">\n            <Textarea\n              placeholder=\"Describe your task in natural language.\"\n              className=\"mb-4 resize-none\"\n            />\n            <p className=\"font-medium\">Start a new task with Copilot</p>\n            <p className=\"text-muted-foreground\">\n              Describe your task in natural language. Copilot will work in the\n              background and open a pull request for your review.\n            </p>\n          </div>\n        </PopoverContent>\n      </Popover>\n    </ButtonGroup>\n  )\n}
```

--------------------------------

### Display Text within ButtonGroup (Shadcn UI, React)

Source: https://ui.shadcn.com/docs/components/button-group

This example illustrates the basic usage of the `ButtonGroupText` component. It allows you to embed static text content directly within a `ButtonGroup` alongside interactive elements like buttons.

```tsx
<ButtonGroup>\n  <ButtonGroupText>Text</ButtonGroupText>\n  <Button>Button</Button>\n</ButtonGroup>
```

--------------------------------

### Set Custom Sidebar Width with Style Prop in TSX

Source: https://ui.shadcn.com/docs/components/sidebar

This example demonstrates how to dynamically set custom sidebar widths using CSS variables via the `style` prop on the `SidebarProvider` component. This approach allows for individual sidebar width configuration when multiple sidebars are present.

```tsx
<SidebarProvider
  style={{
    "--sidebar-width": "20rem",
    "--sidebar-width-mobile": "20rem"
  }}
>
  <Sidebar />
</SidebarProvider>
```

--------------------------------

### Display Multiple Toast Types in React

Source: https://ui.shadcn.com/docs/components/sonner

Demonstrates all toast types available in Sonner: default, success, info, warning, error, and promise-based toasts. Each type is triggered by clicking a different button and shows the appropriate notification style. Includes a promise toast example that resolves after 2 seconds.

```typescript
"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function SonnerTypes() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => toast("Event has been created")}>
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.success("Event has been created")}
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.info("Be at the area 10 minutes before the event time")
        }
      >
        Info
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.warning("Event start time cannot be earlier than 8am")
        }
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.error("Event has not been created")}
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toast.promise<{ name: string }>(
            () =>
              new Promise((resolve) =>
                setTimeout(() => resolve({ name: "Event" }), 2000)
              ),
            {
              loading: "Loading...",
              success: (data) => `${data.name} has been created`,
              error: "Error",
            }
          )
        }}
      >
        Promise
      </Button>
    </div>
  )
}
```

--------------------------------

### Implement a Basic Form Field with React Hook Form

Source: https://ui.shadcn.com/docs/components/form

This example demonstrates how to create a single input field (e.g., 'username') within a form using the `FormField` component from React Hook Form. It shows how to link the field to the form's control, apply a label, an input component, a description, and a message for validation feedback, integrating seamlessly with Radix UI components.

```tsx
const form = useForm()

<FormField
  control={form.control}
  name="username"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Username</FormLabel>
      <FormControl>
        <Input placeholder="shadcn" {...field} />
      </FormControl>
      <FormDescription>This is your public display name.</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

--------------------------------

### Basic shadcn UI Field with Input in TypeScript React

Source: https://ui.shadcn.com/docs/changelog

This example showcases a fundamental usage of the `Field` component to wrap an `Input` element. It incorporates `FieldLabel` for proper labeling and accessibility, along with `FieldDescription` to provide supplementary information to the user regarding the input field.

```tsx
<Field>
  <FieldLabel htmlFor="username">Username</FieldLabel>
  <Input id="username" placeholder="Max Leiter" />
  <FieldDescription>
    Choose a unique username for your account.
  </FieldDescription>
</Field>
```

--------------------------------

### Display Field-Specific Validation Errors in React/Next.js Forms

Source: https://ui.shadcn.com/docs/forms/next

This example shows how to display server-side validation errors next to their respective form fields. It utilizes `data-invalid` and `aria-invalid` props for accessibility and conditional rendering of `FieldError` components based on `formState.errors`.

```tsx
<Field data-invalid={!!formState.errors?.email?.length}>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input
    id="email"
    name="email"
    type="email"
    aria-invalid={!!formState.errors?.email?.length}
  />
  {formState.errors?.email && (
    <FieldError>{formState.errors.email[0]}</FieldError>
  )}
</Field>
```

--------------------------------

### Initialize MCP Server for Registry Integration

Source: https://ui.shadcn.com/docs/changelog

Initialize the MCP (Model Context Protocol) server for all configured registries with zero configuration required. This command adds the MCP server to favorite MCP clients, enabling better integration with CLI and multiple registries in the same project.

```bash
npx shadcn@latest mcp init
```

--------------------------------

### Basic Empty State Display with Shadcn UI

Source: https://ui.shadcn.com/docs/changelog

This example shows a basic implementation of the Shadcn UI `Empty` component. It displays a 'No messages' state with an icon, title, description, and a call-to-action button, providing a clear visual for empty content areas in an application.

```tsx
<Empty>
  <EmptyMedia variant="icon">
    <InboxIcon />
  </EmptyMedia>
  <EmptyTitle>No messages</EmptyTitle>
  <EmptyDescription>You don't have any messages yet.</EmptyDescription>
  <EmptyContent>
    <Button>Send a message</Button>
  </EmptyContent>
</Empty>
```

--------------------------------

### Display Spinner in Empty State Component (React/TypeScript)

Source: https://ui.shadcn.com/docs/components/spinner

This example shows how to use the `Spinner` component within an `Empty` state component to signify an ongoing process. The spinner is placed inside `EmptyMedia` to visually represent a task like 'Processing your request' alongside a descriptive message.

```tsx
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"

export function SpinnerEmpty() {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>Processing your request</EmptyTitle>
        <EmptyDescription>
          Please wait while we process your request. Do not refresh the page.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm">
          Cancel
        </Button>
      </EmptyContent>
    </Empty>
  )
}
```

--------------------------------

### Build Registry with pnpm

Source: https://ui.shadcn.com/docs/blocks

Runs the build script to process block definitions and generate registry data. Execute this after updating block definitions before viewing or publishing.

```bash
pnpm registry:build
```

--------------------------------

### Structure Sidebar Content with Groups (Shadcn UI, TSX)

Source: https://ui.shadcn.com/docs/components/sidebar

This TypeScript React example illustrates the basic usage of the `SidebarContent` component to wrap and organize content within a sidebar. It demonstrates how to place multiple `SidebarGroup` components inside the scrollable content area of a Shadcn UI sidebar, providing a structured layout for navigation or information.

```tsx
import { Sidebar, SidebarContent } from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
    </Sidebar>
  )
}
```

--------------------------------

### Example Diff Output for `npx shadcn diff alert`

Source: https://ui.shadcn.com/docs/changelog

This `diff` output illustrates a change in the `alertVariants` definition, specifically modifying the `cva` function call. It shows a change from `relative w-full rounded-lg border` to `relative w-full pl-12 rounded-lg border`, indicating an added `pl-12` class for padding.

```diff
const alertVariants = cva(
- "relative w-full rounded-lg border",
+ "relative w-full pl-12 rounded-lg border"
)
```

--------------------------------

### Kbd demo with multiple key combinations

Source: https://ui.shadcn.com/docs/components/kbd

Demonstrates the Kbd and KbdGroup components displaying various keyboard key combinations including modifier keys and control sequences.

```tsx
import { Kbd, KbdGroup } from "@/components/ui/kbd"

export function KbdDemo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>⌥</Kbd>
        <Kbd>⌃</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>B</Kbd>
      </KbdGroup>
    </div>
  )
}
```

--------------------------------

### Create Input Group with Textarea and Addons (Shadcn UI, TSX)

Source: https://ui.shadcn.com/docs/components/input-group

This example demonstrates how to integrate a `Textarea` component within an `InputGroup`. It utilizes `InputGroupAddon` with `block-start` and `block-end` alignment to display icons, text, and buttons, providing a rich, interactive textarea experience for code or multi-line input.

```tsx
import {
  IconBrandJavascript,
  IconCopy,
  IconCornerDownLeft,
  IconRefresh,
} from "@tabler/icons-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"

export function InputGroupTextareaExample() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <InputGroup>
        <InputGroupTextarea
          id="textarea-code-32"
          placeholder="console.log('Hello, world!');"
          className="min-h-[200px]"
        />
        <InputGroupAddon align="block-end" className="border-t">
          <InputGroupText>Line 1, Column 1</InputGroupText>
          <InputGroupButton size="sm" className="ml-auto" variant="default">
            Run <IconCornerDownLeft />
          </InputGroupButton>
        </InputGroupAddon>
        <InputGroupAddon align="block-start" className="border-b">
          <InputGroupText className="font-mono font-medium">
            <IconBrandJavascript />
            script.js
          </InputGroupText>
          <InputGroupButton className="ml-auto" size="icon-xs">
            <IconRefresh />
          </InputGroupButton>
          <InputGroupButton variant="ghost" size="icon-xs">
            <IconCopy />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
```

--------------------------------

### Implement Collapsible Component with React and Shadcn UI

Source: https://ui.shadcn.com/docs/components/collapsible

This TypeScript React example demonstrates how to create a functional collapsible component using Shadcn UI's `Collapsible` primitive. It manages its open/closed state with React's `useState` hook and includes a button with an icon to toggle the content visibility, showcasing a common UI pattern for hiding and showing information.

```tsx
"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export function CollapsibleDemo() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex w-[350px] flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-4 px-4">
        <h4 className="text-sm font-semibold">
          @peduarte starred 3 repositories
        </h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <ChevronsUpDown />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-2 font-mono text-sm">
        @radix-ui/primitives
      </div>
      <CollapsibleContent className="flex flex-col gap-2">
        <div className="rounded-md border px-4 py-2 font-mono text-sm">
          @radix-ui/colors
        </div>
        <div className="rounded-md border px-4 py-2 font-mono text-sm">
          @stitches/react
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
```

--------------------------------

### Set Up React Hook Form Instance with Zod Resolver

Source: https://ui.shadcn.com/docs/forms/react-hook-form

Demonstrates the setup of a React Hook Form instance within a functional component (`BugReportForm`). It initializes the form using `useForm`, connects it to a Zod schema via `zodResolver` for validation, sets default values, and defines an `onSubmit` function to handle validated form data.

```tsx
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  title: z
    .string()
    .min(5, "Bug title must be at least 5 characters.")
    .max(32, "Bug title must be at most 32 characters."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(100, "Description must be at most 100 characters."),
})

export function BugReportForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    // Do something with the form values.
    console.log(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* ... */}
      {/* Build the form here */}
      {/* ... */}
    </form>
  )
}
```

--------------------------------

### Implement Collapsible SidebarGroup with Shadcn UI (TypeScript)

Source: https://ui.shadcn.com/docs/components/sidebar

This example illustrates how to make a `SidebarGroup` collapsible using Shadcn UI's `Collapsible` component. It shows wrapping the group with `Collapsible` and placing the `CollapsibleTrigger` inside `SidebarGroupLabel` to control the visibility of `SidebarGroupContent`.

```tsx
"use client"

import { ChevronDownIcon, LifeBuoyIcon, SendIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
              >
                <CollapsibleTrigger>
                  Help
                  <ChevronDownIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <LifeBuoyIcon />
                        Support
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <SendIcon />
                        Feedback
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}
```

```tsx
export function AppSidebar() {
  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger>
            Help
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent />
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}
```

--------------------------------

### Create Class Name Merge Utility Function

Source: https://ui.shadcn.com/docs/installation/manual

Export a cn utility function that combines clsx and tailwind-merge to intelligently merge Tailwind CSS class names while resolving conflicts. Takes ClassValue inputs and returns merged class string, useful for conditionally applying styles in component prop patterns.

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

--------------------------------

### Implement Responsive Form Layout with Shadcn UI Fields (TSX)

Source: https://ui.shadcn.com/docs/components/field

This TypeScript/TSX example demonstrates how to construct a responsive form using Shadcn UI's Field components. It utilizes `orientation="responsive"` on individual `Field` elements within a `FieldGroup` to achieve automatic column layouts for various screen sizes, leveraging components like `Input`, `Textarea`, and `Button`.

```tsx
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function FieldResponsive() {
  return (
    <div className="w-full max-w-4xl">
      <form>
        <FieldSet>
          <FieldLegend>Profile</FieldLegend>
          <FieldDescription>Fill in your profile information.</FieldDescription>
          <FieldSeparator />
          <FieldGroup>
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <FieldDescription>
                  Provide your full name for identification
                </FieldDescription>
              </FieldContent>
              <Input id="name" placeholder="Evil Rabbit" required />
            </Field>
            <FieldSeparator />
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="lastName">Message</FieldLabel>
                <FieldDescription>
                  You can write your message here. Keep it short, preferably
                  under 100 characters.
                </FieldDescription>
              </FieldContent>
              <Textarea
                id="message"
                placeholder="Hello, world!"
                required
                className="min-h-[100px] resize-none sm:min-w-[300px]"
              />
            </Field>
            <FieldSeparator />
            <Field orientation="responsive">
              <Button type="submit">Submit</Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  )
}
```

--------------------------------

### Create Selectable Field Groups with Radio Buttons in React

Source: https://ui.shadcn.com/docs/components/field

This example demonstrates how to construct a 'Choice Card' using `FieldGroup`, `FieldSet`, and `FieldLabel` to wrap `RadioGroup` components. It showcases horizontal orientation for field content and integrates `FieldTitle` and `FieldDescription` for rich selection options, allowing users to choose between compute environments.

```tsx
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"

export function FieldChoiceCard() {
  return (
    <div className="w-full max-w-md">
      <FieldGroup>
        <FieldSet>
          <FieldLabel htmlFor="compute-environment-p8w">
            Compute Environment
          </FieldLabel>
          <FieldDescription>
            Select the compute environment for your cluster.
          </FieldDescription>
          <RadioGroup defaultValue="kubernetes">
            <FieldLabel htmlFor="kubernetes-r2h">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Kubernetes</FieldTitle>
                  <FieldDescription>
                    Run GPU workloads on a K8s configured cluster.
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem value="kubernetes" id="kubernetes-r2h" />
              </Field>
            </FieldLabel>
            <FieldLabel htmlFor="vm-z4k">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Virtual Machine</FieldTitle>
                  <FieldDescription>
                    Access a VM configured cluster to run GPU workloads.
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem value="vm" id="vm-z4k" />
              </Field>
            </FieldLabel>
          </RadioGroup>
        </FieldSet>
      </FieldGroup>
    </div>
  )
}
```

--------------------------------

### Implement a Radio Group Field with Shadcn UI and React

Source: https://ui.shadcn.com/docs/components/field

This example shows how to create a radio button group for selecting a subscription plan using Shadcn UI components in a React application. It organizes radio items horizontally within a fieldset, complete with a label and description.

```tsx
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"

export function FieldRadio() {
  return (
    <div className="w-full max-w-md">
      <FieldSet>
        <FieldLabel>Subscription Plan</FieldLabel>
        <FieldDescription>
          Yearly and lifetime plans offer significant savings.
        </FieldDescription>
        <RadioGroup defaultValue="monthly">
          <Field orientation="horizontal">
            <RadioGroupItem value="monthly" id="plan-monthly" />
            <FieldLabel htmlFor="plan-monthly" className="font-normal">
              Monthly ($9.99/month)
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem value="yearly" id="plan-yearly" />
            <FieldLabel htmlFor="plan-yearly" className="font-normal">
              Yearly ($99.99/year)
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem value="lifetime" id="plan-lifetime" />
            <FieldLabel htmlFor="plan-lifetime" className="font-normal">
              Lifetime ($299.99)
            </FieldLabel>
          </Field>
        </RadioGroup>
      </FieldSet>
    </div>
  )
}
```

--------------------------------

### Render Menubar with File Menu Items

Source: https://ui.shadcn.com/docs/components/menubar

Creates a functional menubar with a File menu containing multiple menu items, keyboard shortcuts, and visual separators. The menubar opens a dropdown when the trigger is clicked, displaying options like New Tab, New Window, Share, and Print with appropriate keyboard shortcut indicators.

```tsx
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>
        New Tab <MenubarShortcut>⌘T</MenubarShortcut>
      </MenubarItem>
      <MenubarItem>New Window</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Share</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Print</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

--------------------------------

### Autoplay Plugin with Stop on Interaction

Source: https://ui.shadcn.com/docs/components/carousel

Implement Autoplay plugin with stopOnInteraction option and mouse event handlers to pause/resume autoplay. This example stores the plugin in a useRef to persist across renders and adds mouse enter/leave handlers to control the autoplay behavior for better user experience.

```tsx
"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export function CarouselPlugin() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  )

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full max-w-xs"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-4xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
```

--------------------------------

### Build Command Menu with Keyboard Handler

Source: https://ui.shadcn.com/docs/components/command

Creates a reusable CommandMenu component that responds to Cmd/Ctrl + K keyboard shortcut. Includes a search input field and displays command suggestions grouped by category with empty state handling. Automatically cleans up event listeners on component unmount.

```tsx
export function CommandMenu() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search Emoji</CommandItem>
          <CommandItem>Calculator</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
```

--------------------------------

### Integrate SidebarMenuAction with Button and Link in TSX

Source: https://ui.shadcn.com/docs/components/sidebar

This example demonstrates how to combine `SidebarMenuButton` (acting as a clickable link) and `SidebarMenuAction` (an independent action button) within a single `SidebarMenuItem`. The action button can contain an icon and a screen-reader-only label, allowing for multiple interactive elements per menu item, enhancing functionality.

```tsx
<SidebarMenuItem>\n  <SidebarMenuButton asChild>\n    <a href="#">\n      <Home />\n      <span>Home</span>\n    </a>\n  </SidebarMenuButton>\n  <SidebarMenuAction>\n    <Plus /> <span className="sr-only">Add Project</span>\n  </SidebarMenuAction>\n</SidebarMenuItem>
```

--------------------------------

### Configure Semantic Versioning with Prerelease Support

Source: https://ui.shadcn.com/docs/registry/namespace

Implements semantic versioning ranges with optional prerelease channel control. Allows specifying version constraints like caret ranges (^2.0.0) and conditionally enabling prerelease versions.

```json
{
  "@npm-style": {
    "url": "https://registry.example.com/{name}",
    "params": {
      "semver": "^2.0.0",
      "prerelease": "${ALLOW_PRERELEASE}"
    }
  }
}
```

--------------------------------

### Persist Sidebar State in Next.js App Router

Source: https://ui.shadcn.com/docs/components/sidebar

This Next.js `app/layout.tsx` example shows how to persist the sidebar's open/closed state across page reloads using cookies. It reads the `sidebar_state` cookie to set the initial `defaultOpen` prop for the `SidebarProvider`.

```tsx
import { cookies } from "next/headers"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}
```

--------------------------------

### Listen to Carousel Select Events

Source: https://ui.shadcn.com/docs/components/carousel

Attach event listeners to the carousel API instance using the on() method. This example demonstrates listening to the 'select' event, which fires whenever the carousel slide changes. The event handler can be used to trigger custom logic or state updates.

```tsx
import { type CarouselApi } from "@/components/ui/carousel"

export function Example() {
  const [api, setApi] = React.useState<CarouselApi>()

  React.useEffect(() => {
    if (!api) {
      return
    }

    api.on("select", () => {
      // Do something on select.
    })
  }, [api])

  return (
    <Carousel setApi={setApi}>
      <CarouselContent>
        <CarouselItem>...</CarouselItem>
        <CarouselItem>...</CarouselItem>
        <CarouselItem>...</CarouselItem>
      </CarouselContent>
    </Carousel>
  )
}
```

--------------------------------

### Animate Shadcn UI Progress Component in React

Source: https://ui.shadcn.com/docs/components/progress

This React component (`ProgressDemo`) illustrates how to implement a dynamic progress bar using the Shadcn UI `Progress` component. It leverages `useState` to manage the progress value and `useEffect` with `setTimeout` to simulate a gradual increase in progress over time, providing a visual example of an animated progress indicator.

```tsx
"use client"

import * as React from "react"

import { Progress } from "@/components/ui/progress"

export function ProgressDemo() {
  const [progress, setProgress] = React.useState(13)

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  return <Progress value={progress} className="w-[60%]" />
}
```

--------------------------------

### Build a Carousel Component in shadcn/ui (TypeScript/React)

Source: https://ui.shadcn.com/docs/changelog

This example shows how to integrate a Carousel component from shadcn/ui with motion, swipe gestures, and keyboard support. It dynamically generates carousel items using Card components and includes navigation buttons (CarouselPrevious, CarouselNext), built on Embla Carousel.

```tsx
import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export function CarouselDemo() {
  return (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-4xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
```

--------------------------------

### Add Toaster Component to Root Layout

Source: https://ui.shadcn.com/docs/components/sonner

Configures the Toaster component in the Next.js root layout file. This setup ensures that toast notifications are available throughout the entire application. Place the Toaster component in the body tag of your HTML structure.

```typescript
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
```

--------------------------------

### Create a disabled Shadcn UI Toggle Group in TSX

Source: https://ui.shadcn.com/docs/components/toggle-group

This example shows how to render a ToggleGroup component where all items are disabled. By adding the `disabled` prop to the `ToggleGroup`, user interaction with the toggle items is prevented. Icons from `lucide-react` are used to represent the toggle options.

```tsx
import { Bold, Italic, Underline } from "lucide-react"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export function ToggleGroupDemo() {
  return (
    <ToggleGroup type="multiple" disabled>
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <Bold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <Italic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough">
        <Underline className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
```

--------------------------------

### Disable Form Field and Apply Styling Based on Pending State in React/Next.js

Source: https://ui.shadcn.com/docs/forms/next

This example illustrates how to disable an individual form field and apply data attributes for styling when the form is in a pending state. It uses the `data-disabled` prop on the `<Field />` component and the `disabled` prop on the `<Input />`.

```tsx
<Field data-disabled={pending}>
  <FieldLabel htmlFor="name">Name</FieldLabel>
  <Input id="name" name="name" disabled={pending} />
</Field>
```

--------------------------------

### Configure ChartLegend with Custom Name Key

Source: https://ui.shadcn.com/docs/components/chart

Set up a chart legend using the nameKey prop to map a custom data field for legend item names. This example maps the 'browser' field to display Chrome and Safari as legend names, with colors automatically referenced from the chart config.

```tsx
const chartData = [
  { browser: "chrome", visitors: 187, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
]

const chartConfig = {
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

<ChartLegend content={<ChartLegendContent nameKey="browser" />} />
```

--------------------------------

### Fetch Projects with React Query - React TypeScript

Source: https://ui.shadcn.com/docs/components/sidebar

Fetches project data using React Query useQuery hook with identical loading state and skeleton UI patterns. Provides the same sidebar menu rendering with project links and icons as the SWR implementation.

```typescript
function NavProjects() {
  const { data, isLoading } = useQuery()

  if (isLoading) {
    return (
      <SidebarMenu>
        {Array.from({ length: 5 }).map((_, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuSkeleton showIcon />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    )
  }

  if (!data) {
    return ...
  }

  return (
    <SidebarMenu>
      {data.map((project) => (
        <SidebarMenuItem key={project.name}>
          <SidebarMenuButton asChild>
            <a href={project.url}>
              <project.icon />
              <span>{project.name}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
```

--------------------------------

### Create Native Select with grouped department options in React

Source: https://ui.shadcn.com/docs/components/native-select

This React component demonstrates how to organize `NativeSelectOption` elements into logical categories using `NativeSelectOptGroup`. It shows an example of selecting departments (Engineering, Sales, Operations), enhancing usability for longer lists by grouping related options.

```tsx
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/components/ui/native-select"

export function NativeSelectGroups() {
  return (
    <NativeSelect>
      <NativeSelectOption value="">Select department</NativeSelectOption>
      <NativeSelectOptGroup label="Engineering">
        <NativeSelectOption value="frontend">Frontend</NativeSelectOption>
        <NativeSelectOption value="backend">Backend</NativeSelectOption>
        <NativeSelectOption value="devops">DevOps</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Sales">
        <NativeSelectOption value="sales-rep">Sales Rep</NativeSelectOption>
        <NativeSelectOption value="account-manager">
          Account Manager
        </NativeSelectOption>
        <NativeSelectOption value="sales-director">
          Sales Director
        </NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Operations">
        <NativeSelectOption value="support">
          Customer Support
        </NativeSelectOption>
        <NativeSelectOption value="product-manager">
          Product Manager
        </NativeSelectOption>
        <NativeSelectOption value="ops-manager">
          Operations Manager
        </NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  )
}
```

--------------------------------

### Item with Actions Button Component in TSX

Source: https://ui.shadcn.com/docs/changelog

Extended Item component demonstrating ItemActions sub-component with an action button. Shows two examples: a basic outline item with title, description, and action button, and a smaller item variant wrapped in an anchor tag with icon and chevron action.

```tsx
import { BadgeCheckIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

export function ItemDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Basic Item</ItemTitle>
          <ItemDescription>
            A simple item with title and description.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Action
          </Button>
        </ItemActions>
      </Item>
      <Item variant="outline" size="sm" asChild>
        <a href="#">
          <ItemMedia>
            <BadgeCheckIcon className="size-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Your profile has been verified.</ItemTitle>
          </ItemContent>
          <ItemActions>
            <ChevronRightIcon className="size-4" />
          </ItemActions>
        </a>
      </Item>
    </div>
  )
}
```

--------------------------------

### Render SidebarMenuButton as Link Element in TSX

Source: https://ui.shadcn.com/docs/components/sidebar

This example shows how to use the `asChild` prop with `SidebarMenuButton` to render an `<a>` tag, effectively turning the menu button into a navigable link. This allows for custom child elements to inherit the button's styling and functionality, making it flexible for various navigation needs.

```tsx
<SidebarMenuButton asChild>\n  <a href="#">Home</a>\n</SidebarMenuButton>
```

--------------------------------

### Configure Carousel Autoplay Plugin

Source: https://ui.shadcn.com/docs/components/carousel

Add the Autoplay plugin to the Carousel component using the plugins prop. The Autoplay plugin automatically cycles through carousel items at a specified delay interval. This example shows basic configuration with a 2-second delay between slides.

```ts
import Autoplay from "embla-carousel-autoplay"

export function Example() {
  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
    >
      // ...
    </Carousel>
  )
}
```

--------------------------------

### Define a Complete Shadcn UI Bar Chart Component with Legend (TypeScript/React)

Source: https://ui.shadcn.com/docs/components/chart

This comprehensive example provides a full React component (`Component`) demonstrating a `BarChart` using Shadcn UI components. It includes data definition (`chartData`), chart configuration (`chartConfig`), and integrates `ChartLegend` and `ChartTooltip` for enhanced user interaction.

```tsx
"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig

export function Component() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
```

--------------------------------

### Implement a Breadcrumb Component in shadcn/ui (TypeScript/React)

Source: https://ui.shadcn.com/docs/changelog

This example demonstrates how to create an accessible and flexible Breadcrumb component using shadcn/ui, including support for collapsed items with a DropdownMenu, custom separators, and integration with Next.js Link for routing. It showcases the use of BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbEllipsis, and BreadcrumbPage components.

```tsx
import Link from "next/link"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function BreadcrumbDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1">
              <BreadcrumbEllipsis className="size-4" />
              <span className="sr-only">Toggle menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Documentation</DropdownMenuItem>
              <DropdownMenuItem>Themes</DropdownMenuItem>
              <DropdownMenuItem>GitHub</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/docs/components">Components</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
```

--------------------------------

### Add Multiple Resources with shadcn CLI (Bash)

Source: https://ui.shadcn.com/docs/registry/namespace

This command demonstrates how to add multiple resources (`@acme/auth` and `@custom/login-form`) using the `shadcn` CLI. It highlights the dependency resolution behavior where, in case of file path conflicts, the last specified resource wins.

```bash
npx shadcn@latest add @acme/auth @custom/login-form
```

--------------------------------

### Input Group with Buttons and Interactive Features in TypeScript React

Source: https://ui.shadcn.com/docs/changelog

Advanced example showing input groups with interactive button addons, including copy-to-clipboard functionality, favorite toggle with state management, popover integration for security warnings, and search button. Uses Tabler icons and custom hooks for clipboard operations.

```typescript
"use client"

import * as React from "react"
import {
  IconCheck,
  IconCopy,
  IconInfoCircle,
  IconStar,
} from "@tabler/icons-react"

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function InputGroupButtonExample() {
  const { copyToClipboard, isCopied } = useCopyToClipboard()
  const [isFavorite, setIsFavorite] = React.useState(false)

  return (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup>
        <InputGroupInput placeholder="https://x.com/shadcn" readOnly />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="Copy"
            title="Copy"
            size="icon-xs"
            onClick={() => {
              copyToClipboard("https://x.com/shadcn")
            }}
          >
            {isCopied ? <IconCheck /> : <IconCopy />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup className="[--radius:9999px]">
        <Popover>
          <PopoverTrigger asChild>
            <InputGroupAddon>
              <InputGroupButton variant="secondary" size="icon-xs">
                <IconInfoCircle />
              </InputGroupButton>
            </InputGroupAddon>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="flex flex-col gap-1 rounded-xl text-sm"
          >
            <p className="font-medium">Your connection is not secure.</p>
            <p>You should not enter any sensitive information on this site.</p>
          </PopoverContent>
        </Popover>
        <InputGroupAddon className="text-muted-foreground pl-1.5">
          https://
        </InputGroupAddon>
        <InputGroupInput id="input-secure-19" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            onClick={() => setIsFavorite(!isFavorite)}
            size="icon-xs"
          >
            <IconStar
              data-favorite={isFavorite}
              className="data-[favorite=true]:fill-blue-600 data-[favorite=true]:stroke-blue-600"
            />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Type to search..." />
        <InputGroupAddon align="inline-end">
          <InputGroupButton variant="secondary">Search</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
```

--------------------------------

### Input Group with Text Addons (TSX)

Source: https://ui.shadcn.com/docs/components/input-group

Displays input fields with text addons for currency symbols, URL prefixes, suffixes, and metadata. Supports InputGroupInput and InputGroupTextarea with inline-start, inline-end, and block-end addon positioning. Includes character counter example.

```tsx
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"

export function InputGroupTextExample() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="0.00" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>USD</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="example.com" className="!pl-0.5" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>.com</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Enter your username" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>@company.com</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea placeholder="Enter your message" />
        <InputGroupAddon align="block-end">
          <InputGroupText className="text-muted-foreground text-xs">
            120 characters left
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
```

--------------------------------

### Display Spinner in an Item Component (TypeScript)

Source: https://ui.shadcn.com/docs/components/spinner

Demonstrates how to integrate the Spinner component within an Item component to show a loading state, such as during payment processing. It utilizes Shadcn UI components like Item, ItemContent, ItemMedia, and ItemTitle to build a structured display. This example sets up a flex container with specific styling for visual presentation.

```tsx
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"

export function SpinnerDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4 [--radius:1rem]">
      <Item variant="muted">
        <ItemMedia>
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="line-clamp-1">Processing payment...</ItemTitle>
        </ItemContent>
        <ItemContent className="flex-none justify-end">
          <span className="text-sm tabular-nums">$100.00</span>
        </ItemContent>
      </Item>
    </div>
  )
}
```

--------------------------------

### Display Loading Spinners in Input Groups (Shadcn UI, TSX)

Source: https://ui.shadcn.com/docs/components/input-group

This example illustrates how to embed loading indicators, such as the `Spinner` component or `LoaderIcon`, within `InputGroup` addons. It showcases various configurations for providing visual feedback during processing or searching operations, typically with disabled input fields, to improve user experience during asynchronous tasks.

```tsx
import { LoaderIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"

export function InputGroupSpinner() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <InputGroup data-disabled>
        <InputGroupInput placeholder="Searching..." disabled />
        <InputGroupAddon align="inline-end">
          <Spinner />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup data-disabled>
        <InputGroupInput placeholder="Processing..." disabled />
        <InputGroupAddon>
          <Spinner />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup data-disabled>
        <InputGroupInput placeholder="Saving changes..." disabled />
        <InputGroupAddon align="inline-end">
          <InputGroupText>Saving...</InputGroupText>
          <Spinner />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup data-disabled>
        <InputGroupInput placeholder="Refreshing data..." disabled />
        <InputGroupAddon>
          <LoaderIcon className="animate-spin" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <InputGroupText className="text-muted-foreground">
            Please wait...
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
```

--------------------------------

### Import Menubar Components from shadcn/ui

Source: https://ui.shadcn.com/docs/components/menubar

Imports all necessary Menubar subcomponents from the shadcn/ui component library. Includes Menubar container, MenubarContent for dropdown content, MenubarItem for individual menu options, MenubarMenu for grouping, MenubarSeparator for dividers, MenubarShortcut for keyboard shortcuts, and MenubarTrigger for menu activation.

```tsx
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
```

--------------------------------

### Configure ChartTooltip with Custom Label and Name Keys

Source: https://ui.shadcn.com/docs/components/chart

Set up a chart tooltip component using labelKey and nameKey props to map custom data fields for tooltip display. The example shows mapping 'visitors' field as label and 'browser' field as name. Uses ChartTooltipContent component which automatically references colors from the chart config.

```tsx
const chartData = [
  { browser: "chrome", visitors: 187, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
]

const chartConfig = {
  visitors: {
    label: "Total Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

<ChartTooltip
  content={<ChartTooltipContent labelKey="visitors" nameKey="browser" />}
/>
```

--------------------------------

### Organize Fields for Responsive Layouts with Shadcn UI FieldGroup (TSX)

Source: https://ui.shadcn.com/docs/components/field

This TSX example showcases the `FieldGroup` component, a layout wrapper designed to stack `Field` components and enable responsive orientations. It supports container queries, allowing for dynamic layout adjustments using utility classes like `@container/field-group`.

```tsx
<FieldGroup className="@container/field-group flex flex-col gap-6">
  <Field>{/* ... */}</Field>
  <Field>{/* ... */}</Field>
</FieldGroup>
```

--------------------------------

### Full Recharts Bar Chart with XAxis, Data, and Configuration (TypeScript)

Source: https://ui.shadcn.com/docs/components/chart

This comprehensive example provides a complete React functional component (`Component`) that renders a `BarChart` with an integrated `XAxis`. It includes full data (`chartData`) and configuration (`chartConfig`) definitions, demonstrating a ready-to-use chart with basic styling and an accessible x-axis.

```tsx
"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig

export function Component() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
```

--------------------------------

### Spinner Component in Button with Loading States - React/TypeScript

Source: https://ui.shadcn.com/docs/changelog

Demonstrates how to use the Spinner component inside Button components to show loading states. This example shows three different button variants (default, outline, secondary) all with disabled state and loading spinner indicator.

```tsx
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export function SpinnerButton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Button disabled size="sm">
        <Spinner />
        Loading...
      </Button>
      <Button variant="outline" disabled size="sm">
        <Spinner />
        Please wait
      </Button>
      <Button variant="secondary" disabled size="sm">
        <Spinner />
        Processing
      </Button>
    </div>
  )
}
```

--------------------------------

### Full Recharts Bar Chart with XAxis, Tooltip, Data, and Config (TypeScript)

Source: https://ui.shadcn.com/docs/components/chart

This comprehensive example presents a full React component that renders a `BarChart` featuring both a configured `XAxis` and an interactive `ChartTooltip`. It includes all necessary imports, data (`chartData`), and chart configuration (`chartConfig`), offering a complete and functional chart with enhanced user interaction.

```tsx
"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig

export function Component() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
```

--------------------------------

### Group Form Controls with Shadcn UI FieldSet (TSX)

Source: https://ui.shadcn.com/docs/components/field

This TSX example illustrates the use of the `FieldSet` component to semantically group related form controls, enhancing both structure and accessibility. It typically includes a `FieldLegend` for the group's title and `FieldGroup` to organize the contained fields.

```tsx
<FieldSet>
  <FieldLegend>Delivery</FieldLegend>
  <FieldGroup>{/* Fields */}</FieldGroup>
</FieldSet>
```

--------------------------------

### Basic Collapsible SidebarMenu Item Structure in TSX

Source: https://ui.shadcn.com/docs/components/sidebar

This code provides a simplified structural example of how to implement a single collapsible item within a `SidebarMenu` using Shadcn UI's `Collapsible` component. It illustrates the nesting of `CollapsibleTrigger` and `CollapsibleContent` within `SidebarMenuItem` and `SidebarMenuSub` to enable basic expand/collapse functionality for menu sub-items.

```tsx
<SidebarMenu>\n  <Collapsible defaultOpen className="group/collapsible">\n    <SidebarMenuItem>\n      <CollapsibleTrigger asChild>\n        <SidebarMenuButton />\n      </CollapsibleTrigger>\n      <CollapsibleContent>\n        <SidebarMenuSub>\n          <SidebarMenuSubItem />\n        </SidebarMenuSub>\n      </CollapsibleContent>\n    </SidebarMenuItem>\n  </Collapsible>\n</SidebarMenu>
```

--------------------------------

### Configure Field Component Orientation in TSX

Source: https://ui.shadcn.com/docs/components/field

The Field component acts as a core wrapper for form fields, providing control over orientation (vertical, horizontal, responsive), invalid state styling, and spacing. This example demonstrates setting the orientation to horizontal for a label and a switch component.

```tsx
<Field orientation="horizontal">
  <FieldLabel htmlFor="remember">Remember me</FieldLabel>
  <Switch id="remember" />
</Field>
```

--------------------------------

### Implement Split Button Group with Shadcn DropdownMenu (TSX)

Source: https://ui.shadcn.com/docs/components/button-group

This example demonstrates creating a split button group by combining Shadcn's ButtonGroup with a DropdownMenu. A primary 'Follow' button is paired with a dropdown trigger button, which reveals a menu of actions like 'Mute Conversation', 'Mark as Read', and 'Delete Conversation'. The dropdown utilizes various `DropdownMenu` components such as `DropdownMenuContent`, `DropdownMenuGroup`, and `DropdownMenuItem`, along with `lucide-react` icons to visually represent each action.

```tsx
"use client"\n\nimport {\n  AlertTriangleIcon,\n  CheckIcon,\n  ChevronDownIcon,\n  CopyIcon,\n  ShareIcon,\n  TrashIcon,\n  UserRoundXIcon,\n  VolumeOffIcon,\n} from \"lucide-react\"\n\nimport { Button } from \"@/components/ui/button\"\nimport { ButtonGroup } from \"@/components/ui/button-group\"\nimport {\n  DropdownMenu,\n  DropdownMenuContent,\n  DropdownMenuGroup,\n  DropdownMenuItem,\n  DropdownMenuSeparator,\n  DropdownMenuTrigger,\n} from \"@/components/ui/dropdown-menu\"\n\nexport function ButtonGroupDropdown() {\n  return (\n    <ButtonGroup>\n      <Button variant=\"outline\">Follow</Button>\n      <DropdownMenu>\n        <DropdownMenuTrigger asChild>\n          <Button variant=\"outline\" className=\"\!pl-2\">\n            <ChevronDownIcon />\n          </Button>\n        </DropdownMenuTrigger>\n        <DropdownMenuContent align=\"end\" className=\"[--radius:1rem]\">\n          <DropdownMenuGroup>\n            <DropdownMenuItem>\n              <VolumeOffIcon />\n              Mute Conversation\n            </DropdownMenuItem>\n            <DropdownMenuItem>\n              <CheckIcon />\n              Mark as Read\n            </DropdownMenuItem>\n            <DropdownMenuItem>\n              <AlertTriangleIcon />\n              Report Conversation\n            </DropdownMenuItem>\n            <DropdownMenuItem>\n              <UserRoundXIcon />\n              Block User\n            </DropdownMenuItem>\n            <DropdownMenuItem>\n              <ShareIcon />\n              Share Conversation\n            </DropdownMenuItem>\n            <DropdownMenuItem>\n              <CopyIcon />\n              Copy Conversation\n            </DropdownMenuItem>\n          </DropdownMenuGroup>\n          <DropdownMenuSeparator />\n          <DropdownMenuGroup>\n            <DropdownMenuItem variant=\"destructive\">\n              <TrashIcon />\n              Delete Conversation\n            </DropdownMenuItem>\n          </DropdownMenuGroup>\n        </DropdownMenuContent>\n      </DropdownMenu>\n    </ButtonGroup>\n  )\n}
```

--------------------------------

### Set Fixed Cell Dimensions for Shadcn UI Calendar with CSS `rem` Units

Source: https://ui.shadcn.com/docs/components/calendar

This example illustrates setting a consistent, fixed cell size for the Shadcn UI Calendar using direct `rem` values within the `--cell-size` CSS variable. While fixed, it also demonstrates how to provide breakpoint-specific overrides for different screen sizes (e.g., `md:[--cell-size:3rem]`). This approach ensures precise control over the calendar's visual layout.

```tsx
<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-lg border [--cell-size:2.75rem] md:[--cell-size:3rem]"
/>
```

--------------------------------

### Create Complex Input Layouts with Shadcn InputGroup (TSX)

Source: https://ui.shadcn.com/docs/components/button-group

This snippet illustrates how to construct a sophisticated input field using Shadcn's InputGroup, integrated within a ButtonGroup. It features an InputGroupInput for text entry, an InputGroupAddon with an InputGroupButton for a toggleable voice mode, and a Tooltip for enhanced user feedback. The example utilizes `lucide-react` for icons and manages state with React's `useState` for the voice-enabled functionality.

```tsx
"use client"\n\nimport * as React from "react"\nimport { AudioLinesIcon, PlusIcon } from "lucide-react"\n\nimport { Button } from "@/components/ui/button"\nimport { ButtonGroup } from "@/components/ui/button-group"\nimport {\n  InputGroup,\n  InputGroupAddon,\n  InputGroupButton,\n  InputGroupInput,\n} from "@/components/ui/input-group"\nimport {\n  Tooltip,\n  TooltipContent,\n  TooltipTrigger,\n} from "@/components/ui/tooltip"\n\nexport function ButtonGroupInputGroup() {\n  const [voiceEnabled, setVoiceEnabled] = React.useState(false)\n\n  return (\n    <ButtonGroup className=\"[--radius:9999rem]\">\n      <ButtonGroup>\n        <Button variant=\"outline\" size=\"icon\">\n          <PlusIcon />\n        </Button>\n      </ButtonGroup>\n      <ButtonGroup>\n        <InputGroup>\n          <InputGroupInput\n            placeholder={\n              voiceEnabled ? \"Record and send audio...\" : \"Send a message...\"\n            }\n            disabled={voiceEnabled}\n          />\n          <InputGroupAddon align=\"inline-end\">\n            <Tooltip>\n              <TooltipTrigger asChild>\n                <InputGroupButton\n                  onClick={() => setVoiceEnabled(!voiceEnabled)}\n                  size=\"icon-xs\"\n                  data-active={voiceEnabled}\n                  className=\"data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700 dark:data-[active=true]:bg-orange-800 dark:data-[active=true]:text-orange-100\"\n                  aria-pressed={voiceEnabled}\n                >\n                  <AudioLinesIcon />\n                </InputGroupButton>\n              </TooltipTrigger>\n              <TooltipContent>Voice Mode</TooltipContent>\n            </Tooltip>\n          </InputGroupAddon>\n        </InputGroup>\n      </ButtonGroup>\n    </ButtonGroup>\n  )\n}
```

--------------------------------

### Fetch Projects with SWR - React TypeScript

Source: https://ui.shadcn.com/docs/components/sidebar

Fetches project data using SWR hook with loading state management and skeleton UI fallback. Displays a sidebar menu with project links and icons. Handles loading and empty data states before rendering the project list.

```typescript
function NavProjects() {
  const { data, isLoading } = useSWR("/api/projects", fetcher)

  if (isLoading) {
    return (
      <SidebarMenu>
        {Array.from({ length: 5 }).map((_, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuSkeleton showIcon />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    )
  }

  if (!data) {
    return ...
  }

  return (
    <SidebarMenu>
      {data.map((project) => (
        <SidebarMenuItem key={project.name}>
          <SidebarMenuButton asChild>
            <a href={project.url}>
              <project.icon />
              <span>{project.name}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
```

--------------------------------

### Implement a multi-section form layout with Shadcn UI components

Source: https://ui.shadcn.com/docs/changelog

This snippet demonstrates how to structure a complex form using Shadcn UI's Field, FieldGroup, FieldSet, and FieldSeparator components. It includes examples of Select, Input, Checkbox, Textarea, and Button components, illustrating common form elements and their associated labels and descriptions. Dependencies include various Shadcn UI form and input components, and it's intended to be used within a React/Next.js application.

```tsx
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                      <SelectItem value="2028">2028</SelectItem>
                      <SelectItem value="2029">2029</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="checkout-7j9-cvv">CVV</FieldLabel>
                  <Input id="checkout-7j9-cvv" placeholder="123" required />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>Billing Address</FieldLegend>
            <FieldDescription>
              The billing address associated with your payment method
            </FieldDescription>
            <FieldGroup>
              <Field orientation="horizontal">
                <Checkbox
                  id="checkout-7j9-same-as-shipping-wgm"
                  defaultChecked
                />
                <FieldLabel
                  htmlFor="checkout-7j9-same-as-shipping-wgm"
                  className="font-normal"
                >
                  Same as shipping address
                </FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-optional-comments">
                  Comments
                </FieldLabel>
                <Textarea
                  id="checkout-7j9-optional-comments"
                  placeholder="Add any additional comments"
                  className="resize-none"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
```

--------------------------------

### Reference Themed Colors in Shadcn UI Chart Components (TypeScript/React)

Source: https://ui.shadcn.com/docs/components/chart

This snippet demonstrates how to apply defined theme colors to chart components using the `fill` prop with a CSS variable reference, for example, `var(--color-desktop)`. This ensures consistency with the chart's overall theme configuration.

```tsx
<Bar dataKey="desktop" fill="var(--color-desktop)" />
```

--------------------------------

### shadcn Registry: Custom Unauthorized Access Error Message

Source: https://ui.shadcn.com/docs/changelog

Registry authors can provide custom, actionable error messages in their API responses. This example shows an 'Unauthorized' error, detailing that an API key has expired and providing a renewal link, aiding users and AI agents in quick problem resolution.

```txt
Error:
You are not authorized to access the item at http://example.com/r/component.

Message:
[Unauthorized] Your API key has expired. Renew it at https://example.com/api/renew-key.
```

--------------------------------

### Render Custom Component with ButtonGroupText asChild (Shadcn UI, React)

Source: https://ui.shadcn.com/docs/components/button-group

This advanced example demonstrates using the `asChild` prop with `ButtonGroupText` to render a custom component, specifically a `Label`, within the button group. This provides flexibility to integrate other UI elements while maintaining the `ButtonGroup`'s styling and layout properties.

```tsx
import { ButtonGroupText } from \"@/components/ui/button-group\"\nimport { Label } from \"@/components/ui/label\"\n\nexport function ButtonGroupTextDemo() {\n  return (\n    <ButtonGroup>\n      <ButtonGroupText asChild>\n        <Label htmlFor=\"name\">Text</Label>\n      </ButtonGroupText>\n      <Input placeholder=\"Type something here...\" id=\"name\" />\n    </ButtonGroup>\n  )\n}
```

--------------------------------

### Add Accessibility Label to NativeSelect Component (tsx)

Source: https://ui.shadcn.com/docs/components/native-select

This example demonstrates enhancing accessibility for the `NativeSelect` component by using the `aria-label` attribute. The label provides a descriptive text for screen readers, ensuring users understand the purpose of the select input. It contains options for different languages.

```tsx
<NativeSelect aria-label="Choose your preferred language">
  <NativeSelectOption value="en">English</NativeSelectOption>
  <NativeSelectOption value="es">Spanish</NativeSelectOption>
  <NativeSelectOption value="fr">French</NativeSelectOption>
</NativeSelect>
```

--------------------------------

### Toggle Group with Spacing and Custom Colors

Source: https://ui.shadcn.com/docs/components/toggle-group

Advanced example showcasing multiple toggle items with custom styling using Tailwind CSS data attributes. Each item displays an icon from lucide-react with conditional fill and stroke colors that change when toggled on. Includes spacing configuration and small size variant.

```tsx
import { BookmarkIcon, HeartIcon, StarIcon } from "lucide-react"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export function ToggleGroupSpacing() {
  return (
    <ToggleGroup type="multiple" variant="outline" spacing={2} size="sm">
      <ToggleGroupItem
        value="star"
        aria-label="Toggle star"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-yellow-500 data-[state=on]:*:[svg]:stroke-yellow-500"
      >
        <StarIcon />
        Star
      </ToggleGroupItem>
      <ToggleGroupItem
        value="heart"
        aria-label="Toggle heart"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-red-500 data-[state=on]:*:[svg]:stroke-red-500"
      >
        <HeartIcon />
        Heart
      </ToggleGroupItem>
      <ToggleGroupItem
        value="bookmark"
        aria-label="Toggle bookmark"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-blue-500 data-[state=on]:*:[svg]:stroke-blue-500"
      >
        <BookmarkIcon />
        Bookmark
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
```

--------------------------------

### Apply Custom Spinner Colors with Utility Classes (TypeScript)

Source: https://ui.shadcn.com/docs/components/spinner

Demonstrates how to customize the color of the Spinner component using Tailwind CSS `text-*` utility classes. This example displays several spinners, each with a different color applied, such as red, green, blue, yellow, and purple. It highlights the flexibility in styling the spinner to match specific brand guidelines or UI themes.

```tsx
import { Spinner } from "@/components/ui/spinner"

export function SpinnerColor() {
  return (
    <div className="flex items-center gap-6">
      <Spinner className="size-6 text-red-500" />
      <Spinner className="size-6 text-green-500" />
      <Spinner className="size-6 text-blue-500" />
      <Spinner className="size-6 text-yellow-500" />
      <Spinner className="size-6 text-purple-500" />
    </div>
  )
}
```

--------------------------------

### Import and Basic Badge Usage

Source: https://ui.shadcn.com/docs/components/badge

Shows how to import the Badge component and use it with different variants. Supports four variant options: default, outline, secondary, and destructive for different visual styles.

```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="default | outline | secondary | destructive">Badge</Badge>
```

--------------------------------

### Configure Basic Version Parameter for Registry Resources

Source: https://ui.shadcn.com/docs/registry/namespace

Sets up a versioned registry using query parameters to control which version of resources are resolved. Allows pinning specific versions across the registry.

```json
{
  "@versioned": {
    "url": "https://registry.example.com/{name}",
    "params": {
      "version": "v2"
    }
  }
}
```

--------------------------------

### Define Array Field Structure with Shadcn Components

Source: https://ui.shadcn.com/docs/forms/react-hook-form

This JSX snippet illustrates how to structure an array field using Shadcn's `FieldSet`, `FieldLegend`, and `FieldDescription` components. This setup provides semantic grouping and a clear description for a collection of dynamic array items.

```tsx
<FieldSet className="gap-4">
  <FieldLegend variant="label">Email Addresses</FieldLegend>
  <FieldDescription>
    Add up to 5 email addresses where we can contact you.
  </FieldDescription>
  <FieldGroup className="gap-4">{/* Array items go here */}</FieldGroup>
</FieldSet>
```

--------------------------------

### Basic usage of Shadcn UI ToggleGroup component in TSX

Source: https://ui.shadcn.com/docs/components/toggle-group

This snippet provides a minimal example of the `ToggleGroup` component from Shadcn UI. It demonstrates a single-selection type (`type="single"`) with an `outline` variant and small size (`size="sm"`). It defines two simple `ToggleGroupItem` elements.

```tsx
<ToggleGroup type="single" variant="outline" size="sm">
  <ToggleGroupItem value="a">A</ToggleGroupItem>
  <ToggleGroupItem value="b">B</ToggleGroupItem>
</ToggleGroup>
```

--------------------------------

### Build an Accessible Form with Shadcn UI Field Components (TSX)

Source: https://ui.shadcn.com/docs/components/field

This TypeScript React example demonstrates how to construct a complex, accessible form using various Shadcn UI components. It combines Field, FieldGroup, FieldSet, FieldLabel, FieldDescription, Input, Select, and Checkbox to create a payment and billing information form with proper semantic structure and accessibility attributes.

```tsx
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function FieldDemo() {
  return (
    <div className="w-full max-w-md">
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Payment Method</FieldLegend>
            <FieldDescription>
              All transactions are secure and encrypted
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-name-43j">
                  Name on Card
                </FieldLabel>
                <Input
                  id="checkout-7j9-card-name-43j"
                  placeholder="Evil Rabbit"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-number-uw1">
                  Card Number
                </FieldLabel>
                <Input
                  id="checkout-7j9-card-number-uw1"
                  placeholder="1234 5678 9012 3456"
                  required
                />
                <FieldDescription>
                  Enter your 16-digit card number
                </FieldDescription>
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="checkout-exp-month-ts6">
                    Month
                  </FieldLabel>
                  <Select defaultValue="">
                    <SelectTrigger id="checkout-exp-month-ts6">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01">01</SelectItem>
                      <SelectItem value="02">02</SelectItem>
                      <SelectItem value="03">03</SelectItem>
                      <SelectItem value="04">04</SelectItem>
                      <SelectItem value="05">05</SelectItem>
                      <SelectItem value="06">06</SelectItem>
                      <SelectItem value="07">07</SelectItem>
                      <SelectItem value="08">08</SelectItem>
                      <SelectItem value="09">09</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="11">11</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="checkout-7j9-exp-year-f59">
                    Year
                  </FieldLabel>
                  <Select defaultValue="">
                    <SelectTrigger id="checkout-7j9-exp-year-f59">
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                      <SelectItem value="2028">2028</SelectItem>
                      <SelectItem value="2029">2029</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="checkout-7j9-cvv">CVV</FieldLabel>
                  <Input id="checkout-7j9-cvv" placeholder="123" required />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>Billing Address</FieldLegend>
            <FieldDescription>
              The billing address associated with your payment method
            </FieldDescription>
            <FieldGroup>
              <Field orientation="horizontal">
                <Checkbox
                  id="checkout-7j9-same-as-shipping-wgm"
                  defaultChecked
                />
                <FieldLabel
                  htmlFor="checkout-7j9-same-as-shipping-wgm"
                  className="font-normal"
                >
                  Same as shipping address
                </FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSet>
            <FieldGroup>
              <Field>

```

--------------------------------

### Implement Textarea with TanStack React Form and Zod Validation

Source: https://ui.shadcn.com/docs/forms/tanstack-form

This example demonstrates a complete React component (`FormTanstackTextarea`) that integrates a Shadcn UI `Textarea` with `@tanstack/react-form` for state management and Zod for validation. It showcases form submission with `sonner` toasts, dynamic error display, and reset functionality.

```tsx
/* eslint-disable react/no-children-prop */
"use client"

import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  about: z
    .string()
    .min(10, "Please provide at least 10 characters.")
    .max(200, "Please keep it under 200 characters."),
})

export function FormTanstackTextarea() {
  const form = useForm({
    defaultValues: {
      about: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      toast("You submitted the following values:", {
        description: (
          <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
            <code>{JSON.stringify(value, null, 2)}</code>
          </pre>
        ),
        position: "bottom-right",
        classNames: {
          content: "flex flex-col gap-2",
        },
        style: {
          "--border-radius": "calc(var(--radius)  + 4px)",
        } as React.CSSProperties,
      })
    },
  })

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Personalization</CardTitle>
        <CardDescription>
          Customize your experience by telling us more about yourself.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="form-tanstack-textarea"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="about"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="form-tanstack-textarea-about">
                      More about you
                    </FieldLabel>
                    <Textarea
                      id="form-tanstack-textarea-about"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="I'm a software engineer..."
                      className="min-h-[120px]"
                    />
                    <FieldDescription>
                      Tell us more about yourself. This will be used to help us
                      personalize your experience.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="form-tanstack-textarea">
            Save
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
```

--------------------------------

### Embed Spinner within a Badge for Status Indication (TypeScript)

Source: https://ui.shadcn.com/docs/components/spinner

Illustrates the usage of a Spinner component inside a Badge to signify an ongoing process or status. This example displays several badges with different variants (default, secondary, outline), each containing a spinner and relevant text like 'Syncing' or 'Updating'. It demonstrates how to visually enhance status indicators with an animated element.

```tsx
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

export function SpinnerBadge() {
  return (
    <div className="flex items-center gap-4 [--radius:1.2rem]">
      <Badge>
        <Spinner />
        Syncing
      </Badge>
      <Badge variant="secondary">
        <Spinner />
        Updating
      </Badge>
      <Badge variant="outline">
        <Spinner />
        Processing
      </Badge>
    </div>
  )
}
```

--------------------------------

### Integrate Spinner into a Button for Loading State (TypeScript)

Source: https://ui.shadcn.com/docs/components/spinner

Shows how to embed a Spinner component within a button to visually indicate a loading or processing state. This example includes multiple buttons with different variants (default, outline, secondary) and disabled states, each displaying a spinner alongside descriptive text. The Button component automatically handles the appropriate spacing between the spinner and its content.

```tsx
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export function SpinnerButton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Button disabled size="sm">
        <Spinner />
        Loading...
      </Button>
      <Button variant="outline" disabled size="sm">
        <Spinner />
        Please wait
      </Button>
      <Button variant="secondary" disabled size="sm">
        <Spinner />
        Processing
      </Button>
    </div>
  )
}
```

--------------------------------

### Configure Files for a Registry Item in JSON

Source: https://ui.shadcn.com/docs/registry/registry-item-json

This JSON snippet demonstrates how to define files for a registry item, specifying their paths, types (e.g., page, component, hook, file), and optional target locations within a project. The `target` property is crucial for `registry:page` and `registry:file` types to dictate where the file should be placed, with `~` referring to the project root.

```json
{
  "files": [
    {
      "path": "registry/new-york/hello-world/page.tsx",
      "type": "registry:page",
      "target": "app/hello/page.tsx"
    },
    {
      "path": "registry/new-york/hello-world/hello-world.tsx",
      "type": "registry:component"
    },
    {
      "path": "registry/new-york/hello-world/use-hello-world.ts",
      "type": "registry:hook"
    },
    {
      "path": "registry/new-york/hello-world/.env",
      "type": "registry:file",
      "target": "~/.env"
    }
  ]
}
```

--------------------------------

### Render a Submit Button for React Hook Form

Source: https://ui.shadcn.com/docs/forms/react-hook-form

Demonstrates rendering a submit button within a Shadcn UI CardFooter component. The button is explicitly linked to a form via its `form` attribute for submission, indicating its role in a larger React Hook Form setup.

```tsx
<Button type="submit" form="form-rhf-demo">
  Submit
</Button>
```

--------------------------------

### Adjust Spinner Size with Utility Classes (TypeScript)

Source: https://ui.shadcn.com/docs/components/spinner

Illustrates how to change the visual size of the Spinner component using Tailwind CSS `size-*` utility classes directly via the `className` prop. This example renders multiple spinners with different predefined sizes, including `size-3`, `size-4`, `size-6`, and `size-8`. It provides a clear demonstration of how to apply various size variations to the spinner.

```tsx
import { Spinner } from "@/components/ui/spinner"

export function SpinnerSize() {
  return (
    <div className="flex items-center gap-6">
      <Spinner className="size-3" />
      <Spinner className="size-4" />
      <Spinner className="size-6" />
      <Spinner className="size-8" />
    </div>
  )
}
```

--------------------------------

### Implement and Customize Shadcn UI Tooltip Component in React (TSX)

Source: https://ui.shadcn.com/docs/components/chart

This React component demonstrates how to use and customize the `TooltipDemo` component from Shadcn UI. It shows examples of setting labels, defining data payloads with names, values, and fill colors, and specifying different indicator types (default, dashed, line, dot). The component uses utility functions for class name concatenation and integrates SVG elements for visual context.

```tsx
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export function Component() {
  return (
    <div className="text-foreground grid aspect-video w-full max-w-md justify-center md:grid-cols-2 [&>div]:relative [&>div]:flex [&>div]:h-[137px] [&>div]:w-[224px] [&>div]:items-center [&>div]:justify-center [&>div]:p-4">
      <div>
        <div className="absolute top-[45px] left-[-35px] z-10 text-sm font-medium">
          Label
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 193 40"
          width="50"
          height="12"
          fill="none"
          className="absolute top-[50px] left-[5px] z-10"
        >
          <g clipPath="url(#a)">
            <path
              fill="currentColor"
              d="M173.928 21.13C115.811 44.938 58.751 45.773 0 26.141c4.227-4.386 7.82-2.715 10.567-1.88 21.133 5.64 42.9 6.266 64.457 7.101 31.066 1.253 60.441-5.848 89.183-17.335 1.268-.418 2.325-1.253 4.861-2.924-14.582-2.924-29.165 2.089-41.845-3.76.212-.835.212-1.879.423-2.714 9.51-.627 19.231-1.253 28.742-2.089 9.51-.835 18.808-1.88 28.318-2.506 6.974-.418 9.933 2.924 7.397 9.19-3.17 8.145-7.608 15.664-11.623 23.391-.423.836-1.057 1.88-1.902 2.298-2.325.835-4.65 1.044-7.186 1.67-.422-2.088-1.479-4.386-1.268-6.265.423-2.506 1.902-4.595 3.804-9.19Z"
            />
          </g>
          <defs>
            <clipPath id="a">
              <path fill="currentColor" d="M0 0h193v40H0z" />
            </clipPath>
          </defs>
        </svg>
        <TooltipDemo
          label="Page Views"
          payload={[
            { name: "Desktop", value: 186, fill: "hsl(var(--chart-1))" },
            { name: "Mobile", value: 80, fill: "hsl(var(--chart-2))" },
          ]}
          className="w-[8rem]"
        />
      </div>
      <div className="items-end">
        <div className="absolute top-[0px] left-[122px] z-10 text-sm font-medium">
          Name
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="35"
          height="42"
          fill="none"
          viewBox="0 0 122 148"
          className="absolute top-[10px] left-[85px] z-10 -scale-x-100"
        >
          <g clipPath="url(#ab)">
            <path
              fill="currentColor"
              d="M0 2.65c6.15-4.024 12.299-2.753 17.812-.847a115.56 115.56 0 0 1 21.84 10.59C70.4 32.727 88.849 61.744 96.483 97.54c1.908 9.108 2.544 18.639 3.817 29.017 8.481-4.871 12.934-14.402 21.416-19.909 1.061 4.236-1.06 6.989-2.756 9.319-6.998 9.531-14.207 19.062-21.63 28.382-3.604 4.448-6.36 4.871-10.177 1.059-8.058-7.837-12.935-17.368-14.42-28.382 0-.424.636-1.059 1.485-2.118 9.118 2.33 6.997 13.979 14.843 18.215 3.393-14.614.848-28.593-2.969-42.149-4.029-14.19-9.33-27.746-17.812-39.82-8.27-11.86-18.66-21.392-30.11-30.287C26.93 11.758 14.207 6.039 0 2.65Z"
            />
          </g>
          <defs>
            <clipPath id="ab">
              <path fill="currentColor" d="M0 0h122v148H0z" />
            </clipPath>
          </defs>
        </svg>
        <TooltipDemo
          label="Browser"
          hideLabel
          payload={[
            { name: "Chrome", value: 1286, fill: "hsl(var(--chart-3))" },
            { name: "Firefox", value: 1000, fill: "hsl(var(--chart-4))" },
          ]}
          indicator="dashed"
          className="w-[8rem]"
        />
      </div>
      <div className="!hidden md:!flex">
        <TooltipDemo
          label="Page Views"
          payload={[
            { name: "Desktop", value: 12486, fill: "hsl(var(--chart-3))" },
          ]}
          className="w-[9rem]"
          indicator="line"
        />
      </div>
      <div className="!items-start !justify-start">
        <div className="absolute top-[60px] left-[50px] z-10 text-sm font-medium">
          Indicator
        </div>
        <TooltipDemo
          label="Browser"
          hideLabel
          payload={[
            { name: "Chrome", value: 1286, fill: "hsl(var(--chart-1))" },
          ]}
          indicator="dot"
          className="w-[8rem]"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="34"
          fill="none"
          viewBox="0 0 75 175"
          className="absolute top-[38px] left-[30px] z-10 rotate-[-40deg]"
        >
          <g clipPath="url(#abc)">
            <path
              fill="currentColor"
```

--------------------------------

### Understand `npm` Peer Dependency Error for React 19

Source: https://ui.shadcn.com/docs/react-19

This `npm` error output demonstrates a common `ERESOLVE` issue encountered when a package's peer dependencies do not explicitly list React 19. It indicates a conflict where the root project uses React 19 but a dependency expects an older version, leading to installation failure.

```bash
npm error code ERESOLVE
npm error ERESOLVE unable to resolve dependency tree
npm error
npm error While resolving: my-app@0.1.0
npm error Found: react@19.0.0-rc-69d4b800-20241021
npm error node_modules/react
npm error   react@"19.0.0-rc-69d4b800-20241021" from the root project
```

--------------------------------

### Implement React Hook Form Radio Group with Zod and Shadcn UI

Source: https://ui.shadcn.com/docs/forms/react-hook-form

This comprehensive example showcases how to build a subscription plan selection form using Shadcn UI's RadioGroup, managed by React Hook Form, and validated with Zod. It includes state management for radio inputs, error display using `FieldError`, and form submission handling with `sonner` toasts.

```tsx
"use client"\n\nimport * as React from \"react\"\nimport { zodResolver } from \"@hookform/resolvers/zod\"\nimport { Controller, useForm } from \"react-hook-form\"\nimport { toast } from \"sonner\"\nimport * as z from \"zod\"\n\nimport { Button } from \"@/components/ui/button\"\nimport {\n  Card,\n  CardContent,\n  CardDescription,\n  CardFooter,\n  CardHeader,\n  CardTitle,\n} from \"@/components/ui/card\"\nimport {\n  Field,\n  FieldContent,\n  FieldDescription,\n  FieldError,\n  FieldGroup,\n  FieldLabel,\n  FieldLegend,\n  FieldSet,\n  FieldTitle,\n} from \"@/components/ui/field\"\nimport {\n  RadioGroup,\n  RadioGroupItem,\n} from \"@/components/ui/radio-group\"\n\nconst plans = [\n  {\n    id: \"starter\",\n    title: \"Starter (100K tokens/month)\",\n    description: \"For everyday use with basic features.\",\n  },\n  {\n    id: \"pro\",\n    title: \"Pro (1M tokens/month)\",\n    description: \"For advanced AI usage with more features.\",\n  },\n  {\n    id: \"enterprise\",\n    title: \"Enterprise (Unlimited tokens)\",\n    description: \"For large teams and heavy usage.\",\n  },\n] as const\n\nconst formSchema = z.object({\n  plan: z.string().min(1, \"You must select a subscription plan to continue.\"),\n})\n\nexport function FormRhfRadioGroup() {\n  const form = useForm<z.infer<typeof formSchema>>({\n    resolver: zodResolver(formSchema),\n    defaultValues: {\n      plan: \"\",\n    },\n  })\n\n  function onSubmit(data: z.infer<typeof formSchema>) {\n    toast(\"You submitted the following values:\", {\n      description: (\n        <pre className=\"bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4\">\n          <code>{JSON.stringify(data, null, 2)}</code>\n        </pre>\n      ),\n      position: \"bottom-right\",\n      classNames: {\n        content: \"flex flex-col gap-2\",\n      },\n      style: {\n        \"--border-radius\": \"calc(var(--radius)  + 4px)\",\n      } as React.CSSProperties,\n    })\n  }\n\n  return (\n    <Card className=\"w-full sm:max-w-md\">\n      <CardHeader>\n        <CardTitle>Subscription Plan</CardTitle>\n        <CardDescription>\n          See pricing and features for each plan.\n        </CardDescription>\n      </CardHeader>\n      <CardContent>\n        <form id=\"form-rhf-radiogroup\" onSubmit={form.handleSubmit(onSubmit)}>\n          <FieldGroup>\n            <Controller\n              name=\"plan\"\n              control={form.control}\n              render={({ field, fieldState }) => (\n                <FieldSet data-invalid={fieldState.invalid}>\n                  <FieldLegend>Plan</FieldLegend>\n                  <FieldDescription>\n                    You can upgrade or downgrade your plan at any time.\n                  </FieldDescription>\n                  <RadioGroup\n                    name={field.name}\n                    value={field.value}\n                    onValueChange={field.onChange}\n                    aria-invalid={fieldState.invalid}\n                  >\n                    {plans.map((plan) => (\n                      <FieldLabel\n                        key={plan.id}\n                        htmlFor={`form-rhf-radiogroup-${plan.id}`}\n                      >\n                        <Field\n                          orientation=\"horizontal\"\n                          data-invalid={fieldState.invalid}\n                        >\n                          <FieldContent>\n                            <FieldTitle>{plan.title}</FieldTitle>\n                            <FieldDescription>\n                              {plan.description}\n                            </FieldDescription>\n                          </FieldContent>\n                          <RadioGroupItem\n                            value={plan.id}\n                            id={`form-rhf-radiogroup-${plan.id}`}\n                            aria-invalid={fieldState.invalid}\n                          />\n                        </Field>\n                      </FieldLabel>\n                    ))}\n                  </RadioGroup>\n                  {fieldState.invalid && (\n                    <FieldError errors={[fieldState.error]} />\n                  )}\n                </FieldSet>\n              )}\n            />\n          </FieldGroup>\n        </form>\n      </CardContent>\n      <CardFooter>\n        <Field orientation=\"horizontal\">\n          <Button type=\"button\" variant=\"outline\" onClick={() => form.reset()}>\n            Reset\n          </Button>\n          <Button type=\"submit\" form=\"form-rhf-radiogroup\">\n            Save\n          </Button>\n        </Field>\n      </CardFooter>\n    </Card>\n  )\n}
```

--------------------------------

### Manage Select Component with React Hook Form

Source: https://ui.shadcn.com/docs/forms/react-hook-form

This example demonstrates how to connect a Shadcn UI `Select` component, used for choosing a billing period, to React Hook Form's `Controller`. It ensures the selected value is reflected in the form state and handles invalid states for styling.

```tsx
            <Controller
              name="billingPeriod"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-complex-billingPeriod">
                    Billing Period
                  </FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="form-rhf-complex-billingPeriod"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Choose how often you want to be billed.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
```

--------------------------------

### Configure CSS Variables for Shadcn UI Sidebar

Source: https://ui.shadcn.com/docs/components/sidebar

This CSS block defines custom properties (variables) for the Shadcn UI Sidebar component, including its background, foreground, primary, accent, border, and ring colors for both light and dark themes. These variables are typically placed in `app/globals.css` and can be overridden for custom theming, applying to both CLI and manual installations.

```css
@layer base {
  :root {
    --sidebar: oklch(0.985 0 0);
    --sidebar-foreground: oklch(0.145 0 0);
    --sidebar-primary: oklch(0.205 0 0);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.97 0 0);
    --sidebar-accent-foreground: oklch(0.205 0 0);
    --sidebar-border: oklch(0.922 0 0);
    --sidebar-ring: oklch(0.708 0 0);
  }

  .dark {
    --sidebar: oklch(0.205 0 0);
    --sidebar-foreground: oklch(0.985 0 0);
    --sidebar-primary: oklch(0.488 0.243 264.376);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.269 0 0);
    --sidebar-accent-foreground: oklch(0.985 0 0);
    --sidebar-border: oklch(1 0 0 / 10%);
    --sidebar-ring: oklch(0.439 0 0);
  }
}
```

--------------------------------

### Add Pagination Controls to Shadcn UI Table (React/TypeScript)

Source: https://ui.shadcn.com/docs/components/data-table

Integrate previous and next page buttons into a Shadcn UI DataTable component. This example uses `@tanstack/react-table`'s `table.previousPage()` and `table.nextPage()` methods, along with `Button` components from Shadcn UI, disabling them when navigation is not possible via `getCanPreviousPage()` and `getCanNextPage()`.

```tsx
import { Button } from "@/components/ui/button"

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          { // .... }
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
```

--------------------------------

### Configure TanStack Form Validation Modes (TSX)

Source: https://ui.shadcn.com/docs/forms/tanstack-form

This example illustrates how to configure multiple validation modes within TanStack Form's `validators` option. By specifying `onSubmit`, `onChange`, and `onBlur`, validation can be triggered at different interaction points, providing flexible user feedback.

```tsx
const form = useForm({
  defaultValues: {
    title: "",
    description: "",
  },
  validators: {
    onSubmit: formSchema,
    onChange: formSchema,
    onBlur: formSchema,
  },
})
```

--------------------------------

### Complete Table Demo with Sample Data

Source: https://ui.shadcn.com/docs/components/table

A full implementation of the Table component displaying invoice data with headers, body, and footer. Includes sample data structure and demonstrates mapping over data to create table rows.

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
]

export function TableDemo() {
  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
```

--------------------------------

### Configure Dependency Resolution Order for Dashboard Component

Source: https://ui.shadcn.com/docs/registry/namespace

Shows how multiple dependencies are resolved in order, with later dependencies potentially overriding earlier ones if they target the same file path. Useful for understanding resolution precedence in complex component hierarchies.

```json
{
  "name": "dashboard",
  "registryDependencies": [
    "@shadcn/card",
    "@vendor/chart",
    "@custom/card"
  ]
}
```

--------------------------------

### Item Link Component with asChild Prop in TSX

Source: https://ui.shadcn.com/docs/components/item

Renders Item components as anchor links with hover and focus states applied to the anchor element using the asChild prop. Includes examples of internal links with chevron icons and external links with security attributes and external link icons from lucide-react.

```tsx
import { ChevronRightIcon, ExternalLinkIcon } from "lucide-react"

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"

export function ItemLink() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Item asChild>
        <a href="#">
          <ItemContent>
            <ItemTitle>Visit our documentation</ItemTitle>
            <ItemDescription>
              Learn how to get started with our components.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <ChevronRightIcon className="size-4" />
          </ItemActions>
        </a>
      </Item>
      <Item variant="outline" asChild>
        <a href="#" target="_blank" rel="noopener noreferrer">
          <ItemContent>
            <ItemTitle>External resource</ItemTitle>
            <ItemDescription>
              Opens in a new tab with security attributes.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <ExternalLinkIcon className="size-4" />
          </ItemActions>
        </a>
      </Item>
    </div>
  )
}
```

--------------------------------

### Commit Pending Changes Before Component Updates

Source: https://ui.shadcn.com/docs/tailwind-v4

This `bash` command sequence is recommended before running CLI tools that might overwrite components. It stages all changes and commits them, ensuring a recoverable state.

```bash
git add .
git commit -m "..."
```

--------------------------------

### Implement Shadcn UI Select with TanStack Form and Zod Validation in React

Source: https://ui.shadcn.com/docs/forms/tanstack-form

This example demonstrates how to build a form with a Select input using `@tanstack/react-form` for form state management and `zod` for schema validation. It integrates Shadcn UI's `Select` component, utilizing `SelectTrigger`, `SelectValue`, `SelectContent`, and `SelectItem` to construct the user interface. The snippet also illustrates how to handle and display validation errors by conditionally setting `aria-invalid` on the `SelectTrigger` and `data-invalid` on the `Field` component.

```tsx
/* eslint-disable react/no-children-prop */
"use client"

import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const spokenLanguages = [
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Italian", value: "it" },
  { label: "Chinese", value: "zh" },
  { label: "Japanese", value: "ja" },
] as const

const formSchema = z.object({
  language: z
    .string()
    .min(1, "Please select your spoken language.")
    .refine((val) => val !== "auto", {
      message:
        "Auto-detection is not allowed. Please select a specific language.",
    }),
})

export function FormTanstackSelect() {
  const form = useForm({
    defaultValues: {
      language: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      toast("You submitted the following values:", {
        description: (
          <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
            <code>{JSON.stringify(value, null, 2)}</code>
          </pre>
        ),
        position: "bottom-right",
        classNames: {
          content: "flex flex-col gap-2",
        },
        style: {
          "--border-radius": "calc(var(--radius)  + 4px)",
        } as React.CSSProperties,
      })
    },
  })

  return (
    <Card className="w-full sm:max-w-lg">
      <CardHeader>
        <CardTitle>Language Preferences</CardTitle>
        <CardDescription>
          Select your preferred spoken language.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="form-tanstack-select"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="language"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field orientation="responsive" data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor="form-tanstack-select-language">
                        Spoken Language
                      </FieldLabel>
                      <FieldDescription>
                        For best results, select the language you speak.
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger
                        id="form-tanstack-select-language"
                        aria-invalid={isInvalid}
                        className="min-w-[120px]"
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectSeparator />
                        {spokenLanguages.map((language) => (
                          <SelectItem
                            key={language.value}
                            value={language.value}
                          >
                            {language.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="form-tanstack-select">
            Save
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
```

--------------------------------

### Make Shadcn UI Table Header Cell Sortable (React/TypeScript)

Source: https://ui.shadcn.com/docs/components/data-table

Modify a specific `ColumnDef` to render a sortable header cell for a Shadcn UI table. This example shows how to add a `Button` with an `ArrowUpDown` icon to the 'email' column header, allowing users to toggle sorting direction using `column.toggleSorting()`.

```tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
]
```

--------------------------------

### React Suspense Integration with Server Components

Source: https://ui.shadcn.com/docs/components/sidebar

Demonstrates proper integration of React.Suspense with server components to handle asynchronous data fetching. The Suspense boundary wraps the NavProjects server component and displays NavProjectsSkeleton as a fallback UI. This pattern enables progressive rendering and improved user experience.

```tsx
function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <React.Suspense fallback={<NavProjectsSkeleton />}>
              <NavProjects />
            </React.Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
```

--------------------------------

### Update All Shadcn UI Components via CLI

Source: https://ui.shadcn.com/docs/tailwind-v4

This `bash` command uses the Shadcn CLI to add or update all components, with the `--overwrite` flag indicating that existing component files will be replaced. It's crucial for applying new component versions or dark mode changes.

```bash
npx shadcn@latest add --all --overwrite
```

--------------------------------

### Implement a React Select Field with Form Validation

Source: https://ui.shadcn.com/docs/forms/tanstack-form

This example showcases a `form.Field` component that renders a dropdown `Select` for choosing a billing period. It integrates with the form's state (`field.state.value`, `field.handleChange`) and displays validation errors using `FieldError` based on the `isInvalid` status, providing clear user feedback.

```tsx
<form.Field
  name="billingPeriod"
  children={(field) => {
    const isInvalid =
      field.state.meta.isTouched && !field.state.meta.isValid
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name}>Billing Period</FieldLabel>
        <Select
          name={field.name}
          value={field.state.value}
          onValueChange={field.handleChange}
          aria-invalid={isInvalid}
        >
          <SelectTrigger id={field.name}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
        <FieldDescription>
          Choose how often you want to be billed.
        </FieldDescription>
        {isInvalid && (
          <FieldError errors={field.state.meta.errors} />
        )}
      </Field>
    )
  }}
/>
```

--------------------------------

### Configure Shadcn Registry with Query Parameter Authentication (JSON)

Source: https://ui.shadcn.com/docs/registry/namespace

This configuration illustrates authenticating a shadcn registry by including credentials as query parameters. The `params` object defines keys like `api_key`, `client_id`, and `signature`, which are dynamically populated from respective environment variables for secure access.

```json
{
  "@secure": {
    "url": "https://registry.example.com/{name}.json",
    "params": {
      "api_key": "${API_KEY}",
      "client_id": "${CLIENT_ID}",
      "signature": "${REQUEST_SIGNATURE}"
    }
  }
}
```

--------------------------------

### Apply Invalid State to NativeSelect Component (tsx)

Source: https://ui.shadcn.com/docs/components/native-select

This snippet shows a direct example of applying the `aria-invalid="true"` attribute to a `NativeSelect` component. This attribute signals to assistive technologies and styling systems that the input currently holds an invalid value. It includes several `NativeSelectOption` elements for various countries.

```tsx
<NativeSelect aria-invalid="true">
  <NativeSelectOption value="">Select a country</NativeSelectOption>
  <NativeSelectOption value="us">United States</NativeSelectOption>
  <NativeSelectOption value="uk">United Kingdom</NativeSelectOption>
  <NativeSelectOption value="ca">Canada</NativeSelectOption>
</NativeSelect>
```

--------------------------------

### Render a Basic Command Menu Structure in React (TypeScript)

Source: https://ui.shadcn.com/docs/components/command

This code demonstrates the fundamental JSX structure required to render a basic `Command` menu component. It includes a search input, a list of items organized under 'Suggestions' and 'Settings' headings, and a visual separator. This provides a functional yet minimal command palette capable of basic user interaction and navigation.

```tsx
<Command>
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
      <CommandItem>Search Emoji</CommandItem>
      <CommandItem>Calculator</CommandItem>
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Settings">
      <CommandItem>Profile</CommandItem>
      <CommandItem>Billing</CommandItem>
      <CommandItem>Settings</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

--------------------------------

### Implement a Full Command Menu Demo in React (TypeScript)

Source: https://ui.shadcn.com/docs/components/command

This code showcases a complete implementation of the `Command` menu component in React using Shadcn UI. It integrates various sub-components like `CommandInput`, `CommandList`, `CommandGroup`, and `CommandItem` to create a functional command palette with search, grouped suggestions, and settings, incorporating icons from `lucide-react` for enhanced visuals.

```tsx
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export function CommandDemo() {
  return (
    <Command className="rounded-lg border shadow-md md:min-w-[450px]">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Calendar />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <Smile />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem disabled>
            <Calculator />
            <span>Calculator</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CreditCard />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
```

--------------------------------

### Set Environment Variables for Registry Authentication

Source: https://ui.shadcn.com/docs/mcp

This Bash snippet illustrates how to define environment variables like 'REGISTRY_TOKEN' and 'API_KEY' in a '.env.local' file. These variables are crucial for authenticating with private registries and ensuring secure access to component libraries without hardcoding sensitive credentials.

```bash
REGISTRY_TOKEN=your_token_here
API_KEY=your_api_key_here
```

--------------------------------

### Display React Hook Form validation errors with FieldError and ARIA attributes (TypeScript)

Source: https://ui.shadcn.com/docs/forms/react-hook-form

This example shows how to display validation errors for a form field using React Hook Form's `Controller`. It demonstrates conditionally rendering `FieldError` and applying `data-invalid` and `aria-invalid` attributes for styling and improved accessibility.

```tsx
<Controller
  name="email"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
      <Input
        {...field}
        id={field.name}
        type="email"
        aria-invalid={fieldState.invalid}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

--------------------------------

### Implement Checkboxes with TanStack Form and shadcn/ui

Source: https://ui.shadcn.com/docs/forms/tanstack-form

This TypeScript/TSX example demonstrates how to integrate single and array checkboxes into a form using TanStack React Form and shadcn/ui components. It covers form initialization with `useForm`, Zod validation for both boolean and array checkboxes, handling `onCheckedChange` for state updates, displaying errors with `aria-invalid` and `data-invalid` props, and managing checkbox arrays with `mode="array"` and `tasks.map`.

```tsx
/* eslint-disable react/no-children-prop */
"use client"

import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"

const tasks = [
  {
    id: "push",
    label: "Push notifications",
  },
  {
    id: "email",
    label: "Email notifications",
  },
] as const

const formSchema = z.object({
  responses: z.boolean(),
  tasks: z
    .array(z.string())
    .min(1, "Please select at least one notification type.")
    .refine(
      (value) => value.every((task) => tasks.some((t) => t.id === task)),
      {
        message: "Invalid notification type selected.",
      }
    ),
})

export function FormTanstackCheckbox() {
  const form = useForm({
    defaultValues: {
      responses: true,
      tasks: [] as string[],
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      toast("You submitted the following values:", {
        description: (
          <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
            <code>{JSON.stringify(value, null, 2)}</code>
          </pre>
        ),
        position: "bottom-right",
        classNames: {
          content: "flex flex-col gap-2",
        },
        style: {
          "--border-radius": "calc(var(--radius)  + 4px)",
        } as React.CSSProperties,
      })
    },
  })

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Manage your notification preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="form-tanstack-checkbox"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="responses"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <FieldSet>
                    <FieldLegend variant="label">Responses</FieldLegend>
                    <FieldDescription>
                      Get notified for requests that take time, like research or
                      image generation.
                    </FieldDescription>
                    <FieldGroup data-slot="checkbox-group">
                      <Field orientation="horizontal" data-invalid={isInvalid}>
                        <Checkbox
                          id="form-tanstack-checkbox-responses"
                          name={field.name}
                          checked={field.state.value}
                          onCheckedChange={(checked) =>
                            field.handleChange(checked === true)
                          }
                          disabled
                        />
                        <FieldLabel
                          htmlFor="form-tanstack-checkbox-responses"
                          className="font-normal"
                        >
                          Push notifications
                        </FieldLabel>
                      </Field>
                    </FieldGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldSet>
                )
              }}
            />
            <FieldSeparator />
            <form.Field
              name="tasks"
              mode="array"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <FieldSet>
                    <FieldLegend variant="label">Tasks</FieldLegend>
                    <FieldDescription>
                      Get notified when tasks you&apos;ve created have updates.
                    </FieldDescription>
                    <FieldGroup data-slot="checkbox-group">
                      {tasks.map((task) => (
                        <Field
                          key={task.id}
```

--------------------------------

### Server Component for Fetching and Rendering Projects

Source: https://ui.shadcn.com/docs/components/sidebar

An async server component that fetches project data and renders a menu list. The component awaits the fetchProjects() function and dynamically generates menu items with project icons and names. Each project item is wrapped with SidebarMenuButton for interactive behavior.

```tsx
async function NavProjects() {
  const projects = await fetchProjects()

  return (
    <SidebarMenu>
      {projects.map((project) => (
        <SidebarMenuItem key={project.name}>
          <SidebarMenuButton asChild>
            <a href={project.url}>
              <project.icon />
              <span>{project.name}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
```

--------------------------------

### Display a basic Alert component (React/TypeScript)

Source: https://ui.shadcn.com/docs/components/alert

Illustrates the basic structure for rendering an Alert component with a title, description, and an optional icon. It also shows how to apply different 'variant' props (default or destructive) to change its visual appearance based on context.

```tsx
<Alert variant="default | destructive">
  <Terminal />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components and dependencies to your app using the cli.
  </AlertDescription>
</Alert>
```

--------------------------------

### Integrate shadcn/ui Switch with React Hook Form Controller in TypeScript

Source: https://ui.shadcn.com/docs/forms/react-hook-form

This focused TypeScript snippet demonstrates the specific setup for connecting a `shadcn/ui` Switch component to `react-hook-form` using the `Controller` component. It illustrates how to bind `field.value` to `checked`, `field.onChange` to `onCheckedChange`, and propagate validation state using `aria-invalid` and `data-invalid` props for error visualization.

```tsx
<Controller
  name="twoFactor"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field orientation="horizontal" data-invalid={fieldState.invalid}>
      <FieldContent>
        <FieldLabel htmlFor="form-rhf-switch-twoFactor">
          Multi-factor authentication
        </FieldLabel>
        <FieldDescription>
          Enable multi-factor authentication to secure your account.
        </FieldDescription>
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </FieldContent>
      <Switch
        id="form-rhf-switch-twoFactor"
        name={field.name}
        checked={field.value}
        onCheckedChange={field.onChange}
        aria-invalid={fieldState.invalid}
      />
    </Field>
  )}
/>
```

--------------------------------

### Carousel with Spacing Configuration in React TSX

Source: https://ui.shadcn.com/docs/components/carousel

Implements a carousel component with configurable spacing using Tailwind CSS utilities. Uses `pl-[VALUE]` on CarouselItem and `-ml-[VALUE]` on CarouselContent to control item spacing. The example creates a responsive carousel with 5 items that displays 1 item on mobile, 2 on tablet, and 3 on desktop.

```tsx
import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export function CarouselSpacing() {
  return (
    <Carousel className="w-full max-w-sm">
      <CarouselContent className="-ml-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-2xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
```

--------------------------------

### Import essential Context Menu components from Shadcn UI (TSX)

Source: https://ui.shadcn.com/docs/components/context-menu

This snippet illustrates how to import the key components required for building a basic context menu: `ContextMenu`, `ContextMenuContent`, `ContextMenuItem`, and `ContextMenuTrigger`. These components are sourced from the Shadcn UI library's `context-menu` module.

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
```

--------------------------------

### Group Shadcn UI Checkbox fields in a React component

Source: https://ui.shadcn.com/docs/changelog

This React component showcases the organization of multiple `Checkbox` elements within `FieldGroup` and `FieldSet` components from Shadcn UI. It uses `FieldLegend` and `FieldDescription` to provide context for the checkbox groups, along with individual `FieldLabel` components for each checkbox. This setup is ideal for creating structured preference or settings forms where related options are presented together.

```tsx
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet
} from "@/components/ui/field"

export function FieldCheckbox() {
  return (
    <div className="w-full max-w-md">
      <FieldGroup>
        <FieldSet>
          <FieldLegend variant="label">
            Show these items on the desktop
          </FieldLegend>
          <FieldDescription>
            Select the items you want to show on the desktop.
          </FieldDescription>
          <FieldGroup className="gap-3">
            <Field orientation="horizontal">
              <Checkbox id="finder-pref-9k2-hard-disks-ljj" />
              <FieldLabel
                htmlFor="finder-pref-9k2-hard-disks-ljj"
                className="font-normal"
                defaultChecked
              >
                Hard disks
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="finder-pref-9k2-external-disks-1yg" />
              <FieldLabel
                htmlFor="finder-pref-9k2-external-disks-1yg"
                className="font-normal"
              >
                External disks
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="finder-pref-9k2-cds-dvds-fzt" />
              <FieldLabel
                htmlFor="finder-pref-9k2-cds-dvds-fzt"
                className="font-normal"
              >
                CDs, DVDs, and iPods
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="finder-pref-9k2-connected-servers-6l2" />
              <FieldLabel
                htmlFor="finder-pref-9k2-connected-servers-6l2"
                className="font-normal"
              >
                Connected servers
              </FieldLabel>
            </Field>
          </FieldGroup>
        </FieldSet>
        <FieldSeparator />
        <Field orientation="horizontal">
          <Checkbox id="finder-pref-9k2-sync-folders-nep" defaultChecked />
          <FieldContent>
            <FieldLabel htmlFor="finder-pref-9k2-sync-folders-nep">
              Sync Desktop & Documents folders
            </FieldLabel>
            <FieldDescription>
              Your Desktop & Documents folders are being synced with iCloud
              Drive. You can access them from other devices.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>
    </div>
  )
}
```

--------------------------------

### Configure Import Aliases with jsconfig.json

Source: https://ui.shadcn.com/docs/changelog

Set up path aliases for JavaScript projects to enable cleaner imports using @ prefix. This configuration allows importing from project root using @/* pattern without TypeScript.

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

--------------------------------

### Test Authenticated Registry with shadcn CLI

Source: https://ui.shadcn.com/docs/registry/authentication

Verify registry authentication using the shadcn CLI tool by setting the REGISTRY_TOKEN environment variable. Tests end-to-end authentication workflow with private namespaced registries.

```bash
REGISTRY_TOKEN=your_token npx shadcn@latest add @private/button
```

--------------------------------

### Partial Override of Multi-File Component Resources

Source: https://ui.shadcn.com/docs/registry/namespace

Demonstrates overriding specific files from complex multi-file components. This approach allows selective file replacement while maintaining dependency on the original resource.

```json
{
  "name": "custom-auth",
  "registryDependencies": [
    "@vendor/auth"
  ],
  "files": [
    {
      "path": "lib/auth-server.ts",
      "type": "registry:lib",
      "content": "// Your custom auth server"
    }
  ]
}
```

--------------------------------

### Create File Input with Label in TSX

Source: https://ui.shadcn.com/docs/components/input

Demonstrates how to implement a file input field with an associated label using Shadcn components. It uses `Input` with `type="file"` and `Label` to create an accessible file upload UI within a grid layout.

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function InputFile() {
  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor="picture">Picture</Label>
      <Input id="picture" type="file" />
    </div>
  )
}
```

--------------------------------

### Error Handling Overview

Source: https://ui.shadcn.com/docs/registry/namespace

Common error messages and their resolutions encountered when interacting with the Shadcn component registry CLI.

```APIDOC
## Error Handling Overview

### Description
This section details common error messages you might encounter when using the `npx shadcn@latest` commands, along with their probable causes and suggested solutions.

### Method
(Not applicable - general information)

### Endpoint
(Not applicable - general information)

### Parameters
(None)

#### Request Body
(Not applicable)

### Request Example
(Not applicable)

### Response
#### Error Responses
- **Registry Not Configured**:
  ```txt
  Unknown registry "@non-existent". Make sure it is defined in components.json as follows:
  {
    "registries": {
      "@non-existent": "[URL_TO_REGISTRY]"
    }
  }
  ```
  *Cause*: Attempting to use a registry namespace that is not defined in your `components.json` file.
  *Solution*: Configure the registry in `components.json` with its corresponding URL.

- **Missing Environment Variables**:
  ```txt
  Registry "@private" requires the following environment variables:

    • REGISTRY_TOKEN

  Set the required environment variables to your .env or .env.local file.
  ```
  *Cause*: The registry you are trying to access requires specific environment variables (e.g., for authentication) that are not set in your project's environment.
  *Solution*: Define the required environment variables (e.g., `REGISTRY_TOKEN`) in your `.env` or `.env.local` file.

- **Resource Not Found (404)**:
  ```txt
  The item at https://registry.company.com/button.json was not found. It may not exist at the registry.
  ```
  *Cause*: The requested resource (component, library) could not be found at the specified registry or URL. This might be due to a typo in the resource name, the resource not existing, or an incorrect registry URL pattern.
  *Solution*: Verify the resource name and registry URL. Confirm the resource exists in the registry.

- **Authentication Failures (401 Unauthorized)**:
  ```txt
  You are not authorized to access the item at https://api.company.com/button.json
  Check your authentication credentials and environment variables.
  ```
  *Cause*: Your request lacks valid authentication credentials for the registry.
  *Solution*: Ensure your authentication tokens/credentials are correctly configured and provided (e.g., via environment variables).

- **Authentication Failures (403 Forbidden)**:
  ```txt
  Access forbidden for https://api.company.com/button.json
  Verify your API key has the necessary permissions.
  ```
  *Cause*: Your authentication credentials are valid but do not have the necessary permissions to access the requested resource.
  *Solution*: Check the permissions associated with your API key or authentication token and ensure they grant access to the resource.
```

--------------------------------

### Basic Kbd component usage

Source: https://ui.shadcn.com/docs/components/kbd

Import and use the Kbd component to display a single keyboard key. The component accepts children content and optional className prop for styling.

```tsx
import { Kbd } from "@/components/ui/kbd"

<Kbd>Ctrl</Kbd>
```

--------------------------------

### Display Kbd component inside InputGroup

Source: https://ui.shadcn.com/docs/components/kbd

Integrate Kbd components within InputGroup components to show keyboard shortcuts as input hints. Useful for displaying search shortcuts like Cmd+K in search input fields.

```tsx
import { SearchIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"

export function KbdInputGroup() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-6">
      <InputGroup>
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
```

--------------------------------

### Complete AppSidebar with React Server Components

Source: https://ui.shadcn.com/docs/components/sidebar

A full implementation of a sidebar component using React Server Components that fetches project data asynchronously. The component wraps the NavProjects server component with React.Suspense to display a skeleton loader while data is being fetched. Includes project data structure with icons from lucide-react and badge counts.

```tsx
import * as React from "react"
import {
  FrameIcon,
  LifeBuoyIcon,
  MapIcon,
  PieChartIcon,
  SendIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
} from "@/components/ui/sidebar"

const projects = [
  {
    name: "Design Engineering",
    url: "#",
    icon: FrameIcon,
    badge: "24",
  },
  {
    name: "Sales & Marketing",
    url: "#",
    icon: PieChartIcon,
    badge: "12",
  },
  {
    name: "Travel",
    url: "#",
    icon: MapIcon,
    badge: "3",
  },
  {
    name: "Support",
    url: "#",
    icon: LifeBuoyIcon,
    badge: "21",
  },
  {
    name: "Feedback",
    url: "#",
    icon: SendIcon,
    badge: "8",
  },
]

// Dummy fetch function
async function fetchProjects() {
  await new Promise((resolve) => setTimeout(resolve, 3000))
  return projects
}

export function AppSidebar() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <React.Suspense fallback={<NavProjectsSkeleton />}>
                <NavProjects />
              </React.Suspense>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}

function NavProjectsSkeleton() {
  return (
    <SidebarMenu>
      {Array.from({ length: 5 }).map((_, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuSkeleton showIcon />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

async function NavProjects() {
  const projects = await fetchProjects()

  return (
    <SidebarMenu>
      {projects.map((project) => (
        <SidebarMenuItem key={project.name}>
          <SidebarMenuButton asChild>
            <a href={project.url}>
              <project.icon />
              <span>{project.name}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
```

--------------------------------

### Import Kbd and KbdGroup Components

Source: https://ui.shadcn.com/docs/changelog

Import the Kbd and KbdGroup components from the ui/kbd module. Kbd renders individual keyboard keys, while KbdGroup groups multiple keys together for display purposes.

```tsx
import { Kbd, KbdGroup } from "@/components/ui/kbd"
```

--------------------------------

### CLI npx shadcn@latest search/list

Source: https://ui.shadcn.com/docs/registry/namespace

Searches for available resources within configured registries. It allows filtering results by registry, query string, and pagination options (limit, offset). The `list` command is an alias for `search` to display all items from a specific registry.

```APIDOC
## CLI npx shadcn@latest search/list

### Description
Searches for available resources within configured registries. It allows filtering results by registry, query string, and pagination options (limit, offset). The `list` command is an alias for `search` to display all items from a specific registry.

### Method
CLI

### Endpoint
`npx shadcn@latest search [registry_namespace...]`
`npx shadcn@latest list [registry_namespace...]`

### Parameters
#### Path Parameters
- **registry_namespace** (string) - Optional - One or more registry namespaces to search within (e.g., `@v0`, `@acme`). If omitted, all configured registries might be searched depending on the command.

#### Query Parameters
- **--query** (string) - Optional - A search string to filter resource names or descriptions.
- **--limit** (number) - Optional - Maximum number of results to return.
- **--offset** (number) - Optional - Number of results to skip from the beginning.

#### Request Body
(Not applicable for CLI command)

### Request Example
```bash
npx shadcn@latest search @v0
npx shadcn@latest search @acme --query "auth"
npx shadcn@latest search @v0 @acme @lib
npx shadcn@latest search @v0 --limit 10 --offset 20
npx shadcn@latest list @acme
```

### Response
#### Success Response (CLI Output)
The command outputs a list of matching resources, including their name, type, and description.

#### Response Example
```txt
Searching "@v0"...

- @v0/dashboard (registry:ui) - A dashboard layout component.
- @v0/card (registry:ui) - A flexible card container.
- @v0/button (registry:ui) - A highly customizable button.
```
```

--------------------------------

### Configure components.json to Enable CSS Variable Theming

Source: https://ui.shadcn.com/docs/theming

Shows the configuration in `components.json` required to enable CSS variable-based theming in a project, specifically setting `tailwind.cssVariables` to `true`.

```json
{
  "style": "new-york",
  "rsc": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

--------------------------------

### Display Kbd component inside Tooltip

Source: https://ui.shadcn.com/docs/components/kbd

Combine Kbd components with Tooltip components to display keyboard shortcuts in tooltip content. Useful for providing keyboard hints when hovering over buttons.

```tsx
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function KbdTooltip() {
  return (
    <div className="flex flex-wrap gap-4">
      <ButtonGroup>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline">
              Save
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              Save Changes <Kbd>S</Kbd>
            </div>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline">
              Print
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              Print Document{" "}
              <KbdGroup>
                <Kbd>Ctrl</Kbd>
                <Kbd>P</Kbd>
              </KbdGroup>
            </div>
          </TooltipContent>
        </Tooltip>
      </ButtonGroup>
    </div>
  )
}
```

--------------------------------

### Search Components Across Registries

Source: https://ui.shadcn.com/docs/changelog

Search for components in a specific registry using query keywords. This command filters registry items based on search terms, making it easy to find components with specific functionality across multiple registries.

```bash
npx shadcn search @tweakcn -q "dark"
```

--------------------------------

### Store Registry Tokens in Environment Variables

Source: https://ui.shadcn.com/docs/registry/authentication

Use environment variables to securely store authentication tokens and API keys without committing them to version control. Environment variables are referenced using template syntax in registry configuration.

```bash
REGISTRY_TOKEN=your_secret_token_here
API_KEY=your_api_key_here
```

--------------------------------

### Configure Multi-Registry with Different Authentication Methods

Source: https://ui.shadcn.com/docs/registry/authentication

Set up multiple component registries with different authentication strategies using namespaced registry configuration. Supports bearer tokens, API keys, and custom headers for different access levels (public, internal, premium).

```json
{
  "registries": {
    "@public": "https://public.company.com/{name}.json",
    "@internal": {
      "url": "https://internal.company.com/{name}.json",
      "headers": {
        "Authorization": "Bearer ${INTERNAL_TOKEN}"
      }
    },
    "@premium": {
      "url": "https://premium.company.com/{name}.json",
      "headers": {
        "X-License-Key": "${LICENSE_KEY}"
      }
    }
  }
}
```

--------------------------------

### Render Basic Input OTP Component (TypeScript React)

Source: https://ui.shadcn.com/docs/components/input-otp

Demonstrates how to render a basic Input OTP component with six slots, visually grouped into two sets of three. It utilizes shadcn/ui components like InputOTP, InputOTPGroup, InputOTPSeparator, and InputOTPSlot.

```tsx
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function InputOTPDemo() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}
```

--------------------------------

### Add shadcn/ui Components with `npx shadcn@latest add`

Source: https://ui.shadcn.com/docs/changelog

This command adds UI components to your project, automatically resolving dependencies and formatting them based on your custom configuration in `components.json`. It streamlines the process of incorporating pre-built shadcn/ui elements into your application.

```bash
npx shadcn@latest add
```

--------------------------------

### View Specific Component Changes with `npx shadcn diff [component]`

Source: https://ui.shadcn.com/docs/changelog

This command is used to inspect the detailed changes for a specific shadcn/ui component, such as 'alert'. It provides a diff output highlighting the modifications between your local version and the upstream repository, aiding in manual updates or understanding changes.

```bash
npx shadcn diff alert
```

--------------------------------

### Import Empty Component and Subcomponents

Source: https://ui.shadcn.com/docs/components/empty

Import the Empty component and its subcomponents (EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle) from the UI components library. These form the building blocks for constructing empty state layouts.

```tsx
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
```

--------------------------------

### Configure Multiple Registries in components.json

Source: https://ui.shadcn.com/docs/mcp

This JSON configuration demonstrates how to define multiple registries in the 'components.json' file, including third-party and private registries. It shows how to specify a URL for a registry and how to include headers for authentication, using environment variables for sensitive data.

```json
{
  "registries": {
    "@acme": "https://registry.acme.com/{name}.json",
    "@internal": {
      "url": "https://internal.company.com/{name}.json",
      "headers": {
        "Authorization": "Bearer ${REGISTRY_TOKEN}"
      }
    }
  }
}
```

--------------------------------

### Organize Registries by Stability Level

Source: https://ui.shadcn.com/docs/registry/namespace

Set up registries for different release channels (stable, beta, experimental). This configuration enables teams to test experimental features while maintaining stable production resources, supporting different deployment strategies.

```json
{
  "@stable": "https://registry.company.com/stable/{name}.json",
  "@latest": "https://registry.company.com/beta/{name}.json",
  "@experimental": "https://registry.company.com/experimental/{name}.json"
}
```

--------------------------------

### Basic Drawer Component Usage in React

Source: https://ui.shadcn.com/docs/components/drawer

Create a basic drawer with trigger, header, description, and footer sections. The drawer slides in from the side and displays a confirmation message with submit and cancel actions.

```tsx
<Drawer>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Are you absolutely sure?</DrawerTitle>
      <DrawerDescription>This action cannot be undone.</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter>
      <Button>Submit</Button>
      <DrawerClose>
        <Button variant="outline">Cancel</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

--------------------------------

### Create React Theme Provider for Dark Mode in Vite

Source: https://ui.shadcn.com/docs/dark-mode/vite

This React component, `ThemeProvider`, manages the application's theme state (light, dark, or system) and persists the user's preference in local storage. It applies the chosen theme's class to the document's root element and provides a `useTheme` hook for consuming the theme context throughout the application. It depends on React's `createContext`, `useContext`, `useEffect`, and `useState` hooks.

```tsx
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
```

--------------------------------

### Clone shadcn/ui Repository with Git

Source: https://ui.shadcn.com/docs/blocks

Clones the shadcn/ui repository to local workspace. This is the first step in setting up the development environment for contributing blocks.

```bash
git clone https://github.com/shadcn-ui/ui.git
```

--------------------------------

### Full List of Global Theming CSS Variables in app/globals.css

Source: https://ui.shadcn.com/docs/theming

Comprehensive list of predefined CSS variables for a theming system, including `root` and `dark` mode definitions for various UI elements and chart colors, using the Oklch color format for consistent styling.

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.269 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.371 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.439 0 0);
}
```

--------------------------------

### Configure Multiple Team Registries in components.json

Source: https://ui.shadcn.com/docs/changelog

Set up multiple namespaced registries organized by team or function (design, engineering, marketing). Each namespace points to different URLs within the same registry server, allowing team-specific component organization.

```json
{
  "registries": {
    "@design": "https://registry.company.com/create/{name}.json",
    "@engineering": "https://registry.company.com/eng/{name}.json",
    "@marketing": "https://registry.company.com/marketing/{name}.json"
  }
}
```

--------------------------------

### Implement Input OTP with Multiple Separators (TypeScript React)

Source: https://ui.shadcn.com/docs/components/input-otp

Shows how to use `InputOTPSeparator` to visually divide OTP slots into multiple groups within the `InputOTP` component. This enhances readability for longer OTPs by breaking them into smaller, manageable segments.

```tsx
import React from "react"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function InputOTPWithSeparator() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}
```

--------------------------------

### Define Form Structure with Radix UI

Source: https://ui.shadcn.com/docs/components/form

This snippet illustrates the basic structural components of a form using the Shadcn UI `<Form>` and `<FormField>`, integrating Radix UI components like `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, and `FormMessage`. It outlines how to render custom form fields within the `render` prop for flexible UI construction.

```tsx
<Form>
  <FormField
    control={...}
    name="..."
    render={() => (
      <FormItem>
        <FormLabel />
        <FormControl>
          { /* Your form field */}
        </FormControl>
        <FormDescription />
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

--------------------------------

### Basic Sheet Component Demo in TSX

Source: https://ui.shadcn.com/docs/components/sheet

Demonstrates a complete Sheet implementation with header, form inputs, and footer actions. Includes edit profile form with name and username fields, along with save and close buttons using shadcn UI components.

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Label htmlFor="sheet-demo-name">Name</Label>
            <Input id="sheet-demo-name" defaultValue="Pedro Duarte" />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="sheet-demo-username">Username</Label>
            <Input id="sheet-demo-username" defaultValue="@peduarte" />
          </div>
        </div>
        <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
```

--------------------------------

### Provide detailed description for registry item

Source: https://ui.shadcn.com/docs/registry/registry-item-json

The `description` property offers a more extensive explanation of the registry item's purpose and functionality. It allows for detailed context that complements the concise title, helping users understand what the item does.

```json
{
  "description": "A simple hello world component."
}
```

--------------------------------

### Define Global CSS Variables for Light and Dark Themes (CSS)

Source: https://ui.shadcn.com/docs/theming

This CSS snippet defines a comprehensive set of custom properties (CSS variables) for various UI elements, including colors for background, foreground, cards, popovers, primary/secondary/accent elements, and charts. It includes distinct definitions for both light (default) and dark themes, allowing for easy theme switching by applying the `.dark` class. These variables are typically used in a `globals.css` file to provide a consistent styling foundation across a web application, often in conjunction with UI libraries like shadcn.

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.147 0.004 49.25);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.147 0.004 49.25);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.147 0.004 49.25);
  --primary: oklch(0.216 0.006 56.043);
  --primary-foreground: oklch(0.985 0.001 106.423);
  --secondary: oklch(0.97 0.001 106.424);
  --secondary-foreground: oklch(0.216 0.006 56.043);
  --muted: oklch(0.97 0.001 106.424);
  --muted-foreground: oklch(0.553 0.013 58.071);
  --accent: oklch(0.97 0.001 106.424);
  --accent-foreground: oklch(0.216 0.006 56.043);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.923 0.003 48.717);
  --input: oklch(0.923 0.003 48.717);
  --ring: oklch(0.709 0.01 56.259);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0.001 106.423);
  --sidebar-foreground: oklch(0.147 0.004 49.25);
  --sidebar-primary: oklch(0.216 0.006 56.043);
  --sidebar-primary-foreground: oklch(0.985 0.001 106.423);
  --sidebar-accent: oklch(0.97 0.001 106.424);
  --sidebar-accent-foreground: oklch(0.216 0.006 56.043);
  --sidebar-border: oklch(0.923 0.003 48.717);
  --sidebar-ring: oklch(0.709 0.01 56.259);
}

.dark {
  --background: oklch(0.147 0.004 49.25);
  --foreground: oklch(0.985 0.001 106.423);
  --card: oklch(0.216 0.006 56.043);
  --card-foreground: oklch(0.985 0.001 106.423);
  --popover: oklch(0.216 0.006 56.043);
  --popover-foreground: oklch(0.985 0.001 106.423);
  --primary: oklch(0.923 0.003 48.717);
  --primary-foreground: oklch(0.216 0.006 56.043);
  --secondary: oklch(0.268 0.007 34.298);
  --secondary-foreground: oklch(0.985 0.001 106.423);
  --muted: oklch(0.268 0.007 34.298);
  --muted-foreground: oklch(0.709 0.01 56.259);
  --accent: oklch(0.268 0.007 34.298);
  --accent-foreground: oklch(0.985 0.001 106.423);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.553 0.013 58.071);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.216 0.006 56.043);
  --sidebar-foreground: oklch(0.985 0.001 106.423);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0.001 106.423);
  --sidebar-accent: oklch(0.268 0.007 34.298);
  --sidebar-accent-foreground: oklch(0.985 0.001 106.423);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.553 0.013 58.071);
}
```

--------------------------------

### Check for shadcn/ui Component Updates with `npx shadcn diff`

Source: https://ui.shadcn.com/docs/changelog

This experimental command allows users to track upstream updates for shadcn/ui components. Running it lists components with available updates, helping maintain consistency and leverage the latest features and bug fixes.

```bash
npx shadcn diff
```

--------------------------------

### ButtonGroup Wrapping Input Component

Source: https://ui.shadcn.com/docs/components/button-group

Demonstrates how to wrap an Input component with buttons using ButtonGroup. Useful for creating search bars and input controls with associated action buttons.

```tsx
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"

export function ButtonGroupInput() {
  return (
    <ButtonGroup>
      <Input placeholder="Search..." />
      <Button variant="outline" aria-label="Search">
        <SearchIcon />
      </Button>
    </ButtonGroup>
  )
}
```

--------------------------------

### Execute shadcn Build Command

Source: https://ui.shadcn.com/docs/cli

Basic command to build and generate registry JSON files. This command reads the default registry.json file and outputs the generated files to the public/r directory.

```bash
npx shadcn@latest build
```

--------------------------------

### Advanced Registry Configuration with Authentication

Source: https://ui.shadcn.com/docs/components-json

Configure private registries with authentication headers and query parameters. Supports environment variable expansion using ${VAR_NAME} syntax for secure credential management. Headers like Authorization and X-API-Key can be configured per registry.

```json
{
  "registries": {
    "@private": {
      "url": "https://api.company.com/registry/{name}.json",
      "headers": {
        "Authorization": "Bearer ${REGISTRY_TOKEN}",
        "X-API-Key": "${API_KEY}"
      },
      "params": {
        "version": "latest"
      }
    }
  }
}
```

--------------------------------

### Import Input OTP Components (TypeScript React)

Source: https://ui.shadcn.com/docs/components/input-otp

Illustrates the necessary import statements for using the Input OTP components within a TypeScript React file. It imports key components like InputOTP, InputOTPGroup, InputOTPSeparator, and InputOTPSlot from the local shadcn/ui path.

```tsx
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
```

--------------------------------

### Basic Item with Icon and Description in TSX

Source: https://ui.shadcn.com/docs/changelog

Simple Item component displaying an icon, title, and description. The ItemMedia component wraps the HomeIcon with a variant prop, while ItemContent contains the title and description text. This demonstrates the basic structure of an Item.

```tsx
<Item>
  <ItemMedia variant="icon">
    <HomeIcon />
  </ItemMedia>
  <ItemContent>
    <ItemTitle>Dashboard</ItemTitle>
    <ItemDescription>Overview of your account and activity.</ItemDescription>
  </ItemContent>
</Item>
```

--------------------------------

### Import Tooltip Components

Source: https://ui.shadcn.com/docs/components/tooltip

Standard import statement for using Tooltip, TooltipContent, and TooltipTrigger components from the ui components directory. Must be placed at the top of component files using the tooltip.

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
```

--------------------------------

### Create Command Dialog with Keyboard Shortcut

Source: https://ui.shadcn.com/docs/components/command

Implements a CommandDialog component that opens/closes with a keyboard shortcut (Cmd/Ctrl + J). Displays command groups with icons from lucide-react and keyboard shortcuts. The dialog listens for keyboard events and prevents default browser behavior when the shortcut is triggered.

```tsx
"use client"

import * as React from "react"
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export function CommandDialogDemo() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <p className="text-muted-foreground text-sm">
        Press{" "}
        <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
          <span className="text-xs">⌘</span>J
        </kbd>
      </p>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <Calendar />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <Smile />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem>
              <Calculator />
              <span>Calculator</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <User />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCard />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Settings />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
```

--------------------------------

### Create Basic AppSidebar Component (TypeScript/React)

Source: https://ui.shadcn.com/docs/components/sidebar

This code defines a basic `AppSidebar` component using `Sidebar` and `SidebarContent` from the Shadcn/UI library. It establishes the initial structure for a collapsible sidebar, ready to be populated with navigation elements.

```tsx
import { Sidebar, SidebarContent } from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent />
    </Sidebar>
  )
}
```

--------------------------------

### Configure Shadcn Registry with Basic Authentication (JSON)

Source: https://ui.shadcn.com/docs/registry/namespace

This configuration sets up basic authentication for a shadcn registry. The `Authorization` header contains a `Basic` token derived from base64-encoded credentials, which are loaded from the `${BASE64_CREDENTIALS}` environment variable for secure access to the internal registry.

```json
{
  "@internal": {
    "url": "https://registry.company.com/{name}.json",
    "headers": {
      "Authorization": "Basic ${BASE64_CREDENTIALS}"
    }
  }
}
```

--------------------------------

### Import Command Component Sub-components in React (TypeScript)

Source: https://ui.shadcn.com/docs/components/command

This snippet illustrates the essential import statements for all sub-components that comprise the Shadcn UI `Command` component. These imports are necessary to build a comprehensive command menu, including dialogs, input fields, and various list elements. Ensure that the import path is correctly configured to match your project's file structure.

```tsx
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
```

--------------------------------

### items Array with Registry Item Definitions

Source: https://ui.shadcn.com/docs/registry/registry-json

Contains an array of registry items, each implementing the registry-item schema specification. Each item defines a component with its name, type, dependencies, and file references for the registry catalog.

```json
{
  "items": [
    {
      "name": "hello-world",
      "type": "registry:block",
      "title": "Hello World",
      "description": "A simple hello world component.",
      "registryDependencies": [
        "button",
        "@acme/input-form",
        "https://example.com/r/foo"
      ],
      "dependencies": ["is-even@3.0.0", "motion"],
      "files": [
        {
          "path": "registry/new-york/hello-world/hello-world.tsx",
          "type": "registry:component"
        }
      ]
    }
  ]
}
```

--------------------------------

### Import core Shadcn UI Select components in React

Source: https://ui.shadcn.com/docs/components/select

This TypeScript React snippet demonstrates the essential import statements required to use Shadcn UI Select components. It brings in `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, and `SelectValue`.

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
```

--------------------------------

### Create Lead/Intro Text Component with React and Tailwind CSS

Source: https://ui.shadcn.com/docs/components/typography

Exports a reusable lead paragraph component with larger text size (text-xl), muted foreground color, and semantic emphasis. Used for introductory or summary text sections.

```tsx
export function TypographyLead() {
  return (
    <p className="text-muted-foreground text-xl">
      A modal dialog that interrupts the user with important content and expects
      a response.
    </p>
  )
}
```

--------------------------------

### Set Environment Variable for Registry Authentication (Bash)

Source: https://ui.shadcn.com/docs/registry/namespace

This bash command shows how to set an environment variable, `REGISTRY_TOKEN`, typically in a `.env.local` file. This variable is then automatically expanded and used by shadcn's registry configuration for secure authentication, preventing sensitive credentials from being hardcoded.

```bash
REGISTRY_TOKEN=your_secret_token_here
```

--------------------------------

### Render Shadcn Buttons with Various Sizes (React/TypeScript)

Source: https://ui.shadcn.com/docs/components/button

Illustrates how to render Shadcn UI `Button` components with different predefined sizes, including `sm`, `lg`, `icon-sm`, and `icon-lg`. It demonstrates both text and icon-only buttons for each size variant. Requires `lucide-react` for the icon.

```tsx
import { ArrowUpRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ButtonSize() {
  return (
    <div className="flex flex-col items-start gap-8 sm:flex-row">
      <div className="flex items-start gap-2">
        <Button size="sm" variant="outline">
          Small
        </Button>
        <Button size="icon-sm" aria-label="Submit" variant="outline">
          <ArrowUpRightIcon />
        </Button>
      </div>
      <div className="flex items-start gap-2">
        <Button variant="outline">Default</Button>
        <Button size="icon" aria-label="Submit" variant="outline">
          <ArrowUpRightIcon />
        </Button>
      </div>
      <div className="flex items-start gap-2">
        <Button variant="outline" size="lg">
          Large
        </Button>
        <Button size="icon-lg" aria-label="Submit" variant="outline">
          <ArrowUpRightIcon />
        </Button>
      </div>
    </div>
  )
}
```

```tsx
// Small
<Button size="sm" variant="outline">Small</Button>
<Button size="icon-sm" aria-label="Submit" variant="outline">
  <ArrowUpRightIcon />
</Button>

// Medium
<Button variant="outline">Default</Button>
<Button size="icon" aria-label="Submit" variant="outline">
  <ArrowUpRightIcon />
</Button>

// Large
<Button size="lg" variant="outline">Large</Button>
<Button size="icon-lg" aria-label="Submit" variant="outline">
  <ArrowUpRightIcon />
</Button>
```

--------------------------------

### Import Alert components (React/TypeScript)

Source: https://ui.shadcn.com/docs/components/alert

Shows the necessary import statement for bringing the Alert, AlertDescription, and AlertTitle components into a React/TypeScript file from the Shadcn UI library. This is the first step required before using these components in your application.

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
```

--------------------------------

### Implement Inset Sidebar Variant with `SidebarInset` in TSX

Source: https://ui.shadcn.com/docs/components/sidebar

This code demonstrates the usage of the `inset` sidebar variant, which requires wrapping the main content within a `SidebarInset` component. This ensures proper layout and spacing when the sidebar is rendered in an 'inset' style.

```tsx
<SidebarProvider>
  <Sidebar variant="inset" />
  <SidebarInset>
    <main>{children}</main>
  </SidebarInset>
</SidebarProvider>
```

--------------------------------

### Configure jsconfig.json for import aliases

Source: https://ui.shadcn.com/docs/javascript

Set up the jsconfig.json file to configure path aliases for module imports. This enables using @ as an alias for the root directory, allowing cleaner import statements throughout the JavaScript project.

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

--------------------------------

### Capture Block Screenshots with pnpm

Source: https://ui.shadcn.com/docs/blocks

Captures screenshots of blocks in both light and dark modes for the registry. Required before submitting pull requests for publication.

```bash
pnpm registry:capture
```

--------------------------------

### InputGroupAddon with Icon

Source: https://ui.shadcn.com/docs/components/input-group

Shows how to use InputGroupAddon to display icons alongside input elements with inline-end alignment.

```tsx
<InputGroupAddon align="inline-end">
  <SearchIcon />
</InputGroupAddon>
```

--------------------------------

### API Key Authentication Configuration

Source: https://ui.shadcn.com/docs/registry/authentication

Configure API key authentication with custom headers for registry access. Supports multiple custom headers like X-API-Key and X-Workspace-Id for more granular access control and workspace isolation.

```json
{
  "registries": {
    "@company": {
      "url": "https://api.company.com/registry/{name}.json",
      "headers": {
        "X-API-Key": "${API_KEY}",
        "X-Workspace-Id": "${WORKSPACE_ID}"
      }
    }
  }
}
```

--------------------------------

### Enable or disable CSS variables for theming

Source: https://ui.shadcn.com/docs/components-json

Determines whether components use CSS variables (true) or Tailwind utility classes (false) for theming. This cannot be changed after initialization; components must be reinstalled to switch methods.

```json
{
  "tailwind": {
    "cssVariables": true | false
  }
}
```

--------------------------------

### Configure Shadcn Registry with API Key in Headers (JSON)

Source: https://ui.shadcn.com/docs/registry/namespace

This configuration demonstrates how to authenticate a shadcn registry using an API key passed in the request headers. The `X-API-Key` header, populated by the `${API_KEY}` environment variable, is used to secure access to the specified private registry URL.

```json
{
  "@private": {
    "url": "https://api.company.com/registry/{name}",
    "headers": {
      "X-API-Key": "${API_KEY}"
    }
  }
}
```

--------------------------------

### Loading Skeleton Component for Sidebar Menu

Source: https://ui.shadcn.com/docs/components/sidebar

A skeleton component that displays placeholder loaders while async data is being fetched. It renders 5 skeleton menu items with icon placeholders to provide visual feedback during loading. Used as a Suspense fallback to improve perceived performance.

```tsx
function NavProjectsSkeleton() {
  return (
    <SidebarMenu>
      {Array.from({ length: 5 }).map((_, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuSkeleton showIcon />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
```

--------------------------------

### Interactive Drawer with State Management and Chart in React

Source: https://ui.shadcn.com/docs/components/drawer

Demonstrates an advanced Drawer component with React state management, interactive buttons for adjusting values, and a Recharts BarChart visualization. The component manages a goal value between 200-400 and displays real-time updates with increase/decrease buttons and visual feedback via a bar chart.

```tsx
"use client"

import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer } from "recharts"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

const data = [
  { goal: 400 },
  { goal: 300 },
  { goal: 200 },
  { goal: 300 },
  { goal: 200 },
  { goal: 278 },
  { goal: 189 },
  { goal: 239 },
  { goal: 300 },
  { goal: 200 },
  { goal: 278 },
  { goal: 189 },
  { goal: 349 },
]

export function DrawerDemo() {
  const [goal, setGoal] = React.useState(350)

  function onClick(adjustment: number) {
    setGoal(Math.max(200, Math.min(400, goal + adjustment)))
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Move Goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => onClick(-10)}
                disabled={goal <= 200}
              >
                <Minus />
                <span className="sr-only">Decrease</span>
              </Button>
              <div className="flex-1 text-center">
                <div className="text-7xl font-bold tracking-tighter">
                  {goal}
                </div>
                <div className="text-muted-foreground text-[0.70rem] uppercase">
                  Calories/day
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => onClick(10)}
                disabled={goal >= 400}
              >
                <Plus />
                <span className="sr-only">Increase</span>
              </Button>
            </div>
            <div className="mt-3 h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <Bar
                    dataKey="goal"
                    style={
                      {
                        fill: "hsl(var(--foreground))",
                        opacity: 0.9,
                      } as React.CSSProperties
                    }
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
```

--------------------------------

### Extend Third-Party Component Without Replacing

Source: https://ui.shadcn.com/docs/registry/namespace

Pattern for extending vendor components by keeping the original and adding custom extensions. Uses registryDependencies to import the base component and adds new functionality in a separate file.

```json
{
  "name": "extended-table",
  "registryDependencies": ["@vendor/table"],
  "files": [
    {
      "path": "components/ui/table-extended.tsx",
      "content": "import { Table } from '@vendor/table'\n// Add your extensions\nexport function ExtendedTable() { ... }"
    }
  ]
}
```

--------------------------------

### Badge Component as Link with asChild Prop

Source: https://ui.shadcn.com/docs/components/badge

Demonstrates using the Badge component with the asChild prop to compose it with a Next.js Link component. This allows rendering a link element that visually appears as a badge without wrapper elements.

```tsx
import Link from "next/link"

import { Badge } from "@/components/ui/badge"

export function LinkAsBadge() {
  return (
    <Badge asChild>
      <Link href="/">Badge</Link>
    </Badge>
  )
}
```

--------------------------------

### Create Responsive Field Layout with Orientation Switching

Source: https://ui.shadcn.com/docs/changelog

Implements responsive field layouts using the orientation="responsive" prop to automatically switch between vertical and horizontal arrangements based on container width. Combines Fields with Input, Textarea, Button components and FieldSeparator for visual organization.

```tsx
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function FieldResponsive() {
  return (
    <div className="w-full max-w-4xl">
      <form>
        <FieldSet>
          <FieldLegend>Profile</FieldLegend>
          <FieldDescription>Fill in your profile information.</FieldDescription>
          <FieldSeparator />
          <FieldGroup>
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <FieldDescription>
                  Provide your full name for identification
                </FieldDescription>
              </FieldContent>
              <Input id="name" placeholder="Evil Rabbit" required />
            </Field>
            <FieldSeparator />
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="lastName">Message</FieldLabel>
                <FieldDescription>
                  You can write your message here. Keep it short, preferably
                  under 100 characters.
                </FieldDescription>
              </FieldContent>
              <Textarea
                id="message"
                placeholder="Hello, world!"
                required
                className="min-h-[100px] resize-none sm:min-w-[300px]"
              />
            </Field>
            <FieldSeparator />
            <Field orientation="responsive">
              <Button type="submit">Submit</Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  )
}
```

--------------------------------

### Define a full shadcn/ui registry item configuration

Source: https://ui.shadcn.com/docs/registry/registry-item-json

This JSON configuration defines a complete shadcn/ui registry item, including its unique name, type, human-readable title, and descriptive text. It specifies both npm package dependencies and references to other registry items, along with the file paths for its components and custom CSS variables for thematic styling.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "hello-world",
  "type": "registry:block",
  "title": "Hello World",
  "description": "A simple hello world component.",
  "registryDependencies": [
    "button",
    "@acme/input-form",
    "https://example.com/r/foo"
  ],
  "dependencies": ["is-even@3.0.0", "motion"],
  "files": [
    {
      "path": "registry/new-york/hello-world/hello-world.tsx",
      "type": "registry:component"
    },
    {
      "path": "registry/new-york/hello-world/use-hello-world.ts",
      "type": "registry:hook"
    }
  ],
  "cssVars": {
    "theme": {
      "font-heading": "Poppins, sans-serif"
    },
    "light": {
      "brand": "20 14.3% 4.1%"
    },
    "dark": {
      "brand": "20 14.3% 4.1%"
    }
  }
}
```

--------------------------------

### Item Component Structure with Media, Content, and Actions in TypeScript/React

Source: https://ui.shadcn.com/docs/components/item

Shows the basic structure of the Item component with optional ItemMedia, ItemContent containing ItemTitle and ItemDescription, and ItemActions. Demonstrates the component's composition pattern for building list items with consistent styling and layout.

```typescript
<Item size="" variant="">
  <ItemMedia />
  <ItemContent>
    <ItemTitle>Item</ItemTitle>
    <ItemDescription>Item</ItemDescription>
  </ItemContent>
  <ItemActions />
</Item>
```

--------------------------------

### Create Dropdown Menu Component with Submenus and Shortcuts

Source: https://ui.shadcn.com/docs/components/dropdown-menu

A complete dropdown menu implementation featuring nested submenus, keyboard shortcuts, separators, and grouped menu items. The component uses Radix UI primitives and integrates with the Button component to trigger the menu display. It demonstrates advanced features like disabled items and portal-based submenu rendering.

```tsx
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Keyboard shortcuts
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Message</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>More...</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>
            New Team
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>GitHub</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuItem disabled>API</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

--------------------------------

### Test Authenticated Registry with curl

Source: https://ui.shadcn.com/docs/registry/authentication

Verify authenticated registry connectivity using curl command-line tool with bearer token authentication. Tests that the registry endpoint is accessible and properly configured.

```bash
curl -H "Authorization: Bearer your_token" \
  https://registry.company.com/button.json
```

--------------------------------

### shadcn CLI: Custom Error for Missing Environment Variables

Source: https://ui.shadcn.com/docs/changelog

When a registry requires specific environment variables, the shadcn CLI now explicitly lists them in an error message. Users are directed to set these variables in `.env` or `.env.local` files to resolve the issue.

```txt
Registry "@private" requires the following environment variables:
  • REGISTRY_TOKEN

Set the required environment variables to your .env or .env.local file.
```

--------------------------------

### List Registry Items with list Command

Source: https://ui.shadcn.com/docs/cli

The list command displays all available items from specified registries. It supports multiple registry sources and serves as an alias for the search command.

```bash
npx shadcn@latest list @acme
```

```bash
Usage: shadcn list [options] <registries...>

list items from registries

Arguments:
  registries             the registry names or urls to list items from. Names
                         must be prefixed with @.
```

--------------------------------

### Organize Registries by Resource Type

Source: https://ui.shadcn.com/docs/registry/namespace

Structure multiple registries separated by resource category (components, hooks, utilities, AI prompts). Each registry points to a specific resource type endpoint, enabling logical organization and easy maintenance of different resource categories.

```json
{
  "@components": "https://cdn.company.com/components/{name}.json",
  "@hooks": "https://cdn.company.com/hooks/{name}.json",
  "@utils": "https://cdn.company.com/utils/{name}.json",
  "@prompts": "https://cdn.company.com/ai-prompts/{name}.json"
}
```

--------------------------------

### Toggle Component with Bookmark Icon and Styling (React/TypeScript)

Source: https://ui.shadcn.com/docs/components/toggle

Demonstrates a Shadcn UI Toggle component with a Bookmark icon and custom styling for its 'on' state. It uses `lucide-react` for the icon and applies Tailwind CSS classes for visual feedback. The component has `sm` size and `outline` variant.

```tsx
import { BookmarkIcon } from "lucide-react"

import { Toggle } from "@/components/ui/toggle"

export function ToggleDemo() {
  return (
    <Toggle
      aria-label="Toggle bookmark"
      size="sm"
      variant="outline"
      className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-blue-500 data-[state=on]:*:[svg]:stroke-blue-500"
    >
      <BookmarkIcon />
      Bookmark
    </Toggle>
  )
}
```

--------------------------------

### Render a Basic Shadcn Button (React/TypeScript)

Source: https://ui.shadcn.com/docs/components/button

Demonstrates how to render a simple button component using the Shadcn UI `Button` component with an `outline` variant. This is a common way to display a button in a React application.

```tsx
<Button variant="outline">Button</Button>
```

--------------------------------

### Import Empty Component for Shadcn UI

Source: https://ui.shadcn.com/docs/changelog

This snippet demonstrates how to import the essential components of the Shadcn UI Empty component, including the base `Empty` and its sub-components like `EmptyContent`, `EmptyDescription`, `EmptyMedia`, and `EmptyTitle`, for use in a React/TypeScript application.

```tsx
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
```

--------------------------------

### Configure Shadcn Registry with Multiple Authentication Methods (JSON)

Source: https://ui.shadcn.com/docs/registry/namespace

This advanced configuration demonstrates combining multiple authentication methods for a shadcn registry. It includes various headers like `Authorization` (Bearer token), `X-API-Key`, and `X-Workspace-Id`, along with a `version` parameter, all securely managed via environment variables for access to an enterprise registry.

```json
{
  "@enterprise": {
    "url": "https://api.enterprise.com/v2/registry/{name}",
    "headers": {
      "Authorization": "Bearer ${ACCESS_TOKEN}",
      "X-API-Key": "${API_KEY}",
      "X-Workspace-Id": "${WORKSPACE_ID}"
    },
    "params": {
      "version": "latest"
    }
  }
}
```

--------------------------------

### Import NavigationMenu Components

Source: https://ui.shadcn.com/docs/components/navigation-menu

Import all necessary NavigationMenu subcomponents and utilities from the UI components directory. These imports provide access to menu structure, triggers, content, and styling.

```typescript
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
```

--------------------------------

### Render InputGroup Demo - React TypeScript (TSX)

Source: https://ui.shadcn.com/docs/components/input-group

A demo React component showcasing multiple InputGroup configurations with addons, buttons, tooltips, dropdowns, icons, and separators. Dependencies: React, @tabler/icons-react, lucide-react, and local UI components under "@/components/ui/*". Input: none (self-contained component); Output: JSX UI; Limitations: requires project styling and the referenced UI component implementations.

```tsx
import { IconCheck, IconInfoCircle, IconPlus } from "@tabler/icons-react"
import { ArrowUpIcon, Search } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function InputGroupDemo() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup>
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="example.com" className="!pl-1" />
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton className="rounded-full" size="icon-xs">
                <IconInfoCircle />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>This is content in a tooltip.</TooltipContent>
          </Tooltip>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea placeholder="Ask, Search or Chat..." />
        <InputGroupAddon align="block-end">
          <InputGroupButton
            variant="outline"
            className="rounded-full"
            size="icon-xs"
          >
            <IconPlus />
          </InputGroupButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton variant="ghost">Auto</InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="[--radius:0.95rem]"
            >
              <DropdownMenuItem>Auto</DropdownMenuItem>
              <DropdownMenuItem>Agent</DropdownMenuItem>
              <DropdownMenuItem>Manual</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <InputGroupText className="ml-auto">52% used</InputGroupText>
          <Separator orientation="vertical" className="!h-4" />
          <InputGroupButton
            variant="default"
            className="rounded-full"
            size="icon-xs"
            disabled
          >
            <ArrowUpIcon />
            <span className="sr-only">Send</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="@shadcn" />
        <InputGroupAddon align="inline-end">
          <div className="bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full">
            <IconCheck className="size-3" />
          </div>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

```

```tsx
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"

```

```tsx
<InputGroup>
  <InputGroupInput placeholder="Search..." />
  <InputGroupAddon>
    <SearchIcon />
  </InputGroupAddon>
  <InputGroupAddon align="inline-end">
    <InputGroupButton>Search</InputGroupButton>
  </InputGroupAddon>
</InputGroup>

```

--------------------------------

### Create Input Group with Text Addons - TypeScript React

Source: https://ui.shadcn.com/docs/changelog

Builds multiple input groups with text addons positioned inline or at block end. Includes domain suffix input, email suffix input, and character counter textarea. Uses className customization for padding and text styling.

```typescript
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"

export function InputGroupExample() {
  return (
    <div>
      <InputGroup>
        <InputGroupAddon />
        <InputGroupInput placeholder="example.com" className="!pl-0.5" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>.com</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Enter your username" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>@company.com</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea placeholder="Enter your message" />
        <InputGroupAddon align="block-end">
          <InputGroupText className="text-muted-foreground text-xs">
            120 characters left
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
```

--------------------------------

### Carousel Options Configuration with Embla Carousel

Source: https://ui.shadcn.com/docs/components/carousel

Demonstrates passing configuration options to the Carousel component via the `opts` prop. Includes `align` and `loop` properties from Embla Carousel library. Refer to Embla Carousel documentation for additional available options.

```tsx
<Carousel
  opts={{
    align: "start",
    loop: true,
  }}
>
  <CarouselContent>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
  </CarouselContent>
</Carousel>
```

--------------------------------

### Configure shadcn/ui import aliases in components.json

Source: https://ui.shadcn.com/docs/changelog

This JSON configuration updates the `components.json` file to define import aliases for shadcn/ui components, utilities, UI elements, libraries, and hooks. It's essential for projects using the new CLI to correctly resolve module paths, allowing customization of the alias prefix if needed.

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "tailwind": {
    // ...
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

--------------------------------

### Search Registry with search Command

Source: https://ui.shadcn.com/docs/cli

The search command queries component registries with optional filtering. Supports searching single or multiple registries with query strings, pagination controls, and registry aliases.

```bash
npx shadcn@latest search [registry]
```

```bash
npx shadcn@latest search @shadcn -q "button"
```

```bash
npx shadcn@latest search @shadcn @v0 @acme
```

```bash
npx shadcn@latest list @acme
```

```bash
Usage: shadcn search|list [options] <registries...>

search items from registries

Arguments:
  registries             the registry names or urls to search items from. Names
                         must be prefixed with @.

Options:
  -c, --cwd <cwd>        the working directory. defaults to the current directory.
  -q, --query <query>    query string
  -l, --limit <number>   maximum number of items to display per registry (default: "100")
  -o, --offset <number>  number of items to skip (default: "0")
  -h, --help             display help for command
```

--------------------------------

### shadcn Build Command with Custom Output Directory

Source: https://ui.shadcn.com/docs/cli

Build command with the --output option to specify a custom destination directory for generated JSON files. This allows flexibility in where registry files are written.

```bash
npx shadcn@latest build --output ./public/registry
```

--------------------------------

### Migrate Tailwind CSS `w-* h-*` Utilities to `size-*`

Source: https://ui.shadcn.com/docs/tailwind-v4

This `diff` snippet shows the migration from using separate `w-*` (width) and `h-*` (height) Tailwind utility classes to the consolidated `size-*` utility. This update aligns with Tailwind v3.4 for more concise styling.

```diff
- w-4 h-4
+ size-4
```

--------------------------------

### Create Multiple Link Items with Icons - React/TSX

Source: https://ui.shadcn.com/docs/changelog

Demonstrates multiple Item components styled as links with different action icons and variants. Includes internal documentation link and external resource link with security attributes (noopener, noreferrer).

```tsx
import { ChevronRightIcon, ExternalLinkIcon } from "lucide-react"

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"

export function ItemLink() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Item asChild>
        <a href="#">
          <ItemContent>
            <ItemTitle>Visit our documentation</ItemTitle>
            <ItemDescription>
              Learn how to get started with our components.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <ChevronRightIcon className="size-4" />
          </ItemActions>
        </a>
      </Item>
      <Item variant="outline" asChild>
        <a href="#" target="_blank" rel="noopener noreferrer">
          <ItemContent>
            <ItemTitle>External resource</ItemTitle>
            <ItemDescription>
              Opens in a new tab with security attributes.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <ExternalLinkIcon className="size-4" />
          </ItemActions>
        </a>
      </Item>
    </div>
  )
}
```

--------------------------------

### Choose TypeScript or JavaScript for components

Source: https://ui.shadcn.com/docs/components-json

Controls the file format for generated components. Set to true for TypeScript (.tsx) or false for JavaScript (.jsx). Determines the language syntax used in all generated component files.

```json
{
  "tsx": true | false
}
```

--------------------------------

### Create Horizontal Resizable Panel Layout in React

Source: https://ui.shadcn.com/docs/components/resizable

Demonstrates a basic horizontal resizable panel layout with three panels (one main panel and two nested vertical panels). The ResizablePanelGroup wraps panels with ResizableHandle components between them to enable resizing. Each panel has a default size percentage that controls its initial width/height.

```tsx
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export function ResizableDemo() {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="max-w-md rounded-lg border md:min-w-[450px]"
    >
      <ResizablePanel defaultSize={50}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold">One</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={25}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Two</span>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={75}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Three</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
```

--------------------------------

### Migrate CSS Plugin from `tailwindcss-animate` to `tw-animate-css`

Source: https://ui.shadcn.com/docs/tailwind-v4

This `diff` snippet illustrates the necessary change in a `globals.css` file when migrating animation libraries. It shows replacing the `@plugin 'tailwindcss-animate'` directive with an `@import "tw-animate-css"` statement.

```diff
- @plugin 'tailwindcss-animate';
+ @import "tw-animate-css";
```

--------------------------------

### Import Shadcn Input Component in TSX

Source: https://ui.shadcn.com/docs/components/input

Shows the import statement required to bring the Shadcn Input component into a TypeScript/React file. This line makes the `Input` component available for use in the current module.

```tsx
import { Input } from "@/components/ui/input"
```

--------------------------------

### Create Navigation Menu with Dropdown Sections in TypeScript React

Source: https://ui.shadcn.com/docs/components/navigation-menu

Builds a responsive navigation menu component with multiple dropdown sections (Home, Components, Docs, List). Uses NavigationMenu primitives from Radix UI with conditional mobile viewport, maps over component arrays for dynamic content generation, and implements custom ListItem sub-components for consistent link styling.

```tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from "lucide-react"

import { useIsMobile } from "@/components/hooks/use-mobile"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
]

export function NavigationMenuDemo() {
  const isMobile = useIsMobile()

  return (
    <NavigationMenu viewport={isMobile}>
      <NavigationMenuList className="flex-wrap">
        <NavigationMenuItem>
          <NavigationMenuTrigger>Home</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-4 no-underline outline-hidden transition-all duration-200 select-none focus:shadow-md md:p-6"
                    href="/"
                  >
                    <div className="mb-2 text-lg font-medium sm:mt-4">
                      shadcn/ui
                    </div>
                    <p className="text-muted-foreground text-sm leading-tight">
                      Beautifully designed components built with Tailwind CSS.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/docs" title="Introduction">
                Re-usable components built using Radix UI and Tailwind CSS.
              </ListItem>
              <ListItem href="/docs/installation" title="Installation">
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href="/docs/primitives/typography" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/docs">Docs</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:block">
          <NavigationMenuTrigger>List</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link href="#">
                    <div className="font-medium">Components</div>
                    <div className="text-muted-foreground">
                      Browse all components in the library.
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
```

--------------------------------

### Display Kbd component inside Button

Source: https://ui.shadcn.com/docs/components/kbd

Integrate Kbd components within Button components to show keyboard shortcuts inside buttons. Useful for displaying keyboard hints on action buttons like Accept or Cancel.

```tsx
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"

export function KbdButton() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="outline" size="sm" className="pr-2">
        Accept <Kbd>⏎</Kbd>
      </Button>
      <Button variant="outline" size="sm" className="pr-2">
        Cancel <Kbd>Esc</Kbd>
      </Button>
    </div>
  )
}
```

--------------------------------

### Import Switch Component

Source: https://ui.shadcn.com/docs/components/switch

Shows the standard import statement for using the Switch component in your application. The component is imported from the local UI components directory.

```typescript
import { Switch } from "@/components/ui/switch"
```

--------------------------------

### Create a Full Collapsible SidebarMenu Component in TSX

Source: https://ui.shadcn.com/docs/components/sidebar

This TypeScript/TSX snippet demonstrates how to construct a complete, functional and collapsible `SidebarMenu` component using Shadcn UI. It includes defining the data structure for menu items, importing necessary components, and rendering the menu with `Collapsible`, `CollapsibleTrigger`, and `CollapsibleContent` to manage expand/collapse states.

```tsx
"use client"\n\nimport { ChevronRightIcon } from "lucide-react"\n\nimport {\n  Collapsible,\n  CollapsibleContent,\n  CollapsibleTrigger,\n} from "@/components/ui/collapsible"\nimport {\n  Sidebar,\n  SidebarContent,\n  SidebarGroup,\n  SidebarGroupContent,\n  SidebarMenu,\n  SidebarMenuButton,\n  SidebarMenuItem,\n  SidebarMenuSub,\n  SidebarMenuSubButton,\n  SidebarMenuSubItem,\n  SidebarProvider,\n} from "@/components/ui/sidebar"\n\nconst items = [\n  {\n    title: "Getting Started",\n    url: "#",\n    items: [\n      {\n        title: "Installation",\n        url: "#",\n      },\n      {\n        title: "Project Structure",\n        url: "#",\n      },\n    ],\n  },\n  {\n    title: "Building Your Application",\n    url: "#",\n    items: [\n      {\n        title: "Routing",\n        url: "#",\n      },\n      {\n        title: "Data Fetching",\n        url: "#",\n        isActive: true,\n      },\n      {\n        title: "Rendering",\n        url: "#",\n      },\n      {\n        title: "Caching",\n        url: "#",\n      },\n      {\n        title: "Styling",\n        url: "#",\n      },\n      {\n        title: "Optimizing",\n        url: "#",\n      },\n      {\n        title: "Configuring",\n        url: "#",\n      },\n      {\n        title: "Testing",\n        url: "#",\n      },\n      {\n        title: "Authentication",\n        url: "#",\n      },\n      {\n        title: "Deploying",\n        url: "#",\n      },\n      {\n        title: "Upgrading",\n        url: "#",\n      },\n      {\n        title: "Examples",\n        url: "#",\n      },\n    ],\n  },\n  {\n    title: "API Reference",\n    url: "#",\n    items: [\n      {\n        title: "Components",\n        url: "#",\n      },\n      {\n        title: "File Conventions",\n        url: "#",\n      },\n      {\n        title: "Functions",\n        url: "#",\n      },\n      {\n        title: "next.config.js Options",\n        url: "#",\n      },\n      {\n        title: "CLI",\n        url: "#",\n      },\n      {\n        title: "Edge Runtime",\n        url: "#",\n      },\n    ],\n  },\n  {\n    title: "Architecture",\n    url: "#",\n    items: [\n      {\n        title: "Accessibility",\n        url: "#",\n      },\n      {\n        title: "Fast Refresh",\n        url: "#",\n      },\n      {\n        title: "Next.js Compiler",\n        url: "#",\n      },\n      {\n        title: "Supported Browsers",\n        url: "#",\n      },\n      {\n        title: "Turbopack",\n        url: "#",\n      },\n    ],\n  },\n]\n\nexport function AppSidebar() {\n  return (\n    <SidebarProvider>\n      <Sidebar>\n        <SidebarContent>\n          <SidebarGroup>\n            <SidebarGroupContent>\n              <SidebarMenu>\n                {items.map((item, index) => (\n                  <Collapsible\n                    key={index}\n                    className="group/collapsible"\n                    defaultOpen={index === 0}\n                  >\n                    <SidebarMenuItem>\n                      <CollapsibleTrigger asChild>\n                        <SidebarMenuButton>\n                          <span>{item.title}</span>\n                          <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />\n                        </SidebarMenuButton>\n                      </CollapsibleTrigger>\n                      <CollapsibleContent>\n                        <SidebarMenuSub>\n                          {item.items.map((subItem, subIndex) => (\n                            <SidebarMenuSubItem key={subIndex}>\n                              <SidebarMenuSubButton asChild>\n                                <a href={subItem.url}>\n                                  <span>{subItem.title}</span>\n                                </a>\n                              </SidebarMenuSubButton>\n                            </SidebarMenuSubItem>\n                          ))}\n                        </SidebarMenuSub>\n                      </CollapsibleContent>\n                    </SidebarMenuItem>\n                  </Collapsible>\n                ))}\n              </SidebarMenu>\n            </SidebarGroupContent>\n          </SidebarGroup>\n        </SidebarContent>\n      </Sidebar>\n    </SidebarProvider>\n  )\n}\n
```

--------------------------------

### Import Shadcn Button Component (TypeScript)

Source: https://ui.shadcn.com/docs/components/button

Shows the necessary import statement for using the Shadcn UI `Button` component in a TypeScript/React file. The import path `"@/components/ui/button"` should be adjusted based on the project's directory structure.

```tsx
import { Button } from "@/components/ui/button"
```

--------------------------------

### Create Project File Structure for Data Table

Source: https://ui.shadcn.com/docs/components/data-table

Recommended directory structure for organizing data table components in a Next.js or React project. Separates column definitions, table component, and page rendering into distinct files following client and server component patterns.

```text
app
└── payments
    ├── columns.tsx
    ├── data-table.tsx
    └── page.tsx
```

--------------------------------

### Integrate Input with Button in TSX

Source: https://ui.shadcn.com/docs/components/input

Demonstrates how to pair an email input field with a submit button using Shadcn components. The `Input` and `Button` components are placed side-by-side within a flex container, ideal for subscription forms or search bars.

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function InputWithButton() {
  return (
    <div className="flex w-full max-w-sm items-center gap-2">
      <Input type="email" placeholder="Email" />
      <Button type="submit" variant="outline">
        Subscribe
      </Button>
    </div>
  )
}
```

--------------------------------

### Configure TypeScript Components with components.json

Source: https://ui.shadcn.com/docs/changelog

Set up shadcn/ui component configuration including Tailwind paths, base colors, CSS variables, React Server Components, and import aliases. Use the tsx flag to control TypeScript/JavaScript output and configure your project structure.

```json
{
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "rsc": false,
  "tsx": false,
  "aliases": {
    "utils": "~/lib/utils",
    "components": "~/components"
  }
}
```

--------------------------------

### Import and use shadcn/ui Button component in React

Source: https://ui.shadcn.com/docs/installation/vite

Demonstrates how to import and use the `Button` component from shadcn/ui within a React application. The component is imported from the configured path alias and rendered inside a functional component for UI display.

```tsx
import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Button>Click me</Button>
    </div>
  )
}

export default App
```

--------------------------------

### Add input-group tooltips (React TSX)

Source: https://ui.shadcn.com/docs/components/input-group

Shows how to attach tooltip triggers to InputGroup buttons to provide contextual help or instructions. Depends on project Tooltip primitives, InputGroup components, and lucide-react icons. Inputs are text/password/API-key input fields; outputs are tooltip overlays. Limitations: tooltips rely on library positioning and the project's Tooltip implementation.

```tsx
import { HelpCircle, InfoIcon } from "lucide-react"\n\nimport {\n  InputGroup,\n  InputGroupAddon,\n  InputGroupButton,\n  InputGroupInput,\n} from "@/components/ui/input-group"\nimport {\n  Tooltip,\n  TooltipContent,\n  TooltipTrigger,\n} from "@/components/ui/tooltip"\n\nexport function InputGroupTooltip() {\n  return (\n    <div className="grid w-full max-w-sm gap-4">\n      <InputGroup>\n        <InputGroupInput placeholder="Enter password" type="password" />\n        <InputGroupAddon align="inline-end">\n          <Tooltip>\n            <TooltipTrigger asChild>\n              <InputGroupButton\n                variant="ghost"\n                aria-label="Info"\n                size="icon-xs"\n              >\n                <InfoIcon />\n              </InputGroupButton>\n            </TooltipTrigger>\n            <TooltipContent>\n              <p>Password must be at least 8 characters</p>\n            </TooltipContent>\n          </Tooltip>\n        </InputGroupAddon>\n      </InputGroup>\n      <InputGroup>\n        <InputGroupInput placeholder="Your email address" />\n        <InputGroupAddon align="inline-end">\n          <Tooltip>\n            <TooltipTrigger asChild>\n              <InputGroupButton\n                variant="ghost"\n                aria-label="Help"\n                size="icon-xs"\n              >\n                <HelpCircle />\n              </InputGroupButton>\n            </TooltipTrigger>\n            <TooltipContent>\n              <p>We&apos;ll use this to send you notifications</p>\n            </TooltipContent>\n          </Tooltip>\n        </InputGroupAddon>\n      </InputGroup>\n      <InputGroup>\n        <InputGroupInput placeholder="Enter API key" />\n        <Tooltip>\n          <TooltipTrigger asChild>\n            <InputGroupAddon>\n              <InputGroupButton\n                variant="ghost"\n                aria-label="Help"\n                size="icon-xs"\n              >\n                <HelpCircle />\n              </InputGroupButton>\n            </InputGroupAddon>\n          </TooltipTrigger>\n          <TooltipContent side="left">\n            <p>Click for help with API keys</p>\n          </TooltipContent>\n        </Tooltip>\n      </InputGroup>\n    </div>\n  )\n}\n
```

--------------------------------

### Import Resizable Components in React

Source: https://ui.shadcn.com/docs/components/resizable

Shows the basic import statement for the Resizable component library. Imports three main components: ResizableHandle for the draggable divider between panels, ResizablePanel for individual resizable sections, and ResizablePanelGroup as the container that manages the layout direction.

```tsx
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
```

--------------------------------

### ItemContent Component

Source: https://ui.shadcn.com/docs/components/item

Wraps the title and description of an item. Provides consistent spacing and layout for textual content.

```APIDOC
## ItemContent Component

### Description
Wraps the title and description of the item. Provides consistent spacing and layout for textual content. Can be omitted if only a title is needed.

### Props
- **className** (string) - Optional - Additional CSS classes

### Basic Usage
```tsx
<ItemContent>
  <ItemTitle>Item</ItemTitle>
  <ItemDescription>Item</ItemDescription>
</ItemContent>
```
```

--------------------------------

### Implement DropdownMenu within a full Sidebar component in TypeScript/React

Source: https://ui.shadcn.com/docs/components/sidebar

This TypeScript/React component demonstrates a complete integration of Shadcn's `DropdownMenu` within a custom `Sidebar` structure. It renders a list of projects, where each project entry includes a `SidebarMenuAction` that triggers a `DropdownMenu` with options like 'Edit Project' and 'Delete Project'. Dependencies include `lucide-react` for icons and various Shadcn UI components for both `DropdownMenu` and `Sidebar`.

```tsx
"use client"

import {
  FrameIcon,
  LifeBuoyIcon,
  MapIcon,
  MoreHorizontalIcon,
  PieChartIcon,
  SendIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

const projects = [
  {
    name: "Design Engineering",
    url: "#",
    icon: FrameIcon,
  },
  {
    name: "Sales & Marketing",
    url: "#",
    icon: PieChartIcon,
  },
  {
    name: "Travel",
    url: "#",
    icon: MapIcon,
  },
  {
    name: "Support",
    url: "#",
    icon: LifeBuoyIcon,
  },
  {
    name: "Feedback",
    url: "#",
    icon: SendIcon,
  },
]

export function AppSidebar() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {projects.map((project) => (
                  <SidebarMenuItem key={project.name}>
                    <SidebarMenuButton
                      asChild
                      className="group-has-[[data-state=open]]/menu-item:bg-sidebar-accent"
                    >
                      <a href={project.url}>
                        <project.icon />
                        <span>{project.name}</span>
                      </a>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction>
                          <MoreHorizontalIcon />
                          <span className="sr-only">More</span>
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem>
                          <span>Edit Project</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <span>Delete Project</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}
```

--------------------------------

### Apply CSS Variables in TSX for Theming

Source: https://ui.shadcn.com/docs/theming

Demonstrates how to apply CSS variables like `bg-background` and `text-foreground` to a div element in a React/Next.js component for dynamic theming, assuming `tailwind.cssVariables` is enabled in the configuration.

```tsx
<div className="bg-background text-foreground" />
```

--------------------------------

### Configure Private Registry with Bearer Token Authentication

Source: https://ui.shadcn.com/docs/changelog

Set up a private registry with authentication using Bearer tokens via environment variables. This configuration keeps proprietary UI components secure within enterprise teams while supporting all major authentication methods including basic auth, API keys, and custom headers.

```json
{
  "registries": {
    "@private": {
      "url": "https://registry.company.com/{name}.json",
      "headers": {
        "Authorization": "Bearer ${REGISTRY_TOKEN}"
      }
    }
  }
}
```

--------------------------------

### Override Third-Party Button Component with Custom CSS Variables

Source: https://ui.shadcn.com/docs/registry/namespace

Demonstrates how to override a vendor button by importing the original dependency and customizing CSS variables. Uses registryDependencies to establish the dependency chain and override specific styling properties like button background color.

```json
{
  "name": "button",
  "type": "registry:ui",
  "files": [
    {
      "path": "components/ui/button.tsx",
      "type": "registry:ui",
      "content": "// Vendor's button implementation\nexport function Button() { ... }"
    }
  ],
  "cssVars": {
    "light": {
      "--button-bg": "blue"
    }
  }
}
```

```json
{
  "name": "custom-button",
  "type": "registry:ui",
  "registryDependencies": [
    "@vendor/button"
  ],
  "cssVars": {
    "light": {
      "--button-bg": "purple"
    }
  }
}
```

--------------------------------

### Configure import alias for components

Source: https://ui.shadcn.com/docs/components-json

Sets the import path alias for generated UI components. Determines where components are imported from in the application.

```json
{
  "aliases": {
    "components": "@/components"
  }
}
```

--------------------------------

### Configure `components.json` for CSS Variable Theming

Source: https://ui.shadcn.com/docs/changelog

This `components.json` configuration snippet sets the `cssVariables` property to `true` within the `tailwind` object. This instructs shadcn/ui to theme components using CSS variables, facilitating dynamic theme adjustments and centralized color management in the project's `globals.css` file.

```json
{
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  }
}
```

--------------------------------

### Import Drawer Components in React

Source: https://ui.shadcn.com/docs/components/drawer

Import all required Drawer subcomponents from the UI component library. These exports provide the building blocks for constructing complete drawer interfaces with headers, triggers, content, and footers.

```tsx
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
```

--------------------------------

### Create Basic Toast with Action in React

Source: https://ui.shadcn.com/docs/components/sonner

Demonstrates creating a basic toast notification with a description and an undo action button. The toast is triggered by clicking a button and includes a callback function for the action. Requires importing the toast function from 'sonner' and the Button component from the UI library.

```typescript
"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function SonnerDemo() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toast("Event has been created", {
          description: "Sunday, December 03, 2023 at 9:00 AM",
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        })
      }
    >
      Show Toast
    </Button>
  )
}
```

--------------------------------

### Implement React UI Component for Dark Mode Toggle

Source: https://ui.shadcn.com/docs/dark-mode/vite

This React component provides a UI for users to toggle between light, dark, and system themes. It utilizes the `useTheme` hook to access the `setTheme` function from the `ThemeProvider` context. The component integrates icons from `lucide-react` and UI primitives (Button, DropdownMenu) from Shadcn UI to create an accessible and visually appealing theme switcher.

```tsx
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:-rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

--------------------------------

### Update Project Dependencies Using PNPM

Source: https://ui.shadcn.com/docs/tailwind-v4

This `bash` command uses `pnpm` to update several specified project dependencies to their latest available versions. It targets `@radix-ui/*`, `cmdk`, `lucide-react`, `recharts`, `tailwind-merge`, and `clsx`.

```bash
pnpm up "@radix-ui/*" cmdk lucide-react recharts tailwind-merge clsx --latest
```

--------------------------------

### Create Basic Tooltip with Button Trigger

Source: https://ui.shadcn.com/docs/components/tooltip

Demonstrates a simple tooltip implementation with a button trigger. The tooltip displays 'Add to library' text when the user hovers over or focuses on the button. Uses the TooltipDemo export component pattern with outline button variant.

```tsx
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function TooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Add to library</p>
      </TooltipContent>
    </Tooltip>
  )
}
```

--------------------------------

### Implement Shadcn UI SidebarHeader with Dropdown Menu (TypeScript/React)

Source: https://ui.shadcn.com/docs/components/sidebar

This snippet shows how to integrate a `SidebarHeader` component into the `Sidebar` to create a sticky header. It further demonstrates adding a `DropdownMenu` within the header for workspace selection, utilizing `DropdownMenuTrigger`, `DropdownMenuContent`, and `DropdownMenuItem` components for interactive functionality.

```tsx
"use client"

import { ChevronDownIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                    Select Workspace
                    <ChevronDownIcon className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-(--radix-popper-anchor-width)">
                  <DropdownMenuItem>
                    <span>Acme Inc</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Acme Corp.</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center justify-between px-4">
          <SidebarTrigger />
        </header>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

```tsx
<Sidebar>
  <SidebarHeader>
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              Select Workspace
              <ChevronDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
            <DropdownMenuItem>
              <span>Acme Inc</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Acme Corp.</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarHeader>
</Sidebar>
```

--------------------------------

### Configure shadcn MCP Server for Claude Code

Source: https://ui.shadcn.com/docs/mcp

This configuration snippet shows how to integrate the shadcn MCP server with Claude Code by adding a 'shadcn' entry to the project's '.mcp.json' file. It specifies 'npx shadcn@latest mcp' as the command to run the server, enabling Claude Code to interact with shadcn components.

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

--------------------------------

### EmptyDescription Component

Source: https://ui.shadcn.com/docs/components/empty

Display descriptive text in an empty state using EmptyDescription component. Provides context to users about why content is unavailable and supports className prop for custom styling.

```tsx
<EmptyDescription>You do not have any notifications.</EmptyDescription>
```

--------------------------------

### Create Next.js Theme Provider Component

Source: https://ui.shadcn.com/docs/dark-mode/next

Defines a reusable React component (`ThemeProvider`) that wraps `next-themes`'s `ThemeProvider`. This component enables theme context throughout the application, making theme state accessible to all child components.

```tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

--------------------------------

### Import Shadcn UI Skeleton Component (TypeScript/React)

Source: https://ui.shadcn.com/docs/components/skeleton

This `tsx` line shows the standard way to import the `Skeleton` component into your React or Next.js files. Ensure your project's import aliases are correctly configured for `@/components/ui/skeleton`.

```tsx
import { Skeleton } from "@/components/ui/skeleton"
```# Gemini API Documentation

The Gemini API provides access to Google's family of multimodal AI models capable of understanding and generating text, images, audio, video, and code. This API enables developers to integrate advanced generative AI capabilities into applications through REST endpoints, streaming interfaces, and WebSocket connections. The API supports various modes of interaction including standard content generation, streaming responses, real-time bidirectional communication via the Live API, and batch processing for large-scale operations.

Built for flexibility and scalability, the Gemini API offers multiple model variants optimized for different use cases—from Gemini 2.5 Pro for complex reasoning tasks to Gemini 2.5 Flash for high-throughput applications. The API includes advanced features such as function calling for tool integration, context caching for cost optimization, structured output generation, code execution, embeddings for semantic search, and specialized models for image and video generation. Authentication is straightforward using API keys, and the service provides comprehensive SDKs for Python, JavaScript, Go, and other languages.

## API Endpoints

### Standard Content Generation

Generate text responses from text and multimodal prompts using the generateContent endpoint.

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "Explain how AI works in a single paragraph."
          }
        ]
      }
    ]
  }'
```

**Response:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "At its core, Artificial Intelligence works by learning from vast amounts of data..."
          }
        ],
        "role": "model"
      },
      "finishReason": "STOP",
      "index": 1
    }
  ]
}
```

### Streaming Content Generation

Stream responses as they are generated using Server-Sent Events for real-time user experiences.

```python
from google import genai

client = genai.Client()

response = client.models.generate_content_stream(
    model="gemini-2.5-flash",
    contents="Write a short story about a robot"
)

for chunk in response:
    print(chunk.text, end="")
```

### Multimodal Prompts with Images

Send text and image data together for visual understanding tasks.

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [{
      "parts":[
        {
          "inline_data": {
            "mime_type":"image/jpeg",
            "data": "/9j/4AAQSkZJRgABAQ..."
          }
        },
        {"text": "What is in this picture?"}
      ]
    }]
  }'
```

### Multi-turn Conversations

Build conversational experiences by maintaining conversation history.

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [{ "text": "Hello." }]
      },
      {
        "role": "model",
        "parts": [{ "text": "Hello! How can I help you today?" }]
      },
      {
        "role": "user",
        "parts": [{ "text": "Please write a four-line poem about the ocean." }]
      }
    ]
  }'
```

## Function Calling

### Define and Execute Functions

Connect Gemini models to external tools and APIs by declaring functions the model can call.

```python
from google import genai
from google.genai import types

client = genai.Client()

# Define function declaration
schedule_meeting_function = {
    "name": "schedule_meeting",
    "description": "Schedules a meeting with specified attendees at a given time and date.",
    "parameters": {
        "type": "object",
        "properties": {
            "attendees": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Email addresses of meeting attendees"
            },
            "time": {
                "type": "string",
                "description": "Meeting time in ISO 8601 format"
            },
            "title": {
                "type": "string",
                "description": "Meeting title"
            }
        },
        "required": ["attendees", "time", "title"]
    }
}

# Call model with function declaration
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Schedule a meeting with john@example.com and jane@example.com tomorrow at 2pm titled 'Project Review'",
    config=types.GenerateContentConfig(
        tools=[types.Tool(function_declarations=[schedule_meeting_function])]
    )
)

# Extract function call from response
function_call = response.candidates[0].content.parts[0].function_call
print(f"Function: {function_call.name}")
print(f"Arguments: {function_call.args}")

# Execute the function with provided arguments
# (Your implementation here)
meeting_result = {"status": "scheduled", "meeting_id": "mtg_12345"}

# Send function result back to model for natural language response
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        types.Content(
            role="user",
            parts=[types.Part(text="Schedule a meeting...")]
        ),
        types.Content(
            role="model",
            parts=[types.Part(function_call=function_call)]
        ),
        types.Content(
            role="user",
            parts=[types.Part(
                function_response=types.FunctionResponse(
                    name=function_call.name,
                    response=meeting_result
                )
            )]
        )
    ]
)

print(response.text)  # "I've scheduled the meeting successfully..."
```

## File API

### Upload and Process Files

Upload media files for processing with size up to several gigabytes.

```python
from google import genai

client = genai.Client()

# Upload a file
myfile = client.files.upload(file="path/to/sample.mp3")

# Use uploaded file in generation
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=["Describe this audio clip", myfile]
)

print(response.text)

# List all uploaded files
files = client.files.list()
for file in files:
    print(f"{file.name}: {file.display_name} ({file.state})")

# Delete a file when no longer needed
client.files.delete(name=myfile.name)
```

```javascript
import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";

const ai = new GoogleGenAI({});

// Upload file
const myfile = await ai.files.upload({
  file: "path/to/sample.mp3",
  config: { mimeType: "audio/mp3" }
});

// Generate content with file
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: createUserContent([
    createPartFromUri(myfile.uri, myfile.mimeType),
    "Describe this audio clip"
  ])
});

console.log(response.text);
```

## Embeddings

### Generate Text Embeddings

Create vector embeddings for semantic search, classification, and clustering tasks.

```python
from google import genai

client = genai.Client()

# Generate single embedding
result = client.models.embed_content(
    model="gemini-embedding-001",
    contents="What is the meaning of life?"
)

print(f"Embedding dimension: {len(result.embeddings[0].values)}")
print(f"First few values: {result.embeddings[0].values[:5]}")

# Generate embeddings with task type for better performance
result = client.models.embed_content(
    model="gemini-embedding-001",
    contents="Machine learning is a subset of artificial intelligence",
    config={"task_type": "retrieval_document"}
)

# Batch embedding generation
texts = [
    "The quick brown fox jumps over the lazy dog",
    "Machine learning enables computers to learn from data",
    "Python is a popular programming language"
]

results = [
    client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
        config={"task_type": "retrieval_document"}
    )
    for text in texts
]

embeddings = [r.embeddings[0].values for r in results]
print(f"Generated {len(embeddings)} embeddings")
```

**Task Types:**
- `retrieval_document`: For indexing documents
- `retrieval_query`: For search queries
- `semantic_similarity`: For comparing text similarity
- `classification`: For text classification
- `clustering`: For grouping similar texts

## Context Caching

### Reduce Costs with Explicit Caching

Cache frequently used content like large documents or system instructions to save on token costs.

```python
import pathlib
import requests
from google import genai
from google.genai import types

client = genai.Client()

# Download and upload video file
url = 'https://storage.googleapis.com/generativeai-downloads/data/SherlockJr._10min.mp4'
path_to_video_file = pathlib.Path('SherlockJr._10min.mp4')
if not path_to_video_file.exists():
    response = requests.get(url)
    path_to_video_file.write_bytes(response.content)

video_file = client.files.upload(file=str(path_to_video_file))

# Create cache with system instruction and video
cache = client.caches.create(
    model="gemini-2.5-flash",
    config=types.CreateCachedContentConfig(
        contents=[
            types.Content(
                role="user",
                parts=[types.Part.from_uri(file_uri=video_file.uri, mime_type=video_file.mime_type)]
            )
        ],
        system_instruction="You are an expert video analyzer. Analyze this video carefully.",
        ttl="3600s"  # Cache for 1 hour
    )
)

# Use cache for multiple requests (saves costs)
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Describe the main scenes in this video",
    config=types.GenerateContentConfig(
        cached_content=cache.name
    )
)
print(response.text)

# Second request reuses cache
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="What emotions are portrayed in this video?",
    config=types.GenerateContentConfig(
        cached_content=cache.name
    )
)
print(response.text)

# List all caches
caches = client.caches.list()
for c in caches:
    print(f"{c.name}: expires at {c.expire_time}")

# Delete cache when done
client.caches.delete(name=cache.name)
```

## Structured Output

### Generate JSON with Schema Validation

Force the model to output valid JSON matching a specific schema.

```python
from google import genai
from pydantic import BaseModel

class Recipe(BaseModel):
    recipe_name: str
    ingredients: list[str]
    instructions: list[str]
    prep_time_minutes: int

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="List a few popular cookie recipes with detailed instructions.",
    config={
        "response_mime_type": "application/json",
        "response_schema": list[Recipe]
    }
)

# Parse as JSON string
import json
recipes_json = json.loads(response.text)
print(recipes_json)

# Use typed objects
recipes: list[Recipe] = response.parsed
for recipe in recipes:
    print(f"\n{recipe.recipe_name}")
    print(f"Prep time: {recipe.prep_time_minutes} minutes")
    print(f"Ingredients: {', '.join(recipe.ingredients)}")
```

```javascript
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({});

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: "List a few popular cookie recipes with ingredients.",
  config: {
    responseMimeType: "application/json",
    responseSchema: Type.array(
      Type.object({
        properties: {
          recipe_name: Type.string(),
          ingredients: Type.array(Type.string())
        }
      })
    )
  }
});

const recipes = JSON.parse(response.text);
console.log(recipes);
```

## Batch API

### Process Large Volumes Asynchronously

Submit batches of requests for processing at 50% cost with 24-hour target turnaround.

```python
from google import genai
from google.genai import types

client = genai.Client()

# Create batch with inline requests
inline_requests = [
    {
        'contents': [{
            'parts': [{'text': 'Tell me a one-sentence joke.'}],
            'role': 'user'
        }]
    },
    {
        'contents': [{
            'parts': [{'text': 'Why is the sky blue?'}],
            'role': 'user'
        }]
    },
    {
        'contents': [{
            'parts': [{'text': 'Explain quantum computing simply.'}],
            'role': 'user'
        }]
    }
]

batch = client.batches.create(
    model="gemini-2.5-flash",
    requests=inline_requests
)

print(f"Batch created: {batch.name}")
print(f"Status: {batch.state}")

# Monitor batch status
import time
while batch.state == "PROCESSING":
    time.sleep(10)
    batch = client.batches.get(name=batch.name)
    print(f"Status: {batch.state}")

# Retrieve results when complete
if batch.state == "SUCCEEDED":
    for i, response in enumerate(batch.inline_responses):
        print(f"\nRequest {i+1}:")
        print(response.candidates[0].content.parts[0].text)

# For large batches, use file-based input/output
# Create JSONL file with requests
import json
with open('batch_requests.jsonl', 'w') as f:
    for req in inline_requests:
        f.write(json.dumps(req) + '\n')

# Upload input file
input_file = client.files.upload(file='batch_requests.jsonl')

# Create batch with file
batch = client.batches.create(
    model="gemini-2.5-flash",
    input_uri=input_file.uri
)

# Wait for completion and download output file
# Output will be a JSONL file with results
```

## Code Execution

### Run Python Code Within Model Context

Enable the model to generate and execute Python code for calculations and data processing.

```python
from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="What is the sum of the first 50 prime numbers? Generate and run code for the calculation.",
    config=types.GenerateContentConfig(
        tools=[types.Tool(code_execution=types.ToolCodeExecution)]
    )
)

# Response contains both code and execution results
for part in response.candidates[0].content.parts:
    if part.text is not None:
        print("Text:", part.text)
    if part.executable_code is not None:
        print("Code:", part.executable_code.code)
    if part.code_execution_result is not None:
        print("Result:", part.code_execution_result.output)
```

```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [
    "Calculate the fibonacci sequence up to the 20th number using code."
  ],
  config: {
    tools: [{ codeExecution: {} }]
  }
});

console.log(response.text);
```

## Audio Understanding

### Process and Analyze Audio Content

Generate transcriptions, summaries, and insights from audio files.

```python
from google import genai

client = genai.Client()

# Upload audio file
audio_file = client.files.upload(file="path/to/podcast.mp3")

# Transcribe audio
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=["Transcribe this audio file", audio_file]
)
print("Transcription:", response.text)

# Analyze audio content
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        "Summarize the key points discussed in this audio in bullet points",
        audio_file
    ]
)
print("\nSummary:", response.text)

# Extract specific information
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        "What are the names of the speakers and what topics did each person discuss?",
        audio_file
    ]
)
print("\nSpeaker Analysis:", response.text)
```

## Safety Settings

### Configure Content Safety Filters

Control content filtering thresholds for different harm categories.

```python
from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Write a story about...",
    config=types.GenerateContentConfig(
        safety_settings={
            types.HarmCategory.HARM_CATEGORY_HATE_SPEECH: types.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: types.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: types.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            types.HarmCategory.HARM_CATEGORY_HARASSMENT: types.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        }
    )
)

print(response.text)

# Check safety ratings in response
for rating in response.candidates[0].safety_ratings:
    print(f"{rating.category}: {rating.probability}")
```

## System Instructions and Configuration

### Configure Model Behavior and Parameters

Set system instructions, temperature, and other generation parameters.

```python
from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Write a product description for a smart water bottle",
    config=types.GenerateContentConfig(
        system_instruction="You are a professional copywriter specializing in product descriptions. Write engaging, concise copy that highlights features and benefits.",
        temperature=0.9,  # Higher for more creative output
        top_p=0.95,
        top_k=40,
        max_output_tokens=500,
        stop_sequences=["END"]
    )
)

print(response.text)
```

## Token Counting

### Estimate Token Usage Before Requests

Count tokens to estimate costs and stay within limits.

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:countTokens" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "This is a sample text for token counting."
          }
        ]
      }
    ]
  }'
```

**Response:**
```json
{
  "totalTokens": 10
}
```

```python
from google import genai

client = genai.Client()

result = client.models.count_tokens(
    model="gemini-2.5-flash",
    contents="This is a sample text for token counting."
)

print(f"Total tokens: {result.total_tokens}")
```

## Model Selection

### Choose the Right Model

Different models optimized for specific use cases and performance requirements.

```python
from google import genai

client = genai.Client()

# Gemini 2.5 Pro - Best for complex reasoning, large context
response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents="Analyze this 50-page research paper and identify key findings..."
)

# Gemini 2.5 Flash - Best for speed and cost efficiency
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Summarize this article in one paragraph"
)

# Gemini 2.5 Flash-Lite - Best for high-volume, simple tasks
response = client.models.generate_content(
    model="gemini-2.5-flash-lite",
    contents="Classify this review as positive or negative"
)

# List available models
models = client.models.list()
for model in models:
    print(f"{model.name}: {model.display_name}")
    print(f"  Input limit: {model.input_token_limit}")
    print(f"  Output limit: {model.output_token_limit}")
```

## Summary

The Gemini API is a comprehensive platform for integrating generative AI into applications, offering flexible endpoints for synchronous and asynchronous content generation, streaming responses, and real-time communication. Primary use cases include building conversational AI assistants with multi-turn dialog support, creating multimodal applications that process text, images, audio, and video, implementing RAG systems using embeddings for semantic search, automating workflows through function calling and tool integration, and processing large-scale datasets cost-effectively with batch operations. The API's structured output capabilities ensure reliable data extraction, while code execution enables computational reasoning tasks.

Integration patterns typically involve using the Python or JavaScript SDKs for rapid development, implementing caching strategies to optimize costs for repetitive queries, combining multiple capabilities like function calling with structured output for complex workflows, and leveraging the Files API for handling large media files. Best practices include choosing the appropriate model variant based on task complexity and throughput requirements, utilizing context caching for prompts with large or repeated content, implementing proper error handling for safety filters and rate limits, monitoring token usage to control costs, and following the API's content policies for responsible AI deployment. The API's comprehensive documentation, code examples, and integration guides make it accessible for developers building everything from simple chatbots to sophisticated AI-powered applications.
