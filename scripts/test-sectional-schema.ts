import { db } from '@/lib/db';
import { SECTION_TEMPLATES } from '@/lib/pte/sectional-templates';
import { pteQuestionTypes, pteQuestions } from '@/lib/db/schema';
import { sql, eq, count } from 'drizzle-orm';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function testSchema() {
    console.log('Testing Sectional Test Schema...\n');

    // Test DB Connection
    const example = await db.execute(sql`SELECT 1 as ok`);
    console.log('✅ Database connection successful', example.rows);

    const getTypeId = async (typeStr: string) => {
        const type = await db.query.pteQuestionTypes.findFirst({
            where: sql`LOWER(${pteQuestionTypes.name}) = LOWER(${typeStr})`
        });
        return type;
    };

    // Iterate through each section
    for (const [key, template] of Object.entries(SECTION_TEMPLATES)) {
        console.log(`\n--- ${template.title} ---`);

        for (const config of template.questions) {
            const type = await getTypeId(config.type);
            if (!type) {
                console.warn(`⚠️  Type "${config.type}" not found in database`);
                continue;
            }

            const questionCount = await db.select({ count: count() })
                .from(pteQuestions)
                .where(eq(pteQuestions.questionTypeId, type.id))
                .then(res => res[0]?.count || 0);

            const status = questionCount >= config.minCount ? '✅' : '⚠️';
            console.log(`  ${status} ${config.type}: ${questionCount} available (need ${config.minCount}-${config.maxCount})`);
        }
    }

    console.log('\n✅ Schema test complete');
}

testSchema()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
