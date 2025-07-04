import React, { useState } from 'react';
import { Users, Ticket, BarChart3, Settings, Clock, CheckCircle } from 'lucide-react';
import { User } from '../../types/user';
import { TicketStatsCard } from './TicketStatsCard';
import { ClientTicketChart } from './ClientTicketChart';
import { TicketTable } from './TicketTable';
import { mockTickets, getTicketStats, getClientTicketData } from '../../data/mockTickets';

interface EmployeeDashboardProps {
  user: User;
  onLogout: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user, onLogout }) => {
  const [tickets, setTickets] = useState(mockTickets);
  
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'employee_l1':
        return 'Level 1 Support';
      case 'employee_l2':
        return 'Level 2 Support';
      case 'employee_l3':
        return 'Level 3 Support';
      default:
        return 'Employee';
    }
  };

  const ticketStats = getTicketStats();
  const clientData = getClientTicketData();
  
  // Filter tickets assigned to current user
  const userTickets = tickets.filter(ticket => ticket.assignedTo === user.id);
  const userStats = {
    assigned: userTickets.length,
    inProgress: userTickets.filter(t => t.status === 'in-progress').length,
    resolved: userTickets.filter(t => t.status === 'resolved').length,
    pending: userTickets.filter(t => t.status === 'open').length
  };

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
              <Users className="h-8 w-8 text-sky-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Employee Dashboard</h1>
                <p className="text-sm text-gray-600">{getRoleDisplay(user.role)}</p>
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
        {/* Personal Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <TicketStatsCard
            title="My Assigned"
            count={userStats.assigned}
            icon={Ticket}
            color="text-sky-600"
            bgColor="bg-sky-100"
            change="Total assigned"
          />
          <TicketStatsCard
            title="In Progress"
            count={userStats.inProgress}
            icon={Clock}
            color="text-yellow-600"
            bgColor="bg-yellow-100"
            change="Currently working"
          />
          <TicketStatsCard
            title="Resolved Today"
            count={userStats.resolved}
            icon={CheckCircle}
            color="text-green-600"
            bgColor="bg-green-100"
            change="Completed"
          />
          <TicketStatsCard
            title="Pending Review"
            count={userStats.pending}
            icon={Settings}
            color="text-purple-600"
            bgColor="bg-purple-100"
            change="Needs attention"
          />
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* System Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">System Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Open</span>
                  <span className="text-gray-900 font-medium">{ticketStats.open}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Unassigned</span>
                  <span className="text-red-600 font-medium">{ticketStats.unassigned}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">In Progress</span>
                  <span className="text-yellow-600 font-medium">{ticketStats.inProgress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Resolved</span>
                  <span className="text-green-600 font-medium">{ticketStats.resolved}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Distribution Chart */}
          <div className="lg:col-span-2">
            <ClientTicketChart data={clientData} />
          </div>
        </div>

        {/* Ticket Management Table */}
        <TicketTable 
          tickets={tickets} 
          isAdmin={false} 
          currentUser={user}
          availableUsers={availableUsers}
          onTicketUpdate={handleTicketUpdate}
        />
      </main>
    </div>
  );
};