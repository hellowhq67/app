import { db, client } from './drizzle';
import { sql } from 'drizzle-orm';

async function createSchemaAndSeed() {
    try {
        console.log('Creating public schema if it doesn\'t exist...');
        await db.execute(sql`CREATE SCHEMA IF NOT EXISTS public;`);

        console.log('✅ Schema created successfully');
        console.log('Now run: pnpm drizzle-kit push');
        console.log('Then run: pnpm tsx lib/db/seed-pte-data.ts');

        await client.end();
    } catch (error) {
        console.error('Error creating schema:', error);
        await client.end();
        process.exit(1);
    }
}

createSchemaAndSeed();
