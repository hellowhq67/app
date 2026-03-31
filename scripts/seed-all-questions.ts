/**
 * Seed All PTE Questions
 * Creates comprehensive questions for all 20 PTE question types.
 * Builds on the existing seed-pte-data.ts pattern.
 * Run: pnpm db:seed:questions
 */
import 'dotenv/config'
import { db } from '../lib/db/drizzle'
import {
  pteCategories,
  pteQuestionTypes,
  pteQuestions,
  pteSpeakingQuestions,
  pteWritingQuestions,
  pteReadingQuestions,
  pteListeningQuestions,
} from '../lib/db/schema'
import { sql } from 'drizzle-orm'

async function seedAllQuestions() {
  console.log('🌱 Seeding all PTE questions...')

  // ─── Step 1: Ensure categories exist ───────────────────────────────────────
  console.log('📁 Upserting categories...')
  const categories = await db
    .insert(pteCategories)
    .values([
      { code: 'speaking', name: 'Speaking', description: 'Speaking tasks', displayOrder: 1 },
      { code: 'writing', name: 'Writing', description: 'Writing tasks', displayOrder: 2 },
      { code: 'reading', name: 'Reading', description: 'Reading tasks', displayOrder: 3 },
      { code: 'listening', name: 'Listening', description: 'Listening tasks', displayOrder: 4 },
    ] as any)
    .onConflictDoUpdate({
      target: pteCategories.code,
      set: { updatedAt: new Date() },
    })
    .returning()

  const categoryMap = new Map(categories.map((c) => [c.code, c.id]))

  // ─── Step 2: Ensure question types exist ───────────────────────────────────
  console.log('📝 Upserting question types...')
  const questionTypes = await db
    .insert(pteQuestionTypes)
    .values([
      // Speaking
      { code: 'read_aloud', name: 'Read Aloud', categoryId: categoryMap.get('speaking')!, hasAiScoring: true, maxScore: 90, displayOrder: 1 },
      { code: 'repeat_sentence', name: 'Repeat Sentence', categoryId: categoryMap.get('speaking')!, hasAiScoring: true, maxScore: 90, displayOrder: 2 },
      { code: 'describe_image', name: 'Describe Image', categoryId: categoryMap.get('speaking')!, hasAiScoring: true, maxScore: 90, displayOrder: 3 },
      { code: 'retell_lecture', name: 'Re-tell Lecture', categoryId: categoryMap.get('speaking')!, hasAiScoring: true, maxScore: 90, displayOrder: 4 },
      { code: 'answer_short_question', name: 'Answer Short Question', categoryId: categoryMap.get('speaking')!, hasAiScoring: true, maxScore: 90, displayOrder: 5 },
      { code: 'respond_to_situation', name: 'Respond to a Situation', categoryId: categoryMap.get('speaking')!, hasAiScoring: true, maxScore: 90, displayOrder: 6 },
      { code: 'summarize_group_discussion', name: 'Summarize Group Discussion', categoryId: categoryMap.get('speaking')!, hasAiScoring: true, maxScore: 90, displayOrder: 7 },
      // Writing
      { code: 'summarize_written_text', name: 'Summarize Written Text', categoryId: categoryMap.get('writing')!, hasAiScoring: true, maxScore: 90, timeLimit: 600, wordCountMin: 50, wordCountMax: 70, displayOrder: 1 },
      { code: 'essay', name: 'Write Essay', categoryId: categoryMap.get('writing')!, hasAiScoring: true, maxScore: 90, timeLimit: 1200, wordCountMin: 200, wordCountMax: 300, displayOrder: 2 },
      { code: 'email', name: 'Write Email', categoryId: categoryMap.get('writing')!, hasAiScoring: true, maxScore: 90, timeLimit: 540, wordCountMin: 50, wordCountMax: 120, displayOrder: 3 },
      // Reading
      { code: 'reading_fill_blanks_dropdown', name: 'Reading & Writing: Fill in the Blanks', categoryId: categoryMap.get('reading')!, hasAiScoring: false, maxScore: 90, timeLimit: 300, displayOrder: 1 },
      { code: 'reading_mc_multiple', name: 'Multiple Choice, Multiple Answer', categoryId: categoryMap.get('reading')!, hasAiScoring: false, maxScore: 90, timeLimit: 300, displayOrder: 2 },
      { code: 'reorder_paragraphs', name: 'Re-order Paragraphs', categoryId: categoryMap.get('reading')!, hasAiScoring: false, maxScore: 90, timeLimit: 300, displayOrder: 3 },
      { code: 'reading_fill_blanks_drag', name: 'Fill in the Blanks (Drag & Drop)', categoryId: categoryMap.get('reading')!, hasAiScoring: false, maxScore: 90, timeLimit: 300, displayOrder: 4 },
      { code: 'reading_mc_single', name: 'Multiple Choice, Single Answer', categoryId: categoryMap.get('reading')!, hasAiScoring: false, maxScore: 90, timeLimit: 300, displayOrder: 5 },
      // Listening
      { code: 'summarize_spoken_text', name: 'Summarize Spoken Text', categoryId: categoryMap.get('listening')!, hasAiScoring: true, maxScore: 90, timeLimit: 600, wordCountMin: 50, wordCountMax: 70, displayOrder: 1 },
      { code: 'listening_mc_multiple', name: 'Multiple Choice, Multiple Answer', categoryId: categoryMap.get('listening')!, hasAiScoring: false, maxScore: 90, timeLimit: 300, displayOrder: 2 },
      { code: 'listening_fill_blanks', name: 'Fill in the Blanks', categoryId: categoryMap.get('listening')!, hasAiScoring: false, maxScore: 90, timeLimit: 300, displayOrder: 3 },
      { code: 'highlight_correct_summary', name: 'Highlight Correct Summary', categoryId: categoryMap.get('listening')!, hasAiScoring: false, maxScore: 90, timeLimit: 300, displayOrder: 4 },
      { code: 'listening_mc_single', name: 'Multiple Choice, Single Answer', categoryId: categoryMap.get('listening')!, hasAiScoring: false, maxScore: 90, timeLimit: 300, displayOrder: 5 },
      { code: 'select_missing_word', name: 'Select Missing Word', categoryId: categoryMap.get('listening')!, hasAiScoring: false, maxScore: 90, timeLimit: 180, displayOrder: 6 },
      { code: 'highlight_incorrect_words', name: 'Highlight Incorrect Words', categoryId: categoryMap.get('listening')!, hasAiScoring: false, maxScore: 90, timeLimit: 300, displayOrder: 7 },
      { code: 'write_from_dictation', name: 'Write from Dictation', categoryId: categoryMap.get('listening')!, hasAiScoring: false, maxScore: 90, timeLimit: 180, displayOrder: 8 },
    ] as any)
    .onConflictDoUpdate({
      target: pteQuestionTypes.code,
      set: {
        name: sql`excluded.name`,
        categoryId: sql`excluded.category_id`,
        hasAiScoring: sql`excluded.has_ai_scoring`,
        maxScore: sql`excluded.max_score`,
        timeLimit: sql`excluded.time_limit`,
        displayOrder: sql`excluded.display_order`,
        updatedAt: new Date(),
      },
    })
    .returning()

  const qtMap = new Map(questionTypes.map((qt) => [qt.code, qt.id]))

  // ─── Step 3: Seed questions ─────────────────────────────────────────────────
  console.log('🎯 Seeding questions...')

  // ── SPEAKING: Read Aloud (3 questions) ──────────────────────────────────────
  const readAloudTexts = [
    {
      title: 'Climate Change and Global Warming',
      content: 'Climate change is one of the most pressing challenges of our time. Rising global temperatures, melting ice caps, and extreme weather events are clear indicators that our planet is undergoing significant environmental changes. Scientists worldwide agree that immediate action is needed to reduce carbon emissions and transition to sustainable energy sources.',
      difficulty: 'Medium' as const,
      tags: ['environment', 'science'],
    },
    {
      title: 'The Digital Revolution',
      content: 'The digital revolution has fundamentally transformed the way we live, work, and communicate. From smartphones to artificial intelligence, technology continues to reshape every aspect of modern society. Businesses that fail to adapt to this rapidly changing landscape risk becoming obsolete in an increasingly connected world.',
      difficulty: 'Hard' as const,
      tags: ['technology', 'business'],
    },
    {
      title: 'Importance of Sleep',
      content: 'Sleep is essential for maintaining good health and well-being. During sleep, the body repairs tissues, consolidates memories, and releases hormones that regulate growth and metabolism. Adults who consistently get seven to nine hours of quality sleep each night perform better cognitively and have stronger immune systems.',
      difficulty: 'Easy' as const,
      tags: ['health', 'biology'],
    },
  ]

  for (const q of readAloudTexts) {
    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('read_aloud')!,
      title: q.title,
      content: q.content,
      difficulty: q.difficulty,
      tags: q.tags,
      isActive: true,
      isPremium: false,
      metadata: { source: 'PTE Content Team', lastReviewed: '2024-01-01' },
    }).returning()
    await db.insert(pteSpeakingQuestions).values({
      questionId: base.id,
      expectedDuration: 35,
      sampleTranscript: q.content,
    })
  }

  // ── SPEAKING: Repeat Sentence (3 questions) ──────────────────────────────────
  const repeatSentences = [
    { title: 'Academic Lecture Excerpt 1', content: 'The professor explained that quantum mechanics describes the behavior of matter at the subatomic level.' },
    { title: 'News Report Excerpt', content: 'The government announced new measures to reduce plastic waste and promote sustainable packaging alternatives.' },
    { title: 'Business Meeting Excerpt', content: 'The quarterly results exceeded expectations, and the board has approved additional investment in research and development.' },
  ]

  for (const q of repeatSentences) {
    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('repeat_sentence')!,
      title: q.title,
      content: q.content,
      difficulty: 'Medium',
      tags: ['repeat', 'listening'],
      isActive: true,
      isPremium: false,
      metadata: { source: 'PTE Content Team' },
    }).returning()
    await db.insert(pteSpeakingQuestions).values({
      questionId: base.id,
      audioPromptUrl: 'https://d0ub0i0cvpsd7hu8.public.blob.vercel-storage.com/audio/speaking/repeat-sentence/placeholder.mp3',
      expectedDuration: 15,
      sampleTranscript: q.content,
    })
  }

  // ── SPEAKING: Describe Image (2 questions) ───────────────────────────────────
  const describeImages = [
    {
      title: 'Global Energy Consumption Bar Chart',
      content: 'Describe the bar chart showing global energy consumption by source from 2000 to 2020.',
      imageUrl: 'https://d0ub0i0cvpsd7hu8.public.blob.vercel-storage.com/images/speaking/describe-image/energy-chart.png',
    },
    {
      title: 'Urban Population Growth Line Graph',
      content: 'Describe the line graph showing urban population growth across different continents over the past 50 years.',
      imageUrl: 'https://d0ub0i0cvpsd7hu8.public.blob.vercel-storage.com/images/speaking/describe-image/population-graph.png',
    },
  ]

  for (const q of describeImages) {
    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('describe_image')!,
      title: q.title,
      content: q.content,
      imageUrl: q.imageUrl,
      difficulty: 'Medium',
      tags: ['describe', 'visual'],
      isActive: true,
      isPremium: false,
      metadata: { source: 'PTE Content Team' },
    }).returning()
    await db.insert(pteSpeakingQuestions).values({
      questionId: base.id,
      expectedDuration: 40,
      keyPoints: ['Identify the main trend', 'Compare data points', 'State conclusions'],
    })
  }

  // ── SPEAKING: Re-tell Lecture (2 questions) ──────────────────────────────────
  const retellLectures = [
    {
      title: 'Lecture on Artificial Intelligence in Healthcare',
      content: 'Listen to the lecture about how artificial intelligence is being used to improve diagnostic accuracy and patient outcomes in modern healthcare systems.',
      keyPoints: ['AI diagnostic tools', 'Improved accuracy rates', 'Patient outcome improvements', 'Ethical considerations', 'Future applications'],
    },
    {
      title: 'Lecture on Renewable Energy Transition',
      content: 'Listen to the lecture discussing the global transition from fossil fuels to renewable energy sources and the economic and environmental implications.',
      keyPoints: ['Fossil fuel dependency', 'Solar and wind growth', 'Economic costs', 'Job creation', 'Carbon reduction targets'],
    },
  ]

  for (const q of retellLectures) {
    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('retell_lecture')!,
      title: q.title,
      content: q.content,
      difficulty: 'Hard',
      tags: ['lecture', 'academic'],
      isActive: true,
      isPremium: true,
      metadata: { source: 'PTE Content Team' },
    }).returning()
    await db.insert(pteSpeakingQuestions).values({
      questionId: base.id,
      audioPromptUrl: 'https://d0ub0i0cvpsd7hu8.public.blob.vercel-storage.com/audio/speaking/retell-lecture/placeholder.mp3',
      expectedDuration: 40,
      keyPoints: q.keyPoints,
    })
  }

  // ── SPEAKING: Answer Short Question (3 questions) ────────────────────────────
  const shortQuestions = [
    { title: 'Geography Question', content: 'What is the largest ocean on Earth?' },
    { title: 'Science Question', content: 'What gas do plants absorb from the atmosphere during photosynthesis?' },
    { title: 'History Question', content: 'In which century did the Industrial Revolution begin?' },
  ]

  for (const q of shortQuestions) {
    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('answer_short_question')!,
      title: q.title,
      content: q.content,
      difficulty: 'Easy',
      tags: ['short-answer', 'knowledge'],
      isActive: true,
      isPremium: false,
      metadata: { source: 'PTE Content Team' },
    }).returning()
    await db.insert(pteSpeakingQuestions).values({
      questionId: base.id,
      audioPromptUrl: 'https://d0ub0i0cvpsd7hu8.public.blob.vercel-storage.com/audio/speaking/answer-short-question/placeholder.mp3',
      expectedDuration: 10,
    })
  }

  // ── WRITING: Summarize Written Text (3 questions) ────────────────────────────
  const summarizeTexts = [
    {
      title: 'The Impact of Social Media on Society',
      passage: `Social media platforms have dramatically altered the way people communicate and share information. While these platforms have enabled unprecedented global connectivity and given voice to marginalized communities, they have also been linked to mental health issues, particularly among young people. Studies show that excessive social media use correlates with increased rates of anxiety and depression. Furthermore, the spread of misinformation has become a significant challenge, as false information can travel faster than factual corrections. Policymakers and tech companies are grappling with how to regulate these platforms while preserving freedom of expression. The debate continues over whether the benefits of social media—connectivity, access to information, economic opportunities—outweigh its considerable drawbacks.`,
      sampleAnswer: 'Social media has revolutionized global communication and connectivity, but despite enabling marginalized voices and economic opportunities, it has also contributed to mental health issues among youth and facilitated the rapid spread of misinformation, prompting ongoing debates about regulation and the balance between benefits and harms.',
    },
    {
      title: 'Urban Heat Islands and City Planning',
      passage: `Urban heat islands are metropolitan areas that are significantly warmer than surrounding rural areas due to human activities. The primary causes include the replacement of natural land cover with buildings and pavements that absorb heat, waste heat from vehicles and air conditioning units, and reduced vegetation that would otherwise provide cooling through evapotranspiration. Average temperatures in urban areas can be 1 to 7 degrees Celsius higher than nearby rural regions. City planners are increasingly incorporating green infrastructure—such as rooftop gardens, urban forests, and permeable surfaces—to mitigate these effects. Research indicates that increasing urban green spaces by 10% could reduce surface temperatures by up to 3 degrees and significantly improve air quality and resident well-being.`,
      sampleAnswer: 'Urban heat islands, caused by the replacement of natural surfaces with heat-absorbing infrastructure and reduced vegetation, can raise city temperatures up to 7°C higher than rural areas, but city planners are addressing this through green infrastructure such as rooftop gardens and urban forests, which can reduce surface temperatures by up to 3°C.',
    },
    {
      title: 'The Future of Work',
      passage: `Automation and artificial intelligence are fundamentally reshaping the labour market. While previous technological revolutions eliminated certain jobs while creating new ones, the current wave of automation is notable for its speed and breadth. Routine cognitive tasks that once required human intelligence—such as data analysis, customer service, and even some aspects of medical diagnosis—can now be performed by algorithms. Economists disagree about the long-term net effect on employment. Optimists argue that new industries and job categories will emerge, as they have in past revolutions. Pessimists contend that the pace of change will outstrip workers' ability to adapt, leading to structural unemployment and growing inequality.`,
      sampleAnswer: 'Automation and artificial intelligence are transforming the labour market at unprecedented speed, with algorithms now capable of performing routine cognitive tasks such as data analysis and customer service, leading to disagreement among economists about whether new industries will emerge fast enough to offset job losses or whether structural unemployment and inequality will grow.',
    },
  ]

  for (const q of summarizeTexts) {
    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('summarize_written_text')!,
      title: q.title,
      content: q.passage,
      difficulty: 'Hard',
      tags: ['summarize', 'writing', 'academic'],
      isActive: true,
      isPremium: false,
      sampleAnswer: q.sampleAnswer,
      metadata: { source: 'PTE Content Team', lastReviewed: '2024-01-01' },
    }).returning()
    await db.insert(pteWritingQuestions).values({
      questionId: base.id,
      promptText: 'Read the passage below and summarize it using one sentence. Type your response in the box at the bottom of the screen. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points in the passage.',
      passageText: q.passage,
      wordCountMin: 5,
      wordCountMax: 75,
      essayType: 'summary',
      keyThemes: ['main idea', 'key points', 'single sentence'],
    })
  }

  // ── WRITING: Essay (3 questions) ─────────────────────────────────────────────
  const essays = [
    {
      title: 'Technology in Education',
      prompt: 'Some people think that the use of technology is making people less creative. To what extent do you agree or disagree with this statement? Give reasons for your answer and include any relevant examples from your own knowledge or experience.',
      essayType: 'opinion',
      themes: ['technology', 'creativity', 'education', 'innovation'],
    },
    {
      title: 'Urbanisation and Environment',
      prompt: 'Rapid urbanization is causing significant environmental problems in many countries. What are the main environmental problems associated with rapid urban growth? What measures could be taken to address these problems?',
      essayType: 'problem-solution',
      themes: ['urbanisation', 'environment', 'pollution', 'solutions'],
    },
    {
      title: 'Global Tourism',
      prompt: 'International tourism has grown dramatically in recent decades. Some people believe this growth has had a negative impact on local communities and environments. Others argue it brings significant economic benefits. Discuss both views and give your own opinion.',
      essayType: 'discussion',
      themes: ['tourism', 'economy', 'environment', 'culture'],
    },
  ]

  for (const q of essays) {
    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('essay')!,
      title: q.title,
      content: q.prompt,
      difficulty: 'Hard',
      tags: q.themes,
      isActive: true,
      isPremium: false,
      metadata: { source: 'PTE Content Team', lastReviewed: '2024-01-01' },
    }).returning()
    await db.insert(pteWritingQuestions).values({
      questionId: base.id,
      promptText: q.prompt,
      wordCountMin: 200,
      wordCountMax: 300,
      essayType: q.essayType,
      keyThemes: q.themes,
    })
  }

  // ── WRITING: Email (2 questions) ─────────────────────────────────────────────
  const emails = [
    {
      title: 'Complaint to Hotel Manager',
      prompt: 'You recently stayed at a hotel and were unhappy with the service. Write an email to the hotel manager. In your email: explain what was wrong, describe the impact on your stay, and request appropriate compensation.',
    },
    {
      title: 'Request to Neighbour',
      prompt: 'Your neighbour has been playing loud music late at night. Write an email to your neighbour. In your email: describe the problem, explain how it is affecting you, and suggest a solution.',
    },
  ]

  for (const q of emails) {
    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('email')!,
      title: q.title,
      content: q.prompt,
      difficulty: 'Medium',
      tags: ['email', 'writing', 'core'],
      isActive: true,
      isPremium: false,
      metadata: { source: 'PTE Core Content Team' },
    }).returning()
    await db.insert(pteWritingQuestions).values({
      questionId: base.id,
      promptText: q.prompt,
      wordCountMin: 50,
      wordCountMax: 120,
      essayType: 'email',
      keyThemes: ['appropriate tone', 'clear purpose', 'all bullet points addressed'],
    })
  }

  // ── READING: Fill in the Blanks - Dropdown (3 questions) ────────────────────
  const readingFillDropdown = [
    {
      title: 'Digital Transformation in Business',
      passageText: 'Digital transformation is (1) changing how businesses operate and deliver value to customers. Companies that (2) digital technologies can improve efficiency, enhance customer experiences, and create new revenue streams. However, the transition (3) careful planning and investment in infrastructure and skills.',
      blanks: [
        { position: 1, options: ['fundamentally', 'gradually', 'slowly', 'occasionally'], answer: 'fundamentally' },
        { position: 2, options: ['embrace', 'reject', 'ignore', 'avoid'], answer: 'embrace' },
        { position: 3, options: ['requires', 'suggests', 'offers', 'provides'], answer: 'requires' },
      ],
    },
    {
      title: 'Climate Policy Challenges',
      passageText: 'Addressing climate change requires (1) cooperation between governments, businesses, and individuals. While renewable energy technologies have become increasingly (2), many countries still rely on fossil fuels for the (3) of their energy needs.',
      blanks: [
        { position: 1, options: ['unprecedented', 'minimal', 'occasional', 'regional'], answer: 'unprecedented' },
        { position: 2, options: ['affordable', 'expensive', 'unreliable', 'complex'], answer: 'affordable' },
        { position: 3, options: ['majority', 'minority', 'fraction', 'quarter'], answer: 'majority' },
      ],
    },
    {
      title: 'Biodiversity Conservation',
      passageText: 'Biodiversity loss is occurring at an (1) rate due to habitat destruction, climate change, and overexploitation of natural resources. Conservation efforts must (2) both the protection of existing habitats and the restoration of (3) ecosystems.',
      blanks: [
        { position: 1, options: ['alarming', 'acceptable', 'gradual', 'natural'], answer: 'alarming' },
        { position: 2, options: ['encompass', 'ignore', 'delay', 'limit'], answer: 'encompass' },
        { position: 3, options: ['degraded', 'pristine', 'urban', 'agricultural'], answer: 'degraded' },
      ],
    },
  ]

  for (const q of readingFillDropdown) {
    const correctAnswers: Record<string, string> = {}
    q.blanks.forEach((b) => { correctAnswers[String(b.position)] = b.answer })

    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('reading_fill_blanks_dropdown')!,
      title: q.title,
      content: q.passageText,
      difficulty: 'Medium',
      tags: ['fill-blanks', 'reading', 'dropdown'],
      isActive: true,
      isPremium: false,
      correctAnswer: { blanks: correctAnswers },
      metadata: { source: 'PTE Content Team' },
    }).returning()
    await db.insert(pteReadingQuestions).values({
      questionId: base.id,
      passageText: q.passageText,
      options: { blanks: q.blanks.map((b) => ({ position: b.position, options: b.options })) },
      correctAnswerPositions: q.blanks.map(() => 0),
      explanation: 'Select the most contextually and grammatically appropriate word for each blank.',
    })
  }

  // ── READING: Multiple Choice Multiple Answer (2 questions) ───────────────────
  const readingMCMultiple = [
    {
      title: 'The Benefits of Exercise',
      passage: 'Regular physical exercise offers numerous benefits for both physical and mental health. Studies consistently show that people who exercise regularly have lower rates of heart disease, type 2 diabetes, and certain cancers. Exercise also improves cognitive function, reduces symptoms of depression and anxiety, and enhances sleep quality. Furthermore, social forms of exercise, such as team sports or group fitness classes, can strengthen social bonds and improve overall well-being. Despite these well-documented benefits, global physical activity levels continue to decline, particularly among urban populations.',
      question: 'According to the passage, which of the following are benefits of regular exercise?',
      choices: [
        'Reduced risk of heart disease',
        'Improved financial outcomes',
        'Better sleep quality',
        'Enhanced cognitive function',
        'Guaranteed weight loss',
      ],
      correctPositions: [0, 2, 3],
    },
    {
      title: 'Challenges of Remote Work',
      passage: 'The rapid shift to remote work during the pandemic revealed both opportunities and challenges. While many employees reported increased flexibility and reduced commute times, organizations faced difficulties maintaining team cohesion, corporate culture, and effective communication. Mental health emerged as a significant concern, with many remote workers reporting feelings of isolation and difficulty separating work from personal life. Security risks also increased as employees accessed corporate systems from home networks. However, productivity metrics in many industries showed neutral or positive impacts compared to office-based work.',
      question: 'Which of the following challenges of remote work are mentioned in the passage?',
      choices: [
        'Difficulty maintaining team cohesion',
        'Increased technology costs',
        'Mental health and isolation issues',
        'Reduced employee salaries',
        'Increased security risks',
      ],
      correctPositions: [0, 2, 4],
    },
  ]

  for (const q of readingMCMultiple) {
    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('reading_mc_multiple')!,
      title: q.title,
      content: q.passage,
      difficulty: 'Hard',
      tags: ['multiple-choice', 'reading'],
      isActive: true,
      isPremium: false,
      correctAnswer: { options: q.correctPositions.map((i) => q.choices[i]) },
      metadata: { source: 'PTE Content Team' },
    }).returning()
    await db.insert(pteReadingQuestions).values({
      questionId: base.id,
      passageText: q.passage,
      questionText: q.question,
      options: { choices: q.choices },
      correctAnswerPositions: q.correctPositions,
      explanation: 'Select all answers that are explicitly supported by the passage.',
    })
  }

  // ── READING: Re-order Paragraphs (2 questions) ───────────────────────────────
  const reorderParagraphs = [
    {
      title: 'The History of the Internet',
      paragraphs: [
        'A. The internet as we know it today evolved from ARPANET, a US military research network created in the late 1960s.',
        'B. By the 1990s, the World Wide Web made the internet accessible to the general public, leading to explosive commercial growth.',
        'C. In the 1980s, the network expanded to include universities and research institutions, and standardised communication protocols were adopted.',
        'D. Today, over 5 billion people are connected to the internet, and it underpins virtually every aspect of modern economic and social life.',
      ],
      correctOrder: [0, 2, 1, 3],
    },
    {
      title: 'How Vaccines Work',
      paragraphs: [
        'A. When a vaccinated person is later exposed to the actual pathogen, the immune system rapidly deploys these pre-formed antibodies to neutralise the threat.',
        'B. Vaccines work by introducing a harmless version—or component—of a pathogen into the body.',
        'C. This process of immunological memory means that vaccinated individuals are protected from serious illness without having to suffer through the full disease.',
        'D. The immune system responds by producing antibodies and creating memory cells that recognise the pathogen.',
      ],
      correctOrder: [1, 3, 0, 2],
    },
  ]

  for (const q of reorderParagraphs) {
    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('reorder_paragraphs')!,
      title: q.title,
      content: q.paragraphs.join('\n'),
      difficulty: 'Hard',
      tags: ['reorder', 'reading', 'logic'],
      isActive: true,
      isPremium: false,
      correctAnswer: { order: q.correctOrder },
      metadata: { source: 'PTE Content Team' },
    }).returning()
    await db.insert(pteReadingQuestions).values({
      questionId: base.id,
      passageText: q.paragraphs.join('\n'),
      options: { paragraphs: q.paragraphs },
      correctAnswerPositions: q.correctOrder,
      explanation: 'Arrange the paragraphs in a logical sequence that forms a coherent passage.',
    })
  }

  // ── READING: Fill in the Blanks - Drag (2 questions) ────────────────────────
  const readingFillDrag = [
    {
      title: 'Ocean Acidification',
      passageText: 'Ocean acidification occurs when the ocean absorbs carbon dioxide from the (1), causing a chemical reaction that reduces the pH of seawater. This process is threatening marine (2) such as corals and shellfish, which depend on calcium carbonate to build their shells and (3).',
      options: ['atmosphere', 'skeletons', 'organisms', 'land', 'temperature'],
      answers: ['atmosphere', 'organisms', 'skeletons'],
    },
    {
      title: 'Gene Editing Technology',
      passageText: 'CRISPR-Cas9 is a revolutionary gene editing tool that allows scientists to (1) and modify specific sections of DNA with unprecedented (2). The technology has potential applications in treating genetic (3), developing disease-resistant crops, and advancing our understanding of human biology.',
      options: ['precision', 'diseases', 'locate', 'increase', 'reduce'],
      answers: ['locate', 'precision', 'diseases'],
    },
  ]

  for (const q of readingFillDrag) {
    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('reading_fill_blanks_drag')!,
      title: q.title,
      content: q.passageText,
      difficulty: 'Medium',
      tags: ['fill-blanks', 'drag-drop', 'reading'],
      isActive: true,
      isPremium: false,
      correctAnswer: { options: q.answers },
      metadata: { source: 'PTE Content Team' },
    }).returning()
    await db.insert(pteReadingQuestions).values({
      questionId: base.id,
      passageText: q.passageText,
      options: { choices: q.options },
      correctAnswerPositions: q.answers.map((a) => q.options.indexOf(a)),
      explanation: 'Drag and drop the most appropriate word into each blank.',
    })
  }

  // ── READING: Multiple Choice Single Answer (2 questions) ────────────────────
  const readingMCSingle = [
    {
      title: 'The Role of Sleep in Memory',
      passage: 'Research has consistently demonstrated that sleep plays a crucial role in memory consolidation. During the rapid eye movement (REM) phase of sleep, the brain processes and stores information gathered during waking hours. Studies show that students who sleep for at least eight hours after learning new material perform significantly better on tests than those who stay awake. Sleep deprivation not only impairs new memory formation but also interferes with the retrieval of previously stored information.',
      question: 'What is the main purpose of this passage?',
      choices: [
        'To argue that students should sleep more than eight hours per night',
        'To explain the relationship between sleep and memory consolidation',
        'To describe the stages of sleep in detail',
        'To compare REM sleep with non-REM sleep',
      ],
      correctPosition: 1,
    },
    {
      title: 'Microplastics in the Food Chain',
      passage: 'Microplastics—fragments smaller than five millimetres—have been found in virtually every ecosystem on Earth, from the deepest ocean trenches to Arctic ice. These particles enter the food chain when marine organisms ingest them. A 2022 study found microplastics in the blood of 77% of tested participants, raising significant public health concerns. While the long-term health effects remain under investigation, preliminary research suggests links to inflammation, oxidative stress, and disruption of hormone regulation.',
      question: 'According to the passage, why are microplastics a public health concern?',
      choices: [
        'They are too small to be filtered from drinking water',
        'They have been found in human blood and may cause health effects',
        'They cause immediate poisoning in marine organisms',
        'They make food taste unpleasant',
      ],
      correctPosition: 1,
    },
  ]

  for (const q of readingMCSingle) {
    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('reading_mc_single')!,
      title: q.title,
      content: q.passage,
      difficulty: 'Medium',
      tags: ['multiple-choice', 'single-answer', 'reading'],
      isActive: true,
      isPremium: false,
      correctAnswer: { options: [q.choices[q.correctPosition]] },
      metadata: { source: 'PTE Content Team' },
    }).returning()
    await db.insert(pteReadingQuestions).values({
      questionId: base.id,
      passageText: q.passage,
      questionText: q.question,
      options: { choices: q.choices },
      correctAnswerPositions: [q.correctPosition],
      explanation: 'Select the single best answer based on the information in the passage.',
    })
  }

  // ── LISTENING: Summarize Spoken Text (2 questions) ───────────────────────────
  const summarizeSpoken = [
    {
      title: 'Lecture on Behavioural Economics',
      transcript: 'Traditional economics assumes that people make rational decisions based on self-interest. Behavioural economics challenges this assumption by incorporating insights from psychology. Research by Kahneman and Tversky demonstrated that humans are subject to cognitive biases—systematic patterns of deviation from rationality. For example, loss aversion means people feel the pain of losses more strongly than equivalent gains. Anchoring bias causes us to rely too heavily on the first piece of information we encounter. These findings have profound implications for public policy, marketing, and financial decision-making.',
      sampleAnswer: 'Behavioural economics, developed through the work of Kahneman and Tversky, challenges the traditional economic assumption of rational decision-making by demonstrating that humans are subject to cognitive biases such as loss aversion and anchoring, which have significant implications for public policy, marketing, and finance.',
    },
    {
      title: 'Lecture on Urban Migration',
      transcript: 'The movement of people from rural areas to cities, known as urbanisation, is one of the defining trends of the 21st century. In 2007, for the first time in history, more than half of the world\'s population lived in urban areas. By 2050, this proportion is expected to reach two-thirds. This mass migration creates both opportunities and challenges. Cities offer greater economic opportunities, access to services, and cultural amenities. However, rapid urbanisation also strains infrastructure, increases pollution, and can lead to the growth of informal settlements with inadequate sanitation and housing.',
      sampleAnswer: 'Urbanisation, a defining 21st-century trend in which more than half the world\'s population now lives in cities—a proportion expected to reach two-thirds by 2050—presents both economic opportunities and significant challenges including infrastructure strain, pollution, and the growth of inadequate informal settlements.',
    },
  ]

  for (const q of summarizeSpoken) {
    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('summarize_spoken_text')!,
      title: q.title,
      content: q.transcript,
      difficulty: 'Hard',
      tags: ['summarize', 'listening', 'academic'],
      isActive: true,
      isPremium: true,
      sampleAnswer: q.sampleAnswer,
      metadata: { source: 'PTE Content Team' },
    }).returning()
    await db.insert(pteListeningQuestions).values({
      questionId: base.id,
      audioFileUrl: 'https://d0ub0i0cvpsd7hu8.public.blob.vercel-storage.com/audio/listening/summarize-spoken-text/placeholder.mp3',
      audioDuration: 90,
      transcript: q.transcript,
    })
  }

  // ── LISTENING: Multiple Choice Multiple Answer (2 questions) ─────────────────
  const listeningMCMultiple = [
    {
      title: 'Talk on Climate Solutions',
      transcript: 'Today I want to discuss some promising approaches to combating climate change. First, carbon capture technology is advancing rapidly and shows real potential for removing CO2 from the atmosphere. Second, plant-based diets are gaining popularity as a way to reduce agricultural emissions. Third, electric vehicles are becoming more affordable, though challenges remain with battery technology and charging infrastructure. Finally, rewilding projects—restoring natural ecosystems—are showing promising results for biodiversity and carbon sequestration.',
      question: 'Which climate solutions are discussed in the talk?',
      choices: ['Carbon capture technology', 'Nuclear energy expansion', 'Plant-based diets', 'Electric vehicles', 'Solar panel subsidies'],
      correctPositions: [0, 2, 3],
    },
    {
      title: 'Discussion on Sleep Research',
      transcript: 'Recent research has shed new light on the importance of sleep. Studies have shown that during sleep, the brain\'s glymphatic system actively clears waste products, including proteins linked to Alzheimer\'s disease. Sleep deprivation has been linked to obesity, as it disrupts hormones that regulate hunger. Additionally, poor sleep is associated with increased risk of cardiovascular disease. There is also growing evidence that sleep affects immune function, with sleep-deprived individuals more susceptible to infection.',
      question: 'Which health effects of poor sleep are mentioned in the discussion?',
      choices: ['Risk of obesity', 'Higher cancer rates', 'Cardiovascular disease risk', 'Reduced immune function', 'Improved memory'],
      correctPositions: [0, 2, 3],
    },
  ]

  for (const q of listeningMCMultiple) {
    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('listening_mc_multiple')!,
      title: q.title,
      content: q.transcript,
      difficulty: 'Hard',
      tags: ['multiple-choice', 'listening'],
      isActive: true,
      isPremium: false,
      correctAnswer: { options: q.correctPositions.map((i) => q.choices[i]) },
      metadata: { source: 'PTE Content Team' },
    }).returning()
    await db.insert(pteListeningQuestions).values({
      questionId: base.id,
      audioFileUrl: 'https://d0ub0i0cvpsd7hu8.public.blob.vercel-storage.com/audio/listening/mc-multiple/placeholder.mp3',
      audioDuration: 60,
      transcript: q.transcript,
      questionText: q.question,
      options: { choices: q.choices },
      correctAnswerPositions: q.correctPositions,
    })
  }

  // ── LISTENING: Fill in the Blanks (2 questions) ───────────────────────────────
  const listeningFillBlanks = [
    {
      title: 'Lecture on Water Cycle',
      transcript: 'The water cycle, also known as the hydrological cycle, describes the continuous movement of water through the Earth\'s systems. Water evaporates from the surface of oceans and lakes, rises into the atmosphere where it (1) into clouds, and eventually falls back to Earth as (2). Some of this water flows into rivers and streams, while the rest is absorbed into the ground, replenishing underground (3).',
      blanks: [{ position: 1, answer: 'condenses' }, { position: 2, answer: 'precipitation' }, { position: 3, answer: 'aquifers' }],
    },
    {
      title: 'Business Podcast Excerpt',
      transcript: 'The concept of supply chain (1) has become critically important for modern businesses. When the pandemic disrupted global supply chains, companies that had invested in (2) and multiple supplier relationships were far better positioned to weather the crisis. Experts now recommend that businesses conduct regular (3) assessments to identify vulnerable points in their supply chains before disruptions occur.',
      blanks: [{ position: 1, answer: 'resilience' }, { position: 2, answer: 'redundancy' }, { position: 3, answer: 'risk' }],
    },
  ]

  for (const q of listeningFillBlanks) {
    const correctAnswers: Record<string, string> = {}
    q.blanks.forEach((b) => { correctAnswers[String(b.position)] = b.answer })

    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('listening_fill_blanks')!,
      title: q.title,
      content: q.transcript,
      difficulty: 'Medium',
      tags: ['fill-blanks', 'listening'],
      isActive: true,
      isPremium: false,
      correctAnswer: { blanks: correctAnswers },
      metadata: { source: 'PTE Content Team' },
    }).returning()
    await db.insert(pteListeningQuestions).values({
      questionId: base.id,
      audioFileUrl: 'https://d0ub0i0cvpsd7hu8.public.blob.vercel-storage.com/audio/listening/fill-in-blanks/placeholder.mp3',
      audioDuration: 75,
      transcript: q.transcript,
      options: { blanks: q.blanks },
      correctAnswerPositions: q.blanks.map(() => 0),
    })
  }

  // ── LISTENING: Highlight Correct Summary (2 questions) ───────────────────────
  const highlightSummary = [
    {
      title: 'Talk on Artificial Intelligence',
      transcript: 'Artificial intelligence is transforming industries from healthcare to finance. Machine learning algorithms can now detect certain cancers more accurately than experienced radiologists. In finance, AI is used to detect fraud patterns and optimise investment portfolios. However, there are significant concerns about job displacement, algorithmic bias, and the lack of transparency in AI decision-making. Policymakers are working to develop regulatory frameworks that allow innovation while protecting citizens.',
      summaries: [
        'AI is being used to replace all human workers in healthcare and finance.',
        'AI is transforming healthcare and finance while raising concerns about job displacement, bias, and transparency that regulators are working to address.',
        'AI has solved all the problems of fraud detection and cancer diagnosis.',
        'Policymakers have successfully regulated AI to prevent any negative impacts.',
      ],
      correctPosition: 1,
    },
    {
      title: 'Lecture on Antarctic Ice',
      transcript: 'Antarctic ice sheets contain approximately 60% of the world\'s fresh water. Scientists monitor changes in these ice sheets using satellite data. Recent measurements show that the West Antarctic Ice Sheet is losing mass at an accelerating rate, primarily due to warm ocean water melting the underside of glaciers. If the West Antarctic Ice Sheet were to melt completely, global sea levels could rise by approximately six metres, threatening coastal cities worldwide.',
      summaries: [
        'Antarctic ice sheets are completely stable and pose no threat to global sea levels.',
        'Scientists can no longer monitor Antarctic ice due to technical limitations.',
        'The West Antarctic Ice Sheet is losing mass rapidly due to ocean warming and could cause significant sea level rise if it melted completely.',
        'All Antarctic ice will melt within the next decade according to scientists.',
      ],
      correctPosition: 2,
    },
  ]

  for (const q of highlightSummary) {
    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('highlight_correct_summary')!,
      title: q.title,
      content: q.transcript,
      difficulty: 'Medium',
      tags: ['highlight', 'summary', 'listening'],
      isActive: true,
      isPremium: false,
      correctAnswer: { options: [q.summaries[q.correctPosition]] },
      metadata: { source: 'PTE Content Team' },
    }).returning()
    await db.insert(pteListeningQuestions).values({
      questionId: base.id,
      audioFileUrl: 'https://d0ub0i0cvpsd7hu8.public.blob.vercel-storage.com/audio/listening/highlight-correct-summary/placeholder.mp3',
      audioDuration: 60,
      transcript: q.transcript,
      options: { summaries: q.summaries },
      correctAnswerPositions: [q.correctPosition],
    })
  }

  // ── LISTENING: Multiple Choice Single Answer (2 questions) ───────────────────
  const listeningMCSingle = [
    {
      title: 'Interview on Renewable Energy',
      transcript: 'The most significant barrier to renewable energy adoption is not the technology itself—solar and wind are now often the cheapest forms of new electricity generation. The real challenge is grid integration: how do you balance supply and demand when the sun doesn\'t always shine and the wind doesn\'t always blow? Battery storage is improving, but we also need smarter grid management systems and greater regional interconnection.',
      question: 'According to the speaker, what is the main challenge for renewable energy?',
      choices: [
        'The high cost of solar and wind technology',
        'The integration of variable energy sources into the power grid',
        'A lack of political support for renewable energy',
        'The environmental impact of building renewable energy facilities',
      ],
      correctPosition: 1,
    },
    {
      title: 'Documentary Excerpt on Ocean Plastics',
      transcript: 'Every year, approximately 8 million tonnes of plastic enter the ocean. This plastic does not simply disappear—it breaks down into smaller and smaller pieces called microplastics, which are ingested by fish and other marine life. Once in the food chain, these particles are nearly impossible to remove. The most effective solution is prevention: reducing single-use plastic production and improving waste management systems, particularly in countries with rapidly developing economies.',
      question: 'What does the speaker identify as the most effective solution to ocean plastic pollution?',
      choices: [
        'Cleaning up microplastics from the ocean',
        'Educating consumers about recycling',
        'Preventing plastic from entering the ocean through reduced production and better waste management',
        'Developing bacteria that can break down plastic',
      ],
      correctPosition: 2,
    },
  ]

  for (const q of listeningMCSingle) {
    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('listening_mc_single')!,
      title: q.title,
      content: q.transcript,
      difficulty: 'Medium',
      tags: ['multiple-choice', 'single', 'listening'],
      isActive: true,
      isPremium: false,
      correctAnswer: { options: [q.choices[q.correctPosition]] },
      metadata: { source: 'PTE Content Team' },
    }).returning()
    await db.insert(pteListeningQuestions).values({
      questionId: base.id,
      audioFileUrl: 'https://d0ub0i0cvpsd7hu8.public.blob.vercel-storage.com/audio/listening/mc-single/placeholder.mp3',
      audioDuration: 60,
      transcript: q.transcript,
      questionText: q.question,
      options: { choices: q.choices },
      correctAnswerPositions: [q.correctPosition],
    })
  }

  // ── LISTENING: Select Missing Word (2 questions) ──────────────────────────────
  const selectMissingWord = [
    {
      title: 'Podcast on Remote Work Productivity',
      transcript: 'Research shows that remote workers often report higher job satisfaction and better work-life balance. However, the key to maintaining productivity at home is establishing clear boundaries between work and personal time. Employees who create dedicated workspaces and stick to regular hours tend to be more...',
      options: ['productive', 'isolated', 'stressed', 'expensive'],
      correctPosition: 0,
    },
    {
      title: 'Documentary on Space Exploration',
      transcript: 'The discovery of water ice on the Moon has reignited interest in lunar exploration. Water can be split into hydrogen and oxygen, which can be used as rocket propellant. This means the Moon could serve as a refuelling station for missions deeper into the solar...',
      options: ['system', 'economy', 'community', 'programme'],
      correctPosition: 0,
    },
  ]

  for (const q of selectMissingWord) {
    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('select_missing_word')!,
      title: q.title,
      content: q.transcript,
      difficulty: 'Easy',
      tags: ['missing-word', 'listening'],
      isActive: true,
      isPremium: false,
      correctAnswer: { options: [q.options[q.correctPosition]] },
      metadata: { source: 'PTE Content Team' },
    }).returning()
    await db.insert(pteListeningQuestions).values({
      questionId: base.id,
      audioFileUrl: 'https://d0ub0i0cvpsd7hu8.public.blob.vercel-storage.com/audio/listening/select-missing-word/placeholder.mp3',
      audioDuration: 30,
      transcript: q.transcript,
      options: { choices: q.options },
      correctAnswerPositions: [q.correctPosition],
    })
  }

  // ── LISTENING: Highlight Incorrect Words (2 questions) ───────────────────────
  const highlightIncorrect = [
    {
      title: 'Documentary on Coral Reefs',
      transcript: 'Coral reefs are among the most biologically diverse ecosystems on Earth, supporting approximately 25% of all marine species. Often called the rainforests of the sea, these structures are built by tiny animals called coral polyps. Rising ocean temperatures cause corals to expel the algae that live within them—a process known as coral bleaching.',
      audioTranscript: 'Coral reefs are among the most biologically productive ecosystems on Earth, supporting approximately 25% of all marine species. Often called the rainforests of the sea, these structures are built by tiny organisms called coral polyps. Rising ocean temperatures cause corals to expel the algae that live within them—a process known as coral bleaching.',
    },
    {
      title: 'News Report on Electric Vehicles',
      transcript: 'Electric vehicle sales have surpassed expectations in many markets. Falling battery costs and expanding charging infrastructure are making EVs increasingly competitive with petrol cars. Many governments are offering purchase subsidies to encourage adoption, and several countries have announced plans to phase out new petrol vehicle sales by 2035.',
      audioTranscript: 'Electric vehicle sales have exceeded expectations in many markets. Falling battery costs and expanding charging infrastructure are making EVs increasingly affordable compared to petrol cars. Many governments are offering purchase subsidies to encourage adoption, and several countries have announced plans to ban new petrol vehicle sales by 2035.',
    },
  ]

  for (const q of highlightIncorrect) {
    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('highlight_incorrect_words')!,
      title: q.title,
      content: q.transcript,
      difficulty: 'Hard',
      tags: ['highlight', 'incorrect', 'listening'],
      isActive: true,
      isPremium: false,
      metadata: { source: 'PTE Content Team' },
    }).returning()
    await db.insert(pteListeningQuestions).values({
      questionId: base.id,
      audioFileUrl: 'https://d0ub0i0cvpsd7hu8.public.blob.vercel-storage.com/audio/listening/highlight-incorrect-words/placeholder.mp3',
      audioDuration: 45,
      transcript: q.audioTranscript,
    })
  }

  // ── LISTENING: Write from Dictation (3 questions) ────────────────────────────
  const writeFromDictation = [
    'The government has introduced new policies to reduce carbon emissions.',
    'Students who participate in extracurricular activities often perform better academically.',
    'Advances in medical technology have significantly improved patient outcomes worldwide.',
  ]

  for (const sentence of writeFromDictation) {
    const [base] = await db.insert(pteQuestions).values({
      questionTypeId: qtMap.get('write_from_dictation')!,
      title: `Dictation: ${sentence.substring(0, 40)}...`,
      content: sentence,
      difficulty: 'Medium',
      tags: ['dictation', 'listening', 'spelling'],
      isActive: true,
      isPremium: false,
      correctAnswer: { text: sentence },
      metadata: { source: 'PTE Content Team' },
    }).returning()
    await db.insert(pteListeningQuestions).values({
      questionId: base.id,
      audioFileUrl: 'https://d0ub0i0cvpsd7hu8.public.blob.vercel-storage.com/audio/listening/write-from-dictation/placeholder.mp3',
      audioDuration: 10,
      transcript: sentence,
    })
  }

  console.log('✅ All PTE questions seeded successfully!')
  console.log('   Speaking: Read Aloud (3), Repeat Sentence (3), Describe Image (2), Re-tell Lecture (2), Answer Short Question (3)')
  console.log('   Writing:  Summarize Written Text (3), Essay (3), Email (2)')
  console.log('   Reading:  Fill Blanks Dropdown (3), MC Multiple (2), Reorder Paragraphs (2), Fill Blanks Drag (2), MC Single (2)')
  console.log('   Listening: Summarize Spoken Text (2), MC Multiple (2), Fill Blanks (2), Highlight Summary (2), MC Single (2), Missing Word (2), Highlight Incorrect (2), Write from Dictation (3)')
}

seedAllQuestions()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seeding failed:', err)
    process.exit(1)
  })
