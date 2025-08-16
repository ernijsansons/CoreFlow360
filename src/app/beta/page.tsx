/**
 * Beta Program Landing Page
 * Free template inspired by Linear, Stripe, and successful SaaS beta launches
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Rocket, 
  Users, 
  Star, 
  CheckCircle, 
  ArrowRight, 
  Bot, 
  Sparkles,
  Clock,
  Shield,
  Zap,
  Gift,
  Crown
} from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

interface BetaSignupData {
  email: string
  firstName: string
  lastName: string
  company: string
  role: string
  industryVertical: string
  teamSize: string
  currentERP: string
  painPoints: string[]
  expectedUsage: string
}

const industries = [
  'HVAC & Manufacturing',
  'Legal Services', 
  'Financial Services',
  'Healthcare',
  'Construction',
  'Professional Services',
  'Technology',
  'Other'
]

const teamSizes = [
  '1-10 employees',
  '11-50 employees', 
  '51-200 employees',
  '201-1000 employees',
  '1000+ employees'
]

const currentERPs = [
  'NetSuite',
  'SAP',
  'Oracle',
  'QuickBooks',
  'Salesforce',
  'Microsoft Dynamics',
  'Spreadsheets/Manual',
  'No current system',
  'Other'
]

const painPoints = [
  'Slow manual processes',
  'Data silos between departments', 
  'Lack of real-time insights',
  'Expensive current solution',
  'Poor user experience',
  'Integration challenges',
  'Scaling difficulties',
  'Compliance issues'
]

export default function BetaPage() {
  const { trackEvent } = useTrackEvent()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<BetaSignupData>>({
    painPoints: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const updateFormData = (updates: Partial<BetaSignupData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handlePainPointToggle = (painPoint: string) => {
    const current = formData.painPoints || []
    const updated = current.includes(painPoint)
      ? current.filter(p => p !== painPoint)
      : [...current, painPoint]
    
    updateFormData({ painPoints: updated })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    trackEvent('beta_signup_submitted', {
      industry: formData.industryVertical,
      team_size: formData.teamSize,
      current_erp: formData.currentERP,
      pain_points_count: formData.painPoints?.length || 0
    })

    try {
      const response = await fetch('/api/beta/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      
      if (result.success) {
        setIsSubmitted(true)
      } else {
        console.error('Beta signup failed:', result.error)
        // In production, show error message to user
      }
    } catch (error) {
      console.error('Beta signup error:', error)
      // In production, show error message to user
    }
    
    setIsSubmitting(false)
  }

  const nextStep = () => {
    trackEvent('beta_signup_step_completed', { step: currentStep })
    setCurrentStep(prev => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  if (isSubmitted) {
    return <SuccessPage />
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-violet-900/30 border border-violet-500/50 px-6 py-3 rounded-full mb-8">
              <Rocket className="w-5 h-5 text-violet-400" />
              <span className="text-violet-300 font-semibold">Join the Beta Program</span>
            </div>
            
            <h1 className="heading-hero gradient-text-ai mb-6">
              Be Among the First to Experience
              <br />
              AI-Orchestrated ERP
            </h1>
            
            <p className="text-body-large text-gray-300 mb-12 max-w-3xl mx-auto">
              Get exclusive early access to CoreFlow360. Help shape the future of business automation 
              while enjoying premium features, priority support, and founding member benefits.
            </p>

            {/* Beta Benefits */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <BetaBenefit
                icon={Gift}
                title="Free for 6 Months"
                description="Full access to all premium features during beta period"
              />
              <BetaBenefit
                icon={Crown}
                title="Founding Member Status"
                description="Permanent 50% discount when we launch publicly"
              />
              <BetaBenefit
                icon={Users}
                title="Direct Access to Team"
                description="Weekly feedback sessions with our engineering team"
              />
            </div>
          </motion.div>

          {/* Multi-step Form */}
          <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Step {currentStep} of 4</span>
                <span>{Math.round((currentStep / 4) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-violet-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-8">
              {currentStep === 1 && (
                <Step1 
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={nextStep}
                />
              )}
              
              {currentStep === 2 && (
                <Step2 
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              
              {currentStep === 3 && (
                <Step3 
                  formData={formData}
                  updateFormData={updateFormData}
                  painPoints={painPoints}
                  onPainPointToggle={handlePainPointToggle}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              
              {currentStep === 4 && (
                <Step4 
                  formData={formData}
                  updateFormData={updateFormData}
                  onSubmit={handleSubmit}
                  onPrev={prevStep}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

function BetaBenefit({ icon: Icon, title, description }: {
  icon: any
  title: string
  description: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-6 text-center"
    >
      <Icon className="w-8 h-8 text-violet-400 mx-auto mb-4" />
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </motion.div>
  )
}

// Step 1: Basic Information
function Step1({ 
  formData, 
  updateFormData, 
  onNext 
}: {
  formData: Partial<BetaSignupData>
  updateFormData: (updates: Partial<BetaSignupData>) => void
  onNext: () => void
}) {
  const canContinue = formData.email && formData.firstName && formData.lastName

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Let's get started</h2>
        <p className="text-gray-400">Tell us about yourself</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName || ''}
            onChange={(e) => updateFormData({ firstName: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
            placeholder="Enter your first name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName || ''}
            onChange={(e) => updateFormData({ lastName: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Work Email *
        </label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => updateFormData({ email: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
          placeholder="Enter your work email"
        />
      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
            canContinue
              ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:from-violet-600 hover:to-cyan-600'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2 inline" />
        </button>
      </div>
    </motion.div>
  )
}

// Step 2: Company Information
function Step2({ 
  formData, 
  updateFormData, 
  onNext, 
  onPrev 
}: {
  formData: Partial<BetaSignupData>
  updateFormData: (updates: Partial<BetaSignupData>) => void
  onNext: () => void
  onPrev: () => void
}) {
  const canContinue = formData.company && formData.role && formData.industryVertical

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">About your company</h2>
        <p className="text-gray-400">Help us understand your business context</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Company Name *
        </label>
        <input
          type="text"
          value={formData.company || ''}
          onChange={(e) => updateFormData({ company: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
          placeholder="Enter your company name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Your Role *
        </label>
        <input
          type="text"
          value={formData.role || ''}
          onChange={(e) => updateFormData({ role: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
          placeholder="e.g., CEO, CTO, Operations Manager"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Industry Vertical *
        </label>
        <select
          value={formData.industryVertical || ''}
          onChange={(e) => updateFormData({ industryVertical: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
        >
          <option value="">Select your industry</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Team Size
        </label>
        <select
          value={formData.teamSize || ''}
          onChange={(e) => updateFormData({ teamSize: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
        >
          <option value="">Select team size</option>
          {teamSizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="px-8 py-3 rounded-lg font-semibold border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white transition-all duration-200"
        >
          Back
        </button>
        
        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
            canContinue
              ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:from-violet-600 hover:to-cyan-600'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2 inline" />
        </button>
      </div>
    </motion.div>
  )
}

// Step 3: Current Situation & Pain Points
function Step3({ 
  formData, 
  updateFormData, 
  painPoints,
  onPainPointToggle,
  onNext, 
  onPrev 
}: {
  formData: Partial<BetaSignupData>
  updateFormData: (updates: Partial<BetaSignupData>) => void
  painPoints: string[]
  onPainPointToggle: (painPoint: string) => void
  onNext: () => void
  onPrev: () => void
}) {
  const canContinue = formData.currentERP && (formData.painPoints?.length || 0) > 0

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Current situation</h2>
        <p className="text-gray-400">Help us understand your current challenges</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Current ERP/Business System *
        </label>
        <select
          value={formData.currentERP || ''}
          onChange={(e) => updateFormData({ currentERP: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
        >
          <option value="">Select your current system</option>
          {currentERPs.map(erp => (
            <option key={erp} value={erp}>{erp}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-4">
          What are your biggest pain points? * (Select all that apply)
        </label>
        <div className="grid md:grid-cols-2 gap-3">
          {painPoints.map(painPoint => (
            <button
              key={painPoint}
              onClick={() => onPainPointToggle(painPoint)}
              className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                formData.painPoints?.includes(painPoint)
                  ? 'border-violet-500 bg-violet-500/20 text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded border mr-3 flex items-center justify-center ${
                  formData.painPoints?.includes(painPoint)
                    ? 'border-violet-500 bg-violet-500'
                    : 'border-gray-600'
                }`}>
                  {formData.painPoints?.includes(painPoint) && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
                {painPoint}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="px-8 py-3 rounded-lg font-semibold border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white transition-all duration-200"
        >
          Back
        </button>
        
        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
            canContinue
              ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:from-violet-600 hover:to-cyan-600'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2 inline" />
        </button>
      </div>
    </motion.div>
  )
}

// Step 4: Final Details & Submission
function Step4({ 
  formData, 
  updateFormData, 
  onSubmit, 
  onPrev,
  isSubmitting 
}: {
  formData: Partial<BetaSignupData>
  updateFormData: (updates: Partial<BetaSignupData>) => void
  onSubmit: () => void
  onPrev: () => void
  isSubmitting: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Almost there!</h2>
        <p className="text-gray-400">Final details to personalize your beta experience</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Expected Usage Pattern
        </label>
        <select
          value={formData.expectedUsage || ''}
          onChange={(e) => updateFormData({ expectedUsage: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
        >
          <option value="">How do you plan to use CoreFlow360?</option>
          <option value="replace_current">Replace current ERP system</option>
          <option value="supplement_current">Supplement current tools</option>
          <option value="new_implementation">First ERP implementation</option>
          <option value="evaluation">Just evaluating options</option>
        </select>
      </div>

      {/* Summary */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="font-semibold text-white mb-4">Beta Program Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center text-green-400">
            <CheckCircle className="w-4 h-4 mr-2" />
            6 months free access to all premium features
          </div>
          <div className="flex items-center text-green-400">
            <CheckCircle className="w-4 h-4 mr-2" />
            50% permanent discount as founding member
          </div>
          <div className="flex items-center text-green-400">
            <CheckCircle className="w-4 h-4 mr-2" />
            Direct access to engineering team
          </div>
          <div className="flex items-center text-green-400">
            <CheckCircle className="w-4 h-4 mr-2" />
            Shape the product roadmap with your feedback
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          disabled={isSubmitting}
          className="px-8 py-3 rounded-lg font-semibold border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:from-violet-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Joining Beta...
            </>
          ) : (
            <>
              Join Beta Program
              <Rocket className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}

// Success Page
function SuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto px-4"
      >
        <div className="bg-green-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold gradient-text-ai mb-6">
          Welcome to the Future!
        </h1>
        
        <p className="text-xl text-gray-300 mb-8">
          You're now part of the CoreFlow360 beta program. We'll be in touch within 24 hours 
          with your access credentials and onboarding materials.
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-white mb-4">What happens next?</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-start">
              <Clock className="w-5 h-5 text-violet-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <div className="font-medium text-white">Within 24 hours</div>
                <div className="text-gray-400 text-sm">Receive your beta access credentials</div>
              </div>
            </div>
            <div className="flex items-start">
              <Users className="w-5 h-5 text-violet-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <div className="font-medium text-white">Week 1</div>
                <div className="text-gray-400 text-sm">Personal onboarding session with our team</div>
              </div>
            </div>
            <div className="flex items-start">
              <Sparkles className="w-5 h-5 text-violet-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <div className="font-medium text-white">Ongoing</div>
                <div className="text-gray-400 text-sm">Weekly feedback sessions and feature previews</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <GlowingButton href="/" size="lg">
            Return Home
          </GlowingButton>
          <GlowingButton href="/demo/subscription-simulator" variant="outline" size="lg">
            Try Demo
          </GlowingButton>
        </div>
      </motion.div>
    </div>
  )
}