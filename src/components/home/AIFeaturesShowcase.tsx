'use client'

import { motion } from 'framer-motion'
import { Brain, Lightbulb, TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export function AIFeaturesShowcase() {
  const features = [
    {
      icon: Brain,
      title: 'AI Business Coach',
      description: 'Get personalized recommendations based on your business data and industry best practices.',
      color: 'from-blue-500 to-purple-500',
    },
    {
      icon: TrendingUp,
      title: 'Predictive Analytics',
      description: 'Forecast revenue, identify trends, and spot opportunities before your competition.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Lightbulb,
      title: 'Smart Insights',
      description: 'Daily actionable insights that help you make better business decisions.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Zap,
      title: 'Automated Workflows',
      description: 'AI-powered automation that handles repetitive tasks and optimizes processes.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Shield,
      title: 'Risk Detection',
      description: 'Identify at-risk customers and potential problems before they impact your business.',
      color: 'from-red-500 to-rose-500',
    },
    {
      icon: BarChart3,
      title: 'Performance Optimization',
      description: 'AI continuously analyzes and suggests improvements to maximize efficiency.',
      color: 'from-cyan-500 to-blue-500',
    },
  ]

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Brain className="h-6 w-6 text-blue-400" />
            <span className="text-blue-400 font-semibold">AI-POWERED INTELLIGENCE</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Business Intelligence That Works For You
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Our AI doesn't just analyze data—it learns your business and provides actionable insights that drive real results.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-xl"
                style={{
                  background: `linear-gradient(135deg, ${feature.color.split(' ')[1]}, ${feature.color.split(' ')[3]})`
                }}
              />
              <div className="relative bg-gray-900/90 border border-gray-800 group-hover:border-gray-700 rounded-xl p-6 transition-all">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-blue-500/30"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">See AI Business Intelligence in Action</h3>
              <p className="text-gray-400">
                Watch how our AI helps businesses save 12+ hours per week on analysis and decision-making.
              </p>
              <div className="flex items-center gap-6 mt-4">
                <div>
                  <div className="text-2xl font-bold text-blue-400">2,847</div>
                  <div className="text-sm text-gray-500">Insights Generated Daily</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">92%</div>
                  <div className="text-sm text-gray-500">Accuracy Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">12hrs</div>
                  <div className="text-sm text-gray-500">Saved Weekly</div>
                </div>
              </div>
            </div>
            
            <Link
              href="/ai"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              <Brain className="h-5 w-5" />
              Explore AI Features
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}