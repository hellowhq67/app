/**
 * PTE Scoring Math - Deterministic & Auditable
 */

export const SCORING_CONSTANTS = {
  LOGISTIC_K: 6.5,
  LOGISTIC_M: 0.58,
  MIN_SCORE: 10,
  MAX_SCORE: 90,
  SCORE_RANGE: 80, // 90 - 10
};

// Error margins based on CEFR levels
export const MEASUREMENT_ERROR = {
  A2: 3.1, // < 43
  B1: 2.8, // 43 - 58
  B2: 3.2, // 59 - 75
  C1: 4.0, // 76 - 84
  C2: 4.5, // > 84
};

/**
 * Normalizes a raw skill score (sum of task contributions) to 0-1 range.
 */
export function normalizeScore(
  rawScore: number,
  maxPossibleScore: number
): number {
  if (maxPossibleScore === 0) return 0;
  return Math.min(1, Math.max(0, rawScore / maxPossibleScore));
}

/**
 * Applies the PTE Logistic Curve to map normalized (0-1) score to 10-90 scale.
 * Formula: 10 + 80 * (1 / (1 + e^(-k * (x - m))))
 */
export function applyLogisticMapping(normalizedScore: number): number {
  const { LOGISTIC_K, LOGISTIC_M, MIN_SCORE, SCORE_RANGE } = SCORING_CONSTANTS;

  const exponent = -LOGISTIC_K * (normalizedScore - LOGISTIC_M);
  const logisticValue = 1 / (1 + Math.exp(exponent));

  // Calculate base score
  let pteScore = MIN_SCORE + SCORE_RANGE * logisticValue;

  return Math.round(pteScore);
}

/**
 * Injects measurement error based on the estimated CEFR band.
 * Returns a score range [min, max].
 */
export function calculateConfidenceRange(score: number): [number, number] {
  let errorMargin = 3.0; // Default

  if (score < 43) errorMargin = MEASUREMENT_ERROR.A2;
  else if (score < 59) errorMargin = MEASUREMENT_ERROR.B1;
  else if (score < 76) errorMargin = MEASUREMENT_ERROR.B2;
  else if (score < 85) errorMargin = MEASUREMENT_ERROR.C1;
  else errorMargin = MEASUREMENT_ERROR.C2;

  const min = Math.max(10, Math.round(score - errorMargin));
  const max = Math.min(90, Math.round(score + errorMargin));

  return [min, max];
}
