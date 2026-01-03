# PTE Academic Mock Test Platform - Action Plan

> **Status**: Production Label
> **Last Updated**: 2026-01-03
> **Goal**: Build a fully functional 2-hour test across 22 modules with RAG-powered scoring

---

## Executive Summary

### Current State
| Component | Status | Notes |
|-----------|--------|-------|
| Lexical Model | COMPLETE | TTR, density, repetition scoring |
| Embeddings Pipeline | COMPLETE | OpenAI text-embedding-3-small |
| Pinecone Setup | PARTIAL | Client ready, no benchmark data |
| Scoring Formula | COMPLETE | 35% lexical + 45% semantic + 20% fluency |
| Database Schema | COMPLETE | 10+ tables with full relations |
| Question Banks | COMPLETE | 50+ questions per section |
| Speaking API | COMPLETE | `/api/score/speaking` working |
| Writing/Reading API | NOT STARTED | Endpoints missing |
| Benchmark Seeding | NOT STARTED | Critical gap |
| HITL Review | NOT STARTED | Schema ready, no UI |

### Priority Matrix
```
HIGH IMPACT + URGENT:       [1] Benchmark Seeding, [2] Full Test Flow
HIGH IMPACT + NOT URGENT:   [3] Writing API, [4] HITL Dashboard
LOW IMPACT + URGENT:        [5] Bug Fixes, [6] Performance
LOW IMPACT + NOT URGENT:    [7] Analytics, [8] Mobile Support
```

---

## Phase 1: Core Scoring Pipeline (Week 1)

### 1.1 Seed Pinecone Benchmark Namespace
**Priority**: CRITICAL
**Files**: `scripts/seed-pinecone-benchmarks.ts`, `data/benchmark-responses.ts`

**Tasks**:
- [ ] Create benchmark response dataset (10-20 per question type)
- [ ] Format: `{ questionId, idealResponse, score: 85-90, features }`
- [ ] Seed script to embed and upsert to `pte-speaking` → `benchmark` namespace
- [ ] Add benchmark responses for all 14 AI-scored question types

**Benchmark Schema**:
```typescript
{
  id: string;          // "benchmark-ra-001"
  values: number[];    // 1536-dim embedding
  metadata: {
    questionId: string;
    questionType: "read-aloud" | "describe-image" | ...;
    benchmarkScore: number;  // 85-90
    transcript: string;
    lexicalScore: number;
    fluencyMarkers: string[];
  }
}
```

**Acceptance Criteria**:
- [ ] 200+ benchmark vectors in Pinecone
- [ ] Query returns relevant benchmark in <200ms
- [ ] Semantic scores correlate with benchmark quality

---

### 1.2 Enhance Semantic Similarity Scoring
**Priority**: HIGH
**Files**: `lib/vectorize.ts`, `lib/scoring.ts`

**Current State**:
```typescript
// Only uses topK=1
const results = await benchmarkIndex.query({ topK: 1, vector });
const semanticScore = results.matches[0]?.score ?? 0;
```

**Improved Logic**:
```typescript
// Use topK=3 with weighted averaging
const results = await benchmarkIndex.query({ topK: 3, vector });
const semanticScore = results.matches.reduce((acc, m, i) => {
  const weight = 1 / (i + 1); // 1, 0.5, 0.33
  return acc + (m.score * weight);
}, 0) / 1.83; // Normalize by sum of weights
```

**Tasks**:
- [ ] Update topK from 1 to 3
- [ ] Implement weighted averaging
- [ ] Add confidence calculation based on score variance
- [ ] Log top matches for debugging

---

### 1.3 Improve Fluency Scoring
**Priority**: MEDIUM
**Files**: `lib/lexical.ts`, `lib/vectorize.ts`

**Current** (too basic):
```typescript
const fluencyScore = Math.min(1, lexical.avgSentenceLength / 20);
```

