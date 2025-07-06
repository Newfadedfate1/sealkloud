import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const migrateData = async () => {
  try {
    // Connect to SQLite database
    const sqliteDb = await open({
      filename: path.join(__dirname, '../data/sealkloud.db'),
      driver: sqlite3.Database
    });

    // Connect to PostgreSQL
    const pgPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'sealkloud_helpdesk',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    });

    const pgClient = await pgPool.connect();
    console.log('✅ Connected to both databases');

    // Migrate users
    console.log('🔄 Migrating users...');
    const users = await sqliteDb.all('SELECT * FROM users');
    for (const user of users) {
      await pgClient.query(
        `INSERT INTO users (id, email, password_hash, first_name, last_name, role, company_id, is_active, last_login, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [
          user.id,
          user.email,
          user.password_hash,
          user.first_name,
          user.last_name,
          user.role,
          user.company_id,
          user.is_active === 1,
          user.last_login,
          user.created_at,
          user.updated_at
        ]
      );
    }
    console.log(`✅ Migrated ${users.length} users`);

    // Migrate tickets
    console.log('🔄 Migrating tickets...');
    const tickets = await sqliteDb.all('SELECT * FROM tickets');
    for (const ticket of tickets) {
      await pgClient.query(
        `INSERT INTO tickets (id, ticket_id, client_name, client_id, title, description, problem_level, status, assigned_to, submitted_date, last_updated, resolved_date, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING`,
        [
          ticket.id,
          ticket.ticket_id,
          ticket.client_name,
          ticket.client_id,
          ticket.title,
          ticket.description,
          ticket.problem_level,
          ticket.status,
          ticket.assigned_to,
          ticket.submitted_date,
          ticket.last_updated,
          ticket.resolved_date,
          ticket.created_at
        ]
      );
    }
    console.log(`✅ Migrated ${tickets.length} tickets`);

    // Migrate audit logs
    console.log('🔄 Migrating audit logs...');
    const auditLogs = await sqliteDb.all('SELECT * FROM audit_logs');
    for (const log of auditLogs) {
      await pgClient.query(
        `INSERT INTO audit_logs (id, user_id, user_email, action, resource_type, resource_id, resource_name, details, ip_address, user_agent, severity, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING`,
        [
          log.id,
          log.user_id,
          log.user_email,
          log.action,
          log.resource_type,
          log.resource_id,
          log.resource_name,
          log.details,
          log.ip_address,
          log.user_agent,
          log.severity,
          log.timestamp
        ]
      );
    }
    console.log(`✅ Migrated ${auditLogs.length} audit logs`);

    // Migrate roles
    console.log('🔄 Migrating roles...');
    const roles = await sqliteDb.all('SELECT * FROM roles');
    for (const role of roles) {
      await pgClient.query(
        `INSERT INTO roles (id, name, description, is_system_role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          role.id,
          role.name,
          role.description,
          role.is_system_role === 1,
          role.created_at,
          role.updated_at
        ]
      );
    }
    console.log(`✅ Migrated ${roles.length} roles`);

    // Migrate workflow rules
    console.log('🔄 Migrating workflow rules...');
    const workflowRules = await sqliteDb.all('SELECT * FROM workflow_rules');
    for (const rule of workflowRules) {
      await pgClient.query(
        `INSERT INTO workflow_rules (id, name, description, is_active, priority, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          rule.id,
          rule.name,
          rule.description,
          rule.is_active === 1,
          rule.priority,
          rule.created_at,
          rule.updated_at
        ]
      );
    }
    console.log(`✅ Migrated ${workflowRules.length} workflow rules`);

    // Migrate workflow conditions
    console.log('🔄 Migrating workflow conditions...');
    const conditions = await sqliteDb.all('SELECT * FROM workflow_conditions');
    for (const condition of conditions) {
      await pgClient.query(
        `INSERT INTO workflow_conditions (id, rule_id, field, operator, value)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [
          condition.id,
          condition.rule_id,
          condition.field,
          condition.operator,
          condition.value
        ]
      );
    }
    console.log(`✅ Migrated ${conditions.length} workflow conditions`);

    // Migrate workflow actions
    console.log('🔄 Migrating workflow actions...');
    const actions = await sqliteDb.all('SELECT * FROM workflow_actions');
    for (const action of actions) {
      await pgClient.query(
        `INSERT INTO workflow_actions (id, rule_id, type, value)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING`,
        [
          action.id,
          action.rule_id,
          action.type,
          action.value
        ]
      );
    }
    console.log(`✅ Migrated ${actions.length} workflow actions`);

    // Close connections
    await sqliteDb.close();
    pgClient.release();
    await pgPool.end();

    console.log('✅ Migration completed successfully!');
    console.log('\n📋 Migration Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Tickets: ${tickets.length}`);
    console.log(`- Audit Logs: ${auditLogs.length}`);
    console.log(`- Roles: ${roles.length}`);
    console.log(`- Workflow Rules: ${workflowRules.length}`);
    console.log(`- Workflow Conditions: ${conditions.length}`);
    console.log(`- Workflow Actions: ${actions.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
};

migrateData(); 