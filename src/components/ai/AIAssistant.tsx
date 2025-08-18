/**
 * CoreFlow360 - AI Assistant Component
 * Role-specific AI assistance and UI adaptation
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types/auth'
import {
  Brain,
  MessageCircle,
  X,
  Send,
  Sparkles,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Command,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ChevronDown,
  Zap,
  Target,
  Users,
  BarChart3
} from 'lucide-react'

interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
  actions?: AIAction[]
}

interface AIAction {
  label: string
  action: string
  icon?: any
}

interface AIContext {
  currentPage: string
  userRole: UserRole
  recentActions: string[]
  moduleContext: string[]
}

export function AIAssistant() {
  // Try to use auth context, but handle the case when it's not available
  let user = null
  try {
    const auth = useAuth()
    user = auth.user
  } catch (error) {
    // Auth context not available (e.g., during static generation)
    // Component will render without user-specific features
  }
  
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize with welcome message based on role
  useEffect(() => {
    if (user && messages.length === 0) {
      const welcomeMessage = getWelcomeMessage(user.role || UserRole.GUEST)
      setMessages([welcomeMessage])
    }
  }, [user])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getWelcomeMessage = (role: UserRole): AIMessage => {
    const roleMessages = {
      [UserRole.SUPER_ADMIN]: {
        content: "Hello! I'm your AI assistant with global system insights. I can help you monitor tenants, analyze platform revenue, manage infrastructure, and optimize system performance. What would you like to explore today?",
        suggestions: [
          "Show me tenant health metrics",
          "Analyze revenue trends",
          "Check system performance",
          "Review security alerts"
        ]
      },
      [UserRole.ORG_ADMIN]: {
        content: "Welcome back! I'm here to help you manage your organization efficiently. I can assist with user management, module configuration, analytics insights, and workflow automation. How can I help you today?",
        suggestions: [
          "Show user activity report",
          "Recommend module upgrades",
          "Analyze team productivity",
          "Set up automation"
        ]
      },
      [UserRole.DEPARTMENT_MANAGER]: {
        content: "Hello! I'm your departmental AI assistant. I can help you track team performance, manage workloads, analyze departmental metrics, and optimize processes. What would you like to focus on?",
        suggestions: [
          "Review team workload",
          "Show department KPIs",
          "Identify bottlenecks",
          "Schedule team meeting"
        ]
      },
      [UserRole.TEAM_LEAD]: {
        content: "Hi there! I'm here to help you lead your team effectively. I can assist with task management, performance tracking, and team coordination. What do you need help with?",
        suggestions: [
          "Show team task status",
          "Review sprint progress",
          "Identify at-risk tasks",
          "Plan next sprint"
        ]
      },
      [UserRole.USER]: {
        content: "Hello! I'm your personal AI assistant. I can help you manage tasks, track deadlines, analyze your productivity, and provide insights to help you work smarter. How can I assist you?",
        suggestions: [
          "Show my tasks",
          "Analyze my productivity",
          "Set focus time",
          "Find information"
        ]
      },
      [UserRole.GUEST]: {
        content: "Welcome to CoreFlow360! I'm here to show you how our AI-powered platform can transform your business. What would you like to learn about?",
        suggestions: [
          "Show platform features",
          "Explain pricing",
          "Demo AI capabilities",
          "Schedule a tour"
        ]
      }
    }

    const roleData = roleMessages[role] || roleMessages[UserRole.USER]
    
    return {
      id: '1',
      role: 'assistant',
      content: roleData.content,
      timestamp: new Date(),
      suggestions: roleData.suggestions
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const response = generateAIResponse(input, user?.role || UserRole.USER)
      setMessages(prev => [...prev, response])
      setIsTyping(false)
      
      if (soundEnabled) {
        // Play notification sound
        const audio = new Audio('/notification.mp3')
        audio.play().catch(() => {})
      }
    }, 1000 + Math.random() * 1000)
  }

  const generateAIResponse = (query: string, role: UserRole): AIMessage => {
    const lowerQuery = query.toLowerCase()
    
    // Context-aware responses based on query and role
    if (lowerQuery.includes('task') || lowerQuery.includes('todo')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I've analyzed your tasks. You have 5 high-priority tasks due this week. Would you like me to help you prioritize them based on impact and urgency?",
        timestamp: new Date(),
        actions: [
          { label: 'Show Tasks', action: 'navigate:/tasks', icon: Target },
          { label: 'Create Task', action: 'modal:create-task', icon: Zap }
        ]
      }
    }
    
    if (lowerQuery.includes('revenue') || lowerQuery.includes('money')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: role === UserRole.SUPER_ADMIN 
          ? "Platform revenue is up 23% this month at $1.24M MRR. Top performing tenant segments are Technology (+31%) and Healthcare (+28%). Would you like a detailed breakdown?"
          : "Your department's revenue contribution is up 15% this quarter. Key drivers include improved conversion rates and higher average deal sizes.",
        timestamp: new Date(),
        actions: [
          { label: 'View Analytics', action: 'navigate:/analytics', icon: BarChart3 },
          { label: 'Export Report', action: 'export:revenue-report', icon: TrendingUp }
        ]
      }
    }
    
    if (lowerQuery.includes('team') || lowerQuery.includes('user')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Your team is performing well with 92% task completion rate. John and Sarah are ahead of schedule, while Mike might need support with his current workload.",
        timestamp: new Date(),
        suggestions: [
          "Redistribute Mike's tasks",
          "Schedule 1-on-1 with Mike",
          "Recognize top performers",
          "Review team capacity"
        ]
      }
    }
    
    // Default intelligent response
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: "I understand you're asking about '" + query + "'. Based on your role as " + role.replace('_', ' ') + ", I can help you with various tasks. Could you be more specific about what you'd like to accomplish?",
      timestamp: new Date(),
      suggestions: [
        "Show my dashboard",
        "Analyze recent data",
        "Set up automation",
        "Get recommendations"
      ]
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    handleSend()
  }

  const handleActionClick = (action: AIAction) => {
    // Implement action handling (navigation, modals, etc.)
  }

  return (
    <>
      {/* AI Assistant Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg flex items-center justify-center text-white z-40"
      >
        <Brain className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
      </motion.button>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className={`fixed ${
              isMinimized ? 'bottom-6 right-6 w-80' : 'bottom-6 right-6 w-96'
            } bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden`}
            style={{ height: isMinimized ? '60px' : '600px', maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Brain className="w-6 h-6" />
                  <div>
                    <h3 className="font-semibold">AI Assistant</h3>
                    {!isMinimized && (
                      <p className="text-xs opacity-80">
                        Personalized for {user?.role.replace('_', ' ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      isMinimized ? 'rotate-180' : ''
                    }`} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100% - 140px)' }}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className={`max-w-[80%] ${
                        message.role === 'user' 
                          ? 'bg-purple-600 text-white rounded-2xl rounded-tr-sm' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl rounded-tl-sm'
                      } p-3`}>
                        <p className="text-sm">{message.content}</p>
                        
                        {/* Suggestions */}
                        {message.suggestions && (
                          <div className="mt-3 space-y-1">
                            {message.suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="block w-full text-left text-xs px-3 py-1.5 bg-white/20 dark:bg-gray-600 rounded-lg hover:bg-white/30 dark:hover:bg-gray-500 transition-colors"
                              >
                                <Sparkles className="w-3 h-3 inline mr-1" />
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* Actions */}
                        {message.actions && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.actions.map((action, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleActionClick(action)}
                                className="inline-flex items-center space-x-1 text-xs px-3 py-1.5 bg-white/20 dark:bg-gray-600 rounded-lg hover:bg-white/30 dark:hover:bg-gray-500 transition-colors"
                              >
                                {action.icon && <action.icon className="w-3 h-3" />}
                                <span>{action.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask me anything..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-center text-xs text-gray-500">
                    <Command className="w-3 h-3 mr-1" />
                    <span>Press Cmd+K for quick commands</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}