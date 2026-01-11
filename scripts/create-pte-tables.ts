import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const sql = neon(process.env.DATABASE_URL);

async function createPteTables() {
  try {
    console.log('🚀 Creating PTE tables...');
    
    // Create PTE Categories Table
    await sql`
      CREATE TABLE IF NOT EXISTS pte_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        display_order INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Created pte_categories table');

    // Create PTE Question Types Table
    await sql`
      CREATE TABLE IF NOT EXISTS pte_question_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        category_id UUID NOT NULL REFERENCES pte_categories(id) ON DELETE CASCADE,
        description TEXT,
        has_ai_scoring BOOLEAN DEFAULT false NOT NULL,
        max_score INTEGER NOT NULL,
        scoring_criteria JSONB,
        time_limit INTEGER,
        preparation_time INTEGER,
        word_count_min INTEGER,
        word_count_max INTEGER,
        display_order INTEGER NOT NULL,
        instructions TEXT,
        sample_question_url TEXT,
        is_active BOOLEAN DEFAULT true NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Created pte_question_types table');

    // Create PTE Questions Table
    await sql`
      CREATE TABLE IF NOT EXISTS pte_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question_type_id UUID NOT NULL REFERENCES pte_question_types(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT,
        audio_url TEXT,
        image_url TEXT,
        difficulty TEXT DEFAULT 'Medium' NOT NULL,
        tags JSONB,
        correct_answer JSONB,
        sample_answer TEXT,
        scoring_rubric JSONB,
        is_active BOOLEAN DEFAULT true NOT NULL,
        is_premium BOOLEAN DEFAULT false NOT NULL,
        usage_count INTEGER DEFAULT 0 NOT NULL,
        average_score INTEGER,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Created pte_questions table');

    // Create PTE Speaking Questions Table
    await sql`
      CREATE TABLE IF NOT EXISTS pte_speaking_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question_id UUID NOT NULL REFERENCES pte_questions(id) ON DELETE CASCADE UNIQUE,
        audio_prompt_url TEXT,
        expected_duration INTEGER,
        sample_transcript TEXT,
        key_points JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Created pte_speaking_questions table');

    // Create PTE Writing Questions Table
    await sql`
      CREATE TABLE IF NOT EXISTS pte_writing_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question_id UUID NOT NULL REFERENCES pte_questions(id) ON DELETE CASCADE UNIQUE,
        prompt_text TEXT NOT NULL,
        passage_text TEXT,
        word_count_min INTEGER NOT NULL,
        word_count_max INTEGER NOT NULL,
        essay_type TEXT,
        key_themes JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Created pte_writing_questions table');

    // Create PTE Reading Questions Table
    await sql`
      CREATE TABLE IF NOT EXISTS pte_reading_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question_id UUID NOT NULL REFERENCES pte_questions(id) ON DELETE CASCADE UNIQUE,
        passage_text TEXT NOT NULL,
        question_text TEXT,
        options JSONB,
        correct_answer_positions JSONB,
        explanation TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Created pte_reading_questions table');

    // Create PTE Listening Questions Table
    await sql`
      CREATE TABLE IF NOT EXISTS pte_listening_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question_id UUID NOT NULL REFERENCES pte_questions(id) ON DELETE CASCADE UNIQUE,
        audio_file_url TEXT NOT NULL,
        audio_duration INTEGER,
        transcript TEXT,
        question_text TEXT,
        options JSONB,
        correct_answer_positions JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Created pte_listening_questions table');

    console.log('🎉 All PTE tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

createPteTables();