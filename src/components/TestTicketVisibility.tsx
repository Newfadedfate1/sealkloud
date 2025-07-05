import React from 'react';
import { useTickets } from '../contexts/TicketContext';

export const TestTicketVisibility: React.FC = () => {
  const { tickets } = useTickets();

  const unassignedTickets = tickets.filter(ticket => ticket.status === 'unassigned');
  const clientTickets = tickets.filter(ticket => ticket.clientId && ticket.clientId.startsWith('client'));

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-bold mb-4">Ticket Visibility Test</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">All Tickets: {tickets.length}</h3>
        <div className="text-sm text-gray-600">
          {tickets.map(ticket => (
            <div key={ticket.id} className="mb-1">
              {ticket.id} - {ticket.title} - {ticket.status} - {ticket.clientName}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Unassigned Tickets: {unassignedTickets.length}</h3>
        <div className="text-sm text-gray-600">
          {unassignedTickets.map(ticket => (
            <div key={ticket.id} className="mb-1">
              {ticket.id} - {ticket.title} - {ticket.problemLevel} - {ticket.clientName}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Client Tickets: {clientTickets.length}</h3>
        <div className="text-sm text-gray-600">
          {clientTickets.map(ticket => (
            <div key={ticket.id} className="mb-1">
              {ticket.id} - {ticket.title} - {ticket.status} - {ticket.clientName}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 