'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  PiggyBank,
  Target,
  Activity,
  BarChart3,
  PieChart,
  FileText,
  Eye
} from 'lucide-react'
import { ConsolidatedPLDashboard } from './ConsolidatedPLDashboard'
import { CashFlowDashboard } from './CashFlowDashboard'
import { BudgetManagementDashboard } from './BudgetManagementDashboard'
import { FinancialForecastDashboard } from './FinancialForecastDashboard'

interface PortfolioSummary {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  cashBalance: number
  accountsReceivable: number
  accountsPayable: number
  quickRatio: number
  currentRatio: number
  debtToEquity: number
  returnOnAssets: number
  returnOnEquity: number
  workingCapital: number
}

export function PortfolioFinancialDashboard() {
  const [selectedView, setSelectedView] = useState<'summary' | 'pl' | 'cashflow' | 'budget' | 'forecast'>('summary')
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [portfolioSummary] = useState<PortfolioSummary>({
    totalRevenue: 1847500,
    totalExpenses: 1234800,
    netProfit: 612700,
    cashBalance: 892000,
    accountsReceivable: 423000,
    accountsPayable: 287000,
    quickRatio: 1.8,
    currentRatio: 2.1,
    debtToEquity: 0.56,
    returnOnAssets: 11.7,
    returnOnEquity: 18.3,
    workingCapital: 605000
  })

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    return `$${(value / 1000).toFixed(0)}k`
  }

  const getHealthIndicator = (metric: string, value: number) => {
    const thresholds: Record<string, { good: number, warning: number }> = {
      quickRatio: { good: 1.5, warning: 1.0 },
      currentRatio: { good: 2.0, warning: 1.5 },
      debtToEquity: { good: 0.5, warning: 1.0 },
      returnOnAssets: { good: 10, warning: 5 },
      returnOnEquity: { good: 15, warning: 10 }
    }

    const threshold = thresholds[metric]
    if (!threshold) return null

    if (metric === 'debtToEquity') {
      if (value <= threshold.good) return <CheckCircle className="h-4 w-4 text-green-500" />
      if (value <= threshold.warning) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }

    if (value >= threshold.good) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (value >= threshold.warning) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <AlertTriangle className="h-4 w-4 text-red-500" />
  }

  if (selectedView === 'pl') {
    return <ConsolidatedPLDashboard />
  }

  if (selectedView === 'cashflow') {
    return <CashFlowDashboard />
  }

  if (selectedView === 'budget') {
    return <BudgetManagementDashboard />
  }

  if (selectedView === 'forecast') {
    return <FinancialForecastDashboard />
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Portfolio Financial Dashboard</h1>
          <p className="text-gray-600">Consolidated financial performance across all businesses</p>
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-5 gap-3 mb-8"
      >
        {[
          { id: 'summary', label: 'Summary', icon: BarChart3, color: 'blue' },
          { id: 'pl', label: 'P&L Statement', icon: FileText, color: 'green' },
          { id: 'cashflow', label: 'Cash Flow', icon: Wallet, color: 'purple' },
          { id: 'budget', label: 'Budgets', icon: Target, color: 'orange' },
          { id: 'forecast', label: 'Forecast', icon: TrendingUp, color: 'indigo' }
        ].map((view) => (
          <motion.button
            key={view.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedView(view.id as any)}
            className={`p-4 rounded-lg border transition-all ${
              selectedView === view.id 
                ? `bg-${view.color}-50 border-${view.color}-300` 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <view.icon className={`h-6 w-6 mb-2 ${
              selectedView === view.id ? `text-${view.color}-600` : 'text-gray-600'
            }`} />
            <p className={`text-sm font-medium ${
              selectedView === view.id ? `text-${view.color}-900` : 'text-gray-900'
            }`}>
              {view.label}
            </p>
          </motion.button>
        ))}
      </motion.div>

      {/* Key Financial Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-4 gap-4 mb-8"
      >
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Revenue</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(portfolioSummary.totalRevenue)}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+24.5% vs last {selectedPeriod}</span>
                </div>
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
                  {formatCurrency(portfolioSummary.netProfit)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {((portfolioSummary.netProfit / portfolioSummary.totalRevenue) * 100).toFixed(1)}% margin
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
                <p className="text-sm text-purple-700 font-medium">Cash Balance</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(portfolioSummary.cashBalance)}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {((portfolioSummary.cashBalance / portfolioSummary.totalExpenses) * 12).toFixed(1)} months runway
                </p>
              </div>
              <Wallet className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Working Capital</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(portfolioSummary.workingCapital)}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-orange-600 mr-1" />
                  <span className="text-xs text-orange-600">Healthy liquidity</span>
                </div>
              </div>
              <PiggyBank className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Financial Health Indicators */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Financial Health</span>
                <Badge className="bg-green-100 text-green-800">STRONG</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Quick Ratio</span>
                    {getHealthIndicator('quickRatio', portfolioSummary.quickRatio)}
                  </div>
                  <span className="font-medium">{portfolioSummary.quickRatio.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Current Ratio</span>
                    {getHealthIndicator('currentRatio', portfolioSummary.currentRatio)}
                  </div>
                  <span className="font-medium">{portfolioSummary.currentRatio.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Debt to Equity</span>
                    {getHealthIndicator('debtToEquity', portfolioSummary.debtToEquity)}
                  </div>
                  <span className="font-medium">{portfolioSummary.debtToEquity.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">ROA</span>
                    {getHealthIndicator('returnOnAssets', portfolioSummary.returnOnAssets)}
                  </div>
                  <span className="font-medium">{portfolioSummary.returnOnAssets.toFixed(1)}%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">ROE</span>
                    {getHealthIndicator('returnOnEquity', portfolioSummary.returnOnEquity)}
                  </div>
                  <span className="font-medium">{portfolioSummary.returnOnEquity.toFixed(1)}%</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full" variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Detailed Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cash Flow Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Operating Cash Flow</span>
                    <span className="font-medium text-green-600">+$485k</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Investing Cash Flow</span>
                    <span className="font-medium text-red-600">-$125k</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Financing Cash Flow</span>
                    <span className="font-medium text-red-600">-$85k</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="font-medium">Net Cash Flow</span>
                      <span className="font-bold text-green-600">+$275k</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Receivables</span>
                    <span className="text-sm">{formatCurrency(portfolioSummary.accountsReceivable)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Payables</span>
                    <span className="text-sm">{formatCurrency(portfolioSummary.accountsPayable)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => setSelectedView('cashflow')}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  View Cash Flow Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Financial Events */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Large Payment Received</p>
                    <p className="text-xs text-gray-600">Phoenix HVAC - $125k</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Budget Approved</p>
                    <p className="text-xs text-gray-600">Q4 2024 Portfolio Budget</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Expense Alert</p>
                    <p className="text-xs text-gray-600">Valley Maintenance over budget</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Forecast Updated</p>
                    <p className="text-xs text-gray-600">AI revenue projection +12%</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>

                <Button className="w-full" variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  View All Events
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Business Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Business Performance Summary</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedView('pl')}
              >
                <FileText className="h-4 w-4 mr-2" />
                View P&L
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Phoenix HVAC Services', revenue: 985000, profit: 342000, growth: 28.3, health: 'excellent' },
                { name: 'Valley Maintenance Co', revenue: 542500, profit: 138000, growth: 22.1, health: 'good' },
                { name: 'Desert Air Solutions', revenue: 320000, profit: 76000, growth: 18.7, health: 'good' }
              ].map((business, index) => (
                <motion.div
                  key={business.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">{business.name}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-600">
                          Revenue: {formatCurrency(business.revenue)}
                        </span>
                        <span className="text-xs text-gray-600">
                          Profit: {formatCurrency(business.profit)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="flex items-center">
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-sm font-medium text-green-600">+{business.growth}%</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs mt-1 ${
                          business.health === 'excellent' ? 'border-green-500 text-green-700' :
                          'border-blue-500 text-blue-700'
                        }`}
                      >
                        {business.health.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}