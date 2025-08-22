'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  Filter,
  AlertCircle,
  CheckCircle2,
  Target,
  Activity,
  Percent,
  CreditCard,
  ShoppingCart,
  Users,
  Package
} from 'lucide-react'

interface BusinessFinancialMetrics {
  businessId: string
  businessName: string
  revenue: number
  recurringRevenue: number
  oneTimeRevenue: number
  revenueGrowth: number
  operatingExpenses: number
  costOfGoodsSold: number
  salesExpenses: number
  adminExpenses: number
  grossProfit: number
  grossMargin: number
  operatingProfit: number
  operatingMargin: number
  netProfit: number
  netMargin: number
  ebitda: number
  portfolioContribution: number
  intercompanyRevenue: number
  intercompanyExpenses: number
  aiRevenueProjection: number
  aiExpenseProjection: number
  aiRiskScore: number
}

interface ConsolidatedMetrics {
  totalRevenue: number
  totalExpenses: number
  totalProfit: number
  profitMargin: number
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  cashBalance: number
  revenueGrowth: number
  expenseGrowth: number
  ebitda: number
  ebitdaMargin: number
}

interface PeriodComparison {
  current: ConsolidatedMetrics
  previous: ConsolidatedMetrics
  yearOverYear: ConsolidatedMetrics
}

