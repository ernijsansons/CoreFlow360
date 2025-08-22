'use client'

/**
 * Lead Qualification Workflow
 * 
 * Interactive BANT qualification system with multi-business assessment
 * and progressive pricing evaluation for CoreFlow360 leads.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface QualificationStep {
  id: string
  title: string
  description: string
  type: 'QUESTION' | 'ASSESSMENT' | 'VALIDATION' | 'SCORING'
  required: boolean
  completed: boolean
  response?: any
}

interface QualificationWorkflow {
  id: string
  leadId: string
  leadName: string
  companyName: string
  workflowName: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  currentStage: string
  completedStages: string[]
  stepsTotal: number
  stepsCompleted: number
  progressPercentage: number
  
  // BANT Qualification
  isDecisionMaker?: boolean
  hasBudget?: boolean
  hasAuthority?: boolean
  hasNeed?: boolean
  hasTimeline?: boolean
  
  // BANT Details
  budgetRange?: string
  authorityLevel?: string
  needUrgency?: string
  timelineExpected?: string
  
  // Multi-Business Qualification
  businessesCurrent?: number
  businessesPlanned?: number
  crossBusinessPain?: string
  currentSolutions?: string[]
  
  // Progressive Pricing Qualification
  priceAwareness?: boolean
  discountExpectation?: number
  competitorComparison?: boolean
  valueUnderstanding?: boolean
  
  // Results
  qualificationScore?: number
  recommendedAction?: string
  nextSteps?: string
  assignedTo?: string
  
  // AI Insights
  aiConfidence?: number
  aiRecommendations?: any
  aiPredictedOutcome?: string
}

interface LeadQualificationWorkflowProps {
  leadId?: string
  workflowType?: 'BANT' | 'MULTI_BUSINESS' | 'PROGRESSIVE_PRICING' | 'COMPREHENSIVE'
  onWorkflowComplete?: (workflow: QualificationWorkflow) => void
  onStepComplete?: (stepId: string, response: any) => void
  className?: string
}

const LeadQualificationWorkflow: React.FC<LeadQualificationWorkflowProps> = ({
  leadId = 'demo-lead',
  workflowType = 'COMPREHENSIVE',
  onWorkflowComplete,
  onStepComplete,
  className = ''
}) => {
  const [workflow, setWorkflow] = useState<QualificationWorkflow | null>(null)
  const [currentStep, setCurrentStep] = useState<QualificationStep | null>(null)
  const [qualificationSteps, setQualificationSteps] = useState<QualificationStep[]>([])
  const [responses, setResponses] = useState<{ [key: string]: any }>({})
  const [isLoading, setIsLoading] = useState(false)

  // Initialize workflow
  useEffect(() => {
    initializeWorkflow()
  }, [leadId, workflowType])

  const initializeWorkflow = () => {
    // Mock workflow data - in production, fetch from API
    const mockWorkflow: QualificationWorkflow = {
      id: 'workflow-001',
      leadId,
      leadName: 'Sarah Martinez',
      companyName: 'TechFlow Enterprises',
      workflowName: `${workflowType} Qualification`,
      status: 'IN_PROGRESS',
      currentStage: 'BUDGET_ASSESSMENT',
      completedStages: ['INITIAL_ASSESSMENT'],
      stepsTotal: getStepsByWorkflowType(workflowType).length,
      stepsCompleted: 2,
      progressPercentage: 25
    }

    const steps = getStepsByWorkflowType(workflowType)
    
    setWorkflow(mockWorkflow)
    setQualificationSteps(steps)
    setCurrentStep(steps.find(step => !step.completed) || steps[0])
  }

  const getStepsByWorkflowType = (type: string): QualificationStep[] => {
    const baseSteps: QualificationStep[] = []

    if (type === 'BANT' || type === 'COMPREHENSIVE') {
      baseSteps.push(
        {
          id: 'budget-qualification',
          title: 'Budget Qualification',
          description: 'Assess budget availability and range',
          type: 'QUESTION',
          required: true,
          completed: false
        },
        {
          id: 'authority-assessment',
          title: 'Authority Assessment',
          description: 'Determine decision-making authority',
          type: 'QUESTION',
          required: true,
          completed: false
        },
        {
          id: 'need-evaluation',
          title: 'Need Evaluation',
          description: 'Evaluate business need and pain points',
          type: 'ASSESSMENT',
          required: true,
          completed: false
        },
        {
          id: 'timeline-qualification',
          title: 'Timeline Qualification',
          description: 'Establish implementation timeline',
          type: 'QUESTION',
          required: true,
          completed: false
        }
      )
    }

    if (type === 'MULTI_BUSINESS' || type === 'COMPREHENSIVE') {
      baseSteps.push(
        {
          id: 'business-count-assessment',
          title: 'Business Portfolio Assessment',
          description: 'Evaluate current and planned business count',
          type: 'ASSESSMENT',
          required: true,
          completed: false
        },
        {
          id: 'cross-business-pain',
          title: 'Cross-Business Pain Points',
          description: 'Identify multi-business operational challenges',
          type: 'ASSESSMENT',
          required: true,
          completed: false
        },
        {
          id: 'current-solutions-audit',
          title: 'Current Solutions Audit',
          description: 'Review existing business management tools',
          type: 'VALIDATION',
          required: false,
          completed: false
        }
      )
    }

    if (type === 'PROGRESSIVE_PRICING' || type === 'COMPREHENSIVE') {
      baseSteps.push(
        {
          id: 'pricing-awareness',
          title: 'Pricing Model Understanding',
          description: 'Assess understanding of progressive pricing',
          type: 'QUESTION',
          required: true,
          completed: false
        },
        {
          id: 'discount-expectations',
          title: 'Discount Expectations',
          description: 'Understand pricing expectations and flexibility',
          type: 'QUESTION',
          required: false,
          completed: false
        },
        {
          id: 'value-alignment',
          title: 'Value Proposition Alignment',
          description: 'Validate value understanding and ROI expectations',
          type: 'VALIDATION',
          required: true,
          completed: false
        }
      )
    }

    // Final scoring step
    baseSteps.push({
      id: 'final-scoring',
      title: 'Qualification Scoring',
      description: 'Calculate final qualification score and recommendations',
      type: 'SCORING',
      required: true,
      completed: false
    })

    return baseSteps
  }

  const handleStepResponse = (stepId: string, response: any) => {
    setResponses(prev => ({ ...prev, [stepId]: response }))
    
    // Mark step as completed
    setQualificationSteps(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { ...step, completed: true, response }
          : step
      )
    )

    // Update workflow progress
    const completedCount = qualificationSteps.filter(step => step.completed).length + 1
    setWorkflow(prev => prev ? {
      ...prev,
      stepsCompleted: completedCount,
      progressPercentage: Math.round((completedCount / qualificationSteps.length) * 100)
    } : null)

    // Move to next step
    const nextStep = qualificationSteps.find(step => !step.completed && step.id !== stepId)
    if (nextStep) {
      setCurrentStep(nextStep)
    } else {
      // Workflow complete
      completeWorkflow()
    }

    onStepComplete?.(stepId, response)
  }

  const completeWorkflow = async () => {
    setIsLoading(true)
    
    // Calculate qualification score based on responses
    const score = calculateQualificationScore(responses)
    const recommendation = generateRecommendation(score, responses)
    
    const completedWorkflow: QualificationWorkflow = {
      ...workflow!,
      status: 'COMPLETED',
      stepsCompleted: qualificationSteps.length,
      progressPercentage: 100,
      qualificationScore: score.total,
      recommendedAction: recommendation.action,
      nextSteps: recommendation.nextSteps,
      aiConfidence: score.confidence,
      aiPredictedOutcome: recommendation.outcome
    }

    setWorkflow(completedWorkflow)
    setIsLoading(false)
    
    onWorkflowComplete?.(completedWorkflow)
  }

  const calculateQualificationScore = (responses: { [key: string]: any }) => {
    let totalScore = 0
    let maxScore = 0
    const weights = {
      'budget-qualification': 25,
      'authority-assessment': 20,
      'need-evaluation': 20,
      'timeline-qualification': 15,
      'business-count-assessment': 30,
      'cross-business-pain': 20,
      'pricing-awareness': 15,
      'value-alignment': 20
    }

    Object.entries(responses).forEach(([stepId, response]) => {
      const weight = weights[stepId as keyof typeof weights] || 10
      maxScore += weight

      switch (stepId) {
        case 'budget-qualification':
          if (response?.budgetRange === '500K_PLUS') totalScore += weight
          else if (response?.budgetRange === '100K_500K') totalScore += weight * 0.8
          else if (response?.budgetRange === '50K_100K') totalScore += weight * 0.6
          else if (response?.budgetRange === '10K_50K') totalScore += weight * 0.4
          else totalScore += weight * 0.2
          break

        case 'authority-assessment':
          if (response?.authorityLevel === 'DECISION_MAKER') totalScore += weight
          else if (response?.authorityLevel === 'INFLUENCER') totalScore += weight * 0.7
          else if (response?.authorityLevel === 'EVALUATOR') totalScore += weight * 0.5
          else totalScore += weight * 0.3
          break

        case 'need-evaluation':
          if (response?.needUrgency === 'URGENT') totalScore += weight
          else if (response?.needUrgency === 'MODERATE') totalScore += weight * 0.7
          else if (response?.needUrgency === 'NICE_TO_HAVE') totalScore += weight * 0.4
          else totalScore += weight * 0.2
          break

        case 'timeline-qualification':
          if (response?.timelineExpected === 'IMMEDIATE') totalScore += weight
          else if (response?.timelineExpected === '30_DAYS') totalScore += weight * 0.8
          else if (response?.timelineExpected === '90_DAYS') totalScore += weight * 0.6
          else totalScore += weight * 0.3
          break

        case 'business-count-assessment':
          const businessCount = response?.businessesCurrent || 0
          if (businessCount >= 5) totalScore += weight
          else if (businessCount >= 3) totalScore += weight * 0.8
          else if (businessCount >= 2) totalScore += weight * 0.6
          else totalScore += weight * 0.3
          break

        case 'cross-business-pain':
          if (response?.painPoints?.length >= 3) totalScore += weight
          else if (response?.painPoints?.length >= 2) totalScore += weight * 0.7
          else if (response?.painPoints?.length >= 1) totalScore += weight * 0.5
          break

        case 'pricing-awareness':
          if (response?.priceAwareness) totalScore += weight
          else totalScore += weight * 0.3
          break

        case 'value-alignment':
          if (response?.valueUnderstanding) totalScore += weight
          else totalScore += weight * 0.4
          break
      }
    })

    const finalScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
    const confidence = Math.min(95, Math.max(60, finalScore))

    return {
      total: Math.round(finalScore),
      confidence: Math.round(confidence)
    }
  }

  const generateRecommendation = (score: { total: number, confidence: number }, responses: { [key: string]: any }) => {
    let action = 'NURTURE'
    let outcome = 'MEDIUM_PROBABILITY'
    let nextSteps = 'Continue nurturing with relevant content.'

    if (score.total >= 80) {
      action = 'SALES_QUALIFIED'
      outcome = 'HIGH_PROBABILITY'
      nextSteps = 'Schedule demo and present customized proposal.'
    } else if (score.total >= 60) {
      action = 'MARKETING_QUALIFIED'
      outcome = 'MEDIUM_PROBABILITY'
      nextSteps = 'Provide detailed case studies and ROI calculator.'
    } else if (score.total >= 40) {
      action = 'NURTURE'
      outcome = 'MEDIUM_PROBABILITY'
      nextSteps = 'Continue education with progressive pricing benefits.'
    } else {
      action = 'DISQUALIFY'
      outcome = 'LOW_PROBABILITY'
      nextSteps = 'Add to long-term nurture campaign.'
    }

    return { action, outcome, nextSteps }
  }

  const renderStepContent = (step: QualificationStep) => {
    switch (step.id) {
      case 'budget-qualification':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{step.title}</h3>
            <p className="text-gray-400">{step.description}</p>
            <div className="space-y-3">
              <label className="block text-sm text-gray-400">What is your approximate budget range for business management software?</label>
              <select 
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                onChange={(e) => handleStepResponse(step.id, { budgetRange: e.target.value, hasBudget: e.target.value !== 'UNKNOWN' })}
              >
                <option value="">Select budget range</option>
                <option value="500K_PLUS">$500K+ annually</option>
                <option value="100K_500K">$100K - $500K annually</option>
                <option value="50K_100K">$50K - $100K annually</option>
                <option value="10K_50K">$10K - $50K annually</option>
                <option value="UNDER_10K">Under $10K annually</option>
                <option value="UNKNOWN">Budget not yet determined</option>
              </select>
            </div>
          </div>
        )

      case 'authority-assessment':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{step.title}</h3>
            <p className="text-gray-400">{step.description}</p>
            <div className="space-y-3">
              <label className="block text-sm text-gray-400">What is your role in the decision-making process?</label>
              <select 
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                onChange={(e) => handleStepResponse(step.id, { authorityLevel: e.target.value, hasAuthority: ['DECISION_MAKER', 'INFLUENCER'].includes(e.target.value) })}
              >
                <option value="">Select your role</option>
                <option value="DECISION_MAKER">Final decision maker</option>
                <option value="INFLUENCER">Significant influence on decision</option>
                <option value="EVALUATOR">Part of evaluation team</option>
                <option value="USER">End user/researcher</option>
              </select>
            </div>
          </div>
        )

      case 'business-count-assessment':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{step.title}</h3>
            <p className="text-gray-400">{step.description}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">How many businesses do you currently operate?</label>
                <input 
                  type="number"
                  min="1"
                  max="20"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  onChange={(e) => setResponses(prev => ({ ...prev, businessesCurrent: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Do you plan to acquire or start additional businesses in the next 2 years?</label>
                <input 
                  type="number"
                  min="0"
                  max="10"
                  placeholder="Number of planned businesses"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  onChange={(e) => setResponses(prev => ({ ...prev, businessesPlanned: parseInt(e.target.value) }))}
                />
              </div>
              <button 
                onClick={() => handleStepResponse(step.id, responses)}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-500 hover:to-cyan-500"
              >
                Continue
              </button>
            </div>
          </div>
        )

      case 'cross-business-pain':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{step.title}</h3>
            <p className="text-gray-400">{step.description}</p>
            <div className="space-y-3">
              <label className="block text-sm text-gray-400">What are your biggest challenges managing multiple businesses? (Select all that apply)</label>
              <div className="space-y-2">
                {[
                  'Data is siloed across different systems',
                  'No unified view of performance across businesses',
                  'Duplicate processes and inefficiencies',
                  'Difficulty sharing resources between businesses',
                  'Manual reporting and consolidation',
                  'Inconsistent customer experiences',
                  'Limited cross-business insights'
                ].map((painPoint) => (
                  <label key={painPoint} className="flex items-center space-x-2 text-white">
                    <input 
                      type="checkbox"
                      className="rounded bg-gray-800 border-gray-600"
                      onChange={(e) => {
                        const current = responses.painPoints || []
                        const updated = e.target.checked 
                          ? [...current, painPoint]
                          : current.filter((p: string) => p !== painPoint)
                        setResponses(prev => ({ ...prev, painPoints: updated }))
                      }}
                    />
                    <span className="text-sm">{painPoint}</span>
                  </label>
                ))}
              </div>
              <button 
                onClick={() => handleStepResponse(step.id, responses)}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-500 hover:to-cyan-500"
              >
                Continue
              </button>
            </div>
          </div>
        )

      case 'pricing-awareness':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{step.title}</h3>
            <p className="text-gray-400">{step.description}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Are you familiar with progressive pricing models that offer discounts based on business count?</label>
                <select 
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  onChange={(e) => setResponses(prev => ({ ...prev, priceAwareness: e.target.value === 'yes' }))}
                >
                  <option value="">Select option</option>
                  <option value="yes">Yes, I understand progressive pricing</option>
                  <option value="no">No, please explain</option>
                  <option value="partial">Somewhat familiar</option>
                </select>
              </div>
              <button 
                onClick={() => handleStepResponse(step.id, responses)}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-500 hover:to-cyan-500"
              >
                Continue
              </button>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{step.title}</h3>
            <p className="text-gray-400">{step.description}</p>
            <button 
              onClick={() => handleStepResponse(step.id, { completed: true })}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-500 hover:to-cyan-500"
            >
              Complete Step
            </button>
          </div>
        )
    }
  }

  if (!workflow || !currentStep) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading qualification workflow...</div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Workflow Header */}
      <div className="rounded-2xl border border-gray-700 bg-gradient-to-r from-gray-900 to-black p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">{workflow.workflowName}</h2>
            <p className="text-gray-400">{workflow.leadName} • {workflow.companyName}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-cyan-400">{workflow.progressPercentage}%</div>
            <div className="text-sm text-gray-400">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Step {workflow.stepsCompleted} of {workflow.stepsTotal}</span>
            <span>{workflow.status}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full">
            <div 
              className="h-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${workflow.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex flex-wrap gap-2">
          {qualificationSteps.map((step, index) => (
            <div 
              key={step.id}
              className={`px-3 py-1 rounded-lg text-xs font-medium ${
                step.completed 
                  ? 'bg-green-500/20 text-green-400' 
                  : step.id === currentStep.id
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {index + 1}. {step.title}
              {step.completed && ' ✓'}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step */}
      {workflow.status !== 'COMPLETED' && (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent(currentStep)}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Workflow Results */}
      {workflow.status === 'COMPLETED' && (
        <div className="rounded-xl border border-green-700 bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-6">
          <h3 className="text-xl font-bold text-white mb-4">🎉 Qualification Complete</h3>
          
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{workflow.qualificationScore}</div>
              <div className="text-sm text-gray-400">Qualification Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{workflow.recommendedAction?.replace('_', ' ')}</div>
              <div className="text-sm text-gray-400">Recommended Action</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-cyan-400">{workflow.aiConfidence}%</div>
              <div className="text-sm text-gray-400">AI Confidence</div>
            </div>
          </div>

          <div className="bg-black/30 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Next Steps:</h4>
            <p className="text-gray-300">{workflow.nextSteps}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-white">Calculating qualification score...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeadQualificationWorkflow