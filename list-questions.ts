import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { db } from './lib/db';
import { pteQuestions } from './lib/db/schema';

async function listQuestions() {
    try {
        const questions = await db.select().from(pteQuestions);
        let output = `Total questions in pte_questions: ${questions.length}\n`;
        questions.forEach((q, i) => {
            output += `${i + 1}. [${q.questionType}] ${q.question} (${q.id})\n`;
        });
        fs.writeFileSync('questions-list.log', output);
        console.log('✅ Questions list saved to questions-list.log');
    } catch (e) {
        console.error('Error listing questions:', e);
    } finally {
        process.exit(0);
    }
}

listQuestions();
