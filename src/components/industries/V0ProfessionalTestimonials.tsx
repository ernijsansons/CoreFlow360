'use client'

import { useState } from 'react'

const professionalSuccessStories = [
  {
    id: 1,
    company: "Apex Consulting Group",
    owner: "Marcus Chen",
    location: "San Francisco, CA",
    clients: 12,
    teamSize: 28,
    image: "💼",
    beforeRevenue: "$3.2M/year",
    afterRevenue: "$6.8M/year", 
    growth: "+113% growth",
    timeframe: "18 months",
    speciality: "Management Consulting & Strategy",
    quote: "CoreFlow360 transformed how we manage multiple client engagements. Our AI employees handle everything from project tracking to invoicing perfectly. The 15% empire discount for our 12 clients saves us $8K monthly, but the real value is 113% growth with the same core team.",
    challengesBefore: [
      "Team spending 40% of time on non-billable admin work",
      "Project delays and scope creep eating into margins",
      "Slow invoicing causing cash flow problems", 
      "Missing upsell opportunities with existing clients",
      "Difficulty scaling beyond 5 simultaneous projects"
    ],
    resultsAfter: [
      "85% billable utilization across entire team",
      "94% on-time delivery with zero scope creep",
      "Same-day invoicing improved cash flow by 52%",
      "37% revenue growth from automated upsells",
      "Managing 12 clients simultaneously with ease"
    ],
    metrics: {
      revenueGrowth: "+113%",
      utilization: "85% billable",
      clientSatisfaction: "97% satisfaction", 
      cashFlow: "+52% faster",
      clients: "5 → 12 clients"
    }
  },
  {
    id: 2,
    company: "Elite Advisory Partners",
    owner: "Sarah Mitchell",
    location: "New York, NY", 
    clients: 8,
    teamSize: 15,
    image: "📊",
    beforeRevenue: "$1.8M/year",
    afterRevenue: "$3.4M/year",
    growth: "+89% growth", 
    timeframe: "14 months",
    speciality: "Financial Advisory & Accounting",
    quote: "The AI handles all our time tracking, invoicing, and client reporting flawlessly. But the game-changer is project management - our AI coordinates deliverables across 8 clients perfectly. We're delivering more value while working fewer hours.",
    challengesBefore: [
      "Manual time tracking causing billing disputes",
      "Project coordination chaos with multiple deadlines", 
      "Client reporting taking entire days to prepare",
      "Team burnout from 60+ hour weeks",
      "Lost revenue from poor time capture"
    ],
    resultsAfter: [
      "99.8% accurate automated time tracking",
      "Perfect project coordination across all clients",
      "Instant client reports with real-time data",
      "40-hour weeks with 89% more revenue",
      "Zero billing disputes or lost revenue"
    ],
    metrics: {
      revenueGrowth: "+89%",
      accuracy: "99.8% billing",
      efficiency: "+67% productivity",
      retention: "100% retention",
      clients: "4 → 8 clients"
    }
  },
  {
    id: 3, 
    company: "Strategic Partners LLC",
    owner: "David Thompson",
    location: "Chicago, IL",
    clients: 10,
    teamSize: 22,
    image: "🚀",
    beforeRevenue: "$2.5M/year", 
    afterRevenue: "$5.1M/year",
    growth: "+104% growth",
    timeframe: "16 months",
    speciality: "IT Consulting & Digital Transformation",
    quote: "We went from chaos to empire in 16 months. CoreFlow360's AI manages everything - from proposals to project delivery to collections. Our 15% multi-client discount is nice, but the real win is doubling revenue with the same team size.",
    challengesBefore: [
      "Proposal creation taking days of effort",
      "Resource allocation conflicts between projects",
      "Client communication gaps causing dissatisfaction",
      "Slow collections hurting cash flow",
      "Missing growth opportunities from poor pipeline management"
    ],
    resultsAfter: [
      "Instant AI-powered proposals with 42% win rate",
      "Perfect resource allocation across 10 clients", 
      "Proactive client updates maintaining 97% satisfaction",
      "45% faster collections with automated follow-ups",
      "67% more qualified leads from AI business development"
    ],
    metrics: {
      revenueGrowth: "+104%",
      winRate: "42% proposals",
      leadGen: "+67% leads",
      collections: "45% faster",
      clients: "5 → 10 clients"
    }
  }
]

