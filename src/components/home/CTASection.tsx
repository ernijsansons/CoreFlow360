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
              What's Your Time <span className="gradient-text-ai">Worth?</span>
            </h2>

            <div className="mx-auto mb-12 grid max-w-4xl gap-8 md:grid-cols-2">
              {/* The Problem */}
              <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-8">
                <div className="mb-4 text-xl font-bold text-red-400">Without AI</div>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center">
                    <Clock className="mr-3 h-5 w-5 text-red-400" />
                    <span>Work 60+ hour weeks</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="mr-3 h-5 w-5 text-red-400" />
                    <span>Miss $40K+ opportunities monthly</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="mr-3 h-5 w-5 text-red-400" />
                    <span>Competitors pull ahead daily</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-3 h-5 w-5 text-red-400" />
                    <span>Lose customers to mistakes</span>
                  </div>
                </div>
              </div>

              {/* The Solution */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-8">
                <div className="mb-4 text-xl font-bold text-emerald-400">With CoreFlow360</div>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center">
                    <Clock className="mr-3 h-5 w-5 text-emerald-400" />
                    <span>Work when you want</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="mr-3 h-5 w-5 text-emerald-400" />
                    <span>AI finds money while you sleep</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="mr-3 h-5 w-5 text-emerald-400" />
                    <span>Dominate your competition</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-3 h-5 w-5 text-emerald-400" />
                    <span>Perfect customer experiences</span>
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
                Every day you wait, your competitors get 47 AI decisions ahead of you.
                <br />
                <span className="text-yellow-300">The question isn't IF you'll use AI.</span>
                <br />
                <span className="font-semibold text-red-400">
                  It's whether you'll be the disruptor or the disrupted.
                </span>
              </div>
            </div>
          </div>

          {/* The Transformation Promise */}
          <div className="mb-8 text-3xl leading-tight font-bold text-white md:text-4xl">
            30 Days From Now, You'll Either Have a
            <br />
            <span className="gradient-text-ai">Business That Runs Itself</span>
            <br />
            Or You'll Still Be Its Prisoner
          </div>

          {/* Social Proof */}
          <div className="mx-auto mb-12 max-w-2xl rounded-2xl border border-gray-700/50 bg-gray-900/40 p-6 backdrop-blur-sm">
            <div className="mb-2 font-semibold text-emerald-400">
              Join 1,847 businesses already on autopilot:
            </div>
            <div className="grid grid-cols-2 gap-4 text-center text-sm md:grid-cols-4">
              <div>
                <div className="font-bold text-white">$247K</div>
                <div className="text-gray-400">Sarah's AI found</div>
              </div>
              <div>
                <div className="font-bold text-white">78%</div>
                <div className="text-gray-400">Time Rachel saved</div>
              </div>
              <div>
                <div className="font-bold text-white">32%</div>
                <div className="text-gray-400">Energy Dave cut</div>
              </div>
              <div>
                <div className="font-bold text-white">91%</div>
                <div className="text-gray-400">Alex's accuracy</div>
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
                Start Making More Money
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
                Watch It Work First
                <TrendingUp className="ml-2 h-6 w-6" />
              </GlowingButton>
            </div>
          </div>

          {/* Final Guarantee */}
          <div className="text-sm text-gray-400">
            <div className="mb-2 font-semibold text-emerald-400">Your success is guaranteed:</div>
            <div>
              30-day free trial • Find $10K value or we pay you $500 • Cancel with one click • Keep
              your data forever
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Your AI starts learning your business in 60 seconds. No credit card. No risk. No
              excuses.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
