import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Search, 
  Download, 
  CheckSquare, 
  Command, 
  Eye, 
  ArrowRight,
  Ticket,
  Users,
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react';
import { TicketCardSkeleton, StatsCardSkeleton } from './LoadingSkeleton';
import { KeyboardShortcuts, useKeyboardShortcuts } from './KeyboardShortcuts';
import { ExportModal } from './ExportModal';
import { BulkActions } from './BulkActions';
import { EnhancedSearch } from './EnhancedSearch';
import { Pagination, usePagination } from './Pagination';
import { ticketsAPI } from '../services/api';

interface QuickWinsDemoProps {
  onClose?: () => void;
}

export const QuickWinsDemo: React.FC<QuickWinsDemoProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Pagination hook
  const pagination = usePagination(5);

  // Keyboard shortcuts
  const shortcutDefinitions = [
    { key: 'n', description: 'New ticket', action: () => console.log('New ticket'), category: 'ticket' as const },
    { key: 's', description: 'Search', action: () => console.log('Search'), category: 'navigation' as const },
    { key: 'e', description: 'Export', action: () => setShowExportModal(true), category: 'system' as const },
    { key: 'k', description: 'Keyboard shortcuts', action: () => setActiveSection('shortcuts'), category: 'system' as const },
  ];

  const { isShortcutsOpen, toggleShortcuts, shortcuts } = useKeyboardShortcuts(shortcutDefinitions);

  // Load data from API
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load tickets
      const ticketsResponse = await ticketsAPI.getAll();
      if (ticketsResponse.success && ticketsResponse.data) {
        setTickets(ticketsResponse.data);
        setSearchResults(ticketsResponse.data);
      }

      // TODO: Load users when user API is implemented
      // const usersResponse = await usersAPI.getAll();
      // if (usersResponse.success && usersResponse.data) {
      //   setUsers(usersResponse.data);
      // }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (filters: any) => {
    console.log('Search filters:', filters);
    // Filter tickets based on search criteria
    const filtered = tickets.filter(ticket => 
      ticket.title.toLowerCase().includes(filters.query.toLowerCase()) ||
      ticket.clientName.toLowerCase().includes(filters.query.toLowerCase()) ||
      ticket.status.toLowerCase().includes(filters.query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleBulkAction = async (action: string, ticketIds: string[]) => {
    console.log('Bulk action:', action, 'on tickets:', ticketIds);
    // Simulate bulk action
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleExport = async (format: string, filters: any) => {
    console.log('Export:', format, filters);
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTickets.length === searchResults.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(searchResults.map(ticket => ticket.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{tickets.length}</p>
            </div>
            <Ticket className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
            </div>
            <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">2.4h</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">4.8★</p>
            </div>
            <CheckSquare className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Zap className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900 dark:text-white">Create Ticket</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Search className="h-5 w-5 text-green-600" />
            <span className="font-medium text-gray-900 dark:text-white">Search</span>
          </button>
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-gray-900 dark:text-white">Export</span>
          </button>
          <button 
            onClick={toggleShortcuts}
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Command className="h-5 w-5 text-orange-600" />
            <span className="font-medium text-gray-900 dark:text-white">Shortcuts</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Ticket className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{ticket.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{ticket.clientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority || ticket.problemLevel)}`}>
                    {ticket.priority || ticket.problemLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTickets = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <EnhancedSearch
          onSearch={handleSearch}
          onClear={() => setSearchResults(tickets)}
          tickets={tickets}
          users={users}
          tags={[]}
        />
      </div>

      {/* Bulk Actions */}
      {selectedTickets.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <BulkActions
            tickets={searchResults}
            selectedTickets={selectedTickets}
            onSelectionChange={setSelectedTickets}
            onBulkAction={handleBulkAction}
          />
        </div>
      )}

      {/* Tickets List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tickets ({searchResults.length})
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleSelectAll}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {selectedTickets.length === searchResults.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <TicketCardSkeleton key={i} />
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults
                .slice((pagination.currentPage - 1) * pagination.itemsPerPage, pagination.currentPage * pagination.itemsPerPage)
                .map((ticket) => (
                <div
                  key={ticket.id}
                  className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors duration-200 ${
                    selectedTickets.includes(ticket.id)
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedTickets.includes(ticket.id)}
                        onChange={() => handleTicketSelect(ticket.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{ticket.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{ticket.clientName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority || ticket.problemLevel)}`}>
                        {ticket.priority || ticket.problemLevel}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No tickets found</p>
              <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">Try adjusting your search criteria</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {searchResults.length > pagination.itemsPerPage && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={Math.ceil(searchResults.length / pagination.itemsPerPage)}
              totalItems={searchResults.length}
              onPageChange={pagination.handlePageChange}
              itemsPerPage={pagination.itemsPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderShortcuts = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Keyboard Shortcuts</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shortcuts.map((shortcut) => (
          <div key={shortcut.key} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{shortcut.description}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{shortcut.category}</p>
            </div>
            <kbd className="px-2 py-1 text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded border">
              {shortcut.key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Quick Wins Demo</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enhanced productivity features</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeSection === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSection('tickets')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeSection === 'tickets'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Tickets
          </button>
          <button
            onClick={() => setActiveSection('shortcuts')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeSection === 'shortcuts'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Shortcuts
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'tickets' && renderTickets()}
        {activeSection === 'shortcuts' && renderShortcuts()}
      </div>

      {/* Modals */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          data={{ tickets: searchResults, type: 'tickets' }}
        />
      )}

      <KeyboardShortcuts
        isOpen={isShortcutsOpen}
        onClose={toggleShortcuts}
        shortcuts={shortcuts}
      />
    </div>
  );
}; 