import React, { useState } from 'react';
import { Brain, Zap, Lightbulb, Clock, AlertTriangle, CheckCircle, Search, Sparkles } from 'lucide-react';

interface TicketSuggestion {
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  suggestedSolutions: string[];
  estimatedResolutionTime: string;
  similarTickets: Array<{
    id: string;
    title: string;
    status: string;
    resolution: string;
  }>;
}

interface SmartTicketAssistantProps {
  ticketContent: string;
  onSuggestionSelect: (suggestion: TicketSuggestion) => void;
  onClose: () => void;
}

// Mock AI service - replace with actual OpenAI API call
const analyzeTicketContent = async (content: string): Promise<TicketSuggestion> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock AI analysis based on keywords
  const keywords = content.toLowerCase();
  let category = 'General';
  let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  let confidence = 0.85;
  let suggestedSolutions: string[] = [];
  let estimatedResolutionTime = '2-4 hours';
  
  // Simple keyword-based categorization (replace with actual AI)
  if (keywords.includes('login') || keywords.includes('password') || keywords.includes('access')) {
    category = 'Authentication';
    priority = 'high';
    suggestedSolutions = [
      'Reset password using the forgot password link',
      'Check if account is locked due to multiple failed attempts',
      'Verify email address is correct'
    ];
    estimatedResolutionTime = '1-2 hours';
  } else if (keywords.includes('payment') || keywords.includes('billing') || keywords.includes('invoice')) {
    category = 'Billing';
    priority = 'medium';
    suggestedSolutions = [
      'Check payment method on file',
      'Review recent billing statements',
      'Contact billing department for clarification'
    ];
    estimatedResolutionTime = '4-8 hours';
  } else if (keywords.includes('error') || keywords.includes('bug') || keywords.includes('crash')) {
    category = 'Technical Issue';
    priority = 'high';
    suggestedSolutions = [
      'Clear browser cache and cookies',
      'Try accessing from a different browser',
      'Check system requirements'
    ];
    estimatedResolutionTime = '2-6 hours';
  } else if (keywords.includes('feature') || keywords.includes('request') || keywords.includes('enhancement')) {
    category = 'Feature Request';
    priority = 'low';
    suggestedSolutions = [
      'Review existing feature documentation',
      'Check if similar functionality already exists',
      'Submit detailed requirements for consideration'
    ];
    estimatedResolutionTime = '1-3 days';
  }
  
  // Mock similar tickets
  const similarTickets = [
    {
      id: 'TK-001',
      title: 'Login issues with new password',
      status: 'resolved',
      resolution: 'Password reset completed successfully'
    },
    {
      id: 'TK-002', 
      title: 'Payment method not working',
      status: 'resolved',
      resolution: 'Updated payment information in account settings'
    }
  ];
  
  return {
    category,
    priority,
    confidence,
    suggestedSolutions,
    estimatedResolutionTime,
    similarTickets
  };
};

export const SmartTicketAssistant: React.FC<SmartTicketAssistantProps> = ({
  ticketContent,
  onSuggestionSelect,
  onClose
}) => {
  const [suggestion, setSuggestion] = useState<TicketSuggestion | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return AlertTriangle;
      case 'high': return Clock;
      case 'medium': return AlertTriangle;
      case 'low': return CheckCircle;
      default: return Clock;
    }
  };

  const handleAnalyze = async () => {
    if (!ticketContent.trim()) {
      setError('Please enter ticket content to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeTicketContent(ticketContent);
      setSuggestion(result);
    } catch (err) {
      setError('Failed to analyze ticket content. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySuggestion = () => {
    if (suggestion) {
      onSuggestionSelect(suggestion);
      onClose();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
            <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Smart Ticket Assistant</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered analysis and suggestions</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Analysis Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ticket Analysis</h3>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Content to analyze:</p>
          <p className="text-gray-900 dark:text-white">{ticketContent || 'No content provided'}</p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !ticketContent.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Analyze with AI
            </>
          )}
        </button>

        {error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {suggestion && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Suggestions</h3>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Suggested Category</h4>
              <div className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-medium">{suggestion.category}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({Math.round(suggestion.confidence * 100)}% confidence)
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Suggested Priority</h4>
              <div className="flex items-center gap-2">
                {React.createElement(getPriorityIcon(suggestion.priority), {
                  className: "h-4 w-4"
                })}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(suggestion.priority)}`}>
                  {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Estimated Resolution Time */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Estimated Resolution Time</h4>
            <p className="text-gray-600 dark:text-gray-400">{suggestion.estimatedResolutionTime}</p>
          </div>

          {/* Suggested Solutions */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Suggested Solutions</h4>
            <ul className="space-y-2">
              {suggestion.suggestedSolutions.map((solution, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{solution}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Similar Tickets */}
          {suggestion.similarTickets.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Similar Tickets</h4>
              <div className="space-y-2">
                {suggestion.similarTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.id} • {ticket.status}</p>
                    </div>
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium">
                      View →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplySuggestion}
              className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Apply Suggestions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 