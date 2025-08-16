'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Minimize2, Bot, User, Sparkles } from 'lucide-react'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

interface Message {
  id: string
  type: 'user' | 'agent' | 'system'
  content: string
  timestamp: Date
  agentName?: string
}

const quickResponses = [
  "How does pricing work?",
  "Can I see a demo?",
  "What integrations do you support?",
  "How long does setup take?"
]

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: "Welcome! I'm here to help you transform your business with CoreFlow360. How can I assist you today?",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { trackEvent } = useTrackEvent()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Show proactive message after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setUnreadCount(1)
      }
    }, 30000)
    return () => clearTimeout(timer)
  }, [isOpen])

  const handleOpen = () => {
    setIsOpen(true)
    setIsMinimized(false)
    setUnreadCount(0)
    trackEvent('live_chat_opened')
  }

  const handleClose = () => {
    setIsOpen(false)
    trackEvent('live_chat_closed')
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const sendMessage = (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    trackEvent('live_chat_message_sent', { messageType: 'user' })

    // Simulate agent typing
    setIsTyping(true)
    
    // Simulate agent response
    setTimeout(() => {
      const agentResponse = generateAgentResponse(content)
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: agentResponse,
        timestamp: new Date(),
        agentName: 'Alex'
      }
      setMessages(prev => [...prev, agentMessage])
      setIsTyping(false)
    }, 1500 + Math.random() * 1000)
  }

  const generateAgentResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('pricing') || lowerMessage.includes('cost')) {
      return "Our pricing starts at $45/user/month for individual modules. Most businesses save 60% compared to traditional ERPs. Would you like me to help you calculate your specific pricing?"
    }
    
    if (lowerMessage.includes('demo')) {
      return "I'd be happy to show you a personalized demo! You can start with our interactive demo at coreflow360.com/demo, or I can schedule a live walkthrough with our team. Which would you prefer?"
    }
    
    if (lowerMessage.includes('integration') || lowerMessage.includes('connect')) {
      return "CoreFlow360 integrates with 100+ popular business tools including Salesforce, QuickBooks, Slack, and more. We also have an open API for custom integrations. What specific tools are you looking to connect?"
    }
    
    if (lowerMessage.includes('setup') || lowerMessage.includes('implementation')) {
      return "Most businesses are up and running in under 2 weeks! We handle data migration, configuration, and training. Our implementation team has a 100% success rate. Would you like to discuss your specific timeline?"
    }
    
    return "That's a great question! I'd be happy to help you explore how CoreFlow360 can transform your business. Could you tell me a bit more about your current challenges or what you're looking to achieve?"
  }

  const handleQuickResponse = (response: string) => {
    sendMessage(response)
  }

  return (
    <>
      {/* Chat Widget Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:from-violet-700 hover:to-purple-700 transition-all"
          >
            <MessageCircle className="w-7 h-7 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {unreadCount}
              </span>
            )}
            <span className="absolute flex h-full w-full rounded-full bg-violet-400 opacity-75 animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all ${
              isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold">CoreFlow360 Support</h3>
                  <p className="text-xs text-violet-100">We typically reply instantly</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMinimize}
                  className="w-8 h-8 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[420px]">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                        {message.type !== 'user' && (
                          <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                            {message.type === 'agent' ? (
                              <Bot className="w-5 h-5 text-violet-600" />
                            ) : (
                              <Sparkles className="w-5 h-5 text-violet-600" />
                            )}
                          </div>
                        )}
                        <div>
                          {message.agentName && (
                            <p className="text-xs text-gray-500 mb-1">{message.agentName}</p>
                          )}
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              message.type === 'user'
                                ? 'bg-violet-600 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {message.content}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {message.type === 'user' && (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-violet-600" />
                      </div>
                      <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Responses */}
                {messages.length === 1 && (
                  <div className="px-4 py-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickResponses.map((response) => (
                        <button
                          key={response}
                          onClick={() => handleQuickResponse(response)}
                          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                        >
                          {response}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      sendMessage(inputValue)
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="w-10 h-10 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Average response time: &lt; 30 seconds
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}