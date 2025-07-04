import React, { useState } from 'react';
import { Settings, Ticket, Clock, CheckCircle, AlertTriangle, Zap, Search, Filter, MessageSquare, Database, ArrowUp, ArrowDown } from 'lucide-react';
import { User as UserType } from '../../types/user';
import { TicketStatsCard } from './TicketStatsCard';
import { TicketTable } from './TicketTable';
import { mockTickets, getTicketStats } from '../../data/mockTickets';

interface EmployeeL2DashboardProps {
  user: UserType;
  onLogout: () => void;
}

export const EmployeeL2Dashboard: React.FC<EmployeeL2DashboardProps> = ({ user, onLogout }) => {
  const [tickets, setTickets] = useState(mockTickets);
  
  const ticketStats = getTicketStats();
  
  // Filter tickets for L2 - medium/high priority and escalated tickets
  const l2Tickets = tickets.filter(ticket => 
    ticket.assignedTo === user.id || 
    (ticket.status === 'unassigned' && ['medium', 'high'].includes(ticket.problemLevel))
  );
  
  const userStats = {
    assigned: l2Tickets.filter(t => t.assignedTo === user.id).length,
    inProgress: l2Tickets.filter(t => t.status === 'in-progress' && t.assignedTo === user.id).length,
    resolved: l2Tickets.filter(t => t.status === 'resolved' && t.assignedTo === user.id).length,
    escalated: tickets.filter(t => t.status === 'unassigned' && ['medium', 'high'].includes(t.problemLevel)).length
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

  const handleEscalateToL3 = (ticketId: string) => {
    const l3User = availableUsers.find(u => u.role === 'employee_l3');
    if (l3User) {
      handleTicketUpdate(ticketId, {
        assignedTo: l3User.id,
        assignedToName: `${l3User.firstName} ${l3User.lastName}`,
        lastUpdated: new Date()
      });
    }
  };

  const handleDelegateToL1 = (ticketId: string) => {
    const l1User = availableUsers.find(u => u.role === 'employee_l1');
    if (l1User) {
      handleTicketUpdate(ticketId, {
        assignedTo: l1User.id,
        assignedToName: `${l1User.firstName} ${l1User.lastName}`,
        problemLevel: 'medium',
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
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Settings className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Level 2 Technical Support</h1>
                <p className="text-sm text-gray-600">Advanced Technical Issues & System Administration</p>
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
            color="text-yellow-600"
            bgColor="bg-yellow-100"
            change="Technical issues"
          />
          <TicketStatsCard
            title="In Progress"
            count={userStats.inProgress}
            icon={Clock}
            color="text-orange-600"
            bgColor="bg-orange-100"
            change="Active work"
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
            title="Escalated"
            count={userStats.escalated}
            icon={AlertTriangle}
            color="text-red-600"
            bgColor="bg-red-100"
            change="Need attention"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Technical Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors">
              <Database className="h-6 w-6" />
              <span className="text-sm font-medium">System Monitor</span>
            </button>
            <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors">
              <Search className="h-6 w-6" />
              <span className="text-sm font-medium">Log Analysis</span>
            </button>
            <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors">
              <MessageSquare className="h-6 w-6" />
              <span className="text-sm font-medium">Tech Docs</span>
            </button>
            <button className="bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors">
              <Zap className="h-6 w-6" />
              <span className="text-sm font-medium">Remote Access</span>
            </button>
          </div>
        </div>

        {/* Escalated Tickets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Escalated & High Priority Tickets</h2>
            <p className="text-sm text-gray-600 mt-1">Medium to high complexity technical issues</p>
          </div>
          <div className="p-6">
            {tickets.filter(t => t.status === 'unassigned' && ['medium', 'high'].includes(t.problemLevel)).length > 0 ? (
              <div className="space-y-4">
                {tickets
                  .filter(t => t.status === 'unassigned' && ['medium', 'high'].includes(t.problemLevel))
                  .slice(0, 3)
                  .map(ticket => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-gray-900">{ticket.id}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              ticket.problemLevel === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
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
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Take Ticket
                          </button>
                          <div className="flex gap-1">
                            {ticket.problemLevel === 'high' && (
                              <button
                                onClick={() => handleEscalateToL3(ticket.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                              >
                                <ArrowUp className="h-3 w-3" />
                                L3
                              </button>
                            )}
                            {ticket.problemLevel === 'medium' && (
                              <button
                                onClick={() => handleDelegateToL1(ticket.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                              >
                                <ArrowDown className="h-3 w-3" />
                                L1
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-500">No escalated tickets pending</p>
                <p className="text-sm text-gray-400 mt-1">All technical issues are under control</p>
              </div>
            )}
          </div>
        </div>

        {/* My Tickets Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Technical Tickets</h2>
            <p className="text-sm text-gray-600 mt-1">Advanced technical issues assigned to you</p>
          </div>
          <TicketTable 
            tickets={l2Tickets.filter(t => t.assignedTo === user.id)} 
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