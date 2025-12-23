# 🚀 Neon Database - Next Steps

Based on your Neon console screenshot, here's what to do next:

## Step 1: Copy Your Connection Strings

In the Neon console you have open, you'll see the connection string. You need **two versions**:

### Direct Connection (Non-Pooled)

1. In Neon console, **uncheck** "Connection pooling" toggle
2. Copy the connection string
3. It should look like: `postgresql://neondb_owner:***@ep-xxx.us-east-2.aws.neon.tech/neondb`

### Pooled Connection

1. In Neon console, **check** "Connection pooling" toggle  
2. Copy the connection string
3. It should look like: `postgresql://neondb_owner:***@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb`
4. Notice the `-pooler` suffix in the hostname

## Step 2: Update Your .env.local File

Create or edit `.env.local` in your project root:

```bash
# Direct connection (copy from Neon - without pooling)
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Pooled connection (copy from Neon - with pooling enabled)
DATABASE_URL_POOLED=postgresql://neondb_owner:YOUR_PASSWORD@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Replace `YOUR_PASSWORD` with the actual password from Neon!**

> 💡 **Tip**: In the Neon console screenshot you shared, you can click "Copy snippet" to copy the full connection string, then just add `?sslmode=require` to the end.

## Step 3: Test Database Connection

Run this command to push your schema to Neon:

```bash
pnpm db:push
```

**Expected output:**

```
✓ Generated migrations
✓ Applying migrations
✓ Done!
```

## Step 4: Verify with Drizzle Studio

Open the database browser:

```bash
pnpm db:studio
```

**You should see:**

- A browser window opens at `https://local.drizzle.studio`
- All your tables are visible (users, speaking_attempts, etc.)
- You can browse and edit data

## Step 5: Seed Database (Optional)

Add sample data:

```bash
pnpm db:seed
```

## Step 6: Test Your App

Start the development server:

```bash
pnpm dev
```

Visit `http://localhost:3000` and test:

- User registration works
- Login successful
- No database errors in console

---

## ⚠️ Troubleshooting

### "Connection refused" error

- Check that you copied both connection strings correctly
- Ensure `?sslmode=require` is at the end of both URLs
- Verify your Neon project is **Active** (not paused)

### "Too many connections"  

- Make sure you're using `DATABASE_URL_POOLED` in production
- The code automatically handles this based on `NODE_ENV`

### "Authentication failed"

- Double-check the password in your connection strings
- Password is shown in Neon console (click "Show password")

---

## 🎯 Quick Commands Reference

```bash
# Push schema to Neon
pnpm db:push

# Open database browser
pnpm db:studio

# Seed sample data
pnpm db:seed

# Start dev server
pnpm dev
```

---

**Ready?** Copy your connection strings from Neon and update `.env.local`, then run `pnpm db:push`!
