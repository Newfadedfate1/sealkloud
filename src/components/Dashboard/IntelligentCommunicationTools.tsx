import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Smile, 
  Frown, 
  Meh, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  X,
  Copy,
  Edit,
  Brain,
  Zap,
  Star,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  Mic,
  Type,
  Calendar,
  Bell,
  Settings
} from 'lucide-react';
// @ts-expect-error: Make sure to install socket.io-client (npm install socket.io-client)
import { io, Socket } from 'socket.io-client';

interface CommunicationTemplate {
  id: string;
  title: string;
  content: string;
  category: 'acknowledgment' | 'update' | 'resolution' | 'escalation' | 'follow-up';
  tone: 'professional' | 'friendly' | 'empathetic' | 'technical' | 'urgent';
  tags: string[];
  usageCount: number;
  rating: number;
}

interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative';
  confidence: number;
  emotions: {
    satisfaction: number;
    frustration: number;
    urgency: number;
    politeness: number;
  };
  suggestions: string[];
}

interface CommunicationHistory {
  id: string;
  ticketId: string;
  type: 'email' | 'chat' | 'call' | 'note';
  content: string;
  timestamp: Date;
  sentiment: 'positive' | 'neutral' | 'negative';
  responseTime: number;
  customerReaction?: 'satisfied' | 'neutral' | 'dissatisfied';
}

interface IntelligentCommunicationToolsProps {
  ticket: any;
  userRole: 'employee_l1' | 'employee_l2' | 'employee_l3';
  onSendMessage: (message: string, type: string) => void;
  onScheduleFollowUp: (date: Date, message: string) => void;
  onClose: () => void;
  currentUser: any;
}

// Mock communication templates
const communicationTemplates: CommunicationTemplate[] = [
  {
    id: '1',
    title: 'Professional Acknowledgment',
    content: 'Dear {customerName},\n\nThank you for reaching out to us regarding {ticketTitle}. I understand the importance of this issue and I\'m here to help you resolve it.\n\nI\'m currently investigating this matter and will provide you with a detailed update within {estimatedTime} hours.\n\nBest regards,\n{agentName}',
    category: 'acknowledgment',
    tone: 'professional',
    tags: ['acknowledgment', 'professional', 'update'],
    usageCount: 45,
    rating: 4.8
  },
  {
    id: '2',
    title: 'Technical Update',
    content: 'Hi {customerName},\n\nI\'ve made progress on your {ticketTitle} issue. Here\'s what I\'ve found:\n\n{technicalDetails}\n\nNext steps: {nextSteps}\n\nI\'ll continue working on this and keep you updated.\n\nRegards,\n{agentName}',
    category: 'update',
    tone: 'technical',
    tags: ['technical', 'update', 'progress'],
    usageCount: 32,
    rating: 4.6
  },
  {
    id: '3',
    title: 'Issue Resolution',
    content: 'Hello {customerName},\n\nGreat news! I\'ve successfully resolved your {ticketTitle} issue.\n\nResolution: {resolutionDetails}\n\nPlease test the solution and let me know if you encounter any issues. I\'m here to help if you need further assistance.\n\nThank you for your patience,\n{agentName}',
    category: 'resolution',
    tone: 'friendly',
    tags: ['resolution', 'friendly', 'completion'],
    usageCount: 28,
    rating: 4.9
  },
  {
    id: '4',
    title: 'Escalation Notice',
    content: 'Dear {customerName},\n\nI\'ve escalated your {ticketTitle} issue to our {escalationLevel} team for specialized attention.\n\nReason for escalation: {escalationReason}\n\nYou\'ll be contacted by {escalationLevel} support within {responseTime}.\n\nI\'ll continue to monitor the progress and ensure timely resolution.\n\nBest regards,\n{agentName}',
    category: 'escalation',
    tone: 'professional',
    tags: ['escalation', 'professional', 'specialized'],
    usageCount: 15,
    rating: 4.4
  },
  {
    id: '5',
    title: 'Follow-up Check',
    content: 'Hi {customerName},\n\nI wanted to follow up on your {ticketTitle} issue. How is everything working now?\n\nIf you\'re still experiencing problems, please let me know and I\'ll be happy to help further.\n\nIf everything is resolved, feel free to close this ticket.\n\nThank you,\n{agentName}',
    category: 'follow-up',
    tone: 'friendly',
    tags: ['follow-up', 'friendly', 'check'],
    usageCount: 38,
    rating: 4.7
  }
];

// Mock sentiment analysis
const analyzeSentiment = async (text: string): Promise<SentimentAnalysis> => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const lowerText = text.toLowerCase();
  let overall: 'positive' | 'neutral' | 'negative' = 'neutral';
  let confidence = 75;
  
  // Simple sentiment analysis logic
  const positiveWords = ['thank', 'great', 'excellent', 'good', 'happy', 'satisfied', 'working', 'resolved'];
  const negativeWords = ['frustrated', 'angry', 'unhappy', 'broken', 'urgent', 'emergency', 'critical', 'failed'];
  
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) {
    overall = 'positive';
    confidence = 85;
  } else if (negativeCount > positiveCount) {
    overall = 'negative';
    confidence = 80;
  }
  
  const emotions = {
    satisfaction: Math.floor(Math.random() * 40) + 60,
    frustration: Math.floor(Math.random() * 30) + 20,
    urgency: Math.floor(Math.random() * 50) + 30,
    politeness: Math.floor(Math.random() * 30) + 70
  };
  
  const suggestions = [];
  if (overall === 'negative') {
    suggestions.push('Use more empathetic language');
    suggestions.push('Offer immediate assistance');
    suggestions.push('Acknowledge their frustration');
  } else if (overall === 'positive') {
    suggestions.push('Maintain positive tone');
    suggestions.push('Express gratitude');
  }
  
  if (emotions.urgency > 70) {
    suggestions.push('Prioritize this communication');
    suggestions.push('Use urgent response template');
  }
  
  return {
    overall,
    confidence,
    emotions,
    suggestions
  };
};

// Mock communication history
const generateCommunicationHistory = (ticketId: string): CommunicationHistory[] => {
  return [
    {
      id: '1',
      ticketId,
      type: 'email',
      content: 'Thank you for reporting this issue. I\'m investigating it now.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      sentiment: 'neutral',
      responseTime: 15,
      customerReaction: 'satisfied'
    },
    {
      id: '2',
      ticketId,
      type: 'chat',
      content: 'I\'ve found the root cause and am working on a fix.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      sentiment: 'positive',
      responseTime: 45,
      customerReaction: 'satisfied'
    }
  ];
};

