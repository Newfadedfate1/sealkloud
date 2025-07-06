import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, AlertTriangle, Search, MessageSquare, User, ArrowRight, BarChart3, BookOpen, Brain, History, Ticket, X, Zap, Eye, Database, FileText, Activity, Shield } from 'lucide-react';
import { User as UserType } from '../../types/user';
import { Ticket as TicketType, TicketStatus, ProblemLevel, EscalationLevel } from '../../types/ticket';
import { EnhancedTicketDetailModal } from '../TicketDetail/EnhancedTicketDetailModal';
import { TicketHistoryModal } from '../TicketHistory/TicketHistoryModal';
import { useTickets } from '../../contexts/TicketContext';
import { TicketManagementService } from '../../services/ticketManagement';
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
import { ExportModal } from '../ExportModal';
// Phase 2 Components
import { Phase2Demo } from '../Phase2Demo/Phase2Demo';
// Phase 4 Components
import { Phase4Demo } from '../Phase4Demo/Phase4Demo';
import { Sidebar } from '../Sidebar/Sidebar';
import { useToast } from '../Toast/ToastContainer';
// Chat Components
import { ChatInterface } from '../Chat/ChatInterface';
import { NotificationManager } from '../Chat/ChatNotification';
import { RealTimeStatusTracker } from './RealTimeStatusTracker';

interface EmployeeL3DashboardProps {
  user: UserType;
  onLogout: () => void;
}

