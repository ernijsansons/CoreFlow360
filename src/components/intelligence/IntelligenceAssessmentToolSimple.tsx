'use client'

/**
 * CoreFlow360 Intelligence Assessment Tool (Simplified)
 * 
 * Temporary simplified version without Three.js dependencies
 * for production build compatibility.
 */

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Intelligence assessment categories
const INTELLIGENCE_DIMENSIONS = {
  operational: {
    name: 'Operational Intelligence',
    color: '#10b981',
    questions: [
      'How well does your team coordinate across departments?',
      'How efficiently do you handle routine business processes?',
      'How quickly can you adapt workflows to changing demands?'
    ]
  },
  analytical: {
    name: 'Analytical Intelligence', 
    color: '#3b82f6',
    questions: [
      'How effectively do you use data to make business decisions?',
      'How well do you identify patterns and trends in your operations?',
      'How thoroughly do you analyze market opportunities?'
    ]
  },
  strategic: {
    name: 'Strategic Intelligence',
    color: '#8b5cf6',
    questions: [
      'How clearly defined is your long-term business vision?',
      'How well do you anticipate market changes and disruptions?',
      'How effectively do you align resources with strategic goals?'
    ]
  },
  emotional: {
    name: 'Emotional Intelligence',
    color: '#f59e0b',
    questions: [
      'How well do you understand customer needs and motivations?',
      'How effectively do you manage team dynamics and culture?',
      'How well do you handle stress and uncertainty in decision-making?'
    ]
  },
  creative: {
    name: 'Creative Intelligence',
    color: '#ef4444',
    questions: [
      'How innovative are your solutions to business challenges?',
      'How well do you encourage and implement new ideas?',
      'How effectively do you differentiate from competitors?'
    ]
  }
} as const

type IntelligenceDimensionId = keyof typeof INTELLIGENCE_DIMENSIONS

interface AssessmentAnswer {
  questionIndex: number
  score: number // 1-10 scale
}

interface IntelligenceAssessmentToolProps {
  onComplete?: (results: any) => void
}

