import React from 'react';
import { TrendingUp, TrendingDown, Calendar, AlertCircle } from 'lucide-react';

interface DailyTicketData {
  date: string;
  created: number;
  resolved: number;
}

interface DailyTicketTrendsProps {
  data: DailyTicketData[];
}

export const DailyTicketTrends: React.FC<DailyTicketTrendsProps> = ({ data }) => {
  // Calculate summary metrics
  const totalCreated = data.reduce((sum, day) => sum + day.created, 0);
  const totalResolved = data.reduce((sum, day) => sum + day.resolved, 0);
  const backlog = totalCreated - totalResolved;
  const resolutionRate = totalCreated > 0 ? (totalResolved / totalCreated) * 100 : 0;
  
  // Get trend indicators
  const last3Days = data.slice(-3);
  const avgCreated = last3Days.reduce((sum, day) => sum + day.created, 0) / last3Days.length;
  const avgResolved = last3Days.reduce((sum, day) => sum + day.resolved, 0) / last3Days.length;
  const trend = avgResolved >= avgCreated ? 'positive' : 'negative';

  // Generate mock data for the last 7 days if no data provided
  const chartData = data.length > 0 ? data : [
    { date: 'Mon', created: 12, resolved: 10 },
    { date: 'Tue', created: 15, resolved: 14 },
    { date: 'Wed', created: 8, resolved: 12 },
    { date: 'Thu', created: 20, resolved: 18 },
    { date: 'Fri', created: 14, resolved: 16 },
    { date: 'Sat', created: 6, resolved: 8 },
    { date: 'Sun', created: 4, resolved: 6 }
  ];

  const maxValue = Math.max(...chartData.map(d => Math.max(d.created, d.resolved)));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Created</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalCreated}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Resolved</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{totalResolved}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Backlog</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{backlog}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Resolution Rate</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{resolutionRate.toFixed(1)}%</p>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              trend === 'positive' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {trend === 'positive' ? '✓' : '⚠'}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Ticket Trends</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Created</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Resolved</span>
            </div>
          </div>
        </div>
        
        <div className="relative h-64">
          {/* Chart Bars */}
          <div className="flex items-end justify-between h-48 gap-2">
            {chartData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                {/* Created Tickets Bar */}
                <div className="w-full flex flex-col items-center">
                  <div 
                    className="w-full bg-red-500 rounded-t-sm transition-all duration-300 hover:bg-red-600"
                    style={{ 
                      height: `${(day.created / maxValue) * 100}%`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">{day.created}</span>
                </div>
                
                {/* Resolved Tickets Bar */}
                <div className="w-full flex flex-col items-center">
                  <div 
                    className="w-full bg-green-500 rounded-t-sm transition-all duration-300 hover:bg-green-600"
                    style={{ 
                      height: `${(day.resolved / maxValue) * 100}%`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">{day.resolved}</span>
                </div>
                
                {/* Day Label */}
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2">{day.date}</span>
              </div>
            ))}
          </div>
          
          {/* Trend Line Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full">
              <defs>
                <linearGradient id="createdGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2"/>
                </linearGradient>
                <linearGradient id="resolvedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.2"/>
                </linearGradient>
              </defs>
              
              {/* Created tickets line */}
              <polyline
                fill="none"
                stroke="url(#createdGradient)"
                strokeWidth="2"
                points={chartData.map((day, index) => {
                  const x = (index / (chartData.length - 1)) * 100;
                  const y = 100 - ((day.created / maxValue) * 100);
                  return `${x}%,${y}%`;
                }).join(' ')}
              />
              
              {/* Resolved tickets line */}
              <polyline
                fill="none"
                stroke="url(#resolvedGradient)"
                strokeWidth="2"
                points={chartData.map((day, index) => {
                  const x = (index / (chartData.length - 1)) * 100;
                  const y = 100 - ((day.resolved / maxValue) * 100);
                  return `${x}%,${y}%`;
                }).join(' ')}
              />
            </svg>
          </div>
        </div>
        
        {/* Insights */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Weekly Insights</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {trend === 'positive' ? (
              <span className="text-green-600 dark:text-green-400">
                ✓ Resolution rate is keeping up with ticket creation. Team is performing well!
              </span>
            ) : (
              <span className="text-orange-600 dark:text-orange-400">
                ⚠ Ticket creation is outpacing resolution. Consider additional resources.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 