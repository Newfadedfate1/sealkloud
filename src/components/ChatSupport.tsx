import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2, User, Bot } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatSupportProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const ChatSupport: React.FC<ChatSupportProps> = ({
  isOpen,
  onToggle,
  className = ""
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'agent',
      timestamp: new Date(Date.now() - 60000)
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate agent response
    setTimeout(() => {
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for your message. An agent will be with you shortly.',
        sender: 'agent',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMessage]);
    }, 1000);
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
        className={`fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 ${className}`}
        aria-label="Open chat support"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Chat Support</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={onToggle}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Chat Support</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">We're here to help</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={onToggle}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}>
                {message.sender === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
              </div>
              <div className={`px-3 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}>
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}; 