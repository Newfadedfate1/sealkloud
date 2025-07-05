import React, { useState } from 'react';
import { CheckSquare, Square, MoreHorizontal, Users, Tag, Archive, Trash2, Download, MessageSquare, Clock, AlertTriangle } from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignedTo?: string;
}

interface BulkActionsProps {
  tickets: Ticket[];
  selectedTickets: string[];
  onSelectionChange: (ticketIds: string[]) => void;
  onBulkAction: (action: string, ticketIds: string[]) => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  tickets,
  selectedTickets,
  onSelectionChange,
  onBulkAction
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const allSelected = selectedTickets.length === tickets.length && tickets.length > 0;
  const someSelected = selectedTickets.length > 0 && selectedTickets.length < tickets.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(tickets.map(ticket => ticket.id));
    }
  };

  const handleSelectTicket = (ticketId: string) => {
    if (selectedTickets.includes(ticketId)) {
      onSelectionChange(selectedTickets.filter(id => id !== ticketId));
    } else {
      onSelectionChange([...selectedTickets, ticketId]);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedTickets.length === 0) return;

    setIsProcessing(true);
    try {
      await onBulkAction(action, selectedTickets);
      setShowActions(false);
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const bulkActions = [
    {
      id: 'assign',
      label: 'Assign to...',
      icon: Users,
      description: 'Assign selected tickets to a team member',
      color: 'text-blue-600 hover:bg-blue-50'
    },
    {
      id: 'change-status',
      label: 'Change Status',
      icon: Tag,
      description: 'Update status of selected tickets',
      color: 'text-green-600 hover:bg-green-50'
    },
    {
      id: 'change-priority',
      label: 'Change Priority',
      icon: AlertTriangle,
      description: 'Update priority of selected tickets',
      color: 'text-orange-600 hover:bg-orange-50'
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      description: 'Archive selected tickets',
      color: 'text-gray-600 hover:bg-gray-50'
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      description: 'Export selected tickets',
      color: 'text-purple-600 hover:bg-purple-50'
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      description: 'Delete selected tickets',
      color: 'text-red-600 hover:bg-red-50'
    }
  ];

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No tickets available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Header */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {allSelected ? (
              <CheckSquare className="h-5 w-5 text-blue-600" />
            ) : someSelected ? (
              <div className="h-5 w-5 border-2 border-blue-600 rounded bg-blue-600 flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-sm"></div>
              </div>
            ) : (
              <Square className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">
              {allSelected ? 'Deselect All' : 'Select All'}
            </span>
          </button>

          {selectedTickets.length > 0 && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedTickets.length} of {tickets.length} selected
            </span>
          )}
        </div>

        {selectedTickets.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <MoreHorizontal className="h-4 w-4" />
              )}
              <span>Bulk Actions</span>
            </button>

            {showActions && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-10">
                <div className="p-2">
                  {bulkActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleBulkAction(action.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${action.color}`}
                      disabled={isProcessing}
                    >
                      <action.icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{action.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {action.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tickets List */}
      <div className="space-y-2">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <button
              onClick={() => handleSelectTicket(ticket.id)}
              className="flex-shrink-0"
            >
              {selectedTickets.includes(ticket.id) ? (
                <CheckSquare className="h-5 w-5 text-blue-600" />
              ) : (
                <Square className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {ticket.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    ticket.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {ticket.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    ticket.status === 'open' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    ticket.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
              {ticket.assignedTo && (
                <div className="flex items-center space-x-1 mt-1">
                  <Users className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Assigned to {ticket.assignedTo}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-900 dark:text-white">Processing bulk action...</span>
          </div>
        </div>
      )}
    </div>
  );
}; 