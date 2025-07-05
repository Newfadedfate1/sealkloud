import React, { useState } from 'react';
import { PerformanceDashboard } from '../Performance/PerformanceDashboard';
import { 
  VirtualizedList, 
  OptimizedButton, 
  OptimizedForm, 
  OptimizedImage,
  LoadingFallback,
  usePerformanceMonitoring,
  useCachedData
} from '../Performance/OptimizedComponents';
import { usePerformance } from '../Performance/PerformanceProvider';
import { 
  Zap, 
  Database, 
  Activity, 
  Clock, 
  HardDrive, 
  BarChart3,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Info
} from 'lucide-react';

export const Phase4Demo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [virtualizedItems, setVirtualizedItems] = useState(Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`));
  const [isLoading, setIsLoading] = useState(false);
  const [demoData, setDemoData] = useState<any>(null);

  // Performance monitoring for this component
  usePerformanceMonitoring('Phase4Demo');

  const { setCachedData, getCachedData } = usePerformance();

  // Simulated data fetching with caching
  const { data: cachedData, loading: cacheLoading } = useCachedData(
    'demo-data',
    async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        message: 'This data was fetched and cached!',
        timestamp: new Date().toISOString(),
        items: Array.from({ length: 50 }, (_, i) => `Cached Item ${i + 1}`)
      };
    },
    30000 // 30 seconds TTL
  );

  const handlePerformanceTest = async () => {
    setIsLoading(true);
    
    // Simulate heavy computation
    const startTime = performance.now();
    
    // Simulate processing 1000 items
    for (let i = 0; i < 1000; i++) {
      // Simulate work
      Math.sqrt(i);
    }
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    // Cache the result
    setCachedData('performance-test', { processingTime, timestamp: new Date().toISOString() });
    
    setDemoData({ processingTime, timestamp: new Date().toISOString() });
    setIsLoading(false);
  };

  const handleFormSubmit = (data: any) => {
    console.log('Form submitted with optimized validation:', data);
    alert(`Form submitted: ${JSON.stringify(data, null, 2)}`);
  };

  const renderVirtualizedItem = (item: string, index: number) => (
    <div className="p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
      <div className="font-medium text-gray-900 dark:text-white">{item}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">Index: {index}</div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Performance Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'virtualization', label: 'Virtualized List', icon: <Activity className="w-4 h-4" /> },
    { id: 'caching', label: 'Caching Demo', icon: <Database className="w-4 h-4" /> },
    { id: 'optimized', label: 'Optimized Components', icon: <Zap className="w-4 h-4" /> },
    { id: 'testing', label: 'Performance Testing', icon: <Clock className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Zap className="w-8 h-8 mr-3 text-blue-600" />
          Phase 4: Performance Optimization Demo
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Explore advanced performance optimizations including caching, virtualization, lazy loading, and performance monitoring.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        {activeTab === 'dashboard' && (
          <PerformanceDashboard />
        )}

        {activeTab === 'virtualization' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-blue-600" />
              Virtualized List Demo
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This list renders 1000 items efficiently using virtualization. Only visible items are rendered in the DOM.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <VirtualizedList
                items={virtualizedItems}
                renderItem={renderVirtualizedItem}
                itemHeight={80}
                containerHeight={400}
                overscan={5}
              />
            </div>
            
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <Info className="w-4 h-4 inline mr-1" />
              Scroll to see virtualization in action. Only ~10-15 items are rendered at any time.
            </div>
          </div>
        )}

        {activeTab === 'caching' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Database className="w-6 h-6 mr-2 text-blue-600" />
              Caching Demo
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Data is automatically cached and retrieved. Try refreshing the page to see cached data load instantly.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Cached Data</h3>
                {cacheLoading ? (
                  <LoadingFallback message="Loading cached data..." />
                ) : cachedData ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{cachedData.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Timestamp: {cachedData.timestamp}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Items: {cachedData.items.length}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No cached data available</p>
                )}
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Cache Controls</h3>
                <div className="space-y-2">
                  <OptimizedButton
                    onClick={() => {
                      const cached = getCachedData('demo-data');
                      console.log('Manual cache check:', cached);
                      alert(cached ? 'Data found in cache!' : 'No data in cache');
                    }}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Check Cache
                  </OptimizedButton>
                  
                  <OptimizedButton
                    onClick={() => {
                      setCachedData('manual-data', { message: 'Manually cached!', timestamp: new Date().toISOString() });
                      alert('Data manually cached!');
                    }}
                    className="w-full bg-green-600 text-white hover:bg-green-700"
                  >
                    Cache Data
                  </OptimizedButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'optimized' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Zap className="w-6 h-6 mr-2 text-blue-600" />
              Optimized Components Demo
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              These components include performance optimizations like debouncing, memoization, and lazy loading.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Optimized Form</h3>
                <OptimizedForm onSubmit={handleFormSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  <OptimizedButton
                    type="submit"
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Submit (Debounced)
                  </OptimizedButton>
                </OptimizedForm>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Optimized Image</h3>
                <div className="space-y-3">
                  <OptimizedImage
                    src="https://picsum.photos/300/200"
                    alt="Random optimized image"
                    className="w-full rounded-lg"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This image uses lazy loading and intersection observer for optimal performance.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Optimized Buttons</h3>
              <div className="flex flex-wrap gap-3">
                <OptimizedButton
                  onClick={() => alert('Button clicked! (debounced)')}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  Success Action
                </OptimizedButton>
                <OptimizedButton
                  onClick={() => alert('Button clicked! (debounced)')}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Danger Action
                </OptimizedButton>
                <OptimizedButton
                  onClick={() => alert('Button clicked! (debounced)')}
                  className="bg-yellow-600 text-white hover:bg-yellow-700"
                >
                  Warning Action
                </OptimizedButton>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                These buttons include debouncing to prevent rapid-fire clicks.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'testing' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-blue-600" />
              Performance Testing
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Test various performance optimizations and see real-time metrics.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Performance Test</h3>
                <OptimizedButton
                  onClick={handlePerformanceTest}
                  disabled={isLoading}
                  className="w-full bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                      Running Test...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Performance Test
                    </>
                  )}
                </OptimizedButton>
                
                {demoData && (
                  <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Processing Time:</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {demoData.processingTime.toFixed(2)}ms
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {demoData.timestamp}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Performance Tips</h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start">
                    <Zap className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                    <span>Use React.memo for expensive components</span>
                  </div>
                  <div className="flex items-start">
                    <Database className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                    <span>Cache API responses to reduce network calls</span>
                  </div>
                  <div className="flex items-start">
                    <Activity className="w-4 h-4 mr-2 mt-0.5 text-purple-600 flex-shrink-0" />
                    <span>Implement virtualization for large lists</span>
                  </div>
                  <div className="flex items-start">
                    <Clock className="w-4 h-4 mr-2 mt-0.5 text-yellow-600 flex-shrink-0" />
                    <span>Debounce user interactions to prevent excessive renders</span>
                  </div>
                  <div className="flex items-start">
                    <HardDrive className="w-4 h-4 mr-2 mt-0.5 text-red-600 flex-shrink-0" />
                    <span>Monitor memory usage and clean up resources</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 