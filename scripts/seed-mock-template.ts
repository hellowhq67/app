
import 'dotenv/config';
import { db } from '@/lib/db';
import { mockTests, pteQuestions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// PTE ACADEMIC STRICT STRUCTURE (2 Hours)
// Ranges are handled by taking the max or random within range.
// For stability, we'll aim for the standard/max count to ensure full test experience.
const TEST_STRUCTURE = [
    // PART 1: SPEAKING & WRITING (77-93 min)
    { section: 'Speaking & Writing', type: 'Read Aloud', count: 6, time: 40 }, // 6-7
    { section: 'Speaking & Writing', type: 'Repeat Sentence', count: 10, time: 15 }, // 10-12 (Time is approx per item for mock flow, usually overall block)
    { section: 'Speaking & Writing', type: 'Describe Image', count: 3, time: 40 }, // 3-4
    { section: 'Speaking & Writing', type: 'Re-tell Lecture', count: 1, time: 40 }, // 1-2
    { section: 'Speaking & Writing', type: 'Answer Short Question', count: 5, time: 10 }, // 5-6
    { section: 'Speaking & Writing', type: 'Summarize Written Text', count: 1, time: 600 }, // 1-2 (10 min each)
    { section: 'Speaking & Writing', type: 'Essay', count: 1, time: 1200 }, // 1-2 (20 min each)

    // PART 2: READING (29-30 min)
    { section: 'Reading', type: 'Reading & Writing: Fill in the Blanks', count: 5, time: 150 }, // 5-6
    { section: 'Reading', type: 'Multiple Choice, Multiple Answer', count: 1, time: 120 }, // 1-2
    { section: 'Reading', type: 'Re-order Paragraphs', count: 2, time: 120 }, // 2-3
    { section: 'Reading', type: 'Reading: Fill in the Blanks', count: 4, time: 120 }, // 4-5
    { section: 'Reading', type: 'Multiple Choice, Choose Single Answer', count: 1, time: 90 }, // 1-2

    // PART 3: LISTENING (30-43 min)
    { section: 'Listening', type: 'Summarize Spoken Text', count: 1, time: 600 }, // 1-2 (10 min each)
    { section: 'Listening', type: 'Multiple Choice, Multiple Answer', count: 1, time: 60 }, // 1-2
    { section: 'Listening', type: 'Fill in the Blanks', count: 2, time: 60 }, // 2-3
    { section: 'Listening', type: 'Highlight Correct Summary', count: 1, time: 60 }, // 1-2
    { section: 'Listening', type: 'Multiple Choice, Choose Single Answer', count: 1, time: 60 }, // 1-2
    { section: 'Listening', type: 'Select Missing Word', count: 1, time: 60 }, // 1-2
    { section: 'Listening', type: 'Highlight Incorrect Words', count: 2, time: 60 }, // 2-3
    { section: 'Listening', type: 'Write from Dictation', count: 3, time: 60 }, // 3-4
];

async function seedStrictTemplate() {
    console.log('🏗️ Building Strict PTE Academic Template...');

    // 1. Fetch ALL available questions
    const allQuestions = await db.query.pteQuestions.findMany({
        with: { questionType: true }
    });

    console.log(`📊 Found ${allQuestions.length} total questions in DB.`);

    const templateQuestions: any[] = [];
    let order = 1;

    // 2. Build Structure
    for (const item of TEST_STRUCTURE) {
        // Filter by type name (fuzzy match)
        const pool = allQuestions.filter(q =>
            q.questionType.name.toLowerCase().includes(item.type.toLowerCase()) ||
            (q.questionType.code && q.questionType.code.toLowerCase().includes(item.type.toLowerCase()))
        );

        if (pool.length === 0) {
            console.warn(`⚠️ Warning: No questions found for type '${item.type}'. Skipping.`);
            continue;
        }

        console.log(`   - ${item.type}: Req ${item.count}, Found ${pool.length}`);

        // Select required count (cycling if needed)
        for (let i = 0; i < item.count; i++) {
            const q = pool[i % pool.length]; // Cycle through available questions
            templateQuestions.push({
                section: item.section,
                questionId: q.id,
                timeLimit: item.time, // Strict timing
                order: order++,
                title: `${item.type} - Item ${i + 1}`,
                questionType: q.questionType // Store type info for frontend convenience
            });
        }
    }

    // 3. Save Template
    await db.delete(mockTests).where(eq(mockTests.title, 'PTE Academic - Final Full Mock')); // Clear old if exists

    await db.insert(mockTests).values({
        title: 'PTE Academic - Final Full Mock',
        description: 'Strict 2-hour format with official item counts.',
        type: 'ACADEMIC',
        questions: templateQuestions,
        isActive: true,
        price: 0
    });

    console.log(`✅ Template Created with ${templateQuestions.length} items.`);
}

seedStrictTemplate().catch(console.error);
