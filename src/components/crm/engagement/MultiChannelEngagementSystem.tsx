'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  VideoCameraIcon,
  PhoneIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  BellIcon,
  ClockIcon,
  ChartBarIcon,
  SparklesIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  FireIcon,
  BoltIcon,
  SignalIcon,
  MapPinIcon,
  DocumentTextIcon,
  PhotoIcon,
  MusicalNoteIcon,
  CubeIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface EngagementChannel {
  id: string
  name: string
  type:
    | 'email'
    | 'sms'
    | 'whatsapp'
    | 'linkedin'
    | 'phone'
    | 'video'
    | 'direct_mail'
    | 'social'
    | 'calendar'
  icon: React.ComponentType<unknown>
  availability: 'always' | 'business_hours' | 'custom'
  cost: number
  engagement_rate: number
  response_rate: number
  conversion_rate: number
  setup_time: number
  personalization_level: 'low' | 'medium' | 'high' | 'ultra'
  automation_capable: boolean
  premium: boolean
}

interface EngagementSequence {
  id: string
  name: string
  description: string
  channels: EngagementStep[]
  trigger: 'immediate' | 'time_based' | 'behavior_based' | 'event_based'
  success_criteria: string[]
  fallback_sequence?: string
}

interface EngagementStep {
  id: string
  channel: string
  delay: number
  condition?: string
  content: {
    type: 'text' | 'rich_media' | 'interactive' | 'physical'
    template: string
    personalization: Record<string, string>
    attachments?: string[]
  }
  success_criteria: string[]
  fallback_action: 'skip' | 'retry' | 'escalate' | 'pause'
}

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company: string
  title: string
  linkedin?: string
  engagement_history: EngagementEvent[]
  preferences: {
    preferred_channels: string[]
    time_zone: string
    best_contact_time: string
    do_not_contact: string[]
  }
  scores: {
    engagement: number
    interest: number
    fit: number
    urgency: number
  }
}

interface EngagementEvent {
  id: string
  channel: string
  type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'responded' | 'converted'
  timestamp: string
  content_id?: string
  metadata?: Record<string, unknown>
}

const ENGAGEMENT_CHANNELS: EngagementChannel[] = [
  {
    id: 'email',
    name: 'Email',
    type: 'email',
    icon: EnvelopeIcon,
    availability: 'always',
    cost: 0.02,
    engagement_rate: 25.7,
    response_rate: 8.2,
    conversion_rate: 2.1,
    setup_time: 5,
    personalization_level: 'high',
    automation_capable: true,
    premium: false,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Messages',
    type: 'linkedin',
    icon: UserGroupIcon,
    availability: 'business_hours',
    cost: 0.15,
    engagement_rate: 45.3,
    response_rate: 23.8,
    conversion_rate: 8.7,
    setup_time: 10,
    personalization_level: 'ultra',
    automation_capable: true,
    premium: true,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    type: 'whatsapp',
    icon: ChatBubbleLeftRightIcon,
    availability: 'custom',
    cost: 0.05,
    engagement_rate: 89.2,
    response_rate: 67.4,
    conversion_rate: 23.1,
    setup_time: 3,
    personalization_level: 'medium',
    automation_capable: true,
    premium: true,
  },
  {
    id: 'personalized_video',
    name: 'Personalized Video',
    type: 'video',
    icon: VideoCameraIcon,
    availability: 'always',
    cost: 2.5,
    engagement_rate: 94.5,
    response_rate: 78.3,
    conversion_rate: 34.7,
    setup_time: 30,
    personalization_level: 'ultra',
    automation_capable: true,
    premium: true,
  },
  {
    id: 'direct_mail',
    name: 'Direct Mail',
    type: 'direct_mail',
    icon: MapPinIcon,
    availability: 'business_hours',
    cost: 8.5,
    engagement_rate: 67.8,
    response_rate: 34.2,
    conversion_rate: 12.4,
    setup_time: 120,
    personalization_level: 'ultra',
    automation_capable: false,
    premium: true,
  },
  {
    id: 'phone_call',
    name: 'Phone Call',
    type: 'phone',
    icon: PhoneIcon,
    availability: 'business_hours',
    cost: 5.0,
    engagement_rate: 78.9,
    response_rate: 45.6,
    conversion_rate: 18.3,
    setup_time: 15,
    personalization_level: 'ultra',
    automation_capable: false,
    premium: false,
  },
  {
    id: 'calendar_booking',
    name: 'Calendar Booking',
    type: 'calendar',
    icon: CalendarDaysIcon,
    availability: 'business_hours',
    cost: 0.1,
    engagement_rate: 34.5,
    response_rate: 23.7,
    conversion_rate: 15.8,
    setup_time: 5,
    personalization_level: 'medium',
    automation_capable: true,
    premium: false,
  },
  {
    id: 'social_media',
    name: 'Social Media',
    type: 'social',
    icon: GlobeAltIcon,
    availability: 'always',
    cost: 0.25,
    engagement_rate: 12.4,
    response_rate: 3.8,
    conversion_rate: 1.2,
    setup_time: 20,
    personalization_level: 'medium',
    automation_capable: true,
    premium: false,
  },
]

