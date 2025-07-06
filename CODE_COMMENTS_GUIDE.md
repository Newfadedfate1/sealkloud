# Code Comments & Documentation Guide

This guide outlines the standards for code comments, JSDoc documentation, and inline documentation for the SealKloud project.

## 📝 Comment Standards

### General Principles
- **Write self-documenting code** when possible
- **Comment the "why" not the "what"**
- **Keep comments up-to-date** with code changes
- **Use clear, concise language**
- **Follow consistent formatting**

### Comment Types

#### 1. File Headers
```javascript
/**
 * @fileoverview Authentication middleware for JWT token validation
 * @author SealKloud Team
 * @version 1.0.0
 * @since 2024-01-15
 */
```

#### 2. Function Documentation (JSDoc)
```javascript
/**
 * Validates JWT token and extracts user information
 * @param {string} token - JWT token from Authorization header
 * @param {string} secret - JWT secret key for verification
 * @returns {Promise<Object>} Decoded token payload with user info
 * @throws {Error} When token is invalid or expired
 * @example
 * const user = await validateToken(token, process.env.JWT_SECRET);
 * console.log(user.id, user.role);
 */
async function validateToken(token, secret) {
  // Implementation
}
```

#### 3. Inline Comments
```javascript
// Good: Explains complex business logic
if (ticket.status === 'resolved' && ticket.assignedTo !== userId) {
  // Only allow status changes if user is assigned or is admin
  // This prevents unauthorized status modifications
  throw new Error('Insufficient permissions');
}

// Bad: Obvious code explanation
const tickets = await getTickets(); // Get tickets from database
```

#### 4. TODO Comments
```javascript
// TODO: Implement rate limiting for ticket creation
// FIXME: Handle edge case when user has no assigned tickets
// NOTE: This is a temporary solution until we implement caching
```

## 🏷️ JSDoc Standards

### Function Documentation
```javascript
/**
 * Creates a new helpdesk ticket
 * @param {Object} ticketData - Ticket information
 * @param {string} ticketData.title - Ticket title (1-200 characters)
 * @param {string} ticketData.description - Ticket description (1-2000 characters)
 * @param {('low'|'medium'|'high'|'critical')} ticketData.priority - Ticket priority level
 * @param {number} ticketData.clientId - ID of the client creating the ticket
 * @param {number} userId - ID of the user creating the ticket
 * @returns {Promise<Object>} Created ticket with generated ticket ID
 * @throws {ValidationError} When required fields are missing or invalid
 * @throws {DatabaseError} When database operation fails
 * @example
 * const ticket = await createTicket({
 *   title: 'Login Issue',
 *   description: 'Cannot access the system',
 *   priority: 'high',
 *   clientId: 123
 * }, userId);
 */
```

### Class Documentation
```javascript
/**
 * Manages ticket operations and business logic
 * @class TicketService
 * @description Handles CRUD operations for helpdesk tickets
 * @example
 * const ticketService = new TicketService();
 * const tickets = await ticketService.getTickets({ status: 'open' });
 */
class TicketService {
  /**
   * Creates a new TicketService instance
   * @param {Object} config - Service configuration
   * @param {string} config.databasePath - Path to SQLite database
   * @param {number} config.maxTicketsPerUser - Maximum tickets per user
   */
  constructor(config) {
    // Implementation
  }
}
```

### Interface Documentation (TypeScript)
```typescript
/**
 * Represents a helpdesk ticket in the system
 * @interface Ticket
 * @description Core ticket data structure used throughout the application
 */
interface Ticket {
  /** Unique identifier for the ticket */
  id: number;
  
  /** Human-readable ticket identifier (e.g., TK-001) */
  ticketId: string;
  
  /** Ticket title (1-200 characters) */
  title: string;
  
  /** Detailed ticket description (1-2000 characters) */
  description: string;
  
  /** Current status of the ticket */
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  
  /** Priority level of the ticket */
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  /** ID of the client who created the ticket */
  clientId: number;
  
  /** Name of the client who created the ticket */
  clientName: string;
  
  /** ID of the assigned employee (null if unassigned) */
  assignedTo: number | null;
  
  /** Name of the assigned employee */
  assignedToName: string | null;
  
  /** Date when ticket was submitted */
  submittedDate: string;
  
  /** Date when ticket was last updated */
  lastUpdated: string;
  
  /** Date when ticket was resolved (null if not resolved) */
  resolvedDate: string | null;
}
```

