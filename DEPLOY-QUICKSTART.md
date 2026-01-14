# 🚀 Quick Start Deployment Guide

Get your PTE Academic platform deployed in minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] pnpm installed (`corepack enable`)
- [ ] Database created (Neon PostgreSQL recommended)
- [ ] Sanity project created
- [ ] API keys obtained (Gemini, AssemblyAI)

## 1️⃣ Setup Environment Variables

Create `.env.local` with these required variables:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require

# Authentication
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret

# AI Services
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_key

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-01-06

# Vercel Blob (optional, auto-created by Vercel)
BLOB_READ_WRITE_TOKEN=
```

## 2️⃣ Install Dependencies

```bash
pnpm install
```

## 3️⃣ Setup Database

```bash
# Push schema to database
pnpm db:push

# Seed with PTE questions
pnpm db:seed:pte
```

## 4️⃣ Test Locally

```bash
# Start dev server
pnpm dev

# In another terminal, verify everything works
pnpm verify:practice
```

Visit `http://localhost:3000` and test:
- Sign in with Google OAuth
- Try a practice question
- Check `/studio` for Sanity CMS

## 5️⃣ Deploy Sanity Schema

```bash
pnpm sanity:schema:deploy
```

## 6️⃣ Deploy to Vercel

### Method A: Claimable Deploy (No Auth Required)

```bash
pnpm deploy:full:claim
```

This will:
1. Run deployment checklist
2. Verify practice system
3. Deploy Sanity schema
4. Create Vercel deployment
5. Output **Preview URL** and **Claim URL**

Click the **Claim URL** to add the deployment to your Vercel account!

### Method B: Standard Vercel CLI (Requires Auth)

```bash
# Authenticate (first time only)
vercel login

# Deploy to production
pnpm deploy:full
```

## 7️⃣ Configure Production Environment

After deployment, add environment variables in **Vercel Dashboard → Settings → Environment Variables**:

Copy all variables from `.env.local`, but update:
- `BETTER_AUTH_URL` → Your production domain
- `NEXT_PUBLIC_BETTER_AUTH_URL` → Your production domain

Then redeploy:
```bash
vercel --prod
```

## 8️⃣ Verify Production Deployment

1. Visit your production URL
2. Test Google OAuth login
3. Try a practice question with AI scoring
4. Check `/studio` for Sanity CMS

## 🔧 Troubleshooting

### Build Fails with "Out of Memory"
Already configured in `package.json` with `--max-old-space-size=8192`

### Database Connection Errors
- Check `DATABASE_URL` is correct
- Ensure Neon project is not paused (free tier)
- Add `?sslmode=require` to connection string

### OAuth Errors
- Verify Google OAuth credentials
- Add production domain to Google OAuth authorized origins
- Check `BETTER_AUTH_URL` matches production URL

### AI Scoring Not Working
- Verify API keys are set in Vercel environment variables
- Check API quota/credits
- Review logs in Vercel dashboard

### Sanity Studio 404
- Run `pnpm sanity:schema:deploy`
- Verify `NEXT_PUBLIC_SANITY_PROJECT_ID` is set
- Add production domain to Sanity CORS:
  ```bash
  npx sanity cors add https://your-domain.com --credentials
  ```

## 📋 Available Scripts

```bash
# Verification
pnpm verify:practice       # Test practice system
pnpm verify:scoring        # Test scoring logic
pnpm verify:comprehensive  # Full system test

# Deployment
pnpm deploy:checklist      # Run pre-deployment checks
pnpm deploy:sanity         # Deploy Sanity schema
pnpm deploy:vercel         # Deploy to Vercel (CLI)
pnpm deploy:vercel:claim   # Claimable deployment
pnpm deploy:full          # Full deployment (Sanity + Vercel)
pnpm deploy:full:claim    # Full claimable deployment

# Database
pnpm db:push              # Push schema changes
pnpm db:seed:pte          # Seed PTE questions
pnpm db:studio            # Open Drizzle Studio GUI

# Sanity
pnpm sanity:schema:deploy  # Deploy schema to Sanity
pnpm sanity:typegen        # Generate TypeScript types
```

## 🎉 Success!

Your PTE Academic platform is now live!

**Next Steps:**
- Monitor deployment in Vercel dashboard
- Set up custom domain
- Configure monitoring (optional)
- Review analytics

Need help? Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide.
