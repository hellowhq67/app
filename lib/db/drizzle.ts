import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { env } from '@/lib/env';

// Get database URL from environment, prefer pooled URL if available
let connectionString = env.DATABASE_URL || env.DATABASE_URL_POOLED || process.env.DATABASE_URL || process.env.DATABASE_URL_POOLED;

if (!connectionString) {
  throw new Error('❌ DATABASE_URL is not set in environment variables');
}

// Create Neon HTTP client for serverless environments
const sql = neon(connectionString);

// Test database connection
(async () => {
  try {
    const result = await sql`SELECT 1 as ok`;
    console.log('✅ Database connection successful', result);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
})();

// Export the Drizzle ORM instance with schema for relational queries
export const db = drizzle(sql, { schema });
export const client = sql;