## 🔧 React Component Documentation

### Component Documentation
```typescript
/**
 * Displays a single ticket card with actions
 * @component TicketCard
 * @description Renders ticket information in a card format with edit/delete actions
 * @param {TicketCardProps} props - Component properties
 * @returns {JSX.Element} Rendered ticket card component
 * @example
 * <TicketCard
 *   ticket={ticketData}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   showActions={true}
 * />
 */
interface TicketCardProps {
  /** Ticket data to display */
  ticket: Ticket;
  
  /** Callback function when edit button is clicked */
  onEdit?: (ticket: Ticket) => void;
  
  /** Callback function when delete button is clicked */
  onDelete?: (id: number) => void;
  
  /** Whether to show action buttons */
  showActions?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onEdit,
  onDelete,
  showActions = true
}) => {
  // Component implementation
};
```

### Hook Documentation
```typescript
/**
 * Custom hook for managing ticket data and operations
 * @function useTickets
 * @description Provides ticket state management and CRUD operations
 * @param {UseTicketsOptions} options - Hook configuration options
 * @returns {UseTicketsReturn} Ticket state and operations
 * @example
 * const { tickets, loading, error, createTicket, updateTicket } = useTickets({
 *   filters: { status: 'open' },
 *   autoRefresh: true
 * });
 */
interface UseTicketsOptions {
  /** Filters to apply to ticket queries */
  filters?: TicketFilters;
  
  /** Whether to automatically refresh data */
  autoRefresh?: boolean;
  
  /** Refresh interval in milliseconds */
  refreshInterval?: number;
}

interface UseTicketsReturn {
  /** Array of tickets matching current filters */
  tickets: Ticket[];
  
  /** Loading state */
  loading: boolean;
  
  /** Error state */
  error: string | null;
  
  /** Function to create a new ticket */
  createTicket: (ticketData: CreateTicketData) => Promise<void>;
  
  /** Function to update an existing ticket */
  updateTicket: (id: number, updates: Partial<Ticket>) => Promise<void>;
  
  /** Function to refresh ticket data */
  refresh: () => Promise<void>;
}
```

## 🗄️ Database Documentation

### Schema Documentation
```sql
/**
 * Users table - Stores user account information
 * @table users
 * @description Core user data including authentication and role information
 */
CREATE TABLE users (
  /** Primary key, auto-incrementing */
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  /** Unique email address for login */
  email TEXT UNIQUE NOT NULL,
  
  /** Hashed password using bcrypt */
  password_hash TEXT NOT NULL,
  
  /** User's first name */
  first_name TEXT NOT NULL,
  
  /** User's last name */
  last_name TEXT NOT NULL,
  
  /** User role determining permissions */
  role TEXT CHECK(role IN ('client', 'employee_l1', 'employee_l2', 'employee_l3', 'admin')) NOT NULL,
  
  /** Company identifier for multi-tenant support */
  company_id INTEGER DEFAULT 1,
  
  /** Whether the user account is active */
  is_active BOOLEAN DEFAULT 1,
  
  /** Timestamp when user was created */
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  /** Timestamp when user was last updated */
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for email lookups (frequent login operations)
CREATE INDEX idx_users_email ON users(email);

-- Index for role-based queries
CREATE INDEX idx_users_role ON users(role);
```

