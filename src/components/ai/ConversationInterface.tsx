/**
 * AI Conversation Interface Component
 * Natural language interface for business workflows
 */

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Bot,
  User,
  Loader,
  Sparkles,
  X,
  Maximize2,
  Minimize2,
  MessageSquare,
  Zap,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import {
  ConversationMessage,
  BusinessIntent,
  WorkflowAction,
} from '@/lib/ai/conversation-interface'

interface ConversationInterfaceProps {
  isOpen?: boolean
  onClose?: () => void
  department?: string
  className?: string
  embedded?: boolean
}

export function ConversationInterface({
  isOpen = true,
  onClose,
  department,
  className = '',
  embedded = false,
}: ConversationInterfaceProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Initialize conversation session
  useEffect(() => {
    if (session?.user && isOpen) {
      const newSessionId = `conv-${Date.now()}`
      setSessionId(newSessionId)
      
      // Start conversation
      fetch('/api/ai/conversation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: newSessionId,
          department,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.suggestedPrompts) {
            setSuggestedPrompts(data.suggestedPrompts)
          }
        })
        .catch(console.error)
    }
  }, [session, isOpen, department])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !sessionId) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // Add user message immediately
    const tempUserMsg: ConversationMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      const response = await fetch('/api/ai/conversation/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userMessage,
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()
      
      // Update messages with actual response
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempUserMsg.id),
        data.userMessage,
        data.assistantMessage,
      ])

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again.',
          timestamp: new Date(),
          metadata: { intent: BusinessIntent.UNKNOWN },
        },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  const getIntentIcon = (intent?: BusinessIntent) => {
    switch (intent) {
      case BusinessIntent.CREATE_CUSTOMER:
      case BusinessIntent.CREATE_DEAL:
        return <Sparkles className="h-4 w-4" />
      case BusinessIntent.SCHEDULE_MEETING:
        return <MessageSquare className="h-4 w-4" />
      case BusinessIntent.WORKFLOW_AUTOMATION:
        return <Zap className="h-4 w-4" />
      default:
        return <Bot className="h-4 w-4" />
    }
  }

  const renderWorkflowActions = (actions?: WorkflowAction[]) => {
    if (!actions || actions.length === 0) return null

    return (
      <div className="mt-3 space-y-2">
        {actions.map((action, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-2 rounded-lg border border-gray-700/50 bg-gray-800/50 p-2 text-xs"
          >
            {action.status === 'completed' ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : action.status === 'failed' ? (
              <AlertCircle className="h-4 w-4 text-red-400" />
            ) : (
              <Loader className="h-4 w-4 animate-spin text-blue-400" />
            )}
            <span className="flex-1 text-gray-300">
              {action.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            {action.result?.message && (
              <span className="text-gray-500">{action.result.message}</span>
            )}
          </motion.div>
        ))}
      </div>
    )
  }

  const containerClass = embedded
    ? `${className}`
    : isExpanded
      ? 'fixed inset-4 z-50'
      : 'fixed bottom-4 right-4 z-50 w-96 h-[600px]'

  if (!isOpen && !embedded) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={containerClass}
    >
      <div className="flex h-full flex-col rounded-2xl border border-gray-700/50 bg-gray-900/95 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700/50 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
              <p className="text-xs text-gray-400">Natural language workflows</p>
            </div>
          </div>
          
          {!embedded && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Bot className="mb-4 h-12 w-12 text-gray-600" />
              <h4 className="mb-2 text-lg font-medium text-gray-300">
                How can I help you today?
              </h4>
              <p className="mb-6 text-sm text-gray-500">
                I can help you create customers, manage deals, generate reports, and more.
              </p>
              
              {/* Suggested prompts */}
              {suggestedPrompts.length > 0 && (
                <div className="w-full space-y-2">
                  <p className="text-xs text-gray-500">Try asking:</p>
                  {suggestedPrompts.slice(0, 4).map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedPrompt(prompt)}
                      className="w-full rounded-lg border border-gray-700/50 bg-gray-800/50 p-3 text-left text-sm text-gray-300 transition-all hover:border-purple-500/50 hover:bg-gray-800"
                    >
                      <ChevronRight className="mr-2 inline h-3 w-3 text-gray-500" />
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex space-x-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
                    {getIntentIcon(message.metadata?.intent)}
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  
                  {/* Render workflow actions */}
                  {message.metadata?.actions && renderWorkflowActions(message.metadata.actions)}
                  
                  {/* Confidence indicator */}
                  {message.metadata?.confidence !== undefined && message.role === 'assistant' && (
                    <div className="mt-2 flex items-center space-x-2 text-xs text-gray-400">
                      <span>Confidence: {Math.round(message.metadata.confidence * 100)}%</span>
                      {message.metadata.intent && (
                        <span className="capitalize">• Intent: {message.metadata.intent.replace(/_/g, ' ')}</span>
                      )}
                    </div>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex space-x-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-2xl bg-gray-800 px-4 py-3">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500"></div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-700/50 p-4">
          <div className="flex space-x-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your business..."
              className="flex-1 resize-none rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 p-3 text-white transition-all hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}