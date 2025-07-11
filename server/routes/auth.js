import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { createAuditLog } from './audit.js';

const router = express.Router();

// Login endpoint
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid email or password format' });
    }

    const { email, password } = req.body;

    // Find user by email
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Create audit log entry for successful login
    await createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'LOGIN_SUCCESS',
      resourceType: 'Auth',
      resourceId: user.id.toString(),
      resourceName: `${user.first_name} ${user.last_name}`,
      details: 'User logged in successfully',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'info'
    });

    // Return user data (excluding password)
    const { password_hash, ...userData } = user;
    res.json({
      token,
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
        companyId: userData.company_id,
        isActive: userData.is_active,
        lastLogin: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Register endpoint (for admin use)
router.post('/register', [
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

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, company_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [email, passwordHash, firstName, lastName, role, companyId]
    );

    const userId = result.rows[0].id;

    // Get the inserted user
    const userResult = await query(
      'SELECT id, email, first_name, last_name, role, company_id, is_active, created_at FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        companyId: user.company_id,
        isActive: user.is_active
      }
    });
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };