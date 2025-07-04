import React, { useState } from 'react';
import { Wrench, Search, BookOpen, Play, CheckCircle, AlertTriangle, ArrowRight, ChevronRight, ChevronDown, Zap, Lightbulb, Settings } from 'lucide-react';

interface TroubleshootingStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  completed?: boolean;
  result?: 'success' | 'error' | 'warning';
}

interface TroubleshootingGuide {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  steps: TroubleshootingStep[];
  tags: string[];
}

interface SelfServiceToolsProps {
  onClose: () => void;
  onCreateTicket: (ticketData: any) => void;
}

// Mock troubleshooting guides - replace with actual API
const troubleshootingGuides: TroubleshootingGuide[] = [
  {
    id: 'login-issues',
    title: 'Login Problems',
    description: 'Resolve common login and authentication issues',
    category: 'Authentication',
    difficulty: 'easy',
    estimatedTime: '5-10 minutes',
    steps: [
      {
        id: 'step1',
        title: 'Check your email address',
        description: 'Ensure you\'re using the correct email address associated with your account',
        action: 'Verify email format'
      },
      {
        id: 'step2',
        title: 'Reset your password',
        description: 'Use the forgot password link to reset your password',
        action: 'Reset password'
      },
      {
        id: 'step3',
        title: 'Clear browser cache',
        description: 'Clear your browser cache and cookies',
        action: 'Clear cache'
      },
      {
        id: 'step4',
        title: 'Try different browser',
        description: 'Attempt to login using a different web browser',
        action: 'Switch browser'
      }
    ],
    tags: ['login', 'password', 'authentication', 'browser']
  },
  {
    id: 'payment-issues',
    title: 'Payment Problems',
    description: 'Fix billing and payment-related issues',
    category: 'Billing',
    difficulty: 'medium',
    estimatedTime: '10-15 minutes',
    steps: [
      {
        id: 'step1',
        title: 'Check payment method',
        description: 'Verify your payment method is valid and not expired',
        action: 'Update payment method'
      },
      {
        id: 'step2',
        title: 'Review billing statement',
        description: 'Check your recent billing statements for any discrepancies',
        action: 'View statements'
      },
      {
        id: 'step3',
        title: 'Contact billing support',
        description: 'If issues persist, contact our billing department',
        action: 'Contact billing'
      }
    ],
    tags: ['payment', 'billing', 'credit card', 'invoice']
  },
  {
    id: 'performance-issues',
    title: 'Performance Issues',
    description: 'Improve system performance and speed',
    category: 'Technical',
    difficulty: 'medium',
    estimatedTime: '15-20 minutes',
    steps: [
      {
        id: 'step1',
        title: 'Check internet connection',
        description: 'Ensure you have a stable internet connection',
        action: 'Test connection'
      },
      {
        id: 'step2',
        title: 'Close unnecessary tabs',
        description: 'Close other browser tabs to free up memory',
        action: 'Close tabs'
      },
      {
        id: 'step3',
        title: 'Update browser',
        description: 'Make sure you\'re using the latest browser version',
        action: 'Update browser'
      },
      {
        id: 'step4',
        title: 'Disable browser extensions',
        description: 'Temporarily disable browser extensions that might interfere',
        action: 'Manage extensions'
      }
    ],
    tags: ['performance', 'speed', 'browser', 'internet']
  }
];

export const SelfServiceTools: React.FC<SelfServiceToolsProps> = ({
  onClose,
  onCreateTicket
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<TroubleshootingGuide | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showQuickActions, setShowQuickActions] = useState(true);

  const filteredGuides = troubleshootingGuides.filter(guide =>
    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleStepComplete = (stepId: string, result: 'success' | 'error' | 'warning') => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    
    // Update step result
    if (selectedGuide) {
      const updatedGuide = {
        ...selectedGuide,
        steps: selectedGuide.steps.map(step =>
          step.id === stepId ? { ...step, completed: true, result } : step
        )
      };
      setSelectedGuide(updatedGuide);
    }
  };

  const handleNextStep = () => {
    if (selectedGuide && currentStep < selectedGuide.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'hard': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getStepIcon = (step: TroubleshootingStep) => {
    if (step.completed) {
      return step.result === 'success' ? CheckCircle : AlertTriangle;
    }
    return Play;
  };

  const getStepColor = (step: TroubleshootingStep) => {
    if (!step.completed) return 'text-gray-400';
    return step.result === 'success' ? 'text-green-600' : 'text-orange-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
            <Wrench className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Self-Service Tools</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Fix issues yourself with guided solutions</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {!selectedGuide ? (
        <>
          {/* Quick Actions */}
          {showQuickActions && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => onCreateTicket({ category: 'Authentication', priority: 'medium' })}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                      <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Reset Password</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Quick password reset</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => onCreateTicket({ category: 'Billing', priority: 'medium' })}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Update Payment</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Change payment method</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for solutions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Troubleshooting Guides */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Troubleshooting Guides</h3>
            <div className="space-y-4">
              {filteredGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => setSelectedGuide(guide)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{guide.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(guide.difficulty)}`}>
                          {guide.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{guide.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>⏱️ {guide.estimatedTime}</span>
                        <span>📁 {guide.category}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Guide Header */}
          <div className="mb-6">
            <button
              onClick={() => {
                setSelectedGuide(null);
                setCurrentStep(0);
                setCompletedSteps(new Set());
              }}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to guides
            </button>
            
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{selectedGuide.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">{selectedGuide.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>⏱️ {selectedGuide.estimatedTime}</span>
                  <span>📁 {selectedGuide.category}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(selectedGuide.difficulty)}`}>
                    {selectedGuide.difficulty}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Step {currentStep + 1} of {selectedGuide.steps.length}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(((currentStep + 1) / selectedGuide.steps.length) * 100)}% complete
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / selectedGuide.steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Current Step */}
          <div className="mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${getStepColor(selectedGuide.steps[currentStep])}`}>
                  {React.createElement(getStepIcon(selectedGuide.steps[currentStep]), {
                    className: "h-6 w-6"
                  })}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {selectedGuide.steps[currentStep].title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedGuide.steps[currentStep].description}
                  </p>
                  
                  {selectedGuide.steps[currentStep].action && (
                    <div className="space-y-3">
                      <button
                        onClick={() => handleStepComplete(selectedGuide.steps[currentStep].id, 'success')}
                        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        {selectedGuide.steps[currentStep].action}
                      </button>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStepComplete(selectedGuide.steps[currentStep].id, 'error')}
                          className="flex-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          Didn't work
                        </button>
                        <button
                          onClick={() => handleStepComplete(selectedGuide.steps[currentStep].id, 'warning')}
                          className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          Partially worked
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePreviousStep}
              disabled={currentStep === 0}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Previous
            </button>
            
            {currentStep < selectedGuide.steps.length - 1 ? (
              <button
                onClick={handleNextStep}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={() => onCreateTicket({ category: selectedGuide.category, priority: 'medium' })}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Create Ticket
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}; 