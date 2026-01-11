
import { db } from '@/lib/db';
import { pteQuestions, pteSpeakingQuestions, pteWritingQuestions, pteReadingQuestions, pteListeningQuestions, pteQuestionTypes } from '@/lib/db/schema';
import { QuestionType } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const QUESTIONS_DATA = {
    "speaking_writing": {
        "personal_introduction": [
            {
                "prompt": "Please introduce yourself. Include your education background and future study plans.",
                "response_seconds": 30,
                "scored": false
            }
        ],
        "read_aloud": [
            {
                "text": "Climate change is one of the most significant challenges facing modern society, requiring global cooperation and sustainable solutions.",
                "prep_seconds": 30,
                "speak_seconds": 40
            },
            {
                "text": "Technological innovation has transformed the way people communicate, learn, and conduct business across international borders.",
                "prep_seconds": 30,
                "speak_seconds": 40
            }
        ],
        "repeat_sentence": [
            {
                "audio_text": "The university will announce the final examination schedule next Monday.",
                "audio_seconds": 6,
                "response_seconds": 15
            },
            {
                "audio_text": "Students are encouraged to submit their assignments before the deadline.",
                "audio_seconds": 5,
                "response_seconds": 15
            }
        ],
        "describe_image": [
            {
                "image_description": "A line graph showing a steady increase in global internet users from 2000 to 2020.",
                "prep_seconds": 25,
                "speak_seconds": 40
            },
            {
                "image_description": "A bar chart comparing renewable energy usage across five different countries.",
                "prep_seconds": 25,
                "speak_seconds": 40
            }
        ],
        "retell_lecture": [
            {
                "lecture_summary": "The lecture explains how artificial intelligence is being used in healthcare to improve diagnostics and patient outcomes.",
                "audio_seconds": 75,
                "prep_seconds": 10,
                "speak_seconds": 40
            }
        ],
        "answer_short_question": [
            {
                "audio_question": "What device is commonly used to measure temperature?",
                "correct_answer": "Thermometer",
                "response_seconds": 10
            },
            {
                "audio_question": "Which profession studies weather patterns?",
                "correct_answer": "Meteorologist",
                "response_seconds": 10
            }
        ],
        "summarize_written_text": [
            {
                "text": "Online education has expanded access to learning by removing geographical barriers. However, it also presents challenges such as reduced student engagement and limited hands-on experience.",
                "time_minutes": 10,
                "word_limit": { "min": 5, "max": 75 }
            }
        ],
        "write_essay": [
            {
                "prompt": "Do you agree or disagree that technology has improved the quality of education? Support your answer with reasons and examples.",
                "time_minutes": 20,
                "word_limit": { "min": 200, "max": 300 }
            }
        ],
        "write_email": [
            {
                "prompt": "You recently visited a hotel and left a personal item in your room. Write an email to the hotel manager describing the item and asking for help to return it.",
                "time_minutes": 9,
                "word_limit": { "min": 50, "max": 120 }
            }
        ],
        "respond_to_situation": [
            {
                "prompt_text": "You are organizing a team meeting. Your colleague is late. Call them and ask when they will arrive.",
                "response_seconds": 40,
                "prep_seconds": 10
            },
            {
                "prompt_text": "You received a damaged item from an online store. Call customer service to request a refund.",
                "response_seconds": 40,
                "prep_seconds": 10
            }
        ],
        "summarize_group_discussion": [
            {
                "audio_summary": "Three students discussing the pros and cons of online learning vs traditional classroom learning.",
                "response_seconds": 120, // 2 minutes
                "prep_seconds": 10
            }
        ]
    },
    "reading": {
        "rw_fill_blanks": [
            {
                "text": "Environmental policies aim to ______ pollution and promote sustainable development.",
                "options": ["reduce", "increase", "ignore", "expand"],
                "answer": "reduce"
            }
        ],
        "reading_mc_multiple": [
            {
                "question": "Which of the following are benefits of regular exercise?",
                "options": [
                    "Improved cardiovascular health",
                    "Increased stress levels",
                    "Better mental health",
                    "Reduced flexibility"
                ],
                "answers": [
                    "Improved cardiovascular health",
                    "Better mental health"
                ]
            }
        ],
        "reorder_paragraphs": [
            {
                "paragraphs": [
                    "As a result, many companies adopted remote work policies.",
                    "The pandemic changed traditional working environments.",
                    "Employees began using digital communication tools extensively."
                ],
                "correct_order": [1, 2, 0]
            }
        ],
        "reading_fill_blanks": [
            {
                "text": "Scientific research often requires careful ______ and accurate data collection.",
                "answer": "analysis" // Note: Usually FIB Drag sets have options pool, simplified here
            }
        ],
        "reading_mc_single": [
            {
                "question": "What is the main purpose of an abstract in an academic paper?",
                "options": [
                    "To present detailed results",
                    "To summarize the research",
                    "To list references",
                    "To describe methodology only"
                ],
                "answer": "To summarize the research"
            }
        ]
    },
    "listening": {
        "summarize_spoken_text": [
            {
                "audio_summary": "The speaker discusses the importance of renewable energy in reducing environmental impact and ensuring long-term sustainability.",
                "time_minutes": 10,
                "word_limit": { "min": 50, "max": 70 }
            }
        ],
        "listening_mc_multiple": [
            {
                "audio_question": "Which factors influence climate change?",
                "options": [
                    "Greenhouse gas emissions",
                    "Solar energy usage",
                    "Deforestation",
                    "Ocean currents"
                ],
                "answers": [
                    "Greenhouse gas emissions",
                    "Deforestation"
                ]
            }
        ],
        "listening_fill_blanks": [
            {
                "audio_text": "Economic growth depends heavily on innovation and skilled ______.",
                "answer": "labor"
            }
        ],
        "highlight_correct_summary": [
            {
                "audio_summary": "A lecture explaining how urban planning affects traffic congestion.",
                "options": [
                    "Urban planning has no effect on traffic.",
                    "Urban planning can reduce traffic congestion.",
                    "Traffic congestion is unavoidable.",
                    "Public transport is unnecessary."
                ],
                "answer": "Urban planning can reduce traffic congestion."
            }
        ],
        "listening_mc_single": [
            {
                "audio_question": "What is the main topic of the lecture?",
                "options": [
                    "Economic policy",
                    "Urban transportation",
                    "Medical research",
                    "Climate science"
                ],
                "answer": "Urban transportation"
            }
        ],
        "select_missing_word": [
            {
                "audio_text": "The experiment failed because the results were not ____.",
                "options": ["consistent", "random", "unclear", "simple"],
                "answer": "consistent"
            }
        ],
        "highlight_incorrect_words": [
            {
                "audio_text": "The scientist published the results in a popular cooking magazine.",
                "incorrect_words": ["cooking"]
            }
        ],
        "write_from_dictation": [
            {
                "audio_text": "Effective communication is essential for academic success."
            },
            {
                "audio_text": "Many students prefer online learning due to its flexibility."
            }
        ]
    }
};

