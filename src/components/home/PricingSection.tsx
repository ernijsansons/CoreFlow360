'use client'

import { motion } from 'framer-motion'
import { Clock, DollarSign, TrendingUp, Shield } from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

export function PricingSection() {
  const { trackEvent } = useTrackEvent()
  
  return (
    <section id="pricing" className="py-24 bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* The Reality Check */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-8 mb-12 max-w-4xl mx-auto">
            <div className="text-2xl font-bold text-white mb-4">
              The Average Business Owner's Time is Worth <span className="text-red-400">$500/Hour</span>
            </div>
            <div className="text-lg text-gray-300 mb-4">
              You're wasting 20 hours/week on tasks AI could do.
            </div>
            <div className="text-3xl font-bold text-red-400">
              That's <span className="text-red-300">$40,000/month</span> in lost opportunity.
            </div>
          </div>
          
          <h2 className="heading-section text-white mb-6">
            Only Pay for What <span className="gradient-text-ai">Makes You Money</span>
          </h2>
          <p className="text-body-large text-gray-400 max-w-3xl mx-auto">
            Stop buying software. Start investing in results. 
            Every dollar you spend should make you $10 back. That's exactly what happens here.
          </p>
        </motion.div>

        {/* The Investment Options */}
        <div className="grid md:grid-cols-4 gap-6">
          {/* FREE: One AI Agent Forever */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.0 }}
            className="bg-gradient-to-b from-emerald-900/40 to-green-900/40 border border-emerald-500/60 rounded-2xl p-6 relative scale-105"
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-1 rounded-full text-xs font-semibold">
                FOREVER FREE
              </span>
            </div>
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">One AI Agent</h3>
              <div className="text-4xl font-bold gradient-text-ai mb-1">
                FREE<span className="text-sm text-gray-400">/forever</span>
              </div>
              <p className="text-gray-400 text-sm">Pick your favorite AI employee</p>
            </div>
            
            <div className="mb-6">
              <div className="text-center text-gray-300 mb-3 text-sm">You get:</div>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 mt-1.5"></div>
                  <span>Choose 1 AI employee forever</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 mt-1.5"></div>
                  <span>Full access to that agent</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 mt-1.5"></div>
                  <span>24/7 availability</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 mt-1.5"></div>
                  <span>No credit card ever</span>
                </li>
              </ul>
            </div>

            <div className="text-center mb-4 text-xs">
              <div className="text-emerald-400 font-semibold mb-1">Value Example:</div>
              <div className="text-gray-300">AI Sales Agent finds 1 deal/month</div>
              <div className="text-emerald-400 font-bold">Value: $5,000+ FREE</div>
            </div>

            <div onClick={() => trackEvent('pricing_free_clicked', { pricing_tier: 'free' })}>
              <GlowingButton href="/ai-agent-selection" className="w-full text-sm py-2">
                Pick Your AI Employee
              </GlowingButton>
            </div>
          </motion.div>
          
          {/* Starter: Test the Waters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Get Started</h3>
              <div className="text-4xl font-bold gradient-text-ai mb-2">
                $49<span className="text-sm text-gray-400">/user</span>
              </div>
              <p className="text-gray-400">Pick 3 AI employees</p>
            </div>
            
            <div className="mb-8">
              <div className="text-center text-gray-300 mb-4">Perfect if you:</div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                  <span>Want to see what AI can do without a big commitment</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                  <span>Run a small business (under 10 employees)</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                  <span>Need help with specific tasks, not everything</span>
                </li>
              </ul>
            </div>

            <div className="text-center mb-6 text-sm">
              <div className="text-emerald-400 font-semibold mb-2">ROI Calculator:</div>
              <div className="text-gray-300">Save 5 hours/week = <span className="text-emerald-400">$10,000/month value</span></div>
              <div className="text-gray-300">Cost: $49/month</div>
              <div className="text-emerald-400 font-bold">ROI: 20,308%</div>
            </div>

            <div onClick={() => trackEvent('pricing_starter_clicked', { pricing_tier: 'starter' })}>
              <GlowingButton href="/demo/subscription-simulator" variant="outline" className="w-full">
                Try for Free
              </GlowingButton>
            </div>
          </motion.div>

          {/* Business: The Sweet Spot - Most Popular */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-b from-violet-900/30 to-cyan-900/30 border border-violet-500/50 rounded-2xl p-6 relative"
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">The Sweet Spot</h3>
              <div className="text-4xl font-bold gradient-text-ai mb-2">
                $99<span className="text-sm text-gray-400">/user</span>
              </div>
              <p className="text-gray-400">All AI employees included</p>
            </div>
            
            <div className="mb-8">
              <div className="text-center text-gray-300 mb-4">Perfect if you:</div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-violet-500 rounded-full mr-3 mt-2"></div>
                  <span>Want your business to run without you</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-violet-500 rounded-full mr-3 mt-2"></div>
                  <span>Have 10-100 employees</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-violet-500 rounded-full mr-3 mt-2"></div>
                  <span>Want maximum ROI on AI investment</span>
                </li>
              </ul>
            </div>

            <div className="text-center mb-6 text-sm">
              <div className="text-emerald-400 font-semibold mb-2">ROI Calculator:</div>
              <div className="text-gray-300">Save 15 hours/week = <span className="text-emerald-400">$30,000/month value</span></div>
              <div className="text-gray-300">Cost: $99/month</div>
              <div className="text-emerald-400 font-bold">ROI: 30,203%</div>
            </div>

            <div onClick={() => trackEvent('pricing_business_clicked', { pricing_tier: 'business' })}>
              <GlowingButton href="/demo/subscription-simulator" className="w-full">
                Start Making Money
              </GlowingButton>
            </div>
          </motion.div>

          {/* Enterprise: Go Big */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Go Big</h3>
              <div className="text-4xl font-bold gradient-text-ai mb-2">
                Let's Talk
              </div>
              <p className="text-gray-400">Custom AI workforce</p>
            </div>
            
            <div className="mb-8">
              <div className="text-center text-gray-300 mb-4">Perfect if you:</div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></div>
                  <span>Have 100+ employees</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></div>
                  <span>Need custom AI solutions</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></div>
                  <span>Want to dominate your industry</span>
                </li>
              </ul>
            </div>

            <div className="text-center mb-6 text-sm">
              <div className="text-emerald-400 font-semibold mb-2">ROI Calculator:</div>
              <div className="text-gray-300">Save 40+ hours/week = <span className="text-emerald-400">$80,000+/month value</span></div>
              <div className="text-gray-300">Custom pricing</div>
              <div className="text-emerald-400 font-bold">ROI: Unlimited</div>
            </div>

            <div onClick={() => trackEvent('pricing_enterprise_clicked', { pricing_tier: 'enterprise' })}>
              <GlowingButton href="/contact" variant="outline" className="w-full">
                Let's Talk Business
              </GlowingButton>
            </div>
          </motion.div>
        </div>

        {/* The Guarantee Stack */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-8 max-w-4xl mx-auto mb-8">
            <div className="text-2xl font-bold text-white mb-6">
              We're So Confident, We'll Pay <span className="text-emerald-400">You</span> If It Doesn't Work
            </div>
            
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="bg-emerald-900/20 rounded-xl p-4">
                <div className="text-emerald-400 font-bold text-lg">30 Days Free</div>
                <div className="text-sm text-gray-300">No credit card needed</div>
              </div>
              <div className="bg-emerald-900/20 rounded-xl p-4">
                <div className="text-emerald-400 font-bold text-lg">Find $10K or We Pay You $500</div>
                <div className="text-sm text-gray-300">We're that confident</div>
              </div>
              <div className="bg-emerald-900/20 rounded-xl p-4">
                <div className="text-emerald-400 font-bold text-lg">Cancel With One Click</div>
                <div className="text-sm text-gray-300">No questions asked</div>
              </div>
              <div className="bg-emerald-900/20 rounded-xl p-4">
                <div className="text-emerald-400 font-bold text-lg">Keep All Your Data</div>
                <div className="text-sm text-gray-300">It's yours forever</div>
              </div>
            </div>
          </div>

          <div className="text-lg text-gray-300 mb-6">
            <span className="text-red-400 font-semibold">Fair Warning:</span> The first 100 businesses this month get our 
            <span className="text-violet-400 font-semibold"> "AI Launch Concierge"</span> - we'll personally ensure your AI finds 
            <span className="text-emerald-400 font-semibold"> $25,000 in value</span> in the first 90 days.
          </div>
          <div className="text-sm text-gray-400 mb-8">
            73 spots left. Timer isn't fake.
          </div>

          <div onClick={() => trackEvent('pricing_cta_clicked', { location: 'bottom_pricing' })}>
            <GlowingButton href="/demo/subscription-simulator" size="xl">
              Give Me My AI Business Partner →
            </GlowingButton>
          </div>
        </motion.div>
      </div>
    </section>
  )
}