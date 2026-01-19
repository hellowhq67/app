# CopilotKit Integration Guide - PedagogistsPTE

## Overview
The PTE dashboard now features a fully integrated AI assistant powered by **CopilotKit** and **Google's Gemini 2.0 Flash**. This assistant provides personalized PTE preparation guidance based on real user data.

## Features

### 🤖 AI-Powered Assistant
- **Personalized Insights**: Analyzes user practice data across all 4 PTE sections
- **Weak Area Identification**: Automatically detects question types that need improvement
- **Progress Tracking**: Monitors study streaks, daily attempts, and overall performance
- **Expert Guidance**: Provides specific tips for all 20 PTE question types

### 📊 Data-Driven Recommendations
The assistant has access to:
- User practice history (filtered by section)
- Detailed progress metrics (study time, streaks, scores)
- Weak area analysis (scores below threshold)
- Today's practice statistics

### 🎨 Premium UI/UX
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile
- **Theme-Aware**: Matches your dashboard's violet/indigo theme in both light and dark modes
- **Smooth Animations**: Glassmorphism effects, slide-in messages, and hover states
- **Mobile-First**: Adapts button text and sizing for smaller screens

## Setup Instructions

### 1. Environment Variables
Ensure you have a Gemini API key in your `.env.local`:

```env
# Required for CopilotKit
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# Alternative keys (fallback)
GOOGLE_API_KEY=your_google_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Dependencies
All required packages are already installed:

```json
{
  "@copilotkit/react-core": "^1.51.1",
  "@copilotkit/react-ui": "^1.51.1",
  "@copilotkit/runtime": "^1.51.1"
}
```

### 3. File Structure

```
app/
├── api/
│   └── copilotkit/
│       └── route.ts          # Backend API with Gemini + Database actions
├── (pte)/
│   └── dashboard/
│       └── page.tsx           # Dashboard with AI assistant
├── globals.css                # Custom CopilotKit styling
└── layout.tsx                 # CopilotKit provider wrapper

components/
└── pte/
    └── copilot-assistant.tsx  # AI assistant component
```

## Backend Actions

The assistant can execute these server-side actions:

### 1. `getUserPracticeHistory`
Fetches recent practice attempts with optional section filtering.

**Parameters:**
- `userId` (required): User ID
- `section` (optional): Filter by "speaking", "writing", "reading", "listening", or "all"
- `limit` (optional): Number of attempts to fetch (default: 10)

**Example Usage:**
```
User: "Show me my last 5 speaking practice attempts"
AI: *Calls getUserPracticeHistory with section="speaking", limit=5*
```

### 2. `getUserProgress`
Gets detailed progress metrics including streaks and study time.

**Parameters:**
- `userId` (required): User ID

**Returns:**
- Study streak (days)
- Total study time (minutes)
- Questions answered
- Tests completed
- Average score
- Last active date

### 3. `getWeakAreas`
Identifies question types where scores are below threshold.

**Parameters:**
- `userId` (required): User ID
- `threshold` (optional): Score threshold (default: 50)

**Returns:**
- List of weak areas sorted by lowest score
- Average score per question type
- Attempt count per type

### 4. `getTodayStats`
Provides today's practice activity summary.

**Parameters:**
- `userId` (required): User ID

**Returns:**
- Number of attempts today
- Average score today

## Usage Examples

### Example 1: Analyzing Weak Areas
```
User: "What are my weakest areas?"

AI Response:
*Calls getWeakAreas*
Based on your practice data, here are your areas that need improvement:

1. **Fill in Blanks (Reading)** - Avg: 42/90
   - Practice tip: Focus on collocations and context clues
   
2. **Repeat Sentence** - Avg: 48/90
   - Practice tip: Work on short-term memory and pronunciation
   
3. **Write from Dictation** - Avg: 51/90
   - Practice tip: Practice transcription and spelling

Would you like specific practice recommendations for any of these?
```

### Example 2: Progress Check
```
User: "How am I doing this week?"

AI Response:
*Calls getTodayStats and getUserProgress*
Great question! Let me check your progress:

