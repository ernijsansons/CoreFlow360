'use client'

import { useState } from 'react'

const hvacAIEmployees = [
  {
    id: 1,
    name: "Riley AI - HVAC Dispatcher",
    image: "🔧",
    specialty: "Smart Scheduling & Dispatch",
    description: "24/7 HVAC scheduling that eliminates double bookings and optimizes technician routes",
    capabilities: [
      "GPS-optimized routing saves 3+ hours daily",
      "Automated customer updates reduce calls by 80%",
      "Emergency call prioritization and dispatch",
      "Preventive maintenance scheduling automation",
      "Technician workload balancing across locations"
    ],
    metrics: {
      timeSaved: "25+ hours/week",
      efficiency: "+67% dispatch efficiency", 
      customerSat: "4.9/5 customer rating",
      noShows: "-89% no-show rate"
    },
    hvacSpecific: "Integrates with ServiceTitan, Housecall Pro, FieldEdge"
  },
  {
    id: 2,
    name: "Marcus AI - HVAC Sales Pro",
    image: "💰",
    specialty: "Estimates & Sales Automation",
    description: "AI sales expert that creates accurate HVAC estimates and closes more deals",
    capabilities: [
      "Photo-based equipment assessment and pricing",
      "Automated follow-up for estimates and proposals",
      "Seasonal promotion scheduling and targeting",
      "Equipment replacement recommendations",
      "Maintenance contract sales automation"
    ],
    metrics: {
      closeRate: "+47% close rate",
      avgTicket: "+31% average ticket",
      followUp: "100% estimate follow-up",
      contracts: "+156% contract sales"
    },
    hvacSpecific: "Works with HVAC price books, equipment catalogs, seasonal pricing"
  },
  {
    id: 3,
    name: "Sarah AI - HVAC Customer Care",
    image: "📞",
    specialty: "Customer Communication & Support",
    description: "Handles HVAC customer calls, scheduling, and service updates automatically",
    capabilities: [
      "24/7 emergency call handling and dispatch",
      "Service appointment scheduling and reminders",
      "Warranty tracking and maintenance alerts",
      "Customer portal for service history access",
      "Seasonal maintenance program management"
    ],
    metrics: {
      callHandling: "94% calls resolved",
      scheduling: "Zero scheduling conflicts",
      satisfaction: "4.8/5 customer rating",
      response: "< 30 second response"
    },
    hvacSpecific: "HVAC emergency prioritization, seasonal service reminders"
  }
]

const hvacChallenges = [
  {
    icon: "⏰",
    title: "Scheduling Chaos",
    problem: "Double bookings, no-shows, inefficient routing wastes 20+ hours weekly",
    solution: "Smart AI dispatch with GPS optimization saves 25+ hours per week",
    beforeAfter: {
      before: "Manual scheduling, constant conflicts, angry customers calling",
      after: "Automated perfect scheduling, optimized routes, happy customers"
    }
  },
  {
    icon: "💸",
    title: "Lost Revenue",
    problem: "Missed follow-ups, slow estimates, poor inventory tracking loses $50K+ annually",
    solution: "AI estimates from photos, automated follow-ups increase revenue 31%",
    beforeAfter: {
      before: "Estimates take days, 60% never followed up, inventory surprises",
      after: "Instant estimates, 100% follow-up, perfect inventory tracking"
    }
  },
  {
    icon: "📱", 
    title: "Communication Breakdown",
    problem: "Customers constantly calling 'when will you be here?' overwhelms staff",
    solution: "Automated customer updates and portal reduces calls by 80%",
    beforeAfter: {
      before: "Phone rings constantly, staff frustrated, customers worried",
      after: "Proactive updates, customer portal, peaceful office environment"
    }
  }
]

export default function V0HVACFeatures() {
  const [selectedEmployee, setSelectedEmployee] = useState(0)
  const [activeTab, setActiveTab] = useState('employees')

  return (
    <section id="hvac-features" className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            HVAC <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 bg-clip-text text-transparent">AI Employees</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Specialized AI employees that understand HVAC business challenges. They work 24/7 to 
            handle scheduling, estimates, customer service, and business growth.
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
              HVAC AI Team
            </button>
            <button
              className={`px-8 py-3 rounded-lg transition-all duration-300 font-semibold ${
                activeTab === 'challenges' 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('challenges')}
            >
              HVAC Solutions
            </button>
          </div>
        </div>

        {/* HVAC AI Employees Tab */}
        {activeTab === 'employees' && (
          <>
            {/* Employee Selection */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {hvacAIEmployees.map((employee, index) => (
                <button
                  key={employee.id}
                  onClick={() => setSelectedEmployee(index)}
                  className={`p-6 rounded-2xl transition-all duration-300 text-center ${
                    selectedEmployee === index
                      ? 'bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/50 transform scale-105'
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
              {hvacAIEmployees.map((employee, index) => (
                <div
                  key={employee.id}
                  className={`transition-all duration-500 ${
                    selectedEmployee === index ? 'opacity-100 block' : 'opacity-0 hidden'
                  }`}
                >
                  <div className="grid lg:grid-cols-2 gap-12">
                    {/* Employee Profile */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 backdrop-blur-sm p-8 rounded-3xl border border-orange-500/20">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center text-3xl">
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
                          <h4 className="font-semibold text-orange-400 mb-2">🔧 HVAC Integration</h4>
                          <p className="text-gray-300 text-sm">{employee.hvacSpecific}</p>
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
                        <h4 className="text-xl font-bold text-white mb-4">🎯 HVAC Capabilities</h4>
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
                      <button className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                        Add {employee.name} to My HVAC Empire
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* HVAC Solutions Tab */}
        {activeTab === 'challenges' && (
          <div className="max-w-6xl mx-auto">
            <div className="space-y-12">
              {hvacChallenges.map((challenge, index) => (
                <div key={index} className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-700">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-4xl">{challenge.icon}</div>
                      <h3 className="text-2xl font-bold text-white">{challenge.title}</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-red-600/10 border border-red-500/20 rounded-xl">
                        <h4 className="font-semibold text-red-400 mb-2">❌ The HVAC Problem</h4>
                        <p className="text-gray-300 text-sm">{challenge.problem}</p>
                      </div>
                      
                      <div className="p-4 bg-green-600/10 border border-green-500/20 rounded-xl">
                        <h4 className="font-semibold text-green-400 mb-2">✅ CoreFlow360 Solution</h4>
                        <p className="text-white text-sm">{challenge.solution}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm p-8 rounded-3xl border border-orange-500/20">
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
              <div className="inline-block p-8 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 rounded-3xl border border-orange-500/20">
                <h3 className="text-2xl font-bold text-white mb-4">
                  🔧 Ready to Transform Your HVAC Business?
                </h3>
                <p className="text-gray-300 mb-6 max-w-2xl">
                  Join 847+ HVAC companies using CoreFlow360 to automate their operations, 
                  increase revenue, and build multi-location empires.
                </p>
                <button className="px-8 py-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-500 hover:via-red-500 hover:to-pink-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                  Start Your HVAC Empire Today
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}