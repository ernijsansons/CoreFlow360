'use client'

import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface MetricCardProps {
  value: string | number
  label: string
  trend?: number
  icon?: LucideIcon
  gradient?: string
  delay?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

const gradientMap = {
  violet: 'from-violet-500 to-purple-500',
  blue: 'from-blue-500 to-cyan-500',
  emerald: 'from-emerald-500 to-green-500',
  orange: 'from-orange-500 to-red-500',
  pink: 'from-pink-500 to-rose-500',
  cyan: 'from-cyan-500 to-blue-500',
}

const sizeClasses = {
  sm: {
    container: 'p-4',
    value: 'text-2xl',
    label: 'text-sm',
    icon: 'w-5 h-5',
  },
  md: {
    container: 'p-6',
    value: 'text-3xl',
    label: 'text-base',
    icon: 'w-6 h-6',
  },
  lg: {
    container: 'p-8',
    value: 'text-4xl',
    label: 'text-lg',
    icon: 'w-8 h-8',
  },
}

export function MetricCard({
  value,
  label,
  trend,
  icon: Icon,
  gradient = 'violet',
  delay = 0,
  className,
  size = 'md',
  animated = true,
}: MetricCardProps) {
  const gradientClass = gradientMap[gradient as keyof typeof gradientMap] || gradient
  const sizeClass = sizeClasses[size]

  const getTrendIcon = () => {
    if (trend === undefined) return null
    if (trend > 0) return TrendingUp
    if (trend < 0) return TrendingDown
    return Minus
  }

  const getTrendColor = () => {
    if (trend === undefined) return ''
    if (trend > 0) return 'text-emerald-400'
    if (trend < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const TrendIcon = getTrendIcon()

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20, scale: 0.95 } : false}
      animate={animated ? { opacity: 1, y: 0, scale: 1 } : false}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn('group relative', className)}
    >
      {/* Glow effect */}
      <motion.div
        className={cn(
          'absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 blur-xl transition-all duration-500 group-hover:opacity-30',
          gradientClass
        )}
        animate={{
          opacity: [0, 0.2, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Card content */}
      <div
        className={cn(
          'glass-card relative rounded-2xl border border-gray-800/50 bg-gray-900/80 backdrop-blur-sm transition-all duration-300 group-hover:border-gray-700/50',
          sizeClass.container
        )}
      >
        {/* Header with icon */}
        <div className="mb-4 flex items-start justify-between">
          {Icon && (
            <motion.div
              className={cn(
                'flex items-center justify-center rounded-lg bg-gradient-to-r p-2',
                gradientClass
              )}
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Icon className={cn('text-white', sizeClass.icon)} />
            </motion.div>
          )}

          {trend !== undefined && TrendIcon && (
            <div className={cn('flex items-center gap-1', getTrendColor())}>
              <TrendIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        {/* Value with animation */}
        <div className={cn('mb-2 leading-tight font-bold text-white', sizeClass.value)}>
          {animated ? (
            <CountUpAnimation value={value} />
          ) : (
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {value}
            </span>
          )}
        </div>

        {/* Label */}
        <div className={cn('font-medium text-gray-400', sizeClass.label)}>{label}</div>

        {/* Animated background pulse */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-5',
            gradientClass
          )}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className={cn('absolute h-1 w-1 rounded-full bg-gradient-to-r', gradientClass)}
              initial={{
                x: Math.random() * 100,
                y: 100,
                opacity: 0,
              }}
              animate={{
                y: -20,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Count up animation for numeric values
function CountUpAnimation({ value }: { value: string | number }) {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value

  if (isNaN(numericValue)) {
    return (
      <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        {value}
      </span>
    )
  }

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
    >
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        {typeof value === 'string' && value.includes('%') ? (
          <>
            <CountUp end={numericValue} />%
          </>
        ) : typeof value === 'string' && value.includes('$') ? (
          <>
            $<CountUp end={numericValue} />
          </>
        ) : typeof value === 'string' && value === '∞' ? (
          '∞'
        ) : (
          <CountUp end={numericValue} />
        )}
      </motion.span>
    </motion.span>
  )
}

// Simple count up component
function CountUp({ end }: { end: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000 // 2 seconds
    const steps = 60
    const increment = end / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [end])

  return <span>{count}</span>
}
