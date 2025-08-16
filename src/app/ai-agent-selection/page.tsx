'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Users, 
  BarChart3, 
  Cog,
  Crown,
  ArrowRight,
  Check
} from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'

interface AIAgent {
  id: string
  name: string
  role: string
  description: string
  icon: any
  gradient: string
  capabilities: string[]
  monthlyValue: string
  perfectFor: string[]
  realStory: {
    customer: string
    result: string
  }
}

const AI_AGENTS: AIAgent[] = [
  {
    id: 'sales',
    name: 'AI Sales Expert',
    role: 'Your Revenue Generator',
    description: 'Finds money you\'re leaving on the table and closes deals while you sleep',
    icon: DollarSign,
    gradient: 'from-emerald-500 to-green-500',
    capabilities: [
      'Predicts which deals will close this month',
      'Sets perfect prices for maximum profit',
      'Finds warm leads hiding in your data',
      'Automates follow-ups at perfect timing',
      'Calculates lifetime customer value'
    ],
    monthlyValue: '$25,000',
    perfectFor: [
      'Need more revenue fast',
      'Losing deals to competitors',
      'Manual sales tracking'
    ],
    realStory: {
      customer: 'Sarah Chen at CloudSync Pro',
      result: 'Found $247,000 in missed opportunities in first month'
    }
  },
  {
    id: 'crm',
    name: 'AI Customer Expert',
    role: 'Your Relationship Manager',
    description: 'Knows your customers better than they know themselves',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-500',
    capabilities: [
      'Warns you before customers leave',
      'Reads customer emotions and sentiment',
      'Personalizes every interaction',
      'Suggests perfect next steps',
      'Tracks all customer touchpoints'
    ],
    monthlyValue: '$18,000',
    perfectFor: [
      'Customers leaving unexpectedly',
      'Poor customer satisfaction',
      'Manual relationship tracking'
    ],
    realStory: {
      customer: 'Tom Rodriguez at Precision Parts',
      result: 'Prevented 89% of customer churn - saved $180K annual revenue'
    }
  },
  {
    id: 'finance',
    name: 'AI Money Detective',
    role: 'Your Financial Guardian',
    description: 'Finds hidden cash and prevents financial disasters before they happen',
    icon: Shield,
    gradient: 'from-violet-500 to-purple-500',
    capabilities: [
      'Predicts cash flow problems 60 days early',
      'Spots unusual expenses and fraud',
      'Cuts unnecessary costs automatically',
      'Ensures tax compliance',
      'Forecasts budgets with 91% accuracy'
    ],
    monthlyValue: '$22,000',
    perfectFor: [
      'Cash flow uncertainty',
      'Hidden expenses draining profit',
      'Manual bookkeeping chaos'
    ],
    realStory: {
      customer: 'Lisa Park at GrowthTech',
      result: 'Found $83,000 in hidden cash in one day'
    }
  },
  {
    id: 'operations',
    name: 'AI Operations Expert',
    role: 'Your Efficiency Engine',
    description: 'Makes everything run smoother, faster, and cheaper',
    icon: Cog,
    gradient: 'from-orange-500 to-red-500',
    capabilities: [
      'Optimizes resources automatically',
      'Predicts equipment failures',
      'Automates repetitive tasks',
      'Optimizes supply chain timing',
      'Monitors quality 24/7'
    ],
    monthlyValue: '$15,000',
    perfectFor: [
      'Things always breaking down',
      'Manual processes everywhere',
      'Resource waste and inefficiency'
    ],
    realStory: {
      customer: 'Mike Johnson at BuildRight',
      result: '47% faster project delivery, all under budget'
    }
  },
  {
    id: 'analytics',
    name: 'AI Crystal Ball',
    role: 'Your Future Predictor',
    description: 'Shows you the future of your business with scary accuracy',
    icon: BarChart3,
    gradient: 'from-cyan-500 to-blue-500',
    capabilities: [
      'Spots hidden patterns in your data',
      'Predicts trends before competitors',
      'Builds forecasting models',
      'Catches anomalies instantly',
      'Creates beautiful reports automatically'
    ],
    monthlyValue: '$20,000',
    perfectFor: [
      'Flying blind without data insights',
      'Competitors always ahead',
      'Manual reporting taking forever'
    ],
    realStory: {
      customer: 'Alex Thompson at Urban Threads',
      result: '91% forecast accuracy - perfect inventory every month'
    }
  },
  {
    id: 'hr',
    name: 'AI People Person',
    role: 'Your Talent Optimizer',
    description: 'Keeps your best people happy and finds amazing new ones',
    icon: Crown,
    gradient: 'from-pink-500 to-rose-500',
    capabilities: [
      'Matches perfect candidates to jobs',
      'Predicts top performers before hiring',
      'Prevents good people from leaving',
      'Sets fair compensation automatically',
      'Plans leadership succession'
    ],
    monthlyValue: '$30,000',
    perfectFor: [
      'Losing good employees',
      'Bad hiring decisions',
      'Manual HR processes'
    ],
    realStory: {
      customer: 'Rachel Kim at Kim & Associates',
      result: '95% employee retention - saved $200K in turnover costs'
    }
  }
]