const SEQUENCE_TEMPLATES = [
  {
    id: 'executive_outreach',
    name: 'Executive Outreach Sequence',
    description: 'High-touch sequence for C-level executives with premium touchpoints',
    channels: [
      {
        id: 'step_1',
        channel: 'linkedin',
        delay: 0,
        content: {
          type: 'text',
          template: 'executive_connection_request',
          personalization: {},
        },
        success_criteria: ['connection_accepted'],
        fallback_action: 'skip',
      },
      {
        id: 'step_2',
        channel: 'personalized_video',
        delay: 2,
        condition: 'connection_accepted',
        content: {
          type: 'rich_media',
          template: 'ceo_introduction_video',
          personalization: {},
        },
        success_criteria: ['video_watched'],
        fallback_action: 'retry',
      },
      {
        id: 'step_3',
        channel: 'direct_mail',
        delay: 7,
        content: {
          type: 'physical',
          template: 'executive_survival_kit',
          personalization: {},
        },
        success_criteria: ['package_delivered'],
        fallback_action: 'escalate',
      },
      {
        id: 'step_4',
        channel: 'phone_call',
        delay: 14,
        content: {
          type: 'interactive',
          template: 'follow_up_call',
          personalization: {},
        },
        success_criteria: ['call_completed', 'meeting_booked'],
        fallback_action: 'pause',
      },
    ],
    trigger: 'immediate',
    success_criteria: ['meeting_booked', 'demo_scheduled'],
  },
  {
    id: 'nurture_sequence',
    name: 'Nurture & Education Sequence',
    description: 'Multi-touch educational sequence to build trust and authority',
    channels: [
      {
        id: 'step_1',
        channel: 'email',
        delay: 0,
        content: {
          type: 'rich_media',
          template: 'industry_insights_email',
          personalization: {},
        },
        success_criteria: ['email_opened'],
        fallback_action: 'retry',
      },
      {
        id: 'step_2',
        channel: 'linkedin',
        delay: 3,
        content: {
          type: 'text',
          template: 'thought_leadership_post',
          personalization: {},
        },
        success_criteria: ['post_engagement'],
        fallback_action: 'skip',
      },
      {
        id: 'step_3',
        channel: 'whatsapp',
        delay: 7,
        content: {
          type: 'rich_media',
          template: 'case_study_share',
          personalization: {},
        },
        success_criteria: ['content_shared'],
        fallback_action: 'retry',
      },
    ],
    trigger: 'behavior_based',
    success_criteria: ['engagement_increase', 'content_consumption'],
  },
]

