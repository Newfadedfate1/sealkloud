import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const setupDatabase = async () => {
  // Connect to PostgreSQL server (not to a specific database)
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'sealkloud_helpdesk';
    
    try {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created successfully`);
    } catch (error) {
      if (error.code === '42P04') {
        console.log(`ℹ️  Database '${dbName}' already exists`);
      } else {
        throw error;
      }
    }

    client.release();
    await pool.end();

    console.log('✅ PostgreSQL setup completed successfully');
    console.log('\n📋 Next steps:');
    console.log('1. Make sure your .env file has the correct database credentials');
    console.log('2. Run: npm run dev');
    console.log('3. The application will automatically create all tables');

  } catch (error) {
    console.error('❌ Error setting up PostgreSQL:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is installed and running');
    console.log('2. Check your database credentials in .env file');
    console.log('3. Ensure the PostgreSQL user has permission to create databases');
    console.log('4. Try running: createdb sealkloud_helpdesk (if you have createdb command)');
  }
};

setupDatabase(); 