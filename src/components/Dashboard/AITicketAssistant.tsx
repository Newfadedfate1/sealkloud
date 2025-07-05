import React, { useState, useEffect } from 'react';
import { Brain, MessageSquare, Clock, Target, TrendingUp, Lightbulb, CheckCircle, AlertTriangle, Zap, BookOpen, Users, BarChart3, Star, Flag, ArrowUp, ArrowDown } from 'lucide-react';

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
      tone: 'professional'
    },
    {
      title: 'Technical Response',
      content: `Hi ${ticket.clientName},\n\nI've analyzed your ${ticket.title} issue. This appears to be a ${complexity} ${category.toLowerCase()} problem.\n\nBased on similar cases, I recommend the following approach:\n1. Verify system configuration\n2. Check recent changes\n3. Review error logs\n\nI'll begin troubleshooting immediately and keep you updated on progress.\n\nRegards,\nTechnical Support`,
      tone: 'technical'
    },
    {
      title: 'Empathetic Response',
      content: `Hello ${ticket.clientName},\n\nI completely understand how frustrating this ${ticket.title} issue must be for you. Please know that I'm here to help and will work diligently to get this resolved for you as quickly as possible.\n\nI'm prioritizing your case and will provide regular updates throughout the resolution process.\n\nThank you for your patience,\nSupport Team`,
      tone: 'empathetic'
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
      case 'urgent': return AlertTriangle;
      case 'negative': return AlertTriangle;
      case 'positive': return Star;
      default: return MessageSquare;
    }
  };

  if (isAnalyzing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">AI is analyzing your ticket...</span>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-12">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">AI Analysis Unavailable</h3>
          <p className="text-gray-500 dark:text-gray-400">Unable to analyze this ticket at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
            <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Ticket Assistant</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Smart analysis and recommendations</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Quick Analysis Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flag className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Priority</span>
          </div>
          <div className={`text-lg font-bold ${getPriorityColor(analysis.priority)} px-2 py-1 rounded`}>
            {analysis.priority.toUpperCase()}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Complexity</span>
          </div>
          <div className={`text-lg font-bold ${getComplexityColor(analysis.complexity)} px-2 py-1 rounded`}>
            {analysis.complexity.toUpperCase()}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Est. Time</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {analysis.estimatedTime}h
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {(() => {
              const Icon = getSentimentIcon(analysis.sentiment);
              return <Icon className="h-4 w-4 text-gray-600" />;
            })()}
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
            {analysis.sentiment}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'analysis'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Analysis
        </button>
        <button
          onClick={() => setActiveTab('responses')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'responses'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Response Templates
        </button>
        <button
          onClick={() => setActiveTab('similar')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'similar'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Similar Tickets
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'insights'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          AI Insights
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Suggested Actions</h3>
            <div className="space-y-2">
              {analysis.suggestedActions.map((action, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{action}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category & Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Category</h4>
                <p className="text-gray-600 dark:text-gray-400">{analysis.category}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Estimated Resolution</h4>
                <p className="text-gray-600 dark:text-gray-400">{analysis.estimatedTime} hours</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'responses' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI-Generated Responses</h3>
          {analysis.responseTemplates.map((template, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{template.title}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  template.tone === 'professional' ? 'bg-blue-100 text-blue-800' :
                  template.tone === 'friendly' ? 'bg-green-100 text-green-800' :
                  template.tone === 'technical' ? 'bg-purple-100 text-purple-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {template.tone}
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                  {template.content}
                </pre>
              </div>
              <button
                onClick={() => onApplyResponse(template.content)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Use This Response
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'similar' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Similar Resolved Tickets</h3>
          {analysis.similarTickets.map((similarTicket) => (
            <div key={similarTicket.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">{similarTicket.title}</h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {similarTicket.similarity}% similar
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{similarTicket.resolution}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Ticket ID: {similarTicket.id}</span>
                <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Insights</h3>
          <div className="space-y-3">
            {analysis.aiInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onApplyAnalysis(analysis)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Apply Analysis
        </button>
        <button
          onClick={performAnalysis}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Re-analyze
        </button>
        <button
          onClick={onClose}
          className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}; 