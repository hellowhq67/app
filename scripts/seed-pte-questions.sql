-- PTE Questions Seed Script
-- Run this in Supabase SQL Editor to insert all PTE questions
-- Project ID: gkuevukafwswekldlpnf

-- First, let's get the question type IDs
-- You'll need to run this in Supabase SQL Editor to get the IDs, then update the script

-- Here's a summary of what will be inserted:
-- Speaking: 75 questions (Read Aloud, Repeat Sentence, Describe Image, Retell Lecture, Answer Short Question, Summarize Spoken Text, Summarize Group Discussion, Respond to Situation)
-- Writing: 18 questions (Summarize Written Text, Essay)
-- Reading: 11 questions (MC Single, MC Multiple, Reorder Paragraphs, Fill Blanks Drag & Drop, Fill Blanks Dropdown)
-- Listening: 16 questions (Highlight Correct Summary, MC Single, MC Multiple, Fill Blanks, Highlight Incorrect Words, Write from Dictation, Select Missing Word, Summarize Spoken Text)

-- ============================================================================
-- SPEAKING QUESTIONS
-- ============================================================================

-- Insert Speaking Questions with their extended data

-- READ ALOUD (12 questions)
-- First, get the question_type_id for 'read_aloud' from pte_question_types table

-- Insert main questions and extended data
-- The actual inserts need the UUIDs from pte_question_types

-- SAMPLE: How to insert a Read Aloud question
/*
INSERT INTO pte_questions (question_type_id, title, content, difficulty, tags, is_active, is_premium, usage_count, average_score, metadata)
VALUES (
    (SELECT id FROM pte_question_types WHERE code = 'read_aloud'),
    'Read Aloud - Climate Change',
    'Climate change is one of the most pressing challenges facing humanity today. Rising global temperatures, melting ice caps, and increasingly severe weather events are clear indicators that our planet is undergoing significant environmental changes.',
    'Medium',
    ARRAY['environment', 'science', 'climate'],
    true,
    false,
    0,
    NULL,
    '{"source": "PTE Question Bank", "author": "Content Team"}'::jsonb
);

-- Get the inserted question ID and insert into pte_speaking_questions
INSERT INTO pte_speaking_questions (question_id, expected_duration, sample_transcript)
VALUES (
    (SELECT id FROM pte_questions ORDER BY created_at DESC LIMIT 1),
    35,
    'Climate change is one of the most pressing challenges facing humanity today. Rising global temperatures, melting ice caps, and increasingly severe weather events are clear indicators that our planet is undergoing significant environmental changes.'
);
*/

-- ============================================================================
-- COMPLETE SEED SCRIPT (Run this in Supabase SQL Editor)
-- ============================================================================

-- Step 1: Create a function to get question type ID
CREATE OR REPLACE FUNCTION get_question_type_id(code_text text)
RETURNS uuid AS $$
BEGIN
    RETURN (SELECT id FROM pte_question_types WHERE code = code_text);
END;
$$ LANGUAGE plpgsql;

-- Step 2: Insert Speaking Questions

-- READ ALOUD Questions (12 total - 4 easy, 4 medium, 4 hard)
INSERT INTO pte_questions (question_type_id, title, content, difficulty, tags, is_active, is_premium, usage_count, average_score, metadata)
SELECT 
    get_question_type_id('read_aloud'),
    title,
    content,
    CASE difficulty 
        WHEN 'easy' THEN 'Easy'::difficulty_enum
        WHEN 'medium' THEN 'Medium'::difficulty_enum
        WHEN 'hard' THEN 'Hard'::difficulty_enum
    END,
    ARRAY[difficulty]::text[],
    true,
    false,
    0,
    NULL,
    '{"source": "PTE Question Bank", "author": "Content Team"}'::jsonb
