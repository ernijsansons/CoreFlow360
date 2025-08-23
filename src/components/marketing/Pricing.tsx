'use client'

import { useState } from 'react'

const pricingTiers = [
  {
    name: 'Neural',
    price: '$7-15',
    subtitle: 'Per user/month',
    description: 'Single module intelligence for focused operations',
    features: [
      'Choose 1 business intelligence module',
      'Basic automation workflows',
      'Standard reporting dashboard', 
      'Email support',
      'Mobile app access'
    ],
    color: 'gray',
    cta: 'Start Free Trial',
    popular: false
  },
  {
    name: 'Synaptic',
    price: '$25-35',
    subtitle: 'Per user/month',
    description: 'Multi-module intelligence bridges for enhanced efficiency',
    features: [
      'Choose up to 3 modules',
      'Cross-module intelligence connections',
      'Advanced automation workflows',
      'Custom dashboard builder',
      'Priority support',
      'API access'
    ],
    color: 'blue',
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Autonomous',
    price: '$45-65',
    subtitle: 'Per user/month',
    description: 'Full business consciousness with self-improving processes',
    features: [
      'All 8 intelligence modules',
      'Exponential intelligence multiplication',
      'Autonomous decision-making engine',
      'Predictive business analytics',
      'Dedicated success manager',
      'Custom integrations',
      'Advanced security features'
    ],
    color: 'violet',
    cta: 'Start Free Trial',
    popular: false
  },
  {
    name: 'Transcendent',
    price: '$85-150',
    subtitle: 'Per user/month',
    description: 'Meta-consciousness coordination for enterprise evolution',
    features: [
      'Everything in Autonomous',
      'Multi-organization intelligence network',
      'Business singularity preparation',
      'White-label solutions',
      '24/7 dedicated support',
      'Custom AI model training',
      'Enterprise-grade security',
      'On-premise deployment options'
    ],
    color: 'cyan',
    cta: 'Contact Sales',
    popular: false
  }
]

const colorClasses = {
  gray: {
    border: 'border-gray-700',
    bg: 'bg-gray-800/50',
    accent: 'text-gray-400',
    button: 'bg-gray-700 hover:bg-gray-600 text-white'
  },
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-500/10',
    accent: 'text-blue-400',
    button: 'bg-blue-600 hover:bg-blue-500 text-white'
  },
  violet: {
    border: 'border-violet-500',
    bg: 'bg-violet-500/10',
    accent: 'text-violet-400',
    button: 'bg-violet-600 hover:bg-violet-500 text-white'
  },
  cyan: {
    border: 'border-cyan-500',
    bg: 'bg-cyan-500/10',
    accent: 'text-cyan-400',
    button: 'bg-cyan-600 hover:bg-cyan-500 text-white'
  }
}

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-gray-950 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Intelligence That <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Scales With You</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Choose your consciousness level. Start small, grow exponentially. The more modules you add, the more intelligent your business becomes.
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-800 rounded-lg p-1">
            <button
              className={`px-6 py-2 rounded-md transition-all duration-200 ${
                billingPeriod === 'monthly' 
                  ? 'bg-violet-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-md transition-all duration-200 ${
                billingPeriod === 'yearly' 
                  ? 'bg-violet-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setBillingPeriod('yearly')}
            >
              Yearly <span className="text-green-400 text-sm ml-1">(Save 20%)</span>
            </button>
          </div>
        </div>

        {/* Intelligence Multiplication Formula */}
        <div className="text-center mb-12">
          <div className="inline-block p-6 rounded-2xl bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
            <h3 className="text-lg font-semibold text-white mb-2">Intelligence Multiplication Formula</h3>
            <div className="text-2xl font-mono">
              <span className="text-gray-400">Intelligence = </span>
              <span className="text-violet-400">Modules</span>
              <span className="text-white"> × </span>
              <span className="text-cyan-400">Connections</span>
              <span className="text-white"> × </span>
              <span className="text-blue-400">Time</span>
              <span className="text-white"> = </span>
              <span className="text-green-400">∞</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingTiers.map((tier) => {
            const colors = colorClasses[tier.color as keyof typeof colorClasses]
            return (
              <div
                key={tier.name}
                className={`relative p-8 rounded-3xl border-2 ${colors.border} ${colors.bg} ${
                  tier.popular ? 'transform scale-105 shadow-2xl' : ''
                }`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Tier Name */}
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  <span className="text-gray-400 ml-2">{tier.subtitle}</span>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-6">{tier.description}</p>

                {/* CTA Button */}
                <button className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 mb-8 ${colors.button}`}>
                  {tier.cta}
                </button>

                {/* Features */}
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className={`w-5 h-5 ${colors.accent} mr-3 mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-300 mb-6">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg">
              Start Free Trial
            </button>
            <button className="px-8 py-4 border border-gray-600 hover:border-gray-400 text-white rounded-xl font-semibold transition-all duration-300">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}