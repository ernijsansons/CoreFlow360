/**
 * CoreFlow360 - Comprehensive Feedback System
 * Advanced feedback collection with A/B testing integration and continuous improvement
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Star,
  Send,
  X,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Lightbulb,
  AlertTriangle,
  Camera,
  Mic,
  MicOff,
  Image as ImageIcon,
  TrendingUp,
  Users,
  Target,
  Zap,
  BarChart3,
  CheckCircle,
  Clock,
  Filter,
  Download,
} from 'lucide-react'
import { useABTesting, useABTestAnalytics } from '@/lib/testing/ab-testing-framework'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'
import { useI18n, TranslationKey } from '@/lib/i18n/i18n-system'
import {
  AccessibleButton,
  AccessibleInput,
  AccessibleSelect,
} from '@/components/accessibility/AccessibleComponents'

// Feedback Types
export interface FeedbackData {
  id: string
  type: 'rating' | 'suggestion' | 'bug' | 'compliment' | 'feature_request' | 'usability'
  rating?: number
  message: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  attachments?: FeedbackAttachment[]
  userContext: {
    page: string
    userAgent: string
    viewport: { width: number; height: number }
    timestamp: Date
    sessionId: string
    abTestVariants?: Record<string, string>
  }
  sentiment: 'positive' | 'neutral' | 'negative'
  status: 'new' | 'reviewed' | 'in_progress' | 'resolved' | 'closed'
  userId: string
  userRole: string
}

export interface FeedbackAttachment {
  id: string
  type: 'image' | 'audio' | 'video'
  url: string
  thumbnail?: string
  duration?: number
}

// Survey Configuration
export interface SurveyConfig {
  id: string
  title: string
  description: string
  questions: SurveyQuestion[]
  targetAudience: {
    userRoles?: string[]
    pages?: string[]
    afterActions?: string[]
    timing?: 'immediate' | 'delayed' | 'exit_intent'
  }
  isActive: boolean
  maxResponses?: number
  endDate?: Date
}

export interface SurveyQuestion {
  id: string
  type: 'rating' | 'multiple_choice' | 'text' | 'nps' | 'yes_no'
  question: string
  required: boolean
  options?: string[]
  scale?: { min: number; max: number; labels?: string[] }
}

// NPS Survey Component
interface NPSurveyProps {
  onComplete: (score: number, feedback?: string) => void
  onDismiss: () => void
  trigger?: string
}

export function NPSSurvey({ onComplete, onDismiss, trigger }: NPSurveyProps) {
  const { t } = useI18n()
  const [score, setScore] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { trackEvent } = useTrackEvent()

  const handleSubmit = async () => {
    if (score === null) return

    setIsSubmitting(true)

    trackEvent('nps_survey_completed', {
      score,
      feedback_length: feedback.length,
      trigger: trigger || 'manual',
    })

    await onComplete(score, feedback)
    setIsSubmitting(false)
  }

  const getNPSLabel = (score: number): string => {
    if (score <= 6) return 'Detractor'
    if (score <= 8) return 'Passive'
    return 'Promoter'
  }

  const getNPSColor = (score: number): string => {
    if (score <= 6) return 'text-red-400'
    if (score <= 8) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed right-6 bottom-6 z-50 max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 p-2">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Quick Feedback</h3>
            <p className="text-sm text-gray-400">Help us improve CoreFlow360</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 text-gray-400 transition-colors hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-4 text-sm text-gray-300">
            How likely are you to recommend CoreFlow360 to a friend or colleague?
          </p>

          <div className="space-y-3">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Not at all likely</span>
              <span>Extremely likely</span>
            </div>

            <div className="flex gap-2">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setScore(i)}
                  className={`h-8 w-8 rounded-lg border transition-all ${
                    score === i
                      ? 'border-violet-500 bg-violet-500 text-white'
                      : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>

            {score !== null && (
              <p className={`text-sm ${getNPSColor(score)}`}>
                {score}: {getNPSLabel(score)}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">
            What's the main reason for your score? (Optional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Your feedback helps us improve..."
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 transition-colors focus:border-violet-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-between pt-2">
          <button
            onClick={onDismiss}
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            Not now
          </button>

          <AccessibleButton
            onClick={handleSubmit}
            disabled={score === null || isSubmitting}
            loading={isSubmitting}
            size="sm"
          >
            Submit Feedback
            <Send className="ml-2 h-3 w-3" />
          </AccessibleButton>
        </div>
      </div>
    </motion.div>
  )
}

// Advanced Feedback Form
interface AdvancedFeedbackFormProps {
  onSubmit: (feedback: Partial<FeedbackData>) => void
  onCancel: () => void
  initialType?: FeedbackData['type']
  context?: Partial<FeedbackData['userContext']>
}

export function AdvancedFeedbackForm({
  onSubmit,
  onCancel,
  initialType = 'suggestion',
  context,
}: AdvancedFeedbackFormProps) {
  const { t } = useI18n()
  const { getUserTests, getVariant } = useABTesting()
  const { trackEvent } = useTrackEvent()

  const [feedback, setFeedback] = useState<Partial<FeedbackData>>({
    type: initialType,
    rating: undefined,
    message: '',
    category: 'general',
    priority: 'medium',
    tags: [],
  })

  const [isRecording, setIsRecording] = useState(false)
  const [attachments, setAttachments] = useState<FeedbackAttachment[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)

  const feedbackTypes = [
    { value: 'rating', label: 'General Rating', icon: Star },
    { value: 'suggestion', label: 'Suggestion', icon: Lightbulb },
    { value: 'bug', label: 'Bug Report', icon: AlertTriangle },
    { value: 'compliment', label: 'Compliment', icon: Heart },
    { value: 'feature_request', label: 'Feature Request', icon: Target },
    { value: 'usability', label: 'Usability Issue', icon: Users },
  ]

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'navigation', label: 'Navigation' },
    { value: 'performance', label: 'Performance' },
    { value: 'design', label: 'Design/UI' },
    { value: 'functionality', label: 'Functionality' },
    { value: 'mobile', label: 'Mobile Experience' },
    { value: 'accessibility', label: 'Accessibility' },
    { value: 'ai_features', label: 'AI Features' },
  ]

  const priorities = [
    { value: 'low', label: 'Low - Minor improvement' },
    { value: 'medium', label: 'Medium - Noticeable impact' },
    { value: 'high', label: 'High - Significant issue' },
    { value: 'critical', label: 'Critical - Blocks usage' },
  ]

  const handleSubmit = () => {
    // Get current A/B test variants for context
    const abTestVariants: Record<string, string> = {}
    getUserTests().forEach((testId) => {
      const variant = getVariant(testId)
      if (variant) {
        abTestVariants[testId] = variant.id
      }
    })

    const feedbackData: Partial<FeedbackData> = {
      ...feedback,
      userContext: {
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        timestamp: new Date(),
        sessionId: 'session_' + Math.random().toString(36).substr(2, 9),
        abTestVariants,
        ...context,
      },
      attachments,
    }

    trackEvent('advanced_feedback_submitted', {
      type: feedback.type,
      category: feedback.category,
      priority: feedback.priority,
      has_attachments: attachments.length > 0,
      message_length: feedback.message?.length || 0,
    })

    onSubmit(feedbackData)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const attachment: FeedbackAttachment = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'image',
            url: e.target?.result as string,
          }
          setAttachments((prev) => [...prev, attachment])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)

      const chunks: BlobPart[] = []

      mediaRecorder.current.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        const url = URL.createObjectURL(blob)

        const attachment: FeedbackAttachment = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'audio',
          url,
          duration: chunks.length, // Simplified duration
        }

        setAttachments((prev) => [...prev, attachment])
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.current.start()
      setIsRecording(true)
    } catch (error) {}
  }

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop()
      setIsRecording(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-800 bg-gray-900 p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Share Your Feedback</h2>
            <p className="text-sm text-gray-400">Help us make CoreFlow360 even better</p>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Feedback Type */}
          <div>
            <label className="mb-3 block text-sm font-medium text-white">
              What type of feedback is this?
            </label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {feedbackTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFeedback((prev) => ({ ...prev, type: type.value as unknown }))}
                  className={`rounded-lg border p-3 transition-all ${
                    feedback.type === type.value
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <type.icon className="mx-auto mb-2 h-5 w-5 text-violet-400" />
                  <div className="text-xs font-medium text-white">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Rating (for rating type) */}
          {feedback.type === 'rating' && (
            <div>
              <label className="mb-3 block text-sm font-medium text-white">
                How would you rate your experience?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFeedback((prev) => ({ ...prev, rating }))}
                    className="transition-colors"
                  >
                    <Star
                      className={`h-8 w-8 ${
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
            <label className="mb-3 block text-sm font-medium text-white">Tell us more *</label>
            <textarea
              value={feedback.message}
              onChange={(e) => setFeedback((prev) => ({ ...prev, message: e.target.value }))}
              placeholder={
                feedback.type === 'bug'
                  ? 'Describe the bug and steps to reproduce...'
                  : feedback.type === 'suggestion'
                    ? 'What would you like to see improved?'
                    : 'Share your thoughts...'
              }
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 transition-colors focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* Category and Priority */}
          <div className="grid gap-4 md:grid-cols-2">
            <AccessibleSelect
              label="Category"
              value={feedback.category || 'general'}
              onChange={(value) => setFeedback((prev) => ({ ...prev, category: value }))}
              options={categories}
            />

            <AccessibleSelect
              label="Priority"
              value={feedback.priority || 'medium'}
              onChange={(value) => setFeedback((prev) => ({ ...prev, priority: value as unknown }))}
              options={priorities}
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="mb-3 block text-sm font-medium text-white">
              Attachments (Optional)
            </label>

            <div className="mb-4 flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-gray-300 transition-colors hover:border-gray-600"
              >
                <ImageIcon className="h-4 w-4" />
                Add Image
              </button>

              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors ${
                  isRecording
                    ? 'border-red-500 bg-red-600 text-white'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Record Audio
                  </>
                )}
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="relative">
                    {attachment.type === 'image' ? (
                      <img
                        src={attachment.url}
                        alt="Attachment"
                        className="h-20 w-full rounded-lg border border-gray-700 object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-full items-center justify-center rounded-lg border border-gray-700 bg-gray-800">
                        <Mic className="h-6 w-6 text-gray-400" />
                      </div>
                    )}

                    <button
                      onClick={() =>
                        setAttachments((prev) => prev.filter((a) => a.id !== attachment.id))
                      }
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between border-t border-gray-800 pt-4">
            <button onClick={onCancel} className="text-gray-400 transition-colors hover:text-white">
              Cancel
            </button>

            <AccessibleButton onClick={handleSubmit} disabled={!feedback.message?.trim()}>
              Submit Feedback
              <Send className="ml-2 h-4 w-4" />
            </AccessibleButton>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Feedback Analytics Dashboard
