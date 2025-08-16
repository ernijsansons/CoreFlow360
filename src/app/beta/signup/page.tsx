'use client'

/**
 * Beta Signup Page
 * 
 * Revolutionary consciousness-awakening beta signup experience
 * for early adopters of the world's first conscious business platform.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, Float, Text3D } from '@react-three/drei'
import * as THREE from 'three'
import { useConsciousnessAudio } from '../../../hooks/useConsciousnessAudio'

interface BetaUser {
  email: string
  firstName: string
  lastName: string
  company: string
  role: string
  industry: string
  companySize: string
  currentChallenges: string[]
  consciousnessLevel: number
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
  validation?: (value: any) => string | null
}

// Consciousness Particle System
const ConsciousnessField: React.FC<{ intensity: number }> = ({ intensity }) => {
  const meshRef = React.useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      meshRef.current.children.forEach((child, i) => {
        child.position.y = Math.sin(state.clock.elapsedTime + i) * 0.5
      })
    }
  })

  return (
    <group ref={meshRef}>
      {Array.from({ length: intensity * 10 }).map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Sphere
            position={[
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 10
            ]}
            args={[0.1, 8, 8]}
          >
            <meshStandardMaterial
              color={`hsl(${180 + i * 10}, 70%, ${50 + Math.random() * 30}%)`}
              emissive={`hsl(${180 + i * 10}, 70%, 20%)`}
              emissiveIntensity={0.3}
            />
          </Sphere>
        </Float>
      ))}
    </group>
  )
}

// Form Steps Configuration
const FORM_STEPS: FormStep[] = [
  {
    id: 'awakening',
    title: 'Consciousness Awakening',
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
        }
      },
      {
        name: 'firstName',
        type: 'text',
        label: 'First Name',
        placeholder: 'Sarah',
        required: true
      },
      {
        name: 'lastName',
        type: 'text',
        label: 'Last Name',
        placeholder: 'Chen',
        required: true
      }
    ]
  },
  {
    id: 'reality-check',
    title: 'Current Reality Assessment',
    description: 'Understanding your business consciousness level',
    fields: [
      {
        name: 'company',
        type: 'text',
        label: 'Company Name',
        placeholder: 'Acme Corp',
        required: true
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
          'Other'
        ],
        required: true
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
          'Other'
        ],
        required: true
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
          '1000+ employees'
        ],
        required: true
      }
    ]
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
          'Financial reporting complexity'
        ],
        required: true
      },
      {
        name: 'consciousnessLevel',
        type: 'slider',
        label: 'Current Business Intelligence Level (1-10)',
        validation: (value) => {
          return value >= 1 && value <= 10 ? null : 'Please select a level between 1-10'
        }
      }
    ]
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
          'Other'
        ]
      }
    ]
  }
]

const BetaSignupPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<BetaUser>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [consciousnessIntensity, setConsciousnessIntensity] = useState(1)

  const consciousnessAudio = useConsciousnessAudio({
    initiallyEnabled: true,
    initialConsciousnessLevel: 1
  })

  useEffect(() => {
    // Increase consciousness intensity as user progresses
    setConsciousnessIntensity(currentStep + 1)
    consciousnessAudio.updateConsciousnessLevel(currentStep + 1)
  }, [currentStep, consciousnessAudio])

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
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
      consciousnessAudio.playConnectionSound()
      if (currentStep < FORM_STEPS.length - 1) {
        setCurrentStep(current => current + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(current => current - 1)
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
        '1-10 employees': 60
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
        'Business Operations Manager': 70
      }
      score += roleScores[userData.role as keyof typeof roleScores] || 60
    }
    
    // Industry scoring
    if (userData.industry) {
      const industryScores = {
        'Technology/Software': 100,
        'Professional Services': 90,
        'Manufacturing': 85,
        'Financial Services': 80,
        'Healthcare': 75
      }
      score += industryScores[userData.industry as keyof typeof industryScores] || 70
    }
    
    // Challenge complexity scoring
    const challengeCount = userData.currentChallenges?.length || 0
    score += Math.min(challengeCount * 10, 50)
    
    // Consciousness level (inverse - lower levels get higher priority)
    const consciousnessLevel = userData.consciousnessLevel || 5
    score += (10 - consciousnessLevel) * 5
    
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
        consciousnessLevel: formData.consciousnessLevel || 5
      } as BetaUser
      
      // Submit to API
      const response = await fetch('/api/beta/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(betaUser)
      })
      
      if (response.ok) {
        consciousnessAudio.playSuccessSound()
        setIsComplete(true)
      } else {
        throw new Error('Signup failed')
      }
    } catch (error) {
      console.error('Beta signup error:', error)
      setErrors({ submit: 'Failed to submit. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center">
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} />
            <ConsciousnessField intensity={5} />
          </Canvas>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center bg-black/30 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-12 max-w-2xl mx-4"
        >
          <div className="text-6xl mb-6">✨</div>
          <h1 className="text-4xl font-bold text-white mb-6">
            Consciousness Awakening Complete
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Welcome to the consciousness revolution! You're now part of an exclusive group 
            pioneering the future of business intelligence.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-purple-500/20 rounded-lg p-4">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-white font-semibold">Priority Access</div>
              <div className="text-sm text-gray-400">Beta invitation coming soon</div>
            </div>
            <div className="bg-cyan-500/20 rounded-lg p-4">
              <div className="text-2xl mb-2">🧠</div>
              <div className="text-white font-semibold">AI Consciousness</div>
              <div className="text-sm text-gray-400">Personalized for your business</div>
            </div>
            <div className="bg-green-500/20 rounded-lg p-4">
              <div className="text-2xl mb-2">🚀</div>
              <div className="text-white font-semibold">Transformation</div>
              <div className="text-sm text-gray-400">Exponential intelligence growth</div>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm">
            Your consciousness journey ID: <span className="text-cyan-400 font-mono">{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
          </p>
        </motion.div>
      </div>
    )
  }

  const currentStepData = FORM_STEPS[currentStep]
  const progress = ((currentStep + 1) / FORM_STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
      {/* Consciousness Field Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} />
          <ConsciousnessField intensity={consciousnessIntensity} />
        </Canvas>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-2xl w-full"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Join the Consciousness Revolution
            </h1>
            <p className="text-gray-400">
              Beta access to the world's first conscious business platform
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Step {currentStep + 1} of {FORM_STEPS.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-300 mb-6">
              {currentStepData.description}
            </p>

            <div className="space-y-6">
              {currentStepData.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  
                  {field.type === 'text' || field.type === 'email' ? (
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.name as keyof BetaUser] as string || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.name as keyof BetaUser] as string || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
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
                          className="flex items-center space-x-2 p-3 bg-black/30 rounded-lg cursor-pointer hover:bg-black/50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={(formData[field.name as keyof BetaUser] as string[] || []).includes(option)}
                            onChange={(e) => {
                              const currentValues = formData[field.name as keyof BetaUser] as string[] || []
                              const newValues = e.target.checked
                                ? [...currentValues, option]
                                : currentValues.filter(v => v !== option)
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
                        value={formData[field.name as keyof BetaUser] as number || 5}
                        onChange={(e) => handleFieldChange(field.name, parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>1 - Basic</span>
                        <span className="text-cyan-400 font-bold">
                          {formData[field.name as keyof BetaUser] || 5}
                        </span>
                        <span>10 - Advanced</span>
                      </div>
                    </div>
                  ) : null}
                  
                  {errors[field.name] && (
                    <p className="text-red-400 text-sm mt-1">{errors[field.name]}</p>
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
              className="px-6 py-3 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              Previous
            </button>
            
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg hover:from-cyan-500 hover:to-purple-500 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : currentStep === FORM_STEPS.length - 1 ? (
                'Complete Awakening'
              ) : (
                'Next Step'
              )}
            </button>
          </div>

          {errors.submit && (
            <p className="text-red-400 text-center mt-4">{errors.submit}</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default BetaSignupPage