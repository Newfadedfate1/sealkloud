import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, User, FileText, Shield } from 'lucide-react';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  resource: string;
  details: string;
  ip?: string;
}

const mockAuditLogs: AuditLogEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    user: 'admin@sealkloud.com',
    action: 'LOGIN',
    resource: 'User',
    details: 'Successful login',
    ip: '192.168.1.10',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    user: 'employee@sealkloud.com',
    action: 'TICKET_UPDATE',
    resource: 'Ticket TK-001',
    details: 'Status changed to In Progress',
    ip: '192.168.1.11',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    user: 'admin@sealkloud.com',
    action: 'USER_ROLE_CHANGE',
    resource: 'User employee@sealkloud.com',
    details: 'Role changed to employee_l2',
    ip: '192.168.1.10',
  },
];

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<AuditLogEntry[]>(mockAuditLogs);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(logs);
    } else {
      setFiltered(
        logs.filter(
          (log) =>
            log.user.toLowerCase().includes(search.toLowerCase()) ||
            log.action.toLowerCase().includes(search.toLowerCase()) ||
            log.resource.toLowerCase().includes(search.toLowerCase()) ||
            log.details.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, logs]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Audit Log</h2>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search logs by user, action, resource, or details..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Time</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">User</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Action</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Resource</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Details</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">IP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No audit log entries found.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {log.timestamp.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4 text-blue-500" />
                      {log.user}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{log.action}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{log.resource}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{log.details}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{log.ip || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 