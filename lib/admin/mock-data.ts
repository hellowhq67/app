import type {
  AdminUser,
  AdminQuestion,
  AdminAttempt,
  AdminMockTest,
  HealthService,
  DashboardStats,
  ChartDataPoint,
  SectionAttemptData,
} from './types'

// ─── Users ───────────────────────────────────────────────────────────────────

export const mockUsers: AdminUser[] = [
  {
    id: 'usr_001', name: 'Aisha Rahman', email: 'aisha.rahman@gmail.com',
    role: 'admin', banned: false, banReason: null,
    subscriptionTier: 'unlimited', subscriptionStatus: 'active',
    subscriptionExpiresAt: '2026-12-31', dailyAiCredits: 50, aiCreditsUsed: 12,
    dailyPracticeLimit: 100, practiceQuestionsUsed: 34, emailVerified: true,
    examDate: '2026-06-15', createdAt: '2025-01-10T08:00:00Z', image: null,
    totalAttempts: 342, avgScore: 78, mockTestsTaken: 12,
  },
  {
    id: 'usr_002', name: 'Marco Silva', email: 'marco.silva@outlook.com',
    role: 'teacher', banned: false, banReason: null,
    subscriptionTier: 'premium', subscriptionStatus: 'active',
    subscriptionExpiresAt: '2026-09-30', dailyAiCredits: 30, aiCreditsUsed: 8,
    dailyPracticeLimit: 50, practiceQuestionsUsed: 21, emailVerified: true,
    examDate: null, createdAt: '2025-02-14T10:30:00Z', image: null,
    totalAttempts: 215, avgScore: 82, mockTestsTaken: 8,
  },
  {
    id: 'usr_003', name: 'Priya Nair', email: 'priya.nair@yahoo.com',
    role: 'user', banned: false, banReason: null,
    subscriptionTier: 'premium', subscriptionStatus: 'active',
    subscriptionExpiresAt: '2026-07-01', dailyAiCredits: 30, aiCreditsUsed: 29,
    dailyPracticeLimit: 50, practiceQuestionsUsed: 48, emailVerified: true,
    examDate: '2026-05-20', createdAt: '2025-03-05T09:15:00Z', image: null,
    totalAttempts: 189, avgScore: 71, mockTestsTaken: 6,
  },
  {
    id: 'usr_004', name: 'James Okafor', email: 'james.okafor@gmail.com',
    role: 'user', banned: false, banReason: null,
    subscriptionTier: 'basic', subscriptionStatus: 'active',
    subscriptionExpiresAt: '2026-05-15', dailyAiCredits: 15, aiCreditsUsed: 10,
    dailyPracticeLimit: 20, practiceQuestionsUsed: 18, emailVerified: true,
    examDate: '2026-04-10', createdAt: '2025-03-22T14:00:00Z', image: null,
    totalAttempts: 98, avgScore: 64, mockTestsTaken: 3,
  },
  {
    id: 'usr_005', name: 'Liu Yang', email: 'liu.yang@hotmail.com',
    role: 'user', banned: false, banReason: null,
    subscriptionTier: 'free', subscriptionStatus: 'active',
    subscriptionExpiresAt: null, dailyAiCredits: 10, aiCreditsUsed: 10,
    dailyPracticeLimit: 3, practiceQuestionsUsed: 3, emailVerified: false,
    examDate: '2026-08-30', createdAt: '2025-04-01T07:45:00Z', image: null,
    totalAttempts: 23, avgScore: 58, mockTestsTaken: 1,
  },
  {
    id: 'usr_006', name: 'Fatima Al-Hashimi', email: 'fatima.hash@gmail.com',
    role: 'user', banned: false, banReason: null,
    subscriptionTier: 'unlimited', subscriptionStatus: 'active',
    subscriptionExpiresAt: '2027-01-01', dailyAiCredits: 50, aiCreditsUsed: 41,
    dailyPracticeLimit: 100, practiceQuestionsUsed: 87, emailVerified: true,
    examDate: '2026-03-28', createdAt: '2025-01-28T11:20:00Z', image: null,
    totalAttempts: 567, avgScore: 85, mockTestsTaken: 20,
  },
  {
    id: 'usr_007', name: 'Carlos Mendez', email: 'c.mendez@university.edu',
    role: 'user', banned: false, banReason: null,
    subscriptionTier: 'premium', subscriptionStatus: 'trial',
    subscriptionExpiresAt: '2026-04-15', dailyAiCredits: 30, aiCreditsUsed: 5,
    dailyPracticeLimit: 50, practiceQuestionsUsed: 12, emailVerified: true,
    examDate: '2026-07-15', createdAt: '2025-04-08T13:30:00Z', image: null,
    totalAttempts: 45, avgScore: 69, mockTestsTaken: 2,
  },
  {
    id: 'usr_008', name: 'Yuki Tanaka', email: 'yuki.tanaka@jp.com',
    role: 'user', banned: false, banReason: null,
    subscriptionTier: 'basic', subscriptionStatus: 'expired',
    subscriptionExpiresAt: '2026-02-28', dailyAiCredits: 15, aiCreditsUsed: 0,
    dailyPracticeLimit: 20, practiceQuestionsUsed: 0, emailVerified: true,
    examDate: null, createdAt: '2025-02-01T06:00:00Z', image: null,
    totalAttempts: 134, avgScore: 73, mockTestsTaken: 5,
  },
  {
    id: 'usr_009', name: 'Amara Diallo', email: 'amara.diallo@gmail.com',
    role: 'user', banned: false, banReason: null,
    subscriptionTier: 'free', subscriptionStatus: 'active',
    subscriptionExpiresAt: null, dailyAiCredits: 10, aiCreditsUsed: 7,
    dailyPracticeLimit: 3, practiceQuestionsUsed: 2, emailVerified: true,
    examDate: '2026-09-01', createdAt: '2025-04-10T15:00:00Z', image: null,
    totalAttempts: 11, avgScore: 52, mockTestsTaken: 0,
  },
  {
    id: 'usr_010', name: 'Sofia Petrov', email: 'sofia.petrov@mail.ru',
    role: 'user', banned: false, banReason: null,
    subscriptionTier: 'premium', subscriptionStatus: 'active',
    subscriptionExpiresAt: '2026-11-30', dailyAiCredits: 30, aiCreditsUsed: 22,
    dailyPracticeLimit: 50, practiceQuestionsUsed: 35, emailVerified: true,
    examDate: '2026-05-10', createdAt: '2025-02-20T09:00:00Z', image: null,
    totalAttempts: 276, avgScore: 79, mockTestsTaken: 9,
  },
  {
    id: 'usr_011', name: 'Ahmed Hassan', email: 'ahmed.h@arabmail.com',
    role: 'user', banned: false, banReason: null,
    subscriptionTier: 'unlimited', subscriptionStatus: 'active',
    subscriptionExpiresAt: '2027-03-01', dailyAiCredits: 50, aiCreditsUsed: 38,
    dailyPracticeLimit: 100, practiceQuestionsUsed: 72, emailVerified: true,
    examDate: '2026-04-25', createdAt: '2025-01-05T08:30:00Z', image: null,
    totalAttempts: 445, avgScore: 88, mockTestsTaken: 16,
  },
  {
    id: 'usr_012', name: 'Isabella Costa', email: 'isa.costa@brasil.com',
    role: 'user', banned: false, banReason: null,
    subscriptionTier: 'basic', subscriptionStatus: 'active',
    subscriptionExpiresAt: '2026-06-30', dailyAiCredits: 15, aiCreditsUsed: 11,
    dailyPracticeLimit: 20, practiceQuestionsUsed: 15, emailVerified: false,
    examDate: '2026-10-01', createdAt: '2025-03-15T12:00:00Z', image: null,
    totalAttempts: 67, avgScore: 61, mockTestsTaken: 2,
  },
  {
    id: 'usr_013', name: 'Raj Patel', email: 'raj.patel@techcorp.in',
    role: 'user', banned: false, banReason: null,
    subscriptionTier: 'premium', subscriptionStatus: 'cancelled',
    subscriptionExpiresAt: '2026-03-01', dailyAiCredits: 30, aiCreditsUsed: 0,
    dailyPracticeLimit: 50, practiceQuestionsUsed: 0, emailVerified: true,
    examDate: null, createdAt: '2025-01-20T10:00:00Z', image: null,
    totalAttempts: 203, avgScore: 76, mockTestsTaken: 7,
  },
  {
    id: 'usr_014', name: 'Emma Thompson', email: 'emma.t@london.uk',
    role: 'teacher', banned: false, banReason: null,
    subscriptionTier: 'unlimited', subscriptionStatus: 'active',
    subscriptionExpiresAt: '2027-06-01', dailyAiCredits: 50, aiCreditsUsed: 15,
    dailyPracticeLimit: 100, practiceQuestionsUsed: 28, emailVerified: true,
    examDate: null, createdAt: '2025-01-15T09:00:00Z', image: null,
    totalAttempts: 189, avgScore: 91, mockTestsTaken: 4,
  },
  {
    id: 'usr_015', name: 'Kim Sung-jin', email: 'sungjin.kim@korea.net',
    role: 'user', banned: false, banReason: null,
    subscriptionTier: 'free', subscriptionStatus: 'active',
    subscriptionExpiresAt: null, dailyAiCredits: 10, aiCreditsUsed: 3,
    dailyPracticeLimit: 3, practiceQuestionsUsed: 1, emailVerified: true,
    examDate: '2026-12-01', createdAt: '2025-04-12T07:00:00Z', image: null,
    totalAttempts: 8, avgScore: 55, mockTestsTaken: 0,
  },
  {
    id: 'usr_016', name: 'Nadia Volkov', email: 'nadia.v@gmail.com',
    role: 'user', banned: false, banReason: null,
    subscriptionTier: 'premium', subscriptionStatus: 'active',
    subscriptionExpiresAt: '2026-08-15', dailyAiCredits: 30, aiCreditsUsed: 18,
    dailyPracticeLimit: 50, practiceQuestionsUsed: 42, emailVerified: true,
    examDate: '2026-06-30', createdAt: '2025-02-25T14:30:00Z', image: null,
    totalAttempts: 312, avgScore: 74, mockTestsTaken: 11,
  },
  {
    id: 'usr_017', name: 'Tariq Al-Amin', email: 'tariq.alamin@mail.com',
    role: 'user', banned: false, banReason: null,
    subscriptionTier: 'basic', subscriptionStatus: 'trial',
    subscriptionExpiresAt: '2026-04-20', dailyAiCredits: 15, aiCreditsUsed: 9,
    dailyPracticeLimit: 20, practiceQuestionsUsed: 14, emailVerified: true,
    examDate: '2026-05-01', createdAt: '2025-04-05T11:00:00Z', image: null,
    totalAttempts: 56, avgScore: 67, mockTestsTaken: 1,
  },
  {
    id: 'usr_018', name: 'Chiara Romano', email: 'chiara.r@italia.it',
    role: 'user', banned: false, banReason: null,
    subscriptionTier: 'free', subscriptionStatus: 'active',
    subscriptionExpiresAt: null, dailyAiCredits: 10, aiCreditsUsed: 10,
    dailyPracticeLimit: 3, practiceQuestionsUsed: 3, emailVerified: false,
    examDate: '2026-07-20', createdAt: '2025-04-11T16:00:00Z', image: null,
    totalAttempts: 6, avgScore: 48, mockTestsTaken: 0,
  },
  {
    id: 'usr_019', name: 'David Osei', email: 'david.osei@ghana.com',
    role: 'user', banned: false, banReason: null,
    subscriptionTier: 'unlimited', subscriptionStatus: 'active',
    subscriptionExpiresAt: '2026-12-01', dailyAiCredits: 50, aiCreditsUsed: 44,
    dailyPracticeLimit: 100, practiceQuestionsUsed: 91, emailVerified: true,
    examDate: '2026-04-05', createdAt: '2025-01-30T08:00:00Z', image: null,
    totalAttempts: 623, avgScore: 83, mockTestsTaken: 22,
  },
  {
    id: 'usr_020', name: 'Mei Lin', email: 'mei.lin@china.cn',
    role: 'user', banned: false, banReason: null,
    subscriptionTier: 'premium', subscriptionStatus: 'active',
    subscriptionExpiresAt: '2026-09-01', dailyAiCredits: 30, aiCreditsUsed: 25,
    dailyPracticeLimit: 50, practiceQuestionsUsed: 38, emailVerified: true,
    examDate: '2026-06-10', createdAt: '2025-02-10T10:00:00Z', image: null,
    totalAttempts: 298, avgScore: 81, mockTestsTaken: 10,
  },
]

