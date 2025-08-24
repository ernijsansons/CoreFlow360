'use client'

import { useState } from 'react'
import Link from 'next/link'

const enterpriseFeatures = [
  {
    icon: "🏰",
    title: "Unlimited Business Scaling",
    description: "No limits on businesses, locations, or users",
    details: [
      "Manage 100+ businesses from single dashboard",
      "Unlimited user accounts and permissions",
      "Multi-region deployment support",
      "Custom branding and white-labeling"
    ]
  },
  {
    icon: "🤖",
    title: "Custom AI Employee Development",
    description: "Bespoke AI employees built for your unique workflows",
    details: [
      "Industry-specific AI model training",
      "Custom workflow automation design",
      "Proprietary data integration",
      "Advanced machine learning capabilities"
    ]
  },
  {
    icon: "🔐",
    title: "Enterprise-Grade Security",
    description: "Bank-level security with compliance certifications",
    details: [
      "SOC 2 Type II certified",
      "HIPAA, GDPR, CCPA compliant",
      "Advanced encryption at rest and in transit",
      "Single Sign-On (SSO) integration"
    ]
  },
  {
    icon: "⚡",
    title: "Dedicated Infrastructure",
    description: "Private cloud deployment with guaranteed uptime",
    details: [
      "99.99% uptime SLA guarantee",
      "Dedicated cloud infrastructure",
      "Priority processing power",
      "Custom API rate limits"
    ]
  }
]

const enterpriseClients = [
  {
    name: "Global Retail Empire",
    industry: "Multi-Brand Retail",
    businesses: 150,
    locations: "3,200+ stores",
    employees: "85,000+",
    results: [
      "$47M annual cost savings",
      "73% faster inventory turnover",
      "91% reduction in manual processes",
      "99.7% system uptime achieved"
    ],
    quote: "CoreFlow360 transformed our 150-brand empire. Our AI employees now manage everything from inventory to customer service across 3,200+ locations. The ROI was incredible - $47M saved in the first year alone.",
    executive: "Sarah Chen, Chief Operating Officer"
  },
  {
    name: "International Construction Group",
    industry: "Construction & Engineering",
    businesses: 89,
    locations: "45 countries",
    employees: "52,000+",
    results: [
      "$23M project cost optimization",
      "85% reduction in safety incidents",
      "67% faster project completion",
      "Zero regulatory violations"
    ],
    quote: "Managing 89 construction companies across 45 countries was chaos until CoreFlow360. Now our AI handles project coordination, safety compliance, and resource allocation flawlessly.",
    executive: "Michael Rodriguez, Global CEO"
  },
  {
    name: "Healthcare Services Network",
    industry: "Healthcare & Medical",
    businesses: 67,
    locations: "12 states",
    employees: "28,000+",
    results: [
      "$31M operational efficiency gains",
      "94% patient satisfaction increase",
      "88% reduction in billing errors",
      "100% HIPAA compliance maintained"
    ],
    quote: "Our 67 healthcare facilities needed seamless coordination while maintaining HIPAA compliance. CoreFlow360's enterprise solution delivered both - along with $31M in savings.",
    executive: "Dr. Lisa Thompson, Network Director"
  }
]

const customSolutions = [
  {
    title: "White-Label Platform",
    description: "Rebrand CoreFlow360 as your own platform",
    features: [
      "Complete UI/UX customization",
      "Your branding and logos",
      "Custom domain and hosting",
      "Reseller partnership options"
    ]
  },
  {
    title: "API-First Architecture",
    description: "Integrate with any existing system",
    features: [
      "RESTful API with full documentation",
      "Webhook support for real-time sync",
      "Custom connector development",
      "Legacy system migration tools"
    ]
  },
  {
    title: "Global Deployment",
    description: "Multi-region support with local compliance",
    features: [
      "Data residency compliance",
      "Regional regulatory adaptation",
      "Multi-language support",
      "Local payment processing"
    ]
  }
]

