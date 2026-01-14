# Scoring Output Examples

This document shows actual scoring outputs for each question type.

---

## 📖 READING QUESTIONS (Deterministic Scoring)

### 1. Multiple Choice Single Answer

**Question**: "What is the main idea of the passage?"
**Options**:
- A: "The author discusses climate change"
- B: "The passage explores renewable energy"
- C: "Global warming effects are detailed"
- D: "Carbon emissions are the focus"

**Correct Answer**: B (index 1)
**User Answer**: "The passage explores renewable energy"

**Scoring Output**:
```json
{
  "overallScore": 90,
  "content": {
    "score": 90,
    "feedback": "Correct! You selected the right answer."
  },
  "accuracy": {
    "score": 90,
    "feedback": "1/1 correct"
  },
  "suggestions": ["Keep practicing to maintain accuracy!"],
  "strengths": ["Correctly answered 1 out of 1"],
  "areasForImprovement": [],
  "scoringMetrics": {
    "lexicalScore": 0,
    "semanticScore": 0,
    "fluencyScore": 0,
    "calculatedPteScore": 90,
    "confidence": 100
  }
}
```

**Database Save**:
```json
{
  "userId": "user-123",
  "questionId": "q-456",
  "questionType": "reading_mc_single",
  "aiScore": 90,
  "responseData": {
    "userResponse": { "selectedOption": "The passage explores renewable energy" },
    "answerKey": [1]
  },
  "aiFeedback": { /* feedback object above */ },
  "status": "completed",
  "createdAt": "2026-01-09T12:00:00Z"
}
```

---

### 2. Multiple Choice Multiple Answers

**Question**: "Select all statements that are true according to the passage."
**Options**:
- A: "Renewable energy is sustainable"
- B: "Fossil fuels are infinite"
- C: "Solar power is growing"
- D: "Wind energy is expensive"

**Correct Answers**: [0, 2] (A and C)
**User Answer**: ["Renewable energy is sustainable", "Solar power is growing"]

**Scoring Output**:
```json
{
  "overallScore": 90,
  "content": {
    "score": 90,
    "feedback": "Perfect! You identified all correct answers."
  },
  "accuracy": {
    "score": 90,
    "feedback": "2/2 correct"
  },
  "suggestions": ["Keep practicing to maintain accuracy!"],
  "strengths": ["Correctly answered 2 out of 2"],
  "areasForImprovement": [],
  "scoringMetrics": {
    "lexicalScore": 0,
    "semanticScore": 0,
    "fluencyScore": 0,
    "calculatedPteScore": 90,
    "confidence": 100
  }
}
```

**Database Save**:
```json
{
  "userId": "user-123",
  "questionId": "q-457",
  "questionType": "reading_mc_multiple",
  "aiScore": 90,
  "responseData": {
    "userResponse": {
      "selectedOptions": ["Renewable energy is sustainable", "Solar power is growing"]
    },
    "answerKey": [0, 2]
  },
  "aiFeedback": { /* feedback object above */ },
  "status": "completed",
  "createdAt": "2026-01-09T12:05:00Z"
}
```

---

### 3. Reorder Paragraphs

**Question**: "Arrange the paragraphs in the correct order."
**Paragraphs**:
- A: "Finally, the conclusion was reached."
- B: "First, the hypothesis was formed."
- C: "Then, experiments were conducted."
- D: "Results were analyzed next."

**Correct Order**: [1, 2, 3, 0] (B → C → D → A)
**User Answer**: ["First, the hypothesis was formed.", "Then, experiments were conducted.", "Results were analyzed next.", "Finally, the conclusion was reached."]

**Scoring Output**:
```json
{
  "overallScore": 90,
  "content": {
    "score": 90,
    "feedback": "Perfect! All paragraphs are in the correct order."
  },
  "accuracy": {
    "score": 90,
    "feedback": "3/3 correct"
  },
  "suggestions": ["Keep practicing to maintain accuracy!"],
  "strengths": ["Correctly answered 3 out of 3"],
  "areasForImprovement": [],
  "scoringMetrics": {
    "lexicalScore": 0,
    "semanticScore": 0,
    "fluencyScore": 0,
    "calculatedPteScore": 90,
    "confidence": 100
  }
}
```

