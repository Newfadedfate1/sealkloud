import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res, next) => {
  try {
    // Get ticket statistics
    const ticketStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'open') as open,
        COUNT(*) FILTER (WHERE status = 'unassigned') as unassigned,
        COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
        COUNT(*) FILTER (WHERE status = 'closed') as closed
      FROM tickets
    `);

    // Get client ticket distribution (for pie chart)
    const clientDistributionResult = await pool.query(`
      SELECT 
        client_name,
        COUNT(*) as ticket_count
      FROM tickets 
      WHERE status NOT IN ('resolved', 'closed')
      GROUP BY client_name
      ORDER BY ticket_count DESC
    `);

    const totalOpenTickets = clientDistributionResult.rows.reduce((sum, row) => sum + parseInt(row.ticket_count), 0);
    
    const clientData = clientDistributionResult.rows.map(row => ({
      clientName: row.client_name,
      ticketCount: parseInt(row.ticket_count),
      percentage: totalOpenTickets > 0 ? (parseInt(row.ticket_count) / totalOpenTickets) * 100 : 0
    }));

    // Get user statistics (admin only)
    let userStats = null;
    if (req.user.role === 'admin') {
      const userStatsResult = await pool.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE role = 'client') as clients,
          COUNT(*) FILTER (WHERE role LIKE 'employee_%') as employees,
          COUNT(*) FILTER (WHERE role = 'admin') as admins,
          COUNT(*) FILTER (WHERE is_active = true) as active_users,
          COUNT(*) FILTER (WHERE last_login > NOW() - INTERVAL '24 hours') as recent_logins
        FROM users
      `);
      userStats = userStatsResult.rows[0];
    }

    // Get personal stats for employees
    let personalStats = null;
    if (req.user.role.startsWith('employee_') || req.user.role === 'admin') {
      const personalStatsResult = await pool.query(`
        SELECT 
          COUNT(*) as assigned_tickets,
          COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress,
          COUNT(*) FILTER (WHERE status = 'resolved' AND resolved_date::date = CURRENT_DATE) as resolved_today,
          COUNT(*) FILTER (WHERE status = 'open') as pending
        FROM tickets 
        WHERE assigned_to = $1
      `, [req.user.id]);
      personalStats = personalStatsResult.rows[0];
    }

    res.json({
      ticketStats: {
        total: parseInt(ticketStatsResult.rows[0].total),
        open: parseInt(ticketStatsResult.rows[0].open),
        unassigned: parseInt(ticketStatsResult.rows[0].unassigned),
        inProgress: parseInt(ticketStatsResult.rows[0].in_progress),
        resolved: parseInt(ticketStatsResult.rows[0].resolved),
        closed: parseInt(ticketStatsResult.rows[0].closed)
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
      activityQuery += ' WHERE t.client_id = $1';
      queryParams.push(req.user.id);
    } else if (req.user.role.startsWith('employee_')) {
      activityQuery += ' WHERE (t.assigned_to = $1 OR ta.user_id = $1)';
      queryParams.push(req.user.id);
    }

    activityQuery += ` ORDER BY ta.timestamp DESC LIMIT $${queryParams.length + 1}`;
    queryParams.push(limit);

    const result = await pool.query(activityQuery, queryParams);

    res.json({
      activities: result.rows.map(row => ({
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