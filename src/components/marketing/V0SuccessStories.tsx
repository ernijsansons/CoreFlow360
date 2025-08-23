'use client'

import { useState } from 'react'

const successStories = [
  {
    id: 1,
    company: "Phoenix HVAC Empire",
    industry: "HVAC",
    locations: 5,
    owner: "Marcus Rodriguez",
    title: "Empire Builder",
    image: "🔧",
    stats: {
      savingsPerMonth: "$47,200",
      timeRecovered: "180h/week",
      revenueIncrease: "31%",
      paybackPeriod: "2.3 months"
    },
    quote: "CoreFlow360 didn't just automate my HVAC business - it turned me into an empire builder. I went from managing 1 location to scaling 5 locations with AI employees that work 24/7. My empire discount alone saves me $12K/month.",
    results: [
      "Automated scheduling across all 5 locations",
      "AI customer service handles 89% of inquiries", 
      "Predictive maintenance prevents 94% of breakdowns",
      "Cross-location inventory optimization saves $180K/year"
    ],
    beforeAfter: {
      before: "Manual scheduling chaos, 80h weeks, constant firefighting",
      after: "Automated empire, strategic growth, 30h work weeks"
    }
  },
  {
    id: 2,
    company: "Metro Legal Network",
    industry: "Legal Services",
    locations: 3,
    owner: "Sarah Chen", 
    title: "Legal Empire Architect",
    image: "⚖️",
    stats: {
      savingsPerMonth: "$28,900",
      timeRecovered: "120h/week", 
      revenueIncrease: "45%",
      paybackPeriod: "1.8 months"
    },
    quote: "As a legal empire, CoreFlow360's AI employees handle case research, document generation, and client communications across all 3 offices. My 15% multi-business discount paid for itself in the first month.",
    results: [
      "AI legal research cuts case prep by 75%",
      "Automated document generation for 12 practice areas",
      "Client intake AI qualifies leads 24/7", 
      "Cross-office resource sharing increases efficiency 40%"
    ],
    beforeAfter: {
      before: "Drowning in paperwork, missed deadlines, stressed partners",
      after: "Streamlined legal empire, 45% more billable hours"
    }
  },
  {
    id: 3,
    company: "BuildRight Construction Group",
    industry: "Construction", 
    locations: 7,
    owner: "David Thompson",
    title: "Construction Empire CEO",
    image: "🏗️",
    stats: {
      savingsPerMonth: "$89,400",
      timeRecovered: "280h/week",
      revenueIncrease: "52%", 
      paybackPeriod: "1.2 months"
    },
    quote: "With 7 construction sites, CoreFlow360's 25% empire discount saves me $22K monthly. But the real value? My AI employees coordinate projects, manage crews, and prevent delays across my entire empire automatically.",
    results: [
      "AI project coordination prevents 91% of delays",
      "Automated crew scheduling across 7 locations",
      "Predictive supply chain prevents material shortages",
      "Real-time progress tracking increases on-time delivery 89%"
    ],
    beforeAfter: {
      before: "Project delays, crew coordination nightmares, supply issues",
      after: "Synchronized empire, predictable profits, stress-free scaling"
    }
  }
]

const businessMetrics = [
  {
    metric: "$2.3M+",
    label: "Empire Savings Generated",
    icon: "💰",
    color: "text-green-400"
  },
  {
    metric: "2,847+", 
    label: "Businesses Transformed",
    icon: "🏢",
    color: "text-blue-400"
  },
  {
    metric: "98%",
    label: "Customer Satisfaction",
    icon: "⭐",
    color: "text-purple-400"
  },
  {
    metric: "45 days",
    label: "Average Payback Period", 
    icon: "⚡",
    color: "text-pink-400"
  }
]

