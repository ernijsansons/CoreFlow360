'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  stats?: string
  gradient?: string
  delay?: number
  className?: string
  onClick?: () => void
  features?: string[]
}

const gradientMap = {
  violet: 'from-violet-500 to-purple-500',
  blue: 'from-blue-500 to-cyan-500',
  emerald: 'from-emerald-500 to-green-500',
  orange: 'from-orange-500 to-red-500',
  pink: 'from-pink-500 to-rose-500',
  cyan: 'from-cyan-500 to-blue-500'
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  stats,
  gradient = 'from-violet-500 to-purple-500',
  delay = 0,
  className,
  onClick,
  features
}: FeatureCardProps) {
  const gradientClass = gradientMap[gradient as keyof typeof gradientMap] || gradient

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={cn(
        'relative group cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Glow effect */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-30 rounded-2xl blur-2xl transition-all duration-500',
        gradientClass
      )} />
      
      {/* Card content */}
      <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 h-full transition-all duration-300 group-hover:border-gray-700/50 group-hover:bg-gray-900/90 group-hover:shadow-2xl">
        {/* Icon */}
        <div className="mb-4">
          <div className={cn(
            'w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110',
            gradientClass
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Title and stats */}
        <div className="mb-3">
          <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-cyan-400 transition-all duration-300">
            {title}
          </h3>
          {stats && (
            <div className={cn(
              'text-sm font-medium bg-gradient-to-r bg-clip-text text-transparent',
              gradientClass
            )}>
              {stats}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm leading-relaxed mb-4 group-hover:text-gray-300 transition-colors duration-300">
          {description}
        </p>

        {/* Features list */}
        {features && features.length > 0 && (
          <div className="space-y-2">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: delay + (index * 0.1) }}
                className="flex items-center gap-2"
              >
                <div className={cn(
                  'w-1.5 h-1.5 rounded-full bg-gradient-to-r animate-pulse',
                  gradientClass
                )} />
                <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Hover arrow */}
        <motion.div
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
          animate={{ x: 0 }}
          whileHover={{ x: 2 }}
        >
          <div className={cn(
            'w-6 h-6 rounded-full bg-gradient-to-r flex items-center justify-center',
            gradientClass
          )}>
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}