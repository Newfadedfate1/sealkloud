import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, MessageSquare, User, Clock, Eye, EyeOff } from 'lucide-react';
import { ClientNotification, Ticket } from '../types/ticket';
import { useToast } from './Toast/ToastContainer';

interface ClientNotificationCenterProps {
  clientId: string;
  tickets: Ticket[];
  isOpen: boolean;
  onClose: () => void;
}

export const ClientNotificationCenter: React.FC<ClientNotificationCenterProps> = ({
  clientId,
  tickets,
  isOpen,
  onClose
}) => {
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAll, setShowAll] = useState(false);

  // Get all notifications for this client's tickets
  useEffect(() => {
    const clientTickets = tickets.filter(ticket => ticket.clientId === clientId);
    const allNotifications = clientTickets.flatMap(ticket => ticket.clientNotifications || []);
    
    // Sort by timestamp (newest first)
    const sortedNotifications = allNotifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    setNotifications(sortedNotifications);
    setUnreadCount(sortedNotifications.filter(n => !n.isRead).length);
  }, [tickets, clientId]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
    
    addToast({
      type: 'success',
      title: 'All Notifications Read',
      message: 'All notifications have been marked as read',
      duration: 2000
    });
  };

  const getNotificationIcon = (type: ClientNotification['type']) => {
    switch (type) {
      case 'status_update':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'assignment':
        return <User className="h-5 w-5 text-green-500" />;
      case 'resolution':
        return <CheckCircle className="h-5 w-5 text-purple-500" />;
      case 'general':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: ClientNotification['type']) => {
    switch (type) {
      case 'status_update':
        return 'border-blue-200 bg-blue-50';
      case 'assignment':
        return 'border-green-200 bg-green-50';
      case 'resolution':
        return 'border-purple-200 bg-purple-50';
      case 'general':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">Notifications</h2>
                <p className="text-blue-100 text-sm">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-500">
                You'll receive notifications here when there are updates to your tickets.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Actions */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  {showAll ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showAll ? 'Show Less' : `Show All (${notifications.length})`}
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              {displayedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                    getNotificationColor(notification.type)
                  } ${!notification.isRead ? 'ring-2 ring-blue-200' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-gray-700 text-sm leading-relaxed mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              notification.type === 'status_update' ? 'bg-blue-100 text-blue-700' :
                              notification.type === 'assignment' ? 'bg-green-100 text-green-700' :
                              notification.type === 'resolution' ? 'bg-purple-100 text-purple-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {notification.type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-gray-400 hover:text-gray-600 p-1 rounded"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Show More/Less Button */}
              {notifications.length > 5 && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showAll ? 'Show Less' : `Show ${notifications.length - 5} More`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {notifications.length} total notification{notifications.length !== 1 ? 's' : ''}
            </span>
            <span>
              {unreadCount} unread
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 