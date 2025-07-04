import React, { useState } from 'react';
import { Shield, Users, Ticket, BarChart3, Settings, TrendingUp, Clock, AlertTriangle, Activity, Database, Server, Eye, Filter } from 'lucide-react';
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
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  
  const ticketStats = getTicketStats();
  const clientData = getClientTicketData();
  
  // Enhanced admin metrics with trends
  const metrics = {
    tickets: {
      total: ticketStats.total,
      open: ticketStats.open,
      unassigned: ticketStats.unassigned,
      resolved: ticketStats.resolved,
      trend: '+12%',
      avgResolutionTime: 4.2
    },
    performance: {
      resolutionRate: 92,
      avgResponseTime: 2.4,
      slaCompliance: 98.5,
      customerSatisfaction: 4.6
    },
    system: {
      activeUsers: 156,
      uptime: 99.9,
      serverLoad: 65,
      activeSessions: 143
    }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
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
                <p className="text-sm text-gray-600">System Administration & Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Timeframe:</span>
                <select 
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
                >
                  <option value="24h">Last 24h</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
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
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <TicketStatsCard
            title="Total Tickets"
            count={metrics.tickets.total}
            icon={Ticket}
            color="text-blue-600"
            bgColor="bg-blue-100"
            change={metrics.tickets.trend}
          />
          <TicketStatsCard
            title="Resolution Rate"
            count={metrics.performance.resolutionRate}
            icon={TrendingUp}
            color="text-green-600"
            bgColor="bg-green-100"
            change="% This month"
          />
          <TicketStatsCard
            title="Avg Response Time"
            count={metrics.performance.avgResponseTime}
            icon={Clock}
            color="text-orange-600"
            bgColor="bg-orange-100"
            change="hours (Target: 4h)"
          />
          <TicketStatsCard
            title="System Uptime"
            count={metrics.system.uptime}
            icon={Activity}
            color="text-purple-600"
            bgColor="bg-purple-100"
            change="% Availability"
          />
        </div>

        {/* Critical Alerts & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Critical Issues */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Critical Issues</h2>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="space-y-3">
                {metrics.tickets.unassigned > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-900">{metrics.tickets.unassigned} Unassigned Tickets</p>
                      <p className="text-sm text-red-600">Requires immediate attention</p>
                    </div>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                      View →
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-yellow-900">Server Load: {metrics.system.serverLoad}%</p>
                    <p className="text-sm text-yellow-600">Moderate - Monitor closely</p>
                  </div>
                  <button className="text-yellow-600 hover:text-yellow-800 text-sm font-medium">
                    Details →
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900">SLA Compliance: {metrics.performance.slaCompliance}%</p>
                    <p className="text-sm text-blue-600">Above target threshold</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Report →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600">Database</span>
                  </div>
                  <span className="text-green-600 font-medium">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-yellow-500" />
                    <span className="text-gray-600">Server Load</span>
                  </div>
                  <span className="text-yellow-600 font-medium">{metrics.system.serverLoad}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-600">Active Sessions</span>
                  </div>
                  <span className="text-gray-900 font-medium">{metrics.system.activeSessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-500" />
                    <span className="text-gray-600">Active Users</span>
                  </div>
                  <span className="text-gray-900 font-medium">{metrics.system.activeUsers}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Customer Satisfaction</span>
                    <span className="font-medium">{metrics.performance.customerSatisfaction}/5.0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(metrics.performance.customerSatisfaction / 5) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Avg Resolution Time</span>
                    <span className="font-medium">{metrics.tickets.avgResolutionTime}h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((metrics.tickets.avgResolutionTime / 8) * 100, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Ticket Volume Trend</span>
                    <span className="font-medium text-green-600">{metrics.tickets.trend}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Client Ticket Distribution</h2>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white">
                <option>All Clients</option>
                <option>Top 5</option>
                <option>Active Only</option>
              </select>
            </div>
          </div>
          <ClientTicketChart data={clientData} />
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
              <span className="text-sm font-medium">Analytics</span>
            </button>
            <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors">
              <Settings className="h-6 w-6" />
              <span className="text-sm font-medium">Settings</span>
            </button>
            <button className="bg-orange-50 hover:bg-orange-100 text-orange-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors">
              <Eye className="h-6 w-6" />
              <span className="text-sm font-medium">Audit Log</span>
            </button>
          </div>
        </div>

        {/* Enhanced Ticket Management Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Ticket Management</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Showing {tickets.length} tickets</span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Export Data →
                </button>
              </div>
            </div>
          </div>
          <TicketTable 
            tickets={tickets} 
            isAdmin={true} 
            currentUser={user}
            availableUsers={availableUsers}
            onTicketUpdate={handleTicketUpdate}
          />
        </div>
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