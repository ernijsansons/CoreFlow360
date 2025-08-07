'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  Sparkles,
  Brain,
  Crown,
  ArrowRight,
  Rocket,
  Infinity
} from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { NeuralNetworkBackground } from '@/components/ui/NeuralNetworkBackground'

interface PricingTier {
  id: string
  name: string
  tagline: string
  price: {
    monthly: number
    yearly: number
  }
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  popular?: boolean
  enterprise?: boolean
  features: Array<{
    name: string
    included: boolean
    aiPowered?: boolean
    limitation?: string
  }>
  aiCapabilities: {
    predictiveAnalytics: boolean
    autonomousDecisions: boolean
    advancedML: boolean
    customModels: boolean
  }
  limits: {
    users: string
    storage: string
    apiCalls: string
    support: string
  }
  industries: string[]
}

const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'AI Starter',
    tagline: 'Intelligent Foundation',
    price: {
      monthly: 49,
      yearly: 490
    },
    icon: Sparkles,
    gradient: 'from-blue-500 to-cyan-500',
    features: [
      { name: 'Basic CRM Intelligence', included: true, aiPowered: true },
      { name: 'Automated Lead Scoring', included: true, aiPowered: true },
      { name: 'Smart Email Templates', included: true, aiPowered: true },
      { name: 'Basic Predictive Analytics', included: true, aiPowered: true },
      { name: 'Real-time Dashboard', included: true },
      { name: 'Standard Integrations', included: true },
      { name: 'Advanced ML Models', included: false },
      { name: 'Custom AI Training', included: false },
      { name: 'Multi-department AI', included: false }
    ],
    aiCapabilities: {
      predictiveAnalytics: true,
      autonomousDecisions: false,
      advancedML: false,
      customModels: false
    },
    limits: {
      users: 'Up to 5 users',
      storage: '10GB storage',
      apiCalls: '1K AI calls/month',
      support: 'Email support'
    },
    industries: ['Small Business', 'Startups', 'Consultants']
  },
  {
    id: 'professional',
    name: 'AI Professional',
    tagline: 'Complete Intelligence',
    price: {
      monthly: 149,
      yearly: 1490
    },
    icon: Brain,
    gradient: 'from-violet-500 to-purple-500',
    popular: true,
    features: [
      { name: 'Full-Spectrum AI Suite', included: true, aiPowered: true },
      { name: 'Multi-Department Intelligence', included: true, aiPowered: true },
      { name: 'Predictive Churn Analysis', included: true, aiPowered: true },
      { name: 'Advanced Route Optimization', included: true, aiPowered: true },
      { name: 'AI-Powered Accounting', included: true, aiPowered: true },
      { name: 'Smart HR Analytics', included: true, aiPowered: true },
      { name: 'Custom Dashboards', included: true },
      { name: 'Priority Integration Support', included: true },
      { name: 'Advanced Security Features', included: true },
      { name: 'Custom AI Models', included: false },
      { name: 'White-label Solutions', included: false }
    ],
    aiCapabilities: {
      predictiveAnalytics: true,
      autonomousDecisions: true,
      advancedML: true,
      customModels: false
    },
    limits: {
      users: 'Up to 25 users',
      storage: '500GB storage',
      apiCalls: '25K AI calls/month',
      support: 'Priority chat & phone'
    },
    industries: ['Growing Businesses', 'HVAC', 'Construction', 'Healthcare']
  },
  {
    id: 'enterprise',
    name: 'AI Enterprise',
    tagline: 'Unlimited Intelligence',
    price: {
      monthly: 499,
      yearly: 4990
    },
    icon: Crown,
    gradient: 'from-emerald-500 to-teal-500',
    features: [
      { name: 'Complete AI Ecosystem', included: true, aiPowered: true },
      { name: 'Custom AI Model Training', included: true, aiPowered: true },
      { name: 'Autonomous Business Intelligence', included: true, aiPowered: true },
      { name: 'Advanced Fraud Detection', included: true, aiPowered: true },
      { name: 'Predictive Maintenance AI', included: true, aiPowered: true },
      { name: 'Multi-Industry Adaptation', included: true, aiPowered: true },
      { name: 'White-label Solutions', included: true },
      { name: 'Dedicated Success Manager', included: true },
      { name: 'Custom Integration Development', included: true },
      { name: 'Advanced Compliance Tools', included: true },
      { name: '24/7 Premium Support', included: true }
    ],
    aiCapabilities: {
      predictiveAnalytics: true,
      autonomousDecisions: true,
      advancedML: true,
      customModels: true
    },
    limits: {
      users: 'Unlimited users',
      storage: 'Unlimited storage',
      apiCalls: 'Unlimited AI calls',
      support: '24/7 dedicated support'
    },
    industries: ['Large Enterprises', 'Multi-location', 'Complex Operations']
  },
  {
    id: 'quantum',
    name: 'AI Quantum',
    tagline: 'Beyond Intelligence',
    price: {
      monthly: 0, // Custom pricing
      yearly: 0
    },
    icon: Infinity,
    gradient: 'from-orange-500 to-red-500',
    enterprise: true,
    features: [
      { name: 'Quantum-Scale AI Processing', included: true, aiPowered: true },
      { name: 'Industry-Specific AI Engines', included: true, aiPowered: true },
      { name: 'Global Multi-Tenant Architecture', included: true, aiPowered: true },
      { name: 'Custom Neural Network Design', included: true, aiPowered: true },
      { name: 'Autonomous System Evolution', included: true, aiPowered: true },
      { name: 'Real-time Global Analytics', included: true, aiPowered: true },
      { name: 'Complete White-label Platform', included: true },
      { name: 'Dedicated Infrastructure', included: true },
      { name: 'Custom Development Team', included: true },
      { name: 'Global Compliance Management', included: true },
      { name: 'Executive Advisory Board Access', included: true }
    ],
    aiCapabilities: {
      predictiveAnalytics: true,
      autonomousDecisions: true,
      advancedML: true,
      customModels: true
    },
    limits: {
      users: 'Global scale',
      storage: 'Petabyte scale',
      apiCalls: 'Quantum processing',
      support: 'Executive support team'
    },
    industries: ['Fortune 500', 'Global Corporations', 'Industry Leaders']
  }
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  const calculateSavings = (tier: PricingTier) => {
    if (tier.enterprise) return 0
    const monthlyCost = tier.price.monthly * 12
    const yearlyCost = tier.price.yearly
    const savings = monthlyCost - yearlyCost
    const percentage = Math.round((savings / monthlyCost) * 100)
    return percentage
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <NeuralNetworkBackground />
        
        <div className="container-fluid relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="heading-hero gradient-text-ai mb-6">
              Investment in Intelligence
            </h1>
            <p className="text-body-large text-gray-300 mb-12">
              Choose your level of AI transformation. From intelligent automation to quantum-scale processing, 
              find the perfect intelligence tier for your business evolution.
            </p>
            
            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-flex items-center bg-gray-900/50 p-1 rounded-xl mb-16"
            >
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  billingCycle === 'monthly' 
                    ? 'bg-violet-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  billingCycle === 'yearly' 
                    ? 'bg-violet-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Annual <span className="text-emerald-400 text-sm ml-1">(Save up to 50%)</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-24 bg-gray-950">
        <div className="container-fluid">
          <div className="grid gap-8 lg:grid-cols-4">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative ${
                  tier.popular || tier.enterprise ? 'lg:scale-105' : ''
                }`}
              >
                {/* Popular/Enterprise Badge */}
                {(tier.popular || tier.enterprise) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className={`absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 rounded-full text-sm font-medium border ${
                      tier.popular 
                        ? 'bg-violet-600 text-white border-violet-500' 
                        : 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400'
                    }`}
                  >
                    {tier.popular ? 'Most Popular' : 'Enterprise'}
                  </motion.div>
                )}

                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r opacity-0 hover:opacity-20 rounded-3xl blur-xl transition-all duration-500 ${tier.gradient}`} />
                
                {/* Card */}
                <div className={`relative glass-card p-8 h-full border-2 transition-all duration-300 ${
                  tier.popular 
                    ? 'border-violet-500/50' 
                    : tier.enterprise 
                    ? 'border-orange-500/50' 
                    : 'border-gray-800/50 hover:border-gray-700/50'
                }`}>
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${tier.gradient} mb-4`}>
                      <tier.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                    <p className="text-gray-400 mb-4">{tier.tagline}</p>
                    
                    {/* Pricing */}
                    <div className="mb-6">
                      {tier.enterprise ? (
                        <div>
                          <div className="text-4xl font-bold gradient-text-ai mb-2">Custom</div>
                          <div className="text-gray-400">Let&apos;s discuss your needs</div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-4xl font-bold text-white mb-2">
                            ${billingCycle === 'monthly' ? tier.price.monthly : Math.round(tier.price.yearly / 12)}
                            <span className="text-lg text-gray-400 font-normal">/month</span>
                          </div>
                          {billingCycle === 'yearly' && (
                            <div className="text-emerald-400 text-sm">
                              Save {calculateSavings(tier)}% annually
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <GlowingButton 
                      href={tier.enterprise ? "/contact" : "/auth/signup"}
                      size="lg"
                      variant={tier.popular || tier.enterprise ? "primary" : "outline"}
                      className="w-full mb-6"
                    >
                      {tier.enterprise ? 'Contact Sales' : 'Start Free Trial'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </GlowingButton>
                  </div>

                  {/* AI Capabilities */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-violet-400" />
                      AI Intelligence Level
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${tier.aiCapabilities.predictiveAnalytics ? 'text-emerald-400' : 'text-gray-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${tier.aiCapabilities.predictiveAnalytics ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                        Predictive
                      </div>
                      <div className={`flex items-center gap-1 ${tier.aiCapabilities.autonomousDecisions ? 'text-emerald-400' : 'text-gray-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${tier.aiCapabilities.autonomousDecisions ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                        Autonomous
                      </div>
                      <div className={`flex items-center gap-1 ${tier.aiCapabilities.advancedML ? 'text-emerald-400' : 'text-gray-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${tier.aiCapabilities.advancedML ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                        Advanced ML
                      </div>
                      <div className={`flex items-center gap-1 ${tier.aiCapabilities.customModels ? 'text-emerald-400' : 'text-gray-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${tier.aiCapabilities.customModels ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                        Custom AI
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {tier.features.slice(0, 6).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          feature.included 
                            ? 'bg-emerald-500/20 border border-emerald-500/50' 
                            : 'bg-gray-700 border border-gray-600'
                        }`}>
                          {feature.included ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-500 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm ${feature.included ? 'text-white' : 'text-gray-500'}`}>
                            {feature.name}
                            {feature.aiPowered && feature.included && (
                              <Brain className="inline w-3 h-3 ml-1 text-violet-400" />
                            )}
                          </div>
                          {feature.limitation && (
                            <div className="text-xs text-gray-500">{feature.limitation}</div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {tier.features.length > 6 && (
                      <button
                        onClick={() => setSelectedTier(selectedTier === tier.id ? null : tier.id)}
                        className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        {selectedTier === tier.id ? 'Show less' : `+${tier.features.length - 6} more features`}
                      </button>
                    )}
                  </div>

                  {/* Expanded Features */}
                  <AnimatePresence>
                    {selectedTier === tier.id && tier.features.length > 6 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 mb-6 border-t border-gray-800 pt-4"
                      >
                        {tier.features.slice(6).map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                              feature.included 
                                ? 'bg-emerald-500/20 border border-emerald-500/50' 
                                : 'bg-gray-700 border border-gray-600'
                            }`}>
                              {feature.included ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <div className="w-2 h-2 bg-gray-500 rounded-full" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className={`text-sm ${feature.included ? 'text-white' : 'text-gray-500'}`}>
                                {feature.name}
                                {feature.aiPowered && feature.included && (
                                  <Brain className="inline w-3 h-3 ml-1 text-violet-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Limits */}
                  <div className="border-t border-gray-800 pt-6 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                      <div>{tier.limits.users}</div>
                      <div>{tier.limits.storage}</div>
                      <div>{tier.limits.apiCalls}</div>
                      <div>{tier.limits.support}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <ROISection />

      {/* FAQ Section */}
      <section className="py-24 bg-black">
        <div className="container-fluid max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="heading-section text-white mb-6">
              Investment <span className="gradient-text-ai">Questions</span>
            </h2>
            <p className="text-body-large text-gray-400">
              Understanding your AI transformation investment
            </p>
          </motion.div>

          <FAQ />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-violet-950/30 to-cyan-950/30">
        <div className="container-fluid text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="heading-section text-white mb-6">
              Ready to <span className="gradient-text-ai">Invest</span> in Intelligence?
            </h2>
            <p className="text-body-large text-gray-300 mb-12 max-w-2xl mx-auto">
              Start your AI transformation today. Every tier includes a 14-day free trial 
              with full access to experience the power of intelligent automation.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <GlowingButton href="/auth/signup" size="xl">
                Start Free Trial
                <Rocket className="ml-2 h-5 w-5" />
              </GlowingButton>
              
              <GlowingButton href="/contact" size="xl" variant="outline">
                Consult AI Expert
                <Brain className="ml-2 h-5 w-5" />
              </GlowingButton>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

// ROI Section Component
function ROISection() {
  const [companySize, setCompanySize] = useState(50)
  const [currentCosts, setCurrentCosts] = useState(25000)

  const calculateROI = () => {
    const tierCost = companySize <= 5 ? 588 : companySize <= 25 ? 1788 : 5988
    const efficiencyGain = 0.23 // 23% efficiency improvement
    const costReduction = currentCosts * efficiencyGain
    const netBenefit = costReduction - tierCost
    const roiPercentage = Math.round((netBenefit / tierCost) * 100)
    
    return {
      tierCost,
      costReduction: Math.round(costReduction),
      netBenefit: Math.round(netBenefit),
      roiPercentage,
      paybackMonths: Math.round(tierCost / (costReduction / 12))
    }
  }

  const roi = calculateROI()

  return (
    <section className="py-24 bg-gray-950">
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="heading-section text-white mb-6">
            Calculate Your <span className="gradient-text-ai">ROI</span>
          </h2>
          <p className="text-body-large text-gray-400">
            See the financial impact of AI intelligence on your business
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid gap-12 lg:grid-cols-2">
          {/* Inputs */}
          <div className="glass-card p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Your Business</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Size (Employees)
                </label>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={companySize}
                  onChange={(e) => setCompanySize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>5</span>
                  <span className="font-semibold text-white">{companySize}</span>
                  <span>500+</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Monthly Operations Cost ($)
                </label>
                <input
                  type="range"
                  min="5000"
                  max="500000"
                  step="5000"
                  value={currentCosts}
                  onChange={(e) => setCurrentCosts(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>$5K</span>
                  <span className="font-semibold text-white">${(currentCosts / 1000).toFixed(0)}K</span>
                  <span>$500K</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="glass-card p-8">
            <h3 className="text-xl font-semibold text-white mb-6">AI ROI Projection</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold gradient-text-ai mb-1">
                    {roi.roiPercentage}%
                  </div>
                  <div className="text-sm text-gray-400">Annual ROI</div>
                </div>
                <div>
                  <div className="text-3xl font-bold gradient-text-ai mb-1">
                    {roi.paybackMonths}mo
                  </div>
                  <div className="text-sm text-gray-400">Payback Period</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Savings:</span>
                  <span className="text-emerald-400 font-semibold">+${(roi.costReduction / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">CoreFlow360 Cost:</span>
                  <span className="text-red-400 font-semibold">-${(roi.tierCost / 1000).toFixed(1)}K</span>
                </div>
                <div className="border-t border-gray-600 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-white">Net Monthly Benefit:</span>
                    <span className="gradient-text-ai">${(roi.netBenefit / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// FAQ Component
function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "How does AI pricing scale with my business?",
      answer: "Our AI intelligence scales with your business needs. Start with basic predictive analytics and upgrade to custom AI models as you grow. Each tier includes unlimited AI processing within your plan limits."
    },
    {
      question: "What's included in the free trial?",
      answer: "14-day full access to your chosen tier with complete AI capabilities, unlimited support, and onboarding assistance. No credit card required, no hidden fees."
    },
    {
      question: "Can I switch between AI intelligence tiers?",
      answer: "Yes, upgrade or downgrade anytime. Your AI models and data transfer seamlessly between tiers. Changes take effect at your next billing cycle."
    },
    {
      question: "How quickly do I see ROI from AI implementation?",
      answer: "Most businesses see measurable improvements within 30 days. Full ROI typically achieved in 3-6 months through automation savings, improved decision-making, and operational efficiency."
    },
    {
      question: "Is my data safe with CoreFlow360's AI?",
      answer: "Absolutely. Enterprise-grade security, SOC 2 compliance, and encrypted AI processing. Your data never leaves your secure environment and isn't used to train our models."
    }
  ]

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="glass-card"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full p-6 text-left flex justify-between items-center"
          >
            <span className="font-semibold text-white">{faq.question}</span>
            <motion.div
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </motion.div>
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-6"
              >
                <p className="text-gray-400">{faq.answer}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}