// ─── Questions ────────────────────────────────────────────────────────────────

export const mockQuestions: AdminQuestion[] = [
  // Speaking - Read Aloud
  { id: 'q_001', title: 'Climate Change and Ocean Levels', section: 'Speaking', questionType: 'Read Aloud', difficulty: 'Medium', isPremium: false, content: 'Rising sea levels pose a significant threat to coastal communities worldwide. Scientists predict that without immediate action to reduce greenhouse gas emissions, many low-lying regions could face permanent inundation within the next century.', totalAttempts: 1243, avgScore: 72, passRate: 68, createdAt: '2025-01-15T10:00:00Z' },
  { id: 'q_002', title: 'The Human Microbiome', section: 'Speaking', questionType: 'Read Aloud', difficulty: 'Hard', isPremium: true, content: 'The human microbiome consists of trillions of microorganisms that inhabit the body, particularly in the digestive tract. Recent research suggests these microbes play a crucial role in immune function, mental health, and metabolic processes.', totalAttempts: 876, avgScore: 65, passRate: 58, createdAt: '2025-01-20T09:00:00Z' },
  { id: 'q_003', title: 'Urban Green Spaces', section: 'Speaking', questionType: 'Read Aloud', difficulty: 'Easy', isPremium: false, content: 'Parks and green spaces in cities provide numerous benefits to residents, including improved air quality, reduced stress levels, and opportunities for physical activity and social interaction.', totalAttempts: 2156, avgScore: 80, passRate: 82, createdAt: '2025-01-25T11:00:00Z' },
  { id: 'q_004', title: 'Artificial Intelligence in Medicine', section: 'Speaking', questionType: 'Describe Image', difficulty: 'Medium', isPremium: true, content: 'Describe the bar chart showing AI adoption rates across medical specialties from 2020 to 2025.', totalAttempts: 654, avgScore: 68, passRate: 61, createdAt: '2025-02-01T08:00:00Z' },
  { id: 'q_005', title: 'Economics Lecture Summary', section: 'Speaking', questionType: 'Re-tell Lecture', difficulty: 'Hard', isPremium: true, content: 'Listen to the lecture excerpt about supply and demand dynamics and retell the key concepts.', totalAttempts: 432, avgScore: 61, passRate: 52, createdAt: '2025-02-10T14:00:00Z' },
  { id: 'q_006', title: 'Renewable Energy Sources', section: 'Speaking', questionType: 'Repeat Sentence', difficulty: 'Easy', isPremium: false, content: 'Solar panels convert sunlight directly into electricity through a process called photovoltaic effect.', totalAttempts: 3421, avgScore: 78, passRate: 75, createdAt: '2025-02-15T09:00:00Z' },
  { id: 'q_007', title: 'Historical Architecture', section: 'Speaking', questionType: 'Repeat Sentence', difficulty: 'Medium', isPremium: false, content: 'Gothic cathedrals were constructed using innovative engineering techniques that allowed for taller structures with thinner walls.', totalAttempts: 1876, avgScore: 74, passRate: 70, createdAt: '2025-02-20T10:00:00Z' },
  { id: 'q_008', title: 'Short Answer: Capital Cities', section: 'Speaking', questionType: 'Answer Short Question', difficulty: 'Easy', isPremium: false, content: 'What is the capital city of Australia?', totalAttempts: 4523, avgScore: 89, passRate: 91, createdAt: '2025-02-25T11:00:00Z' },

  // Writing
  { id: 'q_009', title: 'Technology and Society Essay', section: 'Writing', questionType: 'Write Essay', difficulty: 'Hard', isPremium: true, content: 'Some people believe that technology is making humans less creative. Others argue the opposite. Discuss both views and give your own opinion.', totalAttempts: 789, avgScore: 67, passRate: 58, createdAt: '2025-01-18T09:00:00Z' },
  { id: 'q_010', title: 'Environmental Policy Summary', section: 'Writing', questionType: 'Summarize Written Text', difficulty: 'Medium', isPremium: false, content: 'Read the passage about international environmental agreements and write a one-sentence summary.', totalAttempts: 1123, avgScore: 70, passRate: 65, createdAt: '2025-01-22T10:00:00Z' },
  { id: 'q_011', title: 'Remote Work Trends Essay', section: 'Writing', questionType: 'Write Essay', difficulty: 'Medium', isPremium: false, content: 'The rise of remote work has changed the modern workplace. Discuss the advantages and disadvantages for both employees and employers.', totalAttempts: 934, avgScore: 69, passRate: 63, createdAt: '2025-02-05T08:00:00Z' },
  { id: 'q_012', title: 'Scientific Discovery Summary', section: 'Writing', questionType: 'Summarize Written Text', difficulty: 'Hard', isPremium: true, content: 'Summarize the following passage about recent developments in quantum computing in one sentence of no more than 75 words.', totalAttempts: 567, avgScore: 63, passRate: 54, createdAt: '2025-02-12T11:00:00Z' },
  { id: 'q_013', title: 'Urbanization Essay', section: 'Writing', questionType: 'Write Essay', difficulty: 'Easy', isPremium: false, content: 'Cities are growing rapidly around the world. What are the main challenges of urbanization and how can they be addressed?', totalAttempts: 1456, avgScore: 73, passRate: 70, createdAt: '2025-02-18T09:00:00Z' },

  // Reading
  { id: 'q_014', title: 'Biodiversity Conservation', section: 'Reading', questionType: 'Fill in the Blanks', difficulty: 'Medium', isPremium: false, content: 'Complete the passage about biodiversity by selecting the correct words from the dropdown menus.', totalAttempts: 2341, avgScore: 74, passRate: 71, createdAt: '2025-01-16T10:00:00Z' },
  { id: 'q_015', title: 'Ancient Trade Routes', section: 'Reading', questionType: 'Multiple Choice Single', difficulty: 'Easy', isPremium: false, content: 'According to the passage, what was the primary purpose of the Silk Road?', totalAttempts: 3456, avgScore: 82, passRate: 84, createdAt: '2025-01-21T09:00:00Z' },
  { id: 'q_016', title: 'Psychological Study Analysis', section: 'Reading', questionType: 'Multiple Choice Multiple', difficulty: 'Hard', isPremium: true, content: 'Which of the following conclusions can be drawn from the study described in the passage? Select all that apply.', totalAttempts: 876, avgScore: 62, passRate: 55, createdAt: '2025-01-28T11:00:00Z' },
  { id: 'q_017', title: 'Economic Theory Reorder', section: 'Reading', questionType: 'Reorder Paragraphs', difficulty: 'Hard', isPremium: true, content: 'Arrange the following paragraphs about Keynesian economics in the correct logical order.', totalAttempts: 654, avgScore: 59, passRate: 48, createdAt: '2025-02-03T08:00:00Z' },
  { id: 'q_018', title: 'Medical Research Fill', section: 'Reading', questionType: 'Fill in the Blanks Drag', difficulty: 'Medium', isPremium: false, content: 'Drag the correct words to complete the passage about clinical trials and drug development.', totalAttempts: 1789, avgScore: 71, passRate: 67, createdAt: '2025-02-08T10:00:00Z' },
  { id: 'q_019', title: 'Social Media Impact', section: 'Reading', questionType: 'Multiple Choice Single', difficulty: 'Easy', isPremium: false, content: 'What does the author suggest is the primary benefit of social media for small businesses?', totalAttempts: 2987, avgScore: 79, passRate: 80, createdAt: '2025-02-14T09:00:00Z' },
  { id: 'q_020', title: 'Astronomy Passage', section: 'Reading', questionType: 'Fill in the Blanks', difficulty: 'Easy', isPremium: false, content: 'Complete the passage about the formation of our solar system using appropriate words.', totalAttempts: 2134, avgScore: 76, passRate: 74, createdAt: '2025-02-22T11:00:00Z' },

  // Listening
  { id: 'q_021', title: 'Climate Summit Summary', section: 'Listening', questionType: 'Summarize Spoken Text', difficulty: 'Hard', isPremium: true, content: 'Listen to the lecture about outcomes from the recent international climate summit and write a summary.', totalAttempts: 543, avgScore: 64, passRate: 56, createdAt: '2025-01-17T10:00:00Z' },
  { id: 'q_022', title: 'University Lecture: Psychology', section: 'Listening', questionType: 'Fill in the Blanks', difficulty: 'Medium', isPremium: false, content: 'Listen and complete the notes about cognitive behavioral therapy.', totalAttempts: 1876, avgScore: 73, passRate: 69, createdAt: '2025-01-23T09:00:00Z' },
  { id: 'q_023', title: 'Business Meeting Recording', section: 'Listening', questionType: 'Multiple Choice Multiple', difficulty: 'Medium', isPremium: false, content: 'Listen to the business meeting and select all the action items agreed upon.', totalAttempts: 1234, avgScore: 71, passRate: 66, createdAt: '2025-01-30T11:00:00Z' },
  { id: 'q_024', title: 'Write from Dictation: Science', section: 'Listening', questionType: 'Write from Dictation', difficulty: 'Easy', isPremium: false, content: 'Listen carefully and write the sentence you hear about photosynthesis.', totalAttempts: 4567, avgScore: 83, passRate: 85, createdAt: '2025-02-06T08:00:00Z' },
  { id: 'q_025', title: 'History Podcast Highlight', section: 'Listening', questionType: 'Highlight Correct Summary', difficulty: 'Medium', isPremium: true, content: 'Listen to the excerpt about the Industrial Revolution and select the most accurate summary.', totalAttempts: 987, avgScore: 69, passRate: 63, createdAt: '2025-02-11T10:00:00Z' },
  { id: 'q_026', title: 'Academic Lecture: Economics', section: 'Listening', questionType: 'Multiple Choice Single', difficulty: 'Hard', isPremium: true, content: 'According to the professor, what is the main cause of market failure discussed in the lecture?', totalAttempts: 678, avgScore: 61, passRate: 53, createdAt: '2025-02-16T09:00:00Z' },
  { id: 'q_027', title: 'News Report Dictation', section: 'Listening', questionType: 'Write from Dictation', difficulty: 'Medium', isPremium: false, content: 'Write the sentence from the news report about renewable energy policy.', totalAttempts: 3210, avgScore: 77, passRate: 76, createdAt: '2025-02-21T11:00:00Z' },
  { id: 'q_028', title: 'Incorrect Words: Biology', section: 'Listening', questionType: 'Highlight Incorrect Words', difficulty: 'Medium', isPremium: false, content: 'As you listen, identify words in the transcript that differ from what the speaker says.', totalAttempts: 1543, avgScore: 72, passRate: 68, createdAt: '2025-02-26T08:00:00Z' },
  { id: 'q_029', title: 'Missing Word: Technology', section: 'Listening', questionType: 'Select Missing Word', difficulty: 'Easy', isPremium: false, content: 'Listen to the recording and select the word that best completes the sentence.', totalAttempts: 2876, avgScore: 80, passRate: 82, createdAt: '2025-03-01T10:00:00Z' },
  { id: 'q_030', title: 'Environmental Talk Summary', section: 'Listening', questionType: 'Summarize Spoken Text', difficulty: 'Medium', isPremium: false, content: 'Listen to the talk about plastic pollution solutions and write a 50-70 word summary.', totalAttempts: 876, avgScore: 68, passRate: 62, createdAt: '2025-03-05T09:00:00Z' },
  // Additional questions to reach 50
  { id: 'q_031', title: 'Coral Reef Ecology', section: 'Speaking', questionType: 'Read Aloud', difficulty: 'Medium', isPremium: false, content: 'Coral reefs support approximately 25% of all marine species despite covering less than 1% of the ocean floor, making them one of the most biodiverse ecosystems on Earth.', totalAttempts: 1567, avgScore: 75, passRate: 72, createdAt: '2025-03-08T10:00:00Z' },
  { id: 'q_032', title: 'Space Exploration Goals', section: 'Writing', questionType: 'Write Essay', difficulty: 'Medium', isPremium: false, content: 'Many countries invest heavily in space exploration. Do you think these resources would be better spent addressing problems on Earth? Discuss.', totalAttempts: 1089, avgScore: 71, passRate: 66, createdAt: '2025-03-10T09:00:00Z' },
  { id: 'q_033', title: 'Literature Analysis', section: 'Reading', questionType: 'Multiple Choice Multiple', difficulty: 'Medium', isPremium: false, content: 'Based on the passage about Victorian literature, which themes are explicitly mentioned by the author?', totalAttempts: 1234, avgScore: 70, passRate: 65, createdAt: '2025-03-12T11:00:00Z' },
  { id: 'q_034', title: 'Lecture on Memory', section: 'Listening', questionType: 'Fill in the Blanks', difficulty: 'Hard', isPremium: true, content: 'Complete the notes from the psychology lecture about types of human memory.', totalAttempts: 654, avgScore: 63, passRate: 55, createdAt: '2025-03-14T08:00:00Z' },
  { id: 'q_035', title: 'Nutrition Science', section: 'Speaking', questionType: 'Re-tell Lecture', difficulty: 'Medium', isPremium: false, content: 'Retell the key points from the lecture about the role of micronutrients in human health.', totalAttempts: 876, avgScore: 68, passRate: 62, createdAt: '2025-03-16T10:00:00Z' },
  { id: 'q_036', title: 'Global Trade Summary', section: 'Writing', questionType: 'Summarize Written Text', difficulty: 'Easy', isPremium: false, content: 'Summarize the key points about global supply chains in one sentence of no more than 75 words.', totalAttempts: 1678, avgScore: 74, passRate: 72, createdAt: '2025-03-18T09:00:00Z' },
  { id: 'q_037', title: 'Genetics and Disease', section: 'Reading', questionType: 'Fill in the Blanks', difficulty: 'Hard', isPremium: true, content: 'Complete the passage about genetic predispositions to common diseases using appropriate terminology.', totalAttempts: 567, avgScore: 61, passRate: 52, createdAt: '2025-03-20T11:00:00Z' },
  { id: 'q_038', title: 'News Broadcast Dictation', section: 'Listening', questionType: 'Write from Dictation', difficulty: 'Hard', isPremium: false, content: 'Write the sentence from the news broadcast about international trade agreements.', totalAttempts: 1987, avgScore: 69, passRate: 64, createdAt: '2025-03-22T08:00:00Z' },
  { id: 'q_039', title: 'Cultural Diversity Describe', section: 'Speaking', questionType: 'Describe Image', difficulty: 'Easy', isPremium: false, content: 'Describe the pie chart showing cultural diversity statistics in major metropolitan areas.', totalAttempts: 2134, avgScore: 77, passRate: 76, createdAt: '2025-03-24T10:00:00Z' },
  { id: 'q_040', title: 'Digital Privacy Essay', section: 'Writing', questionType: 'Write Essay', difficulty: 'Hard', isPremium: true, content: 'In the digital age, personal privacy is increasingly difficult to maintain. Discuss the challenges and propose solutions.', totalAttempts: 654, avgScore: 65, passRate: 57, createdAt: '2025-03-26T09:00:00Z' },
  { id: 'q_041', title: 'Ocean Plastic Reorder', section: 'Reading', questionType: 'Reorder Paragraphs', difficulty: 'Medium', isPremium: false, content: 'Arrange the paragraphs describing the lifecycle of ocean plastic waste in the correct order.', totalAttempts: 987, avgScore: 67, passRate: 61, createdAt: '2025-03-28T11:00:00Z' },
  { id: 'q_042', title: 'Technology Lecture Summary', section: 'Listening', questionType: 'Summarize Spoken Text', difficulty: 'Easy', isPremium: false, content: 'Listen to the talk about smartphone usage patterns and write a brief summary.', totalAttempts: 1234, avgScore: 71, passRate: 68, createdAt: '2025-03-30T08:00:00Z' },
  { id: 'q_043', title: 'Pronunciation Practice', section: 'Speaking', questionType: 'Repeat Sentence', difficulty: 'Hard', isPremium: true, content: 'The electromagnetic spectrum encompasses all types of radiation, from radio waves to gamma rays, each with distinct wavelengths and frequencies.', totalAttempts: 765, avgScore: 62, passRate: 54, createdAt: '2025-04-01T10:00:00Z' },
  { id: 'q_044', title: 'Historical Event Analysis', section: 'Reading', questionType: 'Multiple Choice Single', difficulty: 'Medium', isPremium: false, content: 'What does the author identify as the primary catalyst for the French Revolution?', totalAttempts: 1876, avgScore: 76, passRate: 75, createdAt: '2025-04-03T09:00:00Z' },
  { id: 'q_045', title: 'Medical Research Highlight', section: 'Listening', questionType: 'Highlight Correct Summary', difficulty: 'Hard', isPremium: true, content: 'Listen to the medical researcher describe findings about cancer prevention and choose the best summary.', totalAttempts: 543, avgScore: 64, passRate: 56, createdAt: '2025-04-05T11:00:00Z' },
  { id: 'q_046', title: 'Climate Models Essay', section: 'Writing', questionType: 'Write Essay', difficulty: 'Easy', isPremium: false, content: 'Do you agree that governments should take stronger action on climate change? Provide reasons and examples.', totalAttempts: 1654, avgScore: 72, passRate: 70, createdAt: '2025-04-07T08:00:00Z' },
  { id: 'q_047', title: 'Biology Blanks Drag', section: 'Reading', questionType: 'Fill in the Blanks Drag', difficulty: 'Easy', isPremium: false, content: 'Drag the correct biological terms to complete the passage about cell division.', totalAttempts: 2345, avgScore: 78, passRate: 78, createdAt: '2025-04-09T10:00:00Z' },
  { id: 'q_048', title: 'Missing Word: History', section: 'Listening', questionType: 'Select Missing Word', difficulty: 'Medium', isPremium: false, content: 'Listen and select the word that logically completes the recorded statement about ancient civilizations.', totalAttempts: 1789, avgScore: 75, passRate: 73, createdAt: '2025-04-11T09:00:00Z' },
  { id: 'q_049', title: 'Art History Short Answer', section: 'Speaking', questionType: 'Answer Short Question', difficulty: 'Medium', isPremium: false, content: 'Who painted the Mona Lisa?', totalAttempts: 5234, avgScore: 92, passRate: 95, createdAt: '2025-04-13T11:00:00Z' },
  { id: 'q_050', title: 'Summary Writing: Transport', section: 'Writing', questionType: 'Summarize Written Text', difficulty: 'Medium', isPremium: false, content: 'Read the passage about the future of autonomous vehicles and write a one-sentence summary.', totalAttempts: 1123, avgScore: 71, passRate: 67, createdAt: '2025-04-15T08:00:00Z' },
]

