'use client'

import { useState } from 'react'

const legalSuccessStories = [
  {
    id: 1,
    company: "Metro Legal Network",
    owner: "Sarah Chen",
    location: "Chicago, IL",
    offices: 3,
    attorneys: 18,
    image: "⚖️",
    beforeRevenue: "$2.8M/year",
    afterRevenue: "$4.7M/year", 
    growth: "+68% growth",
    timeframe: "13 months",
    speciality: "Corporate Law & M&A",
    quote: "CoreFlow360's AI research cut our case prep time by 75%. What used to take junior associates 20 hours now takes 3 hours with better results. We're handling 40% more cases with the same team and our 15% multi-office discount saves us $6K monthly.",
    challengesBefore: [
      "Junior associates spending 60+ hours weekly on legal research",
      "Document drafting took weeks causing client delays and frustration",
      "Inconsistent contract templates across 3 offices led to compliance issues", 
      "Billing and time tracking errors caused $200K+ in lost revenue annually",
      "Client intake was overwhelmed, losing 40% of qualified leads"
    ],
    resultsAfter: [
      "AI research delivers comprehensive analysis in 3 hours, not days",
      "Contracts and pleadings generated instantly with perfect formatting",
      "Standardized templates empire-wide ensure compliance and consistency",
      "Automated time tracking and billing increased collections by 45%",
      "24/7 AI client intake captures and qualifies every lead"
    ],
    metrics: {
      revenueGrowth: "+68%",
      researchTime: "75% faster",
      caseLoad: "+40% more cases", 
      billing: "+45% collections",
      offices: "2 → 3 offices"
    }
  },
  {
    id: 2,
    company: "Justice Partners LLC",
    owner: "Michael Rodriguez",
    location: "Miami, FL", 
    offices: 4,
    attorneys: 24,
    image: "🏛️",
    beforeRevenue: "$3.5M/year",
    afterRevenue: "$6.1M/year",
    growth: "+74% growth", 
    timeframe: "15 months",
    speciality: "Personal Injury & Litigation",
    quote: "The document automation alone transformed our practice. We generate perfect pleadings in minutes, not days. Our case intake tripled and we're winning 60% more settlements. The 25% multi-office discount for our 4 locations is just the cherry on top.",
    challengesBefore: [
      "Document drafting bottleneck prevented taking on new cases",
      "Manual case tracking led to missed deadlines and bar complaints", 
      "Settlement calculations were inconsistent across attorneys",
      "Client communication was reactive causing satisfaction issues",
      "Research costs from Westlaw and LexisNexis were bankrupting the firm"
    ],
    resultsAfter: [
      "Perfect pleadings, motions, and briefs generated in under 10 minutes",
      "AI case management never misses deadlines or court dates",
      "Automated settlement analysis maximizes client outcomes",
      "Proactive client updates and portal access boost satisfaction to 4.9/5",
      "AI research eliminates 80% of external research costs"
    ],
    metrics: {
      revenueGrowth: "+74%",
      caseIntake: "3x case intake",
      settlements: "+60% win rate",
      satisfaction: "4.9/5 client rating",
      offices: "2 → 4 offices"
    }
  },
  {
    id: 3, 
    company: "Elite Law Group",
    owner: "Amanda Thompson",
    location: "Denver, CO",
    offices: 6,
    attorneys: 35,
    image: "🎓",
    beforeRevenue: "$4.2M/year", 
    afterRevenue: "$8.3M/year",
    growth: "+98% growth",
    timeframe: "18 months",
    speciality: "Business Law & Intellectual Property",
    quote: "Building a 6-office legal empire seemed impossible until CoreFlow360. Our AI employees work 24/7 across all locations. Contract review that took days now takes hours. We've doubled revenue while maintaining work-life balance - that's the real victory.",
    challengesBefore: [
      "Contract review backlog caused 2-3 week delays for clients",
      "Each office operated independently with no knowledge sharing",
      "IP research was inconsistent and missed critical prior art",
      "Billing disputes from unclear time entries damaged client relationships",
      "Attorney burnout from 70+ hour weeks led to high turnover"
    ],
    resultsAfter: [
      "AI contract review identifies issues in 2 hours with 99.8% accuracy", 
      "Unified knowledge base shares expertise across all 6 locations",
      "Comprehensive IP research includes global databases and AI analysis",
      "Automated billing with detailed descriptions eliminates disputes",
      "40-hour work weeks with doubled productivity and zero turnover"
    ],
    metrics: {
      revenueGrowth: "+98%",
      empireSavings: "$12K/month discount",
      efficiency: "+150% productivity",
      workLife: "40-hour weeks",
      offices: "3 → 6 offices"
    }
  }
]

