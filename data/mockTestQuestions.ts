export enum MockTestType {
  FULL_TEST = "full_test",
  SPEAKING_SECTION = "speaking_section",
  WRITING_SECTION = "writing_section",
  READING_SECTION = "reading_section",
  LISTENING_SECTION = "listening_section",
}

export interface MockTestQuestion {
  id: string;
  type: MockTestType;
  question: string;
  instructions?: string;
  requiresTextInput?: boolean;
  hasImage?: boolean;
  hasAudio?: boolean;
  points?: number;
  timeLimit?: number; // in seconds
}

export const mockTestQuestions: MockTestQuestion[] = [
  // Full Test Questions (20 questions for 2-hour test)
  {
    id: "full_1",
    type: MockTestType.FULL_TEST,
    question: "Describe the image shown below in detail. You have 40 seconds to prepare and 40 seconds to speak.",
    instructions: "Speak clearly and cover all aspects of the image.",
    hasImage: true,
    points: 10,
    timeLimit: 80,
  },
  {
    id: "full_2",
    type: MockTestType.FULL_TEST,
    question: "Summarize the following text in one sentence. You have 10 minutes to write your summary.",
    instructions: "Include the main points and maintain the original meaning.",
    requiresTextInput: true,
    points: 15,
    timeLimit: 600,
  },
  {
    id: "full_3",
    type: MockTestType.FULL_TEST,
    question: "Read the following passage and answer the multiple-choice question.",
    instructions: "Choose the best answer based on the passage.",
    points: 8,
    timeLimit: 120,
  },
  {
    id: "full_4",
    type: MockTestType.FULL_TEST,
    question: "Listen to the audio and summarize what you heard.",
    instructions: "You will hear the audio only once. Take notes if needed.",
    hasAudio: true,
    points: 12,
    timeLimit: 90,
  },
  {
    id: "full_5",
    type: MockTestType.FULL_TEST,
    question: "Repeat the sentence exactly as you heard it.",
    instructions: "Listen carefully and repeat with correct pronunciation.",
    hasAudio: true,
    points: 5,
    timeLimit: 15,
  },
  {
    id: "full_6",
    type: MockTestType.FULL_TEST,
    question: "Read aloud the following text about climate change.",
    instructions: "Read clearly and at a natural pace.",
    points: 5,
    timeLimit: 30,
  },
  {
    id: "full_7",
    type: MockTestType.FULL_TEST,
    question: "Describe the process shown in the water cycle diagram.",
    instructions: "Cover all stages of the process in your description.",
    hasImage: true,
    points: 10,
    timeLimit: 80,
  },
  {
    id: "full_8",
    type: MockTestType.FULL_TEST,
    question: "Retell the lecture about artificial intelligence you just heard.",
    instructions: "Include the main points and examples from the lecture.",
    hasAudio: true,
    points: 15,
    timeLimit: 90,
  },
  {
    id: "full_9",
    type: MockTestType.FULL_TEST,
    question: "Write an essay on: 'Social media has changed human communication forever.'",
    instructions: "Write 200-300 words with clear arguments and examples.",
    requiresTextInput: true,
    points: 20,
    timeLimit: 1200,
  },
  {
    id: "full_10",
    type: MockTestType.FULL_TEST,
    question: "Read the academic passage and select the correct answer.",
    instructions: "Choose the option that best answers the question.",
    points: 8,
    timeLimit: 120,
  },
  {
    id: "full_11",
    type: MockTestType.FULL_TEST,
    question: "Re-order the paragraphs to create a coherent text about photosynthesis.",
    instructions: "Drag and drop the paragraphs in the correct order.",
    points: 10,
    timeLimit: 180,
  },
  {
    id: "full_12",
    type: MockTestType.FULL_TEST,
    question: "Fill in the blanks with the appropriate words from the dropdown.",
    instructions: "Choose from the dropdown options to complete the text.",
    points: 6,
    timeLimit: 90,
  },
  {
    id: "full_13",
    type: MockTestType.FULL_TEST,
    question: "Summarize the spoken text about renewable energy.",
    instructions: "You will hear a short lecture. Summarize it in 50-70 words.",
    hasAudio: true,
    requiresTextInput: true,
    points: 12,
    timeLimit: 120,
  },
  {
    id: "full_14",
    type: MockTestType.FULL_TEST,
    question: "Select the correct summary from the options about the lecture.",
    instructions: "Listen carefully and choose the best summary.",
    hasAudio: true,
    points: 8,
    timeLimit: 60,
  },
  {
    id: "full_15",
    type: MockTestType.FULL_TEST,
    question: "Fill in the blanks as you listen to the recording.",
    instructions: "Type the words you hear in the blanks.",
    hasAudio: true,
    requiresTextInput: true,
    points: 10,
    timeLimit: 90,
  },
  {
    id: "full_16",
    type: MockTestType.FULL_TEST,
    question: "Answer short question: What is the capital of Australia?",
    instructions: "Provide a brief, direct answer.",
    hasAudio: true,
    points: 5,
    timeLimit: 10,
  },
  {
    id: "full_17",
    type: MockTestType.FULL_TEST,
    question: "Describe the image of a busy city street.",
    instructions: "Provide detailed description of what you see.",
    hasImage: true,
    points: 10,
    timeLimit: 80,
  },
  {
    id: "full_18",
    type: MockTestType.FULL_TEST,
    question: "Summarize written text about global economics.",
    instructions: "Create a one-sentence summary of the passage.",
    requiresTextInput: true,
    points: 10,
    timeLimit: 600,
  },
  {
    id: "full_19",
    type: MockTestType.FULL_TEST,
    question: "Select missing word from the academic text.",
    instructions: "Choose the most appropriate word to complete the sentence.",
    points: 6,
    timeLimit: 60,
  },
  {
    id: "full_20",
    type: MockTestType.FULL_TEST,
    question: "Write from dictation - type the sentence you hear.",
    instructions: "Listen carefully and type exactly what you hear.",
    hasAudio: true,
    requiresTextInput: true,
    points: 8,
    timeLimit: 90,
  },

  // Speaking Section Questions
  {
    id: "speaking_1",
    type: MockTestType.SPEAKING_SECTION,
    question: "Read aloud the following text.",
    instructions: "Read clearly and at a natural pace.",
    points: 5,
    timeLimit: 30,
  },
  {
    id: "speaking_2",
    type: MockTestType.SPEAKING_SECTION,
    question: "Describe the process shown in the diagram.",
    instructions: "Cover all stages of the process in your description.",
    hasImage: true,
    points: 10,
    timeLimit: 80,
  },
  {
    id: "speaking_3",
    type: MockTestType.SPEAKING_SECTION,
    question: "Retell the lecture you just heard.",
    instructions: "Include the main points and examples from the lecture.",
    hasAudio: true,
    points: 15,
    timeLimit: 90,
  },

  // Writing Section Questions
  {
    id: "writing_1",
    type: MockTestType.WRITING_SECTION,
    question: "Summarize the written text in one sentence.",
    instructions: "Capture the main ideas while keeping it concise.",
    requiresTextInput: true,
    points: 10,
    timeLimit: 600,
  },
  {
    id: "writing_2",
    type: MockTestType.WRITING_SECTION,
    question: "Write an essay on the following topic: 'Technology has made our lives more complicated than simpler.'",
    instructions: "Write 200-300 words with clear arguments and examples.",
    requiresTextInput: true,
    points: 20,
    timeLimit: 1200,
  },

  // Reading Section Questions
  {
    id: "reading_1",
    type: MockTestType.READING_SECTION,
    question: "Read the passage and select the correct answer.",
    instructions: "Choose the option that best answers the question.",
    points: 8,
    timeLimit: 120,
  },
  {
    id: "reading_2",
    type: MockTestType.READING_SECTION,
    question: "Re-order the paragraphs to create a coherent text.",
    instructions: "Drag and drop the paragraphs in the correct order.",
    points: 10,
    timeLimit: 180,
  },
  {
    id: "reading_3",
    type: MockTestType.READING_SECTION,
    question: "Fill in the blanks with the appropriate words.",
    instructions: "Choose from the dropdown options to complete the text.",
    points: 6,
    timeLimit: 90,
  },

  // Listening Section Questions
  {
    id: "listening_1",
    type: MockTestType.LISTENING_SECTION,
    question: "Summarize the spoken text.",
    instructions: "You will hear a short lecture. Summarize it in 50-70 words.",
    hasAudio: true,
    requiresTextInput: true,
    points: 12,
    timeLimit: 120,
  },
  {
    id: "listening_2",
    type: MockTestType.LISTENING_SECTION,
    question: "Select the correct summary from the options.",
    instructions: "Listen carefully and choose the best summary.",
    hasAudio: true,
    points: 8,
    timeLimit: 60,
  },
  {
    id: "listening_3",
    type: MockTestType.LISTENING_SECTION,
    question: "Fill in the blanks as you listen.",
    instructions: "Type the words you hear in the blanks.",
    hasAudio: true,
    requiresTextInput: true,
    points: 10,
    timeLimit: 90,
  },
];

