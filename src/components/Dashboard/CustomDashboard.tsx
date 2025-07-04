import React, { useState, useEffect } from 'react';
import { Grid, Settings, Save, Plus, X, BarChart3, Users, Ticket, Activity } from 'lucide-react';
import { TicketStatsCard } from './TicketStatsCard';
import { ClientTicketChart } from './ClientTicketChart';
import { AuditLogViewer } from '../Admin/AuditLogViewer';

export interface DashboardWidget {
  id: string;
  type: 'stats' | 'chart' | 'table' | 'activity';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config?: any;
}

const availableWidgets = [
  { type: 'stats', title: 'Ticket Statistics', icon: Ticket },
  { type: 'chart', title: 'Client Distribution', icon: BarChart3 },
  { type: 'table', title: 'Recent Activity', icon: Activity },
  { type: 'stats', title: 'User Overview', icon: Users },
];

export const CustomDashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  useEffect(() => {
    // Load saved dashboard layout from localStorage
    const savedLayout = localStorage.getItem('dashboard-layout');
    if (savedLayout) {
      setWidgets(JSON.parse(savedLayout));
    } else {
      // Default layout
      setWidgets([
        {
          id: '1',
          type: 'stats',
          title: 'Ticket Statistics',
          position: { x: 0, y: 0, w: 3, h: 1 },
        },
        {
          id: '2',
          type: 'chart',
          title: 'Client Distribution',
          position: { x: 3, y: 0, w: 6, h: 2 },
        },
      ]);
    }
  }, []);

  const saveLayout = () => {
    localStorage.setItem('dashboard-layout', JSON.stringify(widgets));
    setIsEditing(false);
  };

  const addWidget = (widgetType: string, title: string) => {
    const newWidget: DashboardWidget = {
      id: Date.now().toString(),
      type: widgetType as any,
      title,
      position: { x: 0, y: widgets.length, w: 3, h: 1 },
    };
    setWidgets([...widgets, newWidget]);
    setShowWidgetMenu(false);
  };

  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };

  const moveWidget = (widgetId: string, newPosition: { x: number; y: number; w: number; h: number }) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId ? { ...w, position: newPosition } : w
    ));
  };

  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'stats':
        return (
          <div className="grid grid-cols-2 gap-4">
            <TicketStatsCard
              title="Total Tickets"
              count={156}
              icon={Ticket}
              color="text-blue-600"
              bgColor="bg-blue-100"
              change="+12%"
            />
            <TicketStatsCard
              title="Active Users"
              count={89}
              icon={Users}
              color="text-green-600"
              bgColor="bg-green-100"
              change="+5%"
            />
          </div>
        );
      case 'chart':
        return <ClientTicketChart data={[]} />;
      case 'table':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>New ticket created - TK-001</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Ticket resolved - TK-002</span>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Custom Dashboard</h1>
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              onClick={saveLayout}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              <Save className="h-4 w-4" />
              Save Layout
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <Settings className="h-4 w-4" />
            {isEditing ? 'Done' : 'Customize'}
          </button>
          {isEditing && (
            <button
              onClick={() => setShowWidgetMenu(!showWidgetMenu)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              <Plus className="h-4 w-4" />
              Add Widget
            </button>
          )}
        </div>
      </div>

      {/* Widget Menu */}
      {showWidgetMenu && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Add Widget</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availableWidgets.map((widget) => (
              <button
                key={widget.type}
                onClick={() => addWidget(widget.type, widget.title)}
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <widget.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">{widget.title}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-12 gap-4 auto-rows-min">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={`col-span-${widget.position.w} row-span-${widget.position.h} bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${
              isEditing ? 'cursor-move' : ''
            }`}
            style={{
              gridColumn: `span ${widget.position.w}`,
              gridRow: `span ${widget.position.h}`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{widget.title}</h3>
              {isEditing && (
                <button
                  onClick={() => removeWidget(widget.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {renderWidget(widget)}
          </div>
        ))}
      </div>

      {widgets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Settings className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No widgets added</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Click "Customize" and "Add Widget" to start building your dashboard
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Get Started
          </button>
        </div>
      )}
    </div>
  );
}; 