/**
 * CoreFlow360 - Intelligent Dashboard Widgets
 * AI-powered, customizable widgets with real-time data and role-based insights
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Eye,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  Settings,
  RefreshCw,
  Filter,
} from 'lucide-react'
import { UserRole } from '@/components/onboarding/WelcomeRoleSelection'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

export interface WidgetConfig {
  id: string
  title: string
  type: 'metric' | 'chart' | 'list' | 'ai_insights' | 'activity' | 'goal_tracker'
  size: 'small' | 'medium' | 'large' | 'wide'
  position: { x: number; y: number }
  roleAccess: UserRole[]
  aiEnabled: boolean
  refreshInterval: number // in seconds
  category: 'sales' | 'finance' | 'operations' | 'hr' | 'analytics' | 'ai'
}

interface MetricData {
  value: number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  target?: number
  unit: string
  trend: number[]
}

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color: string
    gradient?: string
  }[]
}

interface AIInsight {
  id: string
  type: 'opportunity' | 'warning' | 'recommendation' | 'prediction'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  actionable: boolean
  action?: string
}

interface IntelligentDashboardWidgetsProps {
  userRole: UserRole
  companyIndustry: string
  selectedModules: string[]
  onWidgetInteraction?: (widgetId: string, action: string) => void
}

const defaultWidgets: WidgetConfig[] = [
  {
    id: 'revenue-metric',
    title: 'Monthly Revenue',
    type: 'metric',
    size: 'small',
    position: { x: 0, y: 0 },
    roleAccess: ['admin', 'manager'],
    aiEnabled: true,
    refreshInterval: 300,
    category: 'finance',
  },
  {
    id: 'customers-metric',
    title: 'Active Customers',
    type: 'metric',
    size: 'small',
    position: { x: 1, y: 0 },
    roleAccess: ['admin', 'manager', 'user'],
    aiEnabled: true,
    refreshInterval: 600,
    category: 'sales',
  },
  {
    id: 'sales-chart',
    title: 'Sales Trends',
    type: 'chart',
    size: 'medium',
    position: { x: 0, y: 1 },
    roleAccess: ['admin', 'manager'],
    aiEnabled: true,
    refreshInterval: 900,
    category: 'sales',
  },
  {
    id: 'ai-insights',
    title: 'AI Insights',
    type: 'ai_insights',
    size: 'large',
    position: { x: 2, y: 0 },
    roleAccess: ['admin', 'manager'],
    aiEnabled: true,
    refreshInterval: 1800,
    category: 'ai',
  },
  {
    id: 'recent-activity',
    title: 'Recent Activity',
    type: 'activity',
    size: 'medium',
    position: { x: 1, y: 1 },
    roleAccess: ['admin', 'manager', 'user'],
    aiEnabled: false,
    refreshInterval: 60,
    category: 'operations',
  },
  {
    id: 'goal-tracker',
    title: 'Monthly Goals',
    type: 'goal_tracker',
    size: 'wide',
    position: { x: 0, y: 2 },
    roleAccess: ['admin', 'manager'],
    aiEnabled: true,
    refreshInterval: 3600,
    category: 'analytics',
  },
]

const mockMetricData: Record<string, MetricData> = {
  'revenue-metric': {
    value: 127450,
    change: 12.5,
    changeType: 'increase',
    target: 150000,
    unit: '$',
    trend: [95000, 108000, 115000, 120000, 127450],
  },
  'customers-metric': {
    value: 1247,
    change: -3.2,
    changeType: 'decrease',
    target: 1500,
    unit: '',
    trend: [1180, 1220, 1290, 1285, 1247],
  },
}

const mockChartData: Record<string, ChartData> = {
  'sales-chart': {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Sales',
        data: [95000, 108000, 115000, 120000, 127450],
        color: 'rgba(139, 92, 246, 1)',
        gradient: 'from-violet-500 to-purple-600',
      },
      {
        label: 'Target',
        data: [100000, 110000, 120000, 130000, 140000],
        color: 'rgba(34, 197, 94, 0.6)',
        gradient: 'from-emerald-500 to-green-600',
      },
    ],
  },
}

const mockAIInsights: AIInsight[] = [
  {
    id: 'opp-1',
    type: 'opportunity',
    title: 'High-Value Lead Identified',
    description:
      'AI detected a potential enterprise client based on recent engagement patterns. 85% likelihood of conversion.',
    confidence: 85,
    impact: 'high',
    actionable: true,
    action: 'Schedule demo call',
  },
  {
    id: 'warn-1',
    type: 'warning',
    title: 'Customer Churn Risk',
    description:
      '3 customers showing early churn indicators. Engagement dropped 40% in the past 2 weeks.',
    confidence: 92,
    impact: 'medium',
    actionable: true,
    action: 'Run retention campaign',
  },
  {
    id: 'rec-1',
    type: 'recommendation',
    title: 'Optimize Sales Process',
    description:
      'AI suggests updating your follow-up sequence. Similar companies see 23% higher conversion rates.',
    confidence: 78,
    impact: 'medium',
    actionable: true,
    action: 'Review automation',
  },
]

const mockActivities = [
  {
    id: 1,
    type: 'sale',
    description: 'New deal created: Acme Corp - $25,000',
    time: '2 minutes ago',
    user: 'Sarah Johnson',
  },
  {
    id: 2,
    type: 'customer',
    description: 'Customer support ticket resolved',
    time: '15 minutes ago',
    user: 'Mike Chen',
  },
  {
    id: 3,
    type: 'project',
    description: 'Project milestone completed',
    time: '1 hour ago',
    user: 'Alex Rivera',
  },
  {
    id: 4,
    type: 'ai',
    description: 'AI generated sales forecast',
    time: '2 hours ago',
    user: 'System',
  },
]

const mockGoals = [
  { id: 1, title: 'Monthly Revenue', current: 127450, target: 150000, unit: '$', color: 'violet' },
  { id: 2, title: 'New Customers', current: 47, target: 60, unit: '', color: 'emerald' },
  { id: 3, title: 'Projects Completed', current: 23, target: 25, unit: '', color: 'cyan' },
  { id: 4, title: 'Customer Satisfaction', current: 4.7, target: 4.8, unit: '/5', color: 'yellow' },
]

export function IntelligentDashboardWidgets({
  userRole,
  companyIndustry,
  selectedModules,
  onWidgetInteraction,
}: IntelligentDashboardWidgetsProps) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([])
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null)
  const [refreshingWidget, setRefreshingWidget] = useState<string | null>(null)
  const { trackFeatureUsage } = useTrackEvent()

  // Filter widgets based on user role and selected modules
  const availableWidgets = useMemo(() => {
    return defaultWidgets.filter((widget) => {
      const hasRoleAccess = widget.roleAccess.includes(userRole)
      const hasModuleAccess = selectedModules.some(
        (module) =>
          (widget.category === 'sales' && module === 'crm') ||
          (widget.category === 'finance' && module === 'accounting') ||
          (widget.category === 'operations' && module === 'project') ||
          (widget.category === 'hr' && module === 'hr') ||
          (widget.category === 'analytics' && module === 'analytics') ||
          widget.category === 'ai'
      )
      return hasRoleAccess && (hasModuleAccess || widget.category === 'ai')
    })
  }, [userRole, selectedModules])

  useEffect(() => {
    setWidgets(availableWidgets)
  }, [availableWidgets])

  const handleWidgetAction = (widgetId: string, action: string) => {
    trackFeatureUsage('dashboard_widget_interaction', widgetId)
    if (onWidgetInteraction) {
      onWidgetInteraction(widgetId, action)
    }

    if (action === 'refresh') {
      setRefreshingWidget(widgetId)
      setTimeout(() => setRefreshingWidget(null), 2000)
    }
  }

  const getWidgetSize = (size: string) => {
    switch (size) {
      case 'small':
        return 'col-span-1 row-span-1'
      case 'medium':
        return 'col-span-2 row-span-2'
      case 'large':
        return 'col-span-2 row-span-3'
      case 'wide':
        return 'col-span-4 row-span-1'
      default:
        return 'col-span-1 row-span-1'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-6">
      {/* Dashboard Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">
              Welcome back, {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </h1>
            <p className="text-gray-400">
              Here's what's happening with your {companyIndustry} business today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleWidgetAction('dashboard', 'customize')}
              className="rounded-lg border border-gray-700 bg-gray-800 p-2 transition-colors hover:border-gray-600"
            >
              <Settings className="h-5 w-5 text-gray-400" />
            </button>
            <button
              onClick={() => handleWidgetAction('dashboard', 'filter')}
              className="rounded-lg border border-gray-700 bg-gray-800 p-2 transition-colors hover:border-gray-600"
            >
              <Filter className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Widget Grid */}
      <div className="grid auto-rows-min grid-cols-4 gap-6">
        {widgets.map((widget, index) => (
          <motion.div
            key={widget.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`${getWidgetSize(widget.size)} relative`}
          >
            <WidgetContainer
              widget={widget}
              isExpanded={expandedWidget === widget.id}
              isRefreshing={refreshingWidget === widget.id}
              onExpand={() => setExpandedWidget(expandedWidget === widget.id ? null : widget.id)}
              onAction={(action) => handleWidgetAction(widget.id, action)}
            />
          </motion.div>
        ))}
      </div>

      {/* AI Recommendations Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-900/20 to-cyan-900/20 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 p-3">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-xl font-bold text-white">AI-Powered Recommendations</h3>
            <p className="mb-4 text-gray-300">
              Based on your recent activity and industry trends, here are personalized suggestions
              to boost your performance.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockAIInsights.slice(0, 3).map((insight) => (
                <div key={insight.id} className="rounded-lg bg-gray-800/50 p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        insight.type === 'opportunity'
                          ? 'bg-emerald-500/20'
                          : insight.type === 'warning'
                            ? 'bg-red-500/20'
                            : 'bg-blue-500/20'
                      }`}
                    >
                      {insight.type === 'opportunity' ? (
                        <TrendingUp
                          className={`h-4 w-4 ${
                            insight.type === 'opportunity'
                              ? 'text-emerald-400'
                              : insight.type === 'warning'
                                ? 'text-red-400'
                                : 'text-blue-400'
                          }`}
                        />
                      ) : insight.type === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                      ) : (
                        <Zap className="h-4 w-4 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1 text-sm font-semibold text-white">{insight.title}</h4>
                      <p className="mb-2 text-xs text-gray-400">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {insight.confidence}% confidence
                        </span>
                        {insight.actionable && (
                          <button className="text-xs text-violet-400 hover:text-violet-300">
                            {insight.action}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

interface WidgetContainerProps {
  widget: WidgetConfig
  isExpanded: boolean
  isRefreshing: boolean
  onExpand: () => void
  onAction: (action: string) => void
}

function WidgetContainer({
  widget,
  isExpanded,
  isRefreshing,
  onExpand,
  onAction,
}: WidgetContainerProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-800/50 bg-gray-900/60 p-6 backdrop-blur-sm">
      {/* Widget Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-white">{widget.title}</h3>
          {widget.aiEnabled && (
            <div className="rounded bg-violet-500/20 p-1">
              <Brain className="h-3 w-3 text-violet-400" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAction('refresh')}
            className="p-1 text-gray-400 transition-colors hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onExpand}
            className="p-1 text-gray-400 transition-colors hover:text-white"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onAction('options')}
            className="p-1 text-gray-400 transition-colors hover:text-white"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Widget Content */}
      <div className="flex-1">
        {widget.type === 'metric' && <MetricWidget widget={widget} />}
        {widget.type === 'chart' && <ChartWidget widget={widget} />}
        {widget.type === 'ai_insights' && <AIInsightsWidget />}
        {widget.type === 'activity' && <ActivityWidget />}
        {widget.type === 'goal_tracker' && <GoalTrackerWidget />}
      </div>
    </div>
  )
}

