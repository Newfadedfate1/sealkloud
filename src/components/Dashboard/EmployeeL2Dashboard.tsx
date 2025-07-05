import React, { useState, useEffect } from 'react';
import { Settings, Ticket, Clock, CheckCircle, AlertTriangle, Zap, Search, MessageSquare, Database, ArrowUp, ArrowDown, Eye, Play, CheckSquare, BarChart3, BookOpen, Plus, Brain, History } from 'lucide-react';
import { User as UserType } from '../../types/user';
import { TicketStatsCard } from './TicketStatsCard';
import { TicketDetailModal } from '../TicketDetail/TicketDetailModal';
import { useTickets } from '../../contexts/TicketContext';
import { EmployeePerformanceMetrics } from './EmployeePerformanceMetrics';
import { QuickActionsPanel } from './QuickActionsPanel';
import { EmployeeKnowledgeBase } from './EmployeeKnowledgeBase';
import { AITicketAssistant } from './AITicketAssistant';
import { SmartWorkflowAutomation } from './SmartWorkflowAutomation';
import { AdvancedAnalyticsDashboard } from './AdvancedAnalyticsDashboard';
import { IntelligentCommunicationTools } from './IntelligentCommunicationTools';
import { ThemeToggle } from './ThemeToggle';
import { EmployeeTicketHistory } from './EmployeeTicketHistory';
import { Sidebar } from '../Sidebar/Sidebar';

interface EmployeeL2DashboardProps {
  user: UserType;
  onLogout: () => void;
}