FROM (VALUES
    ('Read Aloud - Library', 'The library is an excellent place to study. It provides a quiet environment where students can focus on their work without distractions.', 'easy'),
    ('Read Aloud - Exercise', 'Regular exercise is essential for maintaining good health. It helps strengthen the heart, improve mood, and increase energy levels throughout the day.', 'easy'),
    ('Read Aloud - Water', 'Water covers approximately seventy percent of Earth''s surface. It exists in various forms including liquid oceans, solid ice caps, and gaseous water vapor.', 'easy'),
    ('Read Aloud - Technology', 'Technology has transformed the way we communicate. Mobile phones and the internet allow people to connect instantly across great distances.', 'easy'),
    ('Read Aloud - Climate Change', 'Climate change represents one of the most significant challenges facing humanity today. Scientists around the world have documented rising temperatures, melting ice caps, and increasingly severe weather events. Addressing this crisis requires coordinated action from governments, businesses, and individuals alike.', 'medium'),
    ('Read Aloud - AI', 'The development of artificial intelligence has transformed numerous industries, from healthcare to transportation. Machine learning algorithms can now analyze vast amounts of data to identify patterns that would be impossible for humans to detect. This technology continues to evolve at an unprecedented pace.', 'medium'),
    ('Read Aloud - Universities', 'Universities serve as centers of knowledge creation and dissemination, preparing students for careers across diverse fields. Research conducted at these institutions has led to breakthrough discoveries in medicine, technology, and social sciences. The value of higher education extends far beyond the classroom.', 'medium'),
    ('Read Aloud - Biodiversity', 'Biodiversity loss threatens the stability of ecosystems worldwide. Species extinction occurs at a rate unprecedented in human history, driven by habitat destruction, pollution, and climate change. Conservation efforts must accelerate to preserve the natural world for future generations.', 'medium'),
    ('Read Aloud - Neuroscience', 'The intersection of neuroscience and psychology has revolutionized our understanding of human consciousness and cognitive processes. Sophisticated neuroimaging techniques enable researchers to observe brain activity in real-time, revealing the intricate neural mechanisms underlying perception, memory, and decision-making.', 'hard'),
    ('Read Aloud - Quantum Mechanics', 'Quantum mechanics fundamentally challenges our intuitions about reality at the subatomic level. Phenomena such as superposition and entanglement suggest that particles can exist in multiple states simultaneously until observed, a concept that even distinguished physicists have struggled to reconcile with classical understanding.', 'hard'),
    ('Read Aloud - Automation', 'The socioeconomic implications of automation extend beyond simple job displacement. While technological advancement has historically created new employment opportunities, the unprecedented speed of current developments in artificial intelligence raises questions about whether traditional economic adjustment mechanisms will suffice in the coming decades.', 'hard'),
    ('Read Aloud - Epigenetics', 'Epigenetic modifications represent a fascinating layer of biological complexity that bridges genetic inheritance and environmental influence. These chemical alterations to DNA expression, which do not change the underlying genetic sequence, can be influenced by lifestyle factors and may even be transmitted across generations.', 'hard')
) AS t(title, content, difficulty);

-- Insert Read Aloud extended data
INSERT INTO pte_speaking_questions (question_id, expected_duration, sample_transcript)
SELECT 
    q.id,
    35,
    q.content
FROM pte_questions q
JOIN pte_question_types qt ON q.question_type_id = qt.id
WHERE qt.code = 'read_aloud'
ORDER BY q.created_at;

-- REPEAT SENTENCE Questions (12 total - 4 easy, 4 medium, 4 hard)
INSERT INTO pte_questions (question_type_id, title, content, difficulty, tags, is_active, is_premium, usage_count, average_score, metadata)
SELECT 
    get_question_type_id('repeat_sentence'),
    title,
    content,
    CASE difficulty 
        WHEN 'easy' THEN 'Easy'::difficulty_enum
        WHEN 'medium' THEN 'Medium'::difficulty_enum
        WHEN 'hard' THEN 'Hard'::difficulty_enum
    END,
    ARRAY[difficulty]::text[],
    true,
    false,
    0,
    NULL,
    '{"source": "PTE Question Bank", "author": "Content Team"}'::jsonb
FROM (VALUES
    ('Repeat Sentence - Library', 'The library will be closed for renovations during the summer break.', 'easy'),
    ('Repeat Sentence - Assignment', 'Please submit your assignment by the end of the week.', 'easy'),
    ('Repeat Sentence - Meeting', 'The meeting has been rescheduled to next Monday morning.', 'easy'),
    ('Repeat Sentence - Exam', 'Students must bring their identification cards to the examination.', 'easy'),
    ('Repeat Sentence - Deadlines', 'Students should submit their assignments before the deadline to avoid penalties.', 'medium'),
    ('Repeat Sentence - Conference', 'The conference will feature presentations from leading experts in the field.', 'medium'),
    ('Repeat Sentence - Sustainability', 'Environmental sustainability requires balancing economic development with ecological preservation.', 'medium'),
    ('Repeat Sentence - Sleep', 'The research findings suggest a correlation between sleep quality and academic performance.', 'medium'),
    ('Repeat Sentence - Interdisciplinary', 'The implementation of interdisciplinary approaches has significantly enhanced our understanding of complex societal challenges.', 'hard'),
    ('Repeat Sentence - Economics', 'Contemporary economic theories increasingly emphasize the interconnectedness of global financial markets.', 'hard'),
    ('Repeat Sentence - Cognitive', 'The longitudinal study revealed statistically significant improvements in participants'' cognitive functioning.', 'hard'),
    ('Repeat Sentence - Archaeology', 'Archaeological excavations have uncovered unprecedented evidence of sophisticated prehistoric civilizations.', 'hard')
) AS t(title, content, difficulty);

INSERT INTO pte_speaking_questions (question_id, expected_duration, sample_transcript)
SELECT 
    q.id,
    15,
    q.content
FROM pte_questions q
JOIN pte_question_types qt ON q.question_type_id = qt.id
WHERE qt.code = 'repeat_sentence'
ORDER BY q.created_at;

-- DESCRIBE IMAGE Questions (9 total - 3 easy, 3 medium, 3 hard)
INSERT INTO pte_questions (question_type_id, title, content, difficulty, tags, is_active, is_premium, usage_count, average_score, metadata)
SELECT 
    get_question_type_id('describe_image'),
    title,
    content,
    CASE difficulty 
        WHEN 'easy' THEN 'Easy'::difficulty_enum
        WHEN 'medium' THEN 'Medium'::difficulty_enum
        WHEN 'hard' THEN 'Hard'::difficulty_enum
    END,
    ARRAY[difficulty]::text[],
    true,
    false,
    0,
    NULL,
    '{"source": "PTE Question Bank", "author": "Content Team"}'::jsonb
