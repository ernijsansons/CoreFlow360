'use client'

import { useState } from 'react'

const constructionAIEmployees = [
  {
    id: 1,
    name: "Mason AI - Project Command Center",
    image: "🏗️",
    specialty: "Project Management & Coordination",
    description: "24/7 AI project manager that coordinates crews, equipment, and materials across all job sites",
    capabilities: [
      "Real-time project scheduling and crew deployment optimization",
      "Equipment tracking and preventive maintenance scheduling", 
      "Material ordering and supply chain coordination",
      "Subcontractor scheduling and performance tracking",
      "Weather monitoring and schedule adjustment automation"
    ],
    metrics: {
      onTimeRate: "89% on-time completion",
      efficiency: "+65% crew efficiency",
      delays: "-91% project delays",
      coordination: "24/7 site coordination"
    },
    constructionSpecific: "Integrates with Procore, PlanGrid, Buildertrend, construction equipment IoT"
  },
  {
    id: 2,
    name: "Dakota AI - Safety & Compliance Director",
    image: "⚠️",
    specialty: "Safety Management & Regulatory Compliance",
    description: "AI safety officer that ensures OSHA compliance, tracks certifications, and prevents accidents",
    capabilities: [
      "Daily safety briefing generation and hazard assessments",
      "OSHA compliance monitoring and violation prevention",
      "Worker certification tracking and renewal alerts",
      "Incident reporting and root cause analysis",
      "Safety training scheduling and documentation"
    ],
    metrics: {
      safetyScore: "98% safety compliance",
      incidents: "-73% safety incidents",
      training: "100% certification tracking",
      osha: "Zero OSHA violations"
    },
    constructionSpecific: "OSHA regulations, safety equipment monitoring, site-specific hazard detection"
  },
  {
    id: 3,
    name: "Blake AI - Budget & Bid Specialist",
    image: "💰",
    specialty: "Cost Control & Financial Management",
    description: "AI estimator that creates accurate bids, tracks costs, and maximizes project profitability",
    capabilities: [
      "Instant bid generation with historical data analysis",
      "Real-time budget tracking and cost overrun alerts",
      "Change order management and client approval automation",
      "Subcontractor payment processing and lien waiver tracking",
      "Profit margin analysis and optimization recommendations"
    ],
    metrics: {
      bidAccuracy: "97% bid accuracy",
      margins: "+22% profit margins",
      changeOrders: "< 2hr approvals",
      collections: "+45% faster payments"
    },
    constructionSpecific: "RS Means integration, prevailing wage calculations, bond management"
  }
]

const constructionChallenges = [
  {
    icon: "📅",
    title: "Project Delays",
    problem: "Weather, crew conflicts, material shortages cause 30% of projects to run late, destroying profits",
    solution: "AI coordinates everything proactively, achieving 89% on-time completion rates",
    beforeAfter: {
      before: "Constant firefighting, angry clients, liquidated damages, stressed project managers",
      after: "Smooth operations, happy clients, bonus payments, peaceful management"
    }
  },
  {
    icon: "💸",
    title: "Cost Overruns",
    problem: "Poor tracking, surprise costs, change order chaos eats 15-20% of project margins",
    solution: "Real-time cost tracking and instant change orders increase margins by 22%",
    beforeAfter: {
      before: "Budget surprises, margin erosion, cash flow problems, client disputes",
      after: "Predictable costs, protected margins, healthy cash flow, client trust"
    }
  },
  {
    icon: "🚨",
    title: "Safety Violations",
    problem: "OSHA violations, accidents, and compliance issues risk licenses and create liability",
    solution: "AI safety management reduces incidents by 73% with zero OSHA violations",
    beforeAfter: {
      before: "Safety incidents, OSHA fines, insurance claims, work stoppages",
      after: "Perfect safety record, lower insurance, continuous operations, peace of mind"
    }
  }
]

