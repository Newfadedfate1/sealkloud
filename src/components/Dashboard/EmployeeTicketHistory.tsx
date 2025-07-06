import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Eye, 
  Download, 
  RefreshCw,
  TrendingUp,
  Star,
  MessageSquare,
  User,
  Tag
} from 'lucide-react';
import { Ticket } from '../../types/ticket';
import { TicketDetailModal } from '../TicketDetail/TicketDetailModal';
import { useTickets } from '../../contexts/TicketContext';
import { ticketsAPI } from '../../services/api';

interface EmployeeTicketHistoryProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

interface HistoryStats {
  totalResolved: number;
  thisMonth: number;
  thisWeek: number;
  avgResolutionTime: number;
  satisfactionScore: number;
}

export const EmployeeTicketHistory: React.FC<EmployeeTicketHistoryProps> = ({
  userId,
  userName,
  onClose
}) => {
  const { tickets } = useTickets();
  const [resolvedTickets, setResolvedTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'resolved' | 'closed'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month' | 'quarter'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<HistoryStats>({
    totalResolved: 0,
    thisMonth: 0,
    thisWeek: 0,
    avgResolutionTime: 0,
    satisfactionScore: 0
  });

  useEffect(() => {
    loadResolvedTickets();
  }, [userId, tickets]);

  const loadResolvedTickets = async () => {
    setIsLoading(true);
    try {
      // Filter tickets that are resolved and assigned to this user
      const userResolvedTickets = tickets.filter(ticket => 
        ticket.assignedTo === userId && 
        (ticket.status === 'resolved' || ticket.status === 'closed')
      );
      setResolvedTickets(userResolvedTickets);
      
      // Calculate stats
      const now = new Date();
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const stats: HistoryStats = {
        totalResolved: userResolvedTickets.length,
        thisMonth: userResolvedTickets.filter(t => t.resolvedDate && t.resolvedDate >= thisMonth).length,
        thisWeek: userResolvedTickets.filter(t => t.resolvedDate && t.resolvedDate >= thisWeek).length,
        avgResolutionTime: 4.2, // Mock calculation
        satisfactionScore: 4.8 // Mock score
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Failed to load resolved tickets:', error);
    } finally {
      setIsLoading(false);
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

  const getResolutionTime = (ticket: Ticket) => {
    if (!ticket.resolvedDate || !ticket.submittedDate) return 'N/A';
    const diff = ticket.resolvedDate.getTime() - ticket.submittedDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const filteredTickets = resolvedTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    let matchesTime = true;
    if (timeFilter !== 'all') {
      const now = new Date();
      let cutoffDate: Date;
      
      switch (timeFilter) {
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }
      
      matchesTime = ticket.resolvedDate ? ticket.resolvedDate >= cutoffDate : false;
    }
    
    return matchesSearch && matchesStatus && matchesTime;
  });

  const handleExportHistory = () => {
    const csvContent = [
      ['Ticket ID', 'Client', 'Title', 'Priority', 'Resolution Time', 'Resolved Date'],
      ...filteredTickets.map(ticket => [
        ticket.id,
        ticket.clientName,
        ticket.title,
        ticket.problemLevel,
        getResolutionTime(ticket),
        ticket.resolvedDate?.toLocaleDateString() || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center space-x-3">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium">Loading Ticket History...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
              <History className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Ticket History</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Resolved tickets and performance history</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportHistory}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Resolved</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalResolved}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.thisMonth}</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.thisWeek}</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Resolution</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgResolutionTime}h</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Satisfaction</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.satisfactionScore}/5</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>

        {/* Ticket List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            {filteredTickets.length > 0 ? (
              <div className="space-y-4">
                {filteredTickets.map(ticket => (
                  <div key={ticket.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{ticket.id}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(ticket.problemLevel)}`}>
                            {ticket.problemLevel.charAt(0).toUpperCase() + ticket.problemLevel.slice(1)}
                          </span>
                          <span className="bg-green-50 text-green-700 border-green-200 px-2 py-1 text-xs font-medium rounded-full border">
                            Resolved
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">{ticket.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{ticket.clientName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{ticket.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Resolution: {getResolutionTime(ticket)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Resolved: {ticket.resolvedDate?.toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {ticket.activityLog.length} activities
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col gap-2">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Tickets Found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || statusFilter !== 'all' || timeFilter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'No resolved tickets in your history yet'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={() => {}} // Read-only view, no updates needed
          currentUser={{ 
            id: userId, 
            firstName: userName.split(' ')[0], 
            lastName: userName.split(' ')[1] || '',
            email: `${userName.toLowerCase().replace(' ', '.')}@sealkloud.com`,
            role: 'employee_l1' as const,
            companyId: 'sealkloud',
            isActive: true
          }}
          availableUsers={[]} // Empty array since this is read-only
        />
      )}
    </div>
  );
}; 