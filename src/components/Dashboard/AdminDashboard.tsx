import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, AlertTriangle, Search, MessageSquare, User, ArrowRight, BarChart3, BookOpen, Brain, History, Ticket, X, Settings, Shield, Activity, Database, Zap, Globe, Bell, Filter } from 'lucide-react';
import { User as UserType } from '../../types/user';
import { Ticket as TicketType, TicketStatus, ProblemLevel } from '../../types/ticket';
import { EnhancedTicketDetailModal } from '../TicketDetail/EnhancedTicketDetailModal';
import { TicketHistoryModal } from '../TicketHistory/TicketHistoryModal';
import { useTickets } from '../../contexts/TicketContext';
import { TicketManagementService } from '../../services/ticketManagement';
import { AdvancedAnalyticsDashboard } from './AdvancedAnalyticsDashboard';
import { IntelligentCommunicationTools } from './IntelligentCommunicationTools';
import { ThemeToggle } from './ThemeToggle';
import { DataSourceIndicator } from '../DataSourceIndicator';
import { TestStatusIndicator } from './TestStatusIndicator';
import { TestRunner } from '../Testing/TestRunner';
import { ExportModal } from '../ExportModal';
import { Phase2Demo } from '../Phase2Demo/Phase2Demo';
import { Phase4Demo } from '../Phase4Demo/Phase4Demo';
import { Sidebar } from '../Sidebar/Sidebar';
import { useToast } from '../Toast/ToastContainer';
import { ChatInterface } from '../Chat/ChatInterface';
import { NotificationManager } from '../Chat/ChatNotification';
import { RealTimeStatusTracker } from './RealTimeStatusTracker';
import { ticketsAPI, usersAPI, auditAPI } from '../../services/api';

interface AdminDashboardProps {
  user: UserType;
  onLogout: () => void;
}

interface SearchFilter {
  field: string;
  value: string;
  operator: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const { tickets, updateTicket, refreshTickets, ticketService, isLoading, isUsingMockData } = useTickets();
  const { addToast } = useToast();
  
  // State management
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [highlightedTicketId, setHighlightedTicketId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTestRunner, setShowTestRunner] = useState(false);
  const [showPhase2Demo, setShowPhase2Demo] = useState(false);
  const [showPhase4Demo, setShowPhase4Demo] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [showChat, setShowChat] = useState(false);
  const [chatNotifications, setChatNotifications] = useState<Array<{
    id: string;
    senderName: string;
    content: string;
    timestamp: Date;
  }>>([]);
  
