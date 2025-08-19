'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  Download,
  Star,
  Calendar,
  BarChart3,
  Users,
  Award,
  Clock,
  ArrowUp,
  ArrowDown,
  Eye,
  CheckCircle,
  AlertCircle,
  Package,
} from 'lucide-react'

interface DeveloperMetrics {
  totalRevenue: number
  monthlyRevenue: number
  totalDownloads: number
  monthlyDownloads: number
  averageRating: number
  totalAgents: number
  pendingPayout: number
  nextPayoutDate: string
  revenueGrowth: number
  downloadGrowth: number
}

interface AgentPerformance {
  id: string
  name: string
  downloads: number
  revenue: number
  rating: number
  reviews: number
  category: string
  monthlyGrowth: number
  status: 'published' | 'pending' | 'rejected'
}

interface RevenueChartData {
  date: string
  revenue: number
  downloads: number
}

interface Payout {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'completed'
  date: string
  period: string
  transactionCount: number
}

export default function DeveloperDashboard() {
  const [metrics, setMetrics] = useState<DeveloperMetrics | null>(null)
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([])
  const [revenueData, setRevenueData] = useState<RevenueChartData[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [loading, setLoading] = useState(true)

  // Mock data - in production this would come from API
  const mockMetrics: DeveloperMetrics = {
    totalRevenue: 147250,
    monthlyRevenue: 23400,
    totalDownloads: 4567,
    monthlyDownloads: 892,
    averageRating: 4.7,
    totalAgents: 3,
    pendingPayout: 16380,
    nextPayoutDate: '2024-02-15',
    revenueGrowth: 34.5,
    downloadGrowth: 28.2,
  }

  const mockAgentPerformance: AgentPerformance[] = [
    {
      id: 'lead-intelligence-pro',
      name: 'Lead Intelligence Pro',
      downloads: 1456,
      revenue: 89420,
      rating: 4.8,
      reviews: 247,
      category: 'Sales & CRM',
      monthlyGrowth: 45.2,
      status: 'published',
    },
    {
      id: 'customer-sentiment-radar',
      name: 'Customer Sentiment Radar',
      downloads: 1089,
      revenue: 42680,
      rating: 4.7,
      reviews: 156,
      category: 'Sales & CRM',
      monthlyGrowth: 23.8,
      status: 'published',
    },
    {
      id: 'process-optimizer-beta',
      name: 'Process Optimizer (Beta)',
      downloads: 234,
      revenue: 15150,
      rating: 4.5,
      reviews: 28,
      category: 'Operations',
      monthlyGrowth: 156.7,
      status: 'pending',
    },
  ]

  const mockRevenueData: RevenueChartData[] = [
    { date: '2024-01-01', revenue: 18500, downloads: 145 },
    { date: '2024-01-08', revenue: 21200, downloads: 167 },
    { date: '2024-01-15', revenue: 19800, downloads: 156 },
    { date: '2024-01-22', revenue: 24600, downloads: 189 },
    { date: '2024-01-29', revenue: 27300, downloads: 203 },
  ]

  const mockPayouts: Payout[] = [
    {
      id: 'payout_001',
      amount: 16380,
      status: 'pending',
      date: '2024-02-15',
      period: 'Jan 2024',
      transactionCount: 89,
    },
    {
      id: 'payout_002',
      amount: 14250,
      status: 'completed',
      date: '2024-01-15',
      period: 'Dec 2023',
      transactionCount: 76,
    },
    {
      id: 'payout_003',
      amount: 11890,
      status: 'completed',
      date: '2023-12-15',
      period: 'Nov 2023',
      transactionCount: 63,
    },
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMetrics(mockMetrics)
      setAgentPerformance(mockAgentPerformance)
      setRevenueData(mockRevenueData)
      setPayouts(mockPayouts)
      setLoading(false)
    }, 1000)
  }, [])

  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-400' : 'text-red-400'
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? ArrowUp : ArrowDown
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-white">Developer Dashboard</h1>
              <p className="text-gray-400">Track your AI agent performance and earnings</p>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as unknown)}
                className="rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-2 text-white focus:border-violet-500 focus:outline-none"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="mb-12 grid grid-cols-2 gap-6 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <DollarSign className="h-8 w-8 text-emerald-500" />
              <div className="flex items-center text-sm">
                {metrics && (
                  <>
                    {getGrowthIcon(metrics.revenueGrowth)({
                      className: `w-4 h-4 mr-1 ${getGrowthColor(metrics.revenueGrowth)}`,
                    })}
                    <span className={getGrowthColor(metrics.revenueGrowth)}>
                      {Math.abs(metrics.revenueGrowth).toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="mb-1 text-2xl font-bold text-white">
              {metrics && formatCurrency(metrics.totalRevenue)}
            </div>
            <div className="text-sm text-gray-400">Total Revenue</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <Download className="h-8 w-8 text-blue-500" />
              <div className="flex items-center text-sm">
                {metrics && (
                  <>
                    {getGrowthIcon(metrics.downloadGrowth)({
                      className: `w-4 h-4 mr-1 ${getGrowthColor(metrics.downloadGrowth)}`,
                    })}
                    <span className={getGrowthColor(metrics.downloadGrowth)}>
                      {Math.abs(metrics.downloadGrowth).toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="mb-1 text-2xl font-bold text-white">
              {metrics?.totalDownloads.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Downloads</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mb-1 text-2xl font-bold text-white">
              {metrics?.averageRating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Average Rating</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <Package className="h-8 w-8 text-violet-500" />
            </div>
            <div className="mb-1 text-2xl font-bold text-white">{metrics?.totalAgents}</div>
            <div className="text-sm text-gray-400">Published Agents</div>
          </motion.div>
        </div>

        {/* Revenue Chart */}
        <div className="mb-12 rounded-2xl border border-gray-700/50 bg-gray-800/40 p-8 backdrop-blur-sm">
          <h3 className="mb-6 text-xl font-semibold text-white">Revenue Trend</h3>
          <div className="flex h-64 items-end justify-between space-x-2">
            {revenueData.map((data, index) => {
              const maxRevenue = Math.max(...revenueData.map((d) => d.revenue))
              const height = (data.revenue / maxRevenue) * 100

              return (
                <motion.div
                  key={data.date}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group relative min-h-[20px] flex-1 rounded-t-lg bg-gradient-to-t from-violet-600 to-cyan-500"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform rounded bg-gray-900 px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100">
                    ${(data.revenue / 100).toLocaleString()}
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 transform text-xs text-gray-400">
                    {new Date(data.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="mb-12 grid gap-8 lg:grid-cols-2">
          {/* Agent Performance */}
          <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-8 backdrop-blur-sm">
            <h3 className="mb-6 text-xl font-semibold text-white">Agent Performance</h3>
            <div className="space-y-4">
              {agentPerformance.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-xl bg-gray-900/40 p-4"
                >
                  <div className="flex-1">
                    <div className="mb-2 flex items-center">
                      <h4 className="mr-2 font-semibold text-white">{agent.name}</h4>
                      {agent.status === 'published' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{agent.downloads.toLocaleString()} downloads</span>
                      <span>
                        ★ {agent.rating} ({agent.reviews})
                      </span>
                      <span className="text-emerald-400">{formatCurrency(agent.revenue)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-sm font-medium ${getGrowthColor(agent.monthlyGrowth)}`}>
                      +{agent.monthlyGrowth.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">this month</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Payouts */}
          <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-8 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Payouts</h3>
              <div className="text-right">
                <div className="text-lg font-bold text-emerald-400">
                  {metrics && formatCurrency(metrics.pendingPayout)}
                </div>
                <div className="text-xs text-gray-400">Pending payout</div>
              </div>
            </div>

            <div className="space-y-4">
              {payouts.map((payout, index) => (
                <motion.div
                  key={payout.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-xl bg-gray-900/40 p-4"
                >
                  <div>
                    <div className="mb-1 font-semibold text-white">{payout.period}</div>
                    <div className="text-sm text-gray-400">
                      {payout.transactionCount} transactions
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="mb-1 font-bold text-white">{formatCurrency(payout.amount)}</div>
                    <div
                      className={`rounded-full px-2 py-1 text-xs ${
                        payout.status === 'completed'
                          ? 'bg-green-600/20 text-green-400'
                          : payout.status === 'processing'
                            ? 'bg-yellow-600/20 text-yellow-400'
                            : 'bg-gray-600/20 text-gray-400'
                      }`}
                    >
                      {payout.status}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {metrics && (
              <div className="mt-6 border-t border-gray-700/50 pt-4">
                <div className="text-center text-sm text-gray-400">
                  Next payout: {new Date(metrics.nextPayoutDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/20 to-violet-800/20 p-6 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-violet-400" />
            <h4 className="mb-2 text-lg font-semibold text-white">Submit New Agent</h4>
            <p className="mb-4 text-sm text-gray-300">
              Upload your latest AI agent to the marketplace
            </p>
            <button className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-2 font-medium text-white">
              Submit Agent
            </button>
          </div>

          <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600/20 to-blue-800/20 p-6 text-center">
            <BarChart3 className="mx-auto mb-4 h-12 w-12 text-blue-400" />
            <h4 className="mb-2 text-lg font-semibold text-white">View Analytics</h4>
            <p className="mb-4 text-sm text-gray-300">
              Detailed insights into user behavior and engagement
            </p>
            <button className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-2 font-medium text-white">
              View Analytics
            </button>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 p-6 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
            <h4 className="mb-2 text-lg font-semibold text-white">Developer Community</h4>
            <p className="mb-4 text-sm text-gray-300">
              Connect with other developers and share insights
            </p>
            <button className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-2 font-medium text-white">
              Join Community
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
