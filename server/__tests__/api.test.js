/**
 * Comprehensive API Test Suite for SealKloud
 * Tests all endpoints, error handling, rate limiting, and authentication
 */

import request from 'supertest';
import { app } from '../index.js';
import { getDatabase } from '../config/database.js';
import jwt from 'jsonwebtoken';

describe('SealKloud API Tests', () => {
  let authToken;
  let adminToken;
  let clientToken;
  let testUserId;
  let testTicketId;

  // Test data
  const testUser = {
    email: 'testuser@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role: 'employee_l1'
  };

  const testAdmin = {
    email: 'testadmin@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin'
  };

  const testClient = {
    email: 'testclient@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'Client',
    role: 'client'
  };

  const testTicket = {
    title: 'Test Ticket',
    description: 'This is a test ticket for API testing',
    priority: 'medium'
  };

  beforeAll(async () => {
    // Initialize test database
    const db = getDatabase();
    
    // Clean up test data
    await db.run('DELETE FROM ticket_activities WHERE ticket_id IN (SELECT id FROM tickets WHERE title LIKE "Test%")');
    await db.run('DELETE FROM tickets WHERE title LIKE "Test%"');
    await db.run('DELETE FROM users WHERE email LIKE "test%"');
  });

  afterAll(async () => {
    // Clean up test data
    const db = getDatabase();
    await db.run('DELETE FROM ticket_activities WHERE ticket_id IN (SELECT id FROM tickets WHERE title LIKE "Test%")');
    await db.run('DELETE FROM tickets WHERE title LIKE "Test%"');
    await db.run('DELETE FROM users WHERE email LIKE "test%"');
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('service', 'SealKloud Helpdesk API');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Authentication', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send(testUser)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user).toHaveProperty('email', testUser.email);
        expect(response.body.data.user).toHaveProperty('role', testUser.role);
        expect(response.body.data.user).not.toHaveProperty('password');
      });

      it('should return validation error for invalid email', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            ...testUser,
            email: 'invalid-email'
          })
          .expect(400);

        expect(response.body.error.code).toBe('VAL_2003');
        expect(response.body.error.message).toContain('Invalid email format');
      });

      it('should return error for duplicate email', async () => {
        // Register first user
        await request(app)
          .post('/api/auth/register')
          .send(testUser);

        // Try to register with same email
        const response = await request(app)
          .post('/api/auth/register')
          .send(testUser)
          .expect(409);

        expect(response.body.error.code).toBe('RES_3002');
      });

      it('should return error for weak password', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            ...testUser,
            password: '123'
          })
          .expect(400);

        expect(response.body.error.code).toBe('VAL_2004');
      });
    });

    describe('POST /api/auth/login', () => {
      beforeEach(async () => {
        // Ensure test user exists
        await request(app)
          .post('/api/auth/register')
          .send(testUser);
      });

      it('should login successfully with valid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('token');
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data.user.email).toBe(testUser.email);

        authToken = response.body.data.token;
      });

      it('should return error for invalid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: 'wrongpassword'
          })
          .expect(401);

        expect(response.body.error.code).toBe('AUTH_1001');
      });

      it('should return error for non-existent user', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'password123'
          })
          .expect(401);

        expect(response.body.error.code).toBe('AUTH_1001');
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on auth endpoints', async () => {
      // Make multiple requests to trigger rate limit
      const promises = Array(6).fill().map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123'
          })
      );

      const responses = await Promise.all(promises);
      const rateLimitedResponse = responses.find(r => r.status === 429);
      
      expect(rateLimitedResponse).toBeDefined();
      expect(rateLimitedResponse.body.error.code).toBe('RATE_5001');
    });
  });

  describe('Tickets', () => {
    beforeEach(async () => {
      // Create test user and get token
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      authToken = loginResponse.body.data.token;
      testUserId = loginResponse.body.data.user.id;
    });

    describe('GET /api/tickets', () => {
      beforeEach(async () => {
        // Create test tickets
        for (let i = 1; i <= 5; i++) {
          await request(app)
            .post('/api/tickets')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              ...testTicket,
              title: `Test Ticket ${i}`,
              priority: i % 2 === 0 ? 'high' : 'low'
            });
        }
      });

      it('should get all tickets with pagination', async () => {
        const response = await request(app)
          .get('/api/tickets?page=1&limit=3')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.tickets).toHaveLength(3);
        expect(response.body.data.pagination).toHaveProperty('page', 1);
        expect(response.body.data.pagination).toHaveProperty('limit', 3);
        expect(response.body.data.pagination).toHaveProperty('total');
        expect(response.body.data.pagination).toHaveProperty('totalPages');
      });

      it('should filter tickets by status', async () => {
        const response = await request(app)
          .get('/api/tickets?status=open')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        response.body.data.tickets.forEach(ticket => {
          expect(ticket.status).toBe('open');
        });
      });

      it('should filter tickets by priority', async () => {
        const response = await request(app)
          .get('/api/tickets?priority=high')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        response.body.data.tickets.forEach(ticket => {
          expect(ticket.priority).toBe('high');
        });
      });

      it('should search tickets by title', async () => {
        const response = await request(app)
          .get('/api/tickets?search=Test Ticket 1')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.tickets.some(ticket => 
          ticket.title.includes('Test Ticket 1')
        )).toBe(true);
      });

      it('should return 401 without authentication', async () => {
        await request(app)
          .get('/api/tickets')
          .expect(401);
      });
    });

    describe('POST /api/tickets', () => {
      it('should create a new ticket successfully', async () => {
        const response = await request(app)
          .post('/api/tickets')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testTicket)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.ticket).toHaveProperty('title', testTicket.title);
        expect(response.body.data.ticket).toHaveProperty('status', 'open');
        expect(response.body.data.ticket).toHaveProperty('ticketId');
        expect(response.body.data.ticket.ticketId).toMatch(/^TK-\d+$/);

        testTicketId = response.body.data.ticket.id;
      });

      it('should return validation error for missing title', async () => {
        const response = await request(app)
          .post('/api/tickets')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            description: 'Description without title'
          })
          .expect(400);

        expect(response.body.error.code).toBe('VAL_2001');
      });

      it('should return validation error for invalid priority', async () => {
        const response = await request(app)
          .post('/api/tickets')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            ...testTicket,
            priority: 'invalid_priority'
          })
          .expect(400);

        expect(response.body.error.code).toBe('BIZ_6004');
      });
    });

    describe('GET /api/tickets/:id', () => {
      beforeEach(async () => {
        // Create a test ticket
        const response = await request(app)
          .post('/api/tickets')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testTicket);

        testTicketId = response.body.data.ticket.id;
      });

      it('should get a specific ticket', async () => {
        const response = await request(app)
          .get(`/api/tickets/${testTicketId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.ticket).toHaveProperty('id', testTicketId);
        expect(response.body.data.ticket).toHaveProperty('title', testTicket.title);
      });

      it('should return 404 for non-existent ticket', async () => {
        await request(app)
          .get('/api/tickets/99999')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });
    });

    describe('PATCH /api/tickets/:id', () => {
      beforeEach(async () => {
        // Create a test ticket
        const response = await request(app)
          .post('/api/tickets')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testTicket);

        testTicketId = response.body.data.ticket.id;
      });

      it('should update ticket status', async () => {
        const response = await request(app)
          .patch(`/api/tickets/${testTicketId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            status: 'in-progress'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.ticket).toHaveProperty('status', 'in-progress');
      });

      it('should assign ticket to user', async () => {
        const response = await request(app)
          .patch(`/api/tickets/${testTicketId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            assignedTo: testUserId
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.ticket).toHaveProperty('assignedTo', testUserId);
      });

      it('should return error for invalid status transition', async () => {
        // First set status to resolved
        await request(app)
          .patch(`/api/tickets/${testTicketId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ status: 'resolved' });

        // Try to set back to open (invalid transition)
        const response = await request(app)
          .patch(`/api/tickets/${testTicketId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ status: 'open' })
          .expect(400);

        expect(response.body.error.code).toBe('BIZ_6002');
      });
    });
  });

  describe('Users', () => {
    beforeEach(async () => {
      // Create admin user
      await request(app)
        .post('/api/auth/register')
        .send(testAdmin);

      const adminResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testAdmin.email,
          password: testAdmin.password
        });

      adminToken = adminResponse.body.data.token;
    });

    describe('GET /api/users', () => {
      it('should get all users (admin only)', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('users');
        expect(response.body.data).toHaveProperty('pagination');
      });

      it('should return 403 for non-admin users', async () => {
        // Create regular user
        await request(app)
          .post('/api/auth/register')
          .send(testUser);

        const userResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password
          });

        await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${userResponse.body.data.token}`)
          .expect(403);
      });
    });

    describe('GET /api/users/profile', () => {
      it('should get current user profile', async () => {
        const response = await request(app)
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user).toHaveProperty('email', testAdmin.email);
        expect(response.body.data.user).toHaveProperty('role', 'admin');
      });
    });

    describe('PATCH /api/users/profile', () => {
      it('should update user profile', async () => {
        const response = await request(app)
          .patch('/api/users/profile')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            firstName: 'Updated',
            lastName: 'Name'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user).toHaveProperty('firstName', 'Updated');
        expect(response.body.data.user).toHaveProperty('lastName', 'Name');
      });
    });
  });

  describe('Dashboard', () => {
    beforeEach(async () => {
      // Create test user
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const userResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      authToken = userResponse.body.data.token;
    });

    describe('GET /api/dashboard/stats', () => {
      it('should get dashboard statistics', async () => {
        const response = await request(app)
          .get('/api/dashboard/stats')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.stats).toHaveProperty('totalTickets');
        expect(response.body.data.stats).toHaveProperty('openTickets');
        expect(response.body.data.stats).toHaveProperty('inProgressTickets');
        expect(response.body.data.stats).toHaveProperty('resolvedTickets');
      });
    });

    describe('GET /api/dashboard/activity', () => {
      it('should get recent activity', async () => {
        const response = await request(app)
          .get('/api/dashboard/activity')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('activities');
        expect(Array.isArray(response.body.data.activities)).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JWT token', async () => {
      const response = await request(app)
        .get('/api/tickets')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error.code).toBe('AUTH_1003');
    });

    it('should handle expired JWT token', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: 1, role: 'employee_l1' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.error.code).toBe('AUTH_1002');
    });

    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.error.code).toBe('RES_3001');
    });
  });
}); 