/**
 * CoreFlow360 - Revenue Operations Manager for SaaS
 * MRR/ARR tracking, cohort analysis, and revenue forecasting
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon,
  ChartBarIcon,
  UsersIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BanknotesIcon,
  CreditCardIcon,
  ScaleIcon,
  FunnelIcon,
  PresentationChartLineIcon,
  CalculatorIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { MetricCard } from '@/components/ui/MetricCard'

interface RevenueMetrics {
  mrr: number
  mrrGrowth: number
  arr: number
  arrGrowth: number
  averageRevenuePerUser: number
  arpuGrowth: number
  customerLifetimeValue: number
  ltvGrowth: number
  churnRate: number
  churnImpact: number
  expansionRevenue: number
  contractionRevenue: number
  netRevenueRetention: number
  grossRevenueRetention: number
}

interface CohortData {
  cohortMonth: string
  newCustomers: number
  totalRevenue: number
  retentionRate: Array<{
    month: number
    rate: number
    revenue: number
  }>
}

interface RevenueBreakdown {
  newBusiness: number
  expansion: number
  contraction: number
  churn: number
  net: number
}

interface RevenueForecast {
  month: string
  predictedMrr: number
  confidence: number
  factors: string[]
}

interface RevenueOpsManagerProps {
  onDrillDown?: (metric: string, data: any) => void
  onExportData?: (dataType: string) => void
}

export default function RevenueOpsManager({
  onDrillDown,
  onExportData
}: RevenueOpsManagerProps) {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null)
  const [cohorts, setCohorts] = useState<CohortData[]>([])
  const [breakdown, setBreakdown] = useState<RevenueBreakdown | null>(null)
  const [forecast, setForecast] = useState<RevenueForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('3m')
  const [viewMode, setViewMode] = useState<'overview' | 'cohorts' | 'forecast'>('overview')

  useEffect(() => {
    loadRevenueData()
  }, [selectedPeriod])

  const loadRevenueData = async () => {
    try {
      setLoading(true)
      
      // Mock data for demonstration
      const mockMetrics: RevenueMetrics = {
        mrr: 125400,
        mrrGrowth: 12.5,
        arr: 1504800,
        arrGrowth: 15.8,
        averageRevenuePerUser: 89.50,
        arpuGrowth: 3.2,
        customerLifetimeValue: 2687,
        ltvGrowth: 8.7,
        churnRate: 3.2,
        churnImpact: -4015,
        expansionRevenue: 18650,
        contractionRevenue: -2340,
        netRevenueRetention: 112,
        grossRevenueRetention: 97
      }

      const mockCohorts: CohortData[] = [
        {
          cohortMonth: '2024-01',
          newCustomers: 45,
          totalRevenue: 13500,
          retentionRate: [
            { month: 0, rate: 100, revenue: 13500 },
            { month: 1, rate: 88, revenue: 11880 },
            { month: 2, rate: 82, revenue: 11070 },
            { month: 3, rate: 78, revenue: 10530 },
            { month: 4, rate: 75, revenue: 10125 },
            { month: 5, rate: 73, revenue: 9855 },
            { month: 6, rate: 71, revenue: 9585 }
          ]
        },
        {
          cohortMonth: '2024-02',
          newCustomers: 52,
          totalRevenue: 15600,
          retentionRate: [
            { month: 0, rate: 100, revenue: 15600 },
            { month: 1, rate: 90, revenue: 14040 },
            { month: 2, rate: 85, revenue: 13260 },
            { month: 3, rate: 81, revenue: 12636 },
            { month: 4, rate: 78, revenue: 12168 },
            { month: 5, rate: 76, revenue: 11856 }
          ]
        },
        {
          cohortMonth: '2024-03',
          newCustomers: 38,
          totalRevenue: 11400,
          retentionRate: [
            { month: 0, rate: 100, revenue: 11400 },
            { month: 1, rate: 92, revenue: 10488 },
            { month: 2, rate: 87, revenue: 9918 },
            { month: 3, rate: 84, revenue: 9576 },
            { month: 4, rate: 81, revenue: 9234 }
          ]
        }
      ]

      const mockBreakdown: RevenueBreakdown = {
        newBusiness: 32150,
        expansion: 18650,
        contraction: -2340,
        churn: -4015,
        net: 44445
      }

      const mockForecast: RevenueForecast[] = [
        {
          month: '2024-09',
          predictedMrr: 132800,
          confidence: 87,
          factors: ['Seasonal uptick', 'Enterprise deals closing']
        },
        {
          month: '2024-10',
          predictedMrr: 138200,
          confidence: 82,
          factors: ['Product launch impact', 'Pricing optimization']
        },
        {
          month: '2024-11',
          predictedMrr: 143500,
          confidence: 78,
          factors: ['Holiday seasonality', 'Churn risk mitigation']
        },
        {
          month: '2024-12',
          predictedMrr: 149800,
          confidence: 75,
          factors: ['Year-end renewals', 'Market expansion']
        }
      ]

      setMetrics(mockMetrics)
      setCohorts(mockCohorts)
      setBreakdown(mockBreakdown)
      setForecast(mockForecast)
    } catch (error) {
      console.error('Failed to load revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getGrowthColor = (growth: number) => {
    return growth > 0 ? 'text-green-600' : 'text-red-600'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Revenue Operations</h1>
          <p className="text-gray-600 mt-1">MRR/ARR tracking, cohort analysis, and revenue forecasting</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
          
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'cohorts', label: 'Cohorts' },
              { key: 'forecast', label: 'Forecast' }
            ].map((view) => (
              <button
                key={view.key}
                onClick={() => setViewMode(view.key as any)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  viewMode === view.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === 'overview' && metrics && breakdown && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              value={formatCurrency(metrics.mrr)}
              label="Monthly Recurring Revenue"
              icon={CurrencyDollarIcon}
              gradient="emerald"
              trend={metrics.mrrGrowth}
            />
            <MetricCard
              value={formatCurrency(metrics.arr)}
              label="Annual Recurring Revenue"
              icon={BanknotesIcon}
              gradient="blue"
              trend={metrics.arrGrowth}
            />
            <MetricCard
              value={formatCurrency(metrics.averageRevenuePerUser)}
              label="Average Revenue Per User"
              icon={UsersIcon}
              gradient="violet"
              trend={metrics.arpuGrowth}
            />
            <MetricCard
              value={formatCurrency(metrics.customerLifetimeValue)}
              label="Customer Lifetime Value"
              icon={TrendingUpIcon}
              gradient="orange"
              trend={metrics.ltvGrowth}
            />
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Revenue Breakdown</h3>
              <span className="text-sm text-gray-500">This Month</span>
            </div>
            
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-5">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 mx-auto rounded-full bg-blue-100 text-blue-600 mb-3">
                  <ArrowUpIcon className="h-6 w-6" />
                </div>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(breakdown.newBusiness)}</p>
                <p className="text-sm text-gray-600">New Business</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 mx-auto rounded-full bg-green-100 text-green-600 mb-3">
                  <TrendingUpIcon className="h-6 w-6" />
                </div>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(breakdown.expansion)}</p>
                <p className="text-sm text-gray-600">Expansion</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 mx-auto rounded-full bg-yellow-100 text-yellow-600 mb-3">
                  <TrendingDownIcon className="h-6 w-6" />
                </div>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(Math.abs(breakdown.contraction))}</p>
                <p className="text-sm text-gray-600">Contraction</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 mx-auto rounded-full bg-red-100 text-red-600 mb-3">
                  <ArrowDownIcon className="h-6 w-6" />
                </div>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(Math.abs(breakdown.churn))}</p>
                <p className="text-sm text-gray-600">Churn</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 mx-auto rounded-full bg-purple-100 text-purple-600 mb-3">
                  <CalculatorIcon className="h-6 w-6" />
                </div>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(breakdown.net)}</p>
                <p className="text-sm text-gray-600">Net Growth</p>
              </div>
            </div>
          </div>

          {/* Retention Metrics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Retention Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Net Revenue Retention</span>
                  <span className="text-lg font-semibold text-green-600">{metrics.netRevenueRetention}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Gross Revenue Retention</span>
                  <span className="text-lg font-semibold text-blue-600">{metrics.grossRevenueRetention}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly Churn Rate</span>
                  <span className="text-lg font-semibold text-red-600">{metrics.churnRate}%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Growth Indicators</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">MRR Growth Rate</span>
                  <span className={`text-lg font-semibold ${getGrowthColor(metrics.mrrGrowth)}`}>
                    {formatPercentage(metrics.mrrGrowth)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ARPU Growth Rate</span>
                  <span className={`text-lg font-semibold ${getGrowthColor(metrics.arpuGrowth)}`}>
                    {formatPercentage(metrics.arpuGrowth)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">LTV Growth Rate</span>
                  <span className={`text-lg font-semibold ${getGrowthColor(metrics.ltvGrowth)}`}>
                    {formatPercentage(metrics.ltvGrowth)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'cohorts' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cohort Retention Analysis</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cohort
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New Customers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month 0
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month 1
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month 2
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month 3
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month 6
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cohorts.map((cohort) => (
                    <tr key={cohort.cohortMonth}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(cohort.cohortMonth + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cohort.newCustomers}
                      </td>
                      {[0, 1, 2, 3, 6].map((monthIndex) => {
                        const retention = cohort.retentionRate.find(r => r.month === monthIndex)
                        return (
                          <td key={monthIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {retention ? (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                retention.rate >= 80 ? 'bg-green-100 text-green-800' :
                                retention.rate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {retention.rate}%
                              </span>
                            ) : '-'}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'forecast' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Forecast</h3>
            <div className="space-y-4">
              {forecast.map((period) => (
                <div key={period.month} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {new Date(period.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h4>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {formatCurrency(period.predictedMrr)}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-gray-600">Confidence: </span>
                        <span className={`ml-1 text-sm font-medium ${getConfidenceColor(period.confidence)}`}>
                          {period.confidence}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Key Factors</h5>
                      <div className="space-y-1">
                        {period.factors.map((factor, idx) => (
                          <span key={idx} className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded-md mr-1 mb-1">
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}