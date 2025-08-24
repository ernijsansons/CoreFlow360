'use client'

import { useState } from 'react'
import Link from 'next/link'

const pricingTiers = [
  {
    name: "Intelligent",
    price: "$7-15",
    description: "Perfect for single business owners",
    businesses: "1 Business",
    discount: "Standard Pricing",
    discountPercent: 0,
    features: [
      "Core AI employees for your industry",
      "Basic automation and workflows",
      "Customer management system",
      "Standard integrations",
      "Email support",
      "30-day guarantee"
    ],
    popular: false,
    color: "blue"
  },
  {
    name: "Intelligent Pro",
    price: "$25-35",
    description: "Growing businesses with multiple locations",
    businesses: "2-3 Businesses",
    discount: "10% Empire Discount",
    discountPercent: 10,
    features: [
      "Everything in Intelligent",
      "Advanced AI employees",
      "Cross-business analytics",
      "Priority integrations",
      "Multi-location management",
      "Phone + email support"
    ],
    popular: true,
    color: "purple"
  },
  {
    name: "Autonomous",
    price: "$45-65",
    description: "Established business portfolios",
    businesses: "4-6 Businesses",
    discount: "15% Empire Discount",
    discountPercent: 15,
    features: [
      "Everything in Intelligent Pro",
      "Full AI automation suite",
      "Predictive analytics",
      "Custom integrations",
      "Dedicated success manager",
      "24/7 priority support"
    ],
    popular: false,
    color: "pink"
  },
  {
    name: "Advanced",
    price: "$85-150",
    description: "Business empires and enterprises",
    businesses: "7+ Businesses",
    discount: "25% Empire Discount",
    discountPercent: 25,
    features: [
      "Everything in Autonomous",
      "Custom AI employee development",
      "White-label options",
      "API access",
      "Dedicated enterprise team",
      "SLA guarantees"
    ],
    popular: false,
    color: "orange"
  }
]

const industryPricing = {
  "HVAC": { min: 7, max: 15, employees: "Mason AI, Dakota AI, Blake AI" },
  "Legal": { min: 12, max: 28, employees: "Sophia AI, Justice AI, Advocate AI" },
  "Construction": { min: 15, max: 35, employees: "Mason AI, Dakota AI, Blake AI" },
  "Professional": { min: 25, max: 65, employees: "Morgan AI, Taylor AI, Jordan AI" },
  "Restaurant": { min: 8, max: 18, employees: "Chef AI, Server AI, Manager AI" },
  "Retail": { min: 6, max: 14, employees: "Sales AI, Inventory AI, Customer AI" }
}

const empireBenefits = [
  {
    businesses: 1,
    discount: 0,
    cost: "$450/month",
    ai: "3 AI employees",
    description: "Perfect starting point"
  },
  {
    businesses: 3,
    discount: 10,
    cost: "$1,215/month",
    savings: "$135/month saved",
    ai: "9 AI employees",
    description: "Multi-location power"
  },
  {
    businesses: 5,
    discount: 15,
    cost: "$1,913/month",
    savings: "$338/month saved",
    ai: "15 AI employees",
    description: "Portfolio optimization"
  },
  {
    businesses: 10,
    discount: 25,
    cost: "$3,375/month",
    savings: "$1,125/month saved",
    ai: "30 AI employees",
    description: "Empire-level power"
  }
]

