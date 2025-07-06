import React, { useEffect, useState } from 'react';
import { MessageSquare, X, Bell } from 'lucide-react';

interface ChatNotificationProps {
  message: {
    senderName: string;
    content: string;
    timestamp: Date;
  };
  onClose: () => void;
  onOpenChat: () => void;
}

export const ChatNotification: React.FC<ChatNotificationProps> = ({
  message,
  onClose,
  onOpenChat
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show notification with animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleOpenChat = () => {
    onOpenChat();
    handleClose();
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg flex-shrink-0">
            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {message.senderName}
              </h4>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
              {message.content}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {message.timestamp.toLocaleTimeString()}
              </span>
              
              <button
                onClick={handleOpenChat}
                className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
              >
                Open Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification manager component
interface NotificationManagerProps {
  notifications: Array<{
    id: string;
    senderName: string;
    content: string;
    timestamp: Date;
  }>;
  onRemoveNotification: (id: string) => void;
  onOpenChat: () => void;
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({
  notifications,
  onRemoveNotification,
  onOpenChat
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <ChatNotification
          key={notification.id}
          message={notification}
          onClose={() => onRemoveNotification(notification.id)}
          onOpenChat={onOpenChat}
        />
      ))}
    </div>
  );
}; 