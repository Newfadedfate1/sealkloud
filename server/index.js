import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth.js';
import { ticketRoutes } from './routes/tickets.js';
import { userRoutes } from './routes/users.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';
import { 
  generalLimiter, 
  authLimiter, 
  ticketCreateLimiter, 
  searchLimiter,
  maintenanceMode 
} from './middleware/rateLimiter.js';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initializeDatabase } from './config/database.js';
import { startChatServer } from './chatServer.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Maintenance mode check
app.use(maintenanceMode);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// General rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'SealKloud Helpdesk API'
  });
});

// API routes with specific rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tickets', authenticateToken, ticketRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// WebSocket logic for real-time chat
io.on('connection', (socket) => {
  // Join ticket room
  socket.on('join_ticket', ({ ticketId }) => {
    socket.join(`ticket_${ticketId}`);
  });

  // Handle chat message
  socket.on('chat_message', async (data) => {
    // data: { ticketId, senderId, senderRole, message }
    const { ticketId, senderId, senderRole, message } = data;
    // Save to DB
    try {
      const { getDatabase } = await import('./config/database.js');
      await getDatabase().run(
        'INSERT INTO ticket_chats (ticket_id, sender_id, sender_role, message) VALUES (?, ?, ?, ?)',
        [ticketId, senderId, senderRole, message]
      );
      // Broadcast to room
      io.to(`ticket_${ticketId}`).emit('chat_message', {
        ticketId,
        senderId,
        senderRole,
        message,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving chat message:', err);
    }
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
    
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 SealKloud Helpdesk API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });

    // Start chat WebSocket server
    startChatServer();
    console.log('💬 Chat WebSocket server started');
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();