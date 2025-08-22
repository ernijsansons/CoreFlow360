'use client'

import { useState } from 'react'
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
  Wallet,
  CreditCard,
  PiggyBank,
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  ChevronRight,
  Clock,
  Target
} from 'lucide-react'

interface CashFlowMetrics {
  businessId: string
  businessName: string
  openingBalance: number
  closingBalance: number
  operatingCashFlow: number
  investingCashFlow: number
  financingCashFlow: number
  netCashFlow: number
  receivables: number
  payables: number
  daysOfCash: number
  burnRate: number
}

interface CashFlowForecast {
  date: string
  projectedBalance: number
  confidence: number
  minBalance: number
  maxBalance: number
}

export function CashFlowDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month')
  const [selectedView, setSelectedView] = useState<'consolidated' | 'by-business' | 'forecast' | 'analysis'>('consolidated')

  const [consolidatedCashFlow] = useState({
    openingBalance: 617000,
    closingBalance: 892000,
    netChange: 275000,
    operatingActivities: {
      receiptsFromCustomers: 1923000,
      paymentsToSuppliers: -892000,
      paymentsToEmployees: -546000,
      total: 485000
    },
    investingActivities: {
      purchaseOfEquipment: -85000,
      purchaseOfSoftware: -40000,
      total: -125000
    },
    financingActivities: {
      loanRepayments: -65000,
      dividendsPaid: -20000,
      total: -85000
    }
  })

  const [businessCashFlows] = useState<CashFlowMetrics[]>([
    {
      businessId: 'phoenix-hvac',
      businessName: 'Phoenix HVAC Services',
      openingBalance: 320000,
      closingBalance: 485000,
      operatingCashFlow: 195000,
      investingCashFlow: -30000,
      financingCashFlow: 0,
      netCashFlow: 165000,
      receivables: 225000,
      payables: 145000,
      daysOfCash: 45,
      burnRate: 32000
    },
    {
      businessId: 'valley-maintenance',
      businessName: 'Valley Maintenance Co',
      openingBalance: 185000,
      closingBalance: 257000,
      operatingCashFlow: 112000,
      investingCashFlow: -40000,
      financingCashFlow: 0,
      netCashFlow: 72000,
      receivables: 125000,
      payables: 82000,
      daysOfCash: 52,
      burnRate: 18000
    },
    {
      businessId: 'desert-air',
      businessName: 'Desert Air Solutions',
      openingBalance: 112000,
      closingBalance: 150000,
      operatingCashFlow: 78000,
      investingCashFlow: -55000,
      financingCashFlow: 15000,
      netCashFlow: 38000,
      receivables: 73000,
      payables: 60000,
      daysOfCash: 38,
      burnRate: 12000
    }
  ])

  const [cashFlowForecast] = useState<CashFlowForecast[]>([
    { date: 'Week 1', projectedBalance: 920000, confidence: 95, minBalance: 885000, maxBalance: 955000 },
    { date: 'Week 2', projectedBalance: 945000, confidence: 90, minBalance: 890000, maxBalance: 1000000 },
    { date: 'Week 3', projectedBalance: 980000, confidence: 85, minBalance: 910000, maxBalance: 1050000 },
    { date: 'Week 4', projectedBalance: 1015000, confidence: 80, minBalance: 930000, maxBalance: 1100000 },
    { date: 'Month 2', projectedBalance: 1120000, confidence: 75, minBalance: 980000, maxBalance: 1260000 },
    { date: 'Month 3', projectedBalance: 1245000, confidence: 70, minBalance: 1020000, maxBalance: 1470000 }
  ])

  const getChangeIndicator = (value: number) => {
    if (value > 0) {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUpRight className="h-3 w-3 mr-1" />
          <span className="text-xs font-medium">+${(Math.abs(value) / 1000).toFixed(0)}k</span>
        </div>
      )
    } else if (value < 0) {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDownRight className="h-3 w-3 mr-1" />
          <span className="text-xs font-medium">-${(Math.abs(value) / 1000).toFixed(0)}k</span>
        </div>
      )
    }
    return <span className="text-xs text-gray-500">$0</span>
  }

  const getLiquidityStatus = (daysOfCash: number) => {
    if (daysOfCash >= 60) {
      return { status: 'Excellent', color: 'green', icon: CheckCircle }
    } else if (daysOfCash >= 30) {
      return { status: 'Good', color: 'blue', icon: CheckCircle }
    } else if (daysOfCash >= 15) {
      return { status: 'Warning', color: 'yellow', icon: AlertTriangle }
    }
    return { status: 'Critical', color: 'red', icon: AlertTriangle }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Cash Flow Management</h1>
          <p className="text-gray-600">Monitor and forecast cash position across your portfolio</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
            {['week', 'month', 'quarter'].map((period) => (
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
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Cash Position Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-4 gap-4 mb-8"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Current Balance</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${(consolidatedCashFlow.closingBalance / 1000).toFixed(0)}k
                </p>
                {getChangeIndicator(consolidatedCashFlow.netChange)}
              </div>
              <Wallet className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Operating Cash</p>
                <p className="text-2xl font-bold text-green-900">
                  +${(consolidatedCashFlow.operatingActivities.total / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-green-600 mt-1">Healthy operations</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Runway</p>
                <p className="text-2xl font-bold text-purple-900">8.7 mo</p>
                <p className="text-xs text-purple-600 mt-1">At current burn rate</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Net Cash Flow</p>
                <p className="text-2xl font-bold text-orange-900">
                  +${(consolidatedCashFlow.netChange / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-orange-600 mt-1">This {selectedPeriod}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {[
          { id: 'consolidated', label: 'Consolidated View' },
          { id: 'by-business', label: 'By Business' },
          { id: 'forecast', label: 'Forecast' },
          { id: 'analysis', label: 'Analysis' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedView(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Consolidated View */}
      {selectedView === 'consolidated' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Opening Balance</span>
                    <span className="font-medium">${(consolidatedCashFlow.openingBalance / 1000).toFixed(0)}k</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="font-medium text-gray-900">Operating Activities</div>
                  <div className="space-y-2 pl-4">
                    <div className="flex justify-between text-sm">
                      <span>Receipts from customers</span>
                      <span className="text-green-600">
                        +${(consolidatedCashFlow.operatingActivities.receiptsFromCustomers / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Payments to suppliers</span>
                      <span className="text-red-600">
                        ${(consolidatedCashFlow.operatingActivities.paymentsToSuppliers / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Payments to employees</span>
                      <span className="text-red-600">
                        ${(consolidatedCashFlow.operatingActivities.paymentsToEmployees / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Net Operating Cash Flow</span>
                      <span className="text-green-600">
                        +${(consolidatedCashFlow.operatingActivities.total / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="font-medium text-gray-900">Investing Activities</div>
                  <div className="space-y-2 pl-4">
                    <div className="flex justify-between text-sm">
                      <span>Purchase of equipment</span>
                      <span className="text-red-600">
                        ${(consolidatedCashFlow.investingActivities.purchaseOfEquipment / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Purchase of software</span>
                      <span className="text-red-600">
                        ${(consolidatedCashFlow.investingActivities.purchaseOfSoftware / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Net Investing Cash Flow</span>
                      <span className="text-red-600">
                        ${(consolidatedCashFlow.investingActivities.total / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="font-medium text-gray-900">Financing Activities</div>
                  <div className="space-y-2 pl-4">
                    <div className="flex justify-between text-sm">
                      <span>Loan repayments</span>
                      <span className="text-red-600">
                        ${(consolidatedCashFlow.financingActivities.loanRepayments / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Dividends paid</span>
                      <span className="text-red-600">
                        ${(consolidatedCashFlow.financingActivities.dividendsPaid / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Net Financing Cash Flow</span>
                      <span className="text-red-600">
                        ${(consolidatedCashFlow.financingActivities.total / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between font-medium">
                    <span>Net Change in Cash</span>
                    <span className="text-green-600">
                      +${(consolidatedCashFlow.netChange / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-2">
                    <span>Closing Balance</span>
                    <span>${(consolidatedCashFlow.closingBalance / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Working Capital Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Receivables</p>
                    <p className="text-xl font-bold">$423k</p>
                    <p className="text-xs text-gray-500 mt-1">32 days outstanding</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <PiggyBank className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Payables</p>
                    <p className="text-xl font-bold">$287k</p>
                    <p className="text-xs text-gray-500 mt-1">28 days outstanding</p>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Cash Conversion Cycle</span>
                    <Badge className="bg-green-100 text-green-800">EFFICIENT</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Days Sales Outstanding</span>
                      <span className="font-medium">32 days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Days Payables Outstanding</span>
                      <span className="font-medium">28 days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Days Inventory Outstanding</span>
                      <span className="font-medium">15 days</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Cash Conversion Cycle</span>
                      <span className="text-green-600">19 days</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-between">
                      <span>Accelerate Collections</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-between">
                      <span>Optimize Payment Terms</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-between">
                      <span>Review Credit Lines</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* By Business View */}
      {selectedView === 'by-business' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {businessCashFlows.map((business, index) => {
            const liquidityStatus = getLiquidityStatus(business.daysOfCash)
            const StatusIcon = liquidityStatus.icon
            
            return (
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
                      </div>
                      <Badge className={`bg-${liquidityStatus.color}-100 text-${liquidityStatus.color}-800`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {liquidityStatus.status} Liquidity
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Cash Position</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Current</span>
                            <span className="font-medium">${(business.closingBalance / 1000).toFixed(0)}k</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Net Change</span>
                            <span className={`font-medium ${business.netCashFlow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {business.netCashFlow > 0 ? '+' : ''}${(business.netCashFlow / 1000).toFixed(0)}k
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Days of Cash</span>
                            <span className="font-medium">{business.daysOfCash} days</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Cash Flows</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Operating</span>
                            <span className="font-medium text-green-600">
                              +${(business.operatingCashFlow / 1000).toFixed(0)}k
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Investing</span>
                            <span className="font-medium text-red-600">
                              ${(business.investingCashFlow / 1000).toFixed(0)}k
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Financing</span>
                            <span className={`font-medium ${business.financingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {business.financingCashFlow >= 0 ? '+' : ''}${(business.financingCashFlow / 1000).toFixed(0)}k
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Working Capital</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Receivables</span>
                            <span className="font-medium">${(business.receivables / 1000).toFixed(0)}k</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Payables</span>
                            <span className="font-medium">${(business.payables / 1000).toFixed(0)}k</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Net Working</span>
                            <span className="font-medium">
                              ${((business.receivables - business.payables) / 1000).toFixed(0)}k
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Metrics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Burn Rate</span>
                            <span className="font-medium">${(business.burnRate / 1000).toFixed(0)}k/mo</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Runway</span>
                            <span className="font-medium">
                              {(business.closingBalance / business.burnRate).toFixed(1)} months
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Forecast View */}
      {selectedView === 'forecast' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mr-3" />
                  <span className="text-gray-500">Cash flow projection chart</span>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">3-Month Target</p>
                    <p className="text-xl font-bold">$1.25M</p>
                    <p className="text-xs text-green-600 mt-1">85% confidence</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Best Case</p>
                    <p className="text-xl font-bold">$1.47M</p>
                    <p className="text-xs text-blue-600 mt-1">With optimizations</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Worst Case</p>
                    <p className="text-xl font-bold">$1.02M</p>
                    <p className="text-xs text-yellow-600 mt-1">Risk scenario</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Projected Cash Balances</h4>
                  {cashFlowForecast.map((forecast, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{forecast.date}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          ${(forecast.minBalance / 1000).toFixed(0)}k - ${(forecast.maxBalance / 1000).toFixed(0)}k
                        </span>
                        <span className="font-medium">
                          ${(forecast.projectedBalance / 1000).toFixed(0)}k
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {forecast.confidence}% conf
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Analysis View */}
      {selectedView === 'analysis' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Positive Trends</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-3"></div>
                  <div>
                    <p className="font-medium">Strong Operating Cash Flow</p>
                    <p className="text-sm text-gray-600">+26% increase in collections this month</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-3"></div>
                  <div>
                    <p className="font-medium">Improving Collection Cycle</p>
                    <p className="text-sm text-gray-600">DSO reduced by 5 days</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-3"></div>
                  <div>
                    <p className="font-medium">Cash Reserves Growing</p>
                    <p className="text-sm text-gray-600">8.7 months runway maintained</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Areas for Improvement</CardTitle>
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-3"></div>
                  <div>
                    <p className="font-medium">High Capital Expenditures</p>
                    <p className="text-sm text-gray-600">Consider leasing vs buying equipment</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-3"></div>
                  <div>
                    <p className="font-medium">Seasonal Cash Fluctuations</p>
                    <p className="text-sm text-gray-600">Implement better forecasting models</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-3"></div>
                  <div>
                    <p className="font-medium">Credit Line Utilization</p>
                    <p className="text-sm text-gray-600">Currently at 0% - consider for growth</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}