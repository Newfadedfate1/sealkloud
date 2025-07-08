import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ticket } from '../types/ticket';
import { User } from '../types/user';
import { ticketsAPI, api } from '../services/api';
import { TicketManagementService } from '../services/ticketManagement';
import { useAuth } from '../hooks/useAuth';

interface TicketContextType {
  tickets: Ticket[];
  addTicket: (ticket: Ticket) => void;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  updateTicketViaService: (ticketId: string, updates: Partial<Ticket>) => { success: boolean; message: string; ticket?: Ticket };
  takeTicket: (ticketId: string, userId: string) => { success: boolean; message: string; ticket?: Ticket };
  pushTicketToLevel: (ticketId: string, userId: string, targetLevel: 'l1' | 'l2' | 'l3', reason?: string) => { success: boolean; message: string; ticket?: Ticket };
  getTickets: () => Ticket[];
  isLoading: boolean;
  isUsingMockData: boolean;
  refreshTickets: () => Promise<void>;
  ticketService: TicketManagementService;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};

interface TicketProviderProps {
  children: ReactNode;
}

export const TicketProvider: React.FC<TicketProviderProps> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  
  // Initialize ticket management service
  const ticketService = TicketManagementService.getInstance();

  // Get authentication state
  const { isAuthenticated } = useAuth();

  // Check API health and load tickets on mount or when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadTickets();
    }
  }, [isAuthenticated]);

  // Initialize ticket service when tickets change
  useEffect(() => {
    if (!isAuthenticated) return;
    // Get users from API or use empty array if not available
    const initializeService = async () => {
      try {
        const usersResponse = await api.get('/api/users');
        const users: User[] = usersResponse.success ? usersResponse.data : [];
        
        console.log('🔄 Context: Initializing ticket service', {
          ticketsCount: tickets.length,
          usersCount: users.length,
          users: users.map(u => ({ id: u.id, email: u.email, role: u.role }))
        });
        
        ticketService.initialize(tickets, users);
      } catch (error) {
        console.error('Error loading users for ticket service:', error);
        // Initialize with empty users array
        ticketService.initialize(tickets, []);
      }
    };
    initializeService();
  }, [tickets, ticketService, isAuthenticated]);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const response = await ticketsAPI.getAll();
      if (response.success && response.data) {
        setTickets(response.data);
        setIsUsingMockData(false);
        console.log('✅ Using real API data');
      } else {
        throw new Error('API returned no data');
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      setTickets([]);
      setIsUsingMockData(false);
      console.log('⚠️ API unavailable, using empty data');
    } finally {
      setIsLoading(false);
    }
  };

  const addTicket = async (ticket: Ticket) => {
    try {
      const response = await ticketsAPI.create(ticket);
      if (response.success && response.data) {
        setTickets(prev => [response.data, ...prev]);
        return;
      }
    } catch (error) {
      console.error('Error creating ticket via API:', error);
      throw error;
    }
  };

  const updateTicket = async (ticketId: string, updates: Partial<Ticket>) => {
    try {
      let response;
      if (Object.keys(updates).length === 1 && updates.status) {
        // Only status is being updated (e.g., resolving)
        response = await ticketsAPI.updateStatus(ticketId, updates.status);
      } else {
        response = await ticketsAPI.update(ticketId, updates);
      }
      if (response.success && response.data) {
        // Always reload tickets from backend after update
        await loadTickets();
        return;
      }
    } catch (error) {
      console.error('Error updating ticket via API:', error);
      throw error;
    }
  };

  const updateTicketViaService = (ticketId: string, updates: Partial<Ticket>) => {
    const result = ticketService.updateTicket(ticketId, updates);
    if (result.success) {
      const updatedTickets = ticketService.getAllTickets();
      setTickets(updatedTickets);
    }
    return result;
  };

  // Take ticket using the service
  const takeTicket = (ticketId: string, userId: string) => {
    console.log('🔄 Context: Taking ticket', { ticketId, userId });
    const result = ticketService.takeTicket(ticketId, userId);
    if (result.success) {
      // Update the context state with the service's updated tickets
      const updatedTickets = ticketService.getAllTickets();
      console.log('✅ Context: Ticket taken successfully', { 
        ticketId, 
        userId, 
        updatedTicketsCount: updatedTickets.length,
        takenTicket: updatedTickets.find(t => t.id === ticketId)
      });
      setTickets(updatedTickets);
      
      // Force re-initialization of the service with updated tickets
      const initializeService = async () => {
        try {
          const usersResponse = await api.get('/api/users');
          const users: User[] = usersResponse.success ? usersResponse.data : [];
          ticketService.initialize(updatedTickets, users);
        } catch (error) {
          console.error('Error loading users for ticket service:', error);
          ticketService.initialize(updatedTickets, []);
        }
      };
      initializeService();
    } else {
      console.log('❌ Context: Failed to take ticket', { ticketId, userId, error: result.message });
    }
    return result;
  };

  // Push ticket to level using the service
  const pushTicketToLevel = (ticketId: string, userId: string, targetLevel: 'l1' | 'l2' | 'l3', reason?: string) => {
    const result = ticketService.pushTicketToLevel(ticketId, userId, targetLevel, reason);
    if (result.success) {
      // Update the context state with the service's updated tickets
      const updatedTickets = ticketService.getAllTickets();
      setTickets(updatedTickets);
      
      // Force re-initialization of the service with updated tickets
      const initializeService = async () => {
        try {
          const usersResponse = await api.get('/api/users');
          const users: User[] = usersResponse.success ? usersResponse.data : [];
          ticketService.initialize(updatedTickets, users);
        } catch (error) {
          console.error('Error loading users for ticket service:', error);
          ticketService.initialize(updatedTickets, []);
        }
      };
      initializeService();
    }
    return result;
  };

  const getTickets = () => tickets;

  const refreshTickets = async () => {
    await loadTickets();
  };

  const value: TicketContextType = {
    tickets,
    addTicket,
    updateTicket,
    updateTicketViaService,
    takeTicket,
    pushTicketToLevel,
    getTickets,
    isLoading,
    isUsingMockData,
    refreshTickets,
    ticketService
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
}; 