# Word Marking Implementation Plan

## Objective

Implement word-level classification and orchestration pattern for PTE scoring.

## Tasks

- [x] Update `lib/types.ts` with `WordMarking` interface.
- [x] Update `lib/ai/schemas.ts` with `wordMarking` field.
- [x] Create `lib/ai/tools.ts` with RAG and transcription tools.
- [x] Refactor `lib/ai/scoring-agent.ts` to use Parallel Expert Review + Synthesis pattern.
- [x] Update `lib/ai/config.ts` with latest Gemini models.
- [ ] Fix lint errors and type mismatches in `scoring-agent.ts`.
- [ ] Debug multi-modal prompt in `phoneticExpert`.
- [ ] Clean up temporary test files.
- [ ] Verify functionality with `test-detailed-scoring.ts`.

## Orchestration Pattern

1. **RAG/Preprocessing**: Retrieve rubrics and transcribe audio.
2. **Parallel Expertise**:
   - **Accuracy Expert**: Compares transcript to target text for omissions/insertions. (Gemini 2.5 Flash)
   - **Phonetic Expert**: Analyzes audio for pronunciation and fluency. (Gemini 3 Pro Preview)
3. **Synthesis**: Lead examiner merges insights into final JSON. (Gemini 3 Pro Preview)
