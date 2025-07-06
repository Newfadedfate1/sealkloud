import { initializeDatabase, getDatabase } from '../config/database.js';

const seedAuditLogs = async () => {
  try {
    await initializeDatabase();
    const db = getDatabase();

    // Sample audit log entries
    const auditLogs = [
      {
        user_id: 1,
        user_email: 'admin@sealkloud.com',
        action: 'LOGIN_SUCCESS',
        resource_type: 'Auth',
        resource_id: '1',
        resource_name: 'Admin User',
        details: 'User logged in successfully',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
      },
      {
        user_id: 2,
        user_email: 'employee@sealkloud.com',
        action: 'TICKET_CREATED',
        resource_type: 'Ticket',
        resource_id: 'TK-001',
        resource_name: 'System Login Issue',
        details: 'Created new support ticket',
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        severity: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 minutes ago
      },
      {
        user_id: 1,
        user_email: 'admin@sealkloud.com',
        action: 'USER_CREATED',
        resource_type: 'User',
        resource_id: '3',
        resource_name: 'John Doe (john@sealkloud.com)',
        details: 'Created new user with role: client',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        user_id: 2,
        user_email: 'employee@sealkloud.com',
        action: 'TICKET_UPDATED',
        resource_type: 'Ticket',
        resource_id: 'TK-001',
        resource_name: 'System Login Issue',
        details: 'Status changed to In Progress',
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        severity: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 minutes ago
      },
      {
        user_id: 1,
        user_email: 'admin@sealkloud.com',
        action: 'USER_ROLE_CHANGED',
        resource_type: 'User',
        resource_id: '2',
        resource_name: 'Jane Employee (employee@sealkloud.com)',
        details: 'Role changed from employee_l1 to employee_l2',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
      },
      {
        user_id: 3,
        user_email: 'client@sealkloud.com',
        action: 'LOGIN_FAILED',
        resource_type: 'Auth',
        resource_id: '3',
        resource_name: 'Client User',
        details: 'Failed login attempt - incorrect password',
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
        severity: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() // 1.5 hours ago
      },
      {
        user_id: 1,
        user_email: 'admin@sealkloud.com',
        action: 'SYSTEM_BACKUP',
        resource_type: 'System',
        resource_id: 'BACKUP-001',
        resource_name: 'Database Backup',
        details: 'Automated daily backup completed successfully',
        ip_address: '192.168.1.100',
        user_agent: 'System/BackupService',
        severity: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
      },
      {
        user_id: 2,
        user_email: 'employee@sealkloud.com',
        action: 'TICKET_RESOLVED',
        resource_type: 'Ticket',
        resource_id: 'TK-001',
        resource_name: 'System Login Issue',
        details: 'Ticket resolved - password reset completed',
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        severity: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString() // 3 hours ago
      },
      {
        user_id: 1,
        user_email: 'admin@sealkloud.com',
        action: 'SECURITY_ALERT',
        resource_type: 'Security',
        resource_id: 'SEC-001',
        resource_name: 'Multiple Failed Logins',
        details: 'Detected multiple failed login attempts from IP 192.168.1.105',
        ip_address: '192.168.1.100',
        user_agent: 'System/SecurityMonitor',
        severity: 'error',
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString() // 4 hours ago
      },
      {
        user_id: 1,
        user_email: 'admin@sealkloud.com',
        action: 'USER_DELETED',
        resource_type: 'User',
        resource_id: '4',
        resource_name: 'Test User (test@sealkloud.com)',
        details: 'User account deactivated',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString() // 5 hours ago
      }
    ];

    // Insert audit logs
    for (const log of auditLogs) {
      await db.run(
        `INSERT INTO audit_logs (
          user_id, user_email, action, resource_type, resource_id,
          resource_name, details, ip_address, user_agent, severity, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          log.user_id,
          log.user_email,
          log.action,
          log.resource_type,
          log.resource_id,
          log.resource_name,
          log.details,
          log.ip_address,
          log.user_agent,
          log.severity,
          log.timestamp
        ]
      );
    }

    console.log('✅ Audit logs seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding audit logs:', error);
    process.exit(1);
  }
};

seedAuditLogs(); 