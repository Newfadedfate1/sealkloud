import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ticket } from '../types/ticket';
import { mockTickets } from '../data/mockTickets';
import { ticketAPI, checkAPIHealth } from '../services/api';

interface TicketContextType {
  tickets: Ticket[];
  addTicket: (ticket: Ticket) => void;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  getTickets: () => Ticket[];
  isLoading: boolean;
  isUsingMockData: boolean;
  refreshTickets: () => Promise<void>;
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

  // Check API health and load tickets on mount
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      // Check if API is available
      const apiAvailable = await checkAPIHealth();
      
      if (apiAvailable) {
        // Use real API
        const result = await ticketAPI.getTickets();
        setTickets(result.tickets);
        setIsUsingMockData(false);
        console.log('✅ Using real API data');
      } else {
        // Fallback to mock data
        setTickets(mockTickets);
        setIsUsingMockData(true);
        console.log('⚠️ API unavailable, using mock data');
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      // Fallback to mock data on error
      setTickets(mockTickets);
      setIsUsingMockData(true);
      console.log('⚠️ Error loading tickets, using mock data');
    } finally {
      setIsLoading(false);
    }
  };

  const addTicket = async (ticket: Ticket) => {
    if (!isUsingMockData) {
      try {
        // Try to save to API
        const newTicket = await ticketAPI.createTicket({
          title: ticket.title,
          description: ticket.description,
          problemLevel: ticket.problemLevel,
          clientName: ticket.clientName
        });
        setTickets(prev => [newTicket, ...prev]);
        return;
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
        const updatedTicket = await ticketAPI.updateTicket(ticketId, updates);
        setTickets(prev => prev.map(ticket => 
          ticket.id === ticketId ? updatedTicket : ticket
        ));
        return;
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

  const getTickets = () => tickets;

  const refreshTickets = async () => {
    await loadTickets();
  };

  const value: TicketContextType = {
    tickets,
    addTicket,
    updateTicket,
    getTickets,
    isLoading,
    isUsingMockData,
    refreshTickets
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
}; 