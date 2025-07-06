import React, { useState } from 'react';
import {
  Home,
  Ticket,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Users,
  MessageSquare,
  Command
} from 'lucide-react';

interface SidebarProps {
  active: string;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

const navItems = [
  // { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
  // { id: 'tickets', label: 'Tickets', icon: <Ticket className="w-5 h-5" /> },
  { id: 'knowledge', label: 'Knowledge', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'team', label: 'Quick Actions', icon: <Command className="w-5 h-5" /> },
  { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ active, onNavigate, onLogout, collapsed: collapsedProp, onCollapse }) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = collapsedProp !== undefined ? collapsedProp : internalCollapsed;

  const handleCollapse = () => {
    if (onCollapse) {
      onCollapse(!collapsed);
    } else {
      setInternalCollapsed((c) => !c);
    }
  };

  return (
    <aside
      className={`h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'} fixed top-0 left-0 z-40`}
    >
      {/* Logo and Collapse Button */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {!collapsed && <span className="font-bold text-lg text-gray-900 dark:text-white">SealKloud</span>}
        </div>
        <button
          onClick={handleCollapse}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>
      {/* Navigation Items */}
      <nav className="flex-1 py-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg mx-2 my-1 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              active === item.id
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            } ${collapsed ? 'justify-center' : ''}`}
            title={item.label}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
      {/* Logout Button */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}; 