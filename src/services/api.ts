import { Ticket } from '../types/ticket';
import { User } from '../types/user';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Ticket API functions
export const ticketAPI = {
  // Get all tickets
  async getTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    problemLevel?: string;
    assignedTo?: string;
    search?: string;
  }): Promise<{ tickets: Ticket[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) queryParams.append(key, value.toString());
        });
      }

      const response = await fetch(`${API_BASE_URL}/tickets?${queryParams}`, {
        headers: getAuthHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('API Error fetching tickets:', error);
      throw error;
    }
  },

  // Create new ticket
  async createTicket(ticketData: {
    title: string;
    description: string;
    problemLevel: string;
    clientName?: string;
  }): Promise<Ticket> {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(ticketData),
      });
      
      const result = await handleResponse(response);
      return result.ticket;
    } catch (error) {
      console.error('API Error creating ticket:', error);
      throw error;
    }
  },

  // Update ticket
  async updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<Ticket> {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      
      const result = await handleResponse(response);
      return result.ticket;
    } catch (error) {
      console.error('API Error updating ticket:', error);
      throw error;
    }
  },

  // Get ticket by ID
  async getTicket(ticketId: string): Promise<Ticket> {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        headers: getAuthHeaders(),
      });
      
      const result = await handleResponse(response);
      return result.ticket;
    } catch (error) {
      console.error('API Error fetching ticket:', error);
      throw error;
    }
  }
};

// User API functions
export const userAPI = {
  // Get current user profile
  async getCurrentUser(): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
      });
      
      const result = await handleResponse(response);
      return result.user;
    } catch (error) {
      console.error('API Error fetching current user:', error);
      throw error;
    }
  },

  // Get all users (for admin/employee use)
  async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders(),
      });
      
      const result = await handleResponse(response);
      return result.users;
    } catch (error) {
      console.error('API Error fetching users:', error);
      throw error;
    }
  }
};

// Auth API functions
export const authAPI = {
  // Login
  async login(credentials: { email: string; password: string }): Promise<{ token: string; user: User }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      const result = await handleResponse(response);
      return result;
    } catch (error) {
      console.error('API Error during login:', error);
      throw error;
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('API Error during logout:', error);
      // Don't throw error for logout as it's not critical
    }
  }
};

// Utility function to check if API is available
export const checkAPIHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch (error) {
    console.warn('API health check failed:', error);
    return false;
  }
}; 