**Improved**:
```typescript
function calculateFluencyScore(text: string, lexical: LexicalResult): number {
  const sentences = text.split(/[.!?]+/).filter(Boolean);

  // 1. Sentence length variance (lower is better)
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const variance = calculateVariance(lengths);
  const varianceScore = Math.max(0, 1 - (variance / 50));

  // 2. Filler word penalty
  const fillers = (text.match(/\b(um|uh|like|you know|basically)\b/gi) || []).length;
  const fillerPenalty = Math.min(0.3, fillers * 0.05);

  // 3. Repetition factor (from lexical)
  const repetitionScore = 1 - lexical.repetitionPenalty;

  // 4. Length appropriateness (target: 50-150 words)
  const wordCount = text.split(/\s+/).length;
  const lengthScore = wordCount < 20 ? 0.3 : wordCount > 200 ? 0.7 : 1;

  return clamp(
    varianceScore * 0.3 +
    (1 - fillerPenalty) * 0.2 +
    repetitionScore * 0.3 +
    lengthScore * 0.2
  );
}
```

**Tasks**:
- [ ] Add filler word detection
- [ ] Calculate sentence variance
- [ ] Add length appropriateness scoring
- [ ] Weight combine into fluency score

---

## Phase 2: Mock Test Runner (Week 2)

### 2.1 Complete Mock Test Flow
**Priority**: CRITICAL
**Files**: `app/moktest/[id]/page.tsx`, `app/moktest/[id]/MockTestRunner.tsx`

**Test Structure** (2-hour, 22 modules):
```
Speaking & Writing: 54-67 min
├── Personal Introduction (not scored)
├── Read Aloud (x5)
├── Repeat Sentence (x10)
├── Describe Image (x3)
├── Retell Lecture (x2)
├── Answer Short Question (x5)
├── Summarize Written Text (x2)
└── Write Essay (x1)

Reading: 29-30 min
├── Multiple Choice Single (x2)
├── Multiple Choice Multiple (x2)
├── Reorder Paragraphs (x2)
├── Fill in the Blanks (Reading) (x4)
└── Fill in the Blanks (R&W) (x5)

Listening: 30-43 min
├── Summarize Spoken Text (x2)
├── Multiple Choice Multiple (x2)
├── Fill in the Blanks (x2)
├── Highlight Correct Summary (x2)
├── Multiple Choice Single (x2)
├── Select Missing Word (x2)
├── Highlight Incorrect Words (x2)
└── Write from Dictation (x3)
```

**Tasks**:
- [ ] Create `generateMockTestQuestions()` - Random question selection per type
- [ ] Implement section transitions with instructions
- [ ] Add timer per section (countdown + auto-submit)
- [ ] Handle question navigation (next/back where allowed)
- [ ] Save progress on every answer submission
- [ ] Handle browser close/refresh (restore state)

**Component Structure**:
```
MockTestRunner/
├── SectionHeader.tsx      # Section name, time remaining
├── QuestionDisplay.tsx    # Polymorphic question renderer
├── AnswerInput.tsx        # Audio recorder / text input / MCQ
├── NavigationControls.tsx # Next, back, submit section
├── ProgressBar.tsx        # Question X of Y
└── TimerDisplay.tsx       # Countdown with warnings
```

---

### 2.2 Question Type Components
**Priority**: HIGH
**Files**: `app/moktest/_components/question-types/`

**Speaking Components**:
| Component | Input | Output |
|-----------|-------|--------|
| `ReadAloud.tsx` | Text passage | Audio recording |
| `RepeatSentence.tsx` | Audio playback | Audio recording |
| `DescribeImage.tsx` | Image + prompt | Audio recording |
| `RetellLecture.tsx` | Audio/video | Audio recording |
| `AnswerShortQuestion.tsx` | Audio question | Audio recording |

**Writing Components**:
| Component | Input | Output |
|-----------|-------|--------|
| `SummarizeWrittenText.tsx` | Text passage | Single sentence (5-75 words) |
| `WriteEssay.tsx` | Prompt | Essay (200-300 words) |