export function getMockTestTypeInfo(type: MockTestType) {
  switch (type) {
    case MockTestType.FULL_TEST:
      return {
        name: "Full Mock Test",
        description: "Complete 2-hour PTE Academic test with AI monitoring and proctoring",
        icon: "📋",
        duration: "2 hours",
        questions: "20",
      };
    case MockTestType.SPEAKING_SECTION:
      return {
        name: "Speaking Section",
        description: "Practice speaking tasks only",
        icon: "🎤",
        duration: "45 minutes",
        questions: "5",
      };
    case MockTestType.WRITING_SECTION:
      return {
        name: "Writing Section",
        description: "Practice writing tasks only",
        icon: "✍️",
        duration: "60 minutes",
        questions: "2",
      };
    case MockTestType.READING_SECTION:
      return {
        name: "Reading Section",
        description: "Practice reading comprehension tasks",
        icon: "📖",
        duration: "40 minutes",
        questions: "5",
      };
    case MockTestType.LISTENING_SECTION:
      return {
        name: "Listening Section",
        description: "Practice listening comprehension tasks",
        icon: "🎧",
        duration: "35 minutes",
        questions: "3",
      };
    default:
      return {
        name: "Unknown Test",
        description: "Test information not available",
        icon: "❓",
        duration: "N/A",
        questions: "0",
      };
  }
}
