import React, { useState } from 'react';
import { Zap, CheckCircle, Clock, AlertTriangle, ArrowUp, ArrowDown, MessageSquare, FileText, Users, Settings, Play, Pause, Square, RefreshCw, Star, Flag, Share2, Download, Upload, Filter } from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
  shortcut?: string;
  category: 'ticket' | 'communication' | 'tools' | 'bulk';
}

interface QuickActionsPanelProps {
  userRole: 'employee_l1' | 'employee_l2' | 'employee_l3';
  onAction: (action: string, data?: any) => void;
  onClose: () => void;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  userRole,
  onAction,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ticket' | 'communication' | 'tools' | 'bulk'>('ticket');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: QuickAction) => {
    setIsProcessing(true);
    try {
      // Simulate action processing
      await new Promise(resolve => setTimeout(resolve, 500));
      action.action();
      onAction(action.id);
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getQuickActions = (): QuickAction[] => {
    const baseActions: QuickAction[] = [
      // Ticket Actions
      {
        id: 'start-work',
        title: 'Start Work',
        description: 'Begin working on selected ticket',
        icon: Play,
        color: 'bg-green-500 hover:bg-green-600',
        action: () => onAction('start-work'),
        shortcut: 'Ctrl+S',
        category: 'ticket'
      },
      {
        id: 'pause-work',
        title: 'Pause Work',
        description: 'Temporarily pause current ticket',
        icon: Pause,
        color: 'bg-yellow-500 hover:bg-yellow-600',
        action: () => onAction('pause-work'),
        shortcut: 'Ctrl+P',
        category: 'ticket'
      },
      {
        id: 'resolve-ticket',
        title: 'Resolve Ticket',
        description: 'Mark ticket as resolved',
        icon: CheckCircle,
        color: 'bg-blue-500 hover:bg-blue-600',
        action: () => onAction('resolve-ticket'),
        shortcut: 'Ctrl+R',
        category: 'ticket'
      },
      {
        id: 'escalate-ticket',
        title: 'Escalate Ticket',
        description: 'Escalate to higher level',
        icon: ArrowUp,
        color: 'bg-orange-500 hover:bg-orange-600',
        action: () => onAction('escalate-ticket'),
        shortcut: 'Ctrl+E',
        category: 'ticket'
      },
      {
        id: 'delegate-ticket',
        title: 'Delegate Ticket',
        description: 'Delegate to another agent',
        icon: ArrowDown,
        color: 'bg-purple-500 hover:bg-purple-600',
        action: () => onAction('delegate-ticket'),
        shortcut: 'Ctrl+D',
        category: 'ticket'
      },

      // Communication Actions
      {
        id: 'send-update',
        title: 'Send Update',
        description: 'Send progress update to client',
        icon: MessageSquare,
        color: 'bg-indigo-500 hover:bg-indigo-600',
        action: () => onAction('send-update'),
        shortcut: 'Ctrl+U',
        category: 'communication'
      },
      {
        id: 'request-info',
        title: 'Request Info',
        description: 'Request additional information',
        icon: FileText,
        color: 'bg-teal-500 hover:bg-teal-600',
        action: () => onAction('request-info'),
        shortcut: 'Ctrl+I',
        category: 'communication'
      },
      {
        id: 'schedule-call',
        title: 'Schedule Call',
        description: 'Schedule a call with client',
        icon: Users,
        color: 'bg-pink-500 hover:bg-pink-600',
        action: () => onAction('schedule-call'),
        shortcut: 'Ctrl+C',
        category: 'communication'
      },

      // Tools Actions
      {
        id: 'refresh-data',
        title: 'Refresh Data',
        description: 'Refresh ticket data',
        icon: RefreshCw,
        color: 'bg-gray-500 hover:bg-gray-600',
        action: () => onAction('refresh-data'),
        shortcut: 'F5',
        category: 'tools'
      },
      {
        id: 'export-tickets',
        title: 'Export Tickets',
        description: 'Export ticket data',
        icon: Download,
        color: 'bg-green-600 hover:bg-green-700',
        action: () => onAction('export-tickets'),
        shortcut: 'Ctrl+E',
        category: 'tools'
      },
      {
        id: 'import-data',
        title: 'Import Data',
        description: 'Import ticket data',
        icon: Upload,
        color: 'bg-blue-600 hover:bg-blue-700',
        action: () => onAction('import-data'),
        shortcut: 'Ctrl+I',
        category: 'tools'
      },
      {
        id: 'advanced-filter',
        title: 'Advanced Filter',
        description: 'Apply advanced filters',
        icon: Filter,
        color: 'bg-purple-600 hover:bg-purple-700',
        action: () => onAction('advanced-filter'),
        shortcut: 'Ctrl+F',
        category: 'tools'
      },

      // Bulk Actions
      {
        id: 'bulk-resolve',
        title: 'Bulk Resolve',
        description: 'Resolve multiple tickets',
        icon: CheckCircle,
        color: 'bg-green-600 hover:bg-green-700',
        action: () => onAction('bulk-resolve'),
        shortcut: 'Ctrl+Shift+R',
        category: 'bulk'
      },
      {
        id: 'bulk-escalate',
        title: 'Bulk Escalate',
        description: 'Escalate multiple tickets',
        icon: ArrowUp,
        color: 'bg-orange-600 hover:bg-orange-700',
        action: () => onAction('bulk-escalate'),
        shortcut: 'Ctrl+Shift+E',
        category: 'bulk'
      },
      {
        id: 'bulk-assign',
        title: 'Bulk Assign',
        description: 'Assign multiple tickets',
        icon: Users,
        color: 'bg-blue-600 hover:bg-blue-700',
        action: () => onAction('bulk-assign'),
        shortcut: 'Ctrl+Shift+A',
        category: 'bulk'
      },
      {
        id: 'bulk-export',
        title: 'Bulk Export',
        description: 'Export multiple tickets',
        icon: Download,
        color: 'bg-indigo-600 hover:bg-indigo-700',
        action: () => onAction('bulk-export'),
        shortcut: 'Ctrl+Shift+X',
        category: 'bulk'
      }
    ];

    // Role-specific actions
    if (userRole === 'employee_l2') {
      baseActions.push(
        {
          id: 'technical-analysis',
          title: 'Technical Analysis',
          description: 'Run technical diagnostics',
          icon: Settings,
          color: 'bg-yellow-600 hover:bg-yellow-700',
          action: () => onAction('technical-analysis'),
          shortcut: 'Ctrl+T',
          category: 'tools'
        }
      );
    }

    if (userRole === 'employee_l3') {
      baseActions.push(
        {
          id: 'expert-review',
          title: 'Expert Review',
          description: 'Perform expert analysis',
          icon: Star,
          color: 'bg-red-600 hover:bg-red-700',
          action: () => onAction('expert-review'),
          shortcut: 'Ctrl+X',
          category: 'tools'
        },
        {
          id: 'critical-flag',
          title: 'Flag Critical',
          description: 'Flag as critical issue',
          icon: Flag,
          color: 'bg-red-500 hover:bg-red-600',
          action: () => onAction('critical-flag'),
          shortcut: 'Ctrl+L',
          category: 'ticket'
        }
      );
    }

    return baseActions;
  };

  const actions = getQuickActions();
  const filteredActions = actions.filter(action => action.category === selectedCategory);

  const categories = [
    { id: 'ticket', label: 'Ticket Actions', icon: Zap },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'tools', label: 'Tools', icon: Settings },
    { id: 'bulk', label: 'Bulk Actions', icon: Share2 }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
            <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">One-click operations and shortcuts</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="h-4 w-4" />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              disabled={isProcessing}
              className={`p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 text-left group ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{action.title}</h3>
                    {action.shortcut && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {action.shortcut}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {actions.filter(action => action.shortcut).slice(0, 8).map((action) => (
            <div key={action.id} className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">{action.title}</span>
              <kbd className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded">
                {action.shortcut}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-900 dark:text-white">Processing action...</span>
          </div>
        </div>
      )}
    </div>
  );
}; 