import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Hash password for all users
    const passwordHash = await bcrypt.hash('password123', 12);

    // Insert sample users
    const users = [
      ['client@sealkloud.com', passwordHash, 'John', 'Client', 'client', 'sealkloud'],
      ['employee@sealkloud.com', passwordHash, 'Jane', 'Employee', 'employee_l1', 'sealkloud'],
      ['admin@sealkloud.com', passwordHash, 'Admin', 'User', 'admin', 'sealkloud'],
      ['l2tech@sealkloud.com', passwordHash, 'Level 2', 'Tech', 'employee_l2', 'sealkloud'],
      ['l3expert@sealkloud.com', passwordHash, 'Level 3', 'Expert', 'employee_l3', 'sealkloud']
    ];

    for (const user of users) {
      await pool.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, company_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
      `, user);
    }

    // Insert sample tickets
    const tickets = [
      ['TK-001', 'ARCHEAN', 1, 'Email server not responding', 'Unable to send or receive emails since this morning', 'high', 'in-progress', 2],
      ['TK-002', 'TechCorp', 1, 'VPN connection issues', 'Multiple users unable to connect to VPN', 'critical', 'open', 4],
      ['TK-003', 'ARCHEAN', 1, 'Software license renewal', 'Need to renew Microsoft Office licenses', 'low', 'resolved', 2],
      ['TK-004', 'DataFlow Inc', 1, 'Database performance issues', 'Queries running very slowly, affecting productivity', 'high', 'unassigned', null],
      ['TK-005', 'ARCHEAN', 1, 'Printer not working', 'Office printer showing error messages', 'medium', 'in-progress', 2],
      ['TK-006', 'TechCorp', 1, 'Website down', 'Company website is not accessible', 'critical', 'open', 5],
      ['TK-007', 'CloudSys', 1, 'Account access issues', 'Unable to login to admin panel', 'medium', 'open', 2]
    ];

    for (const ticket of tickets) {
      await pool.query(`
        INSERT INTO tickets (ticket_id, client_name, client_id, title, description, problem_level, status, assigned_to)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (ticket_id) DO NOTHING
      `, ticket);
    }

    // Insert sample activities
    const activities = [
      [1, 2, 'assigned', 'Ticket assigned to Level 1 support'],
      [1, 2, 'status_changed', 'Status changed to in-progress'],
      [2, 4, 'assigned', 'Ticket assigned to Level 2 support'],
      [3, 2, 'assigned', 'Ticket assigned to Level 1 support'],
      [3, 2, 'status_changed', 'Status changed to resolved'],
      [5, 2, 'assigned', 'Ticket assigned to Level 1 support'],
      [6, 5, 'assigned', 'Ticket assigned to Level 3 support'],
      [7, 2, 'assigned', 'Ticket assigned to Level 1 support']
    ];

    for (const activity of activities) {
      await pool.query(`
        INSERT INTO ticket_activities (ticket_id, user_id, action, description)
        VALUES (
          (SELECT id FROM tickets WHERE ticket_id = $1),
          $2, $3, $4
        )
      `, [`TK-${activity[0].toString().padStart(3, '0')}`, activity[1], activity[2], activity[3]]);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('📧 Demo credentials:');
    console.log('   Client: client@sealkloud.com / password123');
    console.log('   Employee: employee@sealkloud.com / password123');
    console.log('   Admin: admin@sealkloud.com / password123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedData };