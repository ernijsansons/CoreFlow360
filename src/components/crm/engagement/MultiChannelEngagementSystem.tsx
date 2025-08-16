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
  CubeIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface EngagementChannel {
  id: string
  name: string
  type: 'email' | 'sms' | 'whatsapp' | 'linkedin' | 'phone' | 'video' | 'direct_mail' | 'social' | 'calendar'
  icon: React.ComponentType<any>
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
  metadata?: Record<string, any>
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
    premium: false
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
    premium: true
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
    premium: true
  },
  {
    id: 'personalized_video',
    name: 'Personalized Video',
    type: 'video',
    icon: VideoCameraIcon,
    availability: 'always',
    cost: 2.50,
    engagement_rate: 94.5,
    response_rate: 78.3,
    conversion_rate: 34.7,
    setup_time: 30,
    personalization_level: 'ultra',
    automation_capable: true,
    premium: true
  },
  {
    id: 'direct_mail',
    name: 'Direct Mail',
    type: 'direct_mail',
    icon: MapPinIcon,
    availability: 'business_hours',
    cost: 8.50,
    engagement_rate: 67.8,
    response_rate: 34.2,
    conversion_rate: 12.4,
    setup_time: 120,
    personalization_level: 'ultra',
    automation_capable: false,
    premium: true
  },
  {
    id: 'phone_call',
    name: 'Phone Call',
    type: 'phone',
    icon: PhoneIcon,
    availability: 'business_hours',
    cost: 5.00,
    engagement_rate: 78.9,
    response_rate: 45.6,
    conversion_rate: 18.3,
    setup_time: 15,
    personalization_level: 'ultra',
    automation_capable: false,
    premium: false
  },
  {
    id: 'calendar_booking',
    name: 'Calendar Booking',
    type: 'calendar',
    icon: CalendarDaysIcon,
    availability: 'business_hours',
    cost: 0.10,
    engagement_rate: 34.5,
    response_rate: 23.7,
    conversion_rate: 15.8,
    setup_time: 5,
    personalization_level: 'medium',
    automation_capable: true,
    premium: false
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
    premium: false
  }
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
          personalization: {}
        },
        success_criteria: ['connection_accepted'],
        fallback_action: 'skip'
      },
      {
        id: 'step_2',
        channel: 'personalized_video',
        delay: 2,
        condition: 'connection_accepted',
        content: {
          type: 'rich_media',
          template: 'ceo_introduction_video',
          personalization: {}
        },
        success_criteria: ['video_watched'],
        fallback_action: 'retry'
      },
      {
        id: 'step_3',
        channel: 'direct_mail',
        delay: 7,
        content: {
          type: 'physical',
          template: 'executive_survival_kit',
          personalization: {}
        },
        success_criteria: ['package_delivered'],
        fallback_action: 'escalate'
      },
      {
        id: 'step_4',
        channel: 'phone_call',
        delay: 14,
        content: {
          type: 'interactive',
          template: 'follow_up_call',
          personalization: {}
        },
        success_criteria: ['call_completed', 'meeting_booked'],
        fallback_action: 'pause'
      }
    ],
    trigger: 'immediate',
    success_criteria: ['meeting_booked', 'demo_scheduled']
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
          personalization: {}
        },
        success_criteria: ['email_opened'],
        fallback_action: 'retry'
      },
      {
        id: 'step_2',
        channel: 'linkedin',
        delay: 3,
        content: {
          type: 'text',
          template: 'thought_leadership_post',
          personalization: {}
        },
        success_criteria: ['post_engagement'],
        fallback_action: 'skip'
      },
      {
        id: 'step_3',
        channel: 'whatsapp',
        delay: 7,
        content: {
          type: 'rich_media',
          template: 'case_study_share',
          personalization: {}
        },
        success_criteria: ['content_shared'],
        fallback_action: 'retry'
      }
    ],
    trigger: 'behavior_based',
    success_criteria: ['engagement_increase', 'content_consumption']
  }
]

export default function MultiChannelEngagementSystem() {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [activeSequences, setActiveSequences] = useState<any[]>([])
  const [sequenceBuilder, setSequenceBuilder] = useState<any>(null)
  const [engagementAnalytics, setEngagementAnalytics] = useState<any>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    loadEngagementData()
  }, [])

  const loadEngagementData = async () => {
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setEngagementAnalytics({
        total_contacts: 1247,
        active_sequences: 23,
        response_rate: 34.7,
        conversion_rate: 12.4,
        channel_performance: ENGAGEMENT_CHANNELS.map(channel => ({
          channel: channel.id,
          sent: Math.floor(Math.random() * 1000) + 100,
          delivered: Math.floor(Math.random() * 800) + 80,
          opened: Math.floor(Math.random() * 600) + 60,
          responded: Math.floor(Math.random() * 200) + 20
        }))
      })

      setActiveSequences([
        {
          id: '1',
          name: 'Executive Outreach - Q1',
          contacts: 45,
          status: 'running',
          success_rate: 23.4
        },
        {
          id: '2', 
          name: 'Product Demo Follow-up',
          contacts: 67,
          status: 'paused',
          success_rate: 18.7
        }
      ])
    } catch (error) {
      toast.error('Failed to load engagement data')
    }
  }

  const startSequence = useCallback(async (sequenceId: string, contactIds: string[]) => {
    setIsRunning(true)
    try {
      const response = await fetch('/api/crm/engagement/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sequenceId,
          contactIds,
          channels: selectedChannels
        })
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
  }, [selectedChannels])

  const pauseSequence = useCallback(async (sequenceId: string) => {
    try {
      const response = await fetch('/api/crm/engagement/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequenceId })
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Multi-Channel Engagement System
          </h1>
          <p className="text-lg text-gray-600">
            Orchestrate personalized outreach across every channel
          </p>
        </div>

        {/* Analytics Overview */}
        {engagementAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <UserGroupIcon className="w-8 h-8 text-blue-600" />
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
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <BoltIcon className="w-8 h-8 text-green-600" />
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
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <SignalIcon className="w-8 h-8 text-purple-600" />
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
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <ChartBarIcon className="w-8 h-8 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {engagementAnalytics.conversion_rate}%
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
              <p className="text-sm text-gray-600">Meetings & demos booked</p>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Channel Selection */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2 text-purple-600" />
                Available Channels
              </h3>
              <div className="space-y-3">
                {ENGAGEMENT_CHANNELS.map((channel) => (
                  <div
                    key={channel.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedChannels.includes(channel.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      if (selectedChannels.includes(channel.id)) {
                        setSelectedChannels(prev => prev.filter(id => id !== channel.id))
                      } else {
                        setSelectedChannels(prev => [...prev, channel.id])
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <channel.icon className="w-6 h-6 mr-3 text-gray-600" />
                        <span className="font-medium">{channel.name}</span>
                      </div>
                      {channel.premium && (
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full">
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
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all"
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Active Sequences</h3>
              <div className="space-y-3">
                {activeSequences.map((sequence) => (
                  <div key={sequence.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{sequence.name}</h4>
                      <p className="text-sm text-gray-600">{sequence.contacts} contacts</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        sequence.status === 'running' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <button
                        onClick={() => sequence.status === 'running' ? pauseSequence(sequence.id) : startSequence(sequence.id, [])}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {sequence.status === 'running' ? (
                          <PauseIcon className="w-4 h-4 text-gray-600" />
                        ) : (
                          <PlayIcon className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sequence Builder */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Sequence Templates</h3>
              <div className="grid grid-cols-1 gap-4">
                {SEQUENCE_TEMPLATES.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 hover:border-purple-500 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      </div>
                      <button
                        onClick={() => startSequence(template.id, [])}
                        disabled={isRunning}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        {isRunning ? 'Starting...' : 'Start'}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{template.channels.length} steps</span>
                      <span className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {Math.max(...template.channels.map(c => c.delay))} days
                      </span>
                    </div>
                    
                    {/* Channel Flow */}
                    <div className="mt-4 flex items-center gap-2">
                      {template.channels.map((step, index) => {
                        const channel = ENGAGEMENT_CHANNELS.find(c => c.id === step.channel)
                        return (
                          <React.Fragment key={step.id}>
                            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                              {channel && <channel.icon className="w-4 h-4 text-purple-600" />}
                            </div>
                            {index < template.channels.length - 1 && (
                              <ArrowPathIcon className="w-4 h-4 text-gray-400" />
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Channel Performance</h3>
              {engagementAnalytics && (
                <div className="space-y-4">
                  {engagementAnalytics.channel_performance.map((perf: any) => {
                    const channel = ENGAGEMENT_CHANNELS.find(c => c.id === perf.channel)
                    if (!channel) return null
                    
                    return (
                      <div key={perf.channel} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <channel.icon className="w-6 h-6 mr-3 text-gray-600" />
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BellIcon className="w-5 h-5 mr-2 text-green-600" />
                Real-time Activity
              </h3>
              <div className="space-y-3">
                {[
                  { action: 'Email opened', contact: 'John Smith @ Acme Corp', channel: 'email', time: '2 min ago', status: 'success' },
                  { action: 'LinkedIn message sent', contact: 'Sarah Chen @ TechStart', channel: 'linkedin', time: '5 min ago', status: 'pending' },
                  { action: 'Video watched', contact: 'Mike Johnson @ BigCorp', channel: 'video', time: '12 min ago', status: 'success' },
                  { action: 'Phone call completed', contact: 'Lisa Wong @ StartupCo', channel: 'phone', time: '1 hour ago', status: 'success' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
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