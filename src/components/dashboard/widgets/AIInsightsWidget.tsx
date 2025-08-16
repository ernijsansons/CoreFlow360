/**
 * CoreFlow360 - AI Insights Widget
 * Displays role-specific AI-powered insights and recommendations
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, TrendingUp, AlertCircle, Lightbulb, X, ChevronRight, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types/auth'

interface AIInsight {
  id: string
  type: 'recommendation' | 'alert' | 'prediction' | 'opportunity'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  action?: {
    label: string
    onClick: () => void
  }
  module?: string
}

interface AIInsightsWidgetProps {
  onRemove: () => void
  layout: 'grid' | 'list' | 'kanban'
}

export function AIInsightsWidget({ onRemove, layout }: AIInsightsWidgetProps) {
  const { user } = useAuth()
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)

  useEffect(() => {
    loadInsights()
  }, [user?.role])

  const loadInsights = async () => {
    setLoading(true)
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const roleInsights = getInsightsByRole(user?.role || UserRole.USER)
    setInsights(roleInsights)
    setLoading(false)
  }

  const getInsightsByRole = (role: UserRole): AIInsight[] => {
    const baseInsights: Record<UserRole, AIInsight[]> = {
      [UserRole.SUPER_ADMIN]: [
        {
          id: '1',
          type: 'opportunity',
          title: 'Revenue Growth Opportunity',
          description: '3 tenants showing 85% likelihood to upgrade based on usage patterns',
          impact: 'high',
          action: {
            label: 'View Details',
            onClick: () => console.log('View tenant upgrade opportunities')
          }
        },
        {
          id: '2',
          type: 'alert',
          title: 'Performance Anomaly Detected',
          description: 'API response times increased 40% in the last hour',
          impact: 'high',
          action: {
            label: 'Investigate',
            onClick: () => console.log('Open performance dashboard')
          }
        },
        {
          id: '3',
          type: 'prediction',
          title: 'Churn Risk Alert',
          description: '2 enterprise tenants show early churn indicators',
          impact: 'medium',
          module: 'analytics'
        }
      ],
      [UserRole.ORG_ADMIN]: [
        {
          id: '1',
          type: 'recommendation',
          title: 'Optimize Sales Process',
          description: 'Enable AI follow-ups to increase conversion by predicted 23%',
          impact: 'high',
          action: {
            label: 'Enable Now',
            onClick: () => console.log('Enable AI follow-ups')
          },
          module: 'crm'
        },
        {
          id: '2',
          type: 'opportunity',
          title: 'Cost Reduction Opportunity',
          description: 'Consolidate 3 unused software licenses to save $2,400/month',
          impact: 'medium',
          module: 'accounting'
        },
        {
          id: '3',
          type: 'alert',
          title: 'Team Productivity Insight',
          description: 'Sales team efficiency up 18% after recent training',
          impact: 'low'
        }
      ],
      [UserRole.DEPARTMENT_MANAGER]: [
        {
          id: '1',
          type: 'recommendation',
          title: 'Workload Balancing Needed',
          description: '2 team members at 120% capacity while 3 are at 60%',
          impact: 'high',
          action: {
            label: 'Redistribute',
            onClick: () => console.log('Open workload manager')
          }
        },
        {
          id: '2',
          type: 'prediction',
          title: 'Project Completion Risk',
          description: 'Project Alpha has 70% chance of delay without intervention',
          impact: 'high',
          module: 'projects'
        }
      ],
      [UserRole.TEAM_LEAD]: [
        {
          id: '1',
          type: 'recommendation',
          title: 'Task Prioritization',
          description: 'Reorder 3 tasks to meet this week\'s deadline',
          impact: 'medium',
          action: {
            label: 'View Tasks',
            onClick: () => console.log('Open task manager')
          }
        },
        {
          id: '2',
          type: 'opportunity',
          title: 'Skill Development',
          description: 'Team member ready for advanced training based on performance',
          impact: 'low'
        }
      ],
      [UserRole.USER]: [
        {
          id: '1',
          type: 'recommendation',
          title: 'Focus Time Suggestion',
          description: 'Block 2-4 PM today for deep work based on your productivity patterns',
          impact: 'medium',
          action: {
            label: 'Block Calendar',
            onClick: () => console.log('Block calendar time')
          }
        },
        {
          id: '2',
          type: 'alert',
          title: 'Task Due Soon',
          description: 'Customer proposal due in 2 hours',
          impact: 'high'
        }
      ],
      [UserRole.GUEST]: [
        {
          id: '1',
          type: 'recommendation',
          title: 'Explore Features',
          description: 'Discover how AI can transform your workflow',
          impact: 'low'
        }
      ]
    }

    return baseInsights[role] || []
  }

  const getIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'recommendation': return Lightbulb
      case 'alert': return AlertCircle
      case 'prediction': return TrendingUp
      case 'opportunity': return Sparkles
    }
  }

  const getImpactColor = (impact: AIInsight['impact']) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  const containerClass = layout === 'list' 
    ? 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'
    : 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full'

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Insights
          </h3>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-pulse flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
            <span className="text-gray-500">Analyzing data...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => {
            const Icon = getIcon(insight.type)
            const impactClass = getImpactColor(insight.impact)
            
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border ${impactClass} cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => setSelectedInsight(insight)}
              >
                <div className="flex items-start space-x-3">
                  <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-xs mt-1 opacity-80">{insight.description}</p>
                    {insight.module && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-white bg-opacity-50">
                        {insight.module}
                      </span>
                    )}
                  </div>
                  {insight.action && (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Insight detail modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full m-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {(() => {
                  const Icon = getIcon(selectedInsight.type)
                  return <Icon className="w-6 h-6 text-purple-600" />
                })()}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedInsight.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInsight(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {selectedInsight.description}
            </p>
            
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm ${getImpactColor(selectedInsight.impact)}`}>
                {selectedInsight.impact} impact
              </span>
              
              {selectedInsight.action && (
                <button
                  onClick={() => {
                    selectedInsight.action!.onClick()
                    setSelectedInsight(null)
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {selectedInsight.action.label}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}