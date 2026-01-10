# Scoring System Verification Guide

## Database Query Tests

### Reading Practice
```bash
# Test reading question fetch
pnpm tsx scripts/verify-practice-system.ts
```

### Scoring Flow Verification

1. **Reading Scoring**:
   - Question fetched from DB ✓
   - User answer captured ✓
   - AI scoring triggered ✓
   - Attempt saved to DB ✓
   - User progress updated ✓

2. **Speaking Scoring**:
   - Audio recorded ✓
   - Audio uploaded ✓
   - Transcription via AssemblyAI ✓
   - AI scoring with Gemini ✓
   - Attempt saved with audio URL ✓
   - User progress updated ✓

3. **Writing Scoring**:
   - Text response captured ✓
   - AI scoring (grammar, vocabulary, structure) ✓
   - Attempt saved ✓
   - User progress updated ✓

4. **Listening Scoring**:
   - Audio played ✓
   - Answer captured ✓
   - AI scoring ✓
   - Attempt saved ✓
   - User progress updated ✓

## Database Schema Verification

All tables properly configured:
- ✅ pte_questions
- ✅ pte_attempts
- ✅ pte_question_types
- ✅ user_progress
- ✅ user_profiles

## API Routes Verified

- ✅ POST /api/scoring/speaking
- ✅ POST /api/scoring/reading
- ✅ POST /api/scoring/writing
- ✅ POST /api/scoring/listening

