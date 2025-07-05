import React, { useState, useEffect } from 'react';
import { Zap, Ticket, Clock, CheckCircle, AlertTriangle, Shield, Search, MessageSquare, Database, Server, Code, Eye, CheckSquare, BarChart3, BookOpen, Plus, Brain, Settings, FileText, Activity } from 'lucide-react';
import { User as UserType } from '../../types/user';
import { TicketStatsCard } from './TicketStatsCard';
import { TicketDetailModal } from '../TicketDetail/TicketDetailModal';
import { mockTickets, getTicketStats } from '../../data/mockTickets';
import { EmployeePerformanceMetrics } from './EmployeePerformanceMetrics';
import { QuickActionsPanel } from './QuickActionsPanel';
import { EmployeeKnowledgeBase } from './EmployeeKnowledgeBase';
import { AITicketAssistant } from './AITicketAssistant';
import { SmartWorkflowAutomation } from './SmartWorkflowAutomation';
import { AdvancedAnalyticsDashboard } from './AdvancedAnalyticsDashboard';
import { IntelligentCommunicationTools } from './IntelligentCommunicationTools';
import { ThemeToggle } from './ThemeToggle';

interface EmployeeL3DashboardProps {
  user: UserType;
  onLogout: () => void;
}

export const EmployeeL3Dashboard: React.FC<EmployeeL3DashboardProps> = ({ user, onLogout }) => {
  const [tickets, setTickets] = useState(mockTickets);
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
  
  // Filter tickets for L3 - critical issues and complex problems
  const myTickets = tickets.filter(ticket => ticket.assignedTo === user.id);
  const criticalTickets = tickets.filter(ticket => 
    (ticket.status === 'unassigned' && ticket.problemLevel === 'critical') ||
    (ticket.problemLevel === 'high' && ticket.status !== 'resolved')
  );
  
  const userStats = {
    assigned: myTickets.length,
    critical: tickets.filter(t => t.problemLevel === 'critical' && t.status !== 'resolved').length,
    resolved: myTickets.filter(t => t.status === 'resolved').length,
    consulting: tickets.filter(t => t.problemLevel === 'high' && t.status === 'in-progress').length
  };

  const availableUsers = [
    { id: '2', email: 'employee@sealkloud.com', firstName: 'Jane', lastName: 'Employee', role: 'employee_l1' as const, companyId: 'sealkloud', isActive: true },
    { id: '4', email: 'l2tech@sealkloud.com', firstName: 'Level 2', lastName: 'Tech', role: 'employee_l2' as const, companyId: 'sealkloud', isActive: true },
    { id: '5', email: 'l3expert@sealkloud.com', firstName: 'Level 3', lastName: 'Expert', role: 'employee_l3' as const, companyId: 'sealkloud', isActive: true }
  ];

  const handleTicketUpdate = (ticketId: string, updates: any) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    ));
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
      case 'expert-review':
        // Handle expert review action
        break;
      case 'critical-flag':
        // Handle critical flag action
        break;
      case 'database-diagnostic':
        // Handle database diagnostic action
        break;
      case 'system-logs':
        // Handle system logs action
        break;
      case 'performance-monitor':
        // Handle performance monitor action
        break;
      case 'security-audit':
        // Handle security audit action
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Clean Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg transition-colors duration-200">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Level 3 Expert Support</h1>
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
            <div className="text-sm text-gray-600 dark:text-gray-400">My Cases</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{userStats.critical}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Critical Issues</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.resolved}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Resolved Today</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userStats.consulting}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Consulting</div>
          </div>
        </div>

        {/* Critical Issues Alert */}
        {criticalTickets.filter(t => t.problemLevel === 'critical' && t.status !== 'resolved').length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-700 rounded-xl p-6 mb-8 transition-colors duration-200">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              <h2 className="text-lg font-bold text-red-900 dark:text-red-100">Critical Issues Requiring Expert Attention</h2>
            </div>
            <div className="space-y-4">
              {tickets
                .filter(t => t.problemLevel === 'critical' && t.status !== 'resolved')
                .map(ticket => (
                  <div key={ticket.id} className="bg-white dark:bg-gray-800 border-2 border-red-200 dark:border-red-700 rounded-lg p-4 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono font-medium text-gray-900 dark:text-white">{ticket.id}</span>
                          <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700">
                            CRITICAL
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {ticket.submittedDate.toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">{ticket.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{ticket.clientName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{ticket.description}</p>
                      </div>
                      <div className="ml-4">
                        {ticket.assignedTo === user.id ? (
                          <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-3 py-2 rounded-lg text-sm font-medium border border-red-200 dark:border-red-700">
                            Assigned to You
                          </span>
                        ) : (
                          <button
                            onClick={() => handleTakeTicket(ticket.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                          >
                            Take Ownership
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expert Cases - Left Column */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Expert Cases</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Critical and complex issues assigned to you</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 w-48"
                  />
                </div>
              </div>
            </div>
            <div className="p-6">
              {filteredMyTickets.length > 0 ? (
                <div className="space-y-4">
                  {filteredMyTickets.map(ticket => (
                    <div key={ticket.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors duration-200">
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
                      <p className="text-gray-500 dark:text-gray-400">No expert cases assigned</p>
                      <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">Monitor critical issues above</p>
                    </>
                  ) : (
                    <>
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No matching cases</p>
                      <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">Try a different search term</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* System Status & Tools - Right Column */}
          <div className="space-y-6">
            {/* System Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">System Overview</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Database Status</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Active Sessions</span>
                    <span className="text-gray-900 dark:text-white font-medium">143</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Server Load</span>
                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">Moderate</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Last Backup</span>
                    <span className="text-gray-900 dark:text-white font-medium">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Uptime</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">99.9%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expert Tools */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Expert Tools</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleQuickAction('database-diagnostic')}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-sm font-medium transition-colors duration-200 flex flex-col items-center gap-2"
                  >
                    <Database className="h-6 w-6" />
                    Database Diagnostic
                  </button>
                  <button
                    onClick={() => handleQuickAction('system-logs')}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-sm font-medium transition-colors duration-200 flex flex-col items-center gap-2"
                  >
                    <FileText className="h-6 w-6" />
                    System Logs
                  </button>
                  <button
                    onClick={() => handleQuickAction('performance-monitor')}
                    className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-sm font-medium transition-colors duration-200 flex flex-col items-center gap-2"
                  >
                    <Activity className="h-6 w-6" />
                    Performance Monitor
                  </button>
                  <button
                    onClick={() => handleQuickAction('security-audit')}
                    className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg text-sm font-medium transition-colors duration-200 flex flex-col items-center gap-2"
                  >
                    <Shield className="h-6 w-6" />
                    Security Audit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expert Guidelines */}
        <div className="mt-8 bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 p-2 rounded-lg">
              <Zap className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-red-900 mb-2">Level 3 Expert Responsibilities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-red-800">
                <div>
                  <h4 className="font-medium mb-1">Critical Issues:</h4>
                  <ul className="space-y-1 text-red-700">
                    <li>• System outages and downtime</li>
                    <li>• Security incidents and breaches</li>
                    <li>• Infrastructure failures</li>
                    <li>• Complex technical problems</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Expert Duties:</h4>
                  <ul className="space-y-1 text-red-700">
                    <li>• Provide technical guidance</li>
                    <li>• Mentor L1/L2 teams</li>
                    <li>• System architecture decisions</li>
                    <li>• Emergency response leadership</li>
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
            userRole="employee_l3"
            onClose={() => setShowPerformanceMetrics(false)}
          />
        </div>
      )}

      {showQuickActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <QuickActionsPanel
            userRole="employee_l3"
            onAction={handleQuickAction}
            onClose={() => setShowQuickActions(false)}
          />
        </div>
      )}

      {showKnowledgeBase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <EmployeeKnowledgeBase
            userRole="employee_l3"
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
            userRole="employee_l3"
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
            userRole="employee_l3"
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
          userRole="employee_l3"
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
          userRole="employee_l3"
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
    </div>
  );
};