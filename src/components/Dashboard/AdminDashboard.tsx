import React, { useState } from 'react';
import { Shield, Users, Ticket, BarChart3, Settings, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { User } from '../../types/user';
import { TicketStatsCard } from './TicketStatsCard';
import { ClientTicketChart } from './ClientTicketChart';
import { TicketTable } from './TicketTable';
import { UserManagementModal } from '../UserManagement/UserManagementModal';
import { mockTickets, getTicketStats, getClientTicketData } from '../../data/mockTickets';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [tickets, setTickets] = useState(mockTickets);
  
  const ticketStats = getTicketStats();
  const clientData = getClientTicketData();
  
  // Calculate additional admin metrics
  const avgResponseTime = 2.4; // hours
  const resolutionRate = 92; // percentage
  const activeUsers = 156;

  // Mock available users for ticket assignment
  const availableUsers = [
    { id: '1', email: 'client@sealkloud.com', firstName: 'John', lastName: 'Client', role: 'client' as const, companyId: 'sealkloud', isActive: true },
    { id: '2', email: 'employee@sealkloud.com', firstName: 'Jane', lastName: 'Employee', role: 'employee_l1' as const, companyId: 'sealkloud', isActive: true },
    { id: '3', email: 'admin@sealkloud.com', firstName: 'Admin', lastName: 'User', role: 'admin' as const, companyId: 'sealkloud', isActive: true },
    { id: '4', email: 'l2tech@sealkloud.com', firstName: 'Level 2', lastName: 'Tech', role: 'employee_l2' as const, companyId: 'sealkloud', isActive: true },
    { id: '5', email: 'l3expert@sealkloud.com', firstName: 'Level 3', lastName: 'Expert', role: 'employee_l3' as const, companyId: 'sealkloud', isActive: true }
  ];

  const handleTicketUpdate = (ticketId: string, updates: any) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-red-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">System Administration</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.firstName} {user.lastName}
              </span>
              <button
                onClick={onLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <TicketStatsCard
            title="Total Tickets"
            count={ticketStats.total}
            icon={Ticket}
            color="text-blue-600"
            bgColor="bg-blue-100"
            change="+12 from yesterday"
          />
          <TicketStatsCard
            title="Unassigned"
            count={ticketStats.unassigned}
            icon={AlertTriangle}
            color="text-red-600"
            bgColor="bg-red-100"
            change="Needs attention"
          />
          <TicketStatsCard
            title="In Progress"
            count={ticketStats.inProgress}
            icon={Clock}
            color="text-yellow-600"
            bgColor="bg-yellow-100"
            change="Active work"
          />
          <TicketStatsCard
            title="Resolved"
            count={ticketStats.resolved}
            icon={BarChart3}
            color="text-green-600"
            bgColor="bg-green-100"
            change="This period"
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <TicketStatsCard
            title="Active Users"
            count={activeUsers}
            icon={Users}
            color="text-purple-600"
            bgColor="bg-purple-100"
            change="All departments"
          />
          <TicketStatsCard
            title="Resolution Rate"
            count={resolutionRate}
            icon={TrendingUp}
            color="text-green-600"
            bgColor="bg-green-100"
            change="% This month"
          />
          <TicketStatsCard
            title="Avg Response"
            count={avgResponseTime}
            icon={Clock}
            color="text-orange-600"
            bgColor="bg-orange-100"
            change="hours (Target: 4h)"
          />
          <TicketStatsCard
            title="Open Tickets"
            count={ticketStats.open}
            icon={Ticket}
            color="text-sky-600"
            bgColor="bg-sky-100"
            change="Currently active"
          />
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* System Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">System Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database Status</span>
                  <span className="text-green-600 font-medium">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Sessions</span>
                  <span className="text-gray-900 font-medium">143</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Server Load</span>
                  <span className="text-yellow-600 font-medium">Moderate</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Backup</span>
                  <span className="text-gray-900 font-medium">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Uptime</span>
                  <span className="text-green-600 font-medium">99.9%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Distribution Chart */}
          <div className="lg:col-span-2">
            <ClientTicketChart data={clientData} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowUserManagement(true)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors"
            >
              <Users className="h-6 w-6" />
              <span className="text-sm font-medium">Manage Users</span>
            </button>
            <button className="bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm font-medium">View Reports</span>
            </button>
            <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors">
              <Settings className="h-6 w-6" />
              <span className="text-sm font-medium">System Settings</span>
            </button>
            <button className="bg-orange-50 hover:bg-orange-100 text-orange-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors">
              <Shield className="h-6 w-6" />
              <span className="text-sm font-medium">Security</span>
            </button>
          </div>
        </div>

        {/* Comprehensive Ticket Management Table */}
        <TicketTable 
          tickets={tickets} 
          isAdmin={true} 
          currentUser={user}
          availableUsers={availableUsers}
          onTicketUpdate={handleTicketUpdate}
        />
      </main>

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={showUserManagement}
        onClose={() => setShowUserManagement(false)}
        currentUser={user}
      />
    </div>
  );
};