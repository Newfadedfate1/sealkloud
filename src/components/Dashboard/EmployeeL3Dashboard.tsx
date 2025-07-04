import React, { useState } from 'react';
import { Zap, Ticket, Clock, CheckCircle, AlertTriangle, Shield, Search, MessageSquare, Database, Server, Code, Eye, CheckSquare } from 'lucide-react';
import { User as UserType } from '../../types/user';
import { TicketStatsCard } from './TicketStatsCard';
import { TicketDetailModal } from '../TicketDetail/TicketDetailModal';
import { mockTickets, getTicketStats } from '../../data/mockTickets';

interface EmployeeL3DashboardProps {
  user: UserType;
  onLogout: () => void;
}

export const EmployeeL3Dashboard: React.FC<EmployeeL3DashboardProps> = ({ user, onLogout }) => {
  const [tickets, setTickets] = useState(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter tickets for L3 - critical issues and complex problems
  const myTickets = tickets.filter(ticket => ticket.assignedTo === user.id);
  const criticalTickets = tickets.filter(ticket => 
    (ticket.status === 'unassigned' && ticket.problemLevel === 'critical') ||
    (ticket.problemLevel === 'high' && ticket.status !== 'resolved')
  );
  
  const userStats = {
    assigned: myTickets.length,
    critical: tickets.filter(t => t.problemLevel === 'critical' && t.status !== 'resolved').length,
    resolved: myTickets.filter(t => t.status === 'resolved').length,
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
    setSelectedTicket(null);
  };

  const handleTakeTicket = (ticketId: string) => {
    handleTicketUpdate(ticketId, { 
      assignedTo: user.id, 
      assignedToName: `${user.firstName} ${user.lastName}`,
      status: 'in-progress',
      lastUpdated: new Date()
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'unassigned': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'in-progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredMyTickets = myTickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Level 3 Expert Support</h1>
                <p className="text-sm text-gray-600">Welcome back, {user.firstName}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Simple Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{userStats.assigned}</div>
            <div className="text-sm text-gray-600">My Cases</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-red-600">{userStats.critical}</div>
            <div className="text-sm text-gray-600">Critical Issues</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{userStats.resolved}</div>
            <div className="text-sm text-gray-600">Resolved Today</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{userStats.consulting}</div>
            <div className="text-sm text-gray-600">Consulting</div>
          </div>
        </div>

        {/* Critical Issues Alert */}
        {criticalTickets.filter(t => t.problemLevel === 'critical' && t.status !== 'resolved').length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h2 className="text-lg font-bold text-red-900">Critical Issues Requiring Expert Attention</h2>
            </div>
            <div className="space-y-4">
              {tickets
                .filter(t => t.problemLevel === 'critical' && t.status !== 'resolved')
                .map(ticket => (
                  <div key={ticket.id} className="bg-white border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono font-medium text-gray-900">{ticket.id}</span>
                          <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-200">
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
                          <span className="bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm font-medium border border-red-200">
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
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expert Cases - Left Column */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">My Expert Cases</h2>
                  <p className="text-sm text-gray-600 mt-1">Critical and complex issues assigned to you</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm w-48"
                  />
                </div>
              </div>
            </div>
            <div className="p-6">
              {filteredMyTickets.length > 0 ? (
                <div className="space-y-4">
                  {filteredMyTickets.map(ticket => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm font-medium text-gray-600">{ticket.id}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(ticket.problemLevel)}`}>
                              {ticket.problemLevel.charAt(0).toUpperCase() + ticket.problemLevel.slice(1)}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">{ticket.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{ticket.clientName}</p>
                          <div className="text-xs text-gray-400">
                            Updated {ticket.lastUpdated.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </button>
                          {ticket.status === 'in-progress' && (
                            <button
                              onClick={() => handleTicketUpdate(ticket.id, { status: 'resolved', resolvedDate: new Date(), lastUpdated: new Date() })}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                            >
                              <CheckSquare className="h-3 w-3" />
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  {myTickets.length === 0 ? (
                    <>
                      <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No expert cases assigned</p>
                      <p className="text-sm text-gray-400 mt-1">Monitor critical issues above</p>
                    </>
                  ) : (
                    <>
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No matching cases</p>
                      <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* System Status & Tools - Right Column */}
          <div className="space-y-6">
            {/* System Overview */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">System Overview</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Database Status</span>
                    <span className="text-green-600 font-medium">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Active Sessions</span>
                    <span className="text-gray-900 font-medium">143</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Server Load</span>
                    <span className="text-yellow-600 font-medium">Moderate</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Last Backup</span>
                    <span className="text-gray-900 font-medium">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Uptime</span>
                    <span className="text-green-600 font-medium">99.9%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expert Tools */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Expert Tools</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-red-50 hover:bg-red-100 text-red-700 p-3 rounded-lg flex flex-col items-center gap-2 transition-colors">
                    <Server className="h-5 w-5" />
                    <span className="text-xs font-medium">Infrastructure</span>
                  </button>
                  <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg flex flex-col items-center gap-2 transition-colors">
                    <Database className="h-5 w-5" />
                    <span className="text-xs font-medium">Database</span>
                  </button>
                  <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-3 rounded-lg flex flex-col items-center gap-2 transition-colors">
                    <Code className="h-5 w-5" />
                    <span className="text-xs font-medium">Code Review</span>
                  </button>
                  <button className="bg-orange-50 hover:bg-orange-100 text-orange-700 p-3 rounded-lg flex flex-col items-center gap-2 transition-colors">
                    <Shield className="h-5 w-5" />
                    <span className="text-xs font-medium">Security</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expert Guidelines */}
        <div className="mt-8 bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 p-2 rounded-lg">
              <Zap className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-red-900 mb-2">Level 3 Expert Responsibilities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-red-800">
                <div>
                  <h4 className="font-medium mb-1">Critical Issues:</h4>
                  <ul className="space-y-1 text-red-700">
                    <li>• System outages and downtime</li>
                    <li>• Security incidents and breaches</li>
                    <li>• Infrastructure failures</li>
                    <li>• Complex technical problems</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Expert Duties:</h4>
                  <ul className="space-y-1 text-red-700">
                    <li>• Provide technical guidance</li>
                    <li>• Mentor L1/L2 teams</li>
                    <li>• System architecture decisions</li>
                    <li>• Emergency response leadership</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleTicketUpdate}
          currentUser={user}
          availableUsers={availableUsers}
        />
      )}
    </div>
  );
};