export const IntelligentCommunicationTools: React.FC<IntelligentCommunicationToolsProps> = ({
  ticket,
  userRole,
  onSendMessage,
  onScheduleFollowUp,
  onClose,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'templates' | 'history' | 'sentiment' | 'automation' | 'chat'>('compose');
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(null);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<SentimentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [communicationHistory, setCommunicationHistory] = useState<CommunicationHistory[]>([]);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [showSentiment, setShowSentiment] = useState(false);
  // Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ticket) {
      setCommunicationHistory(generateCommunicationHistory(ticket.id));
    }
  }, [ticket]);

  // Fetch chat history and connect to socket.io on mount
  useEffect(() => {
    if (!ticket) return;
    // Fetch chat history
    fetch(`/api/tickets/${ticket.id}/chats`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setChatMessages(data.chats || []);
      });
    // Connect to socket.io
    if (!socketRef.current) {
      socketRef.current = io('/', { transports: ['websocket'] });
    }
    const socket = socketRef.current;
    socket.emit('join_ticket', { ticketId: ticket.id });
    socket.on('chat_message', (msg: any) => {
      if (msg.ticketId === ticket.id) {
        setChatMessages(prev => [...prev, msg]);
      }
    });
    return () => {
      socket.off('chat_message');
    };
  }, [ticket]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleTemplateSelect = (template: CommunicationTemplate) => {
    setSelectedTemplate(template);
    // Replace placeholders with actual values
    let content = template.content;
    content = content.replace('{customerName}', ticket.clientName || 'Customer');
    content = content.replace('{ticketTitle}', ticket.title);
    content = content.replace('{estimatedTime}', '2-4');
    content = content.replace('{agentName}', 'Support Agent');
    content = content.replace('{technicalDetails}', 'Initial investigation completed');
    content = content.replace('{nextSteps}', 'Implementing solution');
    content = content.replace('{resolutionDetails}', 'Issue has been resolved');
    content = content.replace('{escalationLevel}', 'Level 2');
    content = content.replace('{escalationReason}', 'Requires specialized expertise');
    content = content.replace('{responseTime}', '2 hours');
    
    setMessage(content);
    setActiveTab('compose');
  };

  const handleSentimentAnalysis = async () => {
    if (!message.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeSentiment(message);
      setSentimentAnalysis(analysis);
      setShowSentiment(true);
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message, 'email');
      setMessage('');
      setSelectedTemplate(null);
    }
  };

  const handleScheduleFollowUp = () => {
    if (followUpDate && followUpMessage) {
      onScheduleFollowUp(new Date(followUpDate), followUpMessage);
      setFollowUpDate('');
      setFollowUpMessage('');
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim() || !ticket) return;
    const msg = {
      ticketId: ticket.id,
      senderId: currentUser.id,
      senderRole: currentUser.role,
      message: chatInput.trim(),
    };
    socketRef.current?.emit('chat_message', msg);
    setChatInput('');
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <Smile className="h-5 w-5 text-green-500" />;
      case 'negative': return <Frown className="h-5 w-5 text-red-500" />;
      default: return <Meh className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getCommunicationTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <MessageSquare className="h-4 w-4" />;
      case 'chat': return <MessageSquare className="h-4 w-4" />;
      case 'call': return <Volume2 className="h-4 w-4" />;
      case 'note': return <Edit className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Intelligent Communication Tools</h2>
              <p className="text-sm text-gray-600">AI-powered communication assistance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'compose', label: 'Compose', icon: Edit },
              { id: 'templates', label: 'Templates', icon: Copy },
              { id: 'history', label: 'History', icon: Clock },
              { id: 'sentiment', label: 'Sentiment', icon: Brain },
              { id: 'automation', label: 'Automation', icon: Zap },
              { id: 'chat', label: 'Chat', icon: MessageSquare },
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
          {activeTab === 'compose' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Compose Message</h3>
                
                {/* Message Editor */}
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">To: {ticket?.clientName || 'Customer'}</span>
                      <span className="text-sm text-gray-600">Subject: Re: {ticket?.title || 'Ticket'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSentimentAnalysis}
                        disabled={isAnalyzing || !message.trim()}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <Clock className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Brain className="h-4 w-4 mr-2" />
                        )}
                        Analyze Sentiment
                      </button>
                    </div>
                  </div>
                  
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{message.length} characters</span>
                      {sentimentAnalysis && (
                        <div className="flex items-center space-x-2">
                          {getSentimentIcon(sentimentAnalysis.overall)}
                          <span className="text-sm text-gray-600">
                            {sentimentAnalysis.overall} ({sentimentAnalysis.confidence}%)
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </button>
                  </div>
                </div>

                {/* Sentiment Analysis Results */}
                {showSentiment && sentimentAnalysis && (
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Sentiment Analysis Results</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          {getSentimentIcon(sentimentAnalysis.overall)}
                          <span className="font-medium">Overall Sentiment: {sentimentAnalysis.overall}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Satisfaction:</span>
                            <span className="text-sm font-medium">{sentimentAnalysis.emotions.satisfaction}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Frustration:</span>
                            <span className="text-sm font-medium">{sentimentAnalysis.emotions.frustration}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Urgency:</span>
                            <span className="text-sm font-medium">{sentimentAnalysis.emotions.urgency}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Politeness:</span>
                            <span className="text-sm font-medium">{sentimentAnalysis.emotions.politeness}%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">AI Suggestions</h5>
                        <div className="space-y-2">
                          {sentimentAnalysis.suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                              <Brain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Communication Templates</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {communicationTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{template.title}</h4>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">{template.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">{template.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          template.tone === 'professional' ? 'bg-blue-100 text-blue-800' :
                          template.tone === 'friendly' ? 'bg-green-100 text-green-800' :
                          template.tone === 'empathetic' ? 'bg-purple-100 text-purple-800' :
                          template.tone === 'technical' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {template.tone}
                        </span>
                        <span className="text-xs text-gray-500">{template.category}</span>
                      </div>
                      <span className="text-xs text-gray-500">{template.usageCount} uses</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Communication History</h3>
              
              <div className="space-y-4">
                {communicationHistory.map((comm) => (
                  <div key={comm.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getCommunicationTypeIcon(comm.type)}
                        <div>
                          <div className="font-medium text-gray-900">{comm.type.charAt(0).toUpperCase() + comm.type.slice(1)}</div>
                          <div className="text-sm text-gray-500">
                            {comm.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getSentimentIcon(comm.sentiment)}
                        <span className="text-sm text-gray-600">{comm.responseTime} min</span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{comm.content}</p>
                    {comm.customerReaction && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Customer reaction:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          comm.customerReaction === 'satisfied' ? 'bg-green-100 text-green-800' :
                          comm.customerReaction === 'dissatisfied' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {comm.customerReaction}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sentiment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Sentiment Analysis</h3>
              
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Customer Sentiment Trends</h4>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-gray-600">Positive Interactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">12%</div>
                    <div className="text-sm text-gray-600">Neutral Interactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">3%</div>
                    <div className="text-sm text-gray-600">Negative Interactions</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Communication Effectiveness</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Response Time</span>
                      <span>15 min avg</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Customer Satisfaction</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Resolution Rate</span>
                      <span>88%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Automated Communication</h3>
              
              {/* Follow-up Scheduling */}
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Schedule Follow-up</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Follow-up Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Follow-up Message
                    </label>
                    <textarea
                      value={followUpMessage}
                      onChange={(e) => setFollowUpMessage(e.target.value)}
                      placeholder="Enter your follow-up message..."
                      className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleScheduleFollowUp}
                    disabled={!followUpDate || !followUpMessage}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Follow-up
                  </button>
                </div>
              </div>

              {/* Automated Rules */}
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Automated Communication Rules</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <h5 className="font-medium text-green-900">Auto-acknowledgment</h5>
                      <p className="text-sm text-green-700">Send acknowledgment within 15 minutes</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h5 className="font-medium text-blue-900">Progress updates</h5>
                      <p className="text-sm text-blue-700">Send updates every 2 hours for active tickets</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span className="text-sm text-blue-600">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <h5 className="font-medium text-yellow-900">Resolution follow-up</h5>
                      <p className="text-sm text-yellow-700">Check satisfaction 24 hours after resolution</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm text-yellow-600">Configure</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col h-[60vh]">
              <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-400">No messages yet.</div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={msg.id || idx} className={`mb-2 flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-lg shadow text-sm ${msg.senderId === currentUser.id ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
                      <div className="font-semibold mb-1">{msg.senderRole === 'client' ? ticket.clientName : 'You'}</div>
                      <div>{msg.message}</div>
                      <div className="text-xs text-gray-300 mt-1 text-right">{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSendChat(); }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleSendChat}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                  disabled={!chatInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 