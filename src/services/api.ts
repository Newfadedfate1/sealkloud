import { Ticket } from '../types/ticket';
import { User } from '../types/user';
import { useToastHelpers } from '../components/Toast/ToastContainer';

// Enhanced API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

// API configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Request interceptor for adding auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Enhanced error handling
class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: any;
  public requestId?: string;

  constructor(message: string, status: number, code?: string, details?: any, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

// Retry logic with exponential backoff
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  attempts: number = API_CONFIG.retryAttempts,
  delay: number = API_CONFIG.retryDelay
): Promise<T> => {
  try {
    return await requestFn();
  } catch (error) {
    if (attempts <= 1 || !isRetryableError(error)) {
      throw error;
    }

    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(requestFn, attempts - 1, delay * 2);
  }
};

// Check if error is retryable
const isRetryableError = (error: any): boolean => {
  if (error instanceof ApiError) {
    // Retry on 5xx errors and network errors
    return error.status >= 500 || error.status === 0;
  }
  // Retry on network errors
  return error.name === 'TypeError' && error.message.includes('fetch');
};

// Enhanced fetch wrapper
const enhancedFetch = async (
  url: string,
  options: RequestInit = {},
  showToast: boolean = true,
  toast?: ReturnType<typeof import('../components/Toast/ToastContainer').useToastHelpers>
): Promise<ApiResponse> => {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }

      const error = new ApiError(
        errorData.message || `Request failed with status ${response.status}`,
        response.status,
        errorData.code,
        errorData.details,
        requestId
      );

      if (showToast && toast) {
        handleApiError(error, toast);
      }

      throw error;
    }

    // Parse response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    const apiError = new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      0,
      'NETWORK_ERROR',
      error,
      requestId
    );

    if (showToast && toast) {
      handleApiError(apiError, toast);
    }

    throw apiError;
  }
};

// Handle API errors with user-friendly messages
const handleApiError = (error: ApiError, toast: ReturnType<typeof import('../components/Toast/ToastContainer').useToastHelpers>) => {
  let title = 'Request Failed';
  let message = error.message;

  switch (error.status) {
    case 0:
      title = 'Network Error';
      message = 'Unable to connect to the server. Please check your internet connection.';
      break;
    case 401:
      title = 'Authentication Required';
      message = 'Please log in to continue.';
      // Redirect to login
      setTimeout(() => {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }, 2000);
      break;
    case 403:
      title = 'Access Denied';
      message = 'You don\'t have permission to perform this action.';
      break;
    case 404:
      title = 'Not Found';
      message = 'The requested resource was not found.';
      break;
    case 422:
      title = 'Validation Error';
      message = 'Please check your input and try again.';
      break;
    case 429:
      title = 'Too Many Requests';
      message = 'Please wait a moment before trying again.';
      break;
    case 500:
      title = 'Server Error';
      message = 'Something went wrong on our end. Please try again later.';
      break;
    case 503:
      title = 'Service Unavailable';
      message = 'The service is temporarily unavailable. Please try again later.';
      break;
  }

  toast.error(title, message, {
    action: error.requestId ? {
      label: 'Report Issue',
      onClick: () => reportError(error),
    } : undefined,
  });
};

// Report error to support
const reportError = (error: ApiError) => {
  const errorReport = `
Error Report (Request ID: ${error.requestId})

Status: ${error.status}
Code: ${error.code || 'N/A'}
Message: ${error.message}

URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}

${error.details ? `Details: ${JSON.stringify(error.details, null, 2)}` : ''}
  `;

  navigator.clipboard.writeText(errorReport).then(() => {
    alert('Error report copied to clipboard. Please send this to support.');
  }).catch(() => {
    const subject = encodeURIComponent(`API Error Report - ${error.requestId}`);
    const body = encodeURIComponent(errorReport);
    window.open(`mailto:support@sealkloud.com?subject=${subject}&body=${body}`);
  });
};

