
import 'dotenv/config';
import { db } from '@/lib/db';
import { pteQuestions, pteQuestionTypes, pteCategories } from '@/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

const QUESTIONS_TO_SEED = [
    { name: 'Write Essay', code: 'essay', content: 'Do you think technology has improved our lives? Discuss.', section: 'writing' },
    { name: 'Multiple Choice, Choose Multiple Answers', code: 'reading_mc_multiple', content: 'Read the passage and select...', section: 'reading' },
    { name: 'Re-order Paragraphs', code: 'reorder_paragraphs', content: 'A. B. C. D.', section: 'reading' },
    { name: 'Reading: Fill in the Blanks', code: 'reading_fill_blanks_drag', content: 'The sky is [blank].', section: 'reading' },
    { name: 'Multiple Choice, Choose Single Answer', code: 'reading_mc_single', content: 'Select the best answer.', section: 'reading' },
    { name: 'Summarize Spoken Text', code: 'summarize_spoken_text', content: 'Listen and summarize.', section: 'listening' },
    { name: 'Listening: Multiple Choice, Choose Multiple Answers', code: 'listening_mc_multiple', content: 'Listen and select.', section: 'listening' },
    { name: 'Fill in the Blanks', code: 'listening_fill_blanks', content: 'Listen and fill blanks.', section: 'listening' },
    { name: 'Highlight Correct Summary', code: 'highlight_correct_summary', content: 'Select the best summary.', section: 'listening' },
    { name: 'Listening: Multiple Choice, Choose Single Answer', code: 'listening_mc_single', content: 'Choose one.', section: 'listening' },
    { name: 'Select Missing Word', code: 'select_missing_word', content: 'Beep...', section: 'listening' },
    { name: 'Highlight Incorrect Words', code: 'highlight_incorrect_words', content: 'The text has errors.', section: 'listening' },
    { name: 'Summarize Group Discussion', code: 'summarize_group_discussion', content: 'Listen and summarize.', section: 'speaking' },
    { name: 'Write from Dictation', code: 'write_from_dictation', content: 'The student is late.', section: 'listening' },
];

async function seedMissing() {
    console.log('🌱 Seeding Missing Question Types...');

    // 1. Ensure Categories exist
    const categories = await db.query.pteCategories.findMany();
    const getCatId = (code: string) => categories.find(c => c.code === code)?.id;

    for (const m of QUESTIONS_TO_SEED) {
        // Find Type by Code
        let typeObj = await db.query.pteQuestionTypes.findFirst({
            where: eq(pteQuestionTypes.code, m.code as any)
        });

        if (!typeObj) {
            console.log(`Type '${m.name}' (${m.code}) not found. Creating...`);
            const catId = getCatId(m.section);
            if (!catId) {
                console.error(`Category '${m.section}' not found! Skipping ${m.name}`);
                continue;
            }

            const newId = uuidv4();
            await db.insert(pteQuestionTypes).values({
                id: newId,
                name: m.name,
                code: m.code as any,
                categoryId: catId,
                maxScore: 10, // Default
                displayOrder: 99,
                isActive: true
            });
            typeObj = { id: newId } as any;
        }

        if (!typeObj) continue;

        // Insert Placeholder Question
        // Check if exists to avoid duplicates if re-run
        const existing = await db.query.pteQuestions.findFirst({
            where: eq(pteQuestions.title, `Placeholder ${m.name}`)
        });

        if (!existing) {
            await db.insert(pteQuestions).values({
                title: `Placeholder ${m.name}`,
                questionTypeId: typeObj.id,
                content: m.content,
                difficulty: 'Medium',
                isActive: true,
            });
            console.log(`+ Added placeholder for ${m.name}`);
        } else {
            console.log(`> Placeholder for ${m.name} already exists.`);
        }
    }
}

seedMissing().catch(console.error);
