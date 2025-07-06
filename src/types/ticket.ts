export type TicketStatus = 'open' | 'unassigned' | 'in-progress' | 'resolved' | 'closed';
export type ProblemLevel = 'low' | 'medium' | 'high' | 'critical';

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
}

export interface TicketActivity {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  timestamp: Date;
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