export default function V0ConstructionFeatures() {
  const [selectedEmployee, setSelectedEmployee] = useState(0)
  const [activeTab, setActiveTab] = useState('employees')

  return (
    <section id="construction-features" className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Construction <span className="bg-gradient-to-r from-orange-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">AI Employees</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Specialized AI employees that understand construction challenges. They work 24/7 to 
            coordinate projects, ensure safety, control costs, and keep every job site running smoothly.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-gray-800 rounded-xl p-1">
            <button
              className={`px-8 py-3 rounded-lg transition-all duration-300 font-semibold ${
                activeTab === 'employees' 
                  ? 'bg-orange-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('employees')}
            >
              Construction AI Team
            </button>
            <button
              className={`px-8 py-3 rounded-lg transition-all duration-300 font-semibold ${
                activeTab === 'challenges' 
                  ? 'bg-yellow-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('challenges')}
            >
              Construction Solutions
            </button>
          </div>
        </div>

        {/* Construction AI Employees Tab */}
        {activeTab === 'employees' && (
          <>
            {/* Employee Selection */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {constructionAIEmployees.map((employee, index) => (
                <button
                  key={employee.id}
                  onClick={() => setSelectedEmployee(index)}
                  className={`p-6 rounded-2xl transition-all duration-300 text-center ${
                    selectedEmployee === index
                      ? 'bg-gradient-to-br from-orange-600/20 to-yellow-600/20 border border-orange-500/50 transform scale-105'
                      : 'bg-gray-800/30 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-4xl mb-3">{employee.image}</div>
                  <div className="text-white font-bold text-lg mb-2">{employee.name}</div>
                  <div className="text-orange-400 text-sm font-semibold">{employee.specialty}</div>
                </button>
              ))}
            </div>

            {/* Selected Employee Details */}
            <div className="max-w-6xl mx-auto">
              {constructionAIEmployees.map((employee, index) => (
                <div
                  key={employee.id}
                  className={`transition-all duration-500 ${
                    selectedEmployee === index ? 'opacity-100 block' : 'opacity-0 hidden'
                  }`}
                >
                  <div className="grid lg:grid-cols-2 gap-12">
                    {/* Employee Profile */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-orange-500/10 via-yellow-500/10 to-amber-500/10 backdrop-blur-sm p-8 rounded-3xl border border-orange-500/20">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-2xl flex items-center justify-center text-3xl">
                            {employee.image}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">{employee.name}</h3>
                            <p className="text-orange-400 font-semibold">{employee.specialty}</p>
                          </div>
                        </div>

                        <p className="text-gray-300 text-lg leading-relaxed mb-6">
                          {employee.description}
                        </p>

                        <div className="p-4 bg-orange-600/10 border border-orange-500/20 rounded-xl">
                          <h4 className="font-semibold text-orange-400 mb-2">🏗️ Construction Integration</h4>
                          <p className="text-gray-300 text-sm">{employee.constructionSpecific}</p>
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
                        <h4 className="text-xl font-bold text-white mb-4">🎯 Construction Capabilities</h4>
                        <ul className="space-y-3">
                          {employee.capabilities.map((capability, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-300 text-sm">{capability}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA */}
                      <button className="w-full py-4 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                        Add {employee.name} to My Construction Empire
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Construction Solutions Tab */}
        {activeTab === 'challenges' && (
          <div className="max-w-6xl mx-auto">
            <div className="space-y-12">
              {constructionChallenges.map((challenge, index) => (
                <div key={index} className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-700">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-4xl">{challenge.icon}</div>
                      <h3 className="text-2xl font-bold text-white">{challenge.title}</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-red-600/10 border border-red-500/20 rounded-xl">
                        <h4 className="font-semibold text-red-400 mb-2">❌ The Construction Problem</h4>
                        <p className="text-gray-300 text-sm">{challenge.problem}</p>
                      </div>
                      
                      <div className="p-4 bg-green-600/10 border border-green-500/20 rounded-xl">
                        <h4 className="font-semibold text-green-400 mb-2">✅ CoreFlow360 Solution</h4>
                        <p className="text-white text-sm">{challenge.solution}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 backdrop-blur-sm p-8 rounded-3xl border border-orange-500/20">
                    <h4 className="text-xl font-bold text-orange-400 mb-6">Before vs After</h4>
                    
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
              <div className="inline-block p-8 bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-amber-500/10 rounded-3xl border border-orange-500/20">
                <h3 className="text-2xl font-bold text-white mb-4">
                  🏗️ Ready to Transform Your Construction Business?
                </h3>
                <p className="text-gray-300 mb-6 max-w-2xl">
                  Join 612+ construction companies using CoreFlow360 to automate project management, 
                  ensure safety compliance, and build multi-site construction empires.
                </p>
                <button className="px-8 py-4 bg-gradient-to-r from-orange-600 via-yellow-600 to-amber-600 hover:from-orange-500 hover:via-yellow-500 hover:to-amber-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                  Start Your Construction Empire Today
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}