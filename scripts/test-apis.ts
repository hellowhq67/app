const BASE_URL = 'http://localhost:3000/api';
const BYPASS_HEADER = 'x-test-bypass-auth';

const userAuth = { [BYPASS_HEADER]: 'user' };
const adminAuth = { [BYPASS_HEADER]: 'admin' };

async function testEndpoint(name: string, url: string, options: RequestInit = {}) {
    try {
        const response = await fetch(url, options);
        console.log(`${response.ok ? '✅' : '❌'} ${name}: ${response.status}`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`   Error: ${errorText}`);
        }
        return response;
    } catch (error: any) {
        console.error(`❌ ${name}: Failed with error: ${error.message}`);
        return null;
    }
}

async function runTests() {
  console.log('🚀 Starting API Tests with Mock Data (v2)...\n');

  // --- USER PROFILE TESTS ---
  console.log('--- User Profile ---');
  await testEndpoint('GET /user/profile', `${BASE_URL}/user/profile`, { headers: userAuth });
  await testEndpoint('PATCH /user/profile', `${BASE_URL}/user/profile`, {
    method: 'PATCH',
    headers: { ...userAuth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      examDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      targetScore: '79',
    }),
  });

  // --- DASHBOARD TESTS ---
  console.log('\n--- Dashboard ---');
  await testEndpoint('GET /dashboard/feature-stats', `${BASE_URL}/dashboard/feature-stats`, { headers: userAuth });
  await testEndpoint('GET /dashboard/study-tools-progress', `${BASE_URL}/dashboard/study-tools-progress`, { headers: userAuth });

  // --- PTE QUESTIONS TESTS ---
  console.log('\n--- PTE Questions (All Sections) ---');
  await testEndpoint('GET /writing/questions', `${BASE_URL}/writing/questions?type=summarize_written_text`, { headers: userAuth });
  await testEndpoint('GET /listening/questions', `${BASE_URL}/listening/questions?type=summarize_spoken_text`, { headers: userAuth });
  await testEndpoint('GET /reading/questions', `${BASE_URL}/reading/questions?type=multiple_choice_single`, { headers: userAuth });

  // --- PTE ATTEMPTS TESTS ---
  console.log('\n--- PTE Attempts (All Sections) ---');
  await testEndpoint('GET /writing/attempts', `${BASE_URL}/writing/attempts`, { headers: userAuth });
  await testEndpoint('GET /listening/attempts', `${BASE_URL}/listening/attempts`, { headers: userAuth });
  await testEndpoint('GET /reading/attempts', `${BASE_URL}/reading/attempts`, { headers: userAuth });

  // --- ADMIN TESTS ---
  console.log('\n--- Admin Actions ---');
  await testEndpoint('POST /writing/questions (Admin)', `${BASE_URL}/writing/questions`, {
    method: 'POST',
    headers: { ...adminAuth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Mock Test Essay ' + Date.now(),
      type: 'write_essay',
      promptText: 'Is AI good for humanity?',
      difficulty: 'Medium',
      isActive: true,
      options: { wordLimit: 300, timeLimit: 20 },
      answerKey: { sampleAnswer: 'AI is beneficial if regulated...' }
    }),
  });

  // --- META & UPLOADS ---
  console.log('\n--- Meta & Other ---');
  await testEndpoint('GET /pte/categories', `${BASE_URL}/pte/categories`);
  await testEndpoint('GET /pte-practice/questions', `${BASE_URL}/pte-practice/questions`);

  console.log('\n✨ API Test Suite finished!');
}

runTests().catch(err => {
    console.error('Fatal error in test suite:', err);
    process.exit(1);
});
