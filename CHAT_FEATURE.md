# Real-Time Chat Feature

## Overview

The SealKloud Helpdesk now includes a comprehensive real-time chat system that enables instant communication between clients and team members. The chat feature is accessible through the "Messages" menu in the sidebar.

## Features

### 🚀 Real-Time Messaging
- Instant message delivery using WebSocket connections
- Typing indicators to show when someone is composing a message
- Message timestamps and read status
- Support for both one-on-one and team conversations

### 🔔 Smart Notifications
- Desktop notifications for new messages when chat is not active
- In-app notification system with message previews
- Click-to-open functionality to quickly access conversations
- Notification permission management

### 👥 User Management
- Online/offline status indicators
- User role-based access (clients, L1, L2, L3 employees)
- Real-time user presence updates
- Conversation history

### 💬 Chat Interface
- Modern, responsive chat UI
- Message bubbles with sender identification
- File attachment support (ready for implementation)
- Emoji support (ready for implementation)
- Voice and video call buttons (ready for implementation)

## Technical Architecture

### Frontend Components
- `ChatInterface.tsx` - Main chat window component
- `ChatNotification.tsx` - Notification system for new messages
- WebSocket client integration for real-time communication

### Backend Services
- WebSocket server (`chatServer.js`) for real-time messaging
- Message routing and delivery
- User presence management
- Room-based messaging for team conversations

### WebSocket Events
- `user_join` - User connects to chat
- `message` - Send/receive messages
- `typing_start/typing_stop` - Typing indicators
- `user_online/user_offline` - Presence updates
- `join_room` - Join team chat rooms
- `room_message` - Team chat messages

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install ws
```

### 2. Start the Servers
```bash
# Start the main API server (includes chat server)
cd server
npm start

# Or in development mode
npm run dev
```

### 3. Access Chat Feature
1. Log into the SealKloud Helpdesk
2. Click on "Messages" in the sidebar
3. Select a user to start chatting
4. Enable notifications when prompted

## Usage Guide

### Starting a Conversation
1. Open the Messages menu from the sidebar
2. Browse the list of available users (clients and team members)
3. Click on a user to start a conversation
4. Type your message and press Enter or click Send

### Managing Notifications
1. Click the notification bell icon in the chat header
2. Grant permission for desktop notifications
3. Notifications will appear for new messages when chat is not active
4. Click "Open Chat" in notifications to quickly access conversations

### Team Conversations
- Join team rooms for group discussions
- Messages are broadcast to all team members in the room
- Perfect for collaboration on complex tickets

## Configuration

### Environment Variables
```env
# Chat WebSocket server port (default: 3002)
CHAT_PORT=3002

# Client URL for CORS
CLIENT_URL=http://localhost:5173
```

### Notification Settings
- Desktop notifications require user permission
- In-app notifications work without permission
- Notification sound can be enabled/disabled in settings

## Security Features

- WebSocket connections are authenticated
- Message encryption (can be implemented)
- Rate limiting for message sending
- User role-based access control
- Input sanitization and validation

## Future Enhancements

### Planned Features
- [ ] File attachments and image sharing
- [ ] Voice and video calls
- [ ] Message search and history
- [ ] Chat rooms for specific ticket discussions
- [ ] Message reactions and emojis
- [ ] Message encryption
- [ ] Chat analytics and reporting
- [ ] Mobile app support

### Integration Opportunities
- [ ] Ticket-to-chat linking
- [ ] Automated responses based on ticket status
- [ ] Chat history in ticket details
- [ ] Escalation through chat
- [ ] AI-powered chat assistance

## Troubleshooting

### Common Issues

**WebSocket Connection Failed**
- Check if the chat server is running on port 3002
- Verify firewall settings
- Check browser console for connection errors

**Notifications Not Working**
- Ensure notification permissions are granted
- Check browser settings for the site
- Verify HTTPS is used in production

**Messages Not Delivering**
- Check user online status
- Verify WebSocket connection is active
- Check server logs for errors

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=chat:*
```

## API Reference

### WebSocket Events

#### Client to Server
```javascript
// Join chat
{
  type: 'user_join',
  userId: 'user123',
  userName: 'John Doe',
  userRole: 'employee_l1'
}

// Send message
{
  type: 'message',
  senderId: 'user123',
  senderName: 'John Doe',
  receiverId: 'client456',
  content: 'Hello!',
  timestamp: '2024-01-01T12:00:00Z'
}

// Typing indicator
{
  type: 'typing_start',
  senderId: 'user123',
  senderName: 'John Doe',
  receiverId: 'client456'
}
```

#### Server to Client
```javascript
// New message
{
  type: 'message',
  messageId: 'msg-123',
  senderId: 'client456',
  senderName: 'Jane Client',
  content: 'Hi there!',
  timestamp: '2024-01-01T12:00:00Z'
}

// User online
{
  type: 'user_online',
  userId: 'user123',
  userName: 'John Doe',
  userRole: 'employee_l1'
}
```

## Contributing

When contributing to the chat feature:

1. Follow the existing code style
2. Add tests for new functionality
3. Update documentation for new features
4. Test WebSocket connections thoroughly
5. Consider security implications of changes

## Support

For issues with the chat feature:
1. Check the troubleshooting section
2. Review server logs
3. Test with different browsers
4. Verify network connectivity
5. Contact the development team 