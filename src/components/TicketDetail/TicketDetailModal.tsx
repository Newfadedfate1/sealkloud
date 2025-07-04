import React, { useState, useEffect } from 'react';
import { X, User, Clock, AlertTriangle, MessageSquare, Settings, Save, FileText } from 'lucide-react';
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
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'unassigned': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (level: ProblemLevel) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            {/* Ticket Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{ticket.clientName}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
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
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
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
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(ticket.problemLevel)}`}>
                      {ticket.problemLevel.charAt(0).toUpperCase() + ticket.problemLevel.slice(1)}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
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
                    <span className="text-gray-900">{ticket.assignedToName || 'Unassigned'}</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Submitted</label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{ticket.submittedDate.toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{ticket.lastUpdated.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">Description</label>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </div>

            {/* Activity Log */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Activity Log
              </h3>
              <div className="space-y-3">
                {ticket.activityLog && ticket.activityLog.length > 0 ? (
                  ticket.activityLog.map((activity) => (
                    <div key={activity.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{activity.userName}</span>
                        <span className="text-sm text-gray-500">
                          {activity.timestamp.toLocaleDateString()} {activity.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{activity.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No activity recorded yet.</p>
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
            <div>
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
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.problemLevel)}`}>
                    {ticket.problemLevel.charAt(0).toUpperCase() + ticket.problemLevel.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
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
          </div>
        </div>
      </div>
    </div>
  );
};