import express from 'express';
import { getDatabase } from '../config/database.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res, next) => {
  try {
    // Get ticket statistics
    const ticketStatsResult = await getDatabase().get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'unassigned' THEN 1 ELSE 0 END) as unassigned,
        SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
      FROM tickets
    `);

    // Get client ticket distribution (for pie chart)
    const clientDistributionResult = await getDatabase().all(`
      SELECT 
        client_name,
        COUNT(*) as ticket_count
      FROM tickets 
      WHERE status NOT IN ('resolved', 'closed')
      GROUP BY client_name
      ORDER BY ticket_count DESC
    `);

    const totalOpenTickets = clientDistributionResult.reduce((sum, row) => sum + parseInt(row.ticket_count), 0);
    
    const clientData = clientDistributionResult.map(row => ({
      clientName: row.client_name,
      ticketCount: parseInt(row.ticket_count),
      percentage: totalOpenTickets > 0 ? (parseInt(row.ticket_count) / totalOpenTickets) * 100 : 0
    }));

    // Get user statistics (admin only)
    let userStats = null;
    if (req.user.role === 'admin') {
      const userStatsResult = await getDatabase().get(`
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN role = 'client' THEN 1 ELSE 0 END) as clients,
          SUM(CASE WHEN role LIKE 'employee_%' THEN 1 ELSE 0 END) as employees,
          SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
          SUM(CASE WHEN last_login > datetime('now', '-24 hours') THEN 1 ELSE 0 END) as recent_logins
        FROM users
      `);
      userStats = userStatsResult;
    }

    // Get personal stats for employees
    let personalStats = null;
    if (req.user.role.startsWith('employee_') || req.user.role === 'admin') {
      const personalStatsResult = await getDatabase().get(`
        SELECT 
          COUNT(*) as assigned_tickets,
          SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'resolved' AND date(resolved_date) = date('now') THEN 1 ELSE 0 END) as resolved_today,
          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as pending
        FROM tickets 
        WHERE assigned_to = ?
      `, [req.user.id]);
      personalStats = personalStatsResult;
    }

    res.json({
      ticketStats: {
        total: parseInt(ticketStatsResult.total),
        open: parseInt(ticketStatsResult.open),
        unassigned: parseInt(ticketStatsResult.unassigned),
        inProgress: parseInt(ticketStatsResult.in_progress),
        resolved: parseInt(ticketStatsResult.resolved),
        closed: parseInt(ticketStatsResult.closed)
      },
      clientData,
      userStats: userStats ? {
        totalUsers: parseInt(userStats.total_users),
        clients: parseInt(userStats.clients),
        employees: parseInt(userStats.employees),
        admins: parseInt(userStats.admins),
        activeUsers: parseInt(userStats.active_users),
        recentLogins: parseInt(userStats.recent_logins)
      } : null,
      personalStats: personalStats ? {
        assignedTickets: parseInt(personalStats.assigned_tickets),
        inProgress: parseInt(personalStats.in_progress),
        resolvedToday: parseInt(personalStats.resolved_today),
        pending: parseInt(personalStats.pending)
      } : null
    });
  } catch (error) {
    next(error);
  }
});

// Get recent activity
router.get('/activity', async (req, res, next) => {
  try {
    const limit = req.query.limit || 20;
    
    let activityQuery = `
      SELECT 
        ta.action,
        ta.description,
        ta.timestamp,
        u.first_name || ' ' || u.last_name as user_name,
        t.ticket_id,
        t.title as ticket_title
      FROM ticket_activities ta
      JOIN users u ON ta.user_id = u.id
      JOIN tickets t ON ta.ticket_id = t.id
    `;

    const queryParams = [];
    
    // Role-based filtering
    if (req.user.role === 'client') {
      activityQuery += ' WHERE t.client_id = ?';
      queryParams.push(req.user.id);
    } else if (req.user.role.startsWith('employee_')) {
      activityQuery += ' WHERE (t.assigned_to = ? OR ta.user_id = ?)';
      queryParams.push(req.user.id, req.user.id);
    }

    activityQuery += ` ORDER BY ta.timestamp DESC LIMIT ?`;
    queryParams.push(limit);

    const result = await getDatabase().all(activityQuery, queryParams);

    res.json({
      activities: result.map(row => ({
        action: row.action,
        description: row.description,
        timestamp: row.timestamp,
        userName: row.user_name,
        ticketId: row.ticket_id,
        ticketTitle: row.ticket_title
      }))
    });
  } catch (error) {
    next(error);
  }
});

export { router as dashboardRoutes };