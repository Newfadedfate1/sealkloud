import { useState, useCallback } from 'react';
import { User, LoginCredentials, AuthState, UserRole } from '../types/user';

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

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock authentication
      const user = mockUsers.find(u => u.email === credentials.email);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // In real implementation, verify password hash
      if (credentials.password !== 'password123') {
        throw new Error('Invalid email or password');
      }

      setAuthState({
        user: { ...user, lastLogin: new Date() },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
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