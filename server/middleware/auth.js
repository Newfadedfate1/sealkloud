import jwt from 'jsonwebtoken';
import { getDatabase } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded JWT:', decoded);
    // Verify user still exists and is active (PostgreSQL style)
    const result = await getDatabase().query(
      'SELECT id, email, first_name, last_name, role, company_id, is_active FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );
    const user = result.rows[0];
    console.log('Authenticated user:', user);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireEmployee = requireRole(['employee_l1', 'employee_l2', 'employee_l3', 'admin']);

// Audit logging function
export const logAuditEvent = async (req, action, resourceType, resourceId, resourceName, details) => {
  try {
    const db = getDatabase();
    await db.run(`
      INSERT INTO audit_logs (user_id, user_email, action, resource_type, resource_id, resource_name, details, ip_address, user_agent, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      req.user?.id || null,
      req.user?.email || 'system',
      action,
      resourceType,
      resourceId,
      resourceName,
      details,
      req.ip || req.connection?.remoteAddress || 'unknown',
      req.get('User-Agent') || 'unknown'
    ]);
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
};