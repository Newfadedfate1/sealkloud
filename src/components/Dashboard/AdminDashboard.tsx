import React, { useState } from 'react';
import { Shield, Users, Ticket, BarChart3, Settings, TrendingUp, Clock, AlertTriangle, Activity, Database, Server, Eye, Filter, Key, Webhook, Zap, FileText, ShieldCheck } from 'lucide-react';
import { User } from '../../types/user';
import { TicketStatsCard } from './TicketStatsCard';
import { ClientTicketChart } from './ClientTicketChart';
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

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [tickets, setTickets] = useState(mockTickets);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
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
  const clientData = getClientTicketData();
  
  // Enhanced admin metrics with trends
  const metrics = {
    tickets: {
      total: ticketStats.total,
      open: ticketStats.open,
      unassigned: ticketStats.unassigned,
      resolved: ticketStats.resolved,
      trend: '+12%',
      avgResolutionTime: 4.2
    },
    performance: {
      resolutionRate: 92,
      avgResponseTime: 2.4,
      slaCompliance: 98.5,
      customerSatisfaction: 4.6
    },
    system: {
      activeUsers: 156,
      uptime: 99.9,
      serverLoad: 65,
      activeSessions: 143
    }
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Timeframe:</span>
                <select 
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="24h">Last 24h</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
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

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <TicketStatsCard
            title="Total Tickets"
            count={metrics.tickets.total}
            icon={Ticket}
            color="text-blue-600"
            bgColor="bg-blue-100"
            change={metrics.tickets.trend}
          />
          <TicketStatsCard
            title="Resolution Rate"
            count={metrics.performance.resolutionRate}
            icon={TrendingUp}
            color="text-green-600"
            bgColor="bg-green-100"
            change="% This month"
          />
          <TicketStatsCard
            title="Avg Response Time"
            count={metrics.performance.avgResponseTime}
            icon={Clock}
            color="text-orange-600"
            bgColor="bg-orange-100"
            change="hours (Target: 4h)"
          />
          <TicketStatsCard
            title="System Uptime"
            count={metrics.system.uptime}
            icon={Activity}
            color="text-purple-600"
            bgColor="bg-purple-100"
            change="% Availability"
          />
        </div>

        {/* Critical Alerts & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Critical Issues */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Critical Issues</h2>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="space-y-3">
                {metrics.tickets.unassigned > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-200">{metrics.tickets.unassigned} Unassigned Tickets</p>
                      <p className="text-sm text-red-600 dark:text-red-400">Requires immediate attention</p>
                    </div>
                    <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium">
                      View →
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-200">Server Load: {metrics.system.serverLoad}%</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">Moderate - Monitor closely</p>
                  </div>
                  <button className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 text-sm font-medium">
                    Details →
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-200">SLA Compliance: {metrics.performance.slaCompliance}%</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Above target threshold</p>
                  </div>
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                    Report →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="lg:col-span-1">
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
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">{metrics.system.serverLoad}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-400">Active Sessions</span>
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">{metrics.system.activeSessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-500" />
                    <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">{metrics.system.activeUsers}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Insights</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Customer Satisfaction</span>
                    <span className="font-medium text-gray-900 dark:text-white">{metrics.performance.customerSatisfaction}/5.0</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(metrics.performance.customerSatisfaction / 5) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Avg Resolution Time</span>
                    <span className="font-medium text-gray-900 dark:text-white">{metrics.tickets.avgResolutionTime}h</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((metrics.tickets.avgResolutionTime / 8) * 100, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Ticket Volume Trend</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{metrics.tickets.trend}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Client Ticket Distribution</h2>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>All Clients</option>
                <option>Top 5</option>
                <option>Active Only</option>
              </select>
            </div>
          </div>
          <ClientTicketChart data={clientData} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <button 
              onClick={() => setShowUserManagement(true)}
              className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors"
            >
              <Users className="h-6 w-6" />
              <span className="text-sm font-medium">Manage Users</span>
            </button>
            <button className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm font-medium">Analytics</span>
            </button>
            <button className="bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors">
              <Settings className="h-6 w-6" />
              <span className="text-sm font-medium">Settings</span>
            </button>
            <button 
              onClick={() => setShowAuditLog(true)}
              className="bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-700 dark:text-orange-300 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors"
            >
              <Eye className="h-6 w-6" />
              <span className="text-sm font-medium">Audit Log</span>
            </button>
            <button 
              onClick={() => setShowRoleManagement(true)}
              className="bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors"
            >
              <ShieldCheck className="h-6 w-6" />
              <span className="text-sm font-medium">Roles</span>
            </button>
            <button 
              onClick={() => setShowCustomDashboard(true)}
              className="bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-teal-700 dark:text-teal-300 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors"
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm font-medium">Custom Dashboard</span>
            </button>
          </div>
        </div>

        {/* Phase 2 Advanced Features */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Advanced Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowTwoFactorAuth(true)}
              className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors"
            >
              <ShieldCheck className="h-6 w-6" />
              <span className="text-sm font-medium">2FA Setup</span>
            </button>
            <button 
              onClick={() => setShowReportScheduler(true)}
              className="bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors"
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm font-medium">Report Scheduler</span>
            </button>
            <button 
              onClick={() => setShowWorkflowAutomation(true)}
              className="bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 text-pink-700 dark:text-pink-300 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors"
            >
              <Zap className="h-6 w-6" />
              <span className="text-sm font-medium">Workflow Automation</span>
            </button>
            <button 
              onClick={() => setShowApiWebhookSupport(true)}
              className="bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors"
            >
              <Webhook className="h-6 w-6" />
              <span className="text-sm font-medium">API & Webhooks</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Audit Log</h2>
              <button
                onClick={() => setShowAuditLog(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <AuditLogViewer />
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