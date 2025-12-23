# Neon Database Setup Guide

Complete guide for setting up Neon PostgreSQL database for the PTE Practice application.

## 🚀 Quick Start

### 1. Create Neon Account

1. Go to **[Neon Console](https://console.neon.tech)** or click here: <https://console.neon.tech>
2. **Sign up** with GitHub (recommended) or email
3. **Free tier includes:**
   - ✅ 0.5GB storage
   - ✅ 3 projects
   - ✅ Unlimited databases per project
   - ✅ No time limit!

### 2. Create Your Project

1. Click **"New Project"** button
2. **Configure project:**
   - **Name**: `pte-practice-prod` (or your preferred name)
   - **Region**: Choose closest to your users:
     - `US East (Ohio)` - for North America
     - `Europe (Frankfurt)` - for Europe
     - `Asia Pacific (Singapore)` - for Asia
   - **PostgreSQL Version**: 16 (latest recommended)
3. Click **"Create Project"**

### 3. Get Connection Strings

After project creation, Neon provides **two connection strings**:

#### 📝 Direct Connection

- **Purpose**: Database migrations, seeding, local development
- **Format**: `postgresql://[user]:[password]@ep-xxx.us-east-2.aws.neon.tech/neondb`
- **Use in**: `.env.local` as `DATABASE_URL`

#### ⚡ Pooled Connection  

- **Purpose**: Production app, serverless functions (Edge, Lambda)
- **Format**: `postgresql://[user]:[password]@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb`
- **Use in**: `.env.local` as `DATABASE_URL_POOLED`
- **Note**: Notice the `-pooler` suffix in the hostname

### 4. Configure Environment Variables

Create or update `.env.local` in your project root:

```bash
# Copy .env.example if you haven't already
cp .env.example .env.local
```

**Edit `.env.local`** and add your Neon connection strings:

```bash
# ===========================================
# DATABASE (Required)
# ===========================================
# Direct connection (from Neon console - "Direct" tab)
DATABASE_URL=postgresql://[your-user]:[your-password]@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Pooled connection (from Neon console - "Pooled" tab)
DATABASE_URL_POOLED=postgresql://[your-user]:[your-password]@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
```

> **⚠️ Important:** Replace `[your-user]`, `[your-password]`, and `ep-xxx` with your actual Neon credentials!

### 5. Run Database Migrations

Now push your database schema to Neon:

```bash
# Install dependencies (if not already done)
pnpm install

# Generate migration files (if schema changed)
pnpm db:generate

# Push schema to Neon database
pnpm db:push

# Or run migrations manually
pnpm db:migrate
```

### 6. Seed Database (Optional)

Populate your database with sample data:

```bash
# Seed basic data
pnpm db:seed

# Or seed all data including speaking practice
pnpm db:seed:all
```

### 7. Verify Setup

Open Drizzle Studio to browse your database visually:

```bash
pnpm db:studio
```

**Expected result:**

- Browser opens at `https://local.drizzle.studio`
- You can see all your tables
- Data is visible if you ran seed command

### 8. Test Your Application

Start the development server:

```bash
pnpm dev
```

**Test these features:**

- ✅ User registration/login works
- ✅ Practice sessions save correctly
- ✅ Dashboard loads user data
- ✅ No database connection errors

---

## 🌿 Database Branching (Optional but Recommended)

Neon's killer feature - create database branches for testing, just like Git!

### Create a Preview Branch

1. In **Neon Console**, go to your project
2. Click **"Branches"** in sidebar
3. Click **"Create Branch"**
4. **Configure:**
   - **Name**: `preview` or `staging`
   - **Branch from**: `main` (default branch)
5. Click **"Create Branch"**

### Use Branch in Vercel Preview Deployments

1. Copy the branch connection string
2. In **Vercel Project Settings** → **Environment Variables**
3. Add for **Preview** environment:

   ```
   DATABASE_URL_POOLED=[your-preview-branch-pooled-url]
   ```

**Result**: Each preview deployment uses its own database copy! 🎉

---

## 🚢 Production Deployment

### Vercel (Recommended)

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add the following for **Production**:

   ```
   DATABASE_URL=[neon-direct-connection]
   DATABASE_URL_POOLED=[neon-pooled-connection]
   ```

3. **Deploy!**

### Other Platforms

For Railway, Netlify, Render, or other platforms:

1. Use `DATABASE_URL_POOLED` for serverless/edge functions
2. Use `DATABASE_URL` for build-time migrations
3. Set both in platform environment variables

---

## 📊 Monitoring & Management

### Neon Console Features

- **Dashboard**: View storage usage, compute usage, connection stats
- **Query Performance**: See slow queries and optimization suggestions
- **Branches**: Manage database branches
- **Settings**: Configure autoscaling, compute size, etc.

### Drizzle Studio (Local)

```bash
pnpm db:studio
```

- Browse all tables visually
- Edit data directly
- Test queries
- View relationships

### Database Operations

```bash
# Generate new migration after schema changes
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Run migrations
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio

# Drop all tables (destructive!)
pnpm db:drop
```

---

## 💰 Pricing & Limits

### Free Tier (Forever Free!)

- **Storage**: 0.5GB
- **Projects**: 3
- **Compute**: Shared (auto-scales to zero)
- **Branches**: Unlimited
- **Ideal for**: Development, small projects, testing

### Launch Plan ($19/month)

- **Storage**: 10GB
- **Projects**: Unlimited
- **Compute**: Shared
- **Backups**: 7 days point-in-time recovery
- **Ideal for**: Production apps, startups

### Scale Plan ($69/month)

- **Storage**: 50GB  
- **Projects**: Unlimited
- **Compute**: Dedicated (configurable)
- **Read Replicas**: Yes
- **Support**: Priority
- **Ideal for**: Growing businesses

### When to Upgrade?

- **0.5GB exceeded**: Move to Launch
- **Need read replicas**: Move to Scale
- **Need dedicated compute**: Move to Scale

---

## 🔧 Troubleshooting

### "Too many connections" Error

**Cause**: Using direct connection in serverless environment

**Solution**: Use `DATABASE_URL_POOLED` instead

```typescript
// In production, use pooled connection
const DATABASE_URL = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL
```

### "SSL required" Error

**Cause**: Missing `?sslmode=require` in connection string

**Solution**: Add SSL mode to your URL

```bash
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

### Migration Fails

**Cause**: Using pooled connection for migrations

**Solution**: Ensure `drizzle.config.ts` uses direct `DATABASE_URL`

```typescript
const DATABASE_URL = process.env.DATABASE_URL // Not DATABASE_URL_POOLED
```

### Slow Queries

**Cause**: Missing indexes or N+1 queries

**Solution**: Check Neon console's query insights and refer to `DATABASE_IMPROVEMENT_PLAN.md`

### Can't Connect Locally

**Checklist:**

- ✅ `.env.local` exists with correct URLs
- ✅ No typos in connection strings
- ✅ Neon project is active (not paused)
- ✅ Firewall allows outbound connections
- ✅ `pnpm install` completed successfully

---

## 🔄 Migrating from Railway

### Step 1: Export Data from Railway (Optional)

```bash
# Get your Railway DATABASE_URL
# Then export data
pg_dump $RAILWAY_DATABASE_URL > railway_backup.sql
```

### Step 2: Import to Neon (Optional)

```bash
# Import to Neon (if you have existing data)
psql $NEON_DATABASE_URL < railway_backup.sql
```

### Step 3: Update Environment Variables

Replace Railway URLs with Neon URLs in:

- `.env.local` (local development)
- Vercel/platform environment variables (production)

### Step 4: Test Thoroughly

- Run migrations: `pnpm db:migrate`
- Test locally: `pnpm dev`
- Deploy to staging first
- Validate all features work
- Deploy to production

### Step 5: Cleanup (After Success)

- Keep Railway active for 1 week as backup
- Monitor Neon performance
- Delete Railway project after validation

---

## 📚 Additional Resources

- **[Neon Documentation](https://neon.tech/docs)** - Official docs
- **[Drizzle + Neon Guide](https://orm.drizzle.team/docs/get-started-postgresql#neon)** - Integration guide
- **[Neon + Vercel](https://vercel.com/integrations/neon)** - One-click integration
- **[Neon Blog](https://neon.tech/blog)** - Tutorials and updates
- **[Neon Discord](https://discord.gg/neon)** - Community support

---

## ✅ Setup Checklist

Use this checklist to track your setup:

- [ ] Created Neon account
- [ ] Created Neon project
- [ ] Copied both connection strings (direct + pooled)
- [ ] Updated `.env.local` with Neon URLs
- [ ] Ran `pnpm db:push` successfully
- [ ] Ran `pnpm db:seed` (optional)
- [ ] Verified with `pnpm db:studio`
- [ ] Tested app locally with `pnpm dev`
- [ ] Updated Vercel/platform environment variables
- [ ] Deployed to production
- [ ] Verified production works correctly

---

**Need help?** Feel free to ask questions or check the [Neon Discord community](https://discord.gg/neon)!

*Last updated: December 2025*