export default function MultiChannelEngagementSystem() {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [activeSequences, setActiveSequences] = useState<unknown[]>([])
  const [sequenceBuilder, setSequenceBuilder] = useState<unknown>(null)
  const [engagementAnalytics, setEngagementAnalytics] = useState<unknown>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    loadEngagementData()
  }, [])

  const loadEngagementData = async () => {
    try {
      // Simulate API calls
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setEngagementAnalytics({
        total_contacts: 1247,
        active_sequences: 23,
        response_rate: 34.7,
        conversion_rate: 12.4,
        channel_performance: ENGAGEMENT_CHANNELS.map((channel) => ({
          channel: channel.id,
          sent: Math.floor(Math.random() * 1000) + 100,
          delivered: Math.floor(Math.random() * 800) + 80,
          opened: Math.floor(Math.random() * 600) + 60,
          responded: Math.floor(Math.random() * 200) + 20,
        })),
      })

      setActiveSequences([
        {
          id: '1',
          name: 'Executive Outreach - Q1',
          contacts: 45,
          status: 'running',
          success_rate: 23.4,
        },
        {
          id: '2',
          name: 'Product Demo Follow-up',
          contacts: 67,
          status: 'paused',
          success_rate: 18.7,
        },
      ])
    } catch (error) {
      toast.error('Failed to load engagement data')
    }
  }

  const startSequence = useCallback(
    async (sequenceId: string, contactIds: string[]) => {
      setIsRunning(true)
      try {
        const response = await fetch('/api/crm/engagement/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sequenceId,
            contactIds,
            channels: selectedChannels,
          }),
        })

        if (response.ok) {
          toast.success('Engagement sequence started!')
          loadEngagementData()
        }
      } catch (error) {
        toast.error('Failed to start sequence')
      } finally {
        setIsRunning(false)
      }
    },
    [selectedChannels]
  )

  const pauseSequence = useCallback(async (sequenceId: string) => {
    try {
      const response = await fetch('/api/crm/engagement/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequenceId }),
      })

      if (response.ok) {
        toast.success('Sequence paused')
        loadEngagementData()
      }
    } catch (error) {
      toast.error('Failed to pause sequence')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Multi-Channel Engagement System</h1>
          <p className="text-lg text-gray-600">
            Orchestrate personalized outreach across every channel
          </p>
        </div>

        {/* Analytics Overview */}
        {engagementAnalytics && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-white p-6 shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {engagementAnalytics.total_contacts.toLocaleString()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Total Contacts</h3>
              <p className="text-sm text-gray-600">Active in engagement sequences</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl bg-white p-6 shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <BoltIcon className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {engagementAnalytics.active_sequences}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Active Sequences</h3>
              <p className="text-sm text-gray-600">Running across all channels</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl bg-white p-6 shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <SignalIcon className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {engagementAnalytics.response_rate}%
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Response Rate</h3>
              <p className="text-sm text-gray-600">Across all channels</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl bg-white p-6 shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <ChartBarIcon className="h-8 w-8 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {engagementAnalytics.conversion_rate}%
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
              <p className="text-sm text-gray-600">Meetings & demos booked</p>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Channel Selection */}
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 flex items-center text-lg font-semibold">
                <AdjustmentsHorizontalIcon className="mr-2 h-5 w-5 text-purple-600" />
                Available Channels
              </h3>
              <div className="space-y-3">
                {ENGAGEMENT_CHANNELS.map((channel) => (
                  <div
                    key={channel.id}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      selectedChannels.includes(channel.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      if (selectedChannels.includes(channel.id)) {
                        setSelectedChannels((prev) => prev.filter((id) => id !== channel.id))
                      } else {
                        setSelectedChannels((prev) => [...prev, channel.id])
                      }
                    }}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <channel.icon className="mr-3 h-6 w-6 text-gray-600" />
                        <span className="font-medium">{channel.name}</span>
                      </div>
                      {channel.premium && (
                        <span className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 text-xs text-white">
                          PRO
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>Response: {channel.response_rate}%</div>
                      <div>Convert: {channel.conversion_rate}%</div>
                      <div>Cost: ${channel.cost}</div>
                      <div>Setup: {channel.setup_time}min</div>
                    </div>

                    <div className="mt-2">
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-purple-600 transition-all"
                          style={{ width: `${channel.engagement_rate}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {channel.engagement_rate}% engagement rate
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Sequences */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold">Active Sequences</h3>
              <div className="space-y-3">
                {activeSequences.map((sequence) => (
                  <div
                    key={sequence.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{sequence.name}</h4>
                      <p className="text-sm text-gray-600">{sequence.contacts} contacts</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          sequence.status === 'running' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                      />
                      <button
                        onClick={() =>
                          sequence.status === 'running'
                            ? pauseSequence(sequence.id)
                            : startSequence(sequence.id, [])
                        }
                        className="rounded p-1 hover:bg-gray-200"
                      >
                        {sequence.status === 'running' ? (
                          <PauseIcon className="h-4 w-4 text-gray-600" />
                        ) : (
                          <PlayIcon className="h-4 w-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sequence Builder */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold">Sequence Templates</h3>
              <div className="grid grid-cols-1 gap-4">
                {SEQUENCE_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className="rounded-lg border p-4 transition-all hover:border-purple-500"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="mt-1 text-sm text-gray-600">{template.description}</p>
                      </div>
                      <button
                        onClick={() => startSequence(template.id, [])}
                        disabled={isRunning}
                        className="rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                      >
                        {isRunning ? 'Starting...' : 'Start'}
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{template.channels.length} steps</span>
                      <span className="flex items-center">
                        <ClockIcon className="mr-1 h-4 w-4" />
                        {Math.max(...template.channels.map((c) => c.delay))} days
                      </span>
                    </div>

                    {/* Channel Flow */}
                    <div className="mt-4 flex items-center gap-2">
                      {template.channels.map((step, index) => {
                        const channel = ENGAGEMENT_CHANNELS.find((c) => c.id === step.channel)
                        return (
                          <React.Fragment key={step.id}>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                              {channel && <channel.icon className="h-4 w-4 text-purple-600" />}
                            </div>
                            {index < template.channels.length - 1 && (
                              <ArrowPathIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </React.Fragment>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Channel Performance */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold">Channel Performance</h3>
              {engagementAnalytics && (
                <div className="space-y-4">
                  {engagementAnalytics.channel_performance.map((perf: unknown) => {
                    const channel = ENGAGEMENT_CHANNELS.find((c) => c.id === perf.channel)
                    if (!channel) return null

                    return (
                      <div
                        key={perf.channel}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                      >
                        <div className="flex items-center">
                          <channel.icon className="mr-3 h-6 w-6 text-gray-600" />
                          <div>
                            <h4 className="font-medium text-gray-900">{channel.name}</h4>
                            <p className="text-sm text-gray-600">
                              {perf.sent} sent • {perf.delivered} delivered
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {((perf.responded / perf.sent) * 100).toFixed(1)}%
                          </div>
                          <p className="text-sm text-gray-600">Response rate</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Real-time Activity Feed */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 flex items-center text-lg font-semibold">
                <BellIcon className="mr-2 h-5 w-5 text-green-600" />
                Real-time Activity
              </h3>
              <div className="space-y-3">
                {[
                  {
                    action: 'Email opened',
                    contact: 'John Smith @ Acme Corp',
                    channel: 'email',
                    time: '2 min ago',
                    status: 'success',
                  },
                  {
                    action: 'LinkedIn message sent',
                    contact: 'Sarah Chen @ TechStart',
                    channel: 'linkedin',
                    time: '5 min ago',
                    status: 'pending',
                  },
                  {
                    action: 'Video watched',
                    contact: 'Mike Johnson @ BigCorp',
                    channel: 'video',
                    time: '12 min ago',
                    status: 'success',
                  },
                  {
                    action: 'Phone call completed',
                    contact: 'Lisa Wong @ StartupCo',
                    channel: 'phone',
                    time: '1 hour ago',
                    status: 'success',
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 rounded-lg p-3 hover:bg-gray-50"
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-600">{activity.contact}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
