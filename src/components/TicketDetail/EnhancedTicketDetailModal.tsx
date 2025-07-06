import React, { useState, useEffect } from 'react';
import { 
  X, User, Clock, AlertTriangle, MessageSquare, Settings, Save, FileText, 
  Calendar, Tag, Zap, CheckCircle, ArrowRight, Play, StopCircle, 
  Shield, Bell, Send, Edit3, Eye, EyeOff, ChevronRight, ChevronDown
} from 'lucide-react';
import { Ticket, TicketStatus, ProblemLevel, TicketAction, ClientNotification } from '../../types/ticket';
import { User as UserType } from '../../types/user';
import { useToast } from '../Toast/ToastContainer';

interface EnhancedTicketDetailModalProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (ticketId: string, updates: Partial<Ticket>) => void;
  currentUser: UserType;
  availableUsers: UserType[];
}

export const EnhancedTicketDetailModal: React.FC<EnhancedTicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onUpdate,
  currentUser,
  availableUsers
}) => {
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmResolve, setShowConfirmResolve] = useState(false);
  const [showConfirmStart, setShowConfirmStart] = useState(false);
  const [showConfirmTake, setShowConfirmTake] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [expandedNotifications, setExpandedNotifications] = useState(false);
  const [editForm, setEditForm] = useState({
    status: ticket.status,
    assignedTo: ticket.assignedTo || '',
    problemLevel: ticket.problemLevel
  });

  useEffect(() => {
    setEditForm({
      status: ticket.status,
      assignedTo: ticket.assignedTo || '',
      problemLevel: ticket.problemLevel
    });
  }, [ticket]);

  if (!isOpen) return null;

  const canEdit = currentUser.role !== 'client';
  const isAssignedToUser = ticket.assignedTo === currentUser.id;
  const canTakeTicket = !ticket.assignedTo && canEdit;
  const canStartTicket = isAssignedToUser && ticket.status === 'open';
  const canResolveTicket = isAssignedToUser && ticket.status === 'in-progress';

  const addActivityLog = (action: TicketAction, description: string, metadata?: any) => {
    const activity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ticketId: ticket.id,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      action,
      description,
      timestamp: new Date(),
      metadata
    };

    const updatedActivityLog = [...(ticket.activityLog || []), activity];
    return updatedActivityLog;
  };

  const addClientNotification = (type: ClientNotification['type'], title: string, message: string) => {
    const notification: ClientNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ticketId: ticket.id,
      type,
      title,
      message,
      timestamp: new Date(),
      isRead: false
    };

    const updatedNotifications = [...(ticket.clientNotifications || []), notification];
    return updatedNotifications;
  };

  const handleTakeTicket = () => {
    const updates: Partial<Ticket> = {
      assignedTo: currentUser.id,
      assignedToName: `${currentUser.firstName} ${currentUser.lastName}`,
      status: 'open',
      lastUpdated: new Date(),
      activityLog: addActivityLog('assigned', `Ticket assigned to ${currentUser.firstName} ${currentUser.lastName}`, {
        previousStatus: ticket.status,
        newStatus: 'open',
        newAssignee: currentUser.id
      }),
      clientNotifications: addClientNotification(
        'assignment',
        'Ticket Assigned',
        `Your ticket ${ticket.id} has been assigned to ${currentUser.firstName} ${currentUser.lastName}. We will begin working on it shortly.`
      )
    };

    onUpdate(ticket.id, updates);
    setShowConfirmTake(false);
    
    addToast({
      type: 'success',
      title: 'Ticket Assigned',
      message: `You have successfully taken ticket ${ticket.id}`,
      duration: 3000
    });
  };

  const handleStartTicket = () => {
    const updates: Partial<Ticket> = {
      status: 'in-progress',
      lastUpdated: new Date(),
      activityLog: addActivityLog('started', `${currentUser.firstName} ${currentUser.lastName} started working on this ticket`, {
        previousStatus: ticket.status,
        newStatus: 'in-progress'
      }),
      clientNotifications: addClientNotification(
        'status_update',
        'Work Started',
        `Work has begun on your ticket ${ticket.id}. We are actively investigating and resolving your issue.`
      )
    };

    onUpdate(ticket.id, updates);
    setShowConfirmStart(false);
    
    addToast({
      type: 'success',
      title: 'Work Started',
      message: `You have started working on ticket ${ticket.id}`,
      duration: 3000
    });
  };

  const handleResolveTicket = () => {
    if (!resolutionNotes.trim()) {
      addToast({
        type: 'error',
        title: 'Resolution Notes Required',
        message: 'Please provide resolution notes before resolving the ticket',
        duration: 3000
      });
      return;
    }

    const updates: Partial<Ticket> = {
      status: 'resolved',
      resolvedDate: new Date(),
      lastUpdated: new Date(),
      activityLog: addActivityLog('resolved', `Ticket resolved by ${currentUser.firstName} ${currentUser.lastName}. Notes: ${resolutionNotes}`, {
        previousStatus: ticket.status,
        newStatus: 'resolved'
      }),
      clientNotifications: addClientNotification(
        'resolution',
        'Ticket Resolved',
        `Your ticket ${ticket.id} has been resolved. Resolution notes: ${resolutionNotes}`
      )
    };

    onUpdate(ticket.id, updates);
    setShowConfirmResolve(false);
    setResolutionNotes('');
    
    addToast({
      type: 'success',
      title: 'Ticket Resolved',
      message: `Ticket ${ticket.id} has been successfully resolved`,
      duration: 3000
    });
  };

  const handleSave = () => {
    const updates: Partial<Ticket> = {};
    
    if (editForm.status !== ticket.status) {
      updates.status = editForm.status as TicketStatus;
      updates.activityLog = addActivityLog('updated', `Status changed from ${ticket.status} to ${editForm.status}`, {
        previousStatus: ticket.status,
        newStatus: editForm.status as TicketStatus
      });
    }
    
    if (editForm.assignedTo !== (ticket.assignedTo || '')) {
      updates.assignedTo = editForm.assignedTo || undefined;
      const assignedUser = availableUsers.find(u => u.id === editForm.assignedTo);
      updates.assignedToName = assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : undefined;
      
      if (assignedUser) {
        updates.clientNotifications = addClientNotification(
          'assignment',
          'Ticket Reassigned',
          `Your ticket ${ticket.id} has been reassigned to ${assignedUser.firstName} ${assignedUser.lastName}`
        );
      }
    }
    
    if (editForm.problemLevel !== ticket.problemLevel) {
      updates.problemLevel = editForm.problemLevel as ProblemLevel;
    }

    if (Object.keys(updates).length > 0) {
      updates.lastUpdated = new Date();
      onUpdate(ticket.id, updates);
    }
    
    setIsEditing(false);
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'unassigned': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (level: ProblemLevel) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4" />;
      case 'unassigned': return <AlertTriangle className="h-4 w-4" />;
      case 'in-progress': return <MessageSquare className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusDescription = (status: TicketStatus) => {
    switch (status) {
      case 'open': return 'Ticket is open and awaiting work to begin';
      case 'unassigned': return 'Ticket needs to be assigned to a support agent';
      case 'in-progress': return 'Support agent is actively working on this ticket';
      case 'resolved': return 'Issue has been resolved and ticket is complete';
      case 'closed': return 'Ticket has been closed';
      default: return '';
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getWorkflowStep = () => {
    if (!ticket.assignedTo) return 1; // Unassigned
    if (ticket.status === 'open') return 2; // Assigned but not started
    if (ticket.status === 'in-progress') return 3; // Work in progress
    if (ticket.status === 'resolved') return 4; // Resolved
    return 5; // Closed
  };

  const workflowStep = getWorkflowStep();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{ticket.id}</h2>
              <p className="text-sky-100 mt-1">{ticket.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-sky-200 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-120px)]">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Workflow Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Workflow Progress</h3>
                <span className="text-sm text-gray-500">Step {workflowStep} of 4</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`flex items-center ${workflowStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${workflowStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    {workflowStep > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
                  </div>
                  <span className="ml-2 text-sm font-medium">Assigned</span>
                </div>
                <div className={`flex-1 h-1 ${workflowStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${workflowStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${workflowStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    {workflowStep > 2 ? <CheckCircle className="h-4 w-4" /> : '2'}
                  </div>
                  <span className="ml-2 text-sm font-medium">Started</span>
                </div>
                <div className={`flex-1 h-1 ${workflowStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${workflowStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${workflowStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    {workflowStep > 3 ? <CheckCircle className="h-4 w-4" /> : '3'}
                  </div>
                  <span className="ml-2 text-sm font-medium">In Progress</span>
                </div>
                <div className={`flex-1 h-1 ${workflowStep >= 4 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${workflowStep >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${workflowStep >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    {workflowStep > 4 ? <CheckCircle className="h-4 w-4" /> : '4'}
                  </div>
                  <span className="ml-2 text-sm font-medium">Resolved</span>
                </div>
              </div>
            </div>

            {/* Status Banner */}
            <div className={`rounded-lg p-4 mb-6 border-2 ${getStatusColor(ticket.status)}`}>
              <div className="flex items-center gap-3">
                {getStatusIcon(ticket.status)}
                <div>
                  <h3 className="font-semibold">
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                  </h3>
                  <p className="text-sm opacity-90">{getStatusDescription(ticket.status)}</p>
                </div>
              </div>
            </div>

            {/* Ticket Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Client
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-gray-900 font-medium">{ticket.clientName}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Priority
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm.problemLevel}
                      onChange={(e) => setEditForm(prev => ({ ...prev, problemLevel: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  ) : (
                    <span className={`inline-flex px-3 py-2 text-sm font-medium rounded-lg border-2 ${getPriorityColor(ticket.problemLevel)}`}>
                      {ticket.problemLevel.charAt(0).toUpperCase() + ticket.problemLevel.slice(1)}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Created
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-gray-900">{formatTimestamp(ticket.submittedDate)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Status
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      <option value="open">Open</option>
                      <option value="unassigned">Unassigned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border-2 ${getStatusColor(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assigned To
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm.assignedTo}
                      onChange={(e) => setEditForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      <option value="">Unassigned</option>
                      {availableUsers.filter(u => u.role !== 'client').map(user => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.role.replace('employee_', 'L').replace('_', '')})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-900">{ticket.assignedToName || 'Unassigned'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Last Updated
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-gray-900">{formatTimestamp(ticket.lastUpdated)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Issue Description
              </label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
              </div>
            </div>

            {/* Client Notifications */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Client Notifications
                </h3>
                <button
                  onClick={() => setExpandedNotifications(!expandedNotifications)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expandedNotifications ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
              </div>
              
              {expandedNotifications && (
                <div className="space-y-3">
                  {ticket.clientNotifications && ticket.clientNotifications.length > 0 ? (
                    ticket.clientNotifications.map((notification) => (
                      <div key={notification.id} className={`p-4 rounded-lg border ${notification.isRead ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <span className="text-xs text-gray-500 mt-2 block">{formatTimestamp(notification.timestamp)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              notification.type === 'status_update' ? 'bg-blue-100 text-blue-800' :
                              notification.type === 'assignment' ? 'bg-green-100 text-green-800' :
                              notification.type === 'resolution' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {notification.type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No notifications sent yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Activity Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Activity Timeline
              </h3>
              <div className="space-y-4">
                {ticket.activityLog && ticket.activityLog.length > 0 ? (
                  ticket.activityLog.map((activity, index) => (
                    <div key={activity.id} className="relative">
                      {index < ticket.activityLog.length - 1 && (
                        <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200"></div>
                      )}
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <ArrowRight className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{activity.userName}</span>
                            <span className="text-sm text-gray-500">
                              {formatTimestamp(activity.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-700">{activity.description}</p>
                          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                            {activity.action.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No activity recorded yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 p-6">
            {/* Workflow Actions */}
            {canEdit && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Actions</h3>
                <div className="space-y-3">
                  {/* Take Ticket */}
                  {canTakeTicket && (
                    <button
                      onClick={() => setShowConfirmTake(true)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Take Ticket
                    </button>
                  )}

                  {/* Start Work */}
                  {canStartTicket && (
                    <button
                      onClick={() => setShowConfirmStart(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Play className="h-4 w-4" />
                      Start Work
                    </button>
                  )}

                  {/* Resolve Ticket */}
                  {canResolveTicket && (
                    <button
                      onClick={() => setShowConfirmResolve(true)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Resolve Ticket
                    </button>
                  )}

                  {/* Edit Ticket */}
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Edit Ticket
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={handleSave}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Save className="h-4 w-4" />
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ticket ID:</span>
                  <span className="font-medium text-gray-900">{ticket.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-medium text-gray-900">{ticket.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(ticket.problemLevel)}`}>
                    {ticket.problemLevel.charAt(0).toUpperCase() + ticket.problemLevel.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                  </span>
                </div>
                {ticket.resolvedDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resolved:</span>
                    <span className="font-medium text-gray-900">{ticket.resolvedDate.toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Support Contact */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
              <p className="text-sm text-blue-700 mb-3">
                Contact our support team if you have questions about this ticket.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-blue-700">
                  <MessageSquare className="h-4 w-4" />
                  <span>support@sealkloud.com</span>
                </div>
                <div className="flex items-center gap-2 text-blue-700">
                  <Clock className="h-4 w-4" />
                  <span>Mon-Fri 9AM-6PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      
      {/* Take Ticket Confirmation */}
      {showConfirmTake && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Take Ticket</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to take responsibility for ticket <strong>{ticket.id}</strong>? 
              This will assign the ticket to you and notify the client.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmTake(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTakeTicket}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Take Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Work Confirmation */}
      {showConfirmStart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Play className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Start Work</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you ready to start working on ticket <strong>{ticket.id}</strong>? 
              This will change the status to "In Progress" and notify the client.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmStart(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartTicket}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Start Work
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Ticket Confirmation */}
      {showConfirmResolve && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Resolve Ticket</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Are you ready to resolve ticket <strong>{ticket.id}</strong>? 
              Please provide resolution notes below.
            </p>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Describe how the issue was resolved..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowConfirmResolve(false);
                  setResolutionNotes('');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveTicket}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Resolve Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 