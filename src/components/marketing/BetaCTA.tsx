/**
 * Beta Program CTA Component
 * Reusable call-to-action for beta program across the site
 */

'use client'

import { motion } from 'framer-motion'
import { Rocket, Users, Clock, Star } from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

interface BetaCTAProps {
  variant?: 'banner' | 'card' | 'inline'
  showBenefits?: boolean
  className?: string
}

export function BetaCTA({ 
  variant = 'card', 
  showBenefits = true, 
  className = '' 
}: BetaCTAProps) {
  const { trackEvent } = useTrackEvent()

  const handleBetaClick = () => {
    trackEvent('beta_cta_clicked', {
      variant,
      location: 'beta_cta_component'
    })
  }

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r from-violet-900/50 to-cyan-900/50 border-b border-violet-500/30 ${className}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Rocket className="w-6 h-6 text-violet-400" />
              <div>
                <div className="font-semibold text-white">Join the Beta Program</div>
                <div className="text-sm text-gray-300">
                  6 months free + 50% founding member discount
                </div>
              </div>
            </div>
            <div onClick={handleBetaClick}>
              <GlowingButton href="/beta" size="sm">
                Apply Now
              </GlowingButton>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center space-x-2 bg-violet-900/30 border border-violet-500/50 px-4 py-2 rounded-full ${className}`}
      >
        <Rocket className="w-4 h-4 text-violet-400" />
        <span className="text-violet-300 text-sm font-medium">Join Beta for Free</span>
        <div onClick={handleBetaClick}>
          <GlowingButton href="/beta" size="xs">
            Apply
          </GlowingButton>
        </div>
      </motion.div>
    )
  }

  // Card variant (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-violet-900/20 to-cyan-900/20 border border-violet-500/30 rounded-2xl p-8 ${className}`}
    >
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-violet-900/40 border border-violet-500/50 px-4 py-2 rounded-full mb-6">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-violet-300 font-semibold text-sm">Limited Beta Access</span>
        </div>

        <h3 className="text-2xl font-bold text-white mb-4">
          Be Among the First to Experience AI-Orchestrated ERP
        </h3>
        
        <p className="text-gray-300 mb-8 max-w-md mx-auto">
          Join our exclusive beta program and help shape the future of business automation. 
          Get premium features for free and founding member benefits.
        </p>

        {showBenefits && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <Clock className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                <div className="font-semibold text-white text-sm">6 Months Free</div>
                <div className="text-xs text-gray-400">Full premium access</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="font-semibold text-white text-sm">50% Discount</div>
                <div className="text-xs text-gray-400">Founding member rate</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <Users className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="font-semibold text-white text-sm">Direct Access</div>
                <div className="text-xs text-gray-400">To engineering team</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div onClick={handleBetaClick}>
            <GlowingButton href="/beta" size="lg" className="w-full sm:w-auto">
              Join Beta Program
              <Rocket className="w-4 h-4 ml-2" />
            </GlowingButton>
          </div>
          <div onClick={() => trackEvent('beta_demo_clicked', { source: 'beta_cta' })}>
            <GlowingButton href="/demo/subscription-simulator" variant="outline" size="lg" className="w-full sm:w-auto">
              See Demo First
            </GlowingButton>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="text-xs text-gray-400">
            ✓ No credit card required • ✓ Cancel anytime • ✓ Full feature access
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Usage stats component for beta program
export function BetaStats() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-8"
    >
      <div className="inline-flex items-center space-x-8 text-sm text-gray-400">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span>147 companies applied</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-violet-500 rounded-full mr-2"></div>
          <span>23 spots remaining</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></div>
          <span>Rolling admission</span>
        </div>
      </div>
    </motion.div>
  )
}