function MetricWidget({ widget }: { widget: WidgetConfig }) {
  const data = mockMetricData[widget.id]
  if (!data) return <div className="text-gray-400">No data available</div>

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-white">
          {data.unit}
          {data.value.toLocaleString()}
        </span>
        <div
          className={`flex items-center gap-1 rounded px-2 py-1 text-sm ${
            data.changeType === 'increase'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {data.changeType === 'increase' ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {Math.abs(data.change)}%
        </div>
      </div>

      {data.target && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">
              Target: {data.unit}
              {data.target.toLocaleString()}
            </span>
            <span className="text-gray-400">{((data.value / data.target) * 100).toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-800">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${Math.min((data.value / data.target) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Mini Chart */}
      <div className="flex h-8 items-end gap-1">
        {data.trend.map((value, index) => (
          <div
            key={index}
            className="flex-1 rounded-sm bg-violet-500/40"
            style={{
              height: `${(value / Math.max(...data.trend)) * 100}%`,
              minHeight: '2px',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function ChartWidget({ widget }: { widget: WidgetConfig }) {
  const data = mockChartData[widget.id]
  if (!data) return <div className="text-gray-400">No data available</div>

  return (
    <div className="space-y-4">
      <div className="flex h-32 items-end gap-2">
        {data.labels.map((label, index) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-col gap-1">
              {data.datasets.map((dataset, dsIndex) => (
                <div
                  key={dsIndex}
                  className={`w-full bg-gradient-to-t ${
                    dsIndex === 0
                      ? 'from-violet-500/60 to-violet-400'
                      : 'from-emerald-500/40 to-emerald-400/60'
                  } rounded-sm`}
                  style={{
                    height: `${(dataset.data[index] / Math.max(...dataset.data)) * 100}px`,
                    minHeight: '2px',
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-4 text-sm">
        {data.datasets.map((dataset, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded ${index === 0 ? 'bg-violet-500' : 'bg-emerald-500'}`}
            />
            <span className="text-gray-300">{dataset.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AIInsightsWidget() {
  return (
    <div className="space-y-3">
      {mockAIInsights.map((insight) => (
        <div key={insight.id} className="rounded-lg bg-gray-800/50 p-3">
          <div className="flex items-start gap-3">
            <div
              className={`rounded p-1 ${
                insight.type === 'opportunity'
                  ? 'bg-emerald-500/20'
                  : insight.type === 'warning'
                    ? 'bg-red-500/20'
                    : 'bg-blue-500/20'
              }`}
            >
              {insight.type === 'opportunity' ? (
                <TrendingUp className="h-3 w-3 text-emerald-400" />
              ) : insight.type === 'warning' ? (
                <AlertTriangle className="h-3 w-3 text-red-400" />
              ) : (
                <Zap className="h-3 w-3 text-blue-400" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="mb-1 text-sm font-medium text-white">{insight.title}</h4>
              <p className="mb-2 text-xs text-gray-400">{insight.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{insight.confidence}% confident</span>
                {insight.actionable && (
                  <button className="text-xs text-violet-400 hover:text-violet-300">
                    {insight.action}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ActivityWidget() {
  return (
    <div className="space-y-3">
      {mockActivities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 p-2">
          <div
            className={`rounded-full p-1 ${
              activity.type === 'sale'
                ? 'bg-emerald-500/20'
                : activity.type === 'customer'
                  ? 'bg-blue-500/20'
                  : activity.type === 'project'
                    ? 'bg-violet-500/20'
                    : 'bg-cyan-500/20'
            }`}
          >
            {activity.type === 'sale' ? (
              <DollarSign className="h-3 w-3 text-emerald-400" />
            ) : activity.type === 'customer' ? (
              <Users className="h-3 w-3 text-blue-400" />
            ) : activity.type === 'project' ? (
              <Target className="h-3 w-3 text-violet-400" />
            ) : (
              <Brain className="h-3 w-3 text-cyan-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="mb-1 text-sm text-white">{activity.description}</p>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{activity.user}</span>
              <span>{activity.time}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function GoalTrackerWidget() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {mockGoals.map((goal) => (
        <div key={goal.id} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-white">{goal.title}</span>
            <span className="text-gray-400">
              {goal.current.toLocaleString()}
              {goal.unit} / {goal.target.toLocaleString()}
              {goal.unit}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-800">
            <div
              className={`h-2 rounded-full bg-gradient-to-r transition-all duration-500 ${
                goal.color === 'violet'
                  ? 'from-violet-500 to-purple-600'
                  : goal.color === 'emerald'
                    ? 'from-emerald-500 to-green-600'
                    : goal.color === 'cyan'
                      ? 'from-cyan-500 to-blue-600'
                      : 'from-yellow-500 to-orange-600'
              }`}
              style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
