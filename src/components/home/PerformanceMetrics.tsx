'use client'

import { motion } from 'framer-motion'
import { Zap, TrendingUp, Bot, Shield } from 'lucide-react'
import { MetricCard } from '@/components/ui/MetricCard'
import { AI_CONFIG } from '@/config/ai.config'

export function PerformanceMetrics() {
  return (
    <section className="bg-black py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="heading-section mb-6 text-white">
            AI Performance <span className="gradient-text-ai">Beyond Human.</span>
          </h2>
          <p className="text-body-large text-gray-400">
            When AI runs your business, the impossible becomes inevitable. These aren&apos;t just
            metrics—they&apos;re the new standard.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            value={AI_CONFIG.performance.responseTime}
            label="AI Agent Response Time"
            icon={Zap}
            gradient="violet"
            delay={0.1}
          />
          <MetricCard
            value={AI_CONFIG.performance.accuracy}
            label="Prediction Accuracy"
            icon={TrendingUp}
            trend={12}
            gradient="emerald"
            delay={0.2}
          />
          <MetricCard
            value="24/7/365"
            label="AI Agent Availability"
            icon={Bot}
            gradient="cyan"
            delay={0.3}
          />
          <MetricCard
            value={AI_CONFIG.performance.availability}
            label="Platform Uptime"
            icon={Shield}
            gradient="orange"
            delay={0.4}
          />
        </div>
      </div>
    </section>
  )
}
