'use client'

import { useState } from 'react'

const legalAIEmployees = [
  {
    id: 1,
    name: "Sophia AI - Legal Research Director",
    image: "📚",
    specialty: "Case Research & Legal Analysis",
    description: "24/7 AI researcher that finds relevant cases, statutes, and precedents in minutes",
    capabilities: [
      "Comprehensive case law research across multiple jurisdictions",
      "Statute and regulation analysis with change tracking",
      "Legal precedent identification and citation formatting",
      "Regulatory compliance monitoring and alerts",
      "Westlaw and LexisNexis integration for comprehensive research"
    ],
    metrics: {
      researchTime: "75% faster research",
      accuracy: "98.7% citation accuracy",
      coverage: "All 50 states + federal",
      updates: "Real-time law changes"
    },
    legalSpecific: "Integrates with Westlaw, LexisNexis, Bloomberg Law, Fastcase"
  },
  {
    id: 2,
    name: "Alexander AI - Document Automation Expert",
    image: "📄",
    specialty: "Legal Document Generation & Review",
    description: "AI document specialist that drafts contracts, pleadings, and briefs with perfect formatting",
    capabilities: [
      "Contract drafting with clause libraries and precedent matching",
      "Pleadings and motion generation with court-specific formatting",
      "Brief writing with automatic citation and argument structuring",
      "Document review for compliance and risk identification",
      "Template customization for different practice areas and jurisdictions"
    ],
    metrics: {
      draftingSpeed: "90% faster drafting",
      accuracy: "99.2% format compliance",
      templates: "1,000+ legal templates",
      review: "< 2 min document review"
    },
    legalSpecific: "Court rules compliance, bar-approved templates, ethical review"
  },
  {
    id: 3,
    name: "Victoria AI - Client Relations Manager",
    image: "👩‍💼",
    specialty: "Client Communication & Case Management",
    description: "AI client manager that handles intake, communication, and case status updates",
    capabilities: [
      "24/7 client intake with conflict checking and qualification",
      "Automated case status updates and milestone notifications",
      "Appointment scheduling with attorney calendar integration",
      "Client portal management with secure document sharing",
      "Billing and time tracking with detailed reporting"
    ],
    metrics: {
      response: "< 30 seconds client response",
      intake: "85% qualified lead conversion",
      satisfaction: "4.9/5 client rating",
      efficiency: "+67% case management"
    },
    legalSpecific: "Attorney-client privilege protection, ethical compliance, trust accounting"
  }
]

const legalChallenges = [
  {
    icon: "📚",
    title: "Research Bottlenecks",
    problem: "Partners spending 20+ hours weekly on research, missing deadlines, incomplete analysis",
    solution: "AI research completes comprehensive case analysis in 2-3 hours, not days",
    beforeAfter: {
      before: "Junior associates buried in research, missed precedents, deadline pressure",
      after: "AI finds all relevant cases instantly, perfect citations, more time for strategy"
    }
  },
  {
    icon: "📄",
    title: "Document Chaos",
    problem: "Document drafting takes weeks, formatting errors, inconsistent templates across offices",
    solution: "AI generates perfect documents in minutes with automatic formatting and compliance",
    beforeAfter: {
      before: "Manual drafting, formatting nightmares, template chaos, compliance errors",
      after: "Instant perfect documents, automatic formatting, consistent templates empire-wide"
    }
  },
  {
    icon: "⏰",
    title: "Billing Nightmares",
    problem: "Time tracking missed, billing disputes, collections problems, cash flow issues",
    solution: "Automated time tracking and billing increases collections by 45%",
    beforeAfter: {
      before: "Lost billable hours, client disputes, late payments, cash flow problems",
      after: "Perfect time capture, transparent billing, faster payments, predictable cash flow"
    }
  }
]

