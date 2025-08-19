'use client'

import { motion } from 'framer-motion'
import { Clock, DollarSign, TrendingUp, Shield } from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

export function PricingSection() {
  const { trackEvent } = useTrackEvent()

  return (
    <section id="pricing" className="bg-gray-950 py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* The Reality Check */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="mx-auto mb-12 max-w-4xl rounded-2xl border border-red-500/30 bg-red-950/30 p-8">
            <div className="mb-4 text-2xl font-bold text-white">
              The Average Business Owner's Time is Worth{' '}
              <span className="text-red-400">$500/Hour</span>
            </div>
            <div className="mb-4 text-lg text-gray-300">
              You're wasting 20 hours/week on tasks AI could do.
            </div>
            <div className="text-3xl font-bold text-red-400">
              That's <span className="text-red-300">$40,000/month</span> in lost opportunity.
            </div>
          </div>

          <h2 className="heading-section mb-6 text-white">
            Only Pay for What <span className="gradient-text-ai">Makes You Money</span>
          </h2>
          <p className="text-body-large mx-auto max-w-3xl text-gray-400">
            Stop buying software. Start investing in results. Every dollar you spend should make you
            $10 back. That's exactly what happens here.
          </p>
        </motion.div>

        {/* The Investment Options */}
        <div className="grid gap-6 md:grid-cols-4">
          {/* FREE: One AI Agent Forever */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.0 }}
            className="relative scale-105 rounded-2xl border border-emerald-500/60 bg-gradient-to-b from-emerald-900/40 to-green-900/40 p-6"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
              <span className="rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-1 text-xs font-semibold text-white">
                FOREVER FREE
              </span>
            </div>

            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-green-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">One AI Agent</h3>
              <div className="gradient-text-ai mb-1 text-4xl font-bold">
                FREE<span className="text-sm text-gray-400">/forever</span>
              </div>
              <p className="text-sm text-gray-400">Pick your favorite AI employee</p>
            </div>

            <div className="mb-6">
              <div className="mb-3 text-center text-sm text-gray-300">You get:</div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start">
                  <div className="mt-1.5 mr-2 h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                  <span>Choose 1 AI employee forever</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1.5 mr-2 h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                  <span>Full access to that agent</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1.5 mr-2 h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                  <span>24/7 availability</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1.5 mr-2 h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                  <span>No credit card ever</span>
                </li>
              </ul>
            </div>

            <div className="mb-4 text-center text-xs">
              <div className="mb-1 font-semibold text-emerald-400">Value Example:</div>
              <div className="text-gray-300">AI Sales Agent finds 1 deal/month</div>
              <div className="font-bold text-emerald-400">Value: $5,000+ FREE</div>
            </div>

            <div onClick={() => trackEvent('pricing_free_clicked', { pricing_tier: 'free' })}>
              <GlowingButton href="/ai-agent-selection" className="w-full py-2 text-sm">
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
            className="rounded-2xl border border-gray-800/50 bg-gray-900/60 p-6 backdrop-blur-sm"
          >
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">Get Started</h3>
              <div className="gradient-text-ai mb-2 text-4xl font-bold">
                $49<span className="text-sm text-gray-400">/user</span>
              </div>
              <p className="text-gray-400">Pick 3 AI employees</p>
            </div>

            <div className="mb-8">
              <div className="mb-4 text-center text-gray-300">Perfect if you:</div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <div className="mt-2 mr-3 h-2 w-2 rounded-full bg-blue-500"></div>
                  <span>Want to see what AI can do without a big commitment</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-2 mr-3 h-2 w-2 rounded-full bg-blue-500"></div>
                  <span>Run a small business (under 10 employees)</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-2 mr-3 h-2 w-2 rounded-full bg-blue-500"></div>
                  <span>Need help with specific tasks, not everything</span>
                </li>
              </ul>
            </div>

            <div className="mb-6 text-center text-sm">
              <div className="mb-2 font-semibold text-emerald-400">ROI Calculator:</div>
              <div className="text-gray-300">
                Save 5 hours/week = <span className="text-emerald-400">$10,000/month value</span>
              </div>
              <div className="text-gray-300">Cost: $49/month</div>
              <div className="font-bold text-emerald-400">ROI: 20,308%</div>
            </div>

            <div onClick={() => trackEvent('pricing_starter_clicked', { pricing_tier: 'starter' })}>
              <GlowingButton
                href="/demo/subscription-simulator"
                variant="outline"
                className="w-full"
              >
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
            className="relative rounded-2xl border border-violet-500/50 bg-gradient-to-b from-violet-900/30 to-cyan-900/30 p-6"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
              <span className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-2 text-sm font-semibold text-white">
                Most Popular
              </span>
            </div>

            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-500">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">The Sweet Spot</h3>
              <div className="gradient-text-ai mb-2 text-4xl font-bold">
                $99<span className="text-sm text-gray-400">/user</span>
              </div>
              <p className="text-gray-400">All AI employees included</p>
            </div>

            <div className="mb-8">
              <div className="mb-4 text-center text-gray-300">Perfect if you:</div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <div className="mt-2 mr-3 h-2 w-2 rounded-full bg-violet-500"></div>
                  <span>Want your business to run without you</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-2 mr-3 h-2 w-2 rounded-full bg-violet-500"></div>
                  <span>Have 10-100 employees</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-2 mr-3 h-2 w-2 rounded-full bg-violet-500"></div>
                  <span>Want maximum ROI on AI investment</span>
                </li>
              </ul>
            </div>

            <div className="mb-6 text-center text-sm">
              <div className="mb-2 font-semibold text-emerald-400">ROI Calculator:</div>
              <div className="text-gray-300">
                Save 15 hours/week = <span className="text-emerald-400">$30,000/month value</span>
              </div>
              <div className="text-gray-300">Cost: $99/month</div>
              <div className="font-bold text-emerald-400">ROI: 30,203%</div>
            </div>

            <div
              onClick={() => trackEvent('pricing_business_clicked', { pricing_tier: 'business' })}
            >
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
            className="rounded-2xl border border-gray-800/50 bg-gray-900/60 p-6 backdrop-blur-sm"
          >
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">Go Big</h3>
              <div className="gradient-text-ai mb-2 text-4xl font-bold">Let's Talk</div>
              <p className="text-gray-400">Custom AI workforce</p>
            </div>

            <div className="mb-8">
              <div className="mb-4 text-center text-gray-300">Perfect if you:</div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <div className="mt-2 mr-3 h-2 w-2 rounded-full bg-orange-500"></div>
                  <span>Have 100+ employees</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-2 mr-3 h-2 w-2 rounded-full bg-orange-500"></div>
                  <span>Need custom AI solutions</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-2 mr-3 h-2 w-2 rounded-full bg-orange-500"></div>
                  <span>Want to dominate your industry</span>
                </li>
              </ul>
            </div>

            <div className="mb-6 text-center text-sm">
              <div className="mb-2 font-semibold text-emerald-400">ROI Calculator:</div>
              <div className="text-gray-300">
                Save 40+ hours/week = <span className="text-emerald-400">$80,000+/month value</span>
              </div>
              <div className="text-gray-300">Custom pricing</div>
              <div className="font-bold text-emerald-400">ROI: Unlimited</div>
            </div>

            <div
              onClick={() =>
                trackEvent('pricing_enterprise_clicked', { pricing_tier: 'enterprise' })
              }
            >
              <GlowingButton href="/contact" variant="outline" className="w-full">
                Let's Talk Business
              </GlowingButton>
            </div>
          </motion.div>
        </div>

        {/* The Guarantee Stack */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="mx-auto mb-8 max-w-4xl rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-8">
            <div className="mb-6 text-2xl font-bold text-white">
              We're So Confident, We'll Pay <span className="text-emerald-400">You</span> If It
              Doesn't Work
            </div>

            <div className="grid gap-4 text-center md:grid-cols-4">
              <div className="rounded-xl bg-emerald-900/20 p-4">
                <div className="text-lg font-bold text-emerald-400">30 Days Free</div>
                <div className="text-sm text-gray-300">No credit card needed</div>
              </div>
              <div className="rounded-xl bg-emerald-900/20 p-4">
                <div className="text-lg font-bold text-emerald-400">
                  Find $10K or We Pay You $500
                </div>
                <div className="text-sm text-gray-300">We're that confident</div>
              </div>
              <div className="rounded-xl bg-emerald-900/20 p-4">
                <div className="text-lg font-bold text-emerald-400">Cancel With One Click</div>
                <div className="text-sm text-gray-300">No questions asked</div>
              </div>
              <div className="rounded-xl bg-emerald-900/20 p-4">
                <div className="text-lg font-bold text-emerald-400">Keep All Your Data</div>
                <div className="text-sm text-gray-300">It's yours forever</div>
              </div>
            </div>
          </div>

          <div className="mb-6 text-lg text-gray-300">
            <span className="font-semibold text-red-400">Fair Warning:</span> The first 100
            businesses this month get our
            <span className="font-semibold text-violet-400"> "AI Launch Concierge"</span> - we'll
            personally ensure your AI finds
            <span className="font-semibold text-emerald-400"> $25,000 in value</span> in the first
            90 days.
          </div>
          <div className="mb-8 text-sm text-gray-400">73 spots left. Timer isn't fake.</div>

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
