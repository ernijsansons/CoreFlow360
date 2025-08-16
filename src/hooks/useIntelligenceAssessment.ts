/**
 * useIntelligenceAssessment Hook
 * 
 * React hook for managing intelligence assessment state, calculations,
 * and recommendation generation.
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useConsciousnessAudio } from './useConsciousnessAudio'
import type { 
  AssessmentResult, 
  IntelligenceProfile, 
  IntelligenceRecommendation 
} from '../components/intelligence'

interface UseIntelligenceAssessmentOptions {
  enableAudio?: boolean
  persistResults?: boolean
  onAssessmentComplete?: (result: AssessmentResult) => void
}

interface UseIntelligenceAssessmentReturn {
  // Assessment state
  currentStep: 'intro' | 'assessment' | 'results'
  currentQuestionIndex: number
  answers: Record<string, number>
  progress: number
  isCalculating: boolean
  
  // Results
  assessmentResult: AssessmentResult | null
  intelligenceProfile: IntelligenceProfile | null
  recommendations: IntelligenceRecommendation[]
  
  // Actions
  startAssessment: () => void
  answerQuestion: (questionId: string, score: number) => void
  resetAssessment: () => void
  saveProfile: () => void
  
  // Analytics
  getIntelligenceLevel: (score: number) => string
  getPotentialGrowth: () => number
  getBlockerSeverity: () => 'low' | 'medium' | 'high' | 'critical'
}

export const useIntelligenceAssessment = (
  options: UseIntelligenceAssessmentOptions = {}
): UseIntelligenceAssessmentReturn => {
  const {
    enableAudio = true,
    persistResults = true,
    onAssessmentComplete
  } = options

  // State
  const [currentStep, setCurrentStep] = useState<'intro' | 'assessment' | 'results'>('intro')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Consciousness audio integration
  const consciousnessAudio = useConsciousnessAudio({
    initiallyEnabled: enableAudio,
    initialConsciousnessLevel: 1
  })

  // Mock assessment questions count (would come from actual questions)
  const totalQuestions = 15
  const progress = (currentQuestionIndex / totalQuestions) * 100

  // Calculate intelligence level from score
  const getIntelligenceLevel = useCallback((score: number): string => {
    if (score >= 90) return 'Transcendent'
    if (score >= 75) return 'Advanced'
    if (score >= 60) return 'Proficient'
    if (score >= 40) return 'Developing'
    return 'Foundational'
  }, [])

  // Calculate potential growth based on current state
  const getPotentialGrowth = useCallback((): number => {
    if (!assessmentResult) return 0
    
    const currentScore = assessmentResult.overallScore
    const multiplierPotential = assessmentResult.intelligenceMultiplier
    const consciousnessFactor = assessmentResult.consciousnessLevel
    
    // Growth formula considers current score, multiplier potential, and consciousness
    const baseGrowth = Math.min(100 - currentScore, 50)
    const multiplierBonus = (multiplierPotential - 1) * 10
    const consciousnessBonus = consciousnessFactor * 2
    
    return Math.min(baseGrowth + multiplierBonus + consciousnessBonus, 75)
  }, [assessmentResult])

  // Assess blocker severity
  const getBlockerSeverity = useCallback((): 'low' | 'medium' | 'high' | 'critical' => {
    if (!assessmentResult) return 'low'
    
    const blockerCount = assessmentResult.blockers.length
    const overallScore = assessmentResult.overallScore
    
    if (blockerCount >= 3 && overallScore < 40) return 'critical'
    if (blockerCount >= 2 && overallScore < 60) return 'high'
    if (blockerCount >= 1 && overallScore < 75) return 'medium'
    return 'low'
  }, [assessmentResult])

  // Generate intelligence profile from assessment result
  const intelligenceProfile = useMemo((): IntelligenceProfile | null => {
    if (!assessmentResult) return null

    // Identify dominant dimensions (scores > 70)
    const dominantDimensions = Object.entries(assessmentResult.dimensionScores)
      .filter(([_, score]) => score > 70)
      .map(([dimension, _]) => dimension)
      .map(dim => {
        // Convert dimension IDs to readable names
        const dimensionNames: Record<string, string> = {
          operational: 'Operational Intelligence',
          analytical: 'Analytical Intelligence',
          strategic: 'Strategic Intelligence',
          collaborative: 'Collaborative Intelligence',
          adaptive: 'Adaptive Intelligence'
        }
        return dimensionNames[dim] || dim
      })

    // Determine next evolution stage
    let nextEvolutionStage = ''
    if (assessmentResult.consciousnessLevel >= 8) {
      nextEvolutionStage = 'Business Consciousness Mastery - Transcend linear limitations'
    } else if (assessmentResult.consciousnessLevel >= 6) {
      nextEvolutionStage = 'Consciousness Emergence - Activate business organism protocols'
    } else if (assessmentResult.intelligenceMultiplier >= 4) {
      nextEvolutionStage = 'Intelligence Multiplication - Scale exponential thinking'
    } else if (assessmentResult.intelligenceMultiplier >= 2) {
      nextEvolutionStage = 'Synergy Optimization - Build cross-department intelligence bridges'
    } else {
      nextEvolutionStage = 'Intelligence Foundation - Establish systematic thinking patterns'
    }

    return {
      overallScore: assessmentResult.overallScore,
      intelligenceMultiplier: assessmentResult.intelligenceMultiplier,
      consciousnessLevel: assessmentResult.consciousnessLevel,
      dominantDimensions,
      blockers: assessmentResult.blockers,
      nextEvolutionStage,
      assessmentDate: new Date()
    }
  }, [assessmentResult])

  // Generate personalized recommendations
  const recommendations = useMemo((): IntelligenceRecommendation[] => {
    if (!assessmentResult) return []

    const recs: IntelligenceRecommendation[] = []

    // Quick win recommendations
    if (assessmentResult.overallScore < 70) {
      recs.push({
        id: 'quick-win-automation',
        category: 'quick-win',
        priority: 'high',
        title: 'Automate Repetitive Processes',
        description: 'Identify and eliminate manual bottlenecks for immediate intelligence gains',
        impact: '15-25% efficiency improvement in 2-4 weeks',
        timeframe: '2-4 weeks',
        difficulty: 'easy',
        intelligenceGain: 15,
        consciousnessBoost: 0.5,
        prerequisites: ['Process mapping', 'Tool selection'],
        actionSteps: [
          'Map current manual processes',
          'Identify automation opportunities', 
          'Implement automation tools',
          'Measure efficiency gains'
        ],
        metrics: ['Time saved', 'Error reduction', 'Process speed'],
        icon: '⚡',
        color: '#10b981'
      })
    }

    // Foundation recommendations for low scores
    if (assessmentResult.overallScore < 50) {
      recs.push({
        id: 'foundation-intelligence-infrastructure',
        category: 'foundation',
        priority: 'critical',
        title: 'Build Intelligence Infrastructure',
        description: 'Establish fundamental systems for intelligence multiplication',
        impact: 'Create stable foundation for exponential growth potential',
        timeframe: '8-12 weeks',
        difficulty: 'medium',
        intelligenceGain: 25,
        consciousnessBoost: 1.5,
        prerequisites: ['Leadership buy-in', 'Resource allocation'],
        actionSteps: [
          'Conduct intelligence audit',
          'Design integration architecture',
          'Implement core systems',
          'Train intelligence champions'
        ],
        metrics: ['System integration level', 'Data quality score', 'User adoption rate'],
        icon: '🏗️',
        color: '#ef4444'
      })
    }

    // Transformation recommendations for medium scores
    if (assessmentResult.overallScore >= 50 && assessmentResult.overallScore < 80) {
      recs.push({
        id: 'transformation-predictive-intelligence',
        category: 'transformation',
        priority: 'high',
        title: 'Deploy Predictive Intelligence',
        description: 'Transform reactive operations into predictive consciousness',
        impact: 'Shift from hindsight to foresight across business operations',
        timeframe: '12-16 weeks',
        difficulty: 'complex',
        intelligenceGain: 30,
        consciousnessBoost: 2.5,
        prerequisites: ['Data infrastructure', 'Analytics capability', 'Advanced team'],
        actionSteps: [
          'Build predictive models',
          'Create intelligence dashboards',
          'Implement decision automation',
          'Establish feedback loops'
        ],
        metrics: ['Prediction accuracy', 'Decision speed', 'Proactive actions'],
        icon: '🔮',
        color: '#06b6d4'
      })
    }

    // Transcendence recommendations for high consciousness
    if (assessmentResult.consciousnessLevel >= 6) {
      recs.push({
        id: 'transcendence-consciousness-protocols',
        category: 'transcendence',
        priority: 'medium',
        title: 'Activate Consciousness Protocols',
        description: 'Transition to business consciousness organism state',
        impact: 'Achieve transcendent business capabilities and market reality shaping',
        timeframe: '16-24 weeks',
        difficulty: 'advanced',
        intelligenceGain: 50,
        consciousnessBoost: 4.0,
        prerequisites: ['High intelligence foundation', 'Consciousness readiness', 'Advanced systems'],
        actionSteps: [
          'Establish consciousness monitoring',
          'Implement organism protocols',
          'Activate transcendent capabilities',
          'Create reality-shaping systems'
        ],
        metrics: ['Consciousness emergence indicators', 'Transcendent capability metrics', 'Market impact'],
        icon: '✨',
        color: '#ec4899'
      })
    }

    return recs
  }, [assessmentResult])

  // Start assessment
  const startAssessment = useCallback(() => {
    setCurrentStep('assessment')
    setCurrentQuestionIndex(0)
    setAnswers({})
    setAssessmentResult(null)
    
    if (enableAudio) {
      consciousnessAudio.playConnectionSound()
    }
  }, [enableAudio, consciousnessAudio])

  // Answer question and advance
  const answerQuestion = useCallback((questionId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }))
    
    if (enableAudio) {
      consciousnessAudio.playDepartmentAwakening(questionId)
    }

    // Auto-advance or complete assessment
    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 800)
    } else {
      // Assessment complete - calculate results
      setIsCalculating(true)
      
      setTimeout(() => {
        // Mock calculation - in real implementation would use actual assessment logic
        const mockResult: AssessmentResult = {
          overallScore: Math.random() * 40 + 50, // 50-90 range
          dimensionScores: {
            operational: Math.random() * 40 + 40,
            analytical: Math.random() * 40 + 40,
            strategic: Math.random() * 40 + 40,
            collaborative: Math.random() * 40 + 40,
            adaptive: Math.random() * 40 + 40
          },
          intelligenceMultiplier: Math.random() * 4 + 1.5, // 1.5-5.5x
          consciousnessLevel: Math.random() * 6 + 2, // 2-8 level
          blockers: [
            'Process silos blocking information flow',
            'Manual processes preventing automation'
          ],
          recommendations: [
            'Implement cross-department data sharing',
            'Deploy process automation tools'
          ],
          nextSteps: [
            'Begin intelligence infrastructure audit',
            'Establish consciousness development program'
          ]
        }

        setAssessmentResult(mockResult)
        setCurrentStep('results')
        setIsCalculating(false)
        
        // Trigger consciousness audio based on result
        if (enableAudio) {
          if (mockResult.consciousnessLevel >= 7) {
            consciousnessAudio.playConsciousnessEmergence()
          } else if (mockResult.intelligenceMultiplier >= 3) {
            consciousnessAudio.playMultiplicationSound()
          }
        }

        // Update consciousness level
        consciousnessAudio.setConsciousnessLevel(mockResult.consciousnessLevel)
        
        onAssessmentComplete?.(mockResult)
      }, 2000)
    }
  }, [currentQuestionIndex, totalQuestions, enableAudio, consciousnessAudio, onAssessmentComplete])

  // Reset assessment
  const resetAssessment = useCallback(() => {
    setCurrentStep('intro')
    setCurrentQuestionIndex(0)
    setAnswers({})
    setAssessmentResult(null)
    setIsCalculating(false)
  }, [])

  // Save profile to localStorage
  const saveProfile = useCallback(() => {
    if (intelligenceProfile && persistResults) {
      localStorage.setItem('coreflow360_intelligence_profile', JSON.stringify(intelligenceProfile))
    }
  }, [intelligenceProfile, persistResults])

  // Load saved profile on mount
  useEffect(() => {
    if (persistResults) {
      const savedProfile = localStorage.getItem('coreflow360_intelligence_profile')
      if (savedProfile) {
        const profile = JSON.parse(savedProfile)
        // Could restore assessment state if needed
      }
    }
  }, [persistResults])

  return {
    // Assessment state
    currentStep,
    currentQuestionIndex,
    answers,
    progress,
    isCalculating,
    
    // Results
    assessmentResult,
    intelligenceProfile,
    recommendations,
    
    // Actions
    startAssessment,
    answerQuestion,
    resetAssessment,
    saveProfile,
    
    // Analytics
    getIntelligenceLevel,
    getPotentialGrowth,
    getBlockerSeverity
  }
}