export function ConsolidatedPLDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const [selectedView, setSelectedView] = useState<'overview' | 'breakdown' | 'trends' | 'insights'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  
  const [consolidatedMetrics] = useState<ConsolidatedMetrics>({
    totalRevenue: 1847500,
    totalExpenses: 1234800,
    totalProfit: 612700,
    profitMargin: 33.2,
    totalAssets: 5240000,
    totalLiabilities: 1890000,
    totalEquity: 3350000,
    cashBalance: 892000,
    revenueGrowth: 24.5,
    expenseGrowth: 18.2,
    ebitda: 742300,
    ebitdaMargin: 40.2
  })

  const [businessMetrics] = useState<BusinessFinancialMetrics[]>([
    {
      businessId: 'phoenix-hvac',
      businessName: 'Phoenix HVAC Services',
      revenue: 985000,
      recurringRevenue: 720000,
      oneTimeRevenue: 265000,
      revenueGrowth: 28.3,
      operatingExpenses: 580000,
      costOfGoodsSold: 320000,
      salesExpenses: 145000,
      adminExpenses: 115000,
      grossProfit: 665000,
      grossMargin: 67.5,
      operatingProfit: 405000,
      operatingMargin: 41.1,
      netProfit: 342000,
      netMargin: 34.7,
      ebitda: 425000,
      portfolioContribution: 53.3,
      intercompanyRevenue: 45000,
      intercompanyExpenses: 12000,
      aiRevenueProjection: 1120000,
      aiExpenseProjection: 620000,
      aiRiskScore: 12
    },
    {
      businessId: 'valley-maintenance',
      businessName: 'Valley Maintenance Co',
      revenue: 542500,
      recurringRevenue: 480000,
      oneTimeRevenue: 62500,
      revenueGrowth: 22.1,
      operatingExpenses: 380000,
      costOfGoodsSold: 180000,
      salesExpenses: 108000,
      adminExpenses: 92000,
      grossProfit: 362500,
      grossMargin: 66.8,
      operatingProfit: 162500,
      operatingMargin: 30.0,
      netProfit: 138000,
      netMargin: 25.4,
      ebitda: 185000,
      portfolioContribution: 29.4,
      intercompanyRevenue: 32000,
      intercompanyExpenses: 8000,
      aiRevenueProjection: 620000,
      aiExpenseProjection: 410000,
      aiRiskScore: 18
    },
    {
      businessId: 'desert-air',
      businessName: 'Desert Air Solutions',
      revenue: 320000,
      recurringRevenue: 210000,
      oneTimeRevenue: 110000,
      revenueGrowth: 18.7,
      operatingExpenses: 230000,
      costOfGoodsSold: 95000,
      salesExpenses: 64000,
      adminExpenses: 71000,
      grossProfit: 225000,
      grossMargin: 70.3,
      operatingProfit: 90000,
      operatingMargin: 28.1,
      netProfit: 76000,
      netMargin: 23.8,
      ebitda: 105000,
      portfolioContribution: 17.3,
      intercompanyRevenue: 18000,
      intercompanyExpenses: 5000,
      aiRevenueProjection: 380000,
      aiExpenseProjection: 250000,
      aiRiskScore: 22
    }
  ])

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const getChangeIndicator = (value: number) => {
    if (value > 0) {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUpRight className="h-3 w-3 mr-1" />
          <span className="text-xs font-medium">+{value.toFixed(1)}%</span>
        </div>
      )
    } else if (value < 0) {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDownRight className="h-3 w-3 mr-1" />
          <span className="text-xs font-medium">{value.toFixed(1)}%</span>
        </div>
      )
    }
    return <span className="text-xs text-gray-500">0%</span>
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Consolidated P&L Dashboard</h1>
          <p className="text-gray-600">Portfolio-wide financial performance and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
            {['month', 'quarter', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-4 gap-4 mb-8"
      >
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-green-900">
                  ${(consolidatedMetrics.totalRevenue / 1000).toFixed(0)}k
                </p>
                {getChangeIndicator(consolidatedMetrics.revenueGrowth)}
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Net Profit</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${(consolidatedMetrics.totalProfit / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {consolidatedMetrics.profitMargin.toFixed(1)}% margin
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">EBITDA</p>
                <p className="text-2xl font-bold text-purple-900">
                  ${(consolidatedMetrics.ebitda / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {consolidatedMetrics.ebitdaMargin.toFixed(1)}% margin
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Cash Balance</p>
                <p className="text-2xl font-bold text-orange-900">
                  ${(consolidatedMetrics.cashBalance / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  {((consolidatedMetrics.cashBalance / consolidatedMetrics.totalExpenses) * 12).toFixed(1)} months runway
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: PieChart },
          { id: 'breakdown', label: 'Business Breakdown', icon: Building },
          { id: 'trends', label: 'Trends & Analysis', icon: TrendingUp },
          { id: 'insights', label: 'AI Insights', icon: Activity }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedView(tab.id as any)}
            className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Recurring Revenue</span>
                    <span className="text-sm text-gray-600">
                      ${((businessMetrics.reduce((sum, b) => sum + b.recurringRevenue, 0)) / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '73%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">One-Time Revenue</span>
                    <span className="text-sm text-gray-600">
                      ${((businessMetrics.reduce((sum, b) => sum + b.oneTimeRevenue, 0)) / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '27%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-4">Expense Categories</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Cost of Goods Sold</span>
                    <span className="text-sm font-medium">
                      ${(businessMetrics.reduce((sum, b) => sum + b.costOfGoodsSold, 0) / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Sales & Marketing</span>
                    <span className="text-sm font-medium">
                      ${(businessMetrics.reduce((sum, b) => sum + b.salesExpenses, 0) / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Admin & Operations</span>
                    <span className="text-sm font-medium">
                      ${(businessMetrics.reduce((sum, b) => sum + b.adminExpenses, 0) / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profitability Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Gross Margin</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {((businessMetrics.reduce((sum, b) => sum + b.grossProfit, 0) / 
                        businessMetrics.reduce((sum, b) => sum + b.revenue, 0)) * 100).toFixed(1)}%
                    </p>
                    <Badge className="mt-2" variant="outline">
                      Industry Avg: 65%
                    </Badge>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Operating Margin</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {((businessMetrics.reduce((sum, b) => sum + b.operatingProfit, 0) / 
                        businessMetrics.reduce((sum, b) => sum + b.revenue, 0)) * 100).toFixed(1)}%
                    </p>
                    <Badge className="mt-2" variant="outline">
                      Industry Avg: 28%
                    </Badge>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Portfolio Health Score</span>
                    <Badge className="bg-green-100 text-green-800">EXCELLENT</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Portfolio performing 18% above industry benchmarks
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm">Return on Assets (ROA)</span>
                    <span className="font-medium">11.7%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm">Return on Equity (ROE)</span>
                    <span className="font-medium">18.3%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Business Breakdown Tab */}
      {selectedView === 'breakdown' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {businessMetrics.map((business, index) => (
            <motion.div
              key={business.businessId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-gray-600" />
                      <CardTitle>{business.businessName}</CardTitle>
                      <Badge variant="outline">
                        {business.portfolioContribution.toFixed(1)}% of portfolio
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      {business.revenueGrowth > 20 ? (
                        <Badge className="bg-green-100 text-green-800">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          High Growth
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Activity className="h-3 w-3 mr-1" />
                          Stable
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Revenue</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total</span>
                          <span className="font-medium">${(business.revenue / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Recurring</span>
                          <span className="font-medium">${(business.recurringRevenue / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Growth</span>
                          <span className="font-medium text-green-600">+{business.revenueGrowth}%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Profitability</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Gross</span>
                          <span className="font-medium">${(business.grossProfit / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Operating</span>
                          <span className="font-medium">${(business.operatingProfit / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Net</span>
                          <span className="font-medium">${(business.netProfit / 1000).toFixed(0)}k</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Margins</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Gross</span>
                          <span className="font-medium">{business.grossMargin.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Operating</span>
                          <span className="font-medium">{business.operatingMargin.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Net</span>
                          <span className="font-medium">{business.netMargin.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">AI Projections</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Revenue</span>
                          <span className="font-medium text-blue-600">
                            ${(business.aiRevenueProjection / 1000).toFixed(0)}k
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Risk Score</span>
                          <span className={`font-medium ${
                            business.aiRiskScore < 20 ? 'text-green-600' : 
                            business.aiRiskScore < 40 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {business.aiRiskScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {business.intercompanyRevenue > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Intercompany Transactions</span>
                        <div className="flex items-center space-x-4">
                          <span>
                            Revenue: <span className="font-medium text-green-600">
                              +${(business.intercompanyRevenue / 1000).toFixed(0)}k
                            </span>
                          </span>
                          <span>
                            Expenses: <span className="font-medium text-red-600">
                              -${(business.intercompanyExpenses / 1000).toFixed(0)}k
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Trends Tab */}
      {selectedView === 'trends' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-12 w-12 text-gray-400" />
                  <span className="ml-3 text-gray-500">Revenue chart visualization</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-600">This Month</p>
                    <p className="font-semibold">$1.85M</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Last Month</p>
                    <p className="font-semibold">$1.48M</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">MoM Growth</p>
                    <p className="font-semibold text-green-600">+25%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                  <PieChart className="h-12 w-12 text-gray-400" />
                  <span className="ml-3 text-gray-500">Expense chart visualization</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-600">This Month</p>
                    <p className="font-semibold">$1.23M</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Last Month</p>
                    <p className="font-semibold">$1.04M</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">MoM Change</p>
                    <p className="font-semibold text-yellow-600">+18%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI Insights Tab */}
      {selectedView === 'insights' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <CardTitle>Strong Portfolio Performance</CardTitle>
                </div>
                <Badge className="bg-green-100 text-green-800">POSITIVE</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Portfolio is outperforming industry benchmarks by 18%. Revenue growth of 24.5% YoY significantly 
                exceeds the 12% industry average. Profit margins remain healthy at 33.2%.
              </p>
              <div className="flex items-center space-x-3">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  Share Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <CardTitle>Expense Growth Alert</CardTitle>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">ATTENTION</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Operating expenses growing at 18.2% while revenue grows at 24.5%. Consider implementing 
                cost optimization strategies to maintain healthy margins as you scale.
              </p>
              <div className="flex items-center space-x-3">
                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                  Review Expenses
                </Button>
                <Button variant="outline" size="sm">
                  Set Alerts
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <CardTitle>Growth Opportunity Identified</CardTitle>
                </div>
                <Badge className="bg-blue-100 text-blue-800">OPPORTUNITY</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Phoenix HVAC shows potential for 14% additional revenue growth through service expansion. 
                AI models predict $135k additional monthly revenue with 82% confidence.
              </p>
              <div className="flex items-center space-x-3">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Explore Opportunity
                </Button>
                <Button variant="outline" size="sm">
                  Run Simulation
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}