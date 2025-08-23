'use client'

import { useState } from 'react'

const features = [
  {
    id: 'crm',
    title: 'Intelligent CRM',
    description: 'Customer relationships that evolve and optimize themselves',
    icon: '👥',
    color: 'violet'
  },
  {
    id: 'accounting',
    title: 'Autonomous Accounting', 
    description: 'Financial intelligence that predicts and prevents issues',
    icon: '💰',
    color: 'blue'
  },
  {
    id: 'hr',
    title: 'Smart HR Management',
    description: 'People operations that understand and adapt to your team',
    icon: '🧠',
    color: 'cyan'
  },
  {
    id: 'inventory',
    title: 'Predictive Inventory',
    description: 'Supply chain intelligence that anticipates demand',
    icon: '📦',
    color: 'green'
  },
  {
    id: 'projects',
    title: 'Project Intelligence',
    description: 'Task management that learns from your patterns',
    icon: '🎯',
    color: 'orange'
  },
  {
    id: 'analytics',
    title: 'Business Analytics',
    description: 'Insights that reveal hidden opportunities and risks',
    icon: '📊',
    color: 'purple'
  },
  {
    id: 'automation',
    title: 'Workflow Automation',
    description: 'Processes that improve themselves without human input',
    icon: '⚡',
    color: 'yellow'
  },
  {
    id: 'ai-assistant',
    title: 'AI Business Assistant',
    description: 'Your intelligent co-pilot for strategic decisions',
    icon: '🤖',
    color: 'red'
  }
]

const colorClasses = {
  violet: 'border-violet-500 bg-violet-500/10 text-violet-400',
  blue: 'border-blue-500 bg-blue-500/10 text-blue-400',
  cyan: 'border-cyan-500 bg-cyan-500/10 text-cyan-400',
  green: 'border-green-500 bg-green-500/10 text-green-400',
  orange: 'border-orange-500 bg-orange-500/10 text-orange-400',
  purple: 'border-purple-500 bg-purple-500/10 text-purple-400',
  yellow: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
  red: 'border-red-500 bg-red-500/10 text-red-400'
}

export default function Features() {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-black to-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            8 Modules, <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Infinite Intelligence</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Each module learns and adapts. Together, they create exponential intelligence that transforms your business into an autonomous organism.
          </p>
        </div>

        {/* Intelligence Multiplication Visual */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-4 text-2xl md:text-4xl font-bold">
            <span className="text-gray-400">Traditional:</span>
            <span className="text-white">1+1+1+1 = 4</span>
          </div>
          <div className="my-4 text-gray-500">vs</div>
          <div className="inline-flex items-center space-x-4 text-2xl md:text-4xl font-bold">
            <span className="text-gray-400">CoreFlow360:</span>
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">1×2×3×4×∞</span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`group relative p-6 rounded-2xl border-2 border-gray-800 bg-gray-900/50 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer ${
                hoveredFeature === feature.id ? colorClasses[feature.color as keyof typeof colorClasses] : ''
              }`}
              onMouseEnter={() => setHoveredFeature(feature.id)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              {/* Icon */}
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gray-100">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/0 to-cyan-500/0 group-hover:from-violet-500/10 group-hover:to-cyan-500/10 transition-all duration-300" />
            </div>
          ))}
        </div>

        {/* Integration Message */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 rounded-3xl bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              The More You Add, The Smarter It Gets
            </h3>
            <p className="text-gray-300 max-w-2xl">
              Each additional module doesn't just add functionality - it multiplies the intelligence of your entire system. This is how we achieve autonomous business operations.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}