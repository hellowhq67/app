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

// --- DATA POOLS ---

const TOPICS = [
    'Climate Change', 'Artificial Intelligence', 'Urban Planning', 'Marine Biology', 
    'Cognitive Psychology', 'Global Economics', 'Renewable Energy', 'Modern Architecture',
    'Linguistics', 'Space Exploration'
];

const PARAGRAPHS = [
    "The rapid advancement of artificial intelligence has sparked a global debate about the future of work. While some experts predict mass displacement of jobs, others argue that AI will create new categories of employment that we cannot yet imagine. The key transition will likely involve a shift towards tasks that require human empathy and creative problem-solving.",
    "Urban planning is no longer just about designing functional cities; it is about creating sustainable ecosystems. Architects and planners are increasingly incorporating green spaces and energy-efficient materials into their designs. This shift is driven by the urgent need to combat climate change and improve the quality of life for urban residents.",
    "Marine biologists have discovered that coral reefs are more resilient than previously thought. Recent studies show that some coral species can adapt to warmer ocean temperatures by altering their symbiotic relationships with algae. However, this adaptation process has its limits, and reducing carbon emissions remains crucial.",
    "In the field of cognitive psychology, memory is understood not as a static recording but as a reconstructive process. Every time we recall a memory, our brain effectively rewrites it, influenced by our current emotions and knowledge. This explains why eyewitness testimony can sometimes be unreliable.",
    "The global economy is becoming increasingly interconnected, with supply chains spanning multiple continents. While this has led to greater efficiency and lower prices for consumers, it has also created vulnerabilities. Disruptions in one part of the world can now have cascading effects on the entire global market.",
    "Renewable energy sources, such as solar and wind, are becoming cost-competitive with fossil fuels. This economic shift is accelerating the transition to a low-carbon economy. Governments around the world are implementing policies to support this transition, recognizing the long-term benefits for both the environment and the economy.",
    "Modern architecture often blends form and function, challenging traditional notions of space. The use of glass and steel allows for open, light-filled structures that integrate with their surroundings. Critics, however, argue that some modern designs lack the warmth and character of historical buildings.",
    "Linguistics, the scientific study of language, reveals the complex rules that govern how we communicate. From the sounds of speech to the structure of sentences, every language follows a systematic pattern. Understanding these patterns can help us develop better language teaching methods and translation technologies.",
    "Space exploration has entered a new era with the involvement of private companies. This commercialization of space is driving innovation and reducing the cost of launching satellites. The ultimate goal for many is the colonization of Mars, a feat that would fundamentally change humanity's place in the universe.",
    "The study of history provides valuable insights into the patterns of human behavior. By analyzing past events, historians attempt to understand the causes of conflict and the conditions for prosperity. This knowledge is essential for making informed decisions about the future."
];

const SENTENCES = [
    "The library will be closed for staff training tomorrow afternoon.",
    "Please ensure that your assignment is submitted by Friday.",
    "The results of the experiment were inconclusive.",
    "Climate change is a pressing issue for the global community.",
    "The university offers a wide range of extracurricular activities.",
    "Students are required to attend all laboratory sessions.",
    "The lecture will cover the history of the Roman Empire.",
    "Statistical analysis is a fundamental part of the research process.",
    "The economy is expected to recover in the next quarter.",
    "Effective communication is key to success in the workplace."
];

const ESSAY_PROMPTS = [
    "Do you think that technology has had a positive or negative impact on education? Support your opinion with reasons and examples.",
    "Some people believe that climate change is the most serious threat to the planet. To what extent do you agree or disagree?",
    "Should higher education be free for everyone? Discuss the advantages and disadvantages.",
    "Is it better to work in a team or independently? Give reasons for your answer.",
    "The rise of social media has changed the way we communicate. Has this change been positive or negative?",
    "Should governments impose stricter regulations on fast food companies to combat obesity?",
    "Is space exploration a waste of money, or is it essential for the future of humanity?",
    "Should art and music be mandatory subjects in schools?",
    "Does the media have too much influence on public opinion?",
    "Is it possible to balance economic growth with environmental protection?"
];

const SHORT_QUESTIONS = [
    { q: "What organ pumps blood through the body?", a: "Heart" },
    { q: "What do we call a period of 100 years?", a: "Century" },
    { q: "Which is the largest planet in our solar system?", a: "Jupiter" },
    { q: "What is the frozen form of water called?", a: "Ice" },
    { q: "What instrument is used to measure temperature?", a: "Thermometer" },
    { q: "What do bees collect from flowers?", a: "Nectar / Pollen" },
    { q: "Which season comes after winter?", a: "Spring" },
    { q: "What is the capital of France?", a: "Paris" },
    { q: "How many sides does a triangle have?", a: "Three" },
    { q: "What do you call a person who writes books?", a: "Author / Writer" }
];

