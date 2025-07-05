import React, { memo, useMemo, useCallback, useEffect, useRef } from 'react';
import { usePerformance } from './PerformanceProvider';

// Loading fallback component
export const LoadingFallback: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
    <span className="text-gray-600 dark:text-gray-400">{message}</span>
  </div>
);

// Performance tracking wrapper
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return memo((props: P) => {
    const { trackLoadTime, trackRenderTime } = usePerformance();
    const loadStartTime = useRef(performance.now());
    const renderStartTime = useRef(0);

    useEffect(() => {
      const loadTime = performance.now() - loadStartTime.current;
      trackLoadTime(componentName, loadTime);
    }, [trackLoadTime, componentName]);

    useEffect(() => {
      renderStartTime.current = performance.now();
      return () => {
        const renderTime = performance.now() - renderStartTime.current;
        trackRenderTime(componentName, renderTime);
      };
    }, [trackRenderTime, componentName]);

    return <Component {...props} />;
  });
};

// Optimized list component with virtualization
interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const VirtualizedList = <T,>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5
}: VirtualizedListProps<T>) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    return { start: Math.max(0, start - overscan), end };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.start + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Optimized image component with lazy loading
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = src;
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(img);
    return () => observer.unobserve(img);
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  return (
    <img
      ref={imgRef}
      src={hasError ? placeholder : placeholder}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-50'} ${className}`}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Optimized button component with debounced click
interface OptimizedButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  debounceMs?: number;
}

export const OptimizedButton: React.FC<OptimizedButtonProps> = memo(({
  children,
  onClick,
  disabled = false,
  className = '',
  debounceMs = 300
}) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isProcessing = useRef(false);

  const handleClick = useCallback(() => {
    if (isProcessing.current) return;

    isProcessing.current = true;
    onClick();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      isProcessing.current = false;
    }, debounceMs);
  }, [onClick, debounceMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isProcessing.current}
      className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
});

OptimizedButton.displayName = 'OptimizedButton';

// Optimized form component with debounced validation
interface OptimizedFormProps {
  children: React.ReactNode;
  onSubmit: (data: any) => void;
  validationDebounceMs?: number;
  className?: string;
}

export const OptimizedForm: React.FC<OptimizedFormProps> = memo(({
  children,
  onSubmit,
  validationDebounceMs = 500,
  className = ''
}) => {
  const validationTimeoutRef = useRef<NodeJS.Timeout>();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    validationTimeoutRef.current = setTimeout(() => {
      const formData = new FormData(formRef.current!);
      const data = Object.fromEntries(formData.entries());
      onSubmit(data);
    }, validationDebounceMs);
  }, [onSubmit, validationDebounceMs]);

  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={className}
    >
      {children}
    </form>
  );
});

OptimizedForm.displayName = 'OptimizedForm';

// Performance monitoring hook
export const usePerformanceMonitoring = (componentName: string) => {
  const { trackLoadTime, trackRenderTime } = usePerformance();
  const loadStartTime = useRef(performance.now());
  const renderStartTime = useRef(0);

  useEffect(() => {
    const loadTime = performance.now() - loadStartTime.current;
    trackLoadTime(componentName, loadTime);
  }, [trackLoadTime, componentName]);

  useEffect(() => {
    renderStartTime.current = performance.now();
    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      trackRenderTime(componentName, renderTime);
    };
  }, [trackRenderTime, componentName]);
};

// Cache hook for data fetching
export const useCachedData = <T,>(
  key: string,
  fetchData: () => Promise<T>,
  ttl?: number
) => {
  const { getCachedData, setCachedData } = usePerformance();
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Check cache first
      const cachedData = getCachedData<T>(key);
      if (cachedData) {
        setData(cachedData);
        return;
      }

      // Fetch from API
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchData();
        setData(result);
        setCachedData(key, result, ttl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key, fetchData, getCachedData, setCachedData, ttl]);

  return { data, loading, error };
}; 