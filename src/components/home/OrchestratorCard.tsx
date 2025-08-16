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
      className="relative group cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 rounded-2xl blur-xl transition-all duration-500" />
      
      <div className="relative bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 text-center group-hover:border-gray-700/50 transition-all duration-300">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
        
        {/* AI Badge */}
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-xs rounded-full w-8 h-8 flex items-center justify-center font-bold">
          AI
        </div>
      </div>
    </motion.div>
  )
}