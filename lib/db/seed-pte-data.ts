import { db, client } from './drizzle';
import { pteCategories, pteQuestionTypes } from './schema/pte-categories';

async function seedPTEData() {
    try {
        console.log('🌱 Seeding PTE categories and question types...');

        // Insert Categories
        const categories = await db
            .insert(pteCategories)
            .values([
                {
                    code: 'speaking',
                    name: 'Speaking',
                    description: 'Speaking section tests your ability to speak English in academic settings',
                    displayOrder: 1,
                },
                {
                    code: 'writing',
                    name: 'Writing',
                    description: 'Writing section tests your ability to write in English in academic settings',
                    displayOrder: 2,
                },
                {
                    code: 'reading',
                    name: 'Reading',
                    description: 'Reading section tests your ability to understand written English',
                    displayOrder: 3,
                },
                {
                    code: 'listening',
                    name: 'Listening',
                    description: 'Listening section tests your ability to understand spoken English',
                    displayOrder: 4,
                },
            ])
            .returning();

        console.log(`✅ Inserted ${categories.length} categories`);

        // Get category IDs
        const speakingCat = categories.find((c) => c.code === 'speaking')!;
        const writingCat = categories.find((c) => c.code === 'writing')!;
        const readingCat = categories.find((c) => c.code === 'reading')!;
        const listeningCat = categories.find((c) => c.code === 'listening')!;

        // Insert Question Types
        const questionTypes = await db
            .insert(pteQuestionTypes)
            .values([
                // SPEAKING (7 types)
                {
                    code: 'read_aloud',
                    name: 'Read Aloud',
                    categoryId: speakingCat.id,
                    description: 'Read a short text aloud',
                    hasAiScoring: true,
                    maxScore: 15,
                    scoringCriteria: {
                        pronunciation: { weight: 5, maxScore: 5 },
                        fluency: { weight: 5, maxScore: 5 },
                        content: { weight: 5, maxScore: 5 },
                    },
                    timeLimit: 40,
                    preparationTime: 30,
                    displayOrder: 1,
                    instructions: 'Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible.',
                },
                {
                    code: 'repeat_sentence',
                    name: 'Repeat Sentence',
                    categoryId: speakingCat.id,
                    description: 'Listen to a sentence and repeat it exactly',
                    hasAiScoring: true,
                    maxScore: 13,
                    scoringCriteria: {
                        pronunciation: { weight: 5, maxScore: 5 },
                        fluency: { weight: 5, maxScore: 5 },
                        content: { weight: 3, maxScore: 3 },
                    },
                    timeLimit: 15,
                    displayOrder: 2,
                    instructions: 'You will hear a sentence. Please repeat the sentence exactly as you hear it.',
                },
                {
                    code: 'describe_image',
                    name: 'Describe Image',
                    categoryId: speakingCat.id,
                    description: 'Describe an image in detail',
                    hasAiScoring: true,
                    maxScore: 15,
                    scoringCriteria: {
                        pronunciation: { weight: 5, maxScore: 5 },
                        fluency: { weight: 5, maxScore: 5 },
                        content: { weight: 5, maxScore: 5 },
                    },
                    timeLimit: 40,
                    preparationTime: 25,
                    displayOrder: 3,
                    instructions: 'Look at the image below. In 25 seconds, please speak into the microphone and describe in detail what the image is showing.',
                },
                {
                    code: 'retell_lecture',
                    name: 'Retell Lecture',
                    categoryId: speakingCat.id,
                    description: 'Listen to a lecture and retell it in your own words',
                    hasAiScoring: true,
                    maxScore: 15,
                    scoringCriteria: {
                        pronunciation: { weight: 5, maxScore: 5 },
                        fluency: { weight: 5, maxScore: 5 },
                        content: { weight: 5, maxScore: 5 },
                    },
                    timeLimit: 40,
                    preparationTime: 10,
                    displayOrder: 4,
                    instructions: 'You will hear a lecture. After listening to the lecture, in 10 seconds, please speak into the microphone and retell what you have just heard from the lecture in your own words.',
                },
                {
                    code: 'answer_short_question',
                    name: 'Answer Short Question',
                    categoryId: speakingCat.id,
                    description: 'Answer a question with a single word or a few words',
                    hasAiScoring: true,
                    maxScore: 1,
                    scoringCriteria: {
                        content: { weight: 1, maxScore: 1 },
                    },
                    timeLimit: 10,
                    displayOrder: 5,
                    instructions: 'You will hear a question. Please give a simple and short answer.',
                },
                {
                    code: 'respond_to_situation',
                    name: 'Respond to a Situation',
                    categoryId: speakingCat.id,
                    description: 'Respond appropriately to a given situation',
                    hasAiScoring: true,
                    maxScore: 15,
                    scoringCriteria: {
                        pronunciation: { weight: 5, maxScore: 5 },
                        fluency: { weight: 5, maxScore: 5 },
                        content: { weight: 5, maxScore: 5 },
                    },
                    timeLimit: 60,
                    preparationTime: 20,
                    displayOrder: 6,
                    instructions: 'You will hear a situation. Please respond to the situation appropriately.',
                },
                {
                    code: 'summarize_group_discussion',
                    name: 'Summarize Group Discussion',
                    categoryId: speakingCat.id,
                    description: 'Listen to a group discussion and summarize the main points',
                    hasAiScoring: true,
                    maxScore: 15,
                    scoringCriteria: {
                        pronunciation: { weight: 5, maxScore: 5 },
                        fluency: { weight: 5, maxScore: 5 },
                        content: { weight: 5, maxScore: 5 },
                    },
                    timeLimit: 60,
                    preparationTime: 10,
                    displayOrder: 7,
                    instructions: 'You will hear a group discussion. After listening, please summarize the main points in your own words.',
                },

                // WRITING (2 types)
                {
                    code: 'summarize_written_text',
                    name: 'Summarize Written Text',
                    categoryId: writingCat.id,
                    description: 'Read a passage and summarize it in one sentence',
                    hasAiScoring: true,
                    maxScore: 7,
                    scoringCriteria: {
                        content: { weight: 2, maxScore: 2 },
                        form: { weight: 1, maxScore: 1 },
                        grammar: { weight: 2, maxScore: 2 },
                        vocabulary: { weight: 2, maxScore: 2 },
                    },
                    timeLimit: 600, // 10 minutes
                    wordCountMin: 5,
                    wordCountMax: 75,
                    displayOrder: 1,
                    instructions: 'Read the passage below and summarize it using one sentence. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points in the passage.',
                },
                {
                    code: 'essay',
                    name: 'Essay',
                    categoryId: writingCat.id,
                    description: 'Write an essay on a given topic',
                    hasAiScoring: true,
                    maxScore: 15,
                    scoringCriteria: {
                        content: { weight: 3, maxScore: 3 },
                        development: { weight: 2, maxScore: 2 },
                        form: { weight: 2, maxScore: 2 },
                        grammar: { weight: 2, maxScore: 2 },
                        vocabulary: { weight: 2, maxScore: 2 },
                        spelling: { weight: 2, maxScore: 2 },
                        coherence: { weight: 2, maxScore: 2 },
                    },
                    timeLimit: 1200, // 20 minutes
                    wordCountMin: 200,
                    wordCountMax: 300,
                    displayOrder: 2,
                    instructions: 'You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your ideas, present supporting details, and control the elements of standard written English.',
                },

                // READING (5 types)
                {
                    code: 'reading_fill_blanks_dropdown',
                    name: 'Fill in the Blanks (Dropdown)',
                    categoryId: readingCat.id,
                    description: 'Select the correct word from dropdown menus to complete the text',
                    hasAiScoring: false,
                    maxScore: 1,
                    scoringCriteria: {},
                    displayOrder: 1,
                    instructions: 'Below is a text with blanks. Click on each blank, a list of choices will appear. Select the appropriate answer choice for each blank.',
                },
                {
                    code: 'reading_mc_multiple',
                    name: 'Multiple Choice (Multiple Answers)',
                    categoryId: readingCat.id,
                    description: 'Read a passage and select multiple correct answers',
                    hasAiScoring: false,
                    maxScore: 1,
                    scoringCriteria: {},
                    displayOrder: 2,
                    instructions: 'Read the text and answer the question by selecting all the correct responses. More than one response is correct.',
                },
                {
                    code: 'reorder_paragraphs',
                    name: 'Re-order Paragraphs',
                    categoryId: readingCat.id,
                    description: 'Arrange text boxes in the correct order',
                    hasAiScoring: false,
                    maxScore: 1,
                    scoringCriteria: {},
                    displayOrder: 3,
                    instructions: 'The text boxes in the left panel have been placed in a random order. Restore the original order by dragging the text boxes from the left panel to the right panel.',
                },
                {
                    code: 'reading_fill_blanks_drag',
                    name: 'Fill in the Blanks (Drag & Drop)',
                    categoryId: readingCat.id,
                    description: 'Drag and drop words to fill in the blanks',
                    hasAiScoring: false,
                    maxScore: 1,
                    scoringCriteria: {},
                    displayOrder: 4,
                    instructions: 'In the text below some words are missing. Drag words from the box below to the appropriate place in the text.',
                },
                {
                    code: 'reading_mc_single',
                    name: 'Multiple Choice (Single Answer)',
                    categoryId: readingCat.id,
                    description: 'Read a passage and select one correct answer',
                    hasAiScoring: false,
                    maxScore: 1,
                    scoringCriteria: {},
                    displayOrder: 5,
                    instructions: 'Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.',
                },

                // LISTENING (8 types)
                {
                    code: 'summarize_spoken_text',
                    name: 'Summarize Spoken Text',
                    categoryId: listeningCat.id,
                    description: 'Listen to an audio and write a summary',
                    hasAiScoring: true,
                    maxScore: 10,
                    scoringCriteria: {
                        content: { weight: 2, maxScore: 2 },
                        form: { weight: 2, maxScore: 2 },
                        grammar: { weight: 2, maxScore: 2 },
                        vocabulary: { weight: 2, maxScore: 2 },
                        spelling: { weight: 2, maxScore: 2 },
                    },
                    timeLimit: 600, // 10 minutes
                    wordCountMin: 50,
                    wordCountMax: 70,
                    displayOrder: 1,
                    instructions: 'You will hear a short lecture. Write a summary for a fellow student who was not present. You should write 50-70 words.',
                },
                {
                    code: 'listening_mc_multiple',
                    name: 'Multiple Choice (Multiple Answers)',
                    categoryId: listeningCat.id,
                    description: 'Listen to an audio and select multiple correct answers',
                    hasAiScoring: false,
                    maxScore: 1,
                    scoringCriteria: {},
                    displayOrder: 2,
                    instructions: 'Listen to the recording and answer the question by selecting all the correct responses. More than one response is correct.',
                },
                {
                    code: 'listening_fill_blanks',
                    name: 'Fill in the Blanks',
                    categoryId: listeningCat.id,
                    description: 'Listen to an audio and fill in the missing words',
                    hasAiScoring: false,
                    maxScore: 1,
                    scoringCriteria: {},
                    displayOrder: 3,
                    instructions: 'You will hear a recording. Type the missing words in each blank.',
                },
                {
                    code: 'highlight_correct_summary',
                    name: 'Highlight Correct Summary',
                    categoryId: listeningCat.id,
                    description: 'Listen to an audio and select the best summary',
                    hasAiScoring: false,
                    maxScore: 1,
                    scoringCriteria: {},
                    displayOrder: 4,
                    instructions: 'You will hear a recording. Click on the paragraph that best relates to the recording.',
                },
                {
                    code: 'listening_mc_single',
                    name: 'Multiple Choice (Single Answer)',
                    categoryId: listeningCat.id,
                    description: 'Listen to an audio and select one correct answer',
                    hasAiScoring: false,
                    maxScore: 1,
                    scoringCriteria: {},
                    displayOrder: 5,
                    instructions: 'Listen to the recording and answer the multiple-choice question by selecting the correct response. Only one response is correct.',
                },
                {
                    code: 'select_missing_word',
                    name: 'Select Missing Word',
                    categoryId: listeningCat.id,
                    description: 'Listen to an audio and select the missing word',
                    hasAiScoring: false,
                    maxScore: 1,
                    scoringCriteria: {},
                    displayOrder: 6,
                    instructions: 'You will hear a recording about a topic. At the end of the recording the last word or group of words has been replaced by a beep. Select the correct option to complete the recording.',
                },
                {
                    code: 'highlight_incorrect_words',
                    name: 'Highlight Incorrect Words',
                    categoryId: listeningCat.id,
                    description: 'Listen to an audio and identify words that differ from the transcript',
                    hasAiScoring: false,
                    maxScore: 1,
                    scoringCriteria: {},
                    displayOrder: 7,
                    instructions: 'You will hear a recording. Below is a transcription of the recording. Some words in the transcription differ from what the speaker said. Please click on the words that are different.',
                },
                {
                    code: 'write_from_dictation',
                    name: 'Write from Dictation',
                    categoryId: listeningCat.id,
                    description: 'Listen to a sentence and write it down',
                    hasAiScoring: true,
                    maxScore: 1,
                    scoringCriteria: {
                        content: { weight: 0.5, maxScore: 0.5 },
                        spelling: { weight: 0.5, maxScore: 0.5 },
                    },
                    timeLimit: 60,
                    displayOrder: 8,
                    instructions: 'You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.',
                },
            ])
            .returning();

        console.log(`✅ Inserted ${questionTypes.length} question types`);
        console.log('');
        console.log('📊 Summary:');
        console.log(`   Speaking: ${questionTypes.filter((qt) => qt.categoryId === speakingCat.id).length} types`);
        console.log(`   Writing: ${questionTypes.filter((qt) => qt.categoryId === writingCat.id).length} types`);
        console.log(`   Reading: ${questionTypes.filter((qt) => qt.categoryId === readingCat.id).length} types`);
        console.log(`   Listening: ${questionTypes.filter((qt) => qt.categoryId === listeningCat.id).length} types`);
        console.log('');
        console.log('✅ PTE data seeding completed successfully!');

        await client.end();
    } catch (error) {
        console.error('❌ Error seeding PTE data:', error);
        await client.end();
        process.exit(1);
    }
}

seedPTEData();
