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
  gradient = 'violet'
}: CustomerStoryCardProps) {
  const gradientClasses = {
    violet: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
    emerald: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    orange: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
    red: 'from-red-500/20 to-pink-500/20 border-red-500/30',
    cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30'
  }

  const getMetricIcon = () => {
    switch (metric.type) {
      case 'money':
        return <DollarSign className="w-4 h-4" />
      case 'percentage':
      case 'generic':
        return <TrendingUp className="w-4 h-4" />
      case 'time':
        return <Clock className="w-4 h-4" />
      default:
        return <Star className="w-4 h-4" />
    }
  }

  const getMetricColor = () => {
    const colors = {
      violet: 'text-violet-400',
      emerald: 'text-emerald-400',
      blue: 'text-blue-400',
      orange: 'text-orange-400',
      red: 'text-red-400',
      cyan: 'text-cyan-400'
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
      className="relative group cursor-pointer"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${gradientClasses[gradient]} opacity-0 group-hover:opacity-100 rounded-2xl blur-xl transition-all duration-500`} />
      
      <div className={`relative bg-gray-900/60 backdrop-blur-sm border rounded-2xl p-6 group-hover:border-opacity-70 transition-all duration-300 ${gradientClasses[gradient].split(' ')[1]}`}>
        {/* Customer Info */}
        <div className="flex items-center mb-4">
          {avatar ? (
            <img 
              src={avatar} 
              alt={name}
              className="w-12 h-12 rounded-full mr-4 object-cover"
            />
          ) : (
            <div className={`w-12 h-12 rounded-full mr-4 flex items-center justify-center text-white font-bold text-lg bg-gradient-to-r ${gradientClasses[gradient].replace('/20', '/60').replace('border-', 'from-').split(' ')[0]} ${gradientClasses[gradient].replace('/20', '/40').replace('border-', 'to-').split(' ')[1]}`}>
              {name.split(' ').map(n => n[0]).join('')}
            </div>
          )}
          <div>
            <div className="text-white font-semibold text-lg">{name}</div>
            {title && <div className="text-gray-400 text-sm">{title}</div>}
            {company && <div className="text-gray-500 text-xs">{company}</div>}
          </div>
        </div>

        {/* Before/After */}
        <div className="space-y-4 mb-6">
          <div>
            <div className="text-gray-400 text-sm font-medium mb-1">Before CoreFlow360:</div>
            <div className="text-gray-300 text-sm italic">"{beforeText}"</div>
          </div>
          
          <div>
            <div className="text-gray-400 text-sm font-medium mb-1">After 30 days:</div>
            <div className="text-white text-sm font-medium">"{afterText}"</div>
          </div>
        </div>

        {/* Metric */}
        <div className="border-t border-gray-700/50 pt-4">
          <div className="flex items-center justify-between">
            <div className="text-gray-400 text-sm">{metric.label}</div>
            <div className={`flex items-center gap-1 ${getMetricColor()} font-bold text-lg`}>
              {getMetricIcon()}
              <span>{metric.value}</span>
              {metric.trend === 'up' && <TrendingUp className="w-4 h-4 ml-1" />}
            </div>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex items-center mt-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 fill-current ${getMetricColor()}`} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}