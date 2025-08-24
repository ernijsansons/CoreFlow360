'use client'

import { useState } from 'react'

const professionalAIEmployees = [
  {
    id: 1,
    name: "Morgan AI - Client Success Director",
    image: "💼",
    specialty: "Client Relationship & Project Management",
    description: "24/7 AI project manager that coordinates deliverables, timelines, and resources across all client accounts",
    capabilities: [
      "Real-time project status tracking and milestone management",
      "Client communication automation with personalized updates", 
      "Resource allocation and capacity planning optimization",
      "Deliverable quality control and review coordination",
      "Client satisfaction monitoring and proactive issue resolution"
    ],
    metrics: {
      onTimeDelivery: "94% on-time delivery",
      clientSatisfaction: "97% client satisfaction",
      utilization: "+31% team utilization",
      retention: "92% client retention"
    },
    professionalSpecific: "Integrates with Monday.com, Asana, Notion, Slack, Microsoft Teams"
  },
  {
    id: 2,
    name: "Taylor AI - Revenue Operations Manager",
    image: "💰",
    specialty: "Billing, Invoicing & Financial Management",
    description: "AI finance officer that tracks time, generates invoices, manages contracts, and optimizes revenue",
    capabilities: [
      "Automated time tracking across all team members and projects",
      "Instant invoice generation with detailed project breakdowns",
      "Contract management and renewal automation",
      "Revenue forecasting and pipeline analysis",
      "Collections automation and payment follow-ups"
    ],
    metrics: {
      billingAccuracy: "99.8% billing accuracy",
      collections: "45% faster payments",
      revenueGrowth: "+37% revenue growth",
      cashFlow: "+52% cash flow improvement"
    },
    professionalSpecific: "QuickBooks, Xero, Harvest, Toggl, payment gateway integrations"
  },
  {
    id: 3,
    name: "Jordan AI - Business Development Engine",
    image: "🚀",
    specialty: "Sales, Marketing & Growth",
    description: "AI growth engine that generates leads, nurtures prospects, creates proposals, and wins new business",
    capabilities: [
      "Lead generation and qualification automation",
      "Proposal generation with win rate optimization",
      "Client onboarding and kickoff automation",
      "Cross-sell and upsell opportunity identification",
      "Market analysis and competitive intelligence"
    ],
    metrics: {
      leadGeneration: "+67% qualified leads",
      proposalWinRate: "42% win rate",
      dealSize: "+28% average deal size",
      salesCycle: "-35% sales cycle"
    },
    professionalSpecific: "HubSpot, Salesforce, LinkedIn Sales Navigator, proposal software"
  }
]

const professionalChallenges = [
  {
    icon: "⏰",
    title: "Unbillable Hours",
    problem: "Admin work, proposals, invoicing eat up 30-40% of time that should be billable to clients",
    solution: "AI automates all non-billable work, recovering 42+ billable hours per week",
    beforeAfter: {
      before: "Drowning in admin, missing revenue targets, team burnout, low profitability",
      after: "Pure focus on client work, exceeding targets, happy team, 31% higher margins"
    }
  },
  {
    icon: "📊",
    title: "Project Chaos",
    problem: "Multiple clients, deliverables, and deadlines create constant firefighting and scope creep",
    solution: "AI orchestrates all projects with 94% on-time delivery and zero scope creep",
    beforeAfter: {
      before: "Missed deadlines, unhappy clients, team stress, reputation damage",
      after: "Perfect delivery, delighted clients, calm team, referral growth"
    }
  },
  {
    icon: "💸",
    title: "Cash Flow Issues",
    problem: "Slow invoicing, poor collections, and unclear finances hurt growth and stability",
    solution: "Instant invoicing and automated collections improve cash flow by 52%",
    beforeAfter: {
      before: "Cash crunches, delayed payments, growth constraints, financial stress",
      after: "Healthy cash flow, predictable revenue, funded growth, financial peace"
    }
  }
]

