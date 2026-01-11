import 'dotenv/config';

console.log('=== Environment Variables ===');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 60) + '...');

// Check for any Supabase URLs that might interfere
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
console.log('SUPABASE_URL exists:', !!supabaseUrl);
console.log('SUPABASE_URL:', supabaseUrl?.substring(0, 60) + '...');

// Test Neon connection
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const sql = neon(process.env.DATABASE_URL);

async function testConnection() {
  try {
    console.log('\n=== Testing Neon Connection ===');
    const result = await sql`SELECT 1 as test, NOW() as current_time`;
    console.log('✅ Connection successful:', result);
    
    // Test table creation
    console.log('\n=== Testing Table Creation ===');
    await sql`CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name TEXT)`;
    console.log('✅ Test table created');
    
    // Test insert
    await sql`INSERT INTO test_table (name) VALUES ('test') ON CONFLICT DO NOTHING`;
    console.log('✅ Test insert successful');
    
    // Test select
    const testResult = await sql`SELECT * FROM test_table`;
    console.log('✅ Test select successful:', testResult);
    
    // Clean up
    await sql`DROP TABLE IF EXISTS test_table`;
    console.log('✅ Test table dropped');
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

testConnection();