/**
 * CoreFlow360 - Interactive Product Tour Component
 * Final step in user onboarding - guided tour with role-based customization and progressive disclosure
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Target,
  MousePointer,
  Eye,
  Lightbulb,
  Zap,
  Crown,
  Users,
  BarChart3,
  Settings,
  MessageSquare,
  FileText,
  Calendar,
  Bell,
} from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { CompanyInfo } from './CompanySetupWizard'
import { UserRole } from './WelcomeRoleSelection'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

export interface TourStep {
  id: string
  title: string
  description: string
  target: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: 'click' | 'hover' | 'type' | 'scroll'
  actionText?: string
  roleSpecific?: UserRole[]
  category: 'navigation' | 'feature' | 'ai' | 'customization'
  icon: unknown
  interactive?: boolean
  mockElement?: React.ReactNode
}

interface InteractiveProductTourProps {
  onTourCompleted: () => void
  onSkipTour: () => void
  userRole: UserRole
  companyInfo: CompanyInfo
  selectedModules: string[]
  userEmail?: string
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to CoreFlow360!',
    description:
      "Let's take a quick tour to get you familiar with your new AI-powered ERP system. This tour is customized for your role and selected modules.",
    target: 'center',
    position: 'center',
    category: 'navigation',
    icon: Crown,
  },
  {
    id: 'sidebar',
    title: 'Navigation Sidebar',
    description:
      "Your main navigation hub. The sidebar adapts based on your role and active modules, showing only what's relevant to you.",
    target: '.sidebar-nav',
    position: 'right',
    category: 'navigation',
    icon: Target,
    mockElement: (
      <div className="w-64 space-y-2 rounded-lg border border-gray-800 bg-gray-900 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-violet-500/20 p-2">
          <BarChart3 className="h-5 w-5 text-violet-400" />
          <span className="text-white">Dashboard</span>
        </div>
        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-800">
          <Users className="h-5 w-5 text-gray-400" />
          <span className="text-gray-300">CRM</span>
        </div>
        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-800">
          <FileText className="h-5 w-5 text-gray-400" />
          <span className="text-gray-300">Projects</span>
        </div>
      </div>
    ),
  },
  {
    id: 'dashboard',
    title: 'Smart Dashboard',
    description:
      'Your personalized command center with AI-powered insights. Widgets automatically adjust based on your role and most-used features.',
    target: '.dashboard-widgets',
    position: 'top',
    category: 'feature',
    icon: BarChart3,
    mockElement: (
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <h3 className="mb-2 font-semibold text-white">Revenue Trends</h3>
          <div className="h-16 rounded bg-gradient-to-r from-emerald-500/20 to-blue-500/20"></div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <h3 className="mb-2 font-semibold text-white">AI Insights</h3>
          <p className="text-sm text-gray-400">3 new opportunities detected</p>
        </div>
      </div>
    ),
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description:
      'Your intelligent companion that learns from your workflow patterns and provides contextual suggestions and automations.',
    target: '.ai-assistant',
    position: 'left',
    category: 'ai',
    icon: Zap,
    interactive: true,
    actionText: 'Try asking: "Show me this week\'s sales performance"',
    mockElement: (
      <div className="w-80 rounded-lg border border-gray-800 bg-gray-900 p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-500">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-white">AI Assistant</span>
        </div>
        <div className="mb-3 rounded-lg bg-gray-800 p-3">
          <p className="text-sm text-gray-300">
            Hello! I noticed you're setting up your CRM. Would you like me to help you import your
            contacts?
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded bg-violet-500 px-3 py-1 text-sm text-white hover:bg-violet-600">
            Yes, help me
          </button>
          <button className="rounded bg-gray-700 px-3 py-1 text-sm text-gray-300 hover:bg-gray-600">
            Not now
          </button>
        </div>
      </div>
    ),
  },
  {
    id: 'search',
    title: 'Global Search',
    description:
      'Powerful search across all your data with AI-enhanced results. Find customers, projects, documents, and more instantly.',
    target: '.global-search',
    position: 'bottom',
    action: 'type',
    actionText: 'Try typing "John Smith" or "Project Alpha"',
    category: 'feature',
    icon: Target,
    mockElement: (
      <div className="relative">
        <input
          type="text"
          placeholder="Search everything..."
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
        />
        <div className="absolute top-full right-0 left-0 mt-2 rounded-lg border border-gray-800 bg-gray-900 shadow-2xl">
          <div className="space-y-1 p-2">
            <div className="flex items-center gap-3 rounded p-2 hover:bg-gray-800">
              <Users className="h-4 w-4 text-blue-400" />
              <div>
                <p className="text-sm text-white">John Smith</p>
                <p className="text-xs text-gray-400">Customer • john@company.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded p-2 hover:bg-gray-800">
              <FileText className="h-4 w-4 text-green-400" />
              <div>
                <p className="text-sm text-white">Project Alpha</p>
                <p className="text-xs text-gray-400">Active project • Due next week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'notifications',
    title: 'Smart Notifications',
    description:
      'AI-filtered notifications that surface only what matters to your role. Never miss important updates while staying focused.',
    target: '.notifications-bell',
    position: 'left',
    category: 'feature',
    icon: Bell,
    roleSpecific: ['admin', 'manager'],
    mockElement: (
      <div className="relative">
        <button className="relative rounded-lg border border-gray-700 bg-gray-800 p-2">
          <Bell className="h-5 w-5 text-gray-300" />
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></div>
        </button>
        <div className="absolute top-full right-0 mt-2 w-80 rounded-lg border border-gray-800 bg-gray-900 shadow-2xl">
          <div className="p-4">
            <h3 className="mb-3 font-semibold text-white">Recent Updates</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg bg-violet-500/10 p-2">
                <Zap className="mt-0.5 h-4 w-4 text-violet-400" />
                <div>
                  <p className="text-sm text-white">AI detected a new sales opportunity</p>
                  <p className="text-xs text-gray-400">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2">
                <Calendar className="mt-0.5 h-4 w-4 text-blue-400" />
                <div>
                  <p className="text-sm text-white">Team meeting in 30 minutes</p>
                  <p className="text-xs text-gray-400">Scheduled</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'customization',
    title: 'Workspace Customization',
    description:
      'Tailor your workspace to your preferences. Drag widgets, change layouts, and create custom views that work best for you.',
    target: '.customization-panel',
    position: 'right',
    category: 'customization',
    icon: Settings,
    interactive: true,
    actionText: 'Try dragging a widget to rearrange your dashboard',
    roleSpecific: ['admin'],
    mockElement: (
      <div className="w-64 rounded-lg border border-gray-800 bg-gray-900 p-4">
        <h3 className="mb-4 font-semibold text-white">Customize Dashboard</h3>
        <div className="space-y-3">
          <div className="cursor-move rounded-lg border border-gray-700 bg-gray-800 p-3">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              <span className="text-sm text-white">Sales Overview</span>
            </div>
            <div className="text-xs text-gray-400">Click and drag to reorder</div>
          </div>
          <div className="cursor-move rounded-lg border border-gray-700 bg-gray-800 p-3">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span className="text-sm text-white">Recent Activity</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'completion',
    title: "You're All Set!",
    description:
      "Congratulations! You've completed the tour. Your CoreFlow360 workspace is now ready for maximum productivity. Remember, the AI assistant is always here to help.",
    target: 'center',
    position: 'center',
    category: 'navigation',
    icon: CheckCircle,
  },
]

export function InteractiveProductTour({
  onTourCompleted,
  onSkipTour,
  userRole,
  companyInfo,
  selectedModules,
  userEmail,
}: InteractiveProductTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [tourProgress, setTourProgress] = useState(0)
  const { trackEvent } = useTrackEvent()
  const autoPlayInterval = useRef<NodeJS.Timeout>()

  // Filter steps based on user role
  const filteredSteps = tourSteps.filter(
    (step) => !step.roleSpecific || step.roleSpecific.includes(userRole)
  )

  const currentStep = filteredSteps[currentStepIndex]

  useEffect(() => {
    const progress = (currentStepIndex / filteredSteps.length) * 100
    setTourProgress(progress)
  }, [currentStepIndex, filteredSteps.length])

  useEffect(() => {
    if (isPlaying) {
      autoPlayInterval.current = setInterval(() => {
        if (currentStepIndex < filteredSteps.length - 1) {
          handleNext()
        } else {
          setIsPlaying(false)
        }
      }, 5000) // 5 seconds per step
    } else {
      if (autoPlayInterval.current) {
        clearInterval(autoPlayInterval.current)
      }
    }

    return () => {
      if (autoPlayInterval.current) {
        clearInterval(autoPlayInterval.current)
      }
    }
  }, [isPlaying, currentStepIndex, filteredSteps.length])

  const handleNext = () => {
    if (currentStepIndex < filteredSteps.length - 1) {
      setCompletedSteps((prev) => [...prev, currentStep.id])
      setCurrentStepIndex(currentStepIndex + 1)
      trackEvent('product_tour_step_completed', {
        step: currentStep.id,
        step_index: currentStepIndex,
      })
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleSkip = () => {
    trackEvent('product_tour_skipped', {
      completed_steps: completedSteps.length,
      total_steps: filteredSteps.length,
    })
    onSkipTour()
  }

  const handleComplete = () => {
    setCompletedSteps((prev) => [...prev, currentStep.id])
    trackEvent('product_tour_completed', {
      total_steps: filteredSteps.length,
      user_role: userRole,
      company_industry: companyInfo.industry,
    })
    onTourCompleted()
  }

  const handleRestart = () => {
    setCurrentStepIndex(0)
    setCompletedSteps([])
    setIsPlaying(false)
    trackEvent('product_tour_restarted')
  }

  const isLastStep = currentStepIndex === filteredSteps.length - 1

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      {/* Tour Progress */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
          initial={{ width: 0 }}
          animate={{ width: `${tourProgress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 z-60 text-gray-400 transition-colors hover:text-white"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Tour Controls */}
      <div className="absolute top-4 left-4 z-60 flex items-center gap-3">
        <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/80 px-4 py-2 backdrop-blur-sm">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-violet-400 transition-colors hover:text-violet-300"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={handleRestart}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-300">
            {currentStepIndex + 1} of {filteredSteps.length}
          </span>
        </div>
      </div>

      {/* Tour Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`absolute ${
            currentStep.position === 'center'
              ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'
              : currentStep.position === 'top'
                ? 'top-20 left-1/2 -translate-x-1/2 transform'
                : currentStep.position === 'bottom'
                  ? 'bottom-20 left-1/2 -translate-x-1/2 transform'
                  : currentStep.position === 'left'
                    ? 'top-1/2 left-20 -translate-y-1/2 transform'
                    : 'top-1/2 right-20 -translate-y-1/2 transform'
          }`}
        >
          <div className="max-w-lg rounded-2xl border border-gray-800 bg-gray-900/95 p-6 backdrop-blur-sm">
            {/* Step Header */}
            <div className="mb-4 flex items-center gap-3">
              <div
                className={`rounded-xl bg-gradient-to-r p-3 ${
                  currentStep.category === 'navigation'
                    ? 'from-blue-500/20 to-cyan-500/20'
                    : currentStep.category === 'feature'
                      ? 'from-green-500/20 to-emerald-500/20'
                      : currentStep.category === 'ai'
                        ? 'from-violet-500/20 to-purple-500/20'
                        : 'from-orange-500/20 to-red-500/20'
                }`}
              >
                <currentStep.icon
                  className={`h-6 w-6 ${
                    currentStep.category === 'navigation'
                      ? 'text-cyan-400'
                      : currentStep.category === 'feature'
                        ? 'text-emerald-400'
                        : currentStep.category === 'ai'
                          ? 'text-violet-400'
                          : 'text-orange-400'
                  }`}
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{currentStep.title}</h2>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      currentStep.category === 'navigation'
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : currentStep.category === 'feature'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : currentStep.category === 'ai'
                            ? 'bg-violet-500/20 text-violet-300'
                            : 'bg-orange-500/20 text-orange-300'
                    }`}
                  >
                    {currentStep.category.charAt(0).toUpperCase() + currentStep.category.slice(1)}
                  </span>
                  {currentStep.roleSpecific?.includes(userRole) && (
                    <span className="rounded-full bg-violet-500/20 px-2 py-1 text-xs text-violet-300">
                      {userRole} feature
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Step Description */}
            <p className="mb-6 leading-relaxed text-gray-300">{currentStep.description}</p>

            {/* Interactive Element */}
            {currentStep.mockElement && (
              <div className="mb-6 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-violet-400" />
                  <span className="text-sm text-violet-300">Preview</span>
                </div>
                {currentStep.mockElement}
              </div>
            )}

            {/* Action Prompt */}
            {currentStep.interactive && currentStep.actionText && (
              <div className="mb-6 rounded-lg border border-violet-500/30 bg-violet-900/20 p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="mt-0.5 h-5 w-5 text-violet-400" />
                  <div>
                    <h4 className="mb-1 font-semibold text-violet-300">Try it out:</h4>
                    <p className="text-sm text-gray-300">{currentStep.actionText}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between border-t border-gray-800 pt-4">
              <button
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-2 text-gray-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              {isLastStep ? (
                <GlowingButton onClick={handleComplete}>
                  Complete Tour
                  <CheckCircle className="ml-2 h-4 w-4" />
                </GlowingButton>
              ) : (
                <GlowingButton onClick={handleNext}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </GlowingButton>
              )}
            </div>
          </div>

          {/* Pointer Arrow */}
          {currentStep.position !== 'center' && (
            <div
              className={`absolute ${
                currentStep.position === 'top'
                  ? 'top-full left-1/2 -translate-x-1/2 transform'
                  : currentStep.position === 'bottom'
                    ? 'bottom-full left-1/2 -translate-x-1/2 transform'
                    : currentStep.position === 'left'
                      ? 'top-1/2 left-full -translate-y-1/2 transform'
                      : 'top-1/2 right-full -translate-y-1/2 transform'
              }`}
            >
              <MousePointer className="h-6 w-6 text-violet-400" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Background Spotlight Effect */}
      <motion.div
        className="bg-gradient-radial absolute inset-0 from-transparent via-transparent to-black/60"
        animate={{
          background: `radial-gradient(600px circle at ${
            currentStep.position === 'center'
              ? '50% 50%'
              : currentStep.position === 'top'
                ? '50% 20%'
                : currentStep.position === 'bottom'
                  ? '50% 80%'
                  : currentStep.position === 'left'
                    ? '20% 50%'
                    : '80% 50%'
          }, transparent 0%, rgba(0,0,0,0.8) 100%)`,
        }}
        transition={{ duration: 0.6 }}
      />
    </div>
  )
}
