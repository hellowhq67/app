# Unified Questions Table Component

## Overview

The `UnifiedQuestionsTable` component provides a consistent, feature-rich table for displaying PTE practice questions across all sections (Speaking, Reading, Writing, Listening).

## Features

✅ **Consistent Design** - Same table structure across all sections  
✅ **Advanced Filtering** - Search, difficulty, status, and bookmark filters  
✅ **Bookmark Management** - Toggle bookmarks with real-time updates  
✅ **Practice Counts** - Display how many times each question was practiced  
✅ **Pro Member Locks** - Visual indicators and access control for premium content  
✅ **Responsive** - Works on all screen sizes  

## Usage

```tsx
import { UnifiedQuestionsTable } from '@/components/pte/unified-questions-table'
import { isProMember } from '@/lib/utils/user-subscription'

export default async function QuestionsPage() {
  const questions = await getQuestions() // Your data fetching logic
  const proMember = await isProMember()

  return (
    <UnifiedQuestionsTable
      questions={questions}
      section="speaking" // or "reading", "writing", "listening"
      questionType="read_aloud" // optional
      basePath="/pte/academic/practice" // optional, defaults to standard path
      isProMember={proMember}
      showFilters={true}
      showBookmark={true}
      showCount={true}
      showLock={true}
    />
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `questions` | `UnifiedQuestion[]` | required | Array of question objects |
| `section` | `'speaking' \| 'reading' \| 'writing' \| 'listening'` | required | Section type |
| `questionType` | `string?` | - | Question type (e.g., "read_aloud") |
| `basePath` | `string?` | - | Custom base path for practice links |
| `isProMember` | `boolean` | `false` | Whether user has pro subscription |
| `showFilters` | `boolean` | `true` | Show filter controls |
| `showBookmark` | `boolean` | `true` | Show bookmark column and filter |
| `showCount` | `boolean` | `true` | Show practice count column |
| `showLock` | `boolean` | `true` | Show pro member lock indicators |

## Question Object Structure

```typescript
interface UnifiedQuestion {
  id: string
  title: string
  type?: string
  difficulty?: string | null // "Easy", "Medium", "Hard"
  bookmarked?: boolean
  practiceCount?: number
  isLocked?: boolean // true for pro-only questions
  practiced?: boolean
  tags?: string[]
}
```

## Migration from Old Components

Replace:
- `QuestionsTable` → `UnifiedQuestionsTable`
- `QuestionListTable` → `UnifiedQuestionsTable`
- `QuestionList` → `UnifiedQuestionsTable`

The unified component includes all features from the old components plus additional functionality.

## API Requirements

The component uses:
- `/api/questions/bookmark` - For bookmark toggling
- `isProMember()` - For checking subscription status

Make sure these are properly configured in your application.

