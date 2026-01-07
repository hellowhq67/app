import { PTEQuestion } from '@/lib/types/qustionsType';
import { PTE_SECTIONS, PTE_QUESTION_TYPES, PTE_QUESTION_TIMING, PTE_AUDIO_RESTRICTIONS, PTE_WORD_COUNTS } from '@/constants/pte-constants';

// Sample questions for each section
export const PTE_SAMPLE_QUESTIONS: PTEQuestion[] = [
    // Speaking & Writing Section
    {
        id: 'ra-001',
        type: PTE_QUESTION_TYPES.READ_ALOUD,
        section: PTE_SECTIONS.SPEAKING_WRITING,
        number: 1,
        content: {
            text: 'Climate change is one of the most pressing issues facing our planet today. Scientists around the world have documented rising temperatures, melting ice caps, and increasingly severe weather patterns that threaten ecosystems and human communities alike.'
        },
        timing: PTE_QUESTION_TIMING[PTE_QUESTION_TYPES.READ_ALOUD],
        instructions: 'Look at the text below. In 35 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.',
        hasAIScoring: true
    },
    {
        id: 'rs-001',
        type: PTE_QUESTION_TYPES.REPEAT_SENTENCE,
        section: PTE_SECTIONS.SPEAKING_WRITING,
        number: 2,
        content: {
            audioUrl: '/audio/repeat-sentence-1.mp3',
            text: 'The university library will be closed for renovations during the summer break.'
        },
        timing: PTE_QUESTION_TIMING[PTE_QUESTION_TYPES.REPEAT_SENTENCE],
        instructions: 'You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.',
        hasAIScoring: true,
        audioRestrictions: PTE_AUDIO_RESTRICTIONS[PTE_QUESTION_TYPES.REPEAT_SENTENCE]
    },
    {
        id: 'di-001',
        type: PTE_QUESTION_TYPES.DESCRIBE_IMAGE,
        section: PTE_SECTIONS.SPEAKING_WRITING,
        number: 3,
        content: {
            imageUrl: '/images/graph-population-growth.png',
            text: 'Population Growth Chart showing trends from 1950-2020'
        },
        timing: PTE_QUESTION_TIMING[PTE_QUESTION_TYPES.DESCRIBE_IMAGE],
        instructions: 'Look at the image below. In 25 seconds, please describe what you see in detail. You will have 40 seconds to give your response.',
        hasAIScoring: true
    },
    {
        id: 'swt-001',
        type: PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT,
        section: PTE_SECTIONS.SPEAKING_WRITING,
        number: 4,
        content: {
            text: 'The development of artificial intelligence has transformed numerous industries over the past decade. From healthcare diagnostics to autonomous vehicles, AI systems are now capable of performing complex tasks that were once thought to be exclusively human domains. Machine learning algorithms can analyze vast datasets to identify patterns and make predictions with remarkable accuracy. However, this rapid advancement has also raised important ethical questions about privacy, job displacement, and the potential risks of increasingly autonomous systems. Researchers and policymakers are now working together to develop frameworks that ensure AI technologies are developed and deployed responsibly.',
            question: 'Read the passage below and summarize it using one sentence.'
        },
        timing: PTE_QUESTION_TIMING[PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT],
        instructions: 'Read the passage below and summarize it using one sentence. Type your response in the box at the bottom of the screen. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points in the passage.',
        hasAIScoring: true,
        wordCount: PTE_WORD_COUNTS[PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT]
    },
    {
        id: 'essay-001',
        type: PTE_QUESTION_TYPES.ESSAY,
        section: PTE_SECTIONS.SPEAKING_WRITING,
        number: 5,
        content: {
            question: 'Do you agree or disagree with the following statement? "Technology has made our lives more stressful rather than less stressful." Use specific reasons and examples to support your answer.'
        },
        timing: PTE_QUESTION_TIMING[PTE_QUESTION_TYPES.ESSAY],
        instructions: 'You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your ideas, present supporting details, and control the elements of standard written English.',
        hasAIScoring: true,
        wordCount: PTE_WORD_COUNTS[PTE_QUESTION_TYPES.ESSAY]
    },

    // Reading Section
    {
        id: 'mcr-001',
        type: PTE_QUESTION_TYPES.MC_MULTIPLE_ANSWERS_READING,
        section: PTE_SECTIONS.READING,
        number: 6,
        content: {
            passage: 'The Amazon rainforest, often referred to as the "lungs of the Earth," plays a crucial role in regulating the global climate. This vast ecosystem spans across nine countries in South America and is home to approximately 10% of all species on Earth. Recent studies have shown that deforestation rates have accelerated dramatically over the past two decades, primarily due to agricultural expansion and logging activities. Scientists warn that if current trends continue, the rainforest could reach a "tipping point" where it begins to die off and release massive amounts of stored carbon into the atmosphere.',
            question: 'According to the passage, which of the following statements are true?',
            options: [
                { id: 'a', text: 'The Amazon rainforest is found in nine South American countries', isCorrect: true },
                { id: 'b', text: 'The rainforest contains about 10% of Earth\'s species', isCorrect: true },
                { id: 'c', text: 'Deforestation has decreased in recent years', isCorrect: false },
                { id: 'd', text: 'Scientists are concerned about a potential tipping point', isCorrect: true },
                { id: 'e', text: 'Agricultural expansion is the only cause of deforestation', isCorrect: false }
            ]
        },
        timing: PTE_QUESTION_TIMING[PTE_QUESTION_TYPES.MC_MULTIPLE_ANSWERS_READING],
        instructions: 'Read the text and answer the question by selecting all the correct responses. More than one response is correct.',
        hasAIScoring: false
    },
    {
        id: 'rop-001',
        type: PTE_QUESTION_TYPES.REORDER_PARAGRAPHS,
        section: PTE_SECTIONS.READING,
        number: 7,
        content: {
            sentences: [
                'However, the process of photosynthesis is far more complex than this simple equation suggests.',
                'Plants use sunlight, water, and carbon dioxide to produce glucose and oxygen.',
                'Photosynthesis is the fundamental process by which plants convert light energy into chemical energy.',
                'This glucose serves as the primary source of energy for plant growth and development.',
                'Multiple enzyme-catalyzed reactions take place within specialized cell structures called chloroplasts.'
            ]
        },
        timing: PTE_QUESTION_TIMING[PTE_QUESTION_TYPES.REORDER_PARAGRAPHS],
        instructions: 'The text boxes below have been placed in a random order. Restore the original order by dragging the text boxes from the left panel to the right panel.',
        hasAIScoring: false
    },
    {
        id: 'fib-dd-001',
        type: PTE_QUESTION_TYPES.FILL_IN_BLANKS_DRAG_DROP,
        section: PTE_SECTIONS.READING,
        number: 8,
        content: {
            passage: 'The human brain is a remarkably _____ organ that continues to develop throughout our lives. Neural _____ refers to the brain\'s ability to reorganize itself by forming new connections. This process is particularly _____ during childhood but continues into adulthood. Recent research has shown that activities like learning new skills and regular _____ can enhance neural plasticity.',
            wordBank: ['complex', 'simple', 'plasticity', 'rigidity', 'active', 'passive', 'exercise', 'relaxation'],
            blanks: [
                { id: 'blank-1', position: 1, correctAnswer: 'complex' },
                { id: 'blank-2', position: 2, correctAnswer: 'plasticity' },
                { id: 'blank-3', position: 3, correctAnswer: 'active' },
                { id: 'blank-4', position: 4, correctAnswer: 'exercise' }
            ]
        },
        timing: PTE_QUESTION_TIMING[PTE_QUESTION_TYPES.FILL_IN_BLANKS_DRAG_DROP],
        instructions: 'In the text below some words are missing. Drag words from the box below to the appropriate place in the text. To undo an answer choice, drag the word back to the box below the text.',
        hasAIScoring: false
    },

    // Listening Section
    {
        id: 'sst-001',
        type: PTE_QUESTION_TYPES.SUMMARIZE_SPOKEN_TEXT,
        section: PTE_SECTIONS.LISTENING,
        number: 9,
        content: {
            audioUrl: '/audio/lecture-economics.mp3',
            transcript: 'Today we will discuss the principles of behavioral economics and how psychological factors influence economic decision-making. Traditional economic theory assumes that people always make rational choices to maximize their utility. However, behavioral economists have demonstrated that human decision-making is often influenced by cognitive biases, emotions, and social factors.'
        },
        timing: PTE_QUESTION_TIMING[PTE_QUESTION_TYPES.SUMMARIZE_SPOKEN_TEXT],
        instructions: 'You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50-70 words. You have 10 minutes to finish this task.',
        hasAIScoring: true,
        audioRestrictions: PTE_AUDIO_RESTRICTIONS[PTE_QUESTION_TYPES.SUMMARIZE_SPOKEN_TEXT],
        wordCount: PTE_WORD_COUNTS[PTE_QUESTION_TYPES.SUMMARIZE_SPOKEN_TEXT]
    },
    {
        id: 'wfd-001',
        type: PTE_QUESTION_TYPES.WRITE_FROM_DICTATION,
        section: PTE_SECTIONS.LISTENING,
        number: 10,
        content: {
            audioUrl: '/audio/dictation-1.mp3',
            text: 'Students must submit their assignments before the deadline to avoid penalties.'
        },
        timing: PTE_QUESTION_TIMING[PTE_QUESTION_TYPES.WRITE_FROM_DICTATION],
        instructions: 'You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.',
        hasAIScoring: false,
        audioRestrictions: PTE_AUDIO_RESTRICTIONS[PTE_QUESTION_TYPES.WRITE_FROM_DICTATION]
    }
];

// Section breakdown for the mock test
export const PTE_SECTION_BREAKDOWN = {
    [PTE_SECTIONS.SPEAKING_WRITING]: {
        name: 'Speaking & Writing',
        duration: 93 * 60,
        questionCount: 5,
        questions: PTE_SAMPLE_QUESTIONS.filter(q => q.section === PTE_SECTIONS.SPEAKING_WRITING)
    },
    [PTE_SECTIONS.READING]: {
        name: 'Reading',
        duration: 41 * 60,
        questionCount: 3,
        questions: PTE_SAMPLE_QUESTIONS.filter(q => q.section === PTE_SECTIONS.READING)
    },
    [PTE_SECTIONS.LISTENING]: {
        name: 'Listening',
        duration: 57 * 60,
        questionCount: 2,
        questions: PTE_SAMPLE_QUESTIONS.filter(q => q.section === PTE_SECTIONS.LISTENING)
    }
};

export default PTE_SAMPLE_QUESTIONS;
