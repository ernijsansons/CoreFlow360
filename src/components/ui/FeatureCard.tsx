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
  cyan: 'from-cyan-500 to-blue-500',
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
  features,
}: FeatureCardProps) {
  const gradientClass = gradientMap[gradient as keyof typeof gradientMap] || gradient

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={cn('group relative cursor-pointer', className)}
      onClick={onClick}
    >
      {/* Glow effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-30',
          gradientClass
        )}
      />

      {/* Card content */}
      <div className="relative h-full rounded-2xl border border-gray-800/50 bg-gray-900/80 p-6 backdrop-blur-sm transition-all duration-300 group-hover:border-gray-700/50 group-hover:bg-gray-900/90 group-hover:shadow-2xl">
        {/* Icon */}
        <div className="mb-4">
          <div
            className={cn(
              'flex h-12 w-12 transform items-center justify-center rounded-xl bg-gradient-to-r transition-transform duration-300 group-hover:scale-110',
              gradientClass
            )}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Title and stats */}
        <div className="mb-3">
          <h3 className="mb-1 text-xl font-semibold text-white transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-cyan-400 group-hover:bg-clip-text group-hover:text-transparent">
            {title}
          </h3>
          {stats && (
            <div
              className={cn(
                'bg-gradient-to-r bg-clip-text text-sm font-medium text-transparent',
                gradientClass
              )}
            >
              {stats}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
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
                transition={{ duration: 0.3, delay: delay + index * 0.1 }}
                className="flex items-center gap-2"
              >
                <div
                  className={cn(
                    'h-1.5 w-1.5 animate-pulse rounded-full bg-gradient-to-r',
                    gradientClass
                  )}
                />
                <span className="text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-400">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Hover arrow */}
        <motion.div
          className="absolute top-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          initial={false}
          animate={{ x: 0 }}
          whileHover={{ x: 2 }}
        >
          <div
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r',
              gradientClass
            )}
          >
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
