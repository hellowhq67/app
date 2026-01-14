# Application Hooks

This document lists the custom React hooks available in the `hooks/` directory.

## UI & Interaction
*   **`use-mobile.ts`**: Detects if the current viewport is mobile-sized. Useful for responsive conditional rendering.
*   **`use-toast.ts`**: Provides access to the toaster notification system (Shadcn UI). Use `toast({ title, description })` to show alerts.

## PTE Specific
*   **`useAudioRecorder.ts`**: Manages microphone access and audio recording state. Essential for Speaking tasks. Returns recording blob, duration, and control methods (start, stop).
*   **`useTextToSpeech.ts`**: Handles text-to-speech synthesis, likely for reading out questions or instructions.
*   **`useScoringLimit.ts`**: Likely manages rate limiting or quota tracking for AI scoring requests to prevent abuse.
*   **`useUserHistory.ts`**: Hooks into user's test history, possibly for analytics or resuming sessions.
*   **`useBeep.ts`**: Plays audio cues (beeps), standard in PTE exams to signal recording start/end.

## Backend & Integration
*   **`use-server-action.ts`**: A wrapper for executing Server Actions with loading states and error handling.
*   **`useEvlevenLabls.ts`**: Integration with ElevenLabs API for high-quality voice synthesis (likely an alternative or upgrade to `useTextToSpeech`).

## Usage Pattern
Most hooks follow the pattern:
```typescript
const { data, isLoading, error, ...actions } = useHookName(options);
```
Refer to individual file implementations for specific API surfaces.
