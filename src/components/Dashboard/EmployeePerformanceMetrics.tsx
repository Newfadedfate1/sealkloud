import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, CheckCircle, Star, Users, Target, Activity, Calendar, BarChart3, Zap, Award, AlertTriangle } from 'lucide-react';

interface PerformanceMetrics {
  // Daily Metrics
  dailyStats: {
    ticketsResolved: number;
    avgResolutionTime: number;
    customerSatisfaction: number;
    firstCallResolution: number;
    activeTickets: number;
    breakTime: number;
  };
  
  // Weekly Trends
  weeklyTrends: Array<{
    date: string;
    resolved: number;
    avgTime: number;
    satisfaction: number;
  }>;
  
  // Monthly Performance
  monthlyStats: {
    totalResolved: number;
    avgResolutionTime: number;
    satisfactionScore: number;
    efficiencyScore: number;
    improvement: number;
  };
  
  // Goals & Targets
  goals: {
    dailyTarget: number;
    weeklyTarget: number;
    monthlyTarget: number;
    currentProgress: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  };
  
  // Achievements
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    earned: boolean;
    progress?: number;
  }>;
}

interface EmployeePerformanceMetricsProps {
  userId: string;
  userRole: 'employee_l1' | 'employee_l2' | 'employee_l3';
  onClose: () => void;
}

// Mock performance data - replace with actual API calls
const getPerformanceMetrics = async (userId: string, role: string): Promise<PerformanceMetrics> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const baseMetrics = {
    dailyStats: {
      ticketsResolved: 12,
      avgResolutionTime: 2.4,
      customerSatisfaction: 4.6,
      firstCallResolution: 78,
      activeTickets: 3,
      breakTime: 45
    },
    weeklyTrends: [
      { date: 'Mon', resolved: 8, avgTime: 2.1, satisfaction: 4.5 },
      { date: 'Tue', resolved: 12, avgTime: 2.3, satisfaction: 4.6 },
      { date: 'Wed', resolved: 10, avgTime: 2.5, satisfaction: 4.4 },
      { date: 'Thu', resolved: 15, avgTime: 2.2, satisfaction: 4.7 },
      { date: 'Fri', resolved: 11, avgTime: 2.4, satisfaction: 4.6 },
      { date: 'Sat', resolved: 6, avgTime: 2.8, satisfaction: 4.3 },
      { date: 'Sun', resolved: 4, avgTime: 3.1, satisfaction: 4.2 }
    ],
    monthlyStats: {
      totalResolved: 245,
      avgResolutionTime: 2.4,
      satisfactionScore: 4.6,
      efficiencyScore: 87,
      improvement: 12
    },
    goals: {
      dailyTarget: 15,
      weeklyTarget: 75,
      monthlyTarget: 300,
      currentProgress: {
        daily: 12,
        weekly: 66,
        monthly: 245
      }
    },
    achievements: [
      {
        id: 'speed-demon',
        title: 'Speed Demon',
        description: 'Resolve 10+ tickets in a day',
        icon: 'Zap',
        earned: true
      },
      {
        id: 'satisfaction-master',
        title: 'Satisfaction Master',
        description: 'Maintain 4.5+ satisfaction for 30 days',
        icon: 'Star',
        earned: true
      },
      {
        id: 'first-call-expert',
        title: 'First Call Expert',
        description: '80%+ first call resolution rate',
        icon: 'CheckCircle',
        earned: false,
        progress: 78
      },
      {
        id: 'consistency-champion',
        title: 'Consistency Champion',
        description: 'Meet daily targets for 5 consecutive days',
        icon: 'Target',
        earned: false,
        progress: 3
      }
    ]
  };

  // Role-specific adjustments
  if (role === 'employee_l2') {
    baseMetrics.dailyStats.avgResolutionTime = 3.2;
    baseMetrics.dailyStats.ticketsResolved = 8;
    baseMetrics.goals.dailyTarget = 10;
    baseMetrics.goals.weeklyTarget = 50;
    baseMetrics.goals.monthlyTarget = 200;
  } else if (role === 'employee_l3') {
    baseMetrics.dailyStats.avgResolutionTime = 4.5;
    baseMetrics.dailyStats.ticketsResolved = 5;
    baseMetrics.goals.dailyTarget = 6;
    baseMetrics.goals.weeklyTarget = 30;
    baseMetrics.goals.monthlyTarget = 120;
  }

  return baseMetrics;
};

