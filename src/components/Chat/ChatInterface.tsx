import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, MessageSquare, Phone, Video, MoreVertical, Paperclip, Smile } from 'lucide-react';
import { User as UserType } from '../../types/user';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'notification';
  isRead: boolean;
}

interface ChatInterfaceProps {
  currentUser: UserType;
  onClose: () => void;
  isOpen: boolean;
  setChatNotifications?: (notifications: Array<{
    id: string;
    senderName: string;
    content: string;
    timestamp: Date;
  }>) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentUser, onClose, isOpen, setChatNotifications }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState<string | null>(null);

  // Clear unread count when chat is opened
  const handleChatSelect = (userId: string) => {
    setActiveChat(userId);
    // Clear unread count for this user
    setChatUsers(prev => 
      prev.map(u => 
        u.id === userId 
          ? { ...u, unreadCount: 0 }
          : u
      )
    );
  };
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [chatUsers, setChatUsers] = useState<Array<{
    id: string;
    name: string;
    role: string;
    status: 'online' | 'offline' | 'away';
    lastMessage?: string;
    lastMessageTime?: Date;
    unreadCount: number;
  }>>([]);

  // All available users (not shown until they send a message or are searched)
  const allAvailableUsers = [
    { id: 'client-1', name: 'John Client', role: 'client', status: 'online' as const, lastMessage: undefined, lastMessageTime: undefined, unreadCount: 0 },
    { id: 'client-2', name: 'Sarah Customer', role: 'client', status: 'online' as const, lastMessage: undefined, lastMessageTime: undefined, unreadCount: 0 },
    { id: 'client-3', name: 'Mike Business', role: 'client', status: 'offline' as const, lastMessage: undefined, lastMessageTime: undefined, unreadCount: 0 },
    { id: 'client-4', name: 'Lisa Johnson', role: 'client', status: 'online' as const, lastMessage: undefined, lastMessageTime: undefined, unreadCount: 0 },
    { id: 'client-5', name: 'David Wilson', role: 'client', status: 'away' as const, lastMessage: undefined, lastMessageTime: undefined, unreadCount: 0 },
    { id: 'l1-1', name: 'Alex Support', role: 'employee_l1', status: 'online' as const, lastMessage: undefined, lastMessageTime: undefined, unreadCount: 0 },
    { id: 'l1-2', name: 'Emma Helper', role: 'employee_l1', status: 'away' as const, lastMessage: undefined, lastMessageTime: undefined, unreadCount: 0 },
    { id: 'l1-3', name: 'Tom Assistant', role: 'employee_l1', status: 'online' as const, lastMessage: undefined, lastMessageTime: undefined, unreadCount: 0 },
    { id: 'l1-4', name: 'Maria Helper', role: 'employee_l1', status: 'offline' as const, lastMessage: undefined, lastMessageTime: undefined, unreadCount: 0 },
    { id: 'l2-1', name: 'Level 2 Tech', role: 'employee_l2', status: 'online' as const, lastMessage: undefined, lastMessageTime: undefined, unreadCount: 0 },
    { id: 'l2-2', name: 'Senior Support', role: 'employee_l2', status: 'away' as const, lastMessage: undefined, lastMessageTime: undefined, unreadCount: 0 },
    { id: 'l2-3', name: 'Tech Specialist', role: 'employee_l2', status: 'online' as const, lastMessage: undefined, lastMessageTime: undefined, unreadCount: 0 },
    { id: 'l3-1', name: 'Level 3 Expert', role: 'employee_l3', status: 'online' as const, lastMessage: undefined, lastMessageTime: undefined, unreadCount: 0 },
    { id: 'l3-2', name: 'System Admin', role: 'employee_l3', status: 'offline' as const, lastMessage: undefined, lastMessageTime: undefined, unreadCount: 0 },
    { id: 'l3-3', name: 'Senior Engineer', role: 'employee_l3', status: 'away' as const, lastMessage: undefined, lastMessageTime: undefined, unreadCount: 0 },
    { id: 'admin-1', name: 'Admin Manager', role: 'admin', status: 'online' as const, lastMessage: undefined, lastMessageTime: undefined, unreadCount: 0 },
    { id: 'admin-2', name: 'Super Admin', role: 'admin', status: 'away' as const, lastMessage: undefined, lastMessageTime: undefined, unreadCount: 0 },
    { id: 'admin-3', name: 'System Manager', role: 'admin', status: 'online' as const, lastMessage: undefined, lastMessageTime: undefined, unreadCount: 0 },
  ];

  // Filter users based on search term and chat history
  const filteredUsers = searchTerm.trim() 
    ? allAvailableUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.replace('_', ' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.replace('employee_', 'Level ').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : showNewChat ? allAvailableUsers : chatUsers;

  // Helper function to format role names for display
  const formatRoleName = (role: string) => {
    switch (role) {
      case 'employee_l1': return 'Level 1 Support';
      case 'employee_l2': return 'Level 2 Support';
      case 'employee_l3': return 'Level 3 Support';
      case 'admin': return 'Administrator';
      case 'client': return 'Client';
      default: return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Handle starting a new chat with a searched user
  const handleStartNewChat = (user: typeof allAvailableUsers[0]) => {
    // Add user to chat list if not already there
    const existingUser = chatUsers.find(u => u.id === user.id);
    if (!existingUser) {
      setChatUsers(prev => [...prev, {
        id: user.id,
        name: user.name,
        role: user.role,
        status: user.status as 'online' | 'offline' | 'away',
        lastMessage: undefined,
        lastMessageTime: undefined,
        unreadCount: 0
      }]);
    }
    handleChatSelect(user.id);
    setSearchTerm(''); // Clear search
  };

  // Add demo users to chat list for testing
  useEffect(() => {
    if (chatUsers.length === 0) {
      // Add a few demo users to show the interface
      setChatUsers([
        {
          id: 'client-1',
          name: 'John Client',
          role: 'client',
          status: 'online',
          lastMessage: 'Hi, I need help with my account',
          lastMessageTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          unreadCount: 2
        },
        {
          id: 'l2-1',
          name: 'Level 2 Tech',
          role: 'employee_l2',
          status: 'online',
          lastMessage: 'I can help you with that issue',
          lastMessageTime: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
          unreadCount: 0
        }
      ]);
    }
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (isOpen) {
      setConnectionStatus('connecting');
      // Use the correct WebSocket URL (port 3002 for chat server)
      const websocket = new WebSocket('ws://localhost:3002');
      
      websocket.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        // Send user info to server
        websocket.send(JSON.stringify({
          type: 'user_join',
          userId: currentUser.id,
          userName: `${currentUser.firstName} ${currentUser.lastName}`,
          userRole: currentUser.role
        }));
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleIncomingMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocket.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('disconnected');
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };

      setWs(websocket);

      return () => {
        websocket.close();
      };
    }
  }, [isOpen, currentUser]);

  const handleIncomingMessage = (data: any) => {
    switch (data.type) {
      case 'message':
        const newMsg: Message = {
          id: data.messageId || `msg-${Date.now()}`,
          senderId: data.senderId,
          senderName: data.senderName,
          content: data.content,
          timestamp: new Date(data.timestamp),
          type: 'text',
          isRead: false
        };
        setMessages(prev => [...prev, newMsg]);
        
        // Update chat users list with new message
        setChatUsers(prev => {
          const existingUser = prev.find(u => u.id === data.senderId);
          if (existingUser) {
            // Update existing user
            return prev.map(u => 
              u.id === data.senderId 
                ? { 
                    ...u, 
                    lastMessage: data.content,
                    lastMessageTime: new Date(data.timestamp),
                    unreadCount: activeChat === data.senderId ? u.unreadCount : u.unreadCount + 1
                  }
                : u
            );
          } else {
            // Add new user to chat list
            const newUser = allAvailableUsers.find(u => u.id === data.senderId);
            if (newUser) {
              return [...prev, {
                ...newUser,
                lastMessage: data.content,
                lastMessageTime: new Date(data.timestamp),
                unreadCount: activeChat === data.senderId ? 0 : 1
              }];
            }
            return prev;
          }
        });
        
        // Show notification if chat is not active or message is from different user
        if (activeChat !== data.senderId) {
          showNotification(data.senderName, data.content);
          // Add to notification state for the notification manager
          if (setChatNotifications) {
            const notificationId = `notification-${Date.now()}`;
            const newNotification = {
              id: notificationId,
              senderName: data.senderName,
              content: data.content,
              timestamp: new Date(data.timestamp)
            };
            setChatNotifications([newNotification]);
          }
        }
        break;
      
      case 'typing_start':
        setTypingUsers(prev => [...prev, data.userName]);
        break;
      
      case 'typing_stop':
        setTypingUsers(prev => prev.filter(name => name !== data.userName));
        break;
      
      case 'user_online':
        // Update user status
        console.log('User online:', data.userName);
        break;
      
      case 'user_offline':
        // Update user status
        console.log('User offline:', data.userName);
        break;
      
      case 'online_users':
        // Handle online users list
        console.log('Online users:', data.users);
        break;
      
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const showNotification = (senderName: string, content: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`New message from ${senderName}`, {
        body: content,
        icon: '/favicon.ico'
      });
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;

    // Add message to local state
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      receiverId: activeChat,
      content: newMessage,
      timestamp: new Date(),
      type: 'text',
      isRead: true
    };

    setMessages(prev => [...prev, newMsg]);

    // Send via WebSocket if connected
    if (ws && connectionStatus === 'connected') {
      const messageData = {
        type: 'message',
        senderId: currentUser.id,
        senderName: `${currentUser.firstName} ${currentUser.lastName}`,
        receiverId: activeChat,
        content: newMessage,
        timestamp: new Date().toISOString()
      };
      ws.send(JSON.stringify(messageData));
    } else {
      // Demo: Simulate response for testing
      setTimeout(() => {
        const demoResponse: Message = {
          id: `demo-${Date.now()}`,
          senderId: activeChat,
          senderName: allAvailableUsers.find(u => u.id === activeChat)?.name || 'Demo User',
          receiverId: currentUser.id,
          content: `Demo response to: "${newMessage}"`,
          timestamp: new Date(),
          type: 'text',
          isRead: false
        };
        setMessages(prev => [...prev, demoResponse]);
      }, 1000);
    }

    setNewMessage('');
  };

  const handleTyping = () => {
    if (!ws || !activeChat) return;

    if (!isTyping) {
      setIsTyping(true);
      ws.send(JSON.stringify({
        type: 'typing_start',
        senderId: currentUser.id,
        senderName: `${currentUser.firstName} ${currentUser.lastName}`,
        receiverId: activeChat
      }));
    }

    // Clear typing indicator after 2 seconds
    setTimeout(() => {
      setIsTyping(false);
      ws.send(JSON.stringify({
        type: 'typing_stop',
        senderId: currentUser.id,
        senderName: `${currentUser.firstName} ${currentUser.lastName}`,
        receiverId: activeChat
      }));
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
      isMinimized ? 'p-4' : 'p-0'
    }`}>
      <div className={`bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 ease-in-out ${
        isMinimized 
          ? 'w-full max-w-4xl h-[80vh] rounded-lg' 
          : 'w-full h-full max-w-none rounded-none'
      } flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Real-time Chat</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Connect with clients and team members</p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {connectionStatus}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={requestNotificationPermission}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title="Enable notifications"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title={isMinimized ? "Full Screen" : "Exit Full Screen"}
            >
              {isMinimized ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Close Chat"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Sidebar - User List */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col min-h-0">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                              <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {showNewChat ? 'New Chat' : 'Conversations'}
                  </h3>
                  <div className="flex items-center gap-2">
                    {showNewChat && (
                      <button
                        onClick={() => {
                          setShowNewChat(false);
                          setSearchTerm('');
                        }}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium"
                      >
                        Back
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowNewChat(!showNewChat);
                        setSearchTerm('');
                      }}
                      className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                    >
                      {showNewChat ? 'Cancel' : 'New Chat'}
                    </button>
                  </div>
                </div>
                              <div className="relative">
                  <input
                    type="text"
                    placeholder={showNewChat ? "Search by name, role, or level..." : "Search conversations..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
                {showNewChat && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => setSearchTerm('')}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        !searchTerm ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSearchTerm('admin')}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        searchTerm === 'admin' ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Admins
                    </button>
                    <button
                      onClick={() => setSearchTerm('level 3')}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        searchTerm === 'level 3' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Level 3
                    </button>
                    <button
                      onClick={() => setSearchTerm('level 2')}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        searchTerm === 'level 2' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Level 2
                    </button>
                    <button
                      onClick={() => setSearchTerm('level 1')}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        searchTerm === 'level 1' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Level 1
                    </button>
                    <button
                      onClick={() => setSearchTerm('client')}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        searchTerm === 'client' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Clients
                    </button>
                  </div>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto min-h-0">
              {filteredUsers.length > 0 ? (
                showNewChat ? (
                  // New Chat View - Grouped by role
                  <div className="space-y-4 p-2 pb-4">
                    {/* Quick Stats */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mx-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Available Users
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {filteredUsers.length} users found
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              {filteredUsers.filter(u => u.role === 'admin').length}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Admins</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {filteredUsers.filter(u => u.role.startsWith('employee')).length}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Support</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                              {filteredUsers.filter(u => u.role === 'client').length}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Clients</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {(() => {
                      const groupedUsers = filteredUsers.reduce((acc, user) => {
                        const role = user.role;
                        if (!acc[role]) acc[role] = [];
                        acc[role].push(user);
                        return acc;
                      }, {} as Record<string, typeof filteredUsers>);

                      return Object.entries(groupedUsers).map(([role, users]) => (
                        <div key={role} className="space-y-2">
                          <div className="px-3 py-2">
                            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                              {formatRoleName(role)} ({users.length})
                            </h4>
                          </div>
                          {users.map((user) => {
                            const isInChatList = chatUsers.some(u => u.id === user.id);
                            return (
                              <div
                                key={user.id}
                                onClick={() => isInChatList ? handleChatSelect(user.id) : handleStartNewChat(user)}
                                className={`mx-2 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                  activeChat === user.id 
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700' 
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                      user.role === 'admin' ? 'bg-purple-500' :
                                      user.role === 'employee_l3' ? 'bg-red-500' :
                                      user.role === 'employee_l2' ? 'bg-orange-500' :
                                      user.role === 'employee_l1' ? 'bg-blue-500' :
                                      'bg-green-500'
                                    }`}>
                                      <span className="text-white font-medium text-lg">
                                        {user.name.charAt(0)}
                                      </span>
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                                      user.status === 'online' ? 'bg-green-500' : 
                                      user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                                    }`}></div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                        {user.name}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        {isInChatList && (
                                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">
                                            In Chat
                                          </span>
                                        )}
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                          user.status === 'online' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' :
                                          user.status === 'away' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300' :
                                          'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                        }`}>
                                          {user.status}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                      {formatRoleName(user.role)}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs text-gray-500 dark:text-gray-500">
                                        {isInChatList ? 'Click to open conversation' : 'Click to start new chat'}
                                      </p>
                                      {user.unreadCount > 0 && (
                                        <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                          {user.unreadCount > 9 ? '9+' : user.unreadCount}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  // Regular Conversations View
                  filteredUsers.map((user) => {
                    const isInChatList = chatUsers.some(u => u.id === user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => isInChatList ? handleChatSelect(user.id) : handleStartNewChat(user)}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          activeChat === user.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-lg">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                              user.status === 'online' ? 'bg-green-500' : 
                              user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                            }`}></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white truncate">{user.name}</h4>
                              {user.lastMessageTime && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {user.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {user.lastMessage || `Start a conversation with ${user.name}`}
                              </p>
                              {user.unreadCount > 0 && (
                                <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
                                  {user.unreadCount > 9 ? '9+' : user.unreadCount}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatRoleName(user.role)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm.trim() ? 'No users found' : showNewChat ? 'No users available' : 'No conversations yet'}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    {searchTerm.trim() ? 'Try searching by name, role, or level' : 
                     showNewChat ? 'All available users are shown above' : 'Start chatting to see conversations here'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {allAvailableUsers.find(u => u.id === activeChat)?.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {allAvailableUsers.find(u => u.id === activeChat)?.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {typingUsers.length > 0 ? `${typingUsers.join(', ')} typing...` : 'Online'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <Phone className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <Video className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages
                    .filter(msg => 
                      (msg.senderId === activeChat && msg.receiverId === currentUser.id) || 
                      (msg.senderId === currentUser.id && msg.receiverId === activeChat) ||
                      (msg.senderId === activeChat && !msg.receiverId) ||
                      (msg.senderId === currentUser.id && !msg.receiverId)
                    )
                    .map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === currentUser.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === currentUser.id
                              ? 'text-blue-100'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            sendMessage();
                          } else {
                            handleTyping();
                          }
                        }}
                        placeholder="Type a message..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                      <Smile className="h-5 w-5" />
                    </button>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Choose a user from the sidebar to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 