export default function V0LegalTestimonials() {
  const [selectedStory, setSelectedStory] = useState(0)

  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Legal <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">Empire Success Stories</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Real attorneys who built multi-office empires with CoreFlow360. 
            These aren't just clients - they're legal empire builders transforming the practice of law.
          </p>
        </div>

        {/* Legal Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700">
            <div className="text-3xl mb-3">⚖️</div>
            <div className="text-3xl font-bold text-purple-400 mb-2">423+</div>
            <div className="text-gray-400 text-sm">Law Firms</div>
          </div>
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700">
            <div className="text-3xl mb-3">💼</div>
            <div className="text-3xl font-bold text-blue-400 mb-2">$3.2M+</div>
            <div className="text-gray-400 text-sm">Legal Revenue Generated</div>
          </div>
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700">
            <div className="text-3xl mb-3">📈</div>
            <div className="text-3xl font-bold text-indigo-400 mb-2">67%</div>
            <div className="text-gray-400 text-sm">More Billable Hours</div>
          </div>
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700">
            <div className="text-3xl mb-3">⭐</div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">4.9/5</div>
            <div className="text-gray-400 text-sm">Client Satisfaction</div>
          </div>
        </div>

        {/* Story Navigation */}
        <div className="flex flex-col lg:flex-row justify-center items-center gap-4 mb-12">
          {legalSuccessStories.map((story, index) => (
            <button
              key={story.id}
              onClick={() => setSelectedStory(index)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${
                selectedStory === index
                  ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-white'
                  : 'bg-gray-800/30 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              <span className="text-2xl">{story.image}</span>
              <div className="text-left">
                <div className="font-semibold">{story.company}</div>
                <div className="text-sm opacity-75">{story.offices} Legal Offices</div>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Story */}
        <div className="max-w-7xl mx-auto">
          {legalSuccessStories.map((story, index) => (
            <div
              key={story.id}
              className={`transition-all duration-500 ${
                selectedStory === index ? 'opacity-100 block' : 'opacity-0 hidden'
              }`}
            >
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Story Content */}
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-indigo-500/10 backdrop-blur-sm p-8 rounded-3xl border border-purple-500/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-3xl">
                        {story.image}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{story.company}</h3>
                        <p className="text-gray-400">{story.owner} • {story.speciality}</p>
                        <p className="text-purple-400 text-sm">{story.location} • {story.attorneys} attorneys</p>
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
                    <h4 className="text-xl font-bold text-white mb-4">⚖️ Complete Legal Transformation</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-red-400 mb-2">The Legal Problems Solved:</h5>
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
                        <h5 className="font-semibold text-green-400 mb-2">The Legal Results Achieved:</h5>
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
                    <button className="w-full py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:via-blue-500 hover:to-indigo-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                      Build My Legal Empire Like {story.owner}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-block p-8 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 rounded-3xl border border-purple-500/20 max-w-4xl">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <span>⚖️</span> Ready to Build Your Legal Empire?
            </h3>
            <p className="text-gray-300 mb-6">
              Join 423+ attorneys using CoreFlow360 to automate research, drafting, and client management 
              while building multi-office legal empires.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:via-blue-500 hover:to-indigo-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                Start Legal Empire Trial - Free
              </button>
              <button className="px-8 py-4 border-2 border-gray-600 hover:border-gray-400 text-white rounded-xl font-semibold transition-all duration-300">
                Schedule Legal Demo
              </button>
            </div>
            <div className="text-sm text-gray-400">
              ✅ Bar-compliant setup • ✅ 30-day guarantee • ✅ Expert legal support team
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}