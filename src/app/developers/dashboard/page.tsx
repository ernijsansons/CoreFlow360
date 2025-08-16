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
  Package
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
    downloadGrowth: 28.2
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
      status: 'published'
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
      status: 'published'
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
      status: 'pending'
    }
  ]

  const mockRevenueData: RevenueChartData[] = [
    { date: '2024-01-01', revenue: 18500, downloads: 145 },
    { date: '2024-01-08', revenue: 21200, downloads: 167 },
    { date: '2024-01-15', revenue: 19800, downloads: 156 },
    { date: '2024-01-22', revenue: 24600, downloads: 189 },
    { date: '2024-01-29', revenue: 27300, downloads: 203 }
  ]

  const mockPayouts: Payout[] = [
    {
      id: 'payout_001',
      amount: 16380,
      status: 'pending',
      date: '2024-02-15',
      period: 'Jan 2024',
      transactionCount: 89
    },
    {
      id: 'payout_002',
      amount: 14250,
      status: 'completed',
      date: '2024-01-15',
      period: 'Dec 2023',
      transactionCount: 76
    },
    {
      id: 'payout_003',
      amount: 11890,
      status: 'completed',
      date: '2023-12-15',
      period: 'Nov 2023',
      transactionCount: 63
    }
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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
              <h1 className="text-3xl font-bold text-white mb-2">Developer Dashboard</h1>
              <p className="text-gray-400">Track your AI agent performance and earnings</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:border-violet-500 focus:outline-none"
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-emerald-500" />
              <div className="flex items-center text-sm">
                {metrics && (
                  <>
                    {getGrowthIcon(metrics.revenueGrowth)({ className: `w-4 h-4 mr-1 ${getGrowthColor(metrics.revenueGrowth)}` })}
                    <span className={getGrowthColor(metrics.revenueGrowth)}>
                      {Math.abs(metrics.revenueGrowth).toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {metrics && formatCurrency(metrics.totalRevenue)}
            </div>
            <div className="text-gray-400 text-sm">Total Revenue</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Download className="w-8 h-8 text-blue-500" />
              <div className="flex items-center text-sm">
                {metrics && (
                  <>
                    {getGrowthIcon(metrics.downloadGrowth)({ className: `w-4 h-4 mr-1 ${getGrowthColor(metrics.downloadGrowth)}` })}
                    <span className={getGrowthColor(metrics.downloadGrowth)}>
                      {Math.abs(metrics.downloadGrowth).toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {metrics?.totalDownloads.toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm">Total Downloads</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {metrics?.averageRating.toFixed(1)}
            </div>
            <div className="text-gray-400 text-sm">Average Rating</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-violet-500" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {metrics?.totalAgents}
            </div>
            <div className="text-gray-400 text-sm">Published Agents</div>
          </motion.div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-semibold text-white mb-6">Revenue Trend</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {revenueData.map((data, index) => {
              const maxRevenue = Math.max(...revenueData.map(d => d.revenue))
              const height = (data.revenue / maxRevenue) * 100
              
              return (
                <motion.div
                  key={data.date}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex-1 bg-gradient-to-t from-violet-600 to-cyan-500 rounded-t-lg min-h-[20px] relative group"
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    ${(data.revenue / 100).toLocaleString()}
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                    {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Agent Performance */}
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Agent Performance</h3>
            <div className="space-y-4">
              {agentPerformance.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-900/40 rounded-xl"
                >
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="font-semibold text-white mr-2">{agent.name}</h4>
                      {agent.status === 'published' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{agent.downloads.toLocaleString()} downloads</span>
                      <span>★ {agent.rating} ({agent.reviews})</span>
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
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
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
                  className="flex items-center justify-between p-4 bg-gray-900/40 rounded-xl"
                >
                  <div>
                    <div className="font-semibold text-white mb-1">{payout.period}</div>
                    <div className="text-sm text-gray-400">
                      {payout.transactionCount} transactions
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-white mb-1">
                      {formatCurrency(payout.amount)}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      payout.status === 'completed' 
                        ? 'bg-green-600/20 text-green-400'
                        : payout.status === 'processing'
                        ? 'bg-yellow-600/20 text-yellow-400'
                        : 'bg-gray-600/20 text-gray-400'
                    }`}>
                      {payout.status}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {metrics && (
              <div className="mt-6 pt-4 border-t border-gray-700/50">
                <div className="text-center text-sm text-gray-400">
                  Next payout: {new Date(metrics.nextPayoutDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-violet-600/20 to-violet-800/20 border border-violet-500/30 rounded-2xl p-6 text-center">
            <Package className="w-12 h-12 text-violet-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Submit New Agent</h4>
            <p className="text-gray-300 text-sm mb-4">Upload your latest AI agent to the marketplace</p>
            <button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2 rounded-xl font-medium">
              Submit Agent
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-2xl p-6 text-center">
            <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">View Analytics</h4>
            <p className="text-gray-300 text-sm mb-4">Detailed insights into user behavior and engagement</p>
            <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-xl font-medium">
              View Analytics
            </button>
          </div>

          <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border border-emerald-500/30 rounded-2xl p-6 text-center">
            <Users className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Developer Community</h4>
            <p className="text-gray-300 text-sm mb-4">Connect with other developers and share insights</p>
            <button className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-2 rounded-xl font-medium">
              Join Community
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}