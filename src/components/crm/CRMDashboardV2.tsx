'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChartBarIcon,
  SparklesIcon,
  DocumentTextIcon,
  PhotoIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  EyeIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  FireIcon,
  LightBulbIcon,
  CursorArrowRaysIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  PresentationChartLineIcon,
  CubeIcon,
  HeartIcon,
  TrophyIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface DashboardMetrics {
  proposals: {
    total: number
    thisMonth: number
    conversionRate: number
    avgValue: number
  }
  outreach: {
    campaigns: number
    touchpoints: number
    responseRate: number
    activeSequences: number
  }
  content: {
    templates: number
    generated: number
    downloads: number
    engagement: number
  }
  ai: {
    automations: number
    insights: number
    personalizations: number
    accuracy: number
  }
}

interface RecentActivity {
  id: string
  type: 'proposal' | 'outreach' | 'content' | 'engagement'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'pending' | 'failed'
  data?: any
}

interface CreativeIdea {
  id: string
  title: string
  description: string
  category: string
  effectiveness: number
  difficulty: 'easy' | 'medium' | 'hard'
  timeToImplement: string
  icon: React.ComponentType<any>
}

const CREATIVE_IDEAS: CreativeIdea[] = [
  {
    id: '1',
    title: 'CEO Deepfake Video Messages',
    description: 'AI-generated personalized video messages from famous CEOs recommending your solution',
    category: 'Video',
    effectiveness: 95,
    difficulty: 'hard',
    timeToImplement: '2-3 days',
    icon: VideoCameraIcon
  },
  {
    id: '2',
    title: 'Executive Survival Kit',
    description: 'Physical box with personalized items addressing their specific business challenges',
    category: 'Physical',
    effectiveness: 92,
    difficulty: 'medium',
    timeToImplement: '1-2 weeks',
    icon: HeartIcon
  },
  {
    id: '3',
    title: 'Viral LinkedIn Campaign',
    description: 'Coordinated posts from industry leaders mentioning their company',
    category: 'Social',
    effectiveness: 88,
    difficulty: 'medium',
    timeToImplement: '3-5 days',
    icon: FireIcon
  },
  {
    id: '4',
    title: 'AR Business Card',
    description: 'Business card that shows AR visualization when scanned',
    category: 'Tech',
    effectiveness: 87,
    difficulty: 'hard',
    timeToImplement: '1-2 weeks',
    icon: CubeIcon
  },
  {
    id: '5',
    title: 'Personalized Podcast Episode',
    description: 'AI-generated podcast about their company\'s success story',
    category: 'Audio',
    effectiveness: 85,
    difficulty: 'medium',
    timeToImplement: '2-3 days',
    icon: ChatBubbleLeftRightIcon
  }
]