FROM (VALUES
    ('Describe Image - Sales Chart', 'A simple bar chart showing sales data for four quarters, with Q4 having the highest sales.', 'easy'),
    ('Describe Image - Budget Pie', 'A pie chart showing budget allocation across departments: Marketing 30%, Operations 40%, R&D 20%, Admin 10%.', 'easy'),
    ('Describe Image - Traffic Line', 'A simple line graph showing website traffic over 12 months with a steady increase.', 'easy'),
    ('Describe Image - Population Map', 'A world map showing global population density with different regions colored to indicate population concentration. Darker colors indicate higher population density. Major cities are marked with dots. Asia shows the highest concentration.', 'medium'),
    ('Describe Image - Analytics Dashboard', 'A business analytics dashboard showing multiple charts: line chart for growth trends, bar charts comparing regional metrics, and pie charts showing market distribution.', 'medium'),
    ('Describe Image - Energy Adoption', 'A comparison chart showing renewable energy adoption rates across different countries from 2010 to 2020, with Germany and Denmark leading.', 'medium'),
    ('Describe Image - G7 Economics', 'A complex multi-axis chart combining unemployment rates, GDP growth, and inflation across G7 nations from 2008-2023, showing the impact of financial crisis and pandemic.', 'hard'),
    ('Describe Image - Carbon Cycle', 'A scientific diagram showing the carbon cycle with arrows indicating carbon flow between atmosphere, oceans, land ecosystems, and human activities.', 'hard'),
    ('Describe Image - Energy Flows', 'A Sankey diagram illustrating global energy flows from primary sources through conversion processes to end-use sectors, showing efficiency losses at each stage.', 'hard')
) AS t(title, content, difficulty);

INSERT INTO pte_speaking_questions (question_id, expected_duration, sample_transcript)
SELECT 
    q.id,
    40,
    q.content
FROM pte_questions q
JOIN pte_question_types qt ON q.question_type_id = qt.id
WHERE qt.code = 'describe_image'
ORDER BY q.created_at;

-- RETELL LECTURE Questions (9 total - 3 easy, 3 medium, 3 hard)
INSERT INTO pte_questions (question_type_id, title, content, difficulty, tags, is_active, is_premium, usage_count, average_score, metadata)
SELECT 
    get_question_type_id('retell_lecture'),
    title,
    content,
    CASE difficulty 
        WHEN 'easy' THEN 'Easy'::difficulty_enum
        WHEN 'medium' THEN 'Medium'::difficulty_enum
        WHEN 'hard' THEN 'Hard'::difficulty_enum
    END,
    ARRAY[difficulty]::text[],
    true,
    false,
    0,
    NULL,
    '{"source": "PTE Question Bank", "author": "Content Team"}'::jsonb
FROM (VALUES
    ('Retell Lecture - Water Cycle', 'Today we''ll discuss the water cycle. Water evaporates from oceans when heated by the sun. This vapor rises and forms clouds. Then it falls back as rain or snow. This cycle repeats continuously and is essential for life on Earth.', 'easy'),
    ('Retell Lecture - Photosynthesis', 'Photosynthesis is how plants make food. They use sunlight, water, and carbon dioxide. The process produces glucose and oxygen. This is why plants are so important - they create the oxygen we breathe.', 'easy'),
    ('Retell Lecture - Solar System', 'The solar system has eight planets. The four inner planets are rocky: Mercury, Venus, Earth, and Mars. The four outer planets are gas giants: Jupiter, Saturn, Uranus, and Neptune. Earth is the only planet known to support life.', 'easy'),
    ('Retell Lecture - Renaissance', 'The Renaissance, which means ''rebirth'' in French, was a period of cultural, artistic, and intellectual transformation that began in Italy in the 14th century and spread throughout Europe. This era saw a renewed interest in classical Greek and Roman ideas. Artists like Leonardo da Vinci and Michelangelo revolutionized painting and sculpture. The invention of the printing press by Gutenberg allowed ideas to spread rapidly.', 'medium'),
    ('Retell Lecture - Industrial Revolution', 'The Industrial Revolution transformed society from agricultural to industrial economies. Starting in Britain in the late 18th century, it introduced factory systems and mass production. New inventions like the steam engine revolutionized transportation. While it created economic growth, it also led to urbanization and significant social changes, including the rise of the working class.', 'medium'),
    ('Retell Lecture - Coral Reefs', 'Coral reefs are among the most biodiverse ecosystems on Earth. They cover less than one percent of the ocean floor but support about 25 percent of all marine species. Coral bleaching, caused by rising ocean temperatures, threatens these vital ecosystems. Conservation efforts focus on reducing pollution and establishing marine protected areas.', 'medium'),
    ('Retell Lecture - Behavioral Economics', 'Behavioral economics challenges traditional economic assumptions about rational decision-making. Research by Kahneman and Tversky demonstrated that humans consistently deviate from rational choice theory. Cognitive biases such as loss aversion, anchoring, and the availability heuristic systematically influence our decisions. These insights have profound implications for policy design, marketing strategies, and personal financial planning.', 'hard'),
    ('Retell Lecture - Microbiome', 'The human microbiome comprises trillions of microorganisms residing in our bodies, particularly in the gut. Recent research has revealed its crucial role in immune function, metabolism, and even mental health through the gut-brain axis. Dysbiosis, or microbial imbalance, has been linked to conditions ranging from inflammatory bowel disease to depression. Interventions such as probiotics and fecal transplants offer promising therapeutic avenues.', 'hard'),
    ('Retell Lecture - Cryptocurrency', 'Cryptocurrency and blockchain technology represent a paradigm shift in financial systems. Decentralized ledger technology eliminates the need for intermediaries in transactions. Smart contracts enable automated, trustless agreements. However, challenges remain regarding scalability, energy consumption, and regulatory frameworks. Central bank digital currencies are emerging as governments explore blockchain applications.', 'hard')
) AS t(title, content, difficulty);

