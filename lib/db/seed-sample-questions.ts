import { db, client } from './drizzle';
import { pteQuestions, pteSpeakingQuestions, pteReadingQuestions, pteWritingQuestions, pteListeningQuestions } from './schema/pte-questions';
import { pteQuestionTypes } from './schema/pte-categories';
import { eq } from 'drizzle-orm';

async function seedSampleQuestions() {
    try {
        console.log('🌱 Seeding sample PTE questions...');

        // Get all question types to reference IDs
        const questionTypes = await db.select().from(pteQuestionTypes);

        const findType = (code: string) => questionTypes.find(t => t.code === code);

        // 1. Speaking: Read Aloud
        const raType = findType('read_aloud');
        if (raType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: raType.id,
                title: 'Sample Read Aloud',
                content: 'Market research is a vital part of the planning process of any business. It involves gathering information about the target market and the competition to help businesses make informed decisions.',
                difficulty: 'Medium',
            }).returning();

            await db.insert(pteSpeakingQuestions).values({
                questionId: q.id,
                expectedDuration: 40,
            });
            console.log('✅ Added Read Aloud sample');
        }

        // 2. Writing: Summarize Written Text
        const swtType = findType('summarize_written_text');
        if (swtType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: swtType.id,
                title: 'Sample Summarize Written Text',
                content: 'History is a discipline that studies the past. It uses evidence from various sources to reconstruct events and understand their significance. Historians analyze primary sources like diaries, letters, and official documents, as well as secondary sources like books and articles written by other historians. By examining the past, we can gain insights into the present and potentially predict the future.',
                difficulty: 'Medium',
            }).returning();

            await db.insert(pteWritingQuestions).values({
                questionId: q.id,
                promptText: 'Summarize the passage in one sentence.',
                wordCountMin: 5,
                wordCountMax: 75,
            });
            console.log('✅ Added SWT sample');
        }

        // 3. Reading: MC Single Answer
        const rmcsType = findType('reading_mc_single');
        if (rmcsType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: rmcsType.id,
                title: 'Sample Reading MCQ',
                content: 'The solar system consists of the Sun and the objects that orbit it. This includes the eight planets, their moons, and smaller objects like asteroids and comets.',
                difficulty: 'Easy',
                correctAnswer: { text: 'The Sun lives at the center of the solar system.' },
            }).returning();

            await db.insert(pteReadingQuestions).values({
                questionId: q.id,
                passageText: 'The solar system is a vast space...',
                questionText: 'What is at the center of the solar system?',
                options: { choices: ['The Sun', 'Earth', 'Jupiter', 'The Moon'] },
                correctAnswerPositions: [0],
            });
            console.log('✅ Added Reading MCQ sample');
        }

        // 4. Listening: Write from Dictation
        const wfdType = findType('write_from_dictation');
        if (wfdType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: wfdType.id,
                title: 'Sample Write from Dictation',
                difficulty: 'Hard',
                correctAnswer: { text: 'The university offers a wide range of courses for international students.' },
            }).returning();

            await db.insert(pteListeningQuestions).values({
                questionId: q.id,
                audioFileUrl: 'https://example.com/audio/sample_wfd.mp3', // Placeholder
                transcript: 'The university offers a wide range of courses for international students.',
            });
            console.log('✅ Added Write from Dictation sample');
        }

        console.log('✅ Sample questions seeded successfully!');
        await client.end();
    } catch (error) {
        console.error('❌ Error seeding sample questions:', error);
        await client.end();
        process.exit(1);
    }
}

seedSampleQuestions();
