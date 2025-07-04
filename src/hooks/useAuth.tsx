import React, { useState, useCallback, useEffect, useContext, createContext, ReactNode } from 'react';
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

const AuthContext = createContext<
  (AuthState & {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    clearError: () => void;
  }) | undefined
>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start with loading true to check for existing session
    error: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      console.log('Checking for existing session...');
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const userData = JSON.parse(stored);
          console.log('Found stored user data:', userData);
          // Validate the stored data
          if (userData && userData.id && userData.email && userData.role) {
            console.log('Restoring session for user:', userData.email);
            setAuthState({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }
        }
        console.log('No valid session found');
      } catch (error) {
        console.error('Error checking existing session:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
    };

    // Small delay to ensure proper initialization
    const timer = setTimeout(checkExistingSession, 100);
    return () => clearTimeout(timer);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    console.log('Login attempt for:', credentials.email);
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Normalize email for comparison
      const normalizedEmail = credentials.email.toLowerCase().trim();
      console.log('Looking for user with email:', normalizedEmail);
      
      // Mock authentication - find user by email
      const user = mockUsers.find(u => u.email.toLowerCase() === normalizedEmail);
      
      if (!user) {
        console.log('User not found');
        throw new Error('Invalid email or password');
      }

      console.log('Found user:', user);

      if (!user.isActive) {
        console.log('User account is deactivated');
        throw new Error('Account is deactivated. Please contact support.');
      }

      // In real implementation, verify password hash
      // For demo purposes, accept 'password123' for all accounts
      if (credentials.password !== 'password123') {
        console.log('Invalid password');
        throw new Error('Invalid email or password');
      }

      const authenticatedUser = { 
        ...user, 
        lastLogin: new Date() 
      };

      console.log('Authentication successful, storing user:', authenticatedUser);

      // Store in localStorage for persistence
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));

      setAuthState({
        user: authenticatedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log('Login successful, state updated');
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
    console.log('Logging out...');
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
    setAuthState((prev: AuthState) => ({ ...prev, error: null }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};