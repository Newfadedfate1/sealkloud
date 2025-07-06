import { initializeDatabase, getDatabase } from './config/database.js';

async function testRoleCreation() {
  try {
    console.log('🔧 Initializing database...');
    await initializeDatabase();
    
    console.log('✅ Database initialized successfully');
    
    const db = getDatabase();
    
    // Test creating a simple role
    console.log('🧪 Testing role creation...');
    
    const result = await db.run(
      'INSERT INTO roles (name, description, is_system_role) VALUES (?, ?, ?)',
      ['Test Role', 'A test role for verification', 0]
    );
    
    const roleId = result.lastID;
    console.log(`✅ Created test role with ID: ${roleId}`);
    
    // Add some permissions
    const permissions = ['view_tickets', 'edit_tickets'];
    for (const permission of permissions) {
      await db.run(
        'INSERT INTO role_permissions (role_id, permission) VALUES (?, ?)',
        [roleId, permission]
      );
    }
    
    console.log(`✅ Added ${permissions.length} permissions to test role`);
    
    // Verify the role was created
    const role = await db.get(
      'SELECT r.*, GROUP_CONCAT(rp.permission) as permissions FROM roles r LEFT JOIN role_permissions rp ON r.id = rp.role_id WHERE r.id = ? GROUP BY r.id',
      [roleId]
    );
    
    console.log('📋 Role details:', {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions ? role.permissions.split(',') : []
    });
    
    // Clean up - delete the test role
    await db.run('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);
    await db.run('DELETE FROM roles WHERE id = ?', [roleId]);
    console.log('🧹 Cleaned up test role');
    
    console.log('🎉 Role creation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing role creation:', error);
  }
}

testRoleCreation(); 