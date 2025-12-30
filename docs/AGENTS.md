# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in this repository.

## Development Commands

### Build & Development
```bash
pnpm dev              # Start development server with webpack
pnpm dev:turbo        # Start with turbopack (faster)
pnpm dev:webpack      # Start with webpack (default)
pnpm dev:debug        # Start with Node.js debugging
pnpm build            # Production build with webpack
pnpm build:analyze    # Build with bundle analyzer
pnpm start            # Start production server
pnpm start:prod       # Start production server on port 3000
```

### Code Quality
```bash
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues automatically
pnpm type-check       # Run TypeScript type checking
```

### Testing
```bash
pnpm test             # Run tests (currently placeholder)
pnpm test:e2e         # Run Playwright end-to-end tests
pnpm test:e2e:ui      # Run Playwright tests with UI
```

### Database Operations
```bash
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run database migrations
pnpm db:push          # Push schema changes to database
pnpm db:studio        # Open Drizzle Studio
pnpm db:seed          # Seed database with sample data
pnpm db:seed:speaking # Seed speaking questions only
pnpm db:test          # Test database connection
```

### Cleanup & Maintenance
```bash
pnpm clean            # Clean build artifacts
pnpm clean:hard       # Clean + prune package store
pnpm clean:all        # Clean + remove node_modules + reinstall
pnpm fresh            # Clean + start dev server
pnpm fresh:build      # Clean + build
```

### Deployment
```bash
pnpm deploy:check     # Pre-deployment checks
pnpm deploy:test      # Test API endpoints
pnpm deploy:vercel    # Deploy to Vercel production
```

## Code Style Guidelines

### Import Organization
Imports are automatically sorted by Prettier with this order:
1. React and Next.js imports
2. Third-party libraries
3. Internal imports (components, lib, hooks, etc.)
4. Relative imports

```typescript
// ✅ Correct order
import React from 'react'
import { NextResponse } from 'next/server'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import './styles.css'
```

### TypeScript Configuration
- Strict mode enabled
- Path aliases configured: `@/components`, `@/lib`, `@/hooks`, `@/app`
- JSX transform: `react-jsx`
- Target: ES2017, Module: esnext

### Component Patterns
- Use functional components with hooks
- Export default for pages, named exports for components
- Use `interface` for object types, `type` for unions/primitives
- Prefer `const` over `let` when possible

```typescript
// ✅ Component pattern
interface ComponentProps {
  title: string
  onSubmit: () => void
}

export function Component({ title, onSubmit }: ComponentProps) {
  const [state, setState] = useState<string>('')
  
  return <div>{title}</div>
}

export default Component // For pages only
```

### Naming Conventions
- **Components**: PascalCase (`UserProfile`, `SpeakingRecorder`)
- **Files**: kebab-case for folders, PascalCase for component files
- **Variables**: camelCase (`userName`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase with descriptive names (`UserProfile`, `SpeakingTimings`)

### Error Handling
- Use try-catch blocks for async operations
- Return consistent error responses from API routes
- Use toast notifications for user-facing errors
- Log errors appropriately (console.error for dev, Rollbar for prod)

```typescript
// ✅ Error handling pattern
try {
  const result = await apiCall()
  return NextResponse.json({ data: result })
} catch (error) {
  console.error('API call failed:', error)
  return NextResponse.json(
    { error: 'Failed to process request' },
    { status: 500 }
  )
}
```

### Database & Drizzle ORM
- Schema files in `lib/db/schema/`
- Use Drizzle migrations for schema changes
- Follow naming conventions: snake_case for database columns
- Use Zod for validation in API routes

```typescript
// ✅ Database pattern
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const user = await db.select().from(users).where(eq(users.id, userId))
```

### UI Components (shadcn/ui)
- Use shadcn/ui components from `@/components/ui`
- Follow the component prop patterns
- Use `cn()` utility for conditional classes
- Tailwind CSS for styling

```typescript
// ✅ UI component pattern
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

return (
  <Button 
    className={cn('w-full', isActive && 'bg-primary')}
    variant="outline"
  >
    Click me
  </Button>
)
```

### File Structure
```
app/
├── (auth)/          # Route groups
├── api/             # API routes
├── pte/             # PTE practice pages
└── globals.css
components/
├── ui/              # shadcn/ui components
├── pte/             # PTE-specific components
└── auth/            # Auth components
lib/
├── db/              # Database schema and queries
├── auth/            # Authentication logic
├── utils.ts         # Utility functions
└── types.ts         # Type definitions
```

### Environment Variables
- Use `.env.local` for local development
- Define required variables in `.env.example`
- Access via `process.env.VARIABLE_NAME`
- Validate environment variables in config files

### Performance Guidelines
- Use dynamic imports for large components
- Implement proper loading states
- Optimize images with Next.js Image component
- Use React.memo for expensive components
- Implement proper caching strategies

### Security Best Practices
- Validate all user inputs with Zod schemas
- Use parameterized queries (Drizzle handles this)
- Implement proper authentication checks
- Sanitize data before database operations
- Use HTTPS in production
- Never commit secrets to repository

## Testing Guidelines

When tests are implemented:
- Unit tests for utility functions in `lib/`
- Integration tests for API routes
- E2E tests for critical user flows
- Use descriptive test names
- Mock external dependencies appropriately

## Git Workflow

- Use conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- Create feature branches from `main`
- Run lint and type-check before commits
- Use pull requests for code review

## Package Management

- Use `pnpm` as package manager
- Install dependencies: `pnpm install`
- Add dependency: `pnpm add package-name`
- Add dev dependency: `pnpm add -D package-name`

## Notes for Agents

1. Always run `pnpm type-check` and `pnpm lint` before completing tasks
2. Follow the established patterns in the codebase
3. Use existing UI components from `@/components/ui` when possible
4. Implement proper error handling and loading states
5. Test functionality manually when automated tests aren't available
6. Document any breaking changes or important decisions
7. Use the existing utility functions and types from `lib/`
8. Follow the file structure and naming conventions outlined above