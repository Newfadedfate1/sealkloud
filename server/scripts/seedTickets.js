import { initializeDatabase, getDatabase } from '../config/database.js';

const seedTickets = async () => {
  await initializeDatabase();
  const db = getDatabase();
  
  try {
    console.log('🌱 Seeding test tickets for assignment system...');

    // Get existing tickets count
    const countResult = await db.query('SELECT COUNT(*) as count FROM tickets');
    const existingCount = parseInt(countResult.rows[0].count);
    
    // Create test tickets
    const testTickets = [
      {
        ticket_id: `TK-${(existingCount + 1).toString().padStart(3, '0')}`,
        client_name: 'John Smith',
        client_id: null,
        title: 'Cannot access email account',
        description: 'I am unable to log into my email account. Getting an error message about invalid credentials.',
        problem_level: 'medium',
        status: 'unassigned'
      },
      {
        ticket_id: `TK-${(existingCount + 2).toString().padStart(3, '0')}`,
        client_name: 'Sarah Johnson',
        client_id: null,
        title: 'Printer not working',
        description: 'The office printer is showing an error and won\'t print any documents. Error code: E-04.',
        problem_level: 'low',
        status: 'unassigned'
      },
      {
        ticket_id: `TK-${(existingCount + 3).toString().padStart(3, '0')}`,
        client_name: 'Mike Davis',
        client_id: null,
        title: 'Software installation issue',
        description: 'Trying to install the new accounting software but getting a permission denied error.',
        problem_level: 'high',
        status: 'unassigned'
      },
      {
        ticket_id: `TK-${(existingCount + 4).toString().padStart(3, '0')}`,
        client_name: 'Lisa Wilson',
        client_id: null,
        title: 'Internet connection slow',
        description: 'The internet connection has been very slow for the past few days. Affecting work productivity.',
        problem_level: 'medium',
        status: 'unassigned'
      },
      {
        ticket_id: `TK-${(existingCount + 5).toString().padStart(3, '0')}`,
        client_name: 'Robert Brown',
        client_id: null,
        title: 'Computer won\'t start',
        description: 'My computer won\'t turn on. When I press the power button, nothing happens.',
        problem_level: 'critical',
        status: 'unassigned'
      },
      {
        ticket_id: `TK-${(existingCount + 6).toString().padStart(3, '0')}`,
        client_name: 'Emily Chen',
        client_id: null,
        title: 'VPN connection issues',
        description: 'Cannot connect to the company VPN. Getting timeout errors when trying to access remote resources.',
        problem_level: 'high',
        status: 'unassigned'
      },
      {
        ticket_id: `TK-${(existingCount + 7).toString().padStart(3, '0')}`,
        client_name: 'David Wilson',
        client_id: null,
        title: 'Monitor display problems',
        description: 'The monitor is showing distorted colors and flickering. Suspect it might be a hardware issue.',
        problem_level: 'medium',
        status: 'unassigned'
      },
      {
        ticket_id: `TK-${(existingCount + 8).toString().padStart(3, '0')}`,
        client_name: 'Maria Garcia',
        client_id: null,
        title: 'File sharing permissions',
        description: 'Need help setting up file sharing permissions for the new project folder.',
        problem_level: 'low',
        status: 'unassigned'
      }
    ];

    // Insert test tickets
    for (const ticket of testTickets) {
      await db.query(`
        INSERT INTO tickets (ticket_id, client_name, client_id, title, description, problem_level, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [ticket.ticket_id, ticket.client_name, ticket.client_id, ticket.title, ticket.description, ticket.problem_level, ticket.status]);

      // Get the inserted ticket ID for activity log
      const insertedTicket = await db.query('SELECT id FROM tickets WHERE ticket_id = $1', [ticket.ticket_id]);
      
      // Add activity log entry
      await db.query(`
        INSERT INTO ticket_activities (ticket_id, user_id, action, description)
        VALUES ($1, $2, $3, $4)
      `, [insertedTicket.rows[0].id, 1, 'created', 'Test ticket created for assignment system']);
    }

    console.log(`✅ Successfully seeded ${testTickets.length} test tickets`);
    console.log('📋 Test tickets created:');
    testTickets.forEach(ticket => {
      console.log(`   - ${ticket.ticket_id}: ${ticket.title} (${ticket.problem_level} priority)`);
    });
    console.log('\n🎯 These tickets will appear in the "Available Tickets" section for Level 1 employees');
    console.log('👥 Employees can click "Take" to claim these tickets');

  } catch (error) {
    console.error('❌ Error seeding tickets:', error);
  }
};

// Run the seed function
seedTickets().then(() => {
  console.log('🏁 Ticket seeding completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Ticket seeding failed:', error);
  process.exit(1);
}); 