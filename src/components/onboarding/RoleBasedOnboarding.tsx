'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown,
  Calculator,
  Code2,
  Target,
  Settings,
  ChevronRight,
  ChevronLeft,
  Check,
  Play,
  BarChart3,
  DollarSign,
  Users,
  Zap,
  TrendingUp,
  Shield,
} from 'lucide-react'

interface Role {
  id: string
  title: string
  subtitle: string
  icon: React.ComponentType<unknown>
  gradient: string
  description: string
  onboardingSteps: OnboardingStep[]
  aiAgent: string
  focusAreas: string[]
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  component?: React.ComponentType<unknown>
  estimatedTime: string
  isCompleted?: boolean
}

interface RoleBasedOnboardingProps {
  onComplete?: (role: Role, completedSteps: string[]) => void
  onRoleChange?: (role: Role) => void
}

const roles: Role[] = [
  {
    id: 'ceo',
    title: 'Chief Executive Officer',
    subtitle: 'Strategic Command Center',
    icon: Crown,
    gradient: 'from-purple-500 to-pink-600',
    description:
      'Transform your business with AI-powered strategic insights and real-time performance visibility.',
    aiAgent: 'strategy',
    focusAreas: [
      'Strategic Planning',
      'Performance Monitoring',
      'Growth Analytics',
      'Executive Reporting',
    ],
    onboardingSteps: [
      {
        id: 'strategic-setup',
        title: 'Strategic Dashboard Setup',
        description: 'Configure your executive dashboard with key business metrics',
        estimatedTime: '3 min',
      },
      {
        id: 'ai-insights',
        title: 'AI Business Intelligence',
        description: 'Connect your AI strategy advisor for growth recommendations',
        estimatedTime: '2 min',
      },
      {
        id: 'performance-tracking',
        title: 'Real-time Performance',
        description: 'Set up automated executive reports and alerts',
        estimatedTime: '2 min',
      },
      {
        id: 'mobile-access',
        title: 'Mobile Executive Access',
        description: 'Configure mobile dashboard for on-the-go monitoring',
        estimatedTime: '1 min',
      },
    ],
  },
  {
    id: 'cfo',
    title: 'Chief Financial Officer',
    subtitle: 'ROI & Financial Intelligence',
    icon: Calculator,
    gradient: 'from-green-500 to-emerald-600',
    description:
      'Maximize financial performance with AI-driven forecasting and automated ROI tracking.',
    aiAgent: 'finance',
    focusAreas: ['ROI Analysis', 'Financial Forecasting', 'Budget Optimization', 'Risk Management'],
    onboardingSteps: [
      {
        id: 'financial-integration',
        title: 'Financial Data Integration',
        description: 'Connect your financial systems for real-time analysis',
        estimatedTime: '5 min',
      },
      {
        id: 'roi-calculator',
        title: 'AI ROI Calculator',
        description: 'Set up automated ROI tracking with live business data',
        estimatedTime: '3 min',
      },
      {
        id: 'forecasting-setup',
        title: 'Predictive Forecasting',
        description: 'Configure AI-powered financial forecasting models',
        estimatedTime: '4 min',
      },
      {
        id: 'compliance-monitoring',
        title: 'Compliance & Reporting',
        description: 'Automate financial reporting and compliance checks',
        estimatedTime: '3 min',
      },
    ],
  },
  {
    id: 'cto',
    title: 'Chief Technology Officer',
    subtitle: 'Technical Architecture',
    icon: Code2,
    gradient: 'from-blue-500 to-cyan-600',
    description:
      'Optimize your tech stack with AI-powered architecture insights and performance monitoring.',
    aiAgent: 'operations',
    focusAreas: [
      'System Architecture',
      'Performance Monitoring',
      'Security Analysis',
      'Tech Stack Optimization',
    ],
    onboardingSteps: [
      {
        id: 'architecture-analysis',
        title: 'Architecture Overview',
        description: 'Review system architecture and integration points',
        estimatedTime: '4 min',
      },
      {
        id: 'performance-monitoring',
        title: 'Performance Dashboards',
        description: 'Set up real-time performance and health monitoring',
        estimatedTime: '3 min',
      },
      {
        id: 'security-assessment',
        title: 'Security Analysis',
        description: 'Configure AI-powered security monitoring and alerts',
        estimatedTime: '3 min',
      },
      {
        id: 'integration-planning',
        title: 'Integration Strategy',
        description: 'Plan API integrations and data flow optimization',
        estimatedTime: '2 min',
      },
    ],
  },
  {
    id: 'sales',
    title: 'Sales Executive',
    subtitle: 'Revenue Generation',
    icon: Target,
    gradient: 'from-orange-500 to-red-600',
    description:
      'Accelerate sales performance with AI-powered lead intelligence and pipeline optimization.',
    aiAgent: 'sales',
    focusAreas: [
      'Pipeline Management',
      'Lead Intelligence',
      'Sales Forecasting',
      'Deal Acceleration',
    ],
    onboardingSteps: [
      {
        id: 'crm-integration',
        title: 'CRM Integration',
        description: 'Connect your existing CRM and sales data',
        estimatedTime: '4 min',
      },
      {
        id: 'ai-prospecting',
        title: 'AI Lead Intelligence',
        description: 'Set up AI-powered lead scoring and prospecting',
        estimatedTime: '3 min',
      },
      {
        id: 'pipeline-optimization',
        title: 'Pipeline Dashboard',
        description: 'Configure sales pipeline tracking and forecasting',
        estimatedTime: '2 min',
      },
      {
        id: 'automation-setup',
        title: 'Sales Automation',
        description: 'Automate follow-ups and nurture sequences',
        estimatedTime: '3 min',
      },
    ],
  },
  {
    id: 'operations',
    title: 'Operations Manager',
    subtitle: 'Process Optimization',
    icon: Settings,
    gradient: 'from-violet-500 to-purple-600',
    description:
      'Streamline operations with AI-driven workflow automation and efficiency optimization.',
    aiAgent: 'operations',
    focusAreas: [
      'Workflow Automation',
      'Process Optimization',
      'Resource Management',
      'Efficiency Analytics',
    ],
    onboardingSteps: [
      {
        id: 'process-mapping',
        title: 'Process Analysis',
        description: 'Map current workflows and identify optimization opportunities',
        estimatedTime: '5 min',
      },
      {
        id: 'automation-setup',
        title: 'Workflow Automation',
        description: 'Configure AI-powered workflow automation',
        estimatedTime: '4 min',
      },
      {
        id: 'resource-optimization',
        title: 'Resource Management',
        description: 'Set up resource allocation and capacity planning',
        estimatedTime: '3 min',
      },
      {
        id: 'efficiency-tracking',
        title: 'Efficiency Metrics',
        description: 'Configure operational KPIs and efficiency tracking',
        estimatedTime: '2 min',
      },
    ],
  },
]

