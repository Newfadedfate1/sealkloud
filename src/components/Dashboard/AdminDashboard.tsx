import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Users, Ticket, BarChart3, Settings, TrendingUp, Clock, AlertTriangle, Activity, Database, Server, Eye, Filter, Key, Webhook, Zap, FileText, ShieldCheck, RefreshCw, Download, Calendar, TrendingDown, Target, CheckCircle, XCircle, X } from 'lucide-react';
import { User } from '../../types/user';
import { TicketStatsCard } from './TicketStatsCard';
import { DailyTicketTrends } from './DailyTicketTrends';
import { TicketTable } from './TicketTable';
import { UserManagementModal } from '../UserManagement/UserManagementModal';
import { mockTickets, getTicketStats, getClientTicketData } from '../../data/mockTickets';
import { ThemeToggle } from '../ThemeToggle';
import { NotificationCenter, Notification } from '../NotificationCenter';
import { SearchBar, SearchFilter, SearchSuggestion } from '../SearchBar';
import { ChatSupport } from '../ChatSupport';
import { TwoFactorAuth } from '../Auth/TwoFactorAuth';
import { AuditLogViewer } from '../Admin/AuditLogViewer';
import { RoleManagement } from '../Admin/RoleManagement';
import { ReportScheduler } from '../Admin/ReportScheduler';
import { CustomDashboard } from './CustomDashboard';
import { WorkflowAutomation } from '../Admin/WorkflowAutomation';
import { ApiWebhookSupport } from '../Admin/ApiWebhookSupport';
import { AdvancedAnalyticsDashboard } from './AdvancedAnalyticsDashboard';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

