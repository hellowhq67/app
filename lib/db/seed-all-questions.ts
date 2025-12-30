import { db, client } from './drizzle';
import { 
    pteQuestions, 
    pteSpeakingQuestions, 
    pteReadingQuestions, 
    pteWritingQuestions, 
    pteListeningQuestions 
} from './schema/pte-questions';
import { pteQuestionTypes } from './schema/pte-categories';
import { eq } from 'drizzle-orm';

async function seedAllQuestions() {
    try {
        console.log('🌱 Seeding ALL PTE question types...');

        // Get all question types
        const questionTypes = await db.select().from(pteQuestionTypes);
        const findType = (code: string) => questionTypes.find(t => t.code === code);

        // --- SPEAKING (7 Types) ---
        
        // 1. Read Aloud
        const raType = findType('read_aloud');
        if (raType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: raType.id,
                title: 'Market Research',
                content: 'Market research is a vital part of the planning process of any business. It involves gathering information about the target market and the competition to help businesses make informed decisions.',
                difficulty: 'Medium',
            }).returning();
            await db.insert(pteSpeakingQuestions).values({ questionId: q.id, expectedDuration: 40 });
            console.log('✅ Added Read Aloud');
        }

        // 2. Repeat Sentence
        const rsType = findType('repeat_sentence');
        if (rsType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: rsType.id,
                title: 'Library Hours',
                difficulty: 'Easy',
                content: 'The library will be closed for staff training tomorrow.', // Transcript for display/checking
            }).returning();
            await db.insert(pteSpeakingQuestions).values({ 
                questionId: q.id, 
                audioPromptUrl: 'https://example.com/audio/rs_sample.mp3',
                sampleTranscript: 'The library will be closed for staff training tomorrow.'
            });
            console.log('✅ Added Repeat Sentence');
        }

        // 3. Describe Image
        const diType = findType('describe_image');
        if (diType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: diType.id,
                title: 'Global Population Growth',
                difficulty: 'Medium',
                imageUrl: 'https://example.com/images/population_graph.png',
            }).returning();
            await db.insert(pteSpeakingQuestions).values({ questionId: q.id, expectedDuration: 40 });
            console.log('✅ Added Describe Image');
        }

        // 4. Retell Lecture
        const rlType = findType('retell_lecture');
        if (rlType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: rlType.id,
                title: 'History of Urbanization',
                difficulty: 'Hard',
            }).returning();
            await db.insert(pteSpeakingQuestions).values({ 
                questionId: q.id, 
                audioPromptUrl: 'https://example.com/audio/rl_sample.mp3',
                keyPoints: ['Industrial revolution', 'Migration to cities', 'Infrastructure challenges']
            });
            console.log('✅ Added Retell Lecture');
        }

        // 5. Answer Short Question
        const asqType = findType('answer_short_question');
        if (asqType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: asqType.id,
                title: 'Organs',
                difficulty: 'Easy',
                correctAnswer: { text: 'Heart' },
            }).returning();
            await db.insert(pteSpeakingQuestions).values({ 
                questionId: q.id, 
                audioPromptUrl: 'https://example.com/audio/asq_sample.mp3',
                sampleTranscript: 'Which organ pumps blood throughout the human body?'
            });
            console.log('✅ Added Answer Short Question');
        }

        // 6. Respond to Situation (Newer type, sometimes pilot)
        const rtsType = findType('respond_to_situation');
        if (rtsType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: rtsType.id,
                title: 'Late Submission',
                difficulty: 'Medium',
                content: 'You are a student. You cannot submit your assignment on time because you were sick. Explain your situation to your professor.',
            }).returning();
            await db.insert(pteSpeakingQuestions).values({ questionId: q.id, expectedDuration: 60 });
            console.log('✅ Added Respond to Situation');
        }

        // 7. Summarize Group Discussion (Newer type)
        const sgdType = findType('summarize_group_discussion');
        if (sgdType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: sgdType.id,
                title: 'Remote Work Debate',
                difficulty: 'Hard',
            }).returning();
            await db.insert(pteSpeakingQuestions).values({ 
                questionId: q.id, 
                audioPromptUrl: 'https://example.com/audio/sgd_sample.mp3',
                keyPoints: ['Flexibility', 'Isolation', 'Productivity']
            });
            console.log('✅ Added Summarize Group Discussion');
        }


        // --- WRITING (2 Types) ---

        // 1. Summarize Written Text
        const swtType = findType('summarize_written_text');
        if (swtType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: swtType.id,
                title: 'The Importance of Sleep',
                content: 'Sleep plays a vital role in good health and well-being throughout your life. Getting enough quality sleep at the right times can help protect your mental health, physical health, quality of life, and safety. The way you feel while you are awake depends in part on what happens while you are sleeping. During sleep, your body is working to support healthy brain function and maintain your physical health.',
                difficulty: 'Medium',
            }).returning();
            await db.insert(pteWritingQuestions).values({
                questionId: q.id,
                promptText: 'Summarize the text in one sentence.',
                passageText: 'Sleep plays a vital role...', // redundant but schema might use it
                wordCountMin: 5,
                wordCountMax: 75,
            });
            console.log('✅ Added Summarize Written Text');
        }

        // 2. Essay
        const essayType = findType('essay');
        if (essayType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: essayType.id,
                title: 'Technology in Education',
                difficulty: 'Hard',
            }).returning();
            await db.insert(pteWritingQuestions).values({
                questionId: q.id,
                promptText: 'Do you think that technology has had a positive or negative impact on education? Support your opinion with reasons and examples.',
                wordCountMin: 200,
                wordCountMax: 300,
                essayType: 'Argumentative'
            });
            console.log('✅ Added Essay');
        }


        // --- READING (5 Types) ---

        // 1. Fill in Blanks (Dropdown)
        const rfbDropType = findType('reading_fill_blanks_dropdown');
        if (rfbDropType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: rfbDropType.id,
                title: 'Climate Change',
                difficulty: 'Medium',
            }).returning();
            await db.insert(pteReadingQuestions).values({
                questionId: q.id,
                passageText: 'Climate change is a significant [1] facing our planet. We must take [2] action to reduce emissions.',
                options: {
                    blanks: [
                        { position: 1, options: ['challenge', 'benefit', 'hobby', 'game'] },
                        { position: 2, options: ['immediate', 'slow', 'no', 'partial'] }
                    ]
                },
                correctAnswerPositions: [0, 0] // indices of correct options
            });
            console.log('✅ Added Reading Fill Blanks (Dropdown)');
        }

        // 2. Multiple Choice (Multiple Answers)
        const rmcMultiType = findType('reading_mc_multiple');
        if (rmcMultiType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: rmcMultiType.id,
                title: 'Renewable Energy',
                content: 'Renewable energy comes from sources that are naturally replenished. Examples include sunlight, wind, and rain. Unlike fossil fuels, which are finite, renewable sources are abundant.',
                difficulty: 'Medium',
            }).returning();
            await db.insert(pteReadingQuestions).values({
                questionId: q.id,
                passageText: 'Renewable energy comes from sources...',
                questionText: 'Which of the following are examples of renewable energy sources?',
                options: { choices: ['Coal', 'Sunlight', 'Wind', 'Natural Gas'] },
                correctAnswerPositions: [1, 2] // Sunlight, Wind
            });
            console.log('✅ Added Reading MCQ (Multiple)');
        }

        // 3. Re-order Paragraphs
        const ropType = findType('reorder_paragraphs');
        if (ropType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: ropType.id,
                title: 'Scientific Method',
                difficulty: 'Hard',
            }).returning();
            await db.insert(pteReadingQuestions).values({
                questionId: q.id,
                passageText: 'Reorder the paragraphs.',
                options: {
                    paragraphs: [
                        'First, a hypothesis is formed based on observations.',
                        'The scientific method is a systematic way of learning about the world.',
                        'Finally, conclusions are drawn from the data.',
                        'Then, experiments are conducted to test the hypothesis.'
                    ]
                },
                correctAnswerPositions: [1, 0, 3, 2] // Correct order indices
            });
            console.log('✅ Added Re-order Paragraphs');
        }

        // 4. Fill in Blanks (Drag & Drop)
        const rfbDragType = findType('reading_fill_blanks_drag');
        if (rfbDragType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: rfbDragType.id,
                title: 'Language Learning',
                difficulty: 'Easy',
            }).returning();
            await db.insert(pteReadingQuestions).values({
                questionId: q.id,
                passageText: 'Learning a new language can be [1] but rewarding. It opens up new [2] for travel and work.',
                options: { choices: ['difficult', 'opportunities', 'easy', 'doors', 'bad'] },
                correctAnswerPositions: [0, 1] // indices from choices list
            });
            console.log('✅ Added Reading Fill Blanks (Drag)');
        }

        // 5. Multiple Choice (Single Answer)
        const rmcSingleType = findType('reading_mc_single');
        if (rmcSingleType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: rmcSingleType.id,
                title: 'Photosynthesis',
                content: 'Photosynthesis is the process used by plants to convert light energy into chemical energy.',
                difficulty: 'Easy',
            }).returning();
            await db.insert(pteReadingQuestions).values({
                questionId: q.id,
                passageText: 'Photosynthesis is the process...',
                questionText: 'What do plants use to convert light energy?',
                options: { choices: ['Oxygen', 'Chlorophyll', 'Roots', 'Soil'] },
                correctAnswerPositions: [1]
            });
            console.log('✅ Added Reading MCQ (Single)');
        }


        // --- LISTENING (8 Types) ---

        // 1. Summarize Spoken Text
        const lstType = findType('summarize_spoken_text');
        if (lstType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: lstType.id,
                title: 'The Bee Population',
                difficulty: 'Medium',
            }).returning();
            await db.insert(pteListeningQuestions).values({
                questionId: q.id,
                audioFileUrl: 'https://example.com/audio/sst_sample.mp3',
                transcript: 'Bees are crucial for pollination, but their populations are declining due to pesticides and habitat loss.',
            });
            console.log('✅ Added Summarize Spoken Text');
        }

        // 2. Multiple Choice (Multiple Answers)
        const lmcMultiType = findType('listening_mc_multiple');
        if (lmcMultiType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: lmcMultiType.id,
                title: 'Climate Summit',
                difficulty: 'Hard',
            }).returning();
            await db.insert(pteListeningQuestions).values({
                questionId: q.id,
                audioFileUrl: 'https://example.com/audio/lmc_multi_sample.mp3',
                questionText: 'What were the main topics discussed?',
                options: { choices: ['Carbon taxes', 'Renewable energy', 'Space exploration', 'Ocean cleaning'] },
                correctAnswerPositions: [0, 1]
            });
            console.log('✅ Added Listening MCQ (Multiple)');
        }

        // 3. Fill in the Blanks
        const lfbType = findType('listening_fill_blanks');
        if (lfbType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: lfbType.id,
                title: 'Economic Forecast',
                difficulty: 'Medium',
            }).returning();
            await db.insert(pteListeningQuestions).values({
                questionId: q.id,
                audioFileUrl: 'https://example.com/audio/lfb_sample.mp3',
                transcript: 'The economy is expected to grow by 2% next year, driven by strong consumer spending.',
                options: { blanks: [{ position: 1, answer: 'grow' }, { position: 2, answer: 'spending' }] } // Conceptual representation
            });
            console.log('✅ Added Listening Fill Blanks');
        }

        // 4. Highlight Correct Summary
        const hcsType = findType('highlight_correct_summary');
        if (hcsType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: hcsType.id,
                title: 'Dolphin Intelligence',
                difficulty: 'Medium',
            }).returning();
            await db.insert(pteListeningQuestions).values({
                questionId: q.id,
                audioFileUrl: 'https://example.com/audio/hcs_sample.mp3',
                options: { summaries: [
                    'Dolphins are intelligent social animals.',
                    'Dolphins are solitary fish.',
                    'Dolphins cannot communicate.'
                ]},
                correctAnswerPositions: [0]
            });
            console.log('✅ Added Highlight Correct Summary');
        }

        // 5. Multiple Choice (Single Answer)
        const lmcSingleType = findType('listening_mc_single');
        if (lmcSingleType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: lmcSingleType.id,
                title: 'Lecture on Art',
                difficulty: 'Easy',
            }).returning();
            await db.insert(pteListeningQuestions).values({
                questionId: q.id,
                audioFileUrl: 'https://example.com/audio/lmc_single_sample.mp3',
                questionText: 'What is the main subject of the painting?',
                options: { choices: ['A landscape', 'A portrait', 'Abstract shapes'] },
                correctAnswerPositions: [1]
            });
            console.log('✅ Added Listening MCQ (Single)');
        }

        // 6. Select Missing Word
        const smwType = findType('select_missing_word');
        if (smwType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: smwType.id,
                title: 'Medical Breakthrough',
                difficulty: 'Hard',
            }).returning();
            await db.insert(pteListeningQuestions).values({
                questionId: q.id,
                audioFileUrl: 'https://example.com/audio/smw_sample.mp3',
                options: { choices: ['cured', 'discovered', 'ignored'] },
                correctAnswerPositions: [0]
            });
            console.log('✅ Added Select Missing Word');
        }

        // 7. Highlight Incorrect Words
        const hiwType = findType('highlight_incorrect_words');
        if (hiwType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: hiwType.id,
                title: 'Astronomy',
                difficulty: 'Medium',
            }).returning();
            await db.insert(pteListeningQuestions).values({
                questionId: q.id,
                audioFileUrl: 'https://example.com/audio/hiw_sample.mp3',
                transcript: 'The stars shine brightly in the night sky.', // Real audio says "shine"
                // Displayed text has "brightly" replaced with "darkly" for user to click
                options: { displayedText: 'The stars shine darkly in the night sky.' }, 
                correctAnswerPositions: [3] // index of word 'darkly'
            });
            console.log('✅ Added Highlight Incorrect Words');
        }

        // 8. Write from Dictation
        const wfdType = findType('write_from_dictation');
        if (wfdType) {
            const [q] = await db.insert(pteQuestions).values({
                questionTypeId: wfdType.id,
                title: 'University Policy',
                difficulty: 'Hard',
            }).returning();
            await db.insert(pteListeningQuestions).values({
                questionId: q.id,
                audioFileUrl: 'https://example.com/audio/wfd_sample.mp3',
                transcript: 'All assignments must be submitted by the deadline.',
            });
            console.log('✅ Added Write from Dictation');
        }

        console.log('✅ All question types seeded successfully!');
        await client.end();

    } catch (error) {
        console.error('❌ Error seeding questions:', error);
        await client.end();
        process.exit(1);
    }
}

seedAllQuestions();