export default function CRMDashboardV2() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState<'overview' | 'proposals' | 'outreach' | 'content' | 'ai'>('overview')
  const [creativeMode, setCreativeMode] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls - in production these would be real endpoints
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMetrics({
        proposals: {
          total: 127,
          thisMonth: 23,
          conversionRate: 34.7,
          avgValue: 87500
        },
        outreach: {
          campaigns: 15,
          touchpoints: 342,
          responseRate: 23.8,
          activeSequences: 8
        },
        content: {
          templates: 67,
          generated: 234,
          downloads: 1456,
          engagement: 78.2
        },
        ai: {
          automations: 45,
          insights: 189,
          personalizations: 567,
          accuracy: 94.3
        }
      })

      setRecentActivity([
        {
          id: '1',
          type: 'proposal',
          title: 'Executive Impact Proposal - Acme Corp',
          description: 'AI-generated proposal for John Smith, CEO',
          timestamp: '2 hours ago',
          status: 'success'
        },
        {
          id: '2',
          type: 'outreach',
          title: 'LinkedIn Takeover Campaign',
          description: 'Coordinated posts for TechStart Inc.',
          timestamp: '4 hours ago',
          status: 'pending'
        },
        {
          id: '3',
          type: 'content',
          title: 'ROI Calculator Template',
          description: 'Interactive calculator downloaded 23 times',
          timestamp: '6 hours ago',
          status: 'success'
        },
        {
          id: '4',
          type: 'engagement',
          title: 'CEO Video Response',
          description: 'Sarah Johnson responded to deepfake video',
          timestamp: '1 day ago',
          status: 'success'
        }
      ])
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const launchCreativeIdea = async (idea: CreativeIdea) => {
    toast.success(`Launching ${idea.title}...`)
    // In production, this would trigger the actual implementation
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your creative CRM dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Creative CRM Hub
              </h1>
              <p className="text-lg text-gray-600">
                Where traditional CRM meets 100/100 creative outreach
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCreativeMode(!creativeMode)}
                className={`px-6 py-3 rounded-lg transition-all flex items-center ${
                  creativeMode 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                    : 'bg-white text-gray-700 border hover:border-purple-500'
                }`}
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                Creative Mode
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center">
                <PlusIcon className="w-5 h-5 mr-2" />
                New Campaign
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'proposals', name: 'Proposals', icon: DocumentTextIcon },
              { id: 'outreach', name: 'Outreach', icon: RocketLaunchIcon },
              { id: 'content', name: 'Content', icon: PhotoIcon },
              { id: 'ai', name: 'AI Insights', icon: SparklesIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md transition-all ${
                  selectedView === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Creative Ideas Banner */}
        <AnimatePresence>
          {creativeMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-4">🚀 Creative Outreach Ideas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {CREATIVE_IDEAS.map((idea) => (
                    <motion.div
                      key={idea.id}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white bg-opacity-20 rounded-lg p-4 cursor-pointer"
                      onClick={() => launchCreativeIdea(idea)}
                    >
                      <idea.icon className="w-8 h-8 mb-2" />
                      <h3 className="font-semibold text-sm mb-1">{idea.title}</h3>
                      <p className="text-xs opacity-90 mb-2">{idea.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="bg-white bg-opacity-30 px-2 py-1 rounded-full">
                          {idea.effectiveness}% effective
                        </span>
                        <span>{idea.timeToImplement}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Metrics Grid */}
        {selectedView === 'overview' && metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  +{metrics.proposals.conversionRate}%
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Proposals</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">{metrics.proposals.total}</p>
              <p className="text-sm text-gray-600">
                {metrics.proposals.thisMonth} this month • ${(metrics.proposals.avgValue / 1000).toFixed(0)}k avg
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <RocketLaunchIcon className="w-8 h-8 text-purple-600" />
                <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {metrics.outreach.responseRate}%
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Outreach</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">{metrics.outreach.campaigns}</p>
              <p className="text-sm text-gray-600">
                {metrics.outreach.touchpoints} touchpoints • {metrics.outreach.activeSequences} active
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <PhotoIcon className="w-8 h-8 text-green-600" />
                <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {metrics.content.engagement}%
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Content</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">{metrics.content.templates}</p>
              <p className="text-sm text-gray-600">
                {metrics.content.generated} generated • {metrics.content.downloads} downloads
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <SparklesIcon className="w-8 h-8 text-orange-600" />
                <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {metrics.ai.accuracy}%
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">AI Power</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">{metrics.ai.automations}</p>
              <p className="text-sm text-gray-600">
                {metrics.ai.insights} insights • {metrics.ai.personalizations} personalizations
              </p>
            </motion.div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="flex flex-col items-center p-4 rounded-lg border hover:border-purple-500 hover:bg-purple-50 transition-all">
                  <DocumentTextIcon className="w-8 h-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium">New Proposal</span>
                </button>
                <button className="flex flex-col items-center p-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-all">
                  <PhotoIcon className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium">Create Infographic</span>
                </button>
                <button className="flex flex-col items-center p-4 rounded-lg border hover:border-green-500 hover:bg-green-50 transition-all">
                  <RocketLaunchIcon className="w-8 h-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium">Launch Sequence</span>
                </button>
                <button className="flex flex-col items-center p-4 rounded-lg border hover:border-orange-500 hover:bg-orange-50 transition-all">
                  <SparklesIcon className="w-8 h-8 text-orange-600 mb-2" />
                  <span className="text-sm font-medium">AI Generate</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{activity.title}</h3>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - AI Insights */}
          <div className="space-y-6">
            {/* AI Recommendations */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
              <div className="flex items-center mb-4">
                <LightBulbIcon className="w-6 h-6 text-purple-600 mr-2" />
                <h2 className="text-lg font-semibold text-purple-900">AI Recommendations</h2>
              </div>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">Try CEO Deepfake Videos</p>
                  <p className="text-xs text-gray-600">95% effectiveness for C-level targets</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">LinkedIn Takeover Campaign</p>
                  <p className="text-xs text-gray-600">Perfect for TechStart Inc. prospect</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">Personalized Survival Kit</p>
                  <p className="text-xs text-gray-600">High impact for enterprise deals</p>
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Performance Insights</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Video Messages</span>
                    <span className="text-sm font-medium">89% Open Rate</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '89%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Physical Packages</span>
                    <span className="text-sm font-medium">67% Response</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Social Campaigns</span>
                    <span className="text-sm font-medium">43% Engagement</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '43%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Trending Methods */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">🔥 Trending Methods</h2>
              <div className="space-y-3">
                {[
                  { name: 'AR Business Cards', trend: '+125%' },
                  { name: 'Podcast Episodes', trend: '+89%' },
                  { name: 'Virtual Tours', trend: '+67%' },
                  { name: 'Gamified ROI', trend: '+45%' }
                ].map((method, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{method.name}</span>
                    <span className="text-sm font-medium text-green-600">{method.trend}</span>
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