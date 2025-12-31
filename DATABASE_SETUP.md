
# Database Setup Guide

This guide will help you set up the database with question data, RLS policies, and triggers.

## Prerequisites

- PostgreSQL database (Supabase recommended)
- Environment variables configured:
  - `DATABASE_URL`: Your PostgreSQL connection string
  - `GOOGLE_GENERATIVE_AI_API_KEY` or `GOOGLE_API_KEY`: For AI functionality

## Quick Setup

### 1. Set up RLS Policies and Triggers

```bash
# Set up both RLS policies and triggers in one command
pnpm db:setup

# Or set them up individually
pnpm db:setup:rls
pnpm db:setup:triggers
```

### 2. Seed Question Data

```bash
# Seed all sample questions
pnpm db:seed

# Seed specific question types (examples)
pnpm db:seed:speaking  # Speaking questions only
pnpm db:seed:all       # All question types
```

## What Gets Set Up

### RLS Policies
- **Users**: Can only access their own data
- **Admins**: Can access all data
- **Questions**: Public access (reference data)
- **Tests**: Public access (reference data)

### Database Triggers
- **AI Credit Management**: Automatically deducts credits on usage
- **Daily Credit Reset**: Resets credits daily
- **Test Completion**: Auto-sets completion timestamps
- **Audit Trail**: Updates `updated_at` timestamps
- **Data Validation**: Ensures data integrity

### Sample Questions
The seed script includes:
- **Read Aloud** (2 questions)
- **Repeat Sentence** (2 questions)
- **Describe Image** (1 question)
- **Answer Short Question** (1 question)
- **Summarize Written Text** (1 question)
- **Multiple Choice** (1 question)
- **Fill in the Blanks** (1 question)

## Manual Setup (Alternative)

If you prefer to run SQL directly:

```bash
# Using psql
psql $DATABASE_URL -f scripts/setup-rls.sql
psql $DATABASE_URL -f scripts/setup-triggers.sql

# Using Supabase CLI
supabase db push
supabase db reset --data-only
```

## Verification

After setup, you can verify everything is working:

```bash
# Check database schema
pnpm db:studio

# Test seeding
tsx -e "
import { getQuestionStats } from './lib/db/seed';
getQuestionStats().then(console.log);
"
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure your database user has sufficient privileges
2. **RLS Not Working**: Make sure RLS is enabled on all tables
3. **Triggers Not Firing**: Check trigger functions exist and are properly attached

### Reset Everything

If you need to start over:

```bash
# Clear all data and reset
pnpm clean:hard
pnpm install
pnpm db:setup
pnpm db:seed
```

## Security Notes

- RLS policies ensure users can only access their own data
- Admin users have elevated privileges
- AI credits are automatically managed and validated
- All user actions are audited through triggers

## Next Steps

1. Test the application with the seeded data
2. Create additional questions as needed
3. Set up automated backups
4. Configure monitoring for database performance
