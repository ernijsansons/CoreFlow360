'use client'

import { useState } from 'react'

const constructionSuccessStories = [
  {
    id: 1,
    company: "BuildRight Construction Group",
    owner: "David Thompson",
    location: "Atlanta, GA",
    sites: 7,
    crewSize: 85,
    image: "🏗️",
    beforeRevenue: "$8.2M/year",
    afterRevenue: "$14.9M/year", 
    growth: "+82% growth",
    timeframe: "14 months",
    speciality: "Commercial & Residential Construction",
    quote: "CoreFlow360 transformed how we manage multiple job sites. Our AI project managers coordinate everything perfectly - zero double-bookings, 91% fewer delays. The 25% empire discount for our 7 sites saves us $11K monthly, but the real value is completing projects 35% faster.",
    challengesBefore: [
      "Project delays on 30% of jobs causing liquidated damages",
      "Crew and equipment conflicts between multiple job sites daily",
      "Cost overruns averaging 15-20% eating into profit margins", 
      "Safety incidents and OSHA violations risking licenses",
      "Change order approvals taking days, frustrating clients"
    ],
    resultsAfter: [
      "89% on-time completion rate with bonus payments",
      "Perfect crew and equipment coordination across 7 sites",
      "22% profit margin improvement with real-time cost tracking",
      "Zero OSHA violations, 73% reduction in safety incidents",
      "Change orders approved in under 2 hours automatically"
    ],
    metrics: {
      revenueGrowth: "+82%",
      onTimeRate: "89% on-time",
      profitMargins: "+22% margins", 
      safetyRecord: "Zero violations",
      sites: "3 → 7 sites"
    }
  },
  {
    id: 2,
    company: "Premier Construction LLC",
    owner: "Michael Rodriguez",
    location: "Houston, TX", 
    sites: 4,
    crewSize: 52,
    image: "🏢",
    beforeRevenue: "$5.1M/year",
    afterRevenue: "$8.7M/year",
    growth: "+71% growth", 
    timeframe: "12 months",
    speciality: "Industrial & Infrastructure",
    quote: "The AI safety management alone prevented 3 potential OSHA violations that would've cost us $200K+. But the game-changer is project coordination - our AI handles scheduling, materials, and subcontractors flawlessly. We're bidding and winning 40% more projects.",
    challengesBefore: [
      "Manual project scheduling caused constant conflicts and delays",
      "Material shortages discovered day-of stopped work frequently", 
      "Subcontractor coordination was a daily nightmare",
      "Safety documentation gaps risked major OSHA fines",
      "Bid preparation took days, missing opportunities"
    ],
    resultsAfter: [
      "AI coordinates all projects with zero scheduling conflicts",
      "Predictive material ordering prevents all work stoppages",
      "Automated subcontractor scheduling and performance tracking",
      "Perfect safety compliance with automated documentation",
      "Instant accurate bids win 40% more projects"
    ],
    metrics: {
      revenueGrowth: "+71%",
      projectsWon: "+40% win rate",
      efficiency: "+65% crew efficiency",
      delays: "-91% delays",
      sites: "2 → 4 sites"
    }
  },
  {
    id: 3, 
    company: "Metro Builders Inc",
    owner: "Sarah Martinez",
    location: "Phoenix, AZ",
    sites: 5,
    crewSize: 68,
    image: "🔨",
    beforeRevenue: "$6.3M/year", 
    afterRevenue: "$11.8M/year",
    growth: "+87% growth",
    timeframe: "16 months",
    speciality: "Custom Homes & Renovations",
    quote: "We went from chaos to empire in 16 months. CoreFlow360's AI handles everything - from initial bids to final inspections. Our 15% multi-site discount is nice, but the real win is 87% growth with the same core team. We work smarter, not harder.",
    challengesBefore: [
      "Custom home schedules constantly conflicted and overlapped",
      "Client change requests created budget and timeline chaos",
      "Quality control issues led to expensive callbacks",
      "Crew burnout from 60+ hour weeks hurt retention",
      "Cash flow problems from slow invoicing and collections"
    ],
    resultsAfter: [
      "Perfect scheduling across 5 simultaneous custom builds",
      "Instant change order processing with automatic pricing", 
      "AI quality checks reduce callbacks by 84%",
      "40-hour weeks with 87% more revenue generated",
      "Automated invoicing improved cash flow by 45%"
    ],
    metrics: {
      revenueGrowth: "+87%",
      empireSavings: "$7K/month discount",
      callbacks: "-84% callbacks",
      cashFlow: "+45% faster payments",
      sites: "2 → 5 sites"
    }
  }
]

