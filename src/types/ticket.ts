export type TicketStatus = 'open' | 'unassigned' | 'in-progress' | 'resolved' | 'closed';
export type ProblemLevel = 'low' | 'medium' | 'high' | 'critical';
export type TicketAction = 'created' | 'assigned' | 'started' | 'resolved' | 'closed' | 'updated' | 'escalated' | 'delegated' | 'taken' | 'pushed_to_l2' | 'pushed_to_l3';
export type EscalationLevel = 'l1' | 'l2' | 'l3';

export interface Ticket {
  id: string;
  clientName: string;
  clientId: string;
  title: string;
  description: string;
  problemLevel: ProblemLevel;
  priority: ProblemLevel; // New field for consistency
  status: TicketStatus;
  assignedTo?: string;
  assignedToName?: string;
  submittedDate: Date;
  lastUpdated: Date;
  resolvedDate?: Date;
  activityLog: TicketActivity[];
  clientNotifications: ClientNotification[];
  // New fields for escalation system
  currentLevel: EscalationLevel;
  availableToLevels: EscalationLevel[];
  escalationHistory: EscalationRecord[];
  isAvailableForAssignment: boolean;
  lastAssignedTo?: string;
  lastAssignedToName?: string;
  assignmentTimestamp?: Date;
}

export interface EscalationRecord {
  id: string;
  ticketId: string;
  fromLevel: EscalationLevel;
  toLevel: EscalationLevel;
  fromUserId?: string;
  fromUserName?: string;
  reason?: string;
  timestamp: Date;
  metadata?: {
    previousAssignee?: string;
    newAssignee?: string;
    escalationReason?: string;
  };
}

export interface TicketActivity {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  action: TicketAction;
  description: string;
  timestamp: Date;
  metadata?: {
    previousStatus?: TicketStatus;
    newStatus?: TicketStatus;
    previousAssignee?: string;
    newAssignee?: string;
    escalationLevel?: EscalationLevel;
    reason?: string;
  };
}

export interface ClientNotification {
  id: string;
  ticketId: string;
  type: 'status_update' | 'assignment' | 'resolution' | 'general' | 'escalation' | 'taken';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionRequired?: boolean;
  metadata?: {
    assignedToName?: string;
    escalationLevel?: EscalationLevel;
    estimatedResolutionTime?: string;
  };
}

export interface TicketStats {
  open: number;
  unassigned: number;
  inProgress: number;
  resolved: number;
  total: number;
}

export interface ClientTicketData {
  clientName: string;
  ticketCount: number;
  percentage: number;
}

export interface TicketAssignment {
  ticketId: string;
  assignedTo: string;
  assignedToName: string;
  assignedBy: string;
  assignedByName: string;
  timestamp: Date;
  level: EscalationLevel;
}

export interface TicketEscalation {
  ticketId: string;
  fromLevel: EscalationLevel;
  toLevel: EscalationLevel;
  escalatedBy: string;
  escalatedByName: string;
  reason: string;
  timestamp: Date;
}