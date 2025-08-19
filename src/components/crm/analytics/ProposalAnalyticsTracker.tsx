'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  EyeIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  SparklesIcon,
  BellIcon,
  ShareIcon,
  DownloadIcon,
  MapIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  TabletIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  FireIcon,
  LightBulbIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface ProposalAnalytics {
  id: string
  proposalId: string
  title: string
  recipientName: string
  recipientCompany: string
  sentAt: string
  lastViewedAt?: string
  status: 'sent' | 'viewed' | 'engaged' | 'accepted' | 'declined'
  totalViews: number
  uniqueViews: number
  timeSpent: number
  averageTimePerView: number
  viewingSessions: ViewingSession[]
  engagement: EngagementMetrics
  sharing: SharingMetrics
  conversion: ConversionMetrics
  devices: DeviceMetrics
  geography: GeographyMetrics
}

interface ViewingSession {
  id: string
  startTime: string
  endTime: string
  duration: number
  device: string
  location: string
  pages: PageView[]
  engagement_score: number
}

interface PageView {
  page: number
  timeSpent: number
  scrollDepth: number
  interactions: number
}

interface EngagementMetrics {
  totalInteractions: number
  clickThroughRate: number
  avgScrollDepth: number
  hottestSections: HotSection[]
  engagementScore: number
  attentionSpan: number
}

interface HotSection {
  section: string
  page: number
  viewTime: number
  interactions: number
  heatmapData: number[][]
}

interface SharingMetrics {
  totalShares: number
  shareChannels: Record<string, number>
  sharedWith: string[]
  virality: number
}

interface ConversionMetrics {
  conversionEvents: ConversionEvent[]
  conversionRate: number
  timeToConversion: number
  dropoffPoints: string[]
}

interface ConversionEvent {
  type: 'meeting_booked' | 'demo_requested' | 'proposal_accepted' | 'contract_signed'
  timestamp: string
  value?: number
  metadata?: Record<string, unknown>
}

interface DeviceMetrics {
  desktop: number
  mobile: number
  tablet: number
  browsers: Record<string, number>
  operatingSystems: Record<string, number>
}

interface GeographyMetrics {
  countries: Record<string, number>
  cities: Record<string, number>
  timeZones: Record<string, number>
}

const MOCK_ANALYTICS: ProposalAnalytics[] = [
  {
    id: 'ana_1',
    proposalId: 'prop_1',
    title: 'Executive Impact Proposal - Acme Corp',
    recipientName: 'John Smith',
    recipientCompany: 'Acme Corporation',
    sentAt: '2024-01-15T09:00:00Z',
    lastViewedAt: '2024-01-16T14:30:00Z',
    status: 'engaged',
    totalViews: 12,
    uniqueViews: 8,
    timeSpent: 2340, // seconds
    averageTimePerView: 195,
    viewingSessions: [],
    engagement: {
      totalInteractions: 47,
      clickThroughRate: 23.4,
      avgScrollDepth: 87.3,
      hottestSections: [
        { section: 'ROI Calculator', page: 3, viewTime: 340, interactions: 12, heatmapData: [] },
        { section: 'Case Studies', page: 5, viewTime: 280, interactions: 8, heatmapData: [] },
      ],
      engagementScore: 94.5,
      attentionSpan: 195,
    },
    sharing: {
      totalShares: 3,
      shareChannels: { email: 2, linkedin: 1 },
      sharedWith: ['sarah.chen@acme.com', 'mike.johnson@acme.com'],
      virality: 1.2,
    },
    conversion: {
      conversionEvents: [
        {
          type: 'demo_requested',
          timestamp: '2024-01-16T15:45:00Z',
          metadata: { urgency: 'high' },
        },
      ],
      conversionRate: 12.5,
      timeToConversion: 1980, // seconds from first view
      dropoffPoints: ['Pricing Section', 'Technical Specs'],
    },
    devices: {
      desktop: 75,
      mobile: 20,
      tablet: 5,
      browsers: { chrome: 60, safari: 25, firefox: 15 },
      operatingSystems: { windows: 45, macos: 35, ios: 20 },
    },
    geography: {
      countries: { 'United States': 80, Canada: 20 },
      cities: { 'New York': 60, Toronto: 20, Boston: 20 },
      timeZones: { 'America/New_York': 80, 'America/Toronto': 20 },
    },
  },
]

