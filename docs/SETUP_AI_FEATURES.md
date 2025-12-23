# AI Features Setup Guide

This document outlines the setup required for the newly implemented AI features:
1. **AI Chat Widget** (Home Page)
2. **Voice Assistant Sidebar** (Dashboard)

## Features Implemented

### 1. AI Chat Widget (Home Page)
- ✅ Floating chat button in bottom-right corner
- ✅ Expandable chat window with modern UI
- ✅ Integration with Vercel AI SDK using Google Gemini
- ✅ Quick action buttons (Start Practice, View Pricing, Book Demo, FAQs)
- ✅ Message persistence in localStorage
- ✅ Markdown support for AI responses

### 2. Voice Assistant Sidebar (Dashboard)
- ✅ Slide-in sidebar from right
- ✅ Auto-introduction on first load
- ✅ Voice input/output support (requires ElevenLabs)
- ✅ Text fallback for typing messages
- ✅ Connection type selection (WebRTC/WebSocket)

## Installation Steps

### Required Dependencies

Install the following packages:

```bash
# For AI Chat Widget
pnpm add react-markdown @radix-ui/react-scroll-area

# For Voice Assistant (ElevenLabs)
pnpm add @elevenlabs/react
```

### Environment Variables

Add the following to your `.env.local` file:

```env
# Existing
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key

# New - For Voice Assistant (Optional)
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id
```

### Getting ElevenLabs Credentials

1. Sign up at [ElevenLabs](https://elevenlabs.io)
2. Create a Conversational AI agent in the dashboard
3. Copy your API key and Agent ID
4. Add them to your `.env.local` file

**Note:** The voice assistant will work without ElevenLabs, but voice features will be disabled. The UI will still function with text-only mode.

## API Routes Created

### `/api/ai/chat`
- Handles chat messages from the home page widget
- Uses Google Gemini via Vercel AI SDK
- Returns streaming responses

### `/api/ai/voice`
- Provides ElevenLabs conversation tokens/signed URLs
- Supports both WebRTC and WebSocket connections
- Requires `ELEVENLABS_API_KEY` and `ELEVENLABS_AGENT_ID`

## Component Structure

### Home Page Components
- `components/home/AIChatWidget.tsx` - Main chat widget
- `components/home/AIChatMessage.tsx` - Individual message display
- `components/home/AIChatActions.tsx` - Quick action buttons

### Dashboard Components
- `components/pte/dashboard/VoiceAssistantSidebar.tsx` - Main sidebar
- `components/pte/dashboard/VoiceAssistantHeader.tsx` - Sidebar header
- `components/pte/dashboard/VoiceAssistantMessages.tsx` - Message display
- `components/pte/dashboard/VoiceAssistantControls.tsx` - Voice controls

### Utilities
- `lib/elevenlabs/client.ts` - ElevenLabs API client
- `app/api/ai/chat/route.ts` - Chat API endpoint
- `app/api/ai/voice/route.ts` - Voice API endpoint

## Usage

### AI Chat Widget
The chat widget automatically appears on the home page. Users can:
- Click the floating button to open chat
- Ask questions about PTE exam
- Use quick actions for common tasks
- View conversation history (stored in localStorage)

### Voice Assistant
1. Navigate to `/pte/dashboard`
2. Click "Voice Assistant" button in the header
3. Click "Start Voice Chat" to begin
4. Speak or type messages
5. Click "End Session" when done

## Troubleshooting

### Chat Widget Not Appearing
- Check that `react-markdown` and `@radix-ui/react-scroll-area` are installed
- Verify `GOOGLE_GENERATIVE_AI_API_KEY` is set in `.env.local`
- Check browser console for errors

### Voice Assistant Not Working
- Ensure `@elevenlabs/react` is installed
- Verify `ELEVENLABS_API_KEY` and `ELEVENLABS_AGENT_ID` are set
- Check microphone permissions in browser
- Try switching between WebRTC and WebSocket connection types

### TypeScript Errors
- Run `pnpm install` to ensure all dependencies are installed
- Check that all imports are correct
- The voice assistant uses a mock object until `@elevenlabs/react` is installed

## Next Steps

1. **Install Dependencies**: Run `pnpm add react-markdown @radix-ui/react-scroll-area @elevenlabs/react`
2. **Set Environment Variables**: Add ElevenLabs credentials to `.env.local`
3. **Test Features**: 
   - Visit home page and test chat widget
   - Visit dashboard and test voice assistant
4. **Customize**: 
   - Update system prompts in `app/api/ai/chat/route.ts`
   - Adjust UI styling in component files
   - Add more quick actions in `AIChatActions.tsx`

## Notes

- The voice assistant gracefully degrades to text-only if ElevenLabs is not configured
- All chat messages are stored in browser localStorage
- The AI uses Google Gemini 2.0 Flash for responses
- Voice assistant requires microphone permissions from the browser
