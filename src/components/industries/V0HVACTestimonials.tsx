'use client'

import { useState } from 'react'

const hvacSuccessStories = [
  {
    id: 1,
    company: "Phoenix HVAC Empire",
    owner: "Marcus Rodriguez",
    location: "Phoenix, AZ",
    locations: 5,
    technicians: 23,
    image: "🔥",
    beforeRevenue: "$1.2M/year",
    afterRevenue: "$2.4M/year", 
    growth: "+100% growth",
    timeframe: "14 months",
    speciality: "Residential & Commercial HVAC",
    quote: "CoreFlow360 turned my single HVAC shop into a 5-location empire. The AI dispatch alone saves us 30+ hours weekly, and our customer satisfaction went from 3.2 to 4.9 stars. We're booking 40% more calls and closing 50% more deals.",
    challengesBefore: [
      "Manual scheduling caused daily double-bookings and angry customers",
      "Estimates took 2-3 days, losing 60% of hot leads to competitors",
      "Technicians spent 3+ hours daily on paperwork instead of service calls", 
      "No inventory tracking led to emergency supply runs and job delays",
      "Customer service overwhelmed with 'when will you be here?' calls"
    ],
    resultsAfter: [
      "Zero scheduling conflicts with AI dispatch and GPS routing",
      "Instant photo-based estimates increased close rate by 47%",
      "100% paperless operations with mobile AI assistants",
      "Perfect inventory tracking prevents stockouts and delays",
      "80% reduction in customer calls with automated updates"
    ],
    metrics: {
      revenueGrowth: "+100%",
      timeSaved: "30+ hrs/week",
      closeRate: "+47%", 
      customerSat: "4.9/5 stars",
      locations: "1 → 5 locations"
    }
  },
  {
    id: 2,
    company: "CoolAir Systems",
    owner: "Jennifer Martinez",
    location: "Dallas, TX", 
    locations: 3,
    technicians: 15,
    image: "❄️",
    beforeRevenue: "$850K/year",
    afterRevenue: "$1.6M/year",
    growth: "+88% growth", 
    timeframe: "11 months",
    speciality: "Commercial HVAC & Maintenance Contracts",
    quote: "The maintenance contract automation alone added $400K in recurring revenue. Our AI tracks every piece of equipment, schedules preventive maintenance, and our technicians never miss a service. It's like having a perfect dispatcher who never sleeps.",
    challengesBefore: [
      "Maintenance contracts manually tracked in Excel spreadsheets",
      "Missing scheduled maintenance led to equipment failures and lawsuits", 
      "Emergency calls disrupted scheduled work, causing delays",
      "Technicians carried paper worksheets that got lost or damaged",
      "Customer communication was reactive, not proactive"
    ],
    resultsAfter: [
      "100% automated maintenance contract scheduling and tracking",
      "Proactive maintenance prevents 89% of equipment failures",
      "Smart emergency dispatch optimizes response times",
      "Digital work orders with photo documentation and GPS timestamps", 
      "Automated customer updates and satisfaction surveys"
    ],
    metrics: {
      revenueGrowth: "+88%",
      contractRevenue: "+$400K/year",
      preventiveMaint: "89% failure prevention",
      responseTime: "-35% faster",
      locations: "2 → 3 locations"
    }
  },
  {
    id: 3, 
    company: "Elite HVAC Group",
    owner: "David Thompson",
    location: "Atlanta, GA",
    locations: 7,
    technicians: 34,
    image: "⚡",
    beforeRevenue: "$2.1M/year", 
    afterRevenue: "$3.8M/year",
    growth: "+81% growth",
    timeframe: "16 months",
    speciality: "Residential HVAC & Indoor Air Quality",
    quote: "Building a 7-location HVAC empire seemed impossible until CoreFlow360. The 25% multi-location discount saves us $8K monthly, but the real value is having AI employees that coordinate between all locations. We're the #1 HVAC company in Atlanta now.",
    challengesBefore: [
      "Each location operated independently with no coordination",
      "Technician scheduling conflicts between multiple locations",
      "Inventory silos - one location had excess while another ran out",
      "Inconsistent pricing and service quality across locations",
      "No centralized customer data or service history tracking"
    ],
    resultsAfter: [
      "Unified operations dashboard manages all 7 locations seamlessly",
      "AI optimizes technician deployment across entire service area", 
      "Smart inventory management shares stock between locations",
      "Standardized pricing and service protocols empire-wide",
      "Complete customer history accessible at any location"
    ],
    metrics: {
      revenueGrowth: "+81%",
      empireSavings: "$8K/month discount",
      efficiency: "+65% operational efficiency",
      marketShare: "#1 in Atlanta",
      locations: "3 → 7 locations"
    }
  }
]

