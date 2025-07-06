# Developer Onboarding Guide

Welcome to the SealKloud Helpdesk project! This guide will help you get started with development, understand the architecture, and contribute effectively.

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **VS Code** (recommended) - [Download here](https://code.visualstudio.com/)

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd sealkloud

# Install dependencies
npm install

# Set up environment
cp env.example .env
# Edit .env with your settings

# Start development
npm run dev
```

### First Run
1. Open http://localhost:5173 in your browser
2. Use demo credentials to log in:
   - **Admin**: admin@sealkloud.com / password123
   - **Employee**: employee@sealkloud.com / password123
   - **Client**: client@sealkloud.com / password123

## 🏗️ Project Architecture

### Frontend (React + TypeScript)
```
src/
├── components/           # React components
│   ├── Auth/            # Authentication components
│   ├── Dashboard/       # Dashboard components
│   ├── Tickets/         # Ticket management
│   └── __tests__/       # Component tests
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
├── services/            # API service layer
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── main.tsx            # Application entry point
```

### Backend (Node.js + Express)
```
server/
├── config/              # Configuration files
├── middleware/          # Express middleware
├── routes/              # API route handlers
├── scripts/             # Database scripts
├── __tests__/           # Backend tests
└── index.js            # Server entry point
```

### Database (SQLite)
- **Location**: `server/data/sealkloud.db`
- **Schema**: See README.md for complete schema
- **Migrations**: Automatic on first run

## 🎯 Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature-name
```

### 2. Testing
```bash
# Run all tests
npm run test:all

# Run specific test suites
npm test                    # Frontend tests
npm run test:server         # Backend tests
npm run test:coverage       # Coverage report
```

### 3. Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npx tsc --noEmit
```

## 📝 Coding Standards

### TypeScript
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use type guards for runtime type checking
- Avoid `any` type - use `unknown` instead

### React Components
```typescript
// Good example
interface TicketCardProps {
  ticket: Ticket;
  onEdit?: (ticket: Ticket) => void;
  onDelete?: (id: number) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onEdit,
  onDelete
}) => {
  // Component logic
};
```

### API Routes
```javascript
// Good example
router.get('/tickets', authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const tickets = await getTickets({ page, limit, status });
    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
});
```

### Error Handling
```javascript
// Use structured error responses
import { createError, ERROR_CODES } from '../middleware/errorHandler.js';

// In your route
if (!user) {
  throw createError(ERROR_CODES.AUTH_USER_NOT_FOUND, 'User not found');
}
```

## 🔧 Development Tools

### VS Code Extensions (Recommended)
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript Importer** - Auto-import types
- **Thunder Client** - API testing
- **SQLite Viewer** - Database inspection

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Debugging
```bash
# Debug frontend
npm run dev:client

# Debug backend
DEBUG=* npm run dev:server

# Debug tests
npm run test:watch
```

## 🧪 Testing Guidelines

### Frontend Testing
```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { TicketCard } from '../TicketCard';

describe('TicketCard', () => {
  it('should display ticket information', () => {
    const mockTicket = {
      id: 1,
      title: 'Test Ticket',
      status: 'open'
    };

    render(<TicketCard ticket={mockTicket} />);
    
    expect(screen.getByText('Test Ticket')).toBeInTheDocument();
    expect(screen.getByText('open')).toBeInTheDocument();
  });
});
```

### Backend Testing
```javascript
// API test example
describe('GET /api/tickets', () => {
  it('should return tickets with pagination', async () => {
    const response = await request(app)
      .get('/api/tickets?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.tickets).toBeInstanceOf(Array);
    expect(response.body.data.pagination).toBeDefined();
  });
});
```

### Test Coverage Requirements
- **Frontend**: Minimum 80% coverage
- **Backend**: Minimum 85% coverage
- **Critical paths**: 100% coverage

## 🔒 Security Guidelines

### Authentication
- Always validate JWT tokens
- Use role-based access control
- Implement proper session management

### Input Validation
```javascript
// Use express-validator
import { body, validationResult } from 'express-validator';

const validateTicket = [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('description').trim().isLength({ min: 1, max: 2000 }),
  body('priority').isIn(['low', 'medium', 'high', 'critical'])
];
```

### Database Security
- Use parameterized queries
- Validate all inputs
- Implement proper error handling

## 📊 Performance Guidelines

### Frontend Optimization
- Use React.memo for expensive components
- Implement proper loading states
- Optimize bundle size with code splitting

### Backend Optimization
- Use database indexing
- Implement pagination
- Cache frequently accessed data

### Database Optimization
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
```

## 🚀 Deployment

### Local Production Build
```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Environment Variables
```env
# Development
NODE_ENV=development
PORT=3001
JWT_SECRET=dev_secret_key
CLIENT_URL=http://localhost:5173

# Production
NODE_ENV=production
PORT=3001
JWT_SECRET=your_production_secret_key
CLIENT_URL=https://yourdomain.com
MAINTENANCE_MODE=false
```

## 🤝 Contributing

### Pull Request Process
1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Add** tests for new functionality
5. **Update** documentation if needed
6. **Submit** a pull request

### Commit Message Format
```
type(scope): description

feat(auth): add two-factor authentication
fix(tickets): resolve pagination issue
docs(readme): update installation instructions
test(api): add user endpoint tests
```

### Code Review Checklist
- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance impact considered

## 🆘 Getting Help

### Resources
- **API Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Testing Guide**: [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Issue Tracker**: GitHub Issues
- **Discussions**: GitHub Discussions

### Common Issues
1. **Port already in use**: Change PORT in .env
2. **Database locked**: Restart the server
3. **JWT errors**: Check JWT_SECRET in .env
4. **CORS errors**: Verify CLIENT_URL in .env

### Support Channels
- **Email**: dev-support@sealkloud.com
- **Slack**: #sealkloud-dev
- **GitHub Issues**: For bugs and feature requests

## 📚 Learning Resources

### React & TypeScript
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Node.js & Express
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Jest Testing](https://jestjs.io/docs/getting-started)

### Database & SQL
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [SQL Best Practices](https://www.sqlstyle.guide/)

---

**Happy coding! 🚀**

For questions or clarifications, don't hesitate to reach out to the team. 