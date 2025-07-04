import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

export interface SearchFilter {
  field: string;
  value: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
}

export interface SearchSuggestion {
  id: string;
  type: 'ticket' | 'user' | 'content';
  title: string;
  subtitle: string;
  icon: string;
}

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilter[]) => void;
  onClear: () => void;
  suggestions?: SearchSuggestion[];
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  suggestions = [],
  placeholder = "Search tickets, users, or content...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const filterOptions = [
    { value: 'status', label: 'Status', options: ['open', 'in_progress', 'resolved', 'closed'] },
    { value: 'priority', label: 'Priority', options: ['low', 'medium', 'high', 'urgent'] },
    { value: 'assignee', label: 'Assignee', options: [] },
    { value: 'created_date', label: 'Created Date', options: ['today', 'yesterday', 'this_week', 'this_month'] },
    { value: 'type', label: 'Type', options: ['bug', 'feature', 'question', 'support'] }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (query.trim() || filters.length > 0) {
      onSearch(query, filters);
    }
  };

  const handleClear = () => {
    setQuery('');
    setFilters([]);
    onClear();
  };

  const addFilter = (field: string, value: string, operator: SearchFilter['operator'] = 'equals') => {
    const newFilter: SearchFilter = { field, value, operator };
    setFilters(prev => [...prev, newFilter]);
  };

  const removeFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getFilterDisplayName = (filter: SearchFilter) => {
    const fieldOption = filterOptions.find(opt => opt.value === filter.field);
    return `${fieldOption?.label || filter.field}: ${filter.value}`;
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        {/* Search Icon */}
        <div className="pl-3 pr-2">
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="flex-1 py-2 px-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
        />

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 ${filters.length > 0 ? 'text-blue-600' : 'text-gray-400'} hover:text-blue-600 transition-colors`}
        >
          <Filter className="h-5 w-5" />
        </button>

        {/* Clear Button */}
        {(query || filters.length > 0) && (
          <button
            onClick={handleClear}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Active Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.map((filter, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-md"
            >
              {getFilterDisplayName(filter)}
              <button
                onClick={() => removeFilter(index)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Add Filters</h3>
          <div className="grid grid-cols-2 gap-4">
            {filterOptions.map((option) => (
              <div key={option.value}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {option.label}
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    if (e.target.value) {
                      addFilter(option.value, e.target.value);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">Select {option.label}</option>
                  {option.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => {
                setQuery(suggestion.title);
                setShowSuggestions(false);
                handleSearch();
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {suggestion.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {suggestion.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {suggestion.subtitle}
                  </p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 uppercase">
                  {suggestion.type}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 