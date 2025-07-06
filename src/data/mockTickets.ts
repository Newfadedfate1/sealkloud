import { Ticket, TicketStats, ClientTicketData } from '../types/ticket';

export const mockTickets: Ticket[] = [
  {
    id: 'TK-001',
    clientName: 'ARCHEAN',
    clientId: 'client-1',
    title: 'Email server not responding',
    description: 'Unable to send or receive emails since this morning. All users affected.',
    problemLevel: 'high',
    priority: 'high',
    status: 'in-progress',
    assignedTo: '2',
    assignedToName: 'Jane Employee',
    submittedDate: new Date('2024-01-15T09:30:00'),
    lastUpdated: new Date('2024-01-15T14:20:00'),
    currentLevel: 'l1',
    availableToLevels: ['l1'],
    escalationHistory: [],
    isAvailableForAssignment: false,
    lastAssignedTo: '2',
    lastAssignedToName: 'Jane Employee',
    assignmentTimestamp: new Date('2024-01-15T09:35:00'),
    activityLog: [
      {
        id: 'act-1',
        ticketId: 'TK-001',
        userId: '2',
        userName: 'Jane Employee',
        action: 'assigned' as const,
        description: 'Ticket assigned to Level 1 support',
        timestamp: new Date('2024-01-15T09:35:00'),
        metadata: {
          previousStatus: 'unassigned',
          newStatus: 'open',
          newAssignee: '2'
        }
      }
    ],
    clientNotifications: [
      {
        id: 'notif-1',
        ticketId: 'TK-001',
        type: 'assignment' as const,
        title: 'Ticket Assigned',
        message: 'Your ticket TK-001 has been assigned to Jane Employee. We will begin working on it shortly.',
        timestamp: new Date('2024-01-15T09:35:00'),
        isRead: false
      }
    ]
  },
  {
    id: 'TK-002',
    clientName: 'TechCorp',
    clientId: 'client-2',
    title: 'VPN connection issues',
    description: 'Multiple users unable to connect to VPN. Network connectivity problems suspected.',
    problemLevel: 'critical',
    priority: 'critical',
    status: 'open',
    assignedTo: '4',
    assignedToName: 'Level 2 Tech',
    submittedDate: new Date('2024-01-15T11:15:00'),
    lastUpdated: new Date('2024-01-15T11:15:00'),
    currentLevel: 'l2',
    availableToLevels: ['l2'],
    escalationHistory: [
      {
        id: 'esc-1',
        ticketId: 'TK-002',
        fromLevel: 'l1',
        toLevel: 'l2',
        fromUserId: '2',
        fromUserName: 'Jane Employee',
        reason: 'Network infrastructure issue requiring L2 expertise',
        timestamp: new Date('2024-01-15T11:10:00'),
        metadata: {
          escalationReason: 'Network infrastructure issue requiring L2 expertise'
        }
      }
    ],
    isAvailableForAssignment: false,
    lastAssignedTo: '4',
    lastAssignedToName: 'Level 2 Tech',
    assignmentTimestamp: new Date('2024-01-15T11:10:00'),
    activityLog: [],
    clientNotifications: [
      {
        id: 'notif-2',
        ticketId: 'TK-002',
        type: 'escalation' as const,
        title: 'Ticket Escalated',
        message: 'Your ticket TK-002 has been escalated to Level 2 support for specialized network assistance.',
        timestamp: new Date('2024-01-15T11:10:00'),
        isRead: false,
        metadata: {
          escalationLevel: 'l2',
          estimatedResolutionTime: '2-4 hours'
        }
      }
    ]
  },
  {
    id: 'TK-003',
    clientName: 'ARCHEAN',
    clientId: 'client-1',
    title: 'Software license renewal',
    description: 'Need to renew Microsoft Office licenses for 50 users',
    problemLevel: 'low',
    priority: 'low',
    status: 'resolved',
    assignedTo: '2',
    assignedToName: 'Jane Employee',
    submittedDate: new Date('2024-01-14T16:00:00'),
    lastUpdated: new Date('2024-01-15T10:30:00'),
    resolvedDate: new Date('2024-01-15T10:30:00'),
    currentLevel: 'l1',
    availableToLevels: ['l1'],
    escalationHistory: [],
    isAvailableForAssignment: false,
    lastAssignedTo: '2',
    lastAssignedToName: 'Jane Employee',
    assignmentTimestamp: new Date('2024-01-14T16:05:00'),
    activityLog: [],
    clientNotifications: []
  },
  {
    id: 'TK-004',
    clientName: 'DataFlow Inc',
    clientId: 'client-3',
    title: 'Database performance issues',
    description: 'Queries running very slowly, affecting productivity. Database optimization needed.',
    problemLevel: 'high',
    priority: 'high',
    status: 'unassigned',
    submittedDate: new Date('2024-01-15T13:45:00'),
    lastUpdated: new Date('2024-01-15T13:45:00'),
    currentLevel: 'l1',
    availableToLevels: ['l1', 'l2'],
    escalationHistory: [],
    isAvailableForAssignment: true,
    activityLog: [],
    clientNotifications: []
  },
  {
    id: 'TK-005',
    clientName: 'ARCHEAN',
    clientId: 'client-1',
    title: 'Printer not working',
    description: 'Office printer showing error messages and not printing',
    problemLevel: 'medium',
    priority: 'medium',
    status: 'in-progress',
    assignedTo: '2',
    assignedToName: 'Jane Employee',
    submittedDate: new Date('2024-01-15T08:20:00'),
    lastUpdated: new Date('2024-01-15T12:10:00'),
    currentLevel: 'l1',
    availableToLevels: ['l1'],
    escalationHistory: [],
    isAvailableForAssignment: false,
    lastAssignedTo: '2',
    lastAssignedToName: 'Jane Employee',
    assignmentTimestamp: new Date('2024-01-15T08:25:00'),
    activityLog: [],
    clientNotifications: []
  },
  {
    id: 'TK-006',
    clientName: 'TechCorp',
    clientId: 'client-2',
    title: 'Website down',
    description: 'Company website is not accessible. Server appears to be down completely.',
    problemLevel: 'critical',
    priority: 'critical',
    status: 'open',
    assignedTo: '5',
    assignedToName: 'Level 3 Expert',
    submittedDate: new Date('2024-01-15T15:30:00'),
    lastUpdated: new Date('2024-01-15T15:30:00'),
    currentLevel: 'l3',
    availableToLevels: ['l3'],
    escalationHistory: [
      {
        id: 'esc-2',
        ticketId: 'TK-006',
        fromLevel: 'l1',
        toLevel: 'l2',
        fromUserId: '2',
        fromUserName: 'Jane Employee',
        reason: 'Critical system outage requiring immediate attention',
        timestamp: new Date('2024-01-15T15:25:00'),
        metadata: {
          escalationReason: 'Critical system outage requiring immediate attention'
        }
      },
      {
        id: 'esc-3',
        ticketId: 'TK-006',
        fromLevel: 'l2',
        toLevel: 'l3',
        fromUserId: '4',
        fromUserName: 'Level 2 Tech',
        reason: 'Server infrastructure failure requiring expert intervention',
        timestamp: new Date('2024-01-15T15:28:00'),
        metadata: {
          escalationReason: 'Server infrastructure failure requiring expert intervention'
        }
      }
    ],
    isAvailableForAssignment: false,
    lastAssignedTo: '5',
    lastAssignedToName: 'Level 3 Expert',
    assignmentTimestamp: new Date('2024-01-15T15:28:00'),
    activityLog: [],
    clientNotifications: [
      {
        id: 'notif-3',
        ticketId: 'TK-006',
        type: 'escalation' as const,
        title: 'Critical Issue Escalated',
        message: 'Your critical ticket TK-006 has been escalated to our expert team for immediate resolution.',
        timestamp: new Date('2024-01-15T15:28:00'),
        isRead: false,
        metadata: {
          escalationLevel: 'l3',
          estimatedResolutionTime: '1-2 hours'
        }
      }
    ]
  },
  {
    id: 'TK-007',
    clientName: 'CloudSys',
    clientId: 'client-4',
    title: 'Account access issues',
    description: 'Unable to login to admin panel. Authentication system problems.',
    problemLevel: 'medium',
    priority: 'medium',
    status: 'open',
    assignedTo: '2',
    assignedToName: 'Jane Employee',
    submittedDate: new Date('2024-01-15T14:15:00'),
    lastUpdated: new Date('2024-01-15T14:15:00'),
    currentLevel: 'l1',
    availableToLevels: ['l1'],
    escalationHistory: [],
    isAvailableForAssignment: false,
    lastAssignedTo: '2',
    lastAssignedToName: 'Jane Employee',
    assignmentTimestamp: new Date('2024-01-15T14:20:00'),
    activityLog: [],
    clientNotifications: []
  },
  {
    id: 'TK-008',
    clientName: 'ARCHEAN',
    clientId: 'client-1',
    title: 'Password reset request',
    description: 'Need password reset for user account john.doe@archean.com',
    problemLevel: 'low',
    priority: 'low',
    status: 'unassigned',
    submittedDate: new Date('2024-01-15T16:00:00'),
    lastUpdated: new Date('2024-01-15T16:00:00'),
    currentLevel: 'l1',
    availableToLevels: ['l1'],
    escalationHistory: [],
    isAvailableForAssignment: true,
    activityLog: [],
    clientNotifications: []
  },
  {
    id: 'TK-009',
    clientName: 'TechCorp',
    clientId: 'client-2',
    title: 'Software installation failed',
    description: 'Adobe Creative Suite installation keeps failing with error code 0x80070057',
    problemLevel: 'medium',
    priority: 'medium',
    status: 'unassigned',
    submittedDate: new Date('2024-01-15T16:30:00'),
    lastUpdated: new Date('2024-01-15T16:30:00'),
    currentLevel: 'l1',
    availableToLevels: ['l1', 'l2'],
    escalationHistory: [],
    isAvailableForAssignment: true,
    activityLog: [],
    clientNotifications: []
  },
  {
    id: 'TK-010',
    clientName: 'DataFlow Inc',
    clientId: 'client-3',
    title: 'System backup failure',
    description: 'Automated backup system has failed for the past 3 days. Data integrity concerns.',
    problemLevel: 'high',
    priority: 'high',
    status: 'unassigned',
    submittedDate: new Date('2024-01-15T17:00:00'),
    lastUpdated: new Date('2024-01-15T17:00:00'),
    currentLevel: 'l1',
    availableToLevels: ['l1', 'l2', 'l3'],
    escalationHistory: [],
    isAvailableForAssignment: true,
    activityLog: [],
    clientNotifications: []
  }
];

export const getTicketStats = (): TicketStats => {
  const stats = mockTickets.reduce(
    (acc, ticket) => {
      acc.total++;
      switch (ticket.status) {
        case 'open':
          acc.open++;
          break;
        case 'unassigned':
          acc.unassigned++;
          break;
        case 'in-progress':
          acc.inProgress++;
          break;
        case 'resolved':
          acc.resolved++;
          break;
      }
      return acc;
    },
    { open: 0, unassigned: 0, inProgress: 0, resolved: 0, total: 0 }
  );
  
  return stats;
};

export const getClientTicketData = (): ClientTicketData[] => {
  const clientCounts = mockTickets
    .filter(ticket => ticket.status !== 'resolved' && ticket.status !== 'closed')
    .reduce((acc, ticket) => {
      acc[ticket.clientName] = (acc[ticket.clientName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const total = Object.values(clientCounts).reduce((sum, count) => sum + count, 0);
  
  return Object.entries(clientCounts).map(([clientName, count]) => ({
    clientName,
    ticketCount: count,
    percentage: total > 0 ? (count / total) * 100 : 0
  }));
};