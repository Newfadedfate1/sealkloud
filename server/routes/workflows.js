import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { getDatabase } from '../config/database.js';
import { logAuditEvent } from '../middleware/auth.js';

const router = express.Router();

// Get all workflow rules with optional filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('active_only').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        success: false, 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const { page = 1, limit = 20, search, active_only = false } = req.query;
    const offset = (page - 1) * limit;
    const db = getDatabase();

    let whereClause = '';
    let queryParams = [];

    if (search) {
      whereClause = 'WHERE wr.name LIKE ? OR wr.description LIKE ?';
      queryParams = [`%${search}%`, `%${search}%`];
    }

    if (active_only) {
      whereClause = whereClause ? `${whereClause} AND wr.is_active = 1` : 'WHERE wr.is_active = 1';
    }

    // Get rules with count
    const countQuery = `SELECT COUNT(*) as total FROM workflow_rules wr ${whereClause}`;
    const countResult = await db.get(countQuery, queryParams);
    const total = countResult.total;

    // Get rules
    let rulesQuery = `
      SELECT wr.id, wr.name, wr.description, wr.is_active, wr.priority, wr.created_at, wr.updated_at
      FROM workflow_rules wr
      ${whereClause}
      ORDER BY wr.priority ASC, wr.name ASC
      LIMIT ? OFFSET ?
    `;
    
    const rules = await db.all(rulesQuery, [...queryParams, limit, offset]);

    // Include conditions and actions for each rule
    for (const rule of rules) {
      const conditions = await db.all(
        'SELECT field, operator, value FROM workflow_conditions WHERE rule_id = ? ORDER BY id',
        [rule.id]
      );
      rule.conditions = conditions;

      const actions = await db.all(
        'SELECT type, value FROM workflow_actions WHERE rule_id = ? ORDER BY id',
        [rule.id]
      );
      rule.actions = actions;
    }

    res.json({
      success: true,
      data: {
        rules,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching workflow rules:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Failed to fetch workflow rules' } 
    });
  }
});

// Get single workflow rule by ID
router.get('/:id', [
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

    const rule = await db.get(
      'SELECT id, name, description, is_active, priority, created_at, updated_at FROM workflow_rules WHERE id = ?',
      [id]
    );

    if (!rule) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Workflow rule not found' } 
      });
    }

    // Include conditions and actions
    const conditions = await db.all(
      'SELECT field, operator, value FROM workflow_conditions WHERE rule_id = ? ORDER BY id',
      [id]
    );
    rule.conditions = conditions;

    const actions = await db.all(
      'SELECT type, value FROM workflow_actions WHERE rule_id = ? ORDER BY id',
      [id]
    );
    rule.actions = actions;

    res.json({ success: true, data: rule });

  } catch (error) {
    console.error('Error fetching workflow rule:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Failed to fetch workflow rule' } 
    });
  }
});

