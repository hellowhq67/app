
import { db } from '@/lib/db';
import { pteQuestions, pteSpeakingQuestions, pteWritingQuestions, pteReadingQuestions, pteListeningQuestions, pteQuestionTypes } from '@/lib/db/schema';
import { parseCSV, validateQuestionTypeRequirements, type CSVRow } from '@/lib/utils/csv-parser';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function seedFromCSV(filePath: string) {
    console.log(`[Seed] Starting CSV seed from file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    const csvContent = fs.readFileSync(filePath, 'utf-8');

    // Parse CSV
    console.log('[Seed] Parsing CSV...');
    const parseResult = await parseCSV(csvContent);

    if (!parseResult.success) {
        console.error('[Seed] CSV Parsing Failed:');
        parseResult.errors.forEach(err => {
            console.error(`  - Row ${err.row}: ${err.errors.join(', ')}`);
        });
        process.exit(1);
    }

    console.log(`[Seed] Parsed ${parseResult.data.length} records. Processing...`);

    // Get question type IDs mapping
    const questionTypes = await db.select().from(pteQuestionTypes);
    const questionTypeMap = new Map(questionTypes.map(qt => [qt.code, qt.id]));

    let inserted = 0;
    let updated = 0;
    let failed = 0;
    const processingErrors: { row: number; title: string; errors: string[] }[] = [];

    // Determine categories
    const speakingTypes = ['read_aloud', 'repeat_sentence', 'describe_image', 'retell_lecture', 'answer_short_question', 'respond_to_situation', 'summarize_group_discussion'];
    const writingTypes = ['summarize_written_text', 'essay', 'email'];
    const readingTypes = ['reading_fill_blanks_dropdown', 'reading_mc_multiple', 'reorder_paragraphs', 'reading_fill_blanks_drag', 'reading_mc_single'];
    const listeningTypes = ['summarize_spoken_text', 'listening_mc_multiple', 'listening_fill_blanks', 'highlight_correct_summary', 'listening_mc_single', 'select_missing_word', 'highlight_incorrect_words', 'write_from_dictation'];

    for (let i = 0; i < parseResult.data.length; i++) {
        const row = parseResult.data[i];
        const rowNumber = i + 2;

        try {
            // Validate question type
            const validationErrors = validateQuestionTypeRequirements(row);
            if (validationErrors.length > 0) {
                throw new Error(validationErrors.join(', '));
            }

            const questionTypeId = questionTypeMap.get(row.questionType);
            if (!questionTypeId) {
                throw new Error(`Unknown question type: ${row.questionType}`);
            }

            await db.transaction(async (tx) => {
                // Main question data
                const questionData = {
                    questionTypeId,
                    title: row.title,
                    content: row.content || null,
                    audioUrl: row.audioUrl || null,
                    imageUrl: row.imageUrl || null,
                    difficulty: row.difficulty,
                    isPremium: row.isPremium || false,
                    tags: row.tags || null,
                    correctAnswer: row.correctAnswer || null,
                    sampleAnswer: row.sampleAnswer || null,
                    scoringRubric: row.scoringRubric || null,
                    metadata: row.metadata || null,
                    isActive: true,
                };

                // Upsert Main Question
                const existingQuestion = await tx
                    .select()
                    .from(pteQuestions)
                    .where(eq(pteQuestions.title, row.title)) // Match strictly on title for seeding
                    .limit(1);

                let questionId: string;
                let isUpdate = false;

                if (existingQuestion.length > 0) {
                    questionId = existingQuestion[0].id;
                    await tx
                        .update(pteQuestions)
                        .set(questionData)
                        .where(eq(pteQuestions.id, questionId));
                    isUpdate = true;
                } else {
                    const [newQuestion] = await tx
                        .insert(pteQuestions)
                        .values(questionData)
                        .returning({ id: pteQuestions.id });
                    questionId = newQuestion.id;
                }

                // Upsert Type Specific Data
                if (speakingTypes.includes(row.questionType)) {
                    const data = {
                        questionId,
                        audioPromptUrl: row.audioPromptUrl || null,
                        expectedDuration: row.expectedDuration || null,
                        sampleTranscript: row.sampleTranscript || null,
                        keyPoints: row.keyPoints || null,
                    };

                    const existing = await tx.select().from(pteSpeakingQuestions).where(eq(pteSpeakingQuestions.questionId, questionId));
                    if (existing.length) {
                        await tx.update(pteSpeakingQuestions).set(data).where(eq(pteSpeakingQuestions.questionId, questionId));
                    } else {
                        await tx.insert(pteSpeakingQuestions).values(data);
                    }

                } else if (writingTypes.includes(row.questionType)) {
                    const data = {
                        questionId,
                        promptText: row.promptText || '',
                        passageText: row.passageText || null,
                        wordCountMin: row.wordCountMin || 0,
                        wordCountMax: row.wordCountMax || 0,
                        essayType: row.essayType || null,
                        keyThemes: row.keyThemes || null,
                    };
                    const existing = await tx.select().from(pteWritingQuestions).where(eq(pteWritingQuestions.questionId, questionId));
                    if (existing.length) {
                        await tx.update(pteWritingQuestions).set(data).where(eq(pteWritingQuestions.questionId, questionId));
                    } else {
                        await tx.insert(pteWritingQuestions).values(data);
                    }

                } else if (readingTypes.includes(row.questionType)) {
                    const data = {
                        questionId,
                        passageText: row.passageText || '',
                        questionText: row.questionText || null,
                        options: row.options || null,
                        correctAnswerPositions: row.correctAnswerPositions || null,
                        explanation: row.explanation || null,
                    };
                    const existing = await tx.select().from(pteReadingQuestions).where(eq(pteReadingQuestions.questionId, questionId));
                    if (existing.length) {
                        await tx.update(pteReadingQuestions).set(data).where(eq(pteReadingQuestions.questionId, questionId));
                    } else {
                        await tx.insert(pteReadingQuestions).values(data);
                    }

                } else if (listeningTypes.includes(row.questionType)) {
                    const data = {
                        questionId,
                        audioFileUrl: row.audioFileUrl || '',
                        audioDuration: row.audioDuration || null,
                        transcript: row.transcript || null,
                        questionText: row.questionText || null,
                        options: row.options || null,
                        correctAnswerPositions: row.correctAnswerPositions || null,
                    };
                    const existing = await tx.select().from(pteListeningQuestions).where(eq(pteListeningQuestions.questionId, questionId));
                    if (existing.length) {
                        await tx.update(pteListeningQuestions).set(data).where(eq(pteListeningQuestions.questionId, questionId));
                    } else {
                        await tx.insert(pteListeningQuestions).values(data);
                    }
                }

                if (isUpdate) updated++;
                else inserted++;

                if (i > 0 && i % 10 === 0) {
                    process.stdout.write('.');
                }
            });

        } catch (error) {
            console.error(`\n[Error] Row ${rowNumber} (${row.title}): ${(error as Error).message}`);
            processingErrors.push({
                row: rowNumber,
                title: row.title,
                errors: [(error as Error).message],
            });
            failed++;
        }
    }

    console.log('\n\n[Seed] Upload Complete');
    console.log(`Inserted: ${inserted}`);
    console.log(`Updated: ${updated}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) {
        console.log('\nErrors:');
        processingErrors.forEach(err => {
            console.log(`Row ${err.row} [${err.title}]: ${err.errors.join(', ')}`);
        });
        process.exit(1);
    }

    process.exit(0);
}

// Get file path from command line args
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Please provide the path to the CSV file');
    console.error('Usage: tsx scripts/seed-from-csv.ts <path-to-csv>');
    process.exit(1);
}

seedFromCSV(args[0]);
