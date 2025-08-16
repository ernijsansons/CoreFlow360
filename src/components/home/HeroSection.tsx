'use client'

import { motion } from 'framer-motion'
import { Bot, DollarSign, Clock, TrendingUp, Users, Star, ArrowRight, Timer, CheckCircle } from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { NeuralNetworkBackground } from '@/components/ui/NeuralNetworkBackground'
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
        setLiveUsers(prev => prev + Math.floor(Math.random() * 3) + 1)
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // Simulate countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const endTime = now + (47 * 60 * 60 * 1000) + (23 * 60 * 1000) + (15 * 1000)
      const timeRemaining = endTime - now
      
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16" data-section="hero">
      <NeuralNetworkBackground />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto text-center"
        >
          {/* Social Proof Badge */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 bg-violet-900/30 border border-violet-500/50 px-6 py-3 rounded-full mb-4">
              {socialProofTest.config.type === 'revenue_stats' ? (
                <>
                  <DollarSign className="w-5 h-5 text-violet-400" />
                  <span className="text-violet-300 font-semibold">{socialProofTest.config.display}</span>
                </>
              ) : (
                <>
                  <Users className="w-5 h-5 text-violet-400" />
                  <span className="text-violet-300 font-semibold">{liveUsers.toLocaleString()}+ businesses transformed</span>
                </>
              )}
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Explosive Headline */}
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="text-white">{headlineTest.config.headline || 'Turn Your Business Into a'}</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              {headlineTest.variant?.id === 'variant-a' ? '10X Business Growth' : 'Revenue Machine'}
            </span>
            <br />
            <span className="text-white text-4xl md:text-5xl lg:text-6xl">{headlineTest.config.subheadline || 'That Runs Itself'}</span>
          </motion.h1>

          {/* Power Subtitle */}
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Stop working IN your business. Start making money FROM your business. 
            <span className="text-emerald-400 font-semibold"> CoreFlow360 automates everything</span> so you can focus on what matters: 
            <span className="text-violet-400 font-semibold"> scaling and profits.</span>
          </motion.p>

          {/* Explosive Results Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-2xl p-6">
              <DollarSign className="w-8 h-8 text-emerald-400 mb-3 mx-auto" />
              <div className="text-3xl font-bold text-emerald-400 mb-2">+247%</div>
              <div className="text-emerald-300 text-sm">Average Revenue Increase*</div>
            </div>
            <div className="bg-cyan-900/30 border border-cyan-500/50 rounded-2xl p-6">
              <Clock className="w-8 h-8 text-cyan-400 mb-3 mx-auto" />
              <div className="text-3xl font-bold text-cyan-400 mb-2">30+ hrs</div>
              <div className="text-cyan-300 text-sm">Time Saved Per Week*</div>
            </div>
            <div className="bg-violet-900/30 border border-violet-500/50 rounded-2xl p-6">
              <TrendingUp className="w-8 h-8 text-violet-400 mb-3 mx-auto" />
              <div className="text-3xl font-bold text-violet-400 mb-2">&lt; 2 weeks</div>
              <div className="text-violet-300 text-sm">Implementation Time</div>
            </div>
          </motion.div>

          {/* Limited Time Offer */}
          {urgencyTest.config.type !== 'none' && (
            <motion.div
              className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/50 rounded-2xl p-6 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {urgencyTest.config.type === 'countdown' ? (
                <>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Timer className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-bold">{urgencyTest.config.message}</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    Save $500/month • Lock in 40% OFF forever
                  </div>
                  <div className="text-red-300 font-mono text-lg">{timeLeft}</div>
                  <div className="text-sm text-gray-400 mt-2">Only 47 spots remaining</div>
                </>
              ) : urgencyTest.config.type === 'spots' ? (
                <>
                  <div className="text-2xl font-bold text-white mb-2">
                    Early Access Pricing Available
                  </div>
                  <div className="text-red-400 font-bold text-lg">{urgencyTest.config.message}</div>
                  <div className="text-sm text-gray-400 mt-2">Lock in 40% OFF forever</div>
                </>
              ) : null}
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <GlowingButton 
              href="/demo/subscription-simulator" 
              size="lg"
              className="text-lg px-8 py-4"
              onClick={() => {
                trackEvent('hero_primary_cta_clicked')
                ctaTest.trackConversion('primary_cta_click')
              }}
            >
              <span className="flex items-center gap-2">
                {ctaTest.config.primaryCTA || 'Start Free 30-Day Trial'}
                <ArrowRight className="w-5 h-5" />
              </span>
            </GlowingButton>
            <button 
              className="text-lg px-8 py-4 border border-gray-600 rounded-xl hover:border-violet-500 transition-colors text-gray-300 hover:text-white"
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
            className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Setup in under 2 weeks</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>

          {/* Legal Disclaimer */}
          <motion.div
            className="mt-8 text-xs text-gray-500 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            *Results may vary. Individual business results depend on various factors including market conditions, 
            business model, and implementation. The case studies and testimonials presented are examples and 
            not guarantees of future performance. Always consult with qualified professionals before making 
            business decisions.
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}