// Create new workflow rule
router.post('/', [
  body('name').isString().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().isString().trim().isLength({ max: 500 }),
  body('is_active').optional().isBoolean(),
  body('priority').optional().isInt({ min: 1, max: 100 }),
  body('conditions').isArray(),
  body('conditions.*.field').isString().isIn([
    'priority', 'status', 'category', 'assignee', 'client', 'created_date', 'last_updated', 'tags'
  ]),
  body('conditions.*.operator').isString().isIn(['equals', 'contains', 'greater_than', 'less_than', 'in']),
  body('conditions.*.value').isString().trim().isLength({ min: 1, max: 200 }),
  body('actions').isArray(),
  body('actions.*.type').isString().isIn(['assign', 'escalate', 'auto_respond', 'auto_close', 'change_status', 'add_tag']),
  body('actions.*.value').isString().trim().isLength({ min: 1, max: 200 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        success: false, 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const { name, description, is_active = true, priority = 1, conditions, actions } = req.body;
    const db = getDatabase();

    // Check if rule name already exists
    const existingRule = await db.get('SELECT id FROM workflow_rules WHERE name = ?', [name]);
    if (existingRule) {
      return res.status(409).json({ 
        success: false, 
        error: { message: 'Workflow rule name already exists' } 
      });
    }

    // Create rule
    const result = await db.run(
      'INSERT INTO workflow_rules (name, description, is_active, priority) VALUES (?, ?, ?, ?)',
      [name, description || '', is_active ? 1 : 0, priority]
    );

    const ruleId = result.lastID;

    // Add conditions
    for (const condition of conditions) {
      await db.run(
        'INSERT INTO workflow_conditions (rule_id, field, operator, value) VALUES (?, ?, ?, ?)',
        [ruleId, condition.field, condition.operator, condition.value]
      );
    }

    // Add actions
    for (const action of actions) {
      await db.run(
        'INSERT INTO workflow_actions (rule_id, type, value) VALUES (?, ?, ?)',
        [ruleId, action.type, action.value]
      );
    }

    // Get created rule
    const rule = await db.get(
      'SELECT id, name, description, is_active, priority, created_at, updated_at FROM workflow_rules WHERE id = ?',
      [ruleId]
    );

    // Log audit event
    await logAuditEvent(req, 'CREATE', 'workflow_rule', ruleId.toString(), name, `Created workflow rule with ${conditions.length} conditions and ${actions.length} actions`);

    res.status(201).json({ success: true, data: rule });

  } catch (error) {
    console.error('Error creating workflow rule:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Failed to create workflow rule' } 
    });
  }
});

// Update workflow rule
router.put('/:id', [
  param('id').isInt({ min: 1 }),
  body('name').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().isString().trim().isLength({ max: 500 }),
  body('is_active').optional().isBoolean(),
  body('priority').optional().isInt({ min: 1, max: 100 }),
  body('conditions').optional().isArray(),
  body('conditions.*.field').isString().isIn([
    'priority', 'status', 'category', 'assignee', 'client', 'created_date', 'last_updated', 'tags'
  ]),
  body('conditions.*.operator').isString().isIn(['equals', 'contains', 'greater_than', 'less_than', 'in']),
  body('conditions.*.value').isString().trim().isLength({ min: 1, max: 200 }),
  body('actions').optional().isArray(),
  body('actions.*.type').isString().isIn(['assign', 'escalate', 'auto_respond', 'auto_close', 'change_status', 'add_tag']),
  body('actions.*.value').isString().trim().isLength({ min: 1, max: 200 }),
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
    const { name, description, is_active, priority, conditions, actions } = req.body;
    const db = getDatabase();

    // Check if rule exists
    const existingRule = await db.get('SELECT id, name FROM workflow_rules WHERE id = ?', [id]);
    if (!existingRule) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Workflow rule not found' } 
      });
    }

    // Check if new name conflicts with existing rule
    if (name && name !== existingRule.name) {
      const nameConflict = await db.get('SELECT id FROM workflow_rules WHERE name = ? AND id != ?', [name, id]);
      if (nameConflict) {
        return res.status(409).json({ 
          success: false, 
          error: { message: 'Workflow rule name already exists' } 
        });
      }
    }

    // Update rule
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
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      values.push(priority);
    }
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.run(
      `UPDATE workflow_rules SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Update conditions if provided
    if (conditions !== undefined) {
      // Remove existing conditions
      await db.run('DELETE FROM workflow_conditions WHERE rule_id = ?', [id]);
      
      // Add new conditions
      for (const condition of conditions) {
        await db.run(
          'INSERT INTO workflow_conditions (rule_id, field, operator, value) VALUES (?, ?, ?, ?)',
          [id, condition.field, condition.operator, condition.value]
        );
      }
    }

    // Update actions if provided
    if (actions !== undefined) {
      // Remove existing actions
      await db.run('DELETE FROM workflow_actions WHERE rule_id = ?', [id]);
      
      // Add new actions
      for (const action of actions) {
        await db.run(
          'INSERT INTO workflow_actions (rule_id, type, value) VALUES (?, ?, ?)',
          [id, action.type, action.value]
        );
      }
    }

    // Get updated rule
    const rule = await db.get(
      'SELECT id, name, description, is_active, priority, created_at, updated_at FROM workflow_rules WHERE id = ?',
      [id]
    );

    // Log audit event
    const changes = [];
    if (name !== undefined) changes.push(`Name: ${name}`);
    if (description !== undefined) changes.push(`Description: ${description}`);
    if (is_active !== undefined) changes.push(`Active: ${is_active}`);
    if (priority !== undefined) changes.push(`Priority: ${priority}`);
    if (conditions !== undefined) changes.push(`Conditions: ${conditions.length} total`);
    if (actions !== undefined) changes.push(`Actions: ${actions.length} total`);
    
    await logAuditEvent(req, 'UPDATE', 'workflow_rule', id, rule.name, `Updated workflow rule: ${changes.join(', ')}`);

    res.json({ success: true, data: rule });

  } catch (error) {
    console.error('Error updating workflow rule:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Failed to update workflow rule' } 
    });
  }
});

// Delete workflow rule
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

    // Check if rule exists
    const rule = await db.get('SELECT id, name FROM workflow_rules WHERE id = ?', [id]);
    if (!rule) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Workflow rule not found' } 
      });
    }

    // Delete rule (conditions and actions will be deleted via CASCADE)
    await db.run('DELETE FROM workflow_rules WHERE id = ?', [id]);

    // Log audit event
    await logAuditEvent(req, 'DELETE', 'workflow_rule', id, rule.name, 'Deleted workflow rule');

    res.json({ success: true, message: 'Workflow rule deleted successfully' });

  } catch (error) {
    console.error('Error deleting workflow rule:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Failed to delete workflow rule' } 
    });
  }
});

// Toggle workflow rule active status
router.patch('/:id/toggle', [
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

    // Check if rule exists
    const rule = await db.get('SELECT id, name, is_active FROM workflow_rules WHERE id = ?', [id]);
    if (!rule) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Workflow rule not found' } 
      });
    }

    // Toggle active status
    const newStatus = !rule.is_active;
    await db.run(
      'UPDATE workflow_rules SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus ? 1 : 0, id]
    );

    // Log audit event
    await logAuditEvent(req, 'TOGGLE', 'workflow_rule', id, rule.name, `Toggled workflow rule to ${newStatus ? 'active' : 'inactive'}`);

    res.json({ 
      success: true, 
      message: `Workflow rule ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: { is_active: newStatus }
    });

  } catch (error) {
    console.error('Error toggling workflow rule:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Failed to toggle workflow rule' } 
    });
  }
});

