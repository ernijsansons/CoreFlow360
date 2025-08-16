/**
 * CoreFlow360 - Deal Pipeline with AI-Powered Insights
 * Comprehensive sales pipeline management with intelligent forecasting
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Removed drag-and-drop for now - can be added later
// import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { 
  PlusIcon,
  EyeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  SparklesIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { MetricCard } from '@/components/ui/MetricCard'

interface Deal {
  id: string
  title: string
  description?: string
  value: number
  probability: number
  expectedCloseDate?: string
  actualCloseDate?: string
  createdAt: string
  updatedAt: string
  
  // Customer info
  customer: {
    id: string
    name: string
    email?: string
    company?: string
  }
  
  // Assignment
  assignee?: {
    id: string
    name: string
    avatar?: string
  }
  
  // AI predictions
  aiPredictedValue: number
  aiWinProbability: number
  aiRecommendedActions: string[]
  aiRiskFactors: string[]
  aiLastAnalysisAt?: string
  
  // Stage tracking
  stageId: string
  stageHistory: Array<{
    stageId: string
    enteredAt: string
    exitedAt?: string
  }>
  
  // Activities
  lastActivity?: {
    type: string
    date: string
    description: string
  }
}

interface PipelineStage {
  id: string
  name: string
  order: number
  color: string
  probability: number
  expectedDays: number
  deals: Deal[]
}

interface PipelineMetrics {
  totalValue: number
  weightedValue: number
  avgDealSize: number
  conversionRate: number
  avgSalesCycle: number
  dealsWon: number
  dealsLost: number
  forecastAccuracy: number
}

interface DealPipelineProps {
  onDealClick?: (deal: Deal) => void
  onAddDeal?: (stageId: string) => void
  onEditDeal?: (deal: Deal) => void
}

export default function DealPipeline({ onDealClick, onAddDeal, onEditDeal }: DealPipelineProps) {
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month')
  const [showAIInsights, setShowAIInsights] = useState(true)

  useEffect(() => {
    loadPipelineData()
  }, [selectedTimeframe])

  const loadPipelineData = async () => {
    try {
      setLoading(true)
      
      // Mock data for demonstration
      const mockStages: PipelineStage[] = [
        {
          id: 'lead',
          name: 'Lead',
          order: 1,
          color: '#6B7280',
          probability: 10,
          expectedDays: 7,
          deals: [
            {
              id: '1',
              title: 'Website Redesign Project',
              description: 'Complete website overhaul for e-commerce platform',
              value: 25000,
              probability: 15,
              expectedCloseDate: '2024-09-15T00:00:00Z',
              createdAt: '2024-08-01T10:00:00Z',
              updatedAt: '2024-08-09T14:30:00Z',
              customer: {
                id: '1',
                name: 'Sarah Johnson',
                email: 'sarah@techstart.io',
                company: 'TechStart'
              },
              assignee: {
                id: '1',
                name: 'Alex Morgan',
                avatar: '/avatars/alex.jpg'
              },
              aiPredictedValue: 28000,
              aiWinProbability: 25,
              aiRecommendedActions: [
                'Schedule discovery call within 48 hours',
                'Send case study examples',
                'Request technical requirements document'
              ],
              aiRiskFactors: [
                'No budget confirmed yet',
                'Multiple decision makers involved'
              ],
              aiLastAnalysisAt: '2024-08-09T12:00:00Z',
              stageId: 'lead',
              stageHistory: [
                {
                  stageId: 'lead',
                  enteredAt: '2024-08-01T10:00:00Z'
                }
              ],
              lastActivity: {
                type: 'EMAIL',
                date: '2024-08-08T15:30:00Z',
                description: 'Sent initial proposal outline'
              }
            }
          ]
        },
        {
          id: 'qualified',
          name: 'Qualified',
          order: 2,
          color: '#3B82F6',
          probability: 25,
          expectedDays: 14,
          deals: [
            {
              id: '2',
              title: 'CRM Integration Services',
              description: 'Integration with existing CRM and automation setup',
              value: 45000,
              probability: 30,
              expectedCloseDate: '2024-10-01T00:00:00Z',
              createdAt: '2024-07-15T14:20:00Z',
              updatedAt: '2024-08-09T11:15:00Z',
              customer: {
                id: '2',
                name: 'Michael Chen',
                email: 'mchen@innovateplus.com',
                company: 'InnovatePlus'
              },
              assignee: {
                id: '2',
                name: 'Jordan Lee',
                avatar: '/avatars/jordan.jpg'
              },
              aiPredictedValue: 52000,
              aiWinProbability: 45,
              aiRecommendedActions: [
                'Present detailed technical proposal',
                'Arrange stakeholder demo',
                'Discuss timeline and milestones'
              ],
              aiRiskFactors: [
                'Competitor actively pursuing',
                'Timeline pressure from client'
              ],
              aiLastAnalysisAt: '2024-08-09T12:00:00Z',
              stageId: 'qualified',
              stageHistory: [
                {
                  stageId: 'lead',
                  enteredAt: '2024-07-15T14:20:00Z',
                  exitedAt: '2024-07-20T09:30:00Z'
                },
                {
                  stageId: 'qualified',
                  enteredAt: '2024-07-20T09:30:00Z'
                }
              ],
              lastActivity: {
                type: 'CALL',
                date: '2024-08-07T16:00:00Z',
                description: 'Qualification call with decision maker'
              }
            }
          ]
        },
        {
          id: 'proposal',
          name: 'Proposal',
          order: 3,
          color: '#F59E0B',
          probability: 50,
          expectedDays: 21,
          deals: [
            {
              id: '3',
              title: 'Enterprise Dashboard Solution',
              description: 'Custom analytics dashboard with real-time reporting',
              value: 75000,
              probability: 65,
              expectedCloseDate: '2024-09-30T00:00:00Z',
              createdAt: '2024-06-10T11:30:00Z',
              updatedAt: '2024-08-09T09:45:00Z',
              customer: {
                id: '3',
                name: 'Emily Rodriguez',
                email: 'emily.r@futuretech.com',
                company: 'FutureTech'
              },
              assignee: {
                id: '3',
                name: 'Sam Wilson',
                avatar: '/avatars/sam.jpg'
              },
              aiPredictedValue: 78000,
              aiWinProbability: 75,
              aiRecommendedActions: [
                'Follow up on proposal within 2 days',
                'Address pricing concerns',
                'Schedule final presentation'
              ],
              aiRiskFactors: [
                'Budget approval pending',
                'Q4 freeze possible'
              ],
              aiLastAnalysisAt: '2024-08-09T12:00:00Z',
              stageId: 'proposal',
              stageHistory: [
                {
                  stageId: 'lead',
                  enteredAt: '2024-06-10T11:30:00Z',
                  exitedAt: '2024-06-15T14:00:00Z'
                },
                {
                  stageId: 'qualified',
                  enteredAt: '2024-06-15T14:00:00Z',
                  exitedAt: '2024-07-01T10:15:00Z'
                },
                {
                  stageId: 'proposal',
                  enteredAt: '2024-07-01T10:15:00Z'
                }
              ],
              lastActivity: {
                type: 'MEETING',
                date: '2024-08-06T14:00:00Z',
                description: 'Proposal presentation to board'
              }
            }
          ]
        },
        {
          id: 'negotiation',
          name: 'Negotiation',
          order: 4,
          color: '#8B5CF6',
          probability: 75,
          expectedDays: 14,
          deals: [
            {
              id: '4',
              title: 'System Migration & Training',
              description: 'Complete system migration with team training program',
              value: 95000,
              probability: 80,
              expectedCloseDate: '2024-08-20T00:00:00Z',
              createdAt: '2024-05-01T09:15:00Z',
              updatedAt: '2024-08-09T16:20:00Z',
              customer: {
                id: '4',
                name: 'David Park',
                email: 'dpark@globalcorp.com',
                company: 'Global Corp'
              },
              assignee: {
                id: '1',
                name: 'Alex Morgan',
                avatar: '/avatars/alex.jpg'
              },
              aiPredictedValue: 92000,
              aiWinProbability: 85,
              aiRecommendedActions: [
                'Finalize contract terms',
                'Schedule implementation kickoff',
                'Prepare onboarding materials'
              ],
              aiRiskFactors: [
                'Minor pricing negotiation ongoing'
              ],
              aiLastAnalysisAt: '2024-08-09T12:00:00Z',
              stageId: 'negotiation',
              stageHistory: [
                {
                  stageId: 'lead',
                  enteredAt: '2024-05-01T09:15:00Z',
                  exitedAt: '2024-05-10T11:30:00Z'
                },
                {
                  stageId: 'qualified',
                  enteredAt: '2024-05-10T11:30:00Z',
                  exitedAt: '2024-06-01T14:45:00Z'
                },
                {
                  stageId: 'proposal',
                  enteredAt: '2024-06-01T14:45:00Z',
                  exitedAt: '2024-07-15T16:20:00Z'
                },
                {
                  stageId: 'negotiation',
                  enteredAt: '2024-07-15T16:20:00Z'
                }
              ],
              lastActivity: {
                type: 'EMAIL',
                date: '2024-08-09T10:30:00Z',
                description: 'Contract revision sent for approval'
              }
            }
          ]
        },
        {
          id: 'closed-won',
          name: 'Closed Won',
          order: 5,
          color: '#10B981',
          probability: 100,
          expectedDays: 0,
          deals: [
            {
              id: '5',
              title: 'Cloud Infrastructure Setup',
              description: 'Complete cloud migration and infrastructure setup',
              value: 65000,
              probability: 100,
              expectedCloseDate: '2024-07-30T00:00:00Z',
              actualCloseDate: '2024-07-28T00:00:00Z',
              createdAt: '2024-04-01T10:00:00Z',
              updatedAt: '2024-07-28T15:30:00Z',
              customer: {
                id: '5',
                name: 'Lisa Wang',
                email: 'lwang@techsolutions.com',
                company: 'TechSolutions'
              },
              assignee: {
                id: '2',
                name: 'Jordan Lee',
                avatar: '/avatars/jordan.jpg'
              },
              aiPredictedValue: 63000,
              aiWinProbability: 100,
              aiRecommendedActions: [
                'Begin project implementation',
                'Schedule regular check-ins',
                'Identify upsell opportunities'
              ],
              aiRiskFactors: [],
              aiLastAnalysisAt: '2024-07-28T12:00:00Z',
              stageId: 'closed-won',
              stageHistory: [
                {
                  stageId: 'lead',
                  enteredAt: '2024-04-01T10:00:00Z',
                  exitedAt: '2024-04-08T12:00:00Z'
                },
                {
                  stageId: 'qualified',
                  enteredAt: '2024-04-08T12:00:00Z',
                  exitedAt: '2024-05-01T14:00:00Z'
                },
                {
                  stageId: 'proposal',
                  enteredAt: '2024-05-01T14:00:00Z',
                  exitedAt: '2024-06-15T10:30:00Z'
                },
                {
                  stageId: 'negotiation',
                  enteredAt: '2024-06-15T10:30:00Z',
                  exitedAt: '2024-07-28T15:30:00Z'
                },
                {
                  stageId: 'closed-won',
                  enteredAt: '2024-07-28T15:30:00Z'
                }
              ],
              lastActivity: {
                type: 'CONTRACT',
                date: '2024-07-28T15:30:00Z',
                description: 'Contract signed and project initiated'
              }
            }
          ]
        }
      ]

      const mockMetrics: PipelineMetrics = {
        totalValue: 305000,
        weightedValue: 156750,
        avgDealSize: 61000,
        conversionRate: 68.5,
        avgSalesCycle: 45,
        dealsWon: 8,
        dealsLost: 3,
        forecastAccuracy: 85.2
      }

      setStages(mockStages)
      setMetrics(mockMetrics)
    } catch (error) {
      console.error('Failed to load pipeline data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Simplified move deal function (without drag-and-drop for now)
  const moveDeal = (dealId: string, newStageId: string) => {
    const newStages = stages.map(stage => {
      // Remove deal from current stage
      const updatedDeals = stage.deals.filter(d => d.id !== dealId)
      
      // Add deal to new stage
      if (stage.id === newStageId) {
        const deal = stages.flatMap(s => s.deals).find(d => d.id === dealId)
        if (deal) {
          updatedDeals.push({
            ...deal,
            stageId: newStageId,
            probability: stage.probability
          })
        }
      }
      
      return {
        ...stage,
        deals: updatedDeals
      }
    })

    setStages(newStages)
    console.log(`Moved deal ${dealId} to ${newStageId}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getStageTotal = (deals: Deal[]) => {
    return deals.reduce((sum, deal) => sum + deal.value, 0)
  }

  const getStageWeightedTotal = (deals: Deal[]) => {
    return deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0)
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600 mt-1">Manage deals and track sales progress with AI insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as 'week' | 'month' | 'quarter')}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <button
            onClick={() => setShowAIInsights(!showAIInsights)}
            className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
              showAIInsights
                ? 'border-purple-300 bg-purple-50 text-purple-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            AI Insights
          </button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            value={formatCurrency(metrics.totalValue)}
            label="Total Pipeline"
            icon={CurrencyDollarIcon}
            gradient="blue"
            trend={12}
          />
          <MetricCard
            value={formatCurrency(metrics.weightedValue)}
            label="Weighted Pipeline"
            icon={FunnelIcon}
            gradient="emerald"
            trend={8}
          />
          <MetricCard
            value={`${metrics.conversionRate}%`}
            label="Conversion Rate"
            icon={TrendingUpIcon}
            gradient="violet"
            trend={5}
          />
          <MetricCard
            value={`${metrics.avgSalesCycle}d`}
            label="Avg. Sales Cycle"
            icon={ClockIcon}
            gradient="orange"
            trend={-3}
          />
        </div>
      )}

      {/* Pipeline Board */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex overflow-x-auto">
          {stages.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80 border-r border-gray-200 last:border-r-0">
              {/* Stage Header */}
              <div className="p-4 border-b border-gray-200" style={{ backgroundColor: `${stage.color}10` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <h3 className="font-medium text-gray-900">{stage.name}</h3>
                    <span className="text-sm text-gray-500">({stage.deals.length})</span>
                  </div>
                  <button
                    onClick={() => onAddDeal?.(stage.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <div>Total: {formatCurrency(getStageTotal(stage.deals))}</div>
                  <div>Weighted: {formatCurrency(getStageWeightedTotal(stage.deals))}</div>
                </div>
              </div>

              {/* Deals */}
              <div className="min-h-96 p-4 space-y-3">
                <AnimatePresence>
                  {stage.deals.map((deal, index) => (
                    <motion.div
                      key={deal.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onDealClick?.(deal)}
                    >
                                {/* Deal Header */}
                                <div className="flex items-start justify-between">
                                  <h4 className="font-medium text-gray-900 text-sm leading-tight">
                                    {deal.title}
                                  </h4>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onEditDeal?.(deal)
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                  </button>
                                </div>

                                {/* Customer Info */}
                                <div className="mt-2">
                                  <p className="text-sm text-gray-600">{deal.customer.company}</p>
                                  <p className="text-xs text-gray-500">{deal.customer.name}</p>
                                </div>

                                {/* Deal Value */}
                                <div className="mt-3 flex items-center justify-between">
                                  <span className="text-lg font-semibold text-gray-900">
                                    {formatCurrency(deal.value)}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {deal.probability}%
                                  </span>
                                </div>

                                {/* AI Insights */}
                                {showAIInsights && (
                                  <div className="mt-3 space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <SparklesIcon className="h-4 w-4 text-purple-500" />
                                      <span className="text-xs text-gray-600">
                                        AI Win: {deal.aiWinProbability}%
                                      </span>
                                    </div>
                                    
                                    {deal.aiRiskFactors.length > 0 && (
                                      <div className="flex items-start space-x-2">
                                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5" />
                                        <div className="text-xs text-gray-600">
                                          {deal.aiRiskFactors[0]}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {deal.aiRecommendedActions.length > 0 && (
                                      <div className="flex items-start space-x-2">
                                        <CheckCircleIcon className="h-4 w-4 text-blue-500 mt-0.5" />
                                        <div className="text-xs text-gray-600">
                                          {deal.aiRecommendedActions[0]}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Timeline */}
                                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    <span>
                                      {deal.expectedCloseDate 
                                        ? formatDate(deal.expectedCloseDate)
                                        : 'No date set'
                                      }
                                    </span>
                                  </div>
                                  {deal.assignee && (
                                    <div className="flex items-center space-x-1">
                                      <UserIcon className="h-3 w-3" />
                                      <span>{deal.assignee.name.split(' ')[0]}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Last Activity */}
                                {deal.lastActivity && (
                                  <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                                    <span className="font-medium">{deal.lastActivity.type}</span>: {deal.lastActivity.description}
                                  </div>
                                )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}