// ─── Attempts (recent, for user detail pages) ─────────────────────────────────

export const mockAttempts: AdminAttempt[] = [
  { id: 'att_001', userId: 'usr_003', userName: 'Priya Nair', questionId: 'q_001', questionTitle: 'Climate Change and Ocean Levels', questionType: 'Read Aloud', section: 'Speaking', score: 76, timeTaken: 45, status: 'completed', createdAt: '2026-03-28T10:30:00Z' },
  { id: 'att_002', userId: 'usr_003', userName: 'Priya Nair', questionId: 'q_009', questionTitle: 'Technology and Society Essay', questionType: 'Write Essay', section: 'Writing', score: 68, timeTaken: 1200, status: 'completed', createdAt: '2026-03-27T09:15:00Z' },
  { id: 'att_003', userId: 'usr_003', userName: 'Priya Nair', questionId: 'q_014', questionTitle: 'Biodiversity Conservation', questionType: 'Fill in the Blanks', section: 'Reading', score: 80, timeTaken: 180, status: 'completed', createdAt: '2026-03-26T14:00:00Z' },
  { id: 'att_004', userId: 'usr_006', userName: 'Fatima Al-Hashimi', questionId: 'q_021', questionTitle: 'Climate Summit Summary', questionType: 'Summarize Spoken Text', section: 'Listening', score: 85, timeTaken: 600, status: 'completed', createdAt: '2026-03-28T11:00:00Z' },
  { id: 'att_005', userId: 'usr_011', userName: 'Ahmed Hassan', questionId: 'q_005', questionTitle: 'Economics Lecture Summary', questionType: 'Re-tell Lecture', section: 'Speaking', score: 91, timeTaken: 90, status: 'completed', createdAt: '2026-03-28T08:45:00Z' },
  { id: 'att_006', userId: 'usr_004', userName: 'James Okafor', questionId: 'q_015', questionTitle: 'Ancient Trade Routes', questionType: 'Multiple Choice Single', section: 'Reading', score: 60, timeTaken: 120, status: 'completed', createdAt: '2026-03-27T16:30:00Z' },
  { id: 'att_007', userId: 'usr_020', userName: 'Mei Lin', questionId: 'q_024', questionTitle: 'Write from Dictation: Science', questionType: 'Write from Dictation', section: 'Listening', score: 83, timeTaken: 30, status: 'completed', createdAt: '2026-03-28T07:00:00Z' },
  { id: 'att_008', userId: 'usr_010', userName: 'Sofia Petrov', questionId: 'q_010', questionTitle: 'Environmental Policy Summary', questionType: 'Summarize Written Text', section: 'Writing', score: 72, timeTaken: 600, status: 'completed', createdAt: '2026-03-27T12:00:00Z' },
]

