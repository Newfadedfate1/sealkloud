import React, { useState } from 'react';
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
  Settings
} from 'lucide-react';
import { TicketCardSkeleton, StatsCardSkeleton } from './LoadingSkeleton';
import { KeyboardShortcuts, useKeyboardShortcuts } from './KeyboardShortcuts';
import { ExportModal } from './ExportModal';
import { BulkActions } from './BulkActions';
import { EnhancedSearch } from './EnhancedSearch';
import { Pagination, usePagination } from './Pagination';

// Mock data for demo
const mockTickets = [
  { id: 'TK-001', title: 'Email server not responding', status: 'open', priority: 'high', assignedTo: 'John Doe' },
  { id: 'TK-002', title: 'VPN connection issues', status: 'in-progress', priority: 'critical', assignedTo: 'Jane Smith' },
  { id: 'TK-003', title: 'Software license renewal', status: 'resolved', priority: 'low', assignedTo: 'Mike Johnson' },
  { id: 'TK-004', title: 'Database performance issues', status: 'open', priority: 'medium', assignedTo: 'Sarah Wilson' },
  { id: 'TK-005', title: 'Printer not working', status: 'in-progress', priority: 'medium', assignedTo: 'Tom Brown' },
  { id: 'TK-006', title: 'Website down', status: 'open', priority: 'critical', assignedTo: 'Lisa Davis' },
  { id: 'TK-007', title: 'Account access issues', status: 'resolved', priority: 'low', assignedTo: 'David Miller' },
  { id: 'TK-008', title: 'System performance degradation', status: 'open', priority: 'high', assignedTo: 'Emma Wilson' },
];

const mockUsers = [
  { id: '1', firstName: 'John', lastName: 'Doe' },
  { id: '2', firstName: 'Jane', lastName: 'Smith' },
  { id: '3', firstName: 'Mike', lastName: 'Johnson' },
  { id: '4', firstName: 'Sarah', lastName: 'Wilson' },
];

const mockTags = ['urgent', 'bug', 'feature-request', 'documentation', 'security'];

export const QuickWinsDemo: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(mockTickets);

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

  const handleSearch = (filters: any) => {
    console.log('Search filters:', filters);
    // Simulate search
    setSearchResults(mockTickets.filter(ticket => 
      ticket.title.toLowerCase().includes(filters.query.toLowerCase())
    ));
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

  const sections = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'skeletons', label: 'Loading Skeletons', icon: Zap },
    { id: 'search', label: 'Enhanced Search', icon: Search },
    { id: 'bulk', label: 'Bulk Actions', icon: CheckSquare },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Command },
    { id: 'pagination', label: 'Pagination', icon: ArrowRight },
  ];

  const toggleLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Quick Wins Demo</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Showcasing UI/UX improvements</p>
              </div>
            </div>
            <button
              onClick={toggleShortcuts}
              className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors"
            >
              <Command className="h-4 w-4" />
              <span>Shortcuts</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <section.icon className="h-4 w-4" />
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeSection === 'overview' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Quick Wins Implementation
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                We've implemented several quick wins to improve the user experience and productivity of the helpdesk system.
                Explore each section to see the improvements in action.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loading Skeletons</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Better perceived performance with skeleton loading states for different UI elements.
                </p>
                <button
                  onClick={() => setActiveSection('skeletons')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  View Demo →
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
                    <Search className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Enhanced Search</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Advanced filtering and search capabilities with real-time results.
                </p>
                <button
                  onClick={() => setActiveSection('search')}
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                >
                  View Demo →
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
                    <CheckSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bulk Actions</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Perform actions on multiple tickets simultaneously for improved efficiency.
                </p>
                <button
                  onClick={() => setActiveSection('bulk')}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                >
                  View Demo →
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-lg">
                    <Download className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export Functionality</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Export tickets and reports in multiple formats with filtering options.
                </p>
                <button
                  onClick={() => setActiveSection('export')}
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
                >
                  View Demo →
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-indigo-100 dark:bg-indigo-900/20 p-2 rounded-lg">
                    <Command className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Keyboard Shortcuts</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Power user features with keyboard shortcuts for faster navigation.
                </p>
                <button
                  onClick={() => setActiveSection('shortcuts')}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                >
                  View Demo →
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-lg">
                    <ArrowRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pagination</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Handle large datasets efficiently with proper pagination controls.
                </p>
                <button
                  onClick={() => setActiveSection('pagination')}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                >
                  View Demo →
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'skeletons' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Loading Skeletons</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Better perceived performance with skeleton loading states
              </p>
              <button
                onClick={toggleLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                {isLoading ? 'Loading...' : 'Show Loading State'}
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                </div>
                <div className="space-y-4">
                  <TicketCardSkeleton />
                  <TicketCardSkeleton />
                  <TicketCardSkeleton />
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                Click the button above to see loading skeletons in action
              </div>
            )}
          </div>
        )}

        {activeSection === 'search' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Enhanced Search</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced filtering and search capabilities
              </p>
            </div>

            <EnhancedSearch
              onSearch={handleSearch}
              onClear={() => setSearchResults(mockTickets)}
              tickets={mockTickets}
              users={mockUsers}
              tags={mockTags}
            />

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Search Results ({searchResults.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {searchResults.map((ticket) => (
                  <div key={ticket.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{ticket.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {ticket.id}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          ticket.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {ticket.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                          ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'bulk' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Bulk Actions</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Perform actions on multiple tickets simultaneously
              </p>
            </div>

            <BulkActions
              tickets={mockTickets}
              selectedTickets={selectedTickets}
              onSelectionChange={setSelectedTickets}
              onBulkAction={handleBulkAction}
            />
          </div>
        )}

        {activeSection === 'export' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Export Functionality</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Export tickets and reports in multiple formats
              </p>
              <button
                onClick={() => setShowExportModal(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Open Export Modal
              </button>
            </div>
          </div>
        )}

        {activeSection === 'shortcuts' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Keyboard Shortcuts</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Power user features with keyboard shortcuts
              </p>
              <button
                onClick={toggleShortcuts}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Show Shortcuts
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Shortcuts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shortcutDefinitions.map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded">
                      {shortcut.key.toUpperCase()}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'pagination' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pagination</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Handle large datasets efficiently
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sample Data</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {mockTickets
                  .slice((pagination.currentPage - 1) * pagination.itemsPerPage, pagination.currentPage * pagination.itemsPerPage)
                  .map((ticket) => (
                    <div key={ticket.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{ticket.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">ID: {ticket.id}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            ticket.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {ticket.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={Math.ceil(mockTickets.length / pagination.itemsPerPage)}
                totalItems={mockTickets.length}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={pagination.handlePageChange}
                onItemsPerPageChange={pagination.handleItemsPerPageChange}
              />
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <KeyboardShortcuts
        isOpen={isShortcutsOpen}
        onClose={toggleShortcuts}
        shortcuts={shortcuts}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={{ tickets: mockTickets, type: 'tickets' }}
        onExport={handleExport}
      />
    </div>
  );
}; 