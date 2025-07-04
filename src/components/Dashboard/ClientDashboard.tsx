import React, { useState } from 'react';
import { Ticket, Plus, Search, Filter, Eye, Clock, AlertTriangle, CheckCircle, MessageSquare, FileText, User, Calendar } from 'lucide-react';
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
  const [urgencyFilter, setUrgencyFilter] = useState<ProblemLevel | 'all'>('all');

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

  const getUrgencyColor = (level: ProblemLevel) => {
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

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || ticket.problemLevel === urgencyFilter;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const ticketStats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open' || t.status === 'unassigned').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
    critical: tickets.filter(t => t.problemLevel === 'critical' && t.status !== 'resolved' && t.status !== 'closed').length
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
          description: 'Ticket created by client',
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Ticket className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Client Portal</h1>
                <p className="text-sm text-gray-600">Manage your support tickets</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.firstName} {user.lastName}
              </span>
              <button
                onClick={onLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Ticket className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Total Tickets</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{ticketStats.total}</p>
            <p className="text-sm text-gray-600 mt-1">All time</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="font-medium text-gray-900">Open Tickets</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{ticketStats.open}</p>
            <p className="text-sm text-gray-600 mt-1">Awaiting response</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <MessageSquare className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-medium text-gray-900">In Progress</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{ticketStats.inProgress}</p>
            <p className="text-sm text-gray-600 mt-1">Being worked on</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Resolved</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{ticketStats.resolved}</p>
            <p className="text-sm text-gray-600 mt-1">Completed</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowCreateTicket(true)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors group"
            >
              <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Create New Ticket</span>
            </button>
            <button className="bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors group">
              <Search className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Search Tickets</span>
            </button>
            <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors group">
              <FileText className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">View History</span>
            </button>
            <button className="bg-orange-50 hover:bg-orange-100 text-orange-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors group">
              <User className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Contact Support</span>
            </button>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">My Support Tickets</h2>
              <button
                onClick={() => setShowCreateTicket(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Ticket
              </button>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets by title, ID, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="unassigned">Unassigned</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value as ProblemLevel | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Urgency</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Tickets List */}
          <div className="divide-y divide-gray-200">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-gray-900">{ticket.id}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(ticket.problemLevel)}`}>
                          {ticket.problemLevel.charAt(0).toUpperCase() + ticket.problemLevel.slice(1)}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{ticket.title}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Created: {ticket.submittedDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Updated: {ticket.lastUpdated.toLocaleDateString()}</span>
                        </div>
                        {ticket.assignedToName && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>Assigned to: {ticket.assignedToName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                      {ticket.status === 'resolved' && (
                        <span className="text-xs text-green-600 text-center">
                          ✓ Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                {tickets.length === 0 ? (
                  <>
                    <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No tickets yet</p>
                    <p className="text-sm text-gray-400 mb-6">
                      Create your first support ticket to get started
                    </p>
                    <button
                      onClick={() => setShowCreateTicket(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Plus className="h-5 w-5" />
                      Create Your First Ticket
                    </button>
                  </>
                ) : (
                  <>
                    <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No tickets match your search criteria</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try adjusting your search terms or filters
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={showCreateTicket}
        onClose={() => setShowCreateTicket(false)}
        onSubmit={handleCreateTicket}
        currentUser={user}
      />

      {/* Ticket Detail Modal */}
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