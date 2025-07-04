import React, { useState } from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle, Users, Activity, Target, Zap, Eye, Calendar, Filter } from 'lucide-react';

interface AnalyticsData {
  ticketMetrics: {
    total: number;
    resolved: number;
    active: number;
    avgResolutionTime: number;
    satisfactionScore: number;
  };
  trends: {
    weekly: Array<{ date: string; tickets: number; resolved: number }>;
    monthly: Array<{ month: string; tickets: number; avgTime: number }>;
  };
  predictions: {
    nextWeekTickets: number;
    estimatedResolutionTime: string;
    satisfactionPrediction: number;
  };
  insights: Array<{
    type: 'positive' | 'warning' | 'info';
    title: string;
    description: string;
    action?: string;
  }>;
}

interface ClientAnalyticsProps {
  userId: string;
  onClose: () => void;
}

// Mock analytics data - replace with actual API calls
const getAnalyticsData = async (userId: string): Promise<AnalyticsData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    ticketMetrics: {
      total: 24,
      resolved: 18,
      active: 6,
      avgResolutionTime: 3.2,
      satisfactionScore: 4.6
    },
    trends: {
      weekly: [
        { date: 'Mon', tickets: 3, resolved: 2 },
        { date: 'Tue', tickets: 2, resolved: 3 },
        { date: 'Wed', tickets: 4, resolved: 1 },
        { date: 'Thu', tickets: 1, resolved: 4 },
        { date: 'Fri', tickets: 2, resolved: 2 },
        { date: 'Sat', tickets: 1, resolved: 1 },
        { date: 'Sun', tickets: 0, resolved: 0 }
      ],
      monthly: [
        { month: 'Jan', tickets: 12, avgTime: 4.1 },
        { month: 'Feb', tickets: 15, avgTime: 3.8 },
        { month: 'Mar', tickets: 18, avgTime: 3.5 },
        { month: 'Apr', tickets: 14, avgTime: 3.2 },
        { month: 'May', tickets: 16, avgTime: 3.0 },
        { month: 'Jun', tickets: 24, avgTime: 3.2 }
      ]
    },
    predictions: {
      nextWeekTickets: 8,
      estimatedResolutionTime: '2.8 hours',
      satisfactionPrediction: 4.7
    },
    insights: [
      {
        type: 'positive',
        title: 'Improving Response Times',
        description: 'Your average resolution time has improved by 15% this month compared to last month.',
        action: 'View details'
      },
      {
        type: 'warning',
        title: 'High Priority Tickets',
        description: 'You have 2 high-priority tickets that may need immediate attention.',
        action: 'Review tickets'
      },
      {
        type: 'info',
        title: 'Peak Usage Time',
        description: 'Most of your tickets are created between 9 AM - 11 AM. Consider scheduling support calls during this time.',
        action: 'Schedule call'
      }
    ]
  };
};

export const ClientAnalytics: React.FC<ClientAnalyticsProps> = ({
  userId,
  onClose
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('week');

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const analyticsData = await getAnalyticsData(userId);
        setData(analyticsData);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Eye;
      default: return Activity;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'warning': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'info': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
          <p className="text-gray-500 dark:text-gray-400">Analytics data will appear here once you create some tickets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
            <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Analytics</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Personalized insights and predictions</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.ticketMetrics.total}</div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Resolved</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.ticketMetrics.resolved}</div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Avg Resolution</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.ticketMetrics.avgResolutionTime}h</div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Satisfaction</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.ticketMetrics.satisfactionScore}/5</div>
        </div>
      </div>

      {/* Predictions */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-6 text-white mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="h-6 w-6" />
          <h3 className="text-lg font-semibold">AI Predictions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-blue-100 text-sm">Next Week Tickets</p>
            <p className="text-2xl font-bold">{data.predictions.nextWeekTickets}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Est. Resolution Time</p>
            <p className="text-2xl font-bold">{data.predictions.estimatedResolutionTime}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Satisfaction Prediction</p>
            <p className="text-2xl font-bold">{data.predictions.satisfactionPrediction}/5</p>
          </div>
        </div>
      </div>

      {/* Trends */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ticket Trends</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeframe === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeframe === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe('quarter')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeframe === 'quarter'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Quarter
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="space-y-3">
            {timeframe === 'week' && data.trends.weekly.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{day.date}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-900 dark:text-white">Created: {day.tickets}</span>
                  <span className="text-sm text-green-600">Resolved: {day.resolved}</span>
                </div>
              </div>
            ))}
            {timeframe === 'month' && data.trends.monthly.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{month.month}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-900 dark:text-white">Tickets: {month.tickets}</span>
                  <span className="text-sm text-orange-600">Avg Time: {month.avgTime}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Insights</h3>
        <div className="space-y-3">
          {data.insights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            return (
              <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{insight.description}</p>
                    {insight.action && (
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                        {insight.action} →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 