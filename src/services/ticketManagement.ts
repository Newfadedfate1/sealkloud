import { Ticket, TicketStatus, ProblemLevel, EscalationLevel, TicketAction, ClientNotification, EscalationRecord } from '../types/ticket';
import { User } from '../types/user';

export class TicketManagementService {
  private static instance: TicketManagementService;
  private tickets: Ticket[] = [];
  private users: User[] = [];
  private notificationCallbacks: ((notification: ClientNotification) => void)[] = [];
  private clientNotificationCallbacks: Map<string, ((notification: ClientNotification) => void)[]> = new Map();

  private constructor() {}

  static getInstance(): TicketManagementService {
    if (!TicketManagementService.instance) {
      TicketManagementService.instance = new TicketManagementService();
    }
    return TicketManagementService.instance;
  }

  // Initialize with data
  initialize(tickets: Ticket[], users: User[]) {
    const safeTickets = Array.isArray(tickets) ? tickets : [];
    // Ensure all tickets have required escalation fields
    this.tickets = safeTickets.map(ticket => ({
      ...ticket,
      currentLevel: ticket.currentLevel || 'l1',
      availableToLevels: ticket.availableToLevels || ['l1'],
      escalationHistory: ticket.escalationHistory || [],
      isAvailableForAssignment: ticket.isAvailableForAssignment ?? (ticket.status === 'unassigned' || ticket.status === 'open'),
      activityLog: ticket.activityLog || [],
      clientNotifications: ticket.clientNotifications || []
    }));
    
    this.users = users;
    console.log('🔧 TicketManagementService initialized:', {
      ticketsCount: safeTickets.length,
      usersCount: users.length,
      ticketsWithNewFields: this.tickets.filter(t => t.currentLevel && t.availableToLevels).length,
      ticketsMissingFields: safeTickets.length - this.tickets.filter(t => t.currentLevel && t.availableToLevels).length
    });
  }

  // Get available tickets for a specific level
  getAvailableTicketsForLevel(level: EscalationLevel): Ticket[] {
    const availableTickets = this.tickets.filter(ticket => 
      ticket.isAvailableForAssignment && 
      ticket.availableToLevels && 
      ticket.availableToLevels.includes(level) &&
      (ticket.status === 'open' || ticket.status === 'unassigned')
    );
    
    console.log(`🔍 getAvailableTicketsForLevel(${level}):`, {
      totalTickets: this.tickets.length,
      availableForAssignment: this.tickets.filter(t => t.isAvailableForAssignment).length,
      withCorrectLevel: this.tickets.filter(t => t.availableToLevels && t.availableToLevels.includes(level)).length,
      withCorrectStatus: this.tickets.filter(t => t.status === 'open' || t.status === 'unassigned').length,
      result: availableTickets.length
    });
    
    return availableTickets;
  }

  // Get tickets assigned to a specific user
  getTicketsAssignedToUser(userId: string): Ticket[] {
    return this.tickets.filter(ticket => ticket.assignedTo === userId);
  }

  // Get tickets for a specific client
  getTicketsForClient(clientId: string): Ticket[] {
    return this.tickets.filter(ticket => 
      ticket.clientId === clientId || 
      ticket.clientName === this.getClientNameById(clientId)
    );
  }

  // Get client name by ID
  private getClientNameById(clientId: string): string {
    const client = this.users.find(u => u.id === clientId && u.role === 'client');
    return client ? `${client.firstName} ${client.lastName}` : '';
  }