export default function V0ProgressivePricing() {
  const [selectedIndustry, setSelectedIndustry] = useState("HVAC")
  const [businessCount, setBusinessCount] = useState(1)

  const calculatePricing = (tier: typeof pricingTiers[0], industry: string) => {
    const industryData = industryPricing[industry as keyof typeof industryPricing]
    const basePrice = tier.name === "Intelligent" ? industryData.min : 
                     tier.name === "Intelligent Pro" ? industryData.min + 8 :
                     tier.name === "Autonomous" ? industryData.min + 18 :
                     industryData.min + 28
    
    const discountedPrice = basePrice * (1 - tier.discountPercent / 100)
    return Math.round(discountedPrice)
  }

  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block p-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-6">
            <div className="bg-black px-6 py-2 rounded-2xl">
              <span className="text-lg font-semibold text-white">💰 Empire Pricing System</span>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            The More You Build, <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 bg-clip-text text-transparent">The More You Save</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Our revolutionary pricing rewards empire builders. Start with one business, 
            then unlock massive discounts as you expand your portfolio.
          </p>
        </div>

        {/* Industry Selector */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-white text-center mb-6">Choose Your Industry</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {Object.keys(industryPricing).map((industry) => (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  selectedIndustry === industry
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-16">
          {pricingTiers.map((tier, index) => {
            const price = calculatePricing(tier, selectedIndustry)
            const colorClasses = {
              blue: "from-blue-600/20 to-blue-800/20 border-blue-500/30",
              purple: "from-purple-600/20 to-purple-800/20 border-purple-500/30",
              pink: "from-pink-600/20 to-pink-800/20 border-pink-500/30",
              orange: "from-orange-600/20 to-orange-800/20 border-orange-500/30"
            }

            return (
              <div 
                key={index}
                className={`relative p-6 bg-gradient-to-br ${colorClasses[tier.color as keyof typeof colorClasses]} backdrop-blur-sm rounded-2xl border ${
                  tier.popular ? 'ring-2 ring-purple-500 transform scale-105' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold text-white mb-2">
                    ${price}<span className="text-lg text-gray-400">/user/mo</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{tier.description}</p>
                  <div className="text-center">
                    <div className="text-white font-semibold">{tier.businesses}</div>
                    <div className={`text-sm font-bold ${tier.discountPercent > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                      {tier.discount}
                    </div>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 bg-gradient-to-r ${
                  tier.color === 'blue' ? 'from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600' :
                  tier.color === 'purple' ? 'from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600' :
                  tier.color === 'pink' ? 'from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600' :
                  'from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600'
                } text-white font-bold rounded-xl transition-all duration-300`}>
                  Start Free Trial
                </button>
              </div>
            )
          })}
        </div>

        {/* Empire Savings Calculator */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm p-8 rounded-3xl border border-purple-500/20">
            <h3 className="text-3xl font-bold text-white text-center mb-8">Your Empire Savings</h3>
            
            <div className="grid md:grid-cols-4 gap-6">
              {empireBenefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="text-center p-6 bg-gray-800/50 rounded-2xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="text-2xl font-bold text-white mb-2">{benefit.businesses} {benefit.businesses === 1 ? 'Business' : 'Businesses'}</div>
                  <div className="text-3xl font-bold text-purple-400 mb-2">{benefit.cost}</div>
                  {benefit.savings && (
                    <div className="text-green-400 font-bold text-sm mb-2">{benefit.savings}</div>
                  )}
                  <div className="text-gray-400 text-sm mb-2">{benefit.ai}</div>
                  <div className="text-gray-300 text-xs">{benefit.description}</div>
                  {benefit.discount > 0 && (
                    <div className="mt-2 inline-block px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-bold">
                      {benefit.discount}% OFF
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-300 mb-4">
                The math is simple: More businesses = Lower cost per business = Higher total savings
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/auth/signup"
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all duration-300"
                >
                  Start Building My Empire
                </Link>
                <Link 
                  href="#roi-calculator"
                  className="px-8 py-3 border-2 border-purple-500 hover:border-purple-400 text-white font-bold rounded-xl transition-all duration-300"
                >
                  Calculate My Savings
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Section */}
        <div className="text-center">
          <div className="inline-block p-8 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-3xl border border-gray-700 max-w-4xl">
            <h3 className="text-2xl font-bold text-white mb-4">Enterprise & Custom Solutions</h3>
            <p className="text-gray-300 mb-6">
              Need 20+ businesses? Custom AI employees? White-label solutions? 
              We create custom enterprise packages for serious empire builders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact"
                className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300"
              >
                Contact Enterprise Sales
              </Link>
              <Link 
                href="/schedule-demo"
                className="px-8 py-3 border-2 border-gray-600 hover:border-gray-400 text-white font-bold rounded-xl transition-all duration-300"
              >
                Schedule Custom Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}