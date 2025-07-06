import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { getDatabase } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create audit log entry (internal use)
export const createAuditLog = async (data) => {
  try {
    const {
      userId,
      userEmail,
      action,
      resourceType,
      resourceId,
      resourceName,
      details,
      ipAddress,
      userAgent,
      severity = 'info'
    } = data;

    const result = await getDatabase().run(
      `INSERT INTO audit_logs (
        user_id, user_email, action, resource_type, resource_id, 
        resource_name, details, ip_address, user_agent, severity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, userEmail, action, resourceType, resourceId, resourceName, details, ipAddress, userAgent, severity]
    );

    return result.lastID;
  } catch (error) {
    console.error('Error creating audit log:', error);
    throw error;
  }
};

// Get audit logs (admin only)
router.get('/', requireAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('action').optional().trim(),
  query('resourceType').optional().trim(),
  query('severity').optional().isIn(['info', 'warning', 'error', 'critical']),
  query('userEmail').optional().trim(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
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
      action,
      resourceType,
      severity,
      userEmail,
      startDate,
      endDate,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['1=1'];
    let queryParams = [];

    if (action) {
      whereConditions.push(`action = ?`);
      queryParams.push(action);
    }

    if (resourceType) {
      whereConditions.push(`resource_type = ?`);
      queryParams.push(resourceType);
    }

    if (severity) {
      whereConditions.push(`severity = ?`);
      queryParams.push(severity);
    }

    if (userEmail) {
      whereConditions.push(`user_email LIKE ?`);
      queryParams.push(`%${userEmail}%`);
    }

    if (startDate) {
      whereConditions.push(`timestamp >= ?`);
      queryParams.push(startDate);
    }

    if (endDate) {
      whereConditions.push(`timestamp <= ?`);
      queryParams.push(endDate);
    }

    if (search) {
      whereConditions.push(`(
        user_email LIKE ? OR 
        action LIKE ? OR 
        resource_type LIKE ? OR 
        resource_name LIKE ? OR 
        details LIKE ?
      )`);
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`;
    const countResult = await getDatabase().get(countQuery, queryParams);
    const totalCount = countResult.total;

    // Get audit logs
    const logsQuery = `
      SELECT 
        id, user_id, user_email, action, resource_type, resource_id,
        resource_name, details, ip_address, user_agent, severity, timestamp
      FROM audit_logs
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);
    const logs = await getDatabase().all(logsQuery, queryParams);

    // Get unique actions and resource types for filters
    const actionsQuery = `SELECT DISTINCT action FROM audit_logs ORDER BY action`;
    const resourceTypesQuery = `SELECT DISTINCT resource_type FROM audit_logs ORDER BY resource_type`;
    
    const actions = await getDatabase().all(actionsQuery);
    const resourceTypes = await getDatabase().all(resourceTypesQuery);

    res.json({
      logs: logs.map(log => ({
        id: log.id,
        userId: log.user_id,
        userEmail: log.user_email,
        action: log.action,
        resourceType: log.resource_type,
        resourceId: log.resource_id,
        resourceName: log.resource_name,
        details: log.details,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        severity: log.severity,
        timestamp: log.timestamp
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      filters: {
        actions: actions.map(a => a.action),
        resourceTypes: resourceTypes.map(rt => rt.resource_type)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get audit log statistics
router.get('/stats', requireAdmin, async (req, res, next) => {
  try {
    // Get total logs
    const totalResult = await getDatabase().get('SELECT COUNT(*) as total FROM audit_logs');
    
    // Get logs by severity
    const severityResult = await getDatabase().all(`
      SELECT severity, COUNT(*) as count 
      FROM audit_logs 
      GROUP BY severity
    `);
    
    // Get logs by action (top 10)
    const actionResult = await getDatabase().all(`
      SELECT action, COUNT(*) as count 
      FROM audit_logs 
      GROUP BY action 
      ORDER BY count DESC 
      LIMIT 10
    `);
    
    // Get recent activity (last 24 hours)
    const recentResult = await getDatabase().get(`
      SELECT COUNT(*) as count 
      FROM audit_logs 
      WHERE timestamp >= datetime('now', '-24 hours')
    `);
    
    // Get logs by resource type
    const resourceTypeResult = await getDatabase().all(`
      SELECT resource_type, COUNT(*) as count 
      FROM audit_logs 
      GROUP BY resource_type 
      ORDER BY count DESC
    `);

    res.json({
      total: totalResult.total,
      bySeverity: severityResult.reduce((acc, item) => {
        acc[item.severity] = item.count;
        return acc;
      }, {}),
      byAction: actionResult,
      recentActivity: recentResult.count,
      byResourceType: resourceTypeResult
    });
  } catch (error) {
    next(error);
  }
});

// Export audit logs (admin only)
router.get('/export', requireAdmin, [
  query('format').optional().isIn(['csv', 'json']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { format = 'json', startDate, endDate } = req.query;

    let whereConditions = ['1=1'];
    let queryParams = [];

    if (startDate) {
      whereConditions.push(`timestamp >= ?`);
      queryParams.push(startDate);
    }

    if (endDate) {
      whereConditions.push(`timestamp <= ?`);
      queryParams.push(endDate);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const logsQuery = `
      SELECT 
        id, user_email, action, resource_type, resource_name,
        details, ip_address, severity, timestamp
      FROM audit_logs
      ${whereClause}
      ORDER BY timestamp DESC
    `;

    const logs = await getDatabase().all(logsQuery, queryParams);

    if (format === 'csv') {
      const csvHeader = 'ID,User Email,Action,Resource Type,Resource Name,Details,IP Address,Severity,Timestamp\n';
      const csvData = logs.map(log => 
        `${log.id},"${log.user_email}","${log.action}","${log.resource_type}","${log.resource_name || ''}","${log.details || ''}","${log.ip_address || ''}","${log.severity}","${log.timestamp}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
      res.send(csvHeader + csvData);
    } else {
      res.json({ logs });
    }
  } catch (error) {
    next(error);
  }
});

export { router as auditRoutes }; 