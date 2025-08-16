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
  type IntelligenceProfile 
} from '../../../../components/intelligence'
import { useIntelligenceAssessment } from '../../../../hooks/useIntelligenceAssessment'

const IntelligencePage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'assessment' | 'recommendations'>('dashboard')
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
    getPotentialGrowth
  } = useIntelligenceAssessment({
    enableAudio: true,
    persistResults: true,
    onAssessmentComplete: (result) => {
      console.log('Assessment completed:', result)
    }
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
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-5xl font-thin text-white">
              🧠 Intelligence Center
            </h1>
            <p className="text-xl text-purple-300 max-w-3xl mx-auto">
              Assess your business consciousness potential and unlock exponential intelligence multiplication
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-4 gap-6"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-white">5</div>
              <div className="text-sm text-gray-400">Intelligence Dimensions</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold text-cyan-400">15</div>
              <div className="text-sm text-gray-400">Assessment Questions</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-2xl font-bold text-purple-400">5-7</div>
              <div className="text-sm text-gray-400">Minutes to Complete</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">🚀</div>
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
              className="grid md:grid-cols-3 gap-8"
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
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">🎯 Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleTakeAssessment}
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-medium hover:from-purple-500 hover:to-indigo-500 transition-all"
                    >
                      📊 Retake Assessment
                    </button>
                    <button
                      onClick={handleViewRecommendations}
                      className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-white font-medium hover:from-cyan-500 hover:to-blue-500 transition-all"
                    >
                      🚀 View Recommendations
                    </button>
                    <button className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white font-medium hover:bg-gray-600 transition-all">
                      📈 Intelligence Tracking
                    </button>
                  </div>
                </div>

                {/* Intelligence Insights */}
                <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-purple-300 mb-4">💡 Intelligence Insights</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Level:</span>
                      <span className="text-white font-medium">
                        {getIntelligenceLevel(savedProfile.overallScore)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Growth Potential:</span>
                      <span className="text-cyan-400 font-medium">
                        +{getPotentialGrowth()} points
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Next Milestone:</span>
                      <span className="text-purple-400 font-medium">
                        {savedProfile.intelligenceMultiplier >= 5 ? 'Transcendence' : 'Multiplication'}
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
              className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-700 rounded-2xl p-12 text-center"
            >
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="text-6xl">🧠</div>
                <h2 className="text-3xl font-thin text-white">
                  Discover Your Intelligence Potential
                </h2>
                <p className="text-lg text-purple-300">
                  Take our revolutionary intelligence assessment to uncover what's preventing 
                  exponential growth in your business and get personalized strategies for 
                  consciousness multiplication.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 my-8">
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-2xl mb-2">📋</div>
                    <div className="font-semibold text-white">Comprehensive</div>
                    <div className="text-sm text-gray-400">5 intelligence dimensions</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="font-semibold text-white">Personalized</div>
                    <div className="text-sm text-gray-400">Tailored recommendations</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-2xl mb-2">🚀</div>
                    <div className="font-semibold text-white">Actionable</div>
                    <div className="text-sm text-gray-400">Clear implementation steps</div>
                  </div>
                </div>

                <motion.button
                  onClick={handleTakeAssessment}
                  className="px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white font-bold text-lg shadow-2xl"
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
            <h2 className="text-2xl font-thin text-white text-center">
              🎯 Intelligence Dimensions We Assess
            </h2>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { 
                  icon: '⚙️', 
                  name: 'Operational', 
                  color: '#4ECDC4',
                  description: 'Process automation and system integration'
                },
                { 
                  icon: '📊', 
                  name: 'Analytical', 
                  color: '#45B7D1',
                  description: 'Data-driven insights and pattern recognition'
                },
                { 
                  icon: '🎯', 
                  name: 'Strategic', 
                  color: '#FF6B9D',
                  description: 'Long-term vision and competitive advantage'
                },
                { 
                  icon: '🤝', 
                  name: 'Collaborative', 
                  color: '#96CEB4',
                  description: 'Team synergy and collective problem-solving'
                },
                { 
                  icon: '🔄', 
                  name: 'Adaptive', 
                  color: '#FECA57',
                  description: 'Learning velocity and change absorption'
                }
              ].map((dimension, index) => (
                <motion.div
                  key={dimension.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-all"
                >
                  <div className="text-3xl mb-3">{dimension.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{dimension.name}</h3>
                  <p className="text-sm text-gray-400">{dimension.description}</p>
                  <div 
                    className="w-full h-1 rounded-full mt-4"
                    style={{ backgroundColor: dimension.color + '40' }}
                  >
                    <div 
                      className="h-1 rounded-full"
                      style={{ 
                        backgroundColor: dimension.color,
                        width: `${Math.random() * 40 + 40}%` 
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 mb-4"
            >
              <span>←</span>
              <span>Back to Intelligence Center</span>
            </button>
          </div>
          
          <IntelligenceAssessmentTool
            onComplete={(result) => {
              console.log('Assessment completed:', result)
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
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 mb-4"
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
              blockers: assessmentResult.blockers
            }}
            maxRecommendations={8}
            showImplementationGuide={true}
            onRecommendationSelect={(recommendation) => {
              console.log('Selected recommendation:', recommendation)
            }}
          />
        </div>
      </div>
    )
  }

  return null
}

export default IntelligencePage