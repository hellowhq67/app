import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { db } from './lib/db';
import { pteQuestions } from './lib/db/schema';

async function checkQuestions() {
    try {
        const questions = await db.select().from(pteQuestions);
        console.log(`Total questions in pte_questions: ${questions.length}`);
        questions.forEach((q, i) => {
            console.log(`${i + 1}. [${q.questionType}] ${q.question} (${q.id})`);
        });
    } catch (e) {
        console.error('Error checking questions:', e);
    } finally {
        process.exit(0);
    }
}

checkQuestions();