export const EmployeePerformanceMetrics: React.FC<EmployeePerformanceMetricsProps> = ({
  userId,
  userRole,
  onClose
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await getPerformanceMetrics(userId, userRole);
        setMetrics(data);
      } catch (error) {
        console.error('Failed to load performance metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, [userId, userRole]);

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return Zap;
      case 'Star': return Star;
      case 'CheckCircle': return CheckCircle;
      case 'Target': return Target;
      case 'Award': return Award;
      default: return Activity;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading performance metrics...</span>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
          <p className="text-gray-500 dark:text-gray-400">Performance metrics will appear here once you start working on tickets.</p>
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Performance Metrics</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your productivity and efficiency insights</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTimeframe('daily')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            timeframe === 'daily'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setTimeframe('weekly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            timeframe === 'weekly'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setTimeframe('monthly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            timeframe === 'monthly'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Monthly
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Resolved</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {timeframe === 'daily' ? metrics.dailyStats.ticketsResolved : 
             timeframe === 'weekly' ? metrics.weeklyTrends.reduce((sum, day) => sum + day.resolved, 0) :
             metrics.monthlyStats.totalResolved}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Avg Time</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {timeframe === 'daily' ? metrics.dailyStats.avgResolutionTime :
             timeframe === 'weekly' ? (metrics.weeklyTrends.reduce((sum, day) => sum + day.avgTime, 0) / metrics.weeklyTrends.length).toFixed(1) :
             metrics.monthlyStats.avgResolutionTime}h
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Satisfaction</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {timeframe === 'daily' ? metrics.dailyStats.customerSatisfaction :
             timeframe === 'weekly' ? (metrics.weeklyTrends.reduce((sum, day) => sum + day.satisfaction, 0) / metrics.weeklyTrends.length).toFixed(1) :
             metrics.monthlyStats.satisfactionScore}/5
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {timeframe === 'daily' ? metrics.dailyStats.firstCallResolution :
             timeframe === 'weekly' ? 82 :
             metrics.monthlyStats.efficiencyScore}%
          </div>
        </div>
      </div>

      {/* Goals Progress */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-6 text-white mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Target className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Goals Progress</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-blue-100 text-sm mb-2">Daily Target</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold">{metrics.goals.currentProgress.daily}</span>
              <span className="text-blue-200">/ {metrics.goals.dailyTarget}</span>
            </div>
            <div className="w-full bg-blue-400 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressBarColor((metrics.goals.currentProgress.daily / metrics.goals.dailyTarget) * 100)}`}
                style={{ width: `${Math.min((metrics.goals.currentProgress.daily / metrics.goals.dailyTarget) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <p className="text-blue-100 text-sm mb-2">Weekly Target</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold">{metrics.goals.currentProgress.weekly}</span>
              <span className="text-blue-200">/ {metrics.goals.weeklyTarget}</span>
            </div>
            <div className="w-full bg-blue-400 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressBarColor((metrics.goals.currentProgress.weekly / metrics.goals.weeklyTarget) * 100)}`}
                style={{ width: `${Math.min((metrics.goals.currentProgress.weekly / metrics.goals.weeklyTarget) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <p className="text-blue-100 text-sm mb-2">Monthly Target</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold">{metrics.goals.currentProgress.monthly}</span>
              <span className="text-blue-200">/ {metrics.goals.monthlyTarget}</span>
            </div>
            <div className="w-full bg-blue-400 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressBarColor((metrics.goals.currentProgress.monthly / metrics.goals.monthlyTarget) * 100)}`}
                style={{ width: `${Math.min((metrics.goals.currentProgress.monthly / metrics.goals.monthlyTarget) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.achievements.map((achievement) => {
            const Icon = getAchievementIcon(achievement.icon);
            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border ${
                  achievement.earned
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    achievement.earned
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium mb-1 ${
                      achievement.earned
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {achievement.description}
                    </p>
                    {!achievement.earned && achievement.progress !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${achievement.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {achievement.progress}%
                        </span>
                      </div>
                    )}
                  </div>
                  {achievement.earned && (
                    <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 