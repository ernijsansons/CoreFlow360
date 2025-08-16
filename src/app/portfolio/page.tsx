/**
 * CoreFlow360 - Executive Portfolio Dashboard
 * World-class KPI reporting and multi-business management
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { BusinessSwitcher } from '@/components/business/BusinessSwitcher'
import { KPIGrid } from '@/components/kpi/KPIGrid'
import { PricingCalculator } from '@/components/pricing/PricingCalculator'
import { AIBusinessAnalytics } from '@/components/analytics/AIBusinessAnalytics'
import {
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Target,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Crown,
  Building2,
  PieChart,
  Activity,
  Globe,
  Shield,
  Star
} from 'lucide-react'

// Mock data - in production this would come from the API
const portfolioData = {
  summary: {
    totalRevenue: 2850000,
    totalProfit: 980000,
    totalCustomers: 1420,
    portfolioHealth: 87,
    businessCount: 4,
    totalUsers: 89,
    avgGrowthRate: 23.5,
    riskScore: 12
  },
  businesses: [
    {
      id: '1',
      name: 'TechFlow Solutions',
      industry: 'Technology',
      revenue: 1200000,
      profit: 450000,
      customers: 520,
      users: 35,
      growth: 28.5,
      health: 92,
      status: 'excellent',
      ownershipType: 'PRIMARY'
    },
    {
      id: '2', 
      name: 'GreenTech Manufacturing',
      industry: 'Manufacturing',
      revenue: 850000,
      profit: 280000,
      customers: 340,
      users: 28,
      growth: 18.2,
      health: 85,
      status: 'good',
      ownershipType: 'PRIMARY'
    },
    {
      id: '3',
      name: 'Urban Consulting Group',
      industry: 'Consulting',
      revenue: 520000,
      profit: 180000,
      customers: 280,
      users: 16,
      growth: 35.1,
      health: 89,
      status: 'excellent',
      ownershipType: 'SECONDARY'
    },
    {
      id: '4',
      name: 'RetailMax Plus',
      industry: 'Retail',
      revenue: 280000,
      profit: 70000,
      customers: 280,
      users: 10,
      growth: 12.8,
      health: 78,
      status: 'warning',
      ownershipType: 'PARTNER'
    }
  ],
  kpis: [
    {
      key: 'monthly_recurring_revenue',
      name: 'Monthly Recurring Revenue',
      value: 237500,
      change: 15.2,
      trend: 'up',
      target: 300000,
      format: 'currency'
    },
    {
      key: 'customer_acquisition_cost',
      name: 'Customer Acquisition Cost',
      value: 89,
      change: -8.5,
      trend: 'down',
      target: 75,
      format: 'currency'
    },
    {
      key: 'customer_lifetime_value',
      name: 'Customer Lifetime Value',
      value: 2890,
      change: 22.3,
      trend: 'up',
      target: 3000,
      format: 'currency'
    },
    {
      key: 'net_promoter_score',
      name: 'Net Promoter Score',
      value: 68,
      change: 5.2,
      trend: 'up',
      target: 70,
      format: 'number'
    },
    {
      key: 'churn_rate',
      name: 'Customer Churn Rate',
      value: 3.2,
      change: -1.8,
      trend: 'down',
      target: 2.5,
      format: 'percentage'
    },
    {
      key: 'employee_satisfaction',
      name: 'Employee Satisfaction',
      value: 4.6,
      change: 0.3,
      trend: 'up',
      target: 4.8,
      format: 'rating'
    }
  ]
}

export default function PortfolioDashboard() {
  return (
    <ProtectedRoute>
      <ExecutivePortfolio />
    </ProtectedRoute>
  )
}

function ExecutivePortfolio() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState('monthly')
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatGrowth = (rate: number) => {
    const icon = rate > 0 ? <ArrowUp className="w-4 h-4" /> : 
                  rate < 0 ? <ArrowDown className="w-4 h-4" /> : 
                  <Minus className="w-4 h-4" />
    
    const color = rate > 0 ? 'text-green-600' : 
                  rate < 0 ? 'text-red-600' : 
                  'text-gray-600'
    
    return (
      <div className={`flex items-center space-x-1 ${color}`}>
        {icon}
        <span className="font-medium">{Math.abs(rate).toFixed(1)}%</span>
      </div>
    )
  }

  const getHealthColor = (health: number) => {
    if (health >= 85) return 'text-green-600 bg-green-50'
    if (health >= 70) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getOwnershipBadge = (type: string) => {
    const config = {
      PRIMARY: { icon: Crown, color: 'text-yellow-600 bg-yellow-50', label: 'Primary' },
      SECONDARY: { icon: Star, color: 'text-blue-600 bg-blue-50', label: 'Secondary' },
      PARTNER: { icon: Users, color: 'text-purple-600 bg-purple-50', label: 'Partner' }
    }
    const { icon: Icon, color, label } = config[type as keyof typeof config] || config.PRIMARY
    
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        <span>{label}</span>
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Executive Portfolio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              World-class analytics for your business empire
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <BusinessSwitcher showPortfolioOption={false} />
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Portfolio Revenue</p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(portfolioData.summary.totalRevenue)}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  {formatGrowth(portfolioData.summary.avgGrowthRate)}
                  <span className="text-blue-100 text-sm">vs last month</span>
                </div>
              </div>
              <DollarSign className="w-12 h-12 text-blue-200" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Portfolio Health Score</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {portfolioData.summary.portfolioHealth}%
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${portfolioData.summary.portfolioHealth}%` }}
                    />
                  </div>
                  <span className="text-green-600 text-sm font-medium">Excellent</span>
                </div>
              </div>
              <Shield className="w-12 h-12 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Customers</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {portfolioData.summary.totalCustomers.toLocaleString()}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-gray-500 text-sm">
                    Across {portfolioData.summary.businessCount} businesses
                  </span>
                </div>
              </div>
              <Users className="w-12 h-12 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Risk Assessment</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {portfolioData.summary.riskScore}%
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Low Risk
                  </span>
                </div>
              </div>
              <Activity className="w-12 h-12 text-purple-600" />
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Portfolio Overview', icon: BarChart3 },
                { id: 'businesses', label: 'Business Performance', icon: Building2 },
                { id: 'kpis', label: 'Key Metrics', icon: Target },
                { id: 'analytics', label: 'AI Analytics', icon: TrendingUp },
                { id: 'pricing', label: 'Pricing Calculator', icon: DollarSign }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Business Performance Grid */}
        {activeTab === 'businesses' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {portfolioData.businesses.map((business, index) => (
              <motion.div
                key={business.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {business.name}
                      </h3>
                      {getOwnershipBadge(business.ownershipType)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {business.industry}
                    </p>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(business.health)}`}>
                    {business.health}% Health
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(business.revenue)}
                    </p>
                    <div className="mt-1">
                      {formatGrowth(business.growth)}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Profit</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(business.profit)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {((business.profit / business.revenue) * 100).toFixed(1)}% margin
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Customers</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {business.customers.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Team Size</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {business.users}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Key Metrics */}
        {activeTab === 'kpis' && (
          <div>
            <KPIGrid 
              kpis={portfolioData.kpis.map(kpi => ({
                ...kpi,
                displayValue: kpi.format === 'currency' ? formatCurrency(kpi.value) :
                            kpi.format === 'percentage' ? `${kpi.value}%` :
                            kpi.format === 'rating' ? `${kpi.value}/5.0` :
                            kpi.value.toLocaleString(),
                changePercent: kpi.change,
                status: kpi.value >= kpi.target ? 'good' : 
                        kpi.value >= kpi.target * 0.8 ? 'warning' : 'critical',
                category: 'FINANCIAL',
                lastUpdated: new Date()
              }))}
              onDrillDown={(kpiKey) => console.log('Drilling down into:', kpiKey)}
              showFilters={true}
              showSearch={true}
            />
          </div>
        )}

        {/* Portfolio Overview Charts */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Revenue Distribution
              </h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <PieChart className="w-16 h-16 mr-4" />
                <span>Advanced chart component would be integrated here</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Growth Trends
              </h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <TrendingUp className="w-16 h-16 mr-4" />
                <span>Interactive trend charts would be displayed here</span>
              </div>
            </div>
          </div>
        )}

        {/* AI Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <AIBusinessAnalytics />
          </div>
        )}

        {/* Pricing Calculator Tab */}
        {activeTab === 'pricing' && (
          <div>
            <PricingCalculator 
              showMultiBusiness={true}
              onPricingChange={(calculation) => {
                console.log('Pricing updated:', calculation)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}