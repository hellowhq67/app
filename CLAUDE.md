# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PTE Academic preparation platform built with Next.js 16, providing practice tests, AI-powered scoring, and analytics for all four PTE sections: Speaking, Writing, Reading, and Listening.

## Common Commands

```bash
# Development
pnpm dev              # Start dev server (webpack)
pnpm dev:turbo        # Start dev server (turbopack)
pnpm build            # Production build
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking

# Database (Drizzle + Neon PostgreSQL)
pnpm db:generate      # Generate migrations from schema changes
pnpm db:push          # Push schema directly to database
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio GUI
pnpm db:seed:pte      # Seed PTE question data

# Testing (Vitest)
pnpm test             # Run all tests
pnpm test:watch       # Watch mode
pnpm vitest <file>    # Run specific test file
```

## Architecture

### Route Groups (app/)
- `(auth)/` - Sign-in/sign-up pages
- `(home)/` - Marketing landing page
- `(pte)/` - Main application (requires auth)
  - `academic/` - PTE Academic practice sections
    - `practice/` - Individual question practice (speaking, writing, reading, listening)
    - `mock-tests/` - Full mock test system
    - `analytics/` - User progress analytics
- `api/` - API routes for scoring, attempts, user data
- `studio/` - Sanity CMS Studio

### Key Libraries
- **lib/ai/** - AI scoring system using Gemini (via AI SDK)
  - `scoring-agent.ts` - Universal scorer combining ASR, embeddings, and LLM evaluation
  - `prompts.ts` - Question-type-specific scoring prompts
  - `config.ts` - AI model configuration (Gemini 2.5 Flash, AssemblyAI)
- **lib/db/** - Drizzle ORM with Neon PostgreSQL
  - `schema/` - Database schema definitions (pte-questions, attempts, users, etc.)
  - `queries/` - Database query functions
- **lib/auth/** - Authentication via better-auth with Google OAuth

### Database Schema
Schema files in `lib/db/schema/`:
- `users.ts` - User accounts, sessions, settings
- `pte-questions.ts` - Question bank for all PTE types
- `pte-attempts.ts` - User attempt records with scores
- `pte-sessions.ts` - Practice session tracking
- `billing.ts` - Subscription/payment data

### PTE Question Types (QuestionType enum in lib/types.ts)
**Speaking**: Read Aloud, Repeat Sentence, Describe Image, Re-tell Lecture, Answer Short Question
**Writing**: Summarize Written Text, Write Essay
**Reading**: Fill in the Blanks (two types), Multiple Choice, Re-order Paragraphs
**Listening**: Summarize Spoken Text, Fill in the Blanks, Highlight Correct Summary, Write from Dictation

### AI Scoring Flow
1. Audio submissions transcribed via AssemblyAI
2. Semantic similarity calculated against ideal answers using embeddings
3. Gemini generates structured feedback via `generateObject` with Zod schema
4. Scores stored in `pte_attempts` table

### Content Management
Sanity CMS at `/studio` for:
- Blog posts
- Courses/lessons
- Testimonials
- Marketing banners

### Environment Variables Required
- `DATABASE_URL` - Neon PostgreSQL connection string
- `GOOGLE_GENERATIVE_AI_API_KEY` - Gemini API
- `ASSEMBLYAI_API_KEY` - Speech transcription
- `BETTER_AUTH_URL` - Auth base URL
- `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` - OAuth
- Sanity project credentials in `sanity/env.ts`

### Path Aliases
```
@/* -> ./*
@/components/* -> ./components/*
@/lib/* -> ./lib/*
@/hooks/* -> ./hooks/*
@/app/* -> ./app/*
```
