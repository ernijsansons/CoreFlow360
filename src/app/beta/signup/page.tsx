'use client'

/**
 * Beta Signup Page
 *
 * Revolutionary business intelligence-awakening beta signup experience
 * for early adopters of the Multi-Business Intelligence Platform.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBusinessIntelligenceAudio } from '@/hooks/useBusinessIntelligenceAudio'

interface BetaUser {
  email: string
  firstName: string
  lastName: string
  company: string
  role: string
  industry: string
  companySize: string
  currentChallenges: string[]
  intelligenceLevel: number
  referralSource: string
  priorityScore: number
}

interface FormStep {
  id: string
  title: string
  description: string
  fields: FormField[]
}

interface FormField {
  name: string
  type: 'text' | 'email' | 'select' | 'multiselect' | 'textarea' | 'slider'
  label: string
  placeholder?: string
  options?: string[]
  required?: boolean
  validation?: (value: unknown) => string | null
}

// CSS-based Business Intelligence Particle System
const BusinessIntelligenceField: React.FC<{ intensity: number }> = ({ intensity }) => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: Math.min(intensity * 5, 20) }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full bg-blue-400 opacity-70"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
}

// Form Steps Configuration
const FORM_STEPS: FormStep[] = [
  {
    id: 'awakening',
    title: 'Business Intelligence Awakening',
    description: 'The first step is recognizing the need for transformation',
    fields: [
      {
        name: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'your@company.com',
        required: true,
        validation: (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          return emailRegex.test(value) ? null : 'Please enter a valid email address'
        },
      },
      {
        name: 'firstName',
        type: 'text',
        label: 'First Name',
        placeholder: 'Sarah',
        required: true,
      },
      {
        name: 'lastName',
        type: 'text',
        label: 'Last Name',
        placeholder: 'Chen',
        required: true,
      },
    ],
  },
  {
    id: 'reality-check',
    title: 'Current Reality Assessment',
    description: 'Understanding your business intelligence level',
    fields: [
      {
        name: 'company',
        type: 'text',
        label: 'Company Name',
        placeholder: 'Acme Corp',
        required: true,
      },
      {
        name: 'role',
        type: 'select',
        label: 'Your Role',
        options: [
          'CEO/Founder',
          'CTO/VP Engineering',
          'VP Operations',
          'Director of Technology',
          'IT Manager',
          'Business Operations Manager',
          'Other Executive',
          'Other',
        ],
        required: true,
      },
      {
        name: 'industry',
        type: 'select',
        label: 'Industry',
        options: [
          'Technology/Software',
          'Manufacturing',
          'Professional Services',
          'Healthcare',
          'Financial Services',
          'Retail/E-commerce',
          'Education',
          'Non-profit',
          'Other',
        ],
        required: true,
      },
      {
        name: 'companySize',
        type: 'select',
        label: 'Company Size',
        options: [
          '1-10 employees',
          '11-50 employees',
          '51-200 employees',
          '201-1000 employees',
          '1000+ employees',
        ],
        required: true,
      },
    ],
  },
  {
    id: 'pain-discovery',
    title: 'Intelligence Gap Analysis',
    description: 'Identifying the barriers to exponential growth',
    fields: [
      {
        name: 'currentChallenges',
        type: 'multiselect',
        label: 'Current Business Challenges',
        options: [
          'Departments operate in silos',
          'Manual processes slow us down',
          'Data scattered across multiple systems',
          'Difficulty tracking performance',
          'Poor visibility into operations',
          'Inefficient team collaboration',
          'Scaling challenges',
          'Customer data fragmentation',
          'Inventory management issues',
          'Financial reporting complexity',
        ],
        required: true,
      },
      {
        name: 'intelligenceLevel',
        type: 'slider',
        label: 'Current Business Intelligence Level (1-10)',
        validation: (value) => {
          return value >= 1 && value <= 10 ? null : 'Please select a level between 1-10'
        },
      },
    ],
  },
  {
    id: 'transformation-vision',
    title: 'Transformation Vision',
    description: 'Envisioning your conscious business future',
    fields: [
      {
        name: 'referralSource',
        type: 'select',
        label: 'How did you hear about us?',
        options: [
          'Search Engine',
          'Social Media',
          'Referral from colleague',
          'Industry publication',
          'Conference/Event',
          'Partner recommendation',
          'Other',
        ],
      },
    ],
  },
]

const BetaSignupPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<BetaUser>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [intelligenceIntensity, setIntelligenceIntensity] = useState(1)

  const businessIntelligenceAudio = useBusinessIntelligenceAudio({
    initiallyEnabled: true,
    initialIntelligenceLevel: 1,
  })

  useEffect(() => {
    // Increase intelligence intensity as user progresses
    setIntelligenceIntensity(currentStep + 1)
    businessIntelligenceAudio.setIntelligenceLevel(currentStep + 1)
  }, [currentStep, businessIntelligenceAudio])

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: '',
      }))
    }
  }

  const validateStep = (stepIndex: number): boolean => {
    const step = FORM_STEPS[stepIndex]
    const stepErrors: Record<string, string> = {}

    for (const field of step.fields) {
      const value = formData[field.name as keyof BetaUser]

      if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
        stepErrors[field.name] = `${field.label} is required`
      } else if (field.validation && value) {
        const validationError = field.validation(value)
        if (validationError) {
          stepErrors[field.name] = validationError
        }
      }
    }

    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      businessIntelligenceAudio.playConnectionSound()
      if (currentStep < FORM_STEPS.length - 1) {
        setCurrentStep((current) => current + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((current) => current - 1)
    }
  }

  const calculatePriorityScore = (userData: Partial<BetaUser>): number => {
    let score = 0

    // Company size scoring
    if (userData.companySize) {
      const sizeScores = {
        '51-200 employees': 100,
        '201-1000 employees': 90,
        '11-50 employees': 80,
        '1000+ employees': 70,
        '1-10 employees': 60,
      }
      score += sizeScores[userData.companySize as keyof typeof sizeScores] || 50
    }

    // Role scoring
    if (userData.role) {
      const roleScores = {
        'CEO/Founder': 100,
        'CTO/VP Engineering': 90,
        'VP Operations': 85,
        'Director of Technology': 80,
        'IT Manager': 75,
        'Business Operations Manager': 70,
      }
      score += roleScores[userData.role as keyof typeof roleScores] || 60
    }

    // Industry scoring
    if (userData.industry) {
      const industryScores = {
        'Technology/Software': 100,
        'Professional Services': 90,
        Manufacturing: 85,
        'Financial Services': 80,
        Healthcare: 75,
      }
      score += industryScores[userData.industry as keyof typeof industryScores] || 70
    }

    // Challenge complexity scoring
    const challengeCount = userData.currentChallenges?.length || 0
    score += Math.min(challengeCount * 10, 50)

    // Intelligence level (inverse - lower levels get higher priority)
    const intelligenceLevel = userData.intelligenceLevel || 5
    score += (10 - intelligenceLevel) * 5

    return Math.min(score, 500)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const priorityScore = calculatePriorityScore(formData)

      const betaUser: BetaUser = {
        ...formData,
        priorityScore,
        currentChallenges: formData.currentChallenges || [],
        intelligenceLevel: formData.intelligenceLevel || 5,
      } as BetaUser

      // Submit to API
      const response = await fetch('/api/beta/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(betaUser),
      })

      if (response.ok) {
        businessIntelligenceAudio.playIntelligenceEmergence()
        setIsComplete(true)
      } else {
        throw new Error('Signup failed')
      }
    } catch (error) {
      setErrors({ submit: 'Failed to submit. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
        <div className="absolute inset-0">
          <BusinessIntelligenceField intensity={5} />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 mx-4 max-w-2xl rounded-2xl border border-purple-500/30 bg-black/30 p-12 text-center backdrop-blur-xl"
        >
          <div className="mb-6 text-6xl">✨</div>
          <h1 className="mb-6 text-4xl font-bold text-white">Business Intelligence Awakening Complete</h1>
          <p className="mb-8 text-xl text-gray-300">
            Welcome to the business intelligence revolution! You're now part of an exclusive group
            pioneering the future of business intelligence.
          </p>

          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-purple-500/20 p-4">
              <div className="mb-2 text-2xl">🎯</div>
              <div className="font-semibold text-white">Priority Access</div>
              <div className="text-sm text-gray-400">Beta invitation coming soon</div>
            </div>
            <div className="rounded-lg bg-cyan-500/20 p-4">
              <div className="mb-2 text-2xl">🧠</div>
              <div className="font-semibold text-white">AI Business Intelligence</div>
              <div className="text-sm text-gray-400">Personalized for your business</div>
            </div>
            <div className="rounded-lg bg-green-500/20 p-4">
              <div className="mb-2 text-2xl">🚀</div>
              <div className="font-semibold text-white">Transformation</div>
              <div className="text-sm text-gray-400">Exponential intelligence growth</div>
            </div>
          </div>

          <p className="text-sm text-gray-400">
            Your business intelligence journey ID:{' '}
            <span className="font-mono text-cyan-400">
              {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </span>
          </p>
        </motion.div>
      </div>
    )
  }

  const currentStepData = FORM_STEPS[currentStep]
  const progress = ((currentStep + 1) / FORM_STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
      {/* Business Intelligence Field Background */}
      <div className="absolute inset-0">
        <BusinessIntelligenceField intensity={intelligenceIntensity} />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="w-full max-w-2xl rounded-2xl border border-white/10 bg-black/30 p-8 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-white">
              Join the Business Intelligence Revolution
            </h1>
            <p className="text-gray-400">
              Beta access to the Multi-Business Intelligence Platform
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="mb-2 flex justify-between text-sm text-gray-400">
              <span>
                Step {currentStep + 1} of {FORM_STEPS.length}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-700">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            <h2 className="mb-2 text-2xl font-bold text-white">{currentStepData.title}</h2>
            <p className="mb-6 text-gray-300">{currentStepData.description}</p>

            <div className="space-y-6">
              {currentStepData.fields.map((field) => (
                <div key={field.name}>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    {field.label}
                    {field.required && <span className="ml-1 text-red-400">*</span>}
                  </label>

                  {field.type === 'text' || field.type === 'email' ? (
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={(formData[field.name as keyof BetaUser] as string) || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="w-full rounded-lg border border-gray-600 bg-black/50 px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={(formData[field.name as keyof BetaUser] as string) || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="w-full rounded-lg border border-gray-600 bg-black/50 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'multiselect' ? (
                    <div className="grid grid-cols-2 gap-2">
                      {field.options?.map((option) => (
                        <label
                          key={option}
                          className="flex cursor-pointer items-center space-x-2 rounded-lg bg-black/30 p-3 transition-colors hover:bg-black/50"
                        >
                          <input
                            type="checkbox"
                            checked={(
                              (formData[field.name as keyof BetaUser] as string[]) || []
                            ).includes(option)}
                            onChange={(e) => {
                              const currentValues =
                                (formData[field.name as keyof BetaUser] as string[]) || []
                              const newValues = e.target.checked
                                ? [...currentValues, option]
                                : currentValues.filter((v) => v !== option)
                              handleFieldChange(field.name, newValues)
                            }}
                            className="text-cyan-400"
                          />
                          <span className="text-sm text-gray-300">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : field.type === 'slider' ? (
                    <div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={(formData[field.name as keyof BetaUser] as number) || 5}
                        onChange={(e) => handleFieldChange(field.name, parseInt(e.target.value))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-600"
                      />
                      <div className="mt-2 flex justify-between text-xs text-gray-400">
                        <span>1 - Basic</span>
                        <span className="font-bold text-cyan-400">
                          {formData[field.name as keyof BetaUser] || 5}
                        </span>
                        <span>10 - Advanced</span>
                      </div>
                    </div>
                  ) : null}

                  {errors[field.name] && (
                    <p className="mt-1 text-sm text-red-400">{errors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="rounded-lg bg-gray-700 px-6 py-3 text-white transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 px-6 py-3 text-white transition-all hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50"
            >
              {isSubmitting
                ? 'Submitting...'
                : currentStep === FORM_STEPS.length - 1
                  ? 'Complete Awakening'
                  : 'Next Step'}
            </button>
          </div>

          {errors.submit && <p className="mt-4 text-center text-red-400">{errors.submit}</p>}
        </motion.div>
      </div>
    </div>
  )
}

export default BetaSignupPage