### Query Documentation
```javascript
/**
 * Retrieves tickets with pagination and filtering
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (1-based)
 * @param {number} options.limit - Items per page (max 100)
 * @param {string} options.status - Filter by ticket status
 * @param {string} options.priority - Filter by ticket priority
 * @param {number} options.assignedTo - Filter by assigned user
 * @param {string} options.search - Search in title and description
 * @returns {Promise<Object>} Tickets and pagination info
 * 
 * @example
 * const result = await getTickets({
 *   page: 1,
 *   limit: 20,
 *   status: 'open',
 *   search: 'login issue'
 * });
 * console.log(result.tickets, result.pagination);
 */
async function getTickets(options = {}) {
  const {
    page = 1,
    limit = 20,
    status,
    priority,
    assignedTo,
    search
  } = options;

  // Build WHERE clause based on filters
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  if (priority) {
    conditions.push('priority = ?');
    params.push(priority);
  }

  if (assignedTo) {
    conditions.push('assigned_to = ?');
    params.push(assignedTo);
  }

  if (search) {
    conditions.push('(title LIKE ? OR description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Query with pagination
  const offset = (page - 1) * limit;
  const query = `
    SELECT t.*, 
           u1.first_name || ' ' || u1.last_name as client_name,
           u2.first_name || ' ' || u2.last_name as assigned_to_name
    FROM tickets t
    LEFT JOIN users u1 ON t.client_id = u1.id
    LEFT JOIN users u2 ON t.assigned_to = u2.id
    ${whereClause}
    ORDER BY t.submitted_date DESC
    LIMIT ? OFFSET ?
  `;

  // Implementation...
}
```

## 🧪 Test Documentation

### Test Suite Documentation
```javascript
/**
 * @fileoverview API tests for ticket management endpoints
 * @description Comprehensive test suite covering CRUD operations, validation, and error handling
 */

/**
 * Test suite for ticket creation endpoint
 * @group tickets
 * @group api
 */
describe('POST /api/tickets', () => {
  /**
   * Should create a new ticket with valid data
   * @test
   * @category happy-path
   */
  it('should create a new ticket successfully', async () => {
    // Test implementation
  });

  /**
   * Should return validation error for missing required fields
   * @test
   * @category validation
   */
  it('should return validation error for missing title', async () => {
    // Test implementation
  });
});
```

## 📋 Documentation Checklist

### Before Submitting Code
- [ ] All functions have JSDoc comments
- [ ] Complex logic has inline comments explaining "why"
- [ ] TODO comments are added for future work
- [ ] Database queries are documented
- [ ] React components have prop documentation
- [ ] Test cases have descriptive names and comments
- [ ] API endpoints have request/response documentation

### Code Review Checklist
- [ ] Comments are accurate and up-to-date
- [ ] JSDoc follows project standards
- [ ] Complex business logic is explained
- [ ] Security considerations are documented
- [ ] Performance implications are noted
- [ ] Examples are provided for complex functions

## 🎯 Best Practices

### Do's
- ✅ Document public APIs and interfaces
- ✅ Explain complex business logic
- ✅ Use consistent JSDoc formatting
- ✅ Keep comments concise and clear
- ✅ Update comments when code changes
- ✅ Use examples for complex functions

### Don'ts
- ❌ Comment obvious code
- ❌ Use outdated or incorrect comments
- ❌ Write overly verbose comments
- ❌ Skip documentation for public APIs
- ❌ Use unclear or ambiguous language
- ❌ Document implementation details that change frequently

## 🔧 Tools & Automation

### JSDoc Generation
```bash
# Generate documentation
npx jsdoc src/ -d docs/

# Generate TypeScript documentation
npx typedoc src/ --out docs/typescript
```

### ESLint Rules
```json
{
  "rules": {
    "jsdoc/require-jsdoc": ["error", {
      "publicOnly": true,
      "require": {
        "FunctionDeclaration": true,
        "MethodDefinition": true,
        "ClassDeclaration": true
      }
    }],
    "jsdoc/require-param-description": "error",
    "jsdoc/require-returns-description": "error"
  }
}
```

---

**Remember**: Good documentation is an investment in the future. It helps new developers understand the codebase and existing developers maintain it effectively. 