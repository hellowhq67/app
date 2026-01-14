import { db } from '../lib/db';
import { pteQuestionTypes } from '../lib/db/schema';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function checkTypes() {
    const types = await db.select().from(pteQuestionTypes);
    console.log('Available Question Types:');
    types.forEach(t => console.log(`- ${t.name} (${t.code})`));
}

checkTypes()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