INSERT INTO pte_speaking_questions (question_id, expected_duration, sample_transcript)
SELECT 
    q.id,
    40,
    q.content
FROM pte_questions q
JOIN pte_question_types qt ON q.question_type_id = qt.id
WHERE qt.code = 'retell_lecture'
ORDER BY q.created_at;

-- ANSWER SHORT QUESTION Questions (15 total - 5 easy, 5 medium, 5 hard)
INSERT INTO pte_questions (question_type_id, title, content, difficulty, tags, is_active, is_premium, usage_count, average_score, correct_answer, metadata)
SELECT 
    get_question_type_id('answer_short_question'),
    title,
    question,
    CASE difficulty 
        WHEN 'easy' THEN 'Easy'::difficulty_enum
        WHEN 'medium' THEN 'Medium'::difficulty_enum
        WHEN 'hard' THEN 'Hard'::difficulty_enum
    END,
    ARRAY[difficulty]::text[],
    true,
    false,
    0,
    NULL,
    ('{"text": "' || expected_answer || '"}')::jsonb,
    '{"source": "PTE Question Bank", "author": "Content Team"}'::jsonb
FROM (VALUES
    ('Short Question - Astronomer', 'What do we call a person who studies the stars and planets?', 'astronomer', 'easy'),
    ('Short Question - Thermometer', 'What device is used to measure temperature?', 'thermometer', 'easy'),
    ('Short Question - Week Days', 'How many days are there in a week?', 'seven', 'easy'),
    ('Short Question - Hot Cold', 'What is the opposite of hot?', 'cold', 'easy'),
    ('Short Question - Pilot', 'What do we call the person who flies an airplane?', 'pilot', 'easy'),
    ('Short Question - Carbon Dioxide', 'What is the primary gas that plants absorb from the atmosphere?', 'carbon dioxide', 'medium'),
    ('Short Question - Surgeon', 'What do you call a doctor who performs surgeries?', 'surgeon', 'medium'),
    ('Short Question - Diamond', 'What is the hardest natural substance on Earth?', 'diamond', 'medium'),
    ('Short Question - Paleontology', 'What is the study of ancient life through fossils called?', 'paleontology', 'medium'),
    ('Short Question - Pancreas', 'What organ in the human body produces insulin?', 'pancreas', 'medium'),
    ('Short Question - Homonym', 'What is the term for a word that has the same spelling but different meanings?', 'homonym', 'hard'),
    ('Short Question - Deflation', 'What economic term describes a prolonged period of declining prices?', 'deflation', 'hard'),
    ('Short Question - Seismology', 'What is the scientific study of earthquakes called?', 'seismology', 'hard'),
    ('Short Question - Empiricism', 'What philosophical term refers to knowledge gained through experience?', 'empiricism', 'hard'),
    ('Short Question - Anthropomorphism', 'What is the psychological term for attributing human characteristics to non-human entities?', 'anthropomorphism', 'hard')
) AS t(title, question, expected_answer, difficulty);

INSERT INTO pte_speaking_questions (question_id, expected_duration, sample_transcript)
SELECT 
    q.id,
    10,
    q.content
FROM pte_questions q
JOIN pte_question_types qt ON q.question_type_id = qt.id
WHERE qt.code = 'answer_short_question'
ORDER BY q.created_at;

-- SUMMARIZE SPOKEN TEXT Questions (6 total - 2 easy, 2 medium, 2 hard)
INSERT INTO pte_questions (question_type_id, title, content, difficulty, tags, is_active, is_premium, usage_count, average_score, metadata)
SELECT 
    get_question_type_id('summarize_spoken_text'),
    title,
    content,
    CASE difficulty 
        WHEN 'easy' THEN 'Easy'::difficulty_enum
        WHEN 'medium' THEN 'Medium'::difficulty_enum
        WHEN 'hard' THEN 'Hard'::difficulty_enum
    END,
    ARRAY[difficulty]::text[],
    true,
    false,
    0,
    NULL,
    '{"source": "PTE Question Bank", "author": "Content Team"}'::jsonb
