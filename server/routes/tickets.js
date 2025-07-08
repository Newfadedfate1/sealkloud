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
    let paramIndex = 1;

    // Build dynamic WHERE clause (PostgreSQL style)
    if (status) {
      whereConditions.push(`t.status = $${paramIndex++}`);
      queryParams.push(status);
    }

    if (problemLevel) {
      whereConditions.push(`t.problem_level = $${paramIndex++}`);
      queryParams.push(problemLevel);
    }

    if (assignedTo) {
      whereConditions.push(`t.assigned_to = $${paramIndex++}`);
      queryParams.push(assignedTo);
    }

    if (search) {
      whereConditions.push(`(
        t.title ILIKE $${paramIndex} OR 
        t.description ILIKE $${paramIndex} OR 
        t.client_name ILIKE $${paramIndex} OR
        t.ticket_id ILIKE $${paramIndex}
      )`);
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern);
      paramIndex++;
    }

    // Role-based filtering (skip if req.user is undefined)
    if (req.user && req.user.role === 'client') {
      whereConditions.push(`t.client_id = $${paramIndex++}`);
      queryParams.push(req.user.id);
    } else if (req.user && req.user.role && req.user.role.startsWith('employee_l1')) {
      // Level 1 employees see all unassigned tickets and tickets assigned to them
      whereConditions.push(`(t.status = 'unassigned' OR t.assigned_to = $${paramIndex++})`);
      queryParams.push(req.user.id);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM tickets t ${whereClause}`;
    const countResult = await getDatabase().query(countQuery, queryParams);
    const total = countResult.rows[0].total;

    // Get tickets with user information
    const ticketsQuery = `
      SELECT 
        t.*,
        u.first_name || ' ' || u.last_name as assigned_to_name
      FROM tickets t
      LEFT JOIN users u ON t.assigned_to = u.id
      ${whereClause}
      ORDER BY t.last_updated DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);

    const result = await getDatabase().query(ticketsQuery, queryParams);

    // Debug: Log tickets returned for client
    if (req.user.role === 'client') {
      console.log('[DEBUG] Tickets returned for client', req.user.id, ':', result.rows.map(r => ({ id: r.ticket_id, status: r.status, client_id: r.client_id })));
    }

    res.json({
      tickets: result.rows.map(row => ({
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

// Get all unassigned tickets for Level 1 employees
router.get('/available/l1', async (req, res, next) => {
  try {
    const db = getDatabase();
    const result = await db.query(
      `SELECT t.*, u.first_name || ' ' || u.last_name as assigned_to_name
       FROM tickets t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.status = 'unassigned'
       ORDER BY t.last_updated DESC`
    );
    console.log('[DEBUG] /available/l1 called by user:', req.user ? req.user.id : 'unknown');
    console.log('[DEBUG] /available/l1 tickets returned:', result.rows.map(r => ({ id: r.ticket_id, status: r.status, client_id: r.client_id })));
    res.json({
      tickets: result.rows.map(row => ({
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
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Get tickets assigned to the current employee
router.get('/my-tickets', async (req, res, next) => {
  try {
    // Remove auth check for development/testing
    // if (!req.user || !req.user.id) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter required' });
    }
    const db = getDatabase();
    const result = await db.query(
      `SELECT t.*, u.first_name || ' ' || u.last_name as assigned_to_name
       FROM tickets t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.assigned_to = $1
       ORDER BY t.last_updated DESC`,
      [userId]
    );
    res.json({
      tickets: result.rows.map(row => ({
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
      }))
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
    const ticketResult = await getDatabase().query(`
      SELECT 
        t.*,
        u.first_name || ' ' || u.last_name as assigned_to_name,
        c.first_name || ' ' || c.last_name as client_full_name
      FROM tickets t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.client_id = c.id
      WHERE t.ticket_id = $1
    `, [ticketId]);
    const ticket = ticketResult.rows[0];

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Role-based access control
    if (
      (req.user.role === 'client' && ticket.client_id !== req.user.id) ||
      (req.user.role && req.user.role.startsWith('employee') && ticket.assigned_to !== req.user.id)
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get activity log
    const activitiesResult = await getDatabase().query(`
      SELECT 
        ta.*,
        u.first_name || ' ' || u.last_name as user_name
      FROM ticket_activities ta
      LEFT JOIN users u ON ta.user_id = u.id
      WHERE ta.ticket_id = $1
      ORDER BY ta.timestamp DESC
    `, [ticket.id]);
    const activities = activitiesResult.rows;

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
    // Add debug logging
    console.log('Ticket creation attempt:', {
      user: req.user,
      body: req.body
    });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, problemLevel, clientName } = req.body;

    // Generate ticket ID
    const countResult = await getDatabase().query('SELECT COUNT(*) as count FROM tickets');
    const ticketCount = countResult.rows[0].count + 1;
    const ticketId = `TK-${ticketCount.toString().padStart(3, '0')}`;

    // Determine client info
    let finalClientName = clientName;
    let clientId = req.user.id;

    if (req.user.role === 'client') {
      finalClientName = `${req.user.first_name} ${req.user.last_name}`;
    }

    // Insert ticket (PostgreSQL style)
    console.log('[DEBUG] Inserting ticket with values:', { ticketId, finalClientName, clientId, title, description, problemLevel });
    const insertResult = await getDatabase().query(
      `INSERT INTO tickets (ticket_id, client_name, client_id, title, description, problem_level, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'unassigned') RETURNING id`,
      [ticketId, finalClientName, clientId, title, description, problemLevel]
    );
    const insertedId = insertResult.rows[0]?.id;
    console.log('Ticket inserted with id:', insertedId);

    // Get the inserted ticket
    const ticketResult = await getDatabase().query('SELECT * FROM tickets WHERE id = $1', [insertedId]);
    const ticket = ticketResult.rows[0];
    console.log('Inserted ticket:', ticket);

    // Log activity
    await getDatabase().query(
      `INSERT INTO ticket_activities (ticket_id, user_id, action, description)
       VALUES ($1, $2, 'created', $3)`,
      [ticket.id, req.user.id, 'Ticket created']
    );

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
    console.error('Error in ticket creation:', error.stack || error);
    next(error);
  }
});

// Update ticket (assign, change status, etc.)
router.patch('/:ticketId', [
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
    const ticketResult2 = await getDatabase().query(
      'SELECT * FROM tickets WHERE ticket_id = $1',
      [ticketId]
    );
    const ticket2 = ticketResult2.rows[0];

    if (!ticket2) {
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
      `, [ticket2.id, req.user.id, `Status changed to ${status}`]);

      // Set resolved date if status is resolved
      if (status === 'resolved') {
        updates.push(`resolved_date = CURRENT_TIMESTAMP`);
      }
    }

    if (assignedTo !== undefined) {
      updates.push(`assigned_to = ?`);
      values.push(assignedTo);

      // Get assignee name for logging
      const assigneeResult = await getDatabase().query(
        'SELECT first_name, last_name FROM users WHERE id = $1',
        [assignedTo]
      );
      const assignee = assigneeResult.rows[0];
      const assigneeName = assignee 
        ? `${assignee.first_name} ${assignee.last_name}`
        : 'Unknown';

      await getDatabase().run(`
        INSERT INTO ticket_activities (ticket_id, user_id, action, description)
        VALUES (?, ?, 'assigned', ?)
      `, [ticket2.id, req.user.id, `Ticket assigned to ${assigneeName}`]);
    }

    if (problemLevel !== undefined) {
      updates.push(`problem_level = ?`);
      values.push(problemLevel);

      await getDatabase().run(`
        INSERT INTO ticket_activities (ticket_id, user_id, action, description)
        VALUES (?, ?, 'priority_changed', ?)
      `, [ticket2.id, req.user.id, `Priority changed to ${problemLevel}`]);
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
    const updatedTicket = await getDatabase().query(
      'SELECT * FROM tickets WHERE ticket_id = ?',
      [ticketId]
    );

    // If resolved, notify the client
    if (status === 'resolved') {
      const clientId = updatedTicket.rows[0].client_id;
      const ticketTitle = updatedTicket.rows[0].title;
      const notificationMsg = `Your ticket '${ticketTitle}' has been resolved.`;
      await getDatabase().query(
        `INSERT INTO notifications (user_id, message) VALUES (?, ?)` ,
        [clientId, notificationMsg]
      );
    }

    res.json({
      ticket: {
        id: updatedTicket.rows[0].ticket_id,
        clientName: updatedTicket.rows[0].client_name,
        clientId: updatedTicket.rows[0].client_id,
        title: updatedTicket.rows[0].title,
        description: updatedTicket.rows[0].description,
        problemLevel: updatedTicket.rows[0].problem_level,
        status: updatedTicket.rows[0].status,
        assignedTo: updatedTicket.rows[0].assigned_to,
        submittedDate: updatedTicket.rows[0].submitted_date,
        lastUpdated: updatedTicket.rows[0].last_updated,
        resolvedDate: updatedTicket.rows[0].resolved_date
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
    const ticketResult = await getDatabase().query('SELECT * FROM tickets WHERE ticket_id = $1', [ticketId]);
    if (!ticketResult.rows.length) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    const ticket = ticketResult.rows[0];
    if (
      req.user.role === 'client' && ticket.client_id !== req.user.id ||
      req.user.role.startsWith('employee') && ticket.assigned_to !== req.user.id
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const chatResult = await getDatabase().query(
      'SELECT id, ticket_id, sender_id, sender_role, message, timestamp FROM ticket_chats WHERE ticket_id = $1 ORDER BY timestamp ASC',
      [ticketId]
    );
    res.json({
      chats: chatResult.rows
    });
  } catch (error) {
    next(error);
  }
});

// Enhance claim endpoint to notify client
router.post('/:ticketId/claim', requireEmployee, async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const db = getDatabase();

    // Get current ticket
    const ticketResult2 = await db.query(
      'SELECT * FROM tickets WHERE ticket_id = $1',
      [ticketId]
    );
    const ticket2 = ticketResult2.rows[0];

    if (!ticket2) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if ticket is available for assignment
    if (ticket2.status !== 'unassigned' && ticket2.status !== 'open') {
      return res.status(400).json({ error: 'Ticket is not available for assignment' });
    }

    if (ticket2.assigned_to) {
      return res.status(400).json({ error: 'Ticket is already assigned to another employee' });
    }

    // Check if user is Level 1 employee (only Level 1 can claim unassigned tickets)
    if (!req.user.role.startsWith('employee_l1')) {
      return res.status(403).json({ error: 'Only Level 1 employees can claim unassigned tickets' });
    }

    // Assign ticket to current user
    await db.query(`
      UPDATE tickets 
      SET assigned_to = $1, status = 'in-progress', last_updated = CURRENT_TIMESTAMP
      WHERE ticket_id = $2
    `, [req.user.id, ticketId]);

    // Log the assignment activity
    await db.query(`
      INSERT INTO ticket_activities (ticket_id, user_id, action, description)
      VALUES ($1, $2, 'taken', $3)
    `, [ticket2.id, req.user.id, `Ticket assigned to ${req.user.first_name} ${req.user.last_name}`]);

    // Insert a simple notification for the client
    const notificationMsg = `Your ticket ${ticket2.ticket_id} has been taken by ${req.user.first_name} ${req.user.last_name}.`;
    await db.query(
      `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
      [ticket2.client_id, notificationMsg]
    );

    // Get updated ticket
    const updatedTicket = await db.query(
      'SELECT * FROM tickets WHERE ticket_id = ?',
      [ticketId]
    );

    res.json({
      ticket: {
        id: updatedTicket.rows[0].ticket_id,
        clientName: updatedTicket.rows[0].client_name,
        clientId: updatedTicket.rows[0].client_id,
        title: updatedTicket.rows[0].title,
        description: updatedTicket.rows[0].description,
        problemLevel: updatedTicket.rows[0].problem_level,
        status: updatedTicket.rows[0].status,
        assignedTo: updatedTicket.rows[0].assigned_to,
        submittedDate: updatedTicket.rows[0].submitted_date,
        lastUpdated: updatedTicket.rows[0].last_updated,
        resolvedDate: updatedTicket.rows[0].resolved_date
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get notifications for the authenticated user
router.get('/notifications', async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const db = getDatabase();
    const result = await db.query(
      `SELECT id, message, created_at, read FROM notifications WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ notifications: result.rows });
  } catch (error) {
    next(error);
  }
});

export { router as ticketRoutes };