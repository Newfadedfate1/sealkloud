import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    // Open SQLite database
    db = await open({
      filename: path.join(__dirname, '../data/sealkloud.db'),
      driver: sqlite3.Database
    });

    // Create users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('client', 'employee_l1', 'employee_l2', 'employee_l3', 'admin')),
        company_id TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        last_login TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tickets table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT UNIQUE NOT NULL,
        client_name TEXT NOT NULL,
        client_id INTEGER,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        problem_level TEXT NOT NULL CHECK (problem_level IN ('low', 'medium', 'high', 'critical')),
        status TEXT NOT NULL CHECK (status IN ('open', 'unassigned', 'in-progress', 'resolved', 'closed')),
        assigned_to INTEGER,
        submitted_date TEXT DEFAULT CURRENT_TIMESTAMP,
        last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
        resolved_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create ticket_activities table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ticket_activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER,
        user_id INTEGER,
        action TEXT NOT NULL,
        description TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE
      )
    `);

    // Create ticket_chats table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ticket_chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT NOT NULL,
        sender_id INTEGER NOT NULL,
        sender_role TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

// Get database instance
export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

// Close database connection
export const closeDatabase = async () => {
  if (db) {
    await db.close();
  }
};