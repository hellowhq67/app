import { normalizeScore, applyLogisticMapping, calculateConfidenceRange, SCORING_CONSTANTS } from '../lib/pte/scoring-engine/math';

console.log('--- PTE Scoring Math Verification ---');
console.log(`Parameters: K=${SCORING_CONSTANTS.LOGISTIC_K}, M=${SCORING_CONSTANTS.LOGISTIC_M}`);

const testNormalizedScores = [0, 0.2, 0.4, 0.5, 0.58, 0.6, 0.8, 1.0];

testNormalizedScores.forEach(norm => {
    const score = applyLogisticMapping(norm);
    const range = calculateConfidenceRange(score);
    console.log(`Normalized: ${norm.toFixed(2)} -> Score: ${score} -> Range: [${range[0]}, ${range[1]}]`);
});

console.log('\n--- Normalization Test ---');
console.log(`Raw: 45, Max: 90 -> Norm: ${normalizeScore(45, 90)}`);
console.log(`Raw: 90, Max: 90 -> Norm: ${normalizeScore(90, 90)}`);
console.log(`Raw: 100, Max: 90 -> Norm: ${normalizeScore(100, 90)} (Should clip to 1)`);
