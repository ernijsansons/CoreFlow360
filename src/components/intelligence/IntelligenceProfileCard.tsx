'use client'

/**
 * Intelligence Profile Card
 *
 * Displays intelligence assessment results in a beautiful,
 * BUSINESS INTELLIGENCE-aware card format with interactive elements.
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useIntelligenceAudio } from '../../hooks/useBusinessIntelligenceAudio'

interface IntelligenceProfile {
  overallScore: number
  intelligenceMultiplier: number
  intelligenceLevel: number
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
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showInsights, setShowInsights] = useState(false)

  const intelligenceAudio = useIntelligenceAudio({
    initiallyEnabled: true,
    initialintelligenceLevel: profile.intelligenceLevel,
  })

  // Intelligence level classification
  const getIntelligenceLevel = (
    score: number
  ): {
    level: string
    color: string
    description: string
    icon: string
  } => {
    if (score >= 90) {
      return {
        level: 'ADVANCED',
        color: '#8b5cf6',
        description: 'BUSINESS INTELLIGENCE-level business intelligence',
        icon: '🔮',
      }
    } else if (score >= 75) {
      return {
        level: 'Advanced',
        color: '#06b6d4',
        description: 'Superior intelligence multiplication capability',
        icon: '🧠',
      }
    } else if (score >= 60) {
      return {
        level: 'Proficient',
        color: '#10b981',
        description: 'Strong intelligence foundation with growth potential',
        icon: '⚡',
      }
    } else if (score >= 40) {
      return {
        level: 'Developing',
        color: '#f59e0b',
        description: 'Intelligence potential emerging, needs cultivation',
        icon: '🌱',
      }
    } else {
      return {
        level: 'Foundational',
        color: '#ef4444',
        description: 'Building blocks present, major transformation needed',
        icon: '🏗️',
      }
    }
  }

  const intelligenceLevel = getIntelligenceLevel(profile.overallScore)
  const multiplierLevel =
    profile.intelligenceMultiplier >= 5
      ? 'Exponential'
      : profile.intelligenceMultiplier >= 3
        ? 'Multiplicative'
        : profile.intelligenceMultiplier >= 2
          ? 'Synergistic'
          : 'Linear'

  const handleCardClick = () => {
    setIsExpanded(!isExpanded)
    intelligenceAudio.playConnectionSound()
  }

  const handleInsightToggle = () => {
    setShowInsights(!showInsights)
    intelligenceAudio.playDepartmentAwakening('insights')
  }

  return (
    <motion.div
      className={`overflow-hidden rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-xl ${className}`}
      whileHover={{ scale: 1.02 }}
      layout
    >
      {/* Header */}
      <div className="cursor-pointer p-6" onClick={handleCardClick}>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{intelligenceLevel.icon}</div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {intelligenceLevel.level} Intelligence
              </h3>
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
          <div className="rounded-lg bg-black/20 p-3 text-center">
            <div className="text-lg font-bold text-cyan-400">
              {profile.intelligenceMultiplier.toFixed(1)}x
            </div>
            <div className="text-xs text-gray-400">Multiplier</div>
            <div className="text-xs text-cyan-300">{multiplierLevel}</div>
          </div>
          <div className="rounded-lg bg-black/20 p-3 text-center">
            <div className="text-lg font-bold text-purple-400">
              {profile.intelligenceLevel.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">BUSINESS INTELLIGENCE</div>
            <div className="text-xs text-purple-300">Level</div>
          </div>
          <div className="rounded-lg bg-black/20 p-3 text-center">
            <div className="text-lg font-bold text-indigo-400">
              {profile.dominantDimensions.length}
            </div>
            <div className="text-xs text-gray-400">Strong</div>
            <div className="text-xs text-indigo-300">Dimensions</div>
          </div>
        </div>

        {/* Intelligence Level Visualization */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-300">Intelligence Level</span>
            <span style={{ color: intelligenceLevel.color }}>
              {profile.overallScore.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-700">
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
            <div className="space-y-6 p-6">
              {/* Dominant Dimensions */}
              <div>
                <h4 className="mb-3 text-lg font-semibold text-white">💪 Intelligence Strengths</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.dominantDimensions.map((dimension, index) => (
                    <motion.span
                      key={dimension}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-full border border-green-400/30 bg-green-500/20 px-3 py-1 text-sm text-green-300"
                    >
                      {dimension}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Intelligence Blockers */}
              {profile.blockers.length > 0 && (
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-white">🚫 Growth Blockers</h4>
                  <div className="space-y-2">
                    {profile.blockers.slice(0, 3).map((blocker, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="rounded border border-red-700/30 bg-red-900/20 p-2 text-sm text-red-300"
                      >
                        • {blocker}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Evolution Stage */}
              <div className="rounded-lg border border-purple-400/30 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 p-4">
                <h4 className="mb-2 text-lg font-semibold text-white">🚀 Next Evolution Stage</h4>
                <p className="text-purple-200">{profile.nextEvolutionStage}</p>
              </div>

              {/* BUSINESS INTELLIGENCE Insights */}
              {showDetailedInsights && (
                <div>
                  <button
                    onClick={handleInsightToggle}
                    className="mb-3 flex items-center space-x-2 text-cyan-400 hover:text-cyan-300"
                  >
                    <span>🔍 Detailed BUSINESS INTELLIGENCE Insights</span>
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
                        className="space-y-3 rounded-lg bg-black/30 p-4"
                      >
                        <BusinessIntelligenceInsight
                          title="Intelligence Multiplication Pattern"
                          insight={`Your organization operates at ${profile.intelligenceMultiplier.toFixed(1)}x intelligence multiplication, indicating ${multiplierLevel.toLowerCase()} capability patterns.`}
                        />

                        <BusinessIntelligenceInsight
                          title="intelligent automation Readiness"
                          insight={`At BUSINESS INTELLIGENCE level ${profile.intelligenceLevel.toFixed(1)}, you are ${profile.intelligenceLevel >= 7 ? 'ready for' : 'approaching'} business intelligent automation.`}
                        />

                        <BusinessIntelligenceInsight
                          title="Transcendence Pathway"
                          insight={`Focus on ${profile.blockers.length > 0 ? 'removing intelligence blockers' : 'strengthening weaker dimensions'} to accelerate BUSINESS INTELLIGENCE evolution.`}
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
                    className="rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
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
                      intelligenceAudio.playMultiplicationSound()
                    }}
                    className="rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 px-4 py-2 font-semibold text-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🚀 Begin Intelligence Multiplication
                  </motion.button>
                )}

                {profile.intelligenceLevel >= 7 && (
                  <motion.button
                    onClick={() => intelligenceAudio.playIntelligenceEmergence()}
                    className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 font-semibold text-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ✨ Experience BUSINESS INTELLIGENCE
                  </motion.button>
                )}
              </div>

              {/* Assessment Date */}
              <div className="border-t border-gray-700 pt-2 text-xs text-gray-500">
                Assessment taken: {profile.assessmentDate.toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// BUSINESS INTELLIGENCE Insight Component
const BusinessIntelligenceInsight: React.FC<{
  title: string
  insight: string
}> = ({ title, insight }) => (
  <div className="border-l-2 border-cyan-400 pl-3">
    <div className="text-sm font-semibold text-cyan-300">{title}</div>
    <div className="mt-1 text-sm text-gray-300">{insight}</div>
  </div>
)

export default IntelligenceProfileCard
