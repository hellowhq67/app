import {
    POST as aiAssistantPost
} from '@/app/api/ai-assistant/route';
import {
    POST as pteQuestionsPost
} from '@/app/api/pte-practice/questions/route';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db'; // Ensure DB connection is open

async function testAiAssistant() {
  console.log('\n--- Testing AI Assistant API ---');
  const body = JSON.stringify({
    messages: [{ role: 'user', content: 'Hello, help me with PTE.' }]
  });
  
  // Mock NextRequest
  const req = new NextRequest('http://localhost/api/ai-assistant', {
    method: 'POST',
    body,
  });

  try {
    const res = await aiAssistantPost(req);
    console.log('Status:', res.status);
    if (res.body) {
       // It returns a stream, so we might just check if it's ok
       console.log('Response is a stream/body');
    }
  } catch (e) {
    console.error('AI Assistant Test Failed:', e);
  }
}

async function testPteQuestions() {
  console.log('\n--- Testing PTE Questions API ---');
  const body = JSON.stringify({
    question: 'Test Question',
    questionType: 'RA',
    section: 'speaking',
    difficulty: 'easy'
  });

  const req = new NextRequest('http://localhost/api/pte-practice/questions', {
    method: 'POST',
    body,
    headers: { 'content-type': 'application/json' }
  });

  try {
    const res = await pteQuestionsPost(req);
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', data);
  } catch (e) {
    console.error('PTE Questions Test Failed:', e);
  }
}

async function main() {
  await testAiAssistant();
  await testPteQuestions();
  process.exit(0);
}

main();
