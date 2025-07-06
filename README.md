# SealKloud Helpdesk System

A comprehensive, production-ready helpdesk system built with React, Node.js, and SQLite. Features role-based access control, ticket management, real-time dashboards, and scalable architecture.

## 🎯 Quick Start

```bash
# Clone and install
git clone <repository-url>
cd sealkloud
npm install

# Start development
npm run dev

# Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

## 🚀 Features

### 🎯 **Core Functionality**
- **Role-Based Authentication** - Client, Employee (L1/L2/L3), Admin access levels
- **Comprehensive Ticket Management** - Create, assign, track, and resolve tickets
- **Real-Time Dashboards** - Interactive charts and statistics
- **Advanced Filtering & Search** - Find tickets quickly with multiple filters
- **Activity Logging** - Complete audit trail for all ticket actions
- **CSV Export** - Generate reports for analysis

### 🎨 **User Experience**
- **Beautiful, Modern UI** - Professional design with smooth animations
- **Responsive Design** - Works perfectly on all devices
- **Intuitive Navigation** - Easy-to-use interface for all user types
- **Real-Time Updates** - Live data synchronization

### 🔧 **Technical Features**
- **Scalable Architecture** - Built for high concurrency and large datasets
- **Security First** - JWT authentication, input validation, SQL injection protection
- **Database Optimization** - Indexed queries, pagination, efficient data structures
- **Company Customization** - Easy rebranding for different organizations
- **Comprehensive API** - RESTful API with detailed documentation
- **Rate Limiting** - Role-based rate limiting to prevent abuse
- **Error Handling** - Structured error responses with error codes

## 🚀 Features

### 🎯 **Core Functionality**
- **Role-Based Authentication** - Client, Employee (L1/L2/L3), Admin access levels
- **Comprehensive Ticket Management** - Create, assign, track, and resolve tickets
- **Real-Time Dashboards** - Interactive charts and statistics
- **Advanced Filtering & Search** - Find tickets quickly with multiple filters
- **Activity Logging** - Complete audit trail for all ticket actions
- **CSV Export** - Generate reports for analysis

### 🎨 **User Experience**
- **Beautiful, Modern UI** - Professional design with smooth animations
- **Responsive Design** - Works perfectly on all devices
- **Intuitive Navigation** - Easy-to-use interface for all user types
- **Real-Time Updates** - Live data synchronization

### 🔧 **Technical Features**
- **Scalable Architecture** - Built for high concurrency and large datasets
- **Security First** - JWT authentication, input validation, SQL injection protection
- **Database Optimization** - Indexed queries, pagination, efficient data structures
- **Company Customization** - Easy rebranding for different organizations

## 🛠️ Technology Stack

### **Frontend**
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **Vite** for development and building
- **Socket.io Client** for real-time communication

### **Backend**
- **Node.js** with Express
- **SQLite** database (production-ready with proper indexing)
- **JWT** authentication with role-based access control
- **bcryptjs** for password hashing
- **Express Rate Limiting** with role-based limits
- **Socket.io** for real-time features
- **Helmet** for security headers
- **CORS** for cross-origin requests

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd sealkloud
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy environment variables
cp env.example .env

# Edit .env with your settings
```

### 4. Environment Variables
Update `.env` file with your settings:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_key_here

# Client Configuration
CLIENT_URL=http://localhost:5173

# Database Configuration (SQLite)
DB_PATH=./server/data/sealkloud.db

# Optional: Maintenance Mode
MAINTENANCE_MODE=false
```

### 5. Initialize Database
```bash
# The database tables will be created automatically on first run
# Or run the seed script to populate with sample data
node server/scripts/seed.js
```

### 6. Start Development
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:client  # Frontend only
npm run dev:server  # Backend only
```

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Client** | client@sealkloud.com | password123 |
| **Employee L1** | employee@sealkloud.com | password123 |
| **Employee L2** | l2tech@sealkloud.com | password123 |
| **Employee L3** | l3expert@sealkloud.com | password123 |
| **Admin** | admin@sealkloud.com | password123 |

## 📊 API Documentation

Comprehensive API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Quick API Reference

#### Authentication
```
POST /api/auth/login          # Login user
POST /api/auth/register       # Register new user
```

#### Tickets
```
GET    /api/tickets           # Get all tickets (with filters)
GET    /api/tickets/:id       # Get single ticket
POST   /api/tickets           # Create new ticket
PATCH  /api/tickets/:id       # Update ticket
```

#### Users
```
GET    /api/users             # Get all users (admin only)
GET    /api/users/profile     # Get current user profile
PATCH  /api/users/profile     # Update profile
PATCH  /api/users/password    # Change password
```

