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
  'How does pricing work?',
  'Can I see a demo?',
  'What integrations do you support?',
  'How long does setup take?',
]

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content:
        "Welcome! I'm here to help you transform your business with CoreFlow360. How can I assist you today?",
      timestamp: new Date(),
    },
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
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    trackEvent('live_chat_message_sent', { messageType: 'user' })

    // Simulate agent typing
    setIsTyping(true)

    // Simulate agent response
    setTimeout(
      () => {
        const agentResponse = generateAgentResponse(content)
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: agentResponse,
          timestamp: new Date(),
          agentName: 'Alex',
        }
        setMessages((prev) => [...prev, agentMessage])
        setIsTyping(false)
      },
      1500 + Math.random() * 1000
    )
  }

  const generateAgentResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes('pricing') || lowerMessage.includes('cost')) {
      return 'Our pricing starts at $45/user/month for individual modules. Most businesses save 60% compared to traditional ERPs. Would you like me to help you calculate your specific pricing?'
    }

    if (lowerMessage.includes('demo')) {
      return "I'd be happy to show you a personalized demo! You can start with our interactive demo at coreflow360.com/demo, or I can schedule a live walkthrough with our team. Which would you prefer?"
    }

    if (lowerMessage.includes('integration') || lowerMessage.includes('connect')) {
      return 'CoreFlow360 integrates with 100+ popular business tools including Salesforce, QuickBooks, Slack, and more. We also have an open API for custom integrations. What specific tools are you looking to connect?'
    }

    if (lowerMessage.includes('setup') || lowerMessage.includes('implementation')) {
      return 'Most businesses are up and running in under 2 weeks! We handle data migration, configuration, and training. Our implementation team has a 100% success rate. Would you like to discuss your specific timeline?'
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
            className="fixed right-6 bottom-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-purple-600 shadow-2xl transition-all hover:from-violet-700 hover:to-purple-700"
          >
            <MessageCircle className="h-7 w-7 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
            <span className="absolute flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
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
            className={`fixed right-6 bottom-6 z-50 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all ${
              isMinimized ? 'h-16 w-80' : 'h-[600px] w-96'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-purple-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <Bot className="h-6 w-6" />
                  </div>
                  <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-violet-600 bg-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold">CoreFlow360 Support</h3>
                  <p className="text-xs text-violet-100">We typically reply instantly</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMinimize}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/20"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="h-[420px] flex-1 space-y-4 overflow-y-auto p-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex max-w-[80%] gap-2 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        {message.type !== 'user' && (
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-100">
                            {message.type === 'agent' ? (
                              <Bot className="h-5 w-5 text-violet-600" />
                            ) : (
                              <Sparkles className="h-5 w-5 text-violet-600" />
                            )}
                          </div>
                        )}
                        <div>
                          {message.agentName && (
                            <p className="mb-1 text-xs text-gray-500">{message.agentName}</p>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              message.type === 'user'
                                ? 'bg-violet-600 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {message.content}
                          </div>
                          <p className="mt-1 text-xs text-gray-400">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {message.type === 'user' && (
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                            <User className="h-5 w-5 text-gray-600" />
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
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
                        <Bot className="h-5 w-5 text-violet-600" />
                      </div>
                      <div className="rounded-2xl bg-gray-100 px-4 py-2">
                        <div className="flex gap-1">
                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                            style={{ animationDelay: '0ms' }}
                          />
                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                            style={{ animationDelay: '150ms' }}
                          />
                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Responses */}
                {messages.length === 1 && (
                  <div className="border-t border-gray-100 px-4 py-2">
                    <p className="mb-2 text-xs text-gray-500">Quick questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickResponses.map((response) => (
                        <button
                          key={response}
                          onClick={() => handleQuickResponse(response)}
                          className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-700 transition-colors hover:bg-gray-200"
                        >
                          {response}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="border-t border-gray-200 p-4">
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
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                  <p className="mt-2 text-center text-xs text-gray-400">
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