export default function IntelligenceAssessmentTool({ onComplete }: IntelligenceAssessmentToolProps) {
  const [currentDimension, setCurrentDimension] = useState<IntelligenceDimensionId>('operational')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer[]>>({})
  const [isComplete, setIsComplete] = useState(false)

  const dimensionIds = Object.keys(INTELLIGENCE_DIMENSIONS) as IntelligenceDimensionId[]
  const currentDimensionData = INTELLIGENCE_DIMENSIONS[currentDimension]
  const progress = ((dimensionIds.indexOf(currentDimension) * 3 + currentQuestion + 1) / (dimensionIds.length * 3)) * 100

  const handleAnswer = (score: number) => {
    const dimensionAnswers = answers[currentDimension] || []
    const newAnswers = [...dimensionAnswers]
    newAnswers[currentQuestion] = { questionIndex: currentQuestion, score }
    
    setAnswers(prev => ({
      ...prev,
      [currentDimension]: newAnswers
    }))

    // Move to next question or dimension
    if (currentQuestion < currentDimensionData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      const currentIndex = dimensionIds.indexOf(currentDimension)
      if (currentIndex < dimensionIds.length - 1) {
        setCurrentDimension(dimensionIds[currentIndex + 1])
        setCurrentQuestion(0)
      } else {
        setIsComplete(true)
      }
    }
  }

  // Calculate results
  const dimensionScores = useMemo(() => {
    const scores: Record<IntelligenceDimensionId, number> = {} as any
    
    dimensionIds.forEach(dimensionId => {
      const dimensionAnswers = answers[dimensionId] || []
      const averageScore = dimensionAnswers.length > 0
        ? dimensionAnswers.reduce((sum, answer) => sum + answer.score, 0) / dimensionAnswers.length
        : 0
      scores[dimensionId] = (averageScore / 10) * 100 // Convert to percentage
    })
    
    return scores
  }, [answers])

  const intelligenceMultiplier = useMemo(() => {
    const validScores = Object.values(dimensionScores).filter(score => score > 0)
    if (validScores.length === 0) return 1
    
    // Intelligence multiplication formula: product of normalized scores
    return validScores.reduce((product, score) => {
      const normalizedScore = (score / 100) + 0.1 // 0.1 to 1.1 range
      return product * normalizedScore
    }, 1)
  }, [dimensionScores])

  if (isComplete) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-black rounded-xl text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold mb-6">Intelligence Assessment Complete</h2>
          
          {/* Intelligence Multiplier Display */}
          <div className="mb-8">
            <div className="text-6xl font-bold text-yellow-400 mb-2">
              {intelligenceMultiplier.toFixed(1)}x
            </div>
            <p className="text-xl">Intelligence Multiplication Factor</p>
          </div>

          {/* Dimension Scores */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            {dimensionIds.map(dimensionId => {
              const dimension = INTELLIGENCE_DIMENSIONS[dimensionId]
              const score = dimensionScores[dimensionId]
              
              return (
                <motion.div
                  key={dimensionId}
                  className="bg-black/30 rounded-lg p-4 border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * dimensionIds.indexOf(dimensionId) }}
                >
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl border-2 border-white/20"
                    style={{
                      backgroundColor: dimension.color,
                      boxShadow: `0 0 20px ${dimension.color}80`,
                    }}
                  >
                    {Math.round(score)}
                  </div>
                  <h3 className="text-sm font-semibold text-center">{dimension.name}</h3>
                </motion.div>
              )
            })}
          </div>

          {/* Recommendations */}
          <div className="bg-black/20 rounded-lg p-6 border border-white/10">
            <h3 className="text-2xl font-bold mb-4">Consciousness Readiness Analysis</h3>
            <div className="text-left space-y-4">
              {intelligenceMultiplier >= 2.0 && (
                <p className="text-green-400">🧠 <strong>High Consciousness Potential:</strong> Your business shows strong multi-dimensional intelligence. Ready for autonomous consciousness features.</p>
              )}
              {intelligenceMultiplier >= 1.5 && intelligenceMultiplier < 2.0 && (
                <p className="text-yellow-400">⚡ <strong>Moderate Consciousness:</strong> Good foundation with room for synaptic bridge development. Focus on cross-department integration.</p>
              )}
              {intelligenceMultiplier < 1.5 && (
                <p className="text-orange-400">🔧 <strong>Foundation Building:</strong> Opportunity to develop core intelligence dimensions before consciousness emergence.</p>
              )}
              
              {/* Specific recommendations based on lowest scores */}
              {Object.entries(dimensionScores)
                .sort(([,a], [,b]) => a - b)
                .slice(0, 2)
                .map(([dimensionId, score]) => (
                  <p key={dimensionId} className="text-blue-300">
                    💡 <strong>Strengthen {INTELLIGENCE_DIMENSIONS[dimensionId as IntelligenceDimensionId].name}:</strong> 
                    Current score of {Math.round(score)}% indicates primary growth opportunity.
                  </p>
                ))}
            </div>
          </div>

          <motion.button
            onClick={() => onComplete?.({ dimensionScores, intelligenceMultiplier })}
            className="mt-6 px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue to Consciousness Activation
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-black rounded-xl text-white">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Intelligence Assessment Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Current Dimension */}
      <motion.div
        key={currentDimension}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="mb-6"
      >
        <div
          className="w-4 h-4 rounded-full inline-block mr-3"
          style={{ backgroundColor: currentDimensionData.color }}
        />
        <h2 className="text-2xl font-bold inline-block">{currentDimensionData.name}</h2>
      </motion.div>

      {/* Current Question */}
      <motion.div
        key={`${currentDimension}-${currentQuestion}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h3 className="text-xl mb-6">{currentDimensionData.questions[currentQuestion]}</h3>
        
        {/* Rating Scale */}
        <div className="grid grid-cols-10 gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(score => (
            <motion.button
              key={score}
              onClick={() => handleAnswer(score)}
              className="aspect-square rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all flex items-center justify-center font-semibold"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {score}
            </motion.button>
          ))}
        </div>
        
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>Strongly Disagree</span>
          <span>Strongly Agree</span>
        </div>
      </motion.div>

      {/* Question Counter */}
      <div className="text-center text-sm text-gray-400">
        Question {currentQuestion + 1} of {currentDimensionData.questions.length} in {currentDimensionData.name}
      </div>
    </div>
  )
}