// Placeholder URLs (In a real app, these would be real assets)
const AUDIO_URL = "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav"; 
const IMG_URL = "https://placehold.co/600x400/png";

async function seedRealQuestions() {
    try {
        console.log('🧹 Clearing existing questions...');
        await db.delete(pteSpeakingQuestions);
        await db.delete(pteWritingQuestions);
        await db.delete(pteReadingQuestions);
        await db.delete(pteListeningQuestions);
        await db.delete(pteQuestions);
        
        console.log('🌱 Seeding 10 questions for EACH type...');

        const questionTypes = await db.select().from(pteQuestionTypes);
        const findType = (code: string) => questionTypes.find(t => t.code === code);

        // --- HELPER TO INSERT BATCHES ---
        const insertBatch = async (typeCode: string, generator: (i: number) => any) => {
            const type = findType(typeCode);
            if (!type) return;
            console.log(`   Processing ${typeCode}...`);
            
            for (let i = 0; i < 10; i++) {
                const data = generator(i);
                // 1. Insert Base Question
                const [q] = await db.insert(pteQuestions).values({
                    questionTypeId: type.id,
                    title: `${type.name} - Set ${i + 1}`,
                    content: data.content,
                    difficulty: i < 3 ? 'Easy' : i < 7 ? 'Medium' : 'Hard',
                    correctAnswer: data.correctAnswer,
                    audioUrl: data.baseAudioUrl,
                    imageUrl: data.baseImageUrl
                }).returning();

                // 2. Insert Specific Details
                if (data.speaking) {
                    await db.insert(pteSpeakingQuestions).values({ questionId: q.id, ...data.speaking });
                } else if (data.writing) {
                    await db.insert(pteWritingQuestions).values({ questionId: q.id, ...data.writing });
                } else if (data.reading) {
                    await db.insert(pteReadingQuestions).values({ questionId: q.id, ...data.reading });
                } else if (data.listening) {
                    await db.insert(pteListeningQuestions).values({ questionId: q.id, ...data.listening });
                }
            }
        };

        // ================= SPEAKING =================

        // 1. Read Aloud
        await insertBatch('read_aloud', (i) => ({
            content: PARAGRAPHS[i],
            speaking: { expectedDuration: 40 }
        }));

        // 2. Repeat Sentence
        await insertBatch('repeat_sentence', (i) => ({
            content: "Listen and repeat.",
            speaking: { 
                audioPromptUrl: AUDIO_URL,
                sampleTranscript: SENTENCES[i]
            }
        }));

        // 3. Describe Image
        await insertBatch('describe_image', (i) => ({
            baseImageUrl: IMG_URL,
            title: `Describe Image: ${TOPICS[i]}`,
            speaking: { expectedDuration: 40 }
        }));

        // 4. Retell Lecture
        await insertBatch('retell_lecture', (i) => ({
            title: `Lecture: ${TOPICS[i]}`,
            speaking: { 
                audioPromptUrl: AUDIO_URL,
                keyPoints: ['Point A', 'Point B', 'Point C']
            }
        }));

        // 5. Answer Short Question
        await insertBatch('answer_short_question', (i) => ({
            title: `Short Answer ${i+1}`,
            correctAnswer: { text: SHORT_QUESTIONS[i].a },
            speaking: { 
                audioPromptUrl: AUDIO_URL,
                sampleTranscript: SHORT_QUESTIONS[i].q
            }
        }));

        // 6. Respond to Situation
        await insertBatch('respond_to_situation', (i) => ({
            content: `Situation ${i+1}: You are in a ${TOPICS[i]} class. Ask your professor for an extension.`,
            speaking: { expectedDuration: 60 }
        }));

        // 7. Summarize Group Discussion
        await insertBatch('summarize_group_discussion', (i) => ({
            title: `Discussion on ${TOPICS[i]}`,
            speaking: { 
                audioPromptUrl: AUDIO_URL,
                keyPoints: ['Agreement', 'Disagreement', 'Conclusion']
            }
        }));


        // ================= WRITING =================

        // 8. Summarize Written Text
        await insertBatch('summarize_written_text', (i) => ({
            content: PARAGRAPHS[i] + " " + PARAGRAPHS[(i+1)%10], // Make it longer
            writing: {
                promptText: "Summarize in one sentence.",
                wordCountMin: 5,
                wordCountMax: 75
            }
        }));

        // 9. Essay
        await insertBatch('essay', (i) => ({
            title: `Essay Topic ${i+1}`,
            writing: {
                promptText: ESSAY_PROMPTS[i],
                wordCountMin: 200,
                wordCountMax: 300,
                essayType: 'Argumentative'
            }
        }));


        // ================= READING =================

        // 10. Fill in Blanks (Dropdown)
        await insertBatch('reading_fill_blanks_dropdown', (i) => ({
            title: `Reading Blanks ${i+1}`,
            reading: {
                passageText: `The ${TOPICS[i]} is a [1] field. It requires [2] study.`,
                options: {
                    blanks: [
                        { position: 1, options: ['complex', 'simple', 'bad', 'red'] },
                        { position: 2, options: ['extensive', 'little', 'no', 'partial'] }
                    ]
                },
                correctAnswerPositions: [0, 0]
            }
        }));

        // 11. MCQ Multiple
        await insertBatch('reading_mc_multiple', (i) => ({
            content: PARAGRAPHS[i],
            reading: {
                passageText: PARAGRAPHS[i],
                questionText: "Which statements are true?",
                options: { choices: ['Statement A', 'Statement B', 'Statement C', 'Statement D'] },
                correctAnswerPositions: [0, 2]
            }
        }));

        // 12. Re-order Paragraphs
        await insertBatch('reorder_paragraphs', (i) => ({
            reading: {
                passageText: "Reorder",
                options: {
                    paragraphs: [
                        `First, regarding ${TOPICS[i]}...`,
                        "Secondly, we must consider...",
                        "Finally, the conclusion is...",
                        "However, there is a counterpoint."
                    ]
                },
                correctAnswerPositions: [0, 3, 1, 2]
            }
        }));

        // 13. Fill Blanks (Drag)
        await insertBatch('reading_fill_blanks_drag', (i) => ({
            reading: {
                passageText: `Research in [1] has shown [2] results.`,
                options: { choices: [TOPICS[i], 'promising', 'bad', 'slow', 'eating'] },
                correctAnswerPositions: [0, 1]
            }
        }));

        // 14. MCQ Single
        await insertBatch('reading_mc_single', (i) => ({
            content: PARAGRAPHS[i],
            reading: {
                passageText: PARAGRAPHS[i],
                questionText: "What is the main idea?",
                options: { choices: ['Idea A', 'Idea B', 'Idea C', 'Idea D'] },
                correctAnswerPositions: [0]
            }
        }));


        // ================= LISTENING =================

        // 15. Summarize Spoken Text
        await insertBatch('summarize_spoken_text', (i) => ({
            listening: {
                audioFileUrl: AUDIO_URL,
                transcript: `This lecture discusses ${TOPICS[i]}...`
            }
        }));

        // 16. MCQ Multiple
        await insertBatch('listening_mc_multiple', (i) => ({
            listening: {
                audioFileUrl: AUDIO_URL,
                questionText: "What did the speaker say?",
                options: { choices: ['Option A', 'Option B', 'Option C'] },
                correctAnswerPositions: [0, 1]
            }
        }));

        // 17. Fill Blanks
        await insertBatch('listening_fill_blanks', (i) => ({
            listening: {
                audioFileUrl: AUDIO_URL,
                transcript: `The [1] is [2].`,
                options: { blanks: [{pos: 1, ans: 'economy'}, {pos: 2, ans: 'growing'}] }
            }
        }));

        // 18. Highlight Correct Summary
        await insertBatch('highlight_correct_summary', (i) => ({
            listening: {
                audioFileUrl: AUDIO_URL,
                options: { summaries: ['Summary A', 'Summary B', 'Summary C'] },
                correctAnswerPositions: [0]
            }
        }));

        // 19. MCQ Single
        await insertBatch('listening_mc_single', (i) => ({
            listening: {
                audioFileUrl: AUDIO_URL,
                questionText: "Identify the tone.",
                options: { choices: ['Happy', 'Sad', 'Neutral'] },
                correctAnswerPositions: [2]
            }
        }));

        // 20. Select Missing Word
        await insertBatch('select_missing_word', (i) => ({
            listening: {
                audioFileUrl: AUDIO_URL,
                options: { choices: ['finished', 'started', 'gone'] },
                correctAnswerPositions: [0]
            }
        }));

        // 21. Highlight Incorrect Words
        await insertBatch('highlight_incorrect_words', (i) => ({
            listening: {
                audioFileUrl: AUDIO_URL,
                transcript: SENTENCES[i],
                options: { displayedText: SENTENCES[i].replace('training', 'raining') }, // deliberate error
                correctAnswerPositions: [5]
            }
        }));

        // 22. Write from Dictation
        await insertBatch('write_from_dictation', (i) => ({
            listening: {
                audioFileUrl: AUDIO_URL,
                transcript: SENTENCES[i]
            }
        }));

        console.log('✅ SEEDING COMPLETE! All types have 10 questions.');
        await client.end();

    } catch (error) {
        console.error('❌ Error seeding questions:', error);
        await client.end();
        process.exit(1);
    }
}

seedRealQuestions();
