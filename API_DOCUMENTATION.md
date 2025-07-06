# SealKloud API Documentation

## Overview

The SealKloud Helpdesk API provides a comprehensive REST API for managing helpdesk tickets, users, and system operations. This API follows RESTful principles and returns JSON responses.

**Base URL:** `http://localhost:3001/api`  
**Version:** v1.0.0  
**Authentication:** JWT Bearer Token

## Table of Contents

1. [Authentication](#authentication)
2. [Error Handling](#error-handling)
3. [Rate Limiting](#rate-limiting)
4. [Endpoints](#endpoints)
   - [Authentication](#authentication-endpoints)
   - [Tickets](#ticket-endpoints)
   - [Users](#user-endpoints)
   - [Dashboard](#dashboard-endpoints)
   - [System](#system-endpoints)
5. [WebSocket API](#websocket-api)
6. [Integration Examples](#integration-examples)
7. [SDK Examples](#sdk-examples)

## Authentication

All API endpoints (except authentication endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Format
JWT tokens are automatically generated upon successful login and expire after 24 hours.

## Error Handling

The API uses standardized error responses with consistent error codes:

### Error Response Format
```json
{
  "error": {
    "code": "AUTH_1001",
    "message": "Invalid email or password",
    "status": 401,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "details": {
      "field": "email",
      "reason": "User not found"
    }
  }
}
```

### Error Code Categories

| Category | Code Range | Description |
|----------|------------|-------------|
| Authentication | AUTH_1001-AUTH_1099 | Login, token, permission errors |
| Validation | VAL_2001-VAL_2099 | Input validation errors |
| Resources | RES_3001-RES_3099 | Not found, conflicts, etc. |
| Database | DB_4001-DB_4099 | Database-related errors |
| Rate Limiting | RATE_5001 | Rate limit exceeded |
| Business Logic | BIZ_6001-BIZ_6099 | Business rule violations |
| System | SYS_9001-SYS_9099 | Server errors, maintenance |

### Common Error Codes

| Code | Message | Status | Description |
|------|---------|--------|-------------|
| AUTH_1001 | Invalid email or password | 401 | Authentication failed |
| AUTH_1002 | Authentication token has expired | 401 | Token expired |
| AUTH_1003 | Invalid authentication token | 401 | Malformed token |
| AUTH_1004 | Insufficient permissions | 403 | Role-based access denied |
| VAL_2001 | Required field is missing | 400 | Missing required parameter |
| VAL_2003 | Invalid email format | 400 | Email validation failed |
| RES_3001 | Requested resource not found | 404 | Resource doesn't exist |
| RES_3002 | Resource already exists | 409 | Duplicate resource |
| RATE_5001 | Rate limit exceeded | 429 | Too many requests |
| SYS_9001 | Internal server error | 500 | Server error |

## Rate Limiting

The API implements different rate limits based on user roles and endpoints:

| Role | General Limit | Auth Limit | Notes |
|------|---------------|------------|-------|
| Client | 50 req/15min | 5 req/15min | Most restrictive |
| Employee L1 | 80 req/15min | 5 req/15min | Standard employee |
| Employee L2 | 100 req/15min | 5 req/15min | Standard employee |
| Employee L3 | 150 req/15min | 5 req/15min | Senior employee |
| Admin | 200 req/15min | 5 req/15min | Highest limits |

### Rate Limit Headers
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1642234567
```

## Endpoints

### Authentication Endpoints

#### POST /api/auth/login
Authenticate a user and receive a JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "employee_l1",
      "companyId": 1,
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

**Error Responses:**
- `401` - Invalid credentials (AUTH_1001)
- `423` - Account locked (AUTH_1006)

#### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "client"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "email": "newuser@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "client",
      "isActive": true
    },
    "message": "User registered successfully"
  }
}
```

**Error Responses:**
- `400` - Validation errors (VAL_2001-VAL_2005)
- `409` - Email already exists (RES_3002)

### Ticket Endpoints

#### GET /api/tickets
Get all tickets with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `status` (string): Filter by status (open, in-progress, resolved, closed)
- `priority` (string): Filter by priority (low, medium, high, critical)
- `assignedTo` (number): Filter by assigned user ID
- `clientId` (number): Filter by client ID
- `search` (string): Search in title and description
- `sortBy` (string): Sort field (created_at, updated_at, priority, status)
- `sortOrder` (string): Sort order (asc, desc)

**Request:**
```
GET /api/tickets?page=1&limit=20&status=open&priority=high
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": 1,
        "ticketId": "TK-001",
        "title": "Login Issue",
        "description": "Cannot login to the system",
        "status": "open",
        "priority": "high",
        "clientName": "John Doe",
        "clientId": 1,
        "assignedTo": null,
        "assignedToName": null,
        "submittedDate": "2024-01-15T10:30:00.000Z",
        "lastUpdated": "2024-01-15T10:30:00.000Z",
        "resolvedDate": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET /api/tickets/:ticketId
Get a specific ticket by ID.

**Request:**
```
GET /api/tickets/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": 1,
      "ticketId": "TK-001",
      "title": "Login Issue",
      "description": "Cannot login to the system",
      "status": "open",
      "priority": "high",
      "clientName": "John Doe",
      "clientId": 1,
      "assignedTo": 2,
      "assignedToName": "Jane Smith",
      "submittedDate": "2024-01-15T10:30:00.000Z",
      "lastUpdated": "2024-01-15T11:00:00.000Z",
      "resolvedDate": null,
      "activities": [
        {
          "id": 1,
          "action": "ticket_created",
          "description": "Ticket created by John Doe",
          "timestamp": "2024-01-15T10:30:00.000Z",
          "userId": 1,
          "userName": "John Doe"
        }
      ]
    }
  }
}
```

#### POST /api/tickets
Create a new ticket.

**Request:**
```json
{
  "title": "New Issue",
  "description": "Detailed description of the issue",
  "priority": "medium",
  "clientId": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": 2,
      "ticketId": "TK-002",
      "title": "New Issue",
      "description": "Detailed description of the issue",
      "status": "open",
      "priority": "medium",
      "clientName": "John Doe",
      "clientId": 1,
      "assignedTo": null,
      "submittedDate": "2024-01-15T12:00:00.000Z",
      "lastUpdated": "2024-01-15T12:00:00.000Z"
    },
    "message": "Ticket created successfully"
  }
}
```

#### PATCH /api/tickets/:ticketId
Update a ticket.

**Request:**
```json
{
  "status": "in-progress",
  "assignedTo": 2,
  "priority": "high"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": 1,
      "ticketId": "TK-001",
      "status": "in-progress",
      "assignedTo": 2,
      "assignedToName": "Jane Smith",
      "priority": "high",
      "lastUpdated": "2024-01-15T13:00:00.000Z"
    },
    "message": "Ticket updated successfully"
  }
}
```

### User Endpoints

#### GET /api/users
Get all users (Admin only).

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `role` (string): Filter by role
- `isActive` (boolean): Filter by active status
- `search` (string): Search in name and email

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "employee_l1",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

#### GET /api/users/profile
Get current user's profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "employee_l1",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### PATCH /api/users/profile
Update current user's profile.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com"
}
```

#### PATCH /api/users/password
Change current user's password.

**Request:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Dashboard Endpoints

#### GET /api/dashboard/stats
Get dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalTickets": 150,
      "openTickets": 45,
      "inProgressTickets": 30,
      "resolvedTickets": 75,
      "avgResolutionTime": "2.5 days",
      "satisfactionScore": 4.2
    },
    "byPriority": {
      "low": 20,
      "medium": 60,
      "high": 50,
      "critical": 20
    },
    "byStatus": {
      "open": 45,
      "in-progress": 30,
      "resolved": 75
    }
  }
}
```

#### GET /api/dashboard/activity
Get recent activity.

**Query Parameters:**
- `limit` (number): Number of activities (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": 1,
        "action": "ticket_created",
        "description": "Ticket TK-001 created by John Doe",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "userId": 1,
        "userName": "John Doe",
        "ticketId": "TK-001"
      }
    ]
  }
}
```

### System Endpoints

#### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "SealKloud Helpdesk API",
  "version": "1.0.0",
  "uptime": 3600,
  "database": "connected"
}
```

## WebSocket API

The API also provides real-time communication via WebSocket for chat functionality.

### Connection
```javascript
const socket = io('http://localhost:3001');
```

### Events

#### Join Ticket Room
```javascript
socket.emit('join_ticket', { ticketId: 1 });
```

#### Send Chat Message
```javascript
socket.emit('chat_message', {
  ticketId: 1,
  senderId: 1,
  senderRole: 'client',
  message: 'Hello, I need help with my issue'
});
```

#### Receive Chat Message
```javascript
socket.on('chat_message', (data) => {
  console.log('New message:', data);
  // data: { ticketId, senderId, senderRole, message, timestamp }
});
```

## Integration Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

class SealKloudAPI {
  constructor(baseURL, token = null) {
    this.baseURL = baseURL;
    this.token = token;
  }

  setToken(token) {
    this.token = token;
  }

  async request(method, endpoint, data = null) {
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` })
      },
      ...(data && { data })
    };

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async login(email, password) {
    const response = await this.request('POST', '/auth/login', {
      email,
      password
    });
    this.setToken(response.data.token);
    return response;
  }

  async getTickets(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request('GET', `/tickets?${queryString}`);
  }

  async createTicket(ticketData) {
    return this.request('POST', '/tickets', ticketData);
  }
}