  // Take a ticket (assign to current user)
  takeTicket(ticketId: string, userId: string): { success: boolean; message: string; ticket?: Ticket } {
    console.log('🔄 Service: Taking ticket', { ticketId, userId });
    
    const ticket = this.tickets.find(t => t.id === ticketId);
    const user = this.users.find(u => u.id === userId);

    if (!ticket) {
      console.log('❌ Service: Ticket not found', { ticketId });
      return { success: false, message: 'Ticket not found' };
    }

    if (!user) {
      console.log('❌ Service: User not found', { userId });
      return { success: false, message: 'User not found' };
    }

    if (!ticket.isAvailableForAssignment) {
      console.log('❌ Service: Ticket not available for assignment', { ticketId, isAvailable: ticket.isAvailableForAssignment });
      return { success: false, message: 'Ticket is not available for assignment' };
    }

    if (!ticket.availableToLevels || !ticket.availableToLevels.includes(this.getUserLevel(user))) {
      console.log('❌ Service: Ticket not available for user level', { 
        ticketId, 
        userLevel: this.getUserLevel(user), 
        availableLevels: ticket.availableToLevels 
      });
      return { success: false, message: 'Ticket is not available for your level' };
    }

    console.log('✅ Service: All checks passed, updating ticket', { ticketId, userId, userLevel: this.getUserLevel(user) });

    // Update ticket
    const updatedTicket: Ticket = {
      ...ticket,
      assignedTo: userId,
      assignedToName: `${user.firstName} ${user.lastName}`,
      status: 'open',
      isAvailableForAssignment: false,
      lastAssignedTo: userId,
      lastAssignedToName: `${user.firstName} ${user.lastName}`,
      assignmentTimestamp: new Date(),
      lastUpdated: new Date(),
      activityLog: [
        ...ticket.activityLog,
        {
          id: `act-${Date.now()}`,
          ticketId: ticket.id,
          userId: userId,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'taken',
          description: `Ticket taken by ${user.firstName} ${user.lastName}`,
          timestamp: new Date(),
          metadata: {
            previousStatus: ticket.status,
            newStatus: 'open',
            newAssignee: userId
          }
        }
      ],
      clientNotifications: [
        ...ticket.clientNotifications,
        {
          id: `notif-${Date.now()}`,
          ticketId: ticket.id,
          type: 'taken',
          title: 'Ticket Taken',
          message: `Your ticket ${ticket.id} has been taken by ${user.firstName} ${user.lastName} (${this.getUserLevel(user).toUpperCase()} Support). We will begin working on it shortly.`,
          timestamp: new Date(),
          isRead: false,
          metadata: {
            assignedToName: `${user.firstName} ${user.lastName}`,
            estimatedResolutionTime: this.getEstimatedResolutionTime(ticket.problemLevel)
          }
        }
      ]
    };

    // Update the ticket in the array
    const ticketIndex = this.tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex !== -1) {
      this.tickets[ticketIndex] = updatedTicket;
    }

    // Send real-time notification to client
    this.sendClientNotification(updatedTicket.clientNotifications[updatedTicket.clientNotifications.length - 1], ticket.clientId);

    console.log('✅ Service: Ticket successfully taken', { 
      ticketId, 
      userId, 
      assignedTo: updatedTicket.assignedTo,
      status: updatedTicket.status,
      isAvailableForAssignment: updatedTicket.isAvailableForAssignment,
      totalTickets: this.tickets.length
    });

