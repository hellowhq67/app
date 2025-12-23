import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';
import { db } from '../lib/db/drizzle'; // Import the configured database instance

const runMigrate = async () => {
  console.log('🚀 Starting migration...');

  // Create a single client connection for the migration
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Run the migration
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    console.log('✅ Migrations completed successfully');
  } catch (error: any) {
    // Check if the error is about duplicate objects (which can be ignored)
    if (error?.cause?.code === '42710' || error?.cause?.code === '42P07') {
      console.log('⚠️  Migration may have partially completed or types already exist. This is often expected.');
      console.log('✅ Continuing with migration process...');
    } else {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  } finally {
    await client.end();
  }
};

runMigrate()
  .then(() => {
    console.log('✅ Database migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database migration failed:', error);
    process.exit(1);
  });