export default function AIAgentSelection() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-full px-6 py-2 inline-block mb-8">
              <span className="text-emerald-400 font-semibold">✓ Forever Free • ✓ No Credit Card • ✓ Full Access</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Pick Your Free <span className="gradient-text-ai">AI Employee</span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Choose one AI agent to work for your business forever, completely free. 
              Each one is worth $15,000-$30,000 per month in value.
            </p>
            
            <div className="bg-yellow-950/20 border border-yellow-500/30 rounded-2xl p-6 max-w-2xl mx-auto">
              <div className="text-yellow-400 font-bold mb-2">⚡ Fair Warning</div>
              <div className="text-white">
                Once you see how much money one AI agent makes you, 
                you'll want all six. That's exactly what happens to 89% of our free users.
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Agent Grid */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AI_AGENTS.map((agent, index) => {
              const IconComponent = agent.icon
              const isSelected = selectedAgent === agent.id
              
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative group cursor-pointer ${isSelected ? 'ring-2 ring-emerald-500' : ''}`}
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${agent.gradient} opacity-0 group-hover:opacity-10 ${isSelected ? 'opacity-10' : ''} rounded-2xl blur-xl transition-all duration-500`} />
                  
                  <div className={`relative bg-gray-800/60 backdrop-blur-sm border ${isSelected ? 'border-emerald-500/60' : 'border-gray-700/50'} rounded-2xl p-6 group-hover:border-opacity-70 transition-all duration-300`}>
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute -top-3 -right-3 bg-emerald-500 rounded-full p-2">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    {/* Agent Header */}
                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${agent.gradient} rounded-full flex items-center justify-center`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">{agent.role}</p>
                      <p className="text-gray-300 text-sm">{agent.description}</p>
                    </div>

                    {/* Value Proposition */}
                    <div className="bg-gray-900/40 rounded-xl p-4 mb-6">
                      <div className="text-center">
                        <div className="text-emerald-400 font-bold text-lg">{agent.monthlyValue}/month value</div>
                        <div className="text-gray-400 text-xs">Cost to you: $0 forever</div>
                      </div>
                    </div>

                    {/* Capabilities */}
                    <div className="mb-6">
                      <div className="text-white font-semibold text-sm mb-3">What it does for you:</div>
                      <ul className="space-y-2">
                        {agent.capabilities.slice(0, 3).map((capability, idx) => (
                          <li key={idx} className="flex items-start text-gray-300 text-xs">
                            <div className={`w-1.5 h-1.5 bg-gradient-to-r ${agent.gradient} rounded-full mr-2 mt-1.5`}></div>
                            <span>{capability}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Perfect For */}
                    <div className="mb-6">
                      <div className="text-white font-semibold text-sm mb-3">Perfect if you have:</div>
                      <ul className="space-y-1">
                        {agent.perfectFor.map((item, idx) => (
                          <li key={idx} className="flex items-start text-gray-300 text-xs">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 mt-1.5"></div>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Real Story */}
                    <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-3 mb-4">
                      <div className="text-blue-400 font-semibold text-xs mb-1">Real Customer Result:</div>
                      <div className="text-white text-xs font-medium">"{agent.realStory.result}"</div>
                      <div className="text-gray-400 text-xs mt-1">- {agent.realStory.customer}</div>
                    </div>

                    {/* Selection Button */}
                    <button
                      className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedAgent(agent.id)}
                    >
                      {isSelected ? 'Selected' : 'Choose This Agent'}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {selectedAgent && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="py-16 bg-gradient-to-r from-emerald-950/50 to-green-950/50"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-2xl p-8 max-w-2xl mx-auto">
              <div className="text-2xl font-bold text-white mb-4">
                Perfect Choice! 🎉
              </div>
              
              <div className="text-gray-300 mb-6">
                You've selected the <span className="text-emerald-400 font-semibold">
                  {AI_AGENTS.find(a => a.id === selectedAgent)?.name}
                </span>.
                <br />
                This AI employee is now yours forever, completely free.
              </div>

              <div className="flex justify-center gap-4 mb-6">
                <div className="bg-emerald-800/30 rounded-xl p-4 text-center">
                  <div className="text-emerald-400 font-bold">Starts Working</div>
                  <div className="text-white text-sm">In 60 seconds</div>
                </div>
                <div className="bg-emerald-800/30 rounded-xl p-4 text-center">
                  <div className="text-emerald-400 font-bold">Monthly Value</div>
                  <div className="text-white text-sm">{AI_AGENTS.find(a => a.id === selectedAgent)?.monthlyValue}+</div>
                </div>
                <div className="bg-emerald-800/30 rounded-xl p-4 text-center">
                  <div className="text-emerald-400 font-bold">Your Cost</div>
                  <div className="text-white text-sm">$0 Forever</div>
                </div>
              </div>

              <GlowingButton 
                href={`/onboarding?agent=${selectedAgent}`}
                size="xl" 
                className="text-xl px-12 py-4"
              >
                Start Your AI Employee Now
                <ArrowRight className="ml-2 h-6 w-6" />
              </GlowingButton>

              <div className="text-xs text-gray-400 mt-4">
                No credit card • No setup fees • Cancel anytime • Keep all your data
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  )
}