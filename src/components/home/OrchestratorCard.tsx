'use client'

import { motion } from 'framer-motion'

interface OrchestratorCardProps {
  icon: string
  title: string
  description: string
  delay?: number
}

export function OrchestratorCard({ icon, title, description, delay = 0 }: OrchestratorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative cursor-pointer"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/20 to-cyan-500/20 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100" />

      <div className="relative rounded-2xl border border-gray-800/50 bg-gray-900/60 p-6 text-center backdrop-blur-sm transition-all duration-300 group-hover:border-gray-700/50">
        <div className="mb-4 text-4xl">{icon}</div>
        <h3 className="mb-3 text-xl font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>

        {/* AI Badge */}
        <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-xs font-bold text-white">
          AI
        </div>
      </div>
    </motion.div>
  )
}
