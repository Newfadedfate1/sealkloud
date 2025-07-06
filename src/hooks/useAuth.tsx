import React, { useState, useCallback, useEffect, useContext, createContext, ReactNode } from 'react';
import { User, LoginCredentials, AuthState } from '../types/user';
import { authAPI } from '../services/api';
import { useToastHelpers } from '../components/Toast/ToastContainer';

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
      // Use real API for authentication
      const response = await authAPI.login(credentials);
      
      if (response.success && response.data?.user) {
        const authenticatedUser = { 
          ...response.data.user, 
          lastLogin: new Date() 
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
        setAuthState({
          user: authenticatedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return;
      } else {
        throw new Error('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error; // Re-throw to allow form to handle it
    }
  }, []);

  const logout = useCallback(() => {
    console.log('Logging out user');
    localStorage.removeItem(STORAGE_KEY);
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

  const value = {
    ...authState,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};