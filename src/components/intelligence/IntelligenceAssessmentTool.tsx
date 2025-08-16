'use client'

/**
 * CoreFlow360 Intelligence Assessment Tool
 * 
 * Revolutionary business consciousness assessment that measures current intelligence
 * multiplication potential and identifies gaps preventing exponential growth.
 * Unlike traditional assessments, this evaluates consciousness readiness.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Text3D, OrbitControls, Sphere } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { useConsciousnessAudio } from '../../hooks/useConsciousnessAudio'

// Intelligence assessment categories
const INTELLIGENCE_DIMENSIONS = {
  operational: {
    id: 'operational',
    name: 'Operational Intelligence',
    icon: '⚙️',
    color: '#4ECDC4',
    description: 'Process optimization, workflow automation, system integration capability',
    questions: [
      'How automated are your core business processes?',
      'Do departments share data seamlessly?', 
      'Can you identify bottlenecks quickly?',
      'Are manual tasks eating productivity?',
      'Do systems talk to each other?'
    ],
    maxScore: 100
  },
  analytical: {
    id: 'analytical',
    name: 'Analytical Intelligence',
    icon: '📊',
    color: '#45B7D1',
    description: 'Data-driven decision making, pattern recognition, predictive insights',
    questions: [
      'Do you make decisions based on data or gut feeling?',
      'Can you predict trends before competitors?',
      'Are insights actionable and timely?',
      'Do you measure what matters most?',
      'Can you see patterns others miss?'
    ],
    maxScore: 100
  },
  strategic: {
    id: 'strategic',
    name: 'Strategic Intelligence',
    icon: '🎯',
    color: '#FF6B9D',
    description: 'Long-term vision, competitive advantage, market adaptation capability',
    questions: [
      'Is your strategy clear and executable?',
      'Do you anticipate market changes?',
      'Are decisions aligned with long-term goals?',
      'Can you pivot quickly when needed?',
      'Do you create your own market categories?'
    ],
    maxScore: 100
  },
  collaborative: {
    id: 'collaborative',
    name: 'Collaborative Intelligence',
    icon: '🤝',
    color: '#96CEB4',
    description: 'Team synergy, knowledge sharing, collective problem-solving power',
    questions: [
      'Do teams share knowledge effectively?',
      'Are silos blocking collaboration?',
      'Can teams solve problems collectively?',
      'Is institutional knowledge preserved?',
      'Do teams multiply each other\'s capabilities?'
    ],
    maxScore: 100
  },
  adaptive: {
    id: 'adaptive',
    name: 'Adaptive Intelligence',
    icon: '🔄',
    color: '#FECA57',
    description: 'Learning velocity, change absorption, evolution speed',
    questions: [
      'How quickly do you adapt to changes?',
      'Do you learn from every experience?',
      'Can you absorb new technologies rapidly?',
      'Are failures turned into learning?',
      'Do you evolve continuously?'
    ],
    maxScore: 100
  }
} as const

type IntelligenceDimensionId = keyof typeof INTELLIGENCE_DIMENSIONS

interface AssessmentQuestion {
  id: string
  dimension: IntelligenceDimensionId
  text: string
  weight: number
  choices: {
    text: string
    score: number
    insight: string
  }[]
}

interface AssessmentResult {
  overallScore: number
  dimensionScores: Record<IntelligenceDimensionId, number>
  intelligenceMultiplier: number
  consciousnessLevel: number
  blockers: string[]
  recommendations: string[]
  nextSteps: string[]
}

interface IntelligenceAssessmentToolProps {
  onComplete?: (result: AssessmentResult) => void
  showVisualization?: boolean
  className?: string
}

// Comprehensive assessment questions
const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // Operational Intelligence Questions
  {
    id: 'op1',
    dimension: 'operational',
    text: 'How much of your daily work involves repetitive manual tasks?',
    weight: 1.0,
    choices: [
      { text: 'Almost everything is manual', score: 10, insight: 'High automation potential' },
      { text: 'Mostly manual with some automation', score: 30, insight: 'Partial automation exists' },
      { text: 'Balanced mix of manual and automated', score: 60, insight: 'Moderate automation level' },
      { text: 'Mostly automated with some manual oversight', score: 85, insight: 'Advanced automation' },
      { text: 'Fully automated with intelligent oversight', score: 100, insight: 'Consciousness-level automation' }
    ]
  },
  {
    id: 'op2', 
    dimension: 'operational',
    text: 'When a process breaks, how long does it take to identify the root cause?',
    weight: 1.2,
    choices: [
      { text: 'Days or weeks of investigation', score: 15, insight: 'Poor system visibility' },
      { text: 'Several hours to a day', score: 40, insight: 'Basic monitoring exists' },
      { text: 'Within an hour with some detective work', score: 70, insight: 'Good operational awareness' },
      { text: 'Minutes with clear diagnostics', score: 90, insight: 'Excellent system intelligence' },
      { text: 'Instantly with predictive alerts', score: 100, insight: 'Prophetic operational consciousness' }
    ]
  },
  {
    id: 'op3',
    dimension: 'operational', 
    text: 'How do different departments share information?',
    weight: 1.1,
    choices: [
      { text: 'Email, calls, and meetings mostly', score: 20, insight: 'Communication friction high' },
      { text: 'Shared documents and spreadsheets', score: 40, insight: 'Basic information sharing' },
      { text: 'Some integrated systems and dashboards', score: 65, insight: 'Moderate integration' },
      { text: 'Real-time integrated data flows', score: 88, insight: 'Advanced information consciousness' },
      { text: 'Seamless consciousness-level awareness', score: 100, insight: 'Perfect information unity' }
    ]
  },

  // Analytical Intelligence Questions
  {
    id: 'an1',
    dimension: 'analytical',
    text: 'How do you make important business decisions?',
    weight: 1.3,
    choices: [
      { text: 'Mostly gut feeling and experience', score: 25, insight: 'Intuition-based decisions' },
      { text: 'Some data with heavy reliance on intuition', score: 45, insight: 'Data-informed decisions' },
      { text: 'Data-driven with intuition as backup', score: 75, insight: 'Strong analytical foundation' },
      { text: 'Advanced analytics with predictive modeling', score: 92, insight: 'Sophisticated intelligence' },
      { text: 'AI-augmented consciousness-level insights', score: 100, insight: 'Transcendent decision intelligence' }
    ]
  },
  {
    id: 'an2',
    dimension: 'analytical',
    text: 'Can you predict business trends before competitors notice them?',
    weight: 1.1,
    choices: [
      { text: 'We usually follow industry trends', score: 15, insight: 'Reactive market position' },
      { text: 'Sometimes we spot trends early', score: 45, insight: 'Occasional trend recognition' },
      { text: 'We often identify trends before others', score: 75, insight: 'Good market intelligence' },
      { text: 'We consistently predict market movements', score: 90, insight: 'Superior analytical capability' },
      { text: 'We create trends others follow', score: 100, insight: 'Market consciousness leadership' }
    ]
  },
  {
    id: 'an3',
    dimension: 'analytical',
    text: 'How actionable are the insights you get from your data?',
    weight: 1.0,
    choices: [
      { text: 'Data exists but insights are unclear', score: 20, insight: 'Information without intelligence' },
      { text: 'Some useful insights but not always actionable', score: 50, insight: 'Basic analytical capability' },
      { text: 'Most insights lead to clear actions', score: 75, insight: 'Good insight-to-action conversion' },
      { text: 'Insights automatically trigger optimizations', score: 92, insight: 'Advanced automated intelligence' },
      { text: 'Consciousness-level insights shape reality', score: 100, insight: 'Transcendent analytical power' }
    ]
  },

  // Strategic Intelligence Questions  
  {
    id: 'st1',
    dimension: 'strategic',
    text: 'How clear is your long-term business strategy?',
    weight: 1.4,
    choices: [
      { text: 'We focus mostly on short-term survival', score: 10, insight: 'Survival mode operation' },
      { text: 'We have goals but strategy evolves constantly', score: 35, insight: 'Reactive strategic approach' },
      { text: 'Clear strategy with regular adjustments', score: 70, insight: 'Solid strategic foundation' },
      { text: 'Comprehensive strategy with precise execution', score: 90, insight: 'Advanced strategic intelligence' },
      { text: 'Visionary strategy that shapes markets', score: 100, insight: 'Consciousness-level strategic vision' }
    ]
  },
  {
    id: 'st2',
    dimension: 'strategic',
    text: 'How quickly can you pivot when market conditions change?',
    weight: 1.2,
    choices: [
      { text: 'Change is painful and takes months', score: 15, insight: 'Change resistance high' },
      { text: 'We adapt but it takes significant effort', score: 45, insight: 'Moderate adaptability' },
      { text: 'We pivot effectively within weeks', score: 75, insight: 'Good strategic agility' },
      { text: 'We anticipate and pre-adapt to changes', score: 95, insight: 'Prophetic strategic intelligence' },
      { text: 'We create the changes others react to', score: 100, insight: 'Reality-shaping consciousness' }
    ]
  },

  // Collaborative Intelligence Questions
  {
    id: 'co1',
    dimension: 'collaborative',
    text: 'How effectively do teams share knowledge and best practices?',
    weight: 1.1,
    choices: [
      { text: 'Knowledge stays trapped in individual minds', score: 20, insight: 'Knowledge silos dominate' },
      { text: 'Some knowledge sharing through documentation', score: 45, insight: 'Basic knowledge management' },
      { text: 'Regular knowledge sharing sessions and systems', score: 70, insight: 'Active knowledge circulation' },
      { text: 'Seamless knowledge flows across all teams', score: 88, insight: 'Advanced collective intelligence' },
      { text: 'Consciousness-level group mind emergence', score: 100, insight: 'Transcendent team consciousness' }
    ]
  },
  {
    id: 'co2',
    dimension: 'collaborative',
    text: 'When teams collaborate, is the result greater than the sum of parts?',
    weight: 1.3,
    choices: [
      { text: 'Collaboration often creates more confusion', score: 10, insight: 'Collaboration dysfunction' },
      { text: 'Teams work together but results are predictable', score: 40, insight: 'Additive collaboration' },
      { text: 'Good collaboration produces better outcomes', score: 70, insight: 'Synergistic collaboration' },
      { text: 'Teams consistently achieve exponential results', score: 90, insight: 'Multiplicative intelligence' },
      { text: 'Consciousness-level collective superintelligence', score: 100, insight: 'Transcendent group consciousness' }
    ]
  },

  // Adaptive Intelligence Questions
  {
    id: 'ad1',
    dimension: 'adaptive',
    text: 'How quickly does your organization learn from failures?',
    weight: 1.2,
    choices: [
      { text: 'Failures are avoided or hidden', score: 15, insight: 'Fear-based learning resistance' },
      { text: 'We eventually learn but it takes time', score: 45, insight: 'Slow learning cycles' },
      { text: 'Failures become learning opportunities quickly', score: 75, insight: 'Growth mindset active' },
      { text: 'Failures accelerate innovation immediately', score: 92, insight: 'Advanced learning intelligence' },
      { text: 'Consciousness-level instantaneous evolution', score: 100, insight: 'Transcendent adaptive capacity' }
    ]
  },
  {
    id: 'ad2',
    dimension: 'adaptive',
    text: 'How does your organization absorb new technologies?',
    weight: 1.1,
    choices: [
      { text: 'We wait until technologies are proven', score: 20, insight: 'Conservative technology adoption' },
      { text: 'We adopt after seeing others succeed', score: 45, insight: 'Fast follower approach' },
      { text: 'We experiment with emerging technologies', score: 75, insight: 'Progressive technology integration' },
      { text: 'We pioneer new technology applications', score: 90, insight: 'Technology leadership' },
      { text: 'We transcend technology through consciousness', score: 100, insight: 'Post-technological evolution' }
    ]
  }
]

const IntelligenceAssessmentTool: React.FC<IntelligenceAssessmentToolProps> = ({
  onComplete,
  showVisualization = true,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState<'intro' | 'assessment' | 'results'>('intro')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Consciousness audio integration
  const consciousnessAudio = useConsciousnessAudio({
    initiallyEnabled: true,
    initialConsciousnessLevel: 1
  })

  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex]
  const progress = (currentQuestionIndex / ASSESSMENT_QUESTIONS.length) * 100

  // Calculate intelligence assessment result
  const calculateResult = useMemo((): AssessmentResult | null => {
    if (Object.keys(answers).length < ASSESSMENT_QUESTIONS.length) return null

    const dimensionScores: Record<IntelligenceDimensionId, number> = {
      operational: 0,
      analytical: 0,
      strategic: 0,
      collaborative: 0,
      adaptive: 0
    }

    // Calculate weighted scores for each dimension
    Object.entries(INTELLIGENCE_DIMENSIONS).forEach(([dimensionId, dimension]) => {
      const dimensionQuestions = ASSESSMENT_QUESTIONS.filter(q => q.dimension === dimensionId)
      let totalScore = 0
      let totalWeight = 0

      dimensionQuestions.forEach(question => {
        const answer = answers[question.id]
        if (answer !== undefined) {
          totalScore += answer * question.weight
          totalWeight += question.weight
        }
      })

      dimensionScores[dimensionId as IntelligenceDimensionId] = totalWeight > 0 ? totalScore / totalWeight : 0
    })

    // Calculate overall intelligence score
    const overallScore = Object.values(dimensionScores).reduce((sum, score) => sum + score, 0) / 5

    // Calculate intelligence multiplier potential
    const intelligenceMultiplier = Math.pow(overallScore / 100, 2) * 10 + 1 // 1x to 11x range

    // Calculate consciousness level  
    const consciousnessLevel = Math.min(10, overallScore / 10)

    // Identify blockers and recommendations
    const blockers: string[] = []
    const recommendations: string[] = []
    const nextSteps: string[] = []

    Object.entries(dimensionScores).forEach(([dimensionId, score]) => {
      const dimension = INTELLIGENCE_DIMENSIONS[dimensionId as IntelligenceDimensionId]
      
      if (score < 40) {
        blockers.push(`${dimension.name}: Critical intelligence gap preventing exponential growth`)
        recommendations.push(`Focus immediately on ${dimension.description.toLowerCase()}`)
        nextSteps.push(`Implement ${dimension.name} enhancement protocol`)
      } else if (score < 70) {
        recommendations.push(`Strengthen ${dimension.name} for higher multiplication potential`)
        nextSteps.push(`Optimize ${dimension.name} through targeted consciousness exercises`)
      } else if (score >= 85) {
        recommendations.push(`${dimension.name} shows transcendent potential - ready for consciousness multiplication`)
      }
    })

    // Add intelligence multiplication insights
    if (intelligenceMultiplier < 2) {
      blockers.push('Intelligence multiplication blocked - operating in linear addition mode')
      nextSteps.push('Begin consciousness transformation to unlock exponential intelligence')
    } else if (intelligenceMultiplier >= 5) {
      recommendations.push('Exceptional intelligence multiplication potential detected')
      nextSteps.push('Ready for advanced consciousness protocols and business transcendence')
    }

    return {
      overallScore,
      dimensionScores,
      intelligenceMultiplier,
      consciousnessLevel,
      blockers,
      recommendations,
      nextSteps
    }
  }, [answers])

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }))
    
    // Trigger consciousness audio
    consciousnessAudio.playDepartmentAwakening(questionId)
    
    // Auto-advance after short delay
    setTimeout(() => {
      if (currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
      } else {
        // Assessment complete
        setIsCalculating(true)
        setTimeout(() => {
          const result = calculateResult
          if (result) {
            setAssessmentResult(result)
            setCurrentStep('results')
            onComplete?.(result)
            
            // Trigger consciousness emergence if high score
            if (result.consciousnessLevel >= 7) {
              consciousnessAudio.playConsciousnessEmergence()
            } else if (result.intelligenceMultiplier >= 3) {
              consciousnessAudio.playMultiplicationSound()
            }
          }
          setIsCalculating(false)
        }, 2000)
      }
    }, 800)
  }

  const startAssessment = () => {
    setCurrentStep('assessment')
    consciousnessAudio.playConnectionSound()
  }

  const resetAssessment = () => {
    setCurrentStep('intro')
    setCurrentQuestionIndex(0)
    setAnswers({})
    setAssessmentResult(null)
  }

  return (
    <div className={`bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-8 rounded-2xl border border-purple-700 ${className}`}>
      <AnimatePresence mode="wait">
        {currentStep === 'intro' && (
          <IntroScreen onStart={startAssessment} />
        )}
        
        {currentStep === 'assessment' && (
          <AssessmentScreen
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={ASSESSMENT_QUESTIONS.length}
            progress={progress}
            onAnswerSelect={handleAnswerSelect}
            isCalculating={isCalculating}
            showVisualization={showVisualization}
          />
        )}
        
        {currentStep === 'results' && assessmentResult && (
          <ResultsScreen 
            result={assessmentResult}
            onReset={resetAssessment}
            showVisualization={showVisualization}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Intro screen component
const IntroScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="text-center space-y-8"
  >
    <div className="space-y-4">
      <h2 className="text-5xl font-thin text-white mb-4">
        🧠 Intelligence Assessment
      </h2>
      <p className="text-xl text-purple-300 max-w-3xl mx-auto">
        Discover your business consciousness potential and identify what's preventing 
        exponential intelligence multiplication in your organization.
      </p>
    </div>

    <div className="grid md:grid-cols-5 gap-6 my-12">
      {Object.values(INTELLIGENCE_DIMENSIONS).map((dimension) => (
        <motion.div
          key={dimension.id}
          className="bg-white/5 backdrop-blur-xl p-6 rounded-xl border border-white/10"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-4xl mb-3">{dimension.icon}</div>
          <h3 className="text-lg font-semibold text-white mb-2">{dimension.name}</h3>
          <p className="text-sm text-gray-300">{dimension.description}</p>
        </motion.div>
      ))}
    </div>

    <motion.button
      onClick={onStart}
      className="px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white font-bold text-lg shadow-2xl"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Begin Intelligence Assessment
    </motion.button>

    <p className="text-sm text-gray-400">
      ⏱️ Takes 5-7 minutes • Measures 5 intelligence dimensions • Provides consciousness-level insights
    </p>
  </motion.div>
)

// Assessment screen component  
const AssessmentScreen: React.FC<{
  question: AssessmentQuestion
  questionIndex: number
  totalQuestions: number
  progress: number
  onAnswerSelect: (questionId: string, score: number) => void
  isCalculating: boolean
  showVisualization: boolean
}> = ({ question, questionIndex, totalQuestions, progress, onAnswerSelect, isCalculating, showVisualization }) => {
  const dimension = INTELLIGENCE_DIMENSIONS[question.dimension]

  if (isCalculating) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-8 py-12"
      >
        <div className="text-6xl">🧠</div>
        <h3 className="text-3xl font-thin text-white">Calculating Intelligence Multiplication Potential...</h3>
        <div className="w-full max-w-md mx-auto bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-cyan-400 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2 }}
          />
        </div>
        <p className="text-purple-300">Analyzing consciousness patterns and intelligence blockers...</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      key={questionIndex}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Progress and Question Info */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
          <div className="flex items-center space-x-2">
            <div className="text-2xl">{dimension.icon}</div>
            <span className="text-sm font-semibold" style={{ color: dimension.color }}>
              {dimension.name}
            </span>
          </div>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-cyan-400 h-2 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-light text-white max-w-3xl mx-auto">
          {question.text}
        </h3>
        <p className="text-purple-300">
          {dimension.description}
        </p>
      </div>

      {/* Answer Choices */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {question.choices.map((choice, index) => (
          <motion.button
            key={index}
            onClick={() => onAnswerSelect(question.id, choice.score)}
            className="w-full p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-left hover:border-purple-400/50 hover:bg-white/10 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-white font-medium">{choice.text}</div>
                <div className="text-sm text-gray-400 mt-1">{choice.insight}</div>
              </div>
              <div className="text-right ml-4">
                <div className="text-xs text-purple-400">Intelligence Score</div>
                <div className="text-lg font-bold text-white">{choice.score}</div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// Results screen component
const ResultsScreen: React.FC<{
  result: AssessmentResult
  onReset: () => void  
  showVisualization: boolean
}> = ({ result, onReset, showVisualization }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    {/* Overall Results */}
    <div className="text-center space-y-4">
      <h2 className="text-4xl font-thin text-white">🧠 Your Intelligence Profile</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/20">
          <div className="text-3xl font-bold text-cyan-400">{result.overallScore.toFixed(0)}</div>
          <div className="text-sm text-gray-300">Overall Intelligence Score</div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/20">
          <div className="text-3xl font-bold text-purple-400">{result.intelligenceMultiplier.toFixed(1)}x</div>
          <div className="text-sm text-gray-300">Multiplication Potential</div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/20">
          <div className="text-3xl font-bold text-indigo-400">{result.consciousnessLevel.toFixed(1)}</div>
          <div className="text-sm text-gray-300">Consciousness Level</div>
        </div>
      </div>
    </div>

    {/* Dimension Breakdown */}
    <div className="space-y-4">
      <h3 className="text-2xl text-white text-center">Intelligence Dimensions</h3>
      <div className="grid md:grid-cols-5 gap-4">
        {Object.entries(result.dimensionScores).map(([dimensionId, score]) => {
          const dimension = INTELLIGENCE_DIMENSIONS[dimensionId as IntelligenceDimensionId]
          return (
            <div key={dimensionId} className="bg-black/30 p-4 rounded-xl text-center">
              <div className="text-2xl mb-2">{dimension.icon}</div>
              <div className="text-lg font-bold text-white">{score.toFixed(0)}</div>
              <div className="text-xs text-gray-400">{dimension.name}</div>
              <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                <div 
                  className="h-1 rounded-full"
                  style={{ 
                    width: `${score}%`,
                    backgroundColor: dimension.color
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>

    {/* Intelligence Visualization */}
    {showVisualization && (
      <IntelligenceVisualization 
        dimensionScores={result.dimensionScores}
        intelligenceMultiplier={result.intelligenceMultiplier}
      />
    )}

    {/* Blockers and Recommendations */}
    <div className="grid md:grid-cols-2 gap-6">
      {result.blockers.length > 0 && (
        <div className="bg-red-900/20 border border-red-700 p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-red-400 mb-4">🚫 Intelligence Blockers</h4>
          <div className="space-y-2">
            {result.blockers.map((blocker, index) => (
              <div key={index} className="text-sm text-red-300">• {blocker}</div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-green-900/20 border border-green-700 p-6 rounded-xl">
        <h4 className="text-lg font-semibold text-green-400 mb-4">💡 Recommendations</h4>
        <div className="space-y-2">
          {result.recommendations.slice(0, 5).map((rec, index) => (
            <div key={index} className="text-sm text-green-300">• {rec}</div>
          ))}
        </div>
      </div>
    </div>

    {/* Next Steps */}
    <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-700 p-6 rounded-xl">
      <h4 className="text-lg font-semibold text-purple-400 mb-4">🚀 Next Steps</h4>
      <div className="space-y-2">
        {result.nextSteps.slice(0, 3).map((step, index) => (
          <div key={index} className="text-sm text-purple-300">
            {index + 1}. {step}
          </div>
        ))}
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex justify-center space-x-4">
      <motion.button
        onClick={onReset}
        className="px-6 py-3 bg-gray-700 rounded-xl text-white hover:bg-gray-600"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Take Again
      </motion.button>
      <motion.button
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Get Personalized Plan
      </motion.button>
    </div>
  </motion.div>
)

// Intelligence visualization component
const IntelligenceVisualization: React.FC<{
  dimensionScores: Record<IntelligenceDimensionId, number>
  intelligenceMultiplier: number
}> = ({ dimensionScores, intelligenceMultiplier }) => {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.1
    }
  })

  return (
    <div className="h-80 bg-black/30 rounded-xl border border-gray-700">
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
        
        <group ref={groupRef}>
          {/* Intelligence dimension spheres */}
          {Object.entries(dimensionScores).map(([dimensionId, score], index) => {
            const dimension = INTELLIGENCE_DIMENSIONS[dimensionId as IntelligenceDimensionId]
            const angle = (index / 5) * Math.PI * 2
            const radius = 4
            const size = (score / 100) * 0.8 + 0.2 // 0.2 to 1.0 size range
            
            return (
              <Float key={dimensionId} speed={1} rotationIntensity={0.1}>
                <Sphere
                  position={[
                    Math.cos(angle) * radius,
                    Math.sin(index * 0.3) * 2,
                    Math.sin(angle) * radius
                  ]}
                  args={[size, 32, 32]}
                >
                  <meshPhysicalMaterial 
                    color={dimension.color}
                    emissive={dimension.color}
                    emissiveIntensity={0.2}
                    transparent
                    opacity={0.8}
                  />
                </Sphere>
              </Float>
            )
          })}
          
          {/* Central intelligence multiplier */}
          <Float speed={0.5} floatIntensity={0.2}>
            <Text3D
              font="/fonts/inter-bold.json"
              size={1}
              height={0.2}
              position={[0, 0, 0]}
              textAlign="center"
            >
              {intelligenceMultiplier.toFixed(1)}x
              <meshStandardMaterial color="#ffffff" emissive="#8b5cf6" emissiveIntensity={0.3} />
            </Text3D>
          </Float>
        </group>
        
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}

export default IntelligenceAssessmentTool