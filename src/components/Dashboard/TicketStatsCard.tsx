import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface TicketStatsCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const TicketStatsCard: React.FC<TicketStatsCardProps> = ({
  title,
  count,
  icon: Icon,
  color,
  bgColor,
  change,
  trend
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 dark:text-green-400';
    if (trend === 'down') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{count}</p>
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          {change && (
            <p className={`text-sm ${getTrendColor()}`}>{change}</p>
          )}
        </div>
      </div>
    </div>
  );
};