// Usage
const api = new SealKloudAPI('http://localhost:3001/api');
await api.login('user@example.com', 'password123');
const tickets = await api.getTickets({ status: 'open' });
```

### Python
```python
import requests
import json

class SealKloudAPI:
    def __init__(self, base_url, token=None):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()
        
    def set_token(self, token):
        self.token = token
        self.session.headers.update({'Authorization': f'Bearer {token}'})
        
    def request(self, method, endpoint, data=None):
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, params=data)
            else:
                response = self.session.request(method, url, json=data, headers=headers)
            
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise e
            
    def login(self, email, password):
        response = self.request('POST', '/auth/login', {
            'email': email,
            'password': password
        })
        self.set_token(response['data']['token'])
        return response
        
    def get_tickets(self, **params):
        return self.request('GET', '/tickets', params)
        
    def create_ticket(self, ticket_data):
        return self.request('POST', '/tickets', ticket_data)

# Usage
api = SealKloudAPI('http://localhost:3001/api')
api.login('user@example.com', 'password123')
tickets = api.get_tickets(status='open')
```

### cURL Examples

#### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

#### Get Tickets
```bash
curl -X GET "http://localhost:3001/api/tickets?status=open&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Create Ticket
```bash
curl -X POST http://localhost:3001/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "New Issue",
    "description": "Description of the issue",
    "priority": "medium"
  }'
```

