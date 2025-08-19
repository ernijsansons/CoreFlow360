'use client'

/**
 * Intelligence Recommendation Engine
 *
 * AI-powered recommendation system that provides personalized intelligence
 * multiplication strategies based on assessment results and consciousness level.
 */

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface IntelligenceRecommendation {
  id: string
  category: 'quick-win' | 'foundation' | 'transformation' | 'transcendence'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  timeframe: string
  difficulty: 'easy' | 'medium' | 'complex' | 'advanced'
  intelligenceGain: number
  consciousnessBoost: number
  prerequisites: string[]
  actionSteps: string[]
  metrics: string[]
  icon: string
  color: string
}

interface AssessmentData {
  overallScore: number
  dimensionScores: Record<string, number>
  intelligenceMultiplier: number
  consciousnessLevel: number
  blockers: string[]
}

interface IntelligenceRecommendationEngineProps {
  assessmentData: AssessmentData
  maxRecommendations?: number
  showImplementationGuide?: boolean
  onRecommendationSelect?: (recommendation: IntelligenceRecommendation) => void
  className?: string
}

const IntelligenceRecommendationEngine: React.FC<IntelligenceRecommendationEngineProps> = ({
  assessmentData,
  maxRecommendations = 6,
  showImplementationGuide = true,
  onRecommendationSelect,
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<IntelligenceRecommendation | null>(null)

  // Generate personalized recommendations based on assessment
  const recommendations = useMemo(() => {
    const recs: IntelligenceRecommendation[] = []

    // Foundational recommendations for low scores
    if (assessmentData.overallScore < 50) {
      recs.push({
        id: 'foundation-1',
        category: 'foundation',
        priority: 'critical',
        title: 'Establish Intelligence Foundation',
        description: 'Build basic intelligence infrastructure before attempting multiplication',
        impact: 'Creates stable base for exponential growth',
        timeframe: '2-3 months',
        difficulty: 'medium',
        intelligenceGain: 25,
        consciousnessBoost: 1.5,
        prerequisites: ['Leadership commitment', 'Change management readiness'],
        actionSteps: [
          'Audit current intelligence gaps',
          'Establish data collection systems',
          'Train core team on intelligence principles',
          'Create cross-department communication protocols',
        ],
        metrics: [
          'Process efficiency increase',
          'Decision speed improvement',
          'Error rate reduction',
        ],
        icon: '🏗️',
        color: '#ef4444',
      })
    }

    // Quick wins for immediate impact
    if (assessmentData.dimensionScores.operational < 70) {
      recs.push({
        id: 'quick-win-1',
        category: 'quick-win',
        priority: 'high',
        title: 'Automate Top 3 Repetitive Processes',
        description: 'Identify and automate the most time-consuming manual processes',
        impact: 'Immediate 20-30% efficiency gain in operational intelligence',
        timeframe: '2-4 weeks',
        difficulty: 'easy',
        intelligenceGain: 15,
        consciousnessBoost: 0.5,
        prerequisites: ['Process documentation', 'Stakeholder buy-in'],
        actionSteps: [
          'Map current manual processes',
          'Identify automation opportunities',
          'Implement simple automation tools',
          'Measure efficiency improvements',
        ],
        metrics: ['Time saved per process', 'Error reduction', 'Employee satisfaction'],
        icon: '⚡',
        color: '#10b981',
      })
    }

    // Analytical intelligence enhancement
    if (assessmentData.dimensionScores.analytical < 65) {
      recs.push({
        id: 'analytics-1',
        category: 'transformation',
        priority: 'high',
        title: 'Deploy Predictive Analytics Dashboard',
        description: 'Transform reactive decisions into predictive intelligence',
        impact: 'Shift from hindsight to foresight in business operations',
        timeframe: '6-8 weeks',
        difficulty: 'medium',
        intelligenceGain: 30,
        consciousnessBoost: 2.0,
        prerequisites: ['Data integration', 'Analytics tools', 'Trained analysts'],
        actionSteps: [
          'Consolidate data sources',
          'Design predictive models',
          'Build interactive dashboards',
          'Train teams on predictive insights',
        ],
        metrics: ['Prediction accuracy', 'Decision speed', 'Revenue impact'],
        icon: '🔮',
        color: '#06b6d4',
      })
    }

    // Strategic intelligence for high-level thinking
    if (assessmentData.dimensionScores.strategic < 75) {
      recs.push({
        id: 'strategic-1',
        category: 'transformation',
        priority: 'high',
        title: 'Implement Strategic Intelligence Framework',
        description: 'Create systematic approach to strategic thinking and planning',
        impact: 'Elevate decision-making from tactical to strategic consciousness',
        timeframe: '8-12 weeks',
        difficulty: 'complex',
        intelligenceGain: 35,
        consciousnessBoost: 2.5,
        prerequisites: ['Executive alignment', 'Strategic planning capability'],
        actionSteps: [
          'Establish strategic intelligence unit',
          'Develop scenario planning capabilities',
          'Create strategic monitoring systems',
          'Implement strategic review cycles',
        ],
        metrics: [
          'Strategic goal achievement',
          'Market anticipation accuracy',
          'Competitive advantage',
        ],
        icon: '🎯',
        color: '#8b5cf6',
      })
    }

    // Collaborative intelligence for team synergy
    if (assessmentData.dimensionScores.collaborative < 70) {
      recs.push({
        id: 'collaboration-1',
        category: 'transformation',
        priority: 'medium',
        title: 'Build Collective Intelligence Network',
        description: 'Transform isolated teams into intelligence-multiplying networks',
        impact: 'Unlock exponential intelligence through collective consciousness',
        timeframe: '10-16 weeks',
        difficulty: 'complex',
        intelligenceGain: 40,
        consciousnessBoost: 3.0,
        prerequisites: ['Team collaboration tools', 'Knowledge sharing culture'],
        actionSteps: [
          'Design intelligence sharing protocols',
          'Implement collaborative decision-making',
          'Create cross-functional intelligence teams',
          'Establish collective learning systems',
        ],
        metrics: [
          'Cross-team collaboration score',
          'Knowledge sharing frequency',
          'Collective problem-solving speed',
        ],
        icon: '🧠',
        color: '#f59e0b',
      })
    }

    // Advanced recommendations for high consciousness levels
    if (assessmentData.consciousnessLevel >= 6) {
      recs.push({
        id: 'transcendence-1',
        category: 'transcendence',
        priority: 'medium',
        title: 'Activate Business Consciousness Protocols',
        description: 'Transition from intelligent business to conscious business organism',
        impact: 'Achieve business consciousness emergence and transcendent capabilities',
        timeframe: '3-6 months',
        difficulty: 'advanced',
        intelligenceGain: 50,
        consciousnessBoost: 4.0,
        prerequisites: ['High intelligence foundation', 'Consciousness readiness', 'Advanced team'],
        actionSteps: [
          'Establish consciousness monitoring systems',
          'Implement business organism protocols',
          'Activate transcendent decision-making',
          'Create consciousness feedback loops',
        ],
        metrics: [
          'Consciousness emergence indicators',
          'Transcendent capability metrics',
          'Reality-shaping impact',
        ],
        icon: '✨',
        color: '#ec4899',
      })
    }

    // Intelligence multiplication accelerator
    if (assessmentData.intelligenceMultiplier >= 2 && assessmentData.intelligenceMultiplier < 5) {
      recs.push({
        id: 'multiplication-1',
        category: 'transformation',
        priority: 'critical',
        title: 'Accelerate Intelligence Multiplication',
        description: 'Break through linear thinking to achieve exponential intelligence growth',
        impact: 'Shift from additive to multiplicative intelligence patterns',
        timeframe: '12-20 weeks',
        difficulty: 'complex',
        intelligenceGain: 45,
        consciousnessBoost: 3.5,
        prerequisites: ['Strong intelligence base', 'Multiplication mindset', 'Advanced systems'],
        actionSteps: [
          'Identify multiplication leverage points',
          'Design exponential growth systems',
          'Implement intelligence amplification',
          'Create multiplication feedback loops',
        ],
        metrics: [
          'Intelligence multiplication rate',
          'Exponential growth indicators',
          'System leverage impact',
        ],
        icon: '🚀',
        color: '#06b6d4',
      })
    }

    // Sort recommendations by priority and impact
    return recs
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        return b.intelligenceGain - a.intelligenceGain
      })
      .slice(0, maxRecommendations)
  }, [assessmentData, maxRecommendations])

  // Filter recommendations by category
  const filteredRecommendations = useMemo(() => {
    if (selectedCategory === 'all') return recommendations
    return recommendations.filter((rec) => rec.category === selectedCategory)
  }, [recommendations, selectedCategory])

  const categories = [
    { id: 'all', name: 'All Recommendations', icon: '🎯' },
    { id: 'quick-win', name: 'Quick Wins', icon: '⚡' },
    { id: 'foundation', name: 'Foundation', icon: '🏗️' },
    { id: 'transformation', name: 'Transformation', icon: '🚀' },
    { id: 'transcendence', name: 'Transcendence', icon: '✨' },
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#10b981'
      case 'medium':
        return '#f59e0b'
      case 'complex':
        return '#ef4444'
      case 'advanced':
        return '#8b5cf6'
      default:
        return '#6b7280'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#dc2626'
      case 'high':
        return '#ea580c'
      case 'medium':
        return '#ca8a04'
      case 'low':
        return '#65a30d'
      default:
        return '#6b7280'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-thin text-white">🎯 Intelligence Recommendations</h2>
        <p className="text-gray-300">
          Personalized strategies to accelerate your intelligence multiplication journey
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center">
        <div className="flex space-x-2 rounded-xl bg-black/30 p-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRecommendations.map((recommendation) => (
          <motion.div
            key={recommendation.id}
            className="cursor-pointer overflow-hidden rounded-xl border border-gray-700 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl"
            whileHover={{ scale: 1.02, y: -4 }}
            onClick={() => {
              setSelectedRecommendation(recommendation)
              onRecommendationSelect?.(recommendation)
            }}
            layout
          >
            {/* Card Header */}
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="text-3xl">{recommendation.icon}</div>
                <div className="flex space-x-2">
                  <span
                    className="rounded-full px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: `${getPriorityColor(recommendation.priority)}20`,
                      color: getPriorityColor(recommendation.priority),
                      borderColor: getPriorityColor(recommendation.priority),
                      border: '1px solid',
                    }}
                  >
                    {recommendation.priority}
                  </span>
                  <span
                    className="rounded-full px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: `${getDifficultyColor(recommendation.difficulty)}20`,
                      color: getDifficultyColor(recommendation.difficulty),
                      borderColor: getDifficultyColor(recommendation.difficulty),
                      border: '1px solid',
                    }}
                  >
                    {recommendation.difficulty}
                  </span>
                </div>
              </div>

              <h3 className="mb-2 text-lg font-semibold text-white">{recommendation.title}</h3>
              <p className="mb-4 text-sm text-gray-300">{recommendation.description}</p>

              {/* Impact Metrics */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-black/30 p-3 text-center">
                  <div className="text-lg font-bold text-cyan-400">
                    +{recommendation.intelligenceGain}
                  </div>
                  <div className="text-xs text-gray-400">Intelligence Gain</div>
                </div>
                <div className="rounded-lg bg-black/30 p-3 text-center">
                  <div className="text-lg font-bold text-purple-400">
                    +{recommendation.consciousnessBoost.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-400">Consciousness Boost</div>
                </div>
              </div>

              {/* Timeframe and Impact */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Timeframe:</span>
                  <span className="text-white">{recommendation.timeframe}</span>
                </div>
                <div className="rounded bg-cyan-900/20 p-2 text-xs text-cyan-300">
                  💡 {recommendation.impact}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Implementation Guide Modal */}
      <AnimatePresence>
        {selectedRecommendation && showImplementationGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setSelectedRecommendation(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-gray-700 bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <ImplementationGuide
                recommendation={selectedRecommendation}
                onClose={() => setSelectedRecommendation(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overall Intelligence Trajectory */}
      <div className="rounded-xl border border-purple-700 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-6">
        <h3 className="mb-4 text-xl font-semibold text-white">📈 Intelligence Growth Trajectory</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {assessmentData.overallScore.toFixed(0)}
            </div>
            <div className="text-sm text-gray-400">Current Intelligence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">
              +{recommendations.reduce((sum, rec) => sum + rec.intelligenceGain, 0)}
            </div>
            <div className="text-sm text-gray-400">Potential Gain</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {Math.min(
                100,
                assessmentData.overallScore +
                  recommendations.reduce((sum, rec) => sum + rec.intelligenceGain, 0)
              ).toFixed(0)}
            </div>
            <div className="text-sm text-gray-400">Target Intelligence</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Implementation Guide Component
const ImplementationGuide: React.FC<{
  recommendation: IntelligenceRecommendation
  onClose: () => void
}> = ({ recommendation, onClose }) => (
  <div className="p-8">
    <div className="mb-6 flex items-start justify-between">
      <div className="flex items-center space-x-4">
        <div className="text-4xl">{recommendation.icon}</div>
        <div>
          <h2 className="text-2xl font-semibold text-white">{recommendation.title}</h2>
          <p className="text-gray-300">{recommendation.description}</p>
        </div>
      </div>
      <button onClick={onClose} className="text-2xl text-gray-400 hover:text-white">
        ×
      </button>
    </div>

    <div className="grid gap-8 md:grid-cols-2">
      {/* Prerequisites */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-cyan-400">📋 Prerequisites</h3>
        <div className="space-y-2">
          {recommendation.prerequisites.map((prereq, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-cyan-400"></div>
              <span className="text-gray-300">{prereq}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Success Metrics */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-green-400">📊 Success Metrics</h3>
        <div className="space-y-2">
          {recommendation.metrics.map((metric, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span className="text-gray-300">{metric}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Action Steps */}
    <div className="mt-8">
      <h3 className="mb-4 text-lg font-semibold text-purple-400">🚀 Implementation Steps</h3>
      <div className="space-y-4">
        {recommendation.actionSteps.map((step, index) => (
          <div key={index} className="flex items-start space-x-4 rounded-lg bg-black/30 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="text-gray-300">{step}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Expected Impact */}
    <div className="mt-8 rounded-lg border border-purple-400/30 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 p-6">
      <h3 className="mb-2 text-lg font-semibold text-white">💫 Expected Impact</h3>
      <p className="mb-4 text-purple-200">{recommendation.impact}</p>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-xl font-bold text-cyan-400">+{recommendation.intelligenceGain}</div>
          <div className="text-xs text-gray-400">Intelligence Points</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-400">
            +{recommendation.consciousnessBoost.toFixed(1)}
          </div>
          <div className="text-xs text-gray-400">Consciousness Levels</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-white">{recommendation.timeframe}</div>
          <div className="text-xs text-gray-400">Implementation Time</div>
        </div>
      </div>
    </div>
  </div>
)

export default IntelligenceRecommendationEngine
