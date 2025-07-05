import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Brain,
  Zap,
  Star,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';

interface AnalyticsData {
  performanceMetrics: {
    ticketsResolved: number;
    averageResolutionTime: number;
    customerSatisfaction: number;
    firstCallResolution: number;
    escalationRate: number;
  };
  trends: {
    daily: Array<{ date: string; tickets: number; resolved: number }>;
    weekly: Array<{ week: string; tickets: number; resolved: number }>;
    monthly: Array<{ month: string; tickets: number; resolved: number }>;
  };
  predictions: {
    nextWeekTickets: number;
    expectedWorkload: 'low' | 'medium' | 'high';
    peakHours: string[];
    recommendedActions: string[];
  };
  insights: Array<{
    id: string;
    type: 'performance' | 'trend' | 'prediction' | 'recommendation';
    title: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
    confidence: number;
    actionable: boolean;
  }>;
  comparisons: {
    personalVsTeam: {
      resolutionTime: { personal: number; team: number };
      satisfaction: { personal: number; team: number };
      efficiency: { personal: number; team: number };
    };
    personalVsBenchmark: {
      resolutionTime: { personal: number; benchmark: number };
      satisfaction: { personal: number; benchmark: number };
      efficiency: { personal: number; benchmark: number };
    };
  };
}

interface AdvancedAnalyticsDashboardProps {
  userRole: 'employee_l1' | 'employee_l2' | 'employee_l3';
  userId: string;
  onClose: () => void;
  onExportData?: (data: any) => void;
}

// Mock analytics data generation
const generateAnalyticsData = async (role: string, userId: string): Promise<AnalyticsData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate performance metrics
  const performanceMetrics = {
    ticketsResolved: Math.floor(Math.random() * 50) + 20,
    averageResolutionTime: Math.floor(Math.random() * 4) + 1,
    customerSatisfaction: Math.floor(Math.random() * 20) + 80,
    firstCallResolution: Math.floor(Math.random() * 30) + 70,
    escalationRate: Math.floor(Math.random() * 15) + 5
  };
  
  // Generate trends data
  const trends = {
    daily: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      tickets: Math.floor(Math.random() * 10) + 5,
      resolved: Math.floor(Math.random() * 8) + 3
    })),
    weekly: Array.from({ length: 4 }, (_, i) => ({
      week: `Week ${i + 1}`,
      tickets: Math.floor(Math.random() * 50) + 30,
      resolved: Math.floor(Math.random() * 40) + 25
    })),
    monthly: Array.from({ length: 6 }, (_, i) => ({
      month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
      tickets: Math.floor(Math.random() * 200) + 100,
      resolved: Math.floor(Math.random() * 180) + 90
    }))
  };
  
  // Generate predictions
  const predictions = {
    nextWeekTickets: Math.floor(Math.random() * 30) + 20,
    expectedWorkload: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
    peakHours: ['9:00 AM', '2:00 PM', '4:00 PM'],
    recommendedActions: [
      'Focus on high-priority tickets during peak hours',
      'Consider upskilling in database troubleshooting',
      'Improve documentation for faster resolution'
    ]
  };
  
  // Generate AI insights
  const insights = [
    {
      id: '1',
      type: 'performance' as const,
      title: 'Resolution Time Improvement',
      description: 'Your average resolution time has improved by 15% this month',
      impact: 'positive' as const,
      confidence: 85,
      actionable: false
    },
    {
      id: '2',
      type: 'trend' as const,
      title: 'Increasing Database Issues',
      description: 'Database-related tickets have increased by 25% this week',
      impact: 'neutral' as const,
      confidence: 78,
      actionable: true
    },
    {
      id: '3',
      type: 'prediction' as const,
      title: 'High Workload Expected',
      description: 'Next week is predicted to have 30% more tickets than average',
      impact: 'negative' as const,
      confidence: 92,
      actionable: true
    },
    {
      id: '4',
      type: 'recommendation' as const,
      title: 'Skill Development Opportunity',
      description: 'Consider training in advanced networking to handle more complex issues',
      impact: 'positive' as const,
      confidence: 88,
      actionable: true
    }
  ];
  
  // Generate comparisons
  const comparisons = {
    personalVsTeam: {
      resolutionTime: { personal: 2.5, team: 3.2 },
      satisfaction: { personal: 92, team: 88 },
      efficiency: { personal: 85, team: 78 }
    },
    personalVsBenchmark: {
      resolutionTime: { personal: 2.5, benchmark: 3.0 },
      satisfaction: { personal: 92, benchmark: 90 },
      efficiency: { personal: 85, benchmark: 82 }
    }
  };
  
  return {
    performanceMetrics,
    trends,
    predictions,
    insights,
    comparisons
  };
};

