import { PTEQuestion } from '@/types/pte-types';
import { PTE_QUESTION_TYPES, PTE_SECTIONS } from '@/constants/pte-constants';

export const PTE_SAMPLE_QUESTIONS: PTEQuestion[] = [
  // Speaking & Writing Section Questions
  {
    id: 'q1',
    type: PTE_QUESTION_TYPES.READ_ALOUD,
    section: PTE_SECTIONS.SPEAKING_WRITING,
    number: 1,
    content: {
      text: 'The development of artificial intelligence has revolutionized numerous industries, from healthcare to finance. Machine learning algorithms can now diagnose diseases, predict market trends, and even create art. As we continue to advance this technology, it is crucial to consider both its potential benefits and ethical implications for society.'
    },
    timing: {
      preparation: 35,
      response: 40,
      total: 75
    },
    instructions: 'Read the text aloud clearly and at a natural pace.',
    hasAIScoring: true,
    audioRestrictions: { maxPlays: 0 }
  },
  
  {
    id: 'q2',
    type: PTE_QUESTION_TYPES.REPEAT_SENTENCE,
    section: PTE_SECTIONS.SPEAKING_WRITING,
    number: 2,
    content: {
      audioUrl: '/audio/repeat-sentence-1.mp3',
      question: 'Repeat this sentence exactly as you hear it.'
    },
    timing: {
      response: 15,
      total: 15
    },
    instructions: 'Listen carefully and repeat the sentence exactly.',
    hasAIScoring: true,
    audioRestrictions: { maxPlays: 1 }
  },

  {
    id: 'q3',
    type: PTE_QUESTION_TYPES.DESCRIBE_IMAGE,
    section: PTE_SECTIONS.SPEAKING_WRITING,
    number: 3,
    content: {
      imageUrl: '/images/describe-chart-1.png',
      question: 'Describe the image in detail.'
    },
    timing: {
      preparation: 25,
      response: 40,
      total: 65
    },
    instructions: 'Study the image for 25 seconds, then describe it in detail.',
    hasAIScoring: true,
    audioRestrictions: { maxPlays: 0 }
  },

  {
    id: 'q4',
    type: PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT,
    section: PTE_SECTIONS.SPEAKING_WRITING,
    number: 4,
    content: {
      text: 'Climate change represents one of the most significant challenges facing humanity in the 21st century. Rising global temperatures, melting ice caps, and extreme weather events are just some of the visible impacts. While governments and organizations worldwide are implementing various mitigation strategies, the scale of the problem requires unprecedented international cooperation and immediate action to prevent irreversible damage to our planet\'s ecosystems.',
      question: 'Summarize the text in one sentence.'
    },
    timing: {
      response: 600, // 10 minutes
      total: 600
    },
    instructions: 'Summarize the passage in one sentence.',
    hasAIScoring: true,
    wordCount: {
      min: 5,
      max: 75,
      target: 30
    }
  },

  {
    id: 'q5',
    type: PTE_QUESTION_TYPES.ESSAY,
    section: PTE_SECTIONS.SPEAKING_WRITING,
    number: 5,
    content: {
      question: 'Technology has made the world a better place to live. Do you agree or disagree? Provide specific reasons and examples to support your position.',
      text: 'Write an essay of 200-300 words on whether technology has made the world a better place to live.'
    },
    timing: {
      response: 1200, // 20 minutes
      total: 1200
    },
    instructions: 'Write an essay of 200-300 words.',
    hasAIScoring: true,
    wordCount: {
      min: 200,
      max: 300,
      target: 250
    }
  },

  // Reading Section Questions
  {
    id: 'q6',
    type: PTE_QUESTION_TYPES.FILL_IN_BLANKS_DROPDOWN,
    section: PTE_SECTIONS.READING,
    number: 6,
    content: {
      text: 'The rapid advancement of technology has ___ transformed the way we communicate and work. Social media platforms have ___ changed interpersonal relationships, while artificial intelligence is ___ various industries.',
      blanks: [
        {
          id: 'blank1',
          position: 0,
          options: ['significantly', 'gradually', 'slowly', 'barely']
        },
        {
          id: 'blank2', 
          position: 1,
          options: ['fundamentally', 'slightly', 'barely', 'occasionally']
        },
        {
          id: 'blank3',
          position: 2,
          options: ['revolutionizing', 'improving', 'ignoring', 'maintaining']
        }
      ]
    },
    timing: {
      response: 90,
      total: 90
    },
    instructions: 'Select the correct word for each blank.',
    hasAIScoring: false
  },

  {
    id: 'q7',
    type: PTE_QUESTION_TYPES.MC_MULTIPLE_ANSWERS_READING,
    section: PTE_SECTIONS.READING,
    number: 7,
    content: {
      passage: 'Renewable energy sources have gained significant attention in recent years as concerns about climate change and environmental sustainability grow. Solar power, wind energy, and hydroelectric power are among the most promising alternatives to fossil fuels. These sources not only reduce greenhouse gas emissions but also offer long-term economic benefits through energy independence and job creation in green technology sectors.',
      question: 'Which of the following are mentioned as benefits of renewable energy?',
      options: [
        { id: 'a', text: 'Reduced greenhouse gas emissions', isCorrect: true },
        { id: 'b', text: 'Lower initial investment costs', isCorrect: false },
        { id: 'c', text: 'Energy independence', isCorrect: true },
        { id: 'd', text: 'Job creation in green technology', isCorrect: true },
        { id: 'e', text: 'Immediate global adoption', isCorrect: false }
      ]
    },
    timing: {
      response: 120,
      total: 120
    },
    instructions: 'Select all correct answers.',
    hasAIScoring: false
  },

  {
    id: 'q8',
    type: PTE_QUESTION_TYPES.REORDER_PARAGRAPHS,
    section: PTE_SECTIONS.READING,
    number: 8,
    content: {
      sentences: [
        'This has led to increased efficiency and productivity.',
        'Artificial intelligence is transforming various industries.',
        'Machine learning algorithms can process vast amounts of data.',
        'Healthcare, finance, and transportation are key sectors affected.'
      ]
    },
    timing: {
      response: 150,
      total: 150
    },
    instructions: 'Arrange the sentences in the correct order to form a coherent paragraph.',
    hasAIScoring: false
  },

  // Listening Section Questions
  {
    id: 'q9',
    type: PTE_QUESTION_TYPES.SUMMARIZE_SPOKEN_TEXT,
    section: PTE_SECTIONS.LISTENING,
    number: 9,
    content: {
      audioUrl: '/audio/summarize-spoken-1.mp3',
      question: 'Listen to the recording and write a summary.'
    },
    timing: {
      response: 600, // 10 minutes
      total: 600
    },
    instructions: 'Write a 50-70 word summary of what you heard.',
    hasAIScoring: true,
    wordCount: {
      min: 50,
      max: 70,
      target: 60
    }
  },

  {
    id: 'q10',
    type: PTE_QUESTION_TYPES.HIGHLIGHT_INCORRECT_WORDS,
    section: PTE_SECTIONS.LISTENING,
    number: 10,
    content: {
      audioUrl: '/audio/highlight-incorrect-1.mp3',
      transcript: 'The research team discovered that climate change affects marine ecosystems significantly. Rising ocean temperatures are causing coral bleaching events, while increased carbon dioxide levels are making seawater more acidic. These changes threaten biodiversity and could impact global food security.'
    },
    timing: {
      response: 90,
      total: 90
    },
    instructions: 'Listen and highlight words in the transcript that differ from the audio.',
    hasAIScoring: false
  },

  {
    id: 'q11',
    type: PTE_QUESTION_TYPES.WRITE_FROM_DICTATION,
    section: PTE_SECTIONS.LISTENING,
    number: 11,
    content: {
      audioUrl: '/audio/write-from-dictation-1.mp3'
    },
    timing: {
      response: 45,
      total: 45
    },
    instructions: 'Type exactly what you hear.',
    hasAIScoring: false
  }
];

export const PTE_SECTION_BREAKDOWN = {
  [PTE_SECTIONS.SPEAKING_WRITING]: {
    questions: PTE_SAMPLE_QUESTIONS.filter(q => q.section === PTE_SECTIONS.SPEAKING_WRITING),
    duration: 93 * 60 // 93 minutes in seconds
  },
  [PTE_SECTIONS.READING]: {
    questions: PTE_SAMPLE_QUESTIONS.filter(q => q.section === PTE_SECTIONS.READING),
    duration: 41 * 60 // 41 minutes in seconds
  },
  [PTE_SECTIONS.LISTENING]: {
    questions: PTE_SAMPLE_QUESTIONS.filter(q => q.section === PTE_SECTIONS.LISTENING),
    duration: 57 * 60 // 57 minutes in seconds
  }
};
