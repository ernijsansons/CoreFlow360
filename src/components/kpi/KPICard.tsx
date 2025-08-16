/**
 * CoreFlow360 - KPI Card Component
 * World-class KPI visualization with interactive drill-down
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Users,
  DollarSign
} from 'lucide-react'

export interface KPICardProps {
  kpi: {
    key: string
    name: string
    value: number
    displayValue?: string
    previousValue?: number
    change?: number
    changePercent?: number
    trend: 'up' | 'down' | 'stable'
    status: 'good' | 'warning' | 'critical' | 'neutral'
    target?: number
    benchmark?: number
    unit?: string
    format: 'number' | 'currency' | 'percentage' | 'ratio'
    category?: 'FINANCIAL' | 'OPERATIONAL' | 'GROWTH' | 'CUSTOMER'
    description?: string
    lastUpdated?: Date
  }
  size?: 'small' | 'medium' | 'large'
  showChart?: boolean
  onDrillDown?: (kpiKey: string) => void
  className?: string
}

const CATEGORY_CONFIG = {
  FINANCIAL: { icon: DollarSign, color: 'text-green-600 bg-green-50' },
  OPERATIONAL: { icon: Activity, color: 'text-blue-600 bg-blue-50' },
  GROWTH: { icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
  CUSTOMER: { icon: Users, color: 'text-orange-600 bg-orange-50' }
}

export function KPICard({ 
  kpi, 
  size = 'medium', 
  showChart = false,
  onDrillDown,
  className = '' 
}: KPICardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const formatValue = (value: number) => {
    if (kpi.displayValue) return kpi.displayValue
    
    switch (kpi.format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: value >= 1000000 ? 1 : 0,
          maximumFractionDigits: value >= 1000000 ? 1 : 0
        }).format(value >= 1000000 ? value / 1000000 : value >= 1000 ? value / 1000 : value) + 
        (value >= 1000000 ? 'M' : value >= 1000 ? 'K' : '')
      
      case 'percentage':
        return `${value.toFixed(1)}%`
      
      case 'ratio':
        return `${value.toFixed(2)}:1`
      
      default:
        return value.toLocaleString()
    }
  }

  const getTrendIcon = () => {
    switch (kpi.trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />
      case 'down': return <TrendingDown className="w-4 h-4" />
      default: return <Minus className="w-4 h-4" />
    }
  }

  const getTrendColor = () => {
    // For some metrics, down is good (like churn rate, costs)
    const reverseTrendMetrics = ['churn', 'cost', 'bounce', 'abandon']
    const isReverseTrend = reverseTrendMetrics.some(term => 
      kpi.key.toLowerCase().includes(term) || kpi.name.toLowerCase().includes(term)
    )
    
    if (kpi.trend === 'up') {
      return isReverseTrend ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
    } else if (kpi.trend === 'down') {
      return isReverseTrend ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
    }
    return 'text-gray-600 bg-gray-50'
  }

  const getStatusConfig = () => {
    switch (kpi.status) {
      case 'good':
        return {
          icon: CheckCircle,
          color: 'text-green-600 bg-green-50',
          border: 'border-green-200'
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600 bg-yellow-50',
          border: 'border-yellow-200'
        }
      case 'critical':
        return {
          icon: AlertTriangle,
          color: 'text-red-600 bg-red-50',
          border: 'border-red-200'
        }
      default:
        return {
          icon: Info,
          color: 'text-blue-600 bg-blue-50',
          border: 'border-blue-200'
        }
    }
  }

  const getTargetProgress = () => {
    if (!kpi.target) return 0
    return Math.min((kpi.value / kpi.target) * 100, 100)
  }

  const categoryConfig = CATEGORY_CONFIG[kpi.category as keyof typeof CATEGORY_CONFIG]
  const statusConfig = getStatusConfig()
  const trendColor = getTrendColor()
  const targetProgress = getTargetProgress()

  const sizeClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${statusConfig.border} hover:shadow-md transition-all duration-200 ${sizeClasses[size]} ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {categoryConfig && (
              <div className={`p-1 rounded ${categoryConfig.color}`}>
                <categoryConfig.icon className="w-3 h-3" />
              </div>
            )}
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {kpi.name}
            </h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Info className="w-3 h-3 text-gray-400" />
            </button>
          </div>
          
          {kpi.description && showDetails && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {kpi.description}
            </p>
          )}
        </div>

        <div className={`p-2 rounded-full ${statusConfig.color}`}>
          <statusConfig.icon className="w-4 h-4" />
        </div>
      </div>

      {/* Main Value */}
      <div className="mb-4">
        <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {formatValue(kpi.value)}
        </p>
        
        {kpi.unit && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {kpi.unit}
          </p>
        )}
      </div>

      {/* Change Indicator */}
      {kpi.changePercent !== undefined && (
        <div className={`inline-flex items-center space-x-2 px-2 py-1 rounded-full text-sm font-medium ${trendColor} mb-3`}>
          {getTrendIcon()}
          <span>
            {kpi.changePercent > 0 ? '+' : ''}{kpi.changePercent.toFixed(1)}%
          </span>
          <span className="text-xs opacity-75">vs last period</span>
        </div>
      )}

      {/* Target Progress */}
      {kpi.target && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>Progress to Target</span>
            <span>{formatValue(kpi.target)}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${targetProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                targetProgress >= 100 ? 'bg-green-500' :
                targetProgress >= 75 ? 'bg-blue-500' :
                targetProgress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
          </div>
        </div>
      )}

      {/* Benchmark Comparison */}
      {kpi.benchmark && showDetails && (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span>Industry Benchmark</span>
          <div className="flex items-center space-x-2">
            <span>{formatValue(kpi.benchmark)}</span>
            {kpi.value > kpi.benchmark ? (
              <ArrowUpRight className="w-3 h-3 text-green-500" />
            ) : (
              <ArrowDownRight className="w-3 h-3 text-red-500" />
            )}
          </div>
        </div>
      )}

      {/* Mini Chart Placeholder */}
      {showChart && (
        <div className="h-12 flex items-center justify-center text-gray-400 border border-gray-200 dark:border-gray-700 rounded mb-3">
          <LineChart className="w-6 h-6 mr-2" />
          <span className="text-xs">Mini chart would go here</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        {kpi.lastUpdated && (
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>Updated {kpi.lastUpdated.toLocaleDateString()}</span>
          </div>
        )}
        
        {onDrillDown && (
          <button
            onClick={() => onDrillDown(kpi.key)}
            className="flex items-center space-x-1 text-xs text-purple-600 hover:text-purple-700 font-medium"
          >
            <BarChart3 className="w-3 h-3" />
            <span>Drill Down</span>
          </button>
        )}
      </div>

      {/* Detailed Metrics Panel */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-2 gap-3 text-xs">
              {kpi.previousValue && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Previous</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatValue(kpi.previousValue)}
                  </p>
                </div>
              )}
              
              {kpi.change && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Absolute Change</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {kpi.change > 0 ? '+' : ''}{formatValue(kpi.change)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-gray-500 dark:text-gray-400">Status</p>
                <p className="font-semibold capitalize text-gray-900 dark:text-white">
                  {kpi.status}
                </p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Category</p>
                <p className="font-semibold capitalize text-gray-900 dark:text-white">
                  {kpi.category?.toLowerCase().replace('_', ' ')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}