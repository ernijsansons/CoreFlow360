'use client'

import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Clock, Star } from 'lucide-react'

interface CustomerStoryCardProps {
  name: string
  title?: string
  company?: string
  avatar?: string
  beforeText: string
  afterText: string
  metric: {
    value: string
    label: string
    type: 'money' | 'percentage' | 'time' | 'generic'
    trend?: 'up' | 'down'
  }
  delay?: number
  gradient?: 'violet' | 'emerald' | 'blue' | 'orange' | 'red' | 'cyan'
}

export function CustomerStoryCard({
  name,
  title,
  company,
  avatar,
  beforeText,
  afterText,
  metric,
  delay = 0,
  gradient = 'violet',
}: CustomerStoryCardProps) {
  const gradientClasses = {
    violet: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
    emerald: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    orange: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
    red: 'from-red-500/20 to-pink-500/20 border-red-500/30',
    cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
  }

  const getMetricIcon = () => {
    switch (metric.type) {
      case 'money':
        return <DollarSign className="h-4 w-4" />
      case 'percentage':
      case 'generic':
        return <TrendingUp className="h-4 w-4" />
      case 'time':
        return <Clock className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  const getMetricColor = () => {
    const colors = {
      violet: 'text-violet-400',
      emerald: 'text-emerald-400',
      blue: 'text-blue-400',
      orange: 'text-orange-400',
      red: 'text-red-400',
      cyan: 'text-cyan-400',
    }
    return colors[gradient]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative cursor-pointer"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradientClasses[gradient]} rounded-2xl opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100`}
      />

      <div
        className={`group-hover:border-opacity-70 relative rounded-2xl border bg-gray-900/60 p-6 backdrop-blur-sm transition-all duration-300 ${gradientClasses[gradient].split(' ')[1]}`}
      >
        {/* Customer Info */}
        <div className="mb-4 flex items-center">
          {avatar ? (
            <img src={avatar} alt={name} className="mr-4 h-12 w-12 rounded-full object-cover" />
          ) : (
            <div
              className={`mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r text-lg font-bold text-white ${gradientClasses[gradient].replace('/20', '/60').replace('border-', 'from-').split(' ')[0]} ${gradientClasses[gradient].replace('/20', '/40').replace('border-', 'to-').split(' ')[1]}`}
            >
              {name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
          )}
          <div>
            <div className="text-lg font-semibold text-white">{name}</div>
            {title && <div className="text-sm text-gray-400">{title}</div>}
            {company && <div className="text-xs text-gray-500">{company}</div>}
          </div>
        </div>

        {/* Before/After */}
        <div className="mb-6 space-y-4">
          <div>
            <div className="mb-1 text-sm font-medium text-gray-400">Before CoreFlow360:</div>
            <div className="text-sm text-gray-300 italic">"{beforeText}"</div>
          </div>

          <div>
            <div className="mb-1 text-sm font-medium text-gray-400">After 30 days:</div>
            <div className="text-sm font-medium text-white">"{afterText}"</div>
          </div>
        </div>

        {/* Metric */}
        <div className="border-t border-gray-700/50 pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">{metric.label}</div>
            <div className={`flex items-center gap-1 ${getMetricColor()} text-lg font-bold`}>
              {getMetricIcon()}
              <span>{metric.value}</span>
              {metric.trend === 'up' && <TrendingUp className="ml-1 h-4 w-4" />}
            </div>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="mt-3 flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-4 w-4 fill-current ${getMetricColor()}`} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
