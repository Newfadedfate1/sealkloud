import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './hooks/useAuth';
import { TicketProvider } from './contexts/TicketContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <TicketProvider>
        <App />
      </TicketProvider>
    </AuthProvider>
  </StrictMode>
);
