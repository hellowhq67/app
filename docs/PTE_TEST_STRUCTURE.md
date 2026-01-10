# PTE Test Formats & Structure

This document outlines the strict structures for **PTE Academic** (including UKVI) and **PTE Core**, as required for the Mock Test implementation.

## 1. PTE Academic (and UKVI)

**Total Duration:** Approx. 2 hours
**Sections:** 3 Parts

### Part 1: Speaking & Writing (Approx. 54–67 minutes)

| #   | Question Type              | Item Count | Scoring Integration |
| --- | -------------------------- | ---------- | ------------------- |
| 1   | **Personal Introduction**  | 1          | Not scored          |
| 2   | **Read Aloud**             | 6–7        | Reading, Speaking   |
| 3   | **Repeat Sentence**        | 10–12      | Listening, Speaking |
| 4   | **Describe Image**         | 3–4        | Speaking            |
| 5   | **Re-tell Lecture**        | 1–2        | Listening, Speaking |
| 6   | **Answer Short Question**  | 5–6        | Listening, Speaking |
| 7   | **Summarize Written Text** | 1–2        | Reading, Writing    |
| 8   | **Write Essay**            | 1–2        | Writing             |

### Part 2: Reading (Approx. 29–30 minutes)

| #   | Question Type                             | Item Count | Scoring Integration |
| --- | ----------------------------------------- | ---------- | ------------------- |
| 9   | **Reading & Writing: Fill in the Blanks** | 5–6        | Reading, Writing    |
| 10  | **Multiple Choice, Multiple Answer**      | 1–2        | Reading             |
| 11  | **Re-order Paragraphs**                   | 2–3        | Reading             |
| 12  | **Reading: Fill in the Blanks**           | 4–5        | Reading             |
| 13  | **Multiple Choice, Single Answer**        | 1–2        | Reading             |

### Part 3: Listening (Approx. 30–43 minutes)

| #   | Question Type                        | Item Count | Scoring Integration |
| --- | ------------------------------------ | ---------- | ------------------- |
| 14  | **Summarize Spoken Text**            | 1–2        | Listening, Writing  |
| 15  | **Multiple Choice, Multiple Answer** | 1–2        | Listening           |
| 16  | **Fill in the Blanks**               | 2–3        | Listening, Writing  |
| 17  | **Highlight Correct Summary**        | 1–2        | Listening, Reading  |
| 18  | **Multiple Choice, Single Answer**   | 1–2        | Listening           |
| 19  | **Select Missing Word**              | 1–2        | Listening           |
| 20  | **Highlight Incorrect Words**        | 2–3        | Listening, Reading  |
| 21  | **Write from Dictation**             | 3–4        | Listening, Writing  |

---

## 2. PTE Core (General Training)

**Total Duration:** Approx. 2 hours
**Focus:** Vocational / General use (e.g. Canada migration)

### Part 1: Speaking & Writing (Approx. 50 mins)

1. **Personal Introduction** (Not scored)
2. **Read Aloud** (Similar to Academic)
3. **Repeat Sentence** (Similar to Academic)
4. **Describe Image** (Simpler, more everyday images)
5. **Respond to a Situation** (Listen to prompt -> Speak solution) [NEW]
6. **Answer Short Question** (Similar to Academic)
7. **Summarize Written Text** (Similar to Academic)
8. **Write Email** (Write an email based on prompt) [NEW]

### Part 2: Reading (Approx. 30 mins)

9. **Reading & Writing: Fill in the Blanks**
10. **Multiple Choice, Multiple Answer**
11. **Re-order Paragraphs**
12. **Reading: Fill in the Blanks**
13. **Multiple Choice, Single Answer**

### Part 3: Listening (Approx. 30 mins)

14. **Summarize Spoken Text**
15. **Multiple Choice, Multiple Answer**
16. **Fill in the Blanks**
17. **Multiple Choice, Single Answer**
18. **Select Missing Word**
19. **Highlight Incorrect Words**
20. **Write from Dictation**

---

## 3. Mock Test Implementation Strategy

### A. Database Requirements

We need a `mock_tests` table to define these templates (e.g. "Mock Test A - Academic") containing the ordered list of Question IDs.
We need a `test_attempts` table (already exists partially in types) to track the user's progress through this specific sequence.

### B. Frontend Logic

1.  **Strict Mode**: Users cannot pause (except optional break between Parts? Note: PTE Academic eliminated the scheduled break in 2021).
2.  **Timer**: Global part timer vs. Item timer.
    - **Speaking**: Item-level limit (e.g., 40s recording).
    - **Writing**: Item-level limit (e.g., 20m for Essay).
    - **Reading/Listening**: Section-level limits (overall time for the section), except Summarize Spoken Text (10m strict).
3.  **Resume Capability**: Save state after every question submission to allow resume if browser crashes (but timer logic might be tricky if we want to be strict).

### C. Scoring

We will use the `mode: 'mock'` flag in `scoring-agent.ts` implemented previously.
Final report must aggregate these scores into the Communicative Skills (Speaking, Listening, Reading, Writing).