// ─── Mock Tests ───────────────────────────────────────────────────────────────

export const mockMockTests: AdminMockTest[] = [
  {
    id: 'mt_001', testName: 'PTE Academic Full Mock #1', userId: 'usr_006', userName: 'Fatima Al-Hashimi',
    status: 'completed', overallScore: 79, speakingScore: 82, writingScore: 76, readingScore: 80, listeningScore: 78,
    totalQuestions: 68, completedQuestions: 68, totalDuration: 10680,
    startedAt: '2026-03-20T09:00:00Z', completedAt: '2026-03-20T11:58:00Z', createdAt: '2026-03-20T08:55:00Z',
    enablingSkills: { grammar: 78, oralFluency: 81, pronunciation: 84, spelling: 72, vocabulary: 79, writtenDiscourse: 76 },
  },
  {
    id: 'mt_002', testName: 'PTE Academic Full Mock #2', userId: 'usr_011', userName: 'Ahmed Hassan',
    status: 'completed', overallScore: 88, speakingScore: 91, writingScore: 86, readingScore: 87, listeningScore: 88,
    totalQuestions: 68, completedQuestions: 68, totalDuration: 10200,
    startedAt: '2026-03-22T10:00:00Z', completedAt: '2026-03-22T12:50:00Z', createdAt: '2026-03-22T09:55:00Z',
    enablingSkills: { grammar: 87, oralFluency: 90, pronunciation: 93, spelling: 85, vocabulary: 88, writtenDiscourse: 86 },
  },
  {
    id: 'mt_003', testName: 'PTE Academic Full Mock #1', userId: 'usr_019', userName: 'David Osei',
    status: 'completed', overallScore: 83, speakingScore: 85, writingScore: 80, readingScore: 84, listeningScore: 83,
    totalQuestions: 68, completedQuestions: 68, totalDuration: 10440,
    startedAt: '2026-03-25T08:00:00Z', completedAt: '2026-03-25T10:54:00Z', createdAt: '2026-03-25T07:58:00Z',
    enablingSkills: { grammar: 82, oralFluency: 84, pronunciation: 87, spelling: 79, vocabulary: 83, writtenDiscourse: 80 },
  },
  {
    id: 'mt_004', testName: 'PTE Academic Full Mock #3', userId: 'usr_003', userName: 'Priya Nair',
    status: 'in_progress', overallScore: null, speakingScore: null, writingScore: null, readingScore: null, listeningScore: null,
    totalQuestions: 68, completedQuestions: 34, totalDuration: null,
    startedAt: '2026-03-31T09:00:00Z', completedAt: null, createdAt: '2026-03-31T08:58:00Z',
    enablingSkills: null,
  },
  {
    id: 'mt_005', testName: 'PTE Academic Full Mock #2', userId: 'usr_020', userName: 'Mei Lin',
    status: 'completed', overallScore: 81, speakingScore: 83, writingScore: 79, readingScore: 82, listeningScore: 80,
    totalQuestions: 68, completedQuestions: 68, totalDuration: 10560,
    startedAt: '2026-03-26T10:00:00Z', completedAt: '2026-03-26T12:56:00Z', createdAt: '2026-03-26T09:58:00Z',
    enablingSkills: { grammar: 80, oralFluency: 82, pronunciation: 85, spelling: 78, vocabulary: 81, writtenDiscourse: 79 },
  },
  {
    id: 'mt_006', testName: 'PTE Academic Full Mock #1', userId: 'usr_016', userName: 'Nadia Volkov',
    status: 'completed', overallScore: 74, speakingScore: 76, writingScore: 72, readingScore: 75, listeningScore: 73,
    totalQuestions: 68, completedQuestions: 68, totalDuration: 11100,
    startedAt: '2026-03-24T09:30:00Z', completedAt: '2026-03-24T12:35:00Z', createdAt: '2026-03-24T09:28:00Z',
    enablingSkills: { grammar: 73, oralFluency: 75, pronunciation: 78, spelling: 70, vocabulary: 74, writtenDiscourse: 72 },
  },
  {
    id: 'mt_007', testName: 'PTE Academic Full Mock #1', userId: 'usr_004', userName: 'James Okafor',
    status: 'expired', overallScore: null, speakingScore: null, writingScore: null, readingScore: null, listeningScore: null,
    totalQuestions: 68, completedQuestions: 15, totalDuration: null,
    startedAt: '2026-03-18T14:00:00Z', completedAt: null, createdAt: '2026-03-18T13:58:00Z',
    enablingSkills: null,
  },
  {
    id: 'mt_008', testName: 'PTE Academic Full Mock #4', userId: 'usr_006', userName: 'Fatima Al-Hashimi',
    status: 'not_started', overallScore: null, speakingScore: null, writingScore: null, readingScore: null, listeningScore: null,
    totalQuestions: 68, completedQuestions: 0, totalDuration: null,
    startedAt: null, completedAt: null, createdAt: '2026-03-29T10:00:00Z',
    enablingSkills: null,
  },
  {
    id: 'mt_009', testName: 'PTE Academic Full Mock #3', userId: 'usr_001', userName: 'Aisha Rahman',
    status: 'completed', overallScore: 78, speakingScore: 80, writingScore: 75, readingScore: 79, listeningScore: 78,
    totalQuestions: 68, completedQuestions: 68, totalDuration: 10800,
    startedAt: '2026-03-10T09:00:00Z', completedAt: '2026-03-10T12:00:00Z', createdAt: '2026-03-10T08:58:00Z',
    enablingSkills: { grammar: 77, oralFluency: 79, pronunciation: 82, spelling: 74, vocabulary: 78, writtenDiscourse: 75 },
  },
  {
    id: 'mt_010', testName: 'PTE Academic Full Mock #2', userId: 'usr_010', userName: 'Sofia Petrov',
    status: 'expired', overallScore: null, speakingScore: null, writingScore: null, readingScore: null, listeningScore: null,
    totalQuestions: 68, completedQuestions: 0, totalDuration: null,
    startedAt: null, completedAt: null, createdAt: '2026-02-15T10:00:00Z',
    enablingSkills: null,
  },
]

// ─── Health Services ──────────────────────────────────────────────────────────

export const mockHealthServices: HealthService[] = [
  { id: 'svc_db', name: 'Database', description: 'Neon PostgreSQL (Serverless)', status: 'healthy', responseMs: 42, uptimePercent: 99.97, lastChecked: new Date().toISOString(), icon: 'Database' },
  { id: 'svc_ai', name: 'AI Scoring', description: 'Google Gemini 2.5 Flash', status: 'healthy', responseMs: 1240, uptimePercent: 99.81, lastChecked: new Date().toISOString(), icon: 'Brain' },
  { id: 'svc_asr', name: 'Speech-to-Text', description: 'AssemblyAI Transcription', status: 'degraded', responseMs: 3800, uptimePercent: 98.45, lastChecked: new Date().toISOString(), icon: 'Mic' },
  { id: 'svc_blob', name: 'File Storage', description: 'Vercel Blob Storage', status: 'healthy', responseMs: 89, uptimePercent: 99.99, lastChecked: new Date().toISOString(), icon: 'HardDrive' },
  { id: 'svc_email', name: 'Email', description: 'Resend API', status: 'healthy', responseMs: 210, uptimePercent: 99.92, lastChecked: new Date().toISOString(), icon: 'Mail' },
  { id: 'svc_redis', name: 'Cache / Rate Limit', description: 'Upstash Redis', status: 'healthy', responseMs: 15, uptimePercent: 99.95, lastChecked: new Date().toISOString(), icon: 'Zap' },
]

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const mockDashboardStats: DashboardStats = {
  totalUsers: 20,
  activeThisMonth: 14,
  totalQuestions: 50,
  mockTestsTaken: 10,
  newUsersThisWeek: 5,
  avgScore: 73,
  questionsBreakdown: [
    { section: 'Speaking', count: 13 },
    { section: 'Writing', count: 10 },
    { section: 'Reading', count: 14 },
    { section: 'Listening', count: 13 },
  ],
}

