'use client'

import { motion } from 'framer-motion'
import { DollarSign, Clock, TrendingUp } from 'lucide-react'

export function FloatingMetrics() {
  return (
    <div className="absolute top-32 right-8 z-30 hidden space-y-4 xl:block">
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className="rounded-xl border border-emerald-500/30 bg-gray-900/80 p-4 text-center backdrop-blur-sm"
      >
        <div className="text-2xl font-bold text-emerald-400">19/20</div>
        <div className="text-xs text-gray-400">Right Every Time</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="rounded-xl border border-blue-500/30 bg-gray-900/80 p-4 text-center backdrop-blur-sm"
      >
        <div className="text-2xl font-bold text-blue-400">Instant</div>
        <div className="text-xs text-gray-400">Answers</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="rounded-xl border border-violet-500/30 bg-gray-900/80 p-4 text-center backdrop-blur-sm"
      >
        <div className="gradient-text-ai text-2xl font-bold">24/7</div>
        <div className="text-xs text-gray-400">Never Sleeps</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="rounded-xl border border-orange-500/30 bg-gray-900/80 p-4 text-center backdrop-blur-sm"
      >
        <div className="flex items-center justify-center">
          <DollarSign className="mr-1 h-4 w-4 text-orange-400" />
          <div className="text-xl font-bold text-orange-400">$247K</div>
        </div>
        <div className="text-xs text-gray-400">Sarah's AI Found</div>
      </motion.div>
    </div>
  )
}
