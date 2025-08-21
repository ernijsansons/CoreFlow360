'use client'

import { motion } from 'framer-motion'
import { Building, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'

export function MultiBusinessShowcase() {
  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">
            Built for Business Empires
          </h2>
          <p className="text-xl text-gray-400">
            Manage 1 or 100 businesses from one platform
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div 
            className="p-6 rounded-xl bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Building className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Multi-Business Management</h3>
            <p className="text-gray-400 mb-4">
              Switch between businesses instantly. Manage each independently or view portfolio analytics.
            </p>
            <Link href="/dashboard/portfolio" className="text-blue-400 hover:text-blue-300">
              Explore Portfolio View →
            </Link>
          </motion.div>
          
          <motion.div 
            className="p-6 rounded-xl bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <DollarSign className="h-12 w-12 text-green-400 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Progressive Savings</h3>
            <p className="text-gray-400 mb-4">
              2nd business: 20% off. 3rd: 35% off. 4th+: 50% off. Save thousands as you grow.
            </p>
            <Link href="/pricing/progressive" className="text-green-400 hover:text-green-300">
              Calculate Savings →
            </Link>
          </motion.div>
          
          <motion.div 
            className="p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <TrendingUp className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Unified Analytics</h3>
            <p className="text-gray-400 mb-4">
              See performance across all businesses. Identify top performers and growth opportunities.
            </p>
            <Link href="/analytics/portfolio" className="text-purple-400 hover:text-purple-300">
              View Demo →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}