// ─── Chart Data ───────────────────────────────────────────────────────────────

export const mockRegistrationTrend: ChartDataPoint[] = [
  { date: 'Mar 2', value: 1 }, { date: 'Mar 3', value: 2 }, { date: 'Mar 4', value: 1 },
  { date: 'Mar 5', value: 3 }, { date: 'Mar 6', value: 2 }, { date: 'Mar 7', value: 1 },
  { date: 'Mar 8', value: 4 }, { date: 'Mar 9', value: 2 }, { date: 'Mar 10', value: 3 },
  { date: 'Mar 11', value: 1 }, { date: 'Mar 12', value: 2 }, { date: 'Mar 13', value: 3 },
  { date: 'Mar 14', value: 5 }, { date: 'Mar 15', value: 2 }, { date: 'Mar 16', value: 1 },
  { date: 'Mar 17', value: 3 }, { date: 'Mar 18', value: 2 }, { date: 'Mar 19', value: 4 },
  { date: 'Mar 20', value: 2 }, { date: 'Mar 21', value: 3 }, { date: 'Mar 22', value: 1 },
  { date: 'Mar 23', value: 2 }, { date: 'Mar 24', value: 4 }, { date: 'Mar 25', value: 3 },
  { date: 'Mar 26', value: 5 }, { date: 'Mar 27', value: 2 }, { date: 'Mar 28', value: 3 },
  { date: 'Mar 29', value: 4 }, { date: 'Mar 30', value: 6 }, { date: 'Mar 31', value: 5 },
]

export const mockSectionAttempts: SectionAttemptData[] = [
  { section: 'Speaking', attempts: 14823, avgScore: 73 },
  { section: 'Writing', attempts: 8234, avgScore: 70 },
  { section: 'Reading', attempts: 19456, avgScore: 74 },
  { section: 'Listening', attempts: 15678, avgScore: 72 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getUserById(id: string): AdminUser | undefined {
  return mockUsers.find((u) => u.id === id)
}

export function getQuestionById(id: string): AdminQuestion | undefined {
  return mockQuestions.find((q) => q.id === id)
}

export function getMockTestById(id: string): AdminMockTest | undefined {
  return mockMockTests.find((t) => t.id === id)
}

export function getAttemptsForUser(userId: string): AdminAttempt[] {
  return mockAttempts.filter((a) => a.userId === userId)
}
