# Project Memory & Architecture

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Postgres (Neon via Drizzle ORM)
- **Testing**: Vitest, React Testing Library, Playwright (E2E)
- **Build System**: TurboRepo
- **Containerization**: Docker (Multi-stage build)

## Configuration Details

### Testing (Vitest)

- Configured in `vitest.config.ts`
- Uses `jsdom` environment
- Setup file: `vitest.setup.ts`
- Commands: `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`

### Monorepo/Build (Turbo)

- Configured in `turbo.json`
- Pipeline: `build`, `test`, `lint`
- Command: `pnpm check` (Runs validation suite)

### Docker

- File: `Dockerfile`
- Multi-stage build: `base` -> `deps` -> `builder` -> `runner`
- Compose: `docker-compose.yml` for local production capability
- User: `nextjs` (UID 1001) for security

### Development Environment

- DevContainer: `.devcontainer/devcontainer.json` for consistent VS Code environments.
