import React, { useState } from 'react';
import { Ticket, Plus, Search, Filter, Eye, Clock, AlertTriangle, CheckCircle, MessageSquare, FileText, User, Calendar, Phone, Mail, HelpCircle } from 'lucide-react';
import { User as UserType } from '../../types/user';
import { Ticket as TicketType, TicketStatus, ProblemLevel } from '../../types/ticket';
import { CreateTicketModal } from '../Tickets/CreateTicketModal';
import { TicketDetailModal } from '../TicketDetail/TicketDetailModal';
import { mockTickets } from '../../data/mockTickets';

interface ClientDashboardProps {
  user: UserType;
  onLogout: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, onLogout }) => {
  const [tickets, setTickets] = useState<TicketType[]>(
    mockTickets.filter(ticket => ticket.clientId === user.id || ticket.clientName === `${user.firstName} ${user.lastName}`)
  );
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');

  const getStatusInfo = (status: TicketStatus) => {
    const statusMap = {
      'open': { 
        color: 'bg-blue-50 text-blue-700 border-blue-200', 
        icon: Clock, 
        label: 'Open',
        description: 'Your ticket has been received and is awaiting assignment'
      },
      'unassigned': { 
        color: 'bg-orange-50 text-orange-700 border-orange-200', 
        icon: AlertTriangle, 
        label: 'Pending Assignment',
        description: 'We\'re finding the right specialist for your issue'
      },
      'in-progress': { 
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
        icon: MessageSquare, 
        label: 'In Progress',
        description: 'Our team is actively working on your issue'
      },
      'resolved': { 
        color: 'bg-green-50 text-green-700 border-green-200', 
        icon: CheckCircle, 
        label: 'Resolved',
        description: 'Your issue has been resolved'
      },
      'closed': { 
        color: 'bg-gray-50 text-gray-700 border-gray-200', 
        icon: CheckCircle, 
        label: 'Closed',
        description: 'Ticket has been completed and closed'
      }
    };
    return statusMap[status] || statusMap['open'];
  };

  const getUrgencyInfo = (level: ProblemLevel) => {
    const urgencyMap = {
      'low': { color: 'bg-green-50 text-green-700 border-green-200', label: 'Low Priority' },
      'medium': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Medium Priority' },
      'high': { color: 'bg-orange-50 text-orange-700 border-orange-200', label: 'High Priority' },
      'critical': { color: 'bg-red-50 text-red-700 border-red-200', label: 'Critical' }
    };
    return urgencyMap[level] || urgencyMap['medium'];
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const ticketStats = {
    total: tickets.length,
    active: tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length,
    resolved: tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length,
    urgent: tickets.filter(t => ['high', 'critical'].includes(t.problemLevel) && !['resolved', 'closed'].includes(t.status)).length
  };

  const handleCreateTicket = (ticketData: Partial<TicketType>) => {
    const newTicket: TicketType = {
      id: `TK-${(tickets.length + 1).toString().padStart(3, '0')}`,
      clientName: `${user.firstName} ${user.lastName}`,
      clientId: user.id,
      title: ticketData.title || '',
      description: ticketData.description || '',
      problemLevel: ticketData.problemLevel || 'medium',
      status: 'unassigned',
      submittedDate: new Date(),
      lastUpdated: new Date(),
      activityLog: [
        {
          id: `act-${Date.now()}`,
          ticketId: `TK-${(tickets.length + 1).toString().padStart(3, '0')}`,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'created',
          description: 'Ticket submitted by client',
          timestamp: new Date()
        }
      ]
    };

    setTickets(prev => [newTicket, ...prev]);
    setShowCreateTicket(false);
  };

  const handleTicketUpdate = (ticketId: string, updates: Partial<TicketType>) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    ));
    setSelectedTicket(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Ticket className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Support Portal</h1>
                <p className="text-sm text-gray-600">Welcome back, {user.firstName}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Quick Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{ticketStats.total}</div>
            <div className="text-sm text-gray-600">Total Tickets</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{ticketStats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{ticketStats.resolved}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{ticketStats.urgent}</div>
            <div className="text-sm text-gray-600">Urgent</div>
          </div>
        </div>

        {/* Main Action */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Need Help?</h2>
              <p className="text-blue-100">Create a support ticket and our team will assist you</p>
            </div>
            <button
              onClick={() => setShowCreateTicket(true)}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              New Ticket
            </button>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Your Support Tickets</h2>
              
              {/* Simple Filters */}
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Tickets</option>
                  <option value="open">Open</option>
                  <option value="unassigned">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div className="divide-y divide-gray-200">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => {
                const statusInfo = getStatusInfo(ticket.status);
                const urgencyInfo = getUrgencyInfo(ticket.problemLevel);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Ticket Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-mono text-sm font-medium text-gray-600">{ticket.id}</span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${statusInfo.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </span>
                          <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${urgencyInfo.color}`}>
                            {urgencyInfo.label}
                          </span>
                        </div>
                        
                        {/* Ticket Content */}
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{ticket.title}</h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                        
                        {/* Status Description */}
                        <p className="text-sm text-gray-500 mb-3">{statusInfo.description}</p>
                        
                        {/* Ticket Meta */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Created {ticket.submittedDate.toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Updated {ticket.lastUpdated.toLocaleDateString()}</span>
                          {ticket.assignedToName && (
                            <>
                              <span>•</span>
                              <span>Assigned to {ticket.assignedToName}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                {tickets.length === 0 ? (
                  <div>
                    <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
                    <p className="text-gray-500 mb-6">Create your first support ticket to get help from our team</p>
                    <button
                      onClick={() => setShowCreateTicket(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                    >
                      <Plus className="h-5 w-5" />
                      Create First Ticket
                    </button>
                  </div>
                ) : (
                  <div>
                    <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No matching tickets</h3>
                    <p className="text-gray-500">Try adjusting your search or filter</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gray-100 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <HelpCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">Need immediate assistance?</h3>
              <p className="text-gray-600 mb-4">For urgent issues, you can contact our support team directly</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:support@sealkloud.com"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Mail className="h-4 w-4" />
                  support@sealkloud.com
                </a>
                <a
                  href="tel:+1-555-123-4567"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Phone className="h-4 w-4" />
                  +1 (555) 123-4567
                </a>
              </div>
              <p className="text-sm text-gray-500 mt-2">Support hours: Monday-Friday, 9AM-6PM EST</p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateTicketModal
        isOpen={showCreateTicket}
        onClose={() => setShowCreateTicket(false)}
        onSubmit={handleCreateTicket}
        currentUser={user}
      />

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleTicketUpdate}
          currentUser={user}
          availableUsers={[]}
        />
      )}
    </div>
  );
};