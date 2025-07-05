import React, { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet, Calendar, Filter, CheckCircle } from 'lucide-react';

interface ExportData {
  tickets?: any[];
  reports?: any[];
  type: 'tickets' | 'reports' | 'analytics';
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExportData;
  onExport: (format: string, filters: any) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  data,
  onExport
}) => {
  const [format, setFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'quarter' | 'custom'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const formats = [
    { id: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Comma-separated values for Excel' },
    { id: 'pdf', label: 'PDF', icon: FileText, description: 'Portable document format' },
    { id: 'excel', label: 'Excel', icon: FileSpreadsheet, description: 'Native Excel format' }
  ];

  const dateRanges = [
    { id: 'all', label: 'All Time' },
    { id: 'week', label: 'Last 7 Days' },
    { id: 'month', label: 'Last 30 Days' },
    { id: 'quarter', label: 'Last 90 Days' },
    { id: 'custom', label: 'Custom Range' }
  ];

  const statusOptions = [
    { id: 'all', label: 'All Statuses' },
    { id: 'open', label: 'Open' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'closed', label: 'Closed' }
  ];

  const priorityOptions = [
    { id: 'all', label: 'All Priorities' },
    { id: 'low', label: 'Low' },
    { id: 'medium', label: 'Medium' },
    { id: 'high', label: 'High' },
    { id: 'critical', label: 'Critical' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const filters = {
        dateRange,
        status: statusFilter,
        priority: priorityFilter
      };

      await onExport(format, filters);
      
      setExportProgress(100);
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const getDataCount = () => {
    if (data.tickets) return data.tickets.length;
    if (data.reports) return data.reports.length;
    return 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
              <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Data</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Export {data.type} ({getDataCount()} items)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isExporting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Format</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {formats.map((formatOption) => (
                <button
                  key={formatOption.id}
                  onClick={() => setFormat(formatOption.id as any)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    format === formatOption.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  disabled={isExporting}
                >
                  <div className="flex items-center space-x-3">
                    <formatOption.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatOption.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatOption.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isExporting}
                >
                  {dateRanges.map((range) => (
                    <option key={range.id} value={range.id}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isExporting}
                >
                  {statusOptions.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isExporting}
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority.id} value={priority.id}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Exporting... {exportProgress}%
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Export Preview</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div>Format: {format.toUpperCase()}</div>
              <div>Date Range: {dateRanges.find(r => r.id === dateRange)?.label}</div>
              <div>Status: {statusOptions.find(s => s.id === statusFilter)?.label}</div>
              <div>Priority: {priorityOptions.find(p => p.id === priorityFilter)?.label}</div>
              <div>Estimated file size: ~{Math.round(getDataCount() * 0.5)}KB</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Export</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 