export const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
  userRole,
  userId,
  onClose,
  onExportData
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'predictions' | 'insights' | 'comparisons'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalyticsData();
  }, [userRole, userId, timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const data = await generateAnalyticsData(userRole, userId);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getWorkloadColor = (workload: string) => {
    switch (workload) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleExport = () => {
    if (analyticsData && onExportData) {
      onExportData(analyticsData);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center space-x-3">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium">Loading Analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Analytics</h3>
            <p className="text-gray-600 mb-4">Unable to load analytics data. Please try again.</p>
            <button
              onClick={loadAnalyticsData}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Advanced Analytics Dashboard</h2>
              <p className="text-sm text-gray-600">AI-powered insights and performance analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'trends', label: 'Trends', icon: TrendingUp },
              { id: 'predictions', label: 'Predictions', icon: Brain },
              { id: 'insights', label: 'AI Insights', icon: Eye },
              { id: 'comparisons', label: 'Comparisons', icon: Target }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Tickets Resolved</p>
                        <p className="text-2xl font-bold text-gray-900">{analyticsData.performanceMetrics.ticketsResolved}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Avg Resolution</p>
                        <p className="text-2xl font-bold text-gray-900">{analyticsData.performanceMetrics.averageResolutionTime}h</p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Satisfaction</p>
                        <p className="text-2xl font-bold text-gray-900">{analyticsData.performanceMetrics.customerSatisfaction}%</p>
                      </div>
                      <Star className="h-8 w-8 text-yellow-500" />
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">First Call Res.</p>
                        <p className="text-2xl font-bold text-gray-900">{analyticsData.performanceMetrics.firstCallResolution}%</p>
                      </div>
                      <Target className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Escalation Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{analyticsData.performanceMetrics.escalationRate}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-orange-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Insights */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {analyticsData.insights.slice(0, 4).map((insight) => (
                    <div
                      key={insight.id}
                      className={`border rounded-lg p-4 ${getImpactColor(insight.impact)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{insight.title}</h4>
                          <p className="text-sm mt-1">{insight.description}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                              {insight.confidence}% confidence
                            </span>
                            {insight.actionable && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
                                Actionable
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
              
              {/* Daily Trends */}
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Daily Ticket Volume</h4>
                <div className="grid grid-cols-7 gap-2">
                  {analyticsData.trends.daily.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-gray-600 mb-1">{day.date}</div>
                      <div className="bg-blue-100 rounded p-2">
                        <div className="text-sm font-medium text-blue-900">{day.tickets}</div>
                        <div className="text-xs text-blue-600">tickets</div>
                      </div>
                      <div className="text-xs text-green-600 mt-1">{day.resolved} resolved</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Trends */}
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Weekly Performance</h4>
                <div className="grid grid-cols-4 gap-4">
                  {analyticsData.trends.weekly.map((week, index) => (
                    <div key={index} className="text-center">
                      <div className="text-sm font-medium text-gray-900 mb-2">{week.week}</div>
                      <div className="bg-green-100 rounded-lg p-3">
                        <div className="text-lg font-bold text-green-900">{week.tickets}</div>
                        <div className="text-xs text-green-600">total tickets</div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{week.resolved} resolved</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'predictions' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">AI Predictions</h3>
              
              {/* Workload Prediction */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Next Week Workload</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getWorkloadColor(analyticsData.predictions.expectedWorkload)}`}>
                    {analyticsData.predictions.expectedWorkload.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{analyticsData.predictions.nextWeekTickets}</div>
                    <div className="text-sm text-gray-600">Expected Tickets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-medium text-gray-900">Peak Hours</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {analyticsData.predictions.peakHours.join(', ')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-medium text-gray-900">Efficiency</div>
                    <div className="text-sm text-green-600 mt-1">85% predicted</div>
                  </div>
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">AI Recommendations</h4>
                <div className="space-y-3">
                  {analyticsData.predictions.recommendedActions.map((action, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Brain className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analyticsData.insights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`border rounded-lg p-6 ${getImpactColor(insight.impact)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {insight.type === 'performance' && <Activity className="h-5 w-5" />}
                        {insight.type === 'trend' && <TrendingUp className="h-5 w-5" />}
                        {insight.type === 'prediction' && <Brain className="h-5 w-5" />}
                        {insight.type === 'recommendation' && <Zap className="h-5 w-5" />}
                        <span className="text-xs font-medium uppercase tracking-wide">
                          {insight.type}
                        </span>
                      </div>
                      <div className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                        {insight.confidence}%
                      </div>
                    </div>
                    <h4 className="font-medium text-sm mb-2">{insight.title}</h4>
                    <p className="text-sm mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {insight.actionable && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Actionable
                          </span>
                        )}
                      </div>
                      <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'comparisons' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Performance Comparisons</h3>
              
              {/* Personal vs Team */}
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Personal vs Team Performance</h4>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Resolution Time (hours)</div>
                    <div className="flex items-center justify-center space-x-4">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{analyticsData.comparisons.personalVsTeam.resolutionTime.personal}</div>
                        <div className="text-xs text-gray-500">You</div>
                      </div>
                      <div className="text-gray-400">vs</div>
                      <div>
                        <div className="text-2xl font-bold text-gray-400">{analyticsData.comparisons.personalVsTeam.resolutionTime.team}</div>
                        <div className="text-xs text-gray-500">Team</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Customer Satisfaction (%)</div>
                    <div className="flex items-center justify-center space-x-4">
                      <div>
                        <div className="text-2xl font-bold text-green-600">{analyticsData.comparisons.personalVsTeam.satisfaction.personal}</div>
                        <div className="text-xs text-gray-500">You</div>
                      </div>
                      <div className="text-gray-400">vs</div>
                      <div>
                        <div className="text-2xl font-bold text-gray-400">{analyticsData.comparisons.personalVsTeam.satisfaction.team}</div>
                        <div className="text-xs text-gray-500">Team</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Efficiency Score (%)</div>
                    <div className="flex items-center justify-center space-x-4">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{analyticsData.comparisons.personalVsTeam.efficiency.personal}</div>
                        <div className="text-xs text-gray-500">You</div>
                      </div>
                      <div className="text-gray-400">vs</div>
                      <div>
                        <div className="text-2xl font-bold text-gray-400">{analyticsData.comparisons.personalVsTeam.efficiency.team}</div>
                        <div className="text-xs text-gray-500">Team</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal vs Industry Benchmark */}
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Personal vs Industry Benchmark</h4>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Resolution Time (hours)</div>
                    <div className="flex items-center justify-center space-x-4">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{analyticsData.comparisons.personalVsBenchmark.resolutionTime.personal}</div>
                        <div className="text-xs text-gray-500">You</div>
                      </div>
                      <div className="text-gray-400">vs</div>
                      <div>
                        <div className="text-2xl font-bold text-gray-400">{analyticsData.comparisons.personalVsBenchmark.resolutionTime.benchmark}</div>
                        <div className="text-xs text-gray-500">Benchmark</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Customer Satisfaction (%)</div>
                    <div className="flex items-center justify-center space-x-4">
                      <div>
                        <div className="text-2xl font-bold text-green-600">{analyticsData.comparisons.personalVsBenchmark.satisfaction.personal}</div>
                        <div className="text-xs text-gray-500">You</div>
                      </div>
                      <div className="text-gray-400">vs</div>
                      <div>
                        <div className="text-2xl font-bold text-gray-400">{analyticsData.comparisons.personalVsBenchmark.satisfaction.benchmark}</div>
                        <div className="text-xs text-gray-500">Benchmark</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Efficiency Score (%)</div>
                    <div className="flex items-center justify-center space-x-4">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{analyticsData.comparisons.personalVsBenchmark.efficiency.personal}</div>
                        <div className="text-xs text-gray-500">You</div>
                      </div>
                      <div className="text-gray-400">vs</div>
                      <div>
                        <div className="text-2xl font-bold text-gray-400">{analyticsData.comparisons.personalVsBenchmark.efficiency.benchmark}</div>
                        <div className="text-xs text-gray-500">Benchmark</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 