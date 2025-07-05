import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../utils/test-utils';
import { TicketTable } from '../TicketTable';
import { mockTickets, mockUser } from '../../../utils/test-utils';

describe('TicketTable', () => {
  const mockOnTicketUpdate = jest.fn();

  beforeEach(() => {
    mockOnTicketUpdate.mockClear();
  });

  it('renders table with tickets', () => {
    render(
      <TicketTable
        tickets={mockTickets}
        currentUser={mockUser}
        onTicketUpdate={mockOnTicketUpdate}
      />
    );

    expect(screen.getByText('Test Ticket 1')).toBeInTheDocument();
    expect(screen.getByText('Test Ticket 2')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('shows empty state when no tickets', () => {
    render(
      <TicketTable
        tickets={[]}
        currentUser={mockUser}
        onTicketUpdate={mockOnTicketUpdate}
      />
    );

    expect(screen.getByText(/no tickets found/i)).toBeInTheDocument();
  });

  it('displays correct status badges', () => {
    render(
      <TicketTable
        tickets={mockTickets}
        currentUser={mockUser}
        onTicketUpdate={mockOnTicketUpdate}
      />
    );

    expect(screen.getByText('open')).toBeInTheDocument();
    expect(screen.getByText('in-progress')).toBeInTheDocument();
  });

  it('displays correct problem level badges', () => {
    render(
      <TicketTable
        tickets={mockTickets}
        currentUser={mockUser}
        onTicketUpdate={mockOnTicketUpdate}
      />
    );

    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('shows client names', () => {
    render(
      <TicketTable
        tickets={mockTickets}
        currentUser={mockUser}
        onTicketUpdate={mockOnTicketUpdate}
      />
    );

    expect(screen.getByText('Test Client 1')).toBeInTheDocument();
    expect(screen.getByText('Test Client 2')).toBeInTheDocument();
  });

  it('shows assigned user names', () => {
    render(
      <TicketTable
        tickets={mockTickets}
        currentUser={mockUser}
        onTicketUpdate={mockOnTicketUpdate}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('handles search functionality', () => {
    render(
      <TicketTable
        tickets={mockTickets}
        currentUser={mockUser}
        onTicketUpdate={mockOnTicketUpdate}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search tickets/i);
    fireEvent.change(searchInput, { target: { value: 'Test Ticket 1' } });

    expect(screen.getByText('Test Ticket 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Ticket 2')).not.toBeInTheDocument();
  });

  it('handles status filtering', () => {
    render(
      <TicketTable
        tickets={mockTickets}
        currentUser={mockUser}
        onTicketUpdate={mockOnTicketUpdate}
      />
    );

    const statusFilter = screen.getByDisplayValue(/all status/i);
    fireEvent.change(statusFilter, { target: { value: 'open' } });

    expect(screen.getByText('Test Ticket 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Ticket 2')).not.toBeInTheDocument();
  });

  it('handles problem level filtering', () => {
    render(
      <TicketTable
        tickets={mockTickets}
        currentUser={mockUser}
        onTicketUpdate={mockOnTicketUpdate}
      />
    );

    const levelFilter = screen.getByDisplayValue(/all levels/i);
    fireEvent.change(levelFilter, { target: { value: 'high' } });

    expect(screen.getByText('Test Ticket 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Ticket 2')).not.toBeInTheDocument();
  });

  it('handles large ticket lists', () => {
    const manyTickets = Array.from({ length: 50 }, (_, i) => ({
      ...mockTickets[0],
      id: `TICKET-${i + 1}`,
      title: `Ticket ${i + 1}`,
    }));

    render(
      <TicketTable
        tickets={manyTickets}
        currentUser={mockUser}
        onTicketUpdate={mockOnTicketUpdate}
      />
    );

    // Should render without performance issues
    expect(screen.getByText('Ticket 1')).toBeInTheDocument();
    expect(screen.getByText('Ticket 50')).toBeInTheDocument();
  });
}); 