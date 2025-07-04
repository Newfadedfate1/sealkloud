import React, { useState } from 'react';
import { Users, Ticket, Clock, CheckCircle, AlertTriangle, Plus, Search, Filter, MessageSquare, User, ArrowRight } from 'lucide-react';
import { User as UserType } from '../../types/user';
import { TicketStatsCard } from './TicketStatsCard';
import { TicketTable } from './TicketTable';
import { mockTickets, getTicketStats } from '../../data/mockTickets';

interface EmployeeL1DashboardProps {
  user: UserType;
  onLogout: () => void;
}

export const EmployeeL1Dashboard: React.FC<EmployeeL1DashboardProps> = ({ user, onLogout }) => {
  const [tickets, setTickets] = useState(mockTickets);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  
  const ticketStats = getTicketStats();
  
  // Filter tickets for L1 - basic tickets and unassigned
  const l1Tickets = tickets.filter(ticket => 
    ticket.assignedTo === user.id || 
    (ticket.status === 'unassigned' && ['low', 'medium'].includes(ticket.problemLevel))
  );
  
  const userStats = {
    assigned: l1Tickets.filter(t => t.assignedTo === user.id).length,
    inProgress: l1Tickets.filter(t => t.status === 'in-progress' && t.assignedTo === user.id).length,
    resolved: l1Tickets.filter(t => t.status === 'resolved' && t.assignedTo === user.id).length,
    available: tickets.filter(t => t.status === 'unassigned' && ['low', 'medium'].includes(t.problemLevel)).length
  };

  const availableUsers = [
    { id: '2', email: 'employee@sealkloud.com', firstName: 'Jane', lastName: 'Employee', role: 'employee_l1' as const, companyId: 'sealkloud', isActive: true },
    { id: '4', email: 'l2tech@sealkloud.com', firstName: 'Level 2', lastName: 'Tech', role: 'employee_l2' as const, companyId: 'sealkloud', isActive: true },
    { id: '5', email: 'l3expert@sealkloud.com', firstName: 'Level 3', lastName: 'Expert', role: 'employee_l3' as const, companyId: 'sealkloud', isActive: true }
  ];

  const handleTicketUpdate = (ticketId: string, updates: any) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    ));
  };

  const handleTakeTicket = (ticketId: string) => {
    handleTicketUpdate(ticketId, { 
      assignedTo: user.id, 
      assignedToName: `${user.firstName} ${user.lastName}`,
      status: 'in-progress',
      lastUpdated: new Date()
    });
  };

  const handleEscalateTicket = (ticketId: string) => {
    const l2User = availableUsers.find(u => u.role === 'employee_l2');
    if (l2User) {
      handleTicketUpdate(ticketId, {
        assignedTo: l2User.id,
        assignedToName: `${l2User.firstName} ${l2User.lastName}`,
        lastUpdated: new Date()
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Level 1 Support Dashboard</h1>
                <p className="text-sm text-gray-600">Basic Issue Resolution & Customer Support</p>
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
            color="text-green-600"
            bgColor="bg-green-100"
            change="Currently handling"
          />
          <TicketStatsCard
            title="In Progress"
            count={userStats.inProgress}
            icon={Clock}
            color="text-yellow-600"
            bgColor="bg-yellow-100"
            change="Active work"
          />
          <TicketStatsCard
            title="Resolved Today"
            count={userStats.resolved}
            icon={CheckCircle}
            color="text-blue-600"
            bgColor="bg-blue-100"
            change="Completed"
          />
          <TicketStatsCard
            title="Available"
            count={userStats.available}
            icon={AlertTriangle}
            color="text-orange-600"
            bgColor="bg-orange-100"
            change="Can take"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowNewTicketForm(true)}
              className="bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors"
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm font-medium">Create Ticket</span>
            </button>
            <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors">
              <Search className="h-6 w-6" />
              <span className="text-sm font-medium">Search Tickets</span>
            </button>
            <button className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors">
              <MessageSquare className="h-6 w-6" />
              <span className="text-sm font-medium">Knowledge Base</span>
            </button>
            <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors">
              <User className="h-6 w-6" />
              <span className="text-sm font-medium">Customer Info</span>
            </button>
          </div>
        </div>

        {/* Available Tickets to Take */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Available Tickets (Low-Medium Priority)</h2>
            <p className="text-sm text-gray-600 mt-1">Tickets you can take and resolve</p>
          </div>
          <div className="p-6">
            {tickets.filter(t => t.status === 'unassigned' && ['low', 'medium'].includes(t.problemLevel)).length > 0 ? (
              <div className="space-y-4">
                {tickets
                  .filter(t => t.status === 'unassigned' && ['low', 'medium'].includes(t.problemLevel))
                  .slice(0, 3)
                  .map(ticket => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-gray-900">{ticket.id}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              ticket.problemLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {ticket.problemLevel.charAt(0).toUpperCase() + ticket.problemLevel.slice(1)}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">{ticket.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{ticket.clientName}</p>
                          <p className="text-sm text-gray-500 line-clamp-2">{ticket.description}</p>
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          <button
                            onClick={() => handleTakeTicket(ticket.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Take Ticket
                          </button>
                          {ticket.problemLevel === 'medium' && (
                            <button
                              onClick={() => handleEscalateTicket(ticket.id)}
                              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                            >
                              <ArrowRight className="h-3 w-3" />
                              Escalate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-500">No available tickets at your level</p>
                <p className="text-sm text-gray-400 mt-1">Great job! All basic tickets are handled</p>
              </div>
            )}
          </div>
        </div>

        {/* My Tickets Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Tickets</h2>
            <p className="text-sm text-gray-600 mt-1">Tickets assigned to you</p>
          </div>
          <TicketTable 
            tickets={l1Tickets.filter(t => t.assignedTo === user.id)} 
            isAdmin={false} 
            currentUser={user}
            availableUsers={availableUsers}
            onTicketUpdate={handleTicketUpdate}
          />
        </div>
      </main>
    </div>
  );
};