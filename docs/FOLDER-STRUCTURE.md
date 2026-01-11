# Project Folder Structure

Complete folder structure for the PTE Academic platform with Cloud Build integration.

## 📁 Root Structure

```
pedagogistspte.v.0.2/
│
├── .devcontainer/                  # DevContainer configurations
│   ├── devcontainer.json           # Local build (requires Docker Desktop)
│   ├── devcontainer.cloud.json     # Cloud-built image (recommended)
│   └── Dockerfile.dev              # Development container definition
│
├── .github/                        # GitHub Actions & CI/CD
│   ├── workflows/
│   │   ├── ci.yml                  # Main CI/CD pipeline
│   │   ├── cloud-build.yml         # Cloud Build trigger (optional)
│   │   └── claude-automation.yml   # AI-powered automation (optional)
│   ├── CI-CD-SETUP.md             # GitHub Actions setup guide
│   └── SECRETS-TEMPLATE.md        # Required secrets checklist
│
├── .vscode/                        # VS Code configuration
│   ├── settings.json
│   ├── extensions.json
│   └── mcp.json
│
├── app/                            # Next.js 16 App Router
│   ├── (auth)/                     # Authentication routes
│   ├── (home)/                     # Marketing pages
│   ├── (pte)/                      # Main app (protected)
│   │   └── academic/
│   │       ├── practice/           # Question practice
│   │       ├── mock-tests/         # Full mock tests
│   │       ├── sectional-test/     # Section-specific tests
│   │       └── analytics/          # Progress tracking
│   ├── api/                        # API routes
│   │   ├── mock-test/
│   │   ├── sectional-test/
│   │   └── auth/
│   └── studio/                     # Sanity CMS Studio
│
├── components/                     # React components
│   ├── pte/                        # PTE-specific components
│   │   ├── speaking/
│   │   ├── writing/
│   │   ├── reading/
│   │   ├── listening/
│   │   ├── mock-test/
│   │   ├── sectional-test/
│   │   └── report/
│   └── ui/                         # Shared UI components
│
├── lib/                            # Core libraries
│   ├── ai/                         # AI scoring system
│   │   ├── config.ts               # AI model configuration
│   │   ├── scoring-agent.ts        # Universal scoring agent
│   │   ├── prompts.ts              # Question-specific prompts
│   │   └── schemas.ts              # Zod validation schemas
│   ├── db/                         # Database (Drizzle ORM)
│   │   ├── schema/                 # Database schemas
│   │   │   ├── users.ts
│   │   │   ├── pte-questions.ts
│   │   │   ├── pte-attempts.ts
│   │   │   ├── pte-sessions.ts
│   │   │   └── pte-sectional-tests.ts
│   │   ├── queries/                # Database queries
│   │   └── seed-pte-data.ts        # Data seeding
│   ├── auth/                       # Better Auth setup
│   ├── pte/                        # PTE business logic
│   │   ├── config/
│   │   ├── scoring-engine/         # Deterministic scoring
│   │   ├── scoring-dispatcher.ts
│   │   ├── mock-test-templates.ts
│   │   └── sectional-templates.ts
│   └── types.ts                    # TypeScript types
│
├── docs/                           # Documentation
│   ├── CLOUD-BUILD-SETUP.md        # Complete Cloud Build guide
│   ├── CLOUD-BUILD-QUICK-START.md  # 5-minute quick start
│   └── FOLDER-STRUCTURE.md         # This file
│
├── hooks/                          # React hooks
├── public/                         # Static assets
├── sanity/                         # Sanity CMS configuration
├── scripts/                        # Utility scripts
│
├── cloudbuild.yaml                 # DevContainer build config
├── cloudbuild-production.yaml      # Production deployment config
├── Dockerfile                      # Production runtime
├── next.config.ts                  # Next.js configuration
├── tailwind.config.ts              # Tailwind CSS config
├── tsconfig.json                   # TypeScript config
├── drizzle.config.ts               # Drizzle ORM config
├── package.json                    # Dependencies
├── pnpm-lock.yaml                  # Lockfile
├── CLAUDE.md                       # Claude Code instructions
└── README.md                       # Project overview
```

