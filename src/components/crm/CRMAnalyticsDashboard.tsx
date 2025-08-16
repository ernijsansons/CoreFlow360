/**
 * CoreFlow360 - CRM Analytics Dashboard
 * Real-time metrics and comprehensive business intelligence
 */

'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon,
  UsersIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  ClockIcon,
  SparklesIcon,
  CalendarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import { MetricCard } from '@/components/ui/MetricCard'

interface CRMMetrics {
  // Lead Metrics
  totalLeads: number
  newLeadsThisPeriod: number
  leadConversionRate: number
  avgLeadScore: number
  hotLeads: number
  
  // Customer Metrics
  totalCustomers: number
  activeCustomers: number
  customerGrowthRate: number
  avgCustomerValue: number
  customerChurnRate: number
  
  // Deal Metrics
  totalDeals: number
  activeDeals: number
  dealsClosedThisPeriod: number
  avgDealSize: number
  avgSalesCycle: number
  winRate: number
  
  // Revenue Metrics
  totalRevenue: number
  revenueThisPeriod: number
  revenueGrowthRate: number
  forecastAccuracy: number
  pipelineValue: number
  
  // Activity Metrics
  totalActivities: number
  activitiesThisPeriod: number
  avgResponseTime: number
  taskCompletionRate: number
}

interface PipelineStageMetrics {
  stageName: string
  dealCount: number
  totalValue: number
  avgDaysInStage: number
  conversionRate: number
  color: string
}

interface TopPerformer {
  id: string
  name: string
  avatar?: string
  dealsWon: number
  revenue: number
  conversionRate: number
  trend: 'up' | 'down' | 'stable'
}

interface LeaderboardItem {
  rank: number
  name: string
  value: number
  change: number
  metric: string
}

interface CRMAnalyticsDashboardProps {
  timeframe?: 'week' | 'month' | 'quarter' | 'year'
  onMetricClick?: (metric: string, data: any) => void
  onExportReport?: () => void
}

