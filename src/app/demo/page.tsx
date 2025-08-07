'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  BarChart3, 
  Brain,
  Sparkles,
  ArrowRight,
  Activity
} from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { MetricCard } from '@/components/ui/MetricCard'

interface Industry {
  id: string
  name: string
  icon: string
  color: string
  metrics: Array<{
    label: string
    value: string
    trend?: number
  }>
  features: string[]
}

const industries: Industry[] = [
  {
    id: 'hvac',
    name: 'HVAC Services',
    icon: '❄️',
    color: 'blue',
    metrics: [
      { label: 'Route Optimization', value: '43%', trend: 12 },
      { label: 'Response Time', value: '18min', trend: -23 },
      { label: 'Customer Satisfaction', value: '94%', trend: 8 },
      { label: 'Energy Savings', value: '$127K', trend: 15 }
    ],
    features: [
      'Predictive maintenance alerts',
      'Smart route optimization',
      'Equipment failure prediction',
      'Customer preference learning'
    ]
  },
  {
    id: 'construction',
    name: 'Construction',
    icon: '🏗️',
    color: 'orange',
    metrics: [
      { label: 'Project Efficiency', value: '67%', trend: 22 },
      { label: 'Safety Score', value: '98%', trend: 5 },
      { label: 'Cost Reduction', value: '$2.4M', trend: 18 },
      { label: 'Timeline Accuracy', value: '91%', trend: 13 }
    ],
    features: [
      'Resource allocation optimization',
      'Safety risk prediction',
      'Material demand forecasting',
      'Progress tracking automation'
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: '🏥',
    color: 'emerald',
    metrics: [
      { label: 'Patient Outcomes', value: '89%', trend: 14 },
      { label: 'Wait Time Reduction', value: '52%', trend: -31 },
      { label: 'Staff Efficiency', value: '76%', trend: 19 },
      { label: 'Cost Savings', value: '$890K', trend: 27 }
    ],
    features: [
      'Patient flow optimization',
      'Treatment outcome prediction',
      'Staff scheduling automation',
      'Supply chain intelligence'
    ]
  },
  {
    id: 'legal',
    name: 'Legal Services',
    icon: '⚖️',
    color: 'violet',
    metrics: [
      { label: 'Case Win Rate', value: '84%', trend: 9 },
      { label: 'Research Efficiency', value: '91%', trend: 33 },
      { label: 'Client Satisfaction', value: '96%', trend: 7 },
      { label: 'Billable Hours', value: '+28%', trend: 28 }
    ],
    features: [
      'Case outcome prediction',
      'Document analysis automation',
      'Client communication intelligence',
      'Legal research acceleration'
    ]
  }
]

export default function DemoPage() {
  const [selectedIndustry, setSelectedIndustry] = useState(industries[0])
  const [chatMessages] = useState([
    { type: 'ai', message: 'Hello! I\'m your AI business intelligence assistant. What would you like to know about your operations?' }
  ])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <section className="py-16 border-b border-gray-800">
        <div className="container-fluid">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="heading-section gradient-text-ai mb-6">
              Experience CoreFlow360 Intelligence
            </h1>
            <p className="text-body-large text-gray-400 max-w-3xl mx-auto">
              See how AI transforms your industry with real-time intelligence, predictive analytics, and autonomous decision-making.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Industry Toggle System */}
      <section className="py-12">
        <div className="container-fluid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-8">Select Your Industry</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {industries.map((industry) => (
                <motion.button
                  key={industry.id}
                  onClick={() => setSelectedIndustry(industry)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative group px-8 py-4 rounded-2xl border-2 transition-all duration-300
                    ${selectedIndustry.id === industry.id 
                      ? 'border-violet-500 bg-violet-500/10' 
                      : 'border-gray-700 hover:border-gray-600'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{industry.icon}</span>
                    <span className="font-semibold">{industry.name}</span>
                  </div>
                  
                  {selectedIndustry.id === industry.id && (
                    <motion.div
                      layoutId="selected-industry"
                      className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-2xl blur-sm"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Demonstrations */}
      <section className="py-16">
        <div className="container-fluid">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* AI Chat Demo */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="glass-card p-6 h-[600px] flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">AI Business Intelligence</h3>
                    <p className="text-gray-400 text-sm">Ask anything about your {selectedIndustry.name.toLowerCase()} operations</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  <AnimatePresence>
                    {chatMessages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`
                          max-w-xs px-4 py-3 rounded-2xl
                          ${msg.type === 'user' 
                            ? 'bg-violet-600 text-white' 
                            : 'bg-gray-800 text-gray-100'
                          }
                        `}>
                          {msg.message}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Ask about ${selectedIndustry.name.toLowerCase()} operations...`}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
                  />
                  <GlowingButton size="md">
                    <ArrowRight className="w-4 h-4" />
                  </GlowingButton>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Try asking: &quot;What&apos;s my {selectedIndustry.name.toLowerCase()} performance this month?&quot;
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Real-time Analytics Dashboard */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="glass-card p-6 h-[600px]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Predictive Analytics</h3>
                    <p className="text-gray-400 text-sm">Real-time insights for {selectedIndustry.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {selectedIndustry.metrics.map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <MetricCard
                        value={metric.value}
                        label={metric.label}
                        trend={metric.trend}
                        size="sm"
                        gradient={selectedIndustry.color}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* AI Insights */}
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-violet-400" />
                    AI Insights
                  </h4>
                  <div className="space-y-2">
                    {selectedIndustry.features.map((feature, index) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" />
                        <span className="text-gray-300">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Live Activity Indicator */}
                <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400">
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span className="text-xs">Live AI Processing</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <ROICalculatorSection selectedIndustry={selectedIndustry} />

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-violet-950/30 to-cyan-950/30">
        <div className="container-fluid text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="heading-section text-white mb-6">
              Ready to Transform Your <span className="gradient-text-ai">{selectedIndustry.name}</span>?
            </h2>
            <p className="text-body-large text-gray-300 mb-12 max-w-2xl mx-auto">
              See how CoreFlow360 can revolutionize your operations with AI-powered intelligence.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <GlowingButton href="/auth/signup" size="xl">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </GlowingButton>
              
              <GlowingButton href="/contact" size="xl" variant="outline">
                Schedule Demo
                <Sparkles className="ml-2 h-5 w-5" />
              </GlowingButton>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

// ROI Calculator Component
function ROICalculatorSection({ selectedIndustry }: { selectedIndustry: Industry }) {
  const [annualRevenue, setAnnualRevenue] = useState(1000000)
  const [employees, setEmployees] = useState(25)

  const calculateROI = () => {
    const baseEfficiencyGain = 0.15 // 15% efficiency gain
    const costSaving = annualRevenue * baseEfficiencyGain
    const productivityGain = employees * 50000 * 0.12 // 12% productivity gain per employee
    const totalSavings = costSaving + productivityGain
    const coreflowCost = Math.max(5988, employees * 200) // $499/month minimum
    const netROI = totalSavings - coreflowCost
    
    return {
      costSaving: Math.round(costSaving),
      productivityGain: Math.round(productivityGain),
      totalSavings: Math.round(totalSavings),
      coreflowCost: Math.round(coreflowCost),
      netROI: Math.round(netROI),
      roiPercentage: Math.round((netROI / coreflowCost) * 100)
    }
  }

  const roi = calculateROI()

  return (
    <section className="py-24 bg-gray-950">
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="heading-section text-white mb-6">
            Calculate Your <span className="gradient-text-ai">ROI</span>
          </h2>
          <p className="text-body-large text-gray-400 max-w-2xl mx-auto">
            See how much CoreFlow360 can save your {selectedIndustry.name.toLowerCase()} business in the first year.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Input Controls */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card p-8"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Your Business Details</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Annual Revenue
                  </label>
                  <input
                    type="range"
                    min="100000"
                    max="50000000"
                    step="100000"
                    value={annualRevenue}
                    onChange={(e) => setAnnualRevenue(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>$100K</span>
                    <span className="font-semibold text-white">
                      ${(annualRevenue / 1000000).toFixed(1)}M
                    </span>
                    <span>$50M</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Employees
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="500"
                    step="5"
                    value={employees}
                    onChange={(e) => setEmployees(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>5</span>
                    <span className="font-semibold text-white">{employees}</span>
                    <span>500+</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ROI Results */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card p-8"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Your ROI Projection</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text-ai mb-1">
                      ${(roi.totalSavings / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-400">Total Savings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text-ai mb-1">
                      {roi.roiPercentage}%
                    </div>
                    <div className="text-sm text-gray-400">ROI</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cost Savings:</span>
                    <span className="text-emerald-400 font-semibold">+${(roi.costSaving / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Productivity Gain:</span>
                    <span className="text-emerald-400 font-semibold">+${(roi.productivityGain / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">CoreFlow360 Cost:</span>
                    <span className="text-red-400 font-semibold">-${(roi.coreflowCost / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-white">Net Benefit:</span>
                      <span className="gradient-text-ai">${(roi.netROI / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