const TYPE_MAP: Record<string, QuestionType> = {
    // Speaking & Writing
    "personal_introduction": QuestionType.PERSONAL_INTRODUCTION,
    "read_aloud": QuestionType.READ_ALOUD,
    "repeat_sentence": QuestionType.REPEAT_SENTENCE,
    "describe_image": QuestionType.DESCRIBE_IMAGE,
    "retell_lecture": QuestionType.RE_TELL_LECTURE,
    "answer_short_question": QuestionType.ANSWER_SHORT_QUESTION,
    "summarize_written_text": QuestionType.SUMMARIZE_WRITTEN_TEXT,
    "write_essay": QuestionType.WRITE_ESSAY,
    "write_email": QuestionType.WRITE_EMAIL,

    // Reading
    "rw_fill_blanks": QuestionType.READING_WRITING_BLANKS,
    "reading_mc_multiple": QuestionType.MULTIPLE_CHOICE_MULTIPLE,
    "reorder_paragraphs": QuestionType.REORDER_PARAGRAPHS,
    "reading_fill_blanks": QuestionType.READING_BLANKS,
    "reading_mc_single": QuestionType.MULTIPLE_CHOICE_SINGLE,

    // Listening
    "summarize_spoken_text": QuestionType.SUMMARIZE_SPOKEN_TEXT,
    "listening_mc_multiple": QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE,
    "listening_fill_blanks": QuestionType.LISTENING_BLANKS,
    "highlight_correct_summary": QuestionType.HIGHLIGHT_CORRECT_SUMMARY,
    "listening_mc_single": QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE,
    "select_missing_word": QuestionType.SELECT_MISSING_WORD,
    "highlight_incorrect_words": QuestionType.HIGHLIGHT_INCORRECT_WORDS,
    "write_from_dictation": QuestionType.WRITE_FROM_DICTATION,
    "respond_to_situation": QuestionType.RESPOND_TO_A_SITUATION,
    "summarize_group_discussion": QuestionType.SUMMARIZE_GROUP_DISCUSSION
};