export default function V0ProfessionalTestimonials() {
  const [selectedStory, setSelectedStory] = useState(0)

  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Professional <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 bg-clip-text text-transparent">Empire Success Stories</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Real consultants who built multi-client empires with CoreFlow360. 
            These aren't just customers - they're professional empire builders transforming the industry.
          </p>
        </div>

        {/* Professional Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700">
            <div className="text-3xl mb-3">💼</div>
            <div className="text-3xl font-bold text-green-400 mb-2">923+</div>
            <div className="text-gray-400 text-sm">Professional Firms</div>
          </div>
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700">
            <div className="text-3xl mb-3">💰</div>
            <div className="text-3xl font-bold text-emerald-400 mb-2">$8.2M+</div>
            <div className="text-gray-400 text-sm">Revenue Generated</div>
          </div>
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700">
            <div className="text-3xl mb-3">📈</div>
            <div className="text-3xl font-bold text-teal-400 mb-2">97%</div>
            <div className="text-gray-400 text-sm">Client Satisfaction</div>
          </div>
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700">
            <div className="text-3xl mb-3">⏰</div>
            <div className="text-3xl font-bold text-cyan-400 mb-2">42hrs</div>
            <div className="text-gray-400 text-sm">Weekly Hours Saved</div>
          </div>
        </div>

        {/* Story Navigation */}
        <div className="flex flex-col lg:flex-row justify-center items-center gap-4 mb-12">
          {professionalSuccessStories.map((story, index) => (
            <button
              key={story.id}
              onClick={() => setSelectedStory(index)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${
                selectedStory === index
                  ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 text-white'
                  : 'bg-gray-800/30 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              <span className="text-2xl">{story.image}</span>
              <div className="text-left">
                <div className="font-semibold">{story.company}</div>
                <div className="text-sm opacity-75">{story.clients} Clients</div>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Story */}
        <div className="max-w-7xl mx-auto">
          {professionalSuccessStories.map((story, index) => (
            <div
              key={story.id}
              className={`transition-all duration-500 ${
                selectedStory === index ? 'opacity-100 block' : 'opacity-0 hidden'
              }`}
            >
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Story Content */}
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 backdrop-blur-sm p-8 rounded-3xl border border-green-500/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center text-3xl">
                        {story.image}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{story.company}</h3>
                        <p className="text-gray-400">{story.owner} • {story.speciality}</p>
                        <p className="text-green-400 text-sm">{story.location} • {story.teamSize} team members</p>
                      </div>
                    </div>

                    <blockquote className="text-lg text-gray-300 italic mb-6 leading-relaxed">
                      "{story.quote}"
                    </blockquote>

                    {/* Growth Highlight */}
                    <div className="p-4 bg-green-600/10 border border-green-500/20 rounded-xl text-center mb-6">
                      <div className="text-3xl font-bold text-green-400 mb-2">{story.growth}</div>
                      <div className="text-green-300">in just {story.timeframe}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        From {story.beforeRevenue} to {story.afterRevenue}
                      </div>
                    </div>

                    {/* Before/After Comparison */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-red-600/10 border border-red-500/20 rounded-xl">
                        <h4 className="font-semibold text-red-400 mb-3">❌ Before CoreFlow360</h4>
                        <ul className="space-y-2">
                          {story.challengesBefore.slice(0, 3).map((challenge, idx) => (
                            <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                              <span className="text-red-400 mt-1">•</span>
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 bg-green-600/10 border border-green-500/20 rounded-xl">
                        <h4 className="font-semibold text-green-400 mb-3">✅ After CoreFlow360</h4>
                        <ul className="space-y-2">
                          {story.resultsAfter.slice(0, 3).map((result, idx) => (
                            <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                              <span className="text-green-400 mt-1">•</span>
                              {result}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics & Results */}
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(story.metrics).map(([key, value]) => (
                      <div key={key} className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl text-center">
                        <div className="text-xl font-bold text-white mb-1">{value}</div>
                        <div className="text-gray-400 text-sm capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Complete Results */}
                  <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700">
                    <h4 className="text-xl font-bold text-white mb-4">💼 Complete Professional Transformation</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-red-400 mb-2">The Professional Problems Solved:</h5>
                        <ul className="space-y-1">
                          {story.challengesBefore.map((challenge, idx) => (
                            <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                              <span className="text-red-400 mt-1">•</span>
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-green-400 mb-2">The Professional Results Achieved:</h5>
                        <ul className="space-y-1">
                          {story.resultsAfter.map((result, idx) => (
                            <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                              <span className="text-green-400 mt-1">•</span>
                              {result}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="text-center">
                    <button className="w-full py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-500 hover:via-emerald-500 hover:to-teal-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                      Build My Professional Empire Like {story.owner}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-block p-8 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-3xl border border-green-500/20 max-w-4xl">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <span>💼</span> Ready to Build Your Professional Empire?
            </h3>
            <p className="text-gray-300 mb-6">
              Join 923+ professional firms using CoreFlow360 to automate client management, 
              optimize revenue, and build multi-client professional empires.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
              <button className="px-8 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-500 hover:via-emerald-500 hover:to-teal-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                Start Professional Empire Trial - Free
              </button>
              <button className="px-8 py-4 border-2 border-gray-600 hover:border-gray-400 text-white rounded-xl font-semibold transition-all duration-300">
                Schedule Professional Demo
              </button>
            </div>
            <div className="text-sm text-gray-400">
              ✅ Professional-specific setup • ✅ 30-day guarantee • ✅ Expert consulting support
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}