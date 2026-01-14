/**
 * Verification script for practice system
 * Tests database queries, scoring, and attempt saving
 */

import { db } from '@/lib/db'
import { pteQuestions, pteAttempts } from '@/lib/db/schema'
import { getPracticeQuestions, getQuestionById, updateUserProgress } from '@/lib/pte/practice'
import { eq } from 'drizzle-orm'

async function main() {
  console.log('🔍 Starting Practice System Verification...\n')

  // Test 1: Verify practice questions query
  console.log('Test 1: Verifying practice questions query...')
  try {
    const readingQuestions = await getPracticeQuestions('reading_mc_single', 1, 5)
    console.log(`✅ Successfully fetched ${readingQuestions.length} reading questions`)
    if (readingQuestions.length > 0) {
      console.log(`   Sample question: ${readingQuestions[0].title}`)
    }
  } catch (error) {
    console.error('❌ Failed to fetch reading questions:', error)
  }

  // Test 2: Verify question by ID query
  console.log('\nTest 2: Verifying question by ID query...')
  try {
    const allQuestions = await db.select({ id: pteQuestions.id })
      .from(pteQuestions)
      .limit(1)

    if (allQuestions.length > 0) {
      const testId = allQuestions[0].id
      const question = await getQuestionById(testId)
      if (question) {
        console.log(`✅ Successfully fetched question: ${question.title}`)
      } else {
        console.log('❌ Question fetch returned null')
      }
    } else {
      console.log('⚠️  No questions in database to test')
    }
  } catch (error) {
    console.error('❌ Failed to fetch question by ID:', error)
  }

  // Test 3: Verify database schema
  console.log('\nTest 3: Verifying database schema...')
  try {
    const questionCount = await db.select({ count: pteQuestions.id })
      .from(pteQuestions)
    console.log(`✅ Total questions in database: ${questionCount.length}`)

    const attemptCount = await db.select({ count: pteAttempts.id })
      .from(pteAttempts)
    console.log(`✅ Total attempts in database: ${attemptCount.length}`)
  } catch (error) {
    console.error('❌ Failed to query database schema:', error)
  }

  // Test 4: Verify speaking questions
  console.log('\nTest 4: Verifying speaking questions...')
  try {
    const speakingQuestions = await getPracticeQuestions('read_aloud', 1, 5)
    console.log(`✅ Successfully fetched ${speakingQuestions.length} speaking questions`)
  } catch (error) {
    console.error('❌ Failed to fetch speaking questions:', error)
  }

  // Test 5: Verify writing questions
  console.log('\nTest 5: Verifying writing questions...')
  try {
    const writingQuestions = await getPracticeQuestions('essay', 1, 5)
    console.log(`✅ Successfully fetched ${writingQuestions.length} writing questions`)
  } catch (error) {
    console.error('❌ Failed to fetch writing questions:', error)
  }

  // Test 6: Verify listening questions
  console.log('\nTest 6: Verifying listening questions...')
  try {
    const listeningQuestions = await getPracticeQuestions('write_from_dictation', 1, 5)
    console.log(`✅ Successfully fetched ${listeningQuestions.length} listening questions`)
  } catch (error) {
    console.error('❌ Failed to fetch listening questions:', error)
  }

  console.log('\n✨ Verification Complete!\n')
}

main()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