FROM (VALUES
    ('Summarize Spoken Text - Recycling', 'Recycling is important for the environment. It reduces waste in landfills and conserves natural resources. Common recyclable items include paper, plastic, glass, and metal. Many cities have recycling programs that make it easy for residents to participate.', 'easy'),
    ('Summarize Spoken Text - Sleep', 'Sleep is essential for good health. Adults need seven to nine hours of sleep each night. During sleep, the body repairs itself and the brain processes information from the day. Poor sleep can lead to health problems and difficulty concentrating.', 'easy'),
    ('Summarize Spoken Text - Urbanization', 'Urbanization is one of the defining trends of our time. More than half of the world''s population now lives in cities, and this proportion is expected to increase to 68% by 2050. Cities offer economic opportunities, better healthcare, and educational facilities. However, rapid urbanization also brings challenges including overcrowding, pollution, and strain on infrastructure.', 'medium'),
    ('Summarize Spoken Text - Gig Economy', 'The gig economy has transformed traditional employment patterns. Platforms like Uber and Fiverr connect workers with short-term contracts or freelance work. This offers flexibility for workers but raises concerns about job security and benefits. Governments worldwide are grappling with how to regulate these new forms of employment.', 'medium'),
    ('Summarize Spoken Text - Antibiotic Resistance', 'The emergence of antibiotic-resistant bacteria represents one of the most pressing public health challenges. Overuse and misuse of antibiotics in medicine and agriculture have accelerated bacterial evolution. Superbugs like MRSA and drug-resistant tuberculosis are increasingly difficult to treat. New antimicrobial strategies, including bacteriophage therapy and CRISPR-based approaches, are being explored as alternatives to traditional antibiotics.', 'hard'),
    ('Summarize Spoken Text - Neural Plasticity', 'Neural plasticity challenges the long-held assumption that brain structure is fixed after childhood. Research demonstrates that the brain continuously reorganizes itself by forming new neural connections throughout life. This has profound implications for stroke rehabilitation, learning in adulthood, and treating neurological disorders. Environmental enrichment and targeted training can induce significant structural changes in the brain.', 'hard')
) AS t(title, content, difficulty);

INSERT INTO pte_speaking_questions (question_id, expected_duration, sample_transcript)
SELECT 
    q.id,
    60,
    q.content
FROM pte_questions q
JOIN pte_question_types qt ON q.question_type_id = qt.id
WHERE qt.code = 'summarize_spoken_text'
ORDER BY q.created_at;

-- ============================================================================
-- WRITING QUESTIONS
-- ============================================================================

-- SUMMARIZE WRITTEN TEXT Questions (9 total - 3 easy, 3 medium, 3 hard)
INSERT INTO pte_questions (question_type_id, title, content, difficulty, tags, is_active, is_premium, usage_count, average_score, metadata)
SELECT 
    get_question_type_id('summarize_written_text'),
    title,
    source_text,
    CASE difficulty 
        WHEN 'easy' THEN 'Easy'::difficulty_enum
        WHEN 'medium' THEN 'Medium'::difficulty_enum
        WHEN 'hard' THEN 'Hard'::difficulty_enum
    END,
    ARRAY[difficulty]::text[],
    true,
    false,
    0,
    NULL,
    '{"source": "PTE Question Bank", "author": "Content Team"}'::jsonb
FROM (VALUES
    ('Summarize Written Text - Sleep', 'Sleep is essential for good health and well-being. During sleep, the body repairs tissues and the brain consolidates memories. Adults need seven to nine hours of sleep per night. Lack of sleep can lead to problems with concentration, mood, and overall health.', 'easy'),
    ('Summarize Written Text - Exercise', 'Regular exercise provides numerous benefits for physical and mental health. It strengthens the heart, improves circulation, and helps maintain a healthy weight. Exercise also releases endorphins, which can reduce stress and improve mood. Experts recommend at least 30 minutes of moderate activity most days.', 'easy'),
    ('Summarize Written Text - Reading', 'Reading offers many advantages beyond entertainment. It expands vocabulary, improves concentration, and enhances critical thinking skills. Regular readers often have better writing abilities and broader knowledge. Whether fiction or non-fiction, reading stimulates the mind and can reduce stress.', 'easy'),
    ('Summarize Written Text - Remote Work', 'The rise of remote work has transformed the modern workplace. While it offers flexibility and eliminates commuting, it also presents challenges for collaboration and work-life balance. Companies are experimenting with hybrid models that combine in-office and remote work. This shift has implications for urban planning, real estate markets, and employee well-being. The long-term effects of this transformation are still being studied.', 'medium'),
    ('Summarize Written Text - Renewable Energy', 'Renewable energy sources are becoming increasingly important in addressing climate change. Solar and wind power have seen dramatic cost reductions, making them competitive with fossil fuels. However, challenges remain regarding energy storage and grid integration. Governments worldwide are implementing policies to accelerate the transition to clean energy. The shift requires significant investment in infrastructure and technology.', 'medium'),
    ('Summarize Written Text - Social Media', 'Social media has fundamentally changed how people communicate and consume information. While it enables instant global connection and democratizes content creation, it has also contributed to misinformation spread and mental health concerns. Platforms are implementing measures to combat fake news and protect users. The debate continues about the appropriate level of regulation for these powerful communication tools.', 'medium'),
    ('Summarize Written Text - Neuroplasticity', 'The concept of neuroplasticity has revolutionized our understanding of the brain. Contrary to earlier beliefs that brain structure was fixed after childhood, research now shows that neural connections can form and reorganize throughout life. This has profound implications for learning, rehabilitation after brain injury, and treating neurological disorders. Environmental factors, cognitive training, and physical exercise have all been shown to promote beneficial neural changes. The brain''s remarkable adaptability offers hope for addressing age-related cognitive decline and recovering from stroke.', 'hard'),
    ('Summarize Written Text - Circular Economy', 'The circular economy represents a fundamental shift from the traditional linear ''take-make-dispose'' model of production and consumption. By designing products for durability, reuse, and recycling, this approach aims to minimize waste and maximize resource efficiency. Companies are increasingly adopting circular principles, driven by both environmental concerns and economic incentives. However, transitioning to a circular economy requires systemic changes in business models, consumer behavior, and policy frameworks. The potential benefits include reduced environmental impact, new business opportunities, and enhanced resource security.', 'hard'),
    ('Summarize Written Text - AI Ethics', 'The ethics of artificial intelligence presents complex challenges for society. As AI systems become more autonomous and influential in decision-making, questions arise about accountability, bias, and transparency. Algorithms can perpetuate or amplify existing societal biases if trained on skewed data. The concept of ''explainable AI'' has emerged as a response to concerns about black-box decision-making. Establishing ethical guidelines and governance frameworks is essential to ensure AI development benefits humanity while minimizing potential harms.', 'hard')
) AS t(title, source_text, difficulty);

