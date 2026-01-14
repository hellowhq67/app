# Deployment Guide

Complete guide for deploying the PTE Academic platform to production.

## Prerequisites

- [x] Node.js 18+ installed
- [x] pnpm installed (`corepack enable` or `npm install -g pnpm`)
- [x] Vercel CLI installed (`pnpm add -g vercel`)
- [x] Vercel account authenticated
- [x] Sanity project created
- [x] Database (Neon PostgreSQL) provisioned

## Environment Variables

Vercel automatically provides certain environment variables. Set the following in your Vercel project dashboard:

### Vercel Auto-Injected Variables
These are automatically provided by Vercel (do NOT set manually):
- `VERCEL` - Vercel environment indicator
- `VERCEL_ENV` - Environment type (production, preview, development)
- `VERCEL_URL` - Deployment URL
- `VERCEL_PROJECT_PRODUCTION_URL` - Production domain
- `NEXT_PUBLIC_VERCEL_URL` - Public-facing deployment URL

### Required Environment Variables

Set these in **Vercel Dashboard → Settings → Environment Variables**:

#### Database
```bash
DATABASE_URL=              # Neon PostgreSQL connection string (also use for DATABASE_URL_POOLED)
```

#### Authentication
```bash
BETTER_AUTH_SECRET=        # Generate with: openssl rand -base64 32
BETTER_AUTH_URL=https://$VERCEL_PROJECT_PRODUCTION_URL  # Use your production domain
NEXT_PUBLIC_BETTER_AUTH_URL=https://$VERCEL_PROJECT_PRODUCTION_URL
GOOGLE_CLIENT_ID=          # Google OAuth credentials
GOOGLE_CLIENT_SECRET=
```

#### AI Services
```bash
GOOGLE_GENERATIVE_AI_API_KEY=  # Gemini API key
ASSEMBLYAI_API_KEY=            # AssemblyAI API key
```

#### Sanity CMS
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=     # Your Sanity project ID
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-01-06
```

#### Vercel Blob Storage (Auto-provided by Vercel)
```bash
BLOB_READ_WRITE_TOKEN=     # Created automatically when you add Vercel Blob
```

#### Redis/Upstash (Optional - for rate limiting)
```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### Optional Variables
```bash
# Monitoring
ROLLBAR_PEDAGOGISTPTE_SERVER_TOKEN_1763820319=

# Additional OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

## Deployment Steps

### 1. Deploy Sanity Schema & Studio

Deploy your Sanity schema and studio **before** deploying to Vercel:

```bash
# Deploy Sanity schema to cloud
pnpm sanity:schema:deploy

# Build and deploy Sanity Studio (optional - only if hosting on Sanity)
pnpm sanity:build
pnpm sanity:deploy
```

**Note:** The Sanity Studio is embedded in your Next.js app at `/studio`, so this step is optional unless you want a standalone hosted studio.

### 2. Database Setup

Ensure your database is ready:

```bash
# Generate migrations (if schema changed)
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed PTE questions and data
pnpm db:seed:pte
```

### 3. Pre-Deployment Checks

Run verification scripts:

```bash
# Check build and configuration
pnpm deploy:check

# Test API endpoints
pnpm deploy:test

# Type checking
pnpm type-check

# Lint
pnpm lint
```

### 4. Deploy to Vercel

#### Option A: Claimable Deployment (Recommended for First-Time Setup)
Uses the deploy.sh script to create a claimable deployment without requiring Vercel CLI authentication upfront:

```bash
# Full deployment with Sanity + Claimable deploy
pnpm deploy:full:claim

# Vercel only with claimable deploy
pnpm deploy:vercel:claim

# Or run the script directly
bash scripts/deploy.sh
```

This will output:
- **Preview URL**: Your deployment preview link
- **Claim URL**: Link to claim the deployment to your Vercel account

#### Option B: Standard Vercel CLI Deployment
Requires Vercel CLI authentication:

```bash
# Full deployment (Sanity + Vercel)
pnpm deploy:full

