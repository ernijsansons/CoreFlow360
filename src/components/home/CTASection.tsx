'use client'

import { motion } from 'framer-motion'
import { Clock, DollarSign, TrendingUp, Users } from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

export function CTASection() {
  const { trackEvent } = useTrackEvent()

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-violet-950/50 to-cyan-950/50 py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 h-32 w-32 rounded-full bg-violet-500 blur-3xl"></div>
        <div className="absolute right-10 bottom-10 h-32 w-32 rounded-full bg-cyan-500 blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* The Question That Changes Everything */}
          <div className="mb-12">
            <h2 className="mb-6 text-5xl leading-tight font-bold text-white md:text-6xl">
              Ready to Build Your <span className="gradient-text-ai">HVAC Empire?</span>
            </h2>

            <div className="mx-auto mb-12 grid max-w-4xl gap-8 md:grid-cols-2">
              {/* The Problem */}
              <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-8">
                <div className="mb-4 text-xl font-bold text-red-400">Single Location Mindset</div>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center">
                    <Clock className="mr-3 h-5 w-5 text-red-400" />
                    <span>Stuck managing one location</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="mr-3 h-5 w-5 text-red-400" />
                    <span>Can't expand without chaos</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="mr-3 h-5 w-5 text-red-400" />
                    <span>Competitors buy you out</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-3 h-5 w-5 text-red-400" />
                    <span>Quality drops with growth</span>
                  </div>
                </div>
              </div>

              {/* The Solution */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-8">
                <div className="mb-4 text-xl font-bold text-emerald-400">Empire Builder Platform</div>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center">
                    <Clock className="mr-3 h-5 w-5 text-emerald-400" />
                    <span>Manage 100+ locations easily</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="mr-3 h-5 w-5 text-emerald-400" />
                    <span>Each location runs itself</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="mr-3 h-5 w-5 text-emerald-400" />
                    <span>Dominate multiple markets</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-3 h-5 w-5 text-emerald-400" />
                    <span>Consistent quality everywhere</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* The Urgency */}
          <div className="mb-12">
            <div className="mx-auto mb-8 max-w-3xl rounded-2xl border border-yellow-500/30 bg-yellow-950/20 p-6">
              <div className="mb-2 text-lg font-bold text-yellow-400">⚠️ Reality Check</div>
              <div className="text-lg text-white">
                Every month you wait, another HVAC contractor scales past you.
                <br />
                <span className="text-yellow-300">The market consolidation is happening NOW.</span>
                <br />
                <span className="font-semibold text-red-400">
                  Will you be the acquirer or get acquired?
                </span>
              </div>
            </div>
          </div>

          {/* The Transformation Promise */}
          <div className="mb-8 text-3xl leading-tight font-bold text-white md:text-4xl">
            90 Days From Now, You'll Either Own
            <br />
            <span className="gradient-text-ai">Multiple Profitable Locations</span>
            <br />
            Or Still Be Stuck With Just One
          </div>

          {/* Social Proof */}
          <div className="mx-auto mb-12 max-w-2xl rounded-2xl border border-gray-700/50 bg-gray-900/40 p-6 backdrop-blur-sm">
            <div className="mb-2 font-semibold text-emerald-400">
              Join 1,847 HVAC contractors building empires:
            </div>
            <div className="grid grid-cols-2 gap-4 text-center text-sm md:grid-cols-4">
              <div>
                <div className="font-bold text-white">$247K</div>
                <div className="text-gray-400">Tom's 3rd location made</div>
              </div>
              <div>
                <div className="font-bold text-white">78%</div>
                <div className="text-gray-400">Less time per location</div>
              </div>
              <div>
                <div className="font-bold text-white">32%</div>
                <div className="text-gray-400">Mike's profit margin</div>
              </div>
              <div>
                <div className="font-bold text-white">91%</div>
                <div className="text-gray-400">Service consistency</div>
              </div>
            </div>
          </div>

          {/* The Action */}
          <div className="mb-8 flex flex-wrap justify-center gap-6">
            <div
              onClick={() =>
                trackEvent('cta_signup_clicked', { location: 'bottom', cta_type: 'primary' })
              }
            >
              <GlowingButton
                href="/demo/subscription-simulator"
                size="xl"
                className="px-12 py-4 text-xl"
              >
                Start Your HVAC Empire
                <DollarSign className="ml-2 h-6 w-6" />
              </GlowingButton>
            </div>

            <div
              onClick={() =>
                trackEvent('cta_demo_clicked', { location: 'bottom', cta_type: 'secondary' })
              }
            >
              <GlowingButton
                href="/demo"
                size="xl"
                variant="outline"
                className="px-12 py-4 text-xl"
              >
                See Multi-Location Demo
                <TrendingUp className="ml-2 h-6 w-6" />
              </GlowingButton>
            </div>
          </div>

          {/* Final Guarantee */}
          <div className="text-sm text-gray-400">
            <div className="mb-2 font-semibold text-emerald-400">Your success is guaranteed:</div>
            <div>
              30-day free trial • Multi-location discounts • HVAC templates included • White-label
              ready
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Add your first 3 locations in 60 seconds. Scale from there. No limits. No
              complexity.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