## SDK Examples

### React Hook
```javascript
import { useState, useEffect } from 'react';

const useSealKloudAPI = (baseURL) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = {
    async request(method, endpoint, data = null) {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${baseURL}${endpoint}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          },
          ...(data && { body: JSON.stringify(data) })
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error?.message || 'API Error');
        }
        
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },

    async login(email, password) {
      const response = await this.request('POST', '/auth/login', {
        email,
        password
      });
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      return response;
    },

    async getTickets(params = {}) {
      const queryString = new URLSearchParams(params).toString();
      return this.request('GET', `/tickets?${queryString}`);
    },

    async createTicket(ticketData) {
      return this.request('POST', '/tickets', ticketData);
    }
  };

  return { api, loading, error, token };
};

// Usage in component
const MyComponent = () => {
  const { api, loading, error } = useSealKloudAPI('http://localhost:3001/api');
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.getTickets({ status: 'open' });
        setTickets(response.data.tickets);
      } catch (err) {
        console.error('Failed to fetch tickets:', err);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {tickets.map(ticket => (
        <div key={ticket.id}>{ticket.title}</div>
      ))}
    </div>
  );
};
```

## Best Practices

1. **Error Handling**: Always check for error responses and handle them appropriately
2. **Rate Limiting**: Respect rate limits and implement exponential backoff
3. **Token Management**: Store tokens securely and refresh them before expiration
4. **Validation**: Validate all input data before sending to the API
5. **Logging**: Log API requests and responses for debugging
6. **Caching**: Cache frequently accessed data to reduce API calls
7. **Retry Logic**: Implement retry logic for transient failures

## Support

For API support and questions:
- Email: api-support@sealkloud.com
- Documentation: https://docs.sealkloud.com/api
- Status Page: https://status.sealkloud.com 