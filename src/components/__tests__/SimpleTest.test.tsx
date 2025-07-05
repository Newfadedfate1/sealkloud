import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple test component
const TestComponent = () => (
  <div>
    <h1>Test Component</h1>
    <p>This is a test</p>
  </div>
);

describe('Simple Test', () => {
  it('renders test component', () => {
    render(<TestComponent />);
    expect(screen.getByText('Test Component')).toBeInTheDocument();
    expect(screen.getByText('This is a test')).toBeInTheDocument();
  });

  it('basic math works', () => {
    expect(2 + 2).toBe(4);
  });

  it('string operations work', () => {
    expect('hello' + ' world').toBe('hello world');
  });
}); 