import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, AlertTriangle, Search, MessageSquare, User, ArrowRight, BarChart3, BookOpen, Brain, History, Ticket, X } from 'lucide-react';
import { User as UserType } from '../../types/user';
import { Ticket as TicketType, TicketStatus, ProblemLevel, EscalationLevel } from '../../types/ticket';
import { EnhancedTicketDetailModal } from '../TicketDetail/EnhancedTicketDetailModal';
import { TicketHistoryModal } from '../TicketHistory/TicketHistoryModal';
import { useTickets } from '../../contexts/TicketContext';
import { TicketManagementService } from '../../services/ticketManagement';
import { ticketsAPI } from '../../services/api';
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


interface EmployeeL1DashboardProps {
  user: UserType;
  onLogout: () => void;
}

export const EmployeeL1Dashboard: React.FC<EmployeeL1DashboardProps> = ({ user, onLogout }) => {
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
  
  // State for ticket assignment system
  const [myTickets, setMyTickets] = useState<TicketType[]>([]);
  const [availableTickets, setAvailableTickets] = useState<TicketType[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketStats, setTicketStats] = useState({
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    available: 0
  });
  
  // Debug logging
  const safeTickets = Array.isArray(tickets) ? tickets : [];
  console.log('🔍 Ticket Debug Info:', {
    totalTickets: safeTickets.length,
    myTickets: myTickets.length,
    availableTickets: availableTickets.length,
    ticketsWithNewFields: safeTickets.filter(t => t.currentLevel && t.availableToLevels).length,
    unassignedTickets: safeTickets.filter(t => t.status === 'unassigned').length,
    availableForAssignment: safeTickets.filter(t => t.isAvailableForAssignment).length,
    currentUserId: user.id,
    assignedTickets: safeTickets.filter(t => t.assignedTo).map(t => ({ id: t.id, assignedTo: t.assignedTo, status: t.status })),
    myTicketsDetails: myTickets.map(t => ({ id: t.id, assignedTo: t.assignedTo, status: t.status, isAvailable: t.isAvailableForAssignment }))
  });
  
  // Debug panel state
  const [showDebug, setShowDebug] = useState(false);
  const [availableTicketsRaw, setAvailableTicketsRaw] = useState<any>(null);

  // Load tickets from API
  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      // Load my tickets
      const myTicketsResponse = await ticketsAPI.getMyTickets();
      if (myTicketsResponse.success && myTicketsResponse.data) {
        setMyTickets(myTicketsResponse.data.tickets || []);
      }

      // Load available tickets
      const availableTicketsResponse = await ticketsAPI.getAvailableTickets();
      setAvailableTicketsRaw(availableTicketsResponse);
      let availableTicketsArr: any[] = [];
      if (
        availableTicketsResponse.data &&
        typeof availableTicketsResponse.data === 'object' &&
        'tickets' in availableTicketsResponse.data &&
        Array.isArray((availableTicketsResponse.data as any).tickets)
      ) {
        availableTicketsArr = (availableTicketsResponse.data as any).tickets;
      } else if (Array.isArray(availableTicketsResponse.data)) {
        availableTicketsArr = availableTicketsResponse.data;
      }
      setAvailableTickets(availableTicketsArr);

      // Update stats
      const myTicketsData = myTicketsResponse.success ? (myTicketsResponse.data.tickets || []) : [];
      setTicketStats({
        assigned: myTicketsData.length,
        inProgress: myTicketsData.filter((t: any) => t.status === 'in-progress').length,
        resolved: myTicketsData.filter((t: any) => t.status === 'resolved').length,
        available: availableTicketsResponse.success ? (availableTicketsResponse.data.tickets || []).length : 0
      });
    } catch (error) {
      console.error('Error loading tickets:', error);
      showToast('Failed to load tickets', 'error');
    } finally {
      setLoadingTickets(false);
    }
  };

  // Load tickets on component mount and when user changes
  useEffect(() => {
    loadTickets();
  }, [user.id]);

  // Auto-refresh tickets every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadTickets, 30000);
    return () => clearInterval(interval);
  }, [user.id]);

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

  // Helper to open ticket details and fetch latest data
  const openTicketDetails = async (ticketId: string) => {
    try {
      const response = await ticketsAPI.getById(ticketId);
      if (response.success && response.data && response.data.ticket) {
        setSelectedTicket(response.data.ticket);
      } else {
        showToast('Failed to load ticket details', 'error');
      }
    } catch (error) {
      showToast('Failed to load ticket details', 'error');
    }
  };

  const handleTakeTicket = async (ticketId: string) => {
    try {
      const response = await ticketsAPI.claimTicket(ticketId);
      await loadTickets(); // Always reload tickets after claim
      setSelectedTicket(null); // Close modal after claim
      if (response.success) {
        showToast('Ticket successfully claimed!', 'success');
      } else {
        showToast(response.error?.message || 'Failed to claim ticket', 'error');
      }
    } catch (error) {
      await loadTickets(); // Reload even on error
      setSelectedTicket(null); // Close modal on error
      showToast('Failed to claim ticket', 'error');
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

  // Enhanced Quick Action Handlers
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
      case 'advanced-filter':
        // This could open a filter modal
        console.log('Advanced filter requested');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  // Specific action handlers
  const handleEscalateTicket = (ticketId: string) => {
    const ticket = safeTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    // Find Level 2 employees
    const level2Employees = availableUsers.filter(u => u.role === 'employee_l2');
    
    if (level2Employees.length === 0) {
      console.log('No Level 2 employees available');
      return;
    }

    // Escalate to all Level 2 employees (round-robin or first available)
    const assignedEmployee = level2Employees[0]; // Could implement round-robin logic
    
    handleTicketUpdate(ticketId, {
      status: 'escalated',
      assignedTo: assignedEmployee.id,
      assignedToName: `${assignedEmployee.firstName} ${assignedEmployee.lastName}`,
      priority: 'high', // Escalated tickets become high priority
      lastUpdated: new Date(),
      activityLog: [
        ...ticket.activityLog,
        {
          id: `activity-${Date.now()}`,
          ticketId: ticketId,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'escalate-ticket',
          description: `ESCALATED to Level 2 by ${user.firstName} ${user.lastName}. Assigned to: ${assignedEmployee.firstName} ${assignedEmployee.lastName}`,
          timestamp: new Date()
        }
      ]
    });

    console.log(`Ticket ${ticketId} escalated to Level 2 employee: ${assignedEmployee.firstName} ${assignedEmployee.lastName}`);
  };

  const handleDelegateTicket = (ticketId: string) => {
    const ticket = safeTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    // Find available Level 1 employees (excluding current user)
    const availableL1Employees = availableUsers.filter(u => 
      u.role === 'employee_l1' && u.id !== user.id
    );
    
    if (availableL1Employees.length === 0) {
      console.log('No other Level 1 employees available');
      return;
    }

    // Delegate to first available L1 employee
    const delegatedEmployee = availableL1Employees[0];
    
    handleTicketUpdate(ticketId, {
      assignedTo: delegatedEmployee.id,
      assignedToName: `${delegatedEmployee.firstName} ${delegatedEmployee.lastName}`,
      lastUpdated: new Date(),
      activityLog: [
        ...ticket.activityLog,
        {
          id: `activity-${Date.now()}`,
          ticketId: ticketId,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'delegate-ticket',
          description: `DELEGATED to ${delegatedEmployee.firstName} ${delegatedEmployee.lastName} by ${user.firstName} ${user.lastName}`,
          timestamp: new Date()
        }
      ]
    });

    console.log(`Ticket ${ticketId} delegated to: ${delegatedEmployee.firstName} ${delegatedEmployee.lastName}`);
  };

  const handleSendUpdate = (ticketId: string) => {
    const ticket = safeTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const updateMessage = `Update sent via keyboard shortcut by ${user.firstName} ${user.lastName}`;
    
    handleTicketUpdate(ticketId, {
      lastUpdated: new Date(),
      activityLog: [
        ...ticket.activityLog,
        {
          id: `activity-${Date.now()}`,
          ticketId: ticketId,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'send-update',
          description: `UPDATE SENT: ${updateMessage}`,
          timestamp: new Date()
        }
      ]
    });

    console.log(`Update sent for ticket ${ticketId}: ${updateMessage}`);
  };

  const handleRequestInfo = (ticketId: string) => {
    const ticket = safeTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const infoRequest = `Information requested via keyboard shortcut by ${user.firstName} ${user.lastName}`;
    
    handleTicketUpdate(ticketId, {
      status: 'waiting-for-info',
      lastUpdated: new Date(),
      activityLog: [
        ...ticket.activityLog,
        {
          id: `activity-${Date.now()}`,
          ticketId: ticketId,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'request-info',
          description: `INFO REQUESTED: ${infoRequest}`,
          timestamp: new Date()
        }
      ]
    });

    console.log(`Information requested for ticket ${ticketId}: ${infoRequest}`);
  };

  const handleScheduleCall = (ticketId: string) => {
    const ticket = safeTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    // Schedule call for tomorrow at 10 AM (example)
    const callDate = new Date();
    callDate.setDate(callDate.getDate() + 1);
    callDate.setHours(10, 0, 0, 0);

    const callMessage = `Call scheduled for ${callDate.toLocaleDateString()} at ${callDate.toLocaleTimeString()} by ${user.firstName} ${user.lastName}`;
    
    handleTicketUpdate(ticketId, {
      lastUpdated: new Date(),
      activityLog: [
        ...ticket.activityLog,
        {
          id: `activity-${Date.now()}`,
          ticketId: ticketId,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'schedule-call',
          description: `CALL SCHEDULED: ${callMessage}`,
          timestamp: new Date()
        }
      ]
    });

    console.log(`Call scheduled for ticket ${ticketId}: ${callMessage}`);
  };

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    addToast({
      type: type as 'success' | 'error' | 'info',
      title: type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info',
      message: message,
      duration: 3000
    });
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage
    const settingsToSave = {
      highContrast: settings.highContrast,
      fontSize: settings.fontSize,
      reducedMotion: settings.reducedMotion,
      emailNotifications: settings.emailNotifications,
      desktopNotifications: settings.desktopNotifications,
      theme: settings.theme
    };
    
    localStorage.setItem('employeeSettings', JSON.stringify(settingsToSave));
    
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Your settings have been saved successfully!',
      duration: 2000
    });
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
    const savedSettings = localStorage.getItem('employeeSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSettings(settings);
      
      // Apply loaded settings
      applySettings(settings);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      highContrast: false,
      fontSize: 'medium',
      reducedMotion: false,
      emailNotifications: true,
      desktopNotifications: true,
      theme: 'system'
    });
    
    addToast({
      type: 'info',
      title: 'Settings Reset',
      message: 'Settings have been reset to defaults',
      duration: 3000
    });
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

  // Update filteredMyTickets to exclude resolved tickets
  const filteredMyTickets = myTickets.filter(ticket =>
    ticket.status !== 'resolved' && (
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Add a filter for resolved tickets assigned to this employee
  const myResolvedTickets = myTickets.filter(ticket => ticket.status === 'resolved');

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        setShowChat(true);
        break;
      case 'automation':
        setShowWorkflowAutomation(true);
        break;
      case 'security':
        setShowPhase2Demo(true);
        break;
      case 'history':
        setShowTicketHistory(true);
        break;
      case 'settings':
        setShowSettings(true);
        break;
      default:
        break;
    }
  };

  // Test function to debug ticket assignment
  const debugTicketAssignment = () => {
    console.log('🧪 Debug Ticket Assignment Test');
    console.log('Current User:', { id: user.id, email: user.email, role: user.role });
    console.log('All Tickets:', safeTickets.map(t => ({ 
      id: t.id, 
      clientId: t.clientId, 
      assignedTo: t.assignedTo, 
      status: t.status, 
      isAvailable: t.isAvailableForAssignment,
      availableToLevels: t.availableToLevels 
    })));
    console.log('My Tickets:', myTickets);
    console.log('Available Tickets:', availableTickets);
    
    // Test taking the first available ticket
    if (availableTickets.length > 0) {
      const testTicket = availableTickets[0];
      console.log('🧪 Testing take ticket for:', testTicket.id);
      handleTakeTicket(testTicket.id);
    } else {
      console.log('🧪 No available tickets to test with');
    }
  };

  const [knowledgeBaseFullscreen, setKnowledgeBaseFullscreen] = useState(false);

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
          isUsingMockData={false}
          isLoading={false}
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
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={debugTicketAssignment}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                title="Debug Ticket Assignment"
              >
                🧪 Debug
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
          {/* Simple Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                              <div className="text-2xl font-bold text-gray-900 dark:text-white">{ticketStats.assigned}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">My Tickets</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{ticketStats.inProgress}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{ticketStats.resolved}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Resolved Today</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{ticketStats.available}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Tickets - Left Column */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Available Tickets</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Unassigned tickets you can claim</p>
                  </div>
                  <button
                    onClick={loadTickets}
                    disabled={loadingTickets}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                  >
                    {loadingTickets ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>
              <div className="p-6">
                {loadingTickets ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading tickets...</p>
                  </div>
                ) : availableTickets.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {availableTickets.slice(0, 5).map(ticket => (
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
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(ticket.priority || ticket.problemLevel)}`}>
                                {(ticket.priority || ticket.problemLevel).charAt(0).toUpperCase() + (ticket.priority || ticket.problemLevel).slice(1)}
                              </span>
                            </div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-1">{ticket.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{ticket.clientName}</p>
                            <p className="text-sm text-gray-500 line-clamp-2">{ticket.description}</p>
                            <div className="text-xs text-gray-400 dark:text-gray-400 mt-2">
                              Created {new Date(ticket.submittedDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="ml-4 flex flex-col gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTakeTicket(ticket.id);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                            >
                              Take
                            </button>
                            {ticket.availableToLevels && ticket.availableToLevels.includes('l2') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePushToLevel(ticket.id, 'l2');
                                }}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                              >
                                Push to L2
                              </button>
                            )}
                            {ticket.availableToLevels && ticket.availableToLevels.includes('l3') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePushToLevel(ticket.id, 'l3');
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                              >
                                Push to L3
                              </button>
                            )}
                          </div>
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
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                    <button
                      onClick={loadTickets}
                      disabled={loadingTickets}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                    >
                      {loadingTickets ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {loadingTickets ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading tickets...</p>
                  </div>
                ) : filteredMyTickets.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {filteredMyTickets.map(ticket => (
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
                                openTicketDetails(ticket.id);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                            >
                              View
                            </button>
                            {ticket.status === 'open' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartWork(ticket.id);
                                }}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                              >
                                Start
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
                {/* Test button for debugging */}
                <div className="mt-4 pt-4 border-t border-green-200">
                  <button
                    onClick={() => {
                      console.log('🔧 Creating test ticket...');
                      const testTicket = {
                        id: `TK-TEST-${Date.now()}`,
                        clientName: 'Test Client',
                        clientId: 'test-client',
                        title: 'Test Ticket',
                        description: 'This is a test ticket created for debugging',
                        problemLevel: 'medium' as ProblemLevel,
                        priority: 'medium' as ProblemLevel,
                        status: 'unassigned' as TicketStatus,
                        submittedDate: new Date(),
                        lastUpdated: new Date(),
                        currentLevel: 'l1' as EscalationLevel,
                        availableToLevels: (['l1'] as EscalationLevel[]),
                        escalationHistory: [],
                        isAvailableForAssignment: true,
                        activityLog: [],
                        clientNotifications: []
                      };
                      console.log('🔧 Test ticket:', testTicket);
                      // Use the ticket context to add the ticket
                      const { addTicket } = useTickets();
                      addTicket(testTicket);
                      showToast('Test ticket created!', 'success');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Create Test Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Ticket Details - {selectedTicket.id}
                </h2>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Real-time Status Tracker */}
                  <RealTimeStatusTracker
                    ticket={selectedTicket}
                    currentUser={user}
                    onStatusUpdate={(status) => {
                      handleTicketUpdate(selectedTicket.id, { status });
                    }}
                  />
                  
                  {/* Enhanced Ticket Detail Modal */}
                  <div className="lg:col-span-1">
                    <EnhancedTicketDetailModal
                      ticket={selectedTicket}
                      isOpen={!!selectedTicket}
                      onClose={() => setSelectedTicket(null)}
                      onUpdate={handleTicketUpdate}
                      currentUser={user}
                      availableUsers={availableUsers}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-6">
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full ${knowledgeBaseFullscreen ? 'max-w-none h-full max-h-none' : 'max-w-5xl h-full max-h-[90vh]'} overflow-hidden flex flex-col`}>
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" style={{minHeight: '64px'}}>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">Knowledge Base</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <EmployeeKnowledgeBase
                  userRole="employee_l1"
                  currentTicket={selectedTicket}
                  onClose={() => setShowKnowledgeBase(false)}
                  onApplySolution={handleApplySolution}
                />
              </div>
            </div>
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

        {/* Enhanced Ticket History Modal */}
        <TicketHistoryModal
          isOpen={false}
          onClose={() => {}}
          tickets={myResolvedTickets}
          currentUser={user}
          availableUsers={[]}
          onUpdate={(id, updates) => {}}
        />

        {/* Quick Wins Modals */}
        {/* Toast Notification */}
        {toastMessage && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${
            toastType === 'success' 
              ? 'bg-green-500 text-white' 
              : toastType === 'error' 
                ? 'bg-red-500 text-white' 
                : 'bg-blue-500 text-white'
          }`}>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium">{toastMessage}</p>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <ChatInterface
          currentUser={user}
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          setChatNotifications={setChatNotifications}
        />

        {/* Chat Notifications */}
        <NotificationManager
          notifications={chatNotifications}
          onRemoveNotification={(id) => {
            setChatNotifications(prev => prev.filter(n => n.id !== id));
          }}
          onOpenChat={() => setShowChat(true)}
        />

        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          data={{ tickets: [], type: 'tickets' }}
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
      {/* Debug Panel */}
      <div className="fixed bottom-0 right-0 m-4 z-50">
        <button
          onClick={() => setShowDebug(d => !d)}
          className="bg-gray-800 text-white px-3 py-1 rounded shadow hover:bg-gray-700 text-xs"
        >
          {showDebug ? 'Hide' : 'Show'} Debug Panel
        </button>
        {showDebug && (
          <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded p-4 mt-2 max-w-2xl max-h-96 overflow-auto text-xs text-left shadow-xl">
            <div className="mb-2 font-bold">Raw Available Tickets API Response:</div>
            <pre className="whitespace-pre-wrap break-all">{JSON.stringify(availableTicketsRaw, null, 2)}</pre>
            <div className="mb-2 mt-4 font-bold">Available Tickets (parsed):</div>
            <pre className="whitespace-pre-wrap break-all">{JSON.stringify(availableTickets, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};