/**
 * CoreFlow360 - Smart Onboarding Flow
 * AI-powered adaptive onboarding with intelligence-driven guidance
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Brain, 
  Zap,
  Building,
  Users,
  TrendingUp,
  Shield,
  Rocket,
  Target
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<StepProps>
  aiInsight?: string
  completionCriteria: string[]
  estimatedTime: number // minutes
}

interface StepProps {
  onNext: () => void
  onPrev: () => void
  onComplete: (data: any) => void
  stepData: any
  isActive: boolean
}

interface OnboardingData {
  industry: string
  companySize: string
  primaryGoals: string[]
  selectedModules: string[]
  experienceLevel: 'beginner' | 'intermediate' | 'expert'
  integrationNeeds: string[]
}

// Welcome Step Component
const WelcomeStep: React.FC<StepProps> = ({ onNext }) => (
  <div className="text-center max-w-2xl mx-auto">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", duration: 0.8 }}
      className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-8 flex items-center justify-center"
    >
      <Sparkles className="w-10 h-10 text-white" />
    </motion.div>

    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      Welcome to CoreFlow360
    </h1>
    
    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
      The world's first <strong>Autonomous Business Operating System</strong>. 
      We don't just manage your business—we evolve it into an intelligent, self-improving organization.
    </p>

    <div className="grid md:grid-cols-3 gap-6 mb-12">
      <motion.div 
        className="bg-blue-50 p-6 rounded-xl"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Brain className="w-8 h-8 text-blue-600 mb-3 mx-auto" />
        <h3 className="font-semibold mb-2">Smart Automation</h3>
        <p className="text-sm text-gray-600">AI-powered processes that learn and optimize automatically</p>
      </motion.div>
      
      <motion.div 
        className="bg-purple-50 p-6 rounded-xl"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
      >
        <Zap className="w-8 h-8 text-purple-600 mb-3 mx-auto" />
        <h3 className="font-semibold mb-2">Intelligence Multiplication</h3>
        <p className="text-sm text-gray-600">Module combinations create exponential intelligence growth</p>
      </motion.div>
      
      <motion.div 
        className="bg-green-50 p-6 rounded-xl"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
      >
        <TrendingUp className="w-8 h-8 text-green-600 mb-3 mx-auto" />
        <h3 className="font-semibold mb-2">Autonomous Growth</h3>
        <p className="text-sm text-gray-600">Self-evolving systems exceed human cognitive limitations</p>
      </motion.div>
    </div>

    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onNext}
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2 mx-auto"
    >
      Begin Intelligence Setup
      <ArrowRight className="w-5 h-5" />
    </motion.button>
  </div>
)

// Business Profile Step
const BusinessProfileStep: React.FC<StepProps> = ({ onNext, onComplete, stepData }) => {
  const [profile, setProfile] = useState({
    industry: stepData?.industry || '',
    companySize: stepData?.companySize || '',
    experienceLevel: stepData?.experienceLevel || 'intermediate',
  })

  const industries = [
    { id: 'hvac', name: 'HVAC & Construction', icon: Building, description: 'Heating, cooling, and building services' },
    { id: 'legal', name: 'Legal Services', icon: Shield, description: 'Law firms and legal practices' },
    { id: 'manufacturing', name: 'Manufacturing', icon: Target, description: 'Production and industrial operations' },
    { id: 'consulting', name: 'Consulting', icon: Brain, description: 'Professional advisory services' },
    { id: 'healthcare', name: 'Healthcare', icon: Users, description: 'Medical and wellness services' },
    { id: 'general', name: 'General Business', icon: Rocket, description: 'Multi-industry operations' },
  ]

  const companySizes = [
    { id: 'startup', name: '1-10 employees', multiplier: 1 },
    { id: 'small', name: '11-50 employees', multiplier: 2 },
    { id: 'medium', name: '51-200 employees', multiplier: 4 },
    { id: 'large', name: '200+ employees', multiplier: 8 },
  ]

  const isValid = profile.industry && profile.companySize && profile.experienceLevel

  const handleNext = () => {
    if (isValid) {
      onComplete(profile)
      onNext()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Tell us about your business</h2>
        <p className="text-gray-600">This helps us customize your intelligent automation experience</p>
      </div>

      <div className="space-y-8">
        {/* Industry Selection */}
        <div>
          <label className="block text-lg font-semibold mb-4">Industry</label>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {industries.map((industry) => {
              const Icon = industry.icon
              return (
                <motion.div
                  key={industry.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    profile.industry === industry.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setProfile({ ...profile, industry: industry.id })}
                >
                  <Icon className="w-6 h-6 mb-2 text-blue-600" />
                  <h3 className="font-semibold mb-1">{industry.name}</h3>
                  <p className="text-sm text-gray-600">{industry.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Company Size */}
        <div>
          <label className="block text-lg font-semibold mb-4">Company Size</label>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {companySizes.map((size) => (
              <motion.div
                key={size.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border-2 cursor-pointer text-center transition-all ${
                  profile.companySize === size.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
                onClick={() => setProfile({ ...profile, companySize: size.id })}
              >
                <div className="font-semibold">{size.name}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {size.multiplier}x Intelligence Multiplier
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-lg font-semibold mb-4">Your Experience Level</label>
          <div className="flex flex-col md:flex-row gap-4">
            {[
              { id: 'beginner', name: 'New to Business Software', description: 'I need guided setup and tutorials' },
              { id: 'intermediate', name: 'Some Experience', description: 'I know the basics, show me the advanced features' },
              { id: 'expert', name: 'Business Software Expert', description: 'Skip the basics, I want full control' },
            ].map((level) => (
              <motion.div
                key={level.id}
                whileHover={{ scale: 1.02 }}
                className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  profile.experienceLevel === level.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
                onClick={() => setProfile({ ...profile, experienceLevel: level.id as any })}
              >
                <div className="font-semibold mb-1">{level.name}</div>
                <div className="text-sm text-gray-600">{level.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-12">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          disabled={!isValid}
          className={`px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-2 transition-all ${
            isValid
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Configure Intelligence Modules
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  )
}

// Intelligence Module Selection
const IntelligenceModulesStep: React.FC<StepProps> = ({ onNext, onPrev, onComplete, stepData }) => {
  const [selectedModules, setSelectedModules] = useState<string[]>(stepData?.selectedModules || [])

  const modules = [
    {
      id: 'crm',
      name: 'Customer Intelligence',
      description: 'AI-powered customer management with predictive insights',
      intelligence: 'Customer behavior analysis, churn prediction, lifetime value calculation',
      price: '$7-15/user/month',
      essential: true,
    },
    {
      id: 'accounting',
      name: 'Financial Intelligence',
      description: 'Automated invoicing, tax calculations, and financial forecasting',
      intelligence: 'Revenue optimization, expense pattern recognition, cash flow prediction',
      price: '$10-20/user/month',
      essential: true,
    },
    {
      id: 'hr',
      name: 'Human Resource Intelligence',
      description: 'Employee management, payroll automation, and performance analytics',
      intelligence: 'Performance prediction, optimal scheduling, compensation analysis',
      price: '$8-18/user/month',
      essential: false,
    },
    {
      id: 'projects',
      name: 'Project Intelligence',
      description: 'Smart project management with resource optimization',
      intelligence: 'Timeline prediction, resource allocation, bottleneck detection',
      price: '$12-25/user/month',
      essential: false,
    },
    {
      id: 'analytics',
      name: 'Business Intelligence',
      description: 'Advanced analytics and reporting with AI insights',
      intelligence: 'Trend analysis, predictive modeling, strategic recommendations',
      price: '$15-30/user/month',
      essential: false,
    },
  ]

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const calculateIntelligence = () => {
    const baseIntelligence = selectedModules.length
    const bridgeIntelligence = Math.max(0, selectedModules.length - 1) * 2
    const multiplicativeIntelligence = selectedModules.length > 2 ? selectedModules.length ** 2 : 0
    
    return {
      base: baseIntelligence,
      bridges: bridgeIntelligence,
      multiplicative: multiplicativeIntelligence,
      total: baseIntelligence + bridgeIntelligence + multiplicativeIntelligence,
    }
  }

  const intelligence = calculateIntelligence()

  const handleNext = () => {
    onComplete({ selectedModules })
    onNext()
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Select Your Intelligence Modules</h2>
        <p className="text-gray-600 mb-6">
          Each module adds intelligence. Multiple modules create exponential intelligence multiplication.
        </p>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{intelligence.base}</div>
              <div className="text-sm text-gray-600">Base Intelligence</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{intelligence.bridges}</div>
              <div className="text-sm text-gray-600">Bridge Intelligence</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{intelligence.multiplicative}</div>
              <div className="text-sm text-gray-600">Multiplicative Intelligence</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {intelligence.total}
              </div>
              <div className="text-sm text-gray-600">Total Intelligence</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {modules.map((module) => (
          <motion.div
            key={module.id}
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              selectedModules.includes(module.id)
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-blue-300'
            } ${module.essential ? 'ring-2 ring-yellow-200' : ''}`}
            onClick={() => handleModuleToggle(module.id)}
          >
            {module.essential && (
              <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mb-3 inline-block">
                Essential
              </div>
            )}
            
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">{module.name}</h3>
              {selectedModules.includes(module.id) && (
                <CheckCircle className="w-6 h-6 text-blue-600" />
              )}
            </div>
            
            <p className="text-gray-600 mb-4 text-sm">{module.description}</p>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="text-xs text-gray-500 mb-1">AI INTELLIGENCE</div>
              <div className="text-sm font-medium">{module.intelligence}</div>
            </div>
            
            <div className="text-blue-600 font-semibold text-sm">{module.price}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrev}
          className="px-6 py-3 border border-gray-300 rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          disabled={selectedModules.length === 0}
          className={`px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
            selectedModules.length > 0
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Activate Intelligence
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  )
}

// Main Onboarding Component
export const SmartOnboardingFlow: React.FC<{
  onComplete: (data: OnboardingData) => void
  onSkip?: () => void
}> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({})

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Intelligence',
      description: 'Introduction to CoreFlow360 ABOS',
      component: WelcomeStep,
      completionCriteria: [],
      estimatedTime: 2,
    },
    {
      id: 'profile',
      title: 'Business Profile',
      description: 'Tell us about your organization',
      component: BusinessProfileStep,
      aiInsight: 'This helps us customize your intelligence experience',
      completionCriteria: ['Industry selected', 'Company size defined', 'Experience level set'],
      estimatedTime: 5,
    },
    {
      id: 'modules',
      title: 'Intelligence Modules',
      description: 'Select your business intelligence components',
      component: IntelligenceModulesStep,
      aiInsight: 'Multiple modules create exponential intelligence multiplication',
      completionCriteria: ['At least one module selected'],
      estimatedTime: 8,
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Complete onboarding
      onComplete(onboardingData as OnboardingData)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleStepComplete = (data: any) => {
    setOnboardingData(prev => ({ ...prev, ...data }))
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="container mx-auto">
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </div>
            {onSkip && currentStep > 0 && (
              <button
                onClick={onSkip}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip Setup
              </button>
            )}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="py-8"
          >
            <CurrentStepComponent
              onNext={handleNext}
              onPrev={handlePrev}
              onComplete={handleStepComplete}
              stepData={onboardingData}
              isActive={true}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default SmartOnboardingFlow