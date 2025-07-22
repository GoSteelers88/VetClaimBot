'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, FileText, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: React.ElementType;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'fix-claim',
    label: 'Fix My Claim',
    prompt: 'Please review my current claim and suggest improvements to increase my chances of approval.',
    icon: AlertCircle,
    color: 'text-red-600'
  },
  {
    id: 'whats-missing',
    label: "What's Missing?",
    prompt: 'What documents or information am I missing to strengthen my claim?',
    icon: HelpCircle,
    color: 'text-yellow-600'
  },
  {
    id: 'summarize',
    label: 'Summarize My Claim',
    prompt: 'Please provide a summary of my current claim including conditions, evidence, and strength assessment.',
    icon: FileText,
    color: 'text-blue-600'
  }
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm VetAssist, your AI-powered VA benefits advisor. I'm here to help you with your claims, answer questions about VA benefits, and guide you through the process. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, veteran } = useAuthStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageContent: string = input) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent.trim(),
      timestamp: new Date()
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput('');
    setIsLoading(true);

    try {
      await callChatGPTAPI(messageContent, loadingMessage.id);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { ...msg, content: "I'm sorry, I'm having trouble responding right now. Please try again.", isLoading: false }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const callChatGPTAPI = async (userMessage: string, loadingMessageId: string) => {
    try {
      // Build veteran context for the API
      const veteranContext = veteran ? {
        name: veteran.personalInfo?.firstName,
        branches: veteran.militaryService?.branches,
        entryDate: veteran.militaryService?.entryDate,
        dischargeDate: veteran.militaryService?.dischargeDate,
        currentDisabilityRating: veteran.militaryService?.currentDisabilityRating,
        deployments: veteran.deployments,
        exposureAlerts: veteran.exposureAlerts
      } : null;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          veteranContext
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Update the loading message with the response
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessageId 
          ? { ...msg, content: data.response, isLoading: false }
          : msg
      ));

    } catch (error) {
      console.error('API call failed:', error);
      
      // Use fallback response
      const fallbackResponse = `I'm sorry, I'm having trouble connecting to my AI services right now. Please try again in a moment.

In the meantime, here are some quick resources:
• VA Benefits Hotline: 1-800-827-1000
• Crisis Line: 1-800-273-8255
• eBenefits Portal: www.ebenefits.va.gov

Is there something specific about your claim I can help you with based on the information I can see?`;

      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessageId 
          ? { ...msg, content: fallbackResponse, isLoading: false }
          : msg
      ));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Chat Header */}
      <Card className="flex-shrink-0">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">VetAssist AI</h3>
              <p className="text-sm text-gray-600">Your VA Benefits Advisor</p>
            </div>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="flex-1 flex flex-col mt-4">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-gray-600' 
                  : 'bg-blue-600'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex-1 ${
                message.role === 'user' ? 'text-right' : ''
              }`}>
                <div className={`inline-block p-3 rounded-lg max-w-3xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
                <div className={`text-xs text-gray-500 mt-1 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Quick Actions */}
        <div className="border-t p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
                className="flex items-center space-x-1"
              >
                <action.icon className={`w-3 h-3 ${action.color}`} />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>

          {/* Input */}
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your VA claim or benefits..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}