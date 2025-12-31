import { db } from '../lib/db/drizzle';
import { pteCategories, pteQuestionTypes, pteQuestions } from '../lib/db/schema';

async function checkData() {
  try {
    const categories = await db.select().from(pteCategories);
    const questionTypes = await db.select().from(pteQuestionTypes);
    const questions = await db.select().from(pteQuestions);
    
    console.log('📊 Categories:', categories.length);
    console.log('📝 Question Types:', questionTypes.length);
    console.log('🎯 Questions:', questions.length);
    
    console.log('\n📋 Categories:');
    categories.forEach(cat => console.log(`  - ${cat.name} (${cat.code})`));
    
    console.log('\n📝 Question Types:');
    questionTypes.forEach(qt => console.log(`  - ${qt.name} (${qt.code})`));
    
    console.log('\n🎯 Sample Questions:');
    questions.forEach(q => console.log(`  - ${q.title} (${q.difficulty})`));
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  }
}

checkData();