# Vercel only (if Sanity already deployed)
pnpm deploy:vercel

# Preview deployment
pnpm deploy:preview
```

#### Option C: Manual Vercel Deployment
```bash
# Link project (first time only)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Vercel Configuration

Your `vercel.json` is configured with:

- **Build Command:** `pnpm build`
- **Install Command:** `pnpm install`
- **Framework:** Next.js
- **Region:** `iad1` (US East)
- **API Max Duration:** 30 seconds
- **CORS Headers:** Enabled for API routes

## Post-Deployment

### Verify Deployment

1. **Health Check:** Visit `https://your-domain.com/api/health`
2. **Studio Access:** Visit `https://your-domain.com/studio`
3. **Authentication:** Test Google OAuth login
4. **Practice Module:** Test a speaking/writing question
5. **Mock Test:** Start and submit a mock test

### Database Seeding (Production)

If deploying fresh, seed the database using Vercel CLI:

```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# Seed questions with production database
pnpm db:seed:pte

# Or run setup script
pnpm deploy:setup
```

Alternatively, use a one-time serverless function or Vercel CLI:
```bash
# Execute seed script on Vercel
vercel env pull
pnpm tsx scripts/seed-pte-questions.ts
```

### Configure CORS for Sanity

Add your production domain to Sanity CORS settings:

```bash
npx sanity cors add https://your-domain.com --credentials
```

## Troubleshooting

### Build Failures

**Out of Memory:**
```bash
# package.json already configured with increased memory
cross-env NODE_OPTIONS="--max-old-space-size=8192" next build
```

**Missing Environment Variables:**
- Check Vercel dashboard → Settings → Environment Variables
- Ensure all required variables are set for Production environment
- Redeploy after adding variables

### API Errors

**Database Connection:**
- Verify `DATABASE_URL` is set correctly
- Check Neon project is not paused (free tier auto-pauses)
- Use `DATABASE_URL_POOLED` for serverless functions

**AI Scoring Errors:**
- Verify `GOOGLE_GENERATIVE_AI_API_KEY` is valid
- Check `ASSEMBLYAI_API_KEY` has credits
- Monitor rate limits

### Sanity Issues

**Studio Not Loading:**
- Verify `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`
- Check Sanity project CORS settings include your domain
- Run `pnpm sanity:schema:deploy` to sync schema

**Schema Mismatch:**
```bash
# Redeploy schema
pnpm sanity:schema:deploy

# Regenerate TypeScript types
pnpm sanity:typegen
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run checks
        run: |
          pnpm type-check
          pnpm lint
          pnpm test

      - name: Deploy Sanity Schema
        run: pnpm sanity:schema:deploy
        env:
          SANITY_AUTH_TOKEN: ${{ secrets.SANITY_AUTH_TOKEN }}

      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Rollback Strategy

If deployment fails:

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]

# Or promote previous deployment
vercel promote [deployment-url]
```

## Monitoring

- **Vercel Dashboard:** Monitor builds, functions, analytics
- **Rollbar:** Error tracking (if configured)
- **Sanity Insights:** Content usage and API calls
- **Neon Dashboard:** Database metrics and query performance

## Performance Optimization

### Vercel Edge Functions (Future)
Consider moving some API routes to Edge Functions for better global performance:
- `/api/pte/questions` - Question fetching
- `/api/user/progress` - Progress tracking

### Database Optimization
- Use connection pooling (`DATABASE_URL_POOLED`)
- Add indexes for frequently queried fields
- Consider read replicas for analytics queries

## Support

For deployment issues:
- **Vercel:** https://vercel.com/docs
- **Sanity:** https://www.sanity.io/docs
- **Next.js:** https://nextjs.org/docs
- **Project Issues:** https://github.com/your-repo/issues