// Get available fields, operators, and actions for workflow rules
router.get('/metadata/available', async (req, res) => {
  try {
    const availableFields = [
      { value: 'priority', label: 'Priority' },
      { value: 'status', label: 'Status' },
      { value: 'category', label: 'Category' },
      { value: 'assignee', label: 'Assignee' },
      { value: 'client', label: 'Client' },
      { value: 'created_date', label: 'Created Date' },
      { value: 'last_updated', label: 'Last Updated' },
      { value: 'tags', label: 'Tags' }
    ];

    const availableOperators = [
      { value: 'equals', label: 'Equals' },
      { value: 'contains', label: 'Contains' },
      { value: 'greater_than', label: 'Greater Than' },
      { value: 'less_than', label: 'Less Than' },
      { value: 'in', label: 'In' }
    ];

    const availableActions = [
      { value: 'assign', label: 'Assign to User' },
      { value: 'escalate', label: 'Escalate' },
      { value: 'auto_respond', label: 'Auto Respond' },
      { value: 'auto_close', label: 'Auto Close' },
      { value: 'change_status', label: 'Change Status' },
      { value: 'add_tag', label: 'Add Tag' }
    ];

    res.json({
      success: true,
      data: {
        fields: availableFields,
        operators: availableOperators,
        actions: availableActions
      }
    });

  } catch (error) {
    console.error('Error fetching workflow metadata:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Failed to fetch workflow metadata' } 
    });
  }
});

export default router; 