**Reading Components**:
| Component | Input | Output |
|-----------|-------|--------|
| `MCQSingle.tsx` | Passage + options | Single selection |
| `MCQMultiple.tsx` | Passage + options | Multiple selections |
| `ReorderParagraphs.tsx` | Shuffled paragraphs | Ordered list (drag-drop) |
| `FillBlanksDropdown.tsx` | Passage + dropdowns | Selected words |
| `FillBlanksDragDrop.tsx` | Passage + word bank | Placed words |

**Listening Components**:
| Component | Input | Output |
|-----------|-------|--------|
| `SummarizeSpokenText.tsx` | Audio | Summary text (50-70 words) |
| `HighlightCorrectSummary.tsx` | Audio + options | Single selection |
| `SelectMissingWord.tsx` | Audio (cut) + options | Single selection |
| `HighlightIncorrectWords.tsx` | Audio + transcript | Clicked words |
| `WriteFromDictation.tsx` | Audio | Typed sentence |

**Tasks**:
- [ ] Create base `QuestionWrapper.tsx` with common UI
- [ ] Implement each component with proper typing
- [ ] Add audio recorder component (reusable)
- [ ] Add drag-drop component (reusable)
- [ ] Integrate with scoring APIs

---

### 2.3 Audio Recording Infrastructure
**Priority**: HIGH
**Files**: `components/pte/audio/AudioRecorder.tsx`, `lib/audio/upload.ts`

**Tasks**:
- [ ] Create `useAudioRecorder` hook with MediaRecorder API
- [ ] Implement recording states: idle → recording → stopped
- [ ] Add waveform visualization during recording
- [ ] Upload to storage (S3/MinIO or Vercel Blob)
- [ ] Return audio URL for scoring pipeline
- [ ] Add playback review before submit

**Audio Flow**:
```
User clicks "Record" → MediaRecorder starts → Visualizer shows waveform
User clicks "Stop" → Blob created → Upload to storage → URL returned
URL saved to pteAttempts.audioUrl → Transcription triggered → Scoring runs
```

---

## Phase 3: Additional Scoring APIs (Week 3)

### 3.1 Writing Scoring API
**Priority**: HIGH
**Files**: `app/api/score/writing/route.ts`, `lib/scoring/writing.ts`

**Endpoint**: `POST /api/score/writing`

**Scoring Components**:
| Component | Weight | Range |
|-----------|--------|-------|
| Content | 30% | 0-3 |
| Form | 20% | 0-2 |
| Grammar | 25% | 0-2 |
| Vocabulary | 15% | 0-2 |
| Spelling | 10% | 0-2 |

**Tasks**:
- [ ] Create writing scoring route
- [ ] Implement content relevance scoring (semantic similarity to prompt)
- [ ] Add form scoring (word count compliance, structure)
- [ ] Integrate grammar checking (LanguageTool API or rule-based)
- [ ] Vocabulary assessment (lexical model)
- [ ] Spelling check integration

**Summarize Written Text Specifics**:
```typescript
{
  wordCount: { min: 5, max: 75, target: 30-50 },
  singleSentence: true, // Must be one sentence
  contentCoverage: 0.8,  // 80% of key points
  form: {
    hasCapital: true,
    hasPeriod: true,
    noFragments: true
  }
}
```

---

### 3.2 Reading/Listening Scoring
**Priority**: MEDIUM
**Files**: `app/api/score/reading/route.ts`, `app/api/score/listening/route.ts`

**Note**: These are mostly deterministic (MCQ, fill blanks)

**Tasks**:
- [ ] Create reading scoring route (MCQ comparison)
- [ ] Implement reorder paragraph scoring (sequence matching)
- [ ] Create listening scoring route
- [ ] Implement partial credit for multiple-answer MCQs
- [ ] Add Write from Dictation word-level scoring

