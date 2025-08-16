/**
 * CoreFlow360 - Decision Maker Intelligence Dashboard
 * Executive tracking, org charts, and buying signals visualization ($49/month feature)
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserGroupIcon,
  BuildingOffice2Icon,
  TrendingUpIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  BellIcon,
  ChartBarIcon,
  LinkIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  BriefcaseIcon,
  MapPinIcon,
  GlobeAltIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  FireIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import { AccessibleButton, AccessibleInput, AccessibleSelect } from '@/components/accessibility/AccessibleComponents'

interface ExecutiveProfile {
  id: string
  firstName: string
  lastName: string
  currentTitle: string
  currentCompany: string
  profileUrl: string
  profilePictureUrl?: string
  influenceScore: number
  connectionLevel: number
  reportingLevel: number
  lastJobChangeDate?: string
  signalStrength: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  buyingSignals: BuyingSignal[]
  personalityProfile?: {
    workStyle: string
    traits: Record<string, number>
  }
  communicationStyle?: {
    preferredChannel: string
    responseTime: string
    formality: string
  }
}

interface BuyingSignal {
  id: string
  signalType: string
  signal: string
  description: string
  strength: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  source: string
  detectedDate: string
  relevanceScore: number
  opportunitySize?: {
    min: number
    max: number
    currency: string
  }
}

interface JobChange {
  id: string
  executiveId: string
  changeType: string
  previousTitle: string
  previousCompany: string
  newTitle: string
  newCompany: string
  changeDate: string
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  opportunityScore: number
  outreachSent: boolean
}

interface CompanyOrgChart {
  id: string
  companyName: string
  totalEmployees: number
  keyDecisionMakers: ExecutiveProfile[]
  recentChanges: Array<{
    type: string
    description: string
    date: string
    impact: string
  }>
  stabilityScore: number
  changeFrequency: string
}

export default function DecisionMakerIntelligence() {
  const [activeTab, setActiveTab] = useState<'executives' | 'org-charts' | 'job-changes' | 'buying-signals' | 'insights'>('executives')
  const [executives, setExecutives] = useState<ExecutiveProfile[]>([])
  const [orgCharts, setOrgCharts] = useState<CompanyOrgChart[]>([])
  const [jobChanges, setJobChanges] = useState<JobChange[]>([])
  const [buyingSignals, setBuyingSignals] = useState<BuyingSignal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExecutive, setSelectedExecutive] = useState<ExecutiveProfile | null>(null)
  const [showEngagementStrategy, setShowEngagementStrategy] = useState(false)

  useEffect(() => {
    loadIntelligenceData()
  }, [])

  const loadIntelligenceData = async () => {
    try {
      setLoading(true)
      
      // Mock data - in real app, fetch from APIs
      const mockExecutives: ExecutiveProfile[] = [
        {
          id: '1',
          firstName: 'Sarah',
          lastName: 'Chen',
          currentTitle: 'VP of Operations',
          currentCompany: 'TechFlow Solutions',
          profileUrl: 'https://linkedin.com/in/sarah-chen',
          profilePictureUrl: '/api/placeholder/sarah-chen.jpg',
          influenceScore: 85,
          connectionLevel: 2,
          reportingLevel: 2,
          lastJobChangeDate: '2024-06-15',
          signalStrength: 'HIGH',
          buyingSignals: [
            {
              id: 'signal-1',
              signalType: 'HIRING',
              signal: 'Posted job opening for Operations Analyst',
              description: 'Company is scaling operations team, indicating growth and potential need for automation tools',
              strength: 'HIGH',
              urgency: 'MEDIUM',
              source: 'LINKEDIN_POST',
              detectedDate: '2024-08-07',
              relevanceScore: 0.89,
              opportunitySize: { min: 25000, max: 75000, currency: 'USD' }
            },
            {
              id: 'signal-2',
              signalType: 'PROBLEM_POST',
              signal: 'Shared article about manual process inefficiencies',
              description: 'Expressed frustration with manual workflows and time-consuming processes',
              strength: 'MEDIUM',
              urgency: 'HIGH',
              source: 'LINKEDIN_ARTICLE',
              detectedDate: '2024-08-05',
              relevanceScore: 0.76,
              opportunitySize: { min: 15000, max: 45000, currency: 'USD' }
            }
          ],
          personalityProfile: {
            workStyle: 'ANALYTICAL',
            traits: {
              openness: 0.7,
              conscientiousness: 0.9,
              extraversion: 0.6,
              agreeableness: 0.8,
              emotionalStability: 0.8
            }
          },
          communicationStyle: {
            preferredChannel: 'EMAIL',
            responseTime: 'SAME_DAY',
            formality: 'PROFESSIONAL'
          }
        },
        {
          id: '2',
          firstName: 'Marcus',
          lastName: 'Rodriguez',
          currentTitle: 'Chief Technology Officer',
          currentCompany: 'InnovateNow Corp',
          profileUrl: 'https://linkedin.com/in/marcus-rodriguez',
          profilePictureUrl: '/api/placeholder/marcus-rodriguez.jpg',
          influenceScore: 92,
          connectionLevel: 3,
          reportingLevel: 1,
          signalStrength: 'CRITICAL',
          buyingSignals: [
            {
              id: 'signal-3',
              signalType: 'TECHNOLOGY_DISCUSSION',
              signal: 'Posted about AI automation challenges',
              description: 'Discussing the need for better AI-powered workflow automation in enterprise environments',
              strength: 'CRITICAL',
              urgency: 'URGENT',
              source: 'LINKEDIN_POST',
              detectedDate: '2024-08-08',
              relevanceScore: 0.95,
              opportunitySize: { min: 100000, max: 300000, currency: 'USD' }
            }
          ],
          personalityProfile: {
            workStyle: 'DRIVER',
            traits: {
              openness: 0.9,
              conscientiousness: 0.8,
              extraversion: 0.7,
              agreeableness: 0.6,
              emotionalStability: 0.9
            }
          },
          communicationStyle: {
            preferredChannel: 'LINKEDIN',
            responseTime: 'IMMEDIATE',
            formality: 'CASUAL'
          }
        }
      ]

      const mockJobChanges: JobChange[] = [
        {
          id: 'jc-1',
          executiveId: '1',
          changeType: 'PROMOTION',
          previousTitle: 'Director of Operations',
          previousCompany: 'TechFlow Solutions',
          newTitle: 'VP of Operations',
          newCompany: 'TechFlow Solutions',
          changeDate: '2024-06-15',
          impactLevel: 'HIGH',
          opportunityScore: 0.87,
          outreachSent: false
        }
      ]

      const mockOrgCharts: CompanyOrgChart[] = [
        {
          id: 'org-1',
          companyName: 'TechFlow Solutions',
          totalEmployees: 250,
          keyDecisionMakers: [mockExecutives[0]],
          recentChanges: [
            {
              type: 'PROMOTION',
              description: 'Sarah Chen promoted to VP of Operations',
              date: '2024-06-15',
              impact: 'HIGH'
            }
          ],
          stabilityScore: 0.75,
          changeFrequency: 'MEDIUM'
        }
      ]

      const mockBuyingSignals = mockExecutives.flatMap(exec => exec.buyingSignals)

      setExecutives(mockExecutives)
      setJobChanges(mockJobChanges)
      setOrgCharts(mockOrgCharts)
      setBuyingSignals(mockBuyingSignals)
    } catch (error) {
      console.error('Failed to load intelligence data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSignalStrengthColor = (strength: string) => {
    switch (strength) {
      case 'CRITICAL': return 'bg-red-500 text-white'
      case 'HIGH': return 'bg-orange-500 text-white'
      case 'MEDIUM': return 'bg-yellow-500 text-black'
      case 'LOW': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'URGENT': return FireIcon
      case 'HIGH': return ExclamationTriangleIcon
      case 'MEDIUM': return InformationCircleIcon
      case 'LOW': return CheckCircleIcon
      default: return InformationCircleIcon
    }
  }

  const getInfluenceColor = (score: number) => {
    if (score >= 90) return 'text-purple-400'
    if (score >= 80) return 'text-blue-400'
    if (score >= 70) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-gray-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with upgrade prompt */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Decision Maker Intelligence</h1>
          <p className="text-gray-400 mt-1">Executive tracking, org charts & buying signals</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <StarIcon className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 font-medium">Premium Feature - $49/month</span>
            </div>
          </div>
          <AccessibleButton className="bg-gradient-to-r from-violet-500 to-purple-600">
            <ShieldCheckIcon className="w-4 h-4 mr-2" />
            Upgrade Now
          </AccessibleButton>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Tracked Executives</p>
              <p className="text-2xl font-bold text-white">{executives.length}</p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-violet-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Buying Signals</p>
              <p className="text-2xl font-bold text-white">{buyingSignals.length}</p>
            </div>
            <TrendingUpIcon className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Recent Job Changes</p>
              <p className="text-2xl font-bold text-white">{jobChanges.length}</p>
            </div>
            <BriefcaseIcon className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Org Charts Mapped</p>
              <p className="text-2xl font-bold text-white">{orgCharts.length}</p>
            </div>
            <BuildingOffice2Icon className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'executives', name: 'Executives', icon: UserGroupIcon, count: executives.length },
            { id: 'buying-signals', name: 'Buying Signals', icon: TrendingUpIcon, count: buyingSignals.length },
            { id: 'job-changes', name: 'Job Changes', icon: BriefcaseIcon, count: jobChanges.length },
            { id: 'org-charts', name: 'Org Charts', icon: BuildingOffice2Icon, count: orgCharts.length },
            { id: 'insights', name: 'AI Insights', icon: LightBulbIcon }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-gray-800 text-gray-300 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'executives' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {executives.map((executive, index) => (
              <motion.div
                key={executive.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/60 border border-gray-800 rounded-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                      {executive.profilePictureUrl ? (
                        <img
                          src={executive.profilePictureUrl}
                          alt={`${executive.firstName} ${executive.lastName}`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {executive.firstName} {executive.lastName}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSignalStrengthColor(executive.signalStrength)}`}>
                          {executive.signalStrength} SIGNALS
                        </span>
                      </div>

                      <p className="text-violet-400 font-medium">{executive.currentTitle}</p>
                      <p className="text-gray-300">{executive.currentCompany}</p>

                      <div className="grid md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Influence Score</p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-lg font-bold ${getInfluenceColor(executive.influenceScore)}`}>
                              {executive.influenceScore}/100
                            </span>
                            <div className="w-20 bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full"
                                style={{ width: `${executive.influenceScore}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-400 mb-1">Connection Level</p>
                          <p className="text-white font-medium">{executive.connectionLevel}° connection</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-400 mb-1">Reporting Level</p>
                          <p className="text-white font-medium">
                            {executive.reportingLevel === 1 ? 'C-Suite' : 
                             executive.reportingLevel === 2 ? 'VP Level' : 
                             `Level ${executive.reportingLevel}`}
                          </p>
                        </div>
                      </div>

                      {executive.buyingSignals.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-white mb-2">Recent Buying Signals</p>
                          <div className="space-y-2">
                            {executive.buyingSignals.slice(0, 2).map((signal) => {
                              const UrgencyIcon = getUrgencyIcon(signal.urgency)
                              return (
                                <div key={signal.id} className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                                  <div className="flex items-start space-x-2">
                                    <UrgencyIcon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-blue-300">{signal.signal}</p>
                                      <p className="text-xs text-blue-200 mt-1">{signal.description}</p>
                                      <div className="flex items-center justify-between mt-2">
                                        <span className={`px-2 py-0.5 rounded text-xs ${getSignalStrengthColor(signal.strength)}`}>
                                          {signal.strength}
                                        </span>
                                        {signal.opportunitySize && (
                                          <span className="text-xs text-green-400">
                                            ${signal.opportunitySize.min.toLocaleString()}-${signal.opportunitySize.max.toLocaleString()}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {executive.personalityProfile && (
                        <div className="mt-4 bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                          <p className="text-sm font-medium text-purple-300 mb-2">AI Personality Insights</p>
                          <div className="flex items-center space-x-4 text-xs">
                            <span className="text-purple-200">Work Style: {executive.personalityProfile.workStyle}</span>
                            {executive.communicationStyle && (
                              <>
                                <span className="text-purple-200">Prefers: {executive.communicationStyle.preferredChannel}</span>
                                <span className="text-purple-200">Response: {executive.communicationStyle.responseTime}</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <AccessibleButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedExecutive(executive)
                        setShowEngagementStrategy(true)
                      }}
                    >
                      <LightBulbIcon className="w-4 h-4" />
                      Strategy
                    </AccessibleButton>
                    <AccessibleButton variant="ghost" size="sm">
                      <LinkIcon className="w-4 h-4" />
                      LinkedIn
                    </AccessibleButton>
                    <AccessibleButton variant="ghost" size="sm">
                      <BellIcon className="w-4 h-4" />
                      Monitor
                    </AccessibleButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'buying-signals' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {buyingSignals.map((signal, index) => {
              const UrgencyIcon = getUrgencyIcon(signal.urgency)
              const executive = executives.find(e => e.buyingSignals.some(s => s.id === signal.id))
              
              return (
                <motion.div
                  key={signal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900/60 border border-gray-800 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <UrgencyIcon className="w-5 h-5 text-orange-400" />
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSignalStrengthColor(signal.strength)}`}>
                          {signal.strength}
                        </span>
                        <span className="text-sm text-gray-400 capitalize">
                          {signal.signalType.replace('_', ' ').toLowerCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          from {signal.source.replace('_', ' ').toLowerCase()}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-2">{signal.signal}</h3>
                      <p className="text-gray-300 mb-3">{signal.description}</p>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Executive</p>
                          <p className="text-white font-medium">
                            {executive?.firstName} {executive?.lastName}
                          </p>
                          <p className="text-sm text-gray-300">{executive?.currentTitle}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-400">Relevance Score</p>
                          <p className="text-white font-medium">{Math.round(signal.relevanceScore * 100)}%</p>
                        </div>

                        {signal.opportunitySize && (
                          <div>
                            <p className="text-sm text-gray-400">Opportunity Size</p>
                            <p className="text-green-400 font-medium">
                              ${signal.opportunitySize.min.toLocaleString()}-${signal.opportunitySize.max.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>Detected: {new Date(signal.detectedDate).toLocaleDateString()}</span>
                        <span>Urgency: {signal.urgency}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <AccessibleButton variant="ghost" size="sm">
                        <EyeIcon className="w-4 h-4" />
                        View Source
                      </AccessibleButton>
                      <AccessibleButton size="sm">
                        Take Action
                      </AccessibleButton>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Engagement Strategy Modal */}
      <AnimatePresence>
        {showEngagementStrategy && selectedExecutive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEngagementStrategy(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Engagement Strategy: {selectedExecutive.firstName} {selectedExecutive.lastName}
                </h2>
                <button
                  onClick={() => setShowEngagementStrategy(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-300 mb-2">Recommended Approach</h3>
                  <p className="text-blue-200">
                    Direct, data-driven approach focusing on ROI and efficiency gains. 
                    Lead with quantifiable benefits and case studies.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-white mb-2">Best Channels</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <EnvelopeIcon className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-white">Email (Primary)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <LinkIcon className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-white">LinkedIn</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-2">Optimal Timing</h4>
                    <p className="text-sm text-gray-300">Tuesday-Thursday, 9-11 AM EST</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Key Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Operational efficiency', 'Cost reduction', 'Digital transformation'].map((topic) => (
                      <span key={topic} className="bg-violet-500/20 text-violet-300 px-2 py-1 rounded text-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Ice Breakers</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Congratulations on your recent promotion to VP of Operations</li>
                    <li>• Saw your post about scaling operations challenges</li>
                    <li>• Your team's growth from 50 to 250 employees is impressive</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <AccessibleButton variant="secondary" onClick={() => setShowEngagementStrategy(false)}>
                    Close
                  </AccessibleButton>
                  <AccessibleButton>
                    Generate Outreach Message
                  </AccessibleButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}