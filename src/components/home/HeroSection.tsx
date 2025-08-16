'use client'

import { motion } from 'framer-motion'
import { Bot, DollarSign, Clock, TrendingUp } from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { TypewriterEffect } from '@/components/ui/TypewriterEffect'
import { NeuralNetworkBackground } from '@/components/ui/NeuralNetworkBackground'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'
import { FloatingMetrics } from './FloatingMetrics'
import { LiveMetricsTicker } from './LiveMetricsTicker'

export function HeroSection() {
  const { trackEvent } = useTrackEvent()
  
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16">
      <NeuralNetworkBackground />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center"
        >
          {/* The Story Hook */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
          >
            <div className="text-sm text-violet-300 mb-4 font-medium">
              In 2019, Mike Chen was working 80-hour weeks
            </div>
            <div className="inline-flex items-center gap-2 bg-emerald-900/30 border border-emerald-500/50 px-6 py-3 rounded-full mb-8">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 font-semibold">Today his AI runs his $4.2M business while he sleeps</span>
            </div>
          </motion.div>

          {/* The Big Promise */}
          <motion.h1 
            className="text-6xl md:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="text-white">What If Your Business Could</span>
            <br />
            <TypewriterEffect
              words={[
                'Run Itself?',
                'Make Money While You Sleep?',
                'Grow Without You?',
                'Work Smarter Than You?'
              ]}
              className="gradient-text-ai"
            />
          </motion.h1>
          
          {/* The Dream State */}
          <motion.div 
            className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-8 text-left max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="text-lg text-gray-300 mb-4 font-medium">Imagine waking up to this:</div>
            <div className="space-y-2 text-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Your AI closed 3 deals worth <span className="text-emerald-400 font-bold">$47,000</span></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Found <span className="text-blue-400 font-bold">$12,000</span> in cost savings</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                <span>Prevented 2 employees from quitting</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Collected <span className="text-orange-400 font-bold">$38,000</span> in overdue payments</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-400">This isn't fantasy.</div>
              <div className="text-lg font-bold text-white">1,847 businesses woke up to this today.</div>
            </div>
          </motion.div>

          {/* Social Proof Counter */}
          <LiveMetricsTicker />
          
          {/* The Action */}
          <motion.div 
            className="flex flex-wrap justify-center gap-6 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div onClick={() => trackEvent('hero_demo_clicked', { location: 'hero', cta_type: 'primary' })}>
              <GlowingButton href="/demo/subscription-simulator" size="xl">
                Give Me My AI Business Partner
                <Bot className="ml-2 h-5 w-5" />
              </GlowingButton>
            </div>
            
            <div onClick={() => trackEvent('hero_pricing_clicked', { location: 'hero', cta_type: 'secondary' })}>
              <GlowingButton href="#demo" size="xl" variant="outline">
                Show Me a Business Running on Autopilot
                <TrendingUp className="ml-2 h-5 w-5" />
              </GlowingButton>
            </div>
          </motion.div>

          {/* The Urgency */}
          <motion.div
            className="text-sm text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-red-400" />
              <span>While you read this, 47 businesses just automated what takes you hours</span>
            </div>
            <div className="text-xs text-gray-500">
              30-day free trial • No credit card • Your AI starts learning in 60 seconds
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Performance Metrics */}
      <FloatingMetrics />
    </section>
  )
}