// Enhanced metrics interface
interface EnhancedMetrics {
  tickets: {
    total: number;
    open: number;
    unassigned: number;
    resolved: number;
    trend: string;
    avgResolutionTime: number;
    highPriority: number;
    overdue: number;
  };
  performance: {
    resolutionRate: number;
    avgResponseTime: number;
    slaCompliance: number;
    customerSatisfaction: number;
    firstResponseTime: number;
    escalationRate: number;
  };
  system: {
    activeUsers: number;
    uptime: number;
    serverLoad: number;
    activeSessions: number;
    databaseConnections: number;
    apiResponseTime: number;
  };
  security: {
    failedLogins: number;
    suspiciousActivities: number;
    lastSecurityScan: Date;
    vulnerabilities: number;
  };
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [tickets, setTickets] = useState(mockTickets);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Unassigned Tickets',
      message: '5 tickets require immediate attention',
      timestamp: new Date(),
      read: false,
      action: {
        label: 'View',
        onClick: () => console.log('View unassigned tickets')
      }
    },
    {
      id: '2',
      type: 'info',
      title: 'System Update',
      message: 'New features have been deployed',
      timestamp: new Date(Date.now() - 3600000),
      read: true
    }
  ]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Phase 2 Component States
  const [showTwoFactorAuth, setShowTwoFactorAuth] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showRoleManagement, setShowRoleManagement] = useState(false);
  const [showReportScheduler, setShowReportScheduler] = useState(false);
  const [showCustomDashboard, setShowCustomDashboard] = useState(false);
  const [showWorkflowAutomation, setShowWorkflowAutomation] = useState(false);
  const [showApiWebhookSupport, setShowApiWebhookSupport] = useState(false);
  
  const ticketStats = getTicketStats();
  
  // Mock daily ticket trends data
  const dailyTicketData = [
    { date: 'Mon', created: 12, resolved: 10 },
    { date: 'Tue', created: 15, resolved: 14 },
    { date: 'Wed', created: 8, resolved: 12 },
    { date: 'Thu', created: 20, resolved: 18 },
    { date: 'Fri', created: 14, resolved: 16 },
    { date: 'Sat', created: 6, resolved: 8 },
    { date: 'Sun', created: 4, resolved: 6 }
  ];
  
  // Enhanced admin metrics with real-time simulation
  const [metrics, setMetrics] = useState<EnhancedMetrics>({
    tickets: {
      total: ticketStats.total,
      open: ticketStats.open,
      unassigned: ticketStats.unassigned,
      resolved: ticketStats.resolved,
      trend: '+12%',
      avgResolutionTime: 4.2,
      highPriority: 8,
      overdue: 3
    },
    performance: {
      resolutionRate: 92,
      avgResponseTime: 2.4,
      slaCompliance: 98.5,
      customerSatisfaction: 4.6,
      firstResponseTime: 1.8,
      escalationRate: 15
    },
    system: {
      activeUsers: 156,
      uptime: 99.9,
      serverLoad: 65,
      activeSessions: 143,
      databaseConnections: 24,
      apiResponseTime: 120
    },
    security: {
      failedLogins: 3,
      suspiciousActivities: 1,
      lastSecurityScan: new Date(Date.now() - 3600000 * 6), // 6 hours ago
      vulnerabilities: 0
    }
  });

  // Real-time data simulation
  const simulateRealTimeUpdates = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      tickets: {
        ...prev.tickets,
        total: prev.tickets.total + Math.floor(Math.random() * 3) - 1,
        open: Math.max(0, prev.tickets.open + Math.floor(Math.random() * 2) - 1),
        unassigned: Math.max(0, prev.tickets.unassigned + Math.floor(Math.random() * 2) - 1),
        resolved: prev.tickets.resolved + Math.floor(Math.random() * 2),
        highPriority: Math.max(0, prev.tickets.highPriority + Math.floor(Math.random() * 2) - 1),
        overdue: Math.max(0, prev.tickets.overdue + Math.floor(Math.random() * 2) - 1)
      },
      performance: {
        ...prev.performance,
        resolutionRate: Math.min(100, Math.max(80, prev.performance.resolutionRate + (Math.random() - 0.5) * 2)),
        avgResponseTime: Math.max(0.5, prev.performance.avgResponseTime + (Math.random() - 0.5) * 0.5),
        slaCompliance: Math.min(100, Math.max(95, prev.performance.slaCompliance + (Math.random() - 0.5) * 1)),
        customerSatisfaction: Math.min(5, Math.max(4, prev.performance.customerSatisfaction + (Math.random() - 0.5) * 0.2))
      },
      system: {
        ...prev.system,
        activeUsers: Math.max(100, prev.system.activeUsers + Math.floor(Math.random() * 10) - 5),
        serverLoad: Math.min(100, Math.max(20, prev.system.serverLoad + (Math.random() - 0.5) * 10)),
        activeSessions: Math.max(100, prev.system.activeSessions + Math.floor(Math.random() * 20) - 10),
        databaseConnections: Math.max(10, prev.system.databaseConnections + Math.floor(Math.random() * 4) - 2),
        apiResponseTime: Math.max(50, prev.system.apiResponseTime + (Math.random() - 0.5) * 20)
      },
      security: {
        ...prev.security,
        failedLogins: Math.max(0, prev.security.failedLogins + Math.floor(Math.random() * 3) - 1),
        suspiciousActivities: Math.max(0, prev.security.suspiciousActivities + Math.floor(Math.random() * 2) - 1)
      }
    }));
    setLastUpdate(new Date());
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      simulateRealTimeUpdates();
    }, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, simulateRealTimeUpdates]);

  // Manual refresh
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    simulateRealTimeUpdates();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Export functionality
  const handleExportData = (type: 'metrics' | 'tickets' | 'users') => {
    const data = {
      metrics,
      tickets,
      timestamp: new Date().toISOString(),
      timeframe: selectedTimeframe
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-dashboard-${type}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Mock available users for ticket assignment
  const availableUsers = [
    { id: '1', email: 'client@sealkloud.com', firstName: 'John', lastName: 'Client', role: 'client' as const, companyId: 'sealkloud', isActive: true },
    { id: '2', email: 'employee@sealkloud.com', firstName: 'Jane', lastName: 'Employee', role: 'employee_l1' as const, companyId: 'sealkloud', isActive: true },
    { id: '3', email: 'admin@sealkloud.com', firstName: 'Admin', lastName: 'User', role: 'admin' as const, companyId: 'sealkloud', isActive: true },
    { id: '4', email: 'l2tech@sealkloud.com', firstName: 'Level 2', lastName: 'Tech', role: 'employee_l2' as const, companyId: 'sealkloud', isActive: true },
    { id: '5', email: 'l3expert@sealkloud.com', firstName: 'Level 3', lastName: 'Expert', role: 'employee_l3' as const, companyId: 'sealkloud', isActive: true }
  ];

  const handleTicketUpdate = (ticketId: string, updates: any) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    ));
  };

  const handleNotificationMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleNotificationMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSearch = (query: string, filters: SearchFilter[]) => {
    console.log('Search:', query, filters);
    // Implement search logic here
  };

  const handleSearchClear = () => {
    console.log('Search cleared');
    // Reset search results
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (value: number, threshold: number, type: 'good' | 'warning' | 'danger') => {
    if (type === 'good') return value >= threshold ? 'text-green-600' : 'text-red-600';
    if (type === 'warning') return value <= threshold ? 'text-green-600' : value <= threshold * 1.2 ? 'text-yellow-600' : 'text-red-600';
    if (type === 'danger') return value <= threshold ? 'text-green-600' : 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-red-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">System Administration & Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Simplified Real-time Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-3 h-3"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Auto</span>
                </div>
              </div>
              
              <ThemeToggle />
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={handleNotificationMarkAsRead}
                onMarkAllAsRead={handleNotificationMarkAllAsRead}
                onDelete={handleNotificationDelete}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {user.firstName} {user.lastName}
              </span>
              <button
                onClick={onLogout}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            onClear={handleSearchClear}
            placeholder="Search tickets, users, or content..."
            className="max-w-2xl"
          />
        </div>

        {/* Enhanced Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <TicketStatsCard
            title="Total Tickets"
            count={metrics.tickets.total}
            icon={Ticket}
            color="text-blue-600"
            bgColor="bg-blue-100"
            change={metrics.tickets.trend}
            trend={metrics.tickets.trend.startsWith('+') ? 'up' : 'down'}
          />
          <TicketStatsCard
            title="Resolution Rate"
            count={Math.round(metrics.performance.resolutionRate)}
            icon={TrendingUp}
            color={getStatusColor(metrics.performance.resolutionRate, 90, 'good')}
            bgColor="bg-green-100"
            change="% This month"
            trend="up"
          />
          <TicketStatsCard
            title="Avg Response Time"
            count={Number(metrics.performance.avgResponseTime.toFixed(1))}
            icon={Clock}
            color={getStatusColor(metrics.performance.avgResponseTime, 4, 'warning')}
            bgColor="bg-orange-100"
            change="hours (Target: 4h)"
            trend={metrics.performance.avgResponseTime <= 4 ? 'up' : 'down'}
          />
          <TicketStatsCard
            title="System Uptime"
            count={Number(metrics.system.uptime.toFixed(1))}
            icon={Activity}
            color={getStatusColor(metrics.system.uptime, 99.5, 'good')}
            bgColor="bg-purple-100"
            change="% Availability"
            trend="up"
          />
        </div>

        {/* Streamlined Alerts & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Critical Issues - Simplified */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Alerts</h2>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="space-y-3">
              {metrics.tickets.unassigned > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-200">{metrics.tickets.unassigned} Unassigned Tickets</p>
                    <p className="text-sm text-red-600 dark:text-red-400">Requires attention</p>
                  </div>
                  <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium">
                    View →
                  </button>
                </div>
              )}
              {metrics.tickets.overdue > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-200">{metrics.tickets.overdue} Overdue Tickets</p>
                    <p className="text-sm text-orange-600 dark:text-orange-400">SLA violations</p>
                  </div>
                  <button className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 text-sm font-medium">
                    Review →
                  </button>
                </div>
              )}
                              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-200">SLA Compliance: {metrics.performance.slaCompliance.toFixed(1)}%</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Above target</p>
                  </div>
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                    Report →
                  </button>
                </div>
            </div>
          </div>

          {/* System Health - Simplified */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Health</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">Database</span>
                </div>
                <span className="text-green-600 dark:text-green-400 font-medium">Healthy</span>
              </div>
                              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-yellow-500" />
                    <span className="text-gray-600 dark:text-gray-400">Server Load</span>
                  </div>
                  <span className={`font-medium ${getStatusColor(metrics.system.serverLoad, 80, 'warning')}`}>
                    {Math.round(metrics.system.serverLoad)}%
                  </span>
                </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                </div>
                <span className="text-gray-900 dark:text-white font-medium">{metrics.system.activeUsers}</span>
              </div>
                              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-indigo-500" />
                    <span className="text-gray-600 dark:text-gray-400">API Response</span>
                  </div>
                  <span className={`font-medium ${getStatusColor(metrics.system.apiResponseTime, 200, 'warning')}`}>
                    {Math.round(metrics.system.apiResponseTime)}ms
                  </span>
                </div>
            </div>
          </div>
        </div>

        {/* Security Overview - Compact */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security Status</h2>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400">Secure</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed Logins</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{metrics.security.failedLogins}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Suspicious Activities</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{metrics.security.suspiciousActivities}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Vulnerabilities</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{metrics.security.vulnerabilities}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Last Scan</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {metrics.security.lastSecurityScan.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Daily Ticket Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 mb-8">
          <DailyTicketTrends data={dailyTicketData} />
        </div>

        {/* Streamlined Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
            <button
              onClick={() => handleExportData('metrics')}
              className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
          </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            
            <button 
              onClick={() => setShowUserManagement(true)}
              className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors cursor-pointer"
            >
              <Users className="h-6 w-6" />
              <span className="text-sm font-medium">Users</span>
            </button>
            <button 
              onClick={() => setShowAnalytics(true)}
              className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors cursor-pointer"
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm font-medium">Analytics</span>
            </button>
            <button 
              onClick={() => setShowAuditLog(true)}
              className="bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-700 dark:text-orange-300 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors cursor-pointer"
            >
              <Eye className="h-6 w-6" />
              <span className="text-sm font-medium">Audit Log</span>
            </button>
            <button 
              onClick={() => setShowRoleManagement(true)}
              className="bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors cursor-pointer"
            >
              <ShieldCheck className="h-6 w-6" />
              <span className="text-sm font-medium">Roles</span>
            </button>
            <button 
              onClick={() => setShowWorkflowAutomation(true)}
              className="bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 text-pink-700 dark:text-pink-300 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors cursor-pointer"
            >
              <Zap className="h-6 w-6" />
              <span className="text-sm font-medium">Automation</span>
            </button>
            <button 
              onClick={() => setShowApiWebhookSupport(true)}
              className="bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors cursor-pointer"
            >
              <Webhook className="h-6 w-6" />
              <span className="text-sm font-medium">API</span>
            </button>
          </div>
        </div>



        {/* Enhanced Ticket Management Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ticket Management</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Showing {tickets.length} tickets</span>
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                  Export Data →
                </button>
              </div>
            </div>
          </div>
          <TicketTable 
            tickets={tickets} 
            isAdmin={true} 
            currentUser={user}
            availableUsers={availableUsers}
            onTicketUpdate={handleTicketUpdate}
          />
        </div>
      </main>

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={showUserManagement}
        onClose={() => setShowUserManagement(false)}
        currentUser={user}
      />

      {/* Analytics Modal */}
      {showAnalytics && (
        <AdvancedAnalyticsDashboard
          userRole="admin"
          userId={user.id}
          onClose={() => setShowAnalytics(false)}
          onExportData={(data) => {
            console.log('Exporting analytics data:', data);
            // Implement export functionality
          }}
        />
      )}

      {/* Phase 2 Modals */}
      {showTwoFactorAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <TwoFactorAuth 
              isOpen={showTwoFactorAuth}
              onClose={() => setShowTwoFactorAuth(false)}
              onSuccess={() => {
                setShowTwoFactorAuth(false);
                // Add success notification here
              }}
              userId={user.id}
            />
          </div>
        </div>
      )}

      {showAuditLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Audit Log</h2>
              <button
                onClick={() => setShowAuditLog(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
              <ErrorBoundary fallback={<div className="text-center p-8 text-red-600">Error loading audit log. Please try again.</div>}>
                <AuditLogViewer />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      )}

      {showRoleManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Role Management</h2>
              <button
                onClick={() => setShowRoleManagement(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <RoleManagement />
          </div>
        </div>
      )}

      {showReportScheduler && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Report Scheduler</h2>
              <button
                onClick={() => setShowReportScheduler(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <ReportScheduler />
          </div>
        </div>
      )}

      {showCustomDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Custom Dashboard</h2>
              <button
                onClick={() => setShowCustomDashboard(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <CustomDashboard />
          </div>
        </div>
      )}

      {showWorkflowAutomation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Workflow Automation</h2>
              <button
                onClick={() => setShowWorkflowAutomation(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <WorkflowAutomation />
          </div>
        </div>
      )}

      {showApiWebhookSupport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">API & Webhook Management</h2>
              <button
                onClick={() => setShowApiWebhookSupport(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <ApiWebhookSupport />
          </div>
        </div>
      )}

      {/* Chat Support */}
      <ChatSupport
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </div>
  );
};