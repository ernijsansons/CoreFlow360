'use client'

import { useState } from 'react'
import Link from 'next/link'

const portfolioFeatures = [
  {
    icon: "🏢",
    title: "Multi-Business Dashboard",
    description: "Manage all your businesses from one powerful command center",
    benefits: [
      "Real-time performance metrics across all locations",
      "Unified reporting and analytics",
      "Cross-business insights and opportunities",
      "Centralized control with local flexibility"
    ],
    metric: "Manage 50+ businesses"
  },
  {
    icon: "🤖",
    title: "Shared AI Employees",
    description: "Deploy AI employees across your entire portfolio",
    benefits: [
      "One AI team serving multiple businesses",
      "Consistent service quality everywhere",
      "Knowledge sharing between locations",
      "Economies of scale in AI deployment"
    ],
    metric: "75% cost reduction"
  },
  {
    icon: "📊",
    title: "Empire Analytics",
    description: "See patterns and opportunities across your empire",
    benefits: [
      "Identify top performers and best practices",
      "Spot expansion opportunities",
      "Predictive analytics for growth",
      "Benchmark locations against each other"
    ],
    metric: "3x faster decisions"
  },
  {
    icon: "💰",
    title: "Progressive Discounts",
    description: "The more businesses you add, the more you save",
    benefits: [
      "10% off for 2-3 businesses",
      "15% off for 4-6 businesses",
      "25% off for 7+ businesses",
      "Custom enterprise pricing for 20+"
    ],
    metric: "Up to 25% savings"
  }
]

const empireBuilders = [
  {
    name: "Restaurant Empire",
    owner: "Michael Chen",
    businesses: 12,
    type: "Quick Service Restaurants",
    savings: "$47,000/month",
    growth: "+156% in 2 years",
    quote: "CoreFlow360 lets me run 12 restaurants like they're one. The AI handles everything from inventory to customer service perfectly."
  },
  {
    name: "Service Business Portfolio",
    owner: "Sarah Williams",
    businesses: 8,
    type: "Home Services Companies",
    savings: "$31,000/month",
    growth: "+89% in 18 months",
    quote: "I went from managing chaos to building an empire. Each business runs itself while I focus on growth."
  },
  {
    name: "Professional Services Group",
    owner: "David Thompson",
    businesses: 15,
    type: "Consulting & Accounting Firms",
    savings: "$62,000/month",
    growth: "+203% in 3 years",
    quote: "The portfolio management features are game-changing. I see everything, control everything, optimize everything."
  }
]

export default function V0PortfolioManagement() {
  const [selectedBuilder, setSelectedBuilder] = useState(0)

  return (
    <section id="portfolio-management" className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block p-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-6">
            <div className="bg-black px-6 py-2 rounded-2xl">
              <span className="text-lg font-semibold text-white">🏰 Empire Builder Platform</span>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Build Your <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 bg-clip-text text-transparent">Business Empire</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Own multiple businesses? Manage them all from one platform. 
            The more businesses you add, the more powerful you become - and the more you save.
          </p>
        </div>

        {/* Portfolio Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {portfolioFeatures.map((feature, index) => (
            <div 
              key={index}
              className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
              <ul className="space-y-2 mb-4">
                {feature.benefits.slice(0, 2).map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-gray-300 text-xs">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-gray-700">
                <span className="text-purple-400 font-bold">{feature.metric}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Empire Visualization */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 backdrop-blur-sm p-8 rounded-3xl border border-purple-500/20">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Your Empire Growth Path</h3>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="text-3xl mb-3">🏪</div>
                <div className="text-white font-bold mb-2">Starter</div>
                <div className="text-2xl font-bold text-blue-400 mb-2">1 Business</div>
                <div className="text-gray-400 text-sm">Standard pricing</div>
                <div className="text-gray-300 text-sm mt-2">Perfect for single location</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/30">
                <div className="text-3xl mb-3">🏢</div>
                <div className="text-white font-bold mb-2">Growth</div>
                <div className="text-2xl font-bold text-purple-400 mb-2">2-3 Businesses</div>
                <div className="text-green-400 text-sm font-bold">10% Empire Discount</div>
                <div className="text-gray-300 text-sm mt-2">Multi-location management</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30">
                <div className="text-3xl mb-3">🏰</div>
                <div className="text-white font-bold mb-2">Empire</div>
                <div className="text-2xl font-bold text-pink-400 mb-2">4-6 Businesses</div>
                <div className="text-green-400 text-sm font-bold">15% Empire Discount</div>
                <div className="text-gray-300 text-sm mt-2">Portfolio optimization</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-pink-600/20 to-orange-600/20 rounded-xl border border-pink-500/30">
                <div className="text-3xl mb-3">👑</div>
                <div className="text-white font-bold mb-2">Dynasty</div>
                <div className="text-2xl font-bold text-orange-400 mb-2">7+ Businesses</div>
                <div className="text-green-400 text-sm font-bold">25% Empire Discount</div>
                <div className="text-gray-300 text-sm mt-2">Maximum empire power</div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-300 mb-4">
                Each additional business multiplies your power while reducing your per-business cost
              </p>
              <Link 
                href="#pricing"
                className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all duration-300"
              >
                See Empire Pricing →
              </Link>
            </div>
          </div>
        </div>

        {/* Empire Success Stories */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-white text-center mb-8">Empire Builders Like You</h3>
          
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-8">
            {empireBuilders.map((builder, index) => (
              <button
                key={index}
                onClick={() => setSelectedBuilder(index)}
                className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                  selectedBuilder === index
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {builder.businesses} Businesses
              </button>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            {empireBuilders.map((builder, index) => (
              <div
                key={index}
                className={`transition-all duration-500 ${
                  selectedBuilder === index ? 'opacity-100 block' : 'opacity-0 hidden'
                }`}
              >
                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm p-8 rounded-3xl border border-purple-500/20">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-2xl font-bold text-white mb-2">{builder.name}</h4>
                      <p className="text-purple-400 mb-4">{builder.owner} • {builder.type}</p>
                      <blockquote className="text-gray-300 italic mb-6">
                        "{builder.quote}"
                      </blockquote>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Businesses:</span>
                          <span className="text-white font-bold">{builder.businesses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Monthly Savings:</span>
                          <span className="text-green-400 font-bold">{builder.savings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Growth:</span>
                          <span className="text-purple-400 font-bold">{builder.growth}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-4">
                          {builder.growth}
                        </div>
                        <p className="text-gray-300">Portfolio Growth</p>
                        <button className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all duration-300">
                          Build My Empire Like {builder.owner.split(' ')[0]}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="inline-block p-8 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20 rounded-3xl border border-purple-500/20">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Build Your Business Empire?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl">
              Start with one business, then expand your empire. Each new business costs less and makes you more powerful.
              Join thousands of empire builders using CoreFlow360.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/signup"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all duration-300"
              >
                Start Building My Empire
              </Link>
              <Link 
                href="#roi-calculator"
                className="px-8 py-4 border-2 border-purple-500 hover:border-purple-400 text-white font-bold rounded-xl transition-all duration-300"
              >
                Calculate Empire Savings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}