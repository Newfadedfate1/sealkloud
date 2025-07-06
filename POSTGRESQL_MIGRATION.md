# PostgreSQL Migration Guide

This guide will help you migrate the SealKloud Helpdesk from SQLite to PostgreSQL.

## 🎯 Benefits of PostgreSQL

- **Better Performance**: Handles concurrent connections efficiently
- **Advanced Features**: JSON support, full-text search, advanced indexing
- **Scalability**: Better for production environments
- **Data Integrity**: ACID compliance and advanced constraints
- **Backup & Recovery**: Robust backup and recovery options

## 📋 Prerequisites

1. **PostgreSQL Installed**: Make sure PostgreSQL is installed on your system
2. **Node.js Dependencies**: The `pg` package is already included in package.json
3. **Database Access**: Ensure you have permission to create databases

## 🚀 Quick Setup

### Step 1: Create PostgreSQL Database

```bash
# Run the database setup script
npm run db:setup
```

This will:
- Connect to your PostgreSQL server
- Create the `sealkloud_helpdesk` database
- Provide troubleshooting steps if needed

### Step 2: Configure Environment Variables

Create a `.env` file in the project root with your PostgreSQL credentials:

```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=sealkloud_helpdesk
DB_PASSWORD=your_password_here
DB_PORT=5432

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### Step 3: Start the Application

```bash
npm run dev
```

The application will automatically:
- Connect to PostgreSQL
- Create all necessary tables
- Set up indexes for optimal performance

## 🔄 Data Migration (Optional)

If you have existing data in SQLite that you want to migrate:

```bash
# Run the migration script
npm run db:migrate
```

This will:
- Read data from the SQLite database
- Migrate all tables to PostgreSQL
- Preserve all relationships and data integrity
- Show a summary of migrated records

## 🛠️ Manual Database Creation

If the setup script doesn't work, you can create the database manually:

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE sealkloud_helpdesk;

-- Create user (optional)
CREATE USER sealkloud_user WITH PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sealkloud_helpdesk TO sealkloud_user;

-- Exit
\q
```

## 🔧 Troubleshooting

### Connection Issues

1. **Check PostgreSQL Service**:
   ```bash
   # Windows
   net start postgresql-x64-15
   
   # macOS/Linux
   sudo systemctl start postgresql
   ```

2. **Verify Connection**:
   ```bash
   psql -U postgres -h localhost -p 5432
   ```

3. **Check Credentials**: Ensure your `.env` file has correct credentials

### Permission Issues

1. **Database Creation**: Ensure your user has `CREATEDB` privilege
2. **Table Creation**: Ensure your user has proper permissions on the database

### Data Type Issues

The migration handles common data type conversions:
- SQLite `INTEGER` → PostgreSQL `SERIAL`
- SQLite `TEXT` → PostgreSQL `VARCHAR` or `TEXT`
- SQLite `INTEGER` (boolean) → PostgreSQL `BOOLEAN`

## 📊 Performance Optimizations

The new PostgreSQL setup includes:

- **Connection Pooling**: Efficient connection management
- **Indexes**: Optimized queries on frequently accessed columns
- **Proper Data Types**: Better storage and query performance
- **Transaction Support**: ACID compliance for data integrity

## 🔍 Monitoring

Monitor your PostgreSQL database:

```bash
# Check active connections
SELECT * FROM pg_stat_activity;

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## 🚨 Important Notes

1. **Backup First**: Always backup your SQLite data before migration
2. **Test Environment**: Test the migration in a development environment first
3. **Downtime**: Plan for minimal downtime during migration
4. **Rollback Plan**: Keep your SQLite database as backup until migration is verified

## 📞 Support

If you encounter issues:

1. Check the PostgreSQL logs
2. Verify your connection settings
3. Ensure all dependencies are installed
4. Check the troubleshooting section above

## 🎉 Migration Complete!

Once migration is successful:

1. ✅ All data is preserved
2. ✅ Better performance and scalability
3. ✅ Production-ready database setup
4. ✅ Advanced features available

Your SealKloud Helpdesk is now running on PostgreSQL! 🚀 