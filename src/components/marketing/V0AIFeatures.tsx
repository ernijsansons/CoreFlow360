'use client'

import { useState } from 'react'

const aiEmployees = [
  {
    id: 1,
    name: "Sarah AI",
    role: "Customer Experience Director",
    department: "Customer Service",
    image: "👩‍💼",
    specialty: "Customer interactions, support tickets, satisfaction tracking",
    description: "24/7 customer support that learns your business voice and handles 89% of inquiries automatically",
    capabilities: [
      "Instant response to customer inquiries across all channels",
      "Sentiment analysis for proactive issue resolution", 
      "Automated ticket routing and priority assignment",
      "Customer satisfaction tracking and improvement suggestions",
      "Multi-language support for global business operations"
    ],
    metrics: {
      responseTime: "< 30 seconds",
      resolutionRate: "89%",
      satisfaction: "4.8/5 stars",
      availability: "24/7/365"
    },
    integration: "Slack, Teams, email, phone, chat, CRM systems",
    businessImpact: "Reduces support costs by 67%, increases customer satisfaction by 34%"
  },
  {
    id: 2,
    name: "Marcus AI", 
    role: "Sales Growth Strategist",
    department: "Sales & Marketing",
    image: "👨‍💻",
    specialty: "Lead generation, sales automation, conversion optimization",
    description: "AI sales expert that generates qualified leads, nurtures prospects, and closes deals 24/7",
    capabilities: [
      "Intelligent lead scoring and qualification",
      "Automated email sequences and follow-ups",
      "Sales pipeline management and forecasting",
      "Competitive analysis and pricing optimization",
      "Cross-selling and upselling opportunity identification"
    ],
    metrics: {
      leadQuality: "+127% qualified leads",
      conversionRate: "+43% close rate", 
      pipelineValue: "+89% pipeline growth",
      responseTime: "< 5 minutes"
    },
    integration: "HubSpot, Salesforce, Pipedrive, email marketing platforms",
    businessImpact: "Increases revenue by 52%, reduces sales cycle by 31%"
  },
  {
    id: 3,
    name: "Alex AI",
    role: "Financial Intelligence Officer", 
    department: "Finance & Accounting",
    image: "👩‍💼",
    specialty: "Financial analysis, expense tracking, cash flow optimization",
    description: "Advanced financial AI that manages books, predicts cash flow, and optimizes profitability",
    capabilities: [
      "Automated bookkeeping and expense categorization",
      "Cash flow forecasting and optimization",
      "Tax preparation and compliance monitoring",
      "Financial reporting and KPI tracking",
      "Budget analysis and cost reduction recommendations"
    ],
    metrics: {
      accuracy: "99.7% financial accuracy",
      timeReduction: "-78% monthly close time",
      cashFlow: "+31% cash flow optimization", 
      compliance: "100% tax compliance"
    },
    integration: "QuickBooks, Xero, FreshBooks, banking APIs, receipt scanning",
    businessImpact: "Saves 40+ hours/month, reduces accounting costs by 71%"
  },
  {
    id: 4,
    name: "Jordan AI",
    role: "Operations Excellence Manager",
    department: "Operations & Project Management", 
    image: "👨‍🔧",
    specialty: "Project coordination, resource allocation, process optimization",
    description: "Operational AI that coordinates projects, manages resources, and prevents delays across your empire",
    capabilities: [
      "Intelligent project scheduling and resource allocation",
      "Real-time progress tracking and delay prevention",
      "Automated workflow optimization and bottleneck identification", 
      "Supply chain coordination and inventory management",
      "Performance analytics and operational insights"
    ],
    metrics: {
      onTimeDelivery: "94% on-time completion",
      efficiency: "+67% operational efficiency",
      resourceUtil: "+45% resource optimization",
      delays: "-91% project delays"
    },
    integration: "Asana, Monday, Trello, supply chain systems, IoT sensors",
    businessImpact: "Eliminates 91% of delays, increases profitability by 38%"
  },
  {
    id: 5,
    name: "Taylor AI",
    role: "HR & Team Development Specialist",
    department: "Human Resources",
    image: "👩‍🎓", 
    specialty: "Recruitment, employee engagement, performance management",
    description: "HR AI that finds top talent, manages employee lifecycle, and optimizes team performance",
    capabilities: [
      "Intelligent candidate screening and matching",
      "Automated onboarding and training programs",
      "Performance tracking and improvement recommendations",
      "Employee satisfaction monitoring and retention strategies",
      "Compliance management and policy enforcement"
    ],
    metrics: {
      hiringTime: "-56% time to hire",
      retention: "+78% employee retention", 
      satisfaction: "4.7/5 employee satisfaction",
      compliance: "100% HR compliance"
    },
    integration: "LinkedIn, Indeed, BambooHR, Workday, applicant tracking systems",
    businessImpact: "Reduces hiring costs by 63%, improves team productivity by 41%"
  },
  {
    id: 6,
    name: "Riley AI",
    role: "Marketing Intelligence Director",
    department: "Marketing & Brand",
    image: "👨‍🎨",
    specialty: "Campaign optimization, content creation, ROI tracking",
    description: "Marketing AI that creates campaigns, optimizes ad spend, and tracks ROI across all channels",
    capabilities: [
      "Multi-channel campaign creation and optimization",
      "Content generation for blogs, social media, and ads",
      "ROI tracking and attribution modeling",
      "Audience segmentation and targeting optimization", 
      "Competitive intelligence and market analysis"
    ],
    metrics: {
      roi: "+156% marketing ROI",
      engagement: "+89% engagement rates",
      costReduction: "-45% ad spend waste",
      leadQuality: "+234% qualified leads"
    },
    integration: "Google Ads, Facebook, LinkedIn, email platforms, analytics tools",
    businessImpact: "Triples marketing ROI, reduces ad waste by 45%"
  }
]

