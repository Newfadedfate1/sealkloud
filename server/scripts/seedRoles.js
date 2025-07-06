import { getDatabase } from '../config/database.js';

const seedRoles = async () => {
  try {
    const db = getDatabase();
    
    console.log('🌱 Seeding roles and permissions...');

    // Define system roles with their permissions
    const systemRoles = [
      {
        name: 'Admin',
        description: 'Full access to all system features and administrative functions',
        is_system_role: 1,
        permissions: [
          'view_tickets', 'edit_tickets', 'assign_tickets', 'delete_tickets',
          'view_users', 'edit_users', 'delete_users', 'manage_roles',
          'view_audit_logs', 'manage_settings', 'view_analytics', 'export_data',
          'manage_workflows', 'view_reports', 'manage_integrations'
        ]
      },
      {
        name: 'Manager',
        description: 'Can manage tickets, users, and view reports',
        is_system_role: 1,
        permissions: [
          'view_tickets', 'edit_tickets', 'assign_tickets',
          'view_users', 'edit_users',
          'view_audit_logs', 'view_analytics', 'export_data',
          'view_reports'
        ]
      },
      {
        name: 'Employee L1',
        description: 'Level 1 support - can view and edit assigned tickets',
        is_system_role: 1,
        permissions: [
          'view_tickets', 'edit_tickets'
        ]
      },
      {
        name: 'Employee L2',
        description: 'Level 2 support - can view, edit, and assign tickets',
        is_system_role: 1,
        permissions: [
          'view_tickets', 'edit_tickets', 'assign_tickets'
        ]
      },
      {
        name: 'Employee L3',
        description: 'Level 3 support - advanced ticket management capabilities',
        is_system_role: 1,
        permissions: [
          'view_tickets', 'edit_tickets', 'assign_tickets', 'delete_tickets',
          'view_analytics'
        ]
      },
      {
        name: 'Client',
        description: 'Can create and view their own tickets',
        is_system_role: 1,
        permissions: [
          'view_tickets'
        ]
      }
    ];

    // Insert roles
    for (const role of systemRoles) {
      // Check if role already exists
      const existingRole = await db.get('SELECT id FROM roles WHERE name = ?', [role.name]);
      
      if (existingRole) {
        console.log(`⚠️  Role "${role.name}" already exists, skipping...`);
        continue;
      }

      // Insert role
      const result = await db.run(
        'INSERT INTO roles (name, description, is_system_role) VALUES (?, ?, ?)',
        [role.name, role.description, role.is_system_role]
      );

      const roleId = result.lastID;
      console.log(`✅ Created role: ${role.name} (ID: ${roleId})`);

      // Insert permissions
      for (const permission of role.permissions) {
        await db.run(
          'INSERT INTO role_permissions (role_id, permission) VALUES (?, ?)',
          [roleId, permission]
        );
      }

      console.log(`   └─ Added ${role.permissions.length} permissions`);
    }

    // Create some custom roles for demonstration
    const customRoles = [
      {
        name: 'Analyst',
        description: 'Can view analytics and generate reports',
        permissions: [
          'view_tickets', 'view_analytics', 'export_data', 'view_reports'
        ]
      },
      {
        name: 'Supervisor',
        description: 'Can manage team members and view performance metrics',
        permissions: [
          'view_tickets', 'edit_tickets', 'assign_tickets',
          'view_users', 'edit_users',
          'view_analytics', 'view_reports'
        ]
      }
    ];

    for (const role of customRoles) {
      // Check if role already exists
      const existingRole = await db.get('SELECT id FROM roles WHERE name = ?', [role.name]);
      
      if (existingRole) {
        console.log(`⚠️  Role "${role.name}" already exists, skipping...`);
        continue;
      }

      // Insert role
      const result = await db.run(
        'INSERT INTO roles (name, description, is_system_role) VALUES (?, ?, ?)',
        [role.name, role.description, 0]
      );

      const roleId = result.lastID;
      console.log(`✅ Created custom role: ${role.name} (ID: ${roleId})`);

      // Insert permissions
      for (const permission of role.permissions) {
        await db.run(
          'INSERT INTO role_permissions (role_id, permission) VALUES (?, ?)',
          [roleId, permission]
        );
      }

      console.log(`   └─ Added ${role.permissions.length} permissions`);
    }

    console.log('✅ Role seeding completed successfully!');
    
    // Display summary
    const roleCount = await db.get('SELECT COUNT(*) as count FROM roles');
    const permissionCount = await db.get('SELECT COUNT(*) as count FROM role_permissions');
    
    console.log(`📊 Summary:`);
    console.log(`   - Total roles: ${roleCount.count}`);
    console.log(`   - Total permissions: ${permissionCount.count}`);

  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    throw error;
  }
};

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRoles()
    .then(() => {
      console.log('🎉 Role seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Role seeding failed:', error);
      process.exit(1);
    });
}

export { seedRoles }; 