'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  TrendingUp,
  Users,
  DollarSign,
  X,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  Shield,
} from 'lucide-react'

interface ConversionTrigger {
  id: string
  type: 'feature_limit' | 'usage_limit' | 'success_story' | 'time_based' | 'value_demonstration'
  context: {
    currentPlan: 'free' | 'starter' | 'business'
    currentModule: string
    usageCount?: number
    usageLimit?: number
    daysActive?: number
    successMetrics?: Record<string, number>
  }
}

interface UpgradeOffer {
  id: string
  title: string
  subtitle: string
  ctaText: string
  urgency?: string
  socialProof?: string
  valueProps: string[]
  pricing: {
    currentPlan: string
    upgradePlan: string
    currentPrice: number
    upgradePrice: number
    savings?: string
  }
  gradient: string
  icon: React.ComponentType<unknown>
}

interface UpgradeFunnelProps {
  trigger: ConversionTrigger
  onUpgrade?: () => void
  onDismiss?: () => void
  onDelay?: () => void
  className?: string
}

const getUpgradeOffer = (trigger: ConversionTrigger): UpgradeOffer => {
  const { type, context } = trigger

  switch (type) {
    case 'feature_limit':
      return {
        id: 'feature-unlock',
        title: 'Unlock More AI Power',
        subtitle: `Your ${context.currentModule} AI agent wants to help more!`,
        ctaText: 'Add More AI Employees',
        urgency: '89% of users upgrade within 30 days',
        socialProof: 'Join 12,847 businesses growing with CoreFlow360',
        valueProps: [
          'Get 3 AI employees instead of 1',
          'Unlock cross-module intelligence',
          '10x faster business insights',
          '24/7 AI business optimization',
        ],
        pricing: {
          currentPlan: 'Free Forever',
          upgradePlan: 'Get Started',
          currentPrice: 0,
          upgradePrice: 49,
          savings: 'Save $300/month vs hiring human equivalents',
        },
        gradient: 'from-violet-600 to-purple-600',
        icon: Zap,
      }

    case 'usage_limit':
      return {
        id: 'usage-expansion',
        title: "You're Getting Results!",
        subtitle: 'Upgrade to keep the momentum going',
        ctaText: 'Remove All Limits',
        urgency: 'Limited time: First month 50% off',
        socialProof: 'Customers see 340% ROI in first 90 days',
        valueProps: [
          'Unlimited AI actions per day',
          'Priority AI response speed',
          'Advanced analytics & reporting',
          'White-glove setup assistance',
        ],
        pricing: {
          currentPlan: context.currentPlan,
          upgradePlan: context.currentPlan === 'starter' ? 'Business' : 'Get Started',
          currentPrice: context.currentPlan === 'starter' ? 49 : 0,
          upgradePrice: context.currentPlan === 'starter' ? 99 : 49,
        },
        gradient: 'from-emerald-600 to-green-600',
        icon: TrendingUp,
      }

    case 'success_story':
      return {
        id: 'success-amplification',
        title: 'Scale Your Success',
        subtitle: 'Companies like yours grow 3x faster with our full AI workforce',
        ctaText: 'Accelerate Growth',
        socialProof: 'Join 500+ companies growing 300% faster',
        valueProps: [
          'Full AI workforce (6 specialists)',
          'Cross-department intelligence',
          'Executive-level insights',
          'Competitive advantage engine',
        ],
        pricing: {
          currentPlan: context.currentPlan,
          upgradePlan: 'Business',
          currentPrice: context.currentPlan === 'starter' ? 49 : 0,
          upgradePrice: 99,
          savings: 'ROI typically 5x in first quarter',
        },
        gradient: 'from-blue-600 to-cyan-600',
        icon: Star,
      }

    case 'value_demonstration':
      return {
        id: 'value-realization',
        title: 'See The Full Picture',
        subtitle: 'Your AI agent has identified $47,000 in monthly opportunities',
        ctaText: 'Capture All Opportunities',
        urgency: "Don't leave money on the table",
        socialProof: 'Average customer captures $180k additional revenue',
        valueProps: [
          'Cross-module opportunity detection',
          'Advanced predictive analytics',
          'Automated revenue optimization',
          'Competitive intelligence insights',
        ],
        pricing: {
          currentPlan: context.currentPlan,
          upgradePlan: 'Business',
          currentPrice: context.currentPlan === 'starter' ? 49 : 0,
          upgradePrice: 99,
          savings: 'Pays for itself 47x over',
        },
        gradient: 'from-orange-600 to-red-600',
        icon: Target,
      }

    default:
      return {
        id: 'general-upgrade',
        title: 'Unlock Your Potential',
        subtitle: 'Get the full CoreFlow360 experience',
        ctaText: 'Upgrade Now',
        valueProps: [
          'All AI employees included',
          'Advanced features unlocked',
          'Priority support',
          'Exclusive insights',
        ],
        pricing: {
          currentPlan: context.currentPlan,
          upgradePlan: 'Business',
          currentPrice: 0,
          upgradePrice: 99,
        },
        gradient: 'from-violet-600 to-purple-600',
        icon: Sparkles,
      }
  }
}