export const EmployeeL3Dashboard: React.FC<EmployeeL3DashboardProps> = ({ user, onLogout }) => {
  const { tickets, updateTicket, refreshTickets, ticketService, takeTicket, pushTicketToLevel } = useTickets();
  const { addToast } = useToast();
  
  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);
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
  const [showSettings, setShowSettings] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [highlightedTicketId, setHighlightedTicketId] = useState<string | null>(null);
  
  // Settings state
  const [settings, setSettings] = useState({
    highContrast: false,
    fontSize: 'medium',
    reducedMotion: false,
    emailNotifications: true,
    desktopNotifications: true,
    theme: 'system'
  });
  
  // Quick Wins States
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTestRunner, setShowTestRunner] = useState(false);
  
  // Phase 2 States
  const [showPhase2Demo, setShowPhase2Demo] = useState(false);
  // Phase 4 State
  const [showPhase4Demo, setShowPhase4Demo] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  
  // Chat States
  const [showChat, setShowChat] = useState(false);
  const [chatNotifications, setChatNotifications] = useState<Array<{
    id: string;
    senderName: string;
    content: string;
    timestamp: Date;
  }>>([]);
  
  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Filter tickets for L3 using the new system
  const myTickets = tickets.filter(ticket => ticket.assignedTo === user.id);
  const availableTickets = ticketService.getAvailableTicketsForLevel('l3');
  
  // Debug logging
  console.log('🔍 Ticket Debug Info:', {
    totalTickets: tickets.length,
    myTickets: myTickets.length,
    availableTickets: availableTickets.length,
    ticketsWithNewFields: tickets.filter(t => t.currentLevel && t.availableToLevels).length,
    unassignedTickets: tickets.filter(t => t.status === 'unassigned').length,
    availableForAssignment: tickets.filter(t => t.isAvailableForAssignment).length,
    currentUserId: user.id,
    assignedTickets: tickets.filter(t => t.assignedTo).map(t => ({ id: t.id, assignedTo: t.assignedTo, status: t.status })),
    myTicketsDetails: myTickets.map(t => ({ id: t.id, assignedTo: t.assignedTo, status: t.status, isAvailable: t.isAvailableForAssignment }))
  });
  
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

  // Initialize the service with current data
  React.useEffect(() => {
    ticketService.initialize(tickets, availableUsers);
  }, [tickets, availableUsers, ticketService]);

  const handleTicketUpdate = (ticketId: string, updates: any) => {
    updateTicket(ticketId, updates);
    setSelectedTicket(null);
  };

  const handleTakeTicket = (ticketId: string) => {
    const result = takeTicket(ticketId, user.id);
    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handlePushToLevel = (ticketId: string, targetLevel: 'l2' | 'l3') => {
    const reason = targetLevel === 'l2' ? 'Requires technical expertise' : 'Requires expert intervention';
    const result = pushTicketToLevel(ticketId, user.id, targetLevel, reason);
    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
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

  const handleEscalateTicket = (ticketId: string) => {
    handleTicketUpdate(ticketId, {
      status: 'escalated',
      lastUpdated: new Date(),
      activityLog: [
        ...(tickets.find(t => t.id === ticketId)?.activityLog || []),
        {
          id: `activity-${Date.now()}`,
          ticketId: ticketId,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'escalate',
          description: `Ticket escalated by ${user.firstName} ${user.lastName}`,
          timestamp: new Date()
        }
      ]
    });
  };

  const handleDelegateTicket = (ticketId: string) => {
    handleTicketUpdate(ticketId, {
      status: 'delegated',
      lastUpdated: new Date(),
      activityLog: [
        ...(tickets.find(t => t.id === ticketId)?.activityLog || []),
        {
          id: `activity-${Date.now()}`,
          ticketId: ticketId,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'delegate',
          description: `Ticket delegated by ${user.firstName} ${user.lastName}`,
          timestamp: new Date()
        }
      ]
    });
  };

  const handleSendUpdate = (ticketId: string) => {
    const update = prompt('Enter update message:');
    if (update) {
      handleTicketUpdate(ticketId, {
        lastUpdated: new Date(),
        activityLog: [
          ...(tickets.find(t => t.id === ticketId)?.activityLog || []),
          {
            id: `activity-${Date.now()}`,
            ticketId: ticketId,
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`,
            action: 'update',
            description: `Update sent: ${update}`,
            timestamp: new Date()
          }
        ]
      });
    }
  };

  const handleRequestInfo = (ticketId: string) => {
    const request = prompt('What information do you need?');
    if (request) {
      handleTicketUpdate(ticketId, {
        status: 'waiting-for-info',
        lastUpdated: new Date(),
        activityLog: [
          ...(tickets.find(t => t.id === ticketId)?.activityLog || []),
          {
            id: `activity-${Date.now()}`,
            ticketId: ticketId,
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`,
            action: 'request-info',
            description: `Information requested: ${request}`,
            timestamp: new Date()
          }
        ]
      });
    }
  };

  const handleScheduleCall = (ticketId: string) => {
    const callDetails = prompt('Enter call details (date/time):');
    if (callDetails) {
      handleTicketUpdate(ticketId, {
        status: 'call-scheduled',
        lastUpdated: new Date(),
        activityLog: [
          ...(tickets.find(t => t.id === ticketId)?.activityLog || []),
          {
            id: `activity-${Date.now()}`,
            ticketId: ticketId,
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`,
            action: 'schedule-call',
            description: `Call scheduled: ${callDetails}`,
            timestamp: new Date()
          }
        ]
      });
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    addToast({
      type,
      title: type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info',
      message,
      duration: 3000
    });
  };

  // Enhanced Quick Action Handlers
  const handleQuickAction = (action: string, data?: any) => {
    console.log('Quick action:', action, data);
    const ticketId = data?.ticketId || highlightedTicketId;
    
    if (!ticketId) {
      console.log('No ticket selected for action:', action);
      return;
    }

    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
      console.log('Ticket not found:', ticketId);
      return;
    }

    switch (action) {
      case 'start-work':
        handleStartWork(ticketId);
        break;
      case 'pause-work':
        handleTicketUpdate(ticketId, {
          status: 'paused',
          lastUpdated: new Date(),
          activityLog: [
            ...ticket.activityLog,
            {
              id: `activity-${Date.now()}`,
              ticketId: ticketId,
              userId: user.id,
              userName: `${user.firstName} ${user.lastName}`,
              action: 'pause-work',
              description: `Work paused by ${user.firstName} ${user.lastName}`,
              timestamp: new Date()
            }
          ]
        });
        break;
      case 'resolve-ticket':
        handleResolveTicket(ticketId);
        break;
      case 'escalate-ticket':
        handleEscalateTicket(ticketId);
        break;
      case 'delegate-ticket':
        handleDelegateTicket(ticketId);
        break;
      case 'send-update':
        handleSendUpdate(ticketId);
        break;
      case 'request-info':
        handleRequestInfo(ticketId);
        break;
      case 'schedule-call':
        handleScheduleCall(ticketId);
        break;
      case 'expert-review':
        handleTicketUpdate(ticketId, {
          status: 'expert-review',
          lastUpdated: new Date(),
          activityLog: [
            ...ticket.activityLog,
            {
              id: `activity-${Date.now()}`,
              ticketId: ticketId,
              userId: user.id,
              userName: `${user.firstName} ${user.lastName}`,
              action: 'expert-review',
              description: `Expert review initiated by ${user.firstName} ${user.lastName}`,
              timestamp: new Date()
            }
          ]
        });
        break;
      case 'critical-flag':
        handleTicketUpdate(ticketId, {
          problemLevel: 'critical',
          lastUpdated: new Date(),
          activityLog: [
            ...ticket.activityLog,
            {
              id: `activity-${Date.now()}`,
              ticketId: ticketId,
              userId: user.id,
              userName: `${user.firstName} ${user.lastName}`,
              action: 'critical-flag',
              description: `Critical flag set by ${user.firstName} ${user.lastName}`,
              timestamp: new Date()
            }
          ]
        });
        break;
      case 'database-diagnostic':
        handleTicketUpdate(ticketId, {
          status: 'diagnostic',
          lastUpdated: new Date(),
          activityLog: [
            ...ticket.activityLog,
            {
              id: `activity-${Date.now()}`,
              ticketId: ticketId,
              userId: user.id,
              userName: `${user.firstName} ${user.lastName}`,
              action: 'database-diagnostic',
              description: `Database diagnostic started by ${user.firstName} ${user.lastName}`,
              timestamp: new Date()
            }
          ]
        });
        break;
      case 'system-logs':
        handleTicketUpdate(ticketId, {
          status: 'analyzing',
          lastUpdated: new Date(),
          activityLog: [
            ...ticket.activityLog,
            {
              id: `activity-${Date.now()}`,
              ticketId: ticketId,
              userId: user.id,
              userName: `${user.firstName} ${user.lastName}`,
              action: 'system-logs',
              description: `System logs analysis started by ${user.firstName} ${user.lastName}`,
              timestamp: new Date()
            }
          ]
        });
        break;
      case 'performance-monitor':
        handleTicketUpdate(ticketId, {
          status: 'monitoring',
          lastUpdated: new Date(),
          activityLog: [
            ...ticket.activityLog,
            {
              id: `activity-${Date.now()}`,
              ticketId: ticketId,
              userId: user.id,
              userName: `${user.firstName} ${user.lastName}`,
              action: 'performance-monitor',
              description: `Performance monitoring started by ${user.firstName} ${user.lastName}`,
              timestamp: new Date()
            }
          ]
        });
        break;
      case 'security-audit':
        handleTicketUpdate(ticketId, {
          status: 'security-audit',
          lastUpdated: new Date(),
          activityLog: [
            ...ticket.activityLog,
            {
              id: `activity-${Date.now()}`,
              ticketId: ticketId,
              userId: user.id,
              userName: `${user.firstName} ${user.lastName}`,
              action: 'security-audit',
              description: `Security audit initiated by ${user.firstName} ${user.lastName}`,
              timestamp: new Date()
            }
          ]
        });
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

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('sealkloud-settings', JSON.stringify(settings));
    
    // Apply settings immediately
    applySettings(settings);
    
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Your settings have been saved successfully!',
      duration: 3000
    });
    setShowSettings(false);
  };

  const applySettings = (settings: any) => {
    // Apply high contrast
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Apply font size
    const fontSizeMap = {
      'small': '0.875rem',
      'medium': '1rem',
      'large': '1.125rem',
      'extra-large': '1.25rem'
    };
    document.documentElement.style.fontSize = fontSizeMap[settings.fontSize as keyof typeof fontSizeMap] || '1rem';

    // Apply reduced motion
    if (settings.reducedMotion) {
      document.documentElement.style.setProperty('--motion-reduce', '1');
    } else {
      document.documentElement.style.removeProperty('--motion-reduce');
    }

    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('sealkloud-settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      
      // Apply loaded settings
      applySettings(parsedSettings);
    }
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      highContrast: false,
      fontSize: 'medium',
      reducedMotion: false,
      emailNotifications: true,
      desktopNotifications: true,
      theme: 'system'
    };
    
    setSettings(defaultSettings);
    applySettings(defaultSettings);
    
    addToast({
      type: 'info',
      title: 'Settings Reset',
      message: 'Settings have been reset to defaults',
      duration: 3000
    });
  };

  const filteredMyTickets = myTickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sidebar navigation handler
  const debugTicketAssignment = () => {
    console.log('🔧 Debug Ticket Assignment');
    console.log('Current User:', user);
    console.log('Total Tickets:', tickets.length);
    console.log('My Tickets:', myTickets.length);
    console.log('Available Tickets:', availableTickets.length);
    
    // Test ticket assignment
    if (availableTickets.length > 0) {
      const testTicket = availableTickets[0];
      console.log('Testing assignment for ticket:', testTicket.id);
      const result = takeTicket(testTicket.id, user.id);
      console.log('Assignment result:', result);
      
      if (result.success) {
        showToast(`Debug: Successfully assigned ticket ${testTicket.id}`, 'success');
      } else {
        showToast(`Debug: Failed to assign ticket ${testTicket.id} - ${result.message}`, 'error');
      }
    } else {
      showToast('Debug: No available tickets to test assignment', 'info');
    }
  };

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
      case 'history':
        setShowTicketHistory(true);
        break;
      case 'settings':
        setShowSettings(true);
        break;
      case 'chat':
        setShowChat(true);
        break;
      case 'export':
        setShowExportModal(true);
        break;
      case 'test-runner':
        setShowTestRunner(true);
        break;
      case 'phase2-demo':
        setShowPhase2Demo(true);
        break;
      case 'phase4-demo':
        setShowPhase4Demo(true);
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
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
      />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
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
                <ThemeToggle />
                <button
                  onClick={debugTicketAssignment}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white px-3 py-2 text-sm transition-colors duration-200"
                  title="Debug Ticket Assignment"
                >
                  Debug
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
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.inProgress}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.resolved}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Resolved Today</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userStats.available}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Available Cases</div>
            </div>
          </div>

          {/* Critical Issues Alert */}
          {tickets.filter(t => t.problemLevel === 'critical' && t.status !== 'resolved').length > 0 && (
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
                  <EnhancedTicketDetailModal
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

        {/* Enhanced Ticket History Modal */}
        <TicketHistoryModal
          isOpen={showTicketHistory}
          onClose={() => setShowTicketHistory(false)}
          tickets={tickets}
          currentUser={user}
          availableUsers={availableUsers}
          onUpdate={handleTicketUpdate}
        />

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-8">
                  {/* Accessibility Settings */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Accessibility Settings</h3>
                    </div>
                    <div className="space-y-4">
                      {/* High Contrast Toggle */}
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white">High Contrast Mode</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Increase contrast for better visibility</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            const newValue = !settings.highContrast;
                            setSettings({ ...settings, highContrast: newValue });
                            // Apply immediately
                            if (newValue) {
                              document.documentElement.classList.add('high-contrast');
                            } else {
                              document.documentElement.classList.remove('high-contrast');
                            }
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                            settings.highContrast ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                              settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Font Size Selector */}
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white">Font Size</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Adjust text size for better readability</p>
                          </div>
                        </div>
                        <select 
                          value={settings.fontSize}
                          onChange={(e) => {
                            const newSize = e.target.value;
                            setSettings({ ...settings, fontSize: newSize });
                            // Apply immediately
                            const fontSizeMap = {
                              'small': '0.875rem',
                              'medium': '1rem',
                              'large': '1.125rem',
                              'extra-large': '1.25rem'
                            };
                            document.documentElement.style.fontSize = fontSizeMap[newSize as keyof typeof fontSizeMap] || '1rem';
                          }}
                          className="px-4 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                          <option value="extra-large">Extra Large</option>
                        </select>
                      </div>

                      {/* Reduced Motion Toggle */}
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white">Reduced Motion</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Reduce animations and transitions</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            const newValue = !settings.reducedMotion;
                            setSettings({ ...settings, reducedMotion: newValue });
                            // Apply immediately
                            if (newValue) {
                              document.documentElement.style.setProperty('--motion-reduce', '1');
                            } else {
                              document.documentElement.style.removeProperty('--motion-reduce');
                            }
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                            settings.reducedMotion ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                              settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Notification Settings */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4.19A2 2 0 006 3h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Notification Settings</h3>
                    </div>
                    <div className="space-y-4">
                      {/* Email Notifications */}
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                            <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white">Email Notifications</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates via email</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setEmailNotifications(!emailNotifications)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                            emailNotifications ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                              emailNotifications ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Desktop Notifications */}
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
                        <div className="flex items-center gap-3">
                          <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-lg">
                            <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white">Desktop Notifications</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Show notifications on desktop</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setDesktopNotifications(!desktopNotifications)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                            desktopNotifications ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                              desktopNotifications ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Theme Settings */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Theme Settings</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => {
                          setTheme('light');
                          // Apply immediately
                          document.documentElement.classList.remove('dark');
                        }}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          theme === 'light' 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                          <span className="font-medium text-gray-900 dark:text-white">Light Mode</span>
                        </div>
                      </button>
                      <button 
                        onClick={() => {
                          setTheme('dark');
                          // Apply immediately
                          document.documentElement.classList.add('dark');
                        }}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          theme === 'dark' 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                          <span className="font-medium text-gray-900 dark:text-white">Dark Mode</span>
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={resetToDefaults}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-medium transition-all duration-200 hover:shadow-md"
                    >
                      Reset to Defaults
                    </button>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-medium transition-all duration-200 hover:shadow-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveSettings}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};