export default function V0ProfessionalFeatures() {
  const [selectedEmployee, setSelectedEmployee] = useState(0)
  const [activeTab, setActiveTab] = useState('employees')

  return (
    <section id="professional-features" className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Professional <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 bg-clip-text text-transparent">AI Employees</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Specialized AI employees that understand professional services. They work 24/7 to 
            manage clients, optimize revenue, drive growth, and keep every project running flawlessly.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-gray-800 rounded-xl p-1">
            <button
              className={`px-8 py-3 rounded-lg transition-all duration-300 font-semibold ${
                activeTab === 'employees' 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('employees')}
            >
              Professional AI Team
            </button>
            <button
              className={`px-8 py-3 rounded-lg transition-all duration-300 font-semibold ${
                activeTab === 'challenges' 
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('challenges')}
            >
              Professional Solutions
            </button>
          </div>
        </div>

        {/* Professional AI Employees Tab */}
        {activeTab === 'employees' && (
          <>
            {/* Employee Selection */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {professionalAIEmployees.map((employee, index) => (
                <button
                  key={employee.id}
                  onClick={() => setSelectedEmployee(index)}
                  className={`p-6 rounded-2xl transition-all duration-300 text-center ${
                    selectedEmployee === index
                      ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/50 transform scale-105'
                      : 'bg-gray-800/30 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-4xl mb-3">{employee.image}</div>
                  <div className="text-white font-bold text-lg mb-2">{employee.name}</div>
                  <div className="text-green-400 text-sm font-semibold">{employee.specialty}</div>
                </button>
              ))}
            </div>

            {/* Selected Employee Details */}
            <div className="max-w-6xl mx-auto">
              {professionalAIEmployees.map((employee, index) => (
                <div
                  key={employee.id}
                  className={`transition-all duration-500 ${
                    selectedEmployee === index ? 'opacity-100 block' : 'opacity-0 hidden'
                  }`}
                >
                  <div className="grid lg:grid-cols-2 gap-12">
                    {/* Employee Profile */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 backdrop-blur-sm p-8 rounded-3xl border border-green-500/20">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center text-3xl">
                            {employee.image}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">{employee.name}</h3>
                            <p className="text-green-400 font-semibold">{employee.specialty}</p>
                          </div>
                        </div>

                        <p className="text-gray-300 text-lg leading-relaxed mb-6">
                          {employee.description}
                        </p>

                        <div className="p-4 bg-green-600/10 border border-green-500/20 rounded-xl">
                          <h4 className="font-semibold text-green-400 mb-2">💼 Professional Integration</h4>
                          <p className="text-gray-300 text-sm">{employee.professionalSpecific}</p>
                        </div>
                      </div>
                    </div>

                    {/* Capabilities & Metrics */}
                    <div className="space-y-6">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(employee.metrics).map(([key, value]) => (
                          <div key={key} className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl text-center">
                            <div className="text-xl font-bold text-white mb-1">{value}</div>
                            <div className="text-gray-400 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
                          </div>
                        ))}
                      </div>

                      {/* Capabilities */}
                      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700">
                        <h4 className="text-xl font-bold text-white mb-4">🎯 Professional Capabilities</h4>
                        <ul className="space-y-3">
                          {employee.capabilities.map((capability, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-300 text-sm">{capability}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA */}
                      <button className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                        Add {employee.name} to My Professional Empire
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Professional Solutions Tab */}
        {activeTab === 'challenges' && (
          <div className="max-w-6xl mx-auto">
            <div className="space-y-12">
              {professionalChallenges.map((challenge, index) => (
                <div key={index} className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-700">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-4xl">{challenge.icon}</div>
                      <h3 className="text-2xl font-bold text-white">{challenge.title}</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-red-600/10 border border-red-500/20 rounded-xl">
                        <h4 className="font-semibold text-red-400 mb-2">❌ The Professional Problem</h4>
                        <p className="text-gray-300 text-sm">{challenge.problem}</p>
                      </div>
                      
                      <div className="p-4 bg-green-600/10 border border-green-500/20 rounded-xl">
                        <h4 className="font-semibold text-green-400 mb-2">✅ CoreFlow360 Solution</h4>
                        <p className="text-white text-sm">{challenge.solution}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm p-8 rounded-3xl border border-green-500/20">
                    <h4 className="text-xl font-bold text-green-400 mb-6">Before vs After</h4>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-900/50 rounded-xl">
                        <h5 className="font-semibold text-red-400 mb-2">Before CoreFlow360:</h5>
                        <p className="text-gray-300 text-sm">{challenge.beforeAfter.before}</p>
                      </div>
                      
                      <div className="p-4 bg-green-900/30 rounded-xl">
                        <h5 className="font-semibold text-green-400 mb-2">After CoreFlow360:</h5>
                        <p className="text-white text-sm">{challenge.beforeAfter.after}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <div className="inline-block p-8 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-3xl border border-green-500/20">
                <h3 className="text-2xl font-bold text-white mb-4">
                  💼 Ready to Transform Your Professional Practice?
                </h3>
                <p className="text-gray-300 mb-6 max-w-2xl">
                  Join 923+ professional firms using CoreFlow360 to automate client management, 
                  optimize revenue, and build multi-client professional empires.
                </p>
                <button className="px-8 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-500 hover:via-emerald-500 hover:to-teal-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                  Start Your Professional Empire Today
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}