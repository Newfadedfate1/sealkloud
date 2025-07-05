import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { getDatabase } from '../config/database.js';
import { requireEmployee, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all tickets with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['open', 'unassigned', 'in-progress', 'resolved', 'closed']),
  query('problemLevel').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('assignedTo').optional().isInt(),
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
      status,
      problemLevel,
      assignedTo,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Build dynamic WHERE clause
    if (status) {
      whereConditions.push(`t.status = ?`);
      queryParams.push(status);
    }

    if (problemLevel) {
      whereConditions.push(`t.problem_level = ?`);
      queryParams.push(problemLevel);
    }

    if (assignedTo) {
      whereConditions.push(`t.assigned_to = ?`);
      queryParams.push(assignedTo);
    }

    if (search) {
      whereConditions.push(`(
        t.title LIKE ? OR 
        t.description LIKE ? OR 
        t.client_name LIKE ? OR
        t.ticket_id LIKE ?
      )`);
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Role-based filtering
    if (req.user.role === 'client') {
      whereConditions.push(`t.client_id = ?`);
      queryParams.push(req.user.id);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM tickets t ${whereClause}`;
    const countResult = await getDatabase().get(countQuery, queryParams);
    const total = countResult.total;

    // Get tickets with user information
    const ticketsQuery = `
      SELECT 
        t.*,
        u.first_name || ' ' || u.last_name as assigned_to_name
      FROM tickets t
      LEFT JOIN users u ON t.assigned_to = u.id
      ${whereClause}
      ORDER BY t.last_updated DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);

    const result = await getDatabase().all(ticketsQuery, queryParams);

    res.json({
      tickets: result.map(row => ({
        id: row.ticket_id,
        clientName: row.client_name,
        clientId: row.client_id,
        title: row.title,
        description: row.description,
        problemLevel: row.problem_level,
        status: row.status,
        assignedTo: row.assigned_to,
        assignedToName: row.assigned_to_name,
        submittedDate: row.submitted_date,
        lastUpdated: row.last_updated,
        resolvedDate: row.resolved_date
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single ticket with activity log
router.get('/:ticketId', async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    // Get ticket details
    const ticket = await getDatabase().get(`
      SELECT 
        t.*,
        u.first_name || ' ' || u.last_name as assigned_to_name,
        c.first_name || ' ' || c.last_name as client_full_name
      FROM tickets t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.client_id = c.id
      WHERE t.ticket_id = ?
    `, [ticketId]);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Role-based access control
    if (req.user.role === 'client' && ticket.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get activity log
    const activities = await getDatabase().all(`
      SELECT 
        ta.*,
        u.first_name || ' ' || u.last_name as user_name
      FROM ticket_activities ta
      LEFT JOIN users u ON ta.user_id = u.id
      WHERE ta.ticket_id = ?
      ORDER BY ta.timestamp DESC
    `, [ticket.id]);

    res.json({
      ticket: {
        id: ticket.ticket_id,
        clientName: ticket.client_name,
        clientId: ticket.client_id,
        title: ticket.title,
        description: ticket.description,
        problemLevel: ticket.problem_level,
        status: ticket.status,
        assignedTo: ticket.assigned_to,
        assignedToName: ticket.assigned_to_name,
        submittedDate: ticket.submitted_date,
        lastUpdated: ticket.last_updated,
        resolvedDate: ticket.resolved_date
      },
      activityLog: activities.map(activity => ({
        id: activity.id,
        userId: activity.user_id,
        userName: activity.user_name,
        action: activity.action,
        description: activity.description,
        timestamp: activity.timestamp
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Create new ticket
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 500 }),
  body('description').trim().isLength({ min: 1 }),
  body('problemLevel').isIn(['low', 'medium', 'high', 'critical']),
  body('clientName').optional().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, problemLevel, clientName } = req.body;

    // Generate ticket ID
    const countResult = await getDatabase().get('SELECT COUNT(*) as count FROM tickets');
    const ticketCount = countResult.count + 1;
    const ticketId = `TK-${ticketCount.toString().padStart(3, '0')}`;

    // Determine client info
    let finalClientName = clientName;
    let clientId = req.user.id;

    if (req.user.role === 'client') {
      finalClientName = `${req.user.first_name} ${req.user.last_name}`;
    }

    // Insert ticket
    const result = await getDatabase().run(`
      INSERT INTO tickets (ticket_id, client_name, client_id, title, description, problem_level, status)
      VALUES (?, ?, ?, ?, ?, ?, 'unassigned')
    `, [ticketId, finalClientName, clientId, title, description, problemLevel]);

    // Get the inserted ticket
    const ticket = await getDatabase().get('SELECT * FROM tickets WHERE id = ?', [result.lastID]);

    // Log activity
    await getDatabase().run(`
      INSERT INTO ticket_activities (ticket_id, user_id, action, description)
      VALUES (?, ?, 'created', 'Ticket created')
    `, [ticket.id, req.user.id]);

    res.status(201).json({
      ticket: {
        id: ticket.ticket_id,
        clientName: ticket.client_name,
        clientId: ticket.client_id,
        title: ticket.title,
        description: ticket.description,
        problemLevel: ticket.problem_level,
        status: ticket.status,
        submittedDate: ticket.submitted_date,
        lastUpdated: ticket.last_updated
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update ticket (assign, change status, etc.)
router.patch('/:ticketId', requireEmployee, [
  body('status').optional().isIn(['open', 'unassigned', 'in-progress', 'resolved', 'closed']),
  body('assignedTo').optional().isInt(),
  body('problemLevel').optional().isIn(['low', 'medium', 'high', 'critical'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ticketId } = req.params;
    const { status, assignedTo, problemLevel } = req.body;

    // Get current ticket
    const ticket = await getDatabase().get(
      'SELECT * FROM tickets WHERE ticket_id = ?',
      [ticketId]
    );

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const updates = [];
    const values = [];

    // Build dynamic update query
    if (status !== undefined) {
      updates.push(`status = ?`);
      values.push(status);

      // Log status change
      await getDatabase().run(`
        INSERT INTO ticket_activities (ticket_id, user_id, action, description)
        VALUES (?, ?, 'status_changed', ?)
      `, [ticket.id, req.user.id, `Status changed to ${status}`]);

      // Set resolved date if status is resolved
      if (status === 'resolved') {
        updates.push(`resolved_date = CURRENT_TIMESTAMP`);
      }
    }

    if (assignedTo !== undefined) {
      updates.push(`assigned_to = ?`);
      values.push(assignedTo);

      // Get assignee name for logging
      const assigneeResult = await getDatabase().get(
        'SELECT first_name, last_name FROM users WHERE id = ?',
        [assignedTo]
      );
      const assigneeName = assigneeResult 
        ? `${assigneeResult.first_name} ${assigneeResult.last_name}`
        : 'Unknown';

      await getDatabase().run(`
        INSERT INTO ticket_activities (ticket_id, user_id, action, description)
        VALUES (?, ?, 'assigned', ?)
      `, [ticket.id, req.user.id, `Ticket assigned to ${assigneeName}`]);
    }

    if (problemLevel !== undefined) {
      updates.push(`problem_level = ?`);
      values.push(problemLevel);

      await getDatabase().run(`
        INSERT INTO ticket_activities (ticket_id, user_id, action, description)
        VALUES (?, ?, 'priority_changed', ?)
      `, [ticket.id, req.user.id, `Priority changed to ${problemLevel}`]);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    // Add last_updated
    updates.push(`last_updated = CURRENT_TIMESTAMP`);
    values.push(ticketId);

    // Execute update
    const updateQuery = `
      UPDATE tickets 
      SET ${updates.join(', ')}
      WHERE ticket_id = ?
    `;

    await getDatabase().run(updateQuery, values);
    
    // Get updated ticket
    const updatedTicket = await getDatabase().get(
      'SELECT * FROM tickets WHERE ticket_id = ?',
      [ticketId]
    );

    res.json({
      ticket: {
        id: updatedTicket.ticket_id,
        clientName: updatedTicket.client_name,
        clientId: updatedTicket.client_id,
        title: updatedTicket.title,
        description: updatedTicket.description,
        problemLevel: updatedTicket.problem_level,
        status: updatedTicket.status,
        assignedTo: updatedTicket.assigned_to,
        submittedDate: updatedTicket.submitted_date,
        lastUpdated: updatedTicket.last_updated,
        resolvedDate: updatedTicket.resolved_date
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get chat history for a ticket
router.get('/:ticketId/chats', async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    // Only allow access if user is assigned to the ticket or is the client
    const ticketResult = await getDatabase().get('SELECT * FROM tickets WHERE ticket_id = ?', [ticketId]);
    if (!ticketResult) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    const ticket = ticketResult;
    if (
      req.user.role === 'client' && ticket.client_id !== req.user.id ||
      req.user.role.startsWith('employee') && ticket.assigned_to !== req.user.id
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const chatResult = await getDatabase().all(
      'SELECT id, ticket_id, sender_id, sender_role, message, timestamp FROM ticket_chats WHERE ticket_id = ? ORDER BY timestamp ASC',
      [ticketId]
    );
    res.json({
      chats: chatResult
    });
  } catch (error) {
    next(error);
  }
});

export { router as ticketRoutes };