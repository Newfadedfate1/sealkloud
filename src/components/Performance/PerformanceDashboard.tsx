import React, { useState, useEffect } from 'react';
import { usePerformance } from './PerformanceProvider';
import { 
  Activity, 
  Zap, 
  Database, 
  BarChart3, 
  Settings, 
  RefreshCw, 
  Trash2,
  TrendingUp,
  Clock,
  HardDrive,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export const PerformanceDashboard: React.FC = () => {
  const {
    metrics,
    cache,
    enableCaching,
    enableMonitoring,
    toggleCaching,
    toggleMonitoring,
    clearCache,
    clearExpiredCache,
    getBundleInfo,
    getPerformanceInsights
  } = usePerformance();

  const [bundleInfo, setBundleInfo] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const loadBundleInfo = async () => {
      const info = await getBundleInfo();
      setBundleInfo(info);
    };
    loadBundleInfo();
  }, [getBundleInfo]);

  useEffect(() => {
    const updateInsights = () => {
      setInsights(getPerformanceInsights());
    };
    
    updateInsights();
    const interval = setInterval(updateInsights, 5000);
    return () => clearInterval(interval);
  }, [getPerformanceInsights]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    clearExpiredCache();
    const info = await getBundleInfo();
    setBundleInfo(info);
    setInsights(getPerformanceInsights());
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getPerformanceScore = () => {
    let score = 100;
    
    if (metrics.loadTime > 1000) score -= 20;
    if (metrics.renderTime > 16) score -= 15;
    if (metrics.memoryUsage > 100) score -= 10;
    if (cache.size > 80) score -= 5;
    
    return Math.max(0, score);
  };

  const getStatusColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  const performanceScore = getPerformanceScore();

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Zap className="w-6 h-6 mr-2 text-blue-600" />
          Performance Dashboard
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Performance Score */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Score</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Overall application performance</p>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusIcon(performanceScore)}
            <span className={`text-3xl font-bold ${getStatusColor(performanceScore)}`}>
              {performanceScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Load Time"
          value={`${metrics.loadTime.toFixed(0)}ms`}
          icon={<Clock className="w-5 h-5" />}
          status={metrics.loadTime < 1000 ? 'good' : metrics.loadTime < 2000 ? 'warning' : 'poor'}
        />
        <MetricCard
          title="Render Time"
          value={`${metrics.renderTime.toFixed(1)}ms`}
          icon={<Activity className="w-5 h-5" />}
          status={metrics.renderTime < 16 ? 'good' : metrics.renderTime < 33 ? 'warning' : 'poor'}
        />
        <MetricCard
          title="Memory Usage"
          value={`${metrics.memoryUsage.toFixed(1)}MB`}
          icon={<HardDrive className="w-5 h-5" />}
          status={metrics.memoryUsage < 50 ? 'good' : metrics.memoryUsage < 100 ? 'warning' : 'poor'}
        />
        <MetricCard
          title="Cache Hit Rate"
          value={`${(metrics.cacheHitRate * 100).toFixed(1)}%`}
          icon={<Database className="w-5 h-5" />}
          status={metrics.cacheHitRate > 0.7 ? 'good' : metrics.cacheHitRate > 0.5 ? 'warning' : 'poor'}
        />
      </div>

      {/* Cache Management */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Cache Management
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearExpiredCache}
              className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Clear Expired
            </button>
            <button
              onClick={clearCache}
              className="px-3 py-1 text-sm text-red-600 bg-white border border-red-300 rounded hover:bg-red-50 flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{cache.size}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Cache Entries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round((cache.size / 100) * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Cache Usage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {enableCaching ? 'Enabled' : 'Disabled'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Cache Status</div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
          <Settings className="w-5 h-5 mr-2" />
          Performance Settings
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Enable Caching</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cache API responses for better performance</div>
            </div>
            <button
              onClick={toggleCaching}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enableCaching ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enableCaching ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Performance Monitoring</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Track component load and render times</div>
            </div>
            <button
              onClick={toggleMonitoring}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enableMonitoring ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enableMonitoring ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bundle Analysis */}
      {bundleInfo && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <BarChart3 className="w-5 h-5 mr-2" />
            Bundle Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Size</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{bundleInfo.totalSize}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Gzipped Size</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{bundleInfo.gzippedSize}</div>
            </div>
          </div>
          
          {bundleInfo.analysis?.largestModules && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Largest Modules</div>
              <div className="space-y-1">
                {bundleInfo.analysis.largestModules.map((module: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{module.name}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{module.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Performance Insights */}
      {insights.length > 0 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 flex items-center mb-3">
            <TrendingUp className="w-5 h-5 mr-2" />
            Performance Insights
          </h3>
          
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  status: 'good' | 'warning' | 'poor';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'poor': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${getStatusColor(status)}`}>
          {icon}
        </div>
        <div className={`text-xs px-2 py-1 rounded-full ${
          status === 'good' ? 'bg-green-100 text-green-800' :
          status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status.toUpperCase()}
        </div>
      </div>
      
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {title}
      </div>
    </div>
  );
}; 