/**
 * Floating AI Assistant Component
 * Global AI assistant that can be accessed from anywhere
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Sparkles } from 'lucide-react'
import { ConversationInterface } from './ConversationInterface'
import { useSession } from 'next-auth/react'

interface FloatingAIAssistantProps {
  department?: string
  defaultOpen?: boolean
}

export function FloatingAIAssistant({
  department,
  defaultOpen = false,
}: FloatingAIAssistantProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [hasUnread, setHasUnread] = useState(false)
  const [pulseAnimation, setPulseAnimation] = useState(true)

  // Show pulse animation periodically to draw attention
  useEffect(() => {
    if (!isOpen && session?.user) {
      const interval = setInterval(() => {
        setPulseAnimation(true)
        setTimeout(() => setPulseAnimation(false), 3000)
      }, 30000) // Every 30 seconds

      return () => clearInterval(interval)
    }
  }, [isOpen, session])

  if (!session?.user) return null

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg transition-all hover:shadow-xl"
          >
            <MessageSquare className="h-6 w-6 text-white" />
            
            {/* Notification dot */}
            {hasUnread && (
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />
            )}
            
            {/* Pulse animation */}
            {pulseAnimation && (
              <>
                <div className="absolute inset-0 animate-ping rounded-full bg-purple-600 opacity-75" />
                <div className="absolute inset-0 animate-ping rounded-full bg-purple-600 opacity-50 [animation-delay:0.5s]" />
              </>
            )}
            
            {/* Sparkle indicator */}
            <Sparkles className="absolute -top-1 -left-1 h-4 w-4 animate-pulse text-yellow-400" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <ConversationInterface
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            department={department}
          />
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * Hook to control the floating AI assistant from other components
 */
export function useFloatingAI() {
  const [isOpen, setIsOpen] = useState(false)

  const openAssistant = (message?: string) => {
    setIsOpen(true)
    
    // If a message is provided, we could pre-fill it
    // This would require additional state management
    if (message) {
      // TODO: Implement pre-fill functionality
      console.log('Pre-fill message:', message)
    }
  }

  const closeAssistant = () => {
    setIsOpen(false)
  }

  return {
    isOpen,
    openAssistant,
    closeAssistant,
  }
}