export default function RoleBasedOnboarding({
  onComplete,
  onRoleChange,
}: RoleBasedOnboardingProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing onboarding progress on mount
  useEffect(() => {
    const loadOnboardingProgress = async () => {
      try {
        setLoading(true)

        // Check if user has existing onboarding progress
        const response = await fetch('/api/onboarding/progress')

        if (response.ok) {
          const progress = await response.json()

          if (progress.selectedRole) {
            const role = roles.find((r) => r.id === progress.selectedRole)
            if (role) {
              setSelectedRole(role)
              setCompletedSteps(progress.completedSteps || [])

              // If onboarding was in progress, resume it
              if (progress.isOnboarding && progress.currentStep !== undefined) {
                setCurrentStep(progress.currentStep)
                setIsOnboarding(true)
              }
            }
          }
        }
      } catch (error) {
        setError('Failed to load onboarding progress')
      } finally {
        setLoading(false)
      }
    }

    loadOnboardingProgress()
  }, [])

  const handleRoleSelection = async (role: Role) => {
    setSelectedRole(role)
    onRoleChange?.(role)

    // Track role selection via API
    try {
      await fetch('/api/onboarding/role-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedRole: role.id,
          roleTitle: role.title,
          aiAgent: role.aiAgent,
          focusAreas: role.focusAreas,
        }),
      })
    } catch (error) {}
  }

  const startOnboarding = async () => {
    if (selectedRole) {
      setIsOnboarding(true)
      setCurrentStep(0)
      setCompletedSteps([])

      // Track onboarding start via API
      try {
        await fetch('/api/onboarding/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedRole: selectedRole.id,
            roleTitle: selectedRole.title,
            totalSteps: selectedRole.onboardingSteps.length,
            estimatedTotalTime: selectedRole.onboardingSteps.reduce(
              (acc, step) => acc + parseInt(step.estimatedTime),
              0
            ),
          }),
        })
      } catch (error) {}
    }
  }

  const completeStep = async () => {
    if (selectedRole) {
      const stepId = selectedRole.onboardingSteps[currentStep]?.id
      const stepData = selectedRole.onboardingSteps[currentStep]

      if (stepId && !completedSteps.includes(stepId)) {
        setCompletedSteps((prev) => [...prev, stepId])

        // Track step completion via API
        try {
          await fetch('/api/onboarding/complete-step', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stepId,
              stepTitle: stepData.title,
              selectedRole: selectedRole.id,
              currentStepIndex: currentStep,
              totalSteps: selectedRole.onboardingSteps.length,
              estimatedTime: stepData.estimatedTime,
              isCompleted: true,
            }),
          })
        } catch (error) {}
      }

      if (currentStep < selectedRole.onboardingSteps.length - 1) {
        setCurrentStep((prev) => prev + 1)
      } else {
        // Onboarding completed - track final completion
        try {
          await fetch('/api/onboarding/complete-step', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stepId: 'onboarding-completed',
              stepTitle: 'Onboarding Completed',
              selectedRole: selectedRole.id,
              currentStepIndex: currentStep,
              totalSteps: selectedRole.onboardingSteps.length,
              estimatedTime: '0 min',
              isCompleted: true,
              allStepsCompleted: [...completedSteps, stepId].filter(Boolean),
            }),
          })
        } catch (error) {}

        onComplete?.(selectedRole, [...completedSteps, stepId].filter(Boolean))
        setIsOnboarding(false)
      }
    }
  }

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
          <p className="text-gray-400">Loading your onboarding experience...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <p className="mb-4 text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-violet-600 px-4 py-2 transition-colors hover:bg-violet-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!isOnboarding && !selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 text-white">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="mb-4 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Welcome to CoreFlow360
            </h1>
            <p className="mb-8 text-xl text-gray-300">
              Let's customize your experience based on your role
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role, index) => {
              const IconComponent = role.icon
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer rounded-2xl border border-gray-700/50 bg-gray-800/50 p-6 backdrop-blur-sm transition-all hover:border-violet-500/50"
                  onClick={() => handleRoleSelection(role)}
                >
                  <div
                    className={`h-16 w-16 rounded-full bg-gradient-to-r ${role.gradient} mb-4 p-4 transition-transform group-hover:scale-105`}
                  >
                    <IconComponent className="mx-auto h-8 w-8 text-white" />
                  </div>

                  <h3 className="mb-2 text-xl font-semibold text-white">{role.title}</h3>
                  <p className="mb-3 text-sm font-medium text-violet-400">{role.subtitle}</p>
                  <p className="mb-4 text-sm text-gray-300">{role.description}</p>

                  <div className="space-y-2">
                    <div className="mb-2 text-xs font-medium text-gray-400">Focus Areas:</div>
                    {role.focusAreas.slice(0, 2).map((area, idx) => (
                      <div key={idx} className="flex items-center text-xs text-gray-300">
                        <Check className="mr-2 h-3 w-3 text-green-500" />
                        {area}
                      </div>
                    ))}
                    {role.focusAreas.length > 2 && (
                      <div className="text-xs text-gray-400">
                        +{role.focusAreas.length - 2} more areas
                      </div>
                    )}
                  </div>

                  <div className="mt-4 border-t border-gray-700/50 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {role.onboardingSteps.length} steps • ~
                        {role.onboardingSteps.reduce(
                          (acc, step) => acc + parseInt(step.estimatedTime),
                          0
                        )}{' '}
                        min
                      </span>
                      <ChevronRight className="h-4 w-4 text-violet-400 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (selectedRole && !isOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 text-white">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div
              className={`mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-r ${selectedRole.gradient} p-6`}
            >
              <selectedRole.icon className="mx-auto h-12 w-12 text-white" />
            </div>

            <h1 className="mb-2 text-3xl font-bold text-white">Welcome, {selectedRole.title}!</h1>
            <p className="mb-8 text-lg text-gray-300">{selectedRole.description}</p>

            <div className="mb-8 rounded-2xl border border-gray-700/50 bg-gray-800/50 p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-lg font-semibold text-white">Your Onboarding Journey</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {selectedRole.onboardingSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center rounded-lg bg-gray-900/50 p-3">
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{step.title}</div>
                      <div className="text-xs text-gray-400">{step.estimatedTime}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setSelectedRole(null)}
                className="rounded-xl border border-gray-600 px-6 py-2 text-gray-300 transition-all hover:border-gray-500"
              >
                Choose Different Role
              </button>
              <button
                onClick={startOnboarding}
                className={`bg-gradient-to-r px-8 py-3 ${selectedRole.gradient} flex items-center rounded-xl font-medium text-white transition-all hover:opacity-90`}
              >
                <Play className="mr-2 h-4 w-4" />
                Start Onboarding
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Onboarding flow
  const currentStepData = selectedRole?.onboardingSteps[currentStep]
  if (!currentStepData || !selectedRole) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 text-white">
      <div className="mx-auto max-w-4xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">{selectedRole.title} Setup</h2>
            <div className="text-sm text-gray-400">
              Step {currentStep + 1} of {selectedRole.onboardingSteps.length}
            </div>
          </div>

          <div className="mb-4 h-2 w-full rounded-full bg-gray-800">
            <div
              className={`h-2 bg-gradient-to-r ${selectedRole.gradient} rounded-full transition-all duration-500`}
              style={{
                width: `${((currentStep + 1) / selectedRole.onboardingSteps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="rounded-2xl border border-gray-700/50 bg-gray-800/50 p-8 backdrop-blur-sm"
          >
            <h3 className="mb-4 text-2xl font-semibold text-white">{currentStepData.title}</h3>
            <p className="mb-6 text-lg text-gray-300">{currentStepData.description}</p>

            <div className="mb-6 rounded-xl bg-gray-900/50 p-6">
              <p className="mb-2 text-sm text-gray-400">Estimated time:</p>
              <p className="font-medium text-violet-400">{currentStepData.estimatedTime}</p>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={goToPreviousStep}
                disabled={currentStep === 0}
                className="flex items-center px-4 py-2 text-gray-300 transition-all hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </button>

              <button
                onClick={completeStep}
                className={`bg-gradient-to-r px-8 py-3 ${selectedRole.gradient} flex items-center rounded-xl font-medium text-white transition-all hover:opacity-90`}
              >
                {currentStep === selectedRole.onboardingSteps.length - 1 ? (
                  <>
                    Complete Setup
                    <Check className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