    return { 
      success: true, 
      message: `Successfully took ticket ${ticketId}`,
      ticket: updatedTicket
    };
  }

  // Push ticket to next level
  pushTicketToLevel(ticketId: string, userId: string, targetLevel: EscalationLevel, reason?: string): { success: boolean; message: string; ticket?: Ticket } {
    const ticket = this.tickets.find(t => t.id === ticketId);
    const user = this.users.find(u => u.id === userId);

    if (!ticket) {
      return { success: false, message: 'Ticket not found' };
    }

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Validate escalation path
    const currentLevel = this.getUserLevel(user);
    if (!this.canEscalateToLevel(currentLevel, targetLevel)) {
      return { success: false, message: `Cannot escalate from ${currentLevel} to ${targetLevel}` };
    }

    // Update ticket
    const updatedTicket: Ticket = {
      ...ticket,
      currentLevel: targetLevel,
      availableToLevels: [targetLevel],
      isAvailableForAssignment: true,
      assignedTo: undefined,
      assignedToName: undefined,
      lastUpdated: new Date(),
      escalationHistory: [
        ...ticket.escalationHistory,
        {
          id: `esc-${Date.now()}`,
          ticketId: ticket.id,
          fromLevel: currentLevel,
          toLevel: targetLevel,
          fromUserId: userId,
          fromUserName: `${user.firstName} ${user.lastName}`,
          reason: reason || `Escalated from ${currentLevel} to ${targetLevel}`,
          timestamp: new Date(),
          metadata: {
            previousAssignee: ticket.assignedTo,
            escalationReason: reason || `Escalated from ${currentLevel} to ${targetLevel}`
          }
        }
      ],
      activityLog: [
        ...ticket.activityLog,
        {
          id: `act-${Date.now()}`,
          ticketId: ticket.id,
          userId: userId,
          userName: `${user.firstName} ${user.lastName}`,
          action: targetLevel === 'l2' ? 'pushed_to_l2' : 'pushed_to_l3',
          description: `Ticket pushed to ${targetLevel.toUpperCase()} by ${user.firstName} ${user.lastName}${reason ? `: ${reason}` : ''}`,
          timestamp: new Date(),
          metadata: {
            previousStatus: ticket.status,
            escalationLevel: targetLevel,
            reason: reason
          }
        }
      ],
      clientNotifications: [
        ...ticket.clientNotifications,
        {
          id: `notif-${Date.now()}`,
          ticketId: ticket.id,
          type: 'escalation',
          title: 'Ticket Escalated',
          message: `Your ticket ${ticket.id} has been escalated to ${targetLevel.toUpperCase()} support for specialized assistance.`,
          timestamp: new Date(),
          isRead: false,
          metadata: {
            escalationLevel: targetLevel,
            estimatedResolutionTime: this.getEstimatedResolutionTimeForLevel(targetLevel)
          }
        }
      ]
    };

    // Update the ticket in the array
    const ticketIndex = this.tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex !== -1) {
      this.tickets[ticketIndex] = updatedTicket;
    }

    // Send real-time notification to client
    this.sendClientNotification(updatedTicket.clientNotifications[updatedTicket.clientNotifications.length - 1], ticket.clientId);

    return { 
      success: true, 
      message: `Successfully pushed ticket ${ticketId} to ${targetLevel.toUpperCase()}`,
      ticket: updatedTicket
    };
  }

  // Start work on a ticket
  startWorkOnTicket(ticketId: string, userId: string): { success: boolean; message: string; ticket?: Ticket } {
    const ticket = this.tickets.find(t => t.id === ticketId);
    const user = this.users.find(u => u.id === userId);

    if (!ticket) {
      return { success: false, message: 'Ticket not found' };
    }

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (ticket.assignedTo !== userId) {
      return { success: false, message: 'You can only start work on tickets assigned to you' };
    }

    if (ticket.status !== 'open') {
      return { success: false, message: 'Can only start work on open tickets' };
    }

    // Update ticket
    const updatedTicket: Ticket = {
      ...ticket,
      status: 'in-progress',
      lastUpdated: new Date(),
      activityLog: [
        ...ticket.activityLog,
        {
          id: `act-${Date.now()}`,
          ticketId: ticket.id,
          userId: userId,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'started',
          description: `Work started on ticket by ${user.firstName} ${user.lastName}`,
          timestamp: new Date(),
          metadata: {
            previousStatus: 'open',
            newStatus: 'in-progress'
          }
        }
      ],
      clientNotifications: [
        ...ticket.clientNotifications,
        {
          id: `notif-${Date.now()}`,
          ticketId: ticket.id,
          type: 'status_update',
          title: 'Work Started',
          message: `Work has started on your ticket ${ticket.id}. We are actively working on resolving your issue.`,
          timestamp: new Date(),
          isRead: false
        }
      ]
    };

    // Update the ticket in the array
    const ticketIndex = this.tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex !== -1) {
      this.tickets[ticketIndex] = updatedTicket;
    }

    // Send real-time notification to client
    this.sendClientNotification(updatedTicket.clientNotifications[updatedTicket.clientNotifications.length - 1], ticket.clientId);

    return { 
      success: true, 
      message: `Started work on ticket ${ticketId}`,
      ticket: updatedTicket
    };
  }

  // Resolve a ticket
  resolveTicket(ticketId: string, userId: string, resolutionNotes?: string): { success: boolean; message: string; ticket?: Ticket } {
    const ticket = this.tickets.find(t => t.id === ticketId);
    const user = this.users.find(u => u.id === userId);

    if (!ticket) {
      return { success: false, message: 'Ticket not found' };
    }

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (ticket.assignedTo !== userId) {
      return { success: false, message: 'You can only resolve tickets assigned to you' };
    }

    if (ticket.status !== 'in-progress') {
      return { success: false, message: 'Can only resolve tickets that are in progress' };
    }

    // Update ticket
    const updatedTicket: Ticket = {
      ...ticket,
      status: 'resolved',
      resolvedDate: new Date(),
      lastUpdated: new Date(),
      activityLog: [
        ...ticket.activityLog,
        {
          id: `act-${Date.now()}`,
          ticketId: ticket.id,
          userId: userId,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'resolved',
          description: `Ticket resolved by ${user.firstName} ${user.lastName}${resolutionNotes ? `: ${resolutionNotes}` : ''}`,
          timestamp: new Date(),
          metadata: {
            previousStatus: 'in-progress',
            newStatus: 'resolved'
          }
        }
      ],
      clientNotifications: [
        ...ticket.clientNotifications,
        {
          id: `notif-${Date.now()}`,
          ticketId: ticket.id,
          type: 'resolution',
          title: 'Ticket Resolved',
          message: `Your ticket ${ticket.id} has been resolved. Thank you for your patience.`,
          timestamp: new Date(),
          isRead: false
        }
      ]
    };

    // Update the ticket in the array
    const ticketIndex = this.tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex !== -1) {
      this.tickets[ticketIndex] = updatedTicket;
    }

    // Send real-time notification to client
    this.sendClientNotification(updatedTicket.clientNotifications[updatedTicket.clientNotifications.length - 1], ticket.clientId);

    return { 
      success: true, 
      message: `Successfully resolved ticket ${ticketId}`,
      ticket: updatedTicket
    };
  }

  // Get user level from role
  private getUserLevel(user: User): EscalationLevel {
    switch (user.role) {
      case 'employee_l1': return 'l1';
      case 'employee_l2': return 'l2';
      case 'employee_l3': return 'l3';
      default: return 'l1';
    }
  }

  // Check if escalation is allowed
  private canEscalateToLevel(fromLevel: EscalationLevel, toLevel: EscalationLevel): boolean {
    const levels = ['l1', 'l2', 'l3'];
    const fromIndex = levels.indexOf(fromLevel);
    const toIndex = levels.indexOf(toLevel);
    return toIndex > fromIndex;
  }

  // Get estimated resolution time based on priority
  private getEstimatedResolutionTime(priority: ProblemLevel): string {
    switch (priority) {
      case 'critical': return '1-2 hours';
      case 'high': return '2-4 hours';
      case 'medium': return '4-8 hours';
      case 'low': return '24-48 hours';
      default: return '4-8 hours';
    }
  }

  // Get estimated resolution time based on level
  private getEstimatedResolutionTimeForLevel(level: EscalationLevel): string {
    switch (level) {
      case 'l3': return '1-2 hours';
      case 'l2': return '2-4 hours';
      case 'l1': return '4-8 hours';
      default: return '4-8 hours';
    }
  }

  // Register notification callback
  onClientNotification(callback: (notification: ClientNotification) => void) {
    this.notificationCallbacks.push(callback);
  }

  // Register callback for specific client
  onClientNotificationForClient(clientId: string, callback: (notification: ClientNotification) => void) {
    if (!this.clientNotificationCallbacks.has(clientId)) {
      this.clientNotificationCallbacks.set(clientId, []);
    }
    this.clientNotificationCallbacks.get(clientId)!.push(callback);
  }

  // Unregister callback for specific client
  offClientNotificationForClient(clientId: string, callback: (notification: ClientNotification) => void) {
    const callbacks = this.clientNotificationCallbacks.get(clientId);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Send client notification
  private sendClientNotification(notification: ClientNotification, clientId: string) {
    // Send to specific client callbacks
    const callbacks = this.clientNotificationCallbacks.get(clientId) || [];
    callbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in client notification callback:', error);
      }
    });

    // Also send to general callbacks
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in general notification callback:', error);
      }
    });
  }

  // Get all tickets
  getAllTickets(): Ticket[] {
    return this.tickets;
  }

  // Get ticket by ID
  getTicketById(ticketId: string): Ticket | undefined {
    return this.tickets.find(t => t.id === ticketId);
  }

  // Update ticket
  updateTicket(ticketId: string, updates: Partial<Ticket>): { success: boolean; message: string; ticket?: Ticket } {
    const ticketIndex = this.tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) {
      return { success: false, message: 'Ticket not found' };
    }

    const updatedTicket = { ...this.tickets[ticketIndex], ...updates, lastUpdated: new Date() };
    this.tickets[ticketIndex] = updatedTicket;

    return { 
      success: true, 
      message: `Successfully updated ticket ${ticketId}`,
      ticket: updatedTicket
    };
  }
} 