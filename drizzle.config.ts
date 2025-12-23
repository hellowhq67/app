import { config } from 'dotenv';
config({ path: '.env.local' });
config(); // fallback to .env
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL is not set in the .env or .env.local file. Drizzle Kit requires this for migrations.');
}

export default defineConfig({
  schema: './lib/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
