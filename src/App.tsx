import React, { useEffect } from 'react';
import { LoginPage } from './components/Login/LoginPage';
import { ClientDashboard } from './components/Dashboard/ClientDashboard';
import { EmployeeDashboard } from './components/Dashboard/EmployeeDashboard';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './components/ThemeProvider';


function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

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
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated || !user) {
    console.log('Showing login page - not authenticated or no user');
    return (
      <ThemeProvider>
        <LoginPage />
      </ThemeProvider>
    );
  }

  // Route based on user role
  console.log('Routing user with role:', user.role);
  
  try {
    switch (user.role) {
      case 'client':
        console.log('Rendering ClientDashboard');
        return (
          <ThemeProvider>
            <ClientDashboard user={user} onLogout={logout} />
          </ThemeProvider>
        );
      case 'employee_l1':
      case 'employee_l2':
      case 'employee_l3':
        console.log('Rendering EmployeeDashboard');
        return (
          <ThemeProvider>
            <EmployeeDashboard user={user} onLogout={logout} />
          </ThemeProvider>
        );
      case 'admin':
        console.log('Rendering AdminDashboard');
        return (
          <ThemeProvider>
            <AdminDashboard user={user} onLogout={logout} />
          </ThemeProvider>
        );
      default:
        console.error('Unknown user role:', user.role);
        return (
          <ThemeProvider>
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
          </ThemeProvider>
        );
    }
  } catch (error) {
    console.error('Error rendering dashboard:', error);
    return (
      <ThemeProvider>
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
      </ThemeProvider>
    );
  }
}

export default App;