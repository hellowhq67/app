import 'dotenv/config';
import { db } from '@/lib/db';
import {
    pteQuestions, pteSpeakingQuestions, pteWritingQuestions,
    pteReadingQuestions, pteListeningQuestions, pteQuestionTypes
} from '@/lib/db/schema';
import { benchmarkResponses } from '../data/benchmark-responses';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Helper to map type string to specific extended table inserter
async function seedFromBenchmarks() {
    console.log('🌱 Seeding PTE Questions from Benchmarks...');

    // 1. Ensure Types Exist and Map IDs
    const typesDocs = await db.select().from(pteQuestionTypes);
    const typeMap: Record<string, string> = {};

    // Map existing types from DB (normalize names)
    for (const t of typesDocs) {
        // e.g. name="Read Aloud", code="read_aloud" (if code exists, or we lower-case name)
        // Adjust based on actual DB schema content. Assuming name is primary key-ish for us.
        // My benchmark types are: 'read_aloud', 'write_essay', etc.
        // Check if DB names match benchmark types or nice names.
        const normalized = t.name.toLowerCase().replace(/ /g, '_');
        // We might need a manual map if automatic fails
        typeMap[normalized] = t.id;
        // Also map strict benchmark keys if they match
        typeMap[t.name] = t.id;
    }

    // Hardcode mapping if DB has "Read Aloud" but benchmark has "read_aloud"
    const hardMap: Record<string, string> = {
        'read_aloud': 'Read Aloud',
        'repeat_sentence': 'Repeat Sentence',
        'describe_image': 'Describe Image',
        'retell_lecture': 'Re-tell Lecture',
        'answer_short_question': 'Answer Short Question',
        'summarize_written_text': 'Summarize Written Text',
        'write_essay': 'Write Essay',
        'summarize_spoken_text': 'Summarize Spoken Text',
        'write_from_dictation': 'Write from Dictation'
    };

    let count = 0;

    for (const item of benchmarkResponses) {
        const dbTypeName = hardMap[item.questionType];

        let typeId = typesDocs.find(t => t.name === dbTypeName)?.id;

        if (!typeId) {
            console.warn(`Type not found for ${item.questionType} mapped to ${dbTypeName}`);
            continue;
        }

        // Check if exists (by title, rudimentary check)
        // using id from benchmark to keep consistency? 
        // Benchmark IDs are 'benchmark-ra-001'. UUIDs required for pteQuestions? 
        // Schema says: id: uuid("id").defaultRandom()
        // So we generate new UUID. but maybe we can store benchmark ID in metadata to avoid duplicates.

        // Skip check for speed, careful not to run twice or allow duplicates

        const qId = uuidv4();

        // BASE QUESTION
        let title = `${dbTypeName} Item ${count + 1}`;
        let content = "Prompt not available";

        // Derive Content
        if (item.questionType === 'read_aloud') content = item.response;
        else if (item.questionType === 'write_from_dictation') content = item.response; // Audio script
        else if (item.questionType === 'repeat_sentence') content = item.response; // Audio script
        else if (item.questionType === 'write_essay') content = item.response.split('.')[0] + "..."; // First sentence as prompt
        else if (item.questionType === 'summarize_written_text') content = item.response; // The text to summarize (usually)
        else content = `Practice Item for ${dbTypeName}`;

        await db.insert(pteQuestions).values({
            id: qId,
            questionTypeId: typeId,
            title,
            content,
            difficulty: 'Medium',
            isActive: true,
            sampleAnswer: item.response, // The benchmark itself is a sample answer!
            metadata: { source: 'benchmark-dataset', originalId: item.id }
        });

        // EXTENDED TABLES
        if (item.questionType === 'read_aloud') {
            await db.insert(pteSpeakingQuestions).values({
                questionId: qId,
                expectedDuration: 40
            });
        }
        else if (['repeat_sentence', 'retell_lecture', 'answer_short_question', 'describe_image'].includes(item.questionType)) {
            await db.insert(pteSpeakingQuestions).values({
                questionId: qId,
                sampleTranscript: item.response,
                expectedDuration: 40,
                // audioPromptUrl: "..." // Needed for RS/ASQ. 
            });
        }
        else if (['write_essay', 'summarize_written_text'].includes(item.questionType)) {
            await db.insert(pteWritingQuestions).values({
                questionId: qId,
                promptText: content,
                wordCountMin: 200,
                wordCountMax: 300
            });
        }
        else if (['summarize_spoken_text', 'write_from_dictation'].includes(item.questionType)) {
            await db.insert(pteListeningQuestions).values({
                questionId: qId,
                audioFileUrl: "placeholder",
                transcript: item.response,
                audioDuration: 10
            });
        }

        count++;
    }

    console.log(`✅ Seeded ${count} Questions.`);
}

seedFromBenchmarks().catch(console.error);
