'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Users,
  Wrench,
  Calculator,
  Shield,
  BarChart3,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { FeatureCard } from '@/components/ui/FeatureCard'
import { NeuralNetworkBackground } from '@/components/ui/NeuralNetworkBackground'

interface Department {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  description: string
  capabilities: Array<{
    name: string
    description: string
    aiPowered: boolean
    automationLevel: number
  }>
  metrics: Array<{
    label: string
    value: string
    improvement: string
  }>
}

const departments: Department[] = [
  {
    id: 'crm',
    name: 'Customer Relationship Management',
    icon: Users,
    color: 'violet',
    description:
      'AI-driven customer intelligence that predicts behavior, optimizes engagement, and maximizes lifetime value.',
    capabilities: [
      {
        name: 'Autonomous Lead Scoring',
        description:
          'AI continuously evaluates and ranks prospects based on 200+ behavioral signals',
        aiPowered: true,
        automationLevel: 95,
      },
      {
        name: 'Predictive Churn Analysis',
        description: 'Identifies at-risk customers 6 months before they leave',
        aiPowered: true,
        automationLevel: 88,
      },
      {
        name: 'Dynamic Pipeline Forecasting',
        description: 'Real-time revenue predictions with 94% accuracy',
        aiPowered: true,
        automationLevel: 92,
      },
      {
        name: 'Intelligent Communication Hub',
        description: 'AI-crafted personalized messages across all channels',
        aiPowered: true,
        automationLevel: 76,
      },
    ],
    metrics: [
      { label: 'Lead Conversion Rate', value: '+67%', improvement: 'vs traditional CRM' },
      { label: 'Customer Lifetime Value', value: '+134%', improvement: 'increase' },
      { label: 'Sales Velocity', value: '+89%', improvement: 'faster close rate' },
    ],
  },
  {
    id: 'accounting',
    name: 'Intelligent Accounting',
    icon: Calculator,
    color: 'blue',
    description:
      'Financial AI that thinks like a CFO, predicts cash flow, and detects anomalies in real-time.',
    capabilities: [
      {
        name: 'Real-time Fraud Detection',
        description: 'Identifies suspicious transactions within 0.001 seconds',
        aiPowered: true,
        automationLevel: 99,
      },
      {
        name: 'Automated Reconciliation',
        description: 'Bank reconciliation completed in seconds, not hours',
        aiPowered: true,
        automationLevel: 96,
      },
      {
        name: 'Predictive Cash Flow',
        description: '90-day cash flow predictions with scenario modeling',
        aiPowered: true,
        automationLevel: 87,
      },
      {
        name: 'Intelligent Invoicing',
        description: 'Dynamic payment terms optimization for faster collections',
        aiPowered: true,
        automationLevel: 84,
      },
    ],
    metrics: [
      { label: 'Processing Speed', value: '0.001s', improvement: 'vs 4-6 hours manual' },
      { label: 'Accuracy Rate', value: '99.97%', improvement: 'error reduction' },
      { label: 'Cash Flow Prediction', value: '94%', improvement: 'accuracy rate' },
    ],
  },
  {
    id: 'hr',
    name: 'Predictive Human Resources',
    icon: Brain,
    color: 'emerald',
    description:
      'HR AI that predicts performance, optimizes hiring, and prevents turnover before it happens.',
    capabilities: [
      {
        name: 'Retention Risk Analysis',
        description: 'Predicts which employees might leave 3-6 months in advance',
        aiPowered: true,
        automationLevel: 91,
      },
      {
        name: 'Performance Optimization',
        description: 'AI-driven performance improvement recommendations',
        aiPowered: true,
        automationLevel: 83,
      },
      {
        name: 'Intelligent Hiring',
        description: 'Resume screening and candidate ranking in seconds',
        aiPowered: true,
        automationLevel: 89,
      },
      {
        name: 'Workforce Planning',
        description: 'Demand forecasting for optimal staffing levels',
        aiPowered: true,
        automationLevel: 78,
      },
    ],
    metrics: [
      { label: 'Employee Retention', value: '+87%', improvement: 'improvement' },
      { label: 'Hiring Efficiency', value: '+156%', improvement: 'faster placements' },
      { label: 'Performance Gains', value: '+43%', improvement: 'productivity boost' },
    ],
  },
  {
    id: 'field-service',
    name: 'Smart Field Operations',
    icon: Wrench,
    color: 'orange',
    description:
      'Field service AI that optimizes routes, predicts equipment failures, and maximizes technician efficiency.',
    capabilities: [
      {
        name: 'Dynamic Route Optimization',
        description: 'Real-time route adjustments based on traffic, priority, and capacity',
        aiPowered: true,
        automationLevel: 94,
      },
      {
        name: 'Predictive Maintenance',
        description: 'Equipment failure prediction 2-4 weeks before breakdown',
        aiPowered: true,
        automationLevel: 86,
      },
      {
        name: 'Intelligent Scheduling',
        description: 'AI matches technician skills to job requirements automatically',
        aiPowered: true,
        automationLevel: 91,
      },
      {
        name: 'Parts Demand Forecasting',
        description: 'Inventory optimization preventing stockouts and overstock',
        aiPowered: true,
        automationLevel: 82,
      },
    ],
    metrics: [
      { label: 'Route Efficiency', value: '+43%', improvement: 'fuel & time savings' },
      { label: 'First-Call Resolution', value: '+68%', improvement: 'success rate' },
      { label: 'Equipment Uptime', value: '+91%', improvement: 'reliability' },
    ],
  },
  {
    id: 'analytics',
    name: 'Business Intelligence',
    icon: BarChart3,
    color: 'cyan',
    description:
      'Analytics AI that transforms data into actionable insights and predictive business intelligence.',
    capabilities: [
      {
        name: 'Predictive Analytics Engine',
        description: 'Machine learning models for trend analysis and forecasting',
        aiPowered: true,
        automationLevel: 97,
      },
      {
        name: 'Automated Reporting',
        description: 'Executive dashboards updated in real-time with insights',
        aiPowered: true,
        automationLevel: 93,
      },
      {
        name: 'Anomaly Detection',
        description: 'Identifies unusual patterns and business risks automatically',
        aiPowered: true,
        automationLevel: 89,
      },
      {
        name: 'Performance Optimization',
        description: 'AI-recommended actions to improve KPIs and metrics',
        aiPowered: true,
        automationLevel: 85,
      },
    ],
    metrics: [
      { label: 'Decision Speed', value: '+234%', improvement: 'faster insights' },
      { label: 'Accuracy Rate', value: '94%', improvement: 'prediction accuracy' },
      { label: 'ROI Tracking', value: '+67%', improvement: 'visibility' },
    ],
  },
  {
    id: 'security',
    name: 'Cyber Security',
    icon: Shield,
    color: 'pink',
    description:
      'Security AI that monitors, detects, and responds to threats faster than any human security team.',
    capabilities: [
      {
        name: 'Threat Detection',
        description: 'Real-time monitoring of all system access and anomalies',
        aiPowered: true,
        automationLevel: 98,
      },
      {
        name: 'Automated Response',
        description: 'Instant containment and mitigation of security incidents',
        aiPowered: true,
        automationLevel: 92,
      },
      {
        name: 'Compliance Monitoring',
        description: 'Continuous compliance checking across all regulations',
        aiPowered: true,
        automationLevel: 88,
      },
      {
        name: 'Risk Assessment',
        description: 'Dynamic security risk scoring and prioritization',
        aiPowered: true,
        automationLevel: 85,
      },
    ],
    metrics: [
      { label: 'Threat Response', value: '0.2s', improvement: 'detection time' },
      { label: 'Security Score', value: '99.9%', improvement: 'uptime protection' },
      { label: 'Compliance Rate', value: '100%', improvement: 'automated adherence' },
    ],
  },
]

