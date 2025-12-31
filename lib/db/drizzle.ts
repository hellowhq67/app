import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { env } from '@/lib/env';

// Get database URL from environment, prefer pooled URL if available
let connectionString = env.DATABASE_URL || env.DATABASE_URL_POOLED || process.env.DATABASE_URL || process.env.DATABASE_URL_POOLED;

if (!connectionString) {
  console.warn('❌ DATABASE_URL is not set in environment variables. Many features (auth, migrations) will fail until you provide one.');
} else {
  // Prefer IPv4 resolution for localhost to avoid ::1 connection refusals on some setups
  if (connectionString.includes('localhost')) {
    connectionString = connectionString.replace('localhost', '127.0.0.1');
  }
}

// Create PostgreSQL pool for connections
const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 10000, // Increased timeout
  max: 1, // Limit connections to avoid exhausting pool
  ssl: { rejectUnauthorized: false }, // Force SSL
});

// Test database connection
(async () => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT 1 as ok');
      console.log('DB OK', result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('DB ERR', error);
  }
})();

// Export the Drizzle ORM instance with schema for relational queries
export const db = drizzle(pool, { schema });
export const client = pool;