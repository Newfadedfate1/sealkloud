import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '../components/ThemeProvider';
import { TicketProvider } from '../contexts/TicketContext';

// Mock the API service
jest.mock('../services/api', () => ({
  login: jest.fn(),
  getTickets: jest.fn(),
  createTicket: jest.fn(),
  updateTicket: jest.fn(),
  deleteTicket: jest.fn(),
  getUsers: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
}));

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <TicketProvider>
        {children}
      </TicketProvider>
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Test data helpers
export const mockTickets = [
  {
    id: 'TICKET-001',
    clientName: 'Test Client 1',
    clientId: 'CLIENT-001',
    title: 'Test Ticket 1',
    description: 'This is a test ticket',
    problemLevel: 'high' as const,
    status: 'open' as const,
    assignedTo: 'john.doe@example.com',
    assignedToName: 'John Doe',
    submittedDate: new Date('2024-01-01T00:00:00Z'),
    lastUpdated: new Date('2024-01-01T00:00:00Z'),
    activityLog: [],
  },
  {
    id: 'TICKET-002',
    clientName: 'Test Client 2',
    clientId: 'CLIENT-002',
    title: 'Test Ticket 2',
    description: 'This is another test ticket',
    problemLevel: 'medium' as const,
    status: 'in-progress' as const,
    assignedTo: 'jane.smith@example.com',
    assignedToName: 'Jane Smith',
    submittedDate: new Date('2024-01-02T00:00:00Z'),
    lastUpdated: new Date('2024-01-02T00:00:00Z'),
    activityLog: [],
  },
];

export const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'employee_l1' as const,
  companyId: 'COMPANY-001',
  isActive: true,
  lastLogin: new Date('2024-01-01T00:00:00Z'),
  permissions: ['read_tickets', 'update_tickets'],
};

// Common test helpers
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

export const mockLocalStorage = () => {
  const store: { [key: string]: string } = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
}; 