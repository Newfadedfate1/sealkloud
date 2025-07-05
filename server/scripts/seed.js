import bcrypt from 'bcryptjs';
import { pool, initializeDatabase } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const SALT_ROUNDS = 12;

// Sample users data
const users = [
  {
    email: 'admin@sealkloud.com',
    password: 'password123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    companyId: 'sealkloud'
  },
  {
    email: 'client@sealkloud.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Client',
    role: 'client',
    companyId: 'sealkloud'
  },
  {
    email: 'employee@sealkloud.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Employee',
    role: 'employee_l1',
    companyId: 'sealkloud'
  },
  {
    email: 'l2tech@sealkloud.com',
    password: 'password123',
    firstName: 'Mike',
    lastName: 'Technician',
    role: 'employee_l2',
    companyId: 'sealkloud'
  },
  {
    email: 'l3expert@sealkloud.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Expert',
    role: 'employee_l3',
    companyId: 'sealkloud'
  }
];

// Sample tickets data
const tickets = [
  {
    ticketId: 'TK-001',
    clientName: 'John Client',
    title: 'Login issues with the new system',
    description: 'I am unable to log into the new system. Getting an error message saying "Invalid credentials" even though I am using the correct password.',
    problemLevel: 'medium',
    status: 'in-progress',
    assignedTo: 3, // employee_l1
    submittedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    resolvedDate: null
  },
  {
    ticketId: 'TK-002',
    clientName: 'John Client',
    title: 'Database connection timeout',
    description: 'The application is experiencing frequent database connection timeouts during peak hours. This is affecting our daily operations.',
    problemLevel: 'high',
    status: 'unassigned',
    assignedTo: null,
    submittedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    resolvedDate: null
  },
  {
    ticketId: 'TK-003',
    clientName: 'John Client',
    title: 'System performance degradation',
    description: 'The system has been running very slowly for the past week. Response times have increased significantly.',
    problemLevel: 'critical',
    status: 'unassigned',
    assignedTo: null,
    submittedDate: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000),
    resolvedDate: null
  },
  {
    ticketId: 'TK-004',
    clientName: 'John Client',
    title: 'Feature request: Dark mode',
    description: 'Would it be possible to add a dark mode option to the interface? Many users work in low-light environments.',
    problemLevel: 'low',
    status: 'resolved',
    assignedTo: 3, // employee_l1
    submittedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    resolvedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    ticketId: 'TK-005',
    clientName: 'John Client',
    title: 'Email notifications not working',
    description: 'I am not receiving email notifications for ticket updates. This is causing delays in our workflow.',
    problemLevel: 'medium',
    status: 'open',
    assignedTo: null,
    submittedDate: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    lastUpdated: new Date(Date.now() - 12 * 60 * 60 * 1000),
    resolvedDate: null
  },
  {
    ticketId: 'TK-006',
    clientName: 'John Client',
    title: 'API integration issues',
    description: 'Our third-party API integration is failing intermittently. Need urgent assistance to resolve this.',
    problemLevel: 'high',
    status: 'in-progress',
    assignedTo: 4, // employee_l2
    submittedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    resolvedDate: null
  },
  {
    ticketId: 'TK-007',
    clientName: 'John Client',
    title: 'Security vulnerability found',
    description: 'Our security scan detected a potential vulnerability in the authentication system. Immediate attention required.',
    problemLevel: 'critical',
    status: 'unassigned',
    assignedTo: null,
    submittedDate: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
    resolvedDate: null
  },
  {
    ticketId: 'TK-008',
    clientName: 'John Client',
    title: 'Mobile app crashes',
    description: 'The mobile application is crashing frequently on iOS devices. This is affecting our mobile users.',
    problemLevel: 'high',
    status: 'in-progress',
    assignedTo: 5, // employee_l3
    submittedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    resolvedDate: null
  }
];

