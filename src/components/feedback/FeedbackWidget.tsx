/**
 * Floating Feedback Widget
 * Always-accessible feedback collection widget for continuous user input
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  X,
  Star,
  Send,
  Lightbulb,
  AlertTriangle,
  Heart,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'
import { api, ApiError } from '@/lib/api-client'

interface FeedbackData {
  type: 'feature_request' | 'bug_report' | 'general_feedback' | 'testimonial'
  rating?: number
  message: string
  email?: string
  category?: string
}

const feedbackTypes = [
  {
    id: 'general_feedback',
    label: 'General Feedback',
    icon: MessageSquare,
    color: 'text-blue-400',
    placeholder: 'Share your thoughts about CoreFlow360...',
  },
  {
    id: 'feature_request',
    label: 'Feature Request',
    icon: Lightbulb,
    color: 'text-yellow-400',
    placeholder: "Describe the feature you'd like to see...",
  },
  {
    id: 'bug_report',
    label: 'Report Bug',
    icon: AlertTriangle,
    color: 'text-red-400',
    placeholder: 'Describe the issue you encountered...',
  },
  {
    id: 'testimonial',
    label: 'Success Story',
    icon: Heart,
    color: 'text-pink-400',
    placeholder: 'Tell us about your success with CoreFlow360...',
  },
]

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { trackEvent } = useTrackEvent()

  const [feedback, setFeedback] = useState<FeedbackData>({
    type: 'general_feedback',
    message: '',
    email: '',
  })

  // Auto-open widget after 30 seconds (only once per session)
  useEffect(() => {
    const hasShownWidget = sessionStorage.getItem('feedback_widget_shown')
    if (!hasShownWidget) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        sessionStorage.setItem('feedback_widget_shown', 'true')
        trackEvent('feedback_widget_auto_opened')
      }, 30000)

      return () => clearTimeout(timer)
    }
  }, [trackEvent])

  const handleOpen = () => {
    setIsOpen(true)
    setIsMinimized(false)
    trackEvent('feedback_widget_opened', { trigger: 'manual' })
  }

  const handleClose = () => {
    setIsOpen(false)
    setCurrentStep(1)
    setIsSubmitted(false)
    setFeedback({
      type: 'general_feedback',
      message: '',
      email: '',
    })
  }

  const handleSubmit = async () => {
    if (!feedback.message.trim()) return

    setIsSubmitting(true)
    trackEvent('feedback_widget_submitted', {
      type: feedback.type,
      has_rating: !!feedback.rating,
      has_email: !!feedback.email,
      message_length: feedback.message.length,
    })

    try {
      // Map frontend fields to backend schema
      const feedbackData = {
        type: feedback.type,
        title: `${getFeedbackTypeLabel(feedback.type)} from Widget`,
        description: feedback.message,
        priority: feedback.rating
          ? feedback.rating >= 4
            ? 'high'
            : feedback.rating <= 2
              ? 'low'
              : 'medium'
          : 'medium',
        category: feedback.category || 'general',
        userEmail: feedback.email || undefined,
        metadata: {
          source: 'widget',
          rating: feedback.rating,
          timestamp: new Date().toISOString(),
        },
      }

      const response = await api.post('/api/feedback/submit', {
        action: 'submit_feedback',
        ...feedbackData,
      })

      if (response.success) {
        setIsSubmitted(true)
        setTimeout(() => {
          handleClose()
        }, 3000) // Auto-close after 3 seconds
      }
    } catch (error) {
      // Could show error state to user here
      if (error instanceof ApiError) {
      }
    }

    setIsSubmitting(false)
  }

  // Helper function to get readable feedback type label
  const getFeedbackTypeLabel = (type: string): string => {
    const typeMap = {
      general_feedback: 'General Feedback',
      feature_request: 'Feature Request',
      bug_report: 'Bug Report',
      testimonial: 'Success Story',
    }
    return typeMap[type as keyof typeof typeMap] || 'Feedback'
  }

  const selectedType = feedbackTypes.find((t) => t.id === feedback.type)

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleOpen}
            className="fixed right-6 bottom-6 z-50 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 p-4 text-white shadow-2xl transition-all duration-300 hover:shadow-violet-500/25"
          >
            <MessageSquare className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Widget Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 60 : 'auto',
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed right-6 bottom-6 z-50 w-96 max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl"
          >
            {/* Header */}
            <div className="border-b border-gray-800 bg-gradient-to-r from-violet-900/50 to-cyan-900/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 p-2">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Quick Feedback</h3>
                    <p className="text-xs text-gray-400">Help us improve CoreFlow360</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    {isMinimized ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4"
                >
                  {!isSubmitted ? (
                    <>
                      {/* Step 1: Type Selection */}
                      {currentStep === 1 && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-3"
                        >
                          <p className="mb-4 text-sm text-gray-300">
                            What would you like to share?
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            {feedbackTypes.map((type) => (
                              <button
                                key={type.id}
                                onClick={() => {
                                  setFeedback((prev) => ({ ...prev, type: type.id as unknown }))
                                  setCurrentStep(2)
                                }}
                                className={`rounded-lg border p-3 text-left transition-all duration-200 ${
                                  feedback.type === type.id
                                    ? 'border-violet-500 bg-violet-500/10'
                                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                }`}
                              >
                                <type.icon className={`h-4 w-4 ${type.color} mb-1`} />
                                <div className="text-xs font-medium text-white">{type.label}</div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Step 2: Feedback Form */}
                      {currentStep === 2 && selectedType && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-4"
                        >
                          <div className="mb-4 flex items-center space-x-2">
                            <selectedType.icon className={`h-4 w-4 ${selectedType.color}`} />
                            <span className="font-medium text-white">{selectedType.label}</span>
                          </div>

                          {/* Rating (for general feedback and testimonials) */}
                          {(feedback.type === 'general_feedback' ||
                            feedback.type === 'testimonial') && (
                            <div>
                              <label className="mb-2 block text-sm text-gray-300">
                                How would you rate your experience?
                              </label>
                              <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <button
                                    key={rating}
                                    onClick={() => setFeedback((prev) => ({ ...prev, rating }))}
                                    className="transition-colors"
                                  >
                                    <Star
                                      className={`h-6 w-6 ${
                                        (feedback.rating || 0) >= rating
                                          ? 'fill-current text-yellow-400'
                                          : 'text-gray-600'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Message */}
                          <div>
                            <label className="mb-2 block text-sm text-gray-300">
                              Your message *
                            </label>
                            <textarea
                              value={feedback.message}
                              onChange={(e) =>
                                setFeedback((prev) => ({ ...prev, message: e.target.value }))
                              }
                              placeholder={selectedType.placeholder}
                              rows={4}
                              className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 transition-colors focus:border-violet-500 focus:outline-none"
                            />
                          </div>

                          {/* Email (optional) */}
                          <div>
                            <label className="mb-2 block text-sm text-gray-300">
                              Email (optional)
                            </label>
                            <input
                              type="email"
                              value={feedback.email}
                              onChange={(e) =>
                                setFeedback((prev) => ({ ...prev, email: e.target.value }))
                              }
                              placeholder="your.email@company.com"
                              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 transition-colors focus:border-violet-500 focus:outline-none"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              We'll only use this to follow up if needed
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-between pt-2">
                            <button
                              onClick={() => setCurrentStep(1)}
                              className="text-sm text-gray-400 transition-colors hover:text-white"
                            >
                              ← Back
                            </button>

                            <button
                              onClick={handleSubmit}
                              disabled={!feedback.message.trim() || isSubmitting}
                              className="flex items-center rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:from-violet-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isSubmitting ? (
                                <>
                                  <div className="mr-2 h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                                  Sending...
                                </>
                              ) : (
                                <>
                                  Send <Send className="ml-2 h-3 w-3" />
                                </>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    /* Success State */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-6 text-center"
                    >
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="mb-2 font-semibold text-white">Thank You!</h3>
                      <p className="text-sm text-gray-400">
                        Your feedback has been received. We appreciate you taking the time to help
                        us improve.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