**Database Save**:
```json
{
  "userId": "user-123",
  "questionId": "q-458",
  "questionType": "reorder_paragraphs",
  "aiScore": 90,
  "responseData": {
    "userResponse": {
      "orderedParagraphs": ["B", "C", "D", "A"]
    },
    "answerKey": [1, 2, 3, 0]
  },
  "aiFeedback": { /* feedback object above */ },
  "status": "completed",
  "createdAt": "2026-01-09T12:10:00Z"
}
```

---

### 4. Fill in the Blanks

**Question**: "The __1__ was __2__ by the __3__."
**Blanks**:
- blank1: "discovery"
- blank2: "made"
- blank3: "scientist"

**Correct Answers**: { blank1: "discovery", blank2: "made", blank3: "scientist" }
**User Answer**: { blank1: "discovery", blank2: "made", blank3: "scientist" }

**Scoring Output**:
```json
{
  "overallScore": 90,
  "content": {
    "score": 90,
    "feedback": "Perfect! All blanks filled correctly."
  },
  "accuracy": {
    "score": 90,
    "feedback": "3/3 correct"
  },
  "suggestions": ["Keep practicing to maintain accuracy!"],
  "strengths": ["Correctly answered 3 out of 3"],
  "areasForImprovement": [],
  "scoringMetrics": {
    "lexicalScore": 0,
    "semanticScore": 0,
    "fluencyScore": 0,
    "calculatedPteScore": 90,
    "confidence": 100
  }
}
```

---

## 🎧 LISTENING QUESTIONS

### 1. Summarize Spoken Text (AI Scoring) ✨

**Question**: "Summarize the audio in 50-70 words."
**Audio Transcript**: "The lecture discusses the importance of renewable energy sources..."
**User Answer**: "The speaker explains how renewable energy is crucial for sustainable development and reducing carbon emissions. Solar and wind power are highlighted as key alternatives to fossil fuels."

**Scoring Output** (AI Generated):
```json
{
  "overallScore": 78,
  "content": {
    "score": 80,
    "feedback": "Good summary covering main points. Could include more detail about specific renewable sources."
  },
  "vocabulary": {
    "score": 85,
    "feedback": "Excellent use of topic-specific vocabulary."
  },
  "grammar": {
    "score": 75,
    "feedback": "Generally correct with minor issues."
  },
  "suggestions": [
    "Include specific examples from the lecture",
    "Expand on the environmental benefits mentioned"
  ],
  "strengths": [
    "Clear and concise writing",
    "Appropriate technical vocabulary"
  ],
  "areasForImprovement": [
    "Could elaborate on specific renewable sources",
    "Missing some key details from the original"
  ],
  "scoringMetrics": {
    "lexicalScore": 85,
    "semanticScore": 75,
    "fluencyScore": 80,
    "calculatedPteScore": 78,
    "confidence": 92
  },
  "wordCount": 34
}
```

**Database Save**:
```json
{
  "userId": "user-123",
  "questionId": "q-500",
  "questionType": "summarize_spoken_text",
  "aiScore": 78,
  "responseText": "The speaker explains how renewable energy...",
  "aiFeedback": { /* AI feedback above */ },
  "status": "completed",
  "createdAt": "2026-01-09T12:15:00Z"
}
```

**Note**: ✨ AI usage tracked for this question type only!

---

### 2. Write from Dictation (Deterministic Scoring)

**Question**: "Listen to the audio and type what you hear."
**Audio**: "The quick brown fox jumps over the lazy dog."
**Correct Text**: "The quick brown fox jumps over the lazy dog"
**User Answer**: "The quick brown fox jumps over the lazy dog"