// Sample ticket activities
const activities = [
  {
    ticketId: 1,
    userId: 2, // client
    action: 'created',
    description: 'Ticket submitted by client'
  },
  {
    ticketId: 1,
    userId: 1, // admin
    action: 'assigned',
    description: 'Ticket assigned to Level 1 support'
  },
  {
    ticketId: 1,
    userId: 3, // employee_l1
    action: 'status_updated',
    description: 'Status changed to in-progress'
  },
  {
    ticketId: 1,
    userId: 3,
    action: 'commented',
    description: 'Investigating login issues. Please check if you are using the correct email address.'
  },
  {
    ticketId: 4,
    userId: 2,
    action: 'created',
    description: 'Feature request submitted'
  },
  {
    ticketId: 4,
    userId: 3,
    action: 'assigned',
    description: 'Feature request assigned to development team'
  },
  {
    ticketId: 4,
    userId: 3,
    action: 'status_updated',
    description: 'Feature implemented and deployed'
  },
  {
    ticketId: 4,
    userId: 3,
    action: 'resolved',
    description: 'Dark mode feature has been successfully implemented'
  },
  {
    ticketId: 6,
    userId: 2,
    action: 'created',
    description: 'API integration issue reported'
  },
  {
    ticketId: 6,
    userId: 4,
    action: 'assigned',
    description: 'Escalated to Level 2 technical support'
  },
  {
    ticketId: 6,
    userId: 4,
    action: 'commented',
    description: 'Analyzing API logs. Found intermittent connection issues.'
  },
  {
    ticketId: 8,
    userId: 2,
    action: 'created',
    description: 'Mobile app crash issue reported'
  },
  {
    ticketId: 8,
    userId: 5,
    action: 'assigned',
    description: 'Escalated to Level 3 expert support'
  },
  {
    ticketId: 8,
    userId: 5,
    action: 'commented',
    description: 'Identified memory leak in iOS version. Working on fix.'
  }
];

async function seedDatabase() {
  await initializeDatabase();
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await client.query('DELETE FROM ticket_activities');
    await client.query('DELETE FROM tickets');
    await client.query('DELETE FROM users');
    
    // Reset sequences
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE tickets_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE ticket_activities_id_seq RESTART WITH 1');
    
    // Insert users
    console.log('👥 Creating users...');
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
      await client.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, company_id)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [user.email, hashedPassword, user.firstName, user.lastName, user.role, user.companyId]);
    }
    
    // Insert tickets
    console.log('🎫 Creating tickets...');
    for (const ticket of tickets) {
      await client.query(`
        INSERT INTO tickets (ticket_id, client_name, client_id, title, description, problem_level, status, assigned_to, submitted_date, last_updated, resolved_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        ticket.ticketId,
        ticket.clientName,
        2, // client user id
        ticket.title,
        ticket.description,
        ticket.problemLevel,
        ticket.status,
        ticket.assignedTo,
        ticket.submittedDate,
        ticket.lastUpdated,
        ticket.resolvedDate
      ]);
    }
    
    // Insert activities
    console.log('📝 Creating activities...');
    for (const activity of activities) {
      await client.query(`
        INSERT INTO ticket_activities (ticket_id, user_id, action, description)
        VALUES ($1, $2, $3, $4)
      `, [activity.ticketId, activity.userId, activity.action, activity.description]);
    }
    
    // Create ticket_chats table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS ticket_chats (
        id SERIAL PRIMARY KEY,
        ticket_id VARCHAR(50) NOT NULL,
        sender_id INTEGER NOT NULL,
        sender_role VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded Data Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🎫 Tickets: ${tickets.length}`);
    console.log(`   📝 Activities: ${activities.length}`);
    
    console.log('\n🔐 Demo Credentials:');
    console.log('   Admin: admin@sealkloud.com / password123');
    console.log('   Client: client@sealkloud.com / password123');
    console.log('   Employee L1: employee@sealkloud.com / password123');
    console.log('   Employee L2: l2tech@sealkloud.com / password123');
    console.log('   Employee L3: l3expert@sealkloud.com / password123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the seeding
seedDatabase()
  .then(() => {
    console.log('🎉 Seeding process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });