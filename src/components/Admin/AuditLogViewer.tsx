import React, { useState, useEffect } from 'react';
import { Shield, FileText, Activity, AlertTriangle, AlertCircle, Info, Zap, RefreshCw, Search, Filter, Download, Calendar, User, Clock } from 'lucide-react';

export interface AuditLogEntry {
  id: string;
  userId?: string;
  userEmail: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
}

interface AuditStats {
  total: number;
  bySeverity: Record<string, number>;
  byAction: Array<{ action: string; count: number }>;
  recentActivity: number;
  byResourceType: Array<{ resource_type: string; count: number }>;
}

interface AuditFilters {
  search: string;
  action: string;
  resourceType: string;
  severity: string;
  userEmail: string;
  startDate: string;
  endDate: string;
}

// Mock audit log data
const mockAuditLogs: AuditLogEntry[] = [
  {
    id: '1',
    userEmail: 'admin@sealkloud.com',
    action: 'user_login',
    resourceType: 'auth',
    details: 'Successful login',
    severity: 'info',
    timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
  },
  {
    id: '2',
    userEmail: 'employee@sealkloud.com',
    action: 'ticket_created',
    resourceType: 'ticket',
    resourceId: 'TICKET-001',
    details: 'New support ticket created',
    severity: 'info',
    timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
  },
  {
    id: '3',
    userEmail: 'client@sealkloud.com',
    action: 'user_login',
    resourceType: 'auth',
    details: 'Failed login attempt',
    severity: 'warning',
    timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
  },
  {
    id: '4',
    userEmail: 'admin@sealkloud.com',
    action: 'user_created',
    resourceType: 'user',
    resourceId: 'USER-005',
    details: 'New user account created',
    severity: 'info',
    timestamp: new Date(Date.now() - 1200000).toISOString(), // 20 minutes ago
  },
  {
    id: '5',
    userEmail: 'l2tech@sealkloud.com',
    action: 'ticket_updated',
    resourceType: 'ticket',
    resourceId: 'TICKET-002',
    details: 'Ticket status changed to In Progress',
    severity: 'info',
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
  },
  {
    id: '6',
    userEmail: 'admin@sealkloud.com',
    action: 'system_backup',
    resourceType: 'system',
    details: 'Database backup completed',
    severity: 'info',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: '7',
    userEmail: 'unknown@sealkloud.com',
    action: 'user_login',
    resourceType: 'auth',
    details: 'Multiple failed login attempts',
    severity: 'error',
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  },
  {
    id: '8',
    userEmail: 'admin@sealkloud.com',
    action: 'role_updated',
    resourceType: 'user',
    resourceId: 'USER-003',
    details: 'User role changed from employee to admin',
    severity: 'warning',
    timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
  }
];

const mockStats: AuditStats = {
  total: mockAuditLogs.length,
  bySeverity: {
    info: 5,
    warning: 2,
    error: 1,
    critical: 0
  },
  byAction: [
    { action: 'user_login', count: 3 },
    { action: 'ticket_created', count: 1 },
    { action: 'ticket_updated', count: 1 },
    { action: 'user_created', count: 1 },
    { action: 'system_backup', count: 1 },
    { action: 'role_updated', count: 1 }
  ],
  recentActivity: 3,
  byResourceType: [
    { resource_type: 'auth', count: 3 },
    { resource_type: 'ticket', count: 2 },
    { resource_type: 'user', count: 2 },
    { resource_type: 'system', count: 1 }
  ]
};

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [stats, setStats] = useState<AuditStats>(mockStats);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filters, setFilters] = useState<AuditFilters>({
    search: '',
    action: '',
    resourceType: '',
    severity: '',
    userEmail: '',
    startDate: '',
    endDate: ''
  });

  // Filter logs based on current filters
  const filteredLogs = logs.filter(log => {
    if (filters.search && !log.details?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.action && log.action !== filters.action) {
      return false;
    }
    if (filters.resourceType && log.resourceType !== filters.resourceType) {
      return false;
    }
    if (filters.severity && log.severity !== filters.severity) {
      return false;
    }
    if (filters.userEmail && !log.userEmail.toLowerCase().includes(filters.userEmail.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Get severity icon and color
  const getSeverityInfo = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      case 'error':
        return { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
      case 'warning':
        return { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
      default:
        return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      action: '',
      resourceType: '',
      severity: '',
      userEmail: '',
      startDate: '',
      endDate: ''
    });
  };

  // Export logs
  const handleExport = (format: 'csv' | 'json') => {
    try {
      let data: string;
      let filename: string;
      let mimeType: string;

      if (format === 'csv') {
        const headers = ['ID', 'User Email', 'Action', 'Resource Type', 'Details', 'Severity', 'Timestamp'];
        const csvContent = [
          headers.join(','),
          ...filteredLogs.map(log => [
            log.id,
            log.userEmail,
            log.action,
            log.resourceType,
            log.details?.replace(/,/g, ';') || '',
            log.severity,
            log.timestamp
          ].join(','))
        ].join('\n');
        
        data = csvContent;
        filename = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        data = JSON.stringify(filteredLogs, null, 2);
        filename = `audit_logs_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }

      const blob = new Blob([data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Audit Log</h2>
              <p className="text-indigo-100 mt-1">Monitor system activity and security events</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
              title={autoRefresh ? 'Auto-refresh enabled' : 'Enable auto-refresh'}
            >
              <Zap className={`h-5 w-5 ${autoRefresh ? 'text-yellow-300' : ''}`} />
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Export CSV"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Logs</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Recent Activity</p>
              <p className="text-2xl font-bold text-green-900">{stats.recentActivity}</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Info</p>
              <p className="text-2xl font-bold text-purple-900">{stats.bySeverity.info}</p>
            </div>
            <Info className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Warnings</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.bySeverity.warning}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Errors</p>
              <p className="text-2xl font-bold text-orange-900">{stats.bySeverity.error}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Critical</p>
              <p className="text-2xl font-bold text-red-900">{stats.bySeverity.critical}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search logs..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Actions</option>
              <option value="user_login">User Login</option>
              <option value="ticket_created">Ticket Created</option>
              <option value="ticket_updated">Ticket Updated</option>
              <option value="user_created">User Created</option>
              <option value="system_backup">System Backup</option>
              <option value="role_updated">Role Updated</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Severity
            </label>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User Email
            </label>
            <input
              type="text"
              value={filters.userEmail}
              onChange={(e) => handleFilterChange('userEmail', e.target.value)}
              placeholder="Filter by user..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Audit Logs ({filteredLogs.length})
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('json')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <Download className="h-4 w-4" />
                Export JSON
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log) => {
                const severityInfo = getSeverityInfo(log.severity);
                const SeverityIcon = severityInfo.icon;
                
                return (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${severityInfo.bg} ${severityInfo.border}`}>
                          <SeverityIcon className={`h-4 w-4 ${severityInfo.color}`} />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.details}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {log.resourceType}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {log.userEmail}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityInfo.bg} ${severityInfo.color}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">No audit logs found</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}; 