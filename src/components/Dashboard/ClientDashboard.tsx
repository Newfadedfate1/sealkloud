import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, AlertTriangle, Search, MessageSquare, User, ArrowRight, BarChart3, BookOpen, Brain, History, Ticket, X, Plus, Filter, Download } from 'lucide-react';
import { User as UserType } from '../../types/user';
import { Ticket as TicketType, TicketStatus, ProblemLevel } from '../../types/ticket';
import { EnhancedTicketDetailModal } from '../TicketDetail/EnhancedTicketDetailModal';
import { TicketHistoryModal } from '../TicketHistory/TicketHistoryModal';
import { useTickets } from '../../contexts/TicketContext';
import { TicketManagementService } from '../../services/ticketManagement';
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
import { ticketsAPI } from '../../services/api';

interface ClientDashboardProps {
  user: UserType;
  onLogout: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, onLogout }) => {
  const { tickets, addTicket, updateTicket, refreshTickets, ticketService, isLoading, isUsingMockData } = useTickets();
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
  
  // Real-time data states
  const [clientTickets, setClientTickets] = useState<TicketType[]>([]);
  const [clientStats, setClientStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    avgResolutionTime: 0
  });

  // Load client-specific data
  const loadClientData = async () => {
    try {
      // Load tickets for this client
      const response = await ticketsAPI.getAll({ clientId: user.id });
      if (response.success && response.data) {
        const clientTicketsData = response.data.filter((ticket: any) => 
          ticket.clientId === user.id || 
          ticket.clientName === `${user.firstName} ${user.lastName}`
        );
        
        setClientTickets(clientTicketsData);
        
        // Calculate stats
        const stats = clientTicketsData.reduce((acc: any, ticket: any) => {
          acc.total++;
          if (ticket.status === 'open' || ticket.status === 'in-progress') acc.open++;
          if (ticket.status === 'resolved') acc.resolved++;
          return acc;
        }, { total: 0, open: 0, resolved: 0, avgResolutionTime: 0 });
        
        setClientStats(stats);
      }
    } catch (error) {
      console.error('Error loading client data:', error);
    }
  };

  // Load data on mount and refresh periodically
  useEffect(() => {
    loadClientData();
    const interval = setInterval(loadClientData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [user.id]);

  const handleTicketUpdate = (ticketId: string, updates: any) => {
    setClientTickets(prev => prev.map(ticket => 
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    ));
  };

  const handleCreateTicket = async (ticketData: any) => {
    try {
      const response = await ticketsAPI.create({
        ...ticketData,
        clientName: `${user.firstName} ${user.lastName}`,
        clientId: user.id
      });
      
      if (response.success) {
        showToast('Ticket created successfully!', 'success');
        await loadClientData(); // Refresh the data
      } else {
        showToast('Failed to create ticket', 'error');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      showToast('Failed to create ticket', 'error');
    }
  };

  const handleSearch = (query: string, filters: any[]) => {
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

    const ticket = clientTickets.find(t => t.id === ticketId);
    if (!ticket) {
      console.log('Ticket not found:', ticketId);
      return;
    }

    switch (action) {
      case 'update':
        handleTicketUpdate(ticketId, {
          ...data,
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
      case 'history':
        break;
      case 'support':
        setShowChat(true);
        break;
      case 'settings':
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
          onRefresh={loadClientData}
        />
        
        {/* Clean Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg transition-colors duration-200">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Client Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Welcome back, {user.firstName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={() => handleCreateTicket({
                  title: 'New Support Request',
                  description: 'Please describe your issue here...',
                  problemLevel: 'medium'
                })}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Ticket
              </button>
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
          {/* Client Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{clientStats.totalTickets}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{clientStats.openTickets}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Open Tickets</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{clientStats.resolvedTickets}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Resolved</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{clientStats.avgResolutionTime.toFixed(1)}h</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Resolution</div>
            </div>
          </div>

          {/* Test Status Indicator */}
          <div className="mb-8">
            <TestStatusIndicator />
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
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Tickets</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your support tickets and requests</p>
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
                    <Download className="h-4 w-4" />
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
              ) : clientTickets.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {clientTickets
                    .filter(ticket => 
                      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
                    )
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
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{ticket.description}</p>
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
                  <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">Create a new ticket to get started</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {selectedTicket && (
        <EnhancedTicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleTicketUpdate}
          availableUsers={[]}
        />
      )}

      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleQuickAction}
          data={{ tickets: clientTickets, type: 'tickets' }}
        />
      )}

      {showTestRunner && (
        <TestRunner
          onClose={() => setShowTestRunner(false)}
          onRunTests={() => console.log('Running tests...')}
        />
      )}

      {showPhase2Demo && (
        <Phase2Demo
          onClose={() => setShowPhase2Demo(false)}
          onFeatureToggle={() => console.log('Feature toggled')}
        />
      )}

      {showPhase4Demo && (
        <Phase4Demo
          onClose={() => setShowPhase4Demo(false)}
          onIntegrationSetup={() => console.log('Integration setup')}
        />
      )}

      {showChat && (
        <ChatInterface
          onClose={() => setShowChat(false)}
          notifications={chatNotifications}
          onSendMessage={(message) => console.log('Sending message:', message)}
        />
      )}

      <NotificationManager
        notifications={chatNotifications}
        onNotificationClick={(notification) => console.log('Notification clicked:', notification)}
      />
    </div>
  );
};