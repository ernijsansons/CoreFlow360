'use client'

import { motion } from 'framer-motion'
import { Sparkles, DollarSign, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export function ProgressivePricingPreview() {
  const savings = [
    { businesses: 1, discount: 0, label: '1st Business', monthly: 179 },
    { businesses: 2, discount: 20, label: '2nd Business', monthly: 143 },
    { businesses: 3, discount: 35, label: '3rd Business', monthly: 116 },
    { businesses: 4, discount: 45, label: '4th Business', monthly: 98 },
    { businesses: 5, discount: 50, label: '5th+ Business', monthly: 89 },
  ]

  return (
    <section className="py-20 bg-gradient-to-r from-green-950/20 to-emerald-950/20">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-green-400" />
            <span className="text-green-400 font-semibold">REVOLUTIONARY PRICING</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            The More You Grow, The More You Save
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Our progressive pricing model rewards your success. Add more businesses and unlock deeper discounts automatically.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <motion.div
            className="bg-gray-900/50 rounded-2xl p-8 border border-green-500/30"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-5 gap-4 mb-8">
              {savings.map((tier, index) => (
                <motion.div
                  key={tier.businesses}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="mb-2">
                    {tier.discount > 0 && (
                      <Badge className="bg-green-600 text-white mb-2">
                        {tier.discount}% OFF
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">{tier.label}</div>
                  <div className="text-2xl font-bold text-white">${tier.monthly}</div>
                  <div className="text-xs text-gray-500">/month</div>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-gray-800 pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-5 w-5 text-green-400" />
                    <span className="text-lg font-semibold">Example: 3 Businesses</span>
                  </div>
                  <div className="text-gray-400">
                    Traditional: <span className="line-through">$537/mo</span>
                    <span className="text-green-400 font-bold ml-2">You Pay: $438/mo</span>
                  </div>
                  <div className="text-sm text-green-400 mt-1">
                    Saving $99/month = $1,188/year
                  </div>
                </div>
                
                <Link 
                  href="/pricing/progressive"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
                >
                  <DollarSign className="h-5 w-5" />
                  Calculate Your Savings
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-400">
              Join <span className="text-white font-semibold">347+ multi-business owners</span> already saving with progressive pricing
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}