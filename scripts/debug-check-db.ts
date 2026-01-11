
import 'dotenv/config';
import { db } from '@/lib/db';

async function check() {
    console.log('🔍 Checking DB Content...');
    const types = await db.query.pteQuestionTypes.findMany();
    const questions = await db.query.pteQuestions.findMany({
        with: { questionType: true }
    });

    console.log(`Found ${types.length} Types.`);
    console.log(`Found ${questions.length} Questions.`);

    const counts: Record<string, number> = {};
    questions.forEach(q => {
        const name = q.questionType.name;
        counts[name] = (counts[name] || 0) + 1;
    });

    console.log('--- Question Counts by Type ---');
    Object.entries(counts).forEach(([name, count]) => {
        console.log(`[${name}]: ${count}`);
    });

    console.log('--- Types with 0 Questions ---');
    types.forEach(t => {
        if (!counts[t.name]) {
            console.log(`[${t.name}] (Code: ${t.code}) - EMPTY`);
        }
    });
}
check().catch(console.error);
