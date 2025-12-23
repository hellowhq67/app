import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
}

async function dropAll() {
    console.log('🗑️ Dropping all tables in public schema...');
    const sql = neon(databaseUrl!);

    try {
        // Drop all tables
        await sql`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `;

        // Drop all enums
        await sql`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typtype = 'e') LOOP
          EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
        END LOOP;
      END $$;
    `;

        console.log('✅ All tables and types dropped.');
    } catch (error) {
        console.error('❌ Error dropping tables:', error);
    }
}

dropAll();
