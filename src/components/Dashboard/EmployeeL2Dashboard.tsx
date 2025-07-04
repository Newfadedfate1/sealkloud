import React, { useState } from 'react';
import { Settings, Ticket, Clock, CheckCircle, AlertTriangle, Zap, Search, MessageSquare, Database, ArrowUp, ArrowDown, Eye, Play, CheckSquare } from 'lucide-react';
import { User as UserType } from '../../types/user';
import { TicketStatsCard } from './TicketStatsCard';
import { TicketDetailModal } from '../TicketDetail/TicketDetailModal';
import { mockTickets, getTicketStats } from '../../data/mockTickets';

interface EmployeeL2DashboardProps {
  user: UserType;
  onLogout: () => void;
}

export const EmployeeL2Dashboard: React.FC<EmployeeL2DashboardProps> = ({ user, onLogout }) => {
  const [tickets, setTickets] = useState(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter tickets for L2 - medium/high priority and escalated tickets
  const myTickets = tickets.filter(ticket => ticket.assignedTo === user.id);
  const escalatedTickets = tickets.filter(ticket => 
    ticket.status === 'unassigned' && ['medium', 'high'].includes(ticket.problemLevel)
  );
  
  const userStats = {
    assigned: myTickets.length,
    inProgress: myTickets.filter(t => t.status === 'in-progress').length,
    resolved: myTickets.filter(t => t.status === 'resolved').length,
    escalated: escalatedTickets.length
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
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Settings className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Level 2 Technical Support</h1>
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
            <div className="text-sm text-gray-600">My Tickets</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{userStats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{userStats.resolved}</div>
            <div className="text-sm text-gray-600">Resolved Today</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{userStats.escalated}</div>
            <div className="text-sm text-gray-600">Escalated</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Escalated Tickets - Left Column */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Escalated Tickets</h2>
              <p className="text-sm text-gray-600 mt-1">Medium to high complexity technical issues</p>
            </div>
            <div className="p-6">
              {escalatedTickets.length > 0 ? (
                <div className="space-y-4">
                  {escalatedTickets.slice(0, 5).map(ticket => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm font-medium text-gray-600">{ticket.id}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(ticket.problemLevel)}`}>
                              {ticket.problemLevel.charAt(0).toUpperCase() + ticket.problemLevel.slice(1)}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">{ticket.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{ticket.clientName}</p>
                          <p className="text-sm text-gray-500 line-clamp-2">{ticket.description}</p>
                          <div className="text-xs text-gray-400 mt-2">
                            Created {ticket.submittedDate.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          <button
                            onClick={() => handleTakeTicket(ticket.id)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Take
                          </button>
                          <div className="flex gap-1">
                            {ticket.problemLevel === 'high' && (
                              <button
                                onClick={() => handleEscalateToL3(ticket.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                              >
                                <ArrowUp className="h-3 w-3" />
                                L3
                              </button>
                            )}
                            {ticket.problemLevel === 'medium' && (
                              <button
                                onClick={() => handleDelegateToL1(ticket.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
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
                  <p className="text-gray-500">No escalated tickets</p>
                  <p className="text-sm text-gray-400 mt-1">All technical issues are under control</p>
                </div>
              )}
            </div>
          </div>

          {/* My Tickets - Right Column */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">My Technical Tickets</h2>
                  <p className="text-sm text-gray-600 mt-1">Advanced technical issues assigned to you</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm w-48"
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
                      <p className="text-gray-500">No tickets assigned</p>
                      <p className="text-sm text-gray-400 mt-1">Take some tickets from the escalated list</p>
                    </>
                  ) : (
                    <>
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No matching tickets</p>
                      <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Technical Tools & Guidelines */}
        <div className="mt-8 bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-start gap-4">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Database className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-yellow-900 mb-2">Level 2 Technical Guidelines</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
                <div>
                  <h4 className="font-medium mb-1">Your Expertise:</h4>
                  <ul className="space-y-1 text-yellow-700">
                    <li>• System configuration issues</li>
                    <li>• Database performance problems</li>
                    <li>• Network connectivity issues</li>
                    <li>• Software troubleshooting</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Escalation Rules:</h4>
                  <ul className="space-y-1 text-yellow-700">
                    <li>• Critical system outages → L3</li>
                    <li>• Security incidents → L3</li>
                    <li>• Simple issues → L1</li>
                    <li>• Infrastructure problems → L3</li>
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