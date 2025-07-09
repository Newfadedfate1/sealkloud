import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTickets } from '../../contexts/TicketContext';
import { useToast } from '../Toast/ToastContainer';
import { Ticket, TicketStatus, ProblemLevel, EscalationLevel } from '../../types/ticket';
import { User } from '../../types/user';
import { Sidebar } from '../Sidebar/Sidebar';
import { TicketTable } from './TicketTable';
import { TicketDetailModal } from '../TicketDetail/TicketDetailModal';
import { TicketHistoryModal } from '../TicketHistory/TicketHistoryModal';
import { CreateTicketModal } from '../Tickets/CreateTicketModal';
import { ExportModal } from '../ExportModal';
import { UserManagementModal } from '../UserManagement/UserManagementModal';
import { NotificationCenter } from '../NotificationCenter';
import { ChatInterface } from '../Chat/ChatInterface';
import { ChatNotification } from '../Chat/ChatNotification';
import { KnowledgeBase } from '../KnowledgeBase';
import { ThemeToggle } from './ThemeToggle';
import { SearchBar } from '../SearchBar';
import { Pagination } from '../Pagination';
import { Search, CheckCircle, MessageSquare, X } from 'lucide-react';
// Temporarily commenting out problematic imports to fix build issues
// import LoadingSkeleton from '../LoadingSkeleton';
// import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
// import PerformanceDashboard from '../Performance/PerformanceDashboard';
// import EmployeePerformanceMetrics from './EmployeePerformanceMetrics';
// import EmployeeTicketHistory from './EmployeeTicketHistory';
// import EmployeeKnowledgeBase from './EmployeeKnowledgeBase';
// import RealTimeStatusTracker from './RealTimeStatusTracker';
// import DataSourceIndicator from '../DataSourceIndicator';
import { TestStatusIndicator } from './TestStatusIndicator';
// import QuickActionsPanel from './QuickActionsPanel';
// import SmartWorkflowAutomation from './SmartWorkflowAutomation';
// import AITicketAssistant from './AITicketAssistant';
// import IntelligentCommunicationTools from './IntelligentCommunicationTools';
// import ClientAnalytics from '../AI/ClientAnalytics';
// import SelfServiceTools from '../AI/SelfServiceTools';
// import SmartTicketAssistant from '../AI/SmartTicketAssistant';
// import SupportChatbot from '../AI/SupportChatbot';
// import TwoFactorAuth from '../Auth/TwoFactorAuth';
// import ClientNotificationCenter from '../ClientNotificationCenter';
// import ClientSettings from '../Client/ClientSettings';
// import BulkActions from '../BulkActions';
// import ChatSupport from '../ChatSupport';
// import KeyboardShortcuts from '../KeyboardShortcuts';
// import EnhancedSearch from '../EnhancedSearch';
// import FormValidator from '../FormValidation/FormValidator';
// import AdvancedAnalyticsDashboard from './AdvancedAnalyticsDashboard';
// import QuickActionsPanel from './QuickActionsPanel';
// import AccessibleForm from '../Accessibility/AccessibleForm';
// import AccessibilitySettings from '../Accessibility/AccessibilitySettings';
// import AccessibilityProvider from '../Accessibility/AccessibilityProvider';
// import OptimizedComponents from '../Performance/OptimizedComponents';
// import PerformanceProvider from '../Performance/PerformanceProvider';
// import QuickWinsDemo from '../QuickWinsDemo';
// import Phase2Demo from '../Phase2Demo/Phase2Demo';
// import Phase3Demo from '../Phase3Demo/Phase3Demo';
// import Phase4Demo from '../Phase4Demo/Phase4Demo';

interface EmployeeL2DashboardProps {
  user: User;
  onLogout: () => void;
}

