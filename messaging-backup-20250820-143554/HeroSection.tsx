'use client'

import { motion } from 'framer-motion'
import {
  Bot,
  DollarSign,
  Clock,
  TrendingUp,
  Users,
  Star,
  ArrowRight,
  Timer,
  CheckCircle,
} from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { NeuralNetworkBackground } from '@/components/ui/NeuralNetworkBackground' // Will rename to SmartAutomationBackground
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'
import { useState, useEffect } from 'react'
import { useABTest } from '@/hooks/useABTest'

export function HeroSection() {
  const { trackEvent } = useTrackEvent()
  const [liveUsers, setLiveUsers] = useState(2847)
  const [timeLeft, setTimeLeft] = useState('47:23:15')

  // A/B Tests
  const headlineTest = useABTest('hero-headline-test')
  const ctaTest = useABTest('cta-button-test')
  const socialProofTest = useABTest('social-proof-test')
  const urgencyTest = useABTest('urgency-element-test')

  // Simulate live user counter
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setLiveUsers((prev) => prev + Math.floor(Math.random() * 3) + 1)
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // Simulate countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const endTime = now + 47 * 60 * 60 * 1000 + 23 * 60 * 1000 + 15 * 1000
      const timeRemaining = endTime - now

      const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section
      className="relative flex min-h-screen items-center justify-center pt-16"
      data-section="hero"
    >
      <NeuralNetworkBackground /> {/* Smart automation visualization */}

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-6xl text-center"
        >
          {/* Social Proof Badge */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/50 bg-violet-900/30 px-6 py-3">
              {socialProofTest.config.type === 'revenue_stats' ? (
                <>
                  <DollarSign className="h-5 w-5 text-violet-400" />
                  <span className="font-semibold text-violet-300">
                    {socialProofTest.config.display}
                  </span>
                </>
              ) : (
                <>
                  <Users className="h-5 w-5 text-violet-400" />
                  <span className="font-semibold text-violet-300">
                    {liveUsers.toLocaleString()}+ businesses transformed
                  </span>
                </>
              )}
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Explosive Headline */}
          <motion.h1
            className="mb-8 text-5xl leading-tight font-black md:text-7xl lg:text-8xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="text-white">
              {headlineTest.config.headline || 'The Business Platform That'}
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              {headlineTest.variant?.id === 'variant-a' ? 'Scales Your Empire' : 'Grows With Your Empire'}
            </span>
            <br />
            <span className="text-4xl text-white md:text-5xl lg:text-6xl">
              {headlineTest.config.subheadline || 'From 1 to 100+ Locations'}
            </span>
          </motion.h1>

          {/* Power Subtitle */}
          <motion.p
            className="mx-auto mb-8 max-w-4xl text-xl text-gray-300 md:text-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Built for ambitious HVAC contractors ready to dominate their market.
            <span className="font-semibold text-emerald-400">
              {' '}
              Manage multiple businesses, territories, and teams
            </span>{' '}
            from one intelligent platform that
            <span className="font-semibold text-violet-400"> grows with your empire.</span>
          </motion.p>

          {/* Explosive Results Grid */}
          <motion.div
            className="mx-auto mb-8 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <div className="rounded-2xl border border-emerald-500/50 bg-emerald-900/30 p-6">
              <DollarSign className="mx-auto mb-3 h-8 w-8 text-emerald-400" />
              <div className="mb-2 text-3xl font-bold text-emerald-400">+247%</div>
              <div className="text-sm text-emerald-300">Revenue Growth Across Locations*</div>
            </div>
            <div className="rounded-2xl border border-cyan-500/50 bg-cyan-900/30 p-6">
              <Clock className="mx-auto mb-3 h-8 w-8 text-cyan-400" />
              <div className="mb-2 text-3xl font-bold text-cyan-400">1-100+</div>
              <div className="text-sm text-cyan-300">Locations Managed Seamlessly*</div>
            </div>
            <div className="rounded-2xl border border-violet-500/50 bg-violet-900/30 p-6">
              <TrendingUp className="mx-auto mb-3 h-8 w-8 text-violet-400" />
              <div className="mb-2 text-3xl font-bold text-violet-400">HVAC</div>
              <div className="text-sm text-violet-300">Industry Specialized</div>
            </div>
          </motion.div>

          {/* Limited Time Offer */}
          {urgencyTest.config.type !== 'none' && (
            <motion.div
              className="mx-auto mb-8 max-w-2xl rounded-2xl border border-red-500/50 bg-gradient-to-r from-red-900/40 to-orange-900/40 p-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {urgencyTest.config.type === 'countdown' ? (
                <>
                  <div className="mb-3 flex items-center justify-center gap-2">
                    <Timer className="h-5 w-5 text-red-400" />
                    <span className="font-bold text-red-400">{urgencyTest.config.message}</span>
                  </div>
                  <div className="mb-2 text-2xl font-bold text-white">
                    Multi-Business Pricing • Save 40% Per Location
                  </div>
                  <div className="font-mono text-lg text-red-300">{timeLeft}</div>
                  <div className="mt-2 text-sm text-gray-400">Limited to 47 HVAC contractors</div>
                </>
              ) : urgencyTest.config.type === 'spots' ? (
                <>
                  <div className="mb-2 text-2xl font-bold text-white">
                    Early Access Pricing Available
                  </div>
                  <div className="text-lg font-bold text-red-400">{urgencyTest.config.message}</div>
                  <div className="mt-2 text-sm text-gray-400">Exclusive multi-location pricing</div>
                </>
              ) : null}
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div
            className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <GlowingButton
              href="/demo/subscription-simulator"
              size="lg"
              className="px-8 py-4 text-lg"
              onClick={() => {
                trackEvent('hero_primary_cta_clicked')
                ctaTest.trackConversion('primary_cta_click')
              }}
            >
              <span className="flex items-center gap-2">
                {ctaTest.config.primaryCTA || 'Start Free 30-Day Trial'}
                <ArrowRight className="h-5 w-5" />
              </span>
            </GlowingButton>
            <button
              className="rounded-xl border border-gray-600 px-8 py-4 text-lg text-gray-300 transition-colors hover:border-violet-500 hover:text-white"
              onClick={() => {
                trackEvent('hero_secondary_cta_clicked')
                ctaTest.trackConversion('secondary_cta_click')
              }}
            >
              {ctaTest.config.secondaryCTA || 'Watch 3-Min Demo'}
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="flex flex-col items-center justify-center gap-4 text-sm text-gray-400 sm:flex-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>HVAC-ready templates included</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>

          {/* Legal Disclaimer */}
          <motion.div
            className="mx-auto mt-8 max-w-2xl text-xs text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            *Results may vary. Individual business results depend on various factors including
            market conditions, business model, and implementation. The case studies and testimonials
            presented are examples and not guarantees of future performance. Always consult with
            qualified professionals before making business decisions.
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
