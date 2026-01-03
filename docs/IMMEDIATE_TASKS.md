# Immediate Tasks Checklist

## Today's Priority (CRITICAL)

### 1. Seed Pinecone Benchmark Data
```bash
# Files to create:
- [ ] data/benchmark-responses.ts
- [ ] scripts/seed-pinecone-benchmarks.ts
```

**Why Critical**: Without benchmark data, semantic similarity scoring returns 0 or random values. The entire RAG scoring pipeline depends on this.

### 2. Test Full Scoring Pipeline
```bash
# Test command (after seeding):
curl -X POST http://localhost:3000/api/score/speaking \
  -H "Content-Type: application/json" \
  -d '{"questionId": "...", "transcript": "Test response..."}'
```

---

## This Week

| Day | Task | Files | Status |
|-----|------|-------|--------|
| Day 1 | Benchmark data creation | `data/benchmark-responses.ts` | [ ] |
| Day 1 | Seed script | `scripts/seed-pinecone-benchmarks.ts` | [ ] |
| Day 2 | Run seeding + validate | - | [ ] |
| Day 2 | Enhance fluency scoring | `lib/vectorize.ts` | [ ] |
| Day 3 | Mock test question generator | `lib/pte/mock-test-data.ts` | [ ] |
| Day 3 | Section transitions UI | `app/moktest/[id]/` | [ ] |
| Day 4 | Audio recorder component | `components/pte/audio/` | [ ] |
| Day 4 | Writing scoring API | `app/api/score/writing/` | [ ] |
| Day 5 | Integration testing | `__tests__/` | [ ] |
| Day 5 | Bug fixes + polish | Various | [ ] |

---

## Quick Commands

```bash
# Start dev server
pnpm dev

# Run database migrations
pnpm db:migrate

# Seed Pinecone (after creating script)
pnpm tsx scripts/seed-pinecone-benchmarks.ts

# Type check
pnpm typecheck

# Build for production
pnpm build
```

---

## Key File Locations

| Purpose | Path |
|---------|------|
| Scoring formula | `lib/scoring.ts:1-20` |
| Lexical extraction | `lib/lexical.ts` |
| Pinecone client | `lib/pinecone.ts` |
| Main scoring pipeline | `lib/vectorize.ts` |
| Speaking API | `app/api/score/speaking/route.ts` |
| Question types | `constants/pte-constants.ts` |
| DB schema | `lib/db/schema/` |
| Question data | `data/speakingQuestions.ts` |

---

## Environment Check

Before starting, verify these are set in `.env.local`:

```
[ ] DATABASE_URL
[ ] PINECONE_API_KEY
[ ] OPENAI_API_KEY
[ ] ASSEMBLYAI_API_KEY (optional, for transcription)
```

---

## Blockers to Escalate

- [ ] Missing API keys
- [ ] Pinecone index not created
- [ ] Database connection issues
- [ ] OpenAI rate limits

---

*Start with benchmark seeding - everything else depends on it.*
