'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Zap,
  TrendingUp,
  Network,
  Activity,
  Sparkles,
  Globe,
  Shield,
  BarChart3,
  Users,
} from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
  color: string
  consciousnessLevel: number
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  consciousnessLevel,
}) => {
  return (
    <motion.div
      className={`relative rounded-xl border bg-black/50 p-6 backdrop-blur-md ${color} group overflow-hidden`}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Background consciousness effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br opacity-10 ${color.replace('border-', 'from-')} to-transparent`}
      />

      {/* Animated particles */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute h-1 w-1 rounded-full ${color.replace('border-', 'bg-')}`}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: [0, Math.random() * 200 - 100],
              y: [0, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              delay: i * 0.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="mb-4 flex items-start justify-between">
          <div
            className={`rounded-lg p-3 ${color.replace('border-', 'bg-').replace(/(\d+)/, '$1/20')}`}
          >
            {icon}
          </div>
          <div className={`text-sm font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}
            {change}%
          </div>
        </div>

        <h3 className="mb-1 text-sm text-gray-400">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>

        {/* Consciousness indicator */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
            <span>Consciousness</span>
            <span>{consciousnessLevel}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-gray-800">
            <motion.div
              className={`h-full ${color.replace('border-', 'bg-')}`}
              initial={{ width: 0 }}
              animate={{ width: `${consciousnessLevel}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface ConsciousnessPhase {
  name: string
  level: number
  color: string
  description: string
}

const ConsciousnessMeter: React.FC<{ level: number }> = ({ level }) => {
  const phases: ConsciousnessPhase[] = [
    {
      name: 'Neural',
      level: 25,
      color: 'from-blue-600 to-blue-400',
      description: 'Basic automation',
    },
    {
      name: 'Synaptic',
      level: 50,
      color: 'from-purple-600 to-purple-400',
      description: 'Cross-module intelligence',
    },
    {
      name: 'Autonomous',
      level: 75,
      color: 'from-amber-600 to-amber-400',
      description: 'Self-managing systems',
    },
    {
      name: 'Transcendent',
      level: 100,
      color: 'from-white via-purple-200 to-blue-200',
      description: 'Full consciousness',
    },
  ]

  const currentPhase = phases.find((p) => level <= p.level) || phases[3]

  return (
    <div className="relative">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl font-bold text-white">Business Consciousness Level</h2>
        <p className="text-gray-400">{currentPhase.description}</p>
      </div>

      <div className="relative mx-auto h-64 w-64">
        {/* Background circle */}
        <svg className="absolute inset-0 h-full w-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-800"
          />
        </svg>

        {/* Progress circle */}
        <svg className="absolute inset-0 h-full w-full -rotate-90">
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: level / 100 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            style={{ strokeDasharray: 754, strokeDashoffset: 0 }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className="mb-2 text-5xl font-bold text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            {level}%
          </motion.div>
          <div
            className={`bg-gradient-to-r text-lg font-medium ${currentPhase.color} bg-clip-text text-transparent`}
          >
            {currentPhase.name}
          </div>
        </div>

        {/* Orbiting particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="bg-consciousness-synaptic absolute h-2 w-2 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              marginTop: -4,
              marginLeft: -4,
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 10 + i * 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <div
              className="bg-consciousness-synaptic animate-consciousness-pulse h-2 w-2 rounded-full"
              style={{ transform: `translateX(${120}px)` }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const AIEvolutionTree: React.FC = () => {
  const modules = [
    { name: 'CRM', connections: 3, active: true },
    { name: 'Finance', connections: 5, active: true },
    { name: 'HR', connections: 2, active: true },
    { name: 'Operations', connections: 4, active: false },
    { name: 'Analytics', connections: 6, active: true },
    { name: 'Marketing', connections: 3, active: false },
    { name: 'Legal', connections: 2, active: false },
    { name: 'Supply Chain', connections: 4, active: true },
  ]

  return (
    <div className="border-consciousness-neural/30 rounded-xl border bg-black/50 p-6 backdrop-blur-md">
      <h3 className="mb-6 text-xl font-bold text-white">AI Evolution Tree</h3>

      <div className="relative h-96">
        {/* Central node */}
        <div className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="from-consciousness-neural to-consciousness-synaptic flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br"
            animate={{
              boxShadow: [
                '0 0 20px rgba(124, 58, 237, 0.5)',
                '0 0 40px rgba(124, 58, 237, 0.8)',
                '0 0 20px rgba(124, 58, 237, 0.5)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Brain className="h-10 w-10 text-white" />
          </motion.div>
        </div>

        {/* Module nodes */}
        {modules.map((module, index) => {
          const angle = (index / modules.length) * 2 * Math.PI
          const x = Math.cos(angle) * 150 + 192 // center at 192px (half of 384px)
          const y = Math.sin(angle) * 150 + 192

          return (
            <div key={module.name}>
              {/* Connection lines */}
              <svg className="absolute inset-0 h-full w-full">
                <motion.line
                  x1="192"
                  y1="192"
                  x2={x}
                  y2={y}
                  stroke={module.active ? '#7c3aed' : '#374151'}
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: module.active ? 1 : 0.3 }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </svg>

              {/* Module node */}
              <motion.div
                className={`absolute flex h-16 w-16 items-center justify-center rounded-full text-xs font-medium ${
                  module.active
                    ? 'bg-consciousness-synaptic/20 border-consciousness-synaptic border-2 text-white'
                    : 'border-2 border-gray-700 bg-gray-800 text-gray-400'
                }`}
                style={{ left: x - 32, top: y - 32 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, type: 'spring' }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="text-center">
                  <div>{module.name}</div>
                  <div className="text-xs opacity-60">{module.connections}</div>
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const PredictiveInsights: React.FC = () => {
  const insights = [
    {
      title: 'Revenue Growth Trajectory',
      prediction: '+34% in Q2',
      confidence: 89,
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      title: 'Customer Churn Risk',
      prediction: '2.3% reduction',
      confidence: 92,
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Operational Efficiency',
      prediction: '18% improvement',
      confidence: 87,
      icon: <Activity className="h-5 w-5" />,
    },
    {
      title: 'Market Expansion',
      prediction: '3 new segments',
      confidence: 78,
      icon: <Globe className="h-5 w-5" />,
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="mb-4 text-xl font-bold text-white">Predictive Intelligence</h3>

      {insights.map((insight, index) => (
        <motion.div
          key={insight.title}
          className="border-consciousness-neural/20 rounded-lg border bg-black/30 p-4 backdrop-blur-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-start gap-3">
            <div className="bg-consciousness-neural/20 text-consciousness-neural rounded-lg p-2">
              {insight.icon}
            </div>
            <div className="flex-1">
              <h4 className="mb-1 text-sm font-medium text-white">{insight.title}</h4>
              <p className="text-consciousness-neural text-lg font-bold">{insight.prediction}</p>

              <div className="mt-2">
                <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
                  <span>AI Confidence</span>
                  <span>{insight.confidence}%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-gray-800">
                  <motion.div
                    className="from-consciousness-neural to-consciousness-synaptic h-full bg-gradient-to-r"
                    initial={{ width: 0 }}
                    animate={{ width: `${insight.confidence}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default function QuantumEvolutionDashboard() {
  const [consciousnessLevel, setConsciousnessLevel] = useState(0)
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')

  useEffect(() => {
    // Simulate consciousness level animation
    const timer = setTimeout(() => {
      setConsciousnessLevel(68)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const metrics = [
    {
      title: 'Active AI Agents',
      value: '24',
      change: 12,
      icon: <Brain className="h-5 w-5 text-white" />,
      color: 'border-consciousness-neural/50',
      consciousnessLevel: 85,
    },
    {
      title: 'Process Automation',
      value: '87%',
      change: 8,
      icon: <Zap className="h-5 w-5 text-white" />,
      color: 'border-consciousness-synaptic/50',
      consciousnessLevel: 92,
    },
    {
      title: 'Intelligence Score',
      value: '9.2',
      change: 15,
      icon: <Sparkles className="h-5 w-5 text-white" />,
      color: 'border-consciousness-autonomous/50',
      consciousnessLevel: 78,
    },
    {
      title: 'System Health',
      value: '98%',
      change: 2,
      icon: <Shield className="h-5 w-5 text-white" />,
      color: 'border-green-500/50',
      consciousnessLevel: 95,
    },
  ]

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white">Quantum Evolution Dashboard</h1>
          <p className="text-gray-400">
            Monitor your business consciousness evolution in real-time
          </p>
        </div>

        {/* Time range selector */}
        <div className="mb-8 flex gap-2">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                selectedTimeRange === range
                  ? 'bg-consciousness-synaptic text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left column - Metrics */}
          <div className="space-y-6 lg:col-span-2">
            {/* Metric cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {metrics.map((metric) => (
                <MetricCard key={metric.title} {...metric} />
              ))}
            </div>

            {/* AI Evolution Tree */}
            <AIEvolutionTree />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Consciousness Meter */}
            <div className="border-consciousness-synaptic/30 rounded-xl border bg-black/50 p-6 backdrop-blur-md">
              <ConsciousnessMeter level={consciousnessLevel} />
            </div>

            {/* Predictive Insights */}
            <div className="border-consciousness-neural/30 rounded-xl border bg-black/50 p-6 backdrop-blur-md">
              <PredictiveInsights />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
