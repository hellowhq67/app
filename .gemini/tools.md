# AI Tools

This document lists the AI tools defined in `lib/ai/tools.ts` available for the scoring agent.

## Scoring & Evaluation
*   **`retrieveScoringCriteria`**
    *   **Description**: Retrieves specific scoring rubrics and criteria for different PTE question types (e.g., Read Aloud, Essay, Describe Image).
    *   **Input**: `{ questionType: string }`
    *   **Usage**: Call this to get the ground truth rules for grading a user's response.

## Media Processing
*   **`fetchAudioAsBase64`**
    *   **Description**: Fetches an audio file from a URL and converts it to a base64 string.
    *   **Input**: `{ url: string }`
    *   **Usage**: Required when passing audio content to multimodal models (like Gemini) that expect inline data.

*   **`transcribeAudioTool`**
    *   **Description**: Transcribes audio using AssemblyAI's API.
    *   **Input**: `{ audioUrl: string }`
    *   **Usage**: Converts spoken responses into text for analysis of content, pronunciation (via text comparison), and grammar. Handles polling for transcription completion.

## Integration
These tools are exported as Vercel AI SDK `tool` instances and are designed to be passed to `generateText` or `streamText` functions in `lib/ai/scoring-agent.ts`.
