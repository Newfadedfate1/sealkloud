# SealKloud Helpdesk System

A comprehensive, production-ready helpdesk system built with React, Node.js, and PostgreSQL. Features role-based access control, ticket management, real-time dashboards, and scalable architecture.

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

### **Backend**
- **Node.js** with Express
- **PostgreSQL** database
- **JWT** authentication
- **bcryptjs** for password hashing
- **Express Rate Limiting** for security

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd sealkloud-helpdesk
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb sealkloud_helpdesk

# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials
```

### 4. Environment Configuration
Update `.env` file with your settings:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sealkloud_helpdesk
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_key
PORT=3001
CLIENT_URL=http://localhost:5173
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

### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/register
```

### Ticket Endpoints
```
GET    /api/tickets              # Get all tickets (with filters)
GET    /api/tickets/:ticketId    # Get single ticket
POST   /api/tickets              # Create new ticket
PATCH  /api/tickets/:ticketId    # Update ticket
```

### User Management
```
GET    /api/users                # Get all users (admin only)
GET    /api/users/profile        # Get current user profile
PATCH  /api/users/profile        # Update profile
PATCH  /api/users/password       # Change password
PATCH  /api/users/:userId/role   # Update user role (admin only)
```

### Dashboard
```
GET    /api/dashboard/stats      # Get dashboard statistics
GET    /api/dashboard/activity   # Get recent activity
```

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
├── problem_level (low|medium|high|critical)
├── status (open|unassigned|in-progress|resolved|closed)
├── assigned_to (Foreign Key)
└── submitted_date, last_updated, resolved_date

ticket_activities
├── id (Primary Key)
├── ticket_id (Foreign Key)
├── user_id (Foreign Key)
├── action, description
└── timestamp
```

### Security Features
- **JWT Authentication** with secure token handling
- **Password Hashing** using bcryptjs with salt rounds
- **Rate Limiting** to prevent abuse
- **Input Validation** using express-validator
- **SQL Injection Protection** with parameterized queries
- **CORS Configuration** for secure cross-origin requests

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
DB_HOST=your-production-db-host
JWT_SECRET=your-production-secret
CLIENT_URL=https://your-domain.com
```

### Recommended Deployment Stack
- **Frontend**: Netlify, Vercel, or AWS S3 + CloudFront
- **Backend**: AWS EC2, DigitalOcean, or Heroku
- **Database**: AWS RDS PostgreSQL or managed PostgreSQL service

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

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint
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