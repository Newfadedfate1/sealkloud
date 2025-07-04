import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Sparkles, FileText, Plus, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
}

interface SupportChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  onCreateTicket: (ticketData: any) => void;
}

// Mock AI responses - replace with actual chatbot API
const getBotResponse = async (userMessage: string): Promise<ChatMessage> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const message = userMessage.toLowerCase();
  let response = '';
  let actions: Array<{ label: string; action: string; data?: any }> = [];
  
  // Simple keyword-based responses (replace with actual AI)
  if (message.includes('hello') || message.includes('hi') || message.includes('help')) {
    response = "Hello! I'm your AI support assistant. I can help you with:\n\n• Creating support tickets\n• Finding solutions to common issues\n• Checking ticket status\n• Providing account information\n\nWhat can I help you with today?";
    actions = [
      { label: "Create Ticket", action: "create_ticket" },
      { label: "Check Status", action: "check_status" },
      { label: "Common Issues", action: "common_issues" }
    ];
  } else if (message.includes('login') || message.includes('password')) {
    response = "I can help you with login issues. Here are some common solutions:\n\n• Reset your password using the 'Forgot Password' link\n• Check if your account is locked due to multiple failed attempts\n• Verify your email address is correct\n\nWould you like me to help you create a ticket for this issue?";
    actions = [
      { label: "Create Ticket", action: "create_ticket", data: { category: "Authentication", priority: "high" } },
      { label: "Reset Password", action: "reset_password" }
    ];
  } else if (message.includes('payment') || message.includes('billing')) {
    response = "I can help you with billing and payment issues. Here are some options:\n\n• Check your payment method on file\n• Review recent billing statements\n• Update billing information\n\nWould you like me to create a ticket for billing support?";
    actions = [
      { label: "Create Ticket", action: "create_ticket", data: { category: "Billing", priority: "medium" } },
      { label: "View Billing", action: "view_billing" }
    ];
  } else if (message.includes('ticket') && message.includes('create')) {
    response = "I'll help you create a support ticket. Please tell me:\n\n• What issue are you experiencing?\n• How urgent is this issue?\n• Any error messages you're seeing?";
    actions = [
      { label: "Start Ticket Creation", action: "start_ticket_creation" }
    ];
  } else if (message.includes('status') || message.includes('check')) {
    response = "I can help you check your ticket status. Please provide your ticket number, or I can show you all your recent tickets.";
    actions = [
      { label: "View My Tickets", action: "view_tickets" },
      { label: "Enter Ticket Number", action: "enter_ticket_number" }
    ];
  } else {
    response = "I'm not sure I understand. Could you please rephrase that or choose from these options:\n\n• Create a support ticket\n• Check ticket status\n• Get help with common issues\n• Speak to a human agent";
    actions = [
      { label: "Create Ticket", action: "create_ticket" },
      { label: "Common Issues", action: "common_issues" },
      { label: "Human Agent", action: "human_agent" }
    ];
  }
  
  return {
    id: Date.now().toString(),
    type: 'bot',
    content: response,
    timestamp: new Date(),
    actions
  };
};

export const SupportChatbot: React.FC<SupportChatbotProps> = ({
  isOpen,
  onToggle,
  onCreateTicket
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your AI support assistant. How can I help you today?",
      timestamp: new Date(),
      actions: [
        { label: "Create Ticket", action: "create_ticket" },
        { label: "Check Status", action: "check_status" },
        { label: "Common Issues", action: "common_issues" }
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const botResponse = await getBotResponse(inputMessage);
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: "I'm sorry, I'm having trouble processing your request. Please try again or contact a human agent.",
        timestamp: new Date(),
        actions: [
          { label: "Human Agent", action: "human_agent" }
        ]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAction = async (action: string, data?: any) => {
    switch (action) {
      case 'create_ticket':
        if (data) {
          // Pre-filled ticket data
          onCreateTicket(data);
        } else {
          setIsCreatingTicket(true);
          const ticketMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'bot',
            content: "I'll help you create a support ticket. Please describe your issue in detail, and I'll categorize it for you.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, ticketMessage]);
        }
        break;
        
      case 'check_status':
        const statusMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'bot',
          content: "I can show you your recent tickets. Here are your latest ones:\n\n• TK-001: Login issues (Resolved)\n• TK-002: Payment problem (In Progress)\n\nWould you like me to show more details about any specific ticket?",
          timestamp: new Date(),
          actions: [
            { label: "View TK-001", action: "view_ticket", data: { id: "TK-001" } },
            { label: "View TK-002", action: "view_ticket", data: { id: "TK-002" } }
          ]
        };
        setMessages(prev => [...prev, statusMessage]);
        break;
        
      case 'common_issues':
        const commonMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'bot',
          content: "Here are solutions to common issues:\n\n🔐 **Login Problems**\n• Reset password via email\n• Clear browser cache\n• Check account status\n\n💳 **Payment Issues**\n• Verify payment method\n• Check billing cycle\n• Update card information\n\n🛠️ **Technical Issues**\n• Try different browser\n• Check internet connection\n• Clear cookies and cache\n\nWould you like me to help you with any of these?",
          timestamp: new Date(),
          actions: [
            { label: "Login Help", action: "login_help" },
            { label: "Payment Help", action: "payment_help" },
            { label: "Technical Help", action: "technical_help" }
          ]
        };
        setMessages(prev => [...prev, commonMessage]);
        break;
        
      case 'human_agent':
        const agentMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'bot',
          content: "I'm connecting you to a human agent. Please wait a moment...\n\nIn the meantime, you can:\n• Email: support@sealkloud.com\n• Phone: +1 (555) 123-4567\n• Live chat: Available 9AM-6PM EST",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, agentMessage]);
        break;
        
      default:
        break;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-colors z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
            <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Support</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Online • Instant help</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'} rounded-lg p-3`}>
              <div className="flex items-start gap-2">
                {message.type === 'bot' && (
                  <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleAction(action.action, action.data)}
                      className="block w-full text-left px-3 py-2 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded border border-gray-200 dark:border-gray-500 text-sm transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            rows={1}
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white p-2 rounded-lg transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}; 