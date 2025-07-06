import { getDatabase } from '../config/database.js';

const seedWorkflows = async () => {
  try {
    const db = getDatabase();
    
    console.log('🌱 Seeding workflow automation rules...');

    // Define initial workflow rules
    const workflowRules = [
      {
        name: 'High Priority Auto-Assignment',
        description: 'Automatically assign high priority tickets to senior staff',
        is_active: 1,
        priority: 1,
        conditions: [
          { field: 'priority', operator: 'equals', value: 'high' },
          { field: 'status', operator: 'equals', value: 'open' }
        ],
        actions: [
          { type: 'assign', value: 'senior-support' },
          { type: 'change_status', value: 'in_progress' }
        ]
      },
      {
        name: 'Critical Issue Escalation',
        description: 'Automatically escalate critical issues to L3 support',
        is_active: 1,
        priority: 1,
        conditions: [
          { field: 'priority', operator: 'equals', value: 'critical' }
        ],
        actions: [
          { type: 'escalate', value: 'l3_support' },
          { type: 'change_status', value: 'in_progress' }
        ]
      },
      {
        name: 'Stale Ticket Auto-Close',
        description: 'Auto-close tickets that have been inactive for 30 days',
        is_active: 1,
        priority: 2,
        conditions: [
          { field: 'last_updated', operator: 'less_than', value: '30_days' },
          { field: 'status', operator: 'in', value: 'open,in_progress' }
        ],
        actions: [
          { type: 'auto_respond', value: 'ticket_auto_closed' },
          { type: 'change_status', value: 'closed' }
        ]
      },
      {
        name: 'Client Response Alert',
        description: 'Send alert when client responds to a ticket',
        is_active: 1,
        priority: 3,
        conditions: [
          { field: 'status', operator: 'equals', value: 'waiting_for_client' }
        ],
        actions: [
          { type: 'auto_respond', value: 'client_response_received' },
          { type: 'change_status', value: 'in_progress' }
        ]
      },
      {
        name: 'Workload Balancing',
        description: 'Distribute tickets evenly across available agents',
        is_active: 0, // Disabled by default
        priority: 4,
        conditions: [
          { field: 'assignee', operator: 'equals', value: 'unassigned' }
        ],
        actions: [
          { type: 'assign', value: 'least_busy_agent' }
        ]
      }
    ];

    // Insert workflow rules
    for (const rule of workflowRules) {
      // Check if rule already exists
      const existingRule = await db.get('SELECT id FROM workflow_rules WHERE name = ?', [rule.name]);
      
      if (existingRule) {
        console.log(`⚠️  Workflow rule "${rule.name}" already exists, skipping...`);
        continue;
      }

      // Insert rule
      const result = await db.run(
        'INSERT INTO workflow_rules (name, description, is_active, priority) VALUES (?, ?, ?, ?)',
        [rule.name, rule.description, rule.is_active, rule.priority]
      );

      const ruleId = result.lastID;
      console.log(`✅ Created workflow rule: ${rule.name} (ID: ${ruleId})`);

      // Insert conditions
      for (const condition of rule.conditions) {
        await db.run(
          'INSERT INTO workflow_conditions (rule_id, field, operator, value) VALUES (?, ?, ?, ?)',
          [ruleId, condition.field, condition.operator, condition.value]
        );
      }

      console.log(`   └─ Added ${rule.conditions.length} conditions`);

      // Insert actions
      for (const action of rule.actions) {
        await db.run(
          'INSERT INTO workflow_actions (rule_id, type, value) VALUES (?, ?, ?)',
          [ruleId, action.type, action.value]
        );
      }

      console.log(`   └─ Added ${rule.actions.length} actions`);
    }

    console.log('✅ Workflow seeding completed successfully!');
    
    // Display summary
    const ruleCount = await db.get('SELECT COUNT(*) as count FROM workflow_rules');
    const conditionCount = await db.get('SELECT COUNT(*) as count FROM workflow_conditions');
    const actionCount = await db.get('SELECT COUNT(*) as count FROM workflow_actions');
    const activeCount = await db.get('SELECT COUNT(*) as count FROM workflow_rules WHERE is_active = 1');
    
    console.log(`📊 Summary:`);
    console.log(`   - Total workflow rules: ${ruleCount.count}`);
    console.log(`   - Active rules: ${activeCount.count}`);
    console.log(`   - Total conditions: ${conditionCount.count}`);
    console.log(`   - Total actions: ${actionCount.count}`);

  } catch (error) {
    console.error('❌ Error seeding workflow rules:', error);
    throw error;
  }
};

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedWorkflows()
    .then(() => {
      console.log('🎉 Workflow seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Workflow seeding failed:', error);
      process.exit(1);
    });
}

export { seedWorkflows }; 