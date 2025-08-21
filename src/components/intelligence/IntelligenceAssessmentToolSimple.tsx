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
      'How quickly can you adapt workflows to changing demands?',
    ],
  },
  analytical: {
    name: 'Analytical Intelligence',
    color: '#3b82f6',
    questions: [
      'How effectively do you use data to make business decisions?',
      'How well do you identify patterns and trends in your operations?',
      'How thoroughly do you analyze market opportunities?',
    ],
  },
  strategic: {
    name: 'Strategic Intelligence',
    color: '#8b5cf6',
    questions: [
      'How clearly defined is your long-term business vision?',
      'How well do you anticipate market changes and disruptions?',
      'How effectively do you align resources with strategic goals?',
    ],
  },
  emotional: {
    name: 'Emotional Intelligence',
    color: '#f59e0b',
    questions: [
      'How well do you understand customer needs and motivations?',
      'How effectively do you manage team dynamics and culture?',
      'How well do you handle stress and uncertainty in decision-making?',
    ],
  },
  creative: {
    name: 'Creative Intelligence',
    color: '#ef4444',
    questions: [
      'How innovative are your solutions to business challenges?',
      'How well do you encourage and implement new ideas?',
      'How effectively do you differentiate from competitors?',
    ],
  },
} as const

type IntelligenceDimensionId = keyof typeof INTELLIGENCE_DIMENSIONS

interface AssessmentAnswer {
  questionIndex: number
  score: number // 1-10 scale
}

interface IntelligenceAssessmentToolProps {
  onComplete?: (results: unknown) => void
}

export default function IntelligenceAssessmentTool({
  onComplete,
}: IntelligenceAssessmentToolProps) {
  const [currentDimension, setCurrentDimension] = useState<IntelligenceDimensionId>('operational')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer[]>>({})
  const [isComplete, setIsComplete] = useState(false)

  const dimensionIds = Object.keys(INTELLIGENCE_DIMENSIONS) as IntelligenceDimensionId[]
  const currentDimensionData = INTELLIGENCE_DIMENSIONS[currentDimension]
  const progress =
    ((dimensionIds.indexOf(currentDimension) * 3 + currentQuestion + 1) /
      (dimensionIds.length * 3)) *
    100

  const handleAnswer = (score: number) => {
    const dimensionAnswers = answers[currentDimension] || []
    const newAnswers = [...dimensionAnswers]
    newAnswers[currentQuestion] = { questionIndex: currentQuestion, score }

    setAnswers((prev) => ({
      ...prev,
      [currentDimension]: newAnswers,
    }))

    // Move to next question or dimension
    if (currentQuestion < currentDimensionData.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
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
    const scores: Record<IntelligenceDimensionId, number> = {} as unknown

    dimensionIds.forEach((dimensionId) => {
      const dimensionAnswers = answers[dimensionId] || []
      const averageScore =
        dimensionAnswers.length > 0
          ? dimensionAnswers.reduce((sum, answer) => sum + answer.score, 0) /
            dimensionAnswers.length
          : 0
      scores[dimensionId] = (averageScore / 10) * 100 // Convert to percentage
    })

    return scores
  }, [answers])

  const intelligenceMultiplier = useMemo(() => {
    const validScores = Object.values(dimensionScores).filter((score) => score > 0)
    if (validScores.length === 0) return 1

    // Intelligence multiplication formula: product of normalized scores
    return validScores.reduce((product, score) => {
      const normalizedScore = score / 100 + 0.1 // 0.1 to 1.1 range
      return product * normalizedScore
    }, 1)
  }, [dimensionScores])

  if (isComplete) {
    return (
      <div className="mx-auto max-w-4xl rounded-xl bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-6 text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h2 className="mb-6 text-4xl font-bold">Intelligence Assessment Complete</h2>

          {/* Intelligence Multiplier Display */}
          <div className="mb-8">
            <div className="mb-2 text-6xl font-bold text-yellow-400">
              {intelligenceMultiplier.toFixed(1)}x
            </div>
            <p className="text-xl">Intelligence Multiplication Factor</p>
          </div>

          {/* Dimension Scores */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-5">
            {dimensionIds.map((dimensionId) => {
              const dimension = INTELLIGENCE_DIMENSIONS[dimensionId]
              const score = dimensionScores[dimensionId]

              return (
                <motion.div
                  key={dimensionId}
                  className="rounded-lg border border-white/10 bg-black/30 p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * dimensionIds.indexOf(dimensionId) }}
                >
                  <div
                    className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/20 text-xl font-bold text-white"
                    style={{
                      backgroundColor: dimension.color,
                      boxShadow: `0 0 20px ${dimension.color}80`,
                    }}
                  >
                    {Math.round(score)}
                  </div>
                  <h3 className="text-center text-sm font-semibold">{dimension.name}</h3>
                </motion.div>
              )
            })}
          </div>

          {/* Recommendations */}
          <div className="rounded-lg border border-white/10 bg-black/20 p-6">
            <h3 className="mb-4 text-2xl font-bold">BUSINESS INTELLIGENCE Readiness Analysis</h3>
            <div className="space-y-4 text-left">
              {intelligenceMultiplier >= 2.0 && (
                <p className="text-green-400">
                  🧠 <strong>High BUSINESS INTELLIGENCE Potential:</strong> Your business shows strong
                  multi-dimensional intelligence. Ready for autonomous BUSINESS INTELLIGENCE features.
                </p>
              )}
              {intelligenceMultiplier >= 1.5 && intelligenceMultiplier < 2.0 && (
                <p className="text-yellow-400">
                  ⚡ <strong>Moderate BUSINESS INTELLIGENCE:</strong> Good foundation with room for INTELLIGENT
                  bridge development. Focus on cross-department integration.
                </p>
              )}
              {intelligenceMultiplier < 1.5 && (
                <p className="text-orange-400">
                  🔧 <strong>Foundation Building:</strong> Opportunity to develop core intelligence
                  dimensions before intelligent automation.
                </p>
              )}

              {/* Specific recommendations based on lowest scores */}
              {Object.entries(dimensionScores)
                .sort(([, a], [, b]) => a - b)
                .slice(0, 2)
                .map(([dimensionId, score]) => (
                  <p key={dimensionId} className="text-blue-300">
                    💡{' '}
                    <strong>
                      Strengthen{' '}
                      {INTELLIGENCE_DIMENSIONS[dimensionId as IntelligenceDimensionId].name}:
                    </strong>
                    Current score of {Math.round(score)}% indicates primary growth opportunity.
                  </p>
                ))}
            </div>
          </div>

          <motion.button
            onClick={() => onComplete?.({ dimensionScores, intelligenceMultiplier })}
            className="mt-6 rounded-lg bg-purple-600 px-8 py-3 font-semibold transition-colors hover:bg-purple-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue to BUSINESS INTELLIGENCE Activation
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-6 text-white">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm">
          <span>Intelligence Assessment Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-700">
          <motion.div
            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
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
          className="mr-3 inline-block h-4 w-4 rounded-full"
          style={{ backgroundColor: currentDimensionData.color }}
        />
        <h2 className="inline-block text-2xl font-bold">{currentDimensionData.name}</h2>
      </motion.div>

      {/* Current Question */}
      <motion.div
        key={`${currentDimension}-${currentQuestion}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h3 className="mb-6 text-xl">{currentDimensionData.questions[currentQuestion]}</h3>

        {/* Rating Scale */}
        <div className="grid grid-cols-10 gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
            <motion.button
              key={score}
              onClick={() => handleAnswer(score)}
              className="flex aspect-square items-center justify-center rounded-lg border border-white/20 font-semibold transition-all hover:border-white/40 hover:bg-white/10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {score}
            </motion.button>
          ))}
        </div>

        <div className="mt-2 flex justify-between text-sm text-gray-400">
          <span>Strongly Disagree</span>
          <span>Strongly Agree</span>
        </div>
      </motion.div>

      {/* Question Counter */}
      <div className="text-center text-sm text-gray-400">
        Question {currentQuestion + 1} of {currentDimensionData.questions.length} in{' '}
        {currentDimensionData.name}
      </div>
    </div>
  )
}