export default function V0LegalFeatures() {
  const [selectedEmployee, setSelectedEmployee] = useState(0)
  const [activeTab, setActiveTab] = useState('employees')

  return (
    <section id="legal-features" className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Legal <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">AI Employees</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Specialized AI employees that understand legal practice complexities. They work 24/7 to 
            handle research, document drafting, client management, and practice growth.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-gray-800 rounded-xl p-1">
            <button
              className={`px-8 py-3 rounded-lg transition-all duration-300 font-semibold ${
                activeTab === 'employees' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('employees')}
            >
              Legal AI Team
            </button>
            <button
              className={`px-8 py-3 rounded-lg transition-all duration-300 font-semibold ${
                activeTab === 'challenges' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('challenges')}
            >
              Legal Solutions
            </button>
          </div>
        </div>

        {/* Legal AI Employees Tab */}
        {activeTab === 'employees' && (
          <>
            {/* Employee Selection */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {legalAIEmployees.map((employee, index) => (
                <button
                  key={employee.id}
                  onClick={() => setSelectedEmployee(index)}
                  className={`p-6 rounded-2xl transition-all duration-300 text-center ${
                    selectedEmployee === index
                      ? 'bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/50 transform scale-105'
                      : 'bg-gray-800/30 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-4xl mb-3">{employee.image}</div>
                  <div className="text-white font-bold text-lg mb-2">{employee.name}</div>
                  <div className="text-purple-400 text-sm font-semibold">{employee.specialty}</div>
                </button>
              ))}
            </div>

            {/* Selected Employee Details */}
            <div className="max-w-6xl mx-auto">
              {legalAIEmployees.map((employee, index) => (
                <div
                  key={employee.id}
                  className={`transition-all duration-500 ${
                    selectedEmployee === index ? 'opacity-100 block' : 'opacity-0 hidden'
                  }`}
                >
                  <div className="grid lg:grid-cols-2 gap-12">
                    {/* Employee Profile */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-indigo-500/10 backdrop-blur-sm p-8 rounded-3xl border border-purple-500/20">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-3xl">
                            {employee.image}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">{employee.name}</h3>
                            <p className="text-purple-400 font-semibold">{employee.specialty}</p>
                          </div>
                        </div>

                        <p className="text-gray-300 text-lg leading-relaxed mb-6">
                          {employee.description}
                        </p>

                        <div className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-xl">
                          <h4 className="font-semibold text-purple-400 mb-2">⚖️ Legal Integration</h4>
                          <p className="text-gray-300 text-sm">{employee.legalSpecific}</p>
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
                        <h4 className="text-xl font-bold text-white mb-4">⚖️ Legal Capabilities</h4>
                        <ul className="space-y-3">
                          {employee.capabilities.map((capability, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-300 text-sm">{capability}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA */}
                      <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                        Add {employee.name} to My Legal Empire
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Legal Solutions Tab */}
        {activeTab === 'challenges' && (
          <div className="max-w-6xl mx-auto">
            <div className="space-y-12">
              {legalChallenges.map((challenge, index) => (
                <div key={index} className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-700">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-4xl">{challenge.icon}</div>
                      <h3 className="text-2xl font-bold text-white">{challenge.title}</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-red-600/10 border border-red-500/20 rounded-xl">
                        <h4 className="font-semibold text-red-400 mb-2">❌ The Legal Problem</h4>
                        <p className="text-gray-300 text-sm">{challenge.problem}</p>
                      </div>
                      
                      <div className="p-4 bg-green-600/10 border border-green-500/20 rounded-xl">
                        <h4 className="font-semibold text-green-400 mb-2">✅ CoreFlow360 Solution</h4>
                        <p className="text-white text-sm">{challenge.solution}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm p-8 rounded-3xl border border-purple-500/20">
                    <h4 className="text-xl font-bold text-purple-400 mb-6">Before vs After</h4>
                    
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
              <div className="inline-block p-8 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 rounded-3xl border border-purple-500/20">
                <h3 className="text-2xl font-bold text-white mb-4">
                  ⚖️ Ready to Transform Your Legal Practice?
                </h3>
                <p className="text-gray-300 mb-6 max-w-2xl">
                  Join 423+ law firms using CoreFlow360 to automate research, drafting, and client management 
                  while building multi-office legal empires.
                </p>
                <button className="px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:via-blue-500 hover:to-indigo-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                  Start Your Legal Empire Today
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}