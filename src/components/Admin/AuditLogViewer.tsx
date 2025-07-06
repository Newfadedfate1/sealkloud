import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Calendar, User, Activity, Eye, EyeOff, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { auditAPI } from '../../services/api';

interface AuditLogEntry {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  resource_name: string;
  details: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AuditStats {
  totalLogs: number;
  todayLogs: number;
  thisWeekLogs: number;
  thisMonthLogs: number;
  topActions: Array<{ action: string; count: number }>;
  topUsers: Array<{ user: string; count: number }>;
}

interface AuditLogViewerProps {
  onClose: () => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ onClose }) => {
  // State management
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditStats>({
    totalLogs: 0,
    todayLogs: 0,
    thisWeekLogs: 0,
    thisMonthLogs: 0,
    topActions: [],
    topUsers: []
  });
  const [loading, setLoading] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    action: '',
    resourceType: '',
    severity: '',
    userEmail: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);

  // Load audit logs from API
  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await auditAPI.getAll({
        page: currentPage,
        limit: itemsPerPage,
        action: filters.action || undefined,
        resourceType: filters.resourceType || undefined,
        severity: filters.severity || undefined,
        userEmail: filters.userEmail || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        search: filters.search || undefined
      });

      if (response.success && response.data) {
        setLogs(response.data.logs || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load audit stats
  const loadAuditStats = async () => {
    try {
      const response = await auditAPI.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading audit stats:', error);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    loadAuditLogs();
    loadAuditStats();
  }, [currentPage, filters]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadAuditLogs();
      loadAuditStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const response = await auditAPI.export(format, filters.startDate, filters.endDate);
      if (response.success) {
        // Handle export download
        console.log('Export successful:', response.data);
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Audit Log Viewer</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">System activity and security logs</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  loadAuditLogs();
                  loadAuditStats();
                }}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalLogs}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Total Logs</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.todayLogs}</div>
              <div className="text-sm text-green-600 dark:text-green-400">Today</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.thisWeekLogs}</div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">This Week</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.thisMonthLogs}</div>
              <div className="text-sm text-purple-600 dark:text-purple-400">This Month</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Actions</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resource Type</label>
              <select
                value={filters.resourceType}
                onChange={(e) => handleFilterChange('resourceType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Resources</option>
                <option value="user">User</option>
                <option value="ticket">Ticket</option>
                <option value="role">Role</option>
                <option value="workflow">Workflow</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User Email</label>
              <input
                type="text"
                value={filters.userEmail}
                onChange={(e) => handleFilterChange('userEmail', e.target.value)}
                placeholder="Search by email..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search in details..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading audit logs...</p>
            </div>
          ) : logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(log.severity)}`}>
                          {log.severity.toUpperCase()}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">{log.action}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">on</span>
                        <span className="font-medium text-gray-900 dark:text-white">{log.resource_type}</span>
                        {log.resource_name && (
                          <>
                            <span className="text-sm text-gray-600 dark:text-gray-400">:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{log.resource_name}</span>
                          </>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="font-medium">{log.user_email}</span>
                        <span className="mx-2">•</span>
                        <span>{formatTimestamp(log.timestamp)}</span>
                      </div>
                      {expandedLogs.has(log.id) && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <div><strong>Details:</strong> {log.details}</div>
                            <div><strong>IP Address:</strong> {log.ip_address}</div>
                            <div><strong>User Agent:</strong> {log.user_agent}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => toggleLogExpansion(log.id)}
                      className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {expandedLogs.has(log.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No audit logs found</p>
              <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 