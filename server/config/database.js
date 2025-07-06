import pkg from 'pg';
const { Pool } = pkg;

let pool;

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    // Create PostgreSQL connection pool
    pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'sealkloud_helpdesk',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    });

    // Test the connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('client', 'employee_l1', 'employee_l2', 'employee_l3', 'admin')),
        company_id VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tickets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        ticket_id VARCHAR(50) UNIQUE NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        client_id INTEGER,
        title VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        problem_level VARCHAR(20) NOT NULL CHECK (problem_level IN ('low', 'medium', 'high', 'critical')),
        status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'unassigned', 'in-progress', 'resolved', 'closed')),
        assigned_to INTEGER,
        submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create ticket_activities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ticket_activities (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER,
        user_id INTEGER,
        action VARCHAR(100) NOT NULL,
        description TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE
      )
    `);

    // Create ticket_chats table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ticket_chats (
        id SERIAL PRIMARY KEY,
        ticket_id VARCHAR(50) NOT NULL,
        sender_id INTEGER NOT NULL,
        sender_role VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create audit_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        user_email VARCHAR(255) NOT NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id VARCHAR(100),
        resource_name VARCHAR(255),
        details TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      )
    `);

    // Create roles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        is_system_role BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create role_permissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id SERIAL PRIMARY KEY,
        role_id INTEGER NOT NULL,
        permission VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
        UNIQUE(role_id, permission)
      )
    `);

    // Create user_roles table for role assignments
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        role_id INTEGER NOT NULL,
        assigned_by INTEGER,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users (id) ON DELETE SET NULL,
        UNIQUE(user_id, role_id)
      )
    `);

    // Create workflow_rules table
    await client.query(`
      CREATE TABLE IF NOT EXISTS workflow_rules (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        priority INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create workflow_conditions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS workflow_conditions (
        id SERIAL PRIMARY KEY,
        rule_id INTEGER NOT NULL,
        field VARCHAR(100) NOT NULL,
        operator VARCHAR(50) NOT NULL,
        value TEXT NOT NULL,
        FOREIGN KEY (rule_id) REFERENCES workflow_rules (id) ON DELETE CASCADE
      )
    `);

    // Create workflow_actions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS workflow_actions (
        id SERIAL PRIMARY KEY,
        rule_id INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        value TEXT NOT NULL,
        FOREIGN KEY (rule_id) REFERENCES workflow_rules (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
      CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_tickets_problem_level ON tickets(problem_level);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_workflow_rules_active ON workflow_rules(is_active);
      CREATE INDEX IF NOT EXISTS idx_workflow_rules_priority ON workflow_rules(priority);
    `);

    client.release();
    console.log('✅ Database tables initialized successfully');
    return pool;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

// Get database pool
export const getDatabase = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return pool;
};

// Execute a query with parameters
export const query = async (text, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// Execute a transaction
export const transaction = async (queries) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results = [];
    for (const { text, params = [] } of queries) {
      const result = await client.query(text, params);
      results.push(result);
    }
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Close database connection
export const closeDatabase = async () => {
  if (pool) {
    await pool.end();
  }
};