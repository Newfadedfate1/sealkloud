import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  cacheHitRate: number;
}

interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  ttl: number;
}

interface PerformanceContextType {
  // Performance monitoring
  metrics: PerformanceMetrics;
  trackLoadTime: (componentName: string, loadTime: number) => void;
  trackRenderTime: (componentName: string, renderTime: number) => void;
  
  // Caching
  cache: Map<string, CacheEntry>;
  getCachedData: <T>(key: string) => T | null;
  setCachedData: <T>(key: string, data: T, ttl?: number) => void;
  clearCache: () => void;
  clearExpiredCache: () => void;
  
  // Performance settings
  enableCaching: boolean;
  toggleCaching: () => void;
  enableMonitoring: boolean;
  toggleMonitoring: () => void;
  
  // Bundle analysis
  getBundleInfo: () => Promise<any>;
  
  // Performance insights
  getPerformanceInsights: () => string[];
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

interface PerformanceProviderProps {
  children: React.ReactNode;
  maxCacheSize?: number;
  defaultTTL?: number;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
  children,
  maxCacheSize = 100,
  defaultTTL = 5 * 60 * 1000 // 5 minutes
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    cacheHitRate: 0
  });
  
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());
  const [enableCaching, setEnableCaching] = useState(true);
  const [enableMonitoring, setEnableMonitoring] = useState(true);
  const [cacheHits, setCacheHits] = useState(0);
  const [cacheMisses, setCacheMisses] = useState(0);

  // Load performance settings from localStorage
  useEffect(() => {
    const savedCaching = localStorage.getItem('performance-caching');
    const savedMonitoring = localStorage.getItem('performance-monitoring');
    
    if (savedCaching !== null) {
      setEnableCaching(savedCaching === 'true');
    }
    if (savedMonitoring !== null) {
      setEnableMonitoring(savedMonitoring === 'true');
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('performance-caching', enableCaching.toString());
  }, [enableCaching]);

  useEffect(() => {
    localStorage.setItem('performance-monitoring', enableMonitoring.toString());
  }, [enableMonitoring]);

  // Track performance metrics
  const trackLoadTime = useCallback((componentName: string, loadTime: number) => {
    if (!enableMonitoring) return;
    
    setMetrics(prev => ({
      ...prev,
      loadTime: Math.max(prev.loadTime, loadTime)
    }));
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${componentName} loaded in ${loadTime}ms`);
    }
  }, [enableMonitoring]);

  const trackRenderTime = useCallback((componentName: string, renderTime: number) => {
    if (!enableMonitoring) return;
    
    setMetrics(prev => ({
      ...prev,
      renderTime: Math.max(prev.renderTime, renderTime)
    }));
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${componentName} rendered in ${renderTime}ms`);
    }
  }, [enableMonitoring]);

  // Cache management
  const getCachedData = useCallback(<T,>(key: string): T | null => {
    if (!enableCaching) return null;
    
    const entry = cache.get(key);
    if (!entry) {
      setCacheMisses(prev => prev + 1);
      return null;
    }
    
    // Check if cache entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.delete(key);
      setCacheMisses(prev => prev + 1);
      return null;
    }
    
    setCacheHits(prev => prev + 1);
    return entry.data as T;
  }, [cache, enableCaching]);

  const setCachedData = useCallback(<T,>(key: string, data: T, ttl: number = defaultTTL) => {
    if (!enableCaching) return;
    
    // Check cache size limit
    if (cache.size >= maxCacheSize) {
      // Remove oldest entry
      const oldestKey = cache.keys().next().value;
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }
    
    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl
    };
    
    setCache(prev => new Map(prev.set(key, entry)));
  }, [enableCaching, defaultTTL, maxCacheSize]);

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  const clearExpiredCache = useCallback(() => {
    const now = Date.now();
    setCache(prev => {
      const newCache = new Map();
      for (const [key, entry] of prev.entries()) {
        if (now - entry.timestamp <= entry.ttl) {
          newCache.set(key, entry);
        }
      }
      return newCache;
    });
  }, []);

  // Toggle functions
  const toggleCaching = useCallback(() => {
    setEnableCaching(prev => !prev);
  }, []);

  const toggleMonitoring = useCallback(() => {
    setEnableMonitoring(prev => !prev);
  }, []);

  // Bundle analysis
  const getBundleInfo = useCallback(async () => {
    try {
      // This would typically call an API endpoint that analyzes the bundle
      // For now, we'll return mock data
      return {
        totalSize: '2.1 MB',
        gzippedSize: '650 KB',
        chunks: [
          { name: 'main', size: '1.2 MB', gzipped: '380 KB' },
          { name: 'vendor', size: '900 KB', gzipped: '270 KB' }
        ],
        analysis: {
          largestModules: [
            { name: 'react-dom', size: '120 KB' },
            { name: 'lucide-react', size: '85 KB' },
            { name: 'tailwindcss', size: '75 KB' }
          ]
        }
      };
    } catch (error) {
      console.error('Failed to get bundle info:', error);
      return null;
    }
  }, []);

  // Performance insights
  const getPerformanceInsights = useCallback(() => {
    const insights: string[] = [];
    
    if (metrics.loadTime > 1000) {
      insights.push('Consider implementing code splitting for faster initial load');
    }
    
    if (metrics.renderTime > 16) {
      insights.push('Component rendering is taking longer than 16ms - consider optimization');
    }
    
    if (cache.size > maxCacheSize * 0.8) {
      insights.push('Cache is nearly full - consider increasing cache size or clearing old entries');
    }
    
    const hitRate = cacheHits + cacheMisses > 0 ? cacheHits / (cacheHits + cacheMisses) : 0;
    if (hitRate < 0.5) {
      insights.push('Cache hit rate is low - consider adjusting cache TTL or keys');
    }
    
    return insights;
  }, [metrics, cache.size, maxCacheSize, cacheHits, cacheMisses]);

  // Update cache hit rate
  useEffect(() => {
    const total = cacheHits + cacheMisses;
    if (total > 0) {
      setMetrics(prev => ({
        ...prev,
        cacheHitRate: cacheHits / total
      }));
    }
  }, [cacheHits, cacheMisses]);

  // Monitor memory usage
  useEffect(() => {
    if (!enableMonitoring) return;
    
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
        }));
      }
    };
    
    const interval = setInterval(updateMemoryUsage, 5000);
    return () => clearInterval(interval);
  }, [enableMonitoring]);

  // Clean up expired cache entries periodically
  useEffect(() => {
    const interval = setInterval(clearExpiredCache, 60000); // Every minute
    return () => clearInterval(interval);
  }, [clearExpiredCache]);

  const value: PerformanceContextType = {
    metrics,
    trackLoadTime,
    trackRenderTime,
    cache,
    getCachedData,
    setCachedData,
    clearCache,
    clearExpiredCache,
    enableCaching,
    toggleCaching,
    enableMonitoring,
    toggleMonitoring,
    getBundleInfo,
    getPerformanceInsights
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}; 