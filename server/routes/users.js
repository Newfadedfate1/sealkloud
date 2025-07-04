import express from 'express';
import bcrypt from 'bcryptjs';
import { body, query, validationResult } from 'express-validator';
import { pool } from '../config/database.js';
import { requireAdmin, requireEmployee } from '../middleware/auth.js';

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
    let whereConditions = ['is_active = true'];
    let queryParams = [];
    let paramCount = 0;

    if (role) {
      whereConditions.push(`role = $${++paramCount}`);
      queryParams.push(role);
    }

    if (search) {
      whereConditions.push(`(
        first_name ILIKE $${++paramCount} OR 
        last_name ILIKE $${++paramCount} OR 
        email ILIKE $${++paramCount}
      )`);
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
      paramCount += 2;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const usersQuery = `
      SELECT 
        id, email, first_name, last_name, role, company_id, 
        is_active, last_login, created_at,
        COUNT(*) OVER() as total_count
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;

    queryParams.push(limit, offset);

    const result = await pool.query(usersQuery, queryParams);
    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    res.json({
      users: result.rows.map(user => ({
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
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role, company_id, is_active, last_login, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
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
    let paramCount = 0;

    if (firstName !== undefined) {
      updates.push(`first_name = $${++paramCount}`);
      values.push(firstName);
    }

    if (lastName !== undefined) {
      updates.push(`last_name = $${++paramCount}`);
      values.push(lastName);
    }

    if (email !== undefined) {
      updates.push(`email = $${++paramCount}`);
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
      WHERE id = $${++paramCount}
      RETURNING id, email, first_name, last_name, role, company_id, is_active, last_login, created_at
    `;

    const result = await pool.query(updateQuery, values);
    const updatedUser = result.rows[0];

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
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Update user role (admin only)
router.patch('/:userId/role', requireAdmin, [
  body('role').isIn(['client', 'employee_l1', 'employee_l2', 'employee_l3', 'admin'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { role } = req.body;

    // Prevent self-demotion from admin
    if (parseInt(userId) === req.user.id && req.user.role === 'admin' && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot change your own admin role' });
    }

    const result = await pool.query(
      `UPDATE users 
       SET role = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, email, first_name, last_name, role, company_id, is_active`,
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = result.rows[0];
    res.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        role: updatedUser.role,
        companyId: updatedUser.company_id,
        isActive: updatedUser.is_active
      }
    });
  } catch (error) {
    next(error);
  }
});

// Deactivate user (admin only)
router.patch('/:userId/deactivate', requireAdmin, async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Prevent self-deactivation
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const result = await pool.query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    next(error);
  }
});

export { router as userRoutes };