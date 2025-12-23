import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { env } from '@/lib/env';

// Get database URL from environment
const connectionString = env.DATABASE_URL;

if (!connectionString) {
  throw new Error('❌ DATABASE_URL is not set in environment variables. Please check your .env.local file.');
}

if (connectionString.includes('railway.internal')) {
  console.warn('⚠️  Warning: Using a Railway internal database URL. This will not work outside the Railway network.');
  console.warn('👉 Use the Public TCP connection string from the Railway dashboard for local development.');
}

// Create PostgreSQL pool for connections
const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false,
  }
});

// Export the Drizzle ORM instance with schema for relational queries
export const db = drizzle(pool, { schema });
export const client = pool;