export default function FeaturesPage() {
  const [selectedDepartment, setSelectedDepartment] = useState(departments[0])
  const [activeTab, setActiveTab] = useState<'capabilities' | 'metrics'>('capabilities')

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center">
        <NeuralNetworkBackground />

        <div className="container-fluid relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl text-center"
          >
            <h1 className="heading-hero gradient-text-ai mb-6">The Capability Matrix</h1>
            <p className="text-body-large mb-12 text-gray-300">
              Every department enhanced by AI. Every process optimized by intelligence. Every
              decision powered by predictive analytics. This is the future of business operations.
            </p>
            <GlowingButton href="#departments" size="xl">
              Explore AI Capabilities
              <ArrowRight className="ml-2 h-5 w-5" />
            </GlowingButton>
          </motion.div>
        </div>
      </section>

      {/* Department Grid Navigation */}
      <section id="departments" className="bg-gray-950 py-16">
        <div className="container-fluid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="heading-section mb-6 text-white">
              AI-Powered <span className="gradient-text-ai">Departments</span>
            </h2>
            <p className="text-body-large mx-auto max-w-3xl text-gray-400">
              Select any department to see how artificial intelligence transforms traditional
              business processes.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept, index) => (
              <motion.button
                key={dept.id}
                onClick={() => setSelectedDepartment(dept)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`group relative w-full text-left ${
                  selectedDepartment.id === dept.id ? 'ring-2 ring-violet-500' : ''
                } `}
              >
                <FeatureCard
                  icon={dept.icon}
                  title={dept.name}
                  description={dept.description}
                  gradient={dept.color}
                  className={selectedDepartment.id === dept.id ? 'border-violet-500' : ''}
                />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Department Deep Dive */}
      <section className="bg-black py-24">
        <div className="container-fluid">
          <motion.div
            key={selectedDepartment.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Department Header */}
            <div className="mb-16 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500"
              >
                <selectedDepartment.icon className="h-10 w-10 text-white" />
              </motion.div>
              <h2 className="heading-section mb-4 text-white">{selectedDepartment.name}</h2>
              <p className="text-body-large mx-auto max-w-2xl text-gray-400">
                {selectedDepartment.description}
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="mb-12 flex justify-center">
              <div className="rounded-xl bg-gray-900/50 p-1">
                <button
                  onClick={() => setActiveTab('capabilities')}
                  className={`rounded-lg px-6 py-3 font-medium transition-all duration-300 ${
                    activeTab === 'capabilities'
                      ? 'bg-violet-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  } `}
                >
                  AI Capabilities
                </button>
                <button
                  onClick={() => setActiveTab('metrics')}
                  className={`rounded-lg px-6 py-3 font-medium transition-all duration-300 ${
                    activeTab === 'metrics'
                      ? 'bg-violet-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  } `}
                >
                  Performance Metrics
                </button>
              </div>
            </div>

            {/* Content Sections */}
            <AnimatePresence mode="wait">
              {activeTab === 'capabilities' ? (
                <motion.div
                  key="capabilities"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="grid gap-6 md:grid-cols-2"
                >
                  {selectedDepartment.capabilities.map((capability, index) => (
                    <motion.div
                      key={capability.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="glass-card p-6"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <h3 className="mb-2 text-xl font-semibold text-white">
                            {capability.name}
                          </h3>
                          <div className="flex items-center gap-3">
                            {capability.aiPowered && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/20 px-2 py-1">
                                <Brain className="h-3 w-3 text-violet-400" />
                                <span className="text-xs text-violet-300">AI-Powered</span>
                              </span>
                            )}
                            <span className="text-sm text-gray-400">
                              {capability.automationLevel}% Automated
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="mb-4 text-gray-400">{capability.description}</p>

                      {/* Automation Level Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Automation Level</span>
                          <span className="font-medium text-violet-400">
                            {capability.automationLevel}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-800">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${capability.automationLevel}%` }}
                            transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                            className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="metrics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="grid gap-8 md:grid-cols-3"
                >
                  {selectedDepartment.metrics.map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className="glass-card p-8">
                        <div className="gradient-text-ai mb-2 text-4xl font-bold">
                          {metric.value}
                        </div>
                        <div className="mb-2 text-lg font-semibold text-white">{metric.label}</div>
                        <div className="text-sm text-gray-400">{metric.improvement}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-violet-950/30 to-cyan-950/30 py-24">
        <div className="container-fluid text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="heading-section mb-6 text-white">
              Ready to Activate <span className="gradient-text-ai">AI</span> in Your Business?
            </h2>
            <p className="text-body-large mx-auto mb-12 max-w-2xl text-gray-300">
              Experience the power of artificial intelligence across every department. Start your
              transformation today.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <GlowingButton href="/demo" size="xl">
                See AI in Action
                <Sparkles className="ml-2 h-5 w-5" />
              </GlowingButton>

              <GlowingButton href="/contact" size="xl" variant="outline">
                Schedule Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </GlowingButton>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
