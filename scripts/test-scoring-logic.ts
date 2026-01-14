/**
 * Comprehensive Scoring Logic Test
 * Tests all question types with their respective scoring methods
 */

import { QuestionType } from '@/lib/types';
import {
  scoreMCQSingle,
  scoreMCQMultiple,
  scoreReorderParagraphs,
  scoreFillBlanks,
  scoreWriteFromDictation,
  scoreHighlightIncorrectWords,
  scoreDeterministic,
  toAIFeedbackData
} from '@/lib/ai/deterministic-scoring';

// Test counters
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
};

function logTest(name: string, passed: boolean, details?: string) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}`);
  }
  if (details) {
    console.log(`   ${details}`);
  }
}

function printSeparator(title: string) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${title}`);
  console.log('='.repeat(60) + '\n');
}

async function main() {
  console.log('\n🧪 COMPREHENSIVE SCORING LOGIC TEST\n');

  // ===== READING TESTS (Deterministic) =====
  printSeparator('READING QUESTIONS - Deterministic Scoring');

  // Test 1: MCQ Single
  console.log('Test 1: Multiple Choice Single Answer');
  const mcqSingleResult = scoreMCQSingle('Option B', 'Option B');
  logTest(
    'MCQ Single - Correct Answer',
    mcqSingleResult.score === 90 && mcqSingleResult.correct === 1,
    `Score: ${mcqSingleResult.score}/90, Feedback: ${mcqSingleResult.feedback}`
  );

  const mcqSingleWrong = scoreMCQSingle('Option A', 'Option B');
  logTest(
    'MCQ Single - Wrong Answer',
    mcqSingleWrong.score === 10 && mcqSingleWrong.correct === 0,
    `Score: ${mcqSingleWrong.score}/90, Feedback: ${mcqSingleWrong.feedback}`
  );

  // Test 2: MCQ Multiple
  console.log('\nTest 2: Multiple Choice Multiple Answers');
  const mcqMultipleResult = scoreMCQMultiple(
    ['Option A', 'Option C'],
    ['Option A', 'Option C']
  );
  logTest(
    'MCQ Multiple - All Correct',
    mcqMultipleResult.score === 90 && mcqMultipleResult.correct === 2,
    `Score: ${mcqMultipleResult.score}/90, Correct: ${mcqMultipleResult.correct}/2`
  );

  const mcqMultiplePartial = scoreMCQMultiple(
    ['Option A', 'Option B'],
    ['Option A', 'Option C']
  );
  logTest(
    'MCQ Multiple - Partial Credit',
    mcqMultiplePartial.score > 10 && mcqMultiplePartial.correct === 1,
    `Score: ${mcqMultiplePartial.score}/90, Correct: ${mcqMultiplePartial.correct}/2`
  );

  // Test 3: Reorder Paragraphs
  console.log('\nTest 3: Reorder Paragraphs');
  const reorderResult = scoreReorderParagraphs(
    ['Para B', 'Para A', 'Para C', 'Para D'],
    ['Para B', 'Para A', 'Para C', 'Para D']
  );
  logTest(
    'Reorder - Perfect Order',
    reorderResult.score === 90 && reorderResult.correct === 3,
    `Score: ${reorderResult.score}/90, Correct Pairs: ${reorderResult.correct}/3`
  );

  const reorderPartial = scoreReorderParagraphs(
    ['Para A', 'Para B', 'Para C', 'Para D'],
    ['Para B', 'Para A', 'Para C', 'Para D']
  );
  logTest(
    'Reorder - Some Correct Pairs',
    reorderPartial.score < 90,
    `Score: ${reorderPartial.score}/90, Correct Pairs: ${reorderPartial.correct}/3`
  );

  // Test 4: Fill in Blanks
  console.log('\nTest 4: Fill in the Blanks');
  const fillBlanksResult = scoreFillBlanks(
    { blank1: 'correct', blank2: 'answer', blank3: 'here' },
    { blank1: 'correct', blank2: 'answer', blank3: 'here' }
  );
  logTest(
    'Fill Blanks - All Correct',
    fillBlanksResult.score === 90 && fillBlanksResult.correct === 3,
    `Score: ${fillBlanksResult.score}/90, Correct: ${fillBlanksResult.correct}/3`
  );

  const fillBlanksPartial = scoreFillBlanks(
    { blank1: 'correct', blank2: 'wrong', blank3: 'here' },
    { blank1: 'correct', blank2: 'answer', blank3: 'here' }
  );
  logTest(
    'Fill Blanks - Partial Credit',
    fillBlanksPartial.correct === 2 && fillBlanksPartial.total === 3,
    `Score: ${fillBlanksPartial.score}/90, Correct: ${fillBlanksPartial.correct}/3`
  );

  // ===== LISTENING TESTS =====
  printSeparator('LISTENING QUESTIONS - Mixed Scoring');

  // Test 5: Write from Dictation
  console.log('Test 5: Write from Dictation (Deterministic)');
  const dictationResult = scoreWriteFromDictation(
    'The quick brown fox jumps over the lazy dog',
    'The quick brown fox jumps over the lazy dog'
  );
  logTest(
    'Dictation - Perfect Transcription',
    dictationResult.score === 90 && dictationResult.correct === 9,
    `Score: ${dictationResult.score}/90, Words Correct: ${dictationResult.correct}/9`
  );

  const dictationPartial = scoreWriteFromDictation(
    'The quick brown fox jumps',
    'The quick brown fox jumps over the lazy dog'
  );
  logTest(
    'Dictation - Partial Transcription',
    dictationPartial.correct < 9,
    `Score: ${dictationPartial.score}/90, Words Correct: ${dictationPartial.correct}/9`
  );

  // Test 6: Highlight Incorrect Words
  console.log('\nTest 6: Highlight Incorrect Words (Deterministic)');
  const highlightResult = scoreHighlightIncorrectWords(
    ['wrong1', 'wrong2'],
    ['wrong1', 'wrong2']
  );
  logTest(
    'Highlight - All Correct',
    highlightResult.score === 90 && highlightResult.correct === 2,
    `Score: ${highlightResult.score}/90, Correct: ${highlightResult.correct}/2`
  );

  // Test 7: Listening MCQ Single (Deterministic)
  console.log('\nTest 7: Listening MCQ Single (Deterministic)');
  const listeningMCQResult = scoreDeterministic(
    QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE,
    { selectedOption: 'Option B' },
    { correctOption: 'Option B' }
  );
  logTest(
    'Listening MCQ Single - Correct',
    listeningMCQResult?.overallScore === 90,
    `Score: ${listeningMCQResult?.overallScore}/90`
  );

  // Test 8: Listening Fill Blanks (Deterministic)
  console.log('\nTest 8: Listening Fill Blanks (Deterministic)');
  const listeningFillResult = scoreDeterministic(
    QuestionType.LISTENING_BLANKS,
    { filledBlanks: { blank1: 'word1', blank2: 'word2' } },
    { correctBlanks: { blank1: 'word1', blank2: 'word2' } }
  );
  logTest(
    'Listening Fill Blanks - All Correct',
    listeningFillResult?.overallScore === 90,
    `Score: ${listeningFillResult?.overallScore}/90`
  );

  // ===== CONVERSION TEST =====
  printSeparator('AIFeedbackData Conversion Test');

  console.log('Test 9: Convert Deterministic Result to AIFeedbackData');
  const sampleResult = scoreMCQSingle('Option A', 'Option A');
  const feedbackData = toAIFeedbackData(sampleResult, QuestionType.MULTIPLE_CHOICE_SINGLE);
  logTest(
    'Conversion - Structure Valid',
    feedbackData.overallScore === 90 &&
    feedbackData.suggestions.length > 0 &&
    feedbackData.scoringMetrics?.confidence === 100,
    `Score: ${feedbackData.overallScore}, Confidence: ${feedbackData.scoringMetrics?.confidence}%`
  );

  // ===== SCORING TYPE SUMMARY =====
  printSeparator('SCORING TYPES SUMMARY');

  console.log('✅ AI SCORING (Speaking & Writing):');
  console.log('   - Read Aloud');
  console.log('   - Repeat Sentence');
  console.log('   - Describe Image');
  console.log('   - Re-tell Lecture');
  console.log('   - Answer Short Question');
  console.log('   - Respond to Situation');
  console.log('   - Summarize Group Discussion');
  console.log('   - Summarize Written Text');
  console.log('   - Write Essay');
  console.log('   - Summarize Spoken Text (Listening)');

  console.log('\n✅ DETERMINISTIC SCORING (Reading & Most Listening):');
  console.log('   📖 Reading:');
  console.log('      - Multiple Choice Single');
  console.log('      - Multiple Choice Multiple');
  console.log('      - Reorder Paragraphs');
  console.log('      - Reading Fill Blanks (Drag)');
  console.log('      - Reading Fill Blanks (Dropdown)');
  console.log('   🎧 Listening:');
  console.log('      - Listening MCQ Single');
  console.log('      - Listening MCQ Multiple');
  console.log('      - Listening Fill Blanks');
  console.log('      - Highlight Correct Summary');
  console.log('      - Select Missing Word');
  console.log('      - Highlight Incorrect Words');
  console.log('      - Write from Dictation');

  // ===== FINAL SUMMARY =====
  printSeparator('TEST RESULTS');

  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Scoring logic is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review above.');
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

main()
  .then(() => {
    console.log('✨ Test suite completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
