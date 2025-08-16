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
  Bell
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
  icon: any
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
    description: 'Let\'s take a quick tour to get you familiar with your new AI-powered ERP system. This tour is customized for your role and selected modules.',
    target: 'center',
    position: 'center',
    category: 'navigation',
    icon: Crown
  },
  {
    id: 'sidebar',
    title: 'Navigation Sidebar',
    description: 'Your main navigation hub. The sidebar adapts based on your role and active modules, showing only what\'s relevant to you.',
    target: '.sidebar-nav',
    position: 'right',
    category: 'navigation',
    icon: Target,
    mockElement: (
      <div className="w-64 bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-3 p-2 bg-violet-500/20 rounded-lg">
          <BarChart3 className="w-5 h-5 text-violet-400" />
          <span className="text-white">Dashboard</span>
        </div>
        <div className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg">
          <Users className="w-5 h-5 text-gray-400" />
          <span className="text-gray-300">CRM</span>
        </div>
        <div className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg">
          <FileText className="w-5 h-5 text-gray-400" />
          <span className="text-gray-300">Projects</span>
        </div>
      </div>
    )
  },
  {
    id: 'dashboard',
    title: 'Smart Dashboard',
    description: 'Your personalized command center with AI-powered insights. Widgets automatically adjust based on your role and most-used features.',
    target: '.dashboard-widgets',
    position: 'top',
    category: 'feature',
    icon: BarChart3,
    mockElement: (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Revenue Trends</h3>
          <div className="h-16 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded"></div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">AI Insights</h3>
          <p className="text-sm text-gray-400">3 new opportunities detected</p>
        </div>
      </div>
    )
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description: 'Your intelligent companion that learns from your workflow patterns and provides contextual suggestions and automations.',
    target: '.ai-assistant',
    position: 'left',
    category: 'ai',
    icon: Zap,
    interactive: true,
    actionText: 'Try asking: "Show me this week\'s sales performance"',
    mockElement: (
      <div className="w-80 bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold">AI Assistant</span>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 mb-3">
          <p className="text-gray-300 text-sm">Hello! I noticed you're setting up your CRM. Would you like me to help you import your contacts?</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-violet-500 hover:bg-violet-600 text-white px-3 py-1 rounded text-sm">Yes, help me</button>
          <button className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded text-sm">Not now</button>
        </div>
      </div>
    )
  },
  {
    id: 'search',
    title: 'Global Search',
    description: 'Powerful search across all your data with AI-enhanced results. Find customers, projects, documents, and more instantly.',
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
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
        />
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl">
          <div className="p-2 space-y-1">
            <div className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded">
              <Users className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-white text-sm">John Smith</p>
                <p className="text-gray-400 text-xs">Customer • john@company.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded">
              <FileText className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-white text-sm">Project Alpha</p>
                <p className="text-gray-400 text-xs">Active project • Due next week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'notifications',
    title: 'Smart Notifications',
    description: 'AI-filtered notifications that surface only what matters to your role. Never miss important updates while staying focused.',
    target: '.notifications-bell',
    position: 'left',
    category: 'feature',
    icon: Bell,
    roleSpecific: ['admin', 'manager'],
    mockElement: (
      <div className="relative">
        <button className="relative p-2 bg-gray-800 border border-gray-700 rounded-lg">
          <Bell className="w-5 h-5 text-gray-300" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </button>
        <div className="absolute top-full right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl">
          <div className="p-4">
            <h3 className="text-white font-semibold mb-3">Recent Updates</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2 bg-violet-500/10 rounded-lg">
                <Zap className="w-4 h-4 text-violet-400 mt-0.5" />
                <div>
                  <p className="text-white text-sm">AI detected a new sales opportunity</p>
                  <p className="text-gray-400 text-xs">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2">
                <Calendar className="w-4 h-4 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-white text-sm">Team meeting in 30 minutes</p>
                  <p className="text-gray-400 text-xs">Scheduled</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'customization',
    title: 'Workspace Customization',
    description: 'Tailor your workspace to your preferences. Drag widgets, change layouts, and create custom views that work best for you.',
    target: '.customization-panel',
    position: 'right',
    category: 'customization',
    icon: Settings,
    interactive: true,
    actionText: 'Try dragging a widget to rearrange your dashboard',
    roleSpecific: ['admin'],
    mockElement: (
      <div className="w-64 bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-4">Customize Dashboard</h3>
        <div className="space-y-3">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-move">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-white text-sm">Sales Overview</span>
            </div>
            <div className="text-xs text-gray-400">Click and drag to reorder</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-move">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-white text-sm">Recent Activity</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'completion',
    title: 'You\'re All Set!',
    description: 'Congratulations! You\'ve completed the tour. Your CoreFlow360 workspace is now ready for maximum productivity. Remember, the AI assistant is always here to help.',
    target: 'center',
    position: 'center',
    category: 'navigation',
    icon: CheckCircle
  }
]

export function InteractiveProductTour({
  onTourCompleted,
  onSkipTour,
  userRole,
  companyInfo,
  selectedModules,
  userEmail
}: InteractiveProductTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [tourProgress, setTourProgress] = useState(0)
  const { trackEvent } = useTrackEvent()
  const autoPlayInterval = useRef<NodeJS.Timeout>()

  // Filter steps based on user role
  const filteredSteps = tourSteps.filter(step => 
    !step.roleSpecific || step.roleSpecific.includes(userRole)
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
      setCompletedSteps(prev => [...prev, currentStep.id])
      setCurrentStepIndex(currentStepIndex + 1)
      trackEvent('product_tour_step_completed', { 
        step: currentStep.id, 
        step_index: currentStepIndex 
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
      total_steps: filteredSteps.length
    })
    onSkipTour()
  }

  const handleComplete = () => {
    setCompletedSteps(prev => [...prev, currentStep.id])
    trackEvent('product_tour_completed', {
      total_steps: filteredSteps.length,
      user_role: userRole,
      company_industry: companyInfo.industry
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
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
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
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-60"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Tour Controls */}
      <div className="absolute top-4 left-4 flex items-center gap-3 z-60">
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-lg px-4 py-2 flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={handleRestart}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
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
              ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
              : currentStep.position === 'top'
              ? 'top-20 left-1/2 transform -translate-x-1/2'
              : currentStep.position === 'bottom'
              ? 'bottom-20 left-1/2 transform -translate-x-1/2'
              : currentStep.position === 'left'
              ? 'top-1/2 left-20 transform -translate-y-1/2'
              : 'top-1/2 right-20 transform -translate-y-1/2'
          }`}
        >
          <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 max-w-lg">
            {/* Step Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${
                currentStep.category === 'navigation' ? 'from-blue-500/20 to-cyan-500/20' :
                currentStep.category === 'feature' ? 'from-green-500/20 to-emerald-500/20' :
                currentStep.category === 'ai' ? 'from-violet-500/20 to-purple-500/20' :
                'from-orange-500/20 to-red-500/20'
              }`}>
                <currentStep.icon className={`w-6 h-6 ${
                  currentStep.category === 'navigation' ? 'text-cyan-400' :
                  currentStep.category === 'feature' ? 'text-emerald-400' :
                  currentStep.category === 'ai' ? 'text-violet-400' :
                  'text-orange-400'
                }`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{currentStep.title}</h2>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    currentStep.category === 'navigation' ? 'bg-cyan-500/20 text-cyan-300' :
                    currentStep.category === 'feature' ? 'bg-emerald-500/20 text-emerald-300' :
                    currentStep.category === 'ai' ? 'bg-violet-500/20 text-violet-300' :
                    'bg-orange-500/20 text-orange-300'
                  }`}>
                    {currentStep.category.charAt(0).toUpperCase() + currentStep.category.slice(1)}
                  </span>
                  {currentStep.roleSpecific?.includes(userRole) && (
                    <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-300">
                      {userRole} feature
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Step Description */}
            <p className="text-gray-300 mb-6 leading-relaxed">
              {currentStep.description}
            </p>

            {/* Interactive Element */}
            {currentStep.mockElement && (
              <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 text-violet-400" />
                  <span className="text-sm text-violet-300">Preview</span>
                </div>
                {currentStep.mockElement}
              </div>
            )}

            {/* Action Prompt */}
            {currentStep.interactive && currentStep.actionText && (
              <div className="mb-6 p-4 bg-violet-900/20 border border-violet-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-violet-400 mt-0.5" />
                  <div>
                    <h4 className="text-violet-300 font-semibold mb-1">Try it out:</h4>
                    <p className="text-gray-300 text-sm">{currentStep.actionText}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-800">
              <button
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              {isLastStep ? (
                <GlowingButton onClick={handleComplete}>
                  Complete Tour
                  <CheckCircle className="w-4 h-4 ml-2" />
                </GlowingButton>
              ) : (
                <GlowingButton onClick={handleNext}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </GlowingButton>
              )}
            </div>
          </div>

          {/* Pointer Arrow */}
          {currentStep.position !== 'center' && (
            <div className={`absolute ${
              currentStep.position === 'top'
                ? 'top-full left-1/2 transform -translate-x-1/2'
                : currentStep.position === 'bottom'
                ? 'bottom-full left-1/2 transform -translate-x-1/2'
                : currentStep.position === 'left'
                ? 'left-full top-1/2 transform -translate-y-1/2'
                : 'right-full top-1/2 transform -translate-y-1/2'
            }`}>
              <MousePointer className="w-6 h-6 text-violet-400" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Background Spotlight Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60"
        animate={{
          background: `radial-gradient(600px circle at ${
            currentStep.position === 'center' ? '50% 50%' :
            currentStep.position === 'top' ? '50% 20%' :
            currentStep.position === 'bottom' ? '50% 80%' :
            currentStep.position === 'left' ? '20% 50%' :
            '80% 50%'
          }, transparent 0%, rgba(0,0,0,0.8) 100%)`
        }}
        transition={{ duration: 0.6 }}
      />
    </div>
  )
}