**Scoring Output**:
```json
{
  "overallScore": 90,
  "content": {
    "score": 90,
    "feedback": "Perfect transcription!"
  },
  "accuracy": {
    "score": 90,
    "feedback": "9/9 correct"
  },
  "suggestions": ["Keep practicing to maintain accuracy!"],
  "strengths": ["Correctly answered 9 out of 9"],
  "areasForImprovement": [],
  "scoringMetrics": {
    "lexicalScore": 0,
    "semanticScore": 0,
    "fluencyScore": 0,
    "calculatedPteScore": 90,
    "confidence": 100
  }
}
```

**Database Save**:
```json
{
  "userId": "user-123",
  "questionId": "q-501",
  "questionType": "write_from_dictation",
  "aiScore": 90,
  "responseData": {
    "userResponse": { "textAnswer": "The quick brown fox jumps over the lazy dog" },
    "answerKey": { "correctText": "The quick brown fox jumps over the lazy dog" }
  },
  "aiFeedback": { /* feedback above */ },
  "status": "completed",
  "createdAt": "2026-01-09T12:20:00Z"
}
```

---

### 3. Listening MCQ Single (Deterministic Scoring)

**Question**: "What was the main topic of the audio?"
**Options**:
- A: "Climate change"
- B: "Renewable energy"
- C: "Fossil fuels"
- D: "Global warming"

**Correct Answer**: B (index 1)
**User Answer**: "Renewable energy"

**Scoring Output**:
```json
{
  "overallScore": 90,
  "content": {
    "score": 90,
    "feedback": "Correct! You selected the right answer."
  },
  "accuracy": {
    "score": 90,
    "feedback": "1/1 correct"
  },
  "suggestions": ["Keep practicing to maintain accuracy!"],
  "strengths": ["Correctly answered 1 out of 1"],
  "areasForImprovement": [],
  "scoringMetrics": {
    "lexicalScore": 0,
    "semanticScore": 0,
    "fluencyScore": 0,
    "calculatedPteScore": 90,
    "confidence": 100
  }
}
```

---

### 4. Listening Fill Blanks (Deterministic Scoring)

**Question**: "Fill in the missing words from the audio."
**Audio**: "The discovery was made by the scientist."
**Blanks**: { blank1: "discovery", blank2: "made", blank3: "scientist" }
**User Answer**: { blank1: "discovery", blank2: "made", blank3: "scientist" }

**Scoring Output**: *(Same as Reading Fill Blanks - see above)*

---

### 5. Highlight Incorrect Words (Deterministic Scoring)

**Question**: "Click on the words that are different from the audio."
**Transcript Shown**: "The quick brown fox jumps over the lazy cat."
**Audio**: "The quick brown fox jumps over the lazy dog."
**Incorrect Words**: ["cat"]
**User Answer**: ["cat"]

**Scoring Output**:
```json
{
  "overallScore": 90,
  "content": {
    "score": 90,
    "feedback": "Perfect! You identified all incorrect words without false positives."
  },
  "accuracy": {
    "score": 90,
    "feedback": "1/1 correct"
  },
  "suggestions": ["Keep practicing to maintain accuracy!"],
  "strengths": ["Correctly answered 1 out of 1"],
  "areasForImprovement": [],
  "scoringMetrics": {
    "lexicalScore": 0,
    "semanticScore": 0,
    "fluencyScore": 0,
    "calculatedPteScore": 90,
    "confidence": 100
  }
}
```

---

## 🗣️ SPEAKING QUESTIONS (AI Scoring) ✨

### Read Aloud

**Question**: "Read the following text aloud."
**Text**: "Climate change is a pressing global issue."
**User Audio**: [Uploaded to Vercel Blob Storage]
**Audio URL**: `https://blob.vercel-storage.com/pte/speaking/123-audio.mp3`