export default function V0ConstructionTestimonials() {
  const [selectedStory, setSelectedStory] = useState(0)

  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Construction <span className="bg-gradient-to-r from-orange-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">Empire Success Stories</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Real contractors who built multi-site empires with CoreFlow360. 
            These aren't just customers - they're construction empire builders transforming the industry.
          </p>
        </div>

        {/* Construction Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700">
            <div className="text-3xl mb-3">🏗️</div>
            <div className="text-3xl font-bold text-orange-400 mb-2">612+</div>
            <div className="text-gray-400 text-sm">Construction Firms</div>
          </div>
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700">
            <div className="text-3xl mb-3">💰</div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">$4.7M+</div>
            <div className="text-gray-400 text-sm">Construction Savings</div>
          </div>
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700">
            <div className="text-3xl mb-3">📈</div>
            <div className="text-3xl font-bold text-amber-400 mb-2">89%</div>
            <div className="text-gray-400 text-sm">On-Time Completion</div>
          </div>
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700">
            <div className="text-3xl mb-3">⚠️</div>
            <div className="text-3xl font-bold text-green-400 mb-2">Zero</div>
            <div className="text-gray-400 text-sm">OSHA Violations</div>
          </div>
        </div>

        {/* Story Navigation */}
        <div className="flex flex-col lg:flex-row justify-center items-center gap-4 mb-12">
          {constructionSuccessStories.map((story, index) => (
            <button
              key={story.id}
              onClick={() => setSelectedStory(index)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${
                selectedStory === index
                  ? 'bg-gradient-to-r from-orange-600/20 to-yellow-600/20 border border-orange-500/30 text-white'
                  : 'bg-gray-800/30 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              <span className="text-2xl">{story.image}</span>
              <div className="text-left">
                <div className="font-semibold">{story.company}</div>
                <div className="text-sm opacity-75">{story.sites} Job Sites</div>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Story */}
        <div className="max-w-7xl mx-auto">
          {constructionSuccessStories.map((story, index) => (
            <div
              key={story.id}
              className={`transition-all duration-500 ${
                selectedStory === index ? 'opacity-100 block' : 'opacity-0 hidden'
              }`}
            >
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Story Content */}
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-orange-500/10 via-yellow-500/10 to-amber-500/10 backdrop-blur-sm p-8 rounded-3xl border border-orange-500/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-2xl flex items-center justify-center text-3xl">
                        {story.image}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{story.company}</h3>
                        <p className="text-gray-400">{story.owner} • {story.speciality}</p>
                        <p className="text-orange-400 text-sm">{story.location} • {story.crewSize} crew members</p>
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
                    <h4 className="text-xl font-bold text-white mb-4">🏗️ Complete Construction Transformation</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-red-400 mb-2">The Construction Problems Solved:</h5>
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
                        <h5 className="font-semibold text-green-400 mb-2">The Construction Results Achieved:</h5>
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
                    <button className="w-full py-4 bg-gradient-to-r from-orange-600 via-yellow-600 to-amber-600 hover:from-orange-500 hover:via-yellow-500 hover:to-amber-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                      Build My Construction Empire Like {story.owner}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-block p-8 bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-amber-500/10 rounded-3xl border border-orange-500/20 max-w-4xl">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <span>🏗️</span> Ready to Build Your Construction Empire?
            </h3>
            <p className="text-gray-300 mb-6">
              Join 612+ contractors using CoreFlow360 to automate project management, 
              ensure safety compliance, and build multi-site construction empires.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
              <button className="px-8 py-4 bg-gradient-to-r from-orange-600 via-yellow-600 to-amber-600 hover:from-orange-500 hover:via-yellow-500 hover:to-amber-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                Start Construction Empire Trial - Free
              </button>
              <button className="px-8 py-4 border-2 border-gray-600 hover:border-gray-400 text-white rounded-xl font-semibold transition-all duration-300">
                Schedule Construction Demo
              </button>
            </div>
            <div className="text-sm text-gray-400">
              ✅ Construction-specific setup • ✅ 30-day guarantee • ✅ Expert contractor support
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}