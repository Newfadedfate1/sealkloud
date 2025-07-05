import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? (toast.type === 'loading' ? 0 : 3000),
    };

    setToasts(prev => {
      const updated = [newToast, ...prev].slice(0, maxToasts);
      return updated;
    });

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      if (toast?.onClose) {
        toast.onClose();
      }
      return prev.filter(t => t.id !== id);
    });
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Auto-remove toasts based on duration
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    toasts.forEach(toast => {
      if (toast.duration && toast.duration > 0) {
        const timeout = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);
        timeouts.push(timeout);
      }
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [toasts, removeToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'loading':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-100/30 dark:border-green-300 dark:text-green-900';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-100/30 dark:border-red-300 dark:text-red-900';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-100/30 dark:border-yellow-300 dark:text-yellow-900';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-100/30 dark:border-blue-300 dark:text-blue-900';
      case 'loading':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-100/30 dark:border-blue-300 dark:text-blue-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-100/30 dark:border-gray-300 dark:text-gray-900';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-start gap-3 p-4 rounded-lg border shadow-lg
            transform transition-all duration-300 ease-in-out
            ${getToastStyles(toast.type)}
            animate-in slide-in-from-right-full
          `}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getToastIcon(toast.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium mb-1">
              {toast.title}
            </h4>
            {toast.message && (
              <p className="text-sm opacity-90">
                {toast.message}
              </p>
            )}
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="mt-2 text-sm font-medium underline hover:no-underline"
              >
                {toast.action.label}
              </button>
            )}
          </div>
          
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

// Convenience hooks for common toast types
export const useToastHelpers = () => {
  const { addToast } = useToast();

  return {
    success: (title: string, message?: string, options?: Partial<Toast>) => 
      addToast({ type: 'success', title, message, ...options }),
    
    error: (title: string, message?: string, options?: Partial<Toast>) => 
      addToast({ type: 'error', title, message, ...options }),
    
    warning: (title: string, message?: string, options?: Partial<Toast>) => 
      addToast({ type: 'warning', title, message, ...options }),
    
    info: (title: string, message?: string, options?: Partial<Toast>) => 
      addToast({ type: 'info', title, message, ...options }),
    
    loading: (title: string, message?: string, options?: Partial<Toast>) => 
      addToast({ type: 'loading', title, message, duration: 0, ...options }),
    
    dismiss: (id: string) => {
      const { removeToast } = useToast();
      removeToast(id);
    }
  };
}; 