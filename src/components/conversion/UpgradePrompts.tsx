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
  AlertCircle
} from 'lucide-react'

interface UpgradePromptProps {
  triggerType: 'limit-reached' | 'feature-gate' | 'value-demonstration' | 'success-moment' | 'time-based'
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
  onDelay 
}: UpgradePromptProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState('starter')

  const getPromptContent = () => {
    switch (triggerType) {
      case 'limit-reached':
        return {
          title: `You've Hit Your ${context?.limitType} Limit!`,
          subtitle: `${context?.limitCount} ${context?.limitType?.toLowerCase()} used`,
          description: "Your free AI agent is performing amazingly! Unlock more power to scale your results.",
          icon: AlertCircle,
          color: 'text-amber-400',
          gradient: 'from-amber-500 to-orange-600',
          urgency: 'high',
          valueProposition: `Add 2 more AI agents for just $49/user and 3x your productivity`
        }
      
      case 'feature-gate':
        return {
          title: `${context?.featureAttempted} Needs More AI Power`,
          subtitle: 'Feature requires multiple AI agents',
          description: "This advanced feature needs multiple AI agents working together. Upgrade to unlock the full capability.",
          icon: Zap,
          color: 'text-violet-400',
          gradient: 'from-violet-500 to-purple-600',
          urgency: 'medium',
          valueProposition: 'Get 3 AI employees working together - ROI guaranteed'
        }
      
      case 'value-demonstration':
        return {
          title: `🎉 Your AI Generated ${context?.valueGenerated}!`,
          subtitle: 'Imagine 3x more results',
          description: "Your free AI agent is already creating value. Scale this success with our full AI workforce.",
          icon: TrendingUp,
          color: 'text-emerald-400',
          gradient: 'from-emerald-500 to-green-600',
          urgency: 'low',
          valueProposition: '3 AI agents = 3x the value you just experienced'
        }
      
      case 'success-moment':
        return {
          title: 'You\'re Crushing It! 🚀',
          subtitle: `${context?.actionsPerformed} successful actions completed`,
          description: "You're getting great results with one AI agent. Ready to 10x your success?",
          icon: Star,
          color: 'text-cyan-400',
          gradient: 'from-cyan-500 to-blue-600',
          urgency: 'low',
          valueProposition: 'Successful users upgrade within 30 days - join them!'
        }
      
      case 'time-based':
        return {
          title: 'Ready for More AI Power?',
          subtitle: `${context?.timeOnPlatform} days of excellent results`,
          description: "You've experienced the value of AI automation. Scale it across your entire business.",
          icon: Clock,
          color: 'text-indigo-400',
          gradient: 'from-indigo-500 to-purple-600',
          urgency: 'medium',
          valueProposition: 'Limited time: Get 3 AI agents for the price of 2'
        }
      
      default:
        return {
          title: 'Upgrade Your AI Workforce',
          subtitle: 'Scale your success',
          description: "Get more AI employees to handle more work automatically.",
          icon: Sparkles,
          color: 'text-blue-400',
          gradient: 'from-blue-500 to-cyan-600',
          urgency: 'medium',
          valueProposition: 'Join thousands who scaled with multiple AI agents'
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
      timestamp: new Date().toISOString()
    }
    
    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'upgrade_prompt_conversion', {
        trigger_type: triggerType,
        current_plan: currentPlan,
        selected_plan: selectedPlan,
        value: selectedPlan === 'starter' ? 49 : selectedPlan === 'business' ? 99 : 0
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 max-w-2xl w-full">
          {/* Close Button */}
          <button
            onClick={() => { setIsVisible(false); onDismiss?.() }}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Urgency Badge */}
          {promptContent.urgency === 'high' && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-semibold animate-pulse">
                ACTION NEEDED
              </span>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-r ${promptContent.gradient} rounded-full flex items-center justify-center`}>
              <IconComponent className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              {promptContent.title}
            </h2>
            
            <p className={`${promptContent.color} text-sm font-medium mb-2`}>
              {promptContent.subtitle}
            </p>
            
            <p className="text-gray-300">
              {promptContent.description}
            </p>
          </div>

          {/* Value Proposition */}
          <div className="bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/30 rounded-xl p-4 mb-6">
            <div className="text-center">
              <div className="text-violet-300 text-sm font-medium mb-1">Special Offer</div>
              <div className="text-white font-semibold">{promptContent.valueProposition}</div>
            </div>
          </div>

          {/* Plan Selection */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Starter Plan */}
            <div 
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                selectedPlan === 'starter' 
                  ? 'border-violet-500 bg-violet-500/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => setSelectedPlan('starter')}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">Get Started</h3>
                <div className="text-2xl font-bold text-white">$49</div>
              </div>
              <p className="text-gray-400 text-sm mb-3">Perfect for small teams</p>
              <ul className="space-y-1 text-sm text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  3 AI employees
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Unlimited usage
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Priority support
                </li>
              </ul>
            </div>

            {/* Business Plan */}
            <div 
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all relative ${
                selectedPlan === 'business' 
                  ? 'border-emerald-500 bg-emerald-500/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => setSelectedPlan('business')}
            >
              <div className="absolute -top-3 right-3">
                <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  MOST POPULAR
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">The Sweet Spot</h3>
                <div className="text-2xl font-bold text-white">$99</div>
              </div>
              <p className="text-gray-400 text-sm mb-3">For growing businesses</p>
              <ul className="space-y-1 text-sm text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  All AI employees
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Advanced features
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  White-glove setup
                </li>
              </ul>
            </div>
          </div>

          {/* Social Proof */}
          <div className="bg-gray-800/40 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                1,247 users upgraded this week
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                4.9/5 satisfaction
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpgrade}
              className={`flex-1 bg-gradient-to-r ${promptContent.gradient} hover:opacity-90 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center transition-all`}
            >
              Upgrade Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            
            {triggerType !== 'limit-reached' && (
              <button
                onClick={() => { setIsVisible(false); onDelay?.() }}
                className="flex-1 border border-gray-600 text-gray-300 py-3 px-6 rounded-xl font-medium hover:border-gray-500 transition-all"
              >
                Remind Me Later
              </button>
            )}
          </div>

          {/* Guarantee */}
          <div className="text-center mt-4">
            <div className="flex items-center justify-center text-sm text-gray-400">
              <Shield className="w-4 h-4 mr-1" />
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
  onClose 
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
      'ceo': 'Strategic insights that helped CEOs increase revenue 34% on average',
      'cfo': 'Financial optimization that saved CFOs $127K annually',
      'cto': 'System efficiency improvements that reduced costs by 23%',
      'sales': 'Sales acceleration that increased close rates by 67%',
      'operations': 'Process automation that saved 23 hours per week'
    }
    
    return roleValues[userRole] || 'AI automation that transforms business operations'
  }

  const getAgentUpgrade = () => {
    const agentNames: Record<string, string> = {
      'sales': 'AI Sales Expert',
      'finance': 'AI Money Detective',
      'operations': 'AI Operations Expert',
      'crm': 'AI Customer Expert'
    }
    
    return agentNames[currentAgent] || 'Your AI Agent'
  }

  if (step === 1) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 max-w-3xl w-full"
        >
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Crown className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              Your {getAgentUpgrade()} is Ready to Scale! 🚀
            </h1>
            
            <p className="text-xl text-gray-300 mb-6">
              {getPersonalizedValue()}
            </p>

            {/* Usage Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800/40 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{usageMetrics.actionsPerformed}</div>
                <div className="text-gray-400 text-sm">Actions Completed</div>
              </div>
              <div className="bg-gray-800/40 rounded-xl p-4">
                <div className="text-2xl font-bold text-emerald-400">${usageMetrics.valueGenerated.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Value Generated</div>
              </div>
              <div className="bg-gray-800/40 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-400">{usageMetrics.timeSpent}</div>
                <div className="text-gray-400 text-sm">Hours Saved</div>
              </div>
              <div className="bg-gray-800/40 rounded-xl p-4">
                <div className="text-2xl font-bold text-violet-400">{usageMetrics.featuresUsed.length}</div>
                <div className="text-gray-400 text-sm">Features Used</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 border border-emerald-500/30 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-2">
                Imagine 3x These Results
              </h3>
              <p className="text-gray-300">
                Add 2 more AI employees and multiply your success. Other {userRole}s increased productivity by 340% in their first month.
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setStep(2)}
                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 text-white px-8 py-3 rounded-xl font-semibold text-lg"
              >
                Show Me the Plans →
              </button>
              <button
                onClick={onClose}
                className="border border-gray-600 text-gray-300 px-6 py-3 rounded-xl hover:border-gray-500 transition-all"
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 max-w-4xl w-full"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Choose Your AI Workforce</h2>
            <p className="text-gray-300">Upgrade from 1 agent to a full team</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Starter Plan */}
            <div 
              className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                selectedPlan === 'starter' 
                  ? 'border-violet-500 bg-violet-500/10 scale-105' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => setSelectedPlan('starter')}
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">Get Started</h3>
                <div className="text-4xl font-bold text-white mb-2">$49<span className="text-lg text-gray-400">/user</span></div>
                <p className="text-gray-400">3 AI employees included</p>
              </div>
              
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Your current {getAgentUpgrade()} + 2 more
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Unlimited usage & automations
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Priority support & training
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Advanced integrations
                </li>
              </ul>

              <div className="bg-emerald-600/20 border border-emerald-500/30 rounded-xl p-3 mt-4">
                <div className="text-emerald-400 text-sm font-medium">ROI Guarantee</div>
                <div className="text-white text-sm">Save 20+ hours/week or money back</div>
              </div>
            </div>

            {/* Business Plan */}
            <div 
              className={`border-2 rounded-2xl p-6 cursor-pointer transition-all relative ${
                selectedPlan === 'business' 
                  ? 'border-emerald-500 bg-emerald-500/10 scale-105' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => setSelectedPlan('business')}
            >
              <div className="absolute -top-3 right-4">
                <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  RECOMMENDED
                </span>
              </div>
              
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">The Sweet Spot</h3>
                <div className="text-4xl font-bold text-white mb-2">$99<span className="text-lg text-gray-400">/user</span></div>
                <p className="text-gray-400">All AI employees included</p>
              </div>
              
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  6 AI employees (full workforce)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Cross-department AI collaboration
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Custom AI workflows
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  White-glove onboarding
                </li>
              </ul>

              <div className="bg-violet-600/20 border border-violet-500/30 rounded-xl p-3 mt-4">
                <div className="text-violet-400 text-sm font-medium">Best Value</div>
                <div className="text-white text-sm">$50+ savings vs individual agents</div>
              </div>
            </div>
          </div>

          {/* Limited Time Bonuses */}
          <AnimatePresence>
            {showBonuses && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-xl p-4 mb-6"
              >
                <div className="text-center">
                  <h4 className="text-lg font-bold text-orange-400 mb-2">🎁 Limited Time Bonuses (Expire in 10 min)</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
                    <div>✨ Free setup & migration ($500 value)</div>
                    <div>🎯 3 months priority support ($300 value)</div>
                    <div>📊 Custom dashboard setup ($200 value)</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onConversion(selectedPlan)}
              className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 text-white px-12 py-4 rounded-xl font-bold text-lg flex items-center justify-center"
            >
              Upgrade to {selectedPlan === 'starter' ? '3 AI Employees' : 'Full AI Workforce'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            
            <button
              onClick={() => setStep(1)}
              className="border border-gray-600 text-gray-300 px-6 py-4 rounded-xl hover:border-gray-500 transition-all"
            >
              ← Back
            </button>
          </div>

          <div className="text-center mt-6 text-sm text-gray-400">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-4 h-4 mr-1" />
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