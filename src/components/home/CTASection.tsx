'use client'

import { motion } from 'framer-motion'
import { Clock, DollarSign, TrendingUp, Users } from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

export function CTASection() {
  const { trackEvent } = useTrackEvent()
  
  return (
    <section className="py-24 bg-gradient-to-r from-violet-950/50 to-cyan-950/50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-violet-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-cyan-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* The Question That Changes Everything */}
          <div className="mb-12">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              What's Your Time <span className="gradient-text-ai">Worth?</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
              {/* The Problem */}
              <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-8">
                <div className="text-red-400 font-bold text-xl mb-4">Without AI</div>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-red-400 mr-3" />
                    <span>Work 60+ hour weeks</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-red-400 mr-3" />
                    <span>Miss $40K+ opportunities monthly</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-red-400 mr-3" />
                    <span>Competitors pull ahead daily</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-red-400 mr-3" />
                    <span>Lose customers to mistakes</span>
                  </div>
                </div>
              </div>

              {/* The Solution */}
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-8">
                <div className="text-emerald-400 font-bold text-xl mb-4">With CoreFlow360</div>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-emerald-400 mr-3" />
                    <span>Work when you want</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-emerald-400 mr-3" />
                    <span>AI finds money while you sleep</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400 mr-3" />
                    <span>Dominate your competition</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-emerald-400 mr-3" />
                    <span>Perfect customer experiences</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* The Urgency */}
          <div className="mb-12">
            <div className="bg-yellow-950/20 border border-yellow-500/30 rounded-2xl p-6 max-w-3xl mx-auto mb-8">
              <div className="text-yellow-400 font-bold text-lg mb-2">⚠️ Reality Check</div>
              <div className="text-white text-lg">
                Every day you wait, your competitors get 47 AI decisions ahead of you. 
                <br />
                <span className="text-yellow-300">The question isn't IF you'll use AI.</span>
                <br />
                <span className="text-red-400 font-semibold">It's whether you'll be the disruptor or the disrupted.</span>
              </div>
            </div>
          </div>

          {/* The Transformation Promise */}
          <div className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
            30 Days From Now, You'll Either Have a 
            <br />
            <span className="gradient-text-ai">Business That Runs Itself</span>
            <br />
            Or You'll Still Be Its Prisoner
          </div>

          {/* Social Proof */}
          <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 max-w-2xl mx-auto mb-12">
            <div className="text-emerald-400 font-semibold mb-2">Join 1,847 businesses already on autopilot:</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
              <div>
                <div className="text-white font-bold">$247K</div>
                <div className="text-gray-400">Sarah's AI found</div>
              </div>
              <div>
                <div className="text-white font-bold">78%</div>
                <div className="text-gray-400">Time Rachel saved</div>
              </div>
              <div>
                <div className="text-white font-bold">32%</div>
                <div className="text-gray-400">Energy Dave cut</div>
              </div>
              <div>
                <div className="text-white font-bold">91%</div>
                <div className="text-gray-400">Alex's accuracy</div>
              </div>
            </div>
          </div>
          
          {/* The Action */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div onClick={() => trackEvent('cta_signup_clicked', { location: 'bottom', cta_type: 'primary' })}>
              <GlowingButton href="/demo/subscription-simulator" size="xl" className="text-xl px-12 py-4">
                Start Making More Money
                <DollarSign className="ml-2 h-6 w-6" />
              </GlowingButton>
            </div>
            
            <div onClick={() => trackEvent('cta_demo_clicked', { location: 'bottom', cta_type: 'secondary' })}>
              <GlowingButton href="/demo" size="xl" variant="outline" className="text-xl px-12 py-4">
                Watch It Work First
                <TrendingUp className="ml-2 h-6 w-6" />
              </GlowingButton>
            </div>
          </div>

          {/* Final Guarantee */}
          <div className="text-sm text-gray-400">
            <div className="font-semibold text-emerald-400 mb-2">Your success is guaranteed:</div>
            <div>30-day free trial • Find $10K value or we pay you $500 • Cancel with one click • Keep your data forever</div>
            <div className="mt-2 text-xs text-gray-500">
              Your AI starts learning your business in 60 seconds. No credit card. No risk. No excuses.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}