'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapIcon,
  ClockIcon,
  TrophyIcon,
  BoltIcon,
  UserGroupIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { Territory, TerritoryBriefing, OptimizedRoute } from '@/types/territory'

interface TerritoryEffectivenessMaximizerProps {
  territory: Territory
  visitDate: string
  userId: string
  onStartVisit: (briefing: TerritoryBriefing, route: OptimizedRoute) => void
  className?: string
}

interface VisitPreparation {
  briefing: TerritoryBriefing
  route: OptimizedRoute
  preparation: {
    estimatedDuration: number // minutes
    estimatedRevenue: number
    keyObjectives: string[]
    successMetrics: string[]
  }
  readinessScore: number // 0-100
}

export default function TerritoryEffectivenessMaximizer({
  territory,
  visitDate,
  userId,
  onStartVisit,
  className = ''
}: TerritoryEffectivenessMaximizerProps) {
  const [preparation, setPreparation] = useState<VisitPreparation | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState<'overview' | 'accounts' | 'route' | 'briefing'>('overview')
  const [isOptimizing, setIsOptimizing] = useState(false)

  useEffect(() => {
    generateTerritoryPreparation()
  }, [territory, visitDate, userId])

  const generateTerritoryPreparation = async () => {
    try {
      setLoading(true)
      
      // Simulate AI-powered territory analysis and preparation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockPreparation: VisitPreparation = {
        briefing: {
          territoryOverview: {
            totalAccounts: 45,
            activeOpportunities: 12,
            pipelineValue: 850000,
            lastVisitDate: territory.lastVisitDate!,
            keyMetrics: {
              'New Leads': 8,
              'Qualified Prospects': 15,
              'Active Deals': 12,
              'At-Risk Accounts': 3
            }
          },
          priorityAccounts: [
            {
              id: 'acc-1',
              name: 'TechFlow Solutions',
              value: 125000,
              lastContact: '2024-08-05T10:00:00Z',
              nextAction: 'Product demo scheduled',
              urgency: 'high'
            },
            {
              id: 'acc-2', 
              name: 'DataStream Corp',
              value: 95000,
              lastContact: '2024-08-03T14:30:00Z',
              nextAction: 'Contract negotiation',
              urgency: 'high'
            },
            {
              id: 'acc-3',
              name: 'CloudFirst Inc',
              value: 65000,
              lastContact: '2024-08-01T09:15:00Z',
              nextAction: 'Follow-up on proposal',
              urgency: 'medium'
            },
            {
              id: 'acc-4',
              name: 'InnovateLab',
              value: 40000,
              lastContact: '2024-07-28T16:45:00Z',
              nextAction: 'Relationship building',
              urgency: 'medium'
            }
          ],
          marketIntelligence: {
            competitorActivity: [
              'SalesForce announced new enterprise package in territory',
              'HubSpot hiring 3 new reps in Northeast region',
              'Microsoft expanding partner network locally'
            ],
            industryTrends: [
              'AI automation adoption accelerating 40% YoY',
              'Cloud migration projects increasing post-summer',
              'Compliance requirements driving CRM upgrades'
            ],
            newsAndEvents: [
              'TechFlow Solutions raised Series B funding ($15M)',
              'DataStream Corp acquired competitor last month',
              'Local tech meetup scheduled for August 20th'
            ]
          },
          recommendedActivities: [
            {
              id: 'activity-1',
              type: 'customer_visit',
              customerId: 'acc-1',
              customerName: 'TechFlow Solutions',
              description: 'Product demonstration and contract discussion',
              estimatedDuration: 90,
              priority: 9,
              objectives: ['Demo key features', 'Address security concerns', 'Close by Friday'],
              suggestedTalkingPoints: [
                'New AI features aligned with their automation goals',
                'ROI calculations based on their current workflow',
                'Implementation timeline fitting their Q4 launch'
              ]
            },
            {
              id: 'activity-2',
              type: 'customer_visit',
              customerId: 'acc-2',
              customerName: 'DataStream Corp',
              description: 'Contract negotiation and relationship building',
              estimatedDuration: 60,
              priority: 8,
              objectives: ['Finalize contract terms', 'Meet new stakeholders', 'Plan implementation'],
              suggestedTalkingPoints: [
                'Flexible pricing options for their growth trajectory',
                'Success stories from similar acquisition scenarios',
                'White-glove onboarding process'
              ]
            }
          ],
          talkingPoints: [
            {
              category: 'Value Proposition',
              points: [
                'AI-first platform saves 40% admin time',
                'Enterprise security with SOC2 compliance',
                '99.9% uptime SLA with 24/7 support'
              ]
            },
            {
              category: 'Competitive Positioning',
              points: [
                'Unlike Salesforce, we offer industry-specific workflows',
                'More cost-effective than HubSpot for enterprise features',
                'Native AI integration vs. Microsoft\'s add-on approach'
              ]
            },
            {
              category: 'Current Market',
              points: [
                'Q4 is prime time for CRM implementations',
                'New compliance requirements favor our platform',
                'AI adoption is accelerating across all industries'
              ]
            }
          ]
        },
        route: {
          waypoints: [
            {
              id: 'waypoint-1',
              customerId: 'acc-1',
              customerName: 'TechFlow Solutions',
              address: '123 Tech Park Drive, Innovation City',
              latitude: 40.7589,
              longitude: -73.9851,
              estimatedArrival: '9:00 AM',
              estimatedDuration: 90,
              visitPurpose: 'Product Demo & Contract Discussion',
              priority: 9
            },
            {
              id: 'waypoint-2',
              customerId: 'acc-2',
              customerName: 'DataStream Corp',
              address: '456 Data Center Blvd, Tech Valley',
              latitude: 40.7614,
              longitude: -73.9776,
              estimatedArrival: '11:15 AM',
              estimatedDuration: 60,
              visitPurpose: 'Contract Negotiation',
              priority: 8
            },
            {
              id: 'waypoint-3',
              customerId: 'acc-3',
              customerName: 'CloudFirst Inc',
              address: '789 Cloud Avenue, Digital District',
              latitude: 40.7505,
              longitude: -73.9934,
              estimatedArrival: '1:30 PM',
              estimatedDuration: 45,
              visitPurpose: 'Proposal Follow-up',
              priority: 7
            }
          ],
          totalDistance: 25.5,
          totalTime: 285, // 4 hours 45 minutes
          optimizationScore: 0.92
        },
        preparation: {
          estimatedDuration: 285,
          estimatedRevenue: 285000,
          keyObjectives: [
            'Close TechFlow Solutions deal ($125K)',
            'Finalize DataStream Corp contract ($95K)', 
            'Advance CloudFirst proposal ($65K)',
            'Generate 2+ qualified leads from networking'
          ],
          successMetrics: [
            'Revenue closed: $125K+ target',
            'Deals advanced: 2+ to next stage',
            'New leads generated: 2+ qualified',
            'Follow-up meetings booked: 100% rate'
          ]
        },
        readinessScore: 87
      }
      
      setPreparation(mockPreparation)
      
      // Pre-select high-priority accounts
      const highPriorityAccounts = mockPreparation.briefing.priorityAccounts
        .filter(acc => acc.urgency === 'high')
        .map(acc => acc.id)
      
      setSelectedAccounts(highPriorityAccounts)
      
    } catch (error) {
      console.error('Failed to generate territory preparation:', error)
    } finally {
      setLoading(false)
    }
  }

  const optimizeRoute = async () => {
    setIsOptimizing(true)
    
    // Simulate route optimization
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (preparation) {
      const optimizedRoute = {
        ...preparation.route,
        optimizationScore: Math.min(0.98, preparation.route.optimizationScore + 0.06)
      }
      
      setPreparation({
        ...preparation,
        route: optimizedRoute
      })
    }
    
    setIsOptimizing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">AI analyzing territory for maximum effectiveness...</p>
            <p className="text-sm text-gray-500 mt-2">Optimizing route • Prioritizing accounts • Generating insights</p>
          </div>
        </div>
      </div>
    )
  }

  if (!preparation) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-8 ${className}`}>
        <div className="text-center text-red-600">
          Failed to generate territory preparation
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <TrophyIcon className="h-6 w-6 mr-3" />
              Territory Effectiveness Maximizer
            </h2>
            <p className="text-green-100 mt-1">AI-optimized visit plan for {territory.name}</p>
          </div>
          <div className="text-right">
            <div className="text-green-100 text-sm">Readiness Score</div>
            <div className="text-3xl font-bold text-white">{preparation.readinessScore}%</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {(['overview', 'accounts', 'route', 'briefing'] as const).map((step) => (
            <button
              key={step}
              onClick={() => setCurrentStep(step)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentStep === step
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Sections */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Overview */}
          {currentStep === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-600">Visit Duration</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {formatTime(preparation.preparation.estimatedDuration)}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <TrophyIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-600">Revenue Target</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(preparation.preparation.estimatedRevenue)}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-gray-600">Priority Accounts</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {preparation.briefing.priorityAccounts.length}
                  </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <MapIcon className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-gray-600">Route Efficiency</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {Math.round(preparation.route.optimizationScore * 100)}%
                  </p>
                </div>
              </div>

              {/* Key Objectives */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BoltIcon className="h-5 w-5 mr-2 text-yellow-600" />
                  Key Objectives for This Visit
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {preparation.preparation.keyObjectives.map((objective, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{objective}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success Metrics */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <StarIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Success Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {preparation.preparation.successMetrics.map((metric, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <TrophyIcon className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{metric}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Priority Accounts */}
          {currentStep === 'accounts' && (
            <motion.div
              key="accounts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Priority Accounts</h3>
              
              {preparation.briefing.priorityAccounts.map((account, index) => (
                <div key={account.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-gray-900">{account.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getUrgencyColor(account.urgency)}`}>
                          {account.urgency.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(account.value)}
                        </span>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          <strong>Last Contact:</strong> {new Date(account.lastContact).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Next Action:</strong> {account.nextAction}
                        </p>
                      </div>
                      
                      {/* Account-specific talking points */}
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Suggested Talking Points:</p>
                        <div className="text-sm text-gray-600 space-y-1">
                          {preparation.briefing.recommendedActivities
                            .find(activity => activity.customerId === account.id)
                            ?.suggestedTalkingPoints.map((point, idx) => (
                            <div key={idx} className="flex items-start space-x-2">
                              <LightBulbIcon className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                              <span>{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded">
                        <PhoneIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-100 rounded">
                        <BuildingOfficeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-purple-600 hover:bg-purple-100 rounded">
                        <DocumentTextIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Optimized Route */}
          {currentStep === 'route' && (
            <motion.div
              key="route"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Optimized Visit Route</h3>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    Efficiency: <span className="font-bold text-green-600">{Math.round(preparation.route.optimizationScore * 100)}%</span>
                  </div>
                  <button
                    onClick={optimizeRoute}
                    disabled={isOptimizing}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                  >
                    {isOptimizing ? (
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      'Re-optimize'
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{preparation.route.waypoints.length}</div>
                    <div className="text-sm text-gray-600">Stops</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{preparation.route.totalDistance}mi</div>
                    <div className="text-sm text-gray-600">Total Distance</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{formatTime(preparation.route.totalTime)}</div>
                    <div className="text-sm text-gray-600">Total Time</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {preparation.route.waypoints.map((waypoint, index) => (
                  <div key={waypoint.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-gray-900">{waypoint.customerName}</h4>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {waypoint.estimatedArrival}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatTime(waypoint.estimatedDuration)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{waypoint.address}</p>
                      <p className="text-sm text-gray-500">{waypoint.visitPurpose}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-600">Priority</div>
                      <div className="text-lg font-bold text-purple-600">{waypoint.priority}/10</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Territory Briefing */}
          {currentStep === 'briefing' && (
            <motion.div
              key="briefing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold">AI-Generated Territory Intelligence</h3>
              
              {/* Market Intelligence */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h4 className="font-semibold text-red-900 mb-3">Competitive Activity</h4>
                  <ul className="space-y-2 text-sm">
                    {preparation.briefing.marketIntelligence.competitorActivity.map((item, idx) => (
                      <li key={idx} className="text-red-700">• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">Industry Trends</h4>
                  <ul className="space-y-2 text-sm">
                    {preparation.briefing.marketIntelligence.industryTrends.map((item, idx) => (
                      <li key={idx} className="text-blue-700">• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3">News & Events</h4>
                  <ul className="space-y-2 text-sm">
                    {preparation.briefing.marketIntelligence.newsAndEvents.map((item, idx) => (
                      <li key={idx} className="text-green-700">• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Talking Points */}
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-4">Strategic Talking Points</h4>
                <div className="space-y-4">
                  {preparation.briefing.talkingPoints.map((category, idx) => (
                    <div key={idx}>
                      <h5 className="font-medium text-purple-800 mb-2">{category.category}</h5>
                      <ul className="space-y-1 ml-4">
                        {category.points.map((point, pointIdx) => (
                          <li key={pointIdx} className="text-sm text-purple-700">• {point}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Button */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Ready to start your optimized territory visit?
          </div>
          <button
            onClick={() => onStartVisit(preparation.briefing, preparation.route)}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-lg"
          >
            Start Territory Visit
          </button>
        </div>
      </div>
    </div>
  )
}