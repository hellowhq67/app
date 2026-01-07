import { PTE_QUESTION_TYPES } from "@/constants/pte-constants";

export type WritingTestType =
  | typeof PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT
  | typeof PTE_QUESTION_TYPES.ESSAY;
  // Removed custom types that are not in standard constants to ensure consistency: 
  // "summarize-written-text-core", "write-email"

export interface WritingQuestion {
  id: string;
  type: WritingTestType;
  title: string;
  instruction: string;
  timeLimit: number; // seconds
  minWords: number;
  maxWords: number;
  content: WritingQuestionContent;
  difficulty: "easy" | "medium" | "hard";
}

interface WritingQuestionContent {
  sourceText?: string;
  essayPrompt?: string;
  emailContext?: string;
  emailTasks?: string[];
}

export const writingQuestions: WritingQuestion[] = [
  // ================== SUMMARIZE WRITTEN TEXT - 9 Questions ==================
  // Easy
  {
    id: "swt-1",
    type: PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT,
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "easy",
    content: {
      sourceText: "Sleep is essential for good health and well-being. During sleep, the body repairs tissues and the brain consolidates memories. Adults need seven to nine hours of sleep per night. Lack of sleep can lead to problems with concentration, mood, and overall health."
    }
  },
  {
    id: "swt-2",
    type: PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT,
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "easy",
    content: {
      sourceText: "Regular exercise provides numerous benefits for physical and mental health. It strengthens the heart, improves circulation, and helps maintain a healthy weight. Exercise also releases endorphins, which can reduce stress and improve mood. Experts recommend at least 30 minutes of moderate activity most days."
    }
  },
  {
    id: "swt-3",
    type: PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT,
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "easy",
    content: {
      sourceText: "Reading offers many advantages beyond entertainment. It expands vocabulary, improves concentration, and enhances critical thinking skills. Regular readers often have better writing abilities and broader knowledge. Whether fiction or non-fiction, reading stimulates the mind and can reduce stress."
    }
  },
  // Medium
  {
    id: "swt-4",
    type: PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT,
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "medium",
    content: {
      sourceText: "The rise of remote work has transformed the modern workplace. While it offers flexibility and eliminates commuting, it also presents challenges for collaboration and work-life balance. Companies are experimenting with hybrid models that combine in-office and remote work. This shift has implications for urban planning, real estate markets, and employee well-being. The long-term effects of this transformation are still being studied."
    }
  },
  {
    id: "swt-5",
    type: PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT,
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "medium",
    content: {
      sourceText: "Renewable energy sources are becoming increasingly important in addressing climate change. Solar and wind power have seen dramatic cost reductions, making them competitive with fossil fuels. However, challenges remain regarding energy storage and grid integration. Governments worldwide are implementing policies to accelerate the transition to clean energy. The shift requires significant investment in infrastructure and technology."
    }
  },
  {
    id: "swt-6",
    type: PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT,
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "medium",
    content: {
      sourceText: "Social media has fundamentally changed how people communicate and consume information. While it enables instant global connection and democratizes content creation, it has also contributed to misinformation spread and mental health concerns. Platforms are implementing measures to combat fake news and protect users. The debate continues about the appropriate level of regulation for these powerful communication tools."
    }
  },
  // Hard
  {
    id: "swt-7",
    type: PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT,
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "hard",
    content: {
      sourceText: "The concept of neuroplasticity has revolutionized our understanding of the brain. Contrary to earlier beliefs that brain structure was fixed after childhood, research now shows that neural connections can form and reorganize throughout life. This has profound implications for learning, rehabilitation after brain injury, and treating neurological disorders. Environmental factors, cognitive training, and physical exercise have all been shown to promote beneficial neural changes. The brain's remarkable adaptability offers hope for addressing age-related cognitive decline and recovering from stroke."
    }
  },
  {
    id: "swt-8",
    type: PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT,
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "hard",
    content: {
      sourceText: "The circular economy represents a fundamental shift from the traditional linear 'take-make-dispose' model of production and consumption. By designing products for durability, reuse, and recycling, this approach aims to minimize waste and maximize resource efficiency. Companies are increasingly adopting circular principles, driven by both environmental concerns and economic incentives. However, transitioning to a circular economy requires systemic changes in business models, consumer behavior, and policy frameworks. The potential benefits include reduced environmental impact, new business opportunities, and enhanced resource security."
    }
  },
  {
    id: "swt-9",
    type: PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT,
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "hard",
    content: {
      sourceText: "The ethics of artificial intelligence presents complex challenges for society. As AI systems become more autonomous and influential in decision-making, questions arise about accountability, bias, and transparency. Algorithms can perpetuate or amplify existing societal biases if trained on skewed data. The concept of 'explainable AI' has emerged as a response to concerns about black-box decision-making. Establishing ethical guidelines and governance frameworks is essential to ensure AI development benefits humanity while minimizing potential harms."
    }
  },

  // ================== WRITE ESSAY - 9 Questions ==================
  // Easy
  {
    id: "we-1",
    type: PTE_QUESTION_TYPES.ESSAY,
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "easy",
    content: {
      essayPrompt: "Do you agree or disagree that technology has improved our quality of life? Support your opinion with reasons and examples."
    }
  },
  {
    id: "we-2",
    type: PTE_QUESTION_TYPES.ESSAY,
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "easy",
    content: {
      essayPrompt: "Some people prefer to live in a big city, while others prefer small towns. Which do you prefer and why?"
    }
  },
  {
    id: "we-3",
    type: PTE_QUESTION_TYPES.ESSAY,
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "easy",
    content: {
      essayPrompt: "What are the advantages and disadvantages of learning a foreign language at school?"
    }
  },
  // Medium
  {
    id: "we-4",
    type: PTE_QUESTION_TYPES.ESSAY,
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "medium",
    content: {
      essayPrompt: "Some argue that governments should invest heavily in space exploration, while others believe this money would be better spent solving problems on Earth. Discuss both views and give your opinion."
    }
  },
  {
    id: "we-5",
    type: PTE_QUESTION_TYPES.ESSAY,
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "medium",
    content: {
      essayPrompt: "With the rise of social media, some people believe that traditional forms of communication are becoming obsolete. To what extent do you agree or disagree?"
    }
  },
  {
    id: "we-6",
    type: PTE_QUESTION_TYPES.ESSAY,
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "medium",
    content: {
      essayPrompt: "Some people think that universities should provide practical skills for the job market, while others believe the focus should be on academic knowledge. Discuss both perspectives."
    }
  },
  // Hard
  {
    id: "we-7",
    type: PTE_QUESTION_TYPES.ESSAY,
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "hard",
    content: {
      essayPrompt: "The increasing use of artificial intelligence in the workplace raises concerns about mass unemployment. However, others argue that AI will create more jobs than it eliminates. Analyze both perspectives and provide your assessment of how society should prepare for this transition."
    }
  },
  {
    id: "we-8",
    type: PTE_QUESTION_TYPES.ESSAY,
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "hard",
    content: {
      essayPrompt: "Some argue that in an era of globalization, national identities are becoming less relevant. Others contend that preserving cultural distinctiveness is more important than ever. Critically evaluate these opposing viewpoints and present a nuanced position."
    }
  },
  {
    id: "we-9",
    type: PTE_QUESTION_TYPES.ESSAY,
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "hard",
    content: {
      essayPrompt: "The tension between individual privacy rights and collective security in the digital age presents complex ethical dilemmas. Examine the arguments for and against government surveillance programs and propose a balanced framework for addressing this issue."
    }
  },
];

export function getWritingQuestionsByType(type: WritingTestType): WritingQuestion[] {
  return writingQuestions.filter(q => q.type === type);
}

export function getWritingQuestionsByDifficulty(difficulty: "easy" | "medium" | "hard"): WritingQuestion[] {
  return writingQuestions.filter(q => q.difficulty === difficulty);
}

export function getWritingTestTypeInfo(type: WritingTestType) {
  const info: Record<WritingTestType, { name: string; description: string; icon: string }> = {
    [PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT]: {
      name: "Summarize Written Text",
      description: "Summarize a passage in one sentence (5-75 words)",
      icon: "📋"
    },
    [PTE_QUESTION_TYPES.ESSAY]: {
      name: "Write Essay",
      description: "Write an essay of 200-300 words on a given topic",
      icon: "✍️"
    }
  };
  return info[type];
}
