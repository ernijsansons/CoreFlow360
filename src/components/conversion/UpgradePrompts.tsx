'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown,
  TrendingUp,
  Zap,
  Users,
  Target,
  DollarSign,
  Clock,
  CheckCircle,
  X,
  ArrowRight,
  Star,
  Shield,
  Sparkles,
  AlertCircle,
} from 'lucide-react'

interface UpgradePromptProps {
  triggerType:
    | 'limit-reached'
    | 'feature-gate'
    | 'value-demonstration'
    | 'success-moment'
    | 'time-based'
  currentPlan: 'free' | 'starter' | 'business'
  context?: {
    featureAttempted?: string
    valueGenerated?: string
    timeOnPlatform?: number
    actionsPerformed?: number
    limitType?: string
    limitCount?: number
  }
  onUpgrade?: () => void
  onDismiss?: () => void
  onDelay?: () => void
}

interface ConversionFunnelProps {
  userRole: string
  currentAgent: string
  usageMetrics: {
    actionsPerformed: number
    valueGenerated: number
    timeSpent: number
    featuresUsed: string[]
  }
  onConversion: (plan: string) => void
  onClose: () => void
}

export function UpgradePrompt({
  triggerType,
  currentPlan,
  context,
  onUpgrade,
  onDismiss,
  onDelay,
}: UpgradePromptProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState('starter')

  const getPromptContent = () => {
    switch (triggerType) {
      case 'limit-reached':
        return {
          title: `You've Hit Your ${context?.limitType} Limit!`,
          subtitle: `${context?.limitCount} ${context?.limitType?.toLowerCase()} used`,
          description:
            'Your free AI agent is performing amazingly! Unlock more power to scale your results.',
          icon: AlertCircle,
          color: 'text-amber-400',
          gradient: 'from-amber-500 to-orange-600',
          urgency: 'high',
          valueProposition: `Add 2 more AI agents for just $49/user and 3x your productivity`,
        }

      case 'feature-gate':
        return {
          title: `${context?.featureAttempted} Needs More AI Power`,
          subtitle: 'Feature requires multiple AI agents',
          description:
            'This advanced feature needs multiple AI agents working together. Upgrade to unlock the full capability.',
          icon: Zap,
          color: 'text-violet-400',
          gradient: 'from-violet-500 to-purple-600',
          urgency: 'medium',
          valueProposition: 'Get 3 AI employees working together - ROI guaranteed',
        }

      case 'value-demonstration':
        return {
          title: `🎉 Your AI Generated ${context?.valueGenerated}!`,
          subtitle: 'Imagine 3x more results',
          description:
            'Your free AI agent is already creating value. Scale this success with our full AI workforce.',
          icon: TrendingUp,
          color: 'text-emerald-400',
          gradient: 'from-emerald-500 to-green-600',
          urgency: 'low',
          valueProposition: '3 AI agents = 3x the value you just experienced',
        }

      case 'success-moment':
        return {
          title: "You're Crushing It! 🚀",
          subtitle: `${context?.actionsPerformed} successful actions completed`,
          description: "You're getting great results with one AI agent. Ready to 10x your success?",
          icon: Star,
          color: 'text-cyan-400',
          gradient: 'from-cyan-500 to-blue-600',
          urgency: 'low',
          valueProposition: 'Successful users upgrade within 30 days - join them!',
        }

      case 'time-based':
        return {
          title: 'Ready for More AI Power?',
          subtitle: `${context?.timeOnPlatform} days of excellent results`,
          description:
            "You've experienced the value of AI automation. Scale it across your entire business.",
          icon: Clock,
          color: 'text-indigo-400',
          gradient: 'from-indigo-500 to-purple-600',
          urgency: 'medium',
          valueProposition: 'Limited time: Get 3 AI agents for the price of 2',
        }

      default:
        return {
          title: 'Upgrade Your AI Workforce',
          subtitle: 'Scale your success',
          description: 'Get more AI employees to handle more work automatically.',
          icon: Sparkles,
          color: 'text-blue-400',
          gradient: 'from-blue-500 to-cyan-600',
          urgency: 'medium',
          valueProposition: 'Join thousands who scaled with multiple AI agents',
        }
    }
  }

  const promptContent = getPromptContent()
  const IconComponent = promptContent.icon

  const handleUpgrade = () => {
    // Track conversion event
    const conversionData = {
      triggerType,
      currentPlan,
      selectedPlan,
      context,
      timestamp: new Date().toISOString(),
    }

    // Send to analytics
    if (typeof window !== 'undefined' && (window as unknown).gtag) {
      ;(window as unknown).gtag('event', 'upgrade_prompt_conversion', {
        trigger_type: triggerType,
        current_plan: currentPlan,
        selected_plan: selectedPlan,
        value: selectedPlan === 'starter' ? 49 : selectedPlan === 'business' ? 99 : 0,
      })
    }

    localStorage.setItem('conversionData', JSON.stringify(conversionData))
    onUpgrade?.()
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      >
        <div className="relative w-full max-w-2xl rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/95 to-gray-800/95 p-8 backdrop-blur-xl">
          {/* Close Button */}
          <button
            onClick={() => {
              setIsVisible(false)
              onDismiss?.()
            }}
            className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Urgency Badge */}
          {promptContent.urgency === 'high' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
              <span className="animate-pulse rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-4 py-1 text-xs font-semibold text-white">
                ACTION NEEDED
              </span>
            </div>
          )}

          {/* Header */}
          <div className="mb-8 text-center">
            <div
              className={`mx-auto mb-4 h-20 w-20 bg-gradient-to-r ${promptContent.gradient} flex items-center justify-center rounded-full`}
            >
              <IconComponent className="h-10 w-10 text-white" />
            </div>

            <h2 className="mb-2 text-2xl font-bold text-white">{promptContent.title}</h2>

            <p className={`${promptContent.color} mb-2 text-sm font-medium`}>
              {promptContent.subtitle}
            </p>

            <p className="text-gray-300">{promptContent.description}</p>
          </div>

          {/* Value Proposition */}
          <div className="mb-6 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 p-4">
            <div className="text-center">
              <div className="mb-1 text-sm font-medium text-violet-300">Special Offer</div>
              <div className="font-semibold text-white">{promptContent.valueProposition}</div>
            </div>
          </div>

          {/* Plan Selection */}
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            {/* Starter Plan */}
            <div
              className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                selectedPlan === 'starter'
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => setSelectedPlan('starter')}
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-white">Get Started</h3>
                <div className="text-2xl font-bold text-white">$49</div>
              </div>
              <p className="mb-3 text-sm text-gray-400">Perfect for small teams</p>
              <ul className="space-y-1 text-sm text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />3 AI employees
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Unlimited usage
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Priority support
                </li>
              </ul>
            </div>

            {/* Business Plan */}
            <div
              className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                selectedPlan === 'business'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => setSelectedPlan('business')}
            >
              <div className="absolute -top-3 right-3">
                <span className="rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-1 text-xs font-semibold text-white">
                  MOST POPULAR
                </span>
              </div>

              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-white">The Sweet Spot</h3>
                <div className="text-2xl font-bold text-white">$99</div>
              </div>
              <p className="mb-3 text-sm text-gray-400">For growing businesses</p>
              <ul className="space-y-1 text-sm text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  All AI employees
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Advanced features
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  White-glove setup
                </li>
              </ul>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mb-6 rounded-xl bg-gray-800/40 p-4">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <Users className="mr-1 h-4 w-4" />
                1,247 users upgraded this week
              </div>
              <div className="flex items-center">
                <Star className="mr-1 h-4 w-4 text-yellow-500" />
                4.9/5 satisfaction
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleUpgrade}
              className={`flex-1 bg-gradient-to-r ${promptContent.gradient} flex items-center justify-center rounded-xl px-6 py-3 font-semibold text-white transition-all hover:opacity-90`}
            >
              Upgrade Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>

            {triggerType !== 'limit-reached' && (
              <button
                onClick={() => {
                  setIsVisible(false)
                  onDelay?.()
                }}
                className="flex-1 rounded-xl border border-gray-600 px-6 py-3 font-medium text-gray-300 transition-all hover:border-gray-500"
              >
                Remind Me Later
              </button>
            )}
          </div>

          {/* Guarantee */}
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center text-sm text-gray-400">
              <Shield className="mr-1 h-4 w-4" />
              30-day money-back guarantee
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export function ConversionFunnel({
  userRole,
  currentAgent,
  usageMetrics,
  onConversion,
  onClose,
}: ConversionFunnelProps) {
  const [step, setStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState('starter')
  const [showBonuses, setShowBonuses] = useState(false)

  useEffect(() => {
    // Show bonuses after 10 seconds to create urgency
    const timer = setTimeout(() => setShowBonuses(true), 10000)
    return () => clearTimeout(timer)
  }, [])

  const getPersonalizedValue = () => {
    const roleValues: Record<string, string> = {
      ceo: 'Strategic insights that helped CEOs increase revenue 34% on average',
      cfo: 'Financial optimization that saved CFOs $127K annually',
      cto: 'System efficiency improvements that reduced costs by 23%',
      sales: 'Sales acceleration that increased close rates by 67%',
      operations: 'Process automation that saved 23 hours per week',
    }

    return roleValues[userRole] || 'AI automation that transforms business operations'
  }

  const getAgentUpgrade = () => {
    const agentNames: Record<string, string> = {
      sales: 'AI Sales Expert',
      finance: 'AI Money Detective',
      operations: 'AI Operations Expert',
      crm: 'AI Customer Expert',
    }

    return agentNames[currentAgent] || 'Your AI Agent'
  }

  if (step === 1) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/95 to-gray-800/95 p-8 backdrop-blur-xl"
        >
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-500">
              <Crown className="h-12 w-12 text-white" />
            </div>

            <h1 className="mb-4 text-3xl font-bold text-white">
              Your {getAgentUpgrade()} is Ready to Scale! 🚀
            </h1>

            <p className="mb-6 text-xl text-gray-300">{getPersonalizedValue()}</p>

            {/* Usage Stats */}
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-gray-800/40 p-4">
                <div className="text-2xl font-bold text-white">{usageMetrics.actionsPerformed}</div>
                <div className="text-sm text-gray-400">Actions Completed</div>
              </div>
              <div className="rounded-xl bg-gray-800/40 p-4">
                <div className="text-2xl font-bold text-emerald-400">
                  ${usageMetrics.valueGenerated.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Value Generated</div>
              </div>
              <div className="rounded-xl bg-gray-800/40 p-4">
                <div className="text-2xl font-bold text-blue-400">{usageMetrics.timeSpent}</div>
                <div className="text-sm text-gray-400">Hours Saved</div>
              </div>
              <div className="rounded-xl bg-gray-800/40 p-4">
                <div className="text-2xl font-bold text-violet-400">
                  {usageMetrics.featuresUsed.length}
                </div>
                <div className="text-sm text-gray-400">Features Used</div>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600/20 to-green-600/20 p-6">
              <h3 className="mb-2 text-xl font-bold text-white">Imagine 3x These Results</h3>
              <p className="text-gray-300">
                Add 2 more AI employees and multiply your success. Other {userRole}s increased
                productivity by 340% in their first month.
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setStep(2)}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-8 py-3 text-lg font-semibold text-white hover:opacity-90"
              >
                Show Me the Plans →
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border border-gray-600 px-6 py-3 text-gray-300 transition-all hover:border-gray-500"
              >
                Not Now
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/95 to-gray-800/95 p-8 backdrop-blur-xl"
        >
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-white">Choose Your AI Workforce</h2>
            <p className="text-gray-300">Upgrade from 1 agent to a full team</p>
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-2">
            {/* Starter Plan */}
            <div
              className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${
                selectedPlan === 'starter'
                  ? 'scale-105 border-violet-500 bg-violet-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => setSelectedPlan('starter')}
            >
              <div className="mb-4 text-center">
                <h3 className="mb-2 text-xl font-bold text-white">Get Started</h3>
                <div className="mb-2 text-4xl font-bold text-white">
                  $49<span className="text-lg text-gray-400">/user</span>
                </div>
                <p className="text-gray-400">3 AI employees included</p>
              </div>

              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                  Your current {getAgentUpgrade()} + 2 more
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                  Unlimited usage & automations
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                  Priority support & training
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                  Advanced integrations
                </li>
              </ul>

              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-600/20 p-3">
                <div className="text-sm font-medium text-emerald-400">ROI Guarantee</div>
                <div className="text-sm text-white">Save 20+ hours/week or money back</div>
              </div>
            </div>

            {/* Business Plan */}
            <div
              className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all ${
                selectedPlan === 'business'
                  ? 'scale-105 border-emerald-500 bg-emerald-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => setSelectedPlan('business')}
            >
              <div className="absolute -top-3 right-4">
                <span className="rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-1 text-sm font-semibold text-white">
                  RECOMMENDED
                </span>
              </div>

              <div className="mb-4 text-center">
                <h3 className="mb-2 text-xl font-bold text-white">The Sweet Spot</h3>
                <div className="mb-2 text-4xl font-bold text-white">
                  $99<span className="text-lg text-gray-400">/user</span>
                </div>
                <p className="text-gray-400">All AI employees included</p>
              </div>

              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-green-500" />6 AI employees (full
                  workforce)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                  Cross-department AI collaboration
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                  Custom AI workflows
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                  White-glove onboarding
                </li>
              </ul>

              <div className="mt-4 rounded-xl border border-violet-500/30 bg-violet-600/20 p-3">
                <div className="text-sm font-medium text-violet-400">Best Value</div>
                <div className="text-sm text-white">$50+ savings vs individual agents</div>
              </div>
            </div>
          </div>

          {/* Limited Time Bonuses */}
          <AnimatePresence>
            {showBonuses && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-600/20 to-red-600/20 p-4"
              >
                <div className="text-center">
                  <h4 className="mb-2 text-lg font-bold text-orange-400">
                    🎁 Limited Time Bonuses (Expire in 10 min)
                  </h4>
                  <div className="grid gap-4 text-sm text-gray-300 md:grid-cols-3">
                    <div>✨ Free setup & migration ($500 value)</div>
                    <div>🎯 3 months priority support ($300 value)</div>
                    <div>📊 Custom dashboard setup ($200 value)</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              onClick={() => onConversion(selectedPlan)}
              className="flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-12 py-4 text-lg font-bold text-white hover:opacity-90"
            >
              Upgrade to {selectedPlan === 'starter' ? '3 AI Employees' : 'Full AI Workforce'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>

            <button
              onClick={() => setStep(1)}
              className="rounded-xl border border-gray-600 px-6 py-4 text-gray-300 transition-all hover:border-gray-500"
            >
              ← Back
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-400">
            <div className="mb-2 flex items-center justify-center">
              <Shield className="mr-1 h-4 w-4" />
              30-day money-back guarantee • Cancel anytime • Setup in under 5 minutes
            </div>
            <div>Join 1,247+ companies who scaled with CoreFlow360 this month</div>
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}
