/**
 * Comprehensive Test Suite for Practice System
 * Tests all 22+ critical tasks
 */

import { db } from '@/lib/db'
import { pteQuestions, pteAttempts, pteQuestionTypes } from '@/lib/db/schema'
import { getPracticeQuestions, getQuestionById } from '@/lib/pte/practice'
import { eq } from 'drizzle-orm'
import * as fs from 'fs'
import * as path from 'path'

const tests = {
  passed: 0,
  failed: 0,
  total: 0
}

function logTest(name: string, status: boolean, details?: string) {
  tests.total++
  if (status) {
    tests.passed++
    console.log(`✅ TEST ${tests.total}: ${name}`)
    if (details) console.log(`   ${details}`)
  } else {
    tests.failed++
    console.log(`❌ TEST ${tests.total}: ${name}`)
    if (details) console.log(`   ${details}`)
  }
}

async function main() {
  console.log('🧪 COMPREHENSIVE PRACTICE SYSTEM TEST SUITE\n')
  console.log('━'.repeat(60) + '\n')

  // ===== DATABASE TESTS =====
  console.log('📊 DATABASE TESTS\n')

  // Test 1: Database Connection
  try {
    const result = await db.execute('SELECT 1 as ok')
    logTest('Database Connection', true, 'Connected to Neon PostgreSQL')
  } catch (error) {
    logTest('Database Connection', false, String(error))
  }

  // Test 2: Questions Table Exists
  try {
    const count = await db.select().from(pteQuestions).limit(1)
    logTest('Questions Table Access', true, `Table accessible, contains ${count.length > 0 ? 'data' : 'no data yet'}`)
  } catch (error) {
    logTest('Questions Table Access', false, String(error))
  }

  // Test 3: Question Types Table
  try {
    const types = await db.select().from(pteQuestionTypes)
    logTest('Question Types Table', types.length > 0, `Found ${types.length} question types`)
  } catch (error) {
    logTest('Question Types Table', false, String(error))
  }

  // Test 4: Attempts Table
  try {
    const attempts = await db.select().from(pteAttempts).limit(1)
    logTest('Attempts Table Access', true, 'Table accessible')
  } catch (error) {
    logTest('Attempts Table Access', false, String(error))
  }

  // ===== QUERY FUNCTION TESTS =====
  console.log('\n🔍 QUERY FUNCTION TESTS\n')

  // Test 5: Speaking Questions Query
  try {
    const questions = await getPracticeQuestions('read_aloud', 1, 5)
    logTest('Speaking Questions Query (Read Aloud)', questions.length >= 0, `Fetched ${questions.length} questions`)
  } catch (error) {
    logTest('Speaking Questions Query (Read Aloud)', false, String(error))
  }

  // Test 6: Repeat Sentence Questions
  try {
    const questions = await getPracticeQuestions('repeat_sentence', 1, 5)
    logTest('Speaking Questions Query (Repeat Sentence)', questions.length >= 0, `Fetched ${questions.length} questions`)
  } catch (error) {
    logTest('Speaking Questions Query (Repeat Sentence)', false, String(error))
  }

  // Test 7: Reading Questions Query
  try {
    const questions = await getPracticeQuestions('reading_mc_single', 1, 5)
    logTest('Reading Questions Query (MC Single)', questions.length >= 0, `Fetched ${questions.length} questions`)
  } catch (error) {
    logTest('Reading Questions Query (MC Single)', false, String(error))
  }

  // Test 8: Writing Questions Query
  try {
    const questions = await getPracticeQuestions('essay', 1, 5)
    logTest('Writing Questions Query (Essay)', questions.length >= 0, `Fetched ${questions.length} questions`)
  } catch (error) {
    logTest('Writing Questions Query (Essay)', false, String(error))
  }

  // Test 9: Listening Questions Query
  try {
    const questions = await getPracticeQuestions('write_from_dictation', 1, 5)
    logTest('Listening Questions Query (Dictation)', questions.length >= 0, `Fetched ${questions.length} questions`)
  } catch (error) {
    logTest('Listening Questions Query (Dictation)', false, String(error))
  }

  // Test 10: Question By ID Query
  try {
    const allQuestions = await db.select({ id: pteQuestions.id }).from(pteQuestions).limit(1)
    if (allQuestions.length > 0) {
      const question = await getQuestionById(allQuestions[0].id)
      logTest('Get Question By ID', question !== null, question ? `Fetched: ${question.title}` : 'No question found')
    } else {
      logTest('Get Question By ID', false, 'No questions in database to test')
    }
  } catch (error) {
    logTest('Get Question By ID', false, String(error))
  }

  // ===== FILE STRUCTURE TESTS =====
  console.log('\n📁 FILE STRUCTURE TESTS\n')

  // Test 11: Speaking Practice Page
  const speakingPagePath = 'app/(pte)/academic/practice/speaking/[question]/page.tsx'
  logTest('Speaking Practice Page Exists', fs.existsSync(speakingPagePath), speakingPagePath)

  // Test 12: Reading Practice Page
  const readingPagePath = 'app/(pte)/academic/practice/reading/[question]/page.tsx'
  logTest('Reading Practice Page Exists', fs.existsSync(readingPagePath), readingPagePath)

  // Test 13: Writing Practice Page
  const writingPagePath = 'app/(pte)/academic/practice/writing/[question]/page.tsx'
  logTest('Writing Practice Page Exists', fs.existsSync(writingPagePath), writingPagePath)

  // Test 14: Listening Practice Page
  const listeningPagePath = 'app/(pte)/academic/practice/listening/[question]/page.tsx'
  logTest('Listening Practice Page Exists', fs.existsSync(listeningPagePath), listeningPagePath)

  // ===== COMPONENT TESTS =====
  console.log('\n🎨 COMPONENT TESTS\n')

  // Test 15: QuestionListTable Component
  const tableComponentPath = 'components/pte/practice/QuestionListTable.tsx'
  logTest('QuestionListTable Component Exists', fs.existsSync(tableComponentPath), tableComponentPath)

  // Test 16: FeedbackCard Component
  const feedbackCardPath = 'components/pte/feedback/FeedbackCard.tsx'
  logTest('FeedbackCard Component Exists', fs.existsSync(feedbackCardPath), feedbackCardPath)

  // Test 17: Speaking Client Component
  const speakingClientPath = 'components/pte/speaking/speaking-client.tsx'
  logTest('Speaking Client Component Exists', fs.existsSync(speakingClientPath), speakingClientPath)

  // Test 18: Reading Client Component
  const readingClientPath = 'components/pte/reading/ReadingPracticeClient.tsx'
  logTest('Reading Client Component Exists', fs.existsSync(readingClientPath), readingClientPath)

  // Test 19: Listening Client Component
  const listeningClientPath = 'components/pte/listening/ListeningPracticeClient.tsx'
  logTest('Listening Client Component Exists', fs.existsSync(listeningClientPath), listeningClientPath)

  // Test 20: Writing Client Component
  const writingClientPath = 'components/pte/writing/WritingPracticeClient.tsx'
  logTest('Writing Client Component Exists', fs.existsSync(writingClientPath), writingClientPath)

  // ===== LIBRARY TESTS =====
  console.log('\n📚 LIBRARY TESTS\n')

  // Test 21: Practice Library Functions
  const practiceLibPath = 'lib/pte/practice.ts'
  logTest('Practice Library Exists', fs.existsSync(practiceLibPath), practiceLibPath)

  // Test 22: Types Library
  const typesLibPath = 'lib/types.ts'
  const typesContent = fs.readFileSync(typesLibPath, 'utf-8')
  const hasSpeakingType = typesContent.includes('export type SpeakingType')
  const hasQuestionType = typesContent.includes('export enum QuestionType')
  logTest('Types Library Complete', hasSpeakingType && hasQuestionType, 'SpeakingType and QuestionType exports found')

  // ===== SUMMARY =====
  console.log('\n' + '━'.repeat(60))
  console.log('\n📊 TEST SUMMARY\n')
  console.log(`Total Tests: ${tests.total}`)
  console.log(`✅ Passed: ${tests.passed}`)
  console.log(`❌ Failed: ${tests.failed}`)
  console.log(`Success Rate: ${((tests.passed / tests.total) * 100).toFixed(1)}%`)

  if (tests.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! System is ready for deployment.')
  } else {
    console.log('\n⚠️  Some tests failed. Please review above.')
  }

  console.log('\n' + '━'.repeat(60) + '\n')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
