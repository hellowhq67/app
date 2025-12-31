# 🗃️ Complete Database Setup Guide

## Current Status
✅ AI Scoring System Created  
✅ Database Schema Ready  
✅ Supabase Client Configured  
⏳ Database Reset Needed  

## Step 1: Drop All Tables in Supabase Dashboard

1. Go to [Supabase Dashboard](https://rthevbkhjanrrhbgktcw.supabase.co)
2. Navigate to **SQL Editor** (in left sidebar)
3. Copy the contents of `scripts/supabase-drop-all.sql`
4. Paste and click **Run**

This will drop all existing tables and enums.

## Step 2: Run Database Migrations

Once tables are dropped, run:

```bash
pnpm db:migrate
```

This will recreate all tables with the fresh schema including:
- Users & Authentication
- PTE Questions & Attempts  
- AI Scoring System
- Billing & Subscriptions
- Community Features
- Activity Tracking

## Step 3: Verify Setup

Check that all tables were created by running:

```bash
pnpm db:studio
```

This opens Drizzle Studio where you can see all your tables.

## Files Created for You

### 🤖 AI Scoring System
- `lib/ai/scoring/index.ts` - Complete AI scoring with Gemini
- `lib/ai/usage-tracking.ts` - AI cost tracking
- `lib/ai/config.ts` - Gemini model configuration

### 🗄️ Database Scripts  
- `scripts/supabase-drop-all.sql` - SQL to drop all tables
- `scripts/migrate.ts` - Migration runner
- `scripts/supabase-direct-reset.ts` - Direct reset script

### 🔗 Supabase Integration
- `lib/supabase/client.ts` - Supabase client configuration
- Updated `.env.local` with Supabase credentials

## Next Steps After Setup

1. **Test AI Scoring**: Create a test PTE attempt and try scoring
2. **Review API Endpoints**: Check the scoring API routes work
3. **Monitor Usage**: AI usage tracking will automatically log costs

## Troubleshooting

If `pnpm db:migrate` fails:
1. Make sure you ran the SQL drop script first
2. Check your DATABASE_URL in `.env.local`
3. Verify Supabase project is active

## 🎉 You're Ready!

Once complete, you'll have:
- ✅ Complete PTE practice platform
- ✅ AI-powered scoring with Gemini
- ✅ Cost tracking and analytics
- ✅ Modern database setup with Supabase
