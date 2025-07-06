import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ticket } from '../types/ticket';
import { User } from '../types/user';
import { mockTickets } from '../data/mockTickets';
import { ticketsAPI, api } from '../services/api';
import { TicketManagementService } from '../services/ticketManagement';

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
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsingMockData, setIsUsingMockData] = useState(true);
  
  // Initialize ticket management service
  const ticketService = TicketManagementService.getInstance();

  // Check API health and load tickets on mount
  useEffect(() => {
    loadTickets();
  }, []);

  // Initialize ticket service when tickets change
  useEffect(() => {
    // Mock users for the service (in a real app, this would come from user context)
    const mockUsers: User[] = [
      { id: '1', email: 'client@sealkloud.com', firstName: 'John', lastName: 'Client', role: 'client', companyId: 'client1', isActive: true },
      { id: '2', email: 'employee@sealkloud.com', firstName: 'Jane', lastName: 'Employee', role: 'employee_l1', companyId: 'sealkloud', isActive: true },
      { id: '4', email: 'l2tech@sealkloud.com', firstName: 'Level 2', lastName: 'Tech', role: 'employee_l2', companyId: 'sealkloud', isActive: true },
      { id: '5', email: 'l3expert@sealkloud.com', firstName: 'Level 3', lastName: 'Expert', role: 'employee_l3', companyId: 'sealkloud', isActive: true }
    ];
    
    console.log('🔄 Context: Initializing ticket service', {
      ticketsCount: tickets.length,
      mockUsersCount: mockUsers.length,
      mockUsers: mockUsers.map(u => ({ id: u.id, email: u.email, role: u.role }))
    });
    
    ticketService.initialize(tickets, mockUsers);
  }, [tickets, ticketService]);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      // Try to use real API
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
      // Fallback to mock data on error
      setTickets(mockTickets);
      setIsUsingMockData(true);
      console.log('⚠️ API unavailable, using mock data');
    } finally {
      setIsLoading(false);
    }
  };

  const addTicket = async (ticket: Ticket) => {
    if (!isUsingMockData) {
      try {
        // Try to save to API
        const response = await ticketsAPI.create(ticket);
        if (response.success && response.data) {
          setTickets(prev => [response.data, ...prev]);
          return;
        }
      } catch (error) {
        console.error('Error creating ticket via API:', error);
        // Fallback to local state
      }
    }
    
    // Use local state (mock data mode or API fallback)
    setTickets(prev => [ticket, ...prev]);
  };

  const updateTicket = async (ticketId: string, updates: Partial<Ticket>) => {
    if (!isUsingMockData) {
      try {
        // Try to update via API
        const response = await ticketsAPI.update(ticketId, updates);
        if (response.success && response.data) {
          setTickets(prev => prev.map(ticket => 
            ticket.id === ticketId ? response.data : ticket
          ));
          return;
        }
      } catch (error) {
        console.error('Error updating ticket via API:', error);
        // Fallback to local state
      }
    }
    
    // Use local state (mock data mode or API fallback)
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    ));
  };

  // Update ticket using the ticket management service
  const updateTicketViaService = (ticketId: string, updates: Partial<Ticket>) => {
    // Update in the service first
    const result = ticketService.updateTicket(ticketId, updates);
    if (result.success && result.ticket) {
      // Then update the context state with the service's updated tickets
      const updatedTickets = ticketService.getAllTickets();
      setTickets(updatedTickets);
      return result;
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
      const mockUsers: User[] = [
        { id: '1', email: 'client@sealkloud.com', firstName: 'John', lastName: 'Client', role: 'client', companyId: 'client1', isActive: true },
        { id: '2', email: 'employee@sealkloud.com', firstName: 'Jane', lastName: 'Employee', role: 'employee_l1', companyId: 'sealkloud', isActive: true },
        { id: '4', email: 'l2tech@sealkloud.com', firstName: 'Level 2', lastName: 'Tech', role: 'employee_l2', companyId: 'sealkloud', isActive: true },
        { id: '5', email: 'l3expert@sealkloud.com', firstName: 'Level 3', lastName: 'Expert', role: 'employee_l3', companyId: 'sealkloud', isActive: true }
      ];
      ticketService.initialize(updatedTickets, mockUsers);
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
      const mockUsers: User[] = [
        { id: '1', email: 'client@sealkloud.com', firstName: 'John', lastName: 'Client', role: 'client', companyId: 'client1', isActive: true },
        { id: '2', email: 'employee@sealkloud.com', firstName: 'Jane', lastName: 'Employee', role: 'employee_l1', companyId: 'sealkloud', isActive: true },
        { id: '4', email: 'l2tech@sealkloud.com', firstName: 'Level 2', lastName: 'Tech', role: 'employee_l2', companyId: 'sealkloud', isActive: true },
        { id: '5', email: 'l3expert@sealkloud.com', firstName: 'Level 3', lastName: 'Expert', role: 'employee_l3', companyId: 'sealkloud', isActive: true }
      ];
      ticketService.initialize(updatedTickets, mockUsers);
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