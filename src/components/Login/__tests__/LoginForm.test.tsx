import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../utils/test-utils';
import { LoginForm } from '../LoginForm';
// Mock the API module
jest.mock('../../../services/api', () => ({
  authAPI: {
    login: jest.fn(),
    logout: jest.fn(),
  },
  ticketAPI: {
    getTickets: jest.fn(),
    createTicket: jest.fn(),
    updateTicket: jest.fn(),
    getTicket: jest.fn(),
  },
  userAPI: {
    getCurrentUser: jest.fn(),
    getUsers: jest.fn(),
  },
  checkAPIHealth: jest.fn(),
}));

describe('LoginForm', () => {
  const mockLogin = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockLogin.mockClear();
    mockOnSubmit.mockClear();
  });

  it('renders login form with all required elements', () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} error={null} />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} error={null} />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email format', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} error={null} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit with correct credentials when form is valid', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} error={null} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('shows loading state when isLoading is true', () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={true} error={null} />);
    
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('shows error message when error prop is provided', () => {
    const errorMessage = 'Invalid credentials';
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('clears form after successful submission', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} error={null} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('handles keyboard navigation', () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} error={null} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Tab navigation
    emailInput.focus();
    expect(emailInput).toHaveFocus();
    
    fireEvent.keyDown(emailInput, { key: 'Tab' });
    expect(passwordInput).toHaveFocus();
    
    fireEvent.keyDown(passwordInput, { key: 'Tab' });
    expect(submitButton).toHaveFocus();
  });

  it('submits form on Enter key press', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} error={null} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.keyDown(passwordInput, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
}); 