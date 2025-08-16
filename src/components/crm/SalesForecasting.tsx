/**
 * CoreFlow360 - Sales Forecasting with Predictive Analytics
 * AI-powered sales predictions and trend analysis
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  FunnelIcon,
  ClockIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { MetricCard } from '@/components/ui/MetricCard'

interface ForecastData {
  period: string
  actual?: number
  predicted: number
  confidence: number
  upperBound: number
  lowerBound: number
}

interface SalesForecast {
  id: string
  name: string
  period: 'weekly' | 'monthly' | 'quarterly'
  timeframe: string
  data: ForecastData[]
  totalPredicted: number
  totalActual?: number
  accuracy: number
  confidence: number
  trends: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
    reason: string
  }[]
  riskFactors: string[]
  opportunities: string[]
  lastUpdated: string
}

interface ForecastMetrics {
  currentPeriodPrediction: number
  nextPeriodPrediction: number
  predictionAccuracy: number
  pipelineConfidence: number
  timeToClose: number
  conversionRate: number
  growthRate: number
  riskLevel: 'low' | 'medium' | 'high'
}

interface SalesForecastingProps {
  onDrillDown?: (forecast: SalesForecast) => void
  onExportData?: (forecast: SalesForecast) => void
}

export default function SalesForecasting({ onDrillDown, onExportData }: SalesForecastingProps) {
  const [forecasts, setForecasts] = useState<SalesForecast[]>([])
  const [metrics, setMetrics] = useState<ForecastMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly')
  const [selectedForecast, setSelectedForecast] = useState<string | null>(null)
  const [showAIInsights, setShowAIInsights] = useState(true)

  useEffect(() => {
    loadForecastData()
  }, [selectedPeriod])

  const loadForecastData = async () => {
    try {
      setLoading(true)
      
      // Mock data for demonstration
      const mockForecasts: SalesForecast[] = [
        {
          id: 'revenue-forecast',
          name: 'Revenue Forecast',
          period: selectedPeriod,
          timeframe: selectedPeriod === 'weekly' ? 'Next 12 Weeks' : selectedPeriod === 'monthly' ? 'Next 12 Months' : 'Next 4 Quarters',
          data: generateForecastData(selectedPeriod),
          totalPredicted: 2450000,
          totalActual: 1850000,
          accuracy: 87.5,
          confidence: 92,
          trends: [
            {
              direction: 'up',
              percentage: 15.2,
              reason: 'Strong Q4 pipeline and seasonal uptick'
            },
            {
              direction: 'up',
              percentage: 8.7,
              reason: 'New enterprise deals in negotiation'
            }
          ],
          riskFactors: [
            'Economic uncertainty may delay enterprise decisions',
            '2 large deals at risk due to budget freezes',
            'Team capacity constraints in Q1'
          ],
          opportunities: [
            'Upsell opportunities with existing customers',
            'New market expansion showing early traction',
            'Product feature launches expected to drive demand'
          ],
          lastUpdated: '2024-08-09T12:00:00Z'
        },
        {
          id: 'deals-forecast',
          name: 'Deal Closure Forecast',
          period: selectedPeriod,
          timeframe: selectedPeriod === 'weekly' ? 'Next 12 Weeks' : selectedPeriod === 'monthly' ? 'Next 12 Months' : 'Next 4 Quarters',
          data: generateDealForecastData(selectedPeriod),
          totalPredicted: 156,
          totalActual: 98,
          accuracy: 82.3,
          confidence: 88,
          trends: [
            {
              direction: 'stable',
              percentage: 2.1,
              reason: 'Consistent deal velocity maintained'
            }
          ],
          riskFactors: [
            'Longer sales cycles in enterprise segment',
            'Competitor activity in key accounts'
          ],
          opportunities: [
            'Improved qualification process',
            'New sales tools increasing efficiency'
          ],
          lastUpdated: '2024-08-09T12:00:00Z'
        }
      ]

      const mockMetrics: ForecastMetrics = {
        currentPeriodPrediction: 485000,
        nextPeriodPrediction: 520000,
        predictionAccuracy: 87.5,
        pipelineConfidence: 92,
        timeToClose: 45,
        conversionRate: 68.5,
        growthRate: 15.2,
        riskLevel: 'medium'
      }

      setForecasts(mockForecasts)
      setMetrics(mockMetrics)
      if (!selectedForecast) {
        setSelectedForecast(mockForecasts[0].id)
      }
    } catch (error) {
      console.error('Failed to load forecast data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateForecastData = (period: 'weekly' | 'monthly' | 'quarterly'): ForecastData[] => {
    const data: ForecastData[] = []
    const periods = period === 'weekly' ? 12 : period === 'monthly' ? 12 : 4
    const baseValue = 200000
    
    for (let i = 0; i < periods; i++) {
      const trend = Math.sin(i * 0.5) * 0.3 + 0.1 // Seasonal trend
      const noise = (Math.random() - 0.5) * 0.2
      const growth = i * 0.05
      
      const predicted = Math.round(baseValue * (1 + trend + noise + growth))
      const confidence = Math.round(85 + Math.random() * 10)
      const variance = predicted * 0.15
      
      let actual: number | undefined
      if (i < periods / 2) {
        // Historical data
        actual = Math.round(predicted * (0.85 + Math.random() * 0.3))
      }
      
      data.push({
        period: period === 'weekly' ? `W${i + 1}` : period === 'monthly' ? getMonthName(i) : `Q${i + 1}`,
        actual,
        predicted,
        confidence,
        upperBound: Math.round(predicted + variance),
        lowerBound: Math.round(predicted - variance)
      })
    }
    
    return data
  }

  const generateDealForecastData = (period: 'weekly' | 'monthly' | 'quarterly'): ForecastData[] => {
    const data: ForecastData[] = []
    const periods = period === 'weekly' ? 12 : period === 'monthly' ? 12 : 4
    const baseValue = 15
    
    for (let i = 0; i < periods; i++) {
      const trend = Math.sin(i * 0.4) * 0.2 + 0.05
      const noise = (Math.random() - 0.5) * 0.1
      
      const predicted = Math.round(baseValue * (1 + trend + noise))
      const confidence = Math.round(80 + Math.random() * 15)
      
      let actual: number | undefined
      if (i < periods / 2) {
        actual = Math.round(predicted * (0.8 + Math.random() * 0.4))
      }
      
      data.push({
        period: period === 'weekly' ? `W${i + 1}` : period === 'monthly' ? getMonthName(i) : `Q${i + 1}`,
        actual,
        predicted,
        confidence,
        upperBound: predicted + 3,
        lowerBound: Math.max(0, predicted - 3)
      })
    }
    
    return data
  }

  const getMonthName = (index: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    return months[(currentMonth + index) % 12]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'high':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const selectedForecastData = forecasts.find(f => f.id === selectedForecast)

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
          <h1 className="text-2xl font-bold text-gray-900">Sales Forecasting</h1>
          <p className="text-gray-600 mt-1">AI-powered predictive analytics and sales trends</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'weekly' | 'monthly' | 'quarterly')}
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          <button
            onClick={() => setShowAIInsights(!showAIInsights)}
            className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
              showAIInsights
                ? 'border-purple-300 bg-purple-50 text-purple-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            AI Insights
          </button>
          <button
            onClick={() => selectedForecastData && onExportData?.(selectedForecastData)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            value={formatCurrency(metrics.currentPeriodPrediction)}
            label="Current Period Forecast"
            icon={CurrencyDollarIcon}
            gradient="blue"
            trend={metrics.growthRate}
          />
          <MetricCard
            value={`${metrics.predictionAccuracy}%`}
            label="Prediction Accuracy"
            icon={BoltIcon}
            gradient="emerald"
            trend={2.5}
          />
          <MetricCard
            value={`${metrics.pipelineConfidence}%`}
            label="Pipeline Confidence"
            icon={CheckCircleIcon}
            gradient="violet"
            trend={1.8}
          />
          <MetricCard
            value={`${metrics.timeToClose}d`}
            label="Avg. Time to Close"
            icon={ClockIcon}
            gradient="orange"
            trend={-5}
          />
        </div>
      )}

      {/* Forecast Selection */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {forecasts.map((forecast) => (
            <button
              key={forecast.id}
              onClick={() => setSelectedForecast(forecast.id)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                selectedForecast === forecast.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {forecast.name}
            </button>
          ))}
        </div>
      </div>

      {/* Forecast Details */}
      {selectedForecastData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Area */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedForecastData.name} - {selectedForecastData.timeframe}
              </h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Predicted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Actual</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span>Confidence Range</span>
                </div>
              </div>
            </div>

            {/* Simple Chart Representation */}
            <div className="space-y-4">
              {selectedForecastData.data.map((dataPoint, index) => (
                <div key={dataPoint.period} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-gray-900">
                    {dataPoint.period}
                  </div>
                  <div className="flex-1 relative">
                    <div className="h-8 bg-gray-100 rounded-lg relative overflow-hidden">
                      {/* Confidence range */}
                      <div
                        className="absolute h-full bg-gray-200 rounded"
                        style={{
                          left: '0%',
                          width: `${(dataPoint.upperBound / Math.max(...selectedForecastData.data.map(d => d.upperBound))) * 100}%`
                        }}
                      />
                      {/* Predicted value */}
                      <div
                        className="absolute h-full bg-blue-500 rounded"
                        style={{
                          left: '0%',
                          width: `${(dataPoint.predicted / Math.max(...selectedForecastData.data.map(d => d.upperBound))) * 100}%`
                        }}
                      />
                      {/* Actual value */}
                      {dataPoint.actual && (
                        <div
                          className="absolute h-full bg-green-500 rounded"
                          style={{
                            left: '0%',
                            width: `${(dataPoint.actual / Math.max(...selectedForecastData.data.map(d => d.upperBound))) * 100}%`
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-blue-600 font-medium">
                      {selectedForecastData.id.includes('revenue') 
                        ? formatCurrency(dataPoint.predicted) 
                        : dataPoint.predicted.toString()}
                    </span>
                    {dataPoint.actual && (
                      <span className="text-green-600 font-medium">
                        {selectedForecastData.id.includes('revenue') 
                          ? formatCurrency(dataPoint.actual) 
                          : dataPoint.actual.toString()}
                      </span>
                    )}
                    <span className="text-gray-500">
                      {dataPoint.confidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">
                  {selectedForecastData.id.includes('revenue') 
                    ? formatCurrency(selectedForecastData.totalPredicted) 
                    : selectedForecastData.totalPredicted.toString()}
                </p>
                <p className="text-sm text-gray-500">Total Predicted</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{selectedForecastData.accuracy}%</p>
                <p className="text-sm text-gray-500">Accuracy</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{selectedForecastData.confidence}%</p>
                <p className="text-sm text-gray-500">Confidence</p>
              </div>
            </div>
          </div>

          {/* Insights Panel */}
          <div className="space-y-6">
            {/* Trends */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Trends</h4>
              <div className="space-y-3">
                {selectedForecastData.trends.map((trend, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {trend.direction === 'up' && <TrendingUpIcon className="h-4 w-4 text-green-500" />}
                      {trend.direction === 'down' && <TrendingDownIcon className="h-4 w-4 text-red-500" />}
                      {trend.direction === 'stable' && <ArrowPathIcon className="h-4 w-4 text-gray-500" />}
                    </div>
                    <div>
                      <p className={`font-medium ${
                        trend.direction === 'up' ? 'text-green-700' : 
                        trend.direction === 'down' ? 'text-red-700' : 'text-gray-700'
                      }`}>
                        {trend.percentage > 0 ? '+' : ''}{trend.percentage}%
                      </p>
                      <p className="text-sm text-gray-600">{trend.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors */}
            {showAIInsights && selectedForecastData.riskFactors.length > 0 && (
              <div className="bg-red-50 p-6 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                  <h4 className="text-lg font-medium text-red-900">Risk Factors</h4>
                </div>
                <ul className="space-y-2">
                  {selectedForecastData.riskFactors.map((risk, index) => (
                    <li key={index} className="text-sm text-red-800 flex items-start space-x-2">
                      <div className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Opportunities */}
            {showAIInsights && selectedForecastData.opportunities.length > 0 && (
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <h4 className="text-lg font-medium text-green-900">Opportunities</h4>
                </div>
                <ul className="space-y-2">
                  {selectedForecastData.opportunities.map((opportunity, index) => (
                    <li key={index} className="text-sm text-green-800 flex items-start space-x-2">
                      <div className="w-1 h-1 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Recommendations */}
            {showAIInsights && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-50 p-6 rounded-lg"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <SparklesIcon className="h-5 w-5 text-purple-600" />
                  <h4 className="text-lg font-medium text-purple-900">AI Recommendations</h4>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-purple-800">
                    <strong>Focus Areas:</strong> Based on current trends, prioritize enterprise deals and upsell opportunities with existing customers.
                  </div>
                  <div className="text-sm text-purple-800">
                    <strong>Risk Mitigation:</strong> Increase touchpoints with deals over $50k to prevent slippage.
                  </div>
                  <div className="text-sm text-purple-800">
                    <strong>Optimization:</strong> Deploy additional resources to Q4 pipeline to capture seasonal uptick.
                  </div>
                </div>
              </motion.div>
            )}

            {/* Last Updated */}
            <div className="text-xs text-gray-500 text-center">
              Last updated: {new Date(selectedForecastData.lastUpdated).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}