**Scoring Logic**:
```typescript
// MCQ Single: 1 point if correct, 0 otherwise
// MCQ Multiple: +1 per correct, -1 per incorrect, min 0
// Reorder: Pairs correct / total pairs
// Fill Blanks: Correct blanks / total blanks
// Write from Dictation: Correct words / total words
```

---

### 3.3 ASR Integration (Audio Transcription)
**Priority**: HIGH
**Files**: `lib/transcription.ts`, `app/api/transcribe/route.ts`

**Option 1: AssemblyAI** (already installed)
```typescript
import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

export async function transcribeAudio(audioUrl: string): Promise<string> {
  const transcript = await client.transcripts.transcribe({
    audio: audioUrl,
    language_code: 'en',
    speech_model: 'best', // or 'nano' for speed
  });
  return transcript.text ?? '';
}
```

**Option 2: OpenAI Whisper**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI();

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const response = await openai.audio.transcriptions.create({
    file: audioBuffer,
    model: 'whisper-1',
    language: 'en',
  });
  return response.text;
}
```

**Tasks**:
- [ ] Choose ASR provider (recommend AssemblyAI for accuracy)
- [ ] Implement transcription endpoint
- [ ] Add pronunciation confidence scores (if available)
- [ ] Handle transcription errors gracefully
- [ ] Cache transcriptions in database

---

## Phase 4: Score Calibration & HITL (Week 4)

### 4.1 Score Calibration System
**Priority**: MEDIUM
**Files**: `lib/calibration.ts`, `scripts/calibrate-scores.ts`

**Tasks**:
- [ ] Create calibration dataset (50 responses with known scores)
- [ ] Run scoring pipeline on calibration set
- [ ] Calculate correlation coefficient (target: r > 0.85)
- [ ] Adjust weights if correlation is low
- [ ] Document final formula with validation results

**Calibration Process**:
```
1. Collect 50 speaking responses with expert scores
2. Run through scoring pipeline
3. Compare predicted vs actual scores
4. If MSE > threshold, adjust weights
5. Re-run and validate
6. Lock weights when r > 0.85
```

---

### 4.2 HITL Review Dashboard
**Priority**: LOW (defer to Phase 5)
**Files**: `app/admin/review/page.tsx`

**When to escalate to HITL**:
- `riskFlag: true` (from scoring pipeline)
- Confidence < 0.6
- User disputes score
- First-time high-stakes submission

**Dashboard Features**:
- [ ] Queue of flagged attempts
- [ ] Side-by-side: response + AI score + breakdown
- [ ] Adjust individual component scores
- [ ] Add reviewer notes
- [ ] Approve/Reject/Request re-evaluation
- [ ] Audit log of all reviews

---

## Phase 5: Polish & Analytics (Week 5+)

### 5.1 Real-time Progress Updates
**Files**: `app/moktest/[id]/page.tsx`, `lib/realtime.ts`

**Options**:
1. **Polling** (simple): Check progress every 5s
2. **Server-Sent Events** (medium): Push updates
3. **WebSockets** (complex): Bi-directional

**Tasks**:
- [ ] Implement progress polling endpoint
- [ ] Update UI with real-time score feedback
- [ ] Show completion percentage
- [ ] Estimated score preview (optional)

---

### 5.2 Performance Analytics
**Files**: `app/dashboard/analytics/page.tsx`

**Metrics to Track**:
- Score trends over time
- Weak areas by question type
- Time spent per question
- Improvement recommendations
- Comparison to target score

**Tasks**:
- [ ] Create analytics dashboard
- [ ] Implement score history charts
- [ ] Add question type breakdown
- [ ] Generate personalized recommendations

---

## Technical Debt & Improvements

### Code Quality
- [ ] Add unit tests for lexical model (`__tests__/lexical.test.ts`)
- [ ] Add integration tests for scoring pipeline
- [ ] Mock Pinecone queries in tests
- [ ] Add E2E test for full mock test flow

### Performance
- [ ] Add rate limiting to scoring APIs
- [ ] Implement request queue for heavy scoring operations
- [ ] Cache embeddings for repeated questions
- [ ] Optimize database queries with indexes

### Security
- [ ] Validate audio file types and sizes
- [ ] Sanitize text inputs
- [ ] Add CSRF protection
- [ ] Implement score verification (anti-cheat)

---

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://...

# Pinecone
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
PINECONE_INDEX=pte-speaking

# OpenAI
OPENAI_API_KEY=...

# AssemblyAI (for transcription)
ASSEMBLYAI_API_KEY=...

# Storage (for audio)
BLOB_READ_WRITE_TOKEN=...
# OR
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
```

---

## File Structure Target

```
app/
├── moktest/
│   ├── page.tsx                    # Test list/history
│   ├── [id]/
│   │   ├── page.tsx                # Test runner entry
│   │   ├── MockTestRunner.tsx      # Main runner component
│   │   └── layout.tsx
│   └── _components/
│       ├── question-types/
│       │   ├── ReadAloud.tsx
│       │   ├── RepeatSentence.tsx
│       │   ├── DescribeImage.tsx
│       │   ├── ... (all 22 types)
│       │   └── index.ts
│       ├── SectionHeader.tsx
│       ├── TimerDisplay.tsx
│       ├── ProgressBar.tsx
│       └── NavigationControls.tsx
├── api/
│   ├── score/
│   │   ├── speaking/route.ts       # DONE
│   │   ├── writing/route.ts        # TODO
│   │   ├── reading/route.ts        # TODO
│   │   └── listening/route.ts      # TODO
│   └── transcribe/route.ts         # TODO
├── admin/
│   └── review/page.tsx             # HITL dashboard
└── dashboard/
    └── analytics/page.tsx          # Performance analytics

lib/
├── lexical.ts                      # DONE
├── pinecone.ts                     # DONE
├── embeddings.ts                   # DONE
├── vectorize.ts                    # DONE
├── scoring.ts                      # DONE
├── transcription.ts                # TODO
├── calibration.ts                  # TODO
├── scoring/
│   ├── speaking.ts                 # Refactor from vectorize
│   ├── writing.ts                  # TODO
│   ├── reading.ts                  # TODO
│   └── listening.ts                # TODO
└── db/
    └── schema/                     # DONE

scripts/
├── seed-pinecone-benchmarks.ts     # TODO (CRITICAL)
├── calibrate-scores.ts             # TODO
└── migrate.ts                      # DONE

data/
├── speakingQuestions.ts            # DONE
├── writingQuestions.ts             # DONE
├── readingQuestions.ts             # DONE
├── listeningQuestions.ts           # DONE
└── benchmark-responses.ts          # TODO (CRITICAL)
```

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Scoring correlation (r) | > 0.85 | Not measured |
| Pinecone query latency | < 200ms | ~150ms |
| Full test completion rate | > 90% | Not tracked |
| Score breakdown accuracy | Human-validated | Partial |
| Question coverage | 22/22 types | ~14/22 |
| Benchmark responses | 200+ | 0 |

---

## Immediate Next Steps (Today)

1. **[CRITICAL]** Create `scripts/seed-pinecone-benchmarks.ts`
2. **[CRITICAL]** Create `data/benchmark-responses.ts` with 10+ responses per type
3. **[HIGH]** Run benchmark seeding script
4. **[HIGH]** Test semantic scoring with benchmarks
5. **[MEDIUM]** Enhance fluency scoring in `lib/vectorize.ts`

---

## Questions to Resolve

1. **ASR Provider**: AssemblyAI vs OpenAI Whisper - which is preferred?
2. **Audio Storage**: Vercel Blob vs S3 - what's the budget/preference?
3. **Scoring Weights**: Are current weights (35/45/20) validated?
4. **HITL Trigger**: What confidence threshold triggers human review?
5. **Target Score Range**: Is 10-90 PTE scale correct?

---

*Document maintained by AI Dev Agent. Last action: Initial comprehensive plan created.*
