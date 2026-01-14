/**
 * Benchmark Responses for PTE Academic Scoring
 *
 * These are high-quality (85-90 score) responses used as benchmarks
 * for semantic similarity scoring in the RAG pipeline.
 *
 * Each response represents what a strong candidate would produce.
 */

export interface BenchmarkResponse {
  id: string;
  questionType: string;
  response: string;
  score: number;
  features: {
    fluency: number;
    pronunciation?: number;
    content: number;
    vocabulary: number;
    grammar: number;
  };
}

// ============================================================================
// SPEAKING - Read Aloud (10 responses)
// ============================================================================

const readAloudBenchmarks: BenchmarkResponse[] = [
  {
    id: 'benchmark-ra-001',
    questionType: 'read_aloud',
    response:
      'Climate change represents one of the most significant challenges facing humanity today. Rising global temperatures have led to unprecedented weather patterns, melting ice caps, and rising sea levels. Scientists worldwide are working tirelessly to develop sustainable solutions.',
    score: 88,
    features: {
      fluency: 90,
      pronunciation: 88,
      content: 100,
      vocabulary: 85,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-ra-002',
    questionType: 'read_aloud',
    response:
      'The advancement of artificial intelligence has transformed numerous industries, from healthcare to transportation. Machine learning algorithms now power everything from medical diagnoses to autonomous vehicles, revolutionizing how we live and work.',
    score: 89,
    features: {
      fluency: 92,
      pronunciation: 88,
      content: 100,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-ra-003',
    questionType: 'read_aloud',
    response:
      'Educational systems around the world are undergoing significant reforms to better prepare students for the twenty-first century workforce. Critical thinking, creativity, and digital literacy have become essential skills for success in the modern economy.',
    score: 87,
    features: {
      fluency: 88,
      pronunciation: 86,
      content: 100,
      vocabulary: 85,
      grammar: 88,
    },
  },
  {
    id: 'benchmark-ra-004',
    questionType: 'read_aloud',
    response:
      'The global economy has become increasingly interconnected through international trade and digital commerce. Businesses of all sizes can now reach customers worldwide, creating new opportunities for growth and innovation across borders.',
    score: 88,
    features: {
      fluency: 90,
      pronunciation: 87,
      content: 100,
      vocabulary: 86,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-ra-005',
    questionType: 'read_aloud',
    response:
      'Renewable energy sources such as solar and wind power are becoming increasingly cost-effective alternatives to fossil fuels. Many countries have set ambitious targets for transitioning to clean energy within the next few decades.',
    score: 86,
    features: {
      fluency: 87,
      pronunciation: 85,
      content: 100,
      vocabulary: 84,
      grammar: 88,
    },
  },
  {
    id: 'benchmark-ra-006',
    questionType: 'read_aloud',
    response:
      'The human brain remains one of the most complex and fascinating subjects of scientific study. Neuroscientists continue to make groundbreaking discoveries about how our minds process information, form memories, and control behavior.',
    score: 89,
    features: {
      fluency: 91,
      pronunciation: 89,
      content: 100,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-ra-007',
    questionType: 'read_aloud',
    response:
      'Urban planning in the twenty-first century must balance economic development with environmental sustainability. Cities around the world are implementing green infrastructure projects to reduce pollution and improve quality of life for residents.',
    score: 87,
    features: {
      fluency: 88,
      pronunciation: 86,
      content: 100,
      vocabulary: 86,
      grammar: 88,
    },
  },
  {
    id: 'benchmark-ra-008',
    questionType: 'read_aloud',
    response:
      'Medical research has made remarkable progress in recent years, leading to new treatments for previously incurable diseases. Gene therapy and personalized medicine are opening new frontiers in healthcare that were once thought impossible.',
    score: 88,
    features: {
      fluency: 89,
      pronunciation: 87,
      content: 100,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-ra-009',
    questionType: 'read_aloud',
    response:
      'The preservation of biodiversity is essential for maintaining healthy ecosystems and ensuring food security for future generations. Conservation efforts worldwide are working to protect endangered species and their natural habitats.',
    score: 86,
    features: {
      fluency: 87,
      pronunciation: 85,
      content: 100,
      vocabulary: 85,
      grammar: 87,
    },
  },
  {
    id: 'benchmark-ra-010',
    questionType: 'read_aloud',
    response:
      'Digital transformation has fundamentally changed the way organizations operate and compete in the marketplace. Companies that successfully adopt new technologies gain significant advantages in efficiency, customer engagement, and innovation.',
    score: 88,
    features: {
      fluency: 90,
      pronunciation: 87,
      content: 100,
      vocabulary: 87,
      grammar: 89,
    },
  },
];

// ============================================================================
// SPEAKING - Repeat Sentence (10 responses)
// ============================================================================

const repeatSentenceBenchmarks: BenchmarkResponse[] = [
  {
    id: 'benchmark-rs-001',
    questionType: 'repeat_sentence',
    response:
      'The university library will be closed for renovations during the summer break.',
    score: 90,
    features: {
      fluency: 92,
      pronunciation: 90,
      content: 100,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-rs-002',
    questionType: 'repeat_sentence',
    response:
      'Students should submit their assignments before the deadline to avoid penalties.',
    score: 89,
    features: {
      fluency: 90,
      pronunciation: 89,
      content: 100,
      vocabulary: 87,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-rs-003',
    questionType: 'repeat_sentence',
    response:
      'The conference will feature presentations from leading experts in artificial intelligence.',
    score: 88,
    features: {
      fluency: 89,
      pronunciation: 88,
      content: 100,
      vocabulary: 86,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-rs-004',
    questionType: 'repeat_sentence',
    response:
      'Effective communication skills are essential for success in the modern workplace.',
    score: 87,
    features: {
      fluency: 88,
      pronunciation: 87,
      content: 100,
      vocabulary: 85,
      grammar: 88,
    },
  },
  {
    id: 'benchmark-rs-005',
    questionType: 'repeat_sentence',
    response:
      'The research findings suggest a strong correlation between exercise and mental health.',
    score: 89,
    features: {
      fluency: 90,
      pronunciation: 89,
      content: 100,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-rs-006',
    questionType: 'repeat_sentence',
    response:
      'Climate scientists have observed significant changes in global temperature patterns.',
    score: 88,
    features: {
      fluency: 89,
      pronunciation: 88,
      content: 100,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-rs-007',
    questionType: 'repeat_sentence',
    response:
      'The government has announced new measures to support small businesses during the economic recovery.',
    score: 86,
    features: {
      fluency: 87,
      pronunciation: 86,
      content: 100,
      vocabulary: 85,
      grammar: 87,
    },
  },
  {
    id: 'benchmark-rs-008',
    questionType: 'repeat_sentence',
    response:
      'International cooperation is necessary to address the challenges of global warming.',
    score: 88,
    features: {
      fluency: 89,
      pronunciation: 88,
      content: 100,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-rs-009',
    questionType: 'repeat_sentence',
    response:
      'The museum exhibits artifacts from ancient civilizations around the world.',
    score: 87,
    features: {
      fluency: 88,
      pronunciation: 87,
      content: 100,
      vocabulary: 86,
      grammar: 88,
    },
  },
  {
    id: 'benchmark-rs-010',
    questionType: 'repeat_sentence',
    response:
      'Technological innovation continues to transform the healthcare industry in remarkable ways.',
    score: 89,
    features: {
      fluency: 90,
      pronunciation: 89,
      content: 100,
      vocabulary: 88,
      grammar: 90,
    },
  },
];

// ============================================================================
// SPEAKING - Describe Image (10 responses)
// ============================================================================

const describeImageBenchmarks: BenchmarkResponse[] = [
  {
    id: 'benchmark-di-001',
    questionType: 'describe_image',
    response:
      'This bar chart illustrates the annual sales figures for five different product categories over a three-year period from 2020 to 2022. Electronics showed the highest growth, increasing from two million to three point five million dollars. Clothing and home goods remained relatively stable, while food and beverages experienced a moderate decline. The overall trend suggests a shift in consumer preferences toward technology products.',
    score: 88,
    features: {
      fluency: 89,
      pronunciation: 87,
      content: 90,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-di-002',
    questionType: 'describe_image',
    response:
      'The line graph presents the population growth of three major cities: Tokyo, New York, and London between 1950 and 2020. Tokyo experienced the most dramatic increase, growing from approximately eight million to nearly fourteen million inhabitants. New York showed steady growth initially but plateaued after 1990. London demonstrated the slowest growth rate, maintaining a population of around nine million throughout the period.',
    score: 89,
    features: {
      fluency: 90,
      pronunciation: 88,
      content: 92,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-di-003',
    questionType: 'describe_image',
    response:
      'This pie chart displays the distribution of energy sources used for electricity generation in a developed country. Renewable sources account for approximately forty percent of total generation, with solar and wind comprising the largest shares at fifteen percent each. Natural gas represents thirty percent, while coal has declined to just twenty percent. Nuclear energy contributes the remaining ten percent.',
    score: 87,
    features: {
      fluency: 88,
      pronunciation: 86,
      content: 89,
      vocabulary: 86,
      grammar: 88,
    },
  },
  {
    id: 'benchmark-di-004',
    questionType: 'describe_image',
    response:
      'The diagram shows the water cycle, illustrating how water moves through the environment. The process begins with evaporation from oceans and lakes, where water transforms into vapor. This vapor rises and condenses into clouds through the process of condensation. Precipitation then returns water to the surface as rain or snow, completing the cycle through collection in bodies of water.',
    score: 88,
    features: {
      fluency: 89,
      pronunciation: 87,
      content: 91,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-di-005',
    questionType: 'describe_image',
    response:
      'This table compares the specifications of three smartphone models. Model A offers the largest screen at six point seven inches but has the shortest battery life of twelve hours. Model B provides a balanced combination of features with a six point two inch screen and eighteen hours of battery life. Model C prioritizes portability with the smallest form factor but maintains competitive camera capabilities.',
    score: 86,
    features: {
      fluency: 87,
      pronunciation: 85,
      content: 88,
      vocabulary: 85,
      grammar: 87,
    },
  },
  {
    id: 'benchmark-di-006',
    questionType: 'describe_image',
    response:
      'The flowchart demonstrates the recruitment process at a large corporation. The process initiates with job posting and application collection. Candidates then undergo initial screening followed by phone interviews. Successful applicants proceed to in-person interviews with the hiring manager and team. Final decisions involve background checks and reference verification before extending job offers.',
    score: 87,
    features: {
      fluency: 88,
      pronunciation: 86,
      content: 89,
      vocabulary: 86,
      grammar: 88,
    },
  },
  {
    id: 'benchmark-di-007',
    questionType: 'describe_image',
    response:
      'This scatter plot reveals the relationship between hours of study and exam scores among university students. There is a clear positive correlation, with students who studied more hours generally achieving higher scores. The majority of data points cluster between twenty and forty study hours, corresponding to scores ranging from sixty to ninety percent. A few outliers suggest other factors may also influence academic performance.',
    score: 89,
    features: {
      fluency: 90,
      pronunciation: 88,
      content: 91,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-di-008',
    questionType: 'describe_image',
    response:
      'The map illustrates the proposed layout for a new shopping center development. The main building is positioned centrally with parking areas on the north and south sides. Green spaces surround the perimeter, providing pedestrian walkways and outdoor seating areas. The entrance road connects to the highway via a roundabout, designed to manage traffic flow efficiently during peak shopping hours.',
    score: 86,
    features: {
      fluency: 87,
      pronunciation: 85,
      content: 88,
      vocabulary: 85,
      grammar: 87,
    },
  },
  {
    id: 'benchmark-di-009',
    questionType: 'describe_image',
    response:
      'This histogram displays the distribution of ages among participants in a marathon event. The largest group consists of runners aged thirty to forty, representing approximately thirty-five percent of participants. The twenty to thirty age bracket comprises the second largest group at twenty-eight percent. Participation decreases significantly among those over fifty, accounting for only fifteen percent of total runners.',
    score: 88,
    features: {
      fluency: 89,
      pronunciation: 87,
      content: 90,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-di-010',
    questionType: 'describe_image',
    response:
      'The organizational chart depicts the structure of a multinational company. The CEO sits at the top, with three executive vice presidents reporting directly. Each vice president oversees multiple departments including finance, marketing, operations, and human resources. Regional managers in Europe, Asia, and the Americas report to their respective operational vice presidents, creating a hierarchical management system.',
    score: 87,
    features: {
      fluency: 88,
      pronunciation: 86,
      content: 89,
      vocabulary: 86,
      grammar: 88,
    },
  },
];

// ============================================================================
// SPEAKING - Retell Lecture (10 responses)
// ============================================================================

const retellLectureBenchmarks: BenchmarkResponse[] = [
  {
    id: 'benchmark-rl-001',
    questionType: 'retell_lecture',
    response:
      'The lecture discussed the impact of social media on modern communication. The speaker explained how platforms like Twitter and Facebook have revolutionized information sharing, enabling instant global connectivity. However, concerns were raised about misinformation and its effects on public discourse. The professor emphasized the need for digital literacy education to help users critically evaluate online content.',
    score: 88,
    features: {
      fluency: 89,
      pronunciation: 87,
      content: 90,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-rl-002',
    questionType: 'retell_lecture',
    response:
      'The presentation covered the history of renewable energy development. The speaker traced the evolution from early hydroelectric power in the nineteenth century to modern solar and wind technologies. Key milestones included the oil crisis of the 1970s, which sparked interest in alternative energy sources. The lecture concluded by discussing current innovations in battery storage and grid integration.',
    score: 87,
    features: {
      fluency: 88,
      pronunciation: 86,
      content: 89,
      vocabulary: 86,
      grammar: 88,
    },
  },
  {
    id: 'benchmark-rl-003',
    questionType: 'retell_lecture',
    response:
      'The lecture examined the psychological effects of remote work arrangements. Research findings indicated that while employees appreciate flexibility, many experience feelings of isolation and difficulty separating work from personal life. The speaker suggested strategies for maintaining work-life balance, including establishing dedicated workspaces and regular communication with colleagues to foster team cohesion.',
    score: 89,
    features: {
      fluency: 90,
      pronunciation: 88,
      content: 91,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-rl-004',
    questionType: 'retell_lecture',
    response:
      'The speaker discussed urbanization trends in developing countries and their environmental implications. Rapid population growth in cities has led to increased pollution, traffic congestion, and strain on infrastructure. The lecture highlighted successful case studies from Singapore and Copenhagen, where innovative urban planning has created more sustainable and livable cities despite dense populations.',
    score: 86,
    features: {
      fluency: 87,
      pronunciation: 85,
      content: 88,
      vocabulary: 85,
      grammar: 87,
    },
  },
  {
    id: 'benchmark-rl-005',
    questionType: 'retell_lecture',
    response:
      'The presentation focused on advances in medical imaging technology. The speaker explained how MRI and CT scanning have transformed diagnostic capabilities, enabling doctors to detect diseases at earlier stages. Recent developments in artificial intelligence are now helping radiologists analyze images more accurately and efficiently. The lecture also addressed privacy concerns related to storing sensitive medical data.',
    score: 88,
    features: {
      fluency: 89,
      pronunciation: 87,
      content: 90,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-rl-006',
    questionType: 'retell_lecture',
    response:
      'The lecture analyzed the economic impact of international tourism on developing nations. The speaker presented data showing tourism accounts for significant GDP contributions in many countries. However, concerns were raised about overdependence on this sector and environmental degradation of popular destinations. Sustainable tourism practices were proposed as solutions to balance economic benefits with preservation.',
    score: 87,
    features: {
      fluency: 88,
      pronunciation: 86,
      content: 89,
      vocabulary: 86,
      grammar: 88,
    },
  },
  {
    id: 'benchmark-rl-007',
    questionType: 'retell_lecture',
    response:
      'The speaker explored the relationship between sleep quality and cognitive performance. Research demonstrates that inadequate sleep impairs memory consolidation, decision-making, and emotional regulation. The lecture described various sleep disorders and their prevalence in modern society. Recommendations included maintaining consistent sleep schedules and limiting screen exposure before bedtime.',
    score: 88,
    features: {
      fluency: 89,
      pronunciation: 87,
      content: 90,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-rl-008',
    questionType: 'retell_lecture',
    response:
      'The presentation examined the evolution of language learning methodologies. Traditional grammar-translation approaches have given way to communicative language teaching, emphasizing practical usage over memorization. The speaker discussed how technology has created new opportunities through language learning apps and online conversation partners. Immersive methods were highlighted as particularly effective for achieving fluency.',
    score: 86,
    features: {
      fluency: 87,
      pronunciation: 85,
      content: 88,
      vocabulary: 85,
      grammar: 87,
    },
  },
  {
    id: 'benchmark-rl-009',
    questionType: 'retell_lecture',
    response:
      'The lecture covered the challenges facing global food security in the twenty-first century. Population growth and climate change are threatening agricultural productivity in many regions. The speaker discussed innovative solutions including vertical farming, drought-resistant crops, and reducing food waste in supply chains. International cooperation was emphasized as essential for addressing these complex challenges.',
    score: 89,
    features: {
      fluency: 90,
      pronunciation: 88,
      content: 91,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-rl-010',
    questionType: 'retell_lecture',
    response:
      'The speaker discussed the democratization of higher education through online learning platforms. Massive open online courses have made quality education accessible to millions worldwide. The lecture examined both benefits, such as affordability and flexibility, and limitations, including completion rates and credential recognition. The future may see hybrid models combining online and traditional classroom instruction.',
    score: 87,
    features: {
      fluency: 88,
      pronunciation: 86,
      content: 89,
      vocabulary: 86,
      grammar: 88,
    },
  },
];

// ============================================================================
// SPEAKING - Answer Short Question (10 responses)
// ============================================================================

const answerShortQuestionBenchmarks: BenchmarkResponse[] = [
  {
    id: 'benchmark-asq-001',
    questionType: 'answer_short_question',
    response: 'The capital of Australia is Canberra.',
    score: 90,
    features: {
      fluency: 92,
      pronunciation: 90,
      content: 100,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-asq-002',
    questionType: 'answer_short_question',
    response:
      'A person who studies history is called a historian.',
    score: 89,
    features: {
      fluency: 90,
      pronunciation: 89,
      content: 100,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-asq-003',
    questionType: 'answer_short_question',
    response: 'Water freezes at zero degrees Celsius.',
    score: 90,
    features: {
      fluency: 91,
      pronunciation: 90,
      content: 100,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-asq-004',
    questionType: 'answer_short_question',
    response:
      'The process by which plants convert sunlight into energy is called photosynthesis.',
    score: 88,
    features: {
      fluency: 89,
      pronunciation: 88,
      content: 100,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-asq-005',
    questionType: 'answer_short_question',
    response:
      'A triangle with three equal sides is called an equilateral triangle.',
    score: 89,
    features: {
      fluency: 90,
      pronunciation: 89,
      content: 100,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-asq-006',
    questionType: 'answer_short_question',
    response:
      'The device used to measure atmospheric pressure is called a barometer.',
    score: 88,
    features: {
      fluency: 89,
      pronunciation: 88,
      content: 100,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-asq-007',
    questionType: 'answer_short_question',
    response:
      'A group of lions is commonly referred to as a pride.',
    score: 90,
    features: {
      fluency: 91,
      pronunciation: 90,
      content: 100,
      vocabulary: 89,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-asq-008',
    questionType: 'answer_short_question',
    response:
      'The largest planet in our solar system is Jupiter.',
    score: 90,
    features: {
      fluency: 91,
      pronunciation: 90,
      content: 100,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-asq-009',
    questionType: 'answer_short_question',
    response:
      'A doctor who specializes in treating children is called a pediatrician.',
    score: 88,
    features: {
      fluency: 89,
      pronunciation: 88,
      content: 100,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-asq-010',
    questionType: 'answer_short_question',
    response:
      'The currency used in Japan is the Japanese yen.',
    score: 89,
    features: {
      fluency: 90,
      pronunciation: 89,
      content: 100,
      vocabulary: 88,
      grammar: 90,
    },
  },
];

// ============================================================================
// WRITING - Summarize Written Text (10 responses)
// ============================================================================

const summarizeWrittenTextBenchmarks: BenchmarkResponse[] = [
  {
    id: 'benchmark-swt-001',
    questionType: 'summarize_written_text',
    response:
      'Climate change poses significant threats to global ecosystems and human societies through rising temperatures, extreme weather events, and sea level rise, requiring immediate international cooperation to implement sustainable solutions and reduce greenhouse gas emissions.',
    score: 88,
    features: {
      fluency: 89,
      content: 90,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-swt-002',
    questionType: 'summarize_written_text',
    response:
      'Artificial intelligence is transforming industries worldwide by automating routine tasks, enhancing decision-making through data analysis, and creating new opportunities for innovation, though ethical concerns about privacy and job displacement must be addressed through thoughtful regulation.',
    score: 89,
    features: {
      fluency: 90,
      content: 91,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-swt-003',
    questionType: 'summarize_written_text',
    response:
      'The global shift toward remote work has fundamentally altered workplace dynamics, offering benefits such as flexibility and reduced commuting while presenting challenges including isolation, blurred work-life boundaries, and the need for new management approaches to maintain productivity and team cohesion.',
    score: 87,
    features: {
      fluency: 88,
      content: 89,
      vocabulary: 86,
      grammar: 88,
    },
  },
  {
    id: 'benchmark-swt-004',
    questionType: 'summarize_written_text',
    response:
      'Renewable energy sources are becoming increasingly competitive with fossil fuels due to technological advances that have reduced costs, government incentives promoting clean energy adoption, and growing public awareness of environmental sustainability, positioning them as viable solutions for meeting future energy demands.',
    score: 88,
    features: {
      fluency: 89,
      content: 90,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-swt-005',
    questionType: 'summarize_written_text',
    response:
      'Modern healthcare systems face unprecedented challenges from aging populations, rising chronic disease rates, and escalating costs, necessitating innovative approaches such as preventive care, digital health technologies, and reformed payment models to ensure sustainable and equitable access to quality medical services.',
    score: 86,
    features: {
      fluency: 87,
      content: 88,
      vocabulary: 85,
      grammar: 87,
    },
  },
  {
    id: 'benchmark-swt-006',
    questionType: 'summarize_written_text',
    response:
      'Urbanization continues to accelerate globally as populations migrate to cities seeking economic opportunities and improved services, creating both opportunities for sustainable development through efficient infrastructure and challenges related to housing affordability, environmental degradation, and social inequality.',
    score: 88,
    features: {
      fluency: 89,
      content: 90,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-swt-007',
    questionType: 'summarize_written_text',
    response:
      'Educational reform efforts worldwide emphasize developing critical thinking, creativity, and digital literacy skills rather than rote memorization, preparing students for rapidly evolving job markets where adaptability and lifelong learning have become essential for career success.',
    score: 87,
    features: {
      fluency: 88,
      content: 89,
      vocabulary: 86,
      grammar: 88,
    },
  },
  {
    id: 'benchmark-swt-008',
    questionType: 'summarize_written_text',
    response:
      'Social media platforms have revolutionized communication and information sharing by enabling instant global connectivity, though concerns about misinformation, privacy violations, and mental health impacts have prompted calls for stronger regulation and improved digital literacy education.',
    score: 89,
    features: {
      fluency: 90,
      content: 91,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-swt-009',
    questionType: 'summarize_written_text',
    response:
      'Global food security faces mounting pressure from population growth, climate change, and resource depletion, requiring innovative agricultural technologies, sustainable farming practices, and international cooperation to ensure adequate nutrition for future generations while minimizing environmental impact.',
    score: 86,
    features: {
      fluency: 87,
      content: 88,
      vocabulary: 85,
      grammar: 87,
    },
  },
  {
    id: 'benchmark-swt-010',
    questionType: 'summarize_written_text',
    response:
      'Biodiversity conservation is essential for maintaining ecosystem health, providing natural resources, and supporting human well-being, yet habitat destruction, pollution, and climate change threaten countless species, demanding urgent protective measures and sustainable development practices.',
    score: 88,
    features: {
      fluency: 89,
      content: 90,
      vocabulary: 87,
      grammar: 89,
    },
  },
];

// ============================================================================
// WRITING - Write Essay (10 responses)
// ============================================================================

const writeEssayBenchmarks: BenchmarkResponse[] = [
  {
    id: 'benchmark-we-001',
    questionType: 'write_essay',
    response:
      'The debate over whether technology improves or diminishes human connection remains contentious. While digital communication tools enable us to maintain relationships across vast distances, critics argue they promote superficial interactions at the expense of meaningful face-to-face engagement.\n\nOn one hand, technology has undeniably expanded our ability to connect. Video calls allow grandparents to watch their grandchildren grow up from thousands of miles away. Social media platforms help us rediscover old friends and maintain professional networks. For many, these digital connections supplement rather than replace in-person relationships.\n\nHowever, legitimate concerns exist about technology overuse. Studies suggest excessive screen time correlates with increased loneliness and anxiety, particularly among young people. The constant availability of digital entertainment may reduce motivation for social activities requiring more effort.\n\nUltimately, technology is a tool whose impact depends on how we use it. Conscious efforts to balance online and offline interactions can help us harness the benefits while mitigating potential drawbacks. The key lies in using technology to enhance rather than substitute for genuine human connection.',
    score: 88,
    features: {
      fluency: 89,
      content: 90,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-we-002',
    questionType: 'write_essay',
    response:
      'Environmental protection and economic development are often portrayed as competing priorities, yet this dichotomy oversimplifies a complex relationship. Sustainable development demonstrates that these goals can be mutually reinforcing when pursued thoughtfully.\n\nHistorically, rapid industrialization occurred at significant environmental cost. Pollution, deforestation, and resource depletion accompanied economic growth in many nations. However, this pattern need not continue. Renewable energy technologies now compete economically with fossil fuels while reducing emissions. Green industries create jobs and drive innovation.\n\nMoreover, environmental degradation imposes substantial economic costs. Climate change damages infrastructure, reduces agricultural productivity, and increases healthcare expenses. Investments in environmental protection can prevent these losses while improving quality of life.\n\nGovernments play a crucial role in aligning economic incentives with environmental objectives. Carbon pricing, subsidies for clean technology, and regulations against pollution help redirect market forces toward sustainable outcomes. International cooperation ensures that environmental standards do not disadvantage particular nations economically.\n\nIn conclusion, the choice between environmental protection and economic prosperity is a false one. With appropriate policies and technologies, societies can achieve both objectives simultaneously.',
    score: 89,
    features: {
      fluency: 90,
      content: 91,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-we-003',
    questionType: 'write_essay',
    response:
      'Higher education has traditionally been viewed as essential for career success, but rising costs and changing job markets have prompted questions about its value. While degrees remain important for many professions, alternative pathways to employment deserve consideration.\n\nUniversities offer several undeniable advantages. Beyond specialized knowledge, students develop critical thinking skills, establish professional networks, and gain credentials recognized by employers. Research suggests college graduates earn significantly more over their lifetimes than those without degrees.\n\nNevertheless, the higher education landscape is evolving. Mounting student debt burdens many graduates, while some employers increasingly value demonstrable skills over formal qualifications. Technology companies, for instance, have begun hiring based on coding ability regardless of educational background.\n\nVocational training, apprenticeships, and online courses provide viable alternatives for certain careers. These options often require less time and money while leading to well-paying jobs in high-demand fields. The key is matching educational choices to career goals.\n\nRather than declaring university education universally necessary or obsolete, we should recognize that different paths suit different individuals. The best choice depends on career aspirations, financial circumstances, and personal learning preferences.',
    score: 87,
    features: {
      fluency: 88,
      content: 89,
      vocabulary: 86,
      grammar: 88,
    },
  },
  {
    id: 'benchmark-we-004',
    questionType: 'write_essay',
    response:
      'The appropriate level of government regulation in the economy remains a perennial debate. While excessive intervention can stifle innovation and efficiency, unfettered markets may produce inequitable outcomes and external costs. Finding the right balance is essential for sustainable prosperity.\n\nMarket economies excel at allocating resources efficiently through price signals and competition. Entrepreneurs innovate to meet consumer needs, creating products and services that improve living standards. Government interference with these natural market forces can distort incentives and reduce overall welfare.\n\nHowever, markets sometimes fail to account for broader social costs. Pollution harms third parties not involved in economic transactions. Information asymmetries enable exploitation of consumers. Natural monopolies may charge excessive prices without regulatory oversight.\n\nEffective regulation addresses these market failures while preserving economic dynamism. Environmental standards protect public health. Consumer protection laws ensure fair dealing. Antitrust enforcement maintains competitive markets. The challenge lies in designing regulations that achieve their objectives without creating unintended consequences.\n\nUltimately, the question is not whether government should regulate, but how. Evidence-based policies that address genuine market failures while minimizing compliance costs represent the optimal approach.',
    score: 88,
    features: {
      fluency: 89,
      content: 90,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-we-005',
    questionType: 'write_essay',
    response:
      'Immigration policies spark intense debate in many countries, with proponents emphasizing economic benefits and cultural enrichment while critics raise concerns about job competition and social cohesion. A balanced assessment requires examining evidence from multiple perspectives.\n\nEconomically, immigrants contribute significantly to host countries. They fill labor shortages, start businesses, and pay taxes that support public services. High-skilled immigration in particular drives innovation and enhances competitiveness. Studies consistently show positive fiscal impacts from immigration overall.\n\nCultural diversity brought by immigrants enriches societies through cuisine, arts, and varied perspectives. Exposure to different backgrounds fosters creativity and prepares citizens for an interconnected world. Many nations proudly celebrate their immigrant heritage.\n\nHowever, rapid demographic changes can create challenges. Some communities experience strain on public services and housing. Cultural differences may initially create friction. Economic benefits are not always distributed evenly, with low-skilled workers potentially facing increased competition.\n\nThoughtful immigration policies can maximize benefits while addressing legitimate concerns. Integration programs help newcomers adapt and contribute. Controlled immigration levels prevent overwhelming receiving communities. Enforcement against illegal immigration maintains system integrity.\n\nIn conclusion, immigration offers substantial advantages when managed effectively, requiring policies that balance openness with orderly processes.',
    score: 86,
    features: {
      fluency: 87,
      content: 88,
      vocabulary: 85,
      grammar: 87,
    },
  },
  {
    id: 'benchmark-we-006',
    questionType: 'write_essay',
    response:
      'The rise of artificial intelligence raises profound questions about the future of work. While automation threatens certain occupations, history suggests technology ultimately creates more opportunities than it eliminates. Navigating this transition requires foresight and adaptation.\n\nAI excels at tasks involving pattern recognition and data processing. Jobs involving routine cognitive work face significant automation risk. Financial analysts, radiologists, and legal researchers may find their roles transformed as algorithms perform core functions more efficiently.\n\nYet technological progress has consistently generated new employment throughout history. The agricultural revolution displaced farm workers who found jobs in manufacturing. Automation later reduced factory employment while creating service sector opportunities. Similar adaptation will likely accompany AI advancement.\n\nThe key challenge lies in managing the transition. Workers displaced by automation need support for retraining and career changes. Education systems must prepare students for jobs requiring creativity, emotional intelligence, and complex problem-solving that machines cannot easily replicate.\n\nGovernments and businesses share responsibility for this adaptation. Policies promoting lifelong learning, flexible labor markets, and social safety nets can ease the adjustment. Forward-thinking companies invest in employee development rather than simply replacing workers.\n\nUltimately, AI represents a tool that humans can deploy to enhance productivity and quality of life, provided we manage its implementation thoughtfully.',
    score: 89,
    features: {
      fluency: 90,
      content: 91,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-we-007',
    questionType: 'write_essay',
    response:
      'The preservation of cultural heritage faces mounting challenges in an era of globalization and rapid change. While modernization brings undeniable benefits, losing traditional knowledge and practices impoverishes humanity. Balancing progress with preservation deserves careful consideration.\n\nCultural heritage encompasses tangible artifacts like historical buildings and intangible traditions including languages, crafts, and performing arts. These elements connect communities to their history and identity. They provide continuity amid change and diversity in an increasingly homogeneous world.\n\nGlobalization accelerates cultural exchange but also threatens minority traditions. Dominant cultures spread through media and commerce, potentially overwhelming local practices. Many languages face extinction as younger generations adopt more widely spoken alternatives. Traditional skills fade when economic incentives favor modern alternatives.\n\nProtecting cultural heritage requires active effort. Documentation preserves knowledge that might otherwise be lost. Education transmits traditions to new generations. Economic support can maintain viability of traditional crafts and performances. Digital technologies offer new tools for preservation and dissemination.\n\nHowever, cultures are not museum pieces to be frozen in time. Living traditions evolve naturally, incorporating new influences while retaining essential characteristics. The goal should be enabling communities to make informed choices about their cultural futures rather than imposing artificial preservation.\n\nUltimately, cultural diversity represents irreplaceable human wealth that enriches our collective experience and deserves thoughtful protection.',
    score: 87,
    features: {
      fluency: 88,
      content: 89,
      vocabulary: 86,
      grammar: 88,
    },
  },
  {
    id: 'benchmark-we-008',
    questionType: 'write_essay',
    response:
      'Urban planning significantly influences quality of life, environmental sustainability, and economic vitality. As cities continue growing, thoughtful design becomes increasingly important. Examining principles of effective urban planning can guide better policy decisions.\n\nWell-designed cities facilitate efficient movement of people and goods. Public transportation reduces traffic congestion and emissions while providing affordable mobility. Mixed-use zoning places homes near workplaces and amenities, reducing commute times. Walkable neighborhoods promote physical activity and community interaction.\n\nGreen spaces serve multiple functions in urban environments. Parks provide recreation opportunities and improve mental health. Trees filter air pollution and reduce urban heat islands. Natural areas manage stormwater and support biodiversity even within city limits.\n\nHousing affordability represents a persistent urban challenge. Restrictive zoning limits housing supply, driving up prices. Inclusive planning allows diverse housing types to accommodate different income levels. Thoughtful development can increase density without sacrificing livability.\n\nCommunity engagement improves planning outcomes. Residents understand local needs and priorities. Transparent processes build public support for necessary changes. Participatory approaches help balance competing interests and values.\n\nIn conclusion, effective urban planning requires integrating transportation, environmental, housing, and social considerations. Cities that succeed in this integration will thrive in the coming decades.',
    score: 88,
    features: {
      fluency: 89,
      content: 90,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-we-009',
    questionType: 'write_essay',
    response:
      'Mental health awareness has increased dramatically in recent years, yet stigma and inadequate resources continue hindering progress. Addressing this crisis requires comprehensive approaches spanning prevention, treatment, and social support.\n\nMental health conditions affect substantial portions of populations worldwide. Depression, anxiety, and substance use disorders cause tremendous suffering and economic losses through reduced productivity and healthcare costs. Despite this burden, mental healthcare remains underfunded relative to physical health services.\n\nStigma discourages many from seeking help. Misconceptions about mental illness lead to discrimination in employment, housing, and relationships. Public education campaigns can challenge these attitudes by normalizing discussion of mental health and highlighting successful treatment outcomes.\n\nEarly intervention improves prognoses for mental health conditions. School-based programs teaching emotional regulation and coping skills build resilience. Primary care integration enables early detection and referral. Workplace wellness initiatives address occupational stress before it escalates.\n\nAccess to quality care remains uneven. Rural areas lack specialists. Insurance coverage may be inadequate. Long wait times delay treatment. Expanding the mental health workforce and leveraging technology for remote services can help address these gaps.\n\nIn conclusion, tackling the mental health crisis requires sustained investment, reduced stigma, and systemic reform. The human and economic costs of inaction far exceed the resources needed for meaningful progress.',
    score: 86,
    features: {
      fluency: 87,
      content: 88,
      vocabulary: 85,
      grammar: 87,
    },
  },
  {
    id: 'benchmark-we-010',
    questionType: 'write_essay',
    response:
      'The relationship between social media and democracy presents both opportunities and challenges. While these platforms can empower citizens and enhance political participation, concerns about misinformation and polarization deserve serious attention.\n\nSocial media has democratized information dissemination. Citizens can share news and opinions without relying on traditional gatekeepers. Political movements organize rapidly through these platforms. Marginalized voices find audiences previously unavailable to them.\n\nTransparency benefits from social media as well. Politicians face greater accountability when their statements and actions receive immediate scrutiny. Corruption and abuses of power become harder to conceal. Citizen journalism supplements professional reporting.\n\nHowever, the same features enabling these benefits create risks. False information spreads rapidly, sometimes outpacing corrections. Algorithm-driven feeds can create echo chambers reinforcing existing beliefs. Foreign actors exploit platforms to interfere in democratic processes.\n\nAddressing these challenges requires multiple approaches. Platform companies can improve content moderation and algorithm transparency. Media literacy education helps citizens critically evaluate information sources. Regulation may address the most harmful practices while preserving legitimate speech.\n\nUltimately, social media reflects and amplifies existing societal dynamics. Technology alone cannot solve fundamental challenges to democracy, but thoughtful governance of these powerful tools can help maximize their benefits while mitigating risks.',
    score: 88,
    features: {
      fluency: 89,
      content: 90,
      vocabulary: 87,
      grammar: 89,
    },
  },
];

// ============================================================================
// LISTENING - Summarize Spoken Text (10 responses)
// ============================================================================

const summarizeSpokenTextBenchmarks: BenchmarkResponse[] = [
  {
    id: 'benchmark-sst-001',
    questionType: 'summarize_spoken_text',
    response:
      'The lecture discussed the impact of climate change on marine ecosystems, explaining how rising ocean temperatures and acidification threaten coral reefs and fish populations, while emphasizing the urgent need for conservation efforts and reduced carbon emissions to protect biodiversity.',
    score: 88,
    features: {
      fluency: 89,
      content: 90,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-sst-002',
    questionType: 'summarize_spoken_text',
    response:
      'The speaker examined the psychology of decision-making, describing how cognitive biases such as confirmation bias and anchoring affect our choices, and suggesting that awareness of these mental shortcuts can help individuals make more rational decisions in personal and professional contexts.',
    score: 87,
    features: {
      fluency: 88,
      content: 89,
      vocabulary: 86,
      grammar: 88,
    },
  },
  {
    id: 'benchmark-sst-003',
    questionType: 'summarize_spoken_text',
    response:
      'The presentation covered developments in renewable energy technology, highlighting how solar and wind power costs have decreased significantly over the past decade, making them competitive with fossil fuels and positioning them as viable solutions for meeting growing global energy demands sustainably.',
    score: 89,
    features: {
      fluency: 90,
      content: 91,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-sst-004',
    questionType: 'summarize_spoken_text',
    response:
      'The lecture analyzed the effects of urbanization on public health, noting that while cities offer better healthcare access, they also present challenges including air pollution, sedentary lifestyles, and mental health issues related to crowding and noise, requiring integrated urban planning approaches.',
    score: 86,
    features: {
      fluency: 87,
      content: 88,
      vocabulary: 85,
      grammar: 87,
    },
  },
  {
    id: 'benchmark-sst-005',
    questionType: 'summarize_spoken_text',
    response:
      'The speaker explored the history of space exploration, tracing developments from the first satellite launches through moon landings to current missions targeting Mars, while discussing how international cooperation and private sector involvement are shaping the future of human presence in space.',
    score: 88,
    features: {
      fluency: 89,
      content: 90,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-sst-006',
    questionType: 'summarize_spoken_text',
    response:
      'The presentation examined the relationship between sleep and cognitive function, presenting research showing that inadequate sleep impairs memory, concentration, and decision-making abilities, while recommending strategies for improving sleep quality including consistent schedules and reduced screen exposure.',
    score: 87,
    features: {
      fluency: 88,
      content: 89,
      vocabulary: 86,
      grammar: 88,
    },
  },
  {
    id: 'benchmark-sst-007',
    questionType: 'summarize_spoken_text',
    response:
      'The lecture discussed the evolution of global trade patterns, explaining how technological advances in transportation and communication have enabled complex international supply chains, while noting that recent events have prompted reconsideration of efficiency versus resilience in economic systems.',
    score: 88,
    features: {
      fluency: 89,
      content: 90,
      vocabulary: 87,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-sst-008',
    questionType: 'summarize_spoken_text',
    response:
      'The speaker analyzed the impact of social media on youth mental health, citing studies linking excessive usage to increased anxiety and depression, while acknowledging potential benefits of online communities and advocating for balanced approaches to digital engagement and media literacy education.',
    score: 86,
    features: {
      fluency: 87,
      content: 88,
      vocabulary: 85,
      grammar: 87,
    },
  },
  {
    id: 'benchmark-sst-009',
    questionType: 'summarize_spoken_text',
    response:
      'The presentation covered advances in artificial intelligence applications in healthcare, describing how machine learning algorithms now assist in disease diagnosis, drug development, and personalized treatment planning, while addressing ethical considerations regarding patient privacy and algorithmic bias.',
    score: 89,
    features: {
      fluency: 90,
      content: 91,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-sst-010',
    questionType: 'summarize_spoken_text',
    response:
      'The lecture examined challenges facing higher education systems globally, discussing rising costs, changing labor market demands, and technological disruption, while exploring how institutions are adapting through online learning, competency-based programs, and industry partnerships to remain relevant.',
    score: 87,
    features: {
      fluency: 88,
      content: 89,
      vocabulary: 86,
      grammar: 88,
    },
  },
];

// ============================================================================
// LISTENING - Write from Dictation (10 responses)
// ============================================================================

const writeFromDictationBenchmarks: BenchmarkResponse[] = [
  {
    id: 'benchmark-wfd-001',
    questionType: 'write_from_dictation',
    response:
      'The university library will be closed for renovations during the summer break.',
    score: 90,
    features: {
      fluency: 92,
      content: 100,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-wfd-002',
    questionType: 'write_from_dictation',
    response:
      'Students must submit their research proposals by the end of this month.',
    score: 89,
    features: {
      fluency: 90,
      content: 100,
      vocabulary: 87,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-wfd-003',
    questionType: 'write_from_dictation',
    response:
      'The experiment demonstrated the relationship between temperature and chemical reaction rates.',
    score: 88,
    features: {
      fluency: 89,
      content: 100,
      vocabulary: 86,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-wfd-004',
    questionType: 'write_from_dictation',
    response:
      'All assignments must be submitted through the online learning management system.',
    score: 90,
    features: {
      fluency: 91,
      content: 100,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-wfd-005',
    questionType: 'write_from_dictation',
    response:
      'The professor explained the theory and provided several practical examples.',
    score: 89,
    features: {
      fluency: 90,
      content: 100,
      vocabulary: 87,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-wfd-006',
    questionType: 'write_from_dictation',
    response:
      'Economic growth depends on both consumer spending and business investment.',
    score: 88,
    features: {
      fluency: 89,
      content: 100,
      vocabulary: 86,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-wfd-007',
    questionType: 'write_from_dictation',
    response:
      'The seminar will focus on recent developments in artificial intelligence.',
    score: 90,
    features: {
      fluency: 91,
      content: 100,
      vocabulary: 88,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-wfd-008',
    questionType: 'write_from_dictation',
    response:
      'Climate scientists have observed significant changes in global temperature patterns.',
    score: 89,
    features: {
      fluency: 90,
      content: 100,
      vocabulary: 87,
      grammar: 90,
    },
  },
  {
    id: 'benchmark-wfd-009',
    questionType: 'write_from_dictation',
    response:
      'The research findings will be published in a peer-reviewed academic journal.',
    score: 88,
    features: {
      fluency: 89,
      content: 100,
      vocabulary: 86,
      grammar: 89,
    },
  },
  {
    id: 'benchmark-wfd-010',
    questionType: 'write_from_dictation',
    response:
      'International cooperation is essential for addressing global environmental challenges.',
    score: 89,
    features: {
      fluency: 90,
      content: 100,
      vocabulary: 87,
      grammar: 90,
    },
  },
];

// ============================================================================
// EXPORT ALL BENCHMARKS
// ============================================================================

export const benchmarkResponses: BenchmarkResponse[] = [
  // Speaking (50 responses)
  ...readAloudBenchmarks,
  ...repeatSentenceBenchmarks,
  ...describeImageBenchmarks,
  ...retellLectureBenchmarks,
  ...answerShortQuestionBenchmarks,

  // Writing (20 responses)
  ...summarizeWrittenTextBenchmarks,
  ...writeEssayBenchmarks,

  // Listening (20 responses)
  ...summarizeSpokenTextBenchmarks,
  ...writeFromDictationBenchmarks,
];

export const benchmarksByType = {
  read_aloud: readAloudBenchmarks,
  repeat_sentence: repeatSentenceBenchmarks,
  describe_image: describeImageBenchmarks,
  retell_lecture: retellLectureBenchmarks,
  answer_short_question: answerShortQuestionBenchmarks,
  summarize_written_text: summarizeWrittenTextBenchmarks,
  write_essay: writeEssayBenchmarks,
  summarize_spoken_text: summarizeSpokenTextBenchmarks,
  write_from_dictation: writeFromDictationBenchmarks,
};

// Stats
export const benchmarkStats = {
  total: benchmarkResponses.length,
  byType: {
    read_aloud: readAloudBenchmarks.length,
    repeat_sentence: repeatSentenceBenchmarks.length,
    describe_image: describeImageBenchmarks.length,
    retell_lecture: retellLectureBenchmarks.length,
    answer_short_question: answerShortQuestionBenchmarks.length,
    summarize_written_text: summarizeWrittenTextBenchmarks.length,
    write_essay: writeEssayBenchmarks.length,
    summarize_spoken_text: summarizeSpokenTextBenchmarks.length,
    write_from_dictation: writeFromDictationBenchmarks.length,
  },
  averageScore:
    benchmarkResponses.reduce((sum, b) => sum + b.score, 0) /
    benchmarkResponses.length,
};
