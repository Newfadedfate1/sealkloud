import { useState, useCallback, useEffect } from 'react';
import { User, LoginCredentials, AuthState } from '../types/user';

// Mock user data for demonstration - matches backend seed data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'client@sealkloud.com',
    firstName: 'John',
    lastName: 'Client',
    role: 'client',
    companyId: 'sealkloud',
    isActive: true,
  },
  {
    id: '2',
    email: 'employee@sealkloud.com',
    firstName: 'Jane',
    lastName: 'Employee',
    role: 'employee_l1',
    companyId: 'sealkloud',
    isActive: true,
  },
  {
    id: '3',
    email: 'admin@sealkloud.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    companyId: 'sealkloud',
    isActive: true,
  },
  {
    id: '4',
    email: 'l2tech@sealkloud.com',
    firstName: 'Level 2',
    lastName: 'Tech',
    role: 'employee_l2',
    companyId: 'sealkloud',
    isActive: true,
  },
  {
    id: '5',
    email: 'l3expert@sealkloud.com',
    firstName: 'Level 3',
    lastName: 'Expert',
    role: 'employee_l3',
    companyId: 'sealkloud',
    isActive: true,
  },
];

const STORAGE_KEY = 'sealkloud_auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start with loading true to check for existing session
    error: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const userData = JSON.parse(stored);
          // Validate the stored data
          if (userData && userData.id && userData.email) {
            setAuthState({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
    };

    checkExistingSession();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Normalize email for comparison
      const normalizedEmail = credentials.email.toLowerCase().trim();
      
      // Mock authentication - find user by email
      const user = mockUsers.find(u => u.email.toLowerCase() === normalizedEmail);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated. Please contact support.');
      }

      // In real implementation, verify password hash
      // For demo purposes, accept 'password123' for all accounts
      if (credentials.password !== 'password123') {
        throw new Error('Invalid email or password');
      }

      const authenticatedUser = { 
        ...user, 
        lastLogin: new Date() 
      };

      // Store in localStorage for persistence
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));

      setAuthState({
        user: authenticatedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log('Login successful:', authenticatedUser);
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    console.log('Logout successful');
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    login,
    logout,
    clearError,
  };
};