export default function V0HVACTestimonials() {
  const [selectedStory, setSelectedStory] = useState(0)

  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            HVAC <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 bg-clip-text text-transparent">Empire Success Stories</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Real HVAC contractors who built multi-location empires with CoreFlow360. 
            These aren't just customers - they're HVAC empire builders.
          </p>
        </div>

        {/* HVAC Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700">
            <div className="text-3xl mb-3">🔧</div>
            <div className="text-3xl font-bold text-orange-400 mb-2">847+</div>
            <div className="text-gray-400 text-sm">HVAC Companies</div>
          </div>
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700">
            <div className="text-3xl mb-3">💰</div>
            <div className="text-3xl font-bold text-red-400 mb-2">$1.8M+</div>
            <div className="text-gray-400 text-sm">HVAC Revenue Generated</div>
          </div>
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700">
            <div className="text-3xl mb-3">📈</div>
            <div className="text-3xl font-bold text-pink-400 mb-2">52%</div>
            <div className="text-gray-400 text-sm">Average HVAC Growth</div>
          </div>
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700">
            <div className="text-3xl mb-3">⭐</div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">4.8/5</div>
            <div className="text-gray-400 text-sm">HVAC Customer Rating</div>
          </div>
        </div>

        {/* Story Navigation */}
        <div className="flex flex-col lg:flex-row justify-center items-center gap-4 mb-12">
          {hvacSuccessStories.map((story, index) => (
            <button
              key={story.id}
              onClick={() => setSelectedStory(index)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${
                selectedStory === index
                  ? 'bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 text-white'
                  : 'bg-gray-800/30 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              <span className="text-2xl">{story.image}</span>
              <div className="text-left">
                <div className="font-semibold">{story.company}</div>
                <div className="text-sm opacity-75">{story.locations} HVAC Locations</div>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Story */}
        <div className="max-w-7xl mx-auto">
          {hvacSuccessStories.map((story, index) => (
            <div
              key={story.id}
              className={`transition-all duration-500 ${
                selectedStory === index ? 'opacity-100 block' : 'opacity-0 hidden'
              }`}
            >
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Story Content */}
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 backdrop-blur-sm p-8 rounded-3xl border border-orange-500/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center text-3xl">
                        {story.image}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{story.company}</h3>
                        <p className="text-gray-400">{story.owner} • {story.speciality}</p>
                        <p className="text-orange-400 text-sm">{story.location} • {story.technicians} technicians</p>
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
                    <h4 className="text-xl font-bold text-white mb-4">🎯 Complete HVAC Transformation</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-red-400 mb-2">The HVAC Problems Solved:</h5>
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
                        <h5 className="font-semibold text-green-400 mb-2">The HVAC Results Achieved:</h5>
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
                    <button className="w-full py-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-500 hover:via-red-500 hover:to-pink-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                      Build My HVAC Empire Like {story.owner}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-block p-8 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 rounded-3xl border border-orange-500/20 max-w-4xl">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <span>🔧</span> Ready to Build Your HVAC Empire?
            </h3>
            <p className="text-gray-300 mb-6">
              Join 847+ HVAC contractors using CoreFlow360 to automate operations, 
              increase revenue, and build multi-location empires.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
              <button className="px-8 py-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-500 hover:via-red-500 hover:to-pink-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                Start HVAC Empire Trial - Free
              </button>
              <button className="px-8 py-4 border-2 border-gray-600 hover:border-gray-400 text-white rounded-xl font-semibold transition-all duration-300">
                Schedule HVAC Demo
              </button>
            </div>
            <div className="text-sm text-gray-400">
              ✅ HVAC-specific setup • ✅ 30-day guarantee • ✅ Expert HVAC support team
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}