📊 **This Week's Stats:**
- Practice attempts today: 8
- Current study streak: 12 days 🔥
- Total questions answered: 234
- Average score: 67/90

🎯 **Highlights:**
- You're maintaining a strong 12-day streak!
- Your scores have improved by 8% since last week
- Most improvement in Writing section (+12%)

Keep up the excellent work! 💪
```

### Example 3: Section-Specific Help
```
User: "I'm struggling with speaking. Any tips?"

AI Response:
*Calls getUserPracticeHistory with section="speaking"*
Let me analyze your speaking performance...

Based on your recent 15 speaking attempts:

**Current Performance:**
- Read Aloud: 58/90
- Repeat Sentence: 52/90
- Describe Image: 64/90
- Re-tell Lecture: 61/90
- Answer Short Question: 71/90

**Key Recommendations:**
1. **Repeat Sentence needs focus** (lowest score)
   - Practice with 10-second audio clips
   - Record and compare with original
   - Focus on intonation and stress patterns

2. **Read Aloud improvement plan:**
   - Slow down your pace slightly
   - Mark thought groups in practice
   - Practice pronunciation of difficult words

Would you like me to create a specific practice schedule for speaking?
```

## Mobile Responsiveness

The assistant is fully responsive:

**Desktop (>768px):**
- Button shows "AI Assistant" text with icon
- Sidebar opens at 500px width
- Full feature access

**Mobile (<768px):**
- Button shows "AI" text (compact)
- Sidebar takes full width minus 2rem padding
- Touch-optimized interactions

## Customization

### Changing the AI Model
Edit `app/api/copilotkit/route.ts`:

```typescript
const serviceAdapter = new GoogleGenerativeAIAdapter({
    apiKey: GEMINI_API_KEY,
    model: "gemini-2.0-flash-exp", // Change this
});
```

Available Gemini models:
- `gemini-2.0-flash-exp` (Fastest, recommended)
- `gemini-1.5-pro` (Best quality)
- `gemini-1.5-flash` (Balanced)

### Customizing Colors
Edit `app/globals.css`:

```css
:root {
  --copilot-kit-primary-color: your-color; /* Change primary color */
  --copilot-kit-background-color: your-color; /* Change background */
}
```

### Modifying System Prompt
Edit `components/pte/copilot-assistant.tsx`:

```typescript
const prompt = `Your custom system prompt here...`;
```

## Troubleshooting

### Issue: "No Gemini API key found" Warning
**Solution**: Add `GOOGLE_GENERATIVE_AI_API_KEY` to your `.env.local` file

### Issue: Assistant not showing
**Solution**: Ensure CopilotKit provider is in `app/layout.tsx`:
```tsx
<CopilotKit runtimeUrl="/api/copilotkit">
  {children}
</CopilotKit>
```

### Issue: Backend actions not working
**Solution**: 
1. Check database connection in `lib/db/drizzle.ts`
2. Verify user is authenticated (actions require userId)
3. Check browser console for error messages

### Issue: Styling not applying
**Solution**: Make sure `@copilotkit/react-ui/styles.css` is imported in the component

## Performance Considerations

- **API Rate Limits**: Gemini Flash has generous rate limits, but consider caching for production
- **Database Queries**: Actions use indexed queries (optimized for performance)
- **Client-Side Rendering**: Component uses `"use client"` for optimal interactivity
- **Lazy Loading**: Assistant only renders after mount (prevents SSR hydration issues)

## Next Steps

1. **Add More Actions**: Create custom actions for specific PTE features
2. **Enhanced Analytics**: Integrate with Pinecone for semantic search
3. **Voice Mode**: Add speech-to-text for voice conversations
4. **Scheduling**: Let AI help users schedule practice sessions
5. **Mock Test Analysis**: Deep dive into full mock test results

## Support

For issues or questions:
- CopilotKit Docs: https://docs.copilotkit.ai
- Gemini API Docs: https://ai.google.dev/docs
- Project Issues: Create an issue in your repository

---

**Built with ❤️ for PedagogistsPTE**