export default function V0SuccessStories() {
  const [selectedStory, setSelectedStory] = useState(0)

  return (
    <section id="success-stories" className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Empire <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 bg-clip-text text-transparent">Success Stories</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8">
            Real business empires built with CoreFlow360. These entrepreneurs didn't just grow their businesses - 
            they evolved them into intelligent, self-managing organizations.
          </p>
        </div>

        {/* Business Metrics */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          {businessMetrics.map((metric, index) => (
            <div key={index} className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700">
              <div className="text-4xl mb-3">{metric.icon}</div>
              <div className={`text-3xl font-bold ${metric.color} mb-2`}>{metric.metric}</div>
              <div className="text-gray-400 text-sm">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Story Navigation */}
        <div className="flex flex-col lg:flex-row justify-center items-center gap-4 mb-12">
          {successStories.map((story, index) => (
            <button
              key={story.id}
              onClick={() => setSelectedStory(index)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${
                selectedStory === index
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-white'
                  : 'bg-gray-800/30 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              <span className="text-2xl">{story.image}</span>
              <div className="text-left">
                <div className="font-semibold">{story.company}</div>
                <div className="text-sm opacity-75">{story.locations} Locations</div>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Story */}
        <div className="max-w-6xl mx-auto">
          {successStories.map((story, index) => (
            <div
              key={story.id}
              className={`transition-all duration-500 ${
                selectedStory === index ? 'opacity-100 block' : 'opacity-0 hidden'
              }`}
            >
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Story Content */}
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm p-8 rounded-3xl border border-blue-500/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-3xl">
                        {story.image}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{story.company}</h3>
                        <p className="text-gray-400">{story.owner} • {story.title}</p>
                      </div>
                    </div>

                    <blockquote className="text-lg text-gray-300 italic mb-6 leading-relaxed">
                      "{story.quote}"
                    </blockquote>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-red-600/10 border border-red-500/20 rounded-xl">
                        <h4 className="font-semibold text-red-400 mb-2">❌ Before CoreFlow360</h4>
                        <p className="text-gray-300 text-sm">{story.beforeAfter.before}</p>
                      </div>
                      <div className="p-4 bg-green-600/10 border border-green-500/20 rounded-xl">
                        <h4 className="font-semibold text-green-400 mb-2">✅ After CoreFlow360</h4>
                        <p className="text-gray-300 text-sm">{story.beforeAfter.after}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results & Stats */}
                <div className="space-y-6">
                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-green-600/10 border border-green-500/20 rounded-xl text-center">
                      <div className="text-2xl font-bold text-green-400 mb-1">{story.stats.savingsPerMonth}</div>
                      <div className="text-gray-400 text-sm">Monthly Savings</div>
                    </div>
                    <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-xl text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-1">{story.stats.timeRecovered}</div>
                      <div className="text-gray-400 text-sm">Time Recovered</div>
                    </div>
                    <div className="p-6 bg-purple-600/10 border border-purple-500/20 rounded-xl text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-1">{story.stats.revenueIncrease}</div>
                      <div className="text-gray-400 text-sm">Revenue Increase</div>
                    </div>
                    <div className="p-6 bg-pink-600/10 border border-pink-500/20 rounded-xl text-center">
                      <div className="text-2xl font-bold text-pink-400 mb-1">{story.stats.paybackPeriod}</div>
                      <div className="text-gray-400 text-sm">Payback Period</div>
                    </div>
                  </div>

                  {/* Key Results */}
                  <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700">
                    <h4 className="text-xl font-bold text-white mb-4">🎯 Key Results Achieved</h4>
                    <ul className="space-y-3">
                      {story.results.map((result, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-300">{result}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="text-center">
                    <button className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                      Build Your Empire Like {story.owner}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-block p-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl border border-blue-500/20 max-w-4xl">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Join These Empire Builders?
            </h3>
            <p className="text-gray-300 mb-6">
              Start your transformation today. The more businesses you manage, the more you save.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                Start Free Trial - No Credit Card
              </button>
              <button className="px-8 py-4 border-2 border-gray-600 hover:border-gray-400 text-white rounded-xl font-semibold transition-all duration-300">
                Schedule Empire Strategy Call
              </button>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              ✅ 30-day free trial • ✅ AI Launch Concierge • ✅ Empire Builder Support
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}