const CRMAnalyticsDashboard = memo(function CRMAnalyticsDashboard({ 
  timeframe = 'month',
  onMetricClick,
  onExportReport 
}: CRMAnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<CRMMetrics | null>(null)
  const [pipelineStages, setPipelineStages] = useState<PipelineStageMetrics[]>([])
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe)
  const [refreshTime, setRefreshTime] = useState(new Date())

  useEffect(() => {
    loadAnalyticsData()
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadAnalyticsData()
      setRefreshTime(new Date())
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [selectedTimeframe])

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Mock data for demonstration
      const mockMetrics: CRMMetrics = {
        totalLeads: 234,
        newLeadsThisPeriod: 47,
        leadConversionRate: 28.5,
        avgLeadScore: 72,
        hotLeads: 23,
        
        totalCustomers: 156,
        activeCustomers: 142,
        customerGrowthRate: 12.3,
        avgCustomerValue: 125000,
        customerChurnRate: 4.2,
        
        totalDeals: 89,
        activeDeals: 34,
        dealsClosedThisPeriod: 18,
        avgDealSize: 48500,
        avgSalesCycle: 45,
        winRate: 68.5,
        
        totalRevenue: 2850000,
        revenueThisPeriod: 875000,
        revenueGrowthRate: 15.2,
        forecastAccuracy: 87.5,
        pipelineValue: 1650000,
        
        totalActivities: 1247,
        activitiesThisPeriod: 312,
        avgResponseTime: 2.3,
        taskCompletionRate: 85.7
      }

      const mockPipelineStages: PipelineStageMetrics[] = [
        { stageName: 'Lead', dealCount: 15, totalValue: 450000, avgDaysInStage: 7, conversionRate: 45.2, color: '#6B7280' },
        { stageName: 'Qualified', dealCount: 12, totalValue: 520000, avgDaysInStage: 14, conversionRate: 58.3, color: '#3B82F6' },
        { stageName: 'Proposal', dealCount: 8, totalValue: 380000, avgDaysInStage: 21, conversionRate: 72.1, color: '#F59E0B' },
        { stageName: 'Negotiation', dealCount: 5, totalValue: 285000, avgDaysInStage: 14, conversionRate: 84.6, color: '#8B5CF6' },
        { stageName: 'Closed Won', dealCount: 18, totalValue: 875000, avgDaysInStage: 0, conversionRate: 100, color: '#10B981' }
      ]

      const mockTopPerformers: TopPerformer[] = [
        { 
          id: '1', 
          name: 'Alex Morgan', 
          dealsWon: 8, 
          revenue: 385000, 
          conversionRate: 72, 
          trend: 'up' 
        },
        { 
          id: '2', 
          name: 'Jordan Lee', 
          dealsWon: 6, 
          revenue: 290000, 
          conversionRate: 68, 
          trend: 'up' 
        },
        { 
          id: '3', 
          name: 'Sam Wilson', 
          dealsWon: 4, 
          revenue: 200000, 
          conversionRate: 65, 
          trend: 'stable' 
        }
      ]

      const mockLeaderboard: LeaderboardItem[] = [
        { rank: 1, name: 'Enterprise Segment', value: 1250000, change: 18.5, metric: 'Revenue' },
        { rank: 2, name: 'Mid-Market', value: 850000, change: 12.3, metric: 'Revenue' },
        { rank: 3, name: 'SMB', value: 450000, change: 8.7, metric: 'Revenue' },
        { rank: 1, name: 'Website', value: 89, change: 25.4, metric: 'Leads' },
        { rank: 2, name: 'Referral', value: 67, change: 15.2, metric: 'Leads' },
        { rank: 3, name: 'Events', value: 34, change: -5.3, metric: 'Leads' }
      ]

      setMetrics(mockMetrics)
      setPipelineStages(mockPipelineStages)
      setTopPerformers(mockTopPerformers)
      setLeaderboard(mockLeaderboard)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedTimeframe])

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }, [])

  const formatNumber = useCallback((num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }, [])

  const getTrendIcon = useCallback((trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDownIcon className="h-4 w-4 text-red-500" />
      default:
        return <ArrowPathIcon className="h-4 w-4 text-gray-500" />
    }
  }, [])

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
          <h1 className="text-2xl font-bold text-gray-900">CRM Analytics</h1>
          <p className="text-gray-600 mt-1">
            Real-time insights and performance metrics · Last updated: {refreshTime.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={onExportReport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
            Export Report
          </button>
          <button
            onClick={() => loadAnalyticsData()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <>
          {/* Revenue & Pipeline Metrics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              value={formatCurrency(metrics.totalRevenue)}
              label="Total Revenue"
              icon={CurrencyDollarIcon}
              gradient="emerald"
              trend={metrics.revenueGrowthRate}
              onClick={() => onMetricClick?.('revenue', metrics)}
            />
            <MetricCard
              value={formatCurrency(metrics.pipelineValue)}
              label="Pipeline Value"
              icon={FunnelIcon}
              gradient="blue"
              trend={8.3}
              onClick={() => onMetricClick?.('pipeline', metrics)}
            />
            <MetricCard
              value={formatCurrency(metrics.avgDealSize)}
              label="Avg Deal Size"
              icon={ChartBarIcon}
              gradient="violet"
              trend={5.7}
              onClick={() => onMetricClick?.('dealsize', metrics)}
            />
            <MetricCard
              value={`${metrics.winRate}%`}
              label="Win Rate"
              icon={CheckCircleIcon}
              gradient="orange"
              trend={2.1}
              onClick={() => onMetricClick?.('winrate', metrics)}
            />
          </div>

          {/* Customer & Lead Metrics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              value={metrics.totalCustomers.toString()}
              label="Total Customers"
              icon={UsersIcon}
              gradient="blue"
              trend={metrics.customerGrowthRate}
              onClick={() => onMetricClick?.('customers', metrics)}
            />
            <MetricCard
              value={metrics.totalLeads.toString()}
              label="Total Leads"
              icon={TrendingUpIcon}
              gradient="emerald"
              trend={15.4}
              onClick={() => onMetricClick?.('leads', metrics)}
            />
            <MetricCard
              value={`${metrics.leadConversionRate}%`}
              label="Lead Conversion"
              icon={ArrowPathIcon}
              gradient="violet"
              trend={3.2}
              onClick={() => onMetricClick?.('conversion', metrics)}
            />
            <MetricCard
              value={`${metrics.avgSalesCycle}d`}
              label="Avg Sales Cycle"
              icon={ClockIcon}
              gradient="orange"
              trend={-2.8}
              onClick={() => onMetricClick?.('salescycle', metrics)}
            />
          </div>
        </>
      )}

      {/* Pipeline Analysis & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Stages */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Pipeline Analysis</h3>
            <button
              onClick={() => onMetricClick?.('pipeline-detail', pipelineStages)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View Details
            </button>
          </div>
          <div className="space-y-4">
            {pipelineStages.map((stage, index) => (
              <motion.div
                key={stage.stageName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{stage.stageName}</p>
                    <p className="text-sm text-gray-500">
                      {stage.dealCount} deals · {formatCurrency(stage.totalValue)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{stage.conversionRate}%</p>
                  <p className="text-sm text-gray-500">{stage.avgDaysInStage}d avg</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Top Performers</h3>
            <button
              onClick={() => onMetricClick?.('performers', topPerformers)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <motion.div
                key={performer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {performer.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{performer.name}</p>
                    <p className="text-sm text-gray-500">
                      {performer.dealsWon} deals won
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {formatCurrency(performer.revenue)}
                    </span>
                    {getTrendIcon(performer.trend)}
                  </div>
                  <p className="text-sm text-gray-500">{performer.conversionRate}% conversion</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboards & Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Leaderboard */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Leaders</h3>
          <div className="space-y-3">
            {leaderboard.filter(item => item.metric === 'Revenue').map((item, index) => (
              <div key={`revenue-${index}`} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">{item.rank}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(item.value)}</p>
                  <p className={`text-xs ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Sources</h3>
          <div className="space-y-3">
            {leaderboard.filter(item => item.metric === 'Leads').map((item, index) => (
              <div key={`leads-${index}`} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-green-600">{item.rank}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{item.value}</p>
                  <p className={`text-xs ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Summary */}
        {metrics && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Activities</span>
                <span className="font-medium text-gray-900">{formatNumber(metrics.totalActivities)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Period</span>
                <span className="font-medium text-gray-900">{formatNumber(metrics.activitiesThisPeriod)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="font-medium text-green-600">{metrics.taskCompletionRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Response Time</span>
                <span className="font-medium text-gray-900">{metrics.avgResponseTime}h</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Forecast Accuracy</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-purple-600">{metrics.forecastAccuracy}%</span>
                    <SparklesIcon className="h-4 w-4 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Insights Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <SparklesIcon className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-medium text-purple-900">AI-Generated Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUpIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Growth Opportunity</span>
            </div>
            <p className="text-sm text-purple-800">
              Enterprise segment showing 18.5% growth. Consider increasing sales resources for Q4.
            </p>
          </div>
          <div className="bg-white/60 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Risk Alert</span>
            </div>
            <p className="text-sm text-purple-800">
              Average sales cycle increased by 3 days. Review qualification process for efficiency.
            </p>
          </div>
          <div className="bg-white/60 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircleIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Performance Win</span>
            </div>
            <p className="text-sm text-purple-800">
              Lead conversion rate up 3.2%. Website optimization efforts are paying off.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
})

export default CRMAnalyticsDashboard