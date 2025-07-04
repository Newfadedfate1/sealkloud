import React, { useEffect } from 'react';
import { LoginPage } from './components/Login/LoginPage';
import { ClientDashboard } from './components/Dashboard/ClientDashboard';
import { EmployeeDashboard } from './components/Dashboard/EmployeeDashboard';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { useAuth } from './hooks/useAuth';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated || !user) {
    console.log('Showing login page - not authenticated or no user');
    return <LoginPage />;
  }

  // Route based on user role
  console.log('Routing user with role:', user.role);
  
  try {
    switch (user.role) {
      case 'client':
        console.log('Rendering ClientDashboard');
        return <ClientDashboard user={user} onLogout={logout} />;
      case 'employee_l1':
      case 'employee_l2':
      case 'employee_l3':
        console.log('Rendering EmployeeDashboard');
        return <EmployeeDashboard user={user} onLogout={logout} />;
      case 'admin':
        console.log('Rendering AdminDashboard');
        return <AdminDashboard user={user} onLogout={logout} />;
      default:
        console.error('Unknown user role:', user.role);
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Unknown User Role</h1>
              <p className="text-gray-600 mb-4">Role: {user.role}</p>
              <button
                onClick={logout}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Back to Login
              </button>
            </div>
          </div>
        );
    }
  } catch (error) {
    console.error('Error rendering dashboard:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-4">Please try logging in again</p>
          <button
            onClick={logout}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }
}

export default App;