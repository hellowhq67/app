# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PTE Academic preparation platform built with Next.js 16 (React 19), providing practice tests, AI-powered scoring, and analytics for all four PTE sections: Speaking, Writing, Reading, and Listening.

## Common Commands

```bash
# Development
pnpm dev              # Start dev server (webpack)
pnpm dev:turbo        # Start dev server (turbopack)
pnpm build            # Production build
pnpm lint             # Run ESLint
pnpm lint:fix         # Auto-fix ESLint errors
pnpm type-check       # TypeScript type checking

# Database (Drizzle + Neon PostgreSQL)
pnpm db:generate      # Generate migrations from schema changes
pnpm db:push          # Push schema directly to database
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio GUI
pnpm db:seed:pte      # Seed PTE question data

# Testing (Vitest + jsdom)
pnpm test             # Run all tests
pnpm test:watch       # Watch mode
pnpm vitest <pattern> # Run tests matching pattern (e.g., pnpm vitest scoring)
pnpm test:e2e         # Run Playwright E2E tests (e2e/ directory)

# Validation
pnpm deploy-checklist # Pre-deployment env/config validation

# Cleaning
pnpm clean            # Clear .next, .turbo, .swc caches
pnpm clean:all        # Full clean + reinstall dependencies
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
- **lib/ai/** - AI scoring system using Vercel AI SDK
  - `scoring-agent.ts` - Universal scorer combining ASR, embeddings, and LLM evaluation
  - `prompts.ts` - Question-type-specific scoring prompts
  - `config.ts` - AI model configuration (Gemini 2.5 Flash, AssemblyAI, text-embedding-004)
- **lib/pte/scoring-engine/** - Deterministic scoring for objective question types
  - `deterministic.ts` - Auto-scoring for MCQ, fill-in-blanks, reorder, etc.
  - `pipeline.ts` - Full scoring pipeline orchestration
- **lib/db/** - Drizzle ORM with Neon PostgreSQL
  - `schema/` - Database schema definitions (pte-questions, attempts, users, etc.)
  - `queries/` - Database query functions
- **lib/auth/** - Authentication via better-auth with Google OAuth
- **lib/billing/** - Payment processing (Polar.sh for international, SSLCommerz for Bangladesh)

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
1. Deterministic scoring attempted first for objective types (MCQ, fill-in-blanks, reorder)
2. For subjective types (speaking, writing):
   - Audio transcribed via AssemblyAI (`experimental_transcribe`)
   - Semantic similarity calculated via Google text-embedding-004
   - Gemini 2.5 Flash generates structured feedback via `generateObject` with Zod schema
3. Scores stored in `pte_attempts` table with full AI feedback JSON

### Content Management
Sanity CMS at `/studio` for:
- Blog posts
- Courses/lessons
- Testimonials
- Marketing banners

### Environment Variables Required
See `.env.example` for full list. Key variables:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `GOOGLE_GENERATIVE_AI_API_KEY` - Gemini API for scoring
- `ASSEMBLYAI_API_KEY` - Speech transcription
- `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` - Authentication
- `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` - OAuth
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob for audio storage
- `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` - Rate limiting
- `NEXT_PUBLIC_SANITY_PROJECT_ID`/`NEXT_PUBLIC_SANITY_DATASET` - CMS

### Path Aliases
`@/*` maps to project root (configured in tsconfig.json)

## CI/CD Pipeline

GitHub Actions workflows in `.github/workflows/`:
- `ci.yml` - Main CI pipeline (lint, type-check, test, build)
- `vercel-deploy.yml` - Vercel deployment
- `preview.yml` - Preview deployments for PRs

### Pre-commit Checklist
```bash
pnpm lint          # No linting errors
pnpm type-check    # No type errors
pnpm test          # All tests pass
pnpm build         # Build succeeds
```

## State Management

- **Zustand** for global client state (e.g., test session state)
- **nuqs** for URL search params state
- **SWR** for data fetching and caching

## Testing Details

### Unit Tests (Vitest)
- Globals enabled — no need to import `describe`/`it`/`expect`
- Setup file: `vitest.setup.ts` (loads `@testing-library/jest-dom`)
- Coverage: v8 reporter, output to `./coverage/`
- E2E tests in `e2e/` are excluded from unit test runs

### E2E Tests (Playwright)
- Config: `playwright.config.ts`, tests in `e2e/`
- Base URL: `PLAYWRIGHT_TEST_BASE_URL` env var (defaults to http://localhost:3000)
- Chromium only; auto-starts `pnpm dev` locally or `pnpm start` on CI
- 2 retries on CI, screenshots on failure, video on first retry

## Key Utilities

- **`lib/env.ts`** — Zod-validated env schema; all required env vars are validated at startup. If a required var is missing the app will throw with a clear error.
- **`lib/utils.ts`** — `cn()` (clsx + tailwind-merge) and `countWords()` helpers
- **`lib/auth/email.ts`** — Resend-powered transactional emails; falls back to `console.log` in dev if `RESEND_API_KEY` is unset

## Important Gotchas

- **`ignoreBuildErrors: true`** in `next.config.ts` — TypeScript errors do not block production builds (intentional). Always run `pnpm type-check` separately.
- **No `middleware.ts`** — Auth is handled entirely via better-auth API routes at `/api/auth/*`, not Next.js middleware.
- **Database pooling** — Drizzle prefers `DATABASE_URL_POOLED` over `DATABASE_URL` when set; use the pooled URL for serverless environments.
- **React Compiler enabled** — Next.js 16 has React Compiler on by default. Some patterns (state in effects, refs) produce warnings, downgraded to non-blocking in ESLint config.
- **CORS** — Open CORS for `/api/*` is configured in `vercel.json`, not in Next.js config.