export default function V0Enterprise() {
  const [selectedClient, setSelectedClient] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block p-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl mb-6">
            <div className="bg-black px-6 py-2 rounded-2xl">
              <span className="text-lg font-semibold text-white">🏰 Enterprise Solutions</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Build Your <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-600 bg-clip-text text-transparent">Global Empire</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            For businesses managing 20+ locations, we provide custom enterprise solutions with 
            dedicated infrastructure, bespoke AI development, and white-label options.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex items-center bg-gray-800 rounded-xl p-1">
            <button
              className={`px-8 py-3 rounded-lg transition-all duration-300 font-semibold ${
                activeTab === 'overview' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Enterprise Overview
            </button>
            <button
              className={`px-8 py-3 rounded-lg transition-all duration-300 font-semibold ${
                activeTab === 'clients' 
                  ? 'bg-pink-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('clients')}
            >
              Success Stories
            </button>
            <button
              className={`px-8 py-3 rounded-lg transition-all duration-300 font-semibold ${
                activeTab === 'custom' 
                  ? 'bg-orange-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('custom')}
            >
              Custom Solutions
            </button>
          </div>
        </div>

        {/* Enterprise Overview Tab */}
        {activeTab === 'overview' && (
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {enterpriseFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="p-8 bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm rounded-3xl border border-purple-500/20 hover:border-purple-400/30 transition-all duration-300"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-purple-400 mt-1">✓</span>
                        <span className="text-gray-300 text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Enterprise Stats */}
            <div className="bg-gradient-to-r from-purple-900/30 to-orange-900/30 backdrop-blur-sm p-8 rounded-3xl border border-purple-500/20 mb-16">
              <h3 className="text-3xl font-bold text-white text-center mb-8">Enterprise Scale Impact</h3>
              
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">500+</div>
                  <div className="text-gray-400">Enterprise Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-pink-400 mb-2">50,000+</div>
                  <div className="text-gray-400">Business Locations</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-400 mb-2">$2.3B+</div>
                  <div className="text-gray-400">Enterprise Savings</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">99.99%</div>
                  <div className="text-gray-400">Uptime SLA</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Stories Tab */}
        {activeTab === 'clients' && (
          <div className="max-w-7xl mx-auto">
            {/* Client Navigation */}
            <div className="flex flex-col md:flex-row justify-center gap-4 mb-12">
              {enterpriseClients.map((client, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedClient(index)}
                  className={`p-6 rounded-2xl transition-all duration-300 text-center ${
                    selectedClient === index
                      ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/50 transform scale-105'
                      : 'bg-gray-800/30 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-white font-bold text-lg mb-2">{client.name}</div>
                  <div className="text-purple-400 text-sm mb-2">{client.industry}</div>
                  <div className="text-gray-400 text-sm">{client.businesses} Businesses</div>
                </button>
              ))}
            </div>

            {/* Selected Client Details */}
            <div className="max-w-6xl mx-auto">
              {enterpriseClients.map((client, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 ${
                    selectedClient === index ? 'opacity-100 block' : 'opacity-0 hidden'
                  }`}
                >
                  <div className="grid lg:grid-cols-2 gap-12">
                    {/* Client Story */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm p-8 rounded-3xl border border-purple-500/20">
                        <h3 className="text-3xl font-bold text-white mb-4">{client.name}</h3>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                            <div className="text-purple-400 text-sm font-semibold">Industry</div>
                            <div className="text-white">{client.industry}</div>
                          </div>
                          <div>
                            <div className="text-purple-400 text-sm font-semibold">Scale</div>
                            <div className="text-white">{client.businesses} Businesses</div>
                          </div>
                          <div>
                            <div className="text-purple-400 text-sm font-semibold">Locations</div>
                            <div className="text-white">{client.locations}</div>
                          </div>
                          <div>
                            <div className="text-purple-400 text-sm font-semibold">Employees</div>
                            <div className="text-white">{client.employees}</div>
                          </div>
                        </div>

                        <blockquote className="text-lg text-gray-300 italic mb-6 leading-relaxed">
                          "{client.quote}"
                        </blockquote>
                        
                        <div className="text-purple-400 font-semibold">— {client.executive}</div>
                      </div>
                    </div>

                    {/* Results */}
                    <div className="space-y-6">
                      <h4 className="text-2xl font-bold text-white">Enterprise Results</h4>
                      <div className="grid gap-4">
                        {client.results.map((result, idx) => (
                          <div key={idx} className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                            <div className="text-white font-bold text-lg">{result}</div>
                          </div>
                        ))}
                      </div>

                      <button className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 text-white text-lg font-bold rounded-xl transition-all duration-300">
                        Build My Empire Like {client.name}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Solutions Tab */}
        {activeTab === 'custom' && (
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {customSolutions.map((solution, index) => (
                <div 
                  key={index}
                  className="p-8 bg-gradient-to-br from-orange-900/20 to-yellow-900/20 backdrop-blur-sm rounded-3xl border border-orange-500/20"
                >
                  <h3 className="text-2xl font-bold text-white mb-4">{solution.title}</h3>
                  <p className="text-gray-400 mb-6">{solution.description}</p>
                  <ul className="space-y-3">
                    {solution.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-orange-400 mt-1">✓</span>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Custom Development Process */}
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-700">
              <h3 className="text-3xl font-bold text-white text-center mb-8">Enterprise Implementation Process</h3>
              
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">1</span>
                  </div>
                  <h4 className="text-white font-bold mb-2">Discovery & Planning</h4>
                  <p className="text-gray-400 text-sm">Deep dive into your business processes and requirements</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">2</span>
                  </div>
                  <h4 className="text-white font-bold mb-2">Custom Development</h4>
                  <p className="text-gray-400 text-sm">Build bespoke AI employees and workflows for your empire</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">3</span>
                  </div>
                  <h4 className="text-white font-bold mb-2">Deployment & Integration</h4>
                  <p className="text-gray-400 text-sm">Seamless rollout across all your business locations</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">4</span>
                  </div>
                  <h4 className="text-white font-bold mb-2">Optimization & Scale</h4>
                  <p className="text-gray-400 text-sm">Continuous improvement and empire expansion support</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-block p-8 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-orange-900/20 rounded-3xl border border-purple-500/20 max-w-4xl">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Build Your Global Empire?
            </h3>
            <p className="text-gray-300 mb-8">
              Join 500+ enterprise clients who've transformed their multi-business operations with CoreFlow360. 
              Our enterprise team will design a custom solution for your empire.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 text-white text-lg font-bold rounded-xl transition-all duration-300"
              >
                Contact Enterprise Sales
              </Link>
              <Link 
                href="/schedule-demo"
                className="px-8 py-4 border-2 border-purple-500 hover:border-purple-400 text-white text-lg font-bold rounded-xl transition-all duration-300"
              >
                Schedule Enterprise Demo
              </Link>
            </div>
            <div className="mt-6 text-sm text-gray-400">
              ✅ Custom pricing available • ✅ Dedicated support team • ✅ White-label options
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}