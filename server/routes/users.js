import express from 'express';
import bcrypt from 'bcryptjs';
import { body, query, validationResult } from 'express-validator';
import { getDatabase } from '../config/database.js';
import { requireAdmin, requireEmployee } from '../middleware/auth.js';
import { createAuditLog } from './audit.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', requireAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isIn(['client', 'employee_l1', 'employee_l2', 'employee_l3', 'admin']),
  query('search').optional().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 50,
      role,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['is_active = 1'];
    let queryParams = [];

    if (role) {
      whereConditions.push(`role = ?`);
      queryParams.push(role);
    }

    if (search) {
      whereConditions.push(`(
        first_name LIKE ? OR 
        last_name LIKE ? OR 
        email LIKE ?
      )`);
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult = await getDatabase().get(countQuery, queryParams);
    const totalCount = countResult.total;

    // Get users
    const usersQuery = `
      SELECT 
        id, email, first_name, last_name, role, company_id, 
        is_active, last_login, created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);
    const users = await getDatabase().all(usersQuery, queryParams);

    res.json({
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        companyId: user.company_id,
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/profile', async (req, res, next) => {
  try {
    const user = await getDatabase().get(
      'SELECT id, email, first_name, last_name, role, company_id, is_active, last_login, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        companyId: user.company_id,
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.patch('/profile', [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email } = req.body;
    const updates = [];
    const values = [];

    if (firstName !== undefined) {
      updates.push(`first_name = ?`);
      values.push(firstName);
    }

    if (lastName !== undefined) {
      updates.push(`last_name = ?`);
      values.push(lastName);
    }

    if (email !== undefined) {
      updates.push(`email = ?`);
      values.push(email);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.user.id);

    const updateQuery = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = ?
    `;

    await getDatabase().run(updateQuery, values);

    // Get updated user
    const updatedUser = await getDatabase().get(
      'SELECT id, email, first_name, last_name, role, company_id, is_active, last_login, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        role: updatedUser.role,
        companyId: updatedUser.company_id,
        isActive: updatedUser.is_active,
        lastLogin: updatedUser.last_login,
        createdAt: updatedUser.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.patch('/password', [
  body('currentPassword').isLength({ min: 6 }),
  body('newPassword').isLength({ min: 6 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const result = await getDatabase().get(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, result.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await getDatabase().run(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, req.user.id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Create new user (admin only)
router.post('/', requireAdmin, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('role').isIn(['client', 'employee_l1', 'employee_l2', 'employee_l3', 'admin'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, role, companyId = 'sealkloud' } = req.body;

    // Check if user already exists
    const existingUser = await getDatabase().get(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await getDatabase().run(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, company_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, firstName, lastName, role, companyId]
    );

    // Get the inserted user
    const user = await getDatabase().get(
      'SELECT id, email, first_name, last_name, role, company_id, is_active, created_at FROM users WHERE id = ?',
      [result.lastID]
    );

    // Create audit log entry
    await createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'USER_CREATED',
      resourceType: 'User',
      resourceId: user.id.toString(),
      resourceName: `${user.first_name} ${user.last_name} (${user.email})`,
      details: `Created new user with role: ${user.role}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'info'
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        companyId: user.company_id,
        isActive: user.is_active,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user (admin only)
router.patch('/:userId', requireAdmin, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['client', 'employee_l1', 'employee_l2', 'employee_l3', 'admin']),
  body('isActive').optional().isBoolean()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { firstName, lastName, email, role, isActive } = req.body;

    // Check if user exists
    const existingUser = await getDatabase().get(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = [];
    const values = [];

    if (firstName !== undefined) {
      updates.push(`first_name = ?`);
      values.push(firstName);
    }

    if (lastName !== undefined) {
      updates.push(`last_name = ?`);
      values.push(lastName);
    }

    if (email !== undefined) {
      updates.push(`email = ?`);
      values.push(email);
    }

    if (role !== undefined) {
      updates.push(`role = ?`);
      values.push(role);
    }

    if (isActive !== undefined) {
      updates.push(`is_active = ?`);
      values.push(isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const updateQuery = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = ?
    `;

    await getDatabase().run(updateQuery, values);

    // Get updated user
    const updatedUser = await getDatabase().get(
      'SELECT id, email, first_name, last_name, role, company_id, is_active, last_login, created_at FROM users WHERE id = ?',
      [userId]
    );

    // Create audit log entry
    const changes = [];
    if (firstName !== undefined) changes.push(`First name: ${firstName}`);
    if (lastName !== undefined) changes.push(`Last name: ${lastName}`);
    if (email !== undefined) changes.push(`Email: ${email}`);
    if (role !== undefined) changes.push(`Role: ${role}`);
    if (isActive !== undefined) changes.push(`Status: ${isActive ? 'Active' : 'Inactive'}`);

    await createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'USER_UPDATED',
      resourceType: 'User',
      resourceId: userId,
      resourceName: `${updatedUser.first_name} ${updatedUser.last_name} (${updatedUser.email})`,
      details: `Updated user: ${changes.join(', ')}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'info'
    });

    res.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        role: updatedUser.role,
        companyId: updatedUser.company_id,
        isActive: updatedUser.is_active,
        lastLogin: updatedUser.last_login,
        createdAt: updatedUser.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete user (admin only)
router.delete('/:userId', requireAdmin, async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const existingUser = await getDatabase().get(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user info before deletion for audit log
    const userToDelete = await getDatabase().get(
      'SELECT first_name, last_name, email FROM users WHERE id = ?',
      [userId]
    );

    // Soft delete by setting is_active to false
    await getDatabase().run(
      'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );

    // Create audit log entry
    await createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'USER_DELETED',
      resourceType: 'User',
      resourceId: userId,
      resourceName: `${userToDelete.first_name} ${userToDelete.last_name} (${userToDelete.email})`,
      details: 'User account deactivated',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'warning'
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export { router as userRoutes };