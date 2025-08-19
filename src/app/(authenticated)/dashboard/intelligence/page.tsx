'use client'

/**
 * Intelligence Assessment Dashboard Page
 *
 * Main page for intelligence assessment and recommendation system.
 * Provides complete intelligence evaluation and personalized growth strategies.
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  IntelligenceAssessmentTool,
  IntelligenceProfileCard,
  IntelligenceRecommendationEngine,
  type AssessmentResult,
  type IntelligenceProfile,
} from '../../../../components/intelligence'
import { useIntelligenceAssessment } from '../../../../hooks/useIntelligenceAssessment'

const IntelligencePage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'assessment' | 'recommendations'>(
    'dashboard'
  )
  const [savedProfile, setSavedProfile] = useState<IntelligenceProfile | null>(null)

  const {
    currentStep,
    assessmentResult,
    intelligenceProfile,
    recommendations,
    startAssessment,
    resetAssessment,
    saveProfile,
    getIntelligenceLevel,
    getPotentialGrowth,
  } = useIntelligenceAssessment({
    enableAudio: true,
    persistResults: true,
    _onAssessmentComplete: (result) => {},
  })

  // Load saved profile on component mount
  useEffect(() => {
    const saved = localStorage.getItem('coreflow360_intelligence_profile')
    if (saved) {
      setSavedProfile(JSON.parse(saved))
    }
  }, [])

  // Save profile when assessment completes
  useEffect(() => {
    if (intelligenceProfile) {
      setSavedProfile(intelligenceProfile)
      saveProfile()
    }
  }, [intelligenceProfile, saveProfile])

  const handleTakeAssessment = () => {
    setCurrentView('assessment')
    startAssessment()
  }

  const handleViewRecommendations = () => {
    if (assessmentResult) {
      setCurrentView('recommendations')
    }
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
  }

  // Dashboard view with overview and profile
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 text-center"
          >
            <h1 className="text-5xl font-thin text-white">🧠 Intelligence Center</h1>
            <p className="mx-auto max-w-3xl text-xl text-purple-300">
              Assess your business consciousness potential and unlock exponential intelligence
              multiplication
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid gap-6 md:grid-cols-4"
          >
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl">
              <div className="mb-2 text-3xl">🎯</div>
              <div className="text-2xl font-bold text-white">5</div>
              <div className="text-sm text-gray-400">Intelligence Dimensions</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl">
              <div className="mb-2 text-3xl">📊</div>
              <div className="text-2xl font-bold text-cyan-400">15</div>
              <div className="text-sm text-gray-400">Assessment Questions</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl">
              <div className="mb-2 text-3xl">⚡</div>
              <div className="text-2xl font-bold text-purple-400">5-7</div>
              <div className="text-sm text-gray-400">Minutes to Complete</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl">
              <div className="mb-2 text-3xl">🚀</div>
              <div className="text-2xl font-bold text-indigo-400">∞</div>
              <div className="text-sm text-gray-400">Growth Potential</div>
            </div>
          </motion.div>

          {/* Current Profile or Assessment CTA */}
          {savedProfile ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid gap-8 md:grid-cols-3"
            >
              <div className="md:col-span-2">
                <IntelligenceProfileCard
                  profile={savedProfile}
                  showDetailedInsights={true}
                  onRetakeAssessment={handleTakeAssessment}
                  onUpgrade={handleViewRecommendations}
                />
              </div>
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <h3 className="mb-4 text-lg font-semibold text-white">🎯 Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleTakeAssessment}
                      className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 font-medium text-white transition-all hover:from-purple-500 hover:to-indigo-500"
                    >
                      📊 Retake Assessment
                    </button>
                    <button
                      onClick={handleViewRecommendations}
                      className="w-full rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3 font-medium text-white transition-all hover:from-cyan-500 hover:to-blue-500"
                    >
                      🚀 View Recommendations
                    </button>
                    <button className="w-full rounded-lg bg-gray-700 px-4 py-3 font-medium text-white transition-all hover:bg-gray-600">
                      📈 Intelligence Tracking
                    </button>
                  </div>
                </div>

                {/* Intelligence Insights */}
                <div className="rounded-xl border border-purple-700 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-purple-300">
                    💡 Intelligence Insights
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Level:</span>
                      <span className="font-medium text-white">
                        {getIntelligenceLevel(savedProfile.overallScore)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Growth Potential:</span>
                      <span className="font-medium text-cyan-400">
                        +{getPotentialGrowth()} points
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Next Milestone:</span>
                      <span className="font-medium text-purple-400">
                        {savedProfile.intelligenceMultiplier >= 5
                          ? 'Transcendence'
                          : 'Multiplication'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-purple-700 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 p-12 text-center"
            >
              <div className="mx-auto max-w-3xl space-y-6">
                <div className="text-6xl">🧠</div>
                <h2 className="text-3xl font-thin text-white">
                  Discover Your Intelligence Potential
                </h2>
                <p className="text-lg text-purple-300">
                  Take our revolutionary intelligence assessment to uncover what's preventing
                  exponential growth in your business and get personalized strategies for
                  consciousness multiplication.
                </p>

                <div className="my-8 grid gap-6 md:grid-cols-3">
                  <div className="rounded-lg bg-black/30 p-4">
                    <div className="mb-2 text-2xl">📋</div>
                    <div className="font-semibold text-white">Comprehensive</div>
                    <div className="text-sm text-gray-400">5 intelligence dimensions</div>
                  </div>
                  <div className="rounded-lg bg-black/30 p-4">
                    <div className="mb-2 text-2xl">🎯</div>
                    <div className="font-semibold text-white">Personalized</div>
                    <div className="text-sm text-gray-400">Tailored recommendations</div>
                  </div>
                  <div className="rounded-lg bg-black/30 p-4">
                    <div className="mb-2 text-2xl">🚀</div>
                    <div className="font-semibold text-white">Actionable</div>
                    <div className="text-sm text-gray-400">Clear implementation steps</div>
                  </div>
                </div>

                <motion.button
                  onClick={handleTakeAssessment}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-12 py-4 text-lg font-bold text-white shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🧠 Begin Intelligence Assessment
                </motion.button>

                <p className="text-sm text-gray-400">
                  ⏱️ 5-7 minutes • 15 questions • Instant results and recommendations
                </p>
              </div>
            </motion.div>
          )}

          {/* Intelligence Dimensions Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-center text-2xl font-thin text-white">
              🎯 Intelligence Dimensions We Assess
            </h2>
            <div className="grid gap-4 md:grid-cols-5">
              {[
                {
                  icon: '⚙️',
                  name: 'Operational',
                  color: '#4ECDC4',
                  description: 'Process automation and system integration',
                },
                {
                  icon: '📊',
                  name: 'Analytical',
                  color: '#45B7D1',
                  description: 'Data-driven insights and pattern recognition',
                },
                {
                  icon: '🎯',
                  name: 'Strategic',
                  color: '#FF6B9D',
                  description: 'Long-term vision and competitive advantage',
                },
                {
                  icon: '🤝',
                  name: 'Collaborative',
                  color: '#96CEB4',
                  description: 'Team synergy and collective problem-solving',
                },
                {
                  icon: '🔄',
                  name: 'Adaptive',
                  color: '#FECA57',
                  description: 'Learning velocity and change absorption',
                },
              ].map((dimension, index) => (
                <motion.div
                  key={dimension.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl transition-all hover:bg-white/10"
                >
                  <div className="mb-3 text-3xl">{dimension.icon}</div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{dimension.name}</h3>
                  <p className="text-sm text-gray-400">{dimension.description}</p>
                  <div
                    className="mt-4 h-1 w-full rounded-full"
                    style={{ backgroundColor: dimension.color + '40' }}
                  >
                    <div
                      className="h-1 rounded-full"
                      style={{
                        backgroundColor: dimension.color,
                        width: `${Math.random() * 40 + 40}%`,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Assessment view
  if (currentView === 'assessment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <button
              onClick={handleBackToDashboard}
              className="mb-4 flex items-center space-x-2 text-purple-400 hover:text-purple-300"
            >
              <span>←</span>
              <span>Back to Intelligence Center</span>
            </button>
          </div>

          <IntelligenceAssessmentTool
            onComplete={(result) => {
              // Results will be shown within the component
            }}
            showVisualization={true}
          />
        </div>
      </div>
    )
  }

  // Recommendations view
  if (currentView === 'recommendations' && assessmentResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <button
              onClick={handleBackToDashboard}
              className="mb-4 flex items-center space-x-2 text-purple-400 hover:text-purple-300"
            >
              <span>←</span>
              <span>Back to Intelligence Center</span>
            </button>
          </div>

          <IntelligenceRecommendationEngine
            assessmentData={{
              overallScore: assessmentResult.overallScore,
              dimensionScores: assessmentResult.dimensionScores,
              intelligenceMultiplier: assessmentResult.intelligenceMultiplier,
              consciousnessLevel: assessmentResult.consciousnessLevel,
              blockers: assessmentResult.blockers,
            }}
            maxRecommendations={8}
            showImplementationGuide={true}
            onRecommendationSelect={(recommendation) => {}}
          />
        </div>
      </div>
    )
  }

  return null
}

export default IntelligencePage
