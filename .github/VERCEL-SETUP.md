# Vercel CI/CD Setup Guide

This guide will help you set up automatic deployments to Vercel from GitHub.

## Prerequisites

- Vercel account with project already created
- GitHub repository with admin access

## Step 1: Get Vercel Credentials

### 1.1 Get Vercel Token
```bash
# Generate a new token at: https://vercel.com/account/tokens
# Or use CLI:
vercel tokens create
```

### 1.2 Get Organization ID and Project ID
These are already in your `.vercel/project.json`:
- **VERCEL_ORG_ID**: `team_XScV6EoTIwj6GGG58BQfniDb`
- **VERCEL_PROJECT_ID**: `prj_DjhTlmIrEYiB1m2iYdvata3emQuK`

## Step 2: Add GitHub Secrets

Go to your GitHub repository settings and add these secrets:
`https://github.com/hellowhq67/pedagogistspte.v.0.2/settings/secrets/actions`

Add the following secrets:

1. **VERCEL_TOKEN**: Your Vercel token from Step 1.1
2. **VERCEL_ORG_ID**: `team_XScV6EoTIwj6GGG58BQfniDb`
3. **VERCEL_PROJECT_ID**: `prj_DjhTlmIrEYiB1m2iYdvata3emQuK`

## Step 3: Configure Vercel Project Settings

### Via Vercel Dashboard
1. Go to: https://vercel.com/hellowhq67s-projects/pedagogistspte-v-0-2/settings
2. **Git** tab:
   - Production Branch: `main`
   - Enable: "Automatically deploy commits from main branch"
3. **General** tab:
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

### Via CLI (Alternative)
```bash
# Link project
vercel link

# Configure production branch
vercel git connect
```

## Step 4: Verify GitHub Actions Workflows

The following workflows have been created:

### Production Deployment (`.github/workflows/vercel-deploy.yml`)
- Triggers on push to `main` branch
- Deploys to production automatically

### Preview Deployment (`.github/workflows/vercel-preview.yml`)
- Triggers on pull requests to `main`
- Creates preview deployments

## Step 5: Test the Setup

1. **Test Production Deploy**:
   ```bash
   git add .
   git commit -m "test: verify CI/CD setup"
   git push origin main
   ```
   Check GitHub Actions tab for deployment status

2. **Test Preview Deploy**:
   - Create a new branch
   - Make changes and push
   - Create PR to main
   - Check for preview deployment URL in PR comments

## How It Works

### Automatic Deployments
- **Push to main** → Automatic production deployment
- **Pull Request** → Automatic preview deployment
- **Manual trigger** → Use "Run workflow" in GitHub Actions

### Build Process
1. Checkout code
2. Setup Node.js 20.17.0
3. Setup pnpm 10.26.1
4. Pull Vercel environment
5. Build project with Vercel CLI
6. Deploy to Vercel

## Troubleshooting

### Build Fails
- Check GitHub Actions logs
- Verify all secrets are set correctly
- Ensure environment variables are configured in Vercel

### Deployment Not Triggering
- Verify GitHub Actions are enabled in repository settings
- Check branch protection rules
- Ensure workflows are in `.github/workflows/` directory

### Environment Variables Missing
- Add all required env vars in Vercel dashboard under Settings → Environment Variables
- Variables needed:
  - DATABASE_URL
  - GOOGLE_GENERATIVE_AI_API_KEY
  - ASSEMBLYAI_API_KEY
  - BETTER_AUTH_SECRET
  - BETTER_AUTH_URL
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - NEXT_PUBLIC_SANITY_PROJECT_ID
  - NEXT_PUBLIC_SANITY_DATASET
  - NEXT_PUBLIC_SANITY_API_VERSION
  - (All others from .env.local)

## Disable Auto-Deploy (If Needed)

To disable automatic deployments:
1. Go to Vercel project settings → Git
2. Uncheck "Automatically deploy commits from main branch"
3. Disable GitHub Actions workflows (rename .yml to .yml.disabled)

## Manual Deploy Command

If you prefer manual deployments:
```bash
vercel --prod
```

## Monitoring Deployments

- **Vercel Dashboard**: https://vercel.com/hellowhq67s-projects/pedagogistspte-v-0-2
- **GitHub Actions**: https://github.com/hellowhq67/pedagogistspte.v.0.2/actions
- **Deployment Logs**: Click on any deployment in Vercel or GitHub Actions

## Next Steps

1. ✅ Add GitHub secrets (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
2. ✅ Push this commit to trigger first auto-deployment
3. ✅ Verify deployment succeeds
4. ✅ Test preview deployment with a PR
5. ✅ Configure custom domain (optional)

---

**Note**: The CI/CD workflows are secure and use only GitHub secrets. No user input is processed in the workflows.