#### Dashboard
```
GET    /api/dashboard/stats   # Get dashboard statistics
GET    /api/dashboard/activity # Get recent activity
```

#### System
```
GET    /api/health            # Health check
```

### Error Codes
The API uses standardized error codes:
- `AUTH_1001-AUTH_1099` - Authentication errors
- `VAL_2001-VAL_2099` - Validation errors  
- `RES_3001-RES_3099` - Resource errors
- `DB_4001-DB_4099` - Database errors
- `RATE_5001` - Rate limiting errors
- `BIZ_6001-BIZ_6099` - Business logic errors
- `SYS_9001-SYS_9099` - System errors

## 🏗️ Architecture

### Database Schema
```sql
users
├── id (Primary Key)
├── email (Unique)
├── password_hash
├── first_name, last_name
├── role (client|employee_l1|employee_l2|employee_l3|admin)
├── company_id
└── is_active, created_at, updated_at

tickets
├── id (Primary Key)
├── ticket_id (Unique, e.g., TK-001)
├── client_name, client_id
├── title, description
├── priority (low|medium|high|critical)
├── status (open|in-progress|resolved|closed)
├── assigned_to (Foreign Key)
└── submitted_date, last_updated, resolved_date

ticket_activities
├── id (Primary Key)
├── ticket_id (Foreign Key)
├── user_id (Foreign Key)
├── action, description
└── timestamp

ticket_chats
├── id (Primary Key)
├── ticket_id (Foreign Key)
├── sender_id (Foreign Key)
├── sender_role, message
└── timestamp
```

### Security Features
- **JWT Authentication** with secure token handling and role-based access control
- **Password Hashing** using bcryptjs with salt rounds
- **Role-Based Rate Limiting** with different limits for different user roles
- **Input Validation** using express-validator with comprehensive error messages
- **SQL Injection Protection** with parameterized queries
- **CORS Configuration** for secure cross-origin requests
- **Helmet Security Headers** for additional protection
- **Maintenance Mode** for controlled service downtime

## 🎨 Customization

### Company Branding
Update `src/config/company.ts`:
```typescript
export const companyConfig = {
  name: "Your Company Name",
  primaryColor: "#your-color",
  supportEmail: "support@yourcompany.com",
  // ... other settings
};
```

### Role Customization
Modify user roles in `src/types/user.ts` and update corresponding logic.

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3001
JWT_SECRET=your_production_secret_key
CLIENT_URL=https://yourdomain.com
MAINTENANCE_MODE=false
```

### Docker Deployment (Optional)
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Deployment Checklist
- [ ] Set production environment variables
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up SSL certificates
- [ ] Configure database backups
- [ ] Set up monitoring and logging
- [ ] Test all functionality in production environment

### Recommended Deployment Stack
- **Frontend**: Netlify, Vercel, or AWS S3 + CloudFront
- **Backend**: AWS EC2, DigitalOcean, or Heroku
- **Database**: SQLite (embedded) or PostgreSQL for larger deployments

## 📈 Performance Optimization

### Database Optimization
- Indexed columns for frequent queries
- Pagination for large datasets
- Connection pooling
- Query optimization

### Frontend Optimization
- Code splitting with React.lazy
- Image optimization
- Bundle size optimization with Vite
- Caching strategies

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run server tests only
npm run test:server

# Run frontend tests only
npm test

# Run all tests (frontend + backend)
npm run test:all
```

### Test Coverage
The project includes comprehensive test coverage:
- **Frontend**: React components, hooks, and utilities
- **Backend**: API endpoints, middleware, and database operations
- **Integration**: End-to-end API testing with authentication and error scenarios

### Test Structure
```
src/components/__tests__/          # Frontend component tests
server/__tests__/                  # Backend API tests
src/utils/test-utils.tsx           # Test utilities and helpers
```

## 🔧 Development

### Available Scripts
```bash
npm run dev              # Start both frontend and backend
npm run dev:client       # Start frontend only
npm run dev:server       # Start backend only
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
```

### Code Quality
- **ESLint** configuration for consistent code style
- **TypeScript** for type safety
- **Prettier** for code formatting
- **Husky** for pre-commit hooks (optional)

### Development Workflow
1. **Feature Development**: Create feature branches from `main`
2. **Testing**: Write tests for new features
3. **Code Review**: Submit pull requests for review
4. **Integration**: Merge to `main` after approval

### Debugging
```bash
# Debug frontend
npm run dev:client

# Debug backend
DEBUG=* npm run dev:server

# Debug tests
npm run test:watch
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@sealkloud.com or create an issue in the repository.

---

**Built with ❤️ for efficient helpdesk management**