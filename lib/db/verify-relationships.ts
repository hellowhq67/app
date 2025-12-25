import { db, client } from './drizzle';
import { pteCategories, pteQuestionTypes } from './schema/pte-categories';
import { pteQuestions } from './schema/pte-questions';
import { eq } from 'drizzle-orm';

async function verifyRelationships() {
    try {
        console.log('🔍 Verifying PTE database relationships...');

        // 1. Check Categories
        const categories = await db.select().from(pteCategories);
        console.log(`📊 Found ${categories.length} categories`);

        // 2. Check Question Types and Join with Categories
        const typesWithCategories = await db
            .select({
                typeName: pteQuestionTypes.name,
                categoryName: pteCategories.name,
            })
            .from(pteQuestionTypes)
            .innerJoin(pteCategories, eq(pteQuestionTypes.categoryId, pteCategories.id));

        console.log(`📊 Found ${typesWithCategories.length} question types linked to categories`);
        if (typesWithCategories.length === 22) {
            console.log('✅ Question types count matches (22)');
        } else {
            console.warn(`⚠️ Expected 22 question types, found ${typesWithCategories.length}`);
        }

        // 3. Check Questions and Join with Types
        const questionsWithTypes = await db
            .select({
                questionTitle: pteQuestions.title,
                typeName: pteQuestionTypes.name,
            })
            .from(pteQuestions)
            .innerJoin(pteQuestionTypes, eq(pteQuestions.questionTypeId, pteQuestionTypes.id));

        console.log(`📊 Found ${questionsWithTypes.length} questions linked to question types`);
        if (questionsWithTypes.length > 0) {
            console.log('✅ Question-to-Type relationships verified');
        } else {
            console.warn('⚠️ No questions found. Did seeding fail?');
        }

        console.log('✅ Relationship verification complete!');
        await client.end();
    } catch (error) {
        console.error('❌ Relationship verification failed:', error);
        await client.end();
        process.exit(1);
    }
}

verifyRelationships();
