import React from 'react';
import { LoginPage } from './components/Login/LoginPage';
import { ClientDashboard } from './components/Dashboard/ClientDashboard';
import { EmployeeDashboard } from './components/Dashboard/EmployeeDashboard';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

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
    return <LoginPage />;
  }

  // Route based on user role
  console.log('Routing user with role:', user.role);
  
  switch (user.role) {
    case 'client':
      return <ClientDashboard user={user} onLogout={logout} />;
    case 'employee_l1':
    case 'employee_l2':
    case 'employee_l3':
      return <EmployeeDashboard user={user} onLogout={logout} />;
    case 'admin':
      return <AdminDashboard user={user} onLogout={logout} />;
    default:
      console.error('Unknown user role:', user.role);
      return <LoginPage />;
  }
}

export default App;