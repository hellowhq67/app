import { db, client } from './index';
import { 
  users, 
  pteQuestionTypes, 
  userProfiles,
  pteQuestions
} from './schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const SEED_USER_ID = 'seed-user-123';

async function seed() {
  console.log('🌱 Starting database seeding...');
  console.log('Current DATABASE_URL:', process.env.DATABASE_URL?.split('@')[1]);

  try {
    // 1. Seed Test User
    console.log('\nStep 1: Seeding test user...');
    try {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, SEED_USER_ID)
      });

      if (!existingUser) {
        console.log('Inserting user...');
        await db.insert(users).values({
          id: SEED_USER_ID,
          name: 'Test Student',
          email: 'student@example.com',
          role: 'student',
          dailyAiCredits: 20,
        });
        
        console.log('Inserting profile...');
        await db.insert(userProfiles).values({
          userId: SEED_USER_ID,
          targetScore: 79,
          studyGoal: 'Immigration to Australia',
        });
        console.log('✅ Test user created.');
      } else {
        console.log('ℹ️ Test user already exists.');
      }
    } catch (e: any) {
      console.error('❌ Step 1 failed:', e.message);
      if (e.detail) console.error('Detail:', e.detail);
      // Don't throw, try next step
    }

    // 2. Seed PTE Question Types
    console.log('\nStep 2: Seeding PTE question types...');
    const questionTypes = [
      { code: 'RA', title: 'Read Aloud', section: 'speaking', shortName: 'RA' },
      { code: 'RS', title: 'Repeat Sentence', section: 'speaking', shortName: 'RS' },
    ];

    for (const type of questionTypes) {
      try {
        console.log(`Upserting type: ${type.code}`);
        await db.insert(pteQuestionTypes).values(type as any).onConflictDoUpdate({
          target: pteQuestionTypes.code,
          set: { title: type.title, section: type.section, shortName: type.shortName }
        });
      } catch (e: any) {
        console.error(`❌ Failed to upsert type ${type.code}:`, e.message);
      }
    }
    console.log('✅ PTE question types step finished.');

    // 3. Seed Sample Questions
    console.log('\nStep 3: Seeding sample questions...');
    try {
      await db.insert(pteQuestions).values({
        question: 'The development of clean energy is one of the greatest challenges of our time.',
        questionType: 'RA',
        section: 'speaking',
        difficulty: 'Medium',
      });
      console.log('✅ Sample questions seeded.');
    } catch (e: any) {
      console.error('❌ Step 3 failed:', e.message);
    }

    console.log('\n✨ Seeding process finished!');
  } catch (error: any) {
    console.error('❌ Global seeding error:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

seed();
