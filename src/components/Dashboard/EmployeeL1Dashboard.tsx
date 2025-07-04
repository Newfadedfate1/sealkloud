import React, { useState } from 'react';
import { Users, Ticket, Clock, CheckCircle, AlertTriangle, Search, MessageSquare, User, ArrowRight, BarChart3, BookOpen, Brain, History } from 'lucide-react';
import { User as UserType } from '../../types/user';
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
import { DataSourceIndicator } from '../DataSourceIndicator';
import { TestStatusIndicator } from './TestStatusIndicator';
import { TestRunner } from '../Testing/TestRunner';
// Quick Wins Components
import { KeyboardShortcuts, useKeyboardShortcuts } from '../KeyboardShortcuts';
import { ExportModal } from '../ExportModal';
// Phase 2 Components
import { Phase2Demo } from '../Phase2Demo/Phase2Demo';
// Phase 4 Components
import { Phase4Demo } from '../Phase4Demo/Phase4Demo';
import { Sidebar } from '../Sidebar/Sidebar';


interface EmployeeL1DashboardProps {
  user: UserType;
  onLogout: () => void;
}

export const EmployeeL1Dashboard: React.FC<EmployeeL1DashboardProps> = ({ user, onLogout }) => {
  const { tickets, updateTicket, isUsingMockData, isLoading, refreshTickets } = useTickets();
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
  
  // Quick Wins States
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTestRunner, setShowTestRunner] = useState(false);
  
  // Phase 2 States
  const [showPhase2Demo, setShowPhase2Demo] = useState(false);
  // Phase 4 State
  const [showPhase4Demo, setShowPhase4Demo] = useState(false);
  
  // Quick Wins Hooks
  const shortcutDefinitions = [
    { key: 'n', description: 'New ticket', action: () => console.log('New ticket'), category: 'ticket' as const },
    { key: 's', description: 'Search', action: () => console.log('Search'), category: 'navigation' as const },
    { key: 'e', description: 'Export', action: () => setShowExportModal(true), category: 'system' as const },
  ];
  const { isShortcutsOpen, toggleShortcuts, shortcuts } = useKeyboardShortcuts(shortcutDefinitions);
  
  // Filter tickets for L1 - basic tickets and unassigned
  const myTickets = tickets.filter(ticket => ticket.assignedTo === user.id);
  const availableTickets = tickets.filter(ticket => 
    ticket.status === 'unassigned' && ['low', 'medium'].includes(ticket.problemLevel)
  );
  
  const userStats = {
    assigned: myTickets.length,
    inProgress: myTickets.filter(t => t.status === 'in-progress').length,
    resolved: myTickets.filter(t => t.status === 'resolved').length,
    available: availableTickets.length
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

  const handleStartWork = (ticketId: string) => {
    handleTicketUpdate(ticketId, { 
      status: 'in-progress',
      lastUpdated: new Date()
    });
  };

  const handleResolveTicket = (ticketId: string) => {
    handleTicketUpdate(ticketId, { 
      status: 'resolved',
      resolvedDate: new Date(),
      lastUpdated: new Date()
    });
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

  const [activeSection, setActiveSection] = useState('dashboard');

  // Navigation handler for sidebar
  const handleSidebarNavigate = (section: string) => {
    setActiveSection(section);
    // Optionally, scroll to section or set modal state
    switch (section) {
      case 'dashboard':
        // No modal, main dashboard
        break;
      case 'tickets':
        // Could scroll to tickets section or open tickets modal
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
      case 'security':
        setShowPhase2Demo(true);
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
        <DataSourceIndicator 
          isUsingMockData={isUsingMockData}
          isLoading={isLoading}
          onRefresh={refreshTickets}
        />
        {/* Clean Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg transition-colors duration-200">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Level 1 Support</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Welcome back, {user.firstName}</p>
              </div>
            </div>
            {/* User avatar or info can go here */}
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
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.available}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
            </div>
          </div>

          {/* Test Status Indicator */}
          <div className="mb-8">
            <TestStatusIndicator />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Tickets - Left Column */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Available Tickets</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Low and medium priority tickets you can take</p>
              </div>
              <div className="p-6">
                {availableTickets.length > 0 ? (
                  <div className="space-y-4">
                    {availableTickets.slice(0, 5).map(ticket => (
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
                            <p className="text-sm text-gray-500 line-clamp-2">{ticket.description}</p>
                            <div className="text-xs text-gray-400 dark:text-gray-400 mt-2">
                              Created {ticket.submittedDate.toLocaleDateString()}
                            </div>
                          </div>
                          <button
                            onClick={() => handleTakeTicket(ticket.id)}
                            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                          >
                            Take
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No available tickets</p>
                    <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">All basic tickets are handled!</p>
                  </div>
                )}
              </div>
            </div>

            {/* My Tickets - Right Column */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Tickets</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tickets assigned to you</p>
                  </div>
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
                              View
                            </button>
                            {ticket.status === 'open' && (
                              <button
                                onClick={() => handleStartWork(ticket.id)}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                              >
                                Start
                              </button>
                            )}
                            {ticket.status === 'in-progress' && (
                              <button
                                onClick={() => handleResolveTicket(ticket.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                              >
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
                        <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">Take some tickets from the available list</p>
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

          {/* Quick Help Section */}
          <div className="mt-8 bg-green-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-green-900 mb-2">Level 1 Support Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                  <div>
                    <h4 className="font-medium mb-1">Handle These Issues:</h4>
                    <ul className="space-y-1 text-green-700">
                      <li>• Password resets</li>
                      <li>• Basic account questions</li>
                      <li>• Simple software issues</li>
                      <li>• General inquiries</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">When to Escalate:</h4>
                    <ul className="space-y-1 text-green-700">
                      <li>• Technical system issues</li>
                      <li>• High priority problems</li>
                      <li>• Complex troubleshooting</li>
                      <li>• Security concerns</li>
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
              userRole="employee_l1"
              onClose={() => setShowPerformanceMetrics(false)}
            />
          </div>
        )}

        {showQuickActions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <QuickActionsPanel
              userRole="employee_l1"
              onAction={handleQuickAction}
              onClose={() => setShowQuickActions(false)}
            />
          </div>
        )}

        {showKnowledgeBase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <EmployeeKnowledgeBase
              userRole="employee_l1"
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
              userRole="employee_l1"
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
              userRole="employee_l1"
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
            userRole="employee_l1"
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
            userRole="employee_l1"
            currentUser={user}
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

        {/* Quick Wins Modals */}
        <KeyboardShortcuts
          isOpen={isShortcutsOpen}
          onClose={toggleShortcuts}
          shortcuts={shortcuts}
        />

        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          data={{ tickets: tickets, type: 'tickets' }}
          onExport={async (format, filters) => {
            console.log('Exporting tickets:', format, filters);
            // Simulate export
            await new Promise(resolve => setTimeout(resolve, 2000));
          }}
        />

        {/* Test Runner Modal */}
        {showTestRunner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Test Runner</h2>
                  <button
                    onClick={() => setShowTestRunner(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="p-6">
                <TestRunner />
              </div>
            </div>
          </div>
        )}

        {/* Phase 2 Demo Modal */}
        {showPhase2Demo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Phase 2: Error Handling & User Feedback</h2>
                  <button
                    onClick={() => setShowPhase2Demo(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="p-6">
                <Phase2Demo onBack={() => setShowPhase2Demo(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Phase 4 Performance Demo Modal */}
        {showPhase4Demo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Phase 4: Performance Optimization</h2>
                  <button
                    onClick={() => setShowPhase4Demo(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="p-6">
                <Phase4Demo />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};