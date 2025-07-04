import React from 'react';
import { User } from '../../types/user';
import { EmployeeL1Dashboard } from './EmployeeL1Dashboard';
import { EmployeeL2Dashboard } from './EmployeeL2Dashboard';
import { EmployeeL3Dashboard } from './EmployeeL3Dashboard';

interface EmployeeDashboardProps {
  user: User;
  onLogout: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user, onLogout }) => {
  // Route to appropriate level-specific dashboard
  switch (user.role) {
    case 'employee_l1':
      return <EmployeeL1Dashboard user={user} onLogout={onLogout} />;
    case 'employee_l2':
      return <EmployeeL2Dashboard user={user} onLogout={onLogout} />;
    case 'employee_l3':
      return <EmployeeL3Dashboard user={user} onLogout={onLogout} />;
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Unknown Employee Level</h1>
            <p className="text-gray-600 mb-4">Role: {user.role}</p>
            <button
              onClick={onLogout}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Back to Login
            </button>
          </div>
        </div>
      );
  }
};