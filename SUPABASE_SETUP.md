# Supabase Database Setup Guide

This guide will help you set up your Supabase database with question data, RLS policies, and triggers.

## Prerequisites

- Supabase project created
- Supabase CLI installed (optional, for local development)
- Environment variables configured:
  - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
  - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)

## Quick Setup with Supabase Dashboard

### 1. Set Up RLS Policies

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `scripts/supabase-rls.sql`
4. Click **Run** to execute the RLS policies

### 2. Set Up Database Triggers

1. In the same SQL Editor, clear the previous query
2. Copy and paste the contents of `scripts/supabase-triggers.sql`
3. Click **Run** to execute the triggers

### 3. Seed Question Data

1. In the SQL Editor, clear the previous query
2. Copy and paste the contents of `scripts/supabase-seed.sql`
3. Click **Run** to populate your database with sample questions

## Alternative: Using Supabase CLI

If you prefer using the CLI:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>

# Apply migrations
supabase db push

# Run seeding script
supabase db reset --data-only
```

## What Gets Set Up

### RLS Policies
- **Users**: Can only access their own data using `auth.uid()`
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
The seed script includes 9 sample questions:
- **Read Aloud** (2 questions)
- **Repeat Sentence** (2 questions)
- **Describe Image** (1 question)
- **Answer Short Question** (1 question)
- **Summarize Written Text** (1 question)
- **Multiple Choice** (1 question)
- **Fill in the Blanks** (1 question)

## Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
```

## Verification

After setup, you can verify everything is working:

### 1. Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 2. Check Triggers
```sql
SELECT trigger_name, event_manipulation, event_object_table, action_timing, action_condition, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

### 3. Check Questions
```sql
SELECT type, COUNT(*) as count, STRING_AGG(DISTINCT difficulty, ', ') as difficulties
FROM questions 
GROUP BY type 
ORDER BY type;
```

## Security Notes

- RLS policies ensure users can only access their own data
- Admin users have elevated privileges
- AI credits are automatically managed and validated
- All user actions are audited through triggers
- Triggers use `SECURITY DEFINER` for proper permissions

## Troubleshooting

### Common Issues

1. **RLS Not Working**: Make sure RLS is enabled on all tables
2. **Triggers Not Firing**: Check trigger functions exist and are properly attached
3. **Permission Denied**: Ensure your service role key has sufficient privileges
4. **Auth UID Issues**: Make sure you're using `auth.uid()::text` for string comparisons

### Reset Everything

If you need to start over:

```sql
-- Drop all triggers
DROP TRIGGER IF EXISTS trigger_update_ai_credits ON ai_credit_usage;
DROP TRIGGER IF EXISTS trigger_reset_daily_credits ON users;
-- ... (drop all other triggers)

-- Drop all policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
-- ... (drop all other policies)

-- Clear data
TRUNCATE TABLE questions RESTART IDENTITY CASCADE;
```

## Next Steps

1. Test the application with the seeded data
2. Create additional questions as needed
3. Set up automated backups
4. Configure monitoring for database performance
5. Set up proper authentication in your Next.js app