const empireFeatures = [
  {
    icon: "🏢",
    title: "Multi-Business Coordination",
    description: "AI employees share intelligence across all your business locations",
    benefit: "Cross-pollination of best practices and unified operations"
  },
  {
    icon: "📊", 
    title: "Empire-Wide Analytics",
    description: "Consolidated reporting and insights across your entire business portfolio",
    benefit: "Make data-driven decisions with complete business intelligence"
  },
  {
    icon: "💰",
    title: "Progressive Savings",
    description: "The more businesses you add, the more you save per location",
    benefit: "10% (2+), 15% (3+), 25% (5+) discount tiers"
  },
  {
    icon: "🤖",
    title: "AI Learning Network", 
    description: "Your AI employees get exponentially smarter as your empire grows",
    benefit: "Each new business makes all your AI employees more intelligent"
  }
]

export default function V0AIFeatures() {
  const [selectedEmployee, setSelectedEmployee] = useState(0)
  const [activeTab, setActiveTab] = useState('employees')

  return (
    <section id="ai-features" className="py-24 bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Meet Your <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 bg-clip-text text-transparent">AI Employees</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Six specialized AI employees that work 24/7 to grow your business empire. 
            Unlike software, they learn, adapt, and get smarter with every interaction.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-gray-800 rounded-xl p-1">
            <button
              className={`px-8 py-3 rounded-lg transition-all duration-300 font-semibold ${
                activeTab === 'employees' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('employees')}
            >
              AI Employees
            </button>
            <button
              className={`px-8 py-3 rounded-lg transition-all duration-300 font-semibold ${
                activeTab === 'empire' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('empire')}
            >
              Empire Features
            </button>
          </div>
        </div>

        {/* AI Employees Tab */}
        {activeTab === 'employees' && (
          <>
            {/* Employee Selection */}
            <div className="grid md:grid-cols-6 gap-4 mb-12">
              {aiEmployees.map((employee, index) => (
                <button
                  key={employee.id}
                  onClick={() => setSelectedEmployee(index)}
                  className={`p-4 rounded-2xl transition-all duration-300 text-center ${
                    selectedEmployee === index
                      ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/50 transform scale-105'
                      : 'bg-gray-800/30 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-3xl mb-2">{employee.image}</div>
                  <div className="text-white font-semibold text-sm">{employee.name}</div>
                  <div className="text-gray-400 text-xs mt-1">{employee.department}</div>
                </button>
              ))}
            </div>

            {/* Selected Employee Details */}
            <div className="max-w-6xl mx-auto">
              {aiEmployees.map((employee, index) => (
                <div
                  key={employee.id}
                  className={`transition-all duration-500 ${
                    selectedEmployee === index ? 'opacity-100 block' : 'opacity-0 hidden'
                  }`}
                >
                  <div className="grid lg:grid-cols-2 gap-12">
                    {/* Employee Profile */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm p-8 rounded-3xl border border-blue-500/20">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-3xl">
                            {employee.image}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">{employee.name}</h3>
                            <p className="text-purple-400 font-semibold">{employee.role}</p>
                            <p className="text-gray-400 text-sm">{employee.specialty}</p>
                          </div>
                        </div>

                        <p className="text-gray-300 text-lg leading-relaxed mb-6">
                          {employee.description}
                        </p>

                        <div className="space-y-4">
                          <div className="p-4 bg-green-600/10 border border-green-500/20 rounded-xl">
                            <h4 className="font-semibold text-green-400 mb-2">💼 Business Impact</h4>
                            <p className="text-gray-300 text-sm">{employee.businessImpact}</p>
                          </div>

                          <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl">
                            <h4 className="font-semibold text-blue-400 mb-2">🔗 Integrations</h4>
                            <p className="text-gray-300 text-sm">{employee.integration}</p>
                          </div>
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
                        <h4 className="text-xl font-bold text-white mb-4">🎯 Core Capabilities</h4>
                        <ul className="space-y-3">
                          {employee.capabilities.map((capability, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-300 text-sm">{capability}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA */}
                      <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                        Hire {employee.name} Today
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empire Features Tab */}
        {activeTab === 'empire' && (
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {empireFeatures.map((feature, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-700">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">{feature.description}</p>
                  <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl">
                    <p className="text-blue-400 font-semibold text-sm">{feature.benefit}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <div className="inline-block p-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl border border-blue-500/20">
                <h3 className="text-2xl font-bold text-white mb-4">
                  🚀 The Empire Advantage
                </h3>
                <p className="text-gray-300 mb-6 max-w-3xl">
                  Unlike traditional software that treats each business separately, CoreFlow360's AI employees 
                  create an intelligent network across your entire empire. The more businesses you manage, 
                  the smarter and more efficient your entire operation becomes.
                </p>
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                  Start Building Your Empire
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gray-800/30 backdrop-blur-sm p-8 rounded-3xl border border-gray-700 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Hire Your AI Team?
            </h3>
            <p className="text-gray-300 mb-6">
              Start with any AI employee, then add more as your empire grows. Each employee becomes 
              more intelligent as your business network expands.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                Start Free Trial - Pick Your First AI Employee
              </button>
              <button className="px-8 py-4 border-2 border-gray-600 hover:border-gray-400 text-white rounded-xl font-semibold transition-all duration-300">
                See All AI Employees in Action
              </button>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              ✅ No credit card required • ✅ 30-day free trial • ✅ Onboarding included
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}