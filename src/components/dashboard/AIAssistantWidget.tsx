/**
 * AI Assistant Widget for Dashboard
 * Embedded AI conversation interface for dashboard pages
 */

import { ConversationInterface } from '../ai/ConversationInterface'
import { motion } from 'framer-motion'
import { Brain, Sparkles } from 'lucide-react'

interface AIAssistantWidgetProps {
  department?: string
  className?: string
}

export function AIAssistantWidget({
  department = 'dashboard',
  className = '',
}: AIAssistantWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-gray-700/50 bg-gray-800/40 backdrop-blur-sm ${className}`}
    >
      <div className="border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
              <p className="text-xs text-gray-400">Ask anything about your business</p>
            </div>
          </div>
          <Sparkles className="h-5 w-5 text-purple-400" />
        </div>
      </div>
      
      <div className="h-[400px]">
        <ConversationInterface
          isOpen={true}
          department={department}
          embedded={true}
          className="h-full"
        />
      </div>
    </motion.div>
  )
}