INSERT INTO pte_writing_questions (question_id, prompt_text, passage_text, word_count_min, word_count_max, essay_type)
SELECT 
    q.id,
    'Summarize the passage in one sentence.',
    q.content,
    5,
    75,
    'summary'
FROM pte_questions q
JOIN pte_question_types qt ON q.question_type_id = qt.id
WHERE qt.code = 'summarize_written_text'
ORDER BY q.created_at;

-- ESSAY Questions (9 total - 3 easy, 3 medium, 3 hard)
INSERT INTO pte_questions (question_type_id, title, content, difficulty, tags, is_active, is_premium, usage_count, average_score, metadata)
SELECT 
    get_question_type_id('essay'),
    title,
    essay_prompt,
    CASE difficulty 
        WHEN 'easy' THEN 'Easy'::difficulty_enum
        WHEN 'medium' THEN 'Medium'::difficulty_enum
        WHEN 'hard' THEN 'Hard'::difficulty_enum
    END,
    ARRAY[difficulty]::text[],
    true,
    false,
    0,
    NULL,
    '{"source": "PTE Question Bank", "author": "Content Team"}'::jsonb
FROM (VALUES
    ('Essay - Technology Quality of Life', 'Do you agree or disagree that technology has improved our quality of life? Support your opinion with reasons and examples.', 'easy'),
    ('Essay - City vs Small Town', 'Some people prefer to live in a big city, while others prefer small towns. Which do you prefer and why?', 'easy'),
    ('Essay - Foreign Language', 'What are the advantages and disadvantages of learning a foreign language at school?', 'easy'),
    ('Essay - Space Exploration', 'Some argue that governments should invest heavily in space exploration, while others believe this money would be better spent solving problems on Earth. Discuss both views and give your opinion.', 'medium'),
    ('Essay - Social Media Communication', 'With the rise of social media, some people believe that traditional forms of communication are becoming obsolete. To what extent do you agree or disagree?', 'medium'),
    ('Essay - University Skills', 'Some people think that universities should provide practical skills for the job market, while others believe the focus should be on academic knowledge. Discuss both perspectives.', 'medium'),
    ('Essay - AI and Employment', 'The increasing use of artificial intelligence in the workplace raises concerns about mass unemployment. However, others argue that AI will create more jobs than it eliminates. Analyze both perspectives and provide your assessment of how society should prepare for this transition.', 'hard'),
    ('Essay - National Identity', 'Some argue that in an era of globalization, national identities are becoming less relevant. Others contend that preserving cultural distinctiveness is more important than ever. Critically evaluate these opposing viewpoints and present a nuanced position.', 'hard'),
    ('Essay - Privacy vs Security', 'The tension between individual privacy rights and collective security in the digital age presents complex ethical dilemmas. Examine the arguments for and against government surveillance programs and propose a balanced framework for addressing this issue.', 'hard')
) AS t(title, essay_prompt, difficulty);

INSERT INTO pte_writing_questions (question_id, prompt_text, word_count_min, word_count_max, essay_type, key_themes)
SELECT 
    q.id,
    q.content,
    200,
    300,
    'argumentative',
    ARRAY['argumentation', 'analysis']::text[]
FROM pte_questions q
JOIN pte_question_types qt ON q.question_type_id = qt.id
WHERE qt.code = 'essay'
ORDER BY q.created_at;

-- ============================================================================
-- READING QUESTIONS
-- ============================================================================

-- Insert Reading Questions with proper structure

