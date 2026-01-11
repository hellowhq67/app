import { normalizeScore, applyLogisticMapping } from "./math";
import { PTE_CONTRIBUTION_MATRIX, SECTION_IMPORTANCE } from "./config";
import { TaskScore, SkillName, ScoringResult } from "./types";
import { QuestionType } from "@/lib/types";

/**
 * Aggregates raw scores from all attempts into communicative skills using the matrix.
 */
export function aggregateSkillScores(
  attempts: { questionType: QuestionType; aiFeedback: any }[],
  maxPossibleScores: Record<QuestionType, number> // Max raw points per question type
): ScoringResult {
  // 1. Initialize Accumulators
  const rawSkills: Record<SkillName, number> = {
    speaking: 0,
    writing: 0,
    reading: 0,
    listening: 0,
  };
  const maxSkills: Record<SkillName, number> = {
    speaking: 0,
    writing: 0,
    reading: 0,
    listening: 0,
  };

  // 2. Iterate Attempts
  attempts.forEach((attempt) => {
    const type = attempt.questionType;
    const matrix = PTE_CONTRIBUTION_MATRIX[type];

    if (!matrix) {
      console.warn(`No contribution matrix for ${type}`);
      return;
    }

    // Extract "Task Score" (raw 0-1 or points)
    // Note: aiFeedback might be complex. We assume it has a normalized 0-1 score or points.
    // For simplicity here, we assume aiFeedback.overallScore is on a 0-90 scale or similar points.
    // We need to normalize it to 0-1 for the matrix multiplication.
    // Let's assume aiFeedback.overallScore is the "points" earned.

    const earnedPoints = attempt.aiFeedback?.overallScore || 0; // Raw points
    const maxPoints = maxPossibleScores[type] || 90; // Fallback max

    // Add to Skills
    (Object.keys(matrix) as SkillName[]).forEach((skill) => {
      const weight = matrix[skill];
      if (weight > 0) {
        rawSkills[skill] += earnedPoints * weight;
        maxSkills[skill] += maxPoints * weight;
      }
    });
  });

  // 3. Normalize & Map
  const skillScores: Record<SkillName, number> = {
    speaking: 0,
    writing: 0,
    reading: 0,
    listening: 0,
  };

  (Object.keys(rawSkills) as SkillName[]).forEach((skill) => {
    const raw = rawSkills[skill];
    const max = maxSkills[skill];

    const normalized = normalizeScore(raw, max);
    const mapped = applyLogisticMapping(normalized);

    skillScores[skill] = mapped;
  });

  // 4. Detailed Scores (Enabling Skills - Placeholder/Simplification)
  // PTE enabling skills are derived from specific traits.
  // For now, we focus on Communicative Skills as per requirement.

  // 5. Calculate Overall Score (Task Weighted)
  // Implementation Note: The plan says "Overall is task-weighted".
  // A simplified robust approach is averaging the Communicative Skills with section importance.

  let overallSum = 0;

  overallSum += skillScores.speaking * SECTION_IMPORTANCE.SPEAKING;
  overallSum += skillScores.writing * SECTION_IMPORTANCE.WRITING;
  overallSum += skillScores.reading * SECTION_IMPORTANCE.READING;
  overallSum += skillScores.listening * SECTION_IMPORTANCE.LISTENING;

  return {
    overallScore: Math.round(overallSum),
    communicativeSkills: skillScores,
  };
}
