
import { parseCSV, validateQuestionTypeRequirements } from '@/lib/utils/csv-parser';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { pteQuestionTypes } from '@/lib/db/schema';
import { db } from '@/lib/db';

// Helper to escape SQL strings
function escapeSql(val: string | null | undefined): string {
    if (val === null || val === undefined) return 'NULL';
    // If it's a JSON string, ensure it's properly escaped
    if (typeof val === 'object') {
        return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
    }
    return `'${String(val).replace(/'/g, "''")}'`;
}

function escapeJson(val: any): string {
    if (val === null || val === undefined) return 'NULL';
    return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
}

async function generateSqlFromCSV(csvPath: string, outputPath: string) {
    console.log(`[SQL Generator] Reading CSV: ${csvPath}`);

    if (!fs.existsSync(csvPath)) {
        console.error(`File not found: ${csvPath}`);
        process.exit(1);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const parseResult = await parseCSV(csvContent);

    if (!parseResult.success) {
        console.error('[SQL Generator] CSV Parse Failed');
        process.exit(1);
    }

    console.log(`[SQL Generator] Processing ${parseResult.data.length} records...`);

    // We need to fetch question types to map codes to UUIDs
    // Since this is a script, we can query the DB *once* or use hardcoded known IDs if the user prefers purely offline.
    // But reliable IDs need a lookup. I will query the DB here. 
    // If connection fails, I'll fallback to a warning or require a map file.
    // Assuming DB connection is available via 'db' import.

    let questionTypeMap = new Map<string, string>();
    try {
        const types = await db.select().from(pteQuestionTypes);
        types.forEach(t => questionTypeMap.set(t.code, t.id));
        console.log(`[SQL Generator] Loaded ${types.length} question types from DB.`);
    } catch (e) {
        console.error("[SQL Generator] Could not connect to DB to fetch question types. Ensure DB_URL is set or types are seeded.");
        console.error(e);
        // Fallback: We can't generate valid SQL foreign keys without known IDs. 
        // User said "USE SQL SCRIPT", they might imply seeding types via SQL too?
        // Assuming types exist. I will fail if I can't look them up, 
        // because blind UUIDs won't match foreign keys in `pte_questions`.
        process.exit(1);
    }

    const sqlStatements: string[] = [];
    sqlStatements.push(`-- Generated SQL Seed file for PTE Questions`);
    sqlStatements.push(`-- Source: ${csvPath}`);
    sqlStatements.push(`-- Generated at: ${new Date().toISOString()}`);
    sqlStatements.push(`BEGIN;`);

    // Categorize questions
    const speakingTypes = ['read_aloud', 'repeat_sentence', 'describe_image', 'retell_lecture', 'answer_short_question', 'respond_to_situation', 'summarize_group_discussion'];
    const writingTypes = ['summarize_written_text', 'essay', 'email'];
    const readingTypes = ['reading_fill_blanks_dropdown', 'reading_mc_multiple', 'reorder_paragraphs', 'reading_fill_blanks_drag', 'reading_mc_single'];
    const listeningTypes = ['summarize_spoken_text', 'listening_mc_multiple', 'listening_fill_blanks', 'highlight_correct_summary', 'listening_mc_single', 'select_missing_word', 'highlight_incorrect_words', 'write_from_dictation'];

    for (const row of parseResult.data) {
        const typeId = questionTypeMap.get(row.questionType);
        if (!typeId) {
            console.warn(`[Warning] Unknown or unseeded question type: ${row.questionType}. Skipping.`);
            continue;
        }

        const errors = validateQuestionTypeRequirements(row);
        if (errors.length > 0) {
            console.warn(`[Warning] Validation failed for "${row.title}": ${errors.join(', ')}. Skipping.`);
            continue;
        }

        const qId = uuidv4();

        // Main Question Insert
        // pte_questions columns: id, question_type_id, title, content, audio_url, image_url, difficulty, is_premium, tags, correct_answer, sample_answer, scoring_rubric, metadata, is_active...

        const mainInsert = `
INSERT INTO pte_questions (
    id, question_type_id, title, content, audio_url, image_url, 
    difficulty, is_premium, tags, correct_answer, sample_answer, 
    scoring_rubric, metadata, is_active
) VALUES (
    '${qId}', '${typeId}', ${escapeSql(row.title)}, ${escapeSql(row.content)}, ${escapeSql(row.audioUrl)}, ${escapeSql(row.imageUrl)},
    ${escapeSql(row.difficulty)}, ${row.isPremium || false}, ${escapeJson(row.tags)}, ${escapeJson(row.correctAnswer)}, ${escapeSql(row.sampleAnswer)},
    ${escapeJson(row.scoringRubric)}, ${escapeJson(row.metadata)}, true
) ON CONFLICT (id) DO NOTHING;`; // Using ID as conflict target isn't perfect for "Update" logic but good for seeding. 
        // User might want simple inserts.

        sqlStatements.push(mainInsert);

        // Sub-table Inserts
        if (speakingTypes.includes(row.questionType)) {
            sqlStatements.push(`
INSERT INTO pte_speaking_questions (
    question_id, audio_prompt_url, expected_duration, sample_transcript, key_points
) VALUES (
    '${qId}', ${escapeSql(row.audioPromptUrl)}, ${row.expectedDuration || 'NULL'}, ${escapeSql(row.sampleTranscript)}, ${escapeJson(row.keyPoints)}
);`);
        }
        else if (writingTypes.includes(row.questionType)) {
            sqlStatements.push(`
INSERT INTO pte_writing_questions (
    question_id, prompt_text, passage_text, word_count_min, word_count_max, essay_type, key_themes
) VALUES (
    '${qId}', ${escapeSql(row.promptText || row.content || '')}, ${escapeSql(row.passageText)}, ${row.wordCountMin || 0}, ${row.wordCountMax || 0}, ${escapeSql(row.essayType)}, ${escapeJson(row.keyThemes)}
);`);
        }
        else if (readingTypes.includes(row.questionType)) {
            sqlStatements.push(`
INSERT INTO pte_reading_questions (
    question_id, passage_text, question_text, options, correct_answer_positions, explanation
) VALUES (
    '${qId}', ${escapeSql(row.passageText || row.content || '')}, ${escapeSql(row.questionText)}, ${escapeJson(row.options)}, ${escapeJson(row.correctAnswerPositions)}, ${escapeSql(row.explanation)}
);`);
        }
        else if (listeningTypes.includes(row.questionType)) {
            sqlStatements.push(`
INSERT INTO pte_listening_questions (
    question_id, audio_file_url, audio_duration, transcript, question_text, options, correct_answer_positions
) VALUES (
    '${qId}', ${escapeSql(row.audioFileUrl || '')}, ${row.audioDuration || 'NULL'}, ${escapeSql(row.transcript)}, ${escapeSql(row.questionText)}, ${escapeJson(row.options)}, ${escapeJson(row.correctAnswerPositions)}
);`);
        }
    }

    sqlStatements.push(`COMMIT;`);

    fs.writeFileSync(outputPath, sqlStatements.join('\n'));
    console.log(`[SQL Generator] SQL file generated at: ${outputPath}`);
    process.exit(0);
}

const args = process.argv.slice(2);
if (args.length < 2) {
    console.log("Usage: tsx scripts/generate-sql-from-csv.ts <input_csv> <output_sql>");
    process.exit(1);
}

generateSqlFromCSV(args[0], args[1]);