-- MC SINGLE ANSWER READING (3 questions)
INSERT INTO pte_questions (question_type_id, title, content, difficulty, tags, is_active, is_premium, usage_count, average_score, correct_answer, metadata)
SELECT 
    get_question_type_id('mc_single_answer_reading'),
    title,
    passage,
    CASE difficulty 
        WHEN 'easy' THEN 'Easy'::difficulty_enum
        WHEN 'medium' THEN 'Medium'::difficulty_enum
        WHEN 'hard' THEN 'Hard'::difficulty_enum
    END,
    ARRAY[difficulty]::text[],
    true,
    false,
    0,
    NULL,
    ('{"options": ' || options || ', "correctAnswerPositions": [' || correct_position || ']}')::jsonb,
    '{"source": "PTE Question Bank", "author": "Content Team"}'::jsonb
FROM (VALUES
    ('Reading MC - Climate Change', 'Climate change is one of the most pressing challenges facing our planet today. The Earth''s average temperature has risen significantly over the past century, primarily due to the burning of fossil fuels and deforestation. This warming has led to a cascade of effects including melting ice caps, rising sea levels, and increasingly severe weather events.

Scientists have observed that the Arctic is warming at twice the rate of the global average. This rapid change is affecting wildlife, particularly polar bears who rely on sea ice for hunting. As ice melts earlier each year, these animals face longer fasting periods, leading to declining populations in some regions.

The impacts of climate change extend beyond environmental concerns. Agricultural patterns are shifting, threatening food security in many regions. Coastal communities face existential threats from rising seas, and extreme weather events are becoming more frequent and destructive. Addressing these challenges requires coordinated global action and a transition to sustainable energy sources.',
    '[{"id": "a", "text": "Natural climate cycles"}, {"id": "b", "text": "Burning of fossil fuels and deforestation"}, {"id": "c", "text": "Solar activity increases"}, {"id": "d", "text": "Ocean current changes"}]',
    '1', 'medium'),
    ('Reading MC - Digital Revolution', 'The digital revolution has transformed nearly every aspect of modern life. From the way we communicate to how we work and entertain ourselves, digital technology has become ubiquitous. Smartphones, which were once considered luxury items, are now essential tools for billions of people worldwide.

This transformation has brought numerous benefits, including instant access to information, the ability to connect with people across the globe, and new forms of entertainment and education. Online learning platforms have democratized education, making knowledge accessible to anyone with an internet connection.

However, the digital age also presents challenges. Privacy concerns have grown as personal data becomes increasingly valuable. Digital addiction, particularly among young people, has emerged as a significant social issue. Additionally, the rapid pace of technological change has created a digital divide between those who can adapt and those who are left behind.',
    '[{"id": "a", "text": "Increased privacy protection"}, {"id": "b", "text": "Reduced screen time for young people"}, {"id": "c", "text": "Democratized access to education"}, {"id": "d", "text": "Slower pace of technological change"}]',
    '2', 'easy'),
    ('Reading MC - Ancient Civilizations', 'The ancient Maya civilization, which flourished in Mesoamerica from approximately 2000 BCE to 1500 CE, developed one of the most sophisticated writing systems in the pre-Columbian Americas. Their hieroglyphic script consisted of over 800 distinct signs, combining logograms (word signs) with syllabic elements to create a flexible and expressive writing system.

Maya scribes, who held elite status in their society, recorded historical events, astronomical observations, and religious texts on stone monuments, pottery, and bark paper books known as codices. Unfortunately, most of these codices were destroyed during the Spanish conquest, leaving only four surviving examples that provide invaluable insights into Maya thought and culture.

Recent advances in the decipherment of Maya script have revealed the complexity of their political history, including detailed records of warfare, alliances, and royal dynasties. These discoveries have transformed our understanding of Maya civilization, showing it to be far more politically complex and historically aware than previously believed.',
    '[{"id": "a", "text": "They developed agricultural techniques"}, {"id": "b", "text": "They recorded historical events and astronomical observations"}, {"id": "c", "text": "They led military campaigns"}, {"id": "d", "text": "They governed city-states"}]',
    '1', 'hard')
) AS t(title, passage, options, correct_position, difficulty);

INSERT INTO pte_reading_questions (question_id, passage_text, question_text, options, correct_answer_positions)
SELECT 
    q.id,
    q.content,
    'Select the best answer.',
    (q.correct_answer->>'options')::jsonb,
    ARRAY[(q.correct_answer->>'correctAnswerPositions')::int]
FROM pte_questions q
JOIN pte_question_types qt ON q.question_type_id = qt.id
WHERE qt.code = 'mc_single_answer_reading'
ORDER BY q.created_at;

-- ============================================================================
-- LISTENING QUESTIONS
-- ============================================================================

-- Insert Listening Questions

-- HIGHLIGHT CORRECT SUMMARY (2 questions)
INSERT INTO pte_questions (question_type_id, title, content, difficulty, tags, is_active, is_premium, usage_count, average_score, correct_answer, metadata)
SELECT 
    get_question_type_id('highlight_correct_summary'),
    title,
    audio_text,
    CASE difficulty 
        WHEN 'easy' THEN 'Easy'::difficulty_enum
        WHEN 'medium' THEN 'Medium'::difficulty_enum
        WHEN 'hard' THEN 'Hard'::difficulty_enum
    END,
    ARRAY[difficulty]::text[],
    true,
    false,
    0,
    NULL,
    ('{"options": ' || options || ', "correctAnswerPositions": [0]}')::jsonb,
    '{"source": "PTE Question Bank", "author": "Content Team"}'::jsonb
