import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { config } from 'dotenv';
import bcrypt from 'bcryptjs';

config({ path: '.env.local' });

async function seedUser() {
    const password = await bcrypt.hash('password123', 10);
    const [user] = await db.insert(users).values({
        id: crypto.randomUUID(),
        name: 'Test Resident',
        email: 'test@example.com',
        hashedPassword: password,
        emailVerified: true,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Test',
    }).onConflictDoNothing().returning();

    if (user) {
        console.log('✅ Test user created:', user.email);
    } else {
        console.log('ℹ️ Test user already exists or could not be created');
    }
}

seedUser()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
