/**
 * CoreFlow360 - Data Freshness Indicator Component
 * Shows users when data was last updated and if it's stale
 */

'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow, isAfter, subMinutes } from 'date-fns'
import { Clock, RefreshCw, AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface DataFreshnessProps {
  cachedAt: Date
  expiresAt: Date
  isStale: boolean
  isRefreshing?: boolean
  onRefresh?: () => void
  className?: string
  showDetails?: boolean
  variant?: 'minimal' | 'detailed' | 'badge'
}

export function DataFreshnessIndicator({
  cachedAt,
  expiresAt,
  isStale,
  isRefreshing = false,
  onRefresh,
  className,
  showDetails = true,
  variant = 'detailed',
}: DataFreshnessProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isOnline, setIsOnline] = useState(true)

  // Update current time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const timeAgo = formatDistanceToNow(cachedAt, { addSuffix: true })
  const isVeryStale = isAfter(currentTime, subMinutes(expiresAt, -30)) // 30 minutes past expiry
  const isExpiringSoon = isAfter(subMinutes(expiresAt, 2), currentTime) // Expires in 2 minutes

  const getFreshnessStatus = () => {
    if (!isOnline) return 'offline'
    if (isRefreshing) return 'refreshing'
    if (isVeryStale) return 'very_stale'
    if (isStale) return 'stale'
    if (isExpiringSoon) return 'expiring'
    return 'fresh'
  }

  const status = getFreshnessStatus()

  const statusConfig = {
    fresh: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Fresh',
      description: 'Data is up to date',
    },
    expiring: {
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      label: 'Expiring soon',
      description: 'Data will be refreshed shortly',
    },
    stale: {
      icon: RefreshCw,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      label: 'Refreshing',
      description: 'Showing cached data while updating',
    },
    very_stale: {
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Stale',
      description: 'Data may be outdated',
    },
    refreshing: {
      icon: RefreshCw,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: 'Updating',
      description: 'Fetching latest data',
    },
    offline: {
      icon: WifiOff,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      label: 'Offline',
      description: 'Showing cached data',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center space-x-1 text-xs', className)}>
        <Icon className={cn('h-3 w-3', config.color, isRefreshing && 'animate-spin')} />
        <span className={config.color}>{timeAgo}</span>
      </div>
    )
  }

  if (variant === 'badge') {
    return (
      <div
        className={cn(
          'inline-flex items-center space-x-1 rounded-full border px-2 py-1 text-xs font-medium',
          config.bgColor,
          config.borderColor,
          config.color,
          className
        )}
      >
        <Icon className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
        <span>{config.label}</span>
      </div>
    )
  }

  return (
    <motion.div
      className={cn(
        'flex items-center justify-between rounded-lg border p-3',
        config.bgColor,
        config.borderColor,
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center space-x-2">
        <Icon className={cn('h-4 w-4', config.color, isRefreshing && 'animate-spin')} />
        <div className="flex flex-col">
          <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
          {showDetails && (
            <span className="text-xs text-gray-600">
              {config.description} • Updated {timeAgo}
            </span>
          )}
        </div>
      </div>

      {onRefresh && (status === 'stale' || status === 'very_stale') && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={cn(
            'flex items-center space-x-1 rounded px-2 py-1 text-xs font-medium transition-colors',
            'hover:bg-white/50 focus:ring-2 focus:ring-offset-1 focus:outline-none',
            config.color,
            isRefreshing && 'cursor-not-allowed opacity-50'
          )}
        >
          <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
          <span>Refresh</span>
        </button>
      )}

      {!isOnline && (
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <WifiOff className="h-3 w-3" />
          <span>Offline</span>
        </div>
      )}
    </motion.div>
  )
}

// Higher-order component for automatic data freshness
export function withDataFreshness<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>
) {
  return function DataFreshnessWrapper(
    props: T & {
      cachedData?: {
        cachedAt: Date
        expiresAt: Date
        isStale: boolean
      }
      onRefresh?: () => void
    }
  ) {
    const { cachedData, onRefresh, ...componentProps } = props

    if (!cachedData) {
      return <Component {...(componentProps as T)} />
    }

    return (
      <div className="space-y-4">
        <DataFreshnessIndicator
          cachedAt={cachedData.cachedAt}
          expiresAt={cachedData.expiresAt}
          isStale={cachedData.isStale}
          onRefresh={onRefresh}
          variant="badge"
          className="ml-auto"
        />
        <Component {...(componentProps as T)} />
      </div>
    )
  }
}

// Hook for data freshness state
export function useDataFreshness(cachedAt: Date, expiresAt: Date, refreshInterval?: number) {
  const [isStale, setIsStale] = useState(false)
  const [isExpiringSoon, setIsExpiringSoon] = useState(false)
  const [timeUntilStale, setTimeUntilStale] = useState<number>(0)

  useEffect(() => {
    const checkFreshness = () => {
      const now = new Date()
      const isCurrentlyStale = isAfter(now, expiresAt)
      const willExpireSoon = isAfter(subMinutes(expiresAt, 2), now)
      const timeLeft = Math.max(0, expiresAt.getTime() - now.getTime())

      setIsStale(isCurrentlyStale)
      setIsExpiringSoon(willExpireSoon)
      setTimeUntilStale(timeLeft)
    }

    // Check immediately
    checkFreshness()

    // Set up interval to check freshness
    const interval = setInterval(checkFreshness, refreshInterval || 30000)

    return () => clearInterval(interval)
  }, [cachedAt, expiresAt, refreshInterval])

  return {
    isStale,
    isExpiringSoon,
    timeUntilStale,
    timeAgo: formatDistanceToNow(cachedAt, { addSuffix: true }),
  }
}

export default DataFreshnessIndicator