export default function ProposalAnalyticsTracker() {
  const [analytics, setAnalytics] = useState<ProposalAnalytics[]>([])
  const [selectedProposal, setSelectedProposal] = useState<ProposalAnalytics | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [loading, setLoading] = useState(true)
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)

  useEffect(() => {
    loadAnalyticsData()

    if (realTimeEnabled) {
      const interval = setInterval(loadAnalyticsData, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [timeRange, realTimeEnabled])

  const loadAnalyticsData = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setAnalytics(MOCK_ANALYTICS)
    } catch (error) {
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <ClockIcon className="h-5 w-5 text-gray-500" />
      case 'viewed':
        return <EyeIcon className="h-5 w-5 text-blue-500" />
      case 'engaged':
        return <FireIcon className="h-5 w-5 text-orange-500" />
      case 'accepted':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'declined':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const generateInsights = useCallback((proposal: ProposalAnalytics) => {
    const insights = []

    if (proposal.engagement.engagementScore > 80) {
      insights.push({
        type: 'positive',
        icon: TrophyIcon,
        message: `Exceptional engagement! ${proposal.recipientName} is highly interested.`,
        action: 'Consider scheduling a follow-up call immediately.',
      })
    }

    if (proposal.sharing.totalShares > 0) {
      insights.push({
        type: 'info',
        icon: ShareIcon,
        message: `Proposal shared with ${proposal.sharing.sharedWith.length} colleagues.`,
        action: 'This indicates buying committee involvement - prepare for group presentation.',
      })
    }

    if (proposal.engagement.avgScrollDepth < 50) {
      insights.push({
        type: 'warning',
        icon: ExclamationTriangleIcon,
        message: "Low scroll depth suggests content isn't resonating.",
        action: 'Consider personalizing the opening section more.',
      })
    }

    if (proposal.conversion.dropoffPoints.length > 0) {
      insights.push({
        type: 'warning',
        icon: LightBulbIcon,
        message: `Viewers dropping off at: ${proposal.conversion.dropoffPoints.join(', ')}`,
        action: 'Revise these sections to reduce friction.',
      })
    }

    return insights
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600" />
          <p className="text-gray-600">Loading proposal analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-gray-900">
                Proposal Analytics & Tracking
              </h1>
              <p className="text-lg text-gray-600">
                Real-time insights into proposal performance and engagement
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as unknown)}
                className="rounded-lg border px-4 py-2 focus:ring-2 focus:ring-purple-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
              <button
                onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                className={`flex items-center rounded-lg px-4 py-2 transition-all ${
                  realTimeEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <BellIcon className="mr-2 h-4 w-4" />
                Real-time {realTimeEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{analytics.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total Proposals</h3>
            <p className="text-sm text-gray-600">Tracked this period</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <EyeIcon className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {analytics.reduce((sum, a) => sum + a.totalViews, 0)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total Views</h3>
            <p className="text-sm text-gray-600">Across all proposals</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <FireIcon className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">
                {(
                  analytics.reduce((sum, a) => sum + a.engagement.engagementScore, 0) /
                  analytics.length
                ).toFixed(1)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Avg Engagement</h3>
            <p className="text-sm text-gray-600">Engagement score</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <TrophyIcon className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                {analytics.filter((a) => a.conversion.conversionEvents.length > 0).length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Conversions</h3>
            <p className="text-sm text-gray-600">Proposals converted</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Proposals List */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-xl font-semibold">Proposal Performance</h3>
              <div className="space-y-4">
                {analytics.map((proposal) => (
                  <motion.div
                    key={proposal.id}
                    whileHover={{ scale: 1.01 }}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      selectedProposal?.id === proposal.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedProposal(proposal)}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{proposal.title}</h4>
                        <p className="mt-1 text-sm text-gray-600">
                          {proposal.recipientName} • {proposal.recipientCompany}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(proposal.status)}
                        <span className="text-sm font-medium capitalize">{proposal.status}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Views</span>
                        <p className="font-medium">{proposal.totalViews}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Time Spent</span>
                        <p className="font-medium">{Math.floor(proposal.timeSpent / 60)}m</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Engagement</span>
                        <p
                          className={`font-medium ${getEngagementColor(proposal.engagement.engagementScore)}`}
                        >
                          {proposal.engagement.engagementScore}%
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Shared</span>
                        <p className="font-medium">{proposal.sharing.totalShares}x</p>
                      </div>
                    </div>

                    {/* Engagement Bar */}
                    <div className="mt-3">
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
                          style={{ width: `${proposal.engagement.engagementScore}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="space-y-6">
            {selectedProposal ? (
              <>
                {/* AI Insights */}
                <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6">
                  <div className="mb-4 flex items-center">
                    <SparklesIcon className="mr-2 h-6 w-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-purple-900">AI Insights</h3>
                  </div>
                  <div className="space-y-3">
                    {generateInsights(selectedProposal).map((insight, index) => (
                      <div key={index} className="rounded-lg bg-white p-3">
                        <div className="flex items-start">
                          <insight.icon
                            className={`mt-0.5 mr-2 h-5 w-5 ${
                              insight.type === 'positive'
                                ? 'text-green-600'
                                : insight.type === 'warning'
                                  ? 'text-yellow-600'
                                  : 'text-blue-600'
                            }`}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{insight.message}</p>
                            <p className="mt-1 text-xs text-gray-600">{insight.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device Analytics */}
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <h3 className="mb-4 text-lg font-semibold">Device Analytics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ComputerDesktopIcon className="mr-2 h-5 w-5 text-gray-600" />
                        <span className="text-sm">Desktop</span>
                      </div>
                      <span className="text-sm font-medium">
                        {selectedProposal.devices.desktop}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DevicePhoneMobileIcon className="mr-2 h-5 w-5 text-gray-600" />
                        <span className="text-sm">Mobile</span>
                      </div>
                      <span className="text-sm font-medium">
                        {selectedProposal.devices.mobile}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TabletIcon className="mr-2 h-5 w-5 text-gray-600" />
                        <span className="text-sm">Tablet</span>
                      </div>
                      <span className="text-sm font-medium">
                        {selectedProposal.devices.tablet}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Geography */}
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <h3 className="mb-4 flex items-center text-lg font-semibold">
                    <MapIcon className="mr-2 h-5 w-5 text-blue-600" />
                    Geography
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(selectedProposal.geography.cities).map(([city, percentage]) => (
                      <div key={city} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{city}</span>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sharing Analytics */}
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <h3 className="mb-4 flex items-center text-lg font-semibold">
                    <ShareIcon className="mr-2 h-5 w-5 text-green-600" />
                    Sharing Activity
                  </h3>
                  {selectedProposal.sharing.totalShares > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Shared {selectedProposal.sharing.totalShares} times with:
                      </p>
                      {selectedProposal.sharing.sharedWith.map((email, index) => (
                        <div key={index} className="rounded bg-gray-50 px-3 py-2 text-sm">
                          {email}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No sharing activity yet</p>
                  )}
                </div>

                {/* Hot Sections */}
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <h3 className="mb-4 flex items-center text-lg font-semibold">
                    <FireIcon className="mr-2 h-5 w-5 text-red-600" />
                    Hot Sections
                  </h3>
                  <div className="space-y-3">
                    {selectedProposal.engagement.hottestSections.map((section, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-red-50 p-3"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{section.section}</p>
                          <p className="text-sm text-gray-600">Page {section.page}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {Math.floor(section.viewTime / 60)}m
                          </p>
                          <p className="text-xs text-gray-500">
                            {section.interactions} interactions
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="py-8 text-center">
                  <ChartBarIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                  <p className="text-gray-500">Select a proposal to view detailed analytics</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
