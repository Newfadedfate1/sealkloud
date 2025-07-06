import WebSocket from 'ws';
import http from 'http';

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected users and their WebSocket connections
const connectedUsers = new Map();
const userRooms = new Map();

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection established');

  let currentUser = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(ws, data);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    if (currentUser) {
      console.log(`User ${currentUser.userName} disconnected`);
      connectedUsers.delete(currentUser.userId);
      
      // Notify other users about disconnection
      broadcastToAll({
        type: 'user_offline',
        userId: currentUser.userId,
        userName: currentUser.userName
      }, ws);
    }
  });

  function handleMessage(ws, data) {
    switch (data.type) {
      case 'user_join':
        currentUser = {
          userId: data.userId,
          userName: data.userName,
          userRole: data.userRole,
          ws: ws
        };
        
        connectedUsers.set(data.userId, currentUser);
        console.log(`User ${data.userName} joined the chat`);
        
        // Send list of online users to the new user
        const onlineUsers = Array.from(connectedUsers.values()).map(user => ({
          userId: user.userId,
          userName: user.userName,
          userRole: user.userRole,
          status: 'online'
        }));
        
        ws.send(JSON.stringify({
          type: 'online_users',
          users: onlineUsers
        }));
        
        // Notify other users about new user
        broadcastToAll({
          type: 'user_online',
          userId: data.userId,
          userName: data.userName,
          userRole: data.userRole
        }, ws);
        break;

      case 'message':
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Store message in database (you can implement this)
        const messageData = {
          messageId,
          senderId: data.senderId,
          senderName: data.senderName,
          receiverId: data.receiverId,
          content: data.content,
          timestamp: data.timestamp,
          type: 'text'
        };
        
        // Send message to receiver
        const receiver = connectedUsers.get(data.receiverId);
        if (receiver) {
          receiver.ws.send(JSON.stringify({
            type: 'message',
            ...messageData
          }));
        }
        
        // Send confirmation to sender
        ws.send(JSON.stringify({
          type: 'message_sent',
          messageId,
          timestamp: data.timestamp
        }));
        break;

      case 'typing_start':
        const typingReceiver = connectedUsers.get(data.receiverId);
        if (typingReceiver) {
          typingReceiver.ws.send(JSON.stringify({
            type: 'typing_start',
            senderId: data.senderId,
            userName: data.senderName
          }));
        }
        break;

      case 'typing_stop':
        const typingStopReceiver = connectedUsers.get(data.receiverId);
        if (typingStopReceiver) {
          typingStopReceiver.ws.send(JSON.stringify({
            type: 'typing_stop',
            senderId: data.senderId,
            userName: data.senderName
          }));
        }
        break;

      case 'join_room':
        // Handle room-based messaging (for team chats)
        const roomId = data.roomId;
        if (!userRooms.has(roomId)) {
          userRooms.set(roomId, new Set());
        }
        userRooms.get(roomId).add(data.userId);
        
        ws.send(JSON.stringify({
          type: 'room_joined',
          roomId: roomId
        }));
        break;

      case 'room_message':
        // Handle room-based messaging
        const room = userRooms.get(data.roomId);
        if (room) {
          const roomMessageId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          room.forEach(userId => {
            const user = connectedUsers.get(userId);
            if (user && user.userId !== data.senderId) {
              user.ws.send(JSON.stringify({
                type: 'room_message',
                messageId: roomMessageId,
                senderId: data.senderId,
                senderName: data.senderName,
                roomId: data.roomId,
                content: data.content,
                timestamp: data.timestamp
              }));
            }
          });
        }
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  }
});

function broadcastToAll(data, excludeWs = null) {
  wss.clients.forEach((client) => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Start server function
export function startChatServer() {
  const PORT = process.env.CHAT_PORT || 3002;
  server.listen(PORT, () => {
    console.log(`💬 Chat WebSocket server running on port ${PORT}`);
  });
}

export { wss, connectedUsers, userRooms }; 