  // Notifications state
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    read: boolean;
    timestamp: Date;
  }>>([]);
  
  // Real-time data states
  const [dashboardStats, setDashboardStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    totalUsers: 0,
    activeUsers: 0,
    avgResponseTime: 0,
    systemHealth: 'healthy'
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [systemMetrics, setSystemMetrics] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkLatency: 0
  });

  // Use safeTickets for all array operations
  const safeTickets = Array.isArray(tickets) ? tickets : [];

  // Load real-time dashboard data
  const loadDashboardData = async () => {
    try {
      // Load tickets stats
      const ticketsResponse = await ticketsAPI.getAll();
      if (ticketsResponse.success && ticketsResponse.data) {
        const ticketStats = ticketsResponse.data.reduce((acc: any, ticket: any) => {
          acc.total++;
          if (ticket.status === 'open' || ticket.status === 'in-progress') acc.open++;
          if (ticket.status === 'resolved') acc.resolved++;
          return acc;
        }, { total: 0, open: 0, resolved: 0 });
        
        setDashboardStats(prev => ({
          ...prev,
          totalTickets: ticketStats.total,
          openTickets: ticketStats.open,
          resolvedTickets: ticketStats.resolved
        }));
      }

      // Load users stats
      const usersResponse = await usersAPI.getAll();
      if (usersResponse.success && usersResponse.data) {
        const users = usersResponse.data.users || usersResponse.data || [];
        const activeUsers = users.filter((u: any) => u.isActive).length;
        
        setDashboardStats(prev => ({
          ...prev,
          totalUsers: users.length,
          activeUsers
        }));
      }

      // Load recent audit logs
      const auditResponse = await auditAPI.getAll({ limit: 10 });
      if (auditResponse.success && auditResponse.data) {
        setRecentActivity(auditResponse.data.logs || []);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  // Load data on mount and refresh periodically
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Mock available users for ticket assignment (this should come from API)
  const availableUsers = [
    { id: '1', email: 'client@sealkloud.com', firstName: 'John', lastName: 'Client', role: 'client' as const, companyId: 'sealkloud', isActive: true },
    { id: '2', email: 'employee@sealkloud.com', firstName: 'Jane', lastName: 'Employee', role: 'employee_l1' as const, companyId: 'sealkloud', isActive: true },
    { id: '3', email: 'admin@sealkloud.com', firstName: 'Admin', lastName: 'User', role: 'admin' as const, companyId: 'sealkloud', isActive: true },
    { id: '4', email: 'l2tech@sealkloud.com', firstName: 'Level 2', lastName: 'Tech', role: 'employee_l2' as const, companyId: 'sealkloud', isActive: true },
    { id: '5', email: 'l3expert@sealkloud.com', firstName: 'Level 3', lastName: 'Expert', role: 'employee_l3' as const, companyId: 'sealkloud', isActive: true }
  ];

  const handleTicketUpdate = (ticketId: string, updates: any) => {
    updateTicket(ticketId, updates);
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

  const handleQuickAction = (action: string, data?: any) => {
    console.log('Quick action:', action, data);
    const ticketId = data?.ticketId || highlightedTicketId;
    
    if (!ticketId) {
      console.log('No ticket selected for action:', action);
      return;
    }

    const ticket = safeTickets.find(t => t.id === ticketId);
    if (!ticket) {
      console.log('Ticket not found:', ticketId);
      return;
    }

    switch (action) {
      case 'assign':
        handleTicketUpdate(ticketId, {
          assignedTo: data.assignedTo,
          status: 'in-progress',
          lastUpdated: new Date()
        });
        break;
      case 'escalate':
        handleTicketUpdate(ticketId, {
          status: 'escalated',
          priority: 'high',
          lastUpdated: new Date()
        });
        break;
      case 'resolve':
        handleTicketUpdate(ticketId, {
          status: 'resolved',
          resolvedDate: new Date(),
          lastUpdated: new Date()
        });
        break;
      case 'export':
        setShowExportModal(true);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in-progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'closed': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'unassigned': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleSidebarNavigate = (section: string) => {
    setActiveSection(section);
    switch (section) {
      case 'dashboard':
        break;
      case 'tickets':
        break;
      case 'users':
        break;
      case 'analytics':
        break;
      case 'settings':
        break;
      case 'security':
        setShowPhase2Demo(true);
        break;
      case 'automation':
        break;
      case 'reports':
        break;
      case 'integrations':
        break;
      case 'audit':
        break;
      default:
        break;
    }
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex">
      <Sidebar
        active={activeSection}
        onNavigate={handleSidebarNavigate}
        onLogout={onLogout}
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
      />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <DataSourceIndicator 
          isUsingMockData={isUsingMockData}
          isLoading={isLoading}
          onRefresh={refreshTickets}
        />
        
        {/* Clean Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg transition-colors duration-200">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Admin Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">System Overview & Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Real-time Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalTickets}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{dashboardStats.openTickets}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Open Tickets</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{dashboardStats.resolvedTickets}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Resolved Today</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dashboardStats.totalUsers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
            </div>
          </div>

          {/* System Health & Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    {dashboardStats.systemHealth}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
                  <span className="font-medium">{dashboardStats.activeUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</span>
                  <span className="font-medium">{dashboardStats.avgResponseTime.toFixed(1)}s</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                    <div className="font-medium">{activity.action}</div>
                    <div className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">No recent activity</div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                >
                  Export Data
                </button>
                <button
                  onClick={() => refreshTickets()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                >
                  Refresh Data
                </button>
                <button
                  onClick={() => setShowTestRunner(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                >
                  Run Tests
                </button>
              </div>
            </div>
          </div>

          {/* Highlighted Ticket Indicator */}
          {highlightedTicketId && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Ticket {highlightedTicketId} selected
                  </span>
                </div>
                <button
                  onClick={() => setHighlightedTicketId(null)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">All Tickets</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Complete ticket overview and management</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                  >
                    Export
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading tickets...</p>
                </div>
              ) : safeTickets.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {safeTickets
                    .filter(ticket => 
                      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      ticket.clientName.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .slice(0, 10)
                    .map(ticket => (
                    <div 
                      key={ticket.id} 
                      className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                        highlightedTicketId === ticket.id 
                          ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setHighlightedTicketId(highlightedTicketId === ticket.id ? null : ticket.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{ticket.id}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(ticket.priority || ticket.problemLevel)}`}>
                              {(ticket.priority || ticket.problemLevel).charAt(0).toUpperCase() + (ticket.priority || ticket.problemLevel).slice(1)}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1">{ticket.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{ticket.clientName}</p>
                          <div className="text-xs text-gray-400 dark:text-gray-400">
                            Updated {new Date(ticket.lastUpdated).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicket(ticket);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No tickets found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">Create some tickets to get started</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {selectedTicket && (
        <EnhancedTicketDetailModal
          isOpen={!!selectedTicket}
          ticket={selectedTicket}
          currentUser={user}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleTicketUpdate}
          availableUsers={availableUsers}
        />
      )}

      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleQuickAction}
          data={{ tickets, type: 'tickets' }}
        />
      )}

      {showTestRunner && (
        <TestRunner />
      )}

      {showPhase2Demo && (
        <Phase2Demo
          onBack={() => setShowPhase2Demo(false)}
        />
      )}

      {showPhase4Demo && (
        <Phase4Demo />
      )}

      {showChat && (
        <ChatInterface
          isOpen={showChat}
          currentUser={user}
          onClose={() => setShowChat(false)}
        />
      )}

      <NotificationManager
        notifications={chatNotifications}
        onRemoveNotification={(id: string) => {
          setChatNotifications(prev => prev.filter(n => n.id !== id));
        }}
        onOpenChat={() => setShowChat(true)}
      />
    </div>
  );
};