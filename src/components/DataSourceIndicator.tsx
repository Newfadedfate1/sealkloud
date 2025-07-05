import React, { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff } from 'lucide-react';

interface DataSourceIndicatorProps {
  isUsingMockData: boolean;
  isLoading: boolean;
  onRefresh?: () => void;
  autoHideDelay?: number; // Time in milliseconds before auto-hiding
}

export const DataSourceIndicator: React.FC<DataSourceIndicatorProps> = ({
  isUsingMockData,
  isLoading,
  onRefresh,
  autoHideDelay = 3000 // Default 3 seconds
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide the indicator after the specified delay
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);

      return () => clearTimeout(timer);
    } else {
      // Show indicator when loading
      setIsVisible(true);
    }
  }, [isLoading, autoHideDelay]);

  // Show indicator when data source changes
  useEffect(() => {
    setIsVisible(true);
  }, [isUsingMockData]);

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Loading data...
        </div>
      </div>
    );
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm transition-all duration-300 ${
        isUsingMockData 
          ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' 
          : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      }`}>
        {isUsingMockData ? (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Mock Data</span>
          </>
        ) : (
          <>
            <Database className="h-4 w-4" />
            <span>Live API</span>
          </>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="ml-2 p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            title="Refresh data"
          >
            <Wifi className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}; 