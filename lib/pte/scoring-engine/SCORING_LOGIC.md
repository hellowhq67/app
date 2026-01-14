# PTE Mock Test Scoring Engine

## Overview

The PTE Mock Test Scoring Engine is a comprehensive system designed to replicate the official PTE Academic scoring algorithms. It evaluates user attempts across 20 distinct question types and aggregates them into Communicative Skills (Speaking, Writing, Reading, Listening) and an Overall Score.

## Core Components

### 1. Mathematical Model

The engine uses a non-linear Logistic Curve to map normalized scores to the PTE 10-90 scale. This ensures that the scoring distribution matches the difficulty curve of the actual exam.

**Formula:**
\[ Score = 10 + 80 \times \left( \frac{1}{1 + e^{-k \times (x - m)}} \right) \]

- **k (Steepness):** 6.5
- **m (Midpoint):** 0.58
- **x:** Normalized Raw Score (0.0 - 1.0)

This implies that a raw proficiency of 58% yields a score of ~50.

### 2. Cross-Skill Contribution Matrix

PTE uses an "integrated skills" scoring model where a single task contributes to multiple skills. This engine implements a precise contribution matrix defined in `config.ts`.

**Example Contributions:**

- **Read Aloud:** 50% Speaking, 50% Reading
- **Repeat Sentence:** 50% Speaking, 50% Listening
- **Summarize Written Text:** 50% Writing, 50% Reading
- **Write from Dictation:** 50% Listening, 50% Writing

### 3. Aggregation Logic (`pipeline.ts` & `aggregator.ts`)

The pipeline runs the following steps upon test completion:

1.  **Fetch Attempts:** Retrieves all user answers and AI feedback for the test session.
2.  **Normalization:** Converts raw points (from AI agent) to a normalized skill contribution based on the max possible score for that question type.
3.  **Aggregation:** Sums the weighted contributions for each skill.
4.  **Mapping:** Applies the logistic curve to the aggregated skill scores.
5.  **Overall Score:** Calculates the final score based on a weighted average of the four communicative skills.

## Configuration

Calibration weights and matrix definitions are located in `lib/pte/scoring-engine/config.ts`.
Mathematical constants are in `lib/pte/scoring-engine/math.ts`.

## Usage

The scoring pipeline is automatically triggered via `runMockTestScoringPipeline(testId)` when a mock test is submitted.
