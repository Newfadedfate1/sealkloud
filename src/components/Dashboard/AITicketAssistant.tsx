import React, { useState, useEffect } from 'react';
import { Brain, MessageSquare, Clock, Target, TrendingUp, Lightbulb, CheckCircle, AlertTriangle, Zap, BookOpen, Users, BarChart3, Star, Flag, ArrowUp, ArrowDown, X } from 'lucide-react';

interface TicketAnalysis {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  category: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  estimatedTime: number;
  suggestedActions: string[];
  similarTickets: Array<{
    id: string;
    title: string;
    resolution: string;
    similarity: number;
  }>;
  aiInsights: string[];
  responseTemplates: Array<{
    title: string;
    content: string;
    tone: 'professional' | 'friendly' | 'technical' | 'empathetic';
  }>;
}

interface AITicketAssistantProps {
  ticket: any;
  userRole: 'employee_l1' | 'employee_l2' | 'employee_l3';
  onApplyAnalysis: (analysis: TicketAnalysis) => void;
  onApplyResponse: (response: string) => void;
  onClose: () => void;
}

// Mock AI analysis - replace with actual AI API calls
const analyzeTicket = async (ticket: any, role: string): Promise<TicketAnalysis> => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Analyze ticket content for keywords and patterns
  const content = `${ticket.title} ${ticket.description}`.toLowerCase();
  
  // Priority analysis
  let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  if (content.includes('urgent') || content.includes('critical') || content.includes('down')) {
    priority = 'critical';
  } else if (content.includes('important') || content.includes('high')) {
    priority = 'high';
  } else if (content.includes('minor') || content.includes('low')) {
    priority = 'low';
  }
  
  // Complexity analysis
  let complexity: 'simple' | 'moderate' | 'complex' | 'expert' = 'moderate';
  if (content.includes('database') || content.includes('server') || content.includes('infrastructure')) {
    complexity = 'expert';
  } else if (content.includes('configuration') || content.includes('technical')) {
    complexity = 'complex';
  } else if (content.includes('password') || content.includes('login') || content.includes('basic')) {
    complexity = 'simple';
  }
  
  // Category analysis
  let category = 'General';
  if (content.includes('password') || content.includes('login') || content.includes('auth')) {
    category = 'Authentication';
  } else if (content.includes('payment') || content.includes('billing') || content.includes('invoice')) {
    category = 'Billing';
  } else if (content.includes('database') || content.includes('data')) {
    category = 'Database';
  } else if (content.includes('network') || content.includes('connection')) {
    category = 'Network';
  }
  
  // Sentiment analysis
  let sentiment: 'positive' | 'neutral' | 'negative' | 'urgent' = 'neutral';
  if (content.includes('urgent') || content.includes('emergency')) {
    sentiment = 'urgent';
  } else if (content.includes('frustrated') || content.includes('angry') || content.includes('unhappy')) {
    sentiment = 'negative';
  } else if (content.includes('thank') || content.includes('appreciate')) {
    sentiment = 'positive';
  }
  
  // Time estimation based on complexity and role
  let estimatedTime = 2;
  if (complexity === 'expert') estimatedTime = 6;
  else if (complexity === 'complex') estimatedTime = 4;
  else if (complexity === 'simple') estimatedTime = 1;
  
  // Role-based adjustments
  if (role === 'employee_l1' && complexity === 'expert') {
    estimatedTime = 8; // L1 takes longer for expert issues
  } else if (role === 'employee_l3' && complexity === 'simple') {
    estimatedTime = 0.5; // L3 is faster for simple issues
  }
  
  // Generate suggested actions
  const suggestedActions = [];
  if (priority === 'critical') {
    suggestedActions.push('Immediate response required');
    suggestedActions.push('Escalate if not resolved within 1 hour');
  }
  if (complexity === 'expert' && role === 'employee_l1') {
    suggestedActions.push('Consider escalating to L2/L3');
  }
  if (sentiment === 'negative') {
    suggestedActions.push('Use empathetic tone in response');
    suggestedActions.push('Offer immediate assistance');
  }
  suggestedActions.push('Check knowledge base for similar solutions');
  suggestedActions.push('Update ticket with detailed progress');
  
  // Mock similar tickets
  const similarTickets = [
    {
      id: 'TKT-001',
      title: 'Password reset issue',
      resolution: 'Reset password through admin panel and sent new credentials via email',
      similarity: 85
    },
    {
      id: 'TKT-015',
      title: 'Login authentication problem',
      resolution: 'Cleared browser cache and updated security settings',
      similarity: 72
    }
  ];
  
  // AI insights
  const aiInsights = [];
  if (priority === 'critical') {
    aiInsights.push('High priority issue requiring immediate attention');
  }
  if (complexity === 'expert') {
    aiInsights.push('Complex technical issue - may require specialized knowledge');
  }
  if (sentiment === 'negative') {
    aiInsights.push('Customer appears frustrated - prioritize empathetic response');
  }
  aiInsights.push('Similar issues resolved in 2-4 hours average');
  aiInsights.push('Consider proactive communication to prevent escalation');
  
  // Response templates
  const responseTemplates = [
    {
      title: 'Professional Acknowledgment',
      content: `Dear ${ticket.clientName},\n\nThank you for reaching out to us regarding ${ticket.title}. I understand the importance of this issue and I'm here to help you resolve it.\n\nI'm currently investigating this matter and will provide you with a detailed update within the estimated timeframe of ${estimatedTime} hours.\n\nBest regards,\nSupport Team`,
      tone: 'professional' as const
    },
    {
      title: 'Technical Response',
      content: `Hi ${ticket.clientName},\n\nI've analyzed your ${ticket.title} issue. This appears to be a ${complexity} ${category.toLowerCase()} problem.\n\nBased on similar cases, I recommend the following approach:\n1. Verify system configuration\n2. Check recent changes\n3. Review error logs\n\nI'll begin troubleshooting immediately and keep you updated on progress.\n\nRegards,\nTechnical Support`,
      tone: 'technical' as const
    },
    {
      title: 'Empathetic Response',
      content: `Hello ${ticket.clientName},\n\nI completely understand how frustrating this ${ticket.title} issue must be for you. Please know that I'm here to help and will work diligently to get this resolved for you as quickly as possible.\n\nI'm prioritizing your case and will provide regular updates throughout the resolution process.\n\nThank you for your patience,\nSupport Team`,
      tone: 'empathetic' as const
    }
  ];
  
  return {
    id: ticket.id,
    priority,
    complexity,
    category,
    sentiment,
    estimatedTime,
    suggestedActions,
    similarTickets,
    aiInsights,
    responseTemplates
  };
};

