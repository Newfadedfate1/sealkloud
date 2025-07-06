import React, { useState } from 'react';
import { Search, Filter, Download, Eye, UserPlus, ArrowUp, Calendar, Clock, User, Tag, BarChart3, Plus, AlertCircle } from 'lucide-react';
import { Ticket, ProblemLevel, TicketStatus } from '../../types/ticket';
import { User as UserType } from '../../types/user';
import { TicketDetailModal } from '../TicketDetail/TicketDetailModal';

interface TicketTableProps {
  tickets: Ticket[];
  isAdmin?: boolean;
  currentUser: UserType;
  availableUsers?: UserType[];
  onTicketUpdate?: (ticketId: string, updates: Partial<Ticket>) => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({ 
  tickets, 
  isAdmin = false, 
  currentUser,
  availableUsers = [],
  onTicketUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<ProblemLevel | 'all'>('all');
  const [sortBy, setSortBy] = useState<'submittedDate' | 'lastUpdated' | 'problemLevel'>('lastUpdated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const getPriorityColor = (level: ProblemLevel) => {
    switch (level) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'open': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'unassigned': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'in-progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'closed': return 'bg-gray-50 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityIcon = (level: ProblemLevel) => {
    switch (level) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const filteredAndSortedTickets = tickets
    .filter(ticket => {
      const matchesSearch = ticket.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesLevel = levelFilter === 'all' || ticket.problemLevel === levelFilter;
      return matchesSearch && matchesStatus && matchesLevel;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'submittedDate':
          aValue = new Date(a.submittedDate).getTime();
          bValue = new Date(b.submittedDate).getTime();
          break;
        case 'lastUpdated':
          aValue = new Date(a.lastUpdated).getTime();
          bValue = new Date(b.lastUpdated).getTime();
          break;
        case 'problemLevel':
          const levelOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          aValue = levelOrder[a.problemLevel];
          bValue = levelOrder[b.problemLevel];
          break;
        default:
          return 0;
      }
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Ticket ID', 'Client Name', 'Title', 'Problem Level', 'Status', 'Assigned To', 'Submitted Date', 'Last Updated'];
    const csvData = filteredAndSortedTickets.map(ticket => [
      ticket.id,
      ticket.clientName,
      ticket.title,
      ticket.problemLevel,
      ticket.status,
      ticket.assignedToName || 'Unassigned',
      ticket.submittedDate.toLocaleDateString(),
      ticket.lastUpdated.toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleTicketUpdate = (ticketId: string, updates: Partial<Ticket>) => {
    if (onTicketUpdate) {
      onTicketUpdate(ticketId, updates);
    }
    setSelectedTicket(null);
  };

  // Calculate summary stats
  const totalTickets = filteredAndSortedTickets.length;
  const openTickets = filteredAndSortedTickets.filter(t => t.status === 'open').length;
  const criticalTickets = filteredAndSortedTickets.filter(t => t.problemLevel === 'critical').length;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Ticket Management</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage and track support tickets</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              {isAdmin && (
                <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md">
                  <Plus className="h-4 w-4" />
                  New Ticket
                </button>
              )}
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTickets}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{openTickets}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Open Tickets</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{criticalTickets}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Critical Issues</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Filters */}
          <div className="mt-6 flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets by ID, client, or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="unassigned">Unassigned</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as ProblemLevel | 'all')}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            >
              <option value="all">All Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Enhanced Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Ticket ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Client Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                  onClick={() => handleSort('problemLevel')}
                >
                  <div className="flex items-center gap-2">
                    <span>Priority</span>
                    <ArrowUp className={`h-3 w-3 transition-transform duration-200 ${
                      sortBy === 'problemLevel' && sortOrder === 'desc' ? 'rotate-180' : ''
                    }`} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Assigned To
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                  onClick={() => handleSort('submittedDate')}
                >
                  <div className="flex items-center gap-2">
                    <span>Submitted</span>
                    <ArrowUp className={`h-3 w-3 transition-transform duration-200 ${
                      sortBy === 'submittedDate' && sortOrder === 'desc' ? 'rotate-180' : ''
                    }`} />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                  onClick={() => handleSort('lastUpdated')}
                >
                  <div className="flex items-center gap-2">
                    <span>Last Updated</span>
                    <ArrowUp className={`h-3 w-3 transition-transform duration-200 ${
                      sortBy === 'lastUpdated' && sortOrder === 'desc' ? 'rotate-180' : ''
                    }`} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{ticket.clientName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ticket.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{ticket.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getPriorityIcon(ticket.problemLevel)}</span>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(ticket.problemLevel)}`}>
                        {ticket.problemLevel.charAt(0).toUpperCase() + ticket.problemLevel.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(ticket.status)}`}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{ticket.assignedToName || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">{ticket.submittedDate.toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">{ticket.lastUpdated.toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedTicket(ticket)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {isAdmin && (
                        <button 
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                          title="Assign Ticket"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Enhanced Empty State */}
        {filteredAndSortedTickets.length === 0 && (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tickets found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search criteria or filters</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setLevelFilter('all');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleTicketUpdate}
          currentUser={currentUser}
          availableUsers={availableUsers}
        />
      )}
    </>
  );
};