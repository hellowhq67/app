# Authentication System — PTE Academic

## Overview

PTE Academic uses [Better Auth](https://better-auth.com) for authentication with the **admin plugin** for role-based access control. The system supports email/password login, Google OAuth, and LinkedIn OAuth.

---

## Quick Start

```bash
# 1. Push schema to database (adds banned/banReason columns)
pnpm db:push

# 2. Seed admin user
pnpm db:seed:admin

# 3. Verify auth setup
pnpm tsx scripts/verify-auth.ts

# 4. Start dev server
pnpm dev
```

**Default Admin Credentials:**
- Email: `admin@pedagogistspte.com`
- Password: `Admin@PTE2024!`

> Change the password after first login!

---

## User Data Model

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | text | UUID | Primary key |
| `name` | text | required | Display name |
| `email` | text | unique | Login email |
| `email_verified` | boolean | `false` | Email verification status |
| `image` | text | null | Avatar URL |
| `role` | text | `"user"` | User role (managed by admin plugin) |
| `banned` | boolean | `false` | Ban status (admin plugin) |
| `ban_reason` | text | null | Reason for ban |
| `subscription_tier` | enum | `"free"` | `free`, `basic`, `premium`, `unlimited` |
| `subscription_status` | enum | `"active"` | `active`, `expired`, `cancelled`, `trial` |
| `daily_ai_credits` | integer | `10` | AI scoring credits per day |
| `ai_credits_used` | integer | `0` | Credits used today |
| `daily_practice_limit` | integer | `3` | Practice questions per day |
| `practice_questions_used` | integer | `0` | Questions used today |
| `created_at` | timestamp | now | Account creation time |
| `updated_at` | timestamp | now | Last update time |

---

## Roles

| Role | Access | Description |
|------|--------|-------------|
| `user` | Standard | Default role. Practice tests, analytics |
| `admin` | Full | User management, role assignment, ban/unban, system settings |
| `teacher` | Extended | All user access + teacher-specific features (future) |

### Role Assignment

Roles are managed via the Better Auth admin plugin:

```typescript
// Client-side (admin pages)
import { authAdmin } from '@/lib/auth/client'
await authAdmin.setRole({ userId: 'xxx', role: 'admin' })

// API route
PUT /api/admin/users/[id]/role
Body: { "role": "admin" | "user" | "teacher" }
```

---

## Authentication Methods

### Email & Password
- Min password: 8 characters, max: 128
- Email verification required in production
- Auto sign-in after registration
- Password reset via email link (24hr expiry)

### OAuth Providers
- **Google** — requires `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- **LinkedIn** — requires `LINKEDIN_CLIENT_ID` + `LINKEDIN_CLIENT_SECRET`

Account linking is enabled for both providers.

---

## Environment Variables

```env
# Required
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<min 32 chars>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...

# Email (Resend) — optional in dev
RESEND_API_KEY=...
```

---

## API Routes

### Auth (Better Auth built-in)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `*` | `/api/auth/[...better-auth]` | All Better Auth endpoints |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `POST` | `/api/auth/reset-password` | Reset password with token |

### Admin User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/users` | List users (paginated) |
| `PUT` | `/api/admin/users/[id]/role` | Set user role |
| `POST` | `/api/admin/users/[id]/ban` | Ban user |
| `DELETE` | `/api/admin/users/[id]/ban` | Unban user |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/user` | Get current user |
| `PUT` | `/api/user` | Update profile |
| `POST` | `/api/user/change-password` | Change password |

---

## Auth Helpers (Server-Side)

```typescript
import { requireAuth, requireAdmin, requireTeacher, optionalAuth } from '@/lib/api/auth'

// In API route handlers:
const { userId, role } = await requireAuth()     // throws 401 if not authenticated, 403 if banned
const { userId, role } = await requireAdmin()    // throws 403 if not admin
const { userId, role } = await requireTeacher()  // throws 403 if not teacher/admin
const result = await optionalAuth()              // returns null if not authenticated
```

## Auth Hooks (Client-Side)

```typescript
import { useAuth } from '@/lib/auth/client'

function MyComponent() {
  const { user, isAuthenticated, isAdmin, isTeacher, isBanned, role, isLoading } = useAuth()

  if (isLoading) return <Spinner />
  if (!isAuthenticated) return <Redirect to="/sign-in" />
  if (isAdmin) return <AdminDashboard />
}
```

---

## Error Handling

### Error Boundaries
- `app/(auth)/error.tsx` — Catches errors in sign-in/sign-up/reset-password pages
- `app/admin/error.tsx` — Catches errors in admin panel pages
- `app/global-error.tsx` — Root-level fallback

### Error Factories
```typescript
import { Errors } from '@/lib/api/errors'

Errors.unauthorized()        // 401 — Not authenticated
Errors.forbidden()           // 403 — Insufficient permissions
Errors.banned()              // 403 — Account suspended (ACCOUNT_BANNED)
Errors.emailNotVerified()    // 403 — Email not verified (EMAIL_NOT_VERIFIED)
Errors.notFound('User')      // 404 — Resource not found
Errors.badRequest('msg')     // 400 — Invalid input
Errors.rateLimited()         // 429 — Too many requests
```

---

## Security Features

- **Rate limiting**: 10 req/60s default, 5/60s sign-in, 3/60s sign-up, 3/60s forgot-password
- **CSRF protection**: Enabled by default
- **Secure cookies**: HTTPS-only in production
- **Email enumeration protection**: Forgot password always returns success
- **Session management**: 7-day expiry, daily refresh, stored in database
- **Account banning**: Banned users are rejected at `requireAuth()` level
- **Trusted origins**: Configured for production domains + localhost in dev

---

## Session Configuration

| Setting | Value |
|---------|-------|
| Expiry | 7 days |
| Refresh interval | Daily |
| Cookie cache | 5 minutes (compact strategy) |
| Storage | Database (Neon PostgreSQL) |
| Secure cookies | Production only |

---

## File Structure

```
lib/auth/
  auth.ts          — Better Auth server config (admin plugin, OAuth, hooks)
  client.ts        — Client auth hooks (useAuth, signIn, signUp, authAdmin)
  email.ts         — Email templates (verification, password reset, welcome)
  session.ts       — Server-side session helper
  shared.ts        — Shared utilities (getCallbackURL)
  actions.ts       — Server actions (form-based auth)

lib/api/
  auth.ts          — Auth helpers (requireAuth, requireAdmin, requireTeacher)
  errors.ts        — Error classes and factories
  response.ts      — API response utilities

lib/db/schema/
  users.ts         — User, session, account, verification tables

lib/admin/
  types.ts         — Admin type definitions (AdminUser, UserRole, etc.)
  mock-data.ts     — Mock data for admin pages

app/api/admin/
  users/route.ts              — GET users list
  users/[id]/role/route.ts    — PUT change role
  users/[id]/ban/route.ts     — POST ban / DELETE unban

scripts/
  seed-admin.ts    — Seed admin user
  verify-auth.ts   — CLI verification of auth data model
```
