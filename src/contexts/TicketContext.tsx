import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ticket } from '../types/ticket';
import { mockTickets } from '../data/mockTickets';
import { ticketsAPI, api } from '../services/api';

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