export default function UpgradeFunnels({
  trigger,
  onUpgrade,
  onDismiss,
  onDelay,
  className = '',
}: UpgradeFunnelProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const offer = getUpgradeOffer(trigger)
  const IconComponent = offer.icon

  // Timer for urgency offers
  useEffect(() => {
    if (offer.urgency?.includes('Limited time') && !timeLeft) {
      setTimeLeft(24 * 60 * 60) // 24 hours in seconds
    }
  }, [offer.urgency, timeLeft])

  useEffect(() => {
    if (timeLeft && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev ? prev - 1 : 0))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const trackConversionEvent = async (actionTaken: string) => {
    try {
      await fetch('/api/conversion/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'upgrade_prompt',
          triggerType: trigger.type,
          actionTaken,
          currentModule: trigger.context.currentModule,
          userPlan: trigger.context.currentPlan,
          conversionValue:
            actionTaken === 'converted' ? offer.pricing.upgradePrice * 12 : undefined,
          triggerContext: JSON.stringify({
            offerId: offer.id,
            triggerContext: trigger.context,
          }),
        }),
      })
    } catch (error) {}
  }

  const handleUpgrade = async () => {
    await trackConversionEvent('converted')
    onUpgrade?.()
    setIsVisible(false)
  }

  const handleDismiss = async () => {
    await trackConversionEvent('dismissed')
    onDismiss?.()
    setIsVisible(false)
  }

  const handleDelay = async () => {
    await trackConversionEvent('delayed')
    onDelay?.()
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-700 bg-gradient-to-br from-gray-900 to-black ${className}`}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 z-10 p-2 text-gray-400 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header with icon and title */}
          <div
            className={`bg-gradient-to-r ${offer.gradient} relative overflow-hidden p-8 text-white`}
          >
            <div className="relative z-10">
              <div className="mb-4 flex items-center">
                <div className="mr-4 h-12 w-12 rounded-full bg-white/20 p-3">
                  <IconComponent className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{offer.title}</h2>
                  <p className="text-white/90">{offer.subtitle}</p>
                </div>
              </div>

              {timeLeft && (
                <div className="inline-flex items-center rounded-lg bg-white/20 px-4 py-2">
                  <Clock className="mr-2 h-4 w-4" />
                  <span className="font-mono font-medium">{formatTime(timeLeft)} left</span>
                </div>
              )}
            </div>

            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 transform">
                <div className="h-64 w-64 rounded-full bg-white/20" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 text-white">
            {/* Value propositions */}
            <div className="mb-6">
              <h3 className="mb-4 text-lg font-semibold">What you get:</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {offer.valueProps.map((prop, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start"
                  >
                    <CheckCircle className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-emerald-500" />
                    <span className="text-gray-300">{prop}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-6 rounded-2xl bg-gray-800/50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">
                    Currently: {offer.pricing.currentPlan}
                  </div>
                  <div className="text-2xl font-bold">
                    ${offer.pricing.currentPrice}
                    <span className="text-base font-normal text-gray-400">/user/month</span>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-500" />
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    Upgrade to: {offer.pricing.upgradePlan}
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    ${offer.pricing.upgradePrice}
                    <span className="text-base font-normal text-gray-400">/user/month</span>
                  </div>
                </div>
              </div>

              {offer.pricing.savings && (
                <div className="text-center text-sm font-medium text-emerald-400">
                  {offer.pricing.savings}
                </div>
              )}
            </div>

            {/* Social proof */}
            {offer.socialProof && (
              <div className="mb-6 text-center text-sm text-gray-400">⭐ {offer.socialProof}</div>
            )}

            {/* CTA Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleDelay}
                className="flex-1 rounded-xl border border-gray-600 px-6 py-3 text-gray-300 transition-all hover:border-gray-500 hover:text-white"
              >
                Maybe Later
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpgrade}
                className={`flex-1 bg-gradient-to-r px-6 py-3 ${offer.gradient} flex items-center justify-center rounded-xl font-semibold text-white transition-all hover:opacity-90`}
              >
                {offer.ctaText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.button>
            </div>

            {/* Urgency message */}
            {offer.urgency && (
              <div className="mt-4 text-center text-xs text-yellow-400">{offer.urgency}</div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Hook to manage conversion triggers
export function useConversionTriggers() {
  const [activeTrigger, setActiveTrigger] = useState<ConversionTrigger | null>(null)

  const triggerUpgrade = (trigger: ConversionTrigger) => {
    setActiveTrigger(trigger)
  }

  const dismissTrigger = () => {
    setActiveTrigger(null)
  }

  // Auto-trigger based on user behavior using API data
  useEffect(() => {
    const checkTriggers = async () => {
      try {
        // Get user context from freemium API
        const response = await fetch('/api/freemium/status')

        if (!response.ok) {
          // Fallback to localStorage
          return checkTriggersFromLocalStorage()
        }

        const freemiumStatus = await response.json()

        const {
          subscriptionStatus,
          selectedAgent,
          dailyUsageCount,
          dailyLimit,
          daysActive = 0,
        } = freemiumStatus

        // Feature limit trigger
        if (subscriptionStatus === 'FREE' && dailyUsageCount > dailyLimit * 0.8) {
          triggerUpgrade({
            id: 'usage-limit-' + Date.now(),
            type: 'usage_limit',
            context: {
              currentPlan: 'free',
              currentModule: selectedAgent || 'crm',
              usageCount: dailyUsageCount,
              usageLimit: dailyLimit,
            },
          })
          return
        }

        // Success-based trigger after 7 days
        if (daysActive >= 7 && subscriptionStatus === 'FREE') {
          triggerUpgrade({
            id: 'success-story-' + Date.now(),
            type: 'success_story',
            context: {
              currentPlan: 'free',
              currentModule: selectedAgent || 'crm',
              daysActive,
            },
          })
          return
        }

        // Value demonstration after significant usage
        if (dailyUsageCount > dailyLimit && subscriptionStatus !== 'BUSINESS') {
          triggerUpgrade({
            id: 'value-demo-' + Date.now(),
            type: 'value_demonstration',
            context: {
              currentPlan: subscriptionStatus.toLowerCase() as 'free' | 'starter',
              currentModule: selectedAgent || 'crm',
              usageCount: dailyUsageCount,
            },
          })
        }
      } catch (error) {
        // Fallback to localStorage-based triggers
        checkTriggersFromLocalStorage()
      }
    }

    const checkTriggersFromLocalStorage = () => {
      // Get user context from localStorage as fallback
      const userPlan = localStorage.getItem('userPlan') || 'free'
      const selectedAgent = localStorage.getItem('selectedFreeAgent')
      const usageCount = parseInt(localStorage.getItem('dailyUsageCount') || '0')
      const daysActive = parseInt(localStorage.getItem('daysActive') || '0')

      // Feature limit trigger
      if (userPlan === 'free' && usageCount > 5) {
        triggerUpgrade({
          id: 'feature-limit-' + Date.now(),
          type: 'feature_limit',
          context: {
            currentPlan: 'free',
            currentModule: selectedAgent || 'crm',
            usageCount,
            usageLimit: 10,
          },
        })
        return
      }

      // Success-based trigger after 7 days
      if (daysActive >= 7 && userPlan === 'free') {
        triggerUpgrade({
          id: 'success-story-' + Date.now(),
          type: 'success_story',
          context: {
            currentPlan: 'free',
            currentModule: selectedAgent || 'crm',
            daysActive,
          },
        })
        return
      }

      // Value demonstration after significant usage
      if (usageCount > 20 && userPlan !== 'business') {
        triggerUpgrade({
          id: 'value-demo-' + Date.now(),
          type: 'value_demonstration',
          context: {
            currentPlan: userPlan as 'free' | 'starter',
            currentModule: selectedAgent || 'crm',
            usageCount,
          },
        })
      }
    }

    // Check triggers every 30 seconds
    const interval = setInterval(checkTriggers, 30000)

    // Initial check
    checkTriggers()

    return () => clearInterval(interval)
  }, [])

  return {
    activeTrigger,
    triggerUpgrade,
    dismissTrigger,
  }
}