// API methods with enhanced error handling
export const api = {
  // GET request
  get: async <T = any>(endpoint: string, showToast: boolean = true, toast?: ReturnType<typeof import('../components/Toast/ToastContainer').useToastHelpers>): Promise<ApiResponse<T>> => {
    return retryRequest(async () => {
      return enhancedFetch(`${API_CONFIG.baseURL}${endpoint}`, {
        method: 'GET',
      }, showToast, toast);
    });
  },

  // POST request
  post: async <T = any>(endpoint: string, data?: any, showToast: boolean = true, toast?: ReturnType<typeof import('../components/Toast/ToastContainer').useToastHelpers>): Promise<ApiResponse<T>> => {
    return retryRequest(async () => {
      return enhancedFetch(`${API_CONFIG.baseURL}${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }, showToast, toast);
    });
  },

  // PUT request
  put: async <T = any>(endpoint: string, data?: any, showToast: boolean = true, toast?: ReturnType<typeof import('../components/Toast/ToastContainer').useToastHelpers>): Promise<ApiResponse<T>> => {
    return retryRequest(async () => {
      return enhancedFetch(`${API_CONFIG.baseURL}${endpoint}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, showToast, toast);
    });
  },

  // DELETE request
  delete: async <T = any>(endpoint: string, showToast: boolean = true, toast?: ReturnType<typeof import('../components/Toast/ToastContainer').useToastHelpers>): Promise<ApiResponse<T>> => {
    return retryRequest(async () => {
      return enhancedFetch(`${API_CONFIG.baseURL}${endpoint}`, {
        method: 'DELETE',
      }, showToast, toast);
    });
  },

  // PATCH request
  patch: async <T = any>(endpoint: string, data?: any, showToast: boolean = true): Promise<ApiResponse<T>> => {
    return retryRequest(async () => {
      return enhancedFetch(`${API_CONFIG.baseURL}${endpoint}`, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      }, showToast);
    });
  },
};

// Specific API endpoints with type safety
export const authAPI = {
  login: async (credentials: { email: string; password: string }, toast?: ReturnType<typeof import('../components/Toast/ToastContainer').useToastHelpers>) => {
    const response = await api.post<{ token: string; user: any }>('/api/auth/login', credentials, true, toast);
    if (response.success && response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },

  logout: async (toast?: ReturnType<typeof import('../components/Toast/ToastContainer').useToastHelpers>) => {
    try {
      await api.post('/api/auth/logout', undefined, true, toast);
    } finally {
      localStorage.removeItem('token');
    }
  },

  register: async (userData: { email: string; password: string; name: string }, toast?: ReturnType<typeof import('../components/Toast/ToastContainer').useToastHelpers>) => {
    return api.post<{ token: string; user: any }>('/api/auth/register', userData, true, toast);
  },

  verifyToken: async (toast?: ReturnType<typeof import('../components/Toast/ToastContainer').useToastHelpers>) => {
    return api.get<{ user: any }>('/api/auth/verify', false, toast);
  },
};

export const ticketsAPI = {
  getAll: async (params?: { status?: string; priority?: string; page?: number; limit?: number; clientId?: string }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return api.get<any[]>(`/api/tickets${queryString}`);
  },

  getById: async (id: string) => {
    return api.get<any>(`/api/tickets/${id}`);
  },

  create: async (ticketData: any) => {
    return api.post<any>('/api/tickets', ticketData);
  },

  update: async (id: string, updates: any) => {
    return api.put<any>(`/api/tickets/${id}`, updates);
  },

  delete: async (id: string) => {
    return api.delete(`/api/tickets/${id}`);
  },

  updateStatus: async (id: string, status: string) => {
    return api.patch<any>(`/api/tickets/${id}/status`, { status });
  },

  addComment: async (id: string, comment: string) => {
    return api.post<any>(`/api/tickets/${id}/comments`, { comment });
  },

  // New ticket assignment functions
  claimTicket: async (ticketId: string) => {
    return api.post<any>(`/api/tickets/${ticketId}/claim`);
  },

  getAvailableTickets: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return api.get<any>(`/api/tickets/available/l1${queryString}`);
  },

  getMyTickets: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return api.get<any>(`/api/tickets/my-tickets${queryString}`);
  },
};

