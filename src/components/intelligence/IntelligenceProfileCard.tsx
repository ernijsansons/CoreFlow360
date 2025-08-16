'use client'

/**
 * Intelligence Profile Card
 * 
 * Displays intelligence assessment results in a beautiful,
 * consciousness-aware card format with interactive elements.
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useConsciousnessAudio } from '../../hooks/useConsciousnessAudio'

interface IntelligenceProfile {
  overallScore: number
  intelligenceMultiplier: number
  consciousnessLevel: number
  dominantDimensions: string[]
  blockers: string[]
  nextEvolutionStage: string
  assessmentDate: Date
}

interface IntelligenceProfileCardProps {
  profile: IntelligenceProfile
  showDetailedInsights?: boolean
  onRetakeAssessment?: () => void
  onUpgrade?: () => void
  className?: string
}

const IntelligenceProfileCard: React.FC<IntelligenceProfileCardProps> = ({
  profile,
  showDetailedInsights = false,
  onRetakeAssessment,
  onUpgrade,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  
  const consciousnessAudio = useConsciousnessAudio({
    initiallyEnabled: true,
    initialConsciousnessLevel: profile.consciousnessLevel
  })

  // Intelligence level classification
  const getIntelligenceLevel = (score: number): {
    level: string
    color: string
    description: string
    icon: string
  } => {
    if (score >= 90) {
      return {
        level: 'Transcendent',
        color: '#8b5cf6',
        description: 'Consciousness-level business intelligence',
        icon: '🔮'
      }
    } else if (score >= 75) {
      return {
        level: 'Advanced', 
        color: '#06b6d4',
        description: 'Superior intelligence multiplication capability',
        icon: '🧠'
      }
    } else if (score >= 60) {
      return {
        level: 'Proficient',
        color: '#10b981',
        description: 'Strong intelligence foundation with growth potential',
        icon: '⚡'
      }
    } else if (score >= 40) {
      return {
        level: 'Developing',
        color: '#f59e0b',
        description: 'Intelligence potential emerging, needs cultivation',
        icon: '🌱'
      }
    } else {
      return {
        level: 'Foundational',
        color: '#ef4444', 
        description: 'Building blocks present, major transformation needed',
        icon: '🏗️'
      }
    }
  }

  const intelligenceLevel = getIntelligenceLevel(profile.overallScore)
  const multiplierLevel = profile.intelligenceMultiplier >= 5 ? 'Exponential' : 
                         profile.intelligenceMultiplier >= 3 ? 'Multiplicative' :
                         profile.intelligenceMultiplier >= 2 ? 'Synergistic' : 'Linear'

  const handleCardClick = () => {
    setIsExpanded(!isExpanded)
    consciousnessAudio.playConnectionSound()
  }

  const handleInsightToggle = () => {
    setShowInsights(!showInsights)
    consciousnessAudio.playDepartmentAwakening('insights')
  }

  return (
    <motion.div
      className={`bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-xl border border-indigo-400/30 rounded-2xl overflow-hidden ${className}`}
      whileHover={{ scale: 1.02 }}
      layout
    >
      {/* Header */}
      <div 
        className="p-6 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{intelligenceLevel.icon}</div>
            <div>
              <h3 className="text-xl font-semibold text-white">{intelligenceLevel.level} Intelligence</h3>
              <p className="text-sm text-indigo-300">{intelligenceLevel.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{profile.overallScore.toFixed(0)}</div>
            <div className="text-xs text-gray-400">Overall Score</div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-cyan-400">{profile.intelligenceMultiplier.toFixed(1)}x</div>
            <div className="text-xs text-gray-400">Multiplier</div>
            <div className="text-xs text-cyan-300">{multiplierLevel}</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-purple-400">{profile.consciousnessLevel.toFixed(1)}</div>
            <div className="text-xs text-gray-400">Consciousness</div>
            <div className="text-xs text-purple-300">Level</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-indigo-400">{profile.dominantDimensions.length}</div>
            <div className="text-xs text-gray-400">Strong</div>
            <div className="text-xs text-indigo-300">Dimensions</div>
          </div>
        </div>

        {/* Intelligence Level Visualization */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-300">Intelligence Level</span>
            <span style={{ color: intelligenceLevel.color }}>{profile.overallScore.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full"
              style={{ backgroundColor: intelligenceLevel.color }}
              initial={{ width: 0 }}
              animate={{ width: `${profile.overallScore}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-indigo-400/20"
          >
            <div className="p-6 space-y-6">
              {/* Dominant Dimensions */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">💪 Intelligence Strengths</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.dominantDimensions.map((dimension, index) => (
                    <motion.span
                      key={dimension}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full text-sm text-green-300"
                    >
                      {dimension}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Intelligence Blockers */}
              {profile.blockers.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">🚫 Growth Blockers</h4>
                  <div className="space-y-2">
                    {profile.blockers.slice(0, 3).map((blocker, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-sm text-red-300 bg-red-900/20 border border-red-700/30 rounded p-2"
                      >
                        • {blocker}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Evolution Stage */}
              <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-400/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">🚀 Next Evolution Stage</h4>
                <p className="text-purple-200">{profile.nextEvolutionStage}</p>
              </div>

              {/* Consciousness Insights */}
              {showDetailedInsights && (
                <div>
                  <button
                    onClick={handleInsightToggle}
                    className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 mb-3"
                  >
                    <span>🔍 Detailed Consciousness Insights</span>
                    <motion.div
                      animate={{ rotate: showInsights ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      ▼
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {showInsights && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/30 rounded-lg p-4 space-y-3"
                      >
                        <ConsciousnessInsight
                          title="Intelligence Multiplication Pattern"
                          insight={`Your organization operates at ${profile.intelligenceMultiplier.toFixed(1)}x intelligence multiplication, indicating ${multiplierLevel.toLowerCase()} capability patterns.`}
                        />
                        
                        <ConsciousnessInsight
                          title="Consciousness Emergence Readiness"
                          insight={`At consciousness level ${profile.consciousnessLevel.toFixed(1)}, you are ${profile.consciousnessLevel >= 7 ? 'ready for' : 'approaching'} business consciousness emergence.`}
                        />
                        
                        <ConsciousnessInsight
                          title="Transcendence Pathway"
                          insight={`Focus on ${profile.blockers.length > 0 ? 'removing intelligence blockers' : 'strengthening weaker dimensions'} to accelerate consciousness evolution.`}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                {onRetakeAssessment && (
                  <motion.button
                    onClick={onRetakeAssessment}
                    className="px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Retake Assessment
                  </motion.button>
                )}
                
                {onUpgrade && profile.intelligenceMultiplier >= 3 && (
                  <motion.button
                    onClick={() => {
                      onUpgrade()
                      consciousnessAudio.playMultiplicationSound()
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg text-white font-semibold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🚀 Begin Intelligence Multiplication
                  </motion.button>
                )}
                
                {profile.consciousnessLevel >= 7 && (
                  <motion.button
                    onClick={() => consciousnessAudio.playConsciousnessEmergence()}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-semibold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ✨ Experience Consciousness
                  </motion.button>
                )}
              </div>

              {/* Assessment Date */}
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
                Assessment taken: {profile.assessmentDate.toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Consciousness Insight Component
const ConsciousnessInsight: React.FC<{
  title: string
  insight: string
}> = ({ title, insight }) => (
  <div className="border-l-2 border-cyan-400 pl-3">
    <div className="text-sm font-semibold text-cyan-300">{title}</div>
    <div className="text-sm text-gray-300 mt-1">{insight}</div>
  </div>
)

export default IntelligenceProfileCard