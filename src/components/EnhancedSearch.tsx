import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, User, Tag, AlertTriangle, Clock, CheckCircle, Eye } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
}

interface SearchFilters {
  query: string;
  status: string[];
  priority: string[];
  assignedTo: string[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  tags: string[];
}

interface EnhancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  tickets: any[];
  users: any[];
  tags: string[];
}

export const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  onSearch,
  onClear,
  tickets,
  users,
  tags
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: [],
    priority: [],
    assignedTo: [],
    dateRange: {},
    tags: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const statusOptions: FilterOption[] = [
    { id: 'open', label: 'Open', value: 'open' },
    { id: 'in-progress', label: 'In Progress', value: 'in-progress' },
    { id: 'resolved', label: 'Resolved', value: 'resolved' },
    { id: 'closed', label: 'Closed', value: 'closed' }
  ];

  const priorityOptions: FilterOption[] = [
    { id: 'low', label: 'Low', value: 'low' },
    { id: 'medium', label: 'Medium', value: 'medium' },
    { id: 'high', label: 'High', value: 'high' },
    { id: 'critical', label: 'Critical', value: 'critical' }
  ];

  const dateRangeOptions = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'week', label: 'Last 7 Days' },
    { id: 'month', label: 'Last 30 Days' },
    { id: 'quarter', label: 'Last 90 Days' },
    { id: 'custom', label: 'Custom Range' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.query || filters.status.length > 0 || filters.priority.length > 0 || 
          filters.assignedTo.length > 0 || filters.tags.length > 0) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      await onSearch(filters);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setFilters({
      query: '',
      status: [],
      priority: [],
      assignedTo: [],
      dateRange: {},
      tags: []
    });
    onClear();
  };

  const toggleFilter = (type: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      const currentArray = prev[type] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [type]: newArray
      };
    });
  };

  const getActiveFiltersCount = () => {
    return (
      filters.status.length +
      filters.priority.length +
      filters.assignedTo.length +
      filters.tags.length +
      (filters.query ? 1 : 0)
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return Eye;
      case 'in-progress': return Clock;
      case 'resolved': return CheckCircle;
      case 'closed': return X;
      default: return Eye;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return AlertTriangle;
      case 'high': return AlertTriangle;
      case 'medium': return Tag;
      case 'low': return Tag;
      default: return Tag;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={filters.query}
          onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
          placeholder="Search tickets by title, description, or ID..."
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters || getActiveFiltersCount() > 0
                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Filter className="h-5 w-5" />
            {getActiveFiltersCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.query && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
              Search: "{filters.query}"
              <button
                onClick={() => setFilters(prev => ({ ...prev, query: '' }))}
                className="ml-2 hover:text-blue-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filters.status.map(status => (
            <span key={status} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
              {React.createElement(getStatusIcon(status), { className: "h-3 w-3 mr-1" })}
              {statusOptions.find(s => s.value === status)?.label}
              <button
                onClick={() => toggleFilter('status', status)}
                className="ml-2 hover:text-green-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          
          {filters.priority.map(priority => (
            <span key={priority} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200">
              {React.createElement(getPriorityIcon(priority), { className: "h-3 w-3 mr-1" })}
              {priorityOptions.find(p => p.value === priority)?.label}
              <button
                onClick={() => toggleFilter('priority', priority)}
                className="ml-2 hover:text-orange-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          
          {filters.assignedTo.map(userId => {
            const user = users.find(u => u.id === userId);
            return (
              <span key={userId} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200">
                <User className="h-3 w-3 mr-1" />
                {user?.firstName} {user?.lastName}
                <button
                  onClick={() => toggleFilter('assignedTo', userId)}
                  className="ml-2 hover:text-purple-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          
          {filters.tags.map(tag => (
            <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
              <button
                onClick={() => toggleFilter('tags', tag)}
                className="ml-2 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          
          <button
            onClick={handleClear}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Status</h3>
              <div className="space-y-2">
                {statusOptions.map(option => (
                  <label key={option.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(option.value)}
                      onChange={() => toggleFilter('status', option.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Priority</h3>
              <div className="space-y-2">
                {priorityOptions.map(option => (
                  <label key={option.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.priority.includes(option.value)}
                      onChange={() => toggleFilter('priority', option.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Assigned To Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Assigned To</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {users.map(user => (
                  <label key={user.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.assignedTo.includes(user.id)}
                      onChange={() => toggleFilter('assignedTo', user.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {user.firstName} {user.lastName}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Tags</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {tags.map(tag => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.tags.includes(tag)}
                      onChange={() => toggleFilter('tags', tag)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {tag}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Search Results Summary */}
          {isSearching && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Searching...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 