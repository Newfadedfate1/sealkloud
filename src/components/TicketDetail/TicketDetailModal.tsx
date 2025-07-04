import React, { useState, useEffect } from 'react';
import { X, User, Clock, AlertTriangle, MessageSquare, Settings, Save, FileText, Calendar, Tag, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { Ticket, TicketStatus, ProblemLevel } from '../../types/ticket';
import { User as UserType } from '../../types/user';

interface TicketDetailModalProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (ticketId: string, updates: Partial<Ticket>) => void;
  currentUser: UserType;
  availableUsers: UserType[];
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onUpdate,
  currentUser,
  availableUsers
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    status: ticket.status,
    assignedTo: ticket.assignedTo || '',
    problemLevel: ticket.problemLevel
  });
  const [newComment, setNewComment] = useState('');

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

  const handleSave = () => {
    const updates: Partial<Ticket> = {};
    
    if (editForm.status !== ticket.status) {
      updates.status = editForm.status as TicketStatus;
    }
    
    if (editForm.assignedTo !== (ticket.assignedTo || '')) {
      updates.assignedTo = editForm.assignedTo || undefined;
      const assignedUser = availableUsers.find(u => u.id === editForm.assignedTo);
      updates.assignedToName = assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : undefined;
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
      case 'open': return 'Ticket is open and awaiting assignment';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
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

        <div className="flex h-[calc(90vh-120px)]">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
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
            {/* Actions */}
            {canEdit && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
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
    </div>
  );
};