export const AITicketAssistant: React.FC<AITicketAssistantProps> = ({
  ticket,
  userRole,
  onApplyAnalysis,
  onApplyResponse,
  onClose
}) => {
  const [analysis, setAnalysis] = useState<TicketAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'responses' | 'similar' | 'insights'>('analysis');

  useEffect(() => {
    if (ticket) {
      performAnalysis();
    }
  }, [ticket]);

  const performAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeTicket(ticket, userRole);
      setAnalysis(result);
      onApplyAnalysis(result);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'expert': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'complex': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'simple': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'urgent': return <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />;
      case 'negative': return <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />;
      case 'positive': return <Star className="h-5 w-5 text-green-500 dark:text-green-400" />;
      default: return <MessageSquare className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Ticket Assistant</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Smart analysis and response suggestions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'analysis', label: 'Analysis', icon: Target },
              { id: 'responses', label: 'Responses', icon: MessageSquare },
              { id: 'similar', label: 'Similar Tickets', icon: TrendingUp },
              { id: 'insights', label: 'AI Insights', icon: Lightbulb }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
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
          {isAnalyzing ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Analyzing ticket with AI...</p>
              </div>
            </div>
          ) : analysis ? (
            <>
              {activeTab === 'analysis' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ticket Analysis</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Priority & Complexity */}
                      <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Priority & Complexity</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Priority:</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(analysis.priority)}`}>
                                {analysis.priority.charAt(0).toUpperCase() + analysis.priority.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Complexity:</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(analysis.complexity)}`}>
                                {analysis.complexity.charAt(0).toUpperCase() + analysis.complexity.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{analysis.category}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Time:</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{analysis.estimatedTime} hours</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sentiment & Emotions */}
                      <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Customer Sentiment</h4>
                                                     <div className="flex items-center space-x-3 mb-3">
                             <div>{getSentimentIcon(analysis.sentiment)}</div>
                             <span className="font-medium text-gray-900 dark:text-white capitalize">{analysis.sentiment}</span>
                           </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Customer appears {analysis.sentiment === 'positive' ? 'satisfied' : analysis.sentiment === 'negative' ? 'frustrated' : 'neutral'} with the current situation.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Suggested Actions */}
                    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mt-6">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Suggested Actions</h4>
                      <div className="space-y-2">
                        {analysis.suggestedActions.map((action, index) => (
                          <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'responses' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Response Templates</h3>
                    
                    <div className="space-y-4">
                      {analysis.responseTemplates.map((template, index) => (
                        <div key={index} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">{template.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              template.tone === 'professional' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              template.tone === 'friendly' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              template.tone === 'empathetic' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                              template.tone === 'technical' ? 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {template.tone}
                            </span>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 mb-3">
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{template.content}</p>
                          </div>
                          <button
                            onClick={() => {
                              onApplyResponse(template.content);
                            }}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Use This Response
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'similar' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Similar Tickets</h3>
                    
                    <div className="space-y-4">
                      {analysis.similarTickets.map((similarTicket) => (
                        <div key={similarTicket.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{similarTicket.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Ticket {similarTicket.id}</p>
                            </div>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {similarTicket.similarity}% similar
                            </span>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                            <p className="text-sm text-gray-700 dark:text-gray-300">{similarTicket.resolution}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'insights' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Insights</h3>
                    
                    <div className="space-y-4">
                      {analysis.aiInsights.map((insight, index) => (
                        <div key={index} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <Lightbulb className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Analysis Failed</h3>
              <p className="text-gray-600 dark:text-gray-400">Unable to analyze the ticket. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 