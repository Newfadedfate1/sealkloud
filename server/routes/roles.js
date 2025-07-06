import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { getDatabase } from '../config/database.js';
import { logAuditEvent } from '../middleware/auth.js';

const router = express.Router();

// Get all roles with optional filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('include_permissions').optional().isBoolean(),
  query('include_users').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        success: false, 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const { page = 1, limit = 20, search, include_permissions = false, include_users = false } = req.query;
    const offset = (page - 1) * limit;
    const db = getDatabase();

    let whereClause = '';
    let queryParams = [];

    if (search) {
      whereClause = 'WHERE r.name LIKE ? OR r.description LIKE ?';
      queryParams = [`%${search}%`, `%${search}%`];
    }

    // Get roles with count
    const countQuery = `SELECT COUNT(*) as total FROM roles r ${whereClause}`;
    const countResult = await db.get(countQuery, queryParams);
    const total = countResult.total;

    // Get roles
    let rolesQuery = `
      SELECT r.id, r.name, r.description, r.is_system_role, r.created_at, r.updated_at
      FROM roles r
      ${whereClause}
      ORDER BY r.is_system_role DESC, r.name ASC
      LIMIT ? OFFSET ?
    `;
    
    const roles = await db.all(rolesQuery, [...queryParams, limit, offset]);

    // Include permissions if requested
    if (include_permissions) {
      for (const role of roles) {
        const permissions = await db.all(
          'SELECT permission FROM role_permissions WHERE role_id = ? ORDER BY permission',
          [role.id]
        );
        role.permissions = permissions.map(p => p.permission);
      }
    }

    // Include user count if requested
    if (include_users) {
      for (const role of roles) {
        const userCount = await db.get(
          'SELECT COUNT(*) as count FROM user_roles WHERE role_id = ?',
          [role.id]
        );
        role.user_count = userCount.count;
      }
    }

    res.json({
      success: true,
      data: {
        roles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Failed to fetch roles' } 
    });
  }
});

// Get single role by ID
router.get('/:id', [
  param('id').isInt({ min: 1 }),
  query('include_permissions').optional().isBoolean(),
  query('include_users').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        success: false, 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const { id } = req.params;
    const { include_permissions = true, include_users = false } = req.query;
    const db = getDatabase();

    const role = await db.get(
      'SELECT id, name, description, is_system_role, created_at, updated_at FROM roles WHERE id = ?',
      [id]
    );

    if (!role) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Role not found' } 
      });
    }

    // Include permissions
    if (include_permissions) {
      const permissions = await db.all(
        'SELECT permission FROM role_permissions WHERE role_id = ? ORDER BY permission',
        [id]
      );
      role.permissions = permissions.map(p => p.permission);
    }

    // Include users
    if (include_users) {
      const users = await db.all(`
        SELECT u.id, u.email, u.first_name, u.last_name, ur.assigned_at
        FROM user_roles ur
        JOIN users u ON ur.user_id = u.id
        WHERE ur.role_id = ?
        ORDER BY u.first_name, u.last_name
      `, [id]);
      role.users = users;
    }

    res.json({ success: true, data: role });

  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Failed to fetch role' } 
    });
  }
});

// Create new role
router.post('/', [
  body('name').isString().trim().isLength({ min: 1, max: 50 }),
  body('description').optional().isString().trim().isLength({ max: 200 }),
  body('permissions').isArray(),
  body('permissions.*').isString().isIn([
    'view_tickets', 'edit_tickets', 'assign_tickets', 'delete_tickets',
    'view_users', 'edit_users', 'delete_users', 'manage_roles',
    'view_audit_logs', 'manage_settings', 'view_analytics', 'export_data',
    'manage_workflows', 'view_reports', 'manage_integrations'
  ]),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        success: false, 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const { name, description, permissions } = req.body;
    const db = getDatabase();

    // Check if role name already exists
    const existingRole = await db.get('SELECT id FROM roles WHERE name = ?', [name]);
    if (existingRole) {
      return res.status(409).json({ 
        success: false, 
        error: { message: 'Role name already exists' } 
      });
    }

    // Create role
    const result = await db.run(
      'INSERT INTO roles (name, description) VALUES (?, ?)',
      [name, description || '']
    );

    const roleId = result.lastID;

    // Add permissions
    for (const permission of permissions) {
      await db.run(
        'INSERT INTO role_permissions (role_id, permission) VALUES (?, ?)',
        [roleId, permission]
      );
    }

    // Get created role
    const role = await db.get(
      'SELECT id, name, description, is_system_role, created_at, updated_at FROM roles WHERE id = ?',
      [roleId]
    );

    // Log audit event
    await logAuditEvent(req, 'CREATE', 'role', roleId.toString(), name, `Created role with ${permissions.length} permissions`);

    res.status(201).json({ success: true, data: role });

  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Failed to create role' } 
    });
  }
});