export const EmployeeL2Dashboard: React.FC<EmployeeL2DashboardProps> = ({ user, onLogout }) => {
  const { tickets, updateTicket } = useTickets();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Phase 1 Enhancement States
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showWorkflowAutomation, setShowWorkflowAutomation] = useState(false);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [showCommunicationTools, setShowCommunicationTools] = useState(false);
  const [showTicketHistory, setShowTicketHistory] = useState(false);
  
  // Sidebar navigation state
  const [activeSection, setActiveSection] = useState('dashboard');

  // Filter tickets for L2 - medium/high priority and escalated tickets
  const myTickets = tickets.filter(ticket => ticket.assignedTo === user.id);
  const escalatedTickets = tickets.filter(ticket => 
    ticket.status === 'unassigned' && ['medium', 'high'].includes(ticket.problemLevel)
  );
  
  const userStats = {
    assigned: myTickets.length,
    inProgress: myTickets.filter(t => t.status === 'in-progress').length,
    resolved: myTickets.filter(t => t.status === 'resolved').length,
    escalated: escalatedTickets.length
  };

  const availableUsers = [
    { id: '2', email: 'employee@sealkloud.com', firstName: 'Jane', lastName: 'Employee', role: 'employee_l1' as const, companyId: 'sealkloud', isActive: true },
    { id: '4', email: 'l2tech@sealkloud.com', firstName: 'Level 2', lastName: 'Tech', role: 'employee_l2' as const, companyId: 'sealkloud', isActive: true },
    { id: '5', email: 'l3expert@sealkloud.com', firstName: 'Level 3', lastName: 'Expert', role: 'employee_l3' as const, companyId: 'sealkloud', isActive: true }
  ];

  const handleTicketUpdate = (ticketId: string, updates: any) => {
    updateTicket(ticketId, updates);
    setSelectedTicket(null);
  };

  const handleTakeTicket = (ticketId: string) => {
    handleTicketUpdate(ticketId, { 
      assignedTo: user.id, 
      assignedToName: `${user.firstName} ${user.lastName}`,
      status: 'in-progress',
      lastUpdated: new Date()
    });
  };

  const handleEscalateToL3 = (ticketId: string) => {
    const l3User = availableUsers.find(u => u.role === 'employee_l3');
    if (l3User) {
      handleTicketUpdate(ticketId, {
        assignedTo: l3User.id,
        assignedToName: `${l3User.firstName} ${l3User.lastName}`,
        lastUpdated: new Date()
      });
    }
  };

  const handleDelegateToL1 = (ticketId: string) => {
    const l1User = availableUsers.find(u => u.role === 'employee_l1');
    if (l1User) {
      handleTicketUpdate(ticketId, {
        assignedTo: l1User.id,
        assignedToName: `${l1User.firstName} ${l1User.lastName}`,
        problemLevel: 'medium',
        lastUpdated: new Date()
      });
    }
  };

  // Phase 1 Enhancement Handlers
  const handleQuickAction = (action: string, data?: any) => {
    console.log('Quick action:', action, data);
    // Handle different quick actions
    switch (action) {
      case 'start-work':
        // Handle start work action
        break;
      case 'resolve-ticket':
        // Handle resolve ticket action
        break;
      case 'escalate-ticket':
        // Handle escalate ticket action
        break;
      case 'technical-analysis':
        // Handle technical analysis action
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleApplySolution = (solution: string) => {
    if (selectedTicket) {
      // Apply the solution to the current ticket
      handleTicketUpdate(selectedTicket.id, {
        description: `${selectedTicket.description}\n\nApplied Solution: ${solution}`,
        lastUpdated: new Date()
      });
    }
    setShowKnowledgeBase(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'unassigned': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'in-progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
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

  const filteredMyTickets = myTickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sidebar navigation handler
  const handleSidebarNavigate = (section: string) => {
    setActiveSection(section);
    switch (section) {
      case 'dashboard':
        break;
      case 'tickets':
        break;
      case 'knowledge':
        setShowKnowledgeBase(true);
        break;
      case 'analytics':
        setShowAdvancedAnalytics(true);
        break;
      case 'team':
        setShowQuickActions(true);
        break;
      case 'messages':
        setShowCommunicationTools(true);
        break;
      case 'automation':
        setShowWorkflowAutomation(true);
        break;
      case 'settings':
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex">
      <Sidebar
        active={activeSection}
        onNavigate={handleSidebarNavigate}
        onLogout={onLogout}
      />
      <div className="flex-1 ml-16 md:ml-56 transition-all duration-300">
        {/* Clean Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg transition-colors duration-200">
                  <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Level 2 Support</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Welcome back, {user.firstName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPerformanceMetrics(true)}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="Performance Metrics"
                >
                  <BarChart3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowQuickActions(true)}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="Quick Actions"
                >
                  <Zap className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowKnowledgeBase(true)}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="Knowledge Base"
                >
                  <BookOpen className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowAIAssistant(true)}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="AI Assistant"
                >
                  <Brain className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowWorkflowAutomation(true)}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="Workflow Automation"
                >
                  <Zap className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowAdvancedAnalytics(true)}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="Advanced Analytics"
                >
                  <BarChart3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowCommunicationTools(true)}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="Communication Tools"
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowTicketHistory(true)}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="My Ticket History"
                >
                  <History className="h-5 w-5" />
                </button>
                <ThemeToggle />
                <button
                  onClick={onLogout}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white px-3 py-2 text-sm transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Simple Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.assigned}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">My Tickets</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{userStats.inProgress}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.resolved}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Resolved Today</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{userStats.escalated}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Escalated</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Escalated Tickets - Left Column */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Escalated Tickets</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Medium to high complexity technical issues</p>
              </div>
              <div className="p-6">
                {escalatedTickets.length > 0 ? (
                  <div className="space-y-4">
                    {escalatedTickets.slice(0, 5).map(ticket => (
                      <div key={ticket.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{ticket.id}</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(ticket.problemLevel)}`}>
                                {ticket.problemLevel.charAt(0).toUpperCase() + ticket.problemLevel.slice(1)}
                              </span>
                            </div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-1">{ticket.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{ticket.clientName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{ticket.description}</p>
                            <div className="text-xs text-gray-400 dark:text-gray-400 mt-2">
                              Created {ticket.submittedDate.toLocaleDateString()}
                            </div>
                          </div>
                          <div className="ml-4 flex flex-col gap-2">
                            <button
                              onClick={() => handleTakeTicket(ticket.id)}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                              Take
                            </button>
                            <div className="flex gap-1">
                              {ticket.problemLevel === 'high' && (
                                <button
                                  onClick={() => handleEscalateToL3(ticket.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                                >
                                  <ArrowUp className="h-3 w-3" />
                                  L3
                                </button>
                              )}
                              {ticket.problemLevel === 'medium' && (
                                <button
                                  onClick={() => handleDelegateToL1(ticket.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                                >
                                  <ArrowDown className="h-3 w-3" />
                                  L1
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No escalated tickets</p>
                    <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">All technical issues are under control</p>
                  </div>
                )}
              </div>
            </div>

            {/* My Tickets - Right Column */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Technical Tickets</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Advanced technical issues assigned to you</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors duration-200 w-48"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6">
                {filteredMyTickets.length > 0 ? (
                  <div className="space-y-4">
                    {filteredMyTickets.map(ticket => (
                      <div key={ticket.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{ticket.id}</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(ticket.problemLevel)}`}>
                                {ticket.problemLevel.charAt(0).toUpperCase() + ticket.problemLevel.slice(1)}
                              </span>
                            </div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-1">{ticket.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{ticket.clientName}</p>
                            <div className="text-xs text-gray-400 dark:text-gray-400">
                              Updated {ticket.lastUpdated.toLocaleDateString()}
                            </div>
                          </div>
                          <div className="ml-4 flex flex-col gap-2">
                            <button
                              onClick={() => setSelectedTicket(ticket)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </button>
                            {ticket.status === 'in-progress' && (
                              <button
                                onClick={() => handleTicketUpdate(ticket.id, { status: 'resolved', resolvedDate: new Date(), lastUpdated: new Date() })}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                              >
                                <CheckSquare className="h-3 w-3" />
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    {myTickets.length === 0 ? (
                      <>
                        <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No tickets assigned</p>
                        <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">Take some tickets from the escalated list</p>
                      </>
                    ) : (
                      <>
                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No matching tickets</p>
                        <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">Try a different search term</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Technical Tools & Guidelines */}
          <div className="mt-8 bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Database className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-yellow-900 mb-2">Level 2 Technical Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
                  <div>
                    <h4 className="font-medium mb-1">Your Expertise:</h4>
                    <ul className="space-y-1 text-yellow-700">
                      <li>• System configuration issues</li>
                      <li>• Database performance problems</li>
                      <li>• Network connectivity issues</li>
                      <li>• Software troubleshooting</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Escalation Rules:</h4>
                    <ul className="space-y-1 text-yellow-700">
                      <li>• Critical system outages → L3</li>
                      <li>• Security incidents → L3</li>
                      <li>• Simple issues → L1</li>
                      <li>• Infrastructure problems → L3</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <TicketDetailModal
            ticket={selectedTicket}
            isOpen={!!selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onUpdate={handleTicketUpdate}
            currentUser={user}
            availableUsers={availableUsers}
          />
        )}

        {/* Phase 1 Enhancement Modals */}
        {showPerformanceMetrics && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <EmployeePerformanceMetrics
              userId={user.id}
              userRole="employee_l2"
              onClose={() => setShowPerformanceMetrics(false)}
            />
          </div>
        )}

        {showQuickActions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <QuickActionsPanel
              userRole="employee_l2"
              onAction={handleQuickAction}
              onClose={() => setShowQuickActions(false)}
            />
          </div>
        )}

        {showKnowledgeBase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <EmployeeKnowledgeBase
              userRole="employee_l2"
              currentTicket={selectedTicket}
              onClose={() => setShowKnowledgeBase(false)}
              onApplySolution={handleApplySolution}
            />
          </div>
        )}

        {showAIAssistant && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <AITicketAssistant
              ticket={selectedTicket}
              userRole="employee_l2"
              onApplyAnalysis={(analysis) => {
                console.log('Applied AI analysis:', analysis);
                setShowAIAssistant(false);
              }}
              onApplyResponse={(response) => {
                console.log('Applied AI response:', response);
                setShowAIAssistant(false);
              }}
              onClose={() => setShowAIAssistant(false)}
            />
          </div>
        )}

        {showWorkflowAutomation && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <SmartWorkflowAutomation
              ticket={selectedTicket}
              availableUsers={availableUsers}
              userRole="employee_l2"
              onApplyWorkflow={(workflow) => {
                console.log('Applied workflow:', workflow);
                setShowWorkflowAutomation(false);
              }}
              onAutoAssign={(assignee) => {
                console.log('Auto-assigned to:', assignee);
                setShowWorkflowAutomation(false);
              }}
              onClose={() => setShowWorkflowAutomation(false)}
            />
          </div>
        )}

        {showAdvancedAnalytics && (
          <AdvancedAnalyticsDashboard
            userRole="employee_l2"
            userId={user.id}
            onClose={() => setShowAdvancedAnalytics(false)}
            onExportData={(data) => {
              console.log('Exported analytics data:', data);
            }}
          />
        )}

        {showCommunicationTools && selectedTicket && (
          <IntelligentCommunicationTools
            ticket={selectedTicket}
            userRole="employee_l2"
            onSendMessage={(message, type) => {
              console.log('Sent message:', message, type);
              setShowCommunicationTools(false);
            }}
            onScheduleFollowUp={(date, message) => {
              console.log('Scheduled follow-up:', date, message);
              setShowCommunicationTools(false);
            }}
            onClose={() => setShowCommunicationTools(false)}
          />
        )}

        {/* Ticket History Modal */}
        {showTicketHistory && (
          <EmployeeTicketHistory
            userId={user.id}
            userName={`${user.firstName} ${user.lastName}`}
            onClose={() => setShowTicketHistory(false)}
          />
        )}
      </div>
    </div>
  );
};