import React, { useState } from 'react';
import { Ticket, Plus, Search, Filter, Eye, Clock, AlertTriangle, CheckCircle, MessageSquare, FileText, User, Calendar, Phone, Mail, HelpCircle, Bell, BookOpen, Settings, Brain, BarChart3, Wrench, MessageCircle } from 'lucide-react';
import { User as UserType } from '../../types/user';
import { Ticket as TicketType, TicketStatus, ProblemLevel } from '../../types/ticket';
import { CreateTicketModal } from '../Tickets/CreateTicketModal';
import { TicketDetailModal } from '../TicketDetail/TicketDetailModal';
import { mockTickets } from '../../data/mockTickets';
import { ThemeToggle } from '../ThemeToggle';
import { NotificationCenter, Notification } from '../NotificationCenter';
import { SearchBar, SearchFilter } from '../SearchBar';
import { KnowledgeBase } from '../KnowledgeBase';
import { ClientSettings } from '../Client/ClientSettings';
import { SmartTicketAssistant } from '../AI/SmartTicketAssistant';
import { SupportChatbot } from '../AI/SupportChatbot';
import { ClientAnalytics } from '../AI/ClientAnalytics';
import { SelfServiceTools } from '../AI/SelfServiceTools';

interface ClientDashboardProps {
  user: UserType;
  onLogout: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, onLogout }) => {
  const [tickets, setTickets] = useState<TicketType[]>(
    mockTickets.filter(ticket => ticket.clientId === user.id || ticket.clientName === `${user.firstName} ${user.lastName}`)
  );
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  
  // Phase 1 Enhancement States
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'info',
      title: 'Ticket Updated',
      message: 'Your ticket TK-001 has been assigned to a specialist',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      action: {
        label: 'View',
        onClick: () => console.log('View ticket TK-001')
      }
    },
    {
      id: '2',
      type: 'success',
      title: 'Issue Resolved',
      message: 'Your ticket TK-002 has been resolved successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: true
    }
  ]);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Phase 2 AI Enhancement States
  const [showSmartAssistant, setShowSmartAssistant] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSelfService, setShowSelfService] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [ticketContent, setTicketContent] = useState('');

  const getStatusInfo = (status: TicketStatus) => {
    const statusMap = {
      'open': { 
        color: 'bg-blue-50 text-blue-700 border-blue-200', 
        icon: Clock, 
        label: 'Open',
        description: 'Your ticket has been received and is awaiting assignment'
      },
      'unassigned': { 
        color: 'bg-orange-50 text-orange-700 border-orange-200', 
        icon: AlertTriangle, 
        label: 'Pending Assignment',
        description: 'We\'re finding the right specialist for your issue'
      },
      'in-progress': { 
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
        icon: MessageSquare, 
        label: 'In Progress',
        description: 'Our team is actively working on your issue'
      },
      'resolved': { 
        color: 'bg-green-50 text-green-700 border-green-200', 
        icon: CheckCircle, 
        label: 'Resolved',
        description: 'Your issue has been resolved'
      },
      'closed': { 
        color: 'bg-gray-50 text-gray-700 border-gray-200', 
        icon: CheckCircle, 
        label: 'Closed',
        description: 'Ticket has been completed and closed'
      }
    };
    return statusMap[status] || statusMap['open'];
  };

  const getUrgencyInfo = (level: ProblemLevel) => {
    const urgencyMap = {
      'low': { color: 'bg-green-50 text-green-700 border-green-200', label: 'Low Priority' },
      'medium': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Medium Priority' },
      'high': { color: 'bg-orange-50 text-orange-700 border-orange-200', label: 'High Priority' },
      'critical': { color: 'bg-red-50 text-red-700 border-red-200', label: 'Critical' }
    };
    return urgencyMap[level] || urgencyMap['medium'];
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const ticketStats = {
    total: tickets.length,
    active: tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length,
    resolved: tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length,
    urgent: tickets.filter(t => ['high', 'critical'].includes(t.problemLevel) && !['resolved', 'closed'].includes(t.status)).length
  };

  const handleCreateTicket = (ticketData: Partial<TicketType>) => {
    const newTicket: TicketType = {
      id: `TK-${(tickets.length + 1).toString().padStart(3, '0')}`,
      clientName: `${user.firstName} ${user.lastName}`,
      clientId: user.id,
      title: ticketData.title || '',
      description: ticketData.description || '',
      problemLevel: ticketData.problemLevel || 'medium',
      status: 'unassigned',
      submittedDate: new Date(),
      lastUpdated: new Date(),
      activityLog: [
        {
          id: `act-${Date.now()}`,
          ticketId: `TK-${(tickets.length + 1).toString().padStart(3, '0')}`,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'created',
          description: 'Ticket submitted by client',
          timestamp: new Date()
        }
      ]
    };

    setTickets(prev => [newTicket, ...prev]);
    setShowCreateTicket(false);
  };

  const handleTicketUpdate = (ticketId: string, updates: Partial<TicketType>) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    ));
    setSelectedTicket(null);
  };

  // Phase 1 Enhancement Handlers
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
    setSearchTerm(query);
    // Apply additional filters if needed
    console.log('Advanced search:', query, filters);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
    // Reset other filters
  };

  // Phase 2 AI Enhancement Handlers
  const handleSmartAssistantSuggestion = (suggestion: any) => {
    // Apply AI suggestions to ticket creation
    const ticketData = {
      title: suggestion.category,
      description: ticketContent,
      problemLevel: suggestion.priority,
      category: suggestion.category
    };
    handleCreateTicket(ticketData);
  };

  const handleChatbotTicketCreation = (ticketData: any) => {
    handleCreateTicket(ticketData);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <Ticket className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Support Portal</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back, {user.firstName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAnalytics(true)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Analytics"
              >
                <BarChart3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowKnowledgeBase(true)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Knowledge Base"
              >
                <BookOpen className="h-5 w-5" />
              </button>
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={handleNotificationMarkAsRead}
                onMarkAllAsRead={handleNotificationMarkAllAsRead}
                onDelete={handleNotificationDelete}
              />
              <ThemeToggle />
              <button
                onClick={() => setShowSettings(true)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={onLogout}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Enhanced Search Bar */}
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            onClear={handleSearchClear}
            placeholder="Search tickets, knowledge base, or get help..."
            className="max-w-2xl"
          />
        </div>

        {/* Quick Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{ticketStats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{ticketStats.active}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{ticketStats.resolved}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Resolved</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{ticketStats.urgent}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Urgent</div>
          </div>
        </div>

        {/* Enhanced Main Action */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl p-6 mb-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Need Help?</h2>
              <p className="text-blue-100 dark:text-blue-200">Create a support ticket and our team will assist you</p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Avg Response: 2.4h
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  98% Resolution Rate
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSelfService(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Wrench className="h-4 w-4" />
                Self-Service
              </button>
              <button
                onClick={() => setShowKnowledgeBase(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Help Center
              </button>
              <button
                onClick={() => setShowCreateTicket(true)}
                className="bg-white text-blue-600 dark:text-blue-700 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-100 transition-colors flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                New Ticket
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Tickets Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Support Tickets</h2>
              
              {/* Enhanced Filters */}
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Tickets</option>
                  <option value="open">Open</option>
                  <option value="unassigned">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Showing {filteredTickets.length} of {tickets.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tickets List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => {
                const statusInfo = getStatusInfo(ticket.status);
                const urgencyInfo = getUrgencyInfo(ticket.problemLevel);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={ticket.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Ticket Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-mono text-sm font-medium text-gray-600 dark:text-gray-400">{ticket.id}</span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${statusInfo.color} dark:bg-opacity-20`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </span>
                          <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${urgencyInfo.color} dark:bg-opacity-20`}>
                            {urgencyInfo.label}
                          </span>
                        </div>
                        
                        {/* Ticket Content */}
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{ticket.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{ticket.description}</p>
                        
                        {/* Status Description */}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{statusInfo.description}</p>
                        
                        {/* Ticket Meta */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>Created {ticket.submittedDate.toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Updated {ticket.lastUpdated.toLocaleDateString()}</span>
                          {ticket.assignedToName && (
                            <>
                              <span>•</span>
                              <span>Assigned to {ticket.assignedToName}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="ml-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                {tickets.length === 0 ? (
                  <div>
                    <Ticket className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tickets yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first support ticket to get help from our team</p>
                    <button
                      onClick={() => setShowCreateTicket(true)}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                    >
                      <Plus className="h-5 w-5" />
                      Create First Ticket
                    </button>
                  </div>
                ) : (
                  <div>
                    <Filter className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No matching tickets</h3>
                    <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Help Section */}
        <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
              <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Need immediate assistance?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">For urgent issues, you can contact our support team directly</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowChatbot(true)}
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  <MessageCircle className="h-4 w-4" />
                  AI Chat Support
                </button>
                <a
                  href="mailto:support@sealkloud.com"
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  <Mail className="h-4 w-4" />
                  support@sealkloud.com
                </a>
                <a
                  href="tel:+1-555-123-4567"
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  <Phone className="h-4 w-4" />
                  +1 (555) 123-4567
                </a>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Support hours: Monday-Friday, 9AM-6PM EST</p>
            </div>
          </div>
        </div>

        {/* AI-Powered Features Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-500 to-blue-600 dark:from-purple-600 dark:to-blue-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Brain className="h-6 w-6" />
                AI-Powered Support
              </h2>
              <p className="text-purple-100 dark:text-purple-200 mb-4">Get instant help with our intelligent AI features</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Smart Ticket Categorization
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  AI Chat Support
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Predictive Analytics
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSmartAssistant(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                Smart Assistant
              </button>
              <button
                onClick={() => setShowChatbot(true)}
                className="bg-white text-purple-600 dark:text-purple-700 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-purple-100 transition-colors flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Start Chat
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Modals */}
      <CreateTicketModal
        isOpen={showCreateTicket}
        onClose={() => setShowCreateTicket(false)}
        onSubmit={handleCreateTicket}
        currentUser={user}
      />

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleTicketUpdate}
          currentUser={user}
          availableUsers={[]}
        />
      )}

      {/* Knowledge Base Modal */}
      {showKnowledgeBase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Knowledge Base</h2>
              <button
                onClick={() => setShowKnowledgeBase(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <KnowledgeBase />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <ClientSettings onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}

      {/* Phase 2 AI Modals */}
      {/* Smart Ticket Assistant Modal */}
      {showSmartAssistant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <SmartTicketAssistant
              ticketContent={ticketContent}
              onSuggestionSelect={handleSmartAssistantSuggestion}
              onClose={() => setShowSmartAssistant(false)}
            />
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <ClientAnalytics
              userId={user.id}
              onClose={() => setShowAnalytics(false)}
            />
          </div>
        </div>
      )}

      {/* Self-Service Tools Modal */}
      {showSelfService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <SelfServiceTools
              onClose={() => setShowSelfService(false)}
              onCreateTicket={handleCreateTicket}
            />
          </div>
        </div>
      )}

      {/* AI Chatbot */}
      <SupportChatbot
        isOpen={showChatbot}
        onToggle={() => setShowChatbot(!showChatbot)}
        onCreateTicket={handleChatbotTicketCreation}
      />
    </div>
  );
};