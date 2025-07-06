import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  MessageSquare, 
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Ticket, TicketStatus } from '../../types/ticket';

interface RealTimeStatusTrackerProps {
  ticket: Ticket;
  currentUser: any;
  onStatusUpdate?: (status: TicketStatus) => void;
}

interface StatusStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  icon: React.ReactNode;
  timestamp?: Date;
  estimatedDuration?: number; // in minutes
}

export const RealTimeStatusTracker: React.FC<RealTimeStatusTrackerProps> = ({
  ticket,
  currentUser,
  onStatusUpdate
}) => {
  const [currentStep, setCurrentStep] = useState<string>('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);

  // Calculate time elapsed since ticket creation
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(ticket.submittedDate).getTime()) / 1000 / 60);
      setTimeElapsed(elapsed);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [ticket.submittedDate]);

  // Generate status steps based on ticket status
  const getStatusSteps = (): StatusStep[] => {
    const steps: StatusStep[] = [
      {
        id: 'submitted',
        title: 'Ticket Submitted',
        description: 'Your ticket has been received and is in our queue',
        status: 'completed',
        icon: <MessageSquare className="h-4 w-4" />,
        timestamp: new Date(ticket.submittedDate)
      },
      {
        id: 'assigned',
        title: 'Assigned to Agent',
        description: ticket.assignedToName 
          ? `Assigned to ${ticket.assignedToName}`
          : 'Waiting for assignment',
        status: ticket.assignedTo ? 'completed' : 'pending',
        icon: <User className="h-4 w-4" />,
        timestamp: ticket.assignmentTimestamp ? new Date(ticket.assignmentTimestamp) : undefined
      },
      {
        id: 'in-progress',
        title: 'Work in Progress',
        description: 'Agent is actively working on your issue',
        status: ticket.status === 'in-progress' ? 'active' : 
                ['resolved', 'closed'].includes(ticket.status) ? 'completed' : 'pending',
        icon: <Activity className="h-4 w-4" />,
        estimatedDuration: 30 // 30 minutes average
      },
      {
        id: 'resolution',
        title: 'Issue Resolved',
        description: 'Your issue has been resolved',
        status: ['resolved', 'closed'].includes(ticket.status) ? 'completed' : 'pending',
        icon: <CheckCircle className="h-4 w-4" />,
        timestamp: ticket.resolvedDate ? new Date(ticket.resolvedDate) : undefined
      }
    ];

    // Add escalation step if ticket has been escalated
    if (ticket.escalationHistory && ticket.escalationHistory.length > 0) {
      const lastEscalation = ticket.escalationHistory[ticket.escalationHistory.length - 1];
      steps.splice(2, 0, {
        id: 'escalated',
        title: `Escalated to Level ${lastEscalation.toLevel.toUpperCase()}`,
        description: lastEscalation.reason || 'Issue requires specialized attention',
        status: 'completed',
        icon: <TrendingUp className="h-4 w-4" />,
        timestamp: new Date(lastEscalation.timestamp)
      });
    }

    return steps;
  };

  const steps = getStatusSteps();
  const currentStepIndex = steps.findIndex(step => step.status === 'active');
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  // Calculate estimated time remaining
  useEffect(() => {
    if (currentStepIndex >= 0 && steps[currentStepIndex].estimatedDuration) {
      const remaining = steps[currentStepIndex].estimatedDuration! - timeElapsed;
      setEstimatedTimeRemaining(remaining > 0 ? remaining : 0);
    } else {
      setEstimatedTimeRemaining(null);
    }
  }, [currentStepIndex, steps, timeElapsed]);

  const getStepIcon = (step: StatusStep) => {
    const baseClasses = "h-6 w-6 rounded-full flex items-center justify-center";
    
    switch (step.status) {
      case 'completed':
        return (
          <div className={`${baseClasses} bg-green-100 text-green-600`}>
            {step.icon}
          </div>
        );
      case 'active':
        return (
          <div className={`${baseClasses} bg-blue-100 text-blue-600 animate-pulse`}>
            {step.icon}
          </div>
        );
      case 'pending':
        return (
          <div className={`${baseClasses} bg-gray-100 text-gray-400`}>
            {step.icon}
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} bg-gray-100 text-gray-400`}>
            {step.icon}
          </div>
        );
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ticket Progress
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Real-time status updates for ticket {ticket.id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
            <Zap className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-blue-600">Live Updates</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress: {Math.round(progressPercentage)}%
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {completedSteps} of {steps.length} steps completed
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Status Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {getStepIcon(step)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={`text-sm font-medium ${
                  step.status === 'active' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : step.status === 'completed'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.title}
                </h4>
                {step.timestamp && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {step.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {step.description}
              </p>
              {step.status === 'active' && step.estimatedDuration && (
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    Estimated time remaining: {formatDuration(estimatedTimeRemaining || 0)}
                  </span>
                </div>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-px h-8 ml-3 ${
                step.status === 'completed' 
                  ? 'bg-green-200 dark:bg-green-800' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Time Information */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Time Elapsed:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {formatDuration(timeElapsed)}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Current Status:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">
              {ticket.status.replace('-', ' ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 