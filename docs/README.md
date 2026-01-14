# PTE Academic Platform Documentation

Welcome to the documentation for the PTE Academic preparation platform.

## 📚 Documentation Index

### Getting Started
1. **[Quick Start](./CLOUD-BUILD-QUICK-START.md)** - Get Cloud Build running in 5 minutes
2. **[Folder Structure](./FOLDER-STRUCTURE.md)** - Understand the project organization
3. **[Cloud Build Setup](./CLOUD-BUILD-SETUP.md)** - Complete Cloud Build guide

### CI/CD & Deployment
4. **[CI/CD Setup](../.github/CI-CD-SETUP.md)** - GitHub Actions configuration
5. **[Secrets Template](../.github/SECRETS-TEMPLATE.md)** - Required environment variables

### Development
6. **[CLAUDE.md](../CLAUDE.md)** - Instructions for Claude Code

## 🚀 Quick Links

### For New Developers

**First time setup:**
1. Read [Folder Structure](./FOLDER-STRUCTURE.md)
2. Follow [Cloud Build Quick Start](./CLOUD-BUILD-QUICK-START.md)
3. Set up [CI/CD](./.github/CI-CD-SETUP.md)

**Daily workflow:**
```bash
# Pull latest code
git pull

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Type check
pnpm type-check
```

### For DevOps/Platform Engineers

**Cloud infrastructure:**
- [Complete Cloud Build Guide](./CLOUD-BUILD-SETUP.md)
- [Production Deployment Config](../cloudbuild-production.yaml)
- [DevContainer Config](../cloudbuild.yaml)

**Secrets management:**
- GitHub: [Secrets Template](../.github/SECRETS-TEMPLATE.md)
- GCP: Use Secret Manager (see Cloud Build guide)

### For AI/ML Engineers

**Scoring system:**
- Location: `lib/ai/`
- Main agent: `lib/ai/scoring-agent.ts`
- Prompts: `lib/ai/prompts.ts`
- Configuration: `lib/ai/config.ts`

**AI Services:**
- Gemini 2.5 Flash (LLM scoring)
- AssemblyAI (speech-to-text)
- Text Embeddings (semantic similarity)

## 🎯 Key Features

### Development Environment
- ✅ Cloud-built DevContainers (no Docker Desktop required)
- ✅ Works on old/weak CPUs
- ✅ Consistent across team
- ✅ Pre-configured VS Code

### CI/CD Pipeline
- ✅ Automated testing on every PR
- ✅ Type checking and linting
- ✅ Database migration validation
- ✅ Cloud Build integration
- ✅ Automated deployments

### AI Scoring
- ✅ Universal scoring agent for all question types
- ✅ Deterministic scoring for objective questions
- ✅ LLM-based evaluation for subjective responses
- ✅ Speech transcription for speaking tasks
- ✅ Semantic similarity analysis

### Database
- ✅ Neon PostgreSQL (serverless)
- ✅ Drizzle ORM (type-safe)
- ✅ Automatic migrations
- ✅ Seeded with PTE questions

## 📊 Architecture

```
┌─────────────────┐
│  GitHub Repo    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Cloud Build    │  ◄─── Builds DevContainer & App
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Artifact        │  ◄─── Stores Docker images
│ Registry        │
└────────┬────────┘
         │
    ┌────┴────┬────────────┬───────────┐
    │         │            │           │
    ▼         ▼            ▼           ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│  Dev   │ │ Cloud  │ │ Vertex │ │ GitHub │
│ Local  │ │  Run   │ │   AI   │ │ Actions│
└────────┘ └────────┘ └────────┘ └────────┘
```

## 🛠️ Common Tasks

### Run Database Migrations
```bash
pnpm db:generate   # Generate migration files
pnpm db:push       # Push to database
```

### Seed PTE Questions
```bash
pnpm db:seed:pte
```

### Run Tests
```bash
pnpm test           # Run all tests
pnpm test:watch     # Watch mode
```

### Build for Production
```bash
pnpm build
```

### Deploy to Cloud Run
```bash
gcloud builds submit --config=cloudbuild-production.yaml --region=asia-south1
```

## 🐛 Troubleshooting

### Local Development Issues

**Docker issues?**
→ Switch to Cloud Build: [Quick Start](./CLOUD-BUILD-QUICK-START.md)

**Slow builds?**
→ Use cloud-built DevContainer: [Setup Guide](./CLOUD-BUILD-SETUP.md)

**Database connection errors?**
→ Check `DATABASE_URL` in `.env.local`

**Type errors?**
→ Run `pnpm type-check` to see all errors

### CI/CD Issues

**Build fails in GitHub Actions?**
→ Check [CI/CD Setup](../.github/CI-CD-SETUP.md) for required secrets

**Cloud Build fails?**
→ See troubleshooting in [Cloud Build Guide](./CLOUD-BUILD-SETUP.md#-troubleshooting)

## 📖 Tech Stack

### Core
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui

### Database
- **Provider**: Neon PostgreSQL
- **ORM**: Drizzle
- **Migrations**: Drizzle Kit

### AI/ML
- **LLM**: Google Gemini 2.5 Flash
- **Speech-to-Text**: AssemblyAI
- **Framework**: AI SDK (Vercel)

### Authentication
- **Library**: Better Auth
- **Providers**: Google OAuth

### CMS
- **Platform**: Sanity v4

### Infrastructure
- **Cloud**: Google Cloud Platform
- **Build**: Cloud Build
- **Deploy**: Cloud Run
- **Images**: Artifact Registry
- **Secrets**: Secret Manager

### DevOps
- **CI/CD**: GitHub Actions
- **Containers**: Docker (cloud-built)
- **Package Manager**: pnpm

## 🔗 External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Google Cloud Build](https://cloud.google.com/build/docs)
- [Better Auth](https://www.better-auth.com/docs)
- [AI SDK](https://sdk.vercel.ai/docs)
- [Sanity CMS](https://www.sanity.io/docs)

## 💬 Getting Help

1. Check relevant documentation above
2. Search GitHub issues
3. Review troubleshooting sections
4. Check Cloud Build logs: https://console.cloud.google.com/cloud-build

## 🎯 Next Steps

**New to the project?**
1. Read [Folder Structure](./FOLDER-STRUCTURE.md)
2. Set up local dev environment
3. Follow [Cloud Build Quick Start](./CLOUD-BUILD-QUICK-START.md)

**Ready to deploy?**
1. Complete [Cloud Build Setup](./CLOUD-BUILD-SETUP.md)
2. Configure [CI/CD](../.github/CI-CD-SETUP.md)
3. Deploy to Cloud Run

**Contributing?**
1. Read [CLAUDE.md](../CLAUDE.md) for code conventions
2. Follow the CI/CD pipeline requirements
3. Ensure all tests pass before creating PR

---

**Last Updated**: January 2026
**Platform Version**: 0.2