// Target counts based on APEUni Table V4 (Academic Standard for User Request)
const TARGET_COUNTS: Record<string, number> = {
    "read_aloud": 6,
    "repeat_sentence": 10,
    "describe_image": 6,
    "retell_lecture": 3,
    "answer_short_question": 5,
    "summarize_written_text": 2,
    "write_essay": 1,
    "write_email": 1, // PTE Core
    "rw_fill_blanks": 5,
    "reading_mc_multiple": 2,
    "reorder_paragraphs": 2,
    "reading_fill_blanks": 4,
    "reading_mc_single": 2,
    "summarize_spoken_text": 1,
    "listening_mc_multiple": 2,
    "listening_fill_blanks": 2,
    "highlight_correct_summary": 2,
    "listening_mc_single": 2,
    "select_missing_word": 2,
    "highlight_incorrect_words": 2,
    "write_from_dictation": 3,
    "personal_introduction": 1,
    "respond_to_situation": 2, // PTE Core
    "summarize_group_discussion": 1 // PTE Core
};

async function seedQuestions() {
    console.log('[Seed] Starting Master Blueprint Question Seed (Full Mock Volume)...');

    // 1. Get Question Types Map
    const types = await db.select().from(pteQuestionTypes);
    const typeIdMap = new Map(types.map(t => [t.code, t.id]));

    for (const [section, tasks] of Object.entries(QUESTIONS_DATA)) {
        console.log(`Processing section: ${section}`);

        for (const [taskKey, items] of Object.entries(tasks)) {
            const qTypeEnum = TYPE_MAP[taskKey];
            if (!qTypeEnum) {
                console.warn(`Unknown task key: ${taskKey}`);
                continue;
            }

            const typeId = typeIdMap.get(qTypeEnum as any);
            if (!typeId) {
                console.warn(`Type ID not found for enum: ${qTypeEnum}`);
                continue;
            }

            // DETERMINE HOW MANY TO GENERATE
            const targetCount = TARGET_COUNTS[taskKey] || items.length;
            const baseItems = items as any[];

            console.log(`  -> Generating ${targetCount} items for ${taskKey}`);

            for (let i = 0; i < targetCount; i++) {
                // Cycle through base items
                const item = baseItems[i % baseItems.length];
                const questionId = uuidv4();

                // Determine Content and Title
                let title = `Practice ${taskKey.replace(/_/g, ' ')} #${i + 1}`;
                let content = item.text || item.prompt || item.audio_text || item.image_description || item.audio_question || item.lecture_summary || item.audio_summary || item.question || '';

                // Determine Correct Answer Structure
                let correctAnswer: any = null;
                if (item.correct_answer) {
                    correctAnswer = { text: item.correct_answer };
                } else if (item.answer) {
                    correctAnswer = { text: item.answer };
                } else if (item.answers) {
                    correctAnswer = { answers: item.answers };
                } else if (item.correct_order) {
                    correctAnswer = { order: item.correct_order };
                } else if (item.incorrect_words) {
                    correctAnswer = { words: item.incorrect_words };
                }

                // Base Insert
                await db.insert(pteQuestions).values({
                    id: questionId,
                    questionTypeId: typeId,
                    title: title,
                    content: content,
                    difficulty: 'Medium',
                    isActive: true, // Default to active
                    correctAnswer: correctAnswer,
                    metadata: {
                        prep_seconds: item.prep_seconds,
                        response_seconds: item.response_seconds || item.speak_seconds,
                        audio_seconds: item.audio_seconds,
                        source: 'Master Blueprint Seed 2.0 Full Mock'
                    }
                });

                // Extended Table Insert
                try {
                    // Speaking Extended
                    if (['read_aloud', 'repeat_sentence', 'describe_image', 'retell_lecture', 'answer_short_question'].includes(taskKey)) {
                        await db.insert(pteSpeakingQuestions).values({
                            questionId: questionId,
                            expectedDuration: item.speak_seconds || item.response_seconds,
                            sampleTranscript: item.audio_text || item.audio_question || item.lecture_summary || null
                        });
                    }
                    else if (taskKey === 'personal_introduction') {
                        await db.insert(pteSpeakingQuestions).values({
                            questionId: questionId,
                            expectedDuration: item.response_seconds,
                            sampleTranscript: null
                        });
                    }

                    // Writing Extended
                    else if (['write_essay', 'summarize_written_text'].includes(taskKey)) {
                        await db.insert(pteWritingQuestions).values({
                            questionId: questionId,
                            promptText: content,
                            wordCountMin: item.word_limit?.min || 0,
                            wordCountMax: item.word_limit?.max || 0
                        });
                    }
                    else if (taskKey === 'write_email') {
                        await db.insert(pteWritingQuestions).values({
                            questionId: questionId,
                            promptText: content,
                            wordCountMin: item.word_limit?.min || 50,
                            wordCountMax: item.word_limit?.max || 120,
                            essayType: 'email'
                        });
                    }

                    // Reading Extended
                    else if (taskKey === 'rw_fill_blanks') {
                        await db.insert(pteReadingQuestions).values({
                            questionId: questionId,
                            passageText: content,
                            options: { choices: item.options },
                        });
                    }
                    else if (taskKey === 'reading_mc_multiple' || taskKey === 'reading_mc_single') {
                        // Calculate indices if possible
                        let indices = [];
                        if (item.options && (item.answers || item.answer)) {
                            const answers = item.answers || [item.answer];
                            indices = answers.map((a: string) => item.options.indexOf(a)).filter((i: number) => i !== -1);
                        }
                        await db.insert(pteReadingQuestions).values({
                            questionId: questionId,
                            passageText: item.question || content, // Use question as passageText for MC
                            options: { choices: item.options },
                            correctAnswerPositions: indices.length > 0 ? indices : null
                        });
                    }
                    else if (taskKey === 'reorder_paragraphs') {
                        await db.insert(pteReadingQuestions).values({
                            questionId: questionId,
                            passageText: JSON.stringify(item.paragraphs),
                            options: { paragraphs: item.paragraphs },
                            correctAnswerPositions: item.correct_order
                        });
                    }
                    else if (taskKey === 'reading_fill_blanks') {
                        await db.insert(pteReadingQuestions).values({
                            questionId: questionId,
                            passageText: item.text,
                            options: { choices: [] }, // Simplified for now
                        });
                    }

                    // Listening Extended
                    else if (taskKey === 'summarize_spoken_text') {
                        await db.insert(pteListeningQuestions).values({
                            questionId: questionId,
                            audioFileUrl: 'placeholder.mp3', // Placeholder
                            audioDuration: 60, // Placeholder
                            transcript: item.audio_summary,
                            questionText: 'Summarize the spoken text',
                            // Reuse writing schema fields? No, schema specific.
                        });
                    }
                    else if (taskKey === 'listening_mc_multiple' || taskKey === 'listening_mc_single' || taskKey === 'highlight_correct_summary') {
                        let indices = [];
                        if (item.options && (item.answers || item.answer)) {
                            const answers = item.answers || [item.answer];
                            indices = answers.map((a: string) => item.options.indexOf(a)).filter((i: number) => i !== -1);
                        }
                        await db.insert(pteListeningQuestions).values({
                            questionId: questionId,
                            audioFileUrl: 'placeholder.mp3',
                            transcript: item.audio_question || item.audio_summary,
                            questionText: item.audio_question || item.audio_summary,
                            options: { choices: item.options },
                            correctAnswerPositions: indices.length > 0 ? indices : null
                        });
                    }
                    else if (taskKey === 'listening_fill_blanks' || taskKey === 'select_missing_word' || taskKey === 'write_from_dictation') {
                        await db.insert(pteListeningQuestions).values({
                            questionId: questionId,
                            audioFileUrl: 'placeholder.mp3',
                            transcript: item.audio_text,
                            questionText: item.audio_text,
                            options: item.options ? { choices: item.options } : null
                        });
                    }
                    else if (taskKey === 'highlight_incorrect_words') {
                        await db.insert(pteListeningQuestions).values({
                            questionId: questionId,
                            audioFileUrl: 'placeholder.mp3',
                            transcript: item.audio_text,
                            questionText: item.audio_text
                        });
                    }
                    else if (taskKey === 'respond_to_situation') {
                        await db.insert(pteSpeakingQuestions).values({
                            questionId: questionId,
                            expectedDuration: item.response_seconds || 40,
                            sampleTranscript: item.prompt_text // Use prompt text as transcript for this type
                        });
                    }
                    else if (taskKey === 'summarize_group_discussion') {
                        await db.insert(pteSpeakingQuestions).values({
                            questionId: questionId,
                            expectedDuration: item.response_seconds || 120, // 2 minutes
                            sampleTranscript: item.audio_summary || "Sample discussion summary"
                        });
                    }

                } catch (err) {
                    console.error(`Error inserting detailed question ${questionId} (${taskKey}):`, err);
                }
            }
        }
    }
    console.log('[Seed] Completed.');
    process.exit(0);
}

seedQuestions();
