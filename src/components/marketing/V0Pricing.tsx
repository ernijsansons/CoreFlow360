'use client'

import { useState } from 'react'

const pricingTiers = [
  {
    name: 'Forever Free',
    price: '$0',
    subtitle: 'Always free',
    description: 'Perfect for testing our AI employees',
    aiEmployees: '1 AI Agent',
    businesses: '1 Business',
    features: [
      '1 AI employee (your choice)',
      'Basic automation workflows',
      'Standard dashboard',
      'Email support',
      'Mobile app access',
      'Community support'
    ],
    color: 'gray',
    cta: 'Start Free',
    popular: false,
    badge: 'FOREVER FREE'
  },
  {
    name: 'Growth Accelerator',
    price: '$49',
    originalPrice: '$149',
    subtitle: 'Per user/month',
    description: 'Scale with 3 AI employees working 24/7',
    aiEmployees: '3 AI Employees',
    businesses: 'Up to 3 Businesses',
    features: [
      'Choose any 3 AI employees',
      'Multi-business portfolio dashboard',
      'Advanced automation workflows',
      'Priority support',
      'API access',
      'Custom integrations',
      'Performance analytics'
    ],
    color: 'blue',
    cta: 'Start Free Trial',
    popular: true,
    badge: 'MOST POPULAR',
    savings: '67% OFF'
  },
  {
    name: 'Empire Builder',
    price: '$99',
    originalPrice: '$299', 
    subtitle: 'Per user/month',
    description: 'Full AI workforce for unlimited growth',
    aiEmployees: 'All AI Employees',
    businesses: 'Unlimited Businesses',
    features: [
      'All 8 AI employees included',
      'Unlimited business locations',
      'AI empire optimization',
      'Dedicated success manager',
      'White-label options',
      'Advanced security features',
      'Custom AI training',
      'Enterprise integrations'
    ],
    color: 'purple',
    cta: 'Start Free Trial',
    popular: false,
    badge: 'BEST VALUE',
    savings: '70% OFF'
  },
  {
    name: 'Custom Enterprise',
    price: 'Custom',
    subtitle: 'Contact sales',
    description: 'Tailored AI solutions for large enterprises',
    aiEmployees: 'Custom AI Team',
    businesses: 'Enterprise Scale',
    features: [
      'Custom AI employee development',
      'Enterprise-grade security',
      'Dedicated infrastructure',
      'SLA guarantees',
      'Custom training programs',
      'Multi-tenant management',
      '24/7 phone support',
      'On-premise deployment'
    ],
    color: 'gold',
    cta: 'Contact Sales',
    popular: false,
    badge: 'ENTERPRISE'
  }
]

const colorClasses = {
  gray: {
    border: 'border-gray-600',
    bg: 'bg-gray-800/30',
    accent: 'text-gray-400',
    button: 'bg-gray-700 hover:bg-gray-600 text-white',
    badge: 'bg-gray-600'
  },
  blue: {
    border: 'border-blue-500 shadow-blue-500/20',
    bg: 'bg-blue-500/10',
    accent: 'text-blue-400',
    button: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25',
    badge: 'bg-blue-600'
  },
  purple: {
    border: 'border-purple-500 shadow-purple-500/20', 
    bg: 'bg-purple-500/10',
    accent: 'text-purple-400',
    button: 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25',
    badge: 'bg-purple-600'
  },
  gold: {
    border: 'border-yellow-500 shadow-yellow-500/20',
    bg: 'bg-yellow-500/10',
    accent: 'text-yellow-400', 
    button: 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-500/25',
    badge: 'bg-yellow-600'
  }
}

export default function V0Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Progressive <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">AI Pricing</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8">
            The more businesses you manage, the more you save. Our AI employees get smarter 
            as your empire grows. Start free, scale affordably.
          </p>
          
          {/* Savings Indicator */}
          <div className="inline-flex items-center bg-green-600/20 border border-green-500/30 rounded-full px-6 py-2 mb-8">
            <span className="text-green-400 font-semibold">🎯 Limited Time: Up to 70% OFF Launch Pricing</span>
          </div>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-800 rounded-xl p-1">
            <button
              className={`px-8 py-3 rounded-lg transition-all duration-300 font-semibold ${
                billingPeriod === 'monthly' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-8 py-3 rounded-lg transition-all duration-300 font-semibold ${
                billingPeriod === 'yearly' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setBillingPeriod('yearly')}
            >
              Yearly <span className="text-green-400 text-sm ml-1">(Save 25%)</span>
            </button>
          </div>
        </div>

        {/* Progressive Savings Visual */}
        <div className="text-center mb-12">
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20">
            <h3 className="text-xl font-bold text-white mb-4">🚀 The More You Grow, The More You Save</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">1 Business</div>
                <div className="text-gray-400">Standard Pricing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">3 Businesses</div>
                <div className="text-gray-400">15% Discount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">5+ Businesses</div>
                <div className="text-gray-400">25% Discount</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-4 gap-8 mb-16">
          {pricingTiers.map((tier) => {
            const colors = colorClasses[tier.color as keyof typeof colorClasses]
            return (
              <div
                key={tier.name}
                className={`relative p-8 rounded-3xl border-2 ${colors.border} ${colors.bg} ${
                  tier.popular ? 'transform scale-105 shadow-2xl' : 'shadow-lg'
                } backdrop-blur-sm`}
              >
                {/* Badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className={`${colors.badge} text-white px-4 py-2 rounded-full text-sm font-bold`}>
                    {tier.badge}
                  </span>
                </div>

                {/* Tier Name */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  
                  {/* Price */}
                  <div className="mb-2">
                    {tier.originalPrice && (
                      <span className="text-lg text-gray-500 line-through mr-2">{tier.originalPrice}</span>
                    )}
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                    {tier.subtitle && (
                      <span className="text-gray-400 ml-2">{tier.subtitle}</span>
                    )}
                  </div>
                  
                  {tier.savings && (
                    <div className="inline-block bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                      {tier.savings}
                    </div>
                  )}
                </div>

                {/* AI Employees */}
                <div className="text-center mb-6">
                  <div className={`inline-block px-4 py-2 rounded-xl ${colors.bg} border ${colors.border}`}>
                    <div className="text-lg font-bold text-white">{tier.aiEmployees}</div>
                    <div className="text-sm text-gray-400">{tier.businesses}</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-center mb-6">{tier.description}</p>

                {/* CTA Button */}
                <button className={`w-full py-4 rounded-xl font-bold transition-all duration-300 mb-8 ${colors.button}`}>
                  {tier.cta}
                </button>

                {/* Features */}
                <ul className="space-y-4">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className={`w-5 h-5 ${colors.accent} mr-3 mt-1 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
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
        <div className="text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Build Your Business Empire?</h3>
            <p className="text-gray-300 mb-6">
              Join 2,847+ businesses that have transformed their operations with AI employees
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
              Start Free Trial - No Credit Card
            </button>
            <button className="px-8 py-4 border-2 border-gray-600 hover:border-gray-400 text-white rounded-xl font-semibold transition-all duration-300">
              Schedule Personal Demo
            </button>
          </div>

          <div className="mt-8 text-gray-400 text-sm">
            <p>✅ 30-day free trial • ✅ AI Launch Concierge included • ✅ Cancel anytime</p>
          </div>
        </div>
      </div>
    </section>
  )
}