const EmployeeL2Dashboard: React.FC<EmployeeL2DashboardProps> = ({ user, onLogout }) => {
  // Basic state variables
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const [showTicketHistory, setShowTicketHistory] = useState(false);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showWorkflowAutomation, setShowWorkflowAutomation] = useState(false);
  const [showIntelligentCommunication, setShowIntelligentCommunication] = useState(false);
  const [showClientAnalytics, setShowClientAnalytics] = useState(false);
  const [showSelfServiceTools, setShowSelfServiceTools] = useState(false);
  const [showSmartTicketAssistant, setShowSmartTicketAssistant] = useState(false);
  const [showSupportChatbot, setShowSupportChatbot] = useState(false);
  const [showTwoFactorAuth, setShowTwoFactorAuth] = useState(false);
  const [showClientNotificationCenter, setShowClientNotificationCenter] = useState(false);
  const [showClientSettings, setShowClientSettings] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showChatSupport, setShowChatSupport] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showEnhancedSearch, setShowEnhancedSearch] = useState(false);
  const [showFormValidator, setShowFormValidator] = useState(false);
  const [showAccessibleForm, setShowAccessibleForm] = useState(false);
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);
  const [showOptimizedComponents, setShowOptimizedComponents] = useState(false);
  const [showQuickWinsDemo, setShowQuickWinsDemo] = useState(false);
  const [showPhase2Demo, setShowPhase2Demo] = useState(false);
  const [showPhase3Demo, setShowPhase3Demo] = useState(false);
  const [showPhase4Demo, setShowPhase4Demo] = useState(false);
  
  // Additional state variables for sidebar functionality
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ProblemLevel | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Chat States
  const [showChat, setShowChat] = useState(false);
  const [chatNotifications, setChatNotifications] = useState<Array<{
    id: string;
    senderName: string;
    content: string;
    timestamp: Date;
  }>>([]);
  
  // Knowledge Base State
  const [knowledgeBaseFullscreen, setKnowledgeBaseFullscreen] = useState(false);
  
  // Sidebar State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Additional state variables for Level 1 compatibility
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

  // Hooks
  const { addToast } = useToast();
  const { tickets, updateTicket, refreshTickets, ticketService, takeTicket, pushTicketToLevel, addTicket } = useTickets();
  
  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Available users for workflow automation
  const availableUsers = useMemo(() => [
    { id: '1', name: 'John Doe', role: 'employee_l1', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', role: 'employee_l2', email: 'jane@example.com' },
    { id: '3', name: 'Bob Johnson', role: 'employee_l3', email: 'bob@example.com' },
    { id: '4', name: 'Alice Brown', role: 'admin', email: 'alice@example.com' }
  ], []);

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

  // Toast notification function
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    addToast({
      type: type,
      title: type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info',
      message: message,
      duration: 3000
    });
  };

  // Use safeTickets for all array operations
  const safeTickets = Array.isArray(tickets) ? tickets : [];

  // Filter tickets for Level 2
  const availableTickets = useMemo(() => {
    return safeTickets.filter(ticket => 
      ticket.currentLevel === 'l2' && 
      ticket.status === 'open' &&
      (ticket.priority === 'medium' || ticket.priority === 'high')
    );
  }, [safeTickets]);

  // Filter my tickets (tickets assigned to current user)
  const myTickets = useMemo(() => {
    return safeTickets.filter(ticket => 
      ticket.assignedTo === user.id && 
      ticket.currentLevel === 'l2'
    );
  }, [safeTickets, user.id]);

  // User stats for Level 1 compatibility
  const userStats = useMemo(() => ({
    assigned: myTickets.length,
    inProgress: myTickets.filter(t => t.status === 'in-progress').length,
    resolved: myTickets.filter(t => t.status === 'resolved').length,
    available: availableTickets.length
  }), [myTickets, availableTickets]);

  // Helper functions for Level 1 compatibility
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

  // Filter tickets based on search and filters
  const filteredAvailableTickets = useMemo(() => {
    return availableTickets.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [availableTickets, searchTerm, statusFilter, priorityFilter]);

  const filteredMyTickets = useMemo(() => {
    return myTickets.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [myTickets, searchTerm, statusFilter, priorityFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAvailableTickets.length / itemsPerPage);
  const paginatedTickets = filteredAvailableTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Ticket actions
  const handleTakeTicket = async (ticket: Ticket) => {
    try {
      await takeTicket(ticket.id, user.id);
      showToast('Ticket taken successfully!', 'success');
      refreshTickets();
    } catch (error) {
      showToast('Failed to take ticket', 'error');
    }
  };

  // Temporarily commented out due to function signature mismatch
  // const handlePushTicket = async (ticket: Ticket, level: EscalationLevel) => {
  //   try {
  //     await pushTicketToLevel(ticket.id, level);
  //     showToast(`Ticket pushed to Level ${level} successfully!`, 'success');
  //     refreshTickets();
  //   } catch (error) {
  //     showToast('Failed to push ticket', 'error');
  //   }
  // };

  const handleUpdateTicket = async (ticketId: string, updates: Partial<Ticket>) => {
    try {
      await updateTicket(ticketId, updates);
      showToast('Ticket updated successfully!', 'success');
      refreshTickets();
    } catch (error) {
      showToast('Failed to update ticket', 'error');
    }
  };

  // Test function to create a Level 2 ticket
  const createTestL2Ticket = () => {
    const testTicket: Ticket = {
      id: `L2-${Date.now()}`,
      title: 'Test Level 2 Technical Issue',
      description: 'This is a test ticket for Level 2 technical support. Testing system functionality.',
      status: 'open',
      priority: 'medium',
      problemLevel: 'medium',
      clientName: 'Test Client',
      clientId: 'test-client',
      submittedDate: new Date(),
      lastUpdated: new Date(),
      currentLevel: 'l2',
      availableToLevels: ['l1', 'l2', 'l3'],
      escalationHistory: [],
      isAvailableForAssignment: true,
      activityLog: [],
      clientNotifications: []
    };

    console.log('🔧 Test L2 ticket:', testTicket);
    addTicket(testTicket);
    showToast('Test Level 2 ticket created!', 'success');
  };

  // Additional handler functions for Level 1 compatibility
  const handleStartWork = (ticketId: string) => {
    handleUpdateTicket(ticketId, { 
      status: 'in-progress',
      lastUpdated: new Date()
    });
  };

  const handleResolveTicket = (ticketId: string) => {
    handleUpdateTicket(ticketId, { 
      status: 'resolved',
      resolvedDate: new Date(),
      lastUpdated: new Date()
    });
  };

  const handleEscalateTicket = (ticketId: string) => {
    const ticket = safeTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    // Find Level 3 employees
    const level3Employees = availableUsers.filter(u => u.role === 'employee_l3');
    
    if (level3Employees.length === 0) {
      console.log('No Level 3 employees available');
      return;
    }

    // Escalate to first available Level 3 employee
    const assignedEmployee = level3Employees[0];
    
    handleUpdateTicket(ticketId, {
      status: 'open',
      assignedTo: assignedEmployee.id,
      assignedToName: `${assignedEmployee.name}`,
      priority: 'high',
      lastUpdated: new Date(),
      activityLog: [
        ...ticket.activityLog,
        {
          id: `activity-${Date.now()}`,
          ticketId: ticketId,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'escalated',
          description: `ESCALATED to Level 3 by ${user.firstName} ${user.lastName}. Assigned to: ${assignedEmployee.name}`,
          timestamp: new Date()
        }
      ]
    });

    console.log(`Ticket ${ticketId} escalated to Level 3 employee: ${assignedEmployee.name}`);
  };

  const handleDelegateTicket = (ticketId: string) => {
    const ticket = safeTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    // Find available Level 1 employees
    const availableL1Employees = availableUsers.filter(u => u.role === 'employee_l1');
    
    if (availableL1Employees.length === 0) {
      console.log('No Level 1 employees available');
      return;
    }

    // Delegate to first available L1 employee
    const delegatedEmployee = availableL1Employees[0];
    
    handleUpdateTicket(ticketId, {
      assignedTo: delegatedEmployee.id,
      assignedToName: `${delegatedEmployee.name}`,
      lastUpdated: new Date(),
      activityLog: [
        ...ticket.activityLog,
        {
          id: `activity-${Date.now()}`,
          ticketId: ticketId,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'delegated',
          description: `DELEGATED to ${delegatedEmployee.name} by ${user.firstName} ${user.lastName}`,
          timestamp: new Date()
        }
      ]
    });

    console.log(`Ticket ${ticketId} delegated to: ${delegatedEmployee.name}`);
  };

  const handleSendUpdate = (ticketId: string) => {
    const ticket = safeTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const updateMessage = `Update sent via keyboard shortcut by ${user.firstName} ${user.lastName}`;
    
    handleUpdateTicket(ticketId, {
      lastUpdated: new Date(),
      activityLog: [
        ...ticket.activityLog,
        {
          id: `activity-${Date.now()}`,
          ticketId: ticketId,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'updated',
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

    const infoRequest = `Information requested by ${user.firstName} ${user.lastName}`;
    
    handleUpdateTicket(ticketId, {
      lastUpdated: new Date(),
      activityLog: [
        ...ticket.activityLog,
        {
          id: `activity-${Date.now()}`,
          ticketId: ticketId,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'updated',
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

    const callScheduled = `Call scheduled by ${user.firstName} ${user.lastName}`;
    
    handleUpdateTicket(ticketId, {
      lastUpdated: new Date(),
      activityLog: [
        ...ticket.activityLog,
        {
          id: `activity-${Date.now()}`,
          ticketId: ticketId,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'updated',
          description: `CALL SCHEDULED: ${callScheduled}`,
          timestamp: new Date()
        }
      ]
    });

    console.log(`Call scheduled for ticket ${ticketId}: ${callScheduled}`);
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
        handleUpdateTicket(ticketId, {
          status: 'open',
          lastUpdated: new Date(),
          activityLog: [
            ...ticket.activityLog,
            {
              id: `activity-${Date.now()}`,
              ticketId: ticketId,
              userId: user.id,
              userName: `${user.firstName} ${user.lastName}`,
              action: 'updated',
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

  // Settings management functions
  const handleSaveSettings = () => {
    try {
      localStorage.setItem('l2DashboardSettings', JSON.stringify(settings));
      showToast('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast('Failed to save settings', 'error');
    }
  };

  const applySettings = (settings: any) => {
    // Apply accessibility settings
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }

    // Apply font size
    document.documentElement.style.fontSize = settings.fontSize === 'large' ? '18px' : 
                                             settings.fontSize === 'small' ? '14px' : '16px';
  };

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('l2DashboardSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        applySettings(parsedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
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
    showToast('Settings reset to defaults', 'info');
  };

  const handleApplySolution = (solution: string) => {
    if (selectedTicket) {
      handleUpdateTicket(selectedTicket.id, {
        description: `${selectedTicket.description}\n\nApplied Solution: ${solution}`,
        lastUpdated: new Date()
      });
      showToast('Solution applied successfully!', 'success');
    }
  };

  // Test function to debug ticket assignment
  const debugTicketAssignment = () => {
    console.log('🧪 Debug Ticket Assignment Test - Level 2');
    console.log('Current User:', { id: user.id, email: user.email, role: user.role });
    console.log('All Tickets:', safeTickets.map(t => ({ 
      id: t.id, 
      clientId: t.clientId, 
      assignedTo: t.assignedTo, 
      status: t.status, 
      isAvailable: t.isAvailableForAssignment,
      availableToLevels: t.availableToLevels,
      currentLevel: t.currentLevel
    })));
    console.log('My Tickets:', myTickets);
    console.log('Available Tickets:', availableTickets);
    
    // Test taking the first available ticket
    if (availableTickets.length > 0) {
      const testTicket = availableTickets[0];
      console.log('🧪 Testing take ticket for:', testTicket.id);
      handleTakeTicket(testTicket);
    } else {
      console.log('🧪 No available tickets to test with');
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
        {/* DataSourceIndicator temporarily disabled */}
        {/* <DataSourceIndicator 
          isUsingMockData={false}
          isLoading={false}
          onRefresh={refreshTickets}
        /> */}
        {/* Clean Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg transition-colors duration-200">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Level 2 Support</h1>
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Available Tickets</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Medium and high priority tickets you can take</p>
              </div>
              <div className="p-6">
                {availableTickets.length > 0 ? (
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
                                handleTakeTicket(ticket);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                            >
                              Take
                            </button>
                            {ticket.availableToLevels && ticket.availableToLevels.includes('l3') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEscalateTicket(ticket.id);
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
                    <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">All technical tickets are handled!</p>
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
                                setSelectedTicket(ticket);
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
                            {ticket.status === 'in-progress' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResolveTicket(ticket.id);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                              >
                                Resolve
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEscalateTicket(ticket.id);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                            >
                              Escalate
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelegateTicket(ticket.id);
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                            >
                              Delegate
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
                        <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
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
          <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 mb-2">Level 2 Support Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <h4 className="font-medium mb-1">Handle These Issues:</h4>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Technical system issues</li>
                      <li>• Complex troubleshooting</li>
                      <li>• Software configuration</li>
                      <li>• Network problems</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">When to Escalate:</h4>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Critical system failures</li>
                      <li>• Security vulnerabilities</li>
                      <li>• Expert-level problems</li>
                      <li>• Infrastructure issues</li>
                    </ul>
                  </div>
                </div>
                {/* Test button for debugging */}
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <button
                    onClick={createTestL2Ticket}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Create Test L2 Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modals - Temporarily commented out to fix build issues */}
          {/* 
          {showTicketDetail && selectedTicket && (
            <TicketDetailModal
              ticket={selectedTicket}
              onClose={() => setShowTicketDetail(false)}
              onUpdate={handleUpdateTicket}
              userRole="employee_l2"
            />
          )}

          {showTicketHistory && selectedTicket && (
            <TicketHistoryModal
              ticket={selectedTicket}
              onClose={() => setShowTicketHistory(false)}
            />
          )}

          {showCreateTicket && (
            <CreateTicketModal
              onClose={() => setShowCreateTicket(false)}
              onSubmit={(ticketData) => {
                console.log('New ticket:', ticketData);
                setShowCreateTicket(false);
              }}
              userRole="employee_l2"
            />
          )}

          {showExportModal && (
            <ExportModal
              onClose={() => setShowExportModal(false)}
              onExport={(format) => {
                console.log('Exporting in format:', format);
                setShowExportModal(false);
              }}
              data={tickets}
            />
          )}

          {showUserManagement && (
            <UserManagementModal
              onClose={() => setShowUserManagement(false)}
              onUserUpdate={(userData) => {
                console.log('User updated:', userData);
                setShowUserManagement(false);
              }}
            />
          )}

          {showNotificationCenter && (
            <NotificationCenter
              onClose={() => setShowNotificationCenter(false)}
              notifications={[]}
            />
          )}

          {showKnowledgeBase && (
            <KnowledgeBase
              onClose={() => setShowKnowledgeBase(false)}
              fullscreen={knowledgeBaseFullscreen}
              onToggleFullscreen={() => setKnowledgeBaseFullscreen(!knowledgeBaseFullscreen)}
            />
          )}

          {showPerformanceDashboard && (
            <PerformanceDashboard
              onClose={() => setShowPerformanceDashboard(false)}
              userRole="employee_l2"
            />
          )}

          {showAIAssistant && selectedTicket && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <AITicketAssistant
                ticket={selectedTicket}
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
                onClose={() => setShowWorkflowAutomation(false)}
              />
            </div>
          )}

          {showIntelligentCommunication && selectedTicket && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <IntelligentCommunicationTools
                ticket={selectedTicket}
                onApplyCommunication={(communication) => {
                  console.log('Applied communication:', communication);
                  setShowIntelligentCommunication(false);
                }}
                onClose={() => setShowIntelligentCommunication(false)}
              />
            </div>
          )}

          {showClientAnalytics && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <ClientAnalytics
                onClose={() => setShowClientAnalytics(false)}
                userRole="employee_l2"
              />
            </div>
          )}

          {showSelfServiceTools && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <SelfServiceTools
                onClose={() => setShowSelfServiceTools(false)}
                userRole="employee_l2"
              />
            </div>
          )}

          {showSmartTicketAssistant && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <SmartTicketAssistant
                onClose={() => setShowSmartTicketAssistant(false)}
                userRole="employee_l2"
              />
            </div>
          )}

          {showSupportChatbot && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <SupportChatbot
                onClose={() => setShowSupportChatbot(false)}
                userRole="employee_l2"
              />
            </div>
          )}

          {showTwoFactorAuth && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <TwoFactorAuth
                onClose={() => setShowTwoFactorAuth(false)}
                onVerify={(code) => {
                  console.log('2FA code verified:', code);
                  setShowTwoFactorAuth(false);
                }}
              />
            </div>
          )}

          {showClientNotificationCenter && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <ClientNotificationCenter
                onClose={() => setShowClientNotificationCenter(false)}
                userRole="employee_l2"
              />
            </div>
          )}

          {showClientSettings && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <ClientSettings
                onClose={() => setShowClientSettings(false)}
                userRole="employee_l2"
              />
            </div>
          )}

          {showBulkActions && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <BulkActions
                onClose={() => setShowBulkActions(false)}
                onApplyActions={(actions) => {
                  console.log('Applied bulk actions:', actions);
                  setShowBulkActions(false);
                }}
                userRole="employee_l2"
              />
            </div>
          )}

          {showChatSupport && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <ChatSupport
                onClose={() => setShowChatSupport(false)}
                userRole="employee_l2"
              />
            </div>
          )}

          {showKeyboardShortcuts && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <KeyboardShortcuts
                onClose={() => setShowKeyboardShortcuts(false)}
                userRole="employee_l2"
              />
            </div>
          )}

          {showEnhancedSearch && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <EnhancedSearch
                onClose={() => setShowEnhancedSearch(false)}
                onSearch={(query) => {
                  console.log('Enhanced search:', query);
                  setShowEnhancedSearch(false);
                }}
                userRole="employee_l2"
              />
            </div>
          )}

          {showFormValidator && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <FormValidator
                onClose={() => setShowFormValidator(false)}
                onValidate={(formData) => {
                  console.log('Form validated:', formData);
                  setShowFormValidator(false);
                }}
                userRole="employee_l2"
              />
            </div>
          )}

          {showAccessibleForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <AccessibleForm
                onClose={() => setShowAccessibleForm(false)}
                onSubmit={(formData) => {
                  console.log('Accessible form submitted:', formData);
                  setShowAccessibleForm(false);
                }}
                userRole="employee_l2"
              />
            </div>
          )}

          {showAccessibilitySettings && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <AccessibilitySettings
                onClose={() => setShowAccessibilitySettings(false)}
                onApplySettings={(settings) => {
                  console.log('Accessibility settings applied:', settings);
                  setShowAccessibilitySettings(false);
                }}
                userRole="employee_l2"
              />
            </div>
          )}

          {showOptimizedComponents && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-50 p-4">
              <OptimizedComponents
                onClose={() => setShowOptimizedComponents(false)}
                userRole="employee_l2"
              />
            </div>
          )}

          {showQuickWinsDemo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <QuickWinsDemo
                onClose={() => setShowQuickWinsDemo(false)}
                userRole="employee_l2"
              />
            </div>
          )}

          {showPhase2Demo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Phase2Demo
                onClose={() => setShowPhase2Demo(false)}
                userRole="employee_l2"
              />
            </div>
          )}

          {showPhase3Demo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Phase3Demo
                onClose={() => setShowPhase3Demo(false)}
                userRole="employee_l2"
              />
            </div>
          )}

          {showPhase4Demo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Phase4Demo
                onClose={() => setShowPhase4Demo(false)}
                userRole="employee_l2"
              />
            </div>
          )}

          {/* Additional modals for sidebar functionality */}
          {showAdvancedAnalytics && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Advanced Analytics Dashboard</h2>
                  <button
                    onClick={() => setShowAdvancedAnalytics(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Advanced Analytics Dashboard - Coming Soon</p>
                </div>
              </div>
            </div>
          )}

          {showQuickActions && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quick Actions Panel</h2>
                  <button
                    onClick={() => setShowQuickActions(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Quick Actions Panel - Coming Soon</p>
                </div>
              </div>
            </div>
          )}

          {showSettings && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.highContrast}
                        onChange={(e) => setSettings({...settings, highContrast: e.target.checked})}
                        className="mr-2"
                      />
                      High Contrast Mode
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.reducedMotion}
                        onChange={(e) => setSettings({...settings, reducedMotion: e.target.checked})}
                        className="mr-2"
                      />
                      Reduced Motion
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Font Size</label>
                    <select
                      value={settings.fontSize}
                      onChange={(e) => setSettings({...settings, fontSize: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleSaveSettings}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Save Settings
                    </button>
                    <button
                      onClick={resetToDefaults}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Reset to Defaults
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Interface - Temporarily commented out */}
          {/* 
          {showChat && (
            <div className="fixed bottom-4 right-4 z-50">
              <ChatInterface
                onClose={() => setShowChat(false)}
                userRole="employee_l2"
              />
            </div>
          )}

          <ChatNotification
            notifications={chatNotifications}
            onNotificationClick={(notification) => {
              console.log('Chat notification clicked:', notification);
              setShowChat(true);
            }}
          />
          */}

          {/* Toast Container */}
          <div className="fixed top-4 right-4 z-50">
            {/* Toast notifications will be rendered here by the ToastContainer component */}
          </div>
        </main>
      </div>
    </div>
  );
};

export { EmployeeL2Dashboard }; 