FROM (VALUES
    ('Listening - Renewable Energy', 'The transition to renewable energy is accelerating faster than many experts predicted. Solar panel costs have dropped by over 90% in the past decade, making solar power competitive with fossil fuels in many regions. Wind energy has seen similar cost reductions, with offshore wind farms now capable of powering millions of homes. Governments worldwide are setting ambitious targets for carbon neutrality, driving investment in clean energy infrastructure. However, challenges remain, including the need for better energy storage solutions and grid modernization to handle variable renewable sources.',
    '[{"id": "a", "text": "Renewable energy adoption is slowing down due to high costs and technical challenges. While solar and wind have potential, they remain too expensive for widespread adoption. Governments are skeptical about clean energy targets."}, {"id": "b", "text": "The renewable energy sector is growing rapidly, driven by dramatic cost reductions in solar and wind power. Government policies support this transition, though energy storage and grid infrastructure still need improvement."}, {"id": "c", "text": "Fossil fuels remain the most economical energy source, with renewable alternatives proving too unreliable for large-scale use. Energy storage technology has advanced significantly, solving most intermittency issues."}, {"id": "d", "text": "Nuclear power is emerging as the primary alternative to fossil fuels, with renewable sources playing a minor supporting role in the energy transition."}]',
    'medium'),
    ('Listening - Urban Agriculture', 'Urban agriculture is gaining popularity in cities around the world. Rooftop gardens, vertical farms, and community gardens are transforming unused urban spaces into productive growing areas. These initiatives provide fresh produce to local communities, reduce food transportation costs, and help improve air quality. Many schools have started incorporating garden programs into their curriculum, teaching children about nutrition and where their food comes from. The COVID-19 pandemic accelerated interest in local food production, as supply chain disruptions highlighted the vulnerability of our food systems.',
    '[{"id": "a", "text": "Urban agriculture is declining as cities prioritize commercial development over green spaces. Most urban farming initiatives have failed due to lack of interest and funding."}, {"id": "b", "text": "Vertical farming technology is the only viable form of urban agriculture, with traditional gardens proving impractical in city environments."}, {"id": "c", "text": "Urban agriculture is expanding through various forms including rooftop gardens and vertical farms. It benefits communities by providing fresh food and educational opportunities, with increased interest following pandemic-related supply chain issues."}, {"id": "d", "text": "Urban agriculture primarily focuses on ornamental plants rather than food production, serving mainly aesthetic purposes in city landscapes."}]',
    'easy')
) AS t(title, audio_text, options, difficulty);

INSERT INTO pte_listening_questions (question_id, audio_file_url, audio_duration, transcript, question_text, options, correct_answer_positions)
SELECT 
    q.id,
    'placeholder_audio_url',
    180,
    q.content,
    'Select the paragraph that best summarizes the recording.',
    (q.correct_answer->>'options')::jsonb,
    ARRAY[0]
FROM pte_questions q
JOIN pte_question_types qt ON q.question_type_id = qt.id
WHERE qt.code = 'highlight_correct_summary'
ORDER BY q.created_at;

-- WRITE FROM DICTATION (3 questions)
INSERT INTO pte_questions (question_type_id, title, content, difficulty, tags, is_active, is_premium, usage_count, average_score, correct_answer, metadata)
SELECT 
    get_question_type_id('write_from_dictation'),
    title,
    content,
    CASE difficulty 
        WHEN 'easy' THEN 'Easy'::difficulty_enum
        WHEN 'medium' THEN 'Medium'::difficulty_enum
        WHEN 'hard' THEN 'Hard'::difficulty_enum
    END,
    ARRAY[difficulty]::text[],
    true,
    false,
    0,
    NULL,
    ('{"text": "' || content || '"}')::jsonb,
    '{"source": "PTE Question Bank", "author": "Content Team"}'::jsonb
FROM (VALUES
    ('Dictation - Library', 'The library will be closed for renovations during the summer break.', 'easy'),
    ('Dictation - Assignments', 'Students must submit their assignments before the deadline to receive full credit.', 'medium'),
    ('Dictation - Research', 'The interdisciplinary research program requires collaboration between multiple academic departments.', 'hard')
) AS t(title, content, difficulty);

INSERT INTO pte_listening_questions (question_id, audio_file_url, audio_duration, transcript, correct_answer_positions)
SELECT 
    q.id,
    'placeholder_audio_url',
    60,
    q.content,
    ARRAY[0]
FROM pte_questions q
JOIN pte_question_types qt ON q.question_type_id = qt.id
WHERE qt.code = 'write_from_dictation'
ORDER BY q.created_at;

-- Cleanup: Drop the helper function
DROP FUNCTION IF EXISTS get_question_type_id(text);

-- Summary
SELECT 'PTE Questions Seed Complete!' as status;
SELECT COUNT(*) as total_questions FROM pte_questions;
SELECT qt.code as question_type, COUNT(*) as count
FROM pte_questions q
JOIN pte_question_types qt ON q.question_type_id = qt.id
GROUP BY qt.code
ORDER BY qt.code;