## 🗂️ Key Folders Explained

### `.devcontainer/`
Development container configurations for consistent dev environments.

**Files:**
- `devcontainer.json` - Local Docker build (slow, requires Docker Desktop)
- `devcontainer.cloud.json` - Cloud-built image (fast, recommended)
- `Dockerfile.dev` - Container definition

**Usage:**
- Use `devcontainer.cloud.json` after setting up Cloud Build
- Eliminates need for local Docker Desktop
- Faster container startup

### `.github/`
CI/CD pipelines and automation.

**Workflows:**
- `ci.yml` - Runs on every PR: lint, test, build, migration checks
- `cloud-build.yml` - Triggers Cloud Build from GitHub (optional)
- `claude-automation.yml` - AI-powered code review (optional)

**Documentation:**
- `CI-CD-SETUP.md` - Complete GitHub Actions setup
- `SECRETS-TEMPLATE.md` - Required secrets checklist

### `app/`
Next.js 16 App Router structure.

**Route Groups:**
- `(auth)/` - Public authentication pages
- `(home)/` - Marketing landing pages
- `(pte)/` - Protected app routes (requires login)
- `api/` - API endpoints
- `studio/` - Sanity CMS Studio

### `components/`
React components organized by feature.

**Structure:**
- `pte/` - PTE-specific components (by section)
- `ui/` - Reusable UI components (shadcn/ui)

### `lib/`
Core business logic and utilities.

**Key Folders:**
- `ai/` - AI scoring with Gemini + AssemblyAI
- `db/` - Database schemas and queries (Drizzle + Neon)
- `pte/` - PTE-specific business logic
- `auth/` - Better Auth configuration

### `docs/`
Project documentation.

**Files:**
- `CLOUD-BUILD-SETUP.md` - Complete Cloud Build guide
- `CLOUD-BUILD-QUICK-START.md` - Quick 5-minute setup
- `FOLDER-STRUCTURE.md` - This file

### Root Config Files

**Cloud Build:**
- `cloudbuild.yaml` - Builds devcontainer image
- `cloudbuild-production.yaml` - Deploys to Cloud Run
- `Dockerfile` - Production runtime image

**Framework Configs:**
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS
- `tsconfig.json` - TypeScript
- `drizzle.config.ts` - Database ORM

**Package Management:**
- `package.json` - Dependencies and scripts
- `pnpm-lock.yaml` - Lockfile (using pnpm)

## 📦 Key Dependencies

### Frontend
- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- shadcn/ui components
- Framer Motion (animations)

### Backend
- Drizzle ORM (database)
- Neon PostgreSQL (serverless)
- Better Auth (authentication)
- AI SDK (AI scoring)

### AI Services
- Google Gemini 2.5 Flash (scoring)
- AssemblyAI (speech transcription)
- Embeddings (semantic similarity)

### CMS
- Sanity v4 (content management)

### DevOps
- Google Cloud Build
- Cloud Run (production)
- Artifact Registry (images)
- Secret Manager (secrets)

## 🚀 Quick Navigation

**Starting development:**
```bash
cd pedagogistspte.v.0.2
pnpm install
pnpm dev
```

**Database operations:**
```bash
pnpm db:push       # Push schema changes
pnpm db:studio     # Open Drizzle Studio
pnpm db:seed:pte   # Seed PTE questions
```

**Cloud Build:**
```bash
gcloud builds submit --config=cloudbuild.yaml
```

**Documentation:**
- Cloud Build setup: `docs/CLOUD-BUILD-SETUP.md`
- Quick start: `docs/CLOUD-BUILD-QUICK-START.md`
- CI/CD: `.github/CI-CD-SETUP.md`

## 📚 Related Documentation

- [Cloud Build Setup](./CLOUD-BUILD-SETUP.md) - Complete guide
- [Quick Start](./CLOUD-BUILD-QUICK-START.md) - 5-minute setup
- [CI/CD Setup](../.github/CI-CD-SETUP.md) - GitHub Actions
- [Project Instructions](../CLAUDE.md) - For Claude Code
