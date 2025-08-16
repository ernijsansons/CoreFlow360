/**
 * CoreFlow360 Intelligence Assessment Components
 * 
 * Revolutionary intelligence assessment and recommendation system that measures
 * business consciousness potential and provides personalized transformation paths.
 */

export { default as IntelligenceAssessmentTool } from './IntelligenceAssessmentTool'
export { default as IntelligenceProfileCard } from './IntelligenceProfileCard'  
export { default as IntelligenceRecommendationEngine } from './IntelligenceRecommendationEngine'

// Intelligence assessment types
export interface IntelligenceDimension {
  id: string
  name: string
  icon: string
  color: string
  description: string
  maxScore: number
}

export interface AssessmentQuestion {
  id: string
  dimension: string
  text: string
  weight: number
  choices: {
    text: string
    score: number
    insight: string
  }[]
}

export interface AssessmentResult {
  overallScore: number
  dimensionScores: Record<string, number>
  intelligenceMultiplier: number
  consciousnessLevel: number
  blockers: string[]
  recommendations: string[]
  nextSteps: string[]
}

export interface IntelligenceProfile {
  overallScore: number
  intelligenceMultiplier: number
  consciousnessLevel: number
  dominantDimensions: string[]
  blockers: string[]
  nextEvolutionStage: string
  assessmentDate: Date
}

export interface IntelligenceRecommendation {
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