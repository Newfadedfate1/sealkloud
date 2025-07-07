import React, { useEffect } from 'react';
import { LoginPage } from './components/Login/LoginPage';
import { ClientDashboard } from './components/Dashboard/ClientDashboard';
import { EmployeeDashboard } from './components/Dashboard/EmployeeDashboard';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { QuickWinsDemo } from './components/QuickWinsDemo';
import { Phase3Demo } from './components/Phase3Demo/Phase3Demo';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './components/ThemeProvider';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ToastProvider } from './components/Toast/ToastContainer';
import { AccessibilityProvider } from './components/Accessibility/AccessibilityProvider';
import { PerformanceProvider } from './components/Performance/PerformanceProvider';
import './components/Accessibility/accessibility.css';
import './components/Performance/performance.css';

// Add console logging for debugging
console.log('App.tsx loaded');

function App() {
  console.log('App component rendering');
  
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  
  console.log('Auth state:', { user, isAuthenticated, isLoading });

  // Debug logging
  useEffect(() => {
    console.log('App state:', { 
      user: user ? { id: user.id, email: user.email, role: user.role } : null, 
      isAuthenticated, 
      isLoading 
    });
  }, [user, isAuthenticated, isLoading]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('App is loading...');
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated || !user) {
    console.log('Showing login page - not authenticated or no user');
    return (
      <ErrorBoundary>
        <AccessibilityProvider>
          <PerformanceProvider>
            <LoginPage />
          </PerformanceProvider>
        </AccessibilityProvider>
      </ErrorBoundary>
    );
  }

  // Route based on user role
  console.log('Routing user with role:', user.role);
  
  // Special demo route - you can access this by setting user.role to 'demo'
  if (user.role === 'demo') {
    return (
      <ErrorBoundary>
        <AccessibilityProvider>
          <QuickWinsDemo />
        </AccessibilityProvider>
      </ErrorBoundary>
    );
  }
  
  try {
    switch (user.role) {
      case 'client':
        console.log('Rendering ClientDashboard');
        return (
          <ErrorBoundary>
            <AccessibilityProvider>
              <PerformanceProvider>
                <ClientDashboard user={user} onLogout={logout} />
              </PerformanceProvider>
            </AccessibilityProvider>
          </ErrorBoundary>
        );
      case 'employee_l1':
      case 'employee_l2':
      case 'employee_l3':
        console.log('Rendering EmployeeDashboard');
        return (
          <ErrorBoundary>
            <AccessibilityProvider>
              <PerformanceProvider>
                <EmployeeDashboard user={user} onLogout={logout} />
              </PerformanceProvider>
            </AccessibilityProvider>
          </ErrorBoundary>
        );
      case 'admin':
        console.log('Rendering AdminDashboard');
        return (
          <ErrorBoundary>
            <AccessibilityProvider>
              <PerformanceProvider>
                <AdminDashboard user={user} onLogout={logout} />
              </PerformanceProvider>
            </AccessibilityProvider>
          </ErrorBoundary>
        );
      default:
        console.error('Unknown user role:', user.role);
        return (
          <ErrorBoundary>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Unknown User Role</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Role: {user.role}</p>
                <button
                  onClick={logout}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </ErrorBoundary>
        );
    }
  } catch (error) {
    console.error('Error rendering dashboard:', error);
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Please try logging in again</p>
            <button
              onClick={logout}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Back to Login
            </button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }
}

export default App;