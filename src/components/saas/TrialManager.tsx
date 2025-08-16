/**
 * CoreFlow360 - Trial Manager for SaaS
 * Trial conversion tracking and optimization
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BeakerIcon,
  ClockIcon,
  UserPlusIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftIcon,
  EnvelopeIcon,
  GiftIcon,
  StarIcon,
  CalendarIcon,
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  BoltIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import { MetricCard } from '@/components/ui/MetricCard'

interface Trial {
  id: string
  userId: string
  userEmail: string
  userName: string
  companyName?: string
  planName: string
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'CONVERTED' | 'EXPIRED' | 'CANCELLED'
  daysRemaining: number
  conversionProbability: number
  engagementScore: number
  featureUsage: Record<string, number>
  onboardingProgress: number
  completedTasks: string[]
  pendingTasks: string[]
  touchpoints: Array<{
    type: 'EMAIL' | 'CALL' | 'MEETING' | 'DEMO'
    date: string
    description: string
    outcome?: string
  }>
  conversionSignals: Array<{
    signal: string
    strength: 'WEAK' | 'MODERATE' | 'STRONG'
    date: string
  }>
  riskFactors: Array<{
    factor: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH'
    description: string
  }>
}

interface TrialMetrics {
  totalTrials: number
  activeTrials: number
  conversionRate: number
  averageTimeToConversion: number
  trialToCustomerValue: number
  expiringToday: number
  expiringThisWeek: number
  highIntentTrials: number
}

interface TrialManagerProps {
  onTrialSelect?: (trial: Trial) => void
  onSendEmail?: (trial: Trial) => void
  onScheduleCall?: (trial: Trial) => void
  onOfferIncentive?: (trial: Trial) => void
  onExtendTrial?: (trial: Trial) => void
}

const statusColors = {
  ACTIVE: 'text-blue-700 bg-blue-100',
  CONVERTED: 'text-green-700 bg-green-100',
  EXPIRED: 'text-red-700 bg-red-100',
  CANCELLED: 'text-gray-700 bg-gray-100'
}

const getConversionColor = (probability: number) => {
  if (probability >= 70) return 'text-green-600'
  if (probability >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

const getEngagementColor = (score: number) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export default function TrialManager({
  onTrialSelect,
  onSendEmail,
  onScheduleCall,
  onOfferIncentive,
  onExtendTrial
}: TrialManagerProps) {
  const [trials, setTrials] = useState<Trial[]>([])
  const [metrics, setMetrics] = useState<TrialMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState<'all' | 'active' | 'expiring' | 'high-intent'>('all')
  const [sortBy, setSortBy] = useState<string>('daysRemaining')

  useEffect(() => {
    loadTrialData()
  }, [selectedView, sortBy])

  const loadTrialData = async () => {
    try {
      setLoading(true)
      
      // Mock data for demonstration
      const mockTrials: Trial[] = [
        {
          id: 'trial-1',
          userId: 'user-1',
          userEmail: 'sarah@techstartup.io',
          userName: 'Sarah Johnson',
          companyName: 'Tech Startup Inc',
          planName: 'Professional',
          startDate: '2024-07-25',
          endDate: '2024-08-09',
          status: 'ACTIVE',
          daysRemaining: 0,
          conversionProbability: 85,
          engagementScore: 92,
          featureUsage: {
            dashboard: 0.95,
            reports: 0.88,
            integrations: 0.78,
            automation: 0.65,
            api: 0.45
          },
          onboardingProgress: 0.9,
          completedTasks: ['profile_setup', 'data_import', 'first_report', 'team_invite'],
          pendingTasks: ['automation_setup'],
          touchpoints: [
            {
              type: 'EMAIL',
              date: '2024-08-01',
              description: 'Welcome email sent',
              outcome: 'Opened and clicked'
            },
            {
              type: 'CALL',
              date: '2024-08-03',
              description: 'Onboarding call scheduled',
              outcome: 'Completed - very positive'
            },
            {
              type: 'DEMO',
              date: '2024-08-05',
              description: 'Advanced features demo',
              outcome: 'High interest in automation features'
            }
          ],
          conversionSignals: [
            {
              signal: 'Added team members',
              strength: 'STRONG',
              date: '2024-08-02'
            },
            {
              signal: 'Created 10+ reports',
              strength: 'STRONG',
              date: '2024-08-04'
            },
            {
              signal: 'Asked about enterprise features',
              strength: 'MODERATE',
              date: '2024-08-06'
            }
          ],
          riskFactors: []
        },
        {
          id: 'trial-2',
          userId: 'user-2',
          userEmail: 'mark@smallbiz.com',
          userName: 'Mark Wilson',
          companyName: 'Small Business Co',
          planName: 'Starter',
          startDate: '2024-08-01',
          endDate: '2024-08-15',
          status: 'ACTIVE',
          daysRemaining: 6,
          conversionProbability: 35,
          engagementScore: 45,
          featureUsage: {
            dashboard: 0.3,
            reports: 0.1,
            integrations: 0.0,
            automation: 0.0
          },
          onboardingProgress: 0.4,
          completedTasks: ['profile_setup'],
          pendingTasks: ['data_import', 'first_report', 'team_invite', 'automation_setup'],
          touchpoints: [
            {
              type: 'EMAIL',
              date: '2024-08-01',
              description: 'Welcome email sent',
              outcome: 'Not opened'
            },
            {
              type: 'EMAIL',
              date: '2024-08-04',
              description: 'Getting started reminder',
              outcome: 'Opened but no action'
            }
          ],
          conversionSignals: [],
          riskFactors: [
            {
              factor: 'Low engagement',
              severity: 'HIGH',
              description: 'User has not logged in for 3 days'
            },
            {
              factor: 'Incomplete onboarding',
              severity: 'MEDIUM',
              description: 'Only 40% of onboarding tasks completed'
            }
          ]
        },
        {
          id: 'trial-3',
          userId: 'user-3',
          userEmail: 'lisa@retailstore.com',
          userName: 'Lisa Chen',
          companyName: 'Retail Store Co',
          planName: 'Professional',
          startDate: '2024-07-20',
          endDate: '2024-08-05',
          status: 'EXPIRED',
          daysRemaining: -4,
          conversionProbability: 15,
          engagementScore: 25,
          featureUsage: {
            dashboard: 0.2,
            reports: 0.05,
            integrations: 0.0
          },
          onboardingProgress: 0.2,
          completedTasks: ['profile_setup'],
          pendingTasks: ['data_import', 'first_report', 'team_invite', 'automation_setup'],
          touchpoints: [
            {
              type: 'EMAIL',
              date: '2024-07-20',
              description: 'Welcome email sent',
              outcome: 'Not opened'
            },
            {
              type: 'EMAIL',
              date: '2024-07-25',
              description: 'Check-in email',
              outcome: 'Not opened'
            },
            {
              type: 'EMAIL',
              date: '2024-08-02',
              description: 'Trial expiring reminder',
              outcome: 'Opened but no response'
            }
          ],
          conversionSignals: [],
          riskFactors: [
            {
              factor: 'Never logged in after signup',
              severity: 'HIGH',
              description: 'User created account but never used the product'
            }
          ]
        }
      ]

      const mockMetrics: TrialMetrics = {
        totalTrials: mockTrials.length,
        activeTrials: mockTrials.filter(t => t.status === 'ACTIVE').length,
        conversionRate: 28.5,
        averageTimeToConversion: 8.5,
        trialToCustomerValue: 1850,
        expiringToday: mockTrials.filter(t => t.daysRemaining === 0 && t.status === 'ACTIVE').length,
        expiringThisWeek: mockTrials.filter(t => t.daysRemaining <= 7 && t.daysRemaining > 0 && t.status === 'ACTIVE').length,
        highIntentTrials: mockTrials.filter(t => t.conversionProbability > 70 && t.status === 'ACTIVE').length
      }

      setTrials(mockTrials)
      setMetrics(mockMetrics)
    } catch (error) {
      console.error('Failed to load trial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTrials = trials.filter(trial => {
    switch (selectedView) {
      case 'active':
        return trial.status === 'ACTIVE'
      case 'expiring':
        return trial.status === 'ACTIVE' && trial.daysRemaining <= 7
      case 'high-intent':
        return trial.status === 'ACTIVE' && trial.conversionProbability > 70
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trial Management</h1>
          <p className="text-gray-600 mt-1">Track trial conversions and optimize onboarding</p>
        </div>
      </div>

      {/* Critical Alerts */}
      {trials.filter(t => t.status === 'ACTIVE' && (t.daysRemaining <= 1 || t.riskFactors.some(r => r.severity === 'HIGH'))).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">Urgent Action Required</h3>
              <p className="mt-1 text-sm text-red-700">
                {trials.filter(t => t.daysRemaining === 0 && t.status === 'ACTIVE').length} trial(s) expire today, 
                {' '}{trials.filter(t => t.riskFactors.some(r => r.severity === 'HIGH')).length} high-risk trial(s) need intervention
              </p>
              <div className="mt-3 flex space-x-2">
                <button className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50">
                  <PhoneIcon className="h-3 w-3 mr-1" />
                  Schedule Calls
                </button>
                <button className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50">
                  <GiftIcon className="h-3 w-3 mr-1" />
                  Send Incentives
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            value={`${metrics.conversionRate}%`}
            label="Trial Conversion Rate"
            icon={TrendingUpIcon}
            gradient="emerald"
            trend={3.2}
          />
          <MetricCard
            value={metrics.activeTrials.toString()}
            label="Active Trials"
            icon={BeakerIcon}
            gradient="blue"
            trend={12.5}
          />
          <MetricCard
            value={`${metrics.averageTimeToConversion}d`}
            label="Avg Time to Convert"
            icon={ClockIcon}
            gradient="violet"
            trend={-1.8}
          />
          <MetricCard
            value={`$${metrics.trialToCustomerValue}`}
            label="Trial-to-Customer Value"
            icon={StarIcon}
            gradient="orange"
            trend={8.7}
          />
        </div>
      )}

      {/* View Controls */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'All Trials' },
              { key: 'active', label: 'Active' },
              { key: 'expiring', label: 'Expiring Soon' },
              { key: 'high-intent', label: 'High Intent' }
            ].map((view) => (
              <button
                key={view.key}
                onClick={() => setSelectedView(view.key as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedView === view.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="daysRemaining">Days Remaining</option>
            <option value="conversionProbability">Conversion Probability</option>
            <option value="engagementScore">Engagement Score</option>
            <option value="startDate">Start Date</option>
          </select>
        </div>
      </div>

      {/* Trials List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredTrials.map((trial, index) => (
            <motion.li
              key={trial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onTrialSelect?.(trial)}
            >
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        trial.status === 'ACTIVE' ? 'bg-blue-100 text-blue-600' :
                        trial.status === 'CONVERTED' ? 'bg-green-100 text-green-600' :
                        trial.status === 'EXPIRED' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <BeakerIcon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {trial.companyName || trial.userName}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[trial.status]}`}>
                          {trial.status}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-purple-800 bg-purple-100">
                          {trial.planName}
                        </span>
                        {trial.daysRemaining <= 1 && trial.status === 'ACTIVE' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-red-800 bg-red-100">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            Expires {trial.daysRemaining === 0 ? 'Today' : 'Tomorrow'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-gray-500">
                          {trial.userEmail} • {trial.daysRemaining > 0 ? `${trial.daysRemaining} days left` : 
                           trial.daysRemaining === 0 ? 'Expires today' : `Expired ${Math.abs(trial.daysRemaining)} days ago`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-6 mt-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Conversion:</span>
                          <span className={`text-xs font-medium ${getConversionColor(trial.conversionProbability)}`}>
                            {trial.conversionProbability}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Engagement:</span>
                          <span className={`text-xs font-medium ${getEngagementColor(trial.engagementScore)}`}>
                            {trial.engagementScore}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Onboarding:</span>
                          <span className="text-xs font-medium text-blue-600">
                            {Math.round(trial.onboardingProgress * 100)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Touchpoints:</span>
                          <span className="text-xs font-medium text-gray-700">
                            {trial.touchpoints.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        Started: {new Date(trial.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {trial.conversionSignals.length} positive signal(s)
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {trial.status === 'ACTIVE' && trial.daysRemaining <= 3 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onOfferIncentive?.(trial)
                            }}
                            className="p-2 text-orange-400 hover:text-orange-600 hover:bg-orange-50 rounded-md"
                            title="Offer Incentive"
                          >
                            <GiftIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onExtendTrial?.(trial)
                            }}
                            className="p-2 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded-md"
                            title="Extend Trial"
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onScheduleCall?.(trial)
                        }}
                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Schedule Call"
                      >
                        <PhoneIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSendEmail?.(trial)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md"
                        title="Send Email"
                      >
                        <EnvelopeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Conversion Signals (for high-intent trials) */}
                {trial.conversionSignals.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Positive Signals:</p>
                    <div className="flex flex-wrap gap-2">
                      {trial.conversionSignals.slice(0, 3).map((signal, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            signal.strength === 'STRONG' ? 'text-green-700 bg-green-50' :
                            signal.strength === 'MODERATE' ? 'text-yellow-700 bg-yellow-50' :
                            'text-blue-700 bg-blue-50'
                          }`}
                        >
                          {signal.signal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Factors (for at-risk trials) */}
                {trial.riskFactors.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Risk Factors:</p>
                    <div className="flex flex-wrap gap-2">
                      {trial.riskFactors.map((risk, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            risk.severity === 'HIGH' ? 'text-red-700 bg-red-50' :
                            risk.severity === 'MEDIUM' ? 'text-yellow-700 bg-yellow-50' :
                            'text-gray-700 bg-gray-50'
                          }`}
                        >
                          {risk.factor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Empty State */}
      {filteredTrials.length === 0 && (
        <div className="text-center py-12">
          <BeakerIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No trials found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No trials match the selected criteria
          </p>
        </div>
      )}
    </div>
  )
}