**Scoring Output** (AI Generated):
```json
{
  "overallScore": 75,
  "pronunciation": {
    "score": 72,
    "feedback": "Good pronunciation with minor issues on 'pressing'."
  },
  "fluency": {
    "score": 78,
    "feedback": "Natural rhythm with appropriate pausing."
  },
  "content": {
    "score": 80,
    "feedback": "All content was included correctly."
  },
  "suggestions": [
    "Work on stress patterns in multi-syllable words",
    "Maintain consistent volume throughout"
  ],
  "strengths": [
    "Clear enunciation of most words",
    "Good pacing"
  ],
  "areasForImprovement": [
    "Pronunciation of 'pressing' needs work",
    "Slight hesitation detected"
  ],
  "transcript": "Climate change is a pressing global issue.",
  "scoringMetrics": {
    "lexicalScore": 80,
    "semanticScore": 85,
    "fluencyScore": 78,
    "calculatedPteScore": 75,
    "confidence": 88
  }
}
```

**Database Save**:
```json
{
  "userId": "user-123",
  "questionId": "q-600",
  "questionType": "read_aloud",
  "aiScore": 75,
  "audioUrl": "https://blob.vercel-storage.com/pte/speaking/123-audio.mp3",
  "aiFeedback": { /* AI feedback above */ },
  "status": "completed",
  "createdAt": "2026-01-09T12:25:00Z"
}
```

**Note**: ✨ Audio file saved to Vercel Blob Storage + AI scoring used!

---

## ✍️ WRITING QUESTIONS (AI Scoring) ✨

### Write Essay

**Question**: "Write an essay on renewable energy (200-300 words)."
**User Answer**: "Renewable energy sources are essential for sustainable development..."

**Scoring Output** (AI Generated):
```json
{
  "overallScore": 82,
  "content": {
    "score": 85,
    "feedback": "Strong argument with good supporting evidence."
  },
  "grammar": {
    "score": 80,
    "feedback": "Generally correct with a few minor errors."
  },
  "vocabulary": {
    "score": 88,
    "feedback": "Excellent range of academic vocabulary."
  },
  "structure": {
    "score": 75,
    "feedback": "Clear introduction and conclusion, body could be better organized."
  },
  "suggestions": [
    "Add transition words between paragraphs",
    "Expand on counterarguments",
    "Include more specific examples"
  ],
  "strengths": [
    "Strong thesis statement",
    "Academic tone throughout",
    "Good use of technical terminology"
  ],
  "areasForImprovement": [
    "Paragraph transitions could be smoother",
    "Some sentences are too long",
    "Missing citation format for statistics"
  ],
  "scoringMetrics": {
    "lexicalScore": 88,
    "semanticScore": 85,
    "fluencyScore": 80,
    "calculatedPteScore": 82,
    "confidence": 90
  },
  "wordCount": 267
}
```

**Database Save**:
```json
{
  "userId": "user-123",
  "questionId": "q-700",
  "questionType": "essay",
  "aiScore": 82,
  "responseText": "Renewable energy sources are essential...",
  "aiFeedback": { /* AI feedback above */ },
  "status": "completed",
  "createdAt": "2026-01-09T12:30:00Z"
}
```

**Note**: ✨ AI scoring used for detailed writing feedback!

---

## 📊 Summary

### AI Scoring
- **Total Types**: 10 (45.5%)
- **Features**:
  - Detailed feedback on content, fluency, grammar, vocabulary
  - Transcript generation for speaking questions
  - Audio file storage (Vercel Blob)
  - Semantic similarity analysis
  - Confidence scoring
  - AI usage tracked in database

### Deterministic Scoring
- **Total Types**: 12 (54.5%)
- **Features**:
  - Instant scoring (no network latency)
  - 100% accuracy (rule-based)
  - No AI hallucination
  - Confidence always 100%
  - Consistent results
  - No API costs

### Database Saves
All attempts are saved with:
- ✅ User ID
- ✅ Question ID
- ✅ Question Type
- ✅ AI Score (0-90)
- ✅ Response Data/Text
- ✅ AI Feedback (structured JSON)
- ✅ Audio URL (for speaking questions)
- ✅ Status (completed/in_progress)
- ✅ Timestamp