export const usersAPI = {
  getAll: async (params?: { page?: number; limit?: number; role?: string; search?: string }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return api.get<any>(`/api/users${queryString}`);
  },

  getById: async (id: string) => {
    return api.get<any>(`/api/users/${id}`);
  },

  create: async (userData: { email: string; password: string; firstName: string; lastName: string; role: string }) => {
    return api.post<any>('/api/users', userData);
  },

  update: async (id: string, updates: any) => {
    return api.patch<any>(`/api/users/${id}`, updates);
  },

  delete: async (id: string) => {
    return api.delete(`/api/users/${id}`);
  },

  toggleStatus: async (id: string, isActive: boolean) => {
    return api.patch<any>(`/api/users/${id}`, { isActive });
  },

  updateRole: async (id: string, role: string) => {
    return api.patch<any>(`/api/users/${id}`, { role });
  },
};

export const auditAPI = {
  getAll: async (params?: { 
    page?: number; 
    limit?: number; 
    action?: string; 
    resourceType?: string; 
    severity?: string; 
    userEmail?: string; 
    startDate?: string; 
    endDate?: string; 
    search?: string 
  }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return api.get<any>(`/audit${queryString}`);
  },

  getStats: async () => {
    return api.get<any>('/audit/stats');
  },

  export: async (format: 'csv' | 'json', startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ format });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get<any>(`/audit/export?${params.toString()}`);
  },
};

export const rolesAPI = {
  getAll: async (params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    include_permissions?: boolean; 
    include_users?: boolean 
  }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return api.get<any>(`/roles${queryString}`);
  },

  getById: async (id: string, params?: { include_permissions?: boolean; include_users?: boolean }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return api.get<any>(`/roles/${id}${queryString}`);
  },

  create: async (roleData: { name: string; description?: string; permissions: string[] }) => {
    return api.post<any>('/roles', roleData);
  },

  update: async (id: string, updates: { name?: string; description?: string; permissions?: string[] }) => {
    return api.put<any>(`/roles/${id}`, updates);
  },

  delete: async (id: string) => {
    return api.delete(`/roles/${id}`);
  },

  getPermissions: async () => {
    return api.get<any>('/roles/permissions/list');
  },

  assignToUser: async (roleId: string, userId: string) => {
    return api.post<any>(`/roles/${roleId}/assign`, { user_id: userId });
  },

  removeFromUser: async (roleId: string, userId: string) => {
    return api.delete<any>(`/roles/${roleId}/assign/${userId}`);
  },
};

export const workflowsAPI = {
  getAll: async (params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    active_only?: boolean 
  }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return api.get<any>(`/workflows${queryString}`);
  },

  getById: async (id: string) => {
    return api.get<any>(`/workflows/${id}`);
  },

  create: async (workflowData: { 
    name: string; 
    description?: string; 
    is_active?: boolean; 
    priority?: number; 
    conditions: Array<{ field: string; operator: string; value: string }>; 
    actions: Array<{ type: string; value: string }> 
  }) => {
    return api.post<any>('/workflows', workflowData);
  },

  update: async (id: string, updates: { 
    name?: string; 
    description?: string; 
    is_active?: boolean; 
    priority?: number; 
    conditions?: Array<{ field: string; operator: string; value: string }>; 
    actions?: Array<{ type: string; value: string }> 
  }) => {
    return api.put<any>(`/workflows/${id}`, updates);
  },

  delete: async (id: string) => {
    return api.delete(`/workflows/${id}`);
  },

  toggle: async (id: string) => {
    return api.patch<any>(`/workflows/${id}/toggle`);
  },

  getMetadata: async () => {
    return api.get<any>('/workflows/metadata/available');
  },
};

// Export error types for use in components
export { ApiError }; 