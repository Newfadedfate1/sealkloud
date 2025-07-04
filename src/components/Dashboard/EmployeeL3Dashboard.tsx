import React, { useState } from 'react';
import { Zap, Ticket, Clock, CheckCircle, AlertTriangle, Shield, Search, Filter, MessageSquare, Database, Server, Code } from 'lucide-react';
import { User as UserType } from '../../types/user';
import { TicketStatsCard } from './TicketStatsCard';
import { TicketTable } from './TicketTable';
import { mockTickets, getTicketStats } from '../../data/mockTickets';

interface EmployeeL3DashboardProps {
  user: UserType;
  onLogout: () => void;
}

export const EmployeeL3Dashboard: React.FC<EmployeeL3DashboardProps> = ({ user, onLogout }) => {
  const [tickets, setTickets] = useState(mockTickets);
  
  const ticketStats = getTicketStats();
  
  // Filter tickets for L3 - critical issues and complex problems
  const l3Tickets = tickets.filter(ticket => 
    ticket.assignedTo === user.id || 
    (ticket.status === 'unassigned' && ticket.problemLevel === 'critical') ||
    (ticket.problemLevel === 'high' && ticket.status !== 'resolved')
  );
  
  const userStats = {
    assigned: l3Tickets.filter(t => t.assignedTo === user.id).length,
    critical: tickets.filter(t => t.problemLevel === 'critical' && t.status !== 'resolved').length,
    resolved: l3Tickets.filter(t => t.status === 'resolved' && t.assignedTo === user.id).length,
    consulting: tickets.filter(t => t.problemLevel === 'high' && t.status === 'in-progress').length
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Level 3 Expert Support</h1>
                <p className="text-sm text-gray-600">Critical Issues & Complex Problem Resolution</p>
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
            color="text-red-600"
            bgColor="bg-red-100"
            change="Expert level"
          />
          <TicketStatsCard
            title="Critical Issues"
            count={userStats.critical}
            icon={AlertTriangle}
            color="text-red-600"
            bgColor="bg-red-100"
            change="Urgent attention"
          />
          <TicketStatsCard
            title="Resolved Today"
            count={userStats.resolved}
            icon={CheckCircle}
            color="text-green-600"
            bgColor="bg-green-100"
            change="Complex solved"
          />
          <TicketStatsCard
            title="Consulting"
            count={userStats.consulting}
            icon={MessageSquare}
            color="text-purple-600"
            bgColor="bg-purple-100"
            change="Advising teams"
          />
        </div>

        {/* Expert Tools */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Expert Tools & Systems</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-red-50 hover:bg-red-100 text-red-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors">
              <Server className="h-6 w-6" />
              <span className="text-sm font-medium">Infrastructure</span>
            </button>
            <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors">
              <Database className="h-6 w-6" />
              <span className="text-sm font-medium">Database Admin</span>
            </button>
            <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors">
              <Code className="h-6 w-6" />
              <span className="text-sm font-medium">Code Review</span>
            </button>
            <button className="bg-orange-50 hover:bg-orange-100 text-orange-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors">
              <Shield className="h-6 w-6" />
              <span className="text-sm font-medium">Security Audit</span>
            </button>
          </div>
        </div>

        {/* Critical Issues Alert */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">Critical Issues Requiring Expert Attention</h2>
          </div>
          {tickets.filter(t => t.problemLevel === 'critical' && t.status !== 'resolved').length > 0 ? (
            <div className="space-y-4">
              {tickets
                .filter(t => t.problemLevel === 'critical' && t.status !== 'resolved')
                .map(ticket => (
                  <div key={ticket.id} className="bg-white border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900">{ticket.id}</span>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            CRITICAL
                          </span>
                          <span className="text-xs text-gray-500">
                            {ticket.submittedDate.toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">{ticket.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{ticket.clientName}</p>
                        <p className="text-sm text-gray-500">{ticket.description}</p>
                      </div>
                      <div className="ml-4">
                        {ticket.assignedTo === user.id ? (
                          <span className="bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm font-medium">
                            Assigned to You
                          </span>
                        ) : (
                          <button
                            onClick={() => handleTakeTicket(ticket.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Take Ownership
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
              <p className="text-green-700 font-medium">No critical issues at this time</p>
              <p className="text-sm text-green-600 mt-1">All systems operating normally</p>
            </div>
          )}
        </div>

        {/* Knowledge Base & Documentation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expert Knowledge Base</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">System Architecture Docs</span>
                <span className="text-sm text-gray-500">Updated 2h ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Security Protocols</span>
                <span className="text-sm text-gray-500">Updated 1d ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Escalation Procedures</span>
                <span className="text-sm text-gray-500">Updated 3d ago</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Consultation</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-700">L2 Team - Database Issue</span>
                <span className="text-sm text-blue-600">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-yellow-700">L1 Team - Network Config</span>
                <span className="text-sm text-yellow-600">Pending</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-700">Admin - Security Review</span>
                <span className="text-sm text-green-600">Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* My Expert Tickets Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Expert Cases</h2>
            <p className="text-sm text-gray-600 mt-1">Critical and complex issues requiring expert resolution</p>
          </div>
          <TicketTable 
            tickets={l3Tickets.filter(t => t.assignedTo === user.id)} 
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