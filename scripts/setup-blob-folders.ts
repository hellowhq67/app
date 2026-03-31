/**
 * Setup Vercel Blob Folder Structure
 * Uploads placeholder README files to create organized folder structure.
 * Run: pnpm blob:setup
 */
import 'dotenv/config'
import { put } from '@vercel/blob'

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

if (!BLOB_TOKEN) {
  console.error('❌ BLOB_READ_WRITE_TOKEN is not set')
  process.exit(1)
}

const folders = [
  // Speaking audio
  'audio/speaking/read-aloud',
  'audio/speaking/repeat-sentence',
  'audio/speaking/describe-image',
  'audio/speaking/retell-lecture',
  'audio/speaking/answer-short-question',
  'audio/speaking/respond-to-situation',
  'audio/speaking/summarize-group-discussion',

  // Listening audio
  'audio/listening/summarize-spoken-text',
  'audio/listening/mc-multiple',
  'audio/listening/fill-in-blanks',
  'audio/listening/highlight-correct-summary',
  'audio/listening/mc-single',
  'audio/listening/select-missing-word',
  'audio/listening/highlight-incorrect-words',
  'audio/listening/write-from-dictation',

  // Images for describe image questions
  'images/speaking/describe-image',

  // Processed/scored audio uploads from users
  'uploads/speaking/read-aloud',
  'uploads/speaking/repeat-sentence',
  'uploads/speaking/describe-image',
  'uploads/speaking/retell-lecture',
  'uploads/speaking/answer-short-question',
]

const PLACEHOLDER_CONTENT = (folder: string) =>
  `This folder contains PTE ${folder} files.\nCreated by setup-blob-folders script.`

async function setupBlobFolders() {
  console.log('📦 Setting up Vercel Blob folder structure...')
  console.log(`   Token: ${BLOB_TOKEN?.substring(0, 20)}...`)
  console.log()

  let created = 0
  let failed = 0

  for (const folder of folders) {
    const path = `${folder}/placeholder.txt`
    try {
      const result = await put(path, PLACEHOLDER_CONTENT(folder), {
        access: 'public',
        token: BLOB_TOKEN,
        addRandomSuffix: false,
      })
      console.log(`✅ ${path}`)
      console.log(`   → ${result.url}`)
      created++
    } catch (err: any) {
      console.error(`❌ Failed: ${path} — ${err.message}`)
      failed++
    }
  }

  console.log()
  console.log(`📊 Summary: ${created} created, ${failed} failed`)
  console.log()
  console.log('🗂️  Folder structure created:')
  console.log('   audio/')
  console.log('   ├── speaking/ (read-aloud, repeat-sentence, describe-image, retell-lecture, answer-short-question, respond-to-situation, summarize-group-discussion)')
  console.log('   └── listening/ (summarize-spoken-text, mc-multiple, fill-in-blanks, highlight-correct-summary, mc-single, select-missing-word, highlight-incorrect-words, write-from-dictation)')
  console.log('   images/')
  console.log('   └── speaking/describe-image/')
  console.log('   uploads/')
  console.log('   └── speaking/ (all speaking types)')
}

setupBlobFolders()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Blob setup failed:', err)
    process.exit(1)
  })
