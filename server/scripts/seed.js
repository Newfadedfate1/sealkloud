import bcrypt from 'bcryptjs';
import { pool, initializeDatabase } from '../config/database.js';

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Initialize database tables first
    await initializeDatabase();

    // Hash password for all users
    const passwordHash = await bcrypt.hash('password123', 12);

    // Insert sample users with detailed information
    const users = [
      ['client@sealkloud.com', passwordHash, 'John', 'Client', 'client', 'sealkloud'],
      ['employee@sealkloud.com', passwordHash, 'Jane', 'Employee', 'employee_l1', 'sealkloud'],
      ['l2tech@sealkloud.com', passwordHash, 'Level 2', 'Tech', 'employee_l2', 'sealkloud'],
      ['l3expert@sealkloud.com', passwordHash, 'Level 3', 'Expert', 'employee_l3', 'sealkloud'],
      ['admin@sealkloud.com', passwordHash, 'Admin', 'User', 'admin', 'sealkloud']
    ];

    console.log('👥 Creating user accounts...');
    for (const user of users) {
      try {
        await pool.query(`
          INSERT INTO users (email, password_hash, first_name, last_name, role, company_id)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (email) DO UPDATE SET
            password_hash = EXCLUDED.password_hash,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            role = EXCLUDED.role,
            updated_at = CURRENT_TIMESTAMP
        `, user);
        console.log(`   ✅ Created/Updated user: ${user[0]} (${user[4]})`);
      } catch (error) {
        console.error(`   ❌ Error creating user ${user[0]}:`, error.message);
      }
    }

    // Insert sample tickets
    console.log('🎫 Creating sample tickets...');
    const tickets = [
      ['TK-001', 'ARCHEAN', 1, 'Email server not responding', 'Unable to send or receive emails since this morning. Multiple users affected across different departments.', 'high', 'in-progress', 2],
      ['TK-002', 'TechCorp', 1, 'VPN connection issues', 'Multiple users unable to connect to VPN. Remote work is severely impacted.', 'critical', 'open', 4],
      ['TK-003', 'ARCHEAN', 1, 'Software license renewal', 'Need to renew Microsoft Office licenses before they expire next week.', 'low', 'resolved', 2],
      ['TK-004', 'DataFlow Inc', 1, 'Database performance issues', 'Queries running very slowly, affecting productivity. Database response time increased by 300%.', 'high', 'unassigned', null],
      ['TK-005', 'ARCHEAN', 1, 'Printer not working', 'Office printer showing error messages and not printing documents.', 'medium', 'in-progress', 2],
      ['TK-006', 'TechCorp', 1, 'Website down', 'Company website is not accessible. Customers cannot reach our services.', 'critical', 'open', 5],
      ['TK-007', 'CloudSys', 1, 'Account access issues', 'Unable to login to admin panel. Password reset not working.', 'medium', 'open', 2],
      ['TK-008', 'ARCHEAN', 1, 'Network connectivity problems', 'Intermittent network drops affecting file server access.', 'high', 'unassigned', null],
      ['TK-009', 'DataFlow Inc', 1, 'Backup system failure', 'Automated backup system failed last night. Need immediate attention.', 'critical', 'unassigned', null],
      ['TK-010', 'TechCorp', 1, 'Software installation request', 'Need new design software installed on 5 workstations.', 'low', 'resolved', 2]
    ];

    for (const ticket of tickets) {
      try {
        await pool.query(`
          INSERT INTO tickets (ticket_id, client_name, client_id, title, description, problem_level, status, assigned_to)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (ticket_id) DO UPDATE SET
            client_name = EXCLUDED.client_name,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            problem_level = EXCLUDED.problem_level,
            status = EXCLUDED.status,
            assigned_to = EXCLUDED.assigned_to,
            last_updated = CURRENT_TIMESTAMP
        `, ticket);
        console.log(`   ✅ Created/Updated ticket: ${ticket[0]}`);
      } catch (error) {
        console.error(`   ❌ Error creating ticket ${ticket[0]}:`, error.message);
      }
    }

    // Insert sample activities
    console.log('📝 Creating activity logs...');
    const activities = [
      [1, 2, 'assigned', 'Ticket assigned to Level 1 support'],
      [1, 2, 'status_changed', 'Status changed to in-progress'],
      [1, 2, 'comment', 'Investigating email server logs'],
      [2, 4, 'assigned', 'Ticket escalated to Level 2 support'],
      [2, 4, 'comment', 'VPN server restart scheduled for tonight'],
      [3, 2, 'assigned', 'Ticket assigned to Level 1 support'],
      [3, 2, 'status_changed', 'Status changed to resolved'],
      [3, 2, 'comment', 'License renewal completed successfully'],
      [5, 2, 'assigned', 'Ticket assigned to Level 1 support'],
      [5, 2, 'comment', 'Printer driver reinstallation in progress'],
      [6, 5, 'assigned', 'Critical issue escalated to Level 3 expert'],
      [6, 5, 'comment', 'Website hosting provider contacted'],
      [7, 2, 'assigned', 'Ticket assigned to Level 1 support'],
      [7, 2, 'comment', 'Password reset link sent to user'],
      [10, 2, 'assigned', 'Ticket assigned to Level 1 support'],
      [10, 2, 'status_changed', 'Status changed to resolved'],
      [10, 2, 'comment', 'Software installation completed on all workstations']
    ];

    for (const activity of activities) {
      try {
        const ticketId = `TK-${activity[0].toString().padStart(3, '0')}`;
        await pool.query(`
          INSERT INTO ticket_activities (ticket_id, user_id, action, description)
          VALUES (
            (SELECT id FROM tickets WHERE ticket_id = $1),
            $2, $3, $4
          )
        `, [ticketId, activity[1], activity[2], activity[3]]);
      } catch (error) {
        console.error(`   ❌ Error creating activity for ticket TK-${activity[0].toString().padStart(3, '0')}:`, error.message);
      }
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📧 Demo User Accounts Created:');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                    DEMO CREDENTIALS                         │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ 👤 Client Account                                           │');
    console.log('│    Email: client@sealkloud.com                              │');
    console.log('│    Role:  View and create tickets                           │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ 🛠️  Level 1 Support                                         │');
    console.log('│    Email: employee@sealkloud.com                            │');
    console.log('│    Role:  Handle basic tickets                              │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ ⚙️  Level 2 Support                                         │');
    console.log('│    Email: l2tech@sealkloud.com                              │');
    console.log('│    Role:  Advanced technical support                        │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ 🔧 Level 3 Expert                                           │');
    console.log('│    Email: l3expert@sealkloud.com                            │');
    console.log('│    Role:  Complex issue resolution                          │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ 👑 Administrator                                            │');
    console.log('│    Email: admin@sealkloud.com                               │');
    console.log('│    Role:  Full system access                                │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ 🔑 Password for all accounts: password123                   │');
    console.log('└─────────────────────────────────────────────────────────────┘');
    console.log('\n🎫 Sample tickets and activities have been created');
    console.log('🚀 You can now start the application and test different user roles');
    
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