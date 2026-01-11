import 'dotenv/config';
import { db } from '@/lib/db';
import { benchmarks } from '@/lib/db/schema';
import { benchmarkResponses } from '../data/benchmark-responses';
import { BenchmarkResponse } from '@/lib/types';

async function seedBenchmarks() {
    console.log('🌱 Seeding benchmarks to database...');

    try {
        const values = benchmarkResponses.map((b: BenchmarkResponse) => ({
            id: b.id,
            questionType: b.questionType,
            responseText: b.response,
            overallScore: b.score,
            fluencyScore: b.features.fluency,
            pronunciationScore: 'pronunciation' in b.features ? b.features.pronunciation : null,
            contentScore: b.features.content,
            vocabularyScore: b.features.vocabulary,
            grammarScore: b.features.grammar,
            features: b.features,
            updatedAt: new Date(),
        }));

        // Upsert logic (on conflict do update)
        await db.insert(benchmarks)
            .values(values)
            .onConflictDoUpdate({
                target: benchmarks.id,
                set: {
                    updatedAt: new Date(),
                }
            });

        console.log(`✅ Successfully seeded ${values.length} benchmarks.`);

    } catch (error) {
        console.error('❌ Error seeding benchmarks:', error);
        process.exit(1);
    }
}

seedBenchmarks();
