import { db } from './drizzle';
import { pteCategories, pteQuestionTypes, pteQuestions, pteSpeakingQuestions, pteWritingQuestions, pteReadingQuestions, pteListeningQuestions } from './schema';
import { nanoid } from 'nanoid';

async function seedPteData() {
  try {
    console.log('🌱 Starting PTE data seeding...');

    // 1. Seed PTE Categories
    console.log('📁 Seeding PTE categories...');
    const categories = await db.insert(pteCategories).values([
      {
        code: 'speaking',
        name: 'Speaking',
        description: 'Test your English speaking abilities with various tasks',
        displayOrder: 1,
        isActive: true,
      },
      {
        code: 'writing',
        name: 'Writing',
        description: 'Evaluate your English writing skills',
        displayOrder: 2,
        isActive: true,
      },
      {
        code: 'reading',
        name: 'Reading',
        description: 'Assess your English reading comprehension',
        displayOrder: 3,
        isActive: true,
      },
      {
        code: 'listening',
        name: 'Listening',
        description: 'Measure your English listening comprehension',
        displayOrder: 4,
        isActive: true,
      },
    ]).returning();

    const categoryMap = new Map(categories.map(cat => [cat.code, cat.id]));

    // 2. Seed PTE Question Types
    console.log('📝 Seeding PTE question types...');
    const questionTypes = await db.insert(pteQuestionTypes).values([
      // Speaking Types
      {
        code: 'read_aloud',
        name: 'Read Aloud',
        categoryId: categoryMap.get('speaking')!,
        description: 'Read a text aloud',
        hasAiScoring: true,
        maxScore: 90,
        scoringCriteria: {
          pronunciation: { weight: 0.3, maxScore: 27 },
          fluency: { weight: 0.3, maxScore: 27 },
          content: { weight: 0.4, maxScore: 36 },
        },
        timeLimit: 40,
        displayOrder: 1,
        instructions: 'Read the text aloud clearly and naturally',
        metadata: {
          difficulty: 'Easy',
          tips: ['Practice pronunciation', 'Maintain steady pace', 'Emphasize key words'],
          commonMistakes: ['Speaking too fast', 'Mispronouncing words', 'Pausing incorrectly'],
        },
      },
      {
        code: 'repeat_sentence',
        name: 'Repeat Sentence',
        categoryId: categoryMap.get('speaking')!,
        description: 'Repeat a sentence you hear',
        hasAiScoring: true,
        maxScore: 90,
        scoringCriteria: {
          pronunciation: { weight: 0.3, maxScore: 27 },
          fluency: { weight: 0.3, maxScore: 27 },
          content: { weight: 0.4, maxScore: 36 },
        },
        timeLimit: 15,
        displayOrder: 2,
        instructions: 'Listen carefully and repeat the sentence exactly',
        metadata: {
          difficulty: 'Medium',
          tips: ['Focus on key words', 'Note the sentence structure', 'Practice active listening'],
          commonMistakes: ['Missing words', 'Incorrect word order', 'Poor pronunciation'],
        },
      },
      {
        code: 'describe_image',
        name: 'Describe Image',
        categoryId: categoryMap.get('speaking')!,
        description: 'Describe an image in detail',
        hasAiScoring: true,
        maxScore: 90,
        scoringCriteria: {
          pronunciation: { weight: 0.2, maxScore: 18 },
          fluency: { weight: 0.2, maxScore: 18 },
          content: { weight: 0.6, maxScore: 54 },
        },
        timeLimit: 40,
        displayOrder: 3,
        instructions: 'Describe the image in as much detail as possible',
        metadata: {
          difficulty: 'Medium',
          tips: ['Structure your description', 'Include all key elements', 'Use descriptive language'],
          commonMistakes: ['Missing important details', 'Poor organization', 'Limited vocabulary'],
        },
      },
      // Writing Types
      {
        code: 'summarize_written_text',
        name: 'Summarize Written Text',
        categoryId: categoryMap.get('writing')!,
        description: 'Summarize a written passage',
        hasAiScoring: true,
        maxScore: 90,
        scoringCriteria: {
          content: { weight: 0.4, maxScore: 36 },
          form: { weight: 0.2, maxScore: 18 },
          grammar: { weight: 0.2, maxScore: 18 },
          vocabulary: { weight: 0.2, maxScore: 18 },
        },
        timeLimit: 600,
        wordCountMin: 50,
        wordCountMax: 70,
        displayOrder: 1,
        instructions: 'Summarize the passage in one sentence',
        metadata: {
          difficulty: 'Medium',
          tips: ['Identify main idea', 'Include key supporting points', 'Use complex sentence structure'],
          commonMistakes: ['Including too many details', 'Grammar errors', 'Poor sentence structure'],
        },
      },
      {
        code: 'essay',
        name: 'Essay',
        categoryId: categoryMap.get('writing')!,
        description: 'Write an essay on a given topic',
        hasAiScoring: true,
        maxScore: 90,
        scoringCriteria: {
          content: { weight: 0.3, maxScore: 27 },
          development: { weight: 0.3, maxScore: 27 },
          form: { weight: 0.2, maxScore: 18 },
          grammar: { weight: 0.1, maxScore: 9 },
          vocabulary: { weight: 0.1, maxScore: 9 },
        },
        timeLimit: 1200,
        wordCountMin: 200,
        wordCountMax: 300,
        displayOrder: 2,
        instructions: 'Write an essay of 200-300 words on the given topic',
        metadata: {
          difficulty: 'Hard',
          tips: ['Plan your essay structure', 'Use clear examples', 'Vary sentence structure'],
          commonMistakes: ['Poor organization', 'Weak arguments', 'Grammar and spelling errors'],
        },
      },
      // Reading Types
      {
        code: 'reading_fill_blanks_dropdown',
        name: 'Reading & Writing: Fill in the Blanks',
        categoryId: categoryMap.get('reading')!,
        description: 'Fill blanks in a text with correct words',
        hasAiScoring: false,
        maxScore: 90,
        timeLimit: 300,
        displayOrder: 1,
        instructions: 'Select the correct word for each blank from the dropdown',
        metadata: {
          difficulty: 'Medium',
          tips: ['Read the whole passage first', 'Check grammar and context', 'Eliminate wrong options'],
          commonMistakes: ['Not reading context', 'Grammar errors', 'Wrong word choice'],
        },
      },
      {
        code: 'reading_mc_multiple',
        name: 'Multiple Choice, Multiple Answer',
        categoryId: categoryMap.get('reading')!,
        description: 'Select multiple correct answers',
        hasAiScoring: false,
        maxScore: 90,
        timeLimit: 300,
        displayOrder: 2,
        instructions: 'Select all correct options',
        metadata: {
          difficulty: 'Hard',
          tips: ['Read all options carefully', 'Look for specific evidence', 'Don\'t select unsure options'],
          commonMistakes: ['Selecting wrong options', 'Missing correct answers', 'Not reading carefully'],
        },
      },
      // Listening Types
      {
        code: 'summarize_spoken_text',
        name: 'Summarize Spoken Text',
        categoryId: categoryMap.get('listening')!,
        description: 'Summarize a spoken text',
        hasAiScoring: true,
        maxScore: 90,
        scoringCriteria: {
          content: { weight: 0.4, maxScore: 36 },
          form: { weight: 0.2, maxScore: 18 },
          grammar: { weight: 0.2, maxScore: 18 },
          vocabulary: { weight: 0.2, maxScore: 18 },
        },
        timeLimit: 600,
        wordCountMin: 50,
        wordCountMax: 70,
        displayOrder: 1,
        instructions: 'Summarize the spoken text in one sentence',
        metadata: {
          difficulty: 'Medium',
          tips: ['Take notes while listening', 'Focus on main ideas', 'Use complex sentences'],
          commonMistakes: ['Including too many details', 'Missing main points', 'Grammar errors'],
        },
      },
      {
        code: 'listening_mc_multiple',
        name: 'Multiple Choice, Multiple Answer',
        categoryId: categoryMap.get('listening')!,
        description: 'Select multiple correct answers based on audio',
        hasAiScoring: false,
        maxScore: 90,
        timeLimit: 300,
        displayOrder: 2,
        instructions: 'Select all correct options after listening',
        metadata: {
          difficulty: 'Hard',
          tips: ['Listen for specific information', 'Take notes', 'Review options before listening'],
          commonMistakes: ['Missing information', 'Selecting wrong options', 'Poor note-taking'],
        },
      },
    ]).returning();

    const questionTypeMap = new Map(questionTypes.map(qt => [qt.code, qt.id]));

    // 3. Seed Sample Questions
    console.log('🎯 Seeding sample questions...');
    
    // Sample Read Aloud Question
    const [readAloudQuestion] = await db.insert(pteQuestions).values({
      questionTypeId: questionTypeMap.get('read_aloud')!,
      title: 'Climate Change Impact',
      content: 'Climate change is one of the most pressing challenges of our time. Rising global temperatures, melting ice caps, and extreme weather events are clear indicators that our planet is undergoing significant environmental changes. Scientists worldwide agree that immediate action is needed to reduce carbon emissions and transition to sustainable energy sources.',
      difficulty: 'Medium',
      tags: ['environment', 'science', 'climate'],
      isActive: true,
      isPremium: false,
      metadata: {
        source: 'Environmental Science Textbook',
        author: 'PTE Content Team',
        lastReviewed: '2024-01-01',
      },
    }).returning();

    await db.insert(pteSpeakingQuestions).values({
      questionId: readAloudQuestion.id,
      expectedDuration: 35,
      sampleTranscript: 'Climate change is one of the most pressing challenges of our time. Rising global temperatures, melting ice caps, and extreme weather events are clear indicators that our planet is undergoing significant environmental changes. Scientists worldwide agree that immediate action is needed to reduce carbon emissions and transition to sustainable energy sources.',
    });

    // Sample Essay Question
    const [essayQuestion] = await db.insert(pteQuestions).values({
      questionTypeId: questionTypeMap.get('essay')!,
      title: 'Technology in Education',
      content: 'Technology has revolutionized the way we learn and teach. Discuss the advantages and disadvantages of using technology in education, and provide your opinion on whether technology enhances or hinders the learning process.',
      difficulty: 'Hard',
      tags: ['education', 'technology', 'opinion'],
      isActive: true,
      isPremium: false,
      metadata: {
        source: 'PTE Essay Bank',
        author: 'PTE Content Team',
        lastReviewed: '2024-01-01',
      },
    }).returning();

    await db.insert(pteWritingQuestions).values({
      questionId: essayQuestion.id,
      promptText: 'Technology has revolutionized the way we learn and teach. Discuss the advantages and disadvantages of using technology in education, and provide your opinion on whether technology enhances or hinders the learning process.',
      wordCountMin: 200,
      wordCountMax: 300,
      essayType: 'argumentative',
      keyThemes: ['technology', 'education', 'advantages', 'disadvantages', 'learning process'],
    });

    // Sample Reading Question
    const [readingQuestion] = await db.insert(pteQuestions).values({
      questionTypeId: questionTypeMap.get('reading_fill_blanks_dropdown')!,
      title: 'Digital Transformation',
      content: 'Digital transformation is fundamentally changing how businesses operate and deliver value to customers. Companies that embrace digital technologies can improve efficiency, enhance customer experiences, and create new revenue streams. However, the transition requires careful planning and investment in infrastructure and skills.',
      difficulty: 'Medium',
      tags: ['business', 'technology', 'digital'],
      isActive: true,
      isPremium: false,
      correctAnswer: {
        blanks: {
          '1': 'fundamentally',
          '2': 'embrace',
          '3': 'requires',
        }
      },
      metadata: {
        source: 'Business Journal',
        author: 'PTE Content Team',
        lastReviewed: '2024-01-01',
      },
    }).returning();

    await db.insert(pteReadingQuestions).values({
      questionId: readingQuestion.id,
      passageText: 'Digital transformation is (1) changing how businesses operate and deliver value to customers. Companies that (2) digital technologies can improve efficiency, enhance customer experiences, and create new revenue streams. However, the transition (3) careful planning and investment in infrastructure and skills.',
      options: {
        choices: ['fundamentally', 'gradually', 'slowly', 'occasionally'],
        blanks: [
          { position: 1, options: ['fundamentally', 'gradually', 'slowly', 'occasionally'] },
          { position: 2, options: ['embrace', 'reject', 'ignore', 'avoid'] },
          { position: 3, options: ['requires', 'suggests', 'offers', 'provides'] },
        ]
      },
      correctAnswerPositions: [0, 0, 0],
      explanation: 'The passage discusses how digital transformation fundamentally changes business operations, requires embracing new technologies, and needs careful planning.',
    });

    console.log('✅ PTE data seeding completed successfully!');
    console.log(`📊 Seeded ${categories.length} categories`);
    console.log(`📝 Seeded ${questionTypes.length} question types`);
    console.log(`🎯 Seeded 3 sample questions`);

  } catch (error) {
    console.error('❌ Error seeding PTE data:', error);
    throw error;
  }
}

// Run the seeding function
seedPteData()
  .then(() => {
    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });

export { seedPteData };