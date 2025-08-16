'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DocumentTextIcon,
  LightBulbIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  TrendingUpIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BoltIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { Territory, TerritoryBriefing } from '@/types/territory'

interface TerritoryIntelligenceBriefingProps {
  territory: Territory
  visitDate: string
  userId: string
  onStartBriefing: (briefing: TerritoryBriefing) => void
  className?: string
}

interface IntelligencePackage {
  briefing: TerritoryBriefing
  competitiveIntelligence: {
    threats: Array<{
      competitor: string
      activity: string
      impact: 'low' | 'medium' | 'high'
      response: string
    }>
    opportunities: Array<{
      description: string
      revenue: number
      timeline: string
      confidence: number
    }>
  }
  customerIntelligence: Array<{
    customerId: string
    customerName: string
    intelligence: {
      recentNews: string[]
      decisionMakers: Array<{
        name: string
        role: string
        influence: number
        lastContact: string
      }>
      buyingSignals: string[]
      painPoints: string[]
      competitorMentions: string[]
    }
  }>
  actionPlan: {
    preVisitTasks: Array<{
      task: string
      priority: number
      estimatedTime: number
      completed: boolean
    }>
    visitGoals: string[]
    successMetrics: Array<{
      metric: string
      target: string | number
      current?: string | number
    }>
    followUpActions: string[]
  }
  confidenceScore: number
}

export default function TerritoryIntelligenceBriefing({
  territory,
  visitDate,
  userId,
  onStartBriefing,
  className = ''
}: TerritoryIntelligenceBriefingProps) {
  const [intelligence, setIntelligence] = useState<IntelligencePackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'briefing' | 'competitive' | 'customers' | 'action'>('briefing')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    generateIntelligenceBriefing()
  }, [territory, visitDate, userId])

  const generateIntelligenceBriefing = async () => {
    try {
      setLoading(true)
      
      // Simulate AI intelligence gathering and analysis
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      const mockIntelligence: IntelligencePackage = {
        briefing: {
          territoryOverview: {
            totalAccounts: 42,
            activeOpportunities: 15,
            pipelineValue: 1250000,
            lastVisitDate: territory.lastVisitDate!,
            keyMetrics: {
              'Active Deals': 15,
              'High-Value Prospects': 8,
              'At-Risk Accounts': 3,
              'New Opportunities': 6
            }
          },
          priorityAccounts: [
            {
              id: 'acc-1',
              name: 'TechFlow Solutions',
              value: 175000,
              lastContact: '2024-08-08T10:00:00Z',
              nextAction: 'Contract negotiation and final demo',
              urgency: 'high'
            },
            {
              id: 'acc-2', 
              name: 'DataStream Corp',
              value: 125000,
              lastContact: '2024-08-06T14:30:00Z',
              nextAction: 'Executive stakeholder meeting',
              urgency: 'high'
            },
            {
              id: 'acc-3',
              name: 'CloudFirst Inc',
              value: 95000,
              lastContact: '2024-08-04T09:15:00Z',
              nextAction: 'Technical requirements review',
              urgency: 'medium'
            },
            {
              id: 'acc-4',
              name: 'InnovateLab',
              value: 65000,
              lastContact: '2024-08-01T16:45:00Z',
              nextAction: 'Budget approval follow-up',
              urgency: 'medium'
            }
          ],
          marketIntelligence: {
            competitorActivity: [
              'Salesforce announced new AI package targeting enterprise clients',
              'HubSpot hosting exclusive webinar for territory prospects next week',
              'Microsoft expanding local partner ecosystem'
            ],
            industryTrends: [
              'Q4 budget approval cycle starting - now is optimal timing',
              'AI automation adoption increased 45% in territory industry mix',
              'Compliance requirements driving CRM modernization'
            ],
            newsAndEvents: [
              'TechFlow Solutions completed Series C funding ($25M)',
              'DataStream Corp acquired 2 competitors in past quarter',
              'Regional CIO Summit scheduled for September 15th'
            ]
          },
          recommendedActivities: [
            {
              id: 'activity-1',
              type: 'customer_visit',
              customerId: 'acc-1',
              customerName: 'TechFlow Solutions',
              description: 'Contract finalization and C-suite presentation',
              estimatedDuration: 120,
              priority: 10,
              objectives: ['Close $175K deal', 'Secure multi-year contract', 'Identify expansion opportunities'],
              suggestedTalkingPoints: [
                'ROI projections based on their current workflow inefficiencies',
                'Implementation timeline to meet Q4 go-live goal',
                'Success stories from similar high-growth tech companies'
              ]
            },
            {
              id: 'activity-2',
              type: 'customer_visit', 
              customerId: 'acc-2',
              customerName: 'DataStream Corp',
              description: 'Executive alignment and strategic roadmap discussion',
              estimatedDuration: 90,
              priority: 9,
              objectives: ['Meet new C-suite after acquisition', 'Align on post-merger CRM strategy', 'Secure budget commitment'],
              suggestedTalkingPoints: [
                'How our platform facilitated successful mergers for other clients',
                'Data migration strategy and timeline',
                'Unified reporting across merged entities'
              ]
            }
          ],
          talkingPoints: [
            {
              category: 'Value Proposition',
              points: [
                'AI-first platform proven to reduce admin time by 40%',
                'Enterprise-grade security with SOC2 and compliance features',
                'Seamless integration with existing tech stacks'
              ]
            },
            {
              category: 'Competitive Differentiation',
              points: [
                'Unlike Salesforce, we offer true industry-specific workflows',
                'More cost-effective than HubSpot for enterprise requirements',
                'Native AI vs competitor add-on approaches'
              ]
            },
            {
              category: 'Timing & Urgency',
              points: [
                'Q4 implementation ideal for Q1 productivity gains',
                'New compliance requirements favor our approach',
                'Budget cycles closing - secure commitment now'
              ]
            }
          ]
        },
        competitiveIntelligence: {
          threats: [
            {
              competitor: 'Salesforce',
              activity: 'Targeting TechFlow Solutions with aggressive pricing',
              impact: 'high',
              response: 'Emphasize superior AI capabilities and lower TCO'
            },
            {
              competitor: 'HubSpot',
              activity: 'Hosting exclusive webinar for territory prospects',
              impact: 'medium',
              response: 'Counter with personalized demos and case studies'
            },
            {
              competitor: 'Microsoft',
              activity: 'Expanding partner network in territory',
              impact: 'medium',
              response: 'Leverage superior integration capabilities'
            }
          ],
          opportunities: [
            {
              description: 'TechFlow merger creates need for unified CRM platform',
              revenue: 250000,
              timeline: '30-45 days',
              confidence: 85
            },
            {
              description: 'DataStream post-acquisition consolidation opportunity',
              revenue: 180000,
              timeline: '60-90 days',
              confidence: 72
            }
          ]
        },
        customerIntelligence: [
          {
            customerId: 'acc-1',
            customerName: 'TechFlow Solutions',
            intelligence: {
              recentNews: [
                'Completed $25M Series C funding round',
                'Hired new CTO from Google',
                'Announced expansion into European markets'
              ],
              decisionMakers: [
                {
                  name: 'Sarah Martinez',
                  role: 'CEO',
                  influence: 95,
                  lastContact: '2024-08-01T14:00:00Z'
                },
                {
                  name: 'Michael Chen',
                  role: 'CTO',
                  influence: 90,
                  lastContact: '2024-08-08T10:00:00Z'
                },
                {
                  name: 'Alex Thompson',
                  role: 'VP Operations',
                  influence: 75,
                  lastContact: '2024-08-05T16:30:00Z'
                }
              ],
              buyingSignals: [
                'Requested enterprise pricing proposal',
                'Scheduled internal stakeholder demo',
                'Asked for implementation timeline details'
              ],
              painPoints: [
                'Current CRM lacks advanced automation features',
                'Manual reporting consuming 20+ hours weekly',
                'Integration challenges with existing tools'
              ],
              competitorMentions: [
                'Evaluated Salesforce but concerned about complexity',
                'HubSpot lacks enterprise features they need'
              ]
            }
          },
          {
            customerId: 'acc-2',
            customerName: 'DataStream Corp',
            intelligence: {
              recentNews: [
                'Acquired two smaller competitors last quarter',
                'New VP of Technology hired from Microsoft',
                'Planning IPO for late 2025'
              ],
              decisionMakers: [
                {
                  name: 'Jennifer Walsh',
                  role: 'CEO',
                  influence: 100,
                  lastContact: '2024-07-28T11:00:00Z'
                },
                {
                  name: 'David Kim',
                  role: 'VP Technology',
                  influence: 85,
                  lastContact: '2024-08-06T14:30:00Z'
                }
              ],
              buyingSignals: [
                'Increased meeting frequency with our team',
                'Requested technical integration documentation',
                'Asked about multi-entity reporting capabilities'
              ],
              painPoints: [
                'Need to consolidate 3 different CRM systems',
                'Lack unified reporting across entities',
                'Manual data synchronization taking excessive time'
              ],
              competitorMentions: [
                'Microsoft Dynamics being evaluated for integration'
              ]
            }
          }
        ],
        actionPlan: {
          preVisitTasks: [
            {
              task: 'Review TechFlow Solutions funding announcement and prepare ROI discussion',
              priority: 10,
              estimatedTime: 30,
              completed: false
            },
            {
              task: 'Prepare DataStream Corp merger case study presentation',
              priority: 9,
              estimatedTime: 45,
              completed: false
            },
            {
              task: 'Update competitive battle cards with latest Salesforce pricing',
              priority: 8,
              estimatedTime: 20,
              completed: false
            },
            {
              task: 'Coordinate with technical team for DataStream integration demo',
              priority: 7,
              estimatedTime: 15,
              completed: false
            }
          ],
          visitGoals: [
            'Close TechFlow Solutions deal ($175K minimum)',
            'Secure DataStream Corp budget commitment ($125K)',
            'Schedule follow-up meetings with all stakeholders',
            'Generate 2+ new qualified leads through networking'
          ],
          successMetrics: [
            {
              metric: 'Revenue Closed',
              target: '$175,000',
              current: '$0'
            },
            {
              metric: 'Deals Advanced',
              target: '2',
              current: '0'
            },
            {
              metric: 'New Leads',
              target: '3',
              current: '0'
            },
            {
              metric: 'Follow-up Meetings',
              target: '100%',
              current: '0%'
            }
          ],
          followUpActions: [
            'Send contract proposal to TechFlow within 24 hours',
            'Schedule technical demo for DataStream next week',
            'Provide competitive analysis document to CloudFirst',
            'Set up quarterly business review with InnovateLab'
          ]
        },
        confidenceScore: 91
      }
      
      setIntelligence(mockIntelligence)
      
    } catch (error) {
      console.error('Failed to generate intelligence briefing:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshIntelligence = async () => {
    setRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    await generateIntelligenceBriefing()
    setRefreshing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-8 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">AI gathering territory intelligence...</p>
            <p className="text-sm text-gray-500 mt-2">Analyzing market • Customer research • Competitive intel</p>
          </div>
        </div>
      </div>
    )
  }

  if (!intelligence) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-8 ${className}`}>
        <div className="text-center text-red-600">
          Failed to generate intelligence briefing
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <DocumentTextIcon className="h-6 w-6 mr-3" />
              Territory Intelligence Briefing
            </h2>
            <p className="text-purple-100 mt-1">AI-powered pre-visit intelligence for {territory.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-purple-100 text-sm">Confidence Score</div>
              <div className="text-3xl font-bold text-white">{intelligence.confidenceScore}%</div>
            </div>
            <button
              onClick={refreshIntelligence}
              disabled={refreshing}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50"
            >
              {refreshing ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {(['briefing', 'competitive', 'customers', 'action'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Territory Briefing */}
          {activeTab === 'briefing' && (
            <motion.div
              key="briefing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Territory Overview */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Territory Overview
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(intelligence.briefing.territoryOverview.keyMetrics).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{value}</div>
                      <div className="text-sm text-gray-600">{key}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Accounts */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUpIcon className="h-5 w-5 mr-2 text-green-600" />
                  Priority Accounts This Visit
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {intelligence.briefing.priorityAccounts.map((account) => (
                    <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{account.name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full border ${getUrgencyColor(account.urgency)}`}>
                            {account.urgency.toUpperCase()}
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            {formatCurrency(account.value)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          <strong>Last Contact:</strong> {formatDate(account.lastContact)}
                        </p>
                        <p className="text-gray-600">
                          <strong>Next Action:</strong> {account.nextAction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Intelligence */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h4 className="font-semibold text-red-900 mb-3">Competitive Activity</h4>
                  <ul className="space-y-2 text-sm">
                    {intelligence.briefing.marketIntelligence.competitorActivity.map((item, idx) => (
                      <li key={idx} className="text-red-700">• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">Industry Trends</h4>
                  <ul className="space-y-2 text-sm">
                    {intelligence.briefing.marketIntelligence.industryTrends.map((item, idx) => (
                      <li key={idx} className="text-blue-700">• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3">News & Events</h4>
                  <ul className="space-y-2 text-sm">
                    {intelligence.briefing.marketIntelligence.newsAndEvents.map((item, idx) => (
                      <li key={idx} className="text-green-700">• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Competitive Intelligence */}
          {activeTab === 'competitive' && (
            <motion.div
              key="competitive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Competitive Threats */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-600" />
                  Active Threats
                </h3>
                <div className="space-y-4">
                  {intelligence.competitiveIntelligence.threats.map((threat, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{threat.competitor}</h4>
                        <span className={`px-3 py-1 text-xs rounded-full border ${getImpactColor(threat.impact)}`}>
                          {threat.impact.toUpperCase()} IMPACT
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{threat.activity}</p>
                      <div className="bg-blue-50 rounded p-3">
                        <p className="text-sm text-blue-800">
                          <strong>Recommended Response:</strong> {threat.response}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opportunities */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUpIcon className="h-5 w-5 mr-2 text-green-600" />
                  Strategic Opportunities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {intelligence.competitiveIntelligence.opportunities.map((opp, idx) => (
                    <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-800">OPPORTUNITY</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(opp.revenue)}
                          </span>
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                            {opp.confidence}% confidence
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{opp.description}</p>
                      <p className="text-sm text-green-700">
                        <strong>Timeline:</strong> {opp.timeline}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Customer Intelligence */}
          {activeTab === 'customers' && (
            <motion.div
              key="customers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {intelligence.customerIntelligence.map((customer) => (
                <div key={customer.customerId} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 mr-2 text-purple-600" />
                    {customer.customerName}
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent News */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recent News</h4>
                      <ul className="space-y-1 text-sm">
                        {customer.intelligence.recentNews.map((news, idx) => (
                          <li key={idx} className="text-gray-700">• {news}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Decision Makers */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Key Decision Makers</h4>
                      <div className="space-y-2">
                        {customer.intelligence.decisionMakers.map((dm, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <div className="font-medium text-sm">{dm.name}</div>
                              <div className="text-xs text-gray-600">{dm.role}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-purple-600">{dm.influence}%</div>
                              <div className="text-xs text-gray-500">influence</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Buying Signals */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 text-green-700">Buying Signals</h4>
                      <ul className="space-y-1 text-sm">
                        {customer.intelligence.buyingSignals.map((signal, idx) => (
                          <li key={idx} className="text-green-700">✓ {signal}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Pain Points */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 text-red-700">Pain Points</h4>
                      <ul className="space-y-1 text-sm">
                        {customer.intelligence.painPoints.map((pain, idx) => (
                          <li key={idx} className="text-red-700">⚠ {pain}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Competitor Mentions */}
                  {customer.intelligence.competitorMentions.length > 0 && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                      <h4 className="font-medium text-yellow-900 mb-2">Competitor Intelligence</h4>
                      <ul className="space-y-1 text-sm">
                        {customer.intelligence.competitorMentions.map((mention, idx) => (
                          <li key={idx} className="text-yellow-700">⚡ {mention}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* Action Plan */}
          {activeTab === 'action' && (
            <motion.div
              key="action"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Pre-Visit Tasks */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-orange-600" />
                  Pre-Visit Preparation ({intelligence.actionPlan.preVisitTasks.reduce((acc, task) => acc + task.estimatedTime, 0)} minutes)
                </h3>
                <div className="space-y-3">
                  {intelligence.actionPlan.preVisitTasks.map((task, idx) => (
                    <div key={idx} className={`flex items-center p-3 border rounded-lg ${
                      task.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex-shrink-0 mr-3">
                        {task.completed ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <div className="h-5 w-5 border-2 border-gray-300 rounded"></div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className={`text-sm ${task.completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                          {task.task}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-600">Priority: {task.priority}/10</span>
                          <span className="text-xs text-gray-600">{task.estimatedTime} min</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visit Goals */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <StarIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Visit Goals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {intelligence.actionPlan.visitGoals.map((goal, idx) => (
                    <div key={idx} className="flex items-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <BoltIcon className="h-4 w-4 text-purple-600 mr-2 flex-shrink-0" />
                      <span className="text-sm text-purple-800">{goal}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success Metrics */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Success Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {intelligence.actionPlan.successMetrics.map((metric, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{metric.metric}</span>
                        <span className="text-sm text-gray-600">Target: {metric.target}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Current: {metric.current || 'Not started'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-up Actions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center text-blue-900">
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  Post-Visit Follow-up Actions
                </h3>
                <ul className="space-y-2">
                  {intelligence.actionPlan.followUpActions.map((action, idx) => (
                    <li key={idx} className="text-sm text-blue-800 flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Button */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Ready to execute your intelligence-driven territory visit?
          </div>
          <button
            onClick={() => onStartBriefing(intelligence.briefing)}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
          >
            Start Intelligence-Driven Visit
          </button>
        </div>
      </div>
    </div>
  )
}