export function FeedbackAnalyticsDashboard() {
  const { t } = useI18n()
  const { getTestSummary, activeTests } = useABTestAnalytics()
  const [selectedTest, setSelectedTest] = useState<string>('')
  const [timeRange, setTimeRange] = useState('7d')

  // Mock feedback data for demo
  const feedbackStats = {
    totalFeedback: 247,
    npsScore: 42,
    sentiment: { positive: 65, neutral: 25, negative: 10 },
    categoryBreakdown: {
      general: 45,
      navigation: 32,
      performance: 28,
      design: 41,
      functionality: 51,
      mobile: 23,
      accessibility: 12,
      ai_features: 35,
    },
    priorityBreakdown: {
      critical: 8,
      high: 34,
      medium: 125,
      low: 80,
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Feedback Analytics</h2>
          <p className="text-gray-400">User feedback and A/B test insights</p>
        </div>

        <div className="flex gap-3">
          <AccessibleSelect
            label=""
            value={timeRange}
            onChange={setTimeRange}
            options={[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' },
            ]}
          />

          <AccessibleButton variant="secondary" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </AccessibleButton>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
          <div className="mb-2 flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium text-gray-400">Total Feedback</span>
          </div>
          <p className="text-2xl font-bold text-white">{feedbackStats.totalFeedback}</p>
          <p className="text-sm text-green-400">+12% from last period</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
          <div className="mb-2 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-violet-400" />
            <span className="text-sm font-medium text-gray-400">NPS Score</span>
          </div>
          <p className="text-2xl font-bold text-white">{feedbackStats.npsScore}</p>
          <p className="text-sm text-green-400">+5 points improved</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
          <div className="mb-2 flex items-center gap-3">
            <Heart className="h-5 w-5 text-pink-400" />
            <span className="text-sm font-medium text-gray-400">Positive Sentiment</span>
          </div>
          <p className="text-2xl font-bold text-white">{feedbackStats.sentiment.positive}%</p>
          <p className="text-sm text-green-400">+8% improvement</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
          <div className="mb-2 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-medium text-gray-400">Resolved Issues</span>
          </div>
          <p className="text-2xl font-bold text-white">89%</p>
          <p className="text-sm text-green-400">Resolution rate</p>
        </div>
      </div>

      {/* A/B Test Results */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">A/B Test Performance</h3>

        <div className="space-y-4">
          {activeTests.map((test) => {
            const summary = getTestSummary(test.id)
            if (!summary) return null

            return (
              <div key={test.id} className="rounded-lg border border-gray-800 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{test.name}</h4>
                    <p className="text-sm text-gray-400">{test.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {summary.totalParticipants} participants
                    </span>
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {test.variants.map((variant) => (
                    <div key={variant.id} className="rounded-lg bg-gray-800/50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium text-white">{variant.name}</span>
                        <span className="text-sm text-gray-400">
                          {summary.variantBreakdown[variant.id]} users
                        </span>
                      </div>

                      {test.metrics.map((metric) => (
                        <div key={metric.id} className="flex justify-between text-sm">
                          <span className="text-gray-400">{metric.name}</span>
                          <span className="text-white">
                            {summary.metrics[metric.id]?.[variant.id]?.toFixed(1) || '0'}
                            {metric.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Feedback Categories */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Feedback by Category</h3>
          <div className="space-y-3">
            {Object.entries(feedbackStats.categoryBreakdown).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-gray-300 capitalize">{category.replace('_', ' ')}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 rounded-full bg-gray-800">
                    <div
                      className="h-2 rounded-full bg-violet-500"
                      style={{ width: `${(count / feedbackStats.totalFeedback) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm text-white">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Priority Distribution</h3>
          <div className="space-y-3">
            {Object.entries(feedbackStats.priorityBreakdown).map(([priority, count]) => {
              const colors = {
                critical: 'bg-red-500',
                high: 'bg-orange-500',
                medium: 'bg-yellow-500',
                low: 'bg-green-500',
              }

              return (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full ${colors[priority as keyof typeof colors]}`}
                    />
                    <span className="text-gray-300 capitalize">{priority}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-32 rounded-full bg-gray-800">
                      <div
                        className={`${colors[priority as keyof typeof colors]} h-2 rounded-full`}
                        style={{ width: `${(count / feedbackStats.totalFeedback) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm text-white">{count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
