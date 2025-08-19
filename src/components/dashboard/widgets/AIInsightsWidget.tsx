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
    await new Promise((resolve) => setTimeout(resolve, 1000))

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
            onClick: () => console.log('View details'),
          },
        },
        {
          id: '2',
          type: 'alert',
          title: 'Performance Anomaly Detected',
          description: 'API response times increased 40% in the last hour',
          impact: 'high',
          action: {
            label: 'Investigate',
            onClick: () => console.log('View details'),
          },
        },
        {
          id: '3',
          type: 'prediction',
          title: 'Churn Risk Alert',
          description: '2 enterprise tenants show early churn indicators',
          impact: 'medium',
          module: 'analytics',
        },
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
            onClick: () => console.log('View details'),
          },
          module: 'crm',
        },
        {
          id: '2',
          type: 'opportunity',
          title: 'Cost Reduction Opportunity',
          description: 'Consolidate 3 unused software licenses to save $2,400/month',
          impact: 'medium',
          module: 'accounting',
        },
        {
          id: '3',
          type: 'alert',
          title: 'Team Productivity Insight',
          description: 'Sales team efficiency up 18% after recent training',
          impact: 'low',
        },
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
            onClick: () => console.log('View details'),
          },
        },
        {
          id: '2',
          type: 'prediction',
          title: 'Project Completion Risk',
          description: 'Project Alpha has 70% chance of delay without intervention',
          impact: 'high',
          module: 'projects',
        },
      ],
      [UserRole.TEAM_LEAD]: [
        {
          id: '1',
          type: 'recommendation',
          title: 'Task Prioritization',
          description: "Reorder 3 tasks to meet this week's deadline",
          impact: 'medium',
          action: {
            label: 'View Tasks',
            onClick: () => console.log('View details'),
          },
        },
        {
          id: '2',
          type: 'opportunity',
          title: 'Skill Development',
          description: 'Team member ready for advanced training based on performance',
          impact: 'low',
        },
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
            onClick: () => console.log('View details'),
          },
        },
        {
          id: '2',
          type: 'alert',
          title: 'Task Due Soon',
          description: 'Customer proposal due in 2 hours',
          impact: 'high',
        },
      ],
      [UserRole.GUEST]: [
        {
          id: '1',
          type: 'recommendation',
          title: 'Explore Features',
          description: 'Discover how AI can transform your workflow',
          impact: 'low',
        },
      ],
    }

    return baseInsights[role] || []
  }

  const getIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'recommendation':
        return Lightbulb
      case 'alert':
        return AlertCircle
      case 'prediction':
        return TrendingUp
      case 'opportunity':
        return Sparkles
    }
  }

  const getImpactColor = (impact: AIInsight['impact']) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  const containerClass =
    layout === 'list'
      ? 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'
      : 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full'

  return (
    <div className={containerClass}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="flex animate-pulse items-center space-x-2">
            <Brain className="h-6 w-6 animate-pulse text-purple-400" />
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
                className={`rounded-lg border p-3 ${impactClass} cursor-pointer transition-shadow hover:shadow-md`}
                onClick={() => setSelectedInsight(insight)}
              >
                <div className="flex items-start space-x-3">
                  <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium">{insight.title}</h4>
                    <p className="mt-1 text-xs opacity-80">{insight.description}</p>
                    {insight.module && (
                      <span className="bg-opacity-50 mt-2 inline-block rounded-full bg-white px-2 py-1 text-xs">
                        {insight.module}
                      </span>
                    )}
                  </div>
                  {insight.action && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Insight detail modal */}
      {selectedInsight && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="m-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {(() => {
                  const Icon = getIcon(selectedInsight.type)
                  return <Icon className="h-6 w-6 text-purple-600" />
                })()}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedInsight.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInsight(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-gray-600 dark:text-gray-300">{selectedInsight.description}</p>

            <div className="flex items-center justify-between">
              <span
                className={`rounded-full px-3 py-1 text-sm ${getImpactColor(selectedInsight.impact)}`}
              >
                {selectedInsight.impact} impact
              </span>

              {selectedInsight.action && (
                <button
                  onClick={() => {
                    selectedInsight.action!.onClick()
                    setSelectedInsight(null)
                  }}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
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