// Update role
router.put('/:id', [
  param('id').isInt({ min: 1 }),
  body('name').optional().isString().trim().isLength({ min: 1, max: 50 }),
  body('description').optional().isString().trim().isLength({ max: 200 }),
  body('permissions').optional().isArray(),
  body('permissions.*').isString().isIn([
    'view_tickets', 'edit_tickets', 'assign_tickets', 'delete_tickets',
    'view_users', 'edit_users', 'delete_users', 'manage_roles',
    'view_audit_logs', 'manage_settings', 'view_analytics', 'export_data',
    'manage_workflows', 'view_reports', 'manage_integrations'
  ]),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        success: false, 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const { id } = req.params;
    const { name, description, permissions } = req.body;
    const db = getDatabase();

    // Check if role exists
    const existingRole = await db.get('SELECT id, name, is_system_role FROM roles WHERE id = ?', [id]);
    if (!existingRole) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Role not found' } 
      });
    }

    // Prevent editing system roles
    if (existingRole.is_system_role) {
      return res.status(403).json({ 
        success: false, 
        error: { message: 'Cannot modify system roles' } 
      });
    }

    // Check if new name conflicts with existing role
    if (name && name !== existingRole.name) {
      const nameConflict = await db.get('SELECT id FROM roles WHERE name = ? AND id != ?', [name, id]);
      if (nameConflict) {
        return res.status(409).json({ 
          success: false, 
          error: { message: 'Role name already exists' } 
        });
      }
    }

    // Update role
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.run(
      `UPDATE roles SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Update permissions if provided
    if (permissions !== undefined) {
      // Remove existing permissions
      await db.run('DELETE FROM role_permissions WHERE role_id = ?', [id]);
      
      // Add new permissions
      for (const permission of permissions) {
        await db.run(
          'INSERT INTO role_permissions (role_id, permission) VALUES (?, ?)',
          [id, permission]
        );
      }
    }

    // Get updated role
    const role = await db.get(
      'SELECT id, name, description, is_system_role, created_at, updated_at FROM roles WHERE id = ?',
      [id]
    );

    // Log audit event
    const changes = [];
    if (name !== undefined) changes.push(`Name: ${name}`);
    if (description !== undefined) changes.push(`Description: ${description}`);
    if (permissions !== undefined) changes.push(`Permissions: ${permissions.length} total`);
    
    await logAuditEvent(req, 'UPDATE', 'role', id, role.name, `Updated role: ${changes.join(', ')}`);

    res.json({ success: true, data: role });

  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Failed to update role' } 
    });
  }
});

// Delete role
router.delete('/:id', [
  param('id').isInt({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        success: false, 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const { id } = req.params;
    const db = getDatabase();

    // Check if role exists
    const role = await db.get('SELECT id, name, is_system_role FROM roles WHERE id = ?', [id]);
    if (!role) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Role not found' } 
      });
    }

    // Prevent deleting system roles
    if (role.is_system_role) {
      return res.status(403).json({ 
        success: false, 
        error: { message: 'Cannot delete system roles' } 
      });
    }

    // Check if role is assigned to any users
    const userCount = await db.get('SELECT COUNT(*) as count FROM user_roles WHERE role_id = ?', [id]);
    if (userCount.count > 0) {
      return res.status(409).json({ 
        success: false, 
        error: { message: `Cannot delete role: ${userCount.count} users are assigned to this role` } 
      });
    }

    // Delete role (permissions will be deleted via CASCADE)
    await db.run('DELETE FROM roles WHERE id = ?', [id]);

    // Log audit event
    await logAuditEvent(req, 'DELETE', 'role', id, role.name, 'Deleted role');

    res.json({ success: true, message: 'Role deleted successfully' });

  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Failed to delete role' } 
    });
  }
});

// Get all available permissions
router.get('/permissions/list', async (req, res) => {
  try {
    const permissions = [
      { name: 'view_tickets', description: 'View tickets', category: 'Tickets' },
      { name: 'edit_tickets', description: 'Edit ticket details', category: 'Tickets' },
      { name: 'assign_tickets', description: 'Assign tickets to users', category: 'Tickets' },
      { name: 'delete_tickets', description: 'Delete tickets', category: 'Tickets' },
      { name: 'view_users', description: 'View user list', category: 'Users' },
      { name: 'edit_users', description: 'Edit user details', category: 'Users' },
      { name: 'delete_users', description: 'Delete users', category: 'Users' },
      { name: 'manage_roles', description: 'Manage roles and permissions', category: 'Administration' },
      { name: 'view_audit_logs', description: 'View audit logs', category: 'Administration' },
      { name: 'manage_settings', description: 'Manage system settings', category: 'Administration' },
      { name: 'view_analytics', description: 'View analytics and reports', category: 'Analytics' },
      { name: 'export_data', description: 'Export data and reports', category: 'Analytics' },
      { name: 'manage_workflows', description: 'Manage workflow automation', category: 'Automation' },
      { name: 'view_reports', description: 'View system reports', category: 'Reports' },
      { name: 'manage_integrations', description: 'Manage system integrations', category: 'Integrations' },
    ];

    res.json({ success: true, data: permissions });

  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Failed to fetch permissions' } 
    });
  }
});

// Assign role to user
router.post('/:id/assign', [
  param('id').isInt({ min: 1 }),
  body('user_id').isInt({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        success: false, 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const { id: roleId } = req.params;
    const { user_id } = req.body;
    const db = getDatabase();

    // Check if role exists
    const role = await db.get('SELECT id, name FROM roles WHERE id = ?', [roleId]);
    if (!role) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Role not found' } 
      });
    }

    // Check if user exists
    const user = await db.get('SELECT id, email, first_name, last_name FROM users WHERE id = ?', [user_id]);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'User not found' } 
      });
    }

    // Check if role is already assigned
    const existingAssignment = await db.get('SELECT id FROM user_roles WHERE user_id = ? AND role_id = ?', [user_id, roleId]);
    if (existingAssignment) {
      return res.status(409).json({ 
        success: false, 
        error: { message: 'Role is already assigned to this user' } 
      });
    }

    // Assign role
    await db.run(
      'INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES (?, ?, ?)',
      [user_id, roleId, req.user?.id]
    );

    // Log audit event
    await logAuditEvent(req, 'ASSIGN', 'role', roleId.toString(), role.name, `Assigned role to user: ${user.email}`);

    res.status(201).json({ 
      success: true, 
      message: `Role "${role.name}" assigned to ${user.first_name} ${user.last_name}` 
    });

  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Failed to assign role' } 
    });
  }
});

// Remove role from user
router.delete('/:id/assign/:userId', [
  param('id').isInt({ min: 1 }),
  param('userId').isInt({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        success: false, 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const { id: roleId, userId } = req.params;
    const db = getDatabase();

    // Check if assignment exists
    const assignment = await db.get(`
      SELECT ur.id, r.name, u.email, u.first_name, u.last_name 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      JOIN users u ON ur.user_id = u.id
      WHERE ur.role_id = ? AND ur.user_id = ?
    `, [roleId, userId]);

    if (!assignment) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Role assignment not found' } 
      });
    }

    // Remove assignment
    await db.run('DELETE FROM user_roles WHERE role_id = ? AND user_id = ?', [roleId, userId]);

    // Log audit event
    await logAuditEvent(req, 'UNASSIGN', 'role', roleId.toString(), assignment.name, `Removed role from user: ${assignment.email}`);

    res.json({ 
      success: true, 
      message: `Role "${assignment.name}" removed from ${assignment.first_name} ${assignment.last_name}` 
    });

  } catch (error) {
    console.error('Error removing role assignment:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Failed to remove role assignment' } 
    });
  }
});

export default router; 