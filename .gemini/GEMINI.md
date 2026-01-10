# Gemini Context: PTE Academic Mock Test Platform

This file provides context for the Gemini AI agent working on this project.

## 1. Project Overview
This is a production-ready **PTE Academic Mock Test Platform** built with **Next.js 16**. It offers a complete 2-hour mock test experience with all 20 PTE question types, featuring real-time AI scoring, analytics, and a strict exam mode. The application simulates the actual PTE exam environment including timing, audio restrictions, and navigation controls.

## 2. Tech Stack
*   **Framework:** Next.js 16 (App Router)
*   **Language:** TypeScript 5+
*   **UI/Styling:** React 19, Tailwind CSS 4, Shadcn UI, Framer Motion
*   **Database:** Neon PostgreSQL (Serverless) via Drizzle ORM
*   **Authentication:** Better Auth (Google OAuth)
*   **AI & ML:**
    *   **Scoring:** Google Gemini 2.5 Flash (via Vercel AI SDK)
    *   **Transcription:** AssemblyAI
    *   **Embeddings:** for semantic similarity
*   **CMS:** Sanity Studio (embedded at `/studio`)
*   **Testing:** Vitest (Unit), Playwright (E2E)

## 3. Key Commands

### Development
*   `pnpm dev`: Start development server (webpack)
*   `pnpm dev:turbo`: Start development server (Turbopack)
*   `pnpm build`: Build for production
*   `pnpm lint`: Run ESLint
*   `pnpm type-check`: Run TypeScript checks

### Database (Drizzle + Neon)
*   `pnpm db:generate`: Generate SQL migrations from schema
*   `pnpm db:migrate`: Apply migrations to the database
*   `pnpm db:push`: Push schema changes directly (prototyping)
*   `pnpm db:studio`: Open Drizzle Studio UI
*   `pnpm db:seed:pte`: Seed PTE question data
*   `pnpm db:reset`: Reset database (use with caution)

### Testing
*   `pnpm test`: Run unit tests (Vitest)
*   `pnpm test:watch`: Run tests in watch mode
*   `pnpm test:e2e`: Run E2E tests (Playwright)

## 4. Architecture & Structure

### Directory Map
*   **`app/`**: Next.js App Router.
    *   `(auth)`: Authentication routes.
    *   `(pte)/academic`: Core mock test and practice application.
    *   `api/`: Backend API routes for scoring and data fetching.
*   **`components/`**: React components.
    *   `pte/`: Exam-specific components (Timer, Recorder, AudioPlayer).
    *   `ui/`: Shadcn UI primitives.
*   **`lib/`**: Core logic.
    *   `db/`: Drizzle schema and connection logic.
    *   `ai/`: Scoring agents and prompt definitions.
    *   `auth/`: Better Auth configuration.
*   **`scripts/`**: Database maintenance and setup scripts.

### Database Schema
Key tables defined in `lib/db/schema/`:
*   `users`: User profiles and settings.
*   `pte_questions`: The bank of test questions.
*   `pte_attempts`: Records of user test attempts and scores.
*   `pte_sessions`: State tracking for active test sessions.

### AI Scoring Pipeline
1.  User submits audio/text response.
2.  Audio is transcribed via AssemblyAI.
3.  System calculates semantic similarity embeddings against benchmark answers.
4.  Gemini AI evaluates the response using specific prompts (`lib/ai/prompts.ts`) and Zod schemas.
5.  Structured feedback (pronunciation, fluency, grammar, etc.) is stored.

## 5. PTE Question Types
The system supports 20 question types across 4 sections:
*   **Speaking:** Read Aloud, Repeat Sentence, Describe Image, Re-tell Lecture, Answer Short Question.
*   **Writing:** Summarize Written Text, Write Essay.
*   **Reading:** Fill in Blanks (R & R/W), Multiple Choice (Single/Multi), Re-order Paragraphs.
*   **Listening:** Summarize Spoken Text, Multiple Choice, Fill in Blanks, Highlight Correct Summary, Select Missing Word, Highlight Incorrect Words, Write from Dictation.

## 6. Development Guidelines
*   **Path Aliases:** Use `@/` for imports (e.g., `@/components`, `@/lib`).
*   **Env Variables:** Ensure `DATABASE_URL`, `GOOGLE_GENERATIVE_AI_API_KEY`, and `ASSEMBLYAI_API_KEY` are set in `.env.local`.
*   **Strict Mode:** TypeScript strict mode is enabled.
*   **Conventions:** Prefer Functional Components, Server Actions for mutations, and proper error handling for external API calls.
