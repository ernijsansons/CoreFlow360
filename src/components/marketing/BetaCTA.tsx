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

export function BetaCTA({ variant = 'card', showBenefits = true, className = '' }: BetaCTAProps) {
  const { trackEvent } = useTrackEvent()

  const handleBetaClick = () => {
    trackEvent('beta_cta_clicked', {
      variant,
      location: 'beta_cta_component',
    })
  }

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-b border-violet-500/30 bg-gradient-to-r from-violet-900/50 to-cyan-900/50 ${className}`}
      >
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 flex items-center space-x-3 md:mb-0">
              <Rocket className="h-6 w-6 text-violet-400" />
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
        className={`inline-flex items-center space-x-2 rounded-full border border-violet-500/50 bg-violet-900/30 px-4 py-2 ${className}`}
      >
        <Rocket className="h-4 w-4 text-violet-400" />
        <span className="text-sm font-medium text-violet-300">Join Beta for Free</span>
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
      className={`rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-900/20 to-cyan-900/20 p-8 ${className}`}
    >
      <div className="text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/50 bg-violet-900/40 px-4 py-2">
          <Star className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-semibold text-violet-300">Limited Beta Access</span>
        </div>

        <h3 className="mb-4 text-2xl font-bold text-white">
          Be Among the First to Experience AI-Orchestrated ERP
        </h3>

        <p className="mx-auto mb-8 max-w-md text-gray-300">
          Join our exclusive beta program and help shape the future of business automation. Get
          premium features for free and founding member benefits.
        </p>

        {showBenefits && (
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="rounded-lg bg-gray-800/50 p-4">
                <Clock className="mx-auto mb-2 h-6 w-6 text-violet-400" />
                <div className="text-sm font-semibold text-white">6 Months Free</div>
                <div className="text-xs text-gray-400">Full premium access</div>
              </div>
            </div>
            <div className="text-center">
              <div className="rounded-lg bg-gray-800/50 p-4">
                <Star className="mx-auto mb-2 h-6 w-6 text-yellow-400" />
                <div className="text-sm font-semibold text-white">50% Discount</div>
                <div className="text-xs text-gray-400">Founding member rate</div>
              </div>
            </div>
            <div className="text-center">
              <div className="rounded-lg bg-gray-800/50 p-4">
                <Users className="mx-auto mb-2 h-6 w-6 text-cyan-400" />
                <div className="text-sm font-semibold text-white">Direct Access</div>
                <div className="text-xs text-gray-400">To engineering team</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <div onClick={handleBetaClick}>
            <GlowingButton href="/beta" size="lg" className="w-full sm:w-auto">
              Join Beta Program
              <Rocket className="ml-2 h-4 w-4" />
            </GlowingButton>
          </div>
          <div onClick={() => trackEvent('beta_demo_clicked', { source: 'beta_cta' })}>
            <GlowingButton
              href="/demo/subscription-simulator"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center">
      <div className="inline-flex items-center space-x-8 text-sm text-gray-400">
        <div className="flex items-center">
          <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
          <span>147 companies applied</span>
        </div>
        <div className="flex items-center">
          <div className="mr-2 h-2 w-2 rounded-full bg-violet-500"></div>
          <span>23 spots remaining</span>
        </div>
        <div className="flex items-center">
          <div className="mr-2 h-2 w-2 rounded-full bg-cyan-500"></div>
          <span>Rolling admission</span>
        </div>
      </div>
    </motion.div>
  )
}
