import React from 'react';
import { LoginPage } from './components/Login/LoginPage';
import { ClientDashboard } from './components/Dashboard/ClientDashboard';
import { EmployeeDashboard } from './components/Dashboard/EmployeeDashboard